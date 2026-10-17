const express = require('express');
const router = express.Router();
const upload = require('../utils/Upload');

/**
 * Routes Upload File (Single & Multiple)
 * Theo đúng chuẩn tài liệu bài giảng Google Doc môn WEB503
 */

// 1. Upload Single File (POST /upload hoặc POST /api/upload)
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

// 2. Upload Multiple Files (POST /uploads hoặc POST /api/uploads, tối đa 9 file)
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
