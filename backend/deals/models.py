from django.db import models
from django.conf import settings


# Create your models here.
class Deal(models.Model):

    class Status(models.TextChoices):
        PENDING = 'PD', "PENDING",
        SHIPPED = 'SH', 'SHIPPED',
        COMPLETED = 'CO', 'COMPLETED',
        CANCELLED = 'CA', "CANCELLED"



    product_name = models.CharField('Name of product',max_length=100)
    product_description = models.TextField('Description of product')

    product_price = models.DecimalField('Product price', max_digits=10, decimal_places=2)

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='purchases'
    )

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sales'
    )

    deal_status = models.CharField(
        max_length=2,
        choices=Status.choices, 
        default=Status.PENDING
    )

    def __str__(self):
        return f'{self.product_name} - {self.product_price}\n'
    
    class Meta:
        verbose_name = 'Deal'
        verbose_name_plural = 'Deals'

