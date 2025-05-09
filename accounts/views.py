# accounts/views.py
from profile import Profile
from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.urls import reverse
from .models import ContactMessage
from rest_framework.generics import RetrieveUpdateAPIView

from .serializers import ChangePasswordSerializer, ContactMessageSerializer, ProfileSerializer, UserRegisterSerializer, LoginSerializer, LogoutUserSerializer, UserSerializer, PasswordResetRequestSerializer, SetNewPasswordSerializer
from .models import OneTimePassword, User
from .utils import send_code_to_user, send_reset_email, send_contact_notification, send_auto_reply

class RegisterUserView(GenericAPIView):
    serializer_class = UserRegisterSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        try:
            send_code_to_user(user.email)
        except Exception as e:
            return Response(
                {"message": f"Registration successful, but failed to send OTP: {str(e)}"},
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "email": user.email,
                "fullname": user.fullname,
                "message": "Registration successful! OTP sent to your email."
            },
            status=status.HTTP_201_CREATED
        )


class VerifyUserEmail(GenericAPIView):
    def post(self, request):
        code = request.data.get("otp")
        if not code:
            return Response({"error": "Verification code is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp_entry = OneTimePassword.objects.get(code=code)
        except OneTimePassword.DoesNotExist:
            return Response({"error": "Invalid verification code."}, status=status.HTTP_400_BAD_REQUEST)

        if otp_entry.is_expired():
            otp_entry.delete()
            return Response({"error": "Code has expired. Request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        user = otp_entry.user
        user.is_verified = True
        user.save()
        otp_entry.delete()

        return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)


class ResendOTPView(GenericAPIView):
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            OneTimePassword.objects.filter(user=user).delete()
            send_code_to_user(user.email)
            return Response({"message": "A new verification code has been sent."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

class LoginUserView(GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        return Response({
            "access_token": serializer.validated_data["access_token"],
            "refresh_token": serializer.validated_data["refresh_token"],
            "user": UserSerializer(user).data,
        }, status=status.HTTP_200_OK)


class LogoutUserView(GenericAPIView):
    serializer_class = LogoutUserSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)




class UserProfileView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        # Создаем профиль, если его нет
        if not hasattr(user, 'profile'):
            Profile.objects.create(user=user)
        return user
    def perform_update(self, serializer):
        print("Received data:", serializer.validated_data)  # Логируем входящие данные
        instance = serializer.save()
        print("Updated profile:", instance.profile.phone_number, instance.profile.gender)  # Логируем результат
        return instance


class PasswordResetRequestView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
            uidb64 = urlsafe_base64_encode(force_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)

            reset_url = f"http://localhost:5000/password-reset-confirm/{uidb64}/{token}"

            send_reset_email(email, reset_url)

            return Response({"message": "Reset link sent to your email."}, status=200)

        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=404)

        except Exception as e:
            return Response({"error": f"Failed to send reset email: {str(e)}"}, status=500)


class PasswordResetConfirm(GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        return Response({"uidb64": uidb64, "token": token}, status=200)


class SetNewPassword(GenericAPIView):
    serializer_class = SetNewPasswordSerializer
    permission_classes = [AllowAny]

    def patch(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"message": "Password reset successfully."}, status=200)
    
class ContactMessageView(GenericAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        ContactMessage.objects.create(**data)

        try:
            send_contact_notification(
                name=data['name'],
                email=data['email'],
                phone=data.get('phone'),
                message=data['message']
            )

            send_auto_reply(
                name=data['name'],
                to_email=data['email']
            )
        except Exception as e:
            return Response({
                "error": f"Message saved, but failed to send email: {str(e)}"
            }, status=500)

        return Response({"message": "Your message has been received."}, status=201)

class ChangePasswordView(GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        new_password = serializer.validated_data['new_password']
        
        user.set_password(new_password)
        user.save()
        
        # Опционально: инвалидируем все токены пользователя
        from rest_framework_simplejwt.tokens import OutstandingToken
        OutstandingToken.objects.filter(user=user).delete()
        
        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK
        )
    
