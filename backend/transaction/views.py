from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Transaction
from .serializers import TransactionSerializer
from deals.models import Deal
from deals.serializers import DealSerializer
from django.contrib.auth import get_user_model
from django.db import transaction

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
        amount = float(amount)
    except ValueError:
        return Response({'error': 'Invalid amount format'},
                        status=status.HTTP_400_BAD_REQUEST)
    

    deal = get_object_or_404(Deal, id=deal_id)

    if deal.buyer != request.user:
        return Response({'error': 'Only buyer can pay for deal'},
                        status=status.HTTP_400_BAD_REQUEST)
    

    if deal.deal_status != Deal.Status.CREATED:
        return Response(
            {'error': f'Deal must be in CREATED status. Current status {DealSerializer(deal.deal_status).data}'},
            status=status.HTTP_400_BAD_REQUEST)
    
    if amount != float(deal.product_price):
        return Response(
            {'error': f'Amount must match deal price {deal.product_price}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    
    with transaction.atomic():
        if request.user.balance < amount:
            return Response({'error': 'Insufficient funds'}, status=400)

        # 1. Логика эскроу
        request.user.balance -= amount
        request.user.escrow_balance += amount
        request.user.save()

        # 2. Создаем транзакцию
        Transaction.objects.create(
            user=request.user,
            deal=deal,
            transaction_type=Transaction.TransactionType.ESCROW,
            amount=amount
        )

        # 3. Меняем статус (теперь товар оплачен и должен быть отправлен)
        deal.deal_status = Deal.Status.SHIPPED
        deal.save()

    return Response({
        'message': 'Payment successful',
        'balance': request.user.balance,
        'escrow_balance': request.user.escrow_balance
    }, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm(request):
    
    deal_id = request.data.get('deal_id')
    
    if not deal_id:
        return Response(
            {'error': 'deal_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    deal =  get_object_or_404(Deal, id=deal_id)

    if deal.buyer != request.user:
        return Response(
            {
                'error': 'Only buyer can confirm deal completion'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    

    if deal.deal_status != Deal.Status.SHIPPED:
        return Response(
            {
                'error': f'Deal must be in SHIPPED status. Current: {DealSerializer(deal.deal_status).data}'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if request.user.escrow_balance < deal.product_price:
        return Response(
            {
                'error': 'Insufficient funds'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    

    request.user.escrow_balance -= deal.product_price
    request.user.save()

    seller = deal.seller
    seller.balance += deal.product_price
    seller.save()


    buyer_transaction = Transaction.objects.create(
        user = request.user,
        deal=deal,
        transaction_type = Transaction.TransactionType.RELEASE,
        amount = deal.product_price
    )

    seller_transaction = Transaction.objects.create(
        user=seller,
        deal=deal,
        transaction_type=Transaction.TransactionType.DEPOSIT,
        amount = deal.product_price    
    )

    deal.deal_status = Deal.Status.COMPLETED
    deal.save()


    buyer_transaction_serializer = TransactionSerializer(buyer_transaction)
    seller_transaction_serializer = TransactionSerializer(seller_transaction)

    return Response(
        {
            'message': 'Funds released to seller successfully',
            'buyer_transaction': buyer_transaction_serializer,
            'seller_transaction': seller_transaction_serializer,
            'buyer_balance': request.user.balance,
            'buyer_escrow_balance': request.user.escrow_balance,
            'seller_balance': seller.balance
        },
        status=status.HTTP_200_OK
    )
        







