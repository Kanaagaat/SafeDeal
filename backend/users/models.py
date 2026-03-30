from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator,MaxValueValidator
# Create your models here.

class User(AbstractUser):
    balance = models.DecimalField(
        'User balance',
        max_digits=10, 
        decimal_places=2,
        default=0.0
        )

    escrow_balance = models.DecimalField(
        'Escrow balance', 
        max_digits=10, 
        decimal_places=2,
        default=0.0
        )
    
    trust_score = models.DecimalField(
        "Rating score of user", 
        decimal_places=1, 
        max_digits=2, 
        default=5.0,
        validators=[  # Добавить валидаторы
            MinValueValidator(0.0),
            MaxValueValidator(5.0)
        ]
        )
    
    def __str__(self):
        return f'{self.username}\nTrust score: {self.trust_score}'
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

