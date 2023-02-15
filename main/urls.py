from django.urls import path
from . import views

urlpatterns = [
    path("test", views.testpage, name="testpage"), 
    path("camtest", views.camtest, name="camtest"),
    path("signup", views.signup, name="signup"),
    path("dashboard", views.dashboard, name="signup"),
    path("payout", views.payout, name="payout"),
    path("createchannel", views.createchannel, name="createchannel"),
    path("takeattendance", views.takeattendance, name="takeattendance"),
    path("createattendance", views.createattendance, name="createattendance"),
    path("initiateattendance/<str:attendance_code>", views.initiateattendance, name="initiateattendance"),
]