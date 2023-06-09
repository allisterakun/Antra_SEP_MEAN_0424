const Api = (() => {
    const url = 'https://random-word-api.herokuapp.com/word';
    // function that returns a promise to fetch a new word from the API
    function getNewWord() {
        return fetch(url).then(res => res.json());
    }

    return {
        getNewWord
    }
})();

const View = (() => {
    let domSelector = {
        incorrectGuesses: '.incorrectGuesses__wrapper',
        word: '.word__wrapper',
        inputBox: '#inputBox',
        guessHistory: '.guessHistory__wrapper',
        newGameBtn: '#newGame',
        timer__wrapper: '.timer__wrapper',
        timer: '.timer'
    };

    // create template for the incorrect guesses
    const create_chance_template = (newChance) => `<span class="incorrectGuesses" id="chances">${newChance} / 10</span>`;
    // create template for the current display word
    const create_word_template = (newWord) => `<span class="word" id="word">${newWord}</span>`;

    const create_history_template = (newHistory) => {
        if (newHistory.length === 0) return '';
        let temp = '';
        newHistory.forEach(ele => temp += `<span class="guessHistory guessHistory--${ele.correct}">${ele.char}</span>`);
        return temp;
    }

    // function to update the View for the given element with the given template
    const render = (ele, temp) => {
        ele.innerHTML = temp;
    }
    // function to update the View for the incorrect chances
    const update_chance = (chanceElement, newChance) => {
        const chance_template = create_chance_template(newChance);
        render(chanceElement, chance_template);
    }
    // function to update the current display word
    const update_word = (wordElement, newWord) => {
        const word_template = create_word_template(newWord);
        render(wordElement, word_template);
    }
    const update_history = (historyElement, newHistory) => {
        const hist_template = create_history_template(newHistory);
        render(historyElement, hist_template);
    }
    const update_timer = (timerElement, newTime) => {
        render(timerElement, newTime);
    }
    const delete_timer = (timerWrapper) => {
        timerWrapper.style.display = 'none';
    }

    return {
        domSelector,
        update_chance,
        update_word,
        update_history,
        update_timer,
        delete_timer
    }

})();

const Model = ((View) => {
    const {domSelector, update_chance, update_word, update_history, update_timer, delete_timer} = View;
    const {getNewWord} = Api;

    class State {
        constructor() {
            this._answer = '';
            this._diaplayWord = '';
            this._correctInputs = [];
            this._incorrectGuesses = 0;
            this._currentScore = 0; // keep track of the number of words guessed correctly
            this._guessHistory = [];
        }

        /* getter and setter */
        // ._answer
        get answer() {
            return this._answer;
        }
        // setting a new answer indicating a new word, so clear all other properties
        set answer(newAnswer) {
            this._answer = newAnswer;
            this._diaplayWord = '';
            this._correctInputs = [];
            this._guessHistory = [];
        }
        // ._diaplayWord
        get displayword() {
            return this._diaplayWord;
        }
        set displayword(newDisWord) {
            this._diaplayWord = newDisWord;
            // update View
            const word__wrapper = document.querySelector(domSelector.word);
            update_word(word__wrapper, newDisWord);
        }
        // ._correctInputs
        get correctInputs() {
            return this._correctInputs
        }
        set correctInputs(newCorrectInputs) {
            this._correctInputs = newCorrectInputs;
        }
        // ._incorrectGuesses
        get incorrectGuesses() {
            return this._incorrectGuesses;
        }
        set incorrectGuesses(newChance){
            this._incorrectGuesses = newChance;
            // update View
            const incorrectGuesses__wrapper = document.querySelector(domSelector.incorrectGuesses);
            update_chance(incorrectGuesses__wrapper, newChance);
        }
        // ._currentScore
        get currentScore() {
            return this._currentScore;
        }
        set currentScore(newScore) {
            this._currentScore = newScore;
        }
        // ._guessHistory
        get guessHistory() {
            return this._guessHistory;
        }
        set guessHistory(newHistory) {
            this._guessHistory = newHistory;
            // update View
            const guessHistory__wrapper = document.querySelector(domSelector.guessHistory);
            update_history(guessHistory__wrapper, newHistory);
        }
    }

    return {
        State,
        getNewWord,
        update_timer,
        delete_timer
    }
})(View, Api);

const Controller = ((View, Model) => {
    const {domSelector} = View;
    const {State, getNewWord, update_timer, delete_timer} = Model;

    // global variables that get reassigned when a new game starts
    var state;
    var timerInterval;
    
    // function to maintain a timer on page
    const set_timer = (maxTime) => {
        const timer = document.querySelector(domSelector.timer);
        // initialize the timer on page to be the maxTime given
        update_timer(timer, maxTime);
        // update the timer on page every second
        timerInterval = setInterval(() => {
            // if the time limit is reached, end game, start a new game, and reset the timer
            if (maxTime <= 0) {
                end_game();
            }
            // added an else here to prevent diaplaying 'Time Left: -1' after times up
            else {
                update_timer(timer, --maxTime);
            }
        }, 1000);
    }
    
    // function to end the game:
    // - clear the timer if there is time limit
    // - display score with alert()
    // - start a new game
    // - set a new timer if there is a time limit
    const end_game = () => {
        const timer__wrapper = document.querySelector(domSelector.timer__wrapper);
        // with time limit
        if (timer__wrapper.style.display !== 'none') {
            clearInterval(timerInterval);
            // show alert message
            alert("Game over! You have guessed " + state.currentScore + " words!");
            // start a new game after the message
            new_game();
            // set a new timer
            set_timer(60);
        }
        else {
            // show alert message
            alert("Game over! You have guessed " + state.currentScore + " words!");
            // start a new game after the message
            new_game();
        }
    }

    // function to randomly mask a random number of letters of the answer word, and update the view accordingly
    const randomize = () => {
        // random number of letters to mask
        let num_mask = Math.floor(state.answer.length * Math.random());
        // make sure to mask at least one letter
        while (num_mask<=0) {
            num_mask = Math.floor(state.answer.length * Math.random());
        }
        // split the string into an array for easier manipulation
        let word = state.answer.split('');
        // keep track of what letters are being masked, in other words, save all the correct answers
        const letters = []
        for (let i=0; i<num_mask; i++){
            // random index
            let index = Math.floor(state.answer.length * Math.random());
            // if already masked, try again
            if (word[index] === '_') {
                i--;
                continue
            } 
            // if not already masked, mask it
            else {
                // add the letter to the correct answers if not already exisits
                if (!letters.includes(word[index])) letters.push(word[index]);
                // mask it
                word[index] = '_';
            }
        }
        // masked word
        const newDisWord = word.join(' ');

        // set display word and update view
        state.displayword = newDisWord;
        // set correct inputs
        state.correctInputs = letters;

        console.log(state.answer);
        console.log(state.correctInputs);
    }

    // function to get a new word with API call,
    //      make a randomized display word (randomly mask the new word),
    //      and update the View
    const new_word = () => {
        newWord = getNewWord().then(word => {
            state.guessHistory = [];
            state.answer = word[0];
            randomize();
        })
    }

    // start a new game by setting the global variable state to a new State object
    //      and reset the number of incorrect guesses
    //      get a new word with the API call and update the View
    const new_game = () => {
        state = new State();
        state.incorrectGuesses = 0;
        new_word();
    }

    const increase_or_newGame = () => {
        // add one to incorrect guesses if still chances, else end game (and start a new game)
        let curr_guesses = state.incorrectGuesses;
        // if still chances left
        if(curr_guesses < 10) {
            // add one to the incorrect guesses and update the View
            state.incorrectGuesses = curr_guesses+1;
        }
        // if no chance left
        else {
            end_game();
        }
    }

    // function to handle the correct input char
    const correct_input = (guessChar) => {
        // remove current letter from the correct answer list 
        state.correctInputs = state.correctInputs.filter(val => val !== guessChar);

        // find all occurences
        const occurences = [];
        let ind = state.answer.indexOf(guessChar, 0);
        while(ind >= 0) {
            occurences.push(ind);
            ind = state.answer.indexOf(guessChar, ind+1);
        }
        // fill all occurences
        const currDisplayWord = state.displayword.split(' ');
        for (let i of occurences) {
            currDisplayWord[i] = guessChar;
        }
        const newDisplayWord = currDisplayWord.join(' ');
        // set displayword and update View
        state.displayword = newDisplayWord;

        // add input to input history list
        state.guessHistory = [...state.guessHistory, {char: guessChar, correct: true}];
    }

    // function to handle the incorrect/invalid inputs
    const incorrect_input = (guessChar) => {
        /* update input history list if needed */
        // check if guessChar is already in the history list
        const guessedB4 = state.guessHistory.reduce((res, cur) => (cur.char === guessChar) ? true : res, false);
        // if not guessed before
        if (!guessedB4) {
            // update guessHistory and the View
            state.guessHistory = [...state.guessHistory, {char: guessChar, correct: false}];

            increase_or_newGame(); 
        }
        // else (guessed before)
        else {
            // show an alert and do nothing (will not increase the incorrect guesses)
            alert("You've tried the letter \"" + guessChar + "\" before!");
        }
        
    }

    // function to take in an user-input character and perform corresponding actions
    const make_a_guess = (guessChar) => {
        // correct input
        if (state.correctInputs.includes(guessChar)) {
            // fill in the blank for the correct letter
            correct_input(guessChar);
            // if the word is complete
            if(state.displayword.split(' ').join('') === state.answer) {
                // add one to current score
                state.currentScore = state.currentScore+1;
                // get a new word to keep the game going
                new_word();
            }
        }
        // incorrect input
        else{
            incorrect_input(guessChar);
        }
    }

    // event listeners
    const guess = () => {
        const inputBox = document.querySelector(domSelector.inputBox);

        inputBox.addEventListener('keypress', e => {
            // on a keypress of enter
            if (e.key === 'Enter') {
                // get input value
                const guessChar = inputBox.value;
                // clear input box
                inputBox.value = '';
                // check for valid input
                if(guessChar.length > 1 || guessChar < 'a' || guessChar > 'z') {
                    alert('Invalid input: Please only type one lowercase letter into the textbox as input.');
                }
                else {
                    // if valid input, call make_a_guess for further action
                    make_a_guess(guessChar);
                }
            }
        })
    }

    const new_game_click = () => {
        const newGameBtn = document.querySelector(domSelector.newGameBtn);

        newGameBtn.addEventListener('click', () => {
            // start a new game if the button is pressed
            end_game();
        })
    }

    // function to start a new game and add all the event listeners
    const init = () => {
        new_game();
        guess();
        new_game_click();
    }


    // warp all functions
    const bootstrap = () => {
        // for games without time limit, set the display of the timer__wrappr to none
        delete_timer(document.querySelector(domSelector.timer__wrapper));

        init();
    }

    const timed_bootstrap = () => {
        init();
        // start a timer
        set_timer(60);
    }

    return {
        bootstrap,
        timed_bootstrap
    }
    
})(View, Model)

// Controller.bootstrap();
Controller.timed_bootstrap();