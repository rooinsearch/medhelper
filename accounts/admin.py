from django.contrib import admin
from .models import ContactMessage, User
# Register your models here.

admin.site.register(User)

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'created_at')  # показываем в таблице
    list_filter = ('created_at',)  # фильтр по дате
    search_fields = ('name', 'email', 'message')  # поле поиска
    ordering = ('-created_at',)  # сортировка по убыванию даты