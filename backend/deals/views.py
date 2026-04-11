from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import DealCreateSerializer, DealSerializer
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Deal
from django.db import transaction

class DealListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request):

        deal_as_buyer = Deal.objects.filter(buyer=request.user)
        deal_as_seller = Deal.objects.filter(seller=request.user)
        
        deals = (deal_as_buyer | deal_as_seller).order_by('created_at')

        serializer = DealSerializer(deals, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = DealCreateSerializer(data=request.data)

        if serializer.is_valid():
            deal = serializer.save(seller = request.user)

            response_serializer = DealSerializer(deal)

            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class DealDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self,user,pk):
        deal = get_object_or_404(Deal, pk=pk)

        if deal.buyer != user and deal.seller != user:
            return None
        return deal


    def get(self, request, pk):

        deal = self.get_object(request.user, pk)

        if not deal:
            return Response({'error': 'Deal not found or you dont have access'},
                            status=status.HTTP_404_NOT_FOUND)

        serializer = DealSerializer(deal)
        return Response(serializer.data, status=status.HTTP_200_OK)         


    def put(self, request, pk):
        
        deal = self.get_object(request.user, pk)

        if not deal:
            return Response({'error': 'You dont have access or deal is not exist'},
                     status=status.HTTP_404_NOT_FOUND)
            
        status_value = request.data.get('status')

        if not status_value:
            return Response({'error': 'Status field is required'}, status=status.HTTP_400_BAD_REQUEST)
        valid_statuses = [choice[0] for choice in Deal.Status.choices]

        if status_value not in valid_statuses:
            return Response({'error': f'Status field must be one of these {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)

        deal.deal_status = status_value
        deal.save()

        serializer = DealSerializer(deal)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self,request, pk):
        
        deal = self.get_object(request.user, pk)

        if not deal:
            return Response({'error': 'You dont have access or deal is not exist'},
                     status=status.HTTP_404_NOT_FOUND)
            
        if deal.deal_status == Deal.Status.COMPLETED or deal.deal_status == Deal.Status.CANCELLED:
            return Response({'error': f'You can not delete Completed or Cancelled deal.'}, 
                            status=status.HTTP_400_BAD_REQUEST)


        if deal.deal_status == Deal.Status.PENDING:
            deal.deal_status = Deal.Status.CANCELLED
            deal.save()

            return Response({
                'message': 'Deal cancelled successfully',
                'deal': DealSerializer(deal).data
            }, status=status.HTTP_200_OK)  


        if deal.deal_status == Deal.Status.SHIPPED:
            return Response({'error': f'You can not delete shipped deal.'}, 
                            status=status.HTTP_400_BAD_REQUEST)



def _perform_finalize(deal):
    """Внутренняя логика (не эндпоинт)"""
    with transaction.atomic():
        if deal.deal_status == Deal.Status.RELEASED:
            return DealSerializer(deal).data

        seller = deal.seller
        buyer = deal.buyer

        buyer.escrow_balance -= deal.product_price
        seller.balance += deal.product_price
        
        deal.deal_status = Deal.Status.RELEASED 
        
        buyer.save()
        seller.save()
        deal.save()
    return DealSerializer(deal).data


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_delivery(request, pk):
    """Confirm delivery of a deal - mark as DELIVERED and release funds to seller"""
    deal = get_object_or_404(Deal, pk=pk)
    
    # Only buyer can confirm delivery
    if deal.buyer != request.user:
        return Response({'error': 'Only buyer can confirm delivery'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # Deal must be in SHIPPED status
    if deal.deal_status not in [Deal.Status.SHIPPED, Deal.Status.DELIVERED]:
        return Response({'error': f'Deal must be in SHIPPED status, current: {deal.deal_status}'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    deal.buyer_confirmed = True
    if deal.deal_status == Deal.Status.SHIPPED:
        deal.deal_status = Deal.Status.DELIVERED
    deal.save()
    
    if deal.seller_confirmed:
        final_data = _perform_finalize(deal)
        return Response({'message': 'Deal finalized!', 'deal': final_data}, status=status.HTTP_200_OK)
    
    
    serializer = DealSerializer(deal)
    return Response({
        'message': 'Buyer succesfully confirmed delivery, waiting buyer confirmation',
        'deal': serializer.data}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def seller_confirm(request,pk):
    deal = get_object_or_404(Deal, pk=pk)

    if deal.seller != request.user:
        return Response({'error': 'Only seller can confirm delivery'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    if deal.deal_status not in [Deal.Status.SHIPPED, Deal.Status.DELIVERED]:
        return Response({'error': f'Deal must be in SHIPPED status, current: {deal.deal_status}'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    

    deal.seller_confirmed = True
    deal.save()

    if deal.buyer_confirmed:
        final_data = _perform_finalize(deal)
        return Response({'message': 'Deal finalized and funds released!', 'deal': final_data}, status=status.HTTP_200_OK)
    
    serializer = DealSerializer(deal)

    return Response({
        'message': 'Seller confirmed the deal. Waiting seller confirmation',
        'deal': DealSerializer(deal).data
    }, status=status.HTTP_200_OK)
    
        
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def open_dispute(request, pk):
    """Open dispute for any party"""
    deal = get_object_or_404(Deal, pk=pk)

    if request.user not in [deal.buyer, deal.seller]:
        return Response({'error': 'You do not have permission for this deal'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # Dispute can be opened only if item is paid (in escrow), but deal is not closed
    forbidden_statuses = [Deal.Status.CREATED, Deal.Status.COMPLETED, Deal.Status.CANCELLED]
    if deal.deal_status in forbidden_statuses:
        return Response({'error': f'Cannot open dispute in status {deal.deal_status}'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    deal.deal_status = Deal.Status.DISPUTED # Add 'DI' to Deal.Status.choices
    deal.save()

    return Response({
        'message': 'Dispute opened. Funds frozen until arbitrator decision.',
        'deal': DealSerializer(deal).data
    }, status=status.HTTP_200_OK)   

    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_deal(request, pk):
    deal = get_object_or_404(Deal, pk=pk)

    
    if request.user not in [deal.seller, deal.buyer]:
        return Response(
            {'error':'You do not have permission to access this deal'}, 
            status=status.HTTP_403_FORBIDDEN)


    if deal.deal_status not in [ Deal.Status.CREATED]:
        return Response(
            {'error':'You can cancel only CREATED satus deals'}, 
            status=status.HTTP_400_BAD_REQUEST)
    
    deal.deal_status = Deal.Status.CANCELLED
    deal.save()

    return Response(
        {
            'message': 'You succesfully canceled the deal',
            'deal': DealSerializer(deal).data
            
        }, status=status.HTTP_200_OK
    )
    





    
    


