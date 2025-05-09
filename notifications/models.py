# notifications/models.py
from django.db import models
from django.conf import settings

class NotificationSettings(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    test_reminders = models.BooleanField(default=True)
    result_alerts = models.BooleanField(default=True)

    def __str__(self):
        return f"Settings for {self.user.email}"

class NotificationHistory(models.Model):
    NOTIFICATION_TYPES = (
        ('test_reminder', 'Test Reminder'),
        ('result_alert', 'Result Alert'),
        ('appointment', 'Appointment Confirmation'),
        ('result_rejected', 'Result Rejected'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    type = models.CharField(max_length=32, choices=NOTIFICATION_TYPES, default='test_reminder')
    email_sent = models.BooleanField(default=True) 

    def __str__(self):
        return f"{self.user.email} | {self.subject[:30]}..."