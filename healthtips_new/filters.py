# healthtips/filters.py
from django_filters import rest_framework as filters
from .models import Article, Category
from healthtips_new import models


class ArticleFilter(filters.FilterSet):
    categories = filters.BaseInFilter(
        field_name='categories__slug',
        lookup_expr='in',
        help_text='Filter by category slugs (comma separated)'
    )

    class Meta:
        model = Article
        fields = ['categories']
        
#код внизу тоже робит но правильнее будет ферст
# class ArticleFilter(filters.FilterSet):
#     categories = filters.CharFilter(method='filter_by_categories')
    
#     class Meta:
#         model = Article
#         fields = ['categories']
    
#     def filter_by_categories(self, queryset, name, value):
#         if value:
#             categories = value.split(',')
#             return queryset.filter(categories__slug__in=categories).distinct()
#         return queryset