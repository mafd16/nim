/**
 * Server using websockets and express supporting broadcase and echo
 * through use of subprotocols.
 */
"use strict";

const port = process.env.DBWEBB_PORT || 3001;
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


/**
 * Save the results from the game to the database
 *
 * @param {Array} data The game info
 *
 * @return {void}
 */
async function saveResults(data) {
    // Parse the data
    var parsedData = JSON.parse(data);

    // The game info
    var winnerName = parsedData.winnerName,
        loserName = parsedData.loserName,
        starting  = parsedData.starting;

    // MongoDB
    var mongo = require("mongodb").MongoClient;
    //var mongo2 = require("mongodb");

    // The dsn
    //var dsn =  process.env.DBWEBB_DSN || "mongodb://mongodb_nim:27017/nimgame";
    var dsn =  process.env.DBWEBB_DSN || "mongodb://localhost:27017/nimgame";

    try {
        const dbcon  = await mongo.connect(dsn);
        const db = dbcon.db('nimgame');
        const col = await db.collection("games");
        await col.insertOne({winner: winnerName, loser: loserName, starting: starting });

/*        const col2 = await db.collection("starter");
        const percent = await col2.find().toArray();

        console.log(" ");
        console.log("percent: " + percent);
        console.log(" ");

        if (percent) {
            var wff = percent[0].wins_for_first;
            var wfs = percent[0].wins_for_second;
            var editId = percent[0]._id;
        } else {
            wff = 0;
            wfs = 0;
            //var editId = 0;
            const newDoc = await col2.insertOne({wins_for_first: wff,
                 wins_for_second: wfs
             });
             editId = newDoc.insertedId;
        }


        console.log(" ");
        console.log("wff: " + wff);
        console.log("wfs: " + wfs);
        console.log("editId: " + editId);
        console.log(" ");
*/
        /*if (!wff && !wfs) {
            if (winnerName == starting) {
                wff = 1;
            } else {
                wfs = 1;
            }
        } else {*/
/*        if (winnerName == starting) {
            wff++;
        } else {
            wfs++;
        }
*/        //}

/*        console.log(" ");
        console.log("wff: " + wff);
        console.log("wfs: " + wfs);
        console.log("editId: " + editId);
        console.log(" ");
*/
        //var objectId = new mongo2.ObjectID(editId);
        //await col2.updateOne({ _id: objectId }
/*        await col2.updateOne({ _id: editId },
            { $set: {wins_for_first: wff, wins_for_second: wfs } },
            { upsert: true }
        );
*/        //await col2.insertOne({wins_for_first: wff, wins_for_second: wfs });

        await dbcon.close();

        //res.render('crud', { title: 'Databas', message: result });
    } catch (err) {
        console.log(err);
        //res.render('crud', { title: 'Databas', data: err });
    }
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
