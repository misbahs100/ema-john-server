const express = require('express')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lqubf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(cors());
app.use(bodyParser.json());

const port = 5000



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productsCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION}`);
    const ordersCollection = client.db(`${process.env.DB_NAME}`).collection("order");

    // adding/creating product to database, all products can be inserted by insetMany method
    app.post('/addProduct', (req, res) => {
        const product = req.body;
        productsCollection.insertOne(product)
            .then(result => {
                console.log(result.insertedCount);
            })
    })

    // adding/creating order to database, all orders can be inserted by insetMany method
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        ordersCollection.insertOne(order)
            .then(result => {
                console.log("happy: ",result.insertedCount > 0);
            })
    })

    //  read all -> load data to Shop component
    app.get('/products', (req, res) => {
        productsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    //  read individual -> load data to ProductDetail component
    app.get('/product/:key', (req, res) => {
        productsCollection.find({ key: req.params.key })
            .toArray((err, documents) => {
                console.log(documents);
                res.send(documents[0]);
            })
    })

    // read some -> load data to Review component
      // for that, first we have to send the keys of the products which will be reviewed.
      // then we can find the products
    app.post('/productsByKeys', (req, res) => {
        const productKeys = req.body;
        productsCollection.find({ key: { $in: productKeys}})
        .toArray( (err, documents) => {
            res.send(documents);
        })
    })


});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)