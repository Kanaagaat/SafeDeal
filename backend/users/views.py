from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from decimal import Decimal
from transaction.models import Transaction
from django.db import transaction
# Create your views here.
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'balance': user.balance,
                'escrow_balance': user.escrow_balance,
                'trust_score': user.trust_score
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'balance': user.balance,
                'escrow_balance': user.escrow_balance,
                'trust_score': user.trust_score
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Successfully logged out'}, 
                       status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, 
                       status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_balance(request):
    user = request.user
    return Response({
        'balance': float(user.balance),
        'escrow_balance': float(user.escrow_balance),
        'trust_score': float(user.trust_score)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_funds(request):
    try:
        amount_raw = request.data.get('amount', 0)
        amount = Decimal(str(amount_raw))
    except (TypeError, ValueError, Decimal.InvalidOperation):
        return Response({'error': 'Invalid amount format'}, status=400)
    
    if amount <= 0:
        return Response({'error': 'Amount must be greater than 0'}, status=400)
    
    amount_decimal = Decimal(str(amount))
    
    with transaction.atomic():
        request.user.balance += amount
        request.user.save()
        

        Transaction.objects.create(
            user=request.user,
            transaction_type=Transaction.TransactionType.DEPOSIT, 
            amount=amount,
            # deal=None 
        )
    

    return Response({
        'balance': float(request.user.balance),
        'escrow_balance': float(request.user.escrow_balance)
    }, status=status.HTTP_200_OK)


