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
    question_set = QuestionSerializer(many=True, read_only=True, source='questions')

    class Meta:
        model = Cuestionario
        fields = ['id', 'name', 'question_set']

class QuestionnaireSerializer(serializers.ModelSerializer):
    cuestionarios = CuestionarioSerializer(many=True, read_only=True)
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Questionnaire
        fields = ['id', 'title', 'description', 'created_at', 'cuestionarios', 'questions']

    def get_questions(self, obj):
        questions = []
        for cuestionario in obj.cuestionarios.all():
            questions.extend(cuestionario.question_set.all())
        # Also include questions not in any cuestionario
        questions.extend(obj.questions.filter(cuestionario__isnull=True))
        return QuestionSerializer(questions, many=True).data
