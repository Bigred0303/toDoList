DROP TABLE IF EXISTS movies CASCADE;
CREATE TABLE movies (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  movie_title VARCHAR(255) NOT NULL,
  release_date DATE NOT NULL,
  rating VARCHAR(255) NOT NULL DEFAULT '0',
  genre VARCHAR(255) NOT NULL,
  imdb_score SMALLINT NOT NULL DEFAULT '0',
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);

-- Added name to every table so we have a value to change the name of the Task
