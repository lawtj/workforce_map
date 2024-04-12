// simpleJS.js
export function simpleJS(value) {
    console.log(value);
    return {
        message: value,
    }
}

window.simpleJS = simpleJS; 
