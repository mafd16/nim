const express = require('express')
const app = express()

app.set('views', './views')
app.set('view engine', 'pug')

app.use(express.static('src/nimclient'))

app.get('/', (req, res) => res.render('client'))

app.listen(3000, () => console.log('Nim app listening on port 3000!'))
