from rest_framework import serializers
from .models import Questionnaire, Cuestionario, Question, Option

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'description', 'question_type', 'time', 'allow_multiple', 'max_options', 'options']

class CuestionarioSerializer(serializers.ModelSerializer):
    question_set = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Cuestionario
        fields = ['id', 'name', 'question_set']

class QuestionnaireSerializer(serializers.ModelSerializer):
    cuestionarios = CuestionarioSerializer(many=True, read_only=True)
    active_cuestionario = CuestionarioSerializer(read_only=True)
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Questionnaire
        fields = ['id', 'title', 'description', 'created_at', 'access_code', 'is_active', 'current_question_index', 'active_cuestionario', 'cuestionarios', 'questions']

    def get_questions(self, obj):
        # Solo devolver preguntas que pertenecen directamente al cuestionario (no en ningún cuestionario)
        return QuestionSerializer(obj.questions.filter(cuestionario__isnull=True), many=True).data
