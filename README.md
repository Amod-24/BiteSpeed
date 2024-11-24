In this project there are three APIs : 

1.  method - get
    path - "/check"
    description : This Api will simply return a message "its working" with status code 200 just to confirm if our backend is live and working or not.

2.  method - get
    path - "/allContacts"
    description : This Api will return an array of all contacts present in out database.

3.  method - post
    path - "/identify"
    description : This Api requires either both or phonenumber or email in String data type, and then checks in database if there exists any common phoneNumber or email and then return an object named "contacts" in which there are three arrays one is of all common emails, other of all common phoneNumber and last one is of all secondary contact ids.

