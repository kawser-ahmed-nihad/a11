const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookiParser = require('cookie-parser');
const port = process.env.PORT || 3000;
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://servesphere-4fb04.web.app'
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookiParser());

const logger = (req, res, next) => {
  // console.log('inside the logger');
  next();
}

const verifytken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log('cokkie', token);
  if (!token) {
    return res.status(401).send({ message: 'unauthorized acces' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized acces' });
    }
    req.decoded = decoded;
    next();
  });
};

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

    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // jwt
    app.post('/jwt', async (req, res) => {
      const userData = req.body;
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '2h' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      res.send({ success: true })
    })

    app.get('/events', async (req, res) => {
      const { search, eventType } = req.query;

      const query = {};


      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }


      if (eventType) {
        query.eventType = eventType;
      }

      try {
        const events = await userCollenction.find(query).sort({ date: 1 }).toArray();
        res.send(events);
      } catch (error) {
        console.error('Error fetching filtered events:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });


    app.get('/events/:id', logger, verifytken, async (req, res) => {
      const email = req.query.email;
      if (email !== req.decoded.email) {
        return res.status(401).send({ message: 'forbidden acces' })
      }
      const id = req.params.id;
      const result = await userCollenction.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get('/joinedEvents', logger, verifytken, async (req, res) => {
      const email = req.query.email;

      if (email !== req.decoded.email) {
        return res.status(401).send({ message: 'forbidden access' });
      }

      try {
        const joinedEvents = await joinedCollenction.find({ userEmail: email }).toArray();
        res.send(joinedEvents);
      } catch (error) {
        console.error('Error fetching joined events:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });


    app.get('/myEvents', logger, verifytken, async (req, res) => {
      const email = req.query.email;
      if (email !== req.decoded.email) {
        return res.status(401).send({ message: 'forbidden acces' })
      }
      const userEmail = req.query.email;
      const result = await userCollenction.find({ createdBy: userEmail }).toArray();
      res.send(result);
    });

    app.put('/eventUpdate/:id', async (req, res) => {

      const id = req.params.id;
      const updatedPlant = req.body;
      const result = await userCollenction.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedPlant }
      );
      res.send(result);

    });


    app.post('/events', logger, verifytken, async (req, res) => {
      const email = req.query.email;
      if (email !== req.decoded.email) {
        return res.status(401).send({ message: 'forbidden acces' })
      }
      const newEvents = req.body;
      const result = await userCollenction.insertOne(newEvents);
      res.send(result);
    });
    app.post('/joinedEvents', logger, verifytken, async (req, res) => {
      const email = req.query.email;
      if (email !== req.decoded.email) {
        return res.status(401).send({ message: 'forbidden acces' })
      }
      const newEvents = req.body;
      const result = await joinedCollenction.insertOne(newEvents);
      res.send(result);
    });
    app.delete('/events/:id', logger, verifytken, async (req, res) => {
      const email = req.query.email;
      if (email !== req.decoded.email) {
        return res.status(401).send({ message: 'forbidden acces' })
      }
      const id = req.params.id;
      const result = await userCollenction.deleteOne({ _id: new ObjectId(id) });
      res.send(result);

    });
    
    app.get('/joinedEvents/check', async (req, res) => {
      const { eventId, email } = req.query;

      if (!eventId || !email) {
        return res.status(400).json({ error: 'Missing parameters' });
      }

      const alreadyJoined = await db.collection('joinedEvents').findOne({
        eventId,
        userEmail: email,
      });

      res.json({ alreadyJoined: !!alreadyJoined });
    });


  } finally {


  }
}
run().catch(console.dir);




app.listen(port, () => {
  console.log(`my sever is running ${port}`);
})