from . import api
from django.http import HttpResponse
import json

class Manager:
    def manager(response, apiclass, apimethod):      
        
        ret = {
            'response':201,
            'errorcode':201,
            "Message": "Broken pipeline!"
        }
        try:
            class_ = getattr(api, apiclass.capitalize() + "API")
            return getattr(class_, apimethod)(class_, response)
        except Exception as e:
            ret = {
                'response':201,
                'errorcode':201,
                "Message": str(e)
            }
            return HttpResponse(json.dumps(ret))
        

        


