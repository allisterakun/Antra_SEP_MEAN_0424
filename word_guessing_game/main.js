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
        newGameBtn: '#newGame'
    };

    // create template for the incorrect guesses
    const create_chance_template = (newChance) => `<span class="incorrectGuesses" id="chances">${newChance} / 10</span>`;
    // create template for the current display word
    const create_word_template = (newWord) => `<span class="word" id="word">${newWord}</span>`;
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

    return {
        domSelector,
        update_chance,
        update_word
    }

})();

const Model = ((View) => {
    const {domSelector, update_chance, update_word} = View;
    const {getNewWord} = Api;

    class State {
        constructor(incorrectGuesses=0, currentScore=0) {
            this._answer = '';
            this._diaplayWord = '';
            this._correctInputs = [];
            this._incorrectGuesses = incorrectGuesses;
            this._currentScore = currentScore; // keep track of the number of words guessed correctly
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
    }

    return {
        State,
        getNewWord
    }
})(View, Api);

const Controller = ((View, Model) => {
    const {domSelector} = View;
    const {State, getNewWord} = Model;

    var state = new State(incorrectGuesses=0, currentScore=0);

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
            state.answer = word[0];
            randomize();
        })
    }

    // start a new game by setting the global variable state to a new State object
    //      and reset the number of incorrect guesses
    //      get a new word with the API call and update the View
    const new_game = () => {
        state = new State(incorrectGuesses=0, currentScore=0);
        state.incorrectGuesses = 0;
        new_word();
    }

    // function to handle the correct input char
    const correct_input = (char) => {
        // remove current letter from the correct answer list 
        state.correctInputs = state.correctInputs.filter(val => val !== char);

        // find all occurences
        const occurences = [];
        let ind = state.answer.indexOf(char, 0);
        while(ind >= 0) {
            occurences.push(ind);
            ind = state.answer.indexOf(char, ind+1);
        }
        // fill all occurences
        const currDisplayWord = state.displayword.split(' ');
        for (let i of occurences) {
            currDisplayWord[i] = char;
        }
        const newDisplayWord = currDisplayWord.join(' ');
        // set displayword and update View
        state.displayword = newDisplayWord;
    }

    // function to handle the incorrect/invalid inputs
    const incorrect_input = () => {
        // current incorrect guesses
        let curr_guesses = state.incorrectGuesses;
        // if still chances left
        if(curr_guesses < 10) {
            // add one to the incorrect guesses and update the View
            state.incorrectGuesses = curr_guesses+1;
        }
        // if no chance left
        else {
            // show alert message
            alert("Game over! You have guessed " + state.currentScore + " words!");
            // start a new game after the message
            new_game();
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
            incorrect_input();
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
                    incorrect_input();
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
            new_game();
        })
    }


    // warp all functions
    const bootstrap = ()=> {
        guess();
        new_game_click();
        new_game();
    }

    return {
        bootstrap
    }
    
})(View, Model)

Controller.bootstrap();