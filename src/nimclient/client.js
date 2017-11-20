/**
 * To setup a websocket connection, and nothing more.
 */
(function () {
    "use strict";

    let websocket;
    let url         = document.getElementById("connect_url");
    let start       = document.getElementById("start");
    //let join       = document.getElementById("join");
    let protocol    = document.getElementById("protocol");
    let sendMessage = document.getElementById("send_message");
    let message     = document.getElementById("message");
    let close       = document.getElementById("close");
    let output      = document.getElementById("output");
    let nickname    = document.getElementById("nickname");
    let gameplan    = document.getElementById("gameplan");
    //let userlist    = document.getElementById("userlist");


    /**
     * Print game plan to web browser.
     *
     * @param  {int}    piles The number of piles.
     * @param  {array}  matches The number of matches per pile.
     *
     * @return {void}
     */
    function printGamePlan(piles, matches) {
        let html = "";
        for (var i = 0; i < piles; i++) {
            html += "<div class='pile'>";
            for (var j = 0; j < matches[i]; j++) {
                html += "<div class='match'></div>";
            }
            html += `<div class='takeform'><input type='number' name='takematch' min='1' max='${matches[i]}'>`;
            html += "<input type='submit' value='Ta stickor'></div>";
            html += "</div>";
        }
        gameplan.innerHTML = html;
    }



    /**
     * Log output to web browser.
     *
     * @param  {string} message to output in the browser window.
     *
     * @return {void}
     */
    function outputLog(message) {
        let now = new Date();
        let timestamp = now.toLocaleTimeString();

        output.innerHTML += `${timestamp} ${message}<br>`;
        output.scrollTop = output.scrollHeight;
    }



    /**
     * Log output to web browser from Me.
     *
     * @param  {string} message to output in the browser window.
     *
     * @return {void}
     */
    function outputMe(message) {
        let now = new Date();
        let timestamp = now.toLocaleTimeString();

        output.innerHTML += `<div class="leftmessage">${timestamp} Du: <br>${message}<br></div>`;
        output.scrollTop = output.scrollHeight;
    }


    /**
     * Log output to web browser from Others.
     *
     * @param  {string} message to output in the browser window.
     *
     * @return {void}
     */
    function outputOthers(message, nickname) {
        let now = new Date();
        let timestamp = now.toLocaleTimeString();

        output.innerHTML += `<div class="rightmessage">
        ${timestamp} ${nickname}: <br>${message}<br></div>`;
        output.scrollTop = output.scrollHeight;
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
        //console.log("Connecting to: " + url.value);
        if (!protocol.value) {
            websocket = new WebSocket(url.value);
        } else {
            websocket = new WebSocket(url.value, setSubProtocol());
        }

        // Good!
        websocket.onopen = function() {
            console.log("The websocket is now open using '" + websocket.protocol + "'.");
            console.log(websocket);
            //outputLog("The websocket is now open using '" + websocket.protocol + "'.");
            //outputLog("Du anslöt till chatten med nickname: " + nickname.value);
            websocket.send(JSON.stringify({
                nickname: nickname.value,
                type: "startgame"
            }));
        };

        // Good!
        websocket.onmessage = function(event) {
            console.log("Receiving message: " + event.data);
            console.log(event);
            console.log(websocket);
            let msg = JSON.parse(event.data);

            switch (msg.type) {
                case "gameinit":
                    output.innerHTML = msg.message;
                    printGamePlan(msg.piles, msg.matches);
                    break;
                case "gameOn":
                    output.innerHTML = msg.message;
                    output.innerHTML += "<br>";
                    output.innerHTML += msg.playerInTurn + " picks matches!";
                    printGamePlan(msg.piles, msg.matches);
                    break;
                default:

            }
        };

        websocket.onclose = function() {
            console.log("The websocket is now closed.");
            console.log(websocket);
            outputLog("Du har nu lämnat spelet.");
        };
    }, false);







    /**
     * What to do when user clicks to send a message.
     */
    sendMessage.addEventListener("click", function(/*event*/) {
        let messageText = message.value;

        if (!websocket || websocket.readyState === 3) {
            console.log("The websocket is not connected to a server.");
        } else {
            websocket.send(JSON.stringify({
                nickname: nickname.value,
                message: messageText,
                getUsers: false,
                // Use type:message when the message is from a user
                type: "message"
            }));
            console.log("Sending message: " + messageText);
            outputMe(messageText);
        }
        message.value = "";
    });



    /**
     * What to do when user clicks Close connection.
     */
    close.addEventListener("click", function(/*event*/) {
        console.log("Closing websocket.");
        websocket.send(JSON.stringify({
            nickname: nickname.value,
            message: " har lämnat chatten.",
            getUsers: true,
            // Use type:info when it is informational messages, e.g.
            // someone has entered
            type: "info"
        }));
        websocket.close();
        console.log(websocket);
    });
})();
