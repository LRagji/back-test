var gaussian = require('gaussian');

function getRandomInt(minInclusive, maxInclusive) {
    minInclusive = Math.ceil(minInclusive);
    maxInclusive = Math.floor(maxInclusive);
    return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

module.exports.getNifty50Index = function getNifty50Index(previousClosing) {
    const maxMovementInIndexPerDay = 140 / 2;
    return getRandomInt(previousClosing - maxMovementInIndexPerDay, previousClosing + maxMovementInIndexPerDay);
}

const fixedData = [19520, 19453, 19436, 19424, 19388]
module.exports.getNifty50IndexKnownCondition = function getNifty50IndexKnownCondition(previousClosing) {
    return fixedData.shift();
}

module.exports.getCurrentWeekOptionsChain = function getCurrentWeekOptionsChain(atmPoint, targetPoint) {
    const internalATM = atmPoint - (atmPoint % 100);
    const internalTargetPoint = targetPoint - (targetPoint % 100);
    const result = calculateoptionReturn(internalTargetPoint, internalATM, 12, 6, 5, 3);
    return { c: result[0], p: result[1], m: 106000 };
}

function calculateoptionReturn(strike, underlying, volatility, interest_rate, dividend, expiration) {
    const S = Number(strike);
    const U = Number(underlying);
    const V = Number(volatility) / 100;
    const I = Number(interest_rate) / 100;
    const D = Number(dividend);
    const E = Number(expiration) / 365;

    const d1 = (Math.log(U / S) + (I + Math.pow(V, 2) / 2) * E) / (V * Math.sqrt(E)),
        d2 = (Math.log(U / S) + (I - Math.pow(V, 2) / 2) * E) / (V * Math.sqrt(E));
    const fv_strike = (S) * Math.exp(-1 * I * E);

    //For calculating CDF and PDF using gaussian library
    const distribution = gaussian(0, 1);

    //Premium Price
    const call_premium = U * distribution.cdf(d1) - fv_strike * distribution.cdf(d2),
        put_premium = fv_strike * distribution.cdf(-1 * d2) - U * distribution.cdf(-1 * d1);

    //Option greeks
    const call_delta = distribution.cdf(d1),
        put_delta = call_delta - 1;

    let call_gamma = distribution.pdf(d1) / (U * V * Math.sqrt(E));
    if (isNaN(call_gamma)) {
        call_gamma = 0;
    }
    put_gamma = call_gamma;

    let call_vega = U * distribution.pdf(d1) * Math.sqrt(E) / 100;
    if (isNaN(call_vega)) {
        call_vega = 0;
    }
    put_vega = call_vega;

    const call_theta = (-1 * U * distribution.pdf(d1) * V / (2 * Math.sqrt(E)) - I * fv_strike * distribution.cdf(d2)) / 365,
        put_theta = (-1 * U * distribution.pdf(d1) * V / (2 * Math.sqrt(E)) + I * fv_strike * distribution.cdf(-1 * d2)) / 365;

    const call_rho = fv_strike * E * distribution.cdf(d2) / 100,
        put_rho = -1 * fv_strike * E * distribution.cdf(-1 * d2) / 100;

    return [call_premium, put_premium, call_delta, put_delta, call_gamma, call_vega, call_theta, put_theta, call_rho, put_rho];

}