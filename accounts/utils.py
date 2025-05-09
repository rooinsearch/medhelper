# accounts/utils.py
import random
import requests
from django.conf import settings
from .models import User, OneTimePassword

def generateOtp():
    return ''.join(str(random.randint(0, 9)) for _ in range(6))

def send_code_to_user(email):
    otp_code = generateOtp()
    user = User.objects.get(email=email)

    # Обновить или создать OTP
    OneTimePassword.objects.update_or_create(user=user, defaults={'code': otp_code})

    subject = "Your OTP Code"
    body = f"""
    Hi {user.fullname},

    Your verification code is: {otp_code}

    This code is valid for 5 minutes.

    If you didn’t request this, just ignore this message.
    """

    response = requests.post(
        f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages",
        auth=("api", settings.MAILGUN_API_KEY),
        data={
            "from": settings.MAILGUN_FROM_EMAIL,
            "to": [user.email],
            "subject": subject,
            "text": body,
        }
    )

    if response.status_code != 200:
        raise Exception(f"Mailgun API error: {response.text}")


def send_reset_email(to_email, reset_url):
    subject = "Reset your password"
    body = f"""
    Hi 👋,

    We received a request to reset your password.
    Click the link below to set a new password:

    {reset_url}

    If you didn't request this, please ignore this email.
    """

    response = requests.post(
        f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages",
        auth=("api", settings.MAILGUN_API_KEY),
        data={
            "from": settings.MAILGUN_FROM_EMAIL,
            "to": [to_email],
            "subject": subject,
            "text": body,
        }
    )

    if response.status_code != 200:
        raise Exception(f"Mailgun error: {response.text}")
    

def send_contact_notification(name, email, phone, message):
    body = f"""
    New message received via Contact Form:

    Name: {name}
    Email: {email}
    Phone: {phone or "N/A"}

    Message:
    {message}
    """

    response = requests.post(
        f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages",
        auth=("api", settings.MAILGUN_API_KEY),
        data={
            "from": settings.MAILGUN_FROM_EMAIL,
            "to": [settings.CONTACT_RECEIVER_EMAIL],
            "subject": f"New Contact Message from {name}",
            "text": body,
        }
    )

    if response.status_code != 200:
        raise Exception(f"Mailgun error: {response.text}")

def send_auto_reply(name, to_email):
    subject = "We received your message"
    body = f"""
    Hi {name},

    Thank you for contacting us!
    We’ve received your message and will get back to you as soon as possible.

    With care,
    MedHelper Team
    """

    response = requests.post(
        f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages",
        auth=("api", settings.MAILGUN_API_KEY),
        data={
            "from": settings.MAILGUN_FROM_EMAIL,
            "to": [to_email],
            "subject": subject,
            "text": body,
        }
    )

    if response.status_code != 200:
        raise Exception(f"Mailgun auto-reply error: {response.text}")
    
