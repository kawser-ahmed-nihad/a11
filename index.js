const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
app.use(cors())
app.use(express.json());
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const { ObjectId } = require('mongodb');




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gyokyfk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const userCollenction = client.db('ServeSphere').collection('events');
    const joinedCollenction = client.db('ServeSphere').collection('joinedEvents');
    await client.connect();

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/events', async (req, res) => {
      const events = await userCollenction.find().toArray();
      res.send(events);
    });

    app.get('/events/:id', async (req, res) => {
      const id = req.params.id;
      const result = await userCollenction.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get('/joinedEvents', async (req, res) => {
      const userEmail = req.query.email;
      const result = await joinedCollenction.find({ userEmail }).toArray();
      res.send(result);
    });

    app.post('/events', async (req, res) => {
      const newEvents = req.body;
      const result = await userCollenction.insertOne(newEvents);
      res.send(result);
    });
    app.post('/joinedEvents', async (req, res) => {
      const newEvents = req.body;
      const result = await joinedCollenction.insertOne(newEvents);
      res.send(result);
    });






  } finally {


  }
}
run().catch(console.dir);




app.listen(port, () => {
  console.log(`my sever is running ${port}`);
})