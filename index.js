const cron = require("node-cron");
const fs = require("fs");
const rp = require("request-promise");
const $ = require("cheerio");



const FILE_LOCATION = "./url-mapping.json";

let urlMapperList = [];


init();

function init() {

    console.log("Initializing the server");

    // Initialize the urlMapperList variable
    const textFromFile = fs.readFileSync(FILE_LOCATION, "utf8");
    urlMapperList = JSON.parse(textFromFile);
    // prepareScheduledActions();
    let requests = [];
    urlMapperList.forEach(urlMapper => {
        requests = requests.concat(scrapeHmtlFromUrl(urlMapper));
    });

    Promise.all(requests).finally(()=>{
        writeObjToFile(urlMapperList);
    });
}

async function scrapeHmtlFromUrl(urlMapper) {
    let html = '';

    try {
        html = await rp(urlMapper.url);
    } catch (error) {
        return console.log('There was an error getting the html from the url\n Error: ', error);
    }
    
    const priceHtmlElement = $(urlMapper.location, html);
    if (priceHtmlElement.length === 0) {
        return console.log('The location of the price element for the product ', urlMapper.name, ' is invalid');
    }

    const unformatedPrice = priceHtmlElement.text();
    const price = unformatedPrice.match(/(\d*\.?\d+)/gm)[0].replace('.', '');

    console.log('The price for ', urlMapper.name, ' is ', price);


    if ((urlMapper.lowestValue === 0)) {
        urlMapper.lowestValue = price;
    } else if (price < urlMapper.lowestValue) {
        urlMapper.lowestValue = price;
        // Send warning email
    }
}




function prepareScheduledActions() {
    // schedule tasks to be run on the server
    cron.schedule("* * * * * *", function () {
        console.log("running a task every second");

        writeObjToFile(urlMapperList);
    });

}


// Utils 

function writeObjToFile(obj) {
    const textToFile = JSON.stringify(obj);
    fs.writeFile(FILE_LOCATION, textToFile, function (err) {
        if (err) {
            console.log("There was a problem updatin the url mapper file\nError: ", err);
        } else {
            console.log("Url mapper file updated succesfully");
        }
    });
}
