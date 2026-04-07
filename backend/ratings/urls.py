from django.urls import path
from . import views

urlpatterns = [
    path('ratings/', views.RatingListCreateView.as_view(), name='rating-list-create'),
    
]