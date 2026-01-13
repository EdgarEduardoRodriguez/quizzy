from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        # Establecer username como email para evitar conflictos
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        # Para desarrollo, guardar contraseña sin hash (NO RECOMENDADO PARA PRODUCCIÓN)
        if password:
            user.password = password  # Guardar como texto plano
        else:
            user.password = ''
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Questionnaire(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    access_code = models.CharField(max_length=8, unique=True, blank=True, null=True)
    is_active = models.BooleanField(default=False)  # Para controlar si el quiz está activo
    current_question_index = models.IntegerField(null=True, blank=True)  # Índice de la pregunta actual mostrada
    active_cuestionario = models.ForeignKey('Cuestionario', on_delete=models.SET_NULL, null=True, blank=True, related_name='active_questionnaires')  # Sub-cuestionario activo

    class Meta:
        db_table = 'users_quizzy'

    def save(self, *args, **kwargs):
        if not self.access_code:
            self.access_code = self.generate_unique_code()
        super().save(*args, **kwargs)

    def generate_unique_code(self):
        import random
        import string
        while True:
            # Generar código de 6 caracteres: 3 letras + 3 números
            letters = ''.join(random.choice(string.ascii_uppercase) for _ in range(3))
            numbers = ''.join(random.choice(string.digits) for _ in range(3))
            code = letters + numbers
            if not Questionnaire.objects.filter(access_code=code).exists():
                return code

    def __str__(self):
        return f"{self.title} ({self.access_code})"

class Cuestionario(models.Model):
    name = models.CharField(max_length=50)
    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.CASCADE, related_name='cuestionarios')

    class Meta:
        db_table = 'cuestionarios'

    def __str__(self):
        return self.name

class Question(models.Model):
    QUESTION_TYPES = [
        ('multiple', 'Opción múltiple'),
        ('abierta', 'Pregunta abierta'),
        ('cuestionario', 'Cuestionario'),
    ]

    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.CASCADE, related_name='questions', null=True, blank=True)
    cuestionario = models.ForeignKey(Cuestionario, on_delete=models.CASCADE, null=True, blank=True)
    text = models.TextField()
    description = models.TextField(blank=True)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    time = models.IntegerField(null=True, blank=True)  # Tiempo en segundos
    allow_multiple = models.BooleanField(default=False)
    max_options = models.IntegerField(default=1)

    def __str__(self):
        return self.text[:50]

class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text
