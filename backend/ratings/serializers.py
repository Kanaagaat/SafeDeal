from rest_framework import serializers
from .models import Rating
from django.contrib.auth import get_user_model
from deals.models import Deal

User = get_user_model()

class RatingSerializer(serializers.ModelSerializer):
    reviewer = serializers.StringRelatedField(read_only=True)
    reviewer_id = serializers.ReadOnlyField(source='reviewer.id')
    reviewee = serializers.StringRelatedField(read_only=True)
    reviewee_id = serializers.ReadOnlyField(source='reviewee.id')
    
    class Meta:
        model = Rating
        fields = [
            'id', 'deal', 'reviewer', 'reviewer_id',
            'reviewee', 'reviewee_id', 'rating', 'comment',
            'created_at'
        ]
        read_only_fields = ['id', 'reviewer', 'reviewee', 'created_at']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def validate_deal(self, value):
        # Check if deal exists
        if not Deal.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Deal does not exist")
        return value
    
    def validate(self, data):
        # Ensure user can only rate a deal they participated in
        # This will be handled in the view with request.user
        return data