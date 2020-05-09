printColor('deepskyblue', 1000);

function printColor(color, lineCount){
  for(let i = 0; i < lineCount; i++){
    console.log(`%cLine number ${i}`, `background-color: ${color};`);
  }
}
