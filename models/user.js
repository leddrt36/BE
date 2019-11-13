var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    ID: {type: String, required: true},
    PW: {type: String, required: true},
    name: {type: String, required: true},
    phone: {type: String, required: true},
    email: {type: String, required: true},
    live: {type: String, required: true}
});

userSchema.pre("save",function(next){
  var user = this;
  if(!user.isModified("PW")){
    return next();
  } else{
    user.PW = bcrypt.hashSync(user.PW);
    return next();
  }
});
userSchema.methods.authenticate = function(PW){
  var user = this;
  return bcrypt.compareSync(PW, user.PW);
};
userSchema.methods.hash = function(PW){
  return bcrypt.hashSync(PW);
};

module.exports = mongoose.model('User', userSchema);
