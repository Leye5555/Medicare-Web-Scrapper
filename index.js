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

// set path to views 
app.set("views", pathToViews);

// call cors
app.use(cors()); 


// set home page
app.get("/", async (req, res)=> res.sendFile(pathToViews + "/index.html"));




//create post method for search query
app.post("/scraper", async (req, res)=> {
    try{
    const done = await puppeteerFxn(req.body);   
    if (done === "done") res.status(200).send({message : "ok"});
    }catch(err) {
        console.log(err);
    }
})

app.get("/scraper/download", async (req,res)=> {
    try{ res.download(__dirname + "/appeal.csv");}catch(err){res.status(500)}
})

app.listen(PORT, ()=> console.log(`server is running on port ${PORT}`));
