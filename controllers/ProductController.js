const productModel = require('../models/product');
const billDetailModel = require('../models/billdetail');

// Hàm chuẩn hóa dữ liệu sản phẩm phục vụ hiển thị
function mapProduct(p) {
    if (!p) return null;
    let brandName = 'Bandai Spirits';
    if (p.name && p.name.toLowerCase().includes('daban')) brandName = 'Daban';
    else if (p.name && p.name.toLowerCase().includes('jijia')) brandName = 'Jijia';
    else if (p.name && p.name.toLowerCase().includes('snaa')) brandName = 'SNAA';

    const pGrade = p.grade !== undefined ? p.grade : '';
    const sku = p.sku || ((pGrade ? pGrade : 'KIT') + '-' + p._id.toString().slice(-4).toUpperCase());

    const imgs = (p.images && p.images.length) ? p.images : (p.image ? [p.image] : []);

    return {
        id: p._id.toString(),
        _id: p._id.toString(),
        variantId: p._id.toString(),
        sku: sku,
        name: p.name,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        price: p.price,
        stock: p.quantity !== undefined ? p.quantity : 15,
        quantity: p.quantity !== undefined ? p.quantity : 15,
        status: p.status || (p.quantity === 0 ? 'inactive' : 'active'),
        lowStockThreshold: p.lowStockThreshold || 5,
        grade: pGrade,
        scale: p.scale || '',
        category: p.category?.name || 'Mô hình Gundam',
        categoryId: p.category?._id?.toString() || p.category?.toString(),
        brand: brandName,
        brandId: brandName === 'Daban' ? 2 : (brandName === 'Jijia' ? 3 : (brandName === 'SNAA' ? 4 : 1)),
        image: p.image || (imgs[0] || '/assets/hero-poster.jpg'),
        images: imgs,
        description: p.description || '',
        createdAt: p.createdAt
    };
}

