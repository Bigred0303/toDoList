DROP TABLE IF EXISTS series CASCADE;
CREATE TABLE series (
  id SERIAL PRIMARY KEY NOT NULL,
  release_date DATE NOT NULL,
  rating VARCHAR(255) NOT NULL DEFAULT 0,
  genre VARCHAR(255) NOT NULL,
  imdb_score SMALLINT NOT NULL DEFAULT 0,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);
