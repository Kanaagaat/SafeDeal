from rest_framework import serializers
from .models import Deal
from django.contrib.auth import get_user_model

User = get_user_model()

class DealSerializer(serializers.ModelSerializer):
    buyer = serializers.SerializerMethodField()
    seller = serializers.SerializerMethodField()
    # Aliases for frontend compatibility
    title = serializers.CharField(source='product_name', read_only=True)
    description = serializers.CharField(source='product_description', read_only=True)
    price = serializers.DecimalField(source='product_price', max_digits=10, decimal_places=2, read_only=True)
    status = serializers.CharField(source='deal_status', read_only=True)

    def get_buyer(self, obj):
        return {
            'username': obj.buyer.username,
            'trust_score': obj.buyer.trust_score
        }

    def get_seller(self, obj):
        return {
            'username': obj.seller.username,
            'trust_score': obj.seller.trust_score
        }

    class Meta:
        model = Deal
        fields = [
            'id', 'product_name', 'product_description', 'product_price', 
            'deal_status', 'buyer', 'seller',
            'title', 'description', 'price', 'status',
            'created_at', 'updated_at'
        ]

        read_only_fields = [
            'id', 'deal_status', 'buyer', 'seller', 'created_at', 'updated_at',
            'title', 'description', 'price', 'status'
        ]

    

class DealCreateSerializer(serializers.ModelSerializer):
    buyer = serializers.SlugRelatedField(
        slug_field='username',
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )

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
    

