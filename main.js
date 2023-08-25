const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const baseUrl = "https://www.espncricinfo.com";
const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

const getAllMatchesLinkObj = require('./AllMatch');

const iplPath = path.join(__dirname, "ipl");
dirCreator(iplPath);

request(url, cb);

function cb(err, response, html) {

    if (err)
        console.log("Error is: ", err);

    else
        extractHTML(html);
}

function extractHTML(html) {

    let $ = cheerio.load(html);

    let anchorTag = $('a[title="View All Results"]');
    let link = anchorTag.attr('href');
    let fullLink = baseUrl + link;

    getAllMatchesLinkObj.getAllMatchesLink(fullLink);
}

function dirCreator(dirPath) {

    if (!fs.existsSync(dirPath))
        fs.mkdirSync(dirPath);
}