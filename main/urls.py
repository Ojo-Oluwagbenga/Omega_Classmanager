from django.urls import path
from . import views

urlpatterns = [
    path("test", views.testpage, name="testpage"), 
    path("camtest", views.camtest, name="camtest"),
    path("signup", views.signup, name="signup"),
    path("dashboard", views.dashboard, name="signup"),
    path("edittimetable", views.edittimetable, name="edittimetable"),
    path("account", views.account, name="account"),
    path("attendance_data", views.attendance_data, name="attendance_data"),
    path("notifications", views.notifications, name="notifications"),
    path("payout/<str:pay_code>", views.payout, name="payout"),
    path("classdata/<str:classcode_day_dclcode>", views.classdata, name="classdata"),
    path("createchannel", views.createchannel, name="createchannel"),
    path("takeattendance", views.takeattendance, name="takeattendance"),
    path("createattendance", views.createattendance, name="createattendance"),
    path("initiateattendance/<str:attendance_code>", views.initiateattendance, name="initiateattendance"),
]