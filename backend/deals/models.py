from django.db import models
from django.conf import settings


# Create your models here.
class Deal(models.Model):

    class Status(models.TextChoices):
        CREATED = 'CR', "CREATED",
        PAID = 'PA', 'PAID',
        SECURED = 'SE', 'SECURED',
        SHIPPED = 'SH', 'SHIPPED',
        DELIVERED = 'DE', 'DELIVERED',
        RELEASED = 'RE', 'RELEASED',
        CANCELLED = 'CA', "CANCELLED",
        DISPUTED = 'DI', 'DISPUTED'



    product_name = models.CharField('Name of product', max_length=100)
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
        default=Status.CREATED
    )
    

    buyer_confirmed = models.BooleanField(default=False)
    seller_confirmed = models.BooleanField(default=False)




    # Aliases for frontend compatibility
    @property
    def title(self):
        return self.product_name
    
    @property
    def description(self):
        return self.product_description
    
    @property
    def price(self):
        return self.product_price
    
    @property
    def status(self):
        return self.deal_status
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

    def __str__(self):
        return f'{self.product_name} - {self.product_price}\n'
    
    class Meta:
        verbose_name = 'Deal'
        verbose_name_plural = 'Deals'
        constraints = [
            models.CheckConstraint(
                condition=models.Q(product_price__gt=0),
                name='deal_product_price_positive',
            ),
        ]

