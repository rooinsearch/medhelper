from django.urls import path
from .views import (
    CartDetailAPIView,
    AddToCartAPIView,
    RemoveCartItemAPIView,
    UpdateCartItemAPIView,
    CheckoutAPIView
)

urlpatterns = [
    path('', CartDetailAPIView.as_view(), name='cart-detail'),
    path('add/', AddToCartAPIView.as_view(), name='cart-add'),
    path('item/<int:pk>/', UpdateCartItemAPIView.as_view(), name='cart-update'),
    path('item/<int:pk>/remove/', RemoveCartItemAPIView.as_view(), name='cart-remove'),
    path('checkout/', CheckoutAPIView.as_view(), name='checkout'),
]
