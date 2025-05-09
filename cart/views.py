from datetime import datetime as _dt
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from decimal import Decimal

from analysis.models import Analysis, TestRecord
from analysis.serializers import TestRecordSerializer

from .models import Cart, CartItem, PaymentAttempt
from .serializers import CartSerializer, CartItemSerializer, PaymentInfoSerializer

from notifications.utils import send_notification
from notifications.email_templates import format_payment_email



class CartDetailAPIView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart


class AddToCartAPIView(generics.CreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        analysis_id    = request.data.get('analysis_id')
        quantity       = int(request.data.get('quantity', 1))
        sched_date_str = request.data.get('scheduled_date')
        sched_time_str = request.data.get('scheduled_time')

        if not analysis_id:
            return Response(
                {"error": "analysis_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart, _      = Cart.objects.get_or_create(user=request.user)
        analysis     = get_object_or_404(Analysis, id=analysis_id)
        defaults     = {
            'quantity': quantity,
            'scheduled_date': sched_date_str,
            'scheduled_time': sched_time_str,
        }
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            analysis=analysis,
            defaults=defaults
        )

        if not created:
            cart_item.quantity += quantity
            if sched_date_str is not None:
                cart_item.scheduled_date = sched_date_str
            if sched_time_str is not None:
                cart_item.scheduled_time = sched_time_str
            cart_item.save()

        serializer = CartItemSerializer(
            cart_item,
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UpdateCartItemAPIView(generics.UpdateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return get_object_or_404(
            CartItem, id=self.kwargs["pk"], cart__user=self.request.user
        )


class RemoveCartItemAPIView(generics.DestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return get_object_or_404(
            CartItem, id=self.kwargs["pk"], cart__user=self.request.user
        )


class CheckoutAPIView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        if not cart.items.exists():
            return Response(
                {"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST
            )

        # 0. payment
        payment_data = request.data.get("payment")
        if payment_data is None:
            return Response(
                {"detail": "Field 'payment' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. валидируем карту
        payment_ser = PaymentInfoSerializer(data=payment_data)
        payment_ser.is_valid(raise_exception=True)
        card = payment_ser.validated_data["card_number"]

        # 2. эмулируем эквайринг
        payment_success = True

        # 3. логируем попытку
        PaymentAttempt.objects.create(
            user=request.user,
            last4=card[-4:],
            amount=Decimal(cart.total_price),
            success=payment_success,
        )

        if not payment_success:
            return Response(
                {"detail": "Payment declined"}, status=status.HTTP_402_PAYMENT_REQUIRED
            )

        # 4. создаём TestRecord-ы, перенося дату и время
        created_records = []
        for item in cart.items.select_related("analysis"):
            analysis = item.analysis

            # соберём datetime из даты + времени, если оба есть
            test_dt = None
            if item.scheduled_date and item.scheduled_time:
                naive = _dt.combine(item.scheduled_date, item.scheduled_time)
                # если у вас USE_TZ=True, делаем aware
                test_dt = timezone.make_aware(naive, timezone.get_current_timezone())

            record = TestRecord.objects.create(
                user=request.user,
                analysis=analysis,
                hospital=analysis.lab,
                test_date=test_dt,
                notes=f"Order from cart {timezone.now():%d.%m.%Y %H:%M}",
            )
            created_records.append(record)

            # 📬 отправка уведомления по email
            email_body = format_payment_email(
                user=request.user,
                analysis=analysis,
                lab=analysis.lab,
                test_date=test_dt,
            )
            send_notification(
                to_email=request.user.email,
                subject="Подтверждение записи на анализ",
                body=email_body,
                user=request.user,
                notif_type='appointment'
            )

        # 5. очищаем корзину
        cart.items.all().delete()

        # 6. ответ
        data = TestRecordSerializer(
            created_records, many=True, context={"request": request}
        ).data
        return Response(
            {"message": "Payment successful, records created.", "records": data},
            status=status.HTTP_201_CREATED,
        )
