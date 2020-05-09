//3456789c123456789d123456789e123456789f123456789g123456789a123456789b123456789c
//------------------------------------------------------------------------------

//(string, number) => undefined
//color: a CSS color as a string (or rgb/hsl/#)
//lineCount: the number of lines to print out
//prints 'lineCount' number of lines with 'color' background-color
function printColors(color, lineCount){
  for(let i = 0; i < lineCount; i++){
    console.log(`%cLine number ${i}`, `background-color: ${color};`);
  }
}

export {printColors as default};
