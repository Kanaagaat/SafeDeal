# users/test_login.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
import json

@csrf_exempt
def test_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            print(f"Test login - username: {username}, password: {password}")
            
            user = authenticate(username=username, password=password)
            print(f"Authenticate result: {user}")
            
            if user:
                refresh = RefreshToken.for_user(user)
                return JsonResponse({
                    'success': True,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'username': user.username
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid credentials'
                }, status=400)
        except Exception as e:
            print(f"Error: {e}")
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)