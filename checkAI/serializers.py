from rest_framework import serializers
from .models import CheckAIChat, CheckAIMessage

class CheckAIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckAIMessage
        fields = ['id', 'sender', 'content', 'timestamp']
        read_only_fields = fields

class CheckAIChatSerializer(serializers.ModelSerializer):
    messages = CheckAIMessageSerializer(many=True, read_only=True)
    is_anonymous = serializers.BooleanField(read_only=True)

    class Meta:
        model = CheckAIChat
        fields = ['id', 'title', 'user', 'secret_token', 'ip_address', 
                 'created_at', 'updated_at', 'is_anonymous', 'messages']
        read_only_fields = ['secret_token', 'ip_address', 'created_at', 
                          'updated_at', 'is_anonymous']