from django.urls import path
from . import views

urlpatterns = [
    path("login", views.login, name="login"),
    path("signup", views.signup, name="signup"),

    path("createattendance", views.createattendance, name="createattendance"),
    path("initiateattendance/<str:attendance_code>", views.initiateattendance, name="initiateattendance"),
    path("attendance_data/<str:attendance_code>", views.attendance_data, name="attendance_data"),
    path("takeattendance", views.takeattendance, name="takeattendance"),

    path("createchannel", views.createchannel, name="createchannel"),
    path("payout/<str:pay_code>", views.payout, name="payout"),
    
    path("camtest", views.camtest, name="camtest"),
    path("changeface", views.changeface, name="changeface"),
    
    path("classdata/<str:classcode_day_dclcode>", views.classdata, name="classdata"),
    path("edittimetable", views.edittimetable, name="edittimetable"),
    
    path("dashboard", views.dashboard, name="signup"),
    path("account", views.account, name="account"),
    
    path("notifications", views.notifications, name="notifications"),
    path("createnotification", views.createnotification, name="createnotification"),
    
    path("test", views.testpage, name="testpage"), 
]