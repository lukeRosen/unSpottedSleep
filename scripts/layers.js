const startupLayer = 'sample';

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