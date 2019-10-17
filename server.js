//Such var much require
    var express = require('express');
    var cors = require('cors');
    var app = express();
    var mongoose = require('mongoose');
    var bodyParser = require('body-parser'); //Returns middleware that only parses json
    var multipart = require('connect-multiparty'); //Middleware for uploads i.e user pics
    var multipartMiddleware = multipart();
    var server = require('http').createServer(app);

//LIVE PORT
    var port = 8080;
//LOCAL DEV ENV PORT
    // var port = 3000;
//Controllers
    var visionController = require('./server/controllers/vision-controller');
    var authController = require('./server/controllers/auth-controller');
    var dodgyRocksController = require('./server/controllers/dodgy-rocks');
    var gifMeController = require('./server/controllers/gifme-controller');
//Usage
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multipartMiddleware);
app.use(cors());
app.use('/node_modules', express.static(__dirname + "/node_modules"));
app.use('/app', express.static(__dirname + "/app" ));
app.get('/', function(req, res){
    res.sendfile('index.html');
});

//Connect to our mongodb
function connect() {
    console.log("Connected to db");
    return mongoose.connect('mongodb://' + process.env.IP + '/waila').connection;
}

//Listen in
function listen() {
    server.listen(port, function(){
    console.log("It's all going down on PORT " + port);
    });
}

connect()
    .on('error', console.log)
    .once('open', listen);

//API Endpoints
//The endpoint route for image classification
    app.post('/api/vision/imageClassify', multipartMiddleware, visionController.imageClassify);
    app.post('/api/user/signup', authController.signup);
    app.post('/api/user/signin', authController.signin);
    
//Dodgy Rocks endpoints
    app.post('/api/dodgyrocks/createScore', multipartMiddleware, dodgyRocksController.createScore);
    app.get('/api/dodgyrocks/getScores', dodgyRocksController.getScores);
    app.post('/api/dodgyrocks/updateFirebaseToken', dodgyRocksController.updateFirebaseToken);
    app.post('/api/dodgyrocks/slackTest', dodgyRocksController.slackTest);
    app.post('/api/dodgyrocks/sendCustomPushToAll', dodgyRocksController.sendCustomPushToAll);

//GIFme endpoints
    app.post('/api/gifme/updateUsers', gifMeController.updateUsers);