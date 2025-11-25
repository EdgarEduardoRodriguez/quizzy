# Generated manually to rename table

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_question_option_questionnaire_question_questionnaire'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='questionnaire',
            table='users_quizzy',
        ),
    ]
