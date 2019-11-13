var express = require('express');
var router = express.Router();

var Post = require('mongoose').model('Post');
var async = require('async');

router.get('/', isLoggedIn, function(req, res, next) {
  var page = req.query.page ? req.query.page : 1;
  var search = createSearch(req.query.searchText);
  if(search.searchText == undefined){
    search.searchText='';
  }
  var limit = 10;
  
  async.waterfall([function(callback){
    Post.count(search.findPost,function(err,count){
      if(err) return res.json({success: false, message: err});
      var skip=(page-1)*limit;
      var maxPage=Math.ceil(count/limit);
      callback(null, skip, maxPage);
    });
  },function(skip, maxPage, callback){
    Post.find(search.findPost).sort('-created').skip(skip).limit(limit).exec(function(err, posts){
      if(err) return res.json({success: false, message: err});
      res.render("posts/list", {posts: posts, user:req.user, page:page, maxPage:maxPage, search:search});
    });
  }], function(err){
    if(err) return res.json({success: false, message: err});
  });
});// 게시물 목록 보기

router.get('/new', isLoggedIn, function(req,res){
  res.render('posts/new',{user: req.user});
}) // 게시물 작성 view
router.post('/', isLoggedIn, function(req, res){
  req.body.writer = req.user.name;

  var data=req.body;
  var lostPlace = data.lostPlace.split(" ");
  var petType = data.petType;
  var setTitle = petType + " " + lostPlace[lostPlace.length-1];

  req.body.title = setTitle;

  Post.create(req.body, function(err, post){
    if(err) return res.json({success: false, message: err});
    res.redirect('/posts');
  });
}); // 게시물 작성

router.get('/:id', function(req, res){
  Post.findById(req.params.id,function(err, post){
    if(err) return res.json({success: false, message: err});
    res.render("posts/show",{post: post});
  });
}); // 특정 게시물 보기

router.get('/:id/edit',function(req,res){
  Post.findById(req.params.id, function(err, post){
    if(err) return res.json({success: false, message: err});
    res.render("posts/edit",{post: post});
  });
}); // 게시물 수정 view
router.put('/:id',function(req, res){
  Post.findByIdAndUpdate(req.params.id, req.body, function(err, post){
    if(err) return res.json({success: false, message: err});
    res.redirect("/posts/"+req.params.id);
  });
}); // 특정 게시물 수정

router.delete('/:id',function(req, res){
  Post.findByIdAndRemove(req.params.id, function(err, post){
    if(err) return res.json({success: false, message: err});
    res.redirect('/posts');
  });
}); // 특정 게시물 삭제

router.post('/:id/comments',function(req,res){
  var newComment = req.body;
  newComment.writer = req.user.name;
  Post.update({_id:req.params.id},{$push:{comments:newComment}},function(err,post){
    if(err) return res.json({success: false, message: err});
    res.redirect('/posts/'+req.params.id);
  });
}); // 댓글 달기
router.delete('/:id/comments/:commentId',function(req,res){
  Post.update({_id:req.params.id},{$pull:{comments:{_id:req.params.commentId}}},function(err,post){
      if(err) return res.json({success: false, message: err});
      res.redirect('/posts/'+req.params.id+"?"+req._parsedUrl.query.replace(/_method=(.*?)(&|$)/ig,""));
    });
});// 댓글 삭제

module.exports = router;

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

function createSearch(text){
  var findPost={};
  if(text){
    var postQueries=[];
    postQueries.push({title:{ $regex: new RegExp(text,"i")}});
    if(postQueries.length > 0){
      findPost={$or:postQueries};
    }
  }
  return {searchText:text, findPost:findPost};
}