var express = require("express");
var app = express();
// This for the templates
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// Mongo db module
const MongoClient = require("mongodb").MongoClient;

/* Let's take env parameters in use */
require("dotenv").config();

// Set userid and pw. To be set in Atlas pages
var user = process.env.MONGO_USERID
var pw = process.env.MONGO_PW

// Create connection script to db
// En oo täysin varma kuuluuko <password> korvata oikeella salasanalla mut ei toiminut ilman
const uri = "mongodb+srv://sakarikoivumaki:admin@cluster0.nzdfxf7.mongodb.net/?retryWrites=true&w=majority";

//koodi ei taida hyödyntää mongoosea ollenkaan. Mielestäni mongoDB on dokumentoitu paljon paremmin tai ainakin ymmärrän sen paremmpin niin käytin perus mongodb.

// Print kaikki tiedot kannasta
app.get("/api/getall", function(req, res) {
    // Create connection object
    const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
    
  async function connectAndFetch(){
    try {
      // Take connection to "projekti" and collection "music"
      await client.connect();
      const collection = client.db("projekti").collection("music");
      
      // make query with collection-object
      var result = await collection
        .find() // Use empty find to show all contents
        .limit(20)
        .toArray() 
      console.log(result);
      res.send(result).status(200);
  
    } catch (e){
      console.error(e);
    } finally {
      await client.close();
      console.log("Connection closed to MONGO");
    }
  }
  connectAndFetch();

});

// Lisää musiikkia tietokantaan
app.post("/api/add", function(req, res) {

  const client = new MongoClient(uri);
  async function run() {
    try {
      const database = client.db("projekti");
      const music = database.collection("music");
      var insertOne = require('mongoose').insertOne;
      // create a document to insert
      const doc = { 
        Artist: req.body.artist,
        Title: req.body.title,
        Album: req.body.album, 
      }
      //insert
      const result = await music.insertOne(doc);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      if(insertOne==null){
        res.send("Add song: " + req.body.title +" "+ req.body.artist +" "+ req.body.album).status(200);
      } else {
        res.send("Something went wrong").status(404);
      }

    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
  console.log("Song add success")
  
});

// Modify the information of movie by ID number.See how to read the ID
app.put("/api/update/:id", function(req, res) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  async function connectAndUpdate(){
    try{
        var ObjectID = require('mongodb').ObjectId;
        console.log("Request got to update "+req.params.id);
        let collection = await client.db("projekti").collection("music");
        let query = {_id: new ObjectID(req.params.id)};
        const update = { $set: { Artist: req.body.artist, Title: req.body.title, Album: req.body.album }};
        console.log(req.body.artist +" "+req.body.title +" "+req.body.album)
        const options = {};
        await collection.updateOne(query, update, options);

        res.send("Modify song by " + req.params.id);
    } catch (e){
      console.error(e);
    } finally {
      await client.close();
      console.log("Connection closed to MONGO");
    }
  }
  connectAndUpdate();
});

//poisto ID avulla
app.delete("/api/delete/:id", function (req, res) {
  // Yhdistä tietokantaan
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log("API delete called");
  async function connectAndDelete(){
    try{
      // Take connection to "projekti" and collection "music"
      var ObjectID = require('mongodb').ObjectId;
      await client.connect();

      console.log("Request got "+req.params.id);
      let collection = await client.db("projekti").collection("music");
      let query = {_id: new ObjectID(req.params.id)};
      //Tarkista löytyykö objectia
      let result = await collection.findOne(query);
      if (!result) res.send("Document not found").status(404);
      else 
      res.send(result).status(200);
      //poisto
      await collection.deleteOne(query);
      //debug
      if (deletedCount=1) {
        console.log("Delete success")
      }

    } catch (e){
      console.error(e);
    } finally {
      await client.close();
      console.log("Connection closed to MONGO");
    }
    
  }
  connectAndDelete();
});

//Etsi yksi ja pyydä tiedot
app.get("/api/:id", function(req, res) {
   // Yhdistä tietokantaan
   const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
    
  async function connectAndFetch(){
    try {
      // Take connection to "projekti" and collection "music"
      var ObjectID = require('mongodb').ObjectId;
      await client.connect();

      let collection = await client.db("projekti").collection("music");
      let query = {_id: new ObjectID(req.params.id)};
      let result = await collection.findOne(query);
      //debug
      console.log(req.params.id)
      console.log(result);

      //Tarkista löytyykö objectia
      if (result=="null") {
        res.send(req.params.id+" doesnt exist!").status(404);
        console.log("API ID call success")
      } else {
        res.send(result).status(200);
      }      
    } catch (e){
      console.error(e);
    } finally {
      await client.close();
      console.log("Connection closed to MONGO");
    }
  }
  connectAndFetch();
});

// Web server by express
var PORT = process.env.PORT || 8080;
app.listen(PORT, function() {
    console.log("MongoDB app is listening on port %d", PORT);
});