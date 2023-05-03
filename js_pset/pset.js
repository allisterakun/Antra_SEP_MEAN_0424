const problem1 = (num) => parseInt(String(num).split('').reverse().join('')) * Math.sign(num);

const problem2 = (str) => str.toLowerCase().replace(/[^a-z0-9]/gi, '') === str.toLowerCase().replace(/[^a-z0-9]/gi, '').split('').reverse().join('');

function problem3(str) {
    const res = [];
    for (let i=0; i<str.length; i++){
        for (let j=i+1; j<=str.length; j++){
            res.push(str.slice(i,j));
        }
    }
    return res
}

const problem4 = (str) => str.split('').sort().join('');

const problem5 = (str) => str.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

const problem6 = (str) => str.split(' ').reduce((acc, curr) => acc = curr.length > acc.length ? curr : acc, '');

const problem7 = (str) => str.toLowerCase().split('').reduce((acc, curr) => acc = ('aeiou'.includes(curr)) ? acc+1 : acc, 0);

function problem8(num) {
    for (let i=2; i<Math.sqrt(num); i++){
        if (num % i === 0) return false;
    }
    return num > 1;
}

const problem9 = (variable) => typeof variable;

function problem10(n) {
    const identity_matrix =Array(n).fill(0).map(() => Array(n).fill(0));
    for (let i=0; i<n; i++) {
        identity_matrix[i][i] = 1;
    }
    return identity_matrix;
}

const problem11 = (arr) => [arr.sort((a,b) => a-b)[1], arr.sort((a,b) => a-b).slice(-2)[0]];

function problem12(num) {
    const pos_divisors = [1]
    for (let i=2; i<=Math.sqrt(num); i++){
        if (num % i === 0) {
            pos_divisors.push(i);
            if (i !== Math.sqrt(num)) pos_divisors.push(num/i);
        }
    }
    const aliquot_sum = pos_divisors.reduce((acc, curr) => acc+curr, 0);
    if (num === aliquot_sum) return true;
    else return false;
}

function problem13(num) {
    if (num===0) return [];
    const pos_factors = [1, num]
    for (let i=2; i<=Math.sqrt(num); i++){
        if (num % i === 0) {
            pos_factors.push(i);
            if (i !== Math.sqrt(num)) pos_factors.push(num/i);
        }
    }
    const neg_factors = pos_factors.map(factor => factor*-1);
    return pos_factors.concat(neg_factors);
}

function problem14(amount, coins) {
    coins.sort((a,b) => b-a);
    const res = [];
    coins.forEach((coin) => {
        while(amount >= coin) {
            res.push(coin);
            amount -= coin;
        }
    });
    return res;
}

function problem15() {
    /* If "ReferenceError: prompt is not defined" is raised,
    please uncomment the following line and run 'npm install prompt-sync' in terminal */
    // const prompt=require("prompt-sync")({sigint:true}); 
    const b = prompt("Plase enter base b = ");
    const n = prompt("Plase enter exponent n = ");
    console.log(b**n);
}

const problem16 = (str) => [...new Set(str.split(''))].join('');

function problem17(str) {
    const res = {};
    [...new Set(str.split(''))].map((ch) => {res[ch] = str.split(ch).length-1;});
    return res;
}

function problem18(target, arr) {
    arr.sort((a,b) => a-b)

    let left = 0;
    let right = arr.length-1;
    while (left <= right) {
        let mid = Math.floor((left+right)/2);
        if (target < arr[mid]) {
            right = mid-1;
        } else if (target > arr[mid]) {
            left = mid+1;
        } else {
            return mid;
        }
    }
    return -1;
}

function problem19(target, arr) {
    arr.sort((a,b) => a-b)
    if (target >= arr[arr.length-1]) return [];
    else if (target < arr[0]) return arr;

    let left = 0;
    let right = arr.length-1;
    while (left <= right) {
        let mid = Math.floor((left+right)/2);
        if (target < arr[mid]) {
            right = mid-1;
        } else if (target > arr[mid]) {
            left = mid+1;
        } else {
            return arr.slice(mid+1);
        }
    }
    return arr.slice(left);
}

function problem20(len) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i=0; i<len; i++){
        res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
}

function problem21(arr, len) {
    const res = [];

    function backtrack(i, curr) {
        if (curr.length == len) {
            res.push(curr);
            return;
        }
        for (let j=i; j<arr.length; j++){
            curr.push(arr[j]);
            backtrack(j+1, [...curr]);
            curr.pop();
        }
    }
    backtrack(0, []);
    return res;
}

const problem22 = (str, char) => str.split(char).length-1;

function problem23(str) {
    const counter = {};
    [...new Set(str.split(''))].map((ch) => {counter[ch] = str.split(ch).length-1;});
    for (key of Object.keys(counter)) {
        if (counter[key] == 1) return key;
    }
    return 'No unique character in the given string "' + str + '"';
}

function problem24(arr) {
    for (let i=0; i<arr.length; i++){
        for (let j=0; j<arr.length-i-1; j++){
            // ascending order
            // if (arr[j] > arr[j+1]) {
            //     let temp = arr[j];
            //     arr[j] = arr[j+1];
            //     arr[j+1] = temp;
            // }

            // descending order (as the given expected example output)
            if (arr[j] < arr[j+1]) {
                let temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
    return arr;
}

const problem25 = (arr) => arr.reduce((acc, curr) => acc = curr.length > acc.length ? curr : acc, '');

function problem26(str) {
    // sliding window => O(n^2)
    let res = '';
    for (let i=0; i<str.length; i++){
        let visited = [];
        for (let j=i; j<str.length; j++){
            if (visited.includes(str[j])) break;
            else {
                res = (res.length > j-i+1) ? res : str.slice(i,j+1);
                visited.push(str[j]);
            }
        }
        const index = visited.indexOf(str[i]);
        if (index > -1) {
            visited.splice(index, 1);
        }
    }
    return res;
}

function problem27(str) {
    let res = [''];
    const isPalindrome = (substr) => substr === substr.split('').reverse().join('');
    for (let i=0; i<str.length; i++) {
        let j = str.length-1;
        while(i<=j) {
            if (str[i] === str[j] && isPalindrome(str.slice(i,j+1)) && !res.includes(str.slice(i,j+1))) {
                if (j-i+1 > res[0].length) res = [str.slice(i,j+1)];
                else if (j-i+1 === res[0].length) res.push(str.slice(i,j+1));
                break;
            } else j -= 1;
        }
    }
    return res
}

function problem28(func) {
    console.log(func());
}

const problem29 = (func) => func.name;
