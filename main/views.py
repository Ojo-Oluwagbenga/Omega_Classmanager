from django.shortcuts import render

# Create your views here.

def testpage(response):
    return render(response, "testpage.html", {}) 

def signup(response):
    return render(response, "signup.html", {}) 

def dashboard(response):
    return render(response, "dashboard.html", {}) 