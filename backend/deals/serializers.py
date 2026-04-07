from rest_framework import serializers
from .models import Deal
from django.contrib.auth import get_user_model

User = get_user_model()

class DealSerializer(serializers.ModelSerializer):
    buyer = serializers.StringRelatedField(read_only=True)
    seller = serializers.StringRelatedField(read_only=True)
    buyer_id = serializers.ReadOnlyField(source='buyer.id')
    seller_id = serializers.ReadOnlyField(source='seller.id')



    class Meta:
        model=Deal
        fields=[
            'id', 'product_name', 'product_description', 'product_price', 
            'deal_status', 'buyer', 'seller',
            'buyer_id', 'seller_id', 'created_at', 'updated_at'
        ]

        read_only_fields = [
            'id', 'deal_status', 'buyer', 'seller', 'created_at', 'updated_at'
        ]

    

class DealCreateSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    
    class Meta:
        model=Deal
        fields=[
            'product_name', 'product_description', 'product_price', 'buyer'
        ]

    def validate_price(self, price):
        if price <= 0:
            raise serializers.ValidationError('Price must be greater than 0')
        return price
    
    def validate_product_name(self, name):
        if len(name.strip()) < 3:
            raise serializers.ValidationError('Product name must be longer than 3 letters')
        return name
    

