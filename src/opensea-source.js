const bigDecimal = require("js-big-decimal");
const { executeQuery } = require("./subgraph-client");
const {
    DIVISION_PRECISION,
    SUBGRAPH_ENDPOINT,
    ETH_ID, WETH_ID,
    checkTimePeriod,
} = require("./constants.js");

const PAGE_SIZE = 1000;

const getTokenPrice = async (
    collection,
    tokenId,
    fromTimestamp = null,
    toTimestamp = null
) => {
    const now = Math.floor(Date.now() / 1000);
    if (toTimestamp == null || toTimestamp > now)
        toTimestamp = now; 

    // const allSales = [];
    let count = 0;
    let lastSale = null;
    let lastFetchedResultCount = PAGE_SIZE;

    while (lastFetchedResultCount >= PAGE_SIZE) {
        const sales = await fetchTokenPrices(
            collection,
            tokenId,
            fromTimestamp,
            toTimestamp,
            count
        );
        if (sales == null)
            break;

        if (count == 0 && sales.length != 0)
            lastSale = sales[0];
        
        lastFetchedResultCount = sales.length;
        count += lastFetchedResultCount;
    }

    if (count == 0)
        return null;

    const paymentToken = lastSale.paymentToken;

    return {
        lastSalePrice: bigDecimal.divide(lastSale.price, Math.pow(10, paymentToken.decimals), DIVISION_PRECISION),
        lastSaleToken: paymentToken.symbol,
        lastSaleUsdtPrice: bigDecimal.divide(lastSale.usdtPrice, 1000000, DIVISION_PRECISION),
        lastSaleTime: lastSale.timestamp,
        totalSales: count
    };
};

const getFloorPrice = async (
    collection,
    tokenId = null,
    fromTimestamp = null,
    toTimestamp = null
) => {
    const sales = await fetchFloorPrice(collection, tokenId, fromTimestamp, toTimestamp);

    if (sales == null || sales.length == 0)
        return null;

    const sale = sales[0];
    const paymentToken = sale.paymentToken;

    return {
        tokenId: sale.tokenId,
        price: bigDecimal.divide(sale.price, Math.pow(10, paymentToken.decimals), DIVISION_PRECISION),
        paymentToken: paymentToken.symbol,
        usdtPrice: bigDecimal.divide(sale.usdtPrice, 1000000, DIVISION_PRECISION),
        time: sale.timestamp
    };
};


const fetchTokenPrices = async (
    collection,
    tokenId,
    fromTimestamp,
    toTimestamp,
    skip
) => {
    if (collection == null || collection.length == 0)
        throw new Error("collection must be provided");
    if (tokenId == null)
        throw new Error("tokenId must be provided");
    return fetchSales(collection, tokenId, null, fromTimestamp, toTimestamp, "timestamp", true, PAGE_SIZE, skip);
}

const fetchFloorPrice = async (
    collection,
    tokenId,
    fromTimestamp,
    toTimestamp
) => {
    if (collection == null || collection.length == 0)
        throw new Error("collection must be provided");
    return fetchSales(collection, tokenId, [ETH_ID, WETH_ID], fromTimestamp, toTimestamp, "price", false, 1, 0);
}

const fetchSales = async (
    collection,
    tokenId,
    paymentTokenIds,
    fromTimestamp,
    toTimestamp,
    order,
    desc,
    limit,
    offset
) => {
    const filters = [];
    if (collection != null && collection.length != 0)
        filters.push(`collection: \"${collection}\"`);
    if (tokenId != null)
        filters.push(`tokenId: \"${tokenId}\"`);
    if (paymentTokenIds != null && paymentTokenIds.length != 0) {
        const tokens = paymentTokenIds.map(token => `"${token}"`).join(", ");
        filters.push(`paymentToken_in: [${tokens}]`);
    }
    filters.push(...getTimestampFilters(fromTimestamp, toTimestamp));

    const criteria = [];
    if (offset != null)
        criteria.push(`skip: ${offset}`);
    if (limit != null)
        criteria.push(`first: ${limit}`);
    if (order != null)
        criteria.push(`orderBy: ${order}`);
    if (desc != null)
        criteria.push(`orderDirection: ${desc ? "desc" : "asc"}`);
    if (filters.length != 0)
        criteria.push(`where: {${filters.join(", ")}}`);

    const query = `{
        sales(${criteria.join(", ")}){
            tokenId
            timestamp
            price
            paymentToken {
                symbol
                decimals
            }
            usdtPrice
        }
    }`;

    return (await executeQuery(SUBGRAPH_ENDPOINT, query))?.sales;
}

const getTimestampFilters = (fromTimestamp, toTimestamp) => {
    checkTimePeriod(fromTimestamp, toTimestamp);
    const filters = [];
    if (fromTimestamp != null)
        filters.push(`timestamp_gte: ${fromTimestamp}`);
    if (toTimestamp != null)
        filters.push(`timestamp_lt: ${toTimestamp}`);
    return filters;
}

module.exports = {
    getTokenPrice,
    getFloorPrice,
};
