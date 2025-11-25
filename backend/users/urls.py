from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'questionnaires', views.QuestionnaireViewSet)
router.register(r'saved-questionnaires', views.SavedQuestionnaireViewSet)

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('', include(router.urls)),
]
