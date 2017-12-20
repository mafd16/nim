const express = require('express')
const app = express()

app.set('views', './views')
app.set('view engine', 'pug')

app.use(express.static('src/nimclient'))

app.get('/', async (req, res) => {
    // Get the statistics from db and send it to the view
    // MongoDB
    var mongo = require("mongodb").MongoClient;
    // The dsn
    var dsn =  process.env.DBWEBB_DSN || "mongodb://localhost:27017/nimgame";
    try {
        // Connect
        const dbcon  = await mongo.connect(dsn);
        const db = dbcon.db('nimgame');
        const col = await db.collection("games");
        // Count percentage starters and seconds to win
        var numOfFirst = await col.count( { $where: "this.winner == this.starting" } );
        var numOfSecond = await col.count( { $where: "this.loser == this.starting" } );
        var total = numOfFirst + numOfSecond;
    } catch (err) {
        console.log(err);
    }

    console.log(" ");
    console.log("numOfFirst: " + numOfFirst);
    console.log("numOfSecond: " + numOfSecond);
    console.log(" ");

    res.render('client', { starterWins: numOfFirst,
        secondWins: numOfSecond,
        totalWins: total
    });
});

app.listen(3000, () => console.log('Nim app listening on port 3000!'))
