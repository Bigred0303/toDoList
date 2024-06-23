DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
  id SERIAL PRIMARY KEY NOT NULL,
  position INT,
  name VARCHAR(255),
  product_name VARCHAR(255),
  number_of_products INT,
  lowest_price FLOAT,
  highest_price FLOAT,
  avg_star_rating FLOAT,
  is_prime BOOLEAN,
  product_url VARCHAR(255),
  user_id INT REFERENCES users(id) ON DELETE CASCADE
  );

-- Added name to every table so we have a value to change the name of the Task
