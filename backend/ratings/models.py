from django.db import models
from django.conf import settings

# Create your models here.
class Rating(models.Model):
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='rating_given'
    )

    reviewed_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='rating_recieved'
    )

    deal = models.ForeignKey(
        'deals.Deal',
        on_delete=models.CASCADE, 
        related_name='deal_rating'
    )

    score = models.DecimalField(max_digits=2, decimal_places=2, default=5.0)
    created_at = models.DateTimeField(auto_now_add=True)
    comment = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Rating'
        verbose_name_plural = 'Ratings'
    
    def __str__(self):
        return f"{self.score} stars for {self.reviewed_user.username}"