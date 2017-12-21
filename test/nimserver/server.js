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


describe("Suite of unit tests for nim-server", function() {
    var websocket;
    //var msg;


    beforeEach(function(done) {
        this.timeout(5000);
        // Setup
        //websocket = new WebSocket("ws://localhost:3000/", "json");
        console.log("Starting test-server.");
        nimserver.listen();

        console.log("Opening test-socket.");
        websocket = new WebSocket(url, "json");

        done();
/*
        websocket = new WebSocket(url, "json");

        websocket.onopen = function() {
            console.log("connected");
            websocket.send(JSON.stringify({
                nickname: "Testname",
                type: "startgame"
            }));
            setTimeout(function() {
                done();
            }, 1000);
        };
*/
        /*websocket.onmessage = function(event) {
            msg = JSON.parse(event.data);
            //console.log(msg);
            //done();
        };*/

        /*websocket.onclose = function() {
            console.log('disconnected...');
        };*/
    });

    //afterEach(function(done) {
    afterEach(function(done) {
        // Cleanup
        if(websocket.readyState === WebSocket.OPEN) {
            console.log('Closing test-websocket.');
            websocket.close();
        } else {
            // There will not be a connection unless you
            // have done() in beforeEach, socket.on('connect'...)
            console.log('no connection to break...');
        }
        //setTimeout(function() {
        nimserver.close(function() {
            console.log('Closing test-server.');
        });
        //}, 5000);
        //nimserver.close();
        done();
    });

    describe("This is test of socket returns from server:", function() {

        it("Server returns ... on msg startgame", function(done) {
            // Setup
            //websocket = new WebSocket(url, "json");

            websocket.onopen = function() {
                console.log("Test-socket connected");
                websocket.send(JSON.stringify({
                    nickname: "Testname",
                    type: "startgame"
                }));
                setTimeout(function() {
                    done();
                }, 1000);
            };

            websocket.onmessage = function(event) {
                let msg = JSON.parse(event.data);

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
            };

            websocket.onclose = function() {
                console.log("The test-websocket is now closed.");
            };


            //console.log("Testar tester..!");
            //assert.equal("fem", "fem");
            //done();
        });
    });
});

/*
    describe("This is test of test", function() {
        it("Server returns ... on msg startgame", function() {
            //websocket = new WebSocket(url, "json");
            //var msg;

            /*websocket.onopen = function() {
                websocket.send(JSON.stringify({
                    nickname: "Testname",
                    type: "startgame"
                }));
            };*/

/*websocket.onmessage = function(event) {
                msg = JSON.parse(event.data);
                //console.log(msg);
            };*/

//setTimeout(function () {
/*            assert.equal(msg.index, 0);
            assert.equal(msg.nickname, "Testname");
            assert.equal(msg.piles, 3);
            //assert.equal(msg.matches, [1, 3, 5]);
            assert.equal(msg.playerOne, "Testname");
            assert.equal(msg.playerTwo, null);
            assert.equal(msg.playerInTurn, "Testname");
            assert.equal(msg.message, "Game started. Waiting for other player to join");
            assert.equal(msg.type, "gameinit");
            //assert.equal(nimserver.players[0], 1);
            //}, 1000);

            /*setTimeout(function () {
                websocket.close(1000, "Closing in test")
            }, 3000);*/
/*       });

        it("Server returns ... on msg startgame", function() {

            //setTimeout(function () {
            assert.equal(msg.index, 0);
            assert.equal(msg.nickname, "Testname");
            assert.equal(msg.piles, 3);
            //assert.equal(msg.matches, [1, 3, 5]);
            assert.equal(msg.playerOne, "Testname");
            assert.equal(msg.playerTwo, "Testname");
            assert.equal(msg.playerInTurn, "Testname");
            assert.equal(msg.message, "Player Testname joined.");
            assert.equal(msg.type, "gameOn");
            //assert.equal(nimserver.players[0], 1);
            //}, 1000);
        });
    });
});
*/
