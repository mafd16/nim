/**
 * Server using websockets and express supporting broadcase and echo
 * through use of subprotocols.
 */
"use strict";

const port = process.env.DBWEBB_PORT || 3000;
const express = require("express");
const http = require("http");
//const url = require("url");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({
    server: server,
    clientTracking: true, // keep track on connected clients,
    handleProtocols: handleProtocols // Manage what subprotocol to use.
});

const Nim = require("../nim/Nim");
// This contains the games
var games = [];
// This is number of players per game
var players = [0];

// For checking connection alive
function heartbeat() {
    this.isAlive = true;
}



// Answer on all http requests
app.use(function (req, res) {
    console.log("HTTP request on " + req.url);
    res.send({ msg: "hello" });
});


/**
 * Select subprotocol to use for connection.
 *
 * @param {Array} protocols              Subprotocols to choose from, sent
 *                                        by client request.
 * @param {http.IncomingMessage} request The client HTTP GET request.
 *
 * @return {void}
 */
function handleProtocols(protocols /*, request */) {
    console.log(`Incoming protocol requests '${protocols}'.`);
    for (var i=0; i < protocols.length; i++) {
        if (protocols[i] === "text") {
            return "text";
        } else if (protocols[i] === "json") {
            return "json";
        }
    }
    return false;
}


// Setup for websocket requests.
// Docs: https://github.com/websockets/ws/blob/master/doc/ws.md
wss.on("connection", (ws/*, req*/) => {
    console.log("Connection received. Adding client.");



    // For checking connection alive
    ws.isAlive = true;
    ws.on("pong", heartbeat);

    // Good!
    ws.on("message", (message) => {
        console.log("Received: %s", message);
        let msg = JSON.parse(message);

        switch (msg.type) {
            case "startgame":
                if (players[players.length-1] == 0) {
                    var index = games.push(new Nim({nameOfPlayerOne: msg.nickname}))-1;
                    //players[-1] = 1;
                    players[players.length-1] = 1;
                    var message = "Game started. Waiting for other player to join";
                    var type = "gameinit";
                } else {
                    index = games.length - 1;
                    players[players.length-1] = 2;
                    games[index].addPlayerTwo(msg.nickname);
                    message = `Player ${msg.nickname} joined.`;
                    type = "gameOn";
                    players.push(0);
                }

                var obj = {
                    index: index,
                    nickname: msg.nickname,
                    piles: games[index].piles,
                    matches: games[index].matches,
                    playerOne: games[index].playerOne,
                    playerTwo: games[index].playerTwo,
                    playerInTurn: games[index].playerInTurn,
                    message: message,
                    type: type
                }
                var answer = JSON.stringify(obj);
                ws.send(answer); // Måste sända till alla 2 som spelar!
                console.log(answer);
                break;

            case "någott":

                break;
            default:

        }
    });

    ws.on("error", (error) => {
        console.log(`Server error: ${error}`);
    });

    ws.on("close", (code, reason) => {
        console.log(`Closing connection: ${code} ${reason}`);
        //broadcastExcept(ws, `Client disconnected (${wss.clients.size}).`);
    });
});

// For checking connection alive
//const interval = setInterval(function ping() {
setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping('', false, true);
    });
}, 30000);



// Startup server
server.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});
