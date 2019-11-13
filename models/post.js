var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    title: {type: String, required: true},
    body: {type: String, required: true},
    created: {type: Date, default: Date.now},
    writer: {type: String, required: true},
    
    petName: {type: String},
    petSex: {type: String},
    petType: {type: String},
    lostPlace: {type: String, required: true},
    lostDate: {type: Date},
    money:{type: Number},

    comments:[{
      body: {type:String, required: true},
      writer:{type:String, required: true},
      created:{type:Date, default:Date.now}
    }]
  });

module.exports = mongoose.model('Post',postSchema);
