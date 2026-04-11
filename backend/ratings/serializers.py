from rest_framework import serializers
from .models import Rating
from django.contrib.auth import get_user_model
from deals.models import Deal

User = get_user_model()

class RatingSerializer(serializers.ModelSerializer):
    reviewer = serializers.StringRelatedField(read_only=True)
    reviewer_id = serializers.ReadOnlyField(source='reviewer.id')
    reviewed_user = serializers.StringRelatedField(read_only=True)
    reviewed_user_id = serializers.ReadOnlyField(source='reviewed_user.id')
    
    class Meta:
        model = Rating
        fields = [
            'id', 'deal', 'reviewer', 'reviewer_id',
            'reviewed_user', 'reviewed_user_id', 'score', 'comment',
            'created_at'
        ]
        read_only_fields = ['id', 'reviewer', 'reviewed_user', 'created_at']
    
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