import printColor from './workerUtilities.js';

console.warn('Beginning workerA.');
new Worker('scripts/workerScriptA.js');
console.warn('Beginning workerB.');
new Worker('scripts/workerScriptB.js');

printColor('lime', 1000);

console.warn('Main script complete.');
