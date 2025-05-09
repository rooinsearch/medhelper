# notifications/management/commands/send_test_reminders.py
# pylint: skip-file

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from analysis.models import TestRecord
from notifications.utils import send_notification
from notifications.email_templates import format_reminder_email
from notifications.models import NotificationSettings


class Command(BaseCommand):
    help = "Отправляет напоминания пользователям за 24 часа до анализа"

    def handle(self, *args, **kwargs):
        now = timezone.now()
        target_start = now + timedelta(hours=23, minutes=50)
        target_end = now + timedelta(hours=24, minutes=10)

        # Ищем тесты, запланированные примерно через 24 часа
        records = TestRecord.objects.filter(
            test_date__range=(target_start, target_end),
            status='pending'
        ).select_related('user', 'analysis', 'hospital')

        sent = 0
        skipped = 0
        failed = 0

        for record in records:
            user = record.user

            # Проверка настроек уведомлений
            settings = NotificationSettings.objects.filter(user=user).first()
            if settings and not settings.test_reminders:
                skipped += 1
                continue

            try:
                subject = "Напоминание о приёме анализа"
                body = format_reminder_email(
                    user=user,
                    analysis=record.analysis,
                    lab=record.hospital,
                    test_date=record.test_date,
                )

                # Используем единую функцию отправки + запись в NotificationHistory
                notification = send_notification(
                    to_email=user.email,
                    subject=subject,
                    body=body,
                    user=user,
                    notif_type='test_reminder'
                )

                if notification:
                    sent += 1
                else:
                    failed += 1
                    self.stderr.write(self.style.WARNING(
                        f"⚠️ Уведомление не создано для {user.email}"
                    ))

            except Exception as e:
                failed += 1
                self.stderr.write(self.style.ERROR(
                    f"❌ Ошибка при отправке для {user.email}: {str(e)}"
                ))

        self.stdout.write(self.style.SUCCESS(
            f"📨 Напоминаний отправлено: {sent} | Пропущено по настройкам: {skipped} | Ошибок: {failed}"
        ))
