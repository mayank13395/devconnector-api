const express = require('express');
const request = require('request');
const { auth } = require('../../middleware/auth');
const router = express.Router();
const Profile = require('../../models/Profile');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const config = require('config');

// @route GET api/profile/me
// @desc  get current user profile
// @access Private
router.get('/me',auth, 
async (req,res)=>{
    try {
        const profile = await Profile.findOne({user:require.user.id}).populate('user',
        ['name','avatar']);

        if(!profile) return res.status(400).json({msg: 'There is no profile for this user'});

        res.json(profile);
    } catch (err) {
        console.error(error.message);
        res.status(500).send('Sever error!')
    }
});

// @route POST api/profile
// @desc  add profile
// @access Private
router.post('/',[auth,
    [
        check('status', 'status is required').not().isEmpty(),
        check('skills', 'skills is required').not().isEmpty(),
    ],
], 
async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facabook,
        instagram,
        twitter,
        linkedin
    } = req.body;
     
    const profileObj = {
        user: req.user.id,
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills: skills.split(',').map(skill => skill.trim()),
        social:{
        youtube,
        facabook,
        instagram,
        twitter,
        linkedin
        },    
    }

    try {
        const profile = await Profile.findOne({user:req.user.id});

        if(profile) {
            // need to update
            profile = await Profile.findOneAndUpdate({user:req.user.id},
                {$set:profileObj},
                {new:true});
            res.json(profile);
        }
        // need to create 
        profile = new Profile(profileObj);
       await profile.save();
        res.json(profile);
        
    } catch (err) {
        console.error(error.message);
        res.status(500).send('Sever error!')
    }
});

// @route GET api/profile
// @desc  get all profile
// @access Public

router.get('/',async (req,res)=>{
   try {
    const profiles = await Profile.find().populate('user',
    ['name','avatar']);
    res.json(profiles)

   } catch (err) {
    console.error(error.message);
    res.status(500).send('Sever error!')
   }
});


// @route GET api/profile/user/:user_id
// @desc  get single profile
// @access Public

router.get('/user/:user_id',async (req,res)=>{
    try {
     const profile = await Profile.findOne({user:req.params.user_id}).populate('user',
     ['name','avatar']);
     if (!profile) {
        return res.status(400).json({ error: [{ msg: 'Profile not found!' }] })
    }
     res.json(profile)

    } catch (err) {
     console.error(error.message);
     if(err.kind == 'ObjectId')
     return res.status(400).send('Profile not found!')
    }
 });

 // @route DELTE api/profile
// @desc  delete profile , user & posts
// @access Private

router.delete('/',auth, async (req,res)=>{
    try {
     //remove profile
     await Profile.findOneAndRemove({user:req.user.id});

     // remove user
     await User.findOneAndRemove({_id:req.user.id});
    
     // todo: remove posts


     res.json({msg: 'user deleted'})
    } catch (err) {
     console.error(error.message);
     res.status(500).send('Sever error!')
    }
 });

 // @route PUT api/profile/experience
// @desc  create profile experience
// @access Private

router.put('/experience',[auth,
[
    check('title', 'title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty(),
]],
async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    };
    const {
        title,
        company,
        from,
        to,
        current,
        description
    } = req.body;
    const newExp = {
        title,
        company,
        from,
        to,
        current,
        description
    }
    try {
     const profile = await Profile.findOne({user:req.user.id});
     profile.experience.unshift(newExp);
     await profile.save();
     res.json(profile)

    } catch (err) {
     console.error(error.message);
     if(err.kind == 'ObjectId')
     return res.status(400).send('Profile not found!')
    }
 });

 // @route DELTE api/profile/experience/:exp_id
// @desc  delete profile experience
// @access Private

router.delete('/experience/:exp_id',auth, async(req,res)=>{
    try {
     //get profile by user id
      const profile = await Profile.findOne({user:req.user.id});

    // get experience index to remove 
    const removeIndex = profile.experience.map(exp => exp.id).indexOf(req.params.exp_id);

    // remove exp from profile
    profile.experience.splice(removeIndex,1);

    // save to database
    await  profile.save();

     res.json(profile)
    } catch (err) {
     console.error(error.message);
     res.status(500).send('Sever error!')
    }
 });
module.exports = router;

 // @route PUT api/profile/education
// @desc  create profile education
// @access Private

router.put('/education',[auth,
    [
        check('school', 'school is required').not().isEmpty(),
        check('degree', 'degree is required').not().isEmpty(),
        check('fieldofstudy', 'fieldofstudy  is required').not().isEmpty(),
    ]],
    async (req,res)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        };
        const {
            school,
            degree,
            fieldofstudy,
            description
        } = req.body;
        const newEdu = {
            school,
            degree,
            fieldofstudy,
            description
        }
        try {
         const profile = await Profile.findOne({user:req.user.id});
         profile.education.unshift(newEdu);
         await profile.save();
         res.json(profile)
    
        } catch (err) {
         console.error(error.message);
         if(err.kind == 'ObjectId')
         return res.status(400).send('Profile not found!')
        }
     });
    
     // @route DELTE api/profile/experience/:edu_id
    // @desc  delete profile experience
    // @access Private
    
    router.delete('/experience/:edu_id',auth, async (req,res)=>{
        try {
         //get profile by user id
          const profile = await Profile.findOne({user:req.user.id});
    
        // get experience index to remove 
        const removeIndex = profile.education.map(exp => exp.id).indexOf(req.params.edu_id);
    
        // remove exp from profile
        profile.education.splice(removeIndex,1);
    
        // save to database
        await  profile.save();
    
         res.json(profile)
        } catch (err) {
         console.error(error.message);
         res.status(500).send('Sever error!')
        }
     });

    
     // @route GET api/profile/github/:username
    // @desc  get repos of github user
    // @access Public
    router.get('/github/:username', (req,res)=>{
            console.log("calhjkkg");
        try {
         const options = {
             uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&
             sort=created:asc&client_id=${config.get('githubClientId')}&
             client_secret=${config.get('githubSecret')}`,
             method: "GET",
             headers: {'user-agent':'node.js'}
         };
         request(options,(error,response,body)=>{
             if(error) console.error(error);
             if(response.statusCode != 200) {
                return res.status(404).json({msg: 'no github profile found'})
             }
             res.json(JSON.parse(body) );
         });
         
     
        } catch (err) {
         console.error(err.message);
         res.status(500).send('Sever error!')
        }
     });
    module.exports = router;