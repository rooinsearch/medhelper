# healthtips_new/views.py
from django_filters import rest_framework as filters
from .models import Article, Category, FavoriteArticle
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from healthtips_new.pagination import StandardPagination
from .filters import ArticleFilter
from .serializers import ArticleSerializer, CategorySerializer

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ArticleListView(generics.ListAPIView):

    serializer_class = ArticleSerializer

    pagination_class = StandardPagination
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = ArticleFilter

    def get_queryset(self):
        return (
            Article.objects
            .filter(is_published=True)
            .prefetch_related('categories')
            .order_by('-created_at')
        )

class ArticlesByCategoryView(generics.ListAPIView):
    serializer_class  = ArticleSerializer
    pagination_class  = StandardPagination

    def get_queryset(self):
        category_slug = self.kwargs['category_slug']
        return (
            Article.objects
            .filter(is_published=True, categories__slug=category_slug)
            .distinct()
            .order_by('-created_at')
        )

class ArticleDetailView(generics.RetrieveAPIView):
    queryset = Article.objects.filter(is_published=True)
    serializer_class = ArticleSerializer
    lookup_field = 'slug'

