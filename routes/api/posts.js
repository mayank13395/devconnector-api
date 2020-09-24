const express = require('express');
const { auth } = require('../../middleware/auth');
const router = express.Router();
const User = require('../../models/User');
const Post = require('../../models/Post');
const { check, validationResult } = require('express-validator');


// @route POST api/posts
// @desc  create post
// @access Private
router.post('/',[auth, 
    [
    check('text', 'text is required').not().isEmpty(),
],
], 
async (req,res)=>{
const errors = validationResult(req);
if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        const newPost = {
            text : req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }
      
        const post = new Post(newPost);
       await post.save();
        res.json(post);

    } catch (err) {
        console.error(error.message);
        res.status(500).send('Sever error!')
    }
})



// @route GET api/posts
// @desc  get all posts
// @access Private

router.get('/',auth,async (req,res)=>{
    try {
     const posts = await Post.find().sort({date: -1});

     res.json(posts);
 
    } catch (err) {
     console.error(error.message);
     res.status(500).send('Sever error!')
    }
 });

 
// @route GET api/posts/:id
// @desc  get post by id
// @access Private

router.get('/:id',auth,async (req,res)=>{
    try {
     const post = await Post.findById(req.params.id);
     if(!post)return res.status(404).json({msg:'post not found'})
     res.json(post);
 
    } catch (err) {
     console.error(error.message);
     if(err.kind == 'ObjectId')return res.status(404).json({msg:'post not found'});
     res.status(500).send('Sever error!')

    }
 });


  // @route DELETE api/post/:id
// @desc  delete post
// @access Private

router.delete('/:id',auth, async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);

        post.remove();
        res.json({msg: 'Post deleted'});

    } catch (err) {
     console.error(error.message);
     if(err.kind == 'ObjectId')return res.status(404).json({msg:'post not found'});
     res.status(500).send('Sever error!')
    }
 });

 // @route PUT api/posts/like/:id
// @desc  like a post
// @access Private

router.put('/like/:id',auth,async (req,res)=>{
    try {
     const post = await Post.findById(req.params.id);

     //check if post is already liked
     if(post.likes.filter(like=>like.user.toString() === req.user.id ).length > 0){
       return res.status(404).json({msg: 'post already liked'})
     }

     post.likes.unshift({user:req.user.id});
    await post.save();
     res.json(post.likes);
 
    } catch (err) {
     console.error(error.message);
    //  if(err.kind == 'ObjectId')return res.status(404).json({msg:'post not found'});
     res.status(500).send('Sever error!')

    }
 });

 
 // @route PUT api/posts/unlike/:id
// @desc  unlike a post
// @access Private

router.put('/like/:id',auth,async (req,res)=>{
    try {
     const post = await Post.findById(req.params.id);

     //check if post is already liked
     if(post.likes.filter(like=>like.user.toString() === req.user.id ).length = 0){
       return res.status(404).json({msg: 'post has not yet liked'})
     }
     
     //remove like
     const removeIndex = profile.likes.map(like => like.user.toString()).indexOf(req.user.id);

     // remove exp from profile
     profile.likes.splice(removeIndex,1);
     
    await post.save();
     res.json(post.likes);
 
    } catch (err) {
     console.error(error.message);
    //  if(err.kind == 'ObjectId')return res.status(404).json({msg:'post not found'});
     res.status(500).send('Sever error!')

    }
 });

 // @route POST api/posts/comment/:id
// @desc  comment on post
// @access Private
router.post('/comment/:id',[auth, 
    [
    check('text', 'text is required').not().isEmpty(),
],
], 
async (req,res)=>{
const errors = validationResult(req);
if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}
    try {
        const user = await User.findById(req.user.id).select('-password');
     const post = await Post.findById(req.params.id);
        
        const newComment = {
            text : req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }
      
      post.comments.unshift(newComment);
       await post.save();
        res.json(post.comments);

    } catch (err) {
        console.error(error.message);
        res.status(500).send('Sever error!')
    }
});


  // @route DELETE api/post/comment/:id/comment_id
// @desc  delete comment
// @access Private

router.delete('/comment/:id/comment_id',auth, async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        
        const comment = await Post.comments.find(comment => comment.id === req.params.comment_id);
        if(!comment) {
            return res.status(404).json({msg:'comment not found'});
        }
        //check if right user is deleting the comment
        if(comment.user.toString() != req.user.id ){
            return res.status(401).json({msg:'user not authorized'});
        }
        const removeIndex = profile.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        // remove exp from profile
        profile.comments.splice(removeIndex,1);
        await post.save();
        res.json(post.comments);

    } catch (err) {
     console.error(error.message);
     res.status(500).send('Sever error!')
    }
 });



module.exports = router;