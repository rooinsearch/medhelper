# notifications/urls.py
from django.urls import path
from .views import (
    NotificationSettingsView,
    NotificationHistoryListView,
    MarkNotificationReadView,
    DeleteNotificationView
)

urlpatterns = [
    path('settings/', NotificationSettingsView.as_view(), name='notification-settings'),
    path('', NotificationHistoryListView.as_view(), name='notification-history'),
    path('<int:pk>/mark-read/', MarkNotificationReadView.as_view(), name='notification-mark-read'),
    path('<int:pk>/', DeleteNotificationView.as_view(), name='notification-delete'),
]