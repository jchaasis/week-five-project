const fs = require('fs');
const express = require('express');
const mustache = require('mustache-express');
const bodyparser = require('body-parser');
const session = require('express-session');

//random word to be generated
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
let word = words[Math.floor(Math.random() * words.length)];
wordArr = [];
  for ( let w=0; w<word.length; w++){
      wordArr.push(word.charAt(w));
  }


//items that will adjust as guesses are made
const letters = [];
let guessAllowance = 8;
const hiddenWord = [];
//initialize the server
const server= express();

//configure the server for:

  //mustache-express
  server.engine('mustache', mustache());
  server.set('views', './views');
  server.set('view engine', 'mustache');

  //session
  server.use(session({
    secret: 'ChittyChitty_BangBang',
    resave: false,
    saveUninitialized: true
  }));

  //body-parser
    server.use(bodyparser.urlencoded({ extended: false }));


//establish routes

//get requests
  //initial get request
    //TODO: create a new session
  server.get('/', function(req, res){
    res.render("game", {
                      word: word,
                      letters: letters,
                      guessAllowance: guessAllowance,
                      hiddenWord: hiddenWord,

    });
    console.log(word);
  });


//post requests
server.post('/guess', function(req, res){
  //when a letter is guessed, we send it to the guessed array.
  let letterGuess = req.body.guess;
    for (let g=0; g<letterGuess.length; g++){
      //if the letter guessed is the right length TODO: make lowercase
      if (letterGuess.length = 1){
        letters.push(letterGuess);
      }
    }
      //if the letter guessed is apart of the word, push it to the hiddenWord string

    for (let i=0; i<wordArr.length; i++){
        if (letterGuess.charAt(0) === wordArr[i]){
            // present = true;
            //possibly keep track of how many times it shows up
          hiddenWord.push(letterGuess);
        }
        else if (letterGuess.charAt(0) !== wordArr[i]){
          let present = false;
        }
    }
    //
    // if (present = true){
    //   hiddenWord.push(letterGuess);
    // }

    if (present = false){
      guessAllowance--;
    }
//booleans to say if it is true than push the word, if its false, subtract.

        // if (letterGuess.charAt(0) !== wordArr[i]){
        //   guessAllowance--;//this is currently subtracting 1 for each letter of the wordArr that doesn't match. Needs to be moved.
        // };
        console.log(letters);
        console.log(wordArr);
        console.log(hiddenWord);


        res.redirect('/');
});


//wait and listen for someone to access the port
server.listen(4000, function(){
  console.log('Let the games begin!');
});
