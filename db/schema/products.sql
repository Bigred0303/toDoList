DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
  id SERIAL PRIMARY KEY NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  number_of_products INT NOT NULL,
  lowest_price INT NOT NULL,
  highest_price INT NOT NULL,
  avg_star_rating INT NOT NULL,
  is_prime BOOLEAN NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
  );
