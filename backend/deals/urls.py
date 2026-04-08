from django.urls import path
from . import views

urlpatterns = [
    path('deals/', views.DealListView.as_view(), name='deal-list'),     
    path('deals/<int:pk>/', views.DealDetailView.as_view(), name='deal-detail'),
    path('deals/<int:pk>/confirm-delivery/', views.confirm_delivery, name='confirm-delivery'),
]