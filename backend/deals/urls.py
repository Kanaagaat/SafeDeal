from django.urls import path
from . import views

urlpatterns = [
    path('deals/', views.DealListView.as_view(), name='deal-list'),     
    path('deals/<int:pk>/', views.DealDetailView.as_view(), name='deal-detail'),
    path('deals/<int:pk>/confirm-delivery/', views.confirm_delivery, name='confirm-delivery'),
    path('deals/<int:pk>/seller-confirm/', views.seller_confirm, name='seller-confirm'),
    path('deals/<int:pk>/open-dispute/', views.open_dispute, name='open-dispute'),
    path('deals/<int:pk>/cancel-deal/', views.cancel_deal, name='cancel-deal'),
]