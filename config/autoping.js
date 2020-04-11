exports.antiSleep = function() {
const express = require("express")
const expressApp = express()
expressApp.get("/", (req, res) => {
    //console.log("Ping received at", new Date().toString())
    res.sendStatus(200)
})
expressApp.listen(process.env.PORT)
console.log("Express listening.", (new Date()).toString())

const request = require("request")
var url = [
    "https://sgstats.glitch.me/",
    "https://placar-uno.glitch.me/",
    "https://bot-ping-machine.glitch.me/",
]
var which = 0
function access() {
    //console.log("Starting request...")
    const reqStartTime = new Date().getTime();
    request.get(url[which], function (err, response, body) {
        if (err) {
            console.log("An error happened. Logging error...")
            const now = new Date();
            const date = now.getFullYear()
             + "-" + now.getMonth()
             + "-" + now.getDay()
             + "_" + now.getHours()
             + "'" + now.getMinutes()
             + "''" + now.getSeconds()
            const fs = require("fs")
            fs.appendFileSync("./logs/Error_Log_" + date + ".txt",
                "Error Log "
                + new Date().toString() + "\r\n"
                + "\r\nFrom bot-ping-machine server.js"
                + "\r\nURL requested: " + url[which]
                + "\r\nHTTP status code: " + response.statusCode
                + "\r\nError:\r\n" + err
            , function() {
                console.log("Error logged.")
            })
        }
        //console.log("Acessed " + url[which] + "\nHTTP Code: " + response.statusCode
        //  + "\nTime to access: " + (new Date().getTime() - reqStartTime) + "ms")
        which++
        if (which == url.length) which = 0
        setTimeout(access, 20000)
    })
}
access()
}