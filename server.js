const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient
const process = require('process')

const CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING
console.log(CONNECTION_STRING)

MongoClient.connect(CONNECTION_STRING, { useUnifiedTopology: true }).then(
    client => {
        const db = client.db('star-wars-quotes')
        const quotesCollection = db.collection('quotes')
        console.log('Connected to Database')
        
        app.use(express.static('public'))
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(bodyParser.json())

        app.get('/', (req, res) => {
            db.collection('quotes').find().toArray()
                .then(results => {
                    res.render('index.ejs', { quotes: results })
                })
                .catch(error => console.error(error))
        })

        app.listen(3000, function() {
            console.log('listening on 3000')
        })

        app.post('/quotes', (req, res) => {
            console.log(req.body)
            quotesCollection.insertOne(req.body)
                .then(result => {
                    console.log(result)
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        })

        app.put('/quotes', (req, res) => {
            quotesCollection
                .findOneAndUpdate(
                    {name : 'Yoda'}, 
                    {
                        $set: {
                          name: req.body.name,
                          quote: req.body.quote,
                        },
                      }, 
                      {
                        upsert: true,
                      })
                .then(result => {
                    res.json('Success')
                }).catch(error => console.error(error))

            console.log(req.body)
        })

        app.delete('/quotes', (req, res) => {
            quotesCollection.deleteOne({ name: req.body.name })
                .then(result => {
                    if (result.deletedCount === 0) {
                        return res.json('No quote to delete')
                    }
                    res.json('Deleted Darth Vader\'s quote')
                })
                .catch(error => console.error(error))
        })

        app.set('view engine', 'ejs')
    }
)