const bigDecimal = require("js-big-decimal");
const PAGE_SIZE = 1000;
const ETH_TO_WEI = new bigDecimal("1000000000000000000");
const DIVISION_PRECISION = 5;
const SUBGRAPH_ENDPOINT =
    "https://api.thegraph.com/subgraphs/name/kowsaratz/muon-data-test";

const checkTimePeriod = (from, to) => {
    if (from != null && to != null && from > to)
        throw new Error("invalid time period");
    const now = Math.floor(Date.now() / 1000);
    return to == null || to > now ? now : to; 
};

module.exports = {
    PAGE_SIZE,
    ETH_TO_WEI,
    SUBGRAPH_ENDPOINT,
    DIVISION_PRECISION,
    checkTimePeriod,
};
