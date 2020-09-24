const mongoose  = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        required : true,
        unique : true
    },
    password:{
        type : String,
        required : true,
    },
    avatar: {
        type : String
    },
    date : {
        type : Date,
        default : Date.now
    }
});

userSchema.methods.getAuthToken = function () {
    console.log("get token called--------");
   const token = jwt.sign({user: {
        id: this._id
    }},config.get('jwtSecret'),{expiresIn : 360000000});

    return token;
}

module.exports = User = mongoose.model('user',userSchema);