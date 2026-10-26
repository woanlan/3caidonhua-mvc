const categoryModel = require('../models/category');
const productModel = require('../models/product');

// Hàm tạo slug thân thiện tiếng Việt cho danh mục
function toVietnameseSlug(str) {
    if (!str) return '';
    let s = str.toLowerCase();
    s = s.replace(/[áàảãạâấầẩẫậăắằẳẵặ]/g, 'a');
    s = s.replace(/[éèẻẽẹêếềểễệ]/g, 'e');
    s = s.replace(/[iíìỉĩị]/g, 'i');
    s = s.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o');
    s = s.replace(/[úùủũụưứừửữự]/g, 'u');
    s = s.replace(/[ýỳỷỹỵ]/g, 'y');
    s = s.replace(/[đ]/g, 'd');
    s = s.replace(/[^a-z0-9]+/g, '-');
    return s.replace(/(^-|-$)/g, '');
}

const CategoryController = {
    // 1. Lấy tất cả danh mục
    getAll: async (req, res) => {
        try {
            const categories = await categoryModel.find().sort({ order: 1, createdAt: 1 }).lean();
            // Đếm số lượng sản phẩm thực tế theo từng danh mục
            for (const c of categories) {
                c.id = c._id.toString();
                c.productCount = await productModel.countDocuments({
                    $or: [{ category: c._id }, { categoryId: c._id }]
                });
            }
            return res.status(200).json(categories);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 2. Lấy danh mục theo ID
    getById: async (req, res) => {
        try {
            const category = await categoryModel.findById(req.params.id).lean();
            if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            category.id = category._id.toString();
            category.productCount = await productModel.countDocuments({
                $or: [{ category: category._id }, { categoryId: category._id }]
            });
            return res.status(200).json(category);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 3. Tạo mới danh mục
    create: async (req, res) => {
        try {
            const { name, slug, description, image, order, status } = req.body;
            if (!name || name.trim().length < 2) {
                return res.status(400).json({ status: 0, message: 'Tên danh mục phải có tối thiểu 2 ký tự.' });
            }

            const finalSlug = (slug && slug.trim()) ? toVietnameseSlug(slug) : toVietnameseSlug(name);
            const existing = await categoryModel.findOne({ $or: [{ name: name.trim() }, { slug: finalSlug }] });
            if (existing) {
                return res.status(400).json({ status: 0, message: 'Tên danh mục hoặc đường dẫn (slug) này đã tồn tại.' });
            }

            const newCategory = await categoryModel.create({
                name: name.trim(),
                slug: finalSlug,
                description: description || '',
                image: image || '/assets/products/rg-hinu.jpg',
                order: Number(order) || 1,
                status: status || 'active'
            });

            return res.status(201).json(newCategory);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 4. Cập nhật danh mục
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, slug, description, image, order, status } = req.body;

            const category = await categoryModel.findById(id);
            if (!category) {
                return res.status(404).json({ status: 0, message: 'Không tìm thấy danh mục' });
            }

            if (name) category.name = name.trim();
            if (slug) category.slug = toVietnameseSlug(slug);
            else if (name) category.slug = toVietnameseSlug(name);
            if (description !== undefined) category.description = description;
            if (image !== undefined) category.image = image;
            if (order !== undefined) category.order = Number(order);
            if (status !== undefined) category.status = status;

            const updated = await category.save();
            return res.status(200).json(updated);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 5. Xóa danh mục (Kiểm tra ràng buộc sản phẩm)
    remove: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await categoryModel.findById(id);
            if (!category) return res.status(404).json({ status: 0, message: 'Không tìm thấy danh mục' });

            const productCount = await productModel.countDocuments({
                $or: [{ category: id }, { categoryId: id }]
            });

            if (productCount > 0) {
                return res.status(400).json({
                    status: 0,
                    message: `Chặn xóa: Danh mục "${category.name}" hiện đang có ${productCount} sản phẩm liên kết. Vui lòng chuyển các sản phẩm này sang danh mục khác hoặc chuyển trạng thái sang "Ẩn" danh mục thay vì xóa.`
                });
            }

            const deleted = await categoryModel.findByIdAndDelete(id);
            return res.status(200).json({ status: 1, message: `Đã xóa danh mục "${category.name}" thành công!`, deleted });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 6. Bật / Tắt trạng thái hiển thị
    toggleStatus: async (req, res) => {
        try {
            const category = await categoryModel.findById(req.params.id);
            if (!category) return res.status(404).json({ status: 0, message: 'Không tìm thấy danh mục' });

            category.status = (category.status === 'active') ? 'inactive' : 'active';
            await category.save();
            return res.status(200).json({
                status: 1,
                message: `Đã ${category.status === 'active' ? 'bật' : 'ẩn'} danh mục [${category.name}].`,
                category
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
};

module.exports = CategoryController;
