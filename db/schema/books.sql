DROP TABLE IF EXISTS books CASCADE;
CREATE TABLE books (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  publish_date DATE NOT NULL,
  page_count INT NOT NULL,
  purchase_link VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  language VARCHAR(255) NOT NULL DEFAULT 'en',
  user_id INT REFERENCES users(id) ON DELETE CASCADE
  );


-- Added name to every table so we have a value to change the name of the Task