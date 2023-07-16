const market = require("./sim/index");
const BearPutSpreadBot = require("./bear-put-spread-bot");
const reporter = require("./report");
const oneIntradaySessionInMillis = 8 * 60 * 60 * 1000;
const startOfIndex = 19590;


function intradaySession(startOfIndex) {
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
        index = market.getNifty50Index(index);
        const optionChain = market.getCurrentWeekOptionsChain(index);
        const log = strategyOne.notify(index, optionChain, timeOfDay)
        tradeLog.push(log);
        timeOfDay += 5 * 60 * 1000;
    }
    console.log("Session Closed");
    reporter.reportTradeLog(tradeLog);
}

intradaySession(startOfIndex);