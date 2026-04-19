from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Transaction
from .serializers import TransactionSerializer
from deals.models import Deal
from django.contrib.auth import get_user_model
from django.db import transaction as db_transaction
from decimal import Decimal


User = get_user_model()
# Create your views here.


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay(request):
    
    deal_id = request.data.get('deal_id')
    amount = request.data.get('amount')

    if not deal_id or not amount:
        return Response({'error': 'Deal amount are required'}, status = status.HTTP_400_BAD_REQUEST)

    try:
        amount = Decimal(str(amount))
    except ValueError:
        return Response({'error': 'Invalid amount format'},
                        status=status.HTTP_400_BAD_REQUEST)
    

    deal = get_object_or_404(Deal, id=deal_id)

    if deal.buyer != request.user:
        return Response({'error': 'Only buyer can pay for deal'},
                        status=status.HTTP_400_BAD_REQUEST)
    

    if deal.deal_status != Deal.Status.CREATED:
        return Response(
            {'error': f'Deal must be in CREATED status. Current status: {deal.deal_status}'},
            status=status.HTTP_400_BAD_REQUEST)
    
    if amount != deal.product_price:
        return Response(
            {'error': f'Amount must match deal price {deal.product_price}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    
    with db_transaction.atomic():
        buyer = User.objects.select_for_update().get(pk=request.user.pk)
        deal_locked = Deal.objects.select_for_update().get(pk=deal.id)

        if deal_locked.buyer_id != buyer.id:
            return Response({'error': 'Only buyer can pay for deal'}, status=status.HTTP_400_BAD_REQUEST)
        if deal_locked.deal_status != Deal.Status.CREATED:
            return Response(
                {'error': f'Deal must be in CREATED status. Current status: {deal_locked.deal_status}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if amount != deal_locked.product_price:
            return Response(
                {'error': f'Amount must match deal price {deal_locked.product_price}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if buyer.balance < amount:
            return Response({'error': 'Insufficient funds'}, status=status.HTTP_400_BAD_REQUEST)

        buyer.balance -= amount
        buyer.escrow_balance += amount
        buyer.save(update_fields=['balance', 'escrow_balance'])

        Transaction.objects.create(
            user=buyer,
            deal=deal_locked,
            transaction_type=Transaction.TransactionType.ESCROW,
            amount=amount,
        )

        deal_locked.deal_status = Deal.Status.SHIPPED
        deal_locked.save(update_fields=['deal_status'])

    return Response({
        'message': 'Payment successful',
        'balance': float(buyer.balance),
        'escrow_balance': float(buyer.escrow_balance),
    }, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm(request):
    deal_id = request.data.get('deal_id')
    
    if not deal_id:
        return Response({'error': 'deal_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    deal = get_object_or_404(Deal, id=deal_id)

    # 1. Проверка прав доступа (только покупатель может вызвать этот эндпоинт)
    if deal.buyer != request.user:
        return Response({'error': 'Only buyer can confirm deal completion'}, status=status.HTTP_400_BAD_REQUEST)

    # 2. Проверка статуса (сделка должна быть в процессе доставки)
    if deal.deal_status not in [Deal.Status.SHIPPED, Deal.Status.DELIVERED]:
        return Response({'error': 'Invalid deal status for confirmation'}, status=status.HTTP_400_BAD_REQUEST)

    with db_transaction.atomic():
        deal_locked = Deal.objects.select_for_update().get(pk=deal.id)
        buyer = User.objects.select_for_update().get(pk=request.user.pk)
        deal_locked.buyer_confirmed = True

        if not deal_locked.seller_confirmed:
            if deal_locked.deal_status == Deal.Status.SHIPPED:
                deal_locked.deal_status = Deal.Status.DELIVERED
            deal_locked.save(update_fields=['deal_status', 'buyer_confirmed'])
            return Response(
                {
                    'message': 'Receipt confirmed. Waiting for seller to confirm from their side.',
                    'deal_status': deal_locked.deal_status,
                },
                status=status.HTTP_200_OK,
            )

        if buyer.escrow_balance < deal_locked.product_price:
            return Response({'error': 'Insufficient escrow funds'}, status=status.HTTP_400_BAD_REQUEST)

        seller = User.objects.select_for_update().get(pk=deal_locked.seller_id)
        price = deal_locked.product_price
        buyer.escrow_balance -= price
        seller.balance += price
        buyer.save(update_fields=['escrow_balance'])
        seller.save(update_fields=['balance'])

        buyer_tx = Transaction.objects.create(
            user=buyer,
            deal=deal_locked,
            transaction_type=Transaction.TransactionType.RELEASE,
            amount=price,
        )
        seller_tx = Transaction.objects.create(
            user=seller,
            deal=deal_locked,
            transaction_type=Transaction.TransactionType.DEPOSIT,
            amount=price,
        )

        deal_locked.deal_status = Deal.Status.RELEASED
        deal_locked.save(update_fields=['deal_status', 'buyer_confirmed'])

        return Response(
            {
                'message': 'Both parties confirmed. Funds released to seller.',
                'deal_status': deal_locked.deal_status,
                'buyer_transaction': TransactionSerializer(buyer_tx).data,
                'seller_transaction': TransactionSerializer(seller_tx).data,
                'buyer_escrow_balance': float(buyer.escrow_balance),
                'seller_balance': float(seller.balance),
            },
            status=status.HTTP_200_OK,
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_history(request):
    transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
        







