from django.shortcuts import render
from django.http import HttpResponse
from .utils import * 
from ..models import *
from .serializers import *  
from .Recognition.Recog_api import Recognizer  
import json
import io
import datetime 
from django.views import View
import os
import cv2
import base64
import numpy as np
import qrcode

from PIL import Image


def test(response):
    return render(response, "test.html", {})

class APIgenerals:
    def genUpdate(**kwargs):
        newData = kwargs['updates']
        if (newData is None):
            newData = {}
            
        disallowed = kwargs['disallowed']
        #Ensure the id and the itemcode is not fetchable
        if ('id' not in disallowed):
            disallowed.append("id")
        if ('itemcode' not in disallowed):
            disallowed.append("itemcode")

        model = kwargs['model']
        extraverify = kwargs['extraverify']

        callresponse = {
            'passed': True,
            'response':{},
            'error':{}
        }
        selection = []

        for k,v in newData.items():
            if (k not in disallowed):
                selection.append(k)
                
        sl = ModelSL(data=newData, model=model, selection=selection, extraverify=extraverify)
        runcheck = sl.is_valid()
        callresponse = sl.callresponse
        if (runcheck):
            if (callresponse['passed'] and newData.get('itemcode')):
                callresponse = sl.cUpdate(newData.get('itemcode'), sl.validated_data)
                callresponse['response']['updates'] = sl.validated_data
            else:
                callresponse = {
                    'passed': False,
                    'response':{},
                    'error':{
                        'itemcode':"Item code not set"
                    }
                }
        else:
            callresponse = sl.cError()
        return callresponse

    def get_model_data(**kwargs):
        model = kwargs['model']
        searches = kwargs['searches']

        #pass '__all__' to callable
        columns = kwargs['columns']
        ret = []

        #Get all the field in the Model model
        callables = [f.name for f in model._meta.fields]

        if (type(searches) is dict or type(columns) is list):  
            if (columns == "__all__"): 
                columns = callables
            else:
                columns = list(set(callables).intersection(columns))


            # The star before the passed data is to unpack the data
            qset = model.objects.only(*columns).filter(**searches)


            for mod in qset:
                mod.__dict__.pop("_state")
                mod.__dict__.pop("id")
                ret.append(mod.__dict__)
        else:
            ret = {
                'searches': "This JSON field is required",
                'columns': "This List is required",
            }
        return ret

    def delete_model_data(**kwargs):
        model = kwargs['model']
        searches = kwargs['searches']

        ret = model.objects.filter(**searches).delete()

        return {
            'passed': True,
            'error':{},
            'message':ret,
        }


class UserAPI(View):

    extraverify ={
        #itename:[minlen, maxlen, allowedtexts]
        'name':[4, 20, 'def'],
        'password':[4, 20, 'idef']
    }


    def create(self, response):
        if (response.method == "POST"):

            data =  json.loads(response.body.decode('utf-8')).get('payload')

            callresponse = { 
                'passed': True,
                'response':{},
                'error':{}
            }
            data['itemcode'] = 'dummy'

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

