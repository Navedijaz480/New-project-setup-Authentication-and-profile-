  //helper functions
  const { isObjectEmpty } = require("../helpers/objectEmptyChecker");

  const bodyChecker = async (req, res, next) => {
    if (isObjectEmpty(req.body)) {
      return res.status(404).json({
        error: true,
        response: "Body required!",
      });
      
    } else {
      next();
    }
  };
  
  module.exports = { bodyChecker };
     