'use strict';

// ========== packages ========== //

const express = require('express');
const pg = require('pg');
const cors = require('cors');
const superagent = require('superagent');

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


// ========== routes ========== //

// app.get('/hello', renderHome);
app.get('/pages', renderHome);
app.get('/searches/new', renderSearchField);
app.post('/searches', getBooksFromApi);

// ========== functions ========== //

function renderHome (req,res){
  console.log('----- HOME ROUTE WORKING ------');
  res.render('./pages/index');
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

      // console.log(books);
      console.log(bookApiArray);

      res.render('./pages/searches/show' , {
        booksToFrontEnd : bookApiArray
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
  this.description = book.description;
  this.isbn = book.industryIdentifiers[0].identifier;

  this.img = book.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;

}

// ========== listen ========== //

client.connect()
  .then( () => {
    app.listen(PORT, () => console.log(`super tight, running on ${PORT} rad `));
  })
  .catch(error => errorHandler(error));

