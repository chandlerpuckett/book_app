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

app.get('/hello', renderHome);



// ========== functions ========== //

function renderHome (req,res){
  console.log('HOME ROUTE WORKING');
  res.render('./pages/index');
}



// ========== constructor ========== //





// ========== listen ========== //

client.connect()
  .then( () => {
    app.listen(PORT, () => console.log(`super tight, running on ${PORT} rad `));
  });

