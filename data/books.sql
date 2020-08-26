DROP TABLE IF EXISTS books_data;

CREATE TABLE books_data (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbn BIGINT,
  image_url VARCHAR(255),
  synopsis VARCHAR(255)
);
