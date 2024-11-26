const mongoose = require('mongoose');
const { errorResponse } = require('../helpers/response');

const validateObjectId = (req, res, next) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return errorResponse(res, 'Invalid ID format', 400);
    }
    next();
};

module.exports = validateObjectId;
