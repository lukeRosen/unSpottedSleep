const startupLayer = 'timer';

let currentLayerName = startupLayer;
let layers = document.querySelectorAll('.layer');
let layerDirectory = {};

for(let layer of layers){
  let layerClassname = [...layer.classList].find(classname => classname.includes('layer-'));
  layerClassname = layerClassname.slice('layer-'.length);
  
  if(!layerClassname) continue;
  layerDirectory[layerClassname] = layer;
  
  layer.classList.add('unshown');
}

layerDirectory[startupLayer].classList.remove('unshown');

function setLayer(layerClassname){
  let toChangeTo = layerDirectory[layerClassname];
  
  if(!toChangeTo) return;
  layerDirectory[currentLayerName].classList.add('unshown');
  toChangeTo.classList.remove('unshown');
  currentLayerName = layerClassname;
}

//setup for each individual navigation link
//timer -> options
document.querySelector('.layer-timer .forward').addEventListener('click', () => setLayer('options'));

//timer <- options
document.querySelector('.layer-options .backward').addEventListener('click', () => setLayer('timer'));

//options -> summary
document.querySelector('.layer-options .forward').addEventListener('click', () => setLayer('summary'));

//options <- summary
document.querySelector('.layer-summary .backward').addEventListener('click', () => setLayer('options'));

//summary -> finished
document.querySelector('.layer-summary .forward').addEventListener('click', routeToFinished);
function routeToFinished(){
  setSleepTimer().then(setLayer('finished')).catch(console.warn);
}
