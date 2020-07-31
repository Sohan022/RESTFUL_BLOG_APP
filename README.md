# RESTFUL_BLOG_APP

<kbd>![index](https://github.com/Sohan022/RESTFUL_BLOG_APP/blob/master/Demo/Index.png)</kbd>

<kbd>![FullBlog](https://github.com/Sohan022/RESTFUL_BLOG_APP/blob/master/Demo/FullBlog.png)</kbd>

[See more images](https://github.com/Sohan022/RESTFUL_BLOG_APP/blob/master/Demo)

```
It is a blogging website where users can post their blogs and read other blogs.

This project has created using HTML, CSS, Semantic UI, JS, Node.js, Express and MongoDB.
```

## Features

 * Users need to login for posting their blogs.
 
 * Users can read other blogs without login.
 
 * User can edit/delete own blogs. 
 
 * Users must have to use a valid email address because there is be an account verification or email verification system. Users need to verify their account/email.
 
 * Flash messages are responding to users interacting with the app.
 
 * Responsive web design
 
 ## Run It Locally
 
 * Install [MongoDB](https://www.mongodb.com/)
 
  * Create [SendGrid Account](https://sendgrid.com/) for sending email verification token/link. You need an Email from which you want to send token/link. You have to verify that Email address by SendGrid( in Single Sender Verification section).
 
 **Note:** *Replace Username and Password by your SendGrid_Username And SendGrid_Password in line 126 & 194 of the app.js. Also, replace Your_Email by your Email Address from which you sent verification token/link in line 127 & 195 of app.js.*
 
```
    git clone https://github.com/Sohan022/RESTFUL_BLOG_APP.git
    cd RESTFUL_BLOG_APP
    npm install
    node app.js
```
* open web browser *http://localhost:3000/*

## LICENSE

[MIT License](https://github.com/Sohan022/RESTFUL_BLOG_APP/blob/master/LICENSE.md)

