from rest_framework import generics, permissions
from .models import Analysis, Hospital, TestRecord, HospitalReview
from .serializers import (
    AnalysisSerializer,
    HospitalSerializer,
    TestRecordSerializer,
    TestRecordCreateSerializer,
    HospitalReviewSerializer
)
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from datetime import timedelta
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from rest_framework.views import APIView

class AnalysisListCreateAPIView(generics.ListCreateAPIView):
    queryset = Analysis.objects.all().order_by('-created_at')
    serializer_class = AnalysisSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class AnalysisRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Analysis.objects.all()
    serializer_class = AnalysisSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class HospitalListAPIView(generics.ListAPIView):
    queryset = Hospital.objects.all().order_by('name')
    serializer_class = HospitalSerializer


class TestRecordListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TestRecord.objects.filter(user=self.request.user).order_by('-test_date')

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TestRecordCreateSerializer
        return TestRecordSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HospitalReviewListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = HospitalReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = HospitalReview.objects.all().order_by('-created_at')
        hospital_id = self.request.query_params.get('hospital')
        if hospital_id:
            qs = qs.filter(hospital_id=hospital_id)
        return qs
    def perform_create(self, serializer):
        # здесь user будет автоматически подставлен из request.user
        serializer.save(user=self.request.user)

class HospitalRetrieveAPIView(generics.RetrieveAPIView):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [AllowAny]
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserReviewListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]  # Доступ только для авторизованных пользователей
    serializer_class = HospitalReviewSerializer

    def get_queryset(self):
        return HospitalReview.objects.filter(user=self.request.user)  # Фильтруем по текущему пользователю
    
class ReviewRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = HospitalReview.objects.all()
    serializer_class = HospitalReviewSerializer

    def get_object(self):
        obj = super().get_object()

        if obj.user != self.request.user:
            raise PermissionDenied("You do not have permission to access or modify this review.")

        # ⏱ Проверку времени оставляем только для редактирования:
        if self.request.method in ["PUT", "PATCH"]:
            time_diff = timezone.now() - obj.created_at
            if time_diff > timedelta(hours=24):
                raise ValidationError("You can only edit your review within 24 hours of posting.")

        return obj

    def perform_destroy(self, instance):
        # Удаляем отзыв без ограничений по времени
        instance.delete()

class GlobalSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response({"analyses": [], "hospitals": []})

        analyses = Analysis.objects.filter(title__icontains=q)[:5]
        hospitals = Hospital.objects.filter(name__icontains=q)[:5]

        a_ser = AnalysisSerializer(analyses, many=True, context={'request': request})
        h_ser = HospitalSerializer(hospitals, many=True, context={'request': request})

        return Response({
            "analyses": a_ser.data,
            "hospitals": h_ser.data
        })