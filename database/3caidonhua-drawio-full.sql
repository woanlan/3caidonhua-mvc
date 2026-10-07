-- ==============================================================================
-- 3CAIDONHUA MVC - ERD SQL SCRIPT DÀNH CHO DRAW.IO / DIAGRAMS.NET
-- Hướng dẫn: Mở draw.io > Chọn Arrange (Sắp xếp) > Insert (Chèn) > Advanced (Nâng cao) > SQL...
-- Dán toàn bộ mã bên dưới và bấm "Insert" để tạo sơ đồ quan hệ tự động.
-- ==============================================================================

CREATE TABLE users (
  user_id BIGINT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
);

CREATE TABLE categories (
  category_id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  PRIMARY KEY (category_id)
);

CREATE TABLE brands (
  brand_id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  PRIMARY KEY (brand_id)
);

CREATE TABLE grades (
  grade_id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  PRIMARY KEY (grade_id)
);

CREATE TABLE series (
  series_id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  PRIMARY KEY (series_id)
);

CREATE TABLE products (
  product_id BIGINT NOT NULL AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  brand_id BIGINT NOT NULL,
  grade_id BIGINT,
  series_id BIGINT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  scale VARCHAR(30),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id),
  FOREIGN KEY (brand_id) REFERENCES brands(brand_id),
  FOREIGN KEY (grade_id) REFERENCES grades(grade_id),
  FOREIGN KEY (series_id) REFERENCES series(series_id)
);

CREATE TABLE product_variants (
  variant_id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  variant_name VARCHAR(150) NOT NULL DEFAULT 'Standard',
  price DECIMAL(15,2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  reserved_quantity INT NOT NULL DEFAULT 0,
  weight_grams INT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  PRIMARY KEY (variant_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE product_images (
  image_id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  image_url VARCHAR(2048) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (image_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE carts (
  cart_id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (cart_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE cart_items (
  cart_item_id BIGINT NOT NULL AUTO_INCREMENT,
  cart_id BIGINT NOT NULL,
  variant_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY (cart_item_id),
  FOREIGN KEY (cart_id) REFERENCES carts(cart_id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
);

CREATE TABLE coupons (
  coupon_id BIGINT NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(15,2) NOT NULL,
  max_discount DECIMAL(15,2),
  min_order_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  usage_limit INT,
  per_user_limit INT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  PRIMARY KEY (coupon_id)
);

CREATE TABLE orders (
  order_id BIGINT NOT NULL AUTO_INCREMENT,
  order_code VARCHAR(50) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  coupon_id BIGINT,
  recipient_name VARCHAR(100) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  shipping_address TEXT NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  shipping_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id)
);

CREATE TABLE order_items (
  order_item_id BIGINT NOT NULL AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  variant_id BIGINT NOT NULL,
  product_name_snapshot VARCHAR(255) NOT NULL,
  sku_snapshot VARCHAR(100) NOT NULL,
  variant_name_snapshot VARCHAR(150) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  PRIMARY KEY (order_item_id),
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
);

CREATE TABLE payments (
  payment_id BIGINT NOT NULL AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  method VARCHAR(30) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  transaction_reference VARCHAR(150),
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  paid_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id),
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE reviews (
  review_id BIGINT NOT NULL AUTO_INCREMENT,
  order_item_id BIGINT NOT NULL UNIQUE,
  rating INT NOT NULL,
  comment TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id)
);

CREATE TABLE sessions (
  token_hash CHAR(64) NOT NULL,
  user_id BIGINT NOT NULL,
  csrf_token CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  PRIMARY KEY (token_hash),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
