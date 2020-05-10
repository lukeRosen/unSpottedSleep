const implicitGrantResp = location.hash.substring(1).split('&');
const accessToken = arr.find(str => str.indexOf('access_token') === 0).split('=')[1];

console.log(accessToken);
