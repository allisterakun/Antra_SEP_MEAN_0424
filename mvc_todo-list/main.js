// hard-coded global array to hold all the to-do items to simulate the data fetched from server
// comsune promise to get data
// var data = [
//     {title: 'item A', id: 1},
//     {title: 'item B', id: 2},
//     {title: 'item C', id: 3},
//     {title: 'item D', id: 4},
// ];

// use IIFE to fetch data from JSONplaceholder API
// 'https://jsonplaceholder.typicode.com/todos'
const Api = (() => {
    const url = 'https://jsonplaceholder.typicode.com/todos'; // base url

    // get data api call
    const getData = fetch(url).then(response => response.json());
    
    // delete data api call
    const deleteData = (del_id) => {
        // use fetch with 'DELETE' method to delete the item from server/db
        return fetch(url + '/' + del_id, {method: 'DELETE'})
    }

    return {
        getData, // => this is a pormise, have to use a .then() to consume the data
        deleteData // => also a promise
    }
})();

// use IIFE to create the View
const View = (() => {
    let domSelector = {
        ul_classname: ".todo--ul",
        input_box: "#user-input",
        button: "#addBtn",
        delete_buttons: ".delete--btn",
    }
    
    // console.log(document.getElementsByClassName(ul_classname)); // => always return an array (HTMLCollection of items)
    // console.log(document.querySelector('.todo--ul')); // => returns a node list, so you can directly modify the HTML

    /* put update view list into two function */
    /* create new template function */ 
    const create_template = (arr) => {
        let template = '';
        arr.forEach((todo_item) => {
            template += `<li>
                <span> ${todo_item.id} </span>
                <span> ${todo_item.title} </span>
                <button id="delete${todo_item.id}" class="delete--btn">Delete</button>
            </li>` // back tick not single quote
        })
        return template;
    }

    /* re-render page function */
    const render = (element, template) => {
        element.innerHTML = template;
    }

    // return View methods
    return {
        domSelector,
        create_template,
        render
    }
})();

// use IIFE to create the Model
const Model = ((Api, View) => {
    const {getData, deleteData} = Api;
    const {domSelector, create_template, render} = View; // destructure

    // class to represent current data value
    // prevent outer functions to directly change the data
    class State {
        constructor(){
            this._todoList = []; // note to be private
        }

        // getter and setter
        get getTodoList(){
            return this._todoList;
        }
        set setTodoList(newList){
            this._todoList = newList;

            // update the view everytime the todo-list gets updated
            let todo_ul = document.querySelector(domSelector.ul_classname);
            let template = create_template(this._todoList);
            render(todo_ul, template);
        }

        // function to delete an item from the to-do list by id
        delete_from_todo_list(del_id) {
            // create a new list without the to-be deleted item
            const newList = this._todoList.filter(item => item.id !== del_id);
            // call .setTodoList to update this._todoList and re-render the View
            this.setTodoList = newList;
        }

        // getter metthod to get the id for next item
        get next_id() {
            return this._todoList.reduce((max, cur) => (max > cur.id) ? max : cur.id, 0) + 1;
        }
    }

    return {
        State,
        getData, 
        deleteData
    }

})(Api, View);

// use IIFE to create the Controller
const Controller = ((View, Model) => {
    const {domSelector} = View;
    const {State, getData, deleteData} = Model;

    const state = new State();

    const init = () => {
        // initialize the page with data fetched from server
        getData.then(data => {
            state.setTodoList = data;
        });
    }

    /* event listener */
    const add_todo = () => {
        const user_input = document.querySelector(domSelector.input_box);
        const btn = document.querySelector(domSelector.button);

        btn.addEventListener('click', () => {
            // parse user input and put it into a new object
            let new_item = {
                title: user_input.value,
                id: state.next_id
            }
            // create a new list with new_item at the end, and set _todoList in the state object to update the Model and re-render the View
            state.setTodoList = [...state.getTodoList, new_item];
            // clear input box after adding the current input
            user_input.value = '';
        })
    }

    const del_todo = () => {
        const delete_buttons = document.querySelectorAll(domSelector.delete_buttons);
        // add an event listener to each delete button
        delete_buttons.forEach(button => {
            button.addEventListener('click', element => {
                // get the id
                const del_id = Number(element.target.id.split('delete')[1]);
                // delete item by id (first from server using delete api call, then delete from local to-do list by id and re-render the view using delete_from_todo_list method)
                deleteData(del_id).then(() => state.delete_from_todo_list(del_id));
            })
        })
    }

    const delete_todo = () => {
        // https://stackoverflow.com/questions/2844565/is-there-a-javascript-jquery-dom-change-listener/11546242#11546242
        // https://stackoverflow.com/questions/33680420/html-getelementsbyclassname-returns-htmlcollection-with-length-of-0/33681566#33681566?newreg=4331e63e17ef417d807892fc887654a4
        // use a mutation observer to make sure the DOM is updated when adding event listener to delete buttons
        const ul = document.querySelector(domSelector.ul_classname);
        const observer = new MutationObserver(del_todo);
        observer.observe(ul, {childList: true});
    }

    // wrap all functions 
    const bootstrap = () => {
        init();
        add_todo();
        delete_todo();
    }

    return {
        bootstrap
    }

})(View, Model);

Controller.bootstrap();
