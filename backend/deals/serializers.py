from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Deal

User = get_user_model()


class BuyerUsernameField(serializers.CharField):
    """Resolves buyer by username with a clear validation error."""

    default_error_messages = {
        'invalid': 'Please enter a valid buyer username.',
    }

    def to_internal_value(self, data):
        if data is None or (isinstance(data, str) and not data.strip()):
            self.fail('required')
        username = str(data).strip()
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                f"User '{username}' does not exist. Please check the username and try again."
            )


class DealSerializer(serializers.ModelSerializer):
    buyer = serializers.SerializerMethodField()
    seller = serializers.SerializerMethodField()
    buyer_has_rated = serializers.SerializerMethodField()
    title = serializers.CharField(source='product_name', read_only=True)
    description = serializers.CharField(source='product_description', read_only=True)
    price = serializers.DecimalField(source='product_price', max_digits=10, decimal_places=2, read_only=True)
    status = serializers.CharField(source='deal_status', read_only=True)

    def get_buyer(self, obj):
        return {
            'id': obj.buyer_id,
            'username': obj.buyer.username,
            'trust_score': obj.buyer.trust_score,
        }

    def get_seller(self, obj):
        return {
            'id': obj.seller_id,
            'username': obj.seller.username,
            'trust_score': obj.seller.trust_score,
        }

    def get_buyer_has_rated(self, obj):
        if obj.deal_status != Deal.Status.RELEASED:
            return None
        request = self.context.get('request')
        if not request or not getattr(request.user, 'is_authenticated', False):
            return None
        if obj.buyer_id != request.user.id:
            return None
        from ratings.models import Rating

        return Rating.objects.filter(deal=obj, reviewer=request.user).exists()

    class Meta:
        model = Deal
        fields = [
            'id',
            'deal_status',
            'buyer',
            'seller',
            'buyer_has_rated',
            'title',
            'description',
            'price',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'deal_status',
            'buyer',
            'seller',
            'buyer_has_rated',
            'created_at',
            'updated_at',
            'title',
            'description',
            'price',
            'status',
        ]


class DealCreateSerializer(serializers.ModelSerializer):
    buyer = BuyerUsernameField(write_only=True)

    class Meta:
        model = Deal
        fields = ['product_name', 'product_description', 'product_price', 'buyer']

    def validate_product_price(self, value):
        if value is None:
            raise serializers.ValidationError('Price is required.')
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than 0.')
        return value

    def validate_product_name(self, name):
        if len(name.strip()) < 3:
            raise serializers.ValidationError('Product name must be longer than 3 letters.')
        return name
    
    def validate(self, attrs):
        request = self.context.get('request')

        user = getattr(request, 'user', None)

        buyer = attrs.get('buyer')


        if user == buyer:
            raise serializers.ValidationError({"buyer": "You cannot create a deal with yourself."})
        
        return attrs
