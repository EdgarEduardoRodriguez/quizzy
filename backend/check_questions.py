#!/usr/bin/env python
import os
import django
import sys

# Configurar Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quizapp.settings')
django.setup()

from users.models import Questionnaire, Cuestionario, Question, Option

def check_questions():
    print("=== CONSULTANDO PREGUNTAS GUARDADAS ===\n")

    # Mostrar todos los cuestionarios disponibles
    questionnaires = Questionnaire.objects.all()

    if not questionnaires.exists():
        print("❌ No hay cuestionarios en la base de datos")
        return

    print(f"📊 Total de cuestionarios: {questionnaires.count()}\n")

    for questionnaire in questionnaires:
        print(f"📋 Cuestionario: {questionnaire.title}")
        print(f"   ID: {questionnaire.id}")
        print(f"   Código de acceso: {questionnaire.access_code}")
        print(f"   Activo: {questionnaire.is_active}")
        print(f"   Pregunta actual: {questionnaire.current_question_index}")
        print()

        # Obtener sub-cuestionarios
        sub_cuestionarios = Cuestionario.objects.filter(questionnaire=questionnaire)

        if sub_cuestionarios.exists():
            print(f"   📁 Sub-cuestionarios ({sub_cuestionarios.count()}):")
            for sub_cuestionario in sub_cuestionarios:
                print(f"      • {sub_cuestionario.name}")
                sub_questions = Question.objects.filter(cuestionario=sub_cuestionario)
                if sub_questions.exists():
                    print(f"        Preguntas en '{sub_cuestionario.name}' ({sub_questions.count()}):")
                    for k, sub_q in enumerate(sub_questions, 1):
                        print(f"           {k}. {sub_q.text}")
                else:
                    print("        ❌ Sin preguntas")
            print()

        # Obtener preguntas del cuestionario principal
        questions = Question.objects.filter(questionnaire=questionnaire, cuestionario__isnull=True)

        if not questions.exists():
            print("   ❌ No hay preguntas guardadas directamente en este cuestionario")
        else:
            print(f"   ✅ Preguntas guardadas directamente ({questions.count()}):")
            print()

            for i, question in enumerate(questions, 1):
                print(f"   {i}. {question.text}")
                print(f"      Tipo: {question.question_type}")
                print(f"      Tiempo: {question.time}s" if question.time else "      Tiempo: Sin límite")

                # Mostrar opciones si es pregunta múltiple
                if question.question_type in ['multiple', 'questionnaire']:
                    options = Option.objects.filter(question=question)
                    if options.exists():
                        print("      Opciones:")
                        for j, option in enumerate(options, 1):
                            marker = "✅" if option.is_correct else "○"
                            print(f"         {chr(64+j)}) {option.text} {marker}")
                    else:
                        print("      ❌ Sin opciones guardadas")
                print()

if __name__ == '__main__':
    check_questions()
