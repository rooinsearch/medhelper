from django.urls import path
from .views import ArticleDetailView, ArticleListView, ArticlesByCategoryView,  CategoryListView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('articles/', ArticleListView.as_view(), name='article-list'),
    path('categories/<slug:category_slug>/articles/', 
         ArticlesByCategoryView.as_view(), 
         name='articles-by-category'),
    path('articles/<slug:slug>/', ArticleDetailView.as_view(), name='article-detail'),
]