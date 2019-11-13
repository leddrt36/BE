var express = require('express');
var router = express.Router();

var User = require('mongoose').model('User');
var async = require('async');
var mongoose = require('mongoose');


router.get('/new',function(req,res){
  res.render('users/new',{
    formData: req.flash('formData')[0],
    IDError: req.flash('IDError'),
    phoneError: req.flash('phoneError')
  });
});// user 생성 view
router.post('/', checkUserRegValidation, function(req, res, next){
  User.create(req.body, function(err,user){
    if(err) return res.json({success: false, message: err});
    res.redirect('/login');
  });
});// user 생성

router.get('/:id', isLoggedIn, function(req, res, next) {
  User.findById(req.params.id,function(err,user){
    if(err) return res.json({success: false, message: err});
    res.render("users/show",{user: user});
  })
}); // user 정보 보기

router.get('/:id/edit', isLoggedIn, function(req, res, next) {
  User.findById(req.params.id,function(err,user){
    if(err) return res.json({success: false, message: err});
    res.render("users/edit",{
      user: user,
      formData: req.flash('formData')[0],
      IDError: req.flash('IDError'),
      phoneError: req.flash('PhoneError'),
      PWError: req.flash('PasswordError')
    });
  });
}); // user 정보 수정 view
router.put('/:id', isLoggedIn, checkUserRegValidation, function(req, res){
  User.findById(req.params.id, req.body, function(err,user){
    if(err) return res.json({success: false, message: err});
    if(user.authenticate(req.body.PW)){
      if(req.body.newPW){
        req.body.PW = user.hash(req.body.newPW);
      } else{
        delete req.body.PW;
      }
      User.findByIdAndUpdate(req.params.id, req.body, function(err, user){
        if(err) return res.json({success: false, message: err});
        res.redirect('/users/'+req.params.id);
      });
    } else{
      req.flash("formData",req.body);
      req.flash("PasswordError","- Invalid password");
      res.redirect('/users/'+req.params.id+"/edit");
    }
  });
}); // user 정보 수정

module.exports = router;

function checkUserRegValidation(req,res,next){
  var isValid=true;

  req.flash("IDError");
  req.flash("phoneError");
  req.flash("formData");
  async.waterfall(
      [function(callback){
          User.findOne({ID: req.body.ID, _id:{$ne: mongoose.Types.ObjectId(req.params.id)}},
              function(err,user){
                  if(user){
                      isValid=false;
                      req.flash("IDError","This ID is already resistered.");
                  }
                  callback(null,isValid);
              }
          );
      }, function(isValid,callback){
          User.findOne({phone: req.body.phone, _id:{$ne:mongoose.Types.ObjectId(req.params.id)}},
              function(err,user){
                  if(user){
                      isValid=false;
                      req.flash("phoneError","This phone-number is already resistered.");
                  }
                  callback(null,isValid);
              }
          );
      }], function(err,isValid){
          if(err) return res.json({success:"false", message:err});
          if(isValid){
              return next();
          } else{
              req.flash("formData", req.body);
              res.redirect("/users/new");
          }
      }
  );
}
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}