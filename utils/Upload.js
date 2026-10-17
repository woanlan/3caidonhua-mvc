const multer = require('multer');

/**
 * Cấu hình Multer Upload File theo đúng chuẩn tài liệu bài giảng Google Doc
 * Bước 2: Tạo file Upload.js để setup đường dẫn lưu file và cách đặt tên cho file khi được upload
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

module.exports = multer({ storage: storage });
