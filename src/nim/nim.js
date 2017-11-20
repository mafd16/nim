/**
 * A module for the Nim game.
 *
 * @module
 */
"use strict";

class Nim {
    /**
     * @constructor
     *
     * @param {object} options - Configure by sending options.
     */
    constructor(options = {}) {
        this.piles      = options.piles || 3;
        this.matches    = new Array(0);
        for (var i = 0; i < this.piles; i++) {
            var matches = 2*i+1;

            this.matches.push(matches);
        }

        this.playerOne = options.nameOfPlayerOne || "Player one";
        this.playerTwo = null;

        this.playerInTurn = this.playerOne;
        this.winner       = null;
    }



    /**
     * Add player two to the game.
     *
     * @param {string} playerName - The name of the player.
     *
     * @returns {boolean} true
     */
    addPlayerTwo(playerName) {
        this.playerTwo = playerName;
        return true;
    }



    /**
     * Change the player in turn.
     *
     * @returns {string} Which players turn it is.
     */
    changePlayer() {
        if (this.playerInTurn == this.playerOne) {
            this.playerInTurn = this.playerTwo;
        } else {
            this.playerInTurn = this.playerOne;
        }
        return `It's ${this.playerInTurn} drawing matches!`;
    }




    /**
     * Remove matches from a pile.
     *
     * @param {integer} pile    - The pile where to remove the matches.
     * @param {integer} matches - The number of matches to remove from pile.
     *
     * @returns {boolean} - true if possible to remove, false otherwise.
     */
    removeMatches(pile, matches) {
        if (pile <= this.piles && pile > 0) {
            if (this.matches[pile-1] >= matches) {
                this.matches[pile-1] = this.matches[pile-1] - matches;
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }



    /**
     * Check if there is a winner.
     *
     * @returns {boolean} True if there is a winner, false otherwise.
     */
    checkForWinner() {
        var matchesLeft = null;

        for (var i = 0; i < this.matches.length; i++) {
            matchesLeft += this.matches[i];
        }
        if (matchesLeft == 0) {
            return true;
        } else {
            return false;
        }
    }
}

// Export module
module.exports = Nim;
