from django.urls import path
from . import views

urlpatterns = [
    path("", views.testpage, name="testpage"),
    path("signup", views.signup, name="signup"),
    path("dashboard", views.dashboard, name="signup"),
]