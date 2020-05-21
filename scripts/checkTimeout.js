alert('Loaded Timeout Check!');
const timeOutDuration = (1000 * 60) * 2; //currently set to 50 minutes for timeout
const pollTime = (1000 * 60) * 1//currently set to poll every minute

let startTime = Date.now(); //when the webpage was loaded in ms from Unix Epoch

checkForTimeout(startTime, timeOutDuration, pollTime);

//redirects user to login screen after timeout or rechecks after at least pollTime has elapsed
function checkForTimeout(startTime, timeOutDuration, pollTime){
  console.log('%cJust checked for timeout.', 'background-color: red;');
  if(timeOutDuration > (Date.now - startTime)){
    setTimeout(checkForTimeout, pollTime, startTime, timeOutDuration, pollTime);
    return;
  }
  
  location = '/login';
}
