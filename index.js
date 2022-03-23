import express from "express";
// import * as cheerio from 'cheerio'
// import axios from "axios";
import puppeteer from "puppeteer";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from "fs";


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



//create api
// const API = axios.create({
//     baseURL : process.env.baseURL
// });

// create stream

// puppeteer function
const puppeteerFxn = async (obj) => {
    try{
        const writeStream = fs.createWriteStream("appeal.csv");
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(process.env.baseUrl);
        await page.type("#edit-appeal-number", obj["appeal-number"]);
        await page.type("#edit-contract-number", obj["contract-number"]);
        // await page.$eval("#edit-date-type", obj["date-type"]);
        await page.type("#edit-start-date", obj["start-date"]);
        await page.type("#edit-end-date", obj["end-date"]);


       // wait for click and navigation
        await Promise.all([page.click("#edit-submit"),page.waitForNavigation()])

        // get table headers
        const tableHeaders = await page.$$eval("#data-table tr > th", el => el.map(e => e.textContent).join(","));
        // write table headers
        writeStream.write(tableHeaders + "\n");
       
        // get table records 
        const selector = "#data-table tbody tr td";
        
        const tableRecords = await page.$$eval(selector, el => el.map(e => e.textContent))
        let sample = ""
        for (let i = 0; i < tableRecords.length; i++) {
            if ( (i + 1) % 12 === 0 ) {
               sample = sample + tableRecords[i] + "\n";
            }else {
                sample = sample + tableRecords[i] + ",";
            }
            
        }

        writeStream.write(sample.slice(0,sample.length))
        //close browser
        await browser.close();
        return "done";
    }

    catch(err){
        console.log(err)
    }
}


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
