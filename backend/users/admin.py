from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
# Register your models here.

class CustomUserAdmin(UserAdmin):
    fieldset= UserAdmin.fieldsets + (
        ('Marketplace Data', {'fields': ('balance', 'escrow_balance', 'trust_score')}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
            ('Marketplace Data', {'fields': ('balance', 'escrow_balance', 'trust_score')}),
        )

admin.site.register(User, CustomUserAdmin)