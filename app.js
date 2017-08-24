
const fs = require('fs');
const express = require('express');
const mustache = require('mustache-express');
const bodyparser = require('body-parser');
const session = require('express-session');

//random word to be generated
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
// let word = words[Math.floor(Math.random() * words.length)];
let word = undefined;

//initialize the server
const server= express();
  //attache public folder
  server.use(express.static('public'));

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
  server.get('/', function(req, res){

    // items that will adjust as guesses are made
    const letters = [];
    let guessAllowance = 8;
    const blank = "_";
    let blanks = [];
    let inputMessage = '';
    let gameMessage = '';
    let wordArr = [];
    let wordArr2 = [];

    //create the new game with a new word
    if (req.session.word === undefined){

      word = words[Math.floor(Math.random() * words.length)];
      console.log(word); //to use for testing so we can see the word if need be
      let blanks = [];
      req.session.word = word;
      req.session.blanks = blanks;
      req.session.guessAllowance = guessAllowance;
      req.session.letters = letters;
      req.session.wordArr = wordArr;
      req.session.wordArr2 = wordArr2;
      req.session.inputMessage = inputMessage;


      //convert the word into 2 arrays inorder to convert one to blanks and use the other for verification
        for ( let w = 0; w < word.length; w++){
            req.session.wordArr.push(req.session.word.charAt(w));
            req.session.wordArr2.push(req.session.word.charAt(w));
        }

          //push blanks to the blanks array
          blanks = wordArr2;
          for ( let b = 0; b < blanks.length; b++){
            if (req.session.blanks[b] !== "_") {
              req.session.blanks[b] = " _ ";
            }
          }
}//end of the if statement to create session
    res.render("game", {
                      word: req.session.word,
                      letters: req.session.letters,
                      guessAllowance: req.session.guessAllowance,
                      blanks: req.session.blanks.join(' '),
                      message: req.session.inputMessage,
    });

});
    //game-over, play again?
  server.get('/game-over', function(req, res){
    res.render('game-over', {
                      gameMessage: gameMessage,
                      word: word,
    });
  });

//post requests
server.post('/guess', function(req, res){

  //when a letter is guessed, we send it to the letters array.

  let letterGuess = req.body.guess.toLowerCase();
    //check to see if the input is a valid guess
    for (let g=0; g<letterGuess.length; g++){
      //if the letter guessed is the right length
      if (letterGuess.length === 1){
        req.session.letters.push(letterGuess);
        req.session.inputMessage = '';
      }
      //if the letter guessed is a repeat guess, let the player know and do not deduct from guesses
          //use letters.length - 1 in the loop so that the current guess that was added
          //to the letters array above is not taken into account when validating
          //for repetition
      for ( let a = 0; a < req.session.letters.length - 1 ; a++){
        if (letterGuess === req.session.letters[a]){
          req.session.inputMessage = "Repeat guess, please guess again";
          res.redirect('/');
          return;
        }
      //if the letter guessed is an invalid guess, let the player know and do not deduct from guesses
      }
      if (letterGuess.length !== 1){
        req.session.inputMessage = "Invalid input, please guess again";
        res.redirect('/');
        return;
      }
    }
      //if the letter guessed is apart of the word, replace the blank with its correct letter
    let present = false;
    //number of times the letter appears in the mystery word.
    let letApp = 0;

    for (let i=0; i<req.session.wordArr.length; i++){
        if (letterGuess.charAt(0) === req.session.wordArr[i]){
              // replace the blank with the appropriate letter
              req.session.blanks[i] = letterGuess;
            //increase the letter appearance by one
          letApp++;
        }

    }
    //if the number of letter appearances in the word is greater than one, then the letter is present and we do not deduct from the guess-allowance.
    if (letApp > 0){
      present = true;
    }
    //if the number of letter appearances in the word is 0, then the letter is not present in the word and we deduct from the guess allowance.
    if (letApp === 0){
      present = false;
    }
    if (present === false){
      req.session.guessAllowance--;
    }
    //if the player has used all 8 guesses, show the game over message which includes the word they were trying to guess.
    if (req.session.guessAllowance === 0){
      gameMessage = `Out of guesses. The mystery word was "${word}", would you like to try again?`;
      //redirect to the game-over screen
      res.redirect('/game-over');
    }

    //if the player has guessed all the letters, congratulate them
    if (req.session.blanks.join('') === word) {

        gameMessage = 'Congratulations!! You guessed the Mystery Word!';
        //redirect to the game-over screen

         res.redirect('/game-over');
    }
        //refresh the page
        res.redirect('/');
});

  //new game
server.post('/new', function(req, res){
  //switch word to undefined so that a new random word is drawn for a new game
  let word = undefined;
  //delete the session information so the player can begin a new game
  req.session.destroy();
  res.redirect('/');
})

//wait and listen for someone to access the port
server.listen(4000, function(){
  console.log('Let the games begin!');
});
