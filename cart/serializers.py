import re
from datetime import datetime
from rest_framework import serializers

from .models import Cart, CartItem
from analysis.models import Analysis
from analysis.serializers import AnalysisSerializer



class CartItemSerializer(serializers.ModelSerializer):
    # вложенный Analysis (read-only)
    analysis = AnalysisSerializer(read_only=True)
    # для записи фронтом: analysis_id → analysis
    analysis_id = serializers.PrimaryKeyRelatedField(
        queryset=Analysis.objects.all(),
        source="analysis",
        write_only=True
    )
    # новые поля для даты и времени приёма
    scheduled_date = serializers.DateField(required=False, allow_null=True)
    scheduled_time = serializers.TimeField(required=False, allow_null=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "analysis",
            "analysis_id",
            "quantity",
            "scheduled_date",
            "scheduled_time",
        ]

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "items", "total_price"]

    def get_total_price(self, obj):
        return obj.total_price


class PaymentInfoSerializer(serializers.Serializer):

    card_number = serializers.CharField()
    exp_month   = serializers.IntegerField(min_value=1, max_value=12)
    exp_year    = serializers.CharField()   # «30» или «2030»
    cvc         = serializers.CharField(min_length=3, max_length=4)

    def validate_card_number(self, value: str) -> str:
        digits = re.sub(r"\D", "", value)          
        if not 12 <= len(digits) <= 19:
            raise serializers.ValidationError("Card number must be 12‑19 digits")
        return digits

    def validate_exp_year(self, value: str) -> int:
        if not value.isdigit():
            raise serializers.ValidationError("Year must be numeric")
        year = int(value) + 2000 if len(value) == 2 else int(value)
        now  = datetime.now().year
        if not now <= year <= now + 10:
            raise serializers.ValidationError("Invalid expiration year")
        return year
