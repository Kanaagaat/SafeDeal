from django.contrib import admin
from .models import Deal

# Register your models here.


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'product_price', 'buyer', 'seller', 'deal_status')
    list_filter = ('deal_status',)
    search_fields = ('product_name', 'buyer__username', 'seller__username')