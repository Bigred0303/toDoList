DROP TABLE IF EXISTS restaurants CASCADE;
CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  review_count INT NOT NULL,
  rating VARCHAR(255) NOT NULL DEFAULT 0,
  phone_number BIGINT NOT NULL,
  website_url VARCHAR(255) NOT NULL DEFAULT ' ',
  address VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);

-- Added name to every table so we have a value to change the name of the Task
