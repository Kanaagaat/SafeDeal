from django.urls import path
from . import views

urlpatterns = [
    path('transactions/pay/', views.pay, name='pay'),
    path('transactions/confirm/', views.confirm, name='confirm'),
    path('transactions/', views.transaction_history, name='transaction-history'),
]