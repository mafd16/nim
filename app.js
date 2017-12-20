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

        // Get Toplist
        const col2 = await db.collection("toplist");
        var toplist = await col2.find({wins: {$gt: 0}}).limit(5).sort( { wins: -1 } ).toArray();
        // Get Bottomlist
        var bottomlist = await col2.find({losses: {$gt: 0}}).limit(5).sort( { losses: -1 } ).toArray();

        await dbcon.close();
        var total = numOfFirst + numOfSecond;
    } catch (err) {
        console.log(err);
    }

    var percentFirst = +(Math.round(((numOfFirst / total) * 100) + "e+2") + "e-2") + " %";
    var percentSecond = +(Math.round(((numOfSecond / total) * 100) + "e+2") + "e-2") + " %";

    res.render('client', {
        starterWins: percentFirst,
        secondWins: percentSecond,
        totalWins: total,
        toplist: toplist,
        bottomlist: bottomlist
    });
});

app.listen(3000, () => console.log('Nim app listening on port 3000!'))
