DROP TABLE IF EXISTS books CASCADE;
CREATE TABLE books (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255),
  title VARCHAR(255),
  author VARCHAR(255),
  publish_date VARCHAR(255),
  page_count INT,
  purchase_link VARCHAR(255),
  price INT,
  language VARCHAR(255) DEFAULT 'en',
  user_id INT REFERENCES users(id) ON DELETE CASCADE
  );


-- Added name to every table so we have a value to change the name of the Task
