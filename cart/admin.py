from django.contrib import admin
from .models import Cart, CartItem, PaymentAttempt

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    
@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'analysis', 'quantity')


@admin.register(PaymentAttempt)
class PaymentAttemptAdmin(admin.ModelAdmin):
    list_display = ("user", "last4", "amount", "success", "created")
    list_filter  = ("success", "created")
