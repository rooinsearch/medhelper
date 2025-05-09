from django.contrib import admin
from .models import Analysis, Hospital, TestRecord, HospitalReview
from django.utils.html import format_html

@admin.register(Analysis)
class AnalysisAdmin(admin.ModelAdmin):
    list_display = ('title', 'lab_display', 'category', 'price', 'ready', 'created_at')
    list_filter = ('lab', 'category', 'ready')
    search_fields = ('title', 'category', 'lab__name')

    def lab_display(self, obj):
        return obj.lab.name if obj.lab else "-"
    lab_display.short_description = "Hospital"

@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ('name', 'working_time', 'created_at', 'photo_thumbnail')
    search_fields = ('name', 'address')

    def photo_thumbnail(self, obj):
        if obj.photo:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />', obj.photo.url)
        return '-'
    photo_thumbnail.short_description = "Фото"

@admin.register(TestRecord)
class TestRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'analysis', 'hospital', 'test_date', 'result_file_link')
    search_fields = ('user__email', 'analysis__title', 'hospital__name')
    readonly_fields = ('result_file_link',)
    # 👇 Добавь эту часть — поля, которые будут отображаться в форме редактирования
    fields = (
        'user', 'analysis', 'hospital', 'test_date',
        'notes', 'result', 'result_file', 'status',
        'reviewed_at', 'result_file_link',  # ✅ показываем ссылку внизу
    )

    def result_file_link(self, obj):
        if obj.result_file:
            return format_html('<a href="{}" target="_blank">📄 PDF</a>', obj.result_file.url)
        return "-"
    result_file_link.short_description = "Файл анализа"


@admin.register(HospitalReview)
class HospitalReviewAdmin(admin.ModelAdmin):
    list_display = ('hospital', 'user', 'rating', 'created_at')
    search_fields = ('hospital__name', 'user__email', 'comment')
    list_filter = ('hospital', 'rating')
    