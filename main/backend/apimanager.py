import importlib
from . import api

class Manager:
    def manager(response, apiclass, apimethod):
        class_ = getattr(api, apiclass.capitalize() + "API")

        return getattr(class_, apimethod)(class_, response)


