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

        deal.status = status_value
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



    
        