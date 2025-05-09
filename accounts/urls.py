from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import ChangePasswordView, ContactMessageView, PasswordResetConfirm, PasswordResetRequestView, RegisterUserView, ResendOTPView, SetNewPassword, UserProfileView, VerifyUserEmail, LoginUserView, LogoutUserView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('verify-email/', VerifyUserEmail.as_view(), name='verify'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),

    path('login/', LoginUserView.as_view(), name='login'),
    path('logout/', LogoutUserView.as_view(), name='logout'),
    # path('me/', MeView.as_view(), name='me'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),


    path('request-password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirm.as_view(), name='password-reset-confirm'),
    path('set-new-password/', SetNewPassword.as_view(), name='set-new-password'),


    path('contact/', ContactMessageView.as_view(), name='contact'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]

