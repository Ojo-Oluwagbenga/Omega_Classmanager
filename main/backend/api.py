from django.shortcuts import render
from django.http import HttpResponse
from .utils import * 
from ..models import *
from .serializers import *  
import json
import io
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
import datetime 
import importlib
from django.views import View

def test(response):
    return render(response, "test.html", {})

class UserAPI(View):

    extraverify ={
        #itename:[minlen, maxlen, allowedtexts]
        'name':[4, 20, 'def'],
        'password':[4, 20, 'idef']
    }

    def create(self, response):
        if (response.method == "POST"):

            data =  json.loads(json.loads(response.body.decode('utf-8')).get('payload'))
            callresponse = { 
                'passed': True,
                'response':{},
                'error':{}
            }
            data['itemcode'] = 'dummy'

            x = datetime.datetime.now()
            data['date'] = x.strftime("%H") + ":"+ x.strftime("%M") +" on "+ x.strftime("%A") +", "+ x.strftime("%d") +"-"+ x.strftime("%b") +"-"+ x.strftime("%Y")
            
            sl = ModelSL(data=data, model=User, extraverify=self.extraverify)

            if (sl.is_valid()):
                callresponse = sl.callresponse
            else:
                callresponse = sl.cError()

            print(callresponse)
            if (callresponse['passed']):
                print('-----------------')
                print(sl.validated_data.get('email'))
                print('-----------------')
                if (not len(User.objects.filter(email=sl.validated_data.get('email'))) == 0):
                    callresponse['passed'] = False
                    callresponse['error']['email']=("The provided email is already registered with us")
                else:
                    ins_id = sl.save().__dict__['id']
                    itemcode = numberEncode(ins_id, 7)
                    sl.validated_data['itemcode'] = itemcode
                    sl.save()
                    
                    callresponse['response']['itemcode'] = itemcode
                    # init_user_session(response, itemcode)
            return HttpResponse(json.dumps(callresponse))
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")
    
    def update(self, response):
        if (response.method == "POST"):
            data =  json.loads(json.loads(response.body.decode('utf-8')).get('payload'))
            callresponse = self.subUpdate(self, data.get('updates'))
            return HttpResponse(json.dumps(callresponse))
        else:
            return HttpResponse("<div style='position: fixed; height: 100vhb ; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def subUpdate(self, updates):
        return APIgenerals.genUpdate(updates=updates, disallowed=[], model=User, extraverify=self.extraverify)

    def model():
        return User

    model = User

    def fetch(self, response):
        if (response.method == "POST"):
            data =  json.loads(json.loads(response.body.decode('utf-8')).get('payload', '{}'))
            
            ret = APIgenerals.get_model_data(model=self.model, columns=data.get('columns'), searches=data.get('searches'))
            

            return HttpResponse(json.dumps(ret))
        else:
            return HttpResponse("<div style='position: fixed; height: 100vhb ; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def delete(self, response):
        if (response.method == "POST"):
            data =  json.loads(json.loads(response.body.decode('utf-8')).get('payload'))

            ret = APIgenerals.delete_model_data(model=User, searches=data['searches'])
            return HttpResponse(json.dumps(ret))
        else:
            return HttpResponse("<div style='position: fixed; height: 100vhb ; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def validate(self, response):
        if (response.method == "POST"):
            data =  json.loads(json.loads(response.body.decode('utf-8')).get('payload'))

            callresponse = {
                'passed': True,
                'response':{},
                'error':{}
            }
            email = validateEntry(callresponse, data.get('email'), "Email", 0, 100, "def")
            password = validateEntry(callresponse, data.get('password'), "Password", 0, 100, "idef")
            
            user = User.objects.filter(email=email, password=password)

            if (callresponse['passed']):
                if (len(user) == 0 ):
                    callresponse['passed'] = False
                    callresponse['error']['general'] = ("User not found with the provided data")
                else:
                    callresponse['response']['message'] = ("User found")
                    callresponse['response']['itemcode'] = user[0].itemcode
                    
                    if (data.get('startSession') is not None):
                        if (data.get('startSession')):
                            init_user_session(response, user[0].itemcode)
                            callresponse['response']['message'] = ("User found and logged in")
            return HttpResponse(json.dumps(callresponse))
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")
