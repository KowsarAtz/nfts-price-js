const bigDecimal = require("js-big-decimal");
const { executeQuery } = require("./graphql.js");
const {
    PAGE_SIZE,
    ETH_TO_WEI,
    DIVISION_PRECISION,
    checkTimePeriod,
} = require("./constants.js");

const getTokenPartialPrices = async (
    collection,
    tokenId,
    fromTimestamp,
    toTimestamp,
    skip = 0,
    first = PAGE_SIZE
) => {
    const timeFilter =
        fromTimestamp == null || toTimestamp == null
            ? ""
            : `, where: {timestamp_gte: ${fromTimestamp}, timestamp_lte: ${toTimestamp}}`;

    const query = `{
        token(id: "${collection}:${tokenId}"){
            sales (skip: ${skip}, first: ${first} , orderBy: timestamp, orderDirection: desc${timeFilter}) {
                price
            }
        }
    }`;

    const sales = (await executeQuery(query))?.data?.token?.sales;
    if (sales == null) throw new Error("token not found");
    return sales.map((sale) => new bigDecimal(sale.price));
};

const getTokenPrices = async (
    collection,
    tokenId,
    fromTimestamp,
    toTimestamp
) => {
    const prices = [];
    let lastFetchedResultCount = PAGE_SIZE;
    while (lastFetchedResultCount >= PAGE_SIZE) {
        const result = await getTokenPartialPrices(
            collection,
            tokenId,
            fromTimestamp,
            toTimestamp,
            prices.length
        );
        prices.push(...result);
        lastFetchedResultCount = result.length;
    }
    return prices;
};

const getTokenPriceData = async (
    collection,
    tokenId,
    fromTimestamp = null,
    toTimestamp = null
) => {
    checkTimePeriod(fromTimestamp, toTimestamp);
    const prices = await getTokenPrices(
        collection,
        tokenId,
        fromTimestamp,
        toTimestamp
    );
    const result = {
        latestPrice: null,
        averagePrice: null,
    };
    if (prices.length == 0) return result;

    result.latestPrice = prices[0]
        .divide(ETH_TO_WEI, DIVISION_PRECISION)
        .getValue();
    result.averagePrice = prices
        .reduce((a, b) => a.add(b))
        .divide(new bigDecimal(prices.length), DIVISION_PRECISION)
        .divide(ETH_TO_WEI, DIVISION_PRECISION)
        .getValue();
    return result;
};

module.exports = { getTokenPriceData };
