
function getRandomInt(minInclusive, maxInclusive) {
    minInclusive = Math.ceil(minInclusive);
    maxInclusive = Math.floor(maxInclusive);
    return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

module.exports.getNifty50Index = function getNifty50Index(previousClosing) {
    const maxMovementInIndexPerDay = 140 / 2;
    return getRandomInt(previousClosing - maxMovementInIndexPerDay, previousClosing + maxMovementInIndexPerDay);
}

module.exports.getCurrentWeekOptionsChain = function getCurrentWeekOptionsChain(atmPoint) {
    const internalATM = atmPoint - (atmPoint % 100);
    return new Map([
        [internalATM - 500, { c: 506.0, p: 7.20, m: 106000 }],
        [internalATM - 400, { c: 406.0, p: 10.15, m: 106000 }],
        [internalATM - 300, { c: 310.0, p: 15.35, m: 106000 }],
        [internalATM - 200, { c: 232.85, p: 25.50, m: 106000 }],
        [internalATM - 100, { c: 145, p: 47.00, m: 106000 }],
        [internalATM, { c: 82.0, p: 83.90, m: 106000 }],
        [internalATM + 100, { c: 40.0, p: 141.35, m: 106000 }],
        [internalATM + 200, { c: 15.0, p: 218.35, m: 106000 }],
        [internalATM + 300, { c: 5.85, p: 307.50, m: 106000 }],
        [internalATM + 400, { c: 2.85, p: 407.00, m: 106000 }],
    ])
}