const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

//Midware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ema-cluster.gnvwp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
    try {
      await client.connect();
      const productsCollection = client.db("emaDB").collection("products");

      //get
      app.get('/products' ,async (req, res) => {
          const page = parseInt(req.query.page);
          const count = parseInt(req.query.count);
          const query = {};
          const cursor = productsCollection.find(query);

          let product;
          if (page || count){
            product = await cursor.skip((page-1)*count).limit(count).toArray();
          } else {
            product = await cursor.toArray();
          };
          res.send(product);
      });

      app.get('/productsCount', async(req,res) => {
          const query = {};
          const result = await productsCollection.estimatedDocumentCount();
          res.json(result)
      });
      // POst cart
      app.post('/cartProduct', async (req, res) => {
        const keys = req.body;
        const ids = keys.map(id => ObjectId(id));
        const query = {_id : {$in: ids}};
        const cursor = productsCollection.find(query);
        const products = await cursor.toArray();
        res.send(products)
        console.log(keys, products);
        
      })

    } finally {
        // console.log("object");
    }
};

run().catch(console.dir)


app.listen(port, () => {
    console.log("listening port form" , port)
})
