const path = require("node:path");
const fs = require("node:fs");

const htmlHeader = `<!DOCTYPE html>
<html>
<head>
<script src="https://cdn.anychart.com/releases/8.11.0/js/anychart-base.min.js"></script>
<title>Trade Report</title>
</head>
<body>
<div style="height:400px" id="container"></div>`;
const htmlFooter = `</body>
</html>`;
const tableheader = `<table style="width:100%" ><tr>
<th>#</th>
<th>Session Time</th>
<th>Index</th>
<th>Capital Cost</th>
<th>Profit/Loss</th>
<th>Remarks</th>
</tr>`;
const tableFooter = `</table>`;

module.exports.reportTradeLog = function reportTradeLog(tradeLog, reportName) {
    const filePath = path.join(__dirname, "/reports/", `${reportName}.html`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const handle = fs.openSync(filePath, "a");
    try {
        fs.writeFileSync(handle, htmlHeader);
        fs.writeFileSync(handle, tableheader);
        let totalProfit = 0;
        let maxCapital = 0;
        let trendData = [];
        tradeLog.forEach((transaction, idx) => {
            fs.writeFileSync(handle, `<tr ${transaction.remarks === "Executed" ? (transaction.profit >= 0 ? 'style="background-color: greenyellow"' : 'style="background-color: lightcoral"') : ""}> 
            <td>${idx}</td> 
            <td>${transaction.time}</td> 
            <td>${transaction.index}(${transaction.normalizedIndex})</td> 
            <td>${transaction.cost.toFixed(2)}</td> 
            <td>${transaction.profit.toFixed(2)}</td> 
            <td>${transaction.remarks}</td> 
            </tr>`);
            trendData.push([idx, transaction.index, transaction.profit, transaction.normalizedIndex]);
            if (transaction.remarks === "Executed") totalProfit += transaction.profit;
            maxCapital = Math.max(maxCapital, transaction.cost);
        });
        fs.writeFileSync(handle, `<h1>${Math.round((totalProfit / maxCapital) * 100.0)}%</h1><span>Total Profit:${Math.round(totalProfit)} Total Capital:${Math.round(maxCapital)}</span>`);
        fs.writeFileSync(handle, tableFooter);
        fs.writeFileSync(handle, generateChartScript(trendData, ["Index", "Profit", "NormalizedIndex"]));
        fs.writeFileSync(handle, htmlFooter);
    }
    finally {
        fs.closeSync(handle);
    }
}

function generateChartScript(data, names) {
    return `    <script>
    anychart.onDocumentReady(function () {

      // add data
      var data = ${JSON.stringify(data)};

      // create a data set
      var dataSet = anychart.data.set(data);

      // map the data for all series
      var firstSeriesData = dataSet.mapAs({x: 0, value: 1});
      var secondSeriesData = dataSet.mapAs({x: 0, value: 2});
      var thirdSeriesData = dataSet.mapAs({x: 0, value: 3});

      // create a line chart
      var chart = anychart.line();

      // create the series and name them
      var firstSeries = chart.line(firstSeriesData);
      firstSeries.name("${names[0]}");
      var secondSeries = chart.line(secondSeriesData);
      secondSeries.name("${names[1]}");
      var thirdSeries = chart.line(thirdSeriesData);
      thirdSeries.name("${names[2]}");

      // add a legend
      chart.legend().enabled(true);

      // add a title
      chart.title("Session Trend");

      // specify where to display the chart
      chart.container("container");

      // draw the resulting chart
      chart.draw();

    });
  </script>`;
}