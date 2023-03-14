from bs4 import BeautifulSoup
import base64
import cv2
import numpy as np


def inAllowed(text, allowed):
    allowed = str(allowed)
    if allowed == 'def':
        allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_@. "
    ret = True
    for x in text:
        if (not allowed.__contains__(x)):
            ret = False
            break
    if allowed == 'idef':
        ret = True
    return ret

def validateEntry(retdata, entry, name, minlen, maxlen, allowed):

    if (entry is not None):
        if (not inAllowed(entry, allowed)):
            retdata['passed'] = False
            retdata.get("error")[name.lower()]=(name + " contains characters that are not allowed")
        else:
            if (len(entry) > maxlen):
                retdata['passed'] = False
                retdata.get("error")[name.lower()]=(name + " contains too many characters. Max of " + str(maxlen) + " is allowed")
                
            if (len(entry) < minlen):
                retdata['passed'] = False
                retdata.get("error")[name.lower()]=(name + " contains too few characters. Min of " + str(minlen) + " is allowed")
     
    else:
        retdata['error'] = {
            name.lower(): (name + " is not set")
        }

    return entry
    
def validatenum(retdata, num, name, minval, maxval):
    if (entry is None):
        retdata['passed'] = False
        retdata.get("error")[name.lower()]=(name + " is not set")
    else:
        if (type(num)==float or type(num)==int):
            if (num > minval):
                retdata['passed'] = False
                retdata.get("error")[name.lower()]=(name + " can not be greater than " + maxval)
            if (num < minval):
                retdata['passed'] = False
                retdata.get("error")[name.lower()]=(name + " can not be lesser than " + minval)
        else:
            retdata['passed'] = False
            retdata.get("error")[name.lower()]=(name + " is not a valid number")

    return num

def validateArray(retdata, arr, name, minlen, maxlen):
    if (entry is None):
        retdata['passed'] = False
        retdata.get("error")[name.lower()]=(name + " is not set")
    else:
        if not type(arr) == list:
            retdata['passed'] = False
            retdata.get("error")[name.lower()]=(name + " must be an array")
        else:
            if (len(arr) < minlen):
                retdata['passed'] = False
                retdata.get("error")[name.lower()]=(name + " can only contain a minimum of " + minlen + " entries")
            if (len(arr) > maxlen):
                retdata['passed'] = False
                retdata.get("error")[name.lower()]=(name + " can only contain a maximum of " + maxlen + " entries")

    return arr

def validateDict(retdata, arr, name, minlen, maxlen):
    if (entry is None):
        retdata['passed'] = False
        retdata.get("error")[name.lower()]=(name + " is not set")
    else:
        if not type(arr) == dict:
            retdata['passed'] = False
            retdata.get("error")[name.lower()]=(name + " must be an JSON")
        else:
            if (len(arr) < minlen):
                retdata['passed'] = False
                retdata.get("error")[name.lower()]=(name + " can only contain a minimum of " + minlen + " entries")
            if (len(arr) > maxlen):
                retdata['passed'] = False
                retdata.get("error")[name.lower()]=(name + " can only contain a maximum of " + maxlen + " entries")
    return arr

def numberEncode(code, encNum):
    
    code = str(code).zfill(encNum)   #Pad on the left with zeros
     
    Res = 'ZgBoFklNOaJKLM5XYh12pqr6wQRSTdefijAPbcU4mnVW0stuv78xyzGCDE3HI9'
    tlenght = len(Res)
    rtl = ''
    cdLen = len(code)
    former = 0
    for i in range(cdLen):
        ind = cdLen - i - 1
        el = code[ind]
        k = (Res.index(el) + encNum + ind + former) % tlenght
        rtl += Res[k]
        former = k
    return rtl

def numberDecode(code, encNum):                  
    Res='ZgBoFklNOaJKLM5XYh12pqr6wQRSTdefijAPbcU4mnVW0stuv78xyzGCDE3HI9'
    tlenght = len(Res)
    cdLen = len(code)
    rtl = ''
    former = 0
    for i in range(cdLen):
        el = code[i]
        ind = cdLen - i - 1
        rk = Res.index(el)
        k =  (rk - encNum - ind - former + tlenght) % tlenght
        rtl =  Res[k]+rtl
        former = rk
    return rtl

def init_user_session(response, data):
    response.session.flush()
    for key in data:
        response.session[key] = data[key]
    
    # response.session.set_expiry(25500)

def isloggedin(response):

    return response.session.get('user') is not None

def sanitize_html(value, mtype="none"):

    soup = BeautifulSoup(value)
        
    VALID_TAGS = ['strong', 'em', 'p', 'ul', 'li', 'br']
    if mtype == "none":
        VALID_TAGS = []

    for tag in soup.findAll(True):
        if tag.name not in VALID_TAGS:
            tag.hidden = True

    ret = str(soup.renderContents().decode())

    print (ret)
    if ret == "":
        ret = "..."
    return ret

def tocv2(b64):
    b64 = b64.replace('data:image/jpeg;base64,', '')

    im_bytes = base64.b64decode(b64)
    im_arr = np.frombuffer(im_bytes, dtype=np.uint8)  # im_arr is one-dim Numpy array
    img_cv2 = cv2.imdecode(im_arr, flags=cv2.IMREAD_COLOR)
    return img_cv2
            