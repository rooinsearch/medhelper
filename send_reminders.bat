@echo off
cd /d C:\mylasttryproject
call venv\Scripts\activate.bat
python manage.py send_test_reminders >> reminders_log.txt 2>&1