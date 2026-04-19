from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )

        return user
    
    def validate_email(self, data):
        if User.objects.filter(email=data).exists():
            raise serializers.ValidationError("Email already exists")
        return data
    
    def validate_username(self, data):
        if User.objects.filter(username=data).exists():
            raise serializers.ValidationError("Username already exist")
        return data



class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(min_length=6, write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            raise serializers.ValidationError('Must include both username and password')

        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError('Invalid username or password')
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

            
        data['user'] = user
        return data 



class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для пользователя (только чтение)"""
    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'balance',
            'escrow_balance',
            'trust_score',
            'date_joined',
        )
        read_only_fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'balance',
            'escrow_balance',
            'trust_score',
            'date_joined',
        )



