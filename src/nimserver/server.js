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

// require the nim-core
//const Nim = require("../nim/Nim");
const Nim = require("nim-core");


// This contains the games
var games = [];
// This is number of players per game
//var players = [0];
// This is array with [numOfPlayersPerGame, userOneID: webSocket, userTwoID: webSocket]
var players = [[]];

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

    // Saving the players connection to the players array
    if (players[players.length-1].length == 0) {
        players[players.length-1][0] = ws;
    } else if (players[players.length-1].length == 1) {
        players[players.length-1][1] = ws;
    }


    console.log("  ");
    console.log(players);
    console.log("  ");

    // For checking connection alive
    ws.isAlive = true;
    ws.on("pong", heartbeat);

    // Good!
    ws.on("message", (message) => {
        console.log("Received: %s", message);
        let msg = JSON.parse(message);

        switch (msg.type) {
            case "startgame":
                //if (players[players.length-1] == 0) {
                if (players[players.length-1].length == 1) {
                    var index = games.push(new Nim({nameOfPlayerOne: msg.nickname}))-1;

                    //players[players.length-1] = 1;
                    //players[players.length-1][0] = 1;
                    // Saving the players connection
                    //players[players.length-1][userId] = ws;
                    message = "Game started. Waiting for other player to join";
                    var type = "gameinit";
                } else {
                    index = games.length - 1;
                    //players[players.length-1] = 2;
                    //players[players.length-1][0] = 2;
                    // Saving the players connection
                    //players[players.length-1][userId] = ws;
                    games[index].addPlayerTwo(msg.nickname);
                    message = `Player ${msg.nickname} joined.`;
                    type = "gameOn";
                    players.push([]);
                }

                console.log("  ");
                console.log("index: " + index);
                console.log("  ");

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
                };
                var answer = JSON.stringify(obj);

                //console.log("  ");
                //console.log("players[" + index + "]: " + players[index]);
                //console.log("  ");

                for (var i = 0; i < players[index].length; i++) {
                    var toUserWebSocket = players[index][i];

                    toUserWebSocket.send(answer);
                }



                //console.log("players[index].length: " + players[index].length);
                //console.log(" ");
                console.log(" ");
                console.log("Answer sent from server: ");
                console.log(answer);
                console.log(" ");
                break;

            case "playing":
                var index = msg.index;

                // Remove matches from pile
                console.log("pile: " + msg.pile + ". matches: " + msg.matches);
                var removed = games[index].removeMatches(msg.pile, msg.matches);
                console.log("Removed matches: " + removed);

                var type;
                var newMessage;
                var winner;
                // Check for winner
                if (games[index].checkForWinner()) {
                    // Avsluta spelet
                    type = "winning";
                    if (games[index].playerInTurn == games[index].playerOne) {
                        winner = games[index].playerTwo;
                    } else {
                        winner = games[index].playerOne;
                    }
                    newMessage = winner + " is the winner!";

                    // Spara statistik till databas!


                } else {
                    // Change player in turn
                    var activePlayerMessage = games[index].changePlayer();
                    newMessage = msg.message;// + " " + activePlayerMessage;
                    type = "playing";
                }



                var obj = {
                    index: msg.index,
                    nickname: "from server",
                    piles: games[index].piles,
                    matches: games[index].matches,
                    playerOne: games[index].playerOne,
                    playerTwo: games[index].playerTwo,
                    playerInTurn: games[index].playerInTurn,
                    message: newMessage,
                    type: type
                };

                var answer = JSON.stringify(obj);

                for (var i = 0; i < players[index].length; i++) {
                    var toUserWebSocket = players[index][i];

                    toUserWebSocket.send(answer);
                }

                console.log(" ");
                console.log("Answer sent from server: ");
                console.log(answer);
                console.log(" ");
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
