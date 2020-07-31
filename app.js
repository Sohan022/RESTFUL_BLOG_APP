var express = require("express"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    flash = require("connect-flash"),
    session = require("express-session"),
    app = express(),
    moment = require("moment"),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    Bcrypt = require("bcryptjs");

const { check, validationResult } = require('express-validator');

mongoose.connect("mongodb://localhost/restful_blog_app",{useNewUrlParser:true,useUnifiedTopology:true});
app.set("view engine","ejs");
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(session({
    secret: 'This is a black bear',
    resave: false,
    saveUninitialized: false
}));

app.use(function(req,res,next){
    currentUserId = req.session.userId;
    currentUser = req.session.username;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


var blogSchema = new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        name:String
    },
    created:{type:String,default:moment().format('MMMM Do YYYY, hh:mm A')}
});

var Blog = mongoose.model("Blog",blogSchema);

var userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    isVerified: { type: Boolean, default: false },
    password: String,
  });

var User = mongoose.model("User",userSchema);

const tokenSchema = new mongoose.Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    expireAt: { type: Date, default: Date.now, index: { expires: 86400000 } }
});

var Token = mongoose.model("Token",tokenSchema);

app.get("/",function(req,res){
    res.redirect("/blogs");
});

app.get("/login",function(req,res){
    res.render("login.ejs");
});

app.post("/login",function(req,res,next){
    User.findOne({ email: req.body.email }, function(err, user) {
        if (!user){
            req.flash('error','The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.');
            res.redirect('/login');
        }
        else if(!Bcrypt.compareSync(req.body.password, user.password)){
            req.flash('error','Wrong Password!');
            res.redirect('/login');
        }
        else if (!user.isVerified){
            req.flash('error','Your Email has not been verified. Please click on resend');
            res.redirect('/login');
        } else{
            req.session.loggedIn = true;
            req.session.userId = user._id;
            req.session.username = user.name;
            res.redirect("/blogs");
        }
    });

});

app.get("/register",function(req,res){
    res.render("register");
})

app.post('/register',function(req,res,next){
  User.findOne({ email: req.body.email }, function (err, user) {
    if (user) {
        req.flash('error','The email address you have entered is already associated with another account.');
        res.redirect('/register');
    }
    else{
        req.body.password = Bcrypt.hashSync(req.body.password, 10);
        user = new User({ name: req.body.name, email: req.body.email, password: req.body.password });
        user.save(function (err) {
            if (err) { return console.log(err); }

            var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
            token.save(function (err) {
                if (err) {return console.log(err); }

                // Send the email
                var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: 'Username', pass: 'Password' } });
                var mailOptions = { from: 'Your_Email', to: user.email, subject: 'Account Verification Token', text: 'Hello '+ req.body.name +',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n' };
                transporter.sendMail(mailOptions, function (err) {
                    if (err) { 
                        req.flash('error','Technical Issue!, Please click on resend for verify your Email.');
                        res.redirect('/blogs');
                     }
                    req.flash('success','A verification email has been sent to ' + user.email + '. It will be expire after one day. If you not get verification Email click on resend token.')
                    res.redirect('/login');
                });
            });
        });
    }
    
  });

});

app.get('/confirmation/:email/:token',function(req,res,next){
    Token.findOne({ token: req.params.token }, function (err, token) {
        if (!token){
            req.flash('error','We were unable to find a valid token. Your token may have expired. Please click on resend for verify your Email.');
            res.redirect('/login');
        }else{
            User.findOne({ _id: token._userId, email: req.params.email }, function (err, user) {
                if (!user){
                    req.flash('error','We were unable to find a user for this verification. Please SignUp!');
                    res.redirect('/register');
                } 
                else if (user.isVerified){
                    req.flash('success','This user has already been verified. Please Login');
                    res.redirect('/login');
                }
                else{
                    user.isVerified = true;
                    user.save(function (err) {
                        if (err) { return console.log(err); }
                        req.flash('success','The account has been verified. Please Login.')
                        res.redirect("/login");
                    });
                }
            });
        }
        
    });
});

app.get('/resendToken',function(req,res){
    res.render("resendToken");
});

app.post('/resendToken',function(req,res,next) {

    User.findOne({ email: req.body.email }, function (err, user) {
        if (!user){
            req.flash('error','We were unable to find a user with that email. Make sure your Email is correct!');
            res.redirect('/login');
        }
        else if (user.isVerified){
            req.flash('error','This account has already been verified. Please log in.');
            res.redirect('/login');
        } 
        else{
            var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
            token.save(function (err) {
                if (err) { return console.log(err); }
    
                // Send the email
                var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: 'sl_gupta', pass: 'Sohan02210@' } });
                    var mailOptions = { from: 'slgupta022@gmail.com', to: user.email, subject: 'Account Verification Token', text: 'Hello '+ user.name +',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n' };
                    transporter.sendMail(mailOptions, function (err) {
                        if (err) { 
                            req.flash('error','Technical Issue!, Please click on resend verify Email.');
                            res.redirect('/blogs');
                         }
                        req.flash('success','A verification email has been sent to ' + user.email + '. It will be expire after one day. If you not get verification Email click on resend token.')
                        res.redirect('/login');
                    });
            });
        }
    });
});

app.get('/logout',function(req,res){
    req.session.loggedIn = false;
    req.session.userId = undefined;
    req.session.username = undefined;
    res.redirect('/blogs');
})

app.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs){
        if(err){
            console.log(err);
        } else{
            res.render("index",{blogs:blogs});
        }
    });
});

app.get("/blogs/new",isLoggedIn,function(req,res){
    res.render("new");
});

app.post("/blogs",function(req,res){
    Blog.create(req.body.blog,function(err,newBlog){
        if(err){
            console.log(err);
        } else{
            newBlog.author.id = currentUserId;
            newBlog.author.name = currentUser;
            newBlog.save();
            req.flash('success','Blog added successfully');
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("show",{blog:foundBlog,userId:currentUserId});
        }
    });
});

app.get("/blogs/:id/edit",checkBlogOwner,function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("edit",{blog:foundBlog});
        }
    });
});

app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err){
            res.redirect("/blogs");
        } else{
            req.flash('success','Blog updated successfully');
            res.redirect("/blogs/"+ req.params.id);
        }
    });
});

app.delete("/blogs/:id",checkBlogOwner,function(req,res){
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/blogs");
        } else{
            req.flash('success','Blog deleted successfully');
            res.redirect("/blogs");
        }
    });
});

function isLoggedIn(req,res,next){
    if(req.session.loggedIn){
        return next();
    }
    req.flash('error','Please Login!');
    res.redirect("/login");
}

function checkBlogOwner(req,res,next){
    if(req.session.loggedIn){
        Blog.findById(req.params.id,function(err,foundBlog){
            if(err || !foundBlog){
                req.flash('error','Blog not found!');
                res.redirect('/blog');
            }else{
                if(foundBlog.author.id == currentUserId){
                    next();
                } else{
                    req.flash('error','You have not permission to do that.');
                    res.redirect('/blogs');
                }
            }
        });
    }else{
        req.flash('error','Please Login!');
        res.redirect("/login");
    }
    
}

app.listen(3000,function(){
    console.log("Server has Started...");
});
