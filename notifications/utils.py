import requests
from django.conf import settings
from .models import NotificationHistory


def send_notification(to_email, subject, body, user=None, notif_type=None):
    """
    Универсальная функция для отправки уведомлений:
    1. ВСЕГДА сохраняет уведомление в NotificationHistory
    2. ВСЕГДА отправляет email через Mailgun (игнорирует пользовательские настройки)
    3. Логирует ошибки, но не мешает сохранению
    """
    if not user or not notif_type:
        return None

    # Сначала создаём запись в истории
    notification = NotificationHistory.objects.create(
        user=user,
        subject=subject,
        body=body,
        type=notif_type,
        email_sent=True  # Раскомментируй, если добавишь это поле в модель
    )

    # Пытаемся отправить email
    try:
        response = requests.post(
            f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages",
            auth=("api", settings.MAILGUN_API_KEY),
            data={
                "from": settings.MAILGUN_FROM_EMAIL,
                "to": [to_email],
                "subject": subject,
                "text": body,
            }
        )
        response.raise_for_status()

    except requests.RequestException as e:
        print(f"[Mailgun Error] ❌ Email not sent to {to_email}: {e}")
        notification.email_sent = False
        notification.save()

    return notification
