from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Rating
from .serializers import RatingSerializer
from deals.models import Deal
from django.contrib.auth import get_user_model

User = get_user_model()


class RatingListCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('user_id')


        if not user_id:
            return Response(
                {'error': 'user_id query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = get_object_or_404(User, id=user_id)

        ratings = Rating.objects.filter(reviewed_user = user).order_by('created_at')

        serializer = RatingSerializer(ratings, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        deal_id = request.data.get('deal_id')
        rating_value = request.data.get('score')
        comment = request.data.get('comment', '')


        if not deal_id:
            return Response(
                {'error': 'deal_id field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not rating_value:
            return Response(
                {'error': 'rating field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deal = get_object_or_404(Deal, id=deal_id)

        if deal.deal_status != Deal.Status.COMPLETED:
            return Response(
                {'error': 'Can only rate completed deals'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if deal.buyer != request.user:
            return Response(
                {'error': 'Only the buyer can rate the seller'}
            , status=status.HTTP_400_BAD_REQUEST)
        
        if Rating.objects.filter(deal=deal, reviewed_user=request.user).exist():
            return Response(
                {'error': 'You have already rated this deal'}
            , status=status.HTTP_400_BAD_REQUEST)
        

        rating_data = {
            'deal': deal.id,
            'rating': rating_value,
            'comment': comment
        }

        serializer = RatingSerializer(rating_data)

        if serializer.is_valid():
            rating = serializer.save()(
                reviewer = request.user,
                reviewed_user = deal.seller
            )


            seller = deal.seller

            all_ratings = Rating.objects.filter(reviewed_user=seller)

            avg_rating = sum(r.rating for r in all_ratings)/len(all_ratings)

            seller.trust_score = round(avg_rating, 1)
            seller.save()


            return Response(
                RatingSerializer(rating).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        

        
        