import express from "express";
import puppeteerFxn from "./controllers/index.js";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { dirname } from 'path';
import { fileURLToPath } from 'url';


const app = express();

// configure dotenv only on development
if (app.get("env") !== "production") dotenv.config();



const PORT = process.env.PORT;
app.use(express.json({limit : "50mb", extended : true})); 
app.use(express.urlencoded({limit : "50mb", extended : true}));

const __dirname = dirname(fileURLToPath(import.meta.url));
const pathToViews = path.join(__dirname, "src/views");
const pathToJs = path.join(__dirname, "public/js");
const pathToCss = path.join(__dirname, "public/css");
const pathToAssets = path.join(__dirname, "public/assets");

// set path to views 
app.set("views", pathToViews);

// set statics
app.use(express.static(pathToJs)); // js statics
app.use(express.static(pathToCss)); // css statics
app.use(express.static(pathToAssets)); // assets statics

// call cors
app.use(cors()); 


// set home page
app.get("/", async (req, res)=> res.sendFile(pathToViews + "/index.html"));




//create post method for search query
app.post("/scraper", async (req, res)=> {
    try{
    const done = await puppeteerFxn(req.body);  // call the puppeteer Fxn and pass the req obj to it 
    if (done === "done") res.status(200).send({message : "ok"});
    }catch(err) {
        console.log(err);
    }
})

app.get("/scraper/download", async (req,res)=> {
    try{ res.download(__dirname + "/appeal.csv");}catch(err){res.status(500)}
})

app.listen(PORT, ()=> console.log(`server is running on port ${PORT}`));
