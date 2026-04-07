from rest_framework import serializers
from .models import Transaction
from django.contrib.auth import get_user_model

User = get_user_model()

class TransactionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    deal = serializers.StringRelatedField(read_only=True)
    user_id = serializers.ReadOnlyField(source = 'user.id')
    deal_id = serializers.ReadOnlyField(source = 'deal.id')
    class Meta:
        model = Transaction
        fields = [
            'id', 
            'transaction_type', 
            'amount', 
            'user', 
            'user_id', 
            'deal', 
            'deal_id', 
            'created_at']
        read_only_fields='__all__'
