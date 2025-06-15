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
    await client.connect();

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.post('/events', async (req, res) => {
      const newUser = req.body;
      const result = await userCollenction.insertOne(newUser);
      res.send(result);
    });


  } finally {


  }
}
run().catch(console.dir);




app.listen(port, () => {
  console.log(`my sever is running ${port}`);
})