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

class Myclass(models.Model):
    class_code = models.CharField(max_length=20)
    name = models.CharField(max_length=20)
    level = models.CharField(max_length=20)
    department_code = models.CharField(max_length=20)
    rep_code = models.CharField(max_length=255)

class Course(models.Model):
    course_code = models.CharField(max_length=20)
    name = models.CharField(max_length=20)

class PaymentChannel(models.Model):
    itemcode = models.CharField(max_length=20)
    creatorid = models.CharField(max_length=20)
    name = models.CharField(max_length=20)
    price = models.FloatField()
    description = models.CharField(max_length=500)
    has_deadline = models.CharField(max_length=2) #Gets either '1' / '0'
    deadline_text = models.CharField(max_length=20)
    deadline_digit = models.CharField(max_length=20)
    imageset = models.JSONField(null=True) # Stringified JSON


class Attendance(models.Model): 
    attendance_code = models.CharField(max_length=20)
    description = models.CharField(max_length=500)
    course_code = models.CharField(max_length=500)
    time = models.CharField(max_length=20)
    status = models.CharField(max_length=20)
    creatorid = models.CharField(max_length=20)
    classes = ArrayField(models.CharField(max_length=20))
    attendance_data = models.JSONField(null=True)

    # attendance_data = {
    #     //First person is the creator
    #     marked_users:{
    #         user_code:{
    #             user_code:heD3,
    #             time:"23th 30",
    #             parent_opener:heD3,
    #             opened_count:0,
    #         }
    #     }
    # }
