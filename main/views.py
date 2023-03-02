from django.shortcuts import render
import cv2
from pyzbar.pyzbar import decode
from pyzbar.pyzbar import ZBarSymbol
import qrcode
from .models import *
from django.http import HttpResponse
import json
from django.utils.safestring import mark_safe
# from .backend.Recognition.Recog_api import *

# Create your views here. 

def testpage(response):
    # test()
    return render(response, "testpage.html", {}) 

def camtest(response):
    # cap = cv2.VideoCapture(0)
    # # initialize the cv2 QRCode detector
    # detector = cv2.QRCodeDetector()
    # while True:
    #     _, img = cap.read()
    #     # # detect and decode
    #     data, bbox, _ = detector.detectAndDecode(img)

    #     print (data)
    #     # check if there is a QRCode in the image
    #     # if bbox is not None:
    #     #     # display the image with lines
    #     #     for i in range(len(bbox)):
    #     #         # draw all lines
    #     #         cv2.line(img, tuple(bbox[i][0]), tuple(bbox[(i+1) % len(bbox)][0]), color=(255, 0, 0), thickness=2)
    #     #     if data:
    #     #         print("[+] QR Code detected, data:", data)
    #     # # display the result
    #     cv2.imshow("img", img)    
    #     if cv2.waitKey(1) == ord("q"):
    #         break
    # cap.release()
    # cv2.destroyAllWindows()

    data = "I really want tas and now"
    # output file name
    
    filename = "site.png"
    # generate qr code
    img = qrcode.make(data)
    # save img to a file
    img.save("filename.png")

    # img = cv2.imread("rest.jpg")
    # detector = cv2.QRCodeDetector()
    # data, bbox, straight_qrcode = detector.detectAndDecode(img)
    # print(data)
    
    # image = cv2.imread("testerr.jpg", 0)
    # barcodes = decode(image, symbols=[ZBarSymbol.QRCODE])
    # print(barcodes)

    im = cv2.imread("filename.png", cv2.IMREAD_GRAYSCALE)
    blur = cv2.GaussianBlur(im, (5, 5), 0)
    ret, bw_im = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY+cv2.THRESH_OTSU)
    barcodes = decode(bw_im, symbols=[ZBarSymbol.QRCODE])
    print(barcodes[0].data)

    return render(response, "testpage.html", {}) 

def signup(response):
    return render(response, "signup.html", {}) 

def dashboard(response):
    return render(response, "dashboard.html", {}) 

def payout(response, pay_code):
    
    qset = PaymentChannel.objects.defer("id").filter(itemcode=pay_code).values()
    # qset = Attendance.objects.filter(attendance_code=attendance_code).values('status', 'creatorid', 'attendance_code')
    # print(qset)
    user_code = 'loggeduser'

    if (qset.count() == 0):
        return HttpResponse("Invalid Url")

    qset = qset[0]
    
    is_owner =  user_code == qset['creatorid']
    qset['is_owner'] = is_owner
    qset['description'] = mark_safe(qset['description'])

    # qset['needed_data'] = json.dumps({
    #     "name":qset['name'],
    #     "is_owner":is_owner,
    #     "channel_code":qset['itemcode'],
    #     "isowner":user_verified,
    #     "description":qset['description'],
    #     "imageset":qset['imageset'],
    # })


    return render(response, "payout.html", qset) 


def classdata(response, classcode_day_dclcode):

    code2name = {
        "md":"Monday",
        "td":"Tuesday",
        "wd": "Wednesday",
        "thd":"Thursday",
        "fd":"Friday",
        "std":"Saturday",
        "snd":"Sunday",
    }

    datapack = classcode_day_dclcode.split("_")
    
    

    needed_data = {
        "class_code" : datapack[0],
        "day" : code2name[datapack[1]],
        "dc_code" : datapack[2],
    }

    instream = {
        'needed_data':json.dumps(needed_data)
    }

    return render(response, "classdata.html", instream) 


def createchannel(response):
    return render(response, "createchannel.html", {}) 

def attendance_data(response):
    return render(response, "attendance_data.html", {}) 
    


def takeattendance(response):
    return render(response, "takeattendance.html", {}) 

    
def createattendance(response):
    return render(response, "createattendance.html", {}) 

def account(response):
    return render(response, "account.html", {}) 

def notifications(response):
    return render(response, "notifications.html", {}) 

def edittimetable(response):
    return render(response, "edittimetable.html", {}) 

def initiateattendance(response, attendance_code):


    
    qset = Attendance.objects.defer("id").filter(attendance_code=attendance_code).values()
    # qset = Attendance.objects.filter(attendance_code=attendance_code).values('status', 'creatorid', 'attendance_code')
    # print(qset)    
    user_code = 'loggeduser'

    if (qset.count() == 0):
        return HttpResponse("Invalid Url")

    qset = qset[0]
    user_verified = True 
    mindex = qset['attendance_data']['mark_index']
    try:
        user_pack = qset['attendance_data']['marked_users_' + str(mindex)][user_code]
    except:
        user_verified = False 
    
    qset['needed_data'] = json.dumps({
        "status":qset['status'],
        "creatorid":qset['creatorid'],
        "attendance_code":qset['attendance_code'],
        "user_verified":user_verified,
    })

    return render(response, "initiateattendance.html", qset) 