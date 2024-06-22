DROP TABLE IF EXISTS movies CASCADE;
CREATE TABLE movies (
  id SERIAL PRIMARY KEY NOT NULL,
  position INT,
  name VARCHAR(255),
  movie_title VARCHAR(255),
  release_date VARCHAR(255),
  rating VARCHAR(255) DEFAULT '0',
  genre VARCHAR(255),
  imdb_score REAL DEFAULT '0',
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);

-- Added name to every table so we have a value to change the name of the Task
