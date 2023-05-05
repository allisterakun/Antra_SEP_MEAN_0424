const Api = (() => {
    const url = 'https://random-word-api.herokuapp.com/word';

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

    const create_chance_template = (newChance) => `<span class="incorrectGuesses" id="chances">${newChance} / 10</span>`;

    const create_word_template = (newWord) => `<span class="word" id="word">${newWord}</span>`;

    const render = (ele, temp) => {
        ele.innerHTML = temp;
    }

    const update_chance = (chanceElement, newChance) => {
        const chance_template = create_chance_template(newChance);
        render(chanceElement, chance_template);
    }

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

        // getter and setter
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

        get displayword() {
            return this._diaplayWord;
        }
        set displayword(newDisWord) {
            this._diaplayWord = newDisWord;
            // update View
            const word__wrapper = document.querySelector(domSelector.word);
            update_word(word__wrapper, newDisWord);
        }

        get correctInputs() {
            return this._correctInputs
        }
        set correctInputs(newCorrectInputs) {
            this._correctInputs = newCorrectInputs;
        }

        get incorrectGuesses() {
            return this._incorrectGuesses;
        }
        set incorrectGuesses(newChance){
            this._incorrectGuesses = newChance;
            // update View
            const incorrectGuesses__wrapper = document.querySelector(domSelector.incorrectGuesses);
            update_chance(incorrectGuesses__wrapper, newChance);
        }

        get currentScore() {
            return this._currentScore;
        }
        set currentScore(newScore) {
            this._currentScore = newScore;
        }

        update_display_word(char) {
            // remove current letter from the correct answer list 
            this.correctInputs = this.correctInputs.filter(val => val !== char);

            // find all occurences
            const occurences = [];
            let ind = this.answer.indexOf(char, 0);
            while(ind >= 0) {
                occurences.push(ind);
                ind = this.answer.indexOf(char, ind+1);
            }
            // fill all occurences
            const currDisplayWord = this.displayword.split(' ');
            for (let i of occurences) {
                currDisplayWord[i] = char;
            }
            const newDisplayWord = currDisplayWord.join(' ');
            // set displayword and update View
            this.displayword = newDisplayWord;
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

    const new_game = () => {
        state = new State(incorrectGuesses=0, currentScore=0);
        state.incorrectGuesses = 0;
        new_word();
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

    // function to take in an user-input character and perform corresponding actions
    const make_a_guess = (guessChar) => {
        // correct input
        if (state.correctInputs.includes(guessChar)) {
            // fill in the blank for the correct letter
            state.update_display_word(guessChar);
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
            // current incorrect guesses
            let curr_chances = state.incorrectGuesses;
            // if still chances left
            if (curr_chances < 10){
                // increase one to the incorrect guesses, and update the View
                state.incorrectGuesses = curr_chances+1;
            }
            // if no chance left
            else {
                // show the alert message
                alert("Game over! You have guessed " + state.currentScore + " words!");
                // start a new game after the message
                new_game();
            }
        }
    }
    
    // function to get a new word with API call, and make a randomized display word
    const new_word = () => {
        newWord = getNewWord().then(word => {
            state.answer = word[0];
            randomize();
        })
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
                    // if still chances left
                    if (state.incorrectGuesses < 10){
                        // increase one to the incorrect guesses, and update the View
                        state.incorrectGuesses = state.incorrectGuesses+1;
                    }
                    // if no chance left
                    else {
                        // show the alert message
                        alert("Game over! You have guessed " + state.currentScore + " words!");
                        // start a new game after the message
                        new_game();
                    }
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
        new_word();
        guess();
        new_game_click();
    }

    return {
        bootstrap
    }
    
})(View, Model)

Controller.bootstrap();