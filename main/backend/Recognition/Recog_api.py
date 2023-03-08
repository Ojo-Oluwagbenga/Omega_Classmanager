import cv2
import numpy as np
import face_recognition
import datetime

# imgjohn = face_recognition.load_image_file('test1.jpg') #Image in BGR
    # imgjohn = cv2.cvtColor(imgjohn, cv2.COLOR_BGR2RGB) #Turns the image to RGB
    # imgjohn = cv2.resize(imgjohn, (285, 500))

    # imgjohn2 = face_recognition.load_image_file('test2.jpg')
    # imgjohn2 = cv2.cvtColor(imgjohn2, cv2.COLOR_BGR2RGB)
    # imgjohn2 = cv2.resize(imgjohn2, (285, 500))



    # current_time = datetime.datetime.now()
    # print ("ti" , current_time)

    # faceloc1 = face_recognition.face_locations(imgjohn)[0] #The image in RGB
    # encodejohn1 = face_recognition.face_encodings(imgjohn)[0] #Makes digits out of the face
    # cv2.rectangle(imgjohn, (faceloc1[3], faceloc1[0]), (faceloc1[1], faceloc1[2]), (255, 0, 255), 3)

    # faceloc2 = face_recognition.face_locations(imgjohn2)[0]
    # encodejohn2 = face_recognition.face_encodings(imgjohn2)[0] #Makes digits out of the face
    # cv2.rectangle(imgjohn2, (faceloc2[3], faceloc2[0]), (faceloc2[1], faceloc2[2]), (255, 0, 255), 3)

    # results = face_recognition.compare_faces([encodejohn1], encodejohn2)
    # facedis = face_recognition.face_distance([encodejohn1], encodejohn2) #Compares the face digits of the two images
    # print (results, facedis)


    # current_time = datetime.datetime.now()
    # print ("tf" , current_time) 

    # print (type(encodejohn1))
    # cv2.imshow("JohnDull", imgjohn)
    # cv2.imshow("JohnDull2", imgjohn2)
# cv2.waitKey(0)


class Recognizer:
    def comparefaces(face1, face2):
        #Faces in BGR cv2
        try:
            
            conv1 = cv2.cvtColor(face1, cv2.COLOR_BGR2RGB)
            loc1 = face_recognition.face_locations(conv1)
            if len(loc1) == 0:
                return {
                    "ismatch":False,
                    "response":201,
                    "errorcode":404,
                    "Message":"No face found! Please stay still when capturing."
                }
            enc1 = face_recognition.face_encodings(conv1)[0]

            conv2 = cv2.cvtColor(face2, cv2.COLOR_BGR2RGB)
            enc2 = face_recognition.face_encodings(conv2)[0]


            facedis = face_recognition.face_distance([enc1], enc2)

            return {
                "response":200,
                "ismatch":(facedis[0] < 0.4),
                "distance":facedis[0],
                "Message":"Face do not seem to match. Please try again with a still and full face"
            }
            
        except Exception as e:        
            print(str(e))