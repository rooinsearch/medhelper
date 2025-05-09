# pylint: skip-file
from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Article
from django.utils.text import slugify
from django.db.models import Count

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'article_count')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(num_articles=Count('articles'))

    def article_count(self, obj):
        return obj.num_articles
    article_count.short_description = 'Количество статей'

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'display_categories', 'image_preview', 'created_at', 'is_published')
    list_filter = ('is_published', 'categories', 'created_at')
    search_fields = ('title', 'content')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('categories',)
    readonly_fields = ('created_at', 'image_preview')
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'content', 'is_published')
        }),
        ('Медиа', {
            'fields': ('image', 'image_preview'),
        }),
        ('Категории', {
            'fields': ('categories',),
        }),
        ('Даты', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def display_categories(self, obj):
        return ", ".join([cat.name for cat in obj.categories.all()])
    display_categories.short_description = 'Категории'
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
    '<img src="{}" style="max-height: 200px; max-width: 300px; object-fit: cover;" />',
    obj.image.build_url(quality="auto:best", fetch_format="auto")
)
        return "Нет изображения"
    image_preview.short_description = 'Превью'
    
    def save_model(self, request, obj, form, change):
        if not obj.slug:
            obj.slug = slugify(obj.title)
        super().save_model(request, obj, form, change)