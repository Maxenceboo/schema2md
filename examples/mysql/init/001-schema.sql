CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL
) COMMENT='Registered users';

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  placed_at DATETIME NOT NULL,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT='Orders placed by users';

CREATE TABLE IF NOT EXISTS line_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  sku VARCHAR(64) NOT NULL,
  qty INT NOT NULL,
  CONSTRAINT fk_line_items_order FOREIGN KEY (order_id) REFERENCES orders(id)
) COMMENT='Products within orders';