class PaychannelAPI:
    model = PaymentChannel
    extraverify ={
        'name':[4, 20, 'def'],
    }

    def b64_to_cv2(base64_data):
        nparr = np.fromstring(base64_data.decode('base64'), np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_ANYCOLOR)

    def create(self, response):
        if (response.method == "POST"):
            data =  json.loads(response.body.decode('utf-8')).get('payload')

            # leave the b64s to save into db BY LEAVING THIS SECTION or write them to file if possible
            imgs_b64_collect = data['imageset']
            data['imageset'] = {
                "xs": "tets",
                "nod":{
                    "n_node":"yellow"
                }
            }

            data['creatorid'] = "cidofrep"


            # Writing to file
            # imgsetstring = data['imageset']
            # keys = list(imgsetstring.keys())

            # ledata = imgsetstring[keys[0]][0]

            # ledata = ledata.replace('data:image/jpeg;base64,', '')
            # imgdata = base64.b64decode(ledata)
            # filename = 'some_image.jpg'  # I assume you have a way of picking unique filenames
            # with open(filename, 'wb') as f:
            #         f.write(imgdata)


            callresponse = {
                'passed': True,
                'response':{},
                'error':{}
            }
            data['itemcode'] = 'dummy'

            # Collect the time in the digits value if has_deadline
            # x = datetime.datetime.now()
            # data['date'] = x.strftime("%H") + ":"+ x.strftime("%M") +" on "+ x.strftime("%A") +", "+ x.strftime("%d") +"-"+ x.strftime("%b") +"-"+ x.strftime("%Y")
            

            sl = ModelSL(data=data, model=PaymentChannel, extraverify=self.extraverify)

            if (sl.is_valid()):
                callresponse = sl.callresponse
            else:
                callresponse = sl.cError()

            if (callresponse['passed']):
                ins_id = sl.save().__dict__['id']
                sl.validated_data['itemcode'] = numberEncode(ins_id, 8)
                sl.save()
                callresponse['response']['itemcode'] = sl.validated_data['itemcode']
                    
            return HttpResponse(json.dumps(callresponse))

        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")
    
    def fetch(self, response):
        if (response.method == "POST"):
            data =  json.loads(response.body.decode('utf-8')).get('payload', '{}')
            
            ret = APIgenerals.get_model_data(model=self.model, columns=data.get('columns'), searches=data.get('searches'))
            
            return HttpResponse(json.dumps(ret))
        else:
            return HttpResponse("<div style='position: fixed; height: 100vhb ; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def testupdate(self, response):
        if (response.method == "POST"):
            # data =  json.loads(response.body.decode('utf-8')).get('payload', '{}')
            

            # thing = PaymentChannel.objects.get(id=3) 
            # thing.imageset['nod']['n_node'] = 'green'
            # thing.save()

            thing = PaymentChannel.objects.filter(id__gt=1).values()
            # thing.pop("_state")
            print (list(thing))
            ret = []

            ret.append(list(thing))
            # print (dir(thing))
            # thing.imageset['nod']['n_node'] = 'blue'
            # thing.save()

            # # ret = APIgenerals.get_model_data(model=self.model, columns=data.get('columns'), searches=data.get('searches'))
            
            # print (dir(thing))
            return HttpResponse(json.dumps(ret))
        else:
            return HttpResponse("<div style='position: fixed; height: 100vhb ; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

class AttendanceAPI:
 
    extraverify={ 
        
    }
    def create(self, response):
        if (response.method == "POST"):  
            data =  json.loads(response.body.decode('utf-8')).get('payload')

            # Collect the time in the digits value if has_deadline
            x = datetime.datetime.now()
            # mdate = x.strftime("%H") + ":"+ x.strftime("%M") +" on "+ x.strftime("%A") +", "+ x.strftime("%d") +"-"+ x.strftime("%b") +"-"+ x.strftime("%Y")
            mdate = x.strftime("%H") + ":"+ x.strftime("%M") +" on "+ x.strftime("%A") +", "+ x.strftime("%d") +"-"+ x.strftime("%b")
            
            data['attendance_code'] = "init" 
            data['status'] = "0" 
            data['attendance_data'] = {
                "marked_users":{
                    data['creatorid']:{
                        "user_code":data['creatorid'],      
                        "time":mdate,
                        "parent_opener":'base',
                        "opened_count":0,
                    }
                },
            }
 
            sl = ModelSL(data=data, model=Attendance, extraverify=self.extraverify)

            if (sl.is_valid()):
                callresponse = sl.callresponse
                if data["notify"] == 'true':
                    pass
                    # Send Notification to all the seleceted members;
                
            else:
                callresponse = sl.cError()

            if (callresponse['passed']):
                ins_id = sl.save().__dict__['id']
                sl.validated_data['attendance_code'] = numberEncode(ins_id, 5)
                sl.save()
                callresponse['response']['attendance_code'] = sl.validated_data['attendance_code']
                    
            return HttpResponse(json.dumps(callresponse))

        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")
    
    def test(self, response):
        if (response.method == "POST"):  
            data =  json.loads(response.body.decode('utf-8')).get('payload')
            
            # thing = PaymentChannel.objects.filter(id__gt=1).values()
            # # thing.pop("_state")
            # print (list(thing))
            # ret = []

            # ret.append(list(thing))
            # # print (dir(thing))
            # # thing.imageset['nod']['n_node'] = 'blue'
            # # thing.save()

            # # # ret = APIgenerals.get_model_data(model=self.model, columns=data.get('columns'), searches=data.get('searches'))
                
            # # print (dir(thing))

            callresponse = {
                'passed': True,
                'response':{},
                'error':{}
            }

            # sl = ModelSL(data=data, model=Attendance, extraverify=self.extraverify)

            # if (sl.is_valid()):
            #     callresponse = sl.callresponse
            # else:
            #     callresponse = sl.cError()

            # if (callresponse['passed']):
            #     ins_id = sl.save().__dict__['id']
            #     sl.validated_data['itemcode'] = numberEncode(ins_id, 8)
            #     sl.save()
            #     callresponse['response']['itemcode'] = sl.validated_data['itemcode']

            thing = Attendance.objects.get(id=1)
            print (thing)

            print()
            print(thing.attendance_data['first'][0]['name'])
            thing.save()

            thing = Attendance.objects.filter(id__gt=1).values()

            return HttpResponse(json.dumps('thing')) 

        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def fetchqr(self, response):
        if (response.method == "POST"):  
            data =  json.loads(response.body.decode('utf-8')).get('payload')

            attendance_code = data['attendance_code']
            user_code = data['user_code']

            query = {
                # 'attendance_data__marked_users__'+user_code+'__user_code': user_code,
                'attendance_code':attendance_code
            }

            print('query', query)

            attd = Attendance.objects.filter(**query)
            print(attd)

            if not attd:
                callresponse = {
                    'passed': False,
                    'response':201,
                    'error':"User has not marked or does not exist"
                }
                return HttpResponse(json.dumps(callresponse))            

            attd = attd[0]

            print(attd)
            inicount = attd.attendance_data['marked_users'][user_code]['opened_count'] 
            inicount = int(inicount) + 1           
            attd.attendance_data['marked_users'][user_code]['opened_count'] = inicount
            # attd.save()



            # Be like uen-scd-1|2
            stringbase = attendance_code + "-" + user_code + "-" + str(inicount) + "|"
            imageset = []
            for x in range(20):
                stringname = stringbase + str(x)
                img = qrcode.make(stringname)
                buffered = io.BytesIO()
                img.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue())

                img_base64 = bytes("data:image/jpeg;base64,", encoding='utf-8') + img_str

                # return  HttpResponse([img_base64])
                # img_base64 = str(img_base64)

                imageset.append(img_base64.decode())        


            # print(img_base64)
            callresponse = {
                'passed': True,
                'response':200,
                'image_set':imageset
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def mark(self, response):
        if (response.method == "POST"):  
            data =  json.loads(response.body.decode('utf-8')).get('payload')
            b64img = data['img']
            user_code = data['img']
            attendance_code = data['img']
            b64img = data['img']

            # Convert the b64 image to np Image (Face Rec Uses Numpy)
            b64img = b64img.replace('data:image/jpeg;base64,', '')

            im_bytes = base64.b64decode(b64img)
            im_arr = np.frombuffer(im_bytes, dtype=np.uint8)  # im_arr is one-dim Numpy array
            img_cv2 = cv2.imdecode(im_arr, flags=cv2.IMREAD_COLOR)
            
            
            ret = Recognizer.comparefaces(img_cv2, img_cv2)

            
            path = os.getcwd()+"/main/static/interpolimages/"+'loggedinuser'

            # # create user edit folder if it doesnt exist
            # if not os.path.isdir(path):
            #     os.mkdir(path)

            print (path)
            
            return HttpResponse(json.dumps(ret))
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")
    
    def fetchforhome(self, response):
        if (response.method == "POST"):  
            user_code =  json.loads(response.body.decode('utf-8')).get('loggeduser', '')
            # You should normally get the loggedin user from here sef

            class_code = "sss"

            

            query = {
                'classes__contains': ["CRM605"]
            }


            attds = Attendance.objects.filter(**query)
            print (attds)          

            if (attds.count == 0):
                callresponse = {
                    'passed': True,
                    'response':200,
                    'attendances':[],
                }
                return HttpResponse(json.dumps(callresponse))            


            retpack = []
            for attd in attds:
                mono = {
                    "course_code":attd.course_code,
                    "time":attd.time,
                    "status":attd.status,
                    "attendance_code":attd.attendance_code,
                }
                retpack.append(mono)


            callresponse = {
                'passed': True,
                'response':200,
                'attendances':retpack
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def genfetch(self, response):
        if (response.method == "POST"):  
            
            fetchpair =  json.loads(response.body.decode('utf-8')).get('fetchpair', '')
            fetchset =  json.loads(response.body.decode('utf-8')).get('fetchset', '')
            # You should normally get the loggedin user from here sef
            # ensure to 
            # del fetchpair['id']

            query = fetchpair

            attds = Attendance.objects.values(*fetchset).filter(**query)

            retpack = [*attds]         


            callresponse = {
                'passed': True,
                'response':200,
                'queryset':retpack
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")


    def activateattendance(self, response):
        if (response.method == "POST"):  
            attendance_code =  json.loads(response.body.decode('utf-8')).get('attendance_code', '')
            user_code =  json.loads(response.body.decode('utf-8')).get('user_code', '')
            # You should normally get the loggedin user from here sef

            # if(loggeduser owns teh attendace)
            # continue

            user_code = 'loggeduser'
            
             
            
            query = {
                'attendance_code': attendance_code,
                'creatorid': user_code
            }

             

            attds = Attendance.objects.filter(**query)

            if not attds:
                callresponse = {
                    'passed': True,
                    'response':201,
                    'Message':"Attendance does not exist",
                }
                return HttpResponse(json.dumps(callresponse))      

            attd = attds[0]
            attd.status = 1
            attd.save()            


            callresponse = {
                'passed': True,
                'response':200,
                'attendances':attendance_code
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

