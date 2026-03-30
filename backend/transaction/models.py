from django.db import models
from django.conf import settings

# Create your models here.
class Transaction(models.Model):

    class TransactionType(models.TextChoices):
        DEPOSIT = 'DE', 'DEPOSIT',
        ESCROW = 'ES', 'ESCROW',
        RELEASE = 'RE', 'RELEASE',
        REFUND = "RF", 'REFUND'
        


    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='user'
    )

    deal = models.ForeignKey(
        'deals.Deal',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transaction'
    )

    transaction_type = models.CharField(
        max_length = 2,
        choices=TransactionType.choices,
        default=TransactionType.ESCROW
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.transaction_type} - {self.amount} - {self.user.username}"