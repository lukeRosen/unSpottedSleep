import printColor from './workerUtilities.js';

console.log('Hello!');
printColor('deepskyblue', 1000);

console.warn('Beginning workerA.');
Worker('workerScriptA.js');
console.warn('Beginning workerB.');
Worker('workerScriptB.js');

console.warn('Main script complete.');
