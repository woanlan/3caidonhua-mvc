// ====================================================================================
// [NGHIỆP VỤ TẢI LÊN ẢNH / MULTER] - upload.js
// Xử lý upload ảnh đơn (single) hoặc nhiều ảnh (multiple) vào thư mục public/images
// ====================================================================================

const express = require('express');
const router = express.Router();
const upload = require('../utils/Upload');

/**
 * [NGHIỆP VỤ TẢI LÊN ẢNH] - 1. Upload ảnh đơn (Single file)
 * Endpoint: POST /upload hoặc POST /api/upload
 * FormData key: 'image'
 */
router.post('/upload', [upload.single('image')], async (req, res, next) => {
    try {
        const { file } = req;
        if (!file) {
            return res.json({ status: 0, link: "", message: "Không có file nào được chọn" });
        } else {
            const url = `/images/${file.filename}`; // Đường dẫn lưu trong CSDL
            return res.json({ status: 1, url: url, link: url, filename: file.filename });
        }
    } catch (error) {
        console.log('Upload image error: ', error);
        return res.json({ status: 0, link: "", message: error.message });
    }
});

/**
 * [NGHIỆP VỤ TẢI LÊN ẢNH] - 2. Upload nhiều ảnh cùng lúc (Multiple files)
 * Endpoint: POST /uploads hoặc POST /api/uploads (Tối đa 9 ảnh cùng lúc)
 * FormData key: 'image'
 */
router.post('/uploads', [upload.array('image', 9)], async (req, res, next) => {
    try {
        const { files } = req;
        if (!files || files.length === 0) {
            return res.json({ status: 0, link: [], message: "Không có file nào được chọn" });
        } else {
            const url = [];
            for (const singleFile of files) {
                url.push(`/images/${singleFile.filename}`);
            }
            return res.json({ status: 1, url: url, link: url });
        }
    } catch (error) {
        console.log('Upload image error: ', error);
        return res.json({ status: 0, link: [], message: error.message });
    }
});

module.exports = router;
