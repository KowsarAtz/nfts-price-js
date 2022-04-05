const DIVISION_PRECISION = 5;

const SUBGRAPH_ENDPOINT =
    "https://api.thegraph.com/subgraphs/name/kowsaratz/nfts-price-v1-test";

const ETH_ID = "0x0000000000000000000000000000000000000000";
const WETH_ID = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const checkTimePeriod = (from, to) => {
    if (from != null && to != null && from > to)
        throw new Error("invalid time period");
};

module.exports = {
    SUBGRAPH_ENDPOINT,
    DIVISION_PRECISION,
    ETH_ID, WETH_ID,
    checkTimePeriod,
};
