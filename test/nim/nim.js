/**
 * Test the nim-game
 */
"use strict";

/* global describe it */

var assert = require("assert");
const Nim = require("../../src/nim/nim");


describe("This is test of nim-game", function() {
    describe("Test the constructor", function() {
        it("Num of piles should be 3", function() {
            let nim = new Nim();
            let piles = nim.piles;

            assert.equal(piles, 3);
        });

        it("The matches are 1,3,5 in piles", function() {
            let nim = new Nim();
            let matches = nim.matches;

            assert.equal(matches[0], 1);
            assert.equal(matches[1], 3);
            assert.equal(matches[2], 5);
            //assert.equal(matches[3], 7);
            //assert.equal(matches[4], 9);
        });

        it("Name of player one is Pelle", function() {
            let options = {nameOfPlayerOne: "Pelle"};
            let nim = new Nim(options);
            let name = nim.playerOne;

            assert.equal(name, "Pelle");
        });

        it("Player two is null", function() {
            let nim = new Nim();
            let name = nim.playerTwo;

            assert.equal(name, null);
        });

        it("Player in turn is Super Mario", function() {
            let options = {nameOfPlayerOne: "Super Mario"};
            let nim = new Nim(options);
            let inTurn = nim.playerInTurn;

            assert.equal(inTurn, "Super Mario");
        });

        it("Winner is null", function() {
            let nim = new Nim();
            let victory = nim.winner;

            assert.equal(victory, null);
        });
    });

    describe("Test the addPlayerTwo-function", function() {
        it("Player two name is Bamse", function() {
            let nim = new Nim();

            nim.addPlayerTwo("Bamse");
            let name = nim.playerTwo;

            assert.equal(name, "Bamse");
        });
    });

    describe("Test the changePlayer-function", function() {
        it("Changes player in turn", function() {
            let options = {nameOfPlayerOne: "Super Mario"};
            let nim = new Nim(options);

            nim.addPlayerTwo("Luigi");
            let inTurn = nim.playerInTurn;

            assert.equal(inTurn, "Super Mario");
            nim.changePlayer();
            inTurn = nim.playerInTurn;
            assert.equal(inTurn, "Luigi");
            nim.changePlayer();
            inTurn = nim.playerInTurn;
            assert.equal(inTurn, "Super Mario");
        });
    });

    describe("Test the removeMatches-function", function() {
        it("removes matches", function() {
            let nim = new Nim();

            let res = nim.removeMatches(3, 4);
            let matches = nim.matches[2];

            assert.equal(matches, 1);
            assert.equal(res, true);

            res = nim.removeMatches(2, 4);
            assert.equal(res, false);

            res = nim.removeMatches(6, 4);
            assert.equal(res, false);
        });
    });

    describe("Test the checkForWinner-function", function() {
        it("removes matches, check winner", function() {
            let nim = new Nim();

            nim.removeMatches(1, 1);
            let res = nim.checkForWinner();

            assert.equal(res, false);
            nim.removeMatches(2, 3);
            nim.removeMatches(3, 5);

            //nim.removeMatches(4, 7);
            //nim.removeMatches(5, 9);
            res = nim.checkForWinner();
            assert.equal(res, true);
        });
    });
});
