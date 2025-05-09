# В management/commands/cleanup_otps.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import OneTimePassword

class Command(BaseCommand):
    help = 'Deletes expired OTP codes (older than 5 minutes)'

    def handle(self, *args, **options):
        expired = OneTimePassword.objects.filter(
            created_at__lt=timezone.now() - timezone.timedelta(minutes=5)
        ).delete()
        self.stdout.write(f"Deleted {expired[0]} expired OTPs")