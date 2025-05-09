from django.urls import path
from .views import (
    CheckAIChatCreateView,
    CheckAIMessageView,
    CheckAIChatDetailView,
    CheckAIChatDeleteView
)

urlpatterns = [
    # Создание нового чата
    # POST /api/ai-chats/
    path('create/', CheckAIChatCreateView.as_view(), name='ai-chat-create'),
    
    # Отправка сообщения и получение ответа
    # POST /api/ai-chats/<chat_id>/message/
    path('<int:chat_id>/message/', CheckAIMessageView.as_view(), name='ai-chat-message'),
    
    # Получение информации о чате и истории сообщений
    # GET /api/ai-chats/<chat_id>/
    path('<int:chat_id>/', CheckAIChatDetailView.as_view(), name='ai-chat-detail'),
    
    # Удаление чата
    # DELETE /api/ai-chats/<chat_id>/
    path('<int:chat_id>/delete/', CheckAIChatDeleteView.as_view(), name='ai-chat-delete'),
]