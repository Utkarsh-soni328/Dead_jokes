import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url"; // Import fileURLToPath function

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = 3000;
const app = express();
const API_URL = "https://v2.jokeapi.dev/joke/";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();

app.listen(port, () => {
  console.log("listening ");
});
//design files
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//db connection
console.log(process.env.CONNECTION_STRING);
mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var db = mongoose.connection;

db.on("error", () => console.log("error in connecting to database"));
db.once("open", () => console.log("connected to database"));
//various routes

app.get("/", async (req, res) => {
  var safe = req.query.safemode;

  var category = req.query.type;
  var langcode = req.query.lang;
  try {
    const result = await axios.get(
      API_URL + category + "?lang=" + langcode + "&" + safe
    );

    res.render("index.ejs", {
      question: result.data.setup,
      joke: result.data.delivery,
      category: category,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/getselected", async (req, res) => {
  var category = req.body.type;
  var langcode = req.body.lang;
  var safe = req.body.safemode;

  res.redirect(`/?type=${category}&lang=${langcode}&safemode=${safe}`);
});

//personal jokes collection

// Define a Mongoose schema for your collection
const jokeSchema = new mongoose.Schema({
  title: String,
  contents: String,
});

// Create a Mongoose model based on the schema
const Joke = mongoose.model("Joke", jokeSchema);

// Route to insert a new joke into the database
app.post("/submit", async (req, res) => {
  try {
    // Extract title and contents from the request body
    const { title, contents } = req.body;

    // Create a new Joke document using the Mongoose model
    const newJoke = new Joke({ title, contents });

    // Save the new joke document to the database
    await newJoke.save();

    res.redirect("/"); // Send the inserted joke as JSON response
  } catch (error) {
    console.error("Error inserting joke:", error);
    res.status(500).json({ error: "Failed to insert joke" });
  }
});

app.post("/getall", async (req, res) => {
  try {
    // Use the find method to retrieve all documents from the Joke collection
    const jokes = await Joke.find();
    console.log(jokes);
    res.render("index.ejs", {
      myjoke: jokes,
    }); // Send the retrieved jokes as JSON response
  } catch (error) {
    console.error("Error fetching jokes:", error);
    res.status(500).json({ error: "Failed to fetch jokes" });
  }
});
