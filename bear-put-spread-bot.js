module.exports = class BearPutSpreadBot {

    constructor() {

        this.perTradeCost = 50;
        this.sessionLastCall = 28500000;
        this.lotsize = 50;
        this.activeTrades = [];
        this.pl = 0;
        this.capital = 0;

    }

    notify(index, optionChain, sessionTime) {
        const normalizedIndex = index - index % 100;
        let logEntry = {
            time: sessionTime,
            index: index,
            normalizedIndex: normalizedIndex,
            cost: 0,
            profit: 0,
            trades: [],
            remarks: ""
        };
        if (sessionTime === this.sessionLastCall) {
            //Forcefully sell and report total P/L
            logEntry = this.squareOffTrade(normalizedIndex, optionChain, logEntry);
        }
        else if (this.activeTrades.length <= 0 && sessionTime < this.sessionLastCall) {
            //Buy trade first leg
            const atmPrice = optionChain.get(normalizedIndex);
            if (atmPrice == null) {
                throw new Error(`Cannot find option chain at ${normalizedIndex},${index} for first leg, setup error.`);
            } else {
                const capitalCost = atmPrice.m + (atmPrice.p * this.lotsize);
                this.activeTrades.push({ i: index, t: "SPE", p: atmPrice.p, c: capitalCost });
                this.pl -= this.perTradeCost;
                this.capital += capitalCost;
                logEntry.remarks = "Entry";
                logEntry.cost += capitalCost;
            }
        }
        else if (this.activeTrades.length === 2) {
            //Sell trade in next session to simulate slipage & compute P/L
            logEntry = this.squareOffTrade(normalizedIndex, optionChain, logEntry);
        }
        else if (this.activeTrades.length === 1) {
            //Find profitable trade second leg
            const oldIndex = this.activeTrades[0].i;
            const delta = index - oldIndex;
            if (delta >= 40) {//Means we are in profit sell existing leg
                this.activeTrades.push(null);
                logEntry.remarks = `Exit (${delta})`;
            }
            if (delta <= -40) {//Means we have loss so introduce the second leg
                const farITMIndex = Math.max(...Array.from(optionChain.keys()));
                const farITMPrice = optionChain.get(farITMIndex);
                const capitalCost = farITMPrice.p * this.lotsize;
                this.activeTrades.push({ i: index, t: "BPE", p: farITMPrice.p, c: capitalCost });
                this.pl -= this.perTradeCost;
                this.capital += capitalCost;
                logEntry.remarks = `Exit (${delta})`;
                logEntry.cost += capitalCost;
            }
        }
        return logEntry;
    }


    squareOffTrade(normalizedIndex, optionChain, logEntry) {
        const currentPrice = optionChain.get(normalizedIndex);
        let capitalCostRecovered = 0;
        let profit = 0;
        this.activeTrades.forEach((entry) => {
            if (entry == null) {
                return;
            }
            capitalCostRecovered += entry.c
            switch (entry.t[1]) {
                case "P":
                    profit += ((entry.p - currentPrice.c) * this.lotsize);
                    break;
                case "C":
                    profit += ((entry.p - currentPrice.c) * this.lotsize);
                    break;
            }
        });
        this.capital -= capitalCostRecovered;
        this.pl += profit;
        logEntry.remarks = "Executed";
        logEntry.trades.push(this.activeTrades);
        logEntry.cost -= capitalCostRecovered;
        logEntry.profit = profit;
        this.activeTrades = [];
        return logEntry;
    }

}