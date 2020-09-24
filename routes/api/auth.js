const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { auth } = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User')


// @route GET api/auth
// @desc  get auth user
// @access Public

router.get('/',auth,async (req,res)=>{
    try {
        let user = await User.findbyId( req.user.id ).select('-password');
    if (!user) {
        return res.status(400).json({ error: [{ msg: 'Access denied!' }] })
    }

    res.status(200).json({user:user});
    } catch (error) {
        res.status(500).send('Sever error!')
    }

})





// @route POST api/auth
// @desc  login user
// @access Public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'password cannot be empty ').not().isEmpty()

],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // check if user exists
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: [{ msg: 'Wrong credentials' }] })
            }

            // check for valid password 
             const isPasswordValid = await bcrypt.compare(password,user.password);
            
             if(!isPasswordValid) return res.status(400).json({ error: [{ msg: 'Wrong credentials' }] });

            // send jwt 
            let token = user.getAuthToken();
            console.log("tokenfff",token);
            res.send({ token: token })
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Sever error!')
        }
       
    });



module.exports = router;
