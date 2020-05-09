import printColor from './workerUtilities.js';

console.warn('Beginning workerA.');
new Worker('workerScriptA.js');
console.warn('Beginning workerB.');
new Worker('workerScriptB.js');

console.warn('Main script complete.');
