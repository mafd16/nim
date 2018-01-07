/**
 * Test the nim-server
 */
/*"use strict";*/

///* global describe it */

process.env.DBWEBB_PORT = 3002;

var assert = require("assert");
var nimserver = require("../../src/nimserver/server");
let websocket;
let websocket2;
let url = "ws://localhost:3002/";
const WebSocket = require("ws");

function logga() {
    return "THIS IS A TEXT";
};

describe("Suite of unit tests for nim-server", function() {
    var websocket;

    before(async function() {
        console.log("Starting test-server.");
        await nimserver.listen();
    });


    beforeEach(function(done) {

        setTimeout(() => {
            console.log("Opening test-socket.");
            websocket = new WebSocket(url, "json");
            done();
        }, 200);

    });

    afterEach(function(done) {

        setTimeout(() => {
            //console.log("closing test-socket.");
            //websocket.close();
            console.log("Done after each test!");
            done();
        }, 200);

    });

    after(async function() {
        await nimserver.close(function() {
            console.log('Closing test-server.');
        });
    });

    describe("This is test of socket returns from server:", function() {

        it("1. Returns from server", function(done) {
            // Start timing now
            console.time("test1");

            websocket.onopen = function() {
                console.log("Test-socket connected");
                websocket.send(JSON.stringify({
                    nickname: "Testname",
                    type: "startgame"
                }));
            };

            websocket.onmessage = async function(event) {
                let msg = await JSON.parse(event.data);

                //setTimeout(() => {
                if (msg.type == "gameinit") {
                    assert.equal(msg.index, 0);
                    assert.equal(msg.nickname, "Testname");
                    assert.equal(msg.piles, 3);
                    assert.equal(msg.matches[0], 1);
                    assert.equal(msg.matches[1], 3);
                    assert.equal(msg.matches[2], 5);
                    assert.equal(msg.playerOne, "Testname");
                    assert.equal(msg.playerTwo, null);
                    assert.equal(msg.playerInTurn, "Testname");
                    assert.equal(msg.message, "Game started. Waiting for other player to join");
                    assert.equal(msg.type, "gameinit");
                    //assert.equal("gameOff", "gameOn");

                    console.log("FÖRSTA TESTET RUNNING!");
                    done();
                    // ... and stop.
                    console.timeEnd("test1");
                    console.time("t1-t2");
                }
            };


            websocket.onclose = function() {
                console.log("The test-websocket is now closed.");
            };
        });
    });

    describe("This is second test of socket returns from server:", function() {

        it("2. Returns from server", function(done) {
            console.timeEnd("t1-t2");
            console.time("test2");

            websocket.onopen = function() {
                console.log("Test-socket connected");
                websocket.send(JSON.stringify({
                    nickname: "Testname2",
                    type: "startgame"
                }));

                console.log("ANDRA TESTET WEBSOCKET OPEN o MSG SENT");
            };

            websocket.onmessage = async function(event) {
                let msg = await JSON.parse(event.data);
                //msg = JSON.parse(event.data);

                if (msg.type == "gameOn") {
                    assert.equal(msg.index, 0);
                    assert.equal(msg.nickname, "Testname2");
                    assert.equal(msg.piles, 3);
                    assert.equal(msg.matches[0], 1);
                    assert.equal(msg.matches[1], 3);
                    assert.equal(msg.matches[2], 5);
                    assert.equal(msg.playerOne, "Testname");
                    assert.equal(msg.playerTwo, "Testname2");
                    assert.equal(msg.playerInTurn, "Testname");
                    assert.equal(msg.message, "Player Testname2 joined.");
                    assert.equal(msg.type, "gameOn");
                    //assert.equal("gameOff", "gameOn");

                    console.log("TESTARTESTAREEEEEEEE");

                    // Send new message to server
                    websocket.send(JSON.stringify({
                        index: 0,
                        nickname: "Testname",
                        pile: 1,
                        matches: 1,
                        playerOne: "Testname",
                        playerTwo: "Testname2",
                        playerInTurn: "Testname",
                        message: "Testname took 1 match from pile one.",
                        type: "playing"
                    }));


                    // -----------------------------
                    //done();
                    //console.timeEnd("test2");
                } else if (msg.type == "playing") {
                    assert.equal(msg.index, 0);
                    assert.equal(msg.nickname, "from server");
                    assert.equal(msg.piles, 3);
                    assert.equal(msg.matches[0], 0);
                    assert.equal(msg.matches[1], 3);
                    assert.equal(msg.matches[2], 5);
                    assert.equal(msg.playerOne, "Testname");
                    assert.equal(msg.playerTwo, "Testname2");
                    assert.equal(msg.playerInTurn, "Testname2");
                    assert.equal(msg.message, "Testname took 1 match from pile one.");
                    assert.equal(msg.type, "playing");
                    //assert.equal("gameOff", "gameOn");

                    done();
                    console.timeEnd("test2");
                }
                // add else if and receive new message
                // move done to here!
            };
            websocket.onclose = function() {
                console.log("The test-websocket is now closed.");
            };
        });
    });
    // -------- THIS ABOVE WORKS FINE! ---------- //
});
