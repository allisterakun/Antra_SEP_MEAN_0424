/*  
    Create a function that every time you invoke it, it will print out the message "Congrats you earn the chance!". 
    However it can only print out the message for the first 5 executions. 
    All the rest invoke will print out the message "Sorry you missed the chance".
*/

// a function that takes in n as the threshold, 
// and returns a function that prints a message depending on if number of calls to the function exceeds the threshold
const createMsg = function(n) {
    // a counter using closure
    const createCounter = (init) => () => init++;
    // create a counter starting at 0
    let counter = createCounter(0);
    // return a function that prints out the according message based on the counter value
    return () => (counter()<n) ? console.log("Congrats you earn the chance!") : console.log( "Sorry you missed the chance");
}

// threshold of 5 times
const printMsg = createMsg(5);
for(let i=0; i<10; i++) {
    printMsg();
}

