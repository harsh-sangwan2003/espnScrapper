const request = require('request');
const cheerio = require('cheerio');

const baseUrl = "https://www.espncricinfo.com";

const processMatchObj = require('./scorecard');

function getAllMatchesLink(url) {

    request(url, cb2);
}

function cb2(err, response, html) {

    if (err)
        console.log(err);

    else
        handleLinks(html);
}

function handleLinks(html) {

    let $ = cheerio.load(html);
    let allMatchesLinks = $('.ds-grow.ds-px-4.ds-border-r.ds-border-line-default-translucent>a');

    for (let i = 0; i < allMatchesLinks.length; i++) {

        let link = $(allMatchesLinks[i]).attr('href');
        let fullLink = baseUrl + link;

        processMatchObj.processMatch(fullLink);
    }
}

module.exports = {

    getAllMatchesLink
}