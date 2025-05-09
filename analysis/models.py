from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Analysis(models.Model):
    READY_CHOICES = [
        ("Within 1 day", "Within 1 day"),
        ("1-3 days", "1-3 days"),
        ("More than 3 days", "More than 3 days"),
    ]

    title = models.CharField(max_length=200, verbose_name="Название анализа")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")
    abouttest = models.TextField(blank=True, null=True, verbose_name="О тесте")  #  новое поле
    preparation = models.TextField(blank=True, null=True, verbose_name="Инструкция по подготовке") #новое поле
    rating = models.FloatField(default=0, verbose_name="Рейтинг")
    reviews = models.PositiveIntegerField(default=0, verbose_name="Число отзывов")
    reviews_data = models.JSONField(
        blank=True, null=True, verbose_name="Детальные отзывы"
    )
    category = models.CharField(max_length=150, verbose_name="Категория анализа")
    lab = models.ForeignKey(
        "Hospital",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="analyses",
        verbose_name="Лаборатория (из Hospital)",
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена")
    ready = models.CharField(
        max_length=30,
        choices=READY_CHOICES,
        default="1-3 days",
        verbose_name="Время готовности",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    def __str__(self):
        return f"{self.title} ({self.lab})"


class Hospital(models.Model):
    name = models.CharField(max_length=150, verbose_name="Hospital Name")
    address = models.TextField(verbose_name="Hospital Address")
    working_time = models.CharField(max_length=50, verbose_name="Working Hours")
    photo = models.ImageField(
        upload_to="hospital_photos/",
        blank=True,
        null=True,
        verbose_name="Фото госпиталя",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class TestRecord(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="test_records"
    )
    analysis = models.ForeignKey(
        Analysis, on_delete=models.SET_NULL,
        null=True, blank=True
    )
    hospital = models.ForeignKey(
        Hospital, on_delete=models.SET_NULL,
        null=True, blank=True
    )
    # вот это поле теперь вручную заполняется из scheduled_date+scheduled_time
    test_date = models.DateTimeField(
        null=True, blank=True,
        verbose_name="Дата и время приёма"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        null=True, blank=True,
        verbose_name="Дата создания записи"
    )
    notes = models.TextField(blank=True, null=True)

    # Новые поля для хранения результатов анализа:
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("rejected", "Rejected"),
    ]
    result = models.TextField(blank=True, null=True, verbose_name="Результат анализа")
    result_file = models.FileField(
        upload_to='test_results/',
        blank=True,
        null=True,
        verbose_name="Файл с результатом (PDF)"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        verbose_name="Статус анализа",
    )
    reviewed_at = models.DateTimeField(
        blank=True, null=True, verbose_name="Дата внесения результата"
    )

    def __str__(self):
        return f"TestRecord for {self.user.email} - {self.analysis} (Status: {self.status})"


class HospitalReview(models.Model):
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name="reviews_list",
        verbose_name="Госпиталь",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="hospital_reviews",
        verbose_name="Пользователь",
    )
    comment = models.TextField(verbose_name="Комментарий")
    rating = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Оценка",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    def __str__(self):
        return f"Review by {self.user.email} for {self.hospital.name} (Rating: {self.rating})"
