from rest_framework.generics import RetrieveUpdateAPIView, ListAPIView, DestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import NotificationSettings, NotificationHistory
from .serializers import NotificationSettingsSerializer, NotificationHistorySerializer


class NotificationSettingsView(RetrieveUpdateAPIView):
    """
    Получение и обновление настроек уведомлений (test_reminders, result_alerts)
    """
    serializer_class = NotificationSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Создаём настройки по умолчанию, если ещё нет
        obj, _ = NotificationSettings.objects.get_or_create(user=self.request.user)
        return obj


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationHistoryListView(ListAPIView):
    """
    Получение истории уведомлений с фильтрацией по пользовательским настройкам
    """
    serializer_class = NotificationHistorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        settings = NotificationSettings.objects.filter(user=user).first()
        qs = NotificationHistory.objects.filter(user=user).order_by('-created_at')

        if not settings:
            return qs  # Показываем всё, если настроек нет

        types = ['appointment']  # appointment всегда показывается
        if settings.test_reminders:
            types.append('test_reminder')
        if settings.result_alerts:
            types.append('result_alert')

        return qs.filter(type__in=types)


class MarkNotificationReadView(APIView):
    """
    Отметить уведомление как прочитанное
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notif = get_object_or_404(NotificationHistory, pk=pk, user=request.user)
        notif.read = True
        notif.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DeleteNotificationView(DestroyAPIView):
    """
    Удалить уведомление (только своё)
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationHistorySerializer

    def get_queryset(self):
        return NotificationHistory.objects.filter(user=self.request.user)
