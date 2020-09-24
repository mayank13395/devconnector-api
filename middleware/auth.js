const jwt = require('jsonwebtoken');
const config = require('config');
exports.auth = (req,res,next) => {
    const token = req.header('x-auth-token');

    if(!token) return res.status(401).json({msg:'No token provided , authorization denied'});

    try {
    const decoded = jwt.verify(token,config.get('jwtSecret'));
    req.user = decoded.user;
       next(); 
    } catch (error) {
        console.error("auth middleware error",error.message);
        return res.status(401).json({msg:'Invalid Token , Authorization Denied'});
    }
    
}