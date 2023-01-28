from django.db import models
from django.contrib.postgres.fields import ArrayField

# Create your models here.
class User(models.Model):
    itemcode = models.CharField(max_length=20)
    name = models.CharField(max_length=20)
    email = models.EmailField()
    password = models.CharField(max_length=255)
    user_type = models.CharField(max_length=20)
    matric = models.CharField(default="non_student", max_length=20)
    accept_status = models.CharField(default=0, max_length=20)
    cashbalance = models.FloatField(default=0)

class PaymentChannel(models.Model):
    itemcode = models.CharField(max_length=20)
    title = models.CharField(max_length=20)
    price = models.FloatField()
    description = models.CharField(max_length=500)
    deadline = models.CharField(max_length=20)

class Attendance(models.Model):
    itemcode = models.CharField(max_length=20)
    title = models.CharField(max_length=20)
    description = models.CharField(max_length=500)
    time = models.CharField(max_length=20)
    status = models.CharField(max_length=20)
    creatorid = models.CharField(max_length=20)
    classid = models.FloatField()
    attendance_data = models.JSONField
