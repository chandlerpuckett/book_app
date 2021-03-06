'use strict';

// ========== packages ========== //

const express = require('express');
const pg = require('pg');
const cors = require('cors');
const superagent = require('superagent');
const methodOverride = require('method-override');

require('dotenv').config();

// ========== global variables | package init ========== //

const PORT = process.env.PORT || 3003;

// database
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);

// app inits
const app = express();

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));
app.use(methodOverride('_method'));


// ========== routes ========== //

app.get('/', renderHome);
app.get('/searches/new', renderSearchField);
app.get('/books/:id', renderDetailView);
app.get('/reveal', displayUpdateForm);

app.post('/books', saveBook);
app.post('/searches', getBooksFromApi);

app.put('/books/:id', updateBookEntry);

// ========== functions ========== //

// -- home page render --
function renderHome (req,res){
  console.log('----- HOME ROUTE WORKING ------');
  const sqlQuery = 'SELECT * FROM books_data';

  client.query(sqlQuery)
    .then(result => {
      console.log(result.rows);
      res.render('./pages/index', { books: result.rows, count : result.rowCount });
    })
    .catch(error => errorHandler(error));
}

// -- single book render --
function renderDetailView (req,res){
  console.log('----- SINGLE BOOK ROUTE WORKING ------');

  let userDetail = req.query.detail;

  const sqlQuery = `SELECT * FROM books_data WHERE id=${userDetail}`;

  client.query(sqlQuery)
    .then(result => {
      console.log('RESULT.ROWS: ',result.rows);
      res.render('./pages/books/show', { books: result.rows});
    })
    .catch(error => errorHandler(error));


}

// -- save book to DB --
function saveBook (req,res){
  console.log('------ SAVE ROUTE IS ALIVE -----');
  const {author,title,isbn,image_url,synopsis} = req.body;

  const sqlQuery = `INSERT INTO books_data 
    (author, title, isbn, image_url, synopsis) 
    VALUES ($1, $2, $3, $4, $5)`;

  const valueArray = [author,title,isbn,image_url,synopsis.slice(0,254)];
  const sendDetail = [{author,title,isbn,image_url,synopsis}];

  client.query(sqlQuery, valueArray)
    .then(res.render('./pages/books/show', {books : sendDetail}))

    .catch(error => errorHandler(error));

}

// -- display update form from button --
function displayUpdateForm (req,res){
  console.log('--- BUTTON ROUTE WORKING ---');

  const id = req.query.reveal;
  const sqlQuery = `SELECT * FROM books_data WHERE id=${id}`;

  client.query(sqlQuery)
    .then(result => {
      res.render('./pages/books/edit.ejs', {books : result.rows});
    })
    .catch(error => errorHandler(error));

}

// -- update book entry in database --
function updateBookEntry (req,res){
  // run database command to update the details of the book
  // redirect user to the detail view for the book that was just updated
}


function renderSearchField (req,res){
  console.log('----- SEARCH ROUTE WORKING -----');
  res.render('./pages/searches/new');
}

function getBooksFromApi (req,res){
  const inputText = req.body.userSearch;

  let userRadioButton = inputText[1];
  let userFormText = inputText[0];
  let authorQuery = 'inauthor';
  let titleQuery = 'intitle';
  let subjectQuery = 'subject';
  let queryParam = '';

  let googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${queryParam}:${userFormText}` ;

  if (userRadioButton === 'author'){
    queryParam = authorQuery;
  } else if (userRadioButton === 'title'){
    queryParam = titleQuery;
  } else {
    queryParam = subjectQuery;
  }

  superagent.get(googleBooksUrl)
    .then(bookData => {
      const books = bookData.body.items;

      let bookApiArray = books.map(construct => new Book (construct));

      res.render('./pages/searches/show' , {
        books : bookApiArray
      });

    })
    .catch(error => errorHandler(error,res));
}

function errorHandler (error,res) {
  res.render('./pages/error', {error});
}


// ========== constructor ========== //

function Book (booksJsonData){
  let book = booksJsonData.volumeInfo;

  this.title = book.title;
  this.author = book.authors;
  this.synopsis = book.description;
  this.isbn = book.industryIdentifiers[0].identifier;

  this.image_url = book.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;

}

// ========== listen ========== //

client.connect()
  .then( () => {
    app.listen(PORT, () => console.log(`super tight, running on ${PORT} rad `));
  });

