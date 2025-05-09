from datetime import datetime


def format_datetime(dt: datetime | None) -> str:
    """
    Преобразует дату в формат 'дд.мм.гггг чч:мм' или возвращает сообщение-заглушку.
    """
    return dt.strftime('%d.%m.%Y %H:%M') if dt else 'уточните дату приёма'


def format_payment_email(user, analysis, lab, test_date):
    """
    Подтверждение записи на анализ
    """
    date_str = format_datetime(test_date)
    lab_name = lab.name if lab else 'неизвестную лабораторию'

    return (
        f"Здравствуйте, {user.fullname}!\n\n"
        f"Вы успешно записались на анализ «{analysis.title}» в {lab_name} на {date_str}.\n"
        f"\nСпасибо, что выбрали MedHelper!"
    )


def format_reminder_email(user, analysis, lab, test_date):
    """
    Напоминание о записи на анализ
    """
    date_str = format_datetime(test_date)
    lab_name = lab.name if lab else 'неизвестную лабораторию'

    return (
        f"Здравствуйте, {user.fullname}!\n\n"
        f"Напоминаем, что вы записаны на анализ «{analysis.title}» в {lab_name}.\n"
        f"Дата и время: {date_str}.\n\n"
        f"Пожалуйста, приходите вовремя."
    )


def format_result_ready_email(user, analysis, lab, test_date):
    """
    Уведомление о готовности результатов анализа
    """
    date_str = format_datetime(test_date)
    lab_name = lab.name if lab else 'лабораторию'

    return (
        f"Здравствуйте, {user.fullname}!\n\n"
        f"Результаты по анализу «{analysis.title}» в {lab_name} готовы.\n"
        f"Дата сдачи: {date_str}.\n\n"
        f"Вы можете ознакомиться с ними в системе MedHelper."
    )

def format_rejected_email(user, analysis, lab, test_date):
    """
    Уведомление об отклонении анализа
    """
    date_str = format_datetime(test_date)
    lab_name = lab.name if lab else 'лабораторию'

    return (
        f"Здравствуйте, {user.fullname}!\n\n"
        f"К сожалению, ваш анализ «{analysis.title}» в {lab_name} был отклонён.\n"
        f"Дата записи: {date_str}.\n\n"
        f"Пожалуйста, свяжитесь с лабораторией для уточнения причин."
    )
