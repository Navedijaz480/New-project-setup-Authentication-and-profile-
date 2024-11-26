const jwt = require('jsonwebtoken');

exports.userAuth = (req, res, next) => {
    let token =req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({
            error: true,
            message: "Authorization token is missing"
        });
    }
    else
    {
     token = req.headers.authorization.split(' ')[1] ;  
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ error_msg: "Not authorized enter correct token" });
            } else {
                req.user = decodedToken;
                    next();       
            }
        });
    }
    
};