const ProductController = {
    // 1. Lấy danh sách tất cả sản phẩm
    getAll: async (req, res) => {
        try {
            const rawProducts = await productModel.find().populate('category').sort({ createdAt: -1 });
            const products = rawProducts.map(mapProduct);
            return res.status(200).json(products);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 2. Lấy chi tiết sản phẩm theo ID (hỗ trợ cả params :id và query ?id=)
    getById: async (req, res) => {
        try {
            const id = req.params.id || req.query.id;
            const product = await productModel.findById(id).populate('category');
            if (!product) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }
            return res.status(200).json(mapProduct(product));
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 3. Lấy danh sách sản phẩm theo danh mục (category)
    getByCategory: async (req, res) => {
        try {
            const categoryId = req.params.categoryId || req.params.id || req.query.categoryId;
            const rawProducts = await productModel.find({
                $or: [{ category: categoryId }, { categoryId: categoryId }]
            }).populate('category').sort({ createdAt: -1 });
            return res.status(200).json(rawProducts.map(mapProduct));
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 4. Thêm mới sản phẩm
    create: async (req, res) => {
        try {
            const { name, sku, price, quantity, stock, image, category, categoryId, grade, scale, description, status, lowStockThreshold } = req.body;

            if (!name || name.trim().length < 2) {
                return res.status(400).json({ status: 0, message: 'Tên sản phẩm không được để trống.' });
            }

            const priceNum = Number(price);
            if (isNaN(priceNum) || priceNum < 0) {
                return res.status(400).json({ status: 0, message: 'Giá sản phẩm phải là số không âm (≥ 0).' });
            }

            const qtyNum = Number(stock !== undefined ? stock : (quantity !== undefined ? quantity : 10));
            if (isNaN(qtyNum) || qtyNum < 0 || !Number.isInteger(qtyNum)) {
                return res.status(400).json({ status: 0, message: 'Số lượng tồn kho phải là số nguyên không âm.' });
            }

            const targetCat = categoryId || category;
            if (!targetCat) {
                return res.status(400).json({ status: 0, message: 'Vui lòng chọn danh mục cho sản phẩm.' });
            }

            // Kiểm tra SKU không trùng
            let finalSku = (sku || '').trim().toUpperCase();
            if (!finalSku) {
                const prefix = grade ? grade.toUpperCase() : 'KIT';
                finalSku = `${prefix}-${Date.now().toString().slice(-4)}`;
            } else {
                const existingSku = await productModel.findOne({ sku: finalSku });
                if (existingSku) {
                    return res.status(400).json({ status: 0, message: `Mã SKU "${finalSku}" đã tồn tại. Vui lòng nhập mã SKU khác.` });
                }
            }

            const newProduct = await productModel.create({
                name: name.trim(),
                sku: finalSku,
                price: priceNum,
                quantity: qtyNum,
                image: image || '/assets/hero-poster.jpg',
                category: targetCat,
                grade: (grade === 'TOOLS' || grade === 'ONEPIECE') ? '' : (grade || ''),
                scale: scale || '',
                description: description || '',
                status: status || (qtyNum === 0 ? 'inactive' : 'active'),
                lowStockThreshold: Number(lowStockThreshold) || 5
            });

            const populated = await productModel.findById(newProduct._id).populate('category');
            return res.status(201).json({ status: 1, message: 'Thêm sản phẩm thành công', product: mapProduct(populated) });
        } catch (err) {
            return res.status(500).json({ status: 0, message: 'Thêm sản phẩm thất bại: ' + err.message });
        }
    },

    // 5. Cập nhật sản phẩm
    update: async (req, res) => {
        try {
            const id = req.params.id;
            const { name, sku, price, stock, quantity, image, categoryId, category, grade, scale, description, status, lowStockThreshold } = req.body;

            const item = await productModel.findById(id);
            if (!item) {
                return res.status(404).json({ status: 0, message: 'Không tìm thấy sản phẩm' });
            }

            if (name) item.name = name.trim();

            if (price !== undefined) {
                const pNum = Number(price);
                if (isNaN(pNum) || pNum < 0) return res.status(400).json({ status: 0, message: 'Giá sản phẩm phải là số không âm.' });
                item.price = pNum;
            }

            if (stock !== undefined || quantity !== undefined) {
                const qNum = Number(stock !== undefined ? stock : quantity);
                if (isNaN(qNum) || qNum < 0 || !Number.isInteger(qNum)) return res.status(400).json({ status: 0, message: 'Số lượng tồn kho phải là số nguyên không âm.' });
                item.quantity = qNum;
            }

            if (sku) {
                const trimmedSku = sku.trim().toUpperCase();
                const existingSku = await productModel.findOne({ sku: trimmedSku, _id: { $ne: id } });
                if (existingSku) return res.status(400).json({ status: 0, message: `Mã SKU "${trimmedSku}" đã thuộc về sản phẩm khác.` });
                item.sku = trimmedSku;
            }

            if (image) item.image = image;
            if (categoryId || category) item.category = categoryId || category;
            if (grade !== undefined) item.grade = (grade === 'TOOLS' || grade === 'ONEPIECE') ? '' : grade;
            if (scale !== undefined) item.scale = scale;
            if (description !== undefined) item.description = description;
            if (status !== undefined) item.status = status;
            if (lowStockThreshold !== undefined) item.lowStockThreshold = Number(lowStockThreshold);

            await item.save();
            const populated = await productModel.findById(item._id).populate('category');
            return res.status(200).json({ status: 1, message: 'Cập nhật sản phẩm thành công', product: mapProduct(populated) });
        } catch (err) {
            return res.status(500).json({ status: 0, message: 'Sửa sản phẩm thất bại: ' + err.message });
        }
    },

    // 6. Xóa / Lưu trữ sản phẩm
    remove: async (req, res) => {
        try {
            const id = req.params.id;
            const p = await productModel.findById(id);
            if (!p) return res.status(404).json({ status: 0, message: 'Không tìm thấy sản phẩm' });

            const orderCount = await billDetailModel.countDocuments({ product: id });
            if (orderCount > 0) {
                p.status = 'archived';
                await p.save();
                return res.status(200).json({
                    status: 1,
                    archived: true,
                    message: `Sản phẩm "${p.name}" đã phát sinh ${orderCount} giao dịch trong lịch sử đơn hàng, nên đã được chuyển sang trạng thái "Lưu trữ / Ngừng bán" để bảo toàn dữ liệu bán hàng.`
                });
            }

            const deleted = await productModel.findByIdAndDelete(id);
            return res.status(200).json({ status: 1, message: `Đã xóa sản phẩm "${p.name}" thành công!`, deleted });
        } catch (err) {
            return res.status(500).json({ status: 0, message: 'Xóa sản phẩm thất bại: ' + err.message });
        }
    },

    // 7. Bật / Tắt trạng thái kinh doanh
    toggleStatus: async (req, res) => {
        try {
            const p = await productModel.findById(req.params.id).populate('category');
            if (!p) return res.status(404).json({ status: 0, message: 'Không tìm thấy sản phẩm' });
            p.status = (p.status === 'active') ? 'inactive' : 'active';
            await p.save();
            return res.status(200).json({
                status: 1,
                message: `Đã ${p.status === 'active' ? 'mở bán lại' : 'tạm dừng bán'} [${p.name}].`,
                product: mapProduct(p)
            });
        } catch (err) {
            return res.status(500).json({ status: 0, error: err.message });
        }
    }
};

module.exports = ProductController;
