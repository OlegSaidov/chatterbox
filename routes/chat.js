var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', auth, function(req, res, next) {
  res.render('chat');
});


function auth(req,res, next){ // before you try to show user the homepage, check the auth middleware function, if the request .isAuthenticated() property is true, then skip to callback and render index.js  
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/users/login'); // Else redirect user to login page
}

module.exports = router;
