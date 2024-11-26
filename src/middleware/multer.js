const multer = require("multer");
const path = require("path");

// Multer config
module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== '.webp' &&
            ext !== '.pdf' && ext !== '.doc' && ext !== '.docx' &&
            ext !== '.ppt' && ext !== '.pptx' && ext !== '.xls' && ext !== '.xlsx' &&
            ext !== '.txt' && ext !== '.rtf') {
            cb(new Error("File type is not supported"), false);
            return;
        }
        cb(null, true);
    },
});
