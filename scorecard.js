const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const baseUrl = "https://www.espncricinfo.com";

function processMatch(url) {

    request(url, cb);
}

function cb(err, response, html) {

    if (err)
        console.log("Error is: ", err);

    else
        extractMatchDetails(html);
}

function extractMatchDetails(html) {

    let $ = cheerio.load(html);

    let venueDetails = $('.ds-text-tight-m.ds-font-regular.ds-text-typo-mid3')[0];
    let text = $(venueDetails).text().split(",");
    let venue = text[1].trim();
    let date = text[2] + text[3];
    date = date.trim();

    let result = $('.ds-text-tight-m.ds-font-regular.ds-truncate.ds-text-typo>span').text();
    let winningTeam = result.split("won");
    winningTeam = winningTeam[0];
    winningTeam = winningTeam.trim();

    let inningsArr = $('.ds-rounded-lg.ds-mt-2');

    for (let i = 0; i < inningsArr.length; i++) {

        let teamName = $(inningsArr[i]).find('.ds-text-title-xs.ds-font-bold.ds-capitalize').text();

        let oppIdx = i === 0 ? 1 : 0;
        let opponentName = $(inningsArr[oppIdx]).find('.ds-text-title-xs.ds-font-bold.ds-capitalize').text();

        console.log(`${venue} ${date} ${teamName} ${opponentName}`);

        let cInning = $(inningsArr[i]);
        let allRows = $(cInning).find(".ds-w-full.ds-table.ds-table-md.ds-table-auto.ci-scorecard-table tbody>tr");

        for (let j = 0; j < allRows.length; j++) {

            let allCols = $(allRows[j]).find("td");

            let isWorthy1 = $(allCols[0]).hasClass(".ds-hidden");
            let isWorthy2 = $(allCols[0]).hasClass(".ds-min-w-max");
            let isWorthy3 = $(allCols[0]).attr('colspan');
            let isWorthy4 = $(allCols[0]).find("div").hasClass(".ds-leading-4");

            let isWorthy = (isWorthy1 || isWorthy2 || isWorthy3 || isWorthy4);

            if (isWorthy === false) {

                let playerName = $(allCols[0]).text().trim();
                let runs = $(allCols[2]).text().trim();
                let balls = $(allCols[3]).text().trim();
                let fours = $(allCols[5]).text().trim();
                let sixes = $(allCols[6]).text().trim();
                let sr = $(allCols[7]).text().trim();

                console.log(`${playerName} ${runs} ${balls} ${fours} ${sixes} ${sr}`);

                processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentName, venue, date, result);
            }
        }

    }

}

function processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentName, venue, date, result) {

    let teamPath = path.join(__dirname, "ipl", teamName);
    dirCreator(teamPath);

    let filePath = path.join(teamPath, playerName + ".xlsx");
    let content = excelReader(filePath, playerName);

    let playerObj = {

        teamName,
        playerName,
        runs,
        balls,
        fours,
        sixes,
        sr,
        opponentName,
        venue,
        date,
        result
    }
    content.push(playerObj);

    excelWriter(filePath, content, playerName);

}

function dirCreator(dirPath) {

    if (!fs.existsSync(dirPath))
        fs.mkdirSync(dirPath);
}

function excelWriter(filePath, json, sheetName) {

    // New Worksheet
    let newWB = xlsx.utils.book_new();

    // JSON data to sheet (excel format)
    let newWS = xlsx.utils.json_to_sheet(json);

    // Adding sheet into workbook
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);

    // Creating new file
    xlsx.writeFile(newWB, filePath);
}

function excelReader(filePath, sheetName) {

    if (!fs.existsSync(filePath))
        return [];

    // Get workbook
    let wb = xlsx.readFile(filePath);

    // Get sheet data
    let excelData = wb.Sheets[sheetName];

    // Retrieve data from sheet
    let res = xlsx.utils.sheet_to_json(excelData);

    return res;
}

module.exports = {

    processMatch
}