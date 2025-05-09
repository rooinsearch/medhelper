from django.contrib import admin
from .models import CheckAIChat, CheckAIMessage

@admin.register(CheckAIChat)
class CheckAIChatAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "created_at")
    search_fields = ("title", "user__email")
    list_filter = ("created_at",)

@admin.register(CheckAIMessage)
class CheckAIMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "chat", "sender", "timestamp")
    search_fields = ("content",)
    list_filter = ("sender", "timestamp")