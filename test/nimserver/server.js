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
        }, 100);

    });

    after(async function() {
        await nimserver.close(function() {
            console.log('Closing test-server.');
        });
    });

    describe("This is test of socket returns from server:", function() {

        it("1. Returns from server", function(done) {

            websocket.onopen = function() {
                console.log("Test-socket connected");
                websocket.send(JSON.stringify({
                    nickname: "Testname",
                    type: "startgame"
                }));
            };

            websocket.onmessage = function(event) {
                let msg = JSON.parse(event.data);

                setTimeout(() => {
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
                    //assert.equal("gamein", "gameinit");
                    console.log("FÖRSTA TESTET RUNNING!");
                    done();
                }, 50);
            };

            websocket.onclose = function() {
                console.log("The test-websocket is now closed.");
            };
        });
    });

    describe("This is second test of socket returns from server:", function() {

        it("2. Returns from server", function(done) {

            websocket.onopen = function() {
                console.log("Test-socket connected");
                websocket.send(JSON.stringify({
                    nickname: "Testname2",
                    type: "startgame"
                }));

                console.log("ANDRA TESTET WEBSOCKET OPEN o MSG SENT");
            };

            websocket.onmessage = function(event) {
                let msg = JSON.parse(event.data);
                //msg = JSON.parse(event.data);

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
                console.log("TESTARTESTAREEEEEEEE");

                //assert.equal("gamein", "gameinit");
                done();
            };

            websocket.onclose = function() {
                console.log("The test-websocket is now closed.");
            };
        });
    });

    // -------- THIS ABOVE WORKS FINE! ---------- // 


});
