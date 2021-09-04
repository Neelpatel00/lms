const express = require("express");
const session = require("express-session");
var bodyParser = require('body-parser'); 
const mongoose = require("mongoose");
const User = require('./models/user');
const multer  = require('multer');
const res = require("express/lib/response");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+ file.originalname )
    }
  });

const upload = multer({ storage: storage });

const app = express();

const port = process.env.PORT || 2000;

const dburi = "mongodb+srv://neel:neel007@node.tflje.mongodb.net/lms?retryWrites=true&w=majority";
mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log('not connected'));

//mongoose.set('useFindAndModify',false);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine','ejs');
app.use(express.static(__dirname+'/public'));

app.use(session({
    secret: 'abc',
    saveUninitialized: true,
    resave: true
}));

var sess;
app.get("/", (req, res) => {

    if(req.session.loggedIn){
        res.render('home',{ title: 'welcome',login: true });
    }
    else{
        res.render('home', { login: false });
    }
});

app.get('/getlogin',(req, res) => {
    res.render('login', { mes: true, login: false });
});

app.post('/login', (req, res) => {
    
    User.exists({username: req.body.unm, password: req.body.pw}, (err, doc) =>{
        if(err){
            console.log('error');
            res.send(err);
        }
        else{
            console.log(doc)
            if(doc){
                req.session.loggedIn = true;
                sess = doc;
                 
                console.log('successfully log in');
                res.render('home',{ unm: req.body.unm, login: true });
            }
            else{
                res.render('login', { mes: false });
            }
            
        }
    } )
});


app.get('/logout',(req,res)=>{
    req.session.destroy((err) => {
        if(err){
            console.log('error');
        }
    });
    console.log('logout..');
    res.redirect('/');
});

app.post('/regester', upload.single('img'), (req, res) => {
    
    
    const user = new User({
        username: req.body.unm,
        email: req.body.email,
        password: req.body.pw,
        mo_no: req.body.mo_no,
        img:req.file.filename
    });
    
    user.save()
        .then((result) => {
            res.render('login', { mes: true, login: false });
        })
        .catch((err) => {
            res.redirect('/404');
        });
});

app.get('/user',(req, res) => {
    User.find().sort( { createdAt: -1 } )
        .then((result) => {
            res.render('profile',{ ss: sess, user: result ,  login: true });
        })
        .catch((err) => {
            console.log('error');
        });
        
});

app.get('/task',(req, res)=> {
    res.render('task',{ login: true });
});

app.post('/addtask', (req, res) => {
 
    var addtask = {
        description:req.body.dis,
           completed: req.body.tf,
           time: req.body.tm
    };
   
    User.findOneAndUpdate(
        { _id: sess },
        { $push: { task: addtask } },
        (err, success) => {
            if(err){
                console.log('error');
            }
            else{
                res.redirect('/alltask');
            }
        });
   
    
});

app.get('/alltask', (req, res) => {
    User.findById(sess)
        .then((result) => {
            res.render('alltask', { login: true, tasks: result.task, tid: sess._id });
        })
        .catch((err) => console.log('error'));

});

app.get('/alltask/:id/:pid',(req, res) => {
    User.findById(req.params.id)
        .then((result) => {
           var data = result.task.find(obj => {
               return obj._id == req.params.pid
           });
          
           res.render('details',{ login: true, tasks: data, mid: result._id });
        })
       .catch((err) => {
           console.log(err);
       });
});

app.get('/task/edit/:id/:pid',(req, res) => {
    User.findById(req.params.id)
     .then((result) => {
           var data = result.task.find(obj => {
               return obj._id == req.params.pid
           });
           res.render('update',{ login: true, tasks: data , mid: result._id });
        })
       .catch((err) => {
           console.log(err);
       });
});

app.post('/task/edit/:id/:pid',(req, res) => {
    User.updateOne(
        { 'task._id': req.params.pid },
        { $set: { 
            'task.$.description':req.body.dis,
           'task.$.completed': req.body.tf,
           'task.$.time': req.body.tm
         } 
    }, (err) => {
        if(err){
            console.log(err);
        }
        else{
            res.redirect('/alltask');
        }
    })
});

app.get('/task/delete/:id/:pid',(req, res) => {
    User.findByIdAndUpdate(
        req.params.id,
        { $pull: { 'task': { _id: req.params.pid } } },(err) =>{
            if(err){
                console.log('error');
            }
            else{
                res.redirect('/alltask');
            }
        }
    )
});

app.get('/dash', (req, res) => {
    res.render('dash', { login: true });
});

app.get('/html', (req, res) => {
    res.render('html', { login: true });
});

app.get('/css', (req, res) => {
    res.render('css', { login: true });
});

app.get('/javascript', (req, res) => {
    res.render('javascript', { login: true });
});

app.get("/profile/:id", (req, res) => {
    User.findById(req.params.id)
        .then((result) => {
            console.log(result);
            res.render('updatep',{ login: true, tasks: result });
        })
        .catch((err) => {
            console.log(err);
        })
});

app.post('/profile/:id', upload.single('img') ,(req, res) => {


    User.updateOne(
        {'_id': req.params.id},
        {$set: {
            'username': req.body.unm,
            'email': req.body.email,
            'password': req.body.pw,
            'mo_no': req.body.mo_no,
            'img': req.file.filename
        } }, (err,data) =>{
            if(err){
                console.log('error');
            }
            else{
                console.log(data);
                res.redirect('/');
            }
        });
 
 });

app.get('/404',(req, res) => {
    res.render('404',{ login: false });
});

app.listen(port, (err) => {
    console.log('listing on port no.',port);
});
