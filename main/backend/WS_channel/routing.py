from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/chat/subscribe/<slug:group_name>', consumers.ChatConsumer.as_asgi()),
    path('ws/notification/subscribe/<slug:class_code>/<slug:user_code>', consumers.NotiConsumer.as_asgi()),
] 