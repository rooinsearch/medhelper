from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import TestRecord
from notifications.models import NotificationSettings
from notifications.utils import send_notification
from notifications.email_templates import (
    format_result_ready_email,
    format_rejected_email,  # 👈 добавим новый шаблон
)

@receiver(post_save, sender=TestRecord)
def send_result_alert_signal(sender, instance, created, **kwargs):
    if created:
        return

    # === 1. Статус: COMPLETED ===
    if instance.status == "completed":
        settings = NotificationSettings.objects.filter(user=instance.user).first()
        if settings and not settings.result_alerts:
            return

        body = format_result_ready_email(
            user=instance.user,
            analysis=instance.analysis,
            lab=instance.hospital,
            test_date=instance.test_date
        )

        send_notification(
            to_email=instance.user.email,
            subject="Результаты анализа готовы",
            body=body,
            user=instance.user,
            notif_type='result_alert'
        )

    # === 2. Статус: REJECTED ===
    elif instance.status == "rejected":
        body = format_rejected_email(
            user=instance.user,
            analysis=instance.analysis,
            lab=instance.hospital,
            test_date=instance.test_date
        )

        send_notification(
            to_email=instance.user.email,
            subject="Анализ был отклонён",
            body=body,
            user=instance.user,
            notif_type='result_rejected'
        )
