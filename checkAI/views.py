from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
from openai import OpenAI
import logging
from .models import CheckAIChat, CheckAIMessage
from .serializers import CheckAIChatSerializer

logger = logging.getLogger(__name__)
client = OpenAI(api_key=settings.OPENAI_API_KEY)

class CheckAIChatCreateView(APIView):
    def post(self, request):
        # Проверка лимита для анонимных пользователей
        if not request.user.is_authenticated:
            ip = self.get_client_ip(request)
            if self.is_ip_limited(ip):
                return Response(
                    {"error": "Anonymous chat limit exceeded (max 3 per IP per day)"},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

        # Создание чата
        chat = CheckAIChat.objects.create(
            user=request.user if request.user.is_authenticated else None,
            ip_address=self.get_client_ip(request) if not request.user.is_authenticated else None,
            title=request.data.get('title', 'New Chat')
        )

        serializer = CheckAIChatSerializer(chat)
        return Response({
            **serializer.data,
            'token': chat.secret_token if not request.user.is_authenticated else None
        }, status=status.HTTP_201_CREATED)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        return x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')

    def is_ip_limited(self, ip):
        cache_key = f"anon_chat_limit_{ip}"
        chat_count = cache.get(cache_key, 0)
        if chat_count >= getattr(settings, 'ANONYMOUS_CHAT_LIMIT', 3):
            return True
        cache.set(cache_key, chat_count + 1, timeout=86400)
        return False

class CheckAIMessageView(APIView):
    def post(self, request, chat_id):
        try:
            # Валидация chat_id
            try:
                chat_id = int(chat_id)
                if chat_id <= 0:
                    raise ValueError("Chat ID must be positive integer")
            except (TypeError, ValueError) as e:
                return Response(
                    {"error": f"Invalid chat ID: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Получаем чат с проверкой существования
            chat = CheckAIChat.objects.get(id=chat_id)
            self.check_chat_access(request, chat)
            
            # Валидация сообщения
            user_message = request.data.get('message', '').strip()
            if not user_message:
                return Response(
                    {"error": "Message cannot be empty"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Сохраняем сообщение пользователя
            CheckAIMessage.objects.create(
                chat=chat,
                sender="user",
                content=user_message
            )

            # Подготовка истории сообщений
            messages = self.prepare_message_history(chat)
            
            # Получаем ответ от OpenAI
            try:
                ai_response = self.get_ai_response(messages)
            except Exception as e:
                logger.error(f"OpenAI API failed: {str(e)}")
                ai_response = "I'm having trouble responding right now. Please try again later."

            # Сохраняем ответ ассистента
            CheckAIMessage.objects.create(
                chat=chat,
                sender="assistant",
                content=ai_response
            )

            # Обновляем время последней активности
            chat.save()
            
            return Response({
                "reply": ai_response,
                "chat_id": chat.id,
                "updated_at": chat.updated_at
            })

        except CheckAIChat.DoesNotExist:
            logger.warning(f"Chat not found: ID {chat_id}")
            return Response(
                {"error": "Chat not found. Please create a new chat."},
                status=status.HTTP_404_NOT_FOUND
            )
        except PermissionError as e:
            logger.warning(f"Access denied to chat {chat_id}: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            logger.error(f"Unexpected error in message processing: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def check_chat_access(self, request, chat):
        """Проверка прав доступа к чату"""
        if chat.user:
            if not request.user.is_authenticated:
                raise PermissionError("Authentication required")
            if chat.user != request.user:
                raise PermissionError("You don't own this chat")
        else:
            token = request.headers.get('X-Session-Token')
            if token != chat.secret_token:
                raise PermissionError("Invalid session token")

    def prepare_message_history(self, chat, limit=10):
        """Подготовка истории сообщений для контекста"""
        messages = chat.messages.order_by('-timestamp')[:limit]
        return [
            {
                "role": "user" if msg.sender == "user" else "assistant",
                "content": msg.content
            } 
            for msg in reversed(messages)
        ]

    def get_ai_response(self, messages):
        """Взаимодействие с OpenAI API"""
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": "You are a helpful assistant."}] + messages,
                temperature=0.7,
                max_tokens=1000,
                timeout=10  # Таймаут 10 секунд
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise  # Пробрасываем исключение для обработки выше
        
class CheckAIChatDetailView(APIView):
    def get(self, request, chat_id):
        try:
            chat = CheckAIChat.objects.get(id=chat_id)
            self.check_chat_access(request, chat)
            serializer = CheckAIChatSerializer(chat)
            return Response(serializer.data)
        except CheckAIChat.DoesNotExist:
            return Response({"error": "Chat not found"}, status=status.HTTP_404_NOT_FOUND)
        except PermissionError as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)

class CheckAIChatDeleteView(APIView):
    def delete(self, request, chat_id):
        try:
            chat = CheckAIChat.objects.get(id=chat_id)
            self.check_chat_access(request, chat)
            chat.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CheckAIChat.DoesNotExist:
            return Response({"error": "Chat not found"}, status=status.HTTP_404_NOT_FOUND)
        except PermissionError as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)