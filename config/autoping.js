const request = require("request");
const express = require('express');
const app = express();

app.get("/", (request, response) => {
  //console.log(Date(Date.now()) + " Ping received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);

const url = ['https://sgstats.glitch.me/','https://bot-ping-machine.glitch.me/'];
var which = 0;

function ping() {
  request.get(url[which], (error, response, body) => {
    //console.log('Pinged ' + url[which]);
  });
  which++;
  if (which > 1) {
    which = 0;
  }
}
ping();

exports.autopingfunction = function() {
  var repeat = setInterval(ping,60000);
  console.log('Auto ping started.');
}