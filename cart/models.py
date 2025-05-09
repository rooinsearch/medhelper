from decimal import Decimal

from django.db import models
from django.conf import settings

from analysis.models import Analysis


class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Корзина пользователя {self.user.email}"

    @property
    def total_price(self) -> Decimal:
        total = sum(
            (
                item.analysis.price * item.quantity
                for item in self.items.select_related("analysis")
            ),
            start=Decimal("0"),
        )
        return total


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart, related_name="items", on_delete=models.CASCADE
    )
    analysis = models.ForeignKey(Analysis, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    
    # новые поля
    scheduled_date = models.DateField(null=True, blank=True, verbose_name="Дата приёма")
    scheduled_time = models.TimeField(null=True, blank=True, verbose_name="Время приёма")

    def __str__(self):
        return f"{self.analysis.title} x {self.quantity}"


class PaymentAttempt(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payment_attempts",
    )
    last4 = models.CharField(max_length=4)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="KZT")
    success = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]
        indexes = [
            models.Index(fields=["user", "-created"]),
        ]

    def __str__(self) -> str:
        status = "✅" if self.success else "❌"
        return (
            f"{self.user.email} • {self.last4} • {self.amount} {self.currency} {status}"
        )
