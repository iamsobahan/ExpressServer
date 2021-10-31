const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v2wiu.mongodb.net/myFirstDatabase?retryWrites=true&w=majorit`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 8XM85OmSF37MD5f3

async function run() {
  try {
    await client.connect();
    const database = client.db("db_packages");
    const userPackages = database.collection("packages");

    const orderDb = client.db("order_packages");
    const orderInfo = orderDb.collection("infos");

    app.get("/packages", async (req, res) => {
      const cursor = userPackages.find({});
      const packages = await cursor.toArray();
      res.send(packages);
    });

    // package post at userPackages collection
    app.post("/packages", async (req, res) => {
      const orders = req.body;
      const result = await userPackages.insertOne(orders);
      console.log(result);
      res.json(result);
    });

    // get unique package from userPackages collection
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userPackages.findOne(query);
      res.send(result);
    });

    app.post("/packages/orders", async (req, res) => {
      const packages = req.body;
      const result = await orderInfo.insertOne(packages);
      res.send(result);
    });

    app.get("/packages/orders", async (req, res) => {
      const cursor = orderInfo.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.put("/packages/orders/:id", async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          status: update.status,
        },
      };
      const result = await orderInfo.updateOne(filter, updateDoc, option);
      console.log(result);
      res.json(result);
    });

    app.delete("/packages/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderInfo.deleteOne(query);
      res.json(result);
    });

    // app.delete("/packages/orders/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: ObjectId(id) };
    //   const result = await orderInfo.deleteOne(query);
    //   res.json(result);
    // });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  console.log("hit the server");
  res.send("Allah is our Creator");
});

app.listen(port, () => {
  console.log("listening from ", port);
});
