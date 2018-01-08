/** global: WebSocket */

/**
 * To setup a websocket connection, and nothing more.
 */
(function () {
    "use strict";

    let websocket;
    let url         = document.getElementById("connect_url");
    let start       = document.getElementById("start");
    let protocol    = document.getElementById("protocol");
    //let message     = document.getElementById("message");
    let close       = document.getElementById("close");
    let output      = document.getElementById("output");
    let nickname    = document.getElementById("nickname");
    let gameplan    = document.getElementById("gameplan");
    let game;


    /**
     * Print game plan to web browser.
     *
     * @param  {int}    piles The number of piles.
     * @param  {array}  matches The number of matches per pile.
     * @param  {true}   disabled True if buttons disabled, false otherwise.
     *
     * @return {void}
     */
    function printGamePlan(piles, matches, disabled) {
        let html = "";

        for (var i = 0; i < piles; i++) {
            html += "<div class='pile'>";
            for (var j = 0; j < matches[i]; j++) {
                html += "<div class='match'></div>";
            }
            if (matches[i] > 0) {
                if (disabled) {
                    html += "<div class='takeform'>";
                    html += `<input id=takematch${i} type='number' name='takematch' `;
                    html += `min='1' max='${matches[i]}'>`;
                    html += `<input id=fromPile${i} type='submit' `;
                    html += `value='Ta stickor' disabled></div>`;
                    html += "</div>";
                } else {
                    html += "<div class='takeform'>";
                    html += `<input id=takematch${i} type='number' name='takematch' `;
                    html += `min='1' max='${matches[i]}'>`;
                    html += `<input id=fromPile${i} type='submit' value='Ta stickor'></div>`;
                    html += "</div>";
                }
            }
        }
        gameplan.innerHTML = html;
    }


    /**
     * Select what subprotocol to use for websocekt connection.
     *
     * @return {string} with name of subprotocol.
     */
    function setSubProtocol() {
        return protocol.value;
    }


    /**
     * What to do when user starts a game
     */
    start.addEventListener("click", function(/*event*/) {
        if (!protocol.value) {
            websocket = new WebSocket(url.value);
        } else {
            websocket = new WebSocket(url.value, setSubProtocol());
        }

        // Good!
        websocket.onopen = function() {
            //console.log("The websocket is now open using '" + websocket.protocol + "'.");
            //console.log(websocket);
            websocket.send(JSON.stringify({
                nickname: nickname.value,
                type: "startgame"
            }));
        };


        // Good!
        websocket.onmessage = function(event) {
            //console.log("Receiving message: " + event.data);
            //console.log(event);
            //console.log(websocket);
            let msg = JSON.parse(event.data);
            var disabled;

            switch (msg.type) {
                case "gameinit":
                    output.innerHTML = msg.message;

                    if (nickname.value !== msg.playerInTurn) {
                        // disable buttons
                        disabled = true;
                    } else {
                        // Enable buttons
                        disabled = false;
                    }
                    printGamePlan(msg.piles, msg.matches, disabled);
                    game = msg.index;

                    break;
                case "gameOn":
                case "playing":
                    output.innerHTML = msg.message;
                    output.innerHTML += "<br>";
                    output.innerHTML += msg.playerInTurn + " picks matches!";

                    if (nickname.value !== msg.playerInTurn) {
                        // disable buttons
                        disabled = true;
                    } else {
                        // Enable buttons
                        disabled = false;
                    }

                    printGamePlan(msg.piles, msg.matches, disabled);
                    game = msg.index;
                    // add event listeners for taking sticks, when both players
                    // have joined
                    // Listener for pile One
                    if (msg.matches[0] > 0) {
                        let pileOne = document.getElementById("fromPile0");

                        pileOne.addEventListener("click", function() {
                            var takematch =document.getElementById("takematch0");
                            var subMatches = takematch.value;
                            var message = `${msg.playerInTurn} took ${subMatches}`;

                            if (subMatches > 1) {
                                message += ` matches from pile one.`;
                            } else {
                                message += ` match from pile one.`;
                            }

                            var type = "playing";

                            var obj = {
                                index: msg.index,
                                nickname: msg.playerInTurn,
                                pile: 1,
                                matches: subMatches,
                                playerOne: msg.playerOne,
                                playerTwo: msg.playerTwo,
                                playerInTurn: msg.playerInTurn,
                                message: message,
                                type: type
                            };
                            var answer = JSON.stringify(obj);

                            websocket.send(answer);
                        });
                    }

                    // Listener for pile Two
                    if (msg.matches[1] > 0) {
                        let pileTwo = document.getElementById("fromPile1");

                        pileTwo.addEventListener("click", function() {
                            var takematch =document.getElementById("takematch1");
                            var subMatches = takematch.value;
                            var message = `${msg.playerInTurn} took ${subMatches}`;

                            if (subMatches > 1) {
                                message += ` matches from pile two.`;
                            } else {
                                message += ` match from pile two.`;
                            }

                            var type = "playing";

                            var obj = {
                                index: msg.index,
                                nickname: msg.playerInTurn,
                                pile: 2,
                                matches: subMatches,
                                playerOne: msg.playerOne,
                                playerTwo: msg.playerTwo,
                                playerInTurn: msg.playerInTurn,
                                message: message,
                                type: type
                            };
                            var answer = JSON.stringify(obj);

                            websocket.send(answer);
                        });
                    }

                    // Listener for pile Three
                    if (msg.matches[2] > 0) {
                        let pileThree = document.getElementById("fromPile2");

                        pileThree.addEventListener("click", function() {
                            var takematch =document.getElementById("takematch2");
                            var subMatches = takematch.value;
                            var message = `${msg.playerInTurn} took ${subMatches}`;

                            if (subMatches > 1) {
                                message += ` matches from pile three.`;
                            } else {
                                message += ` match from pile three.`;
                            }

                            var type = "playing";

                            var obj = {
                                index: msg.index,
                                nickname: msg.playerInTurn,
                                pile: 3,
                                matches: subMatches,
                                playerOne: msg.playerOne,
                                playerTwo: msg.playerTwo,
                                playerInTurn: msg.playerInTurn,
                                message: message,
                                type: type
                            };
                            var answer = JSON.stringify(obj);

                            websocket.send(answer);
                        });
                    }
                    break;

                case "winning":
                    output.innerHTML = msg.message;
                    output.innerHTML += "<br>";

                    if (nickname.value !== msg.playerInTurn) {
                        // disable buttons
                        disabled = true;
                    } else {
                        // Enable buttons
                        disabled = false;
                    }
                    printGamePlan(msg.piles, msg.matches, disabled);
                    break;

                case "info":
                    output.innerHTML = msg.message;
                    output.innerHTML += "<br>";
                    //output.innerHTML += "Spelet avbrutet!";

                    if (nickname.value !== msg.playerInTurn) {
                        // disable buttons
                        disabled = true;
                    } else {
                        // Enable buttons
                        disabled = false;
                    }

                    printGamePlan(msg.piles, msg.matches, disabled);
                    game = msg.index;
                    break;

                default:
                    //console.log("This should never happen!");
            }
        };
        websocket.onclose = function() {
            //console.log("The websocket is now closed.");
            //console.log(websocket);
            output.innerHTML = "Du har nu lämnat spelet.";
            output.innerHTML += "<br>";
        };
    }, false);


    /**
     * What to do when user clicks Close connection.
     */
    close.addEventListener("click", function(/*event*/) {
        //console.log("Closing websocket.");
        websocket.send(JSON.stringify({
            index: game,
            nickname: nickname.value,
            message: " har lämnat spelet.",
            type: "info"
        }));
        websocket.close();
        //console.log(websocket);
    });
})();
