var express = require('express');
var passport = require('passport');

var router = express.Router();
var User = require('mongoose').model('User');

var LocalStrategy = require('passport-local').Strategy;
passport.use('local-login',
  new LocalStrategy({
    usernameField: 'ID',
    passwordField: 'PW',
    session:true,
    passReqToCallback: true
  },
  function(req, ID, PW, done){
    User.findOne({'ID':ID}, function(err, user){
      if(err) return done(err);
      if(!user){
        req.flash("ID",req.body.ID);
        return done(null, false, req.flash('loginError','Check ID or Password'));
      }
      if(!user.authenticate(PW)){
        req.flash("ID", req.body.ID);
        return done(null, false, req.flash('loginError','Check ID or Password'));
      }
      return done(null,user);
    });
  })
);
router.get('/',function(req,res){
    res.render('login/login',{ID:req.flash('ID'), loginError: req.flash('loginError')});
}); // login form view
router.post('/',function(req,res,next){
    req.flash("ID");
    if(req.body.ID.length === 0 || req.body.PW.length === 0){
      req.flash("ID",req.body.ID);
      req.flash("loginError", "Please enter both ID and Password");
      res.redirect('/login');
    }
    else{
      next(); 
    }
  }, passport.authenticate('local-login',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
  );// login 시도
  
  router.get('/logout',function(req,res){
    req.session.destroy();
    res.redirect('/');
}); // logout
module.exports = router;