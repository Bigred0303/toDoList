DROP TABLE IF EXISTS restaurants CASCADE;
CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255),
  restaurant_name VARCHAR(255),
  review_count INT,
  rating REAL,
  phone_number BIGINT,
  website_url VARCHAR(255),
  address VARCHAR(255),
  category VARCHAR(255),
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);

-- Added name to every table so we have a value to change the name of the Task
