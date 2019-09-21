const cron = require("node-cron");
const express = require("express");
const fs = require("fs");

app = express();




// schedule tasks to be run on the server
cron.schedule("* * * * * *", function () {
    console.log("running a task every second");
    
});

app.listen(3128);