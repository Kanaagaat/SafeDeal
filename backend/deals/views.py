from django.contrib.auth import get_user_model
from django.db import transaction as db_transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from transaction.models import Transaction

from .models import Deal
from .serializers import DealCreateSerializer, DealSerializer

User = get_user_model()


class DealListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        deal_as_buyer = Deal.objects.filter(buyer=request.user)
        deal_as_seller = Deal.objects.filter(seller=request.user)
        deals = (deal_as_buyer | deal_as_seller).order_by('created_at')
        serializer = DealSerializer(deals, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = DealCreateSerializer(data=request.data, context = {'request': request})
        if serializer.is_valid():
            deal = serializer.save(seller=request.user)
            response_serializer = DealSerializer(deal, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DealDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user, pk):
        deal = get_object_or_404(Deal, pk=pk)
        if deal.buyer != user and deal.seller != user:
            return None
        return deal

    def get(self, request, pk):
        deal = self.get_object(request.user, pk)
        if not deal:
            return Response(
                {'error': 'Deal not found or you dont have access'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = DealSerializer(deal, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        deal = self.get_object(request.user, pk)
        if not deal:
            return Response(
                {'error': 'You dont have access or deal is not exist'},
                status=status.HTTP_404_NOT_FOUND,
            )
        status_value = request.data.get('status')
        if not status_value:
            return Response({'error': 'Status field is required'}, status=status.HTTP_400_BAD_REQUEST)
        valid_statuses = [choice[0] for choice in Deal.Status.choices]
        if status_value not in valid_statuses:
            return Response(
                {'error': f'Status field must be one of these {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        deal.deal_status = status_value
        deal.save()
        serializer = DealSerializer(deal, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        deal = self.get_object(request.user, pk)
        if not deal:
            return Response(
                {'error': 'You dont have access or deal is not exist'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if deal.deal_status in (Deal.Status.RELEASED, Deal.Status.CANCELLED):
            return Response(
                {'error': 'You can not delete Completed or Cancelled deal.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if deal.deal_status != Deal.Status.CREATED:
            return Response(
                {'error': 'You can only delete deals that are still in Created status.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if Transaction.objects.filter(deal=deal, transaction_type=Transaction.TransactionType.ESCROW).exists():
            return Response(
                {'error': 'This deal has an escrow payment recorded and cannot be deleted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        deal.deal_status = Deal.Status.CANCELLED
        deal.save()
        return Response(
            {'message': 'Deal cancelled successfully', 'deal': DealSerializer(deal, context={'request': request}).data},
            status=status.HTTP_200_OK,
        )


def _perform_finalize(deal_id: int, request=None):
    """
    Atomically release escrow from buyer to seller, create ledger rows, set RELEASED.
    Locks users in consistent order (lower user id first) to reduce deadlock risk.
    """
    with db_transaction.atomic():
        deal = Deal.objects.select_for_update().get(pk=deal_id)
        if deal.deal_status == Deal.Status.RELEASED:
            return DealSerializer(deal, context={'request': request} if request else {}).data

        buyer_id, seller_id = deal.buyer_id, deal.seller_id
        first_uid, second_uid = (buyer_id, seller_id) if buyer_id < seller_id else (seller_id, buyer_id)
        User.objects.select_for_update().get(pk=first_uid)
        User.objects.select_for_update().get(pk=second_uid)

        buyer = User.objects.select_for_update().get(pk=buyer_id)
        seller = User.objects.select_for_update().get(pk=seller_id)
        price = deal.product_price

        if buyer.escrow_balance < price:
            raise ValueError('Insufficient escrow balance to release funds for this deal.')

        buyer.escrow_balance -= price
        seller.balance += price
        buyer.save(update_fields=['escrow_balance'])
        seller.save(update_fields=['balance'])

        Transaction.objects.create(
            user=buyer,
            deal=deal,
            transaction_type=Transaction.TransactionType.RELEASE,
            amount=price,
        )
        Transaction.objects.create(
            user=seller,
            deal=deal,
            transaction_type=Transaction.TransactionType.DEPOSIT,
            amount=price,
        )

        deal.deal_status = Deal.Status.RELEASED
        deal.save(update_fields=['deal_status'])

        return DealSerializer(deal, context={'request': request} if request else {}).data


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_delivery(request, pk):
    deal = get_object_or_404(Deal, pk=pk)
    if deal.buyer != request.user:
        return Response({'error': 'Only buyer can confirm delivery'}, status=status.HTTP_403_FORBIDDEN)
    if deal.deal_status not in [Deal.Status.SHIPPED, Deal.Status.DELIVERED]:
        return Response(
            {'error': f'Deal must be in SHIPPED status, current: {deal.deal_status}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    deal.buyer_confirmed = True
    if deal.deal_status == Deal.Status.SHIPPED:
        deal.deal_status = Deal.Status.DELIVERED
    deal.save()

    if deal.seller_confirmed:
        try:
            final_data = _perform_finalize(deal.id, request)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Deal finalized!', 'deal': final_data}, status=status.HTTP_200_OK)

    serializer = DealSerializer(deal, context={'request': request})
    return Response(
        {
            'message': 'Buyer successfully confirmed delivery, waiting for seller confirmation.',
            'deal': serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def seller_confirm(request, pk):
    deal = get_object_or_404(Deal, pk=pk)
    if deal.seller != request.user:
        return Response({'error': 'Only seller can confirm'}, status=status.HTTP_403_FORBIDDEN)
    if deal.deal_status not in [Deal.Status.SHIPPED, Deal.Status.DELIVERED]:
        return Response(
            {'error': f'Deal must be in SHIPPED or DELIVERED status, current: {deal.deal_status}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    deal.seller_confirmed = True
    deal.save()

    if deal.buyer_confirmed:
        try:
            final_data = _perform_finalize(deal.id, request)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {'message': 'Deal finalized and funds released!', 'deal': final_data},
            status=status.HTTP_200_OK,
        )

    serializer = DealSerializer(deal, context={'request': request})
    return Response(
        {
            'message': 'Seller confirmed. Waiting for buyer confirmation.',
            'deal': serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def open_dispute(request, pk):
    deal = get_object_or_404(Deal, pk=pk)
    if request.user not in [deal.buyer, deal.seller]:
        return Response({'error': 'You do not have permission for this deal'}, status=status.HTTP_403_FORBIDDEN)

    forbidden_statuses = [
        Deal.Status.CREATED,
        Deal.Status.RELEASED,
        Deal.Status.CANCELLED,
        Deal.Status.DISPUTED,
    ]
    if deal.deal_status in forbidden_statuses:
        return Response(
            {'error': f'Cannot open dispute in status {deal.deal_status}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    deal.deal_status = Deal.Status.DISPUTED
    deal.save()
    return Response(
        {
            'message': 'Dispute opened. Funds frozen until arbitrator decision.',
            'deal': DealSerializer(deal, context={'request': request}).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_deal(request, pk):
    deal = get_object_or_404(Deal, pk=pk)
    if request.user not in [deal.seller, deal.buyer]:
        return Response({'error': 'You do not have permission to access this deal'}, status=status.HTTP_403_FORBIDDEN)
    if deal.deal_status not in [Deal.Status.CREATED]:
        return Response({'error': 'You can cancel only CREATED status deals'}, status=status.HTTP_400_BAD_REQUEST)

    deal.deal_status = Deal.Status.CANCELLED
    deal.save()
    return Response(
        {
            'message': 'You succesfully canceled the deal',
            'deal': DealSerializer(deal, context={'request': request}).data,
        },
        status=status.HTTP_200_OK,
    )
