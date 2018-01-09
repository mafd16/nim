/**
 * Server using websockets and express supporting broadcase and echo
 * through use of subprotocols.
 */
"use strict";

const port = process.env.DBWEBB_PORT || 3001;
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({
    server: server,
    clientTracking: true, // keep track on connected clients,
    handleProtocols: handleProtocols // Manage what subprotocol to use.
});

// require the nim-core
const Nim = require("nim-core");


// This contains the games
var games = [];

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


/**
 * Save the results from the game to the database
 *
 * @param {Array} data The game info
 *
 * @return {void}
 */
async function saveResults(data) {
    var parsedData = JSON.parse(data);

    var winnerName = parsedData.winnerName,
        loserName = parsedData.loserName,
        starting  = parsedData.starting;

    var mongo = require("mongodb").MongoClient;

    var dsn =  process.env.DBWEBB_DSN || "mongodb://localhost:27017/nimgame";

    try {
        const dbcon  = await mongo.connect(dsn);
        const db = dbcon.db('nimgame');
        const col = await db.collection("games");

        await col.insertOne({winner: winnerName, loser: loserName, starting: starting });

        const col2 = await db.collection("toplist");

        await col2.updateOne(
            { "name": winnerName },
            { $inc: { "wins": 1 } },
            { upsert: true }
        );
        await col2.updateOne(
            { "name": loserName },
            { $inc: { "losses": 1 } },
            { upsert: true }
        );

        await dbcon.close();
    } catch (err) {
        console.log(err);
    }
}


wss.on("connection", (ws/*, req*/) => {
    console.log("Connection received. Adding client.");

    if (players[players.length-1].length == 0) {
        players[players.length-1][0] = ws;
    } else if (players[players.length-1].length == 1) {
        players[players.length-1][1] = ws;
    }

    // For checking connection alive
    ws.isAlive = true;
    ws.on("pong", heartbeat);

    // Good!
    ws.on("message", (message) => {
        console.log("Received: %s", message);
        let msg = JSON.parse(message);

        switch (msg.type) {
            case "startgame":
                if (players[players.length-1].length == 1) {
                    var index = games.push(new Nim({nameOfPlayerOne: msg.nickname}))-1;

                    message = "Game started. Waiting for other player to join";
                    var type = "gameinit";
                } else {
                    index = games.length - 1;
                    games[index].addPlayerTwo(msg.nickname);
                    message = `Player ${msg.nickname} joined.`;
                    type = "gameOn";
                    players.push([]);
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
                };
                var answer = JSON.stringify(obj);

                for (var i = 0; i < players[index].length; i++) {
                    var toUserWebSocket = players[index][i];

                    if (toUserWebSocket.readyState === 1) {
                        toUserWebSocket.send(answer);
                    }
                }

                break;

            case "playing":
                index = msg.index;

                // Remove matches from pile
                console.log("pile: " + msg.pile + ". matches: " + msg.matches);
                var removed = games[index].removeMatches(msg.pile, msg.matches);

                console.log("Removed matches: " + removed);

                var newMessage;
                var winner;
                var loser;

                // Check for winner
                if (games[index].checkForWinner()) {
                    // Avsluta spelet
                    type = "winning";
                    if (games[index].playerInTurn == games[index].playerOne) {
                        winner = games[index].playerTwo;
                        loser = games[index].playerOne;
                    } else {
                        winner = games[index].playerOne;
                        loser = games[index].playerTwo;
                    }
                    newMessage = winner + " is the winner!";

                    // Spara statistik till databas!
                    var dataObj = {
                        "winnerName": winner,
                        "loserName": loser,
                        "starting": games[index].playerOne
                    };
                    var toDatabase = JSON.stringify(dataObj);

                    saveResults(toDatabase);
                } else {
                    // Change player in turn
                    games[index].changePlayer();
                    newMessage = msg.message;
                    type = "playing";
                }

                obj = {
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

                answer = JSON.stringify(obj);

                for (i = 0; i < players[index].length; i++) {
                    toUserWebSocket = players[index][i];

                    if (toUserWebSocket.readyState === 1) {
                        toUserWebSocket.send(answer);
                    }
                }

                break;

            case "info":
                newMessage = msg.nickname + msg.message;
                index = msg.index;

                obj = {
                    index: index,
                    nickname: "from server",
                    piles: games[index].piles,
                    matches: games[index].matches,
                    playerOne: games[index].playerOne,
                    playerTwo: games[index].playerTwo,
                    playerInTurn: msg.nickname,
                    message: newMessage,
                    type: "info"
                };

                answer = JSON.stringify(obj);

                for (i = 0; i < players[index].length; i++) {
                    toUserWebSocket = players[index][i];

                    if (toUserWebSocket.readyState === 1) {
                        toUserWebSocket.send(answer);
                    }
                }

                break;
            default:
        }
    });

    ws.on("error", (error) => {
        console.log(`Server error: ${error}`);
    });

    ws.on("close", (code, reason) => {
        console.log(`Closing connection: ${code} ${reason}`);
    });
});

// For checking connection alive
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



// Export module
module.exports = server;
