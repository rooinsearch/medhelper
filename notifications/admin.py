# notifications/admin.py
from django.contrib import admin
from .models import NotificationSettings, NotificationHistory

@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'test_reminders', 'result_alerts']

@admin.register(NotificationHistory)
class NotificationHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'subject', 'created_at']
    search_fields = ['user__email', 'subject']
    list_filter = ['created_at']