const queryStringParams = {
  client_id:     'fe1fe9b4de44453abe5ffb8f2a90ec98',
  response_type: 'token',
  redirect_uri:  'https://lukerosen.github.io/unSpottedSleep/mainApp',
}
const spotifyEndpoint = 'https://accounts.spotify.com/authorize';

let paramArr = [];
for(const prop in queryStringParams) paramArr.push(`${prop}=${queryStringParams[prop]}`);

let redirectUrl = spotifyEndpoint + '?' + paramArr.join('&');

window.location = redirectUrl;
