# nim



[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/mafd16/nim/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/mafd16/nim/?branch=master)
[![Code Coverage](https://scrutinizer-ci.com/g/mafd16/nim/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/mafd16/nim/?branch=master)
[![Build Status](https://scrutinizer-ci.com/g/mafd16/nim/badges/build.png?b=master)](https://scrutinizer-ci.com/g/mafd16/nim/build-status/master)


A Nim game built in JavaScript using websockets.

If you want to know more about the game, please visit the
[Wikipedia page](https://en.wikipedia.org/wiki/Nim).

This game is the examination in the course
[Ramverk2](https://dbwebb.se/kurser/ramverk2) at Blekinge Institute of Technology.


### Application and choice of technology

The application is a game, where two players take turns in removing matches
from distinct heaps. There are three heaps with 1, 3 and 5 matches in them.
A player can take any non-zero number of matches, as long as they come from
the same heap. The player who takes the last match will lose.

The features implemented in the game are the following.

- The player is asked to choose a name, and then start/join a game. Player
number (n+1) will start a game, and player (n+2) will join a game.
- There can be multiple games at the same time.
- When both players have joined, then player (n+1) can start drawing matches.
- For the player not in turn, all the buttons have been disabled. They are then
enabled when it is that players turn.
- The client are showing informational messages, e.g. who´s turn it is, how many
matches someone took, who is the winner.
- There is a button for leaving the game. If one player are leaving the game,
then the other player will be informed about this.
- When a game is finished, then the game info are saved to a database. The
statistics are shown at the client. Statistics shown are games finished, percentage
of games won for players who start the game, percentage for players joining the game,
a toplist, and a bottomlist.

The features NOT implemented are

- If a player closes the browser instead of using the "leave game"-button, then
a message is sent to the other player.
- When a game is won, there will be fireworks.
- The game has a cheeky design.

The technology used are the following. The game is divided into a server, a client
and a database. The server and the client are built upon the node.js framework
Express. They are communicating through websockets, and are using the npm package
ws. As a view-renderer I am using pug. The server are also using a package called
nim-core. Read more about that further down. The database is MongoDB, which is
running in a docker container.

The reason for the above technology is that I have been using it during the course.
When I have started learning this technology, I decided to keep using it. I have
also started building this game during the course, and therefore it was natural
for me to keep using the same technology.

This technology have been working quite good, and I have not encountered any
major issues. However, I think there are better choices out there. Something for
me to learn in the future.


### Installation

To install the game, you should clone this repository. Then run
```
npm install
```
For the game to run, you need to have [Docker](https://www.docker.com/)
installed. Then you can start the game with
```
npm start
```
This will start the database in docker, the server and the application, all at
once. This is tested on windows with cygwin as terminal. If this should not
work, you can start the services in three different terminals using
```
npm run start-nim-server
npm run start-nim-client
npm run start-db
```
When the services are running, visit localhost:3000 in your browser to start
playing. It is recommended to open two browser windows, to have someone to play against. Bring a friend when trying out the game!

The services can be stopped with
```
npm stop
```

If you want to start all the services in docker, then that is possible. Run
```
npm run start-docker
```
To stop these services in docker, run
```
npm run stop-docker
```

This installation will work without making any settings. But if you want to,
then these are the possibilities.

The server listen on port 3001. To change it, set the environment variable
DBWEBB_PORT
The client is running on port 3000. This can be changed with the variable
DBWEBB_PORT_CLI

The database is reached at mongodb://localhost:27017/nimgame. This can be
changed by setting the variable
DBWEBB_DSN


### Testing

For the tests I am using Mocha and Istanbul (nyc). I am also using eslint and
stylelint. The unit-tests are only covering the nim-server. For the nim-server
the code coverage is up to almost 61% if counting lines. Also, the npm package nim-core have code coverage of 100%.

These tools have been quite good, but there have been som real problems testing
async code. I had to struggle quite a bit. And we could be having an diskussion
whether they are unit tests or integration tests.

For the client, all my javascript is enclosed in an self invoked function.
This is, as I found out, practicly impossible to unit-test. I could not find an
easy way round this at the moment.

You can run my tests locally with the command
```
npm test
```
You can then find the code coverage by starting a web-server, e.g. Apache, and
visiting build/coverage/index.html. 
