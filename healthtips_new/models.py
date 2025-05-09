# pylint: skip-file
from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.utils import timezone
from cloudinary.models import CloudinaryField

User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Category name")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="URL slug")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

class Article(models.Model):
    title = models.CharField(max_length=200, verbose_name="Article title")
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name="URL slug")
    content = models.TextField(verbose_name="Content")
    categories = models.ManyToManyField(
        Category, 
        related_name='articles', 
        verbose_name="Categories"
    )
    image = CloudinaryField(
        verbose_name="Article image",
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creation date")
    is_published = models.BooleanField(default=True, verbose_name="Published")

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            self.slug = f"{base_slug[:50]}-{self.id}"
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Article"
        verbose_name_plural = "Articles"
        ordering = ['-created_at']

class FavoriteArticle(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites_new')
    article = models.ForeignKey('Article', on_delete=models.CASCADE, related_name='favorited_by_new')
    saved_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ('user', 'article')
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.username} - {self.article.title}"