const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
require('dotenv').config() // allows process.env.xxx to access .env file
const controller = require('./controller.js');

app.use(express.static("public"));

app.get('/tags', controller.getTag);
app.get('/totals', controller.getTodaysTags);

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);