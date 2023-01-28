from django.urls import path
from . import api
from . import apimanager

urlpatterns = [
    # path("test", api.test, name="welcome"),
    
    path('<str:apiclass>/<str:apimethod>', apimanager.Manager.manager, name='manager')

]