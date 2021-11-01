const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v2wiu.mongodb.net/myFirstDatabase?retryWrites=true`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("db_packages");
    const userPackages = database.collection("packages");

    const orderDb = client.db("order_packages");
    const orderInfo = orderDb.collection("infos");

    // geting order info from orderInfo

    app.get("/packages/order", async (req, res) => {
      const cursor = orderInfo.find({});
      const result = await cursor.toArray();

      res.json(result);
    });

    // posting users order info in orderInfo

    app.post("/packages/order", async (req, res) => {
      const user = req.body;
      const result = await orderInfo.insertOne(user);
      res.send(result);
    });

    // order status update dynamically  in orderInfo

    app.put("/packages/order/:id", async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      console.log(update);
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          status: update.status,
        },
      };
      const result = await orderInfo.updateOne(filter, updateDoc, option);

      res.json(result);
    });

    //  deleting unique order from objectId
    app.delete("/packages/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderInfo.deleteOne(query);

      res.json(result);
    });

    // package post at userPackages collection
    app.post("/packages", async (req, res) => {
      const orders = req.body;
      const result = await userPackages.insertOne(orders);

      res.json(result);
    });

    // get package info from userPackage collection

    app.get("/packages", async (req, res) => {
      const cursor = userPackages.find({});
      const packages = await cursor.toArray();
      res.send(packages);
    });

    // get unique package from userPackages collection
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userPackages.findOne(query);

      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  console.log("hit the server");
  res.send("Allah is our Creator.Allah is Almighty.");
});

app.listen(port, () => {
  console.log("listening from ", port);
});
