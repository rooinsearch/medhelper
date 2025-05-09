from rest_framework import serializers
from .models import Article, Category, FavoriteArticle

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ArticleSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        if obj.image:
            return obj.image.build_url(quality="auto:best", fetch_format="auto")
        return None


    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'content', 'image',
            'created_at', 'categories', 'is_published'
        ]
