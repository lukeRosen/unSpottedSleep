import printColor from './workerUtilities.js';

console.warn('Beginning workerA.');
new Worker('scripts/workerScriptA.js');
console.warn('Beginning workerB.');
new Worker('scripts/workerScriptB.js');

console.warn('Main script complete.');
