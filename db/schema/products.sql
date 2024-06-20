DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255),
  product_name VARCHAR(255),
  number_of_products INT,
  lowest_price INT,
  highest_price INT,
  avg_star_rating INT,
  is_prime BOOLEAN,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
  );

-- Added name to every table so we have a value to change the name of the Task
