import json
from channels.generic.websocket import AsyncWebsocketConsumer
# from ..models import *
# from channels.db import database_sync_to_async
from ..api import *


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "name_of_unknown_use_lol"
        self.room_group_name = self.scope['url_route']['kwargs']['group_name']

        print(self.channel_name)

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        message = text_data

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'mono_disburse',
                'message': message
            }
        )

    # Share the group message to all subscribed clients
    async def mono_disburse(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))

class NotiConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "name_of_unknown_use_lol"
        user_code = self.scope['url_route']['kwargs']['user_code']
        class_code = self.scope['url_route']['kwargs']['class_code']
        

        prepended = "NOTIF_LISTENER_"
        
        self.allusergroup = prepended + "__all__" 
        self.classgroup = prepended + "__"+class_code+"__" 
        self.usergroup = prepended + "__"+user_code+"__" 

        print(self.allusergroup, self.classgroup, self.usergroup)

        print(self.channel_name)
        

        await self.channel_layer.group_add(
            self.allusergroup,
            self.channel_name
        )
        await self.channel_layer.group_add(
            self.classgroup, 
            self.channel_name
        )
        await self.channel_layer.group_add(
            self.usergroup,
            self.channel_name
        )
        await self.accept()

        

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.allusergroup,
            self.channel_name
        )
        await self.channel_layer.group_discard(
            self.classgroup,
            self.channel_name
        )
        await self.channel_layer.group_discard(
            self.usergroup,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        message = text_data       

        # Send message to room group
        await self.channel_layer.group_send(
            self.allusergroup,
            {
                'type': 'mono_disburse',
                'message': message
            }
        )

    # Share the group message to all subscribed clients
    async def mono_disburse(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))

