@echo off
echo Configurando backend Django + MySQL...

REM Crear directorio backend separado
mkdir backend
cd backend

REM Instalar dependencias
pip install django djangorestframework mysqlclient django-cors-headers

REM Crear proyecto Django
python -m django startproject quizapp .
python manage.py startapp users

REM Crear archivos básicos
echo Creando archivos de configuración...

REM settings.py
echo import os > quizapp\settings.py
echo. >> quizapp\settings.py
echo BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) >> quizapp\settings.py
echo SECRET_KEY = 'django-insecure-tu-clave-secreta' >> quizapp\settings.py
echo DEBUG = True >> quizapp\settings.py
echo ALLOWED_HOSTS = ['localhost', '127.0.0.1'] >> quizapp\settings.py
echo. >> quizapp\settings.py
echo INSTALLED_APPS = [ >> quizapp\settings.py
echo     'django.contrib.admin', >> quizapp\settings.py
echo     'django.contrib.auth', >> quizapp\settings.py
echo     'django.contrib.contenttypes', >> quizapp\settings.py
echo     'django.contrib.sessions', >> quizapp\settings.py
echo     'django.contrib.messages', >> quizapp\settings.py
echo     'django.contrib.staticfiles', >> quizapp\settings.py
echo     'rest_framework', >> quizapp\settings.py
echo     'corsheaders', >> quizapp\settings.py
echo     'users', >> quizapp\settings.py
echo ] >> quizapp\settings.py
echo. >> quizapp\settings.py
echo MIDDLEWARE = [ >> quizapp\settings.py
echo     'django.middleware.security.SecurityMiddleware', >> quizapp\settings.py
echo     'django.contrib.sessions.middleware.SessionMiddleware', >> quizapp\settings.py
echo     'corsheaders.middleware.CorsMiddleware', >> quizapp\settings.py
echo     'django.middleware.common.CommonMiddleware', >> quizapp\settings.py
echo     'django.middleware.csrf.CsrfViewMiddleware', >> quizapp\settings.py
echo     'django.contrib.auth.middleware.AuthenticationMiddleware', >> quizapp\settings.py
echo     'django.contrib.messages.middleware.MessageMiddleware', >> quizapp\settings.py
echo     'django.middleware.clickjacking.XFrameOptionsMiddleware', >> quizapp\settings.py
echo ] >> quizapp\settings.py
echo. >> quizapp\settings.py
echo DATABASES = { >> quizapp\settings.py
echo     'default': { >> quizapp\settings.py
echo         'ENGINE': 'django.db.backends.mysql', >> quizapp\settings.py
echo         'NAME': 'quizapp_db', >> quizapp\settings.py
echo         'USER': 'root', >> quizapp\settings.py
echo         'PASSWORD': '', >> quizapp\settings.py
echo         'HOST': 'localhost', >> quizapp\settings.py
echo         'PORT': '3306', >> quizapp\settings.py
echo     } >> quizapp\settings.py
echo } >> quizapp\settings.py
echo. >> quizapp\settings.py
echo AUTH_USER_MODEL = 'users.CustomUser' >> quizapp\settings.py
echo. >> quizapp\settings.py
echo CORS_ALLOWED_ORIGINS = [ >> quizapp\settings.py
echo     "http://localhost:4200", >> quizapp\settings.py
echo ] >> quizapp\settings.py
echo CORS_ALLOW_CREDENTIALS = True >> quizapp\settings.py

REM models.py
echo from django.db import models > users\models.py
echo from django.contrib.auth.models import AbstractUser >> users\models.py
echo. >> users\models.py
echo class CustomUser(AbstractUser): >> users\models.py
echo     email = models.EmailField(unique=True) >> users\models.py
echo     first_name = models.CharField(max_length=30) >> users\models.py
echo     last_name = models.CharField(max_length=30) >> users\models.py
echo     created_at = models.DateTimeField(auto_now_add=True) >> users\models.py
echo     updated_at = models.DateTimeField(auto_now=True) >> users\models.py
echo. >> users\models.py
echo     USERNAME_FIELD = 'email' >> users\models.py
echo     REQUIRED_FIELDS = ['first_name', 'last_name'] >> users\models.py
echo. >> users\models.py
echo     def __str__(self): >> users\models.py
echo         return f"{self.first_name} {self.last_name}" >> users\models.py

REM views.py
echo from rest_framework import status > users\views.py
echo from rest_framework.decorators import api_view >> users\views.py
echo from rest_framework.response import Response >> users\views.py
echo from django.contrib.auth import authenticate, login >> users\views.py
echo from .models import CustomUser >> users\views.py
echo. >> users\views.py
echo @api_view(['POST']) >> users\views.py
echo def register_user(request): >> users\views.py
echo     if request.method == 'POST': >> users\views.py
echo         data = request.data >> users\views.py
echo         try: >> users\views.py
echo             if CustomUser.objects.filter(email=data['email']).exists(): >> users\views.py
echo                 return Response({'error': 'Email ya registrado'}, status=status.HTTP_400_BAD_REQUEST) >> users\views.py
echo             user = CustomUser.objects.create_user( >> users\views.py
echo                 email=data['email'], password=data['password'], >> users\views.py
echo                 first_name=data['first_name'], last_name=data['last_name'] >> users\views.py
echo             ) >> users\views.py
echo             return Response({'message': 'Usuario registrado', 'user_id': user.id}, status=status.HTTP_201_CREATED) >> users\views.py
echo         except Exception as e: >> users\views.py
echo             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST) >> users\views.py
echo. >> users\views.py
echo @api_view(['POST']) >> users\views.py
echo def login_user(request): >> users\views.py
echo     if request.method == 'POST': >> users\views.py
echo         data = request.data >> users\views.py
echo         user = authenticate(email=data['email'], password=data['password']) >> users\views.py
echo         if user is not None: >> users\views.py
echo             login(request, user) >> users\views.py
echo             return Response({ >> users\views.py
echo                 'message': 'Login exitoso', >> users\views.py
echo                 'user': {'id': user.id, 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name} >> users\views.py
echo             }) >> users\views.py
echo         else: >> users\views.py
echo             return Response({'error': 'Credenciales invalidas'}, status=status.HTTP_401_UNAUTHORIZED) >> users\views.py

REM urls.py
echo from django.urls import path > users\urls.py
echo from . import views >> users\urls.py
echo urlpatterns = [ >> users\urls.py
echo     path('register/', views.register_user, name='register'), >> users\urls.py
echo     path('login/', views.login_user, name='login'), >> users\urls.py
echo ] >> users\urls.py

echo from django.contrib import admin > quizapp\urls.py
echo from django.urls import path, include >> quizapp\urls.py
echo urlpatterns = [ >> quizapp\urls.py
echo     path('admin/', admin.site.urls), >> quizapp\urls.py
echo     path('api/', include('users.urls')), >> quizapp\urls.py
echo ] >> quizapp\urls.py

REM Crear __init__.py
echo. > users\__init__.py

REM Ejecutar migraciones
python manage.py makemigrations
python manage.py migrate

echo.
echo ¡Backend Django configurado exitosamente!
echo.
echo Para crear superusuario: python manage.py createsuperuser
echo Para iniciar servidor: python manage.py runserver
echo.
