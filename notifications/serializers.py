# notifications/serializers.py
from rest_framework import serializers
from .models import NotificationSettings, NotificationHistory

class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = ['test_reminders', 'result_alerts']

class NotificationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationHistory
        fields = '__all__'