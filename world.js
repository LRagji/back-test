const market = require("./sim/index");
const BearPutSpreadBot = require("./bear-put-spread-bot");
const htmlReporter = require("./reporters/html-report");
const oneIntradaySessionInMillis = 8 * 60 * 60 * 1000;
const startOfIndex = 19590;


function intradaySession(startOfIndex, sessionName) {
    const tradeLog = [];
    const strategyOne = new BearPutSpreadBot();
    console.log("Session Started");
    let index = startOfIndex;
    let timeOfDay = 0;
    // const debug = [19548, 19586, 19623, 19640];
    // let idx = 0;
    while (timeOfDay < oneIntradaySessionInMillis) {
        // index = debug[idx];
        // idx++;
        //index = market.getNifty50IndexKnownCondition(index);
        index = market.getNifty50Index(index);
        const log = strategyOne.notify(index, market.getCurrentWeekOptionsChain, timeOfDay)
        tradeLog.push(log);
        timeOfDay += 5 * 60 * 1000;
    }
    console.log("Session Closed");
    htmlReporter.reportTradeLog(tradeLog, sessionName);
}

for (let index = 0; index < 5; index++) {
    intradaySession(startOfIndex, `Sim-${index}`);
}
