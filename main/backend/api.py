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
from pyzbar.pyzbar import decode
from pyzbar.pyzbar import ZBarSymbol
import base64
import numpy as np
import qrcode


from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from PIL import Image
from django.db.models import Q


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

    def generalFetch(**kwargs):
        model = kwargs['model']
        fetchset = kwargs['fetchset']
        fetchpair = kwargs['fetchpair']

        disallowed = kwargs.get('disallowed', ['id'])

        for x in disallowed:
            if x in fetchset:
                fetchset.remove(x)

        datas = model.objects.values(*fetchset).filter(**fetchpair)

        return [*datas]

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
            
            # Verify Data here Boss

            callresponse = { 
                'passed': True,
                'response':data,
                'error':{}
            }
            return (HttpResponse(json.dumps(callresponse)))
            
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
            data =  json.loads(response.body.decode('utf-8')).get('payload')

            callresponse = {
                'passed': True,
                'response':{},
                'error':{}
            }

            unique = validateEntry(callresponse, data.get('uniqueid'), "Uniqueid", 0, 100, "def")
            password = validateEntry(callresponse, data.get('password'), "Password", 0, 100, "idef")
            
            user = User.objects.filter(Q(email=unique) | Q(matric=unique), password=password)

            if (callresponse['passed']):
                if (len(user) == 0 ):
                    callresponse['passed'] = False
                    callresponse["Message"] = "User not found with the provided data"
                else:
                    callresponse['Message'] = "User found"
                    callresponse['response'] = user[0].itemcode
                    
                    if (data.get('startSession') is not None):
                        if (data.get('startSession')):
                            init_user_session(response, user[0].itemcode)
                            callresponse['response']['message'] = ("User found and logged in")

            return HttpResponse(json.dumps(callresponse))
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

class PaychannelAPI:
    model = PaymentChannel

    extraverify = {
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
                        
            fetchpair =  json.loads(response.body.decode('utf-8')).get('fetchpair', {})
            fetchset =  json.loads(response.body.decode('utf-8')).get('fetchset', [])

                     
            retpack = APIgenerals.generalFetch(model=PaymentChannel, fetchset=fetchset, fetchpair=fetchpair)        
            # return HttpResponse(json.dumps('ret'))   

            callresponse = {
                'passed': True,
                'response':200,
                'queryset':retpack
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

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

    def add_pay_comment(self, response):
        if (response.method == "POST"):
            data =  json.loads(response.body.decode('utf-8')).get('payload', '{}')

            text = payload['text']
            parent = payload['text']
            

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

            data['description'] = '-' if data['description'] == "" else data['description']
            data['attendance_code'] = "init" 
            data['status'] = "0" 
            data['attendance_data'] = {
                "mark_index":0,
                "marked_users_0":{
                    "poll_base_data":{
                        "time":data["time"],
                        "time_activated":'',
                        "time_closed":'',
                        "time_queued":data["time"],
                        "creator":data['creatorid'],
                    },
                    data['creatorid']:{
                        "user_code":data['creatorid'], 
                        "parent_opener":'base', #The person that generated the code for the user
                        "opened_count":0, #The total number of people this has opened for
                    }
                },
            }
 
            sl = ModelSL(data=data, model=Attendance, extraverify=self.extraverify)

            if (sl.is_valid()):
                callresponse = sl.callresponse

            else:
                callresponse = sl.cError()

            if (callresponse['passed']):
                ins_id = sl.save().__dict__['id']
                sl.validated_data['attendance_code'] = numberEncode(ins_id, 5)
                sl.save()
                callresponse['response']['attendance_code'] = sl.validated_data['attendance_code']

                url = 'the_url_here'
                NotificationAPI.send({
                    "callback_url":url,
                    "text":"Attendance poll created for " + data['course_code'] + " Coming up on " + data['timename'], 
                    "time":data['time'],
                    "category":"cla",
                    # "owners":[*data["classes"]],  
                    "owners":["__all__"], 
                    "otherdata":{}, #Any other data useful for that notification
                })
                    
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
                'attendance_code':attendance_code
            }
            
            attd = Attendance.objects.filter(**query)
            
            if not attd:
                callresponse = {
                    'passed': False,
                    'response':201,
                    'error':"User has not marked or does not exist"
                }
                return HttpResponse(json.dumps(callresponse))            

            attd = attd[0]
            
            current_branch_index = attd.attendance_data['mark_index']
            attd_dataname = 'marked_users_'+ str(current_branch_index)

            inicount = attd.attendance_data[attd_dataname][user_code]['opened_count'] 
            inicount = int(inicount) + 1           
            attd.attendance_data[attd_dataname][user_code]['opened_count'] = inicount
            attd.save()



            # Be like attd_code-markeduser_0-user_code-1|2
            stringbase = attendance_code + "-" + attd_dataname + "-" + user_code + "-" + str(inicount) + "|"
            imageset = []
            for x in range(20):
                stringname = stringbase + str(x)
                img = qrcode.make(stringname)
                buffered = io.BytesIO()
                img.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue())

                img_base64 = bytes("data:image/jpeg;base64,", encoding='utf-8') + img_str

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

    def readQR(b64):
        im1 = tocv2(b64)

        im1 = cv2.cvtColor(im1, cv2.COLOR_BGR2GRAY) #Convert the image to grey
        blur = cv2.GaussianBlur(im1, (5, 5), 0) #To reduce noise in the image and smooth it
        ret, bw_im = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY+cv2.THRESH_OTSU) #Sharpen the edges of the qr. Milky is threshold to white, dull grey to black there about
        barcodes = decode(bw_im, symbols=[ZBarSymbol.QRCODE])
        
        return False if not barcodes else barcodes[0].data.decode()

    def decide_QRdata(data1, data2):
        ret = {
            "valid":False,
        }
        if not data1 or not data2:
            ret["Message"] = "Unable to read QR from the Image. Please try again"
            return ret

        if data1 == data2:
            ret["Message"] = "Invalid QR code sent!. Please try again"
            return ret

        data1set = data1.split("|")
        data1sub = data1set[0].split("-")

        data2set = data2.split("|")
        data2sub = data2set[0].split("-")

        if not ((data1set[0]) == (data2set[0])):
            ret["Message"] = "Improper QR sent! Please try again"
            return ret
        
        ret = {
            'valid':True,
            'attendance_code':data1sub[0],
            'create_index_code':data1sub[1],
            'opener_code':data1sub[2]
        }

        return ret
 
    def mark(self, response):
        if (response.method == "POST"):  
            data =  json.loads(response.body.decode('utf-8'))
            callresponse = {
                'passed': False,
                'response':201,
                'Message':"Broken pipe! It's us, not you! Please try again."
            }
       
            user_code = data["user_code"]
            imageset = data['payload']
            qr1 = imageset[0]
            qr2 = imageset[1]
            face = imageset[2]
            
            data1 = self.readQR(qr1)
            data2 = self.readQR(qr2)

            outcome = self.decide_QRdata(data1, data2)
            
            if not outcome["valid"]:
                callresponse['Message'] = outcome['Message']
                return HttpResponse(json.dumps(callresponse))
            
            print ("val", outcome)

            # Find User Face with their code
            # Stored as main/static/authimages/class_code/user_code
            # impath = os.getcwd() + "main/static/authimages/class_code/user_code"

            impath = "mayor.jpg"
            userface = cv2.imread(impath)
            
            face = tocv2(face)            
            ret = Recognizer.comparefaces(userface, face)

            if not ret['ismatch']:
                callresponse['Message'] = ret['Message']
                return HttpResponse(json.dumps(callresponse))
                
            query = {
                "attendance_code":outcome["attendance_code"]
            }

            attd = Attendance.objects.filter(**query)

            if not attd:
                callresponse = {
                    'passed': False,
                    'response':201,
                    'Message':"Code does not exist"
                }
                return HttpResponse(json.dumps(callresponse))            

            attd = attd[0]

            print(attd)
            attd.attendance_data[outcome["create_index_code"]][user_code] = {
                "user_code":user_code, 
                "time":'data["time"]',
                "class_code":"class_code",
                "parent_opener":outcome["opener_code"], 
                "opened_count":0, 
            }
            
            callresponse = {
                'passed': True,
                'response':200,
                'create_index_code':outcome["create_index_code"],
                'attendance_code':outcome["attendance_code"],
                'Message':"Attendance Successfully Marked!",
            }
            # attd.save()

            return HttpResponse(json.dumps(callresponse))
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")
    
    def fetchforhome(self, response):
        if (response.method == "POST"):  
            data = json.loads(response.body.decode('utf-8'))

            class_code = data['class_code']
            # You should normally get the loggedin user from here sef    

            query = {
                'classes__contains': [class_code]
                
            }

            attds = Attendance.objects.filter(**query)
            print (attds)          

            if not attds:
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

    def fetch_tabledata(self, response):
        if (response.method == "POST"):  
            data = json.loads(response.body.decode('utf-8'))

            attendance_code = data['attendance_code']
            # index_list = data['index_list'] 
            # You should normally get the loggedin user from here sef 

            query = {
                'attendance_code': attendance_code,
            }

            fetchset = ["attendance_data", 'creatorid']
            
        
            attds = Attendance.objects.filter(**query).values(*fetchset)
            
            retpack = [*attds]
            
            callresponse = {
                'passed': True,
                'response':200,
                'datapack':retpack,
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
            data = json.loads(response.body.decode('utf-8'))
            attendance_code =  data.get('attendance_code', '')
            
            # user_code must be owner/creator
            user_code =  data.get('user_code', '')
            
            time = data['time']
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
            # Verify that user_code is the creator Id to proceed
            attd.status = 1
            current_branch_index = attd.attendance_data['mark_index']
            
            current_branch = 'marked_users_' + str(current_branch_index)
            attd.attendance_data[current_branch]["poll_base_data"]['time_activated'] = time
            attd.attendance_data[current_branch]["poll_base_data"]['activator'] = user_code

            attd.save()

            # SendNotifif here boss

            callresponse = {
                'passed': True,
                'response':200,
                'attendances':attendance_code
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def close_current(self, response):
        if (response.method == "POST"):  

            data = json.loads(response.body.decode('utf-8'))
            attendance_code =  data.get('attendance_code', '')
            user_code =  data.get('user_code', '')
            time = data['time']
            # You should normally get the loggedin user from here sef

            # if(loggeduser owns teh attendace)
            # continue

            user_code = 'loggeduser'
            
            
            query = {
                'attendance_code': attendance_code,
            }

            attds = Attendance.objects.filter(**query)

            if not attds:
                callresponse = {
                    'passed': False,
                    'response':201,
                    'Message':"Attendance does not exist",
                }
                return HttpResponse(json.dumps(callresponse))      

            attd = attds[0]
            attd.status = 2

            current_branch_index = attd.attendance_data['mark_index']
            
            current_branch = 'marked_users_' + str(current_branch_index)
            attd.attendance_data[current_branch]['poll_base_data']['time_closed'] = time
            attd.attendance_data[current_branch]['poll_base_data']['closer'] = user_code

            attd.save()            


            callresponse = {
                'passed': True,
                'response':200,
                'attendances':attendance_code
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def queue_new(self, response):
        if (response.method == "POST"):  
            data = json.loads(response.body.decode('utf-8'))

            attendance_code = data['attendance_code']
            user_code = data['user_code']
            new_time = data['time']
            
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
                    'passed': False,
                    'response':201,
                    'Message':"Attendance does not exist",
                }
                return HttpResponse(json.dumps(callresponse))      

            
            attd = attds[0]
            attd.status = 0
            attd.time = new_time

            current_branch_index = attd.attendance_data['mark_index']
            current_branch = 'marked_users_' + str(current_branch_index + 1)
            #Verify user_code is the owner of the attendance
            attd.attendance_data['mark_index'] = current_branch_index + 1
            attd.attendance_data[current_branch] = {
                "poll_base_data":{
                    "time":data["time"],
                    "time_activated":'',
                    "time_closed":'',
                    "time_queued":new_time,
                    "creator":user_code
                },
                user_code:{
                    "user_code":user_code, 
                    "parent_opener":'base', #The person that generated the code for the user
                    "opened_count":0, #The total number of people this has opened for
                }
            }

            
            attd.save() 

            # url = 'the_url_here'
            # NotificationAPI.send({
            #     "callback_url":url,
            #     "text":"Attendance poll queued for " + attd.course_code + " Coming up on " + data["time"], 
            #     "time":data['time'],
            #     "category":"cla", 
            #     # "owners":[*data["classes"]],  
            #     "owners":["__all__"], 
            #     "otherdata":{}, #Any other data useful for that notification
            # })           


            callresponse = {
                'passed': True,
                'response':200,
                'attendances':attendance_code,
                'current_branch':current_branch
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def unqueue_current(self, response):
        if (response.method == "POST"):  
            data = json.loads(response.body.decode('utf-8'))

            attendance_code = data['attendance_code']
            user_code = data['user_code']
            
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
                    'passed': False,
                    'response':201,
                    'Message':"Attendance does not exist",
                }
                return HttpResponse(json.dumps(callresponse))      

            
            attd = attds[0]
            attd.status = 2
            current_branch_index = attd.attendance_data['mark_index']
            attd.attendance_data['mark_index'] = current_branch_index - 1
            
            current_branch = 'marked_users_' + str(current_branch_index)

            #Verify user_code is the owner of the attendance

            del attd.attendance_data[current_branch]
            
            attd.save()         

            callresponse = {
                'passed': True,
                'response':200,
                'attendances':attendance_code,
                'current_branch':current_branch
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def delete_attendance(self, response):
        if (response.method == "POST"):  
            attendance_code =  json.loads(response.body.decode('utf-8')).get('attendance_code', '')
            user_code =  json.loads(response.body.decode('utf-8')).get('user_code', '')

            query = {
                'attendance_code': attendance_code,
                # 'creatorid': user_code
            }           

            attds = Attendance.objects.filter(**query)

            if not attds:
                callresponse = {
                    'passed': False,
                    'response':201,
                    'Message':"Attendance does not exist",
                }
                return HttpResponse(json.dumps(callresponse))      

            attd = attds[0]

            print ("Alaye !")
            # attd.delete()       


            callresponse = {
                'passed': True,
                'response':200,
                'attendances':attendance_code
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

class ClassAPI:
    extraverify={

    }    

    def create(self, response):
        if (response.method == "POST"):
            data =  json.loads(response.body.decode('utf-8')).get('payload')            
            
            # channel_layer = get_channel_layer()

            # async_to_sync(channel_layer.group_send)(
            #     "grouptest",
            #     {
            #         "type": "chatmessages",
            #         "message": "Freak",
            #     },
            # )

            return HttpResponse("Family")
            data['class_code'] = "init" 
            data['timetable'] = {
                'tableset':{
                    "Monday":[],
                    "Tuesday":[],
                    "Wednesday":[],
                    "Thursday":[],
                    "Friday":[],
                    "Saturday":[],
                    "Sunday":[],
                },
                "tabledata":{}
            }
            sl = ModelSL(data=data, model=Class, extraverify=self.extraverify)

            if (sl.is_valid()):
                callresponse = sl.callresponse
                
            else:
                callresponse = sl.cError()

            if (callresponse['passed']):
                ins_id = sl.save().__dict__['id']
                sl.validated_data['class_code'] = numberEncode(ins_id, 5)
                sl.save()
                callresponse['response']['class_code'] = sl.validated_data['class_code']
                    
            return HttpResponse(json.dumps(callresponse))

        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")
    
    def good_data(val):
        return ((val is not None) and val != '')

    def update_timetable(self, response):
        if (response.method == "POST"):   
            data =  json.loads(response.body.decode('utf-8')).get('payload') 

            # Verify if user is owner
            timetable_data = data['timetable_data']
            rep_code = data['rep_code']
            class_code = data['class_code'] 
            all_codes = data['all_codes'] 



            allowed = ['Monday', "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            errorset = {}
            errored = False

            
            new_inserts = []
            for day in timetable_data:
                if (day not in allowed):
                    errorset['Day'] = day + " is not allowed"
                else:
                    itnum = 0
                    day_classes = timetable_data[day]                    
                    for row in day_classes:                        
                        code = row['daycl_code']

                        if (code.isnumeric()):
                            ncode = "000" + code

                            while (numberEncode(ncode, len(ncode)) in all_codes):
                                ncode += "i0"

                            ncode = numberEncode(ncode, len(ncode))
                            ncode = ncode+"i" if ncode.isnumeric() else ncode
                            row['daycl_code'] = ncode
                            new_inserts.append(ncode)

                        for key in row:
                            if (not self.good_data(row[key]) and key != 'extrainfo'):
                                errorset[day+"|"+str(itnum)+"|"+key] = day + "'s item "+ str(itnum) + " "+ key + " is not entered"
                        
                        itnum += 1
            
            
            if (errorset):
                callresponse = {
                    'passed': False,
                    'response':201,
                    'error':errorset,
                }
                return HttpResponse(json.dumps(callresponse))


            query = {
                'rep_code': rep_code,
                'class_code': class_code
            }             

            qsets = Class.objects.filter(**query)

            if not qsets:
                callresponse = {
                    'passed': True,
                    'response':201,
                    'error':"Class does not exist",
                }
                return HttpResponse(json.dumps(callresponse))      

            qset = qsets[0]
            qset.timetable['tableset'] = timetable_data

            for ins in new_inserts:
                qset.timetable['tabledata'][ins] = {
                    'comments':{
                        'replies':{}
                    }
                }

            qset.save()
            
            callresponse = {
                'passed': True,
                'response':200,
                'class_code':class_code,
            }

            return HttpResponse(json.dumps(callresponse))

        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")
    
    def fetch(self, response):
        if (response.method == "POST"):  
                        
            fetchpair =  json.loads(response.body.decode('utf-8')).get('fetchpair', {})
            fetchset =  json.loads(response.body.decode('utf-8')).get('fetchset', [])

                     
            retpack = APIgenerals.generalFetch(model=Class, fetchset=fetchset, fetchpair=fetchpair)        
            # return HttpResponse(json.dumps('ret'))   

            callresponse = {
                'passed': True,
                'response':200,
                'queryset':retpack
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def fetchtable(self, response):
        if (response.method == "POST"):  
                        
            fetchpair =  json.loads(response.body.decode('utf-8')).get('fetchpair', {})

            qsets = Class.objects.values('timetable__tableset').filter(**fetchpair)

            if not qsets:
                callresponse = {
                    'passed': True,
                    'response':201,
                    'queryset':[]

                }
                return HttpResponse(json.dumps(callresponse))      

            callresponse = {
                'passed': True,
                'response':200,
                'queryset':qsets[0]['timetable__tableset']
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def fetch_dayclass(self, response):
        if (response.method == "POST"):  
            data =  json.loads(response.body.decode('utf-8')) 

            class_code = data['class_code']
            dc_code = data['dc_code']
            day = data['day']

            # class_code = "6MBy4"
            # dc_code = "x4RL"
            # day = "Monday"

            fetchset = ["timetable__tableset__"+day, "timetable__tabledata__"+dc_code]
            qset = Class.objects.defer("id").filter(class_code=class_code).values(*fetchset)


            if (qset.count() == 0):
                callresponse = {
                    'passed': True,
                    'response':201,
                    'queryset':[]
                }
                return HttpResponse(json.dumps(callresponse))
            
            qset = qset[0]


            retset = {}
            retset['tabledata'] = qset['timetable__tabledata__' + dc_code]

            if (retset == {}):
                callresponse = {
                    'passed': True,
                    'response':201,
                    'queryset':[]
                }

            tableset_day = qset["timetable__tableset__"+day]

            for classs in tableset_day:
                if (classs["daycl_code"] == dc_code):
                    retset['tableset'] = classs
                    break


            callresponse = {
                'passed': True,
                'response':200,
                'queryset':retset
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    myval = 0
    def add_timetable_comment(self, response):
        if (response.method == "POST"):   

            data =  json.loads(response.body.decode('utf-8'))
            #SEE COMMENT STRUCTURE IN classmanager/main/c_structure.txt
            
            callresponse = {
                'passed': True,
                'response':200,
                'comment_code':"comment_code",
            }                           

            text = data['text']
            address = data['address']   # Address is sent as "comments|...|cmt-1|cmt-4" As in  ...|grandparent|parent
            user_code = data['user_code']
            class_code = data['class_code']
            dayclass_code = data['dayclass_code']
            owner = data['owner'] #Should contain the name, user_code at least
            parent_owner = data['parent_owner'] #Should contain the user_code at least
            date = data["date"]
            url = data["url"]

            print("------------", date)

            comment_set = {
                'text':text,
                'user_code':user_code,
                "parent_address":address,
                'comment_code':"comment_code",
                "date":date,
                "owner":{
                    "user_code":owner["user_code"],
                    "name":owner["name"],
                },
                "parent_owner":{
                    "user_code":parent_owner["user_code"],
                },
                'replies':{}
            }

            code = class_code + "_" + dayclass_code
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                code,
                {
                    "type": "mono_disburse",    #Calling the function ddefined in the consumer here
                    "message": comment_set,
                },
            )

            #Send message to rep if parent_owner code is comment else 
            

            NotificationAPI.send({
                "callback_url":url,
                "text":owner["name"] + ' replied to your comment - <b>"' + (sanitize_html(text)) + '"</b>',
                "time":date,
                "category":"soc", 
                # "owners":[parent_owner["user_code"]],  
                "owners":["__all__"], 
                "otherdata":{}, #Any other data useful for that notification
            })
            
 
            return HttpResponse(json.dumps(callresponse))  

            
            query = {
                'timetable__tabledata__has_key' : dayclass_code,
                'class_code': class_code
            }             

            qsets = Class.objects.filter(**query)

            if not qsets:
                callresponse = {
                    'passed': False,
                    'response':201,
                    'error':"Class does not exist",
                }
                return HttpResponse(json.dumps(callresponse))      

            qset = qsets[0]
            
            iniStr = "self.myval = len(qset.timetable['tabledata'][dayclass_code]" + self.buildstring(address) + ")"
            exec(iniStr)
            comment_code = str(self.myval).zfill(5) + "_" + user_code    

            #Don't worry, self address are auto built by self by catting paddr|ucode ;)
            comment_set = {
                'text':text,
                'user_code':user_code,
                "parent_address":address,
                'comment_code':comment_code,
                "owner":{
                    "user_code":owner["user_code"],
                    "name":owner["name"],
                },
                "parent_owner":{
                    "user_code":parent_owner["user_code"],
                },
                'replies':{}
            }

            majstring = "qset.timetable['tabledata'][dayclass_code]" + self.buildstring(address) + "['"+comment_code+"'] = comment_set"
            exec(majstring)

            qset.save()

            code = class_code + "_" + dayclass_code

            #Sending to all users on this item page
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                code,
                {
                    "type": "mono_disburse",    #Calling the function ddefined in the consumer here
                    "message": comment_set,
                },
            )
            
            
            callresponse = {
                'passed': True,
                'response':200,
                'comment_code':comment_code,
            }

            return HttpResponse(json.dumps(callresponse))

        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")
    
    def update_timetable_comment(self, response):
        if (response.method == "POST"):   

            callresponse = {
                'passed': True,
                'response':200,
                'comment_code':"comment_code",
            }

            return HttpResponse(json.dumps(callresponse))

            data =  json.loads(response.body.decode('utf-8'))
            #SEE COMMENT STRUCTURE IN classmanager/main/c_structure.txt
            
            text = data['text']
            parent_address = data['parent_address']   # Address is sent as "comments|...|cmt-1|cmt-4" As in  ...|grandparent|parent
            comment_code = data['comment_code']
            
            class_code = data['class_code']
            dayclass_code = data['dayclass_code']

            query = {
                'timetable__tabledata__has_key' : dayclass_code,
                'class_code': class_code
            }             

            qsets = Class.objects.filter(**query)

            if not qsets:
                callresponse = {
                    'passed': False,
                    'response':201,
                    'error':"Class does not exist",
                }
                return HttpResponse(json.dumps(callresponse))      

            qset = qsets[0]
            

            majstring = "qset.timetable['tabledata'][dayclass_code]" + self.buildstring(parent_address) + "['"+comment_code+"']['text'] = text"
            exec(majstring)

            qset.save()
            
            callresponse = {
                'passed': True,
                'response':200,
                'comment_code':comment_code,
            }

            return HttpResponse(json.dumps(callresponse))

        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")
    

    def delete_timetable_comment(self, response):
        if (response.method == "POST"):   

            callresponse = {
                'passed': True,
                'response':200,
                'comment_code':"comment_code",
            }

            return HttpResponse(json.dumps(callresponse))
            
            data =  json.loads(response.body.decode('utf-8'))

            parent_address = data['parent_address']   # Address is sent as "comments|...|cmt-1|cmt-4" As in  ...|grandparent|parent|self
            comment_code = data['comment_code']   # Address is sent as "comments|...|cmt-1|cmt-4" As in  ...|grandparent|parent|self
            
            class_code = data['class_code']
            dayclass_code = data['dayclass_code']
            

            query = {
                'timetable__tabledata__has_key' : dayclass_code,
                'class_code': class_code
            }             

            qsets = Class.objects.filter(**query)

            if not qsets:
                callresponse = {
                    'passed': False,
                    'response':201,
                    'error':"Class does not exist",
                }
                return HttpResponse(json.dumps(callresponse))      

            qset = qsets[0]
            

            majstring = "del qset.timetable['tabledata'][dayclass_code]" + self.buildstring(parent_address) + "['"+comment_code+"']"
            exec(majstring)

            qset.save()
            
            callresponse = {
                'passed': True,
                'response':200,
                'comment_code':comment_code,
            }

            return HttpResponse(json.dumps(callresponse))

        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")
    
    def buildstring(address):
        addpack = address.split("|")
        retstring = ''
        for addr in addpack:
            retstring += "['"+addr+"']" + "['replies']"
        
        return retstring

class NotificationAPI:
    
    extraverify = {}
    def fetch_user_notifications(self, response):
        if (response.method == "POST"):  
            data =  json.loads(response.body.decode('utf-8')) 

            user_code = data['user_code']
            class_code = data['class_code']

            fetchset = []
            querypair={
                "owners__overlap":["__all__", "__"+class_code+"__", user_code] #Gets where the owners list contains any of the passed
            }
            qset = Notification.objects.defer("id").filter(**querypair).values()

            if (qset.count() == 0):
                callresponse = {
                    'passed': False,
                    'response':201,
                    'queryset':[]
                }
                return HttpResponse(json.dumps(callresponse))
            
            qset = qset[0]


            callresponse = {
                'passed': True,
                'response':200,
                'queryset':qset
            }
            return  HttpResponse(json.dumps(callresponse)) 
            
        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")

    def send(dataset):
        #* owner_set is sent as 
            #     ['__all__'] for every user on Omega class
            #     ['__class_code1__', '__class_code2__'] for every user in a class
            #     ['qvdy', "sded"] for every user as contained
            # dataset sould be in format
                # dataset = {
                #     "callback_url":"curl",
                #     "text":"text",
                #     "time":"time",
                #     "category":"category", 
                    # "upd" for Updates(pay created, pay ending), 
                    # "cla" for Class (concerning class creations, class updates, attendance creates)
                    # "rem" for Reminder(class coming up, pay ending, pay not yet attendeds)
                    # "soc" for socials (replies to comments, comments add);
                    # 'exa' for exams (exams and test updates)
                    # "gen" for general (paycomplete from omega, )
                #     "owners":[] #As defined by owner_set above
                #     "otherdata":{} #Any other data useful for that notification
                # }
        #

        callresponse = {
            'passed': True,
            'response':{},
            'error':{}
        }

        channel_layer = get_channel_layer()
        for listener in dataset['owners']:
            async_to_sync(channel_layer.group_send)(
                "NOTIF_LISTENER_"+listener,
                {
                    "type": "mono_disburse", #Calling the function defined in the consumer here
                    "message": dataset,
                },
            )
        return callresponse


        dataset['itemcode'] = "dummy"
        sl = ModelSL(data=dataset, model=Notification, extraverify=self.extraverify)

        if (sl.is_valid()):
                callresponse = sl.callresponse                
        else:
            callresponse = sl.cError()

        if (callresponse['passed']):
            ins_id = sl.save().__dict__['id']
            sl.validated_data['itemcode'] = numberEncode(ins_id, 6)
            sl.save()
            callresponse['response']['notification_code'] = sl.validated_data['itemcode']
        
        
        for listener in dataset['owners']:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "NOTIF_LISTENER_"+listener,
                {
                    "type": "mono_disburse", #Calling the function defined in the consumer here
                    "message": dataset,
                },
            )
        return callresponse

    def create(self, response):
        if (response.method == "POST"):
            data =  json.loads(response.body.decode('utf-8')).get('payload')            
            
            return HttpResponse("Family")
            dataset = {
                "callback_url":"curl",
                "text":data['text'],
                "time":"time",
                "category":data["category"], 
                # "upd" for Updates(pay created, pay ending), 
                # "cla" for Class (concerning class creations, class updates, attendance creates)
                # "rem" for Reminder(class coming up, pay ending, pay not yet attendeds)
                # "soc" for socials (replies to comments, comments add);
                # 'exa' for exams (exams and test updates)
                # "gen" for general (paycomplete from omega, )
                "owners":data['owners'], #As defined by owner_set above
                "otherdata":{} #Any other data useful for that notification
            }
            
            return HttpResponse(json.dumps(self.send(dataset)))

        else:
            return HttpResponse("<div style='position: fixed; height: 100vh; width: 100vw; text-align:center; display: flex; justify-content: center; flex-direction: column; font-weight:bold>Page Not accessible<div>")
   




