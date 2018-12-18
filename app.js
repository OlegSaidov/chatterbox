var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash= require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy
var multer  = require('multer')
var upload = multer({ dest: 'public/uploads/' })
var session = require('express-session');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var expressValidator=require('express-validator');

var usersRouter = require('./routes/users');
var chatRouter = require('./routes/chat');

var port = process.env.PORT || 3000;

var app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
server.listen(port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/emoji', express.static(__dirname + '/node_modules/emojionearea/dist/'));

var usernames = [];
var avatars=[];

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Handle sessionsnpm start
app.use(session({secret:'secret'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator());
app.use(flash());

app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  res.locals.user = req.user || null;
  next();
});

app.use('/', chatRouter);
app.use('/users', usersRouter);




/*app.listen(port , function (){
	console.log('server is running on port '+port);
}); */

//chat functions
io.on('connection',function(socket){
	socket.on('send message',function(data){
		//broadcast to all users
		io.sockets.emit('new message', {msg: data, user:socket.username, avatar:socket.avatar});
		console.log("1" + data + " " + socket.username + " " + socket.avatar);
	});

	socket.on('new user', function(data,callback){
		if (usernames.indexOf(data) != -1){
				callback(false)
		}else{
			callback(true)
		  socket.username = data.user;
			socket.avatar= data.avatar;
		  usernames.push(socket.username);
			avatars.push(socket.avatar);
			updateUsernames();
			console.log("2" + data.user + " " +data.avatar)
			console.log ("3" + usernames + " " + avatars)
		}
	});

// update usernames array
function updateUsernames(){
		io.sockets.emit('usernames', {usernames:usernames, avatars:avatars});
		console.log("4" + usernames + " " + avatars)
}

socket.on('typing', function(data){
	//everyone except the user
	socket.broadcast.emit('typing', data);
	console.log("5" + data)
})

socket.on('not typing', function(data){
	//everyone except the user
	socket.broadcast.emit('not typing', data);
	console.log("6" + data)
})


	socket.on('disconnect', function(data){
		if(!socket.username) return;
		usernames.splice(usernames.indexOf(socket.username), 1);
		avatars.splice(avatars.indexOf(socket.avatar), 1);
		updateUsernames();
		console.log("7" + socket.avatar + socket.username)
	})
});


console.log("Wow something is working!");