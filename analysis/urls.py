from django.urls import path
from .views import (
    AnalysisListCreateAPIView,
    AnalysisRetrieveUpdateDestroyAPIView,
    GlobalSearchView,
    HospitalListAPIView,
    ReviewRetrieveUpdateDestroyAPIView,
    TestRecordListCreateAPIView,
    HospitalReviewListCreateAPIView,
    UserReviewListAPIView, 
    HospitalRetrieveAPIView,        
    
)

urlpatterns = [
    path('', AnalysisListCreateAPIView.as_view(), name='analysis-list'),
    path('<int:pk>/', AnalysisRetrieveUpdateDestroyAPIView.as_view(), name='analysis-detail'),
    path('hospitals/', HospitalListAPIView.as_view(), name='hospital-list'),
    path('records/', TestRecordListCreateAPIView.as_view(), name='testrecord-list'),
    path('hospital-reviews/', HospitalReviewListCreateAPIView.as_view(), name='hospital-review-list'),
    path('myreviews/', UserReviewListAPIView.as_view(), name='user-reviews'),
    path('myreviews/<int:pk>/', ReviewRetrieveUpdateDestroyAPIView.as_view(), name='review-detail'),
    path('search/', GlobalSearchView.as_view(), name='global-search'), 
    path('hospitals/<int:pk>/', HospitalRetrieveAPIView.as_view(), name='hospital-detail'),
]
