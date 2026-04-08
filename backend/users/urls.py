from django.urls import path
from . import views


urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('user/profile/', views.profile, name='user-profile'),
    path('user/balance/', views.get_balance, name='user-balance'),
    path('add-funds/', views.add_funds, name='add-funds'),
]