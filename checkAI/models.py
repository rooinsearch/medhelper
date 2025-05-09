from django.db import models
from django.conf import settings
import secrets
from django.utils import timezone

def generate_token():
    return secrets.token_hex(16)

class CheckAIChat(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,  # Изменили SET_NULL → CASCADE
        null=True,
        blank=True,
        related_name="checkai_sessions"
    )
    title = models.CharField(max_length=100, default="New Chat")
    secret_token = models.CharField(max_length=64, unique=True, default=generate_token, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)  # Добавили
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Добавили

    @property
    def is_anonymous(self):
        return self.user is None

    def __str__(self):
        return f"{self.title} — {self.user.email if self.user else 'anonymous'}"

class CheckAIMessage(models.Model):
    chat = models.ForeignKey(CheckAIChat, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=[("user", "User"), ("assistant", "Assistant")])
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']  # Добавили сортировку

    def __str__(self):
        return f"{self.sender}: {self.content[:40]}"