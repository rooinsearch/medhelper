from rest_framework import serializers
from django.urls import reverse
from .models import Analysis, Hospital, TestRecord, HospitalReview
from django.contrib.auth import get_user_model
import datetime

class HospitalSerializer(serializers.ModelSerializer):
    detail_url = serializers.SerializerMethodField()

    class Meta:
        model = Hospital
        fields = ['id', 'name', 'address', 'working_time', 'created_at', 'photo', 'detail_url']
    def get_detail_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(
            reverse('hospital-detail', args=[obj.pk])
        )


class AnalysisSerializer(serializers.ModelSerializer):
    lab_id = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.all(),
        source='lab',
        write_only=True,
        allow_null=True
    )

    lab = serializers.ReadOnlyField(source='lab.name')

    lab_info = HospitalSerializer(
        source='lab',
        read_only=True
    )
    detail_url = serializers.SerializerMethodField()

    class Meta:
        model = Analysis
        fields = [
            'id',
            'title',
            'description',
            'abouttest',         # 
            'preparation',
            'rating',
            'reviews',
            'reviews_data',
            'category',
            'lab_id',      # ID госпиталя (для создания/обновления)
            'lab',         # Название госпиталя (только для чтения)
            'lab_info',    # Полная информация (только для чтения)
            'price',
            'ready',
            'created_at',
            'detail_url',

        ]
        
    def get_detail_url(self, obj):
        request = self.context.get('request')
        # строим абсолютный URL, например: http://example.com/api/analysis/5/
        return request.build_absolute_uri(
            reverse('analysis-detail', args=[obj.pk])
        )   

class TestRecordSerializer(serializers.ModelSerializer):
    analysis = AnalysisSerializer(read_only=True)
    hospital = HospitalSerializer(read_only=True)
    result_file = serializers.FileField(read_only=True)

    class Meta:
        model = TestRecord
        fields = [
            'id',
            'user',
            'analysis',
            'hospital',
            'test_date',
            'notes',
            'result',      # Новый текстовый результат анализа
            'result_file',    #  добавлено
            'status',      # Новый статус заказа
            'reviewed_at', # Дата, когда результат внесён
        ]
        read_only_fields = ['user', 'test_date', 'result', 'status', 'reviewed_at']
        
class TestRecordCreateSerializer(serializers.ModelSerializer):
    scheduled_date = serializers.DateField(write_only=True)
    scheduled_time = serializers.TimeField(write_only=True)

    class Meta:
        model = TestRecord
        fields = [
            'id',
            'analysis',
            'hospital',
            'notes',
            'scheduled_date',
            'scheduled_time',
        ]

    def create(self, validated_data):
        sd = validated_data.pop('scheduled_date')
        st = validated_data.pop('scheduled_time')
        validated_data['test_date'] = datetime.datetime.combine(sd, st)
        return super().create(validated_data)
        
        

User = get_user_model()

class HospitalReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    clinic_name = serializers.CharField(source='hospital.name', read_only=True)  # 👈 добавляем это поле

    class Meta:
        model = HospitalReview
        fields = ['id', 'hospital', 'user', 'user_email', 'comment', 'rating', 'created_at', 'clinic_name']
        read_only_fields = ['user', 'created_at']

    def validate_rating(self, value):
        if not 0 <= value <= 5:
            raise serializers.ValidationError("Оценка должна быть от 0 до 5.")
        return value