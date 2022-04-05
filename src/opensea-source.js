const bigDecimal = require("js-big-decimal");
const { executeQuery } = require("./subgraph-client");
const {
    DIVISION_PRECISION,
    SUBGRAPH_ENDPOINT,
} = require("./constants.js");

const PAGE_SIZE = 1000;

const getSales = async (
    collection, tokenId,
    fromTimestamp = null, toTimestamp = null,
    fromPrice = null, toPrice = null,
    order = null, desc = null,
    limit = null, offset = null
) =>
{
    if (limit == null)
        limit = 10;
    
    const sales = await fetchSales(collection, tokenId,
        fromTimestamp, toTimestamp,
        fromPrice, toPrice,
        prepareOrder(order), desc,
        limit, offset);

    return sales.map(sale => {
        return {
            collection: sale.collection,
            tokenId: sale.tokenId,
            price: bigDecimal.divide(sale.usdtPrice, 1000000, DIVISION_PRECISION),
            time: sale.timestamp
        }
    });
}

const getLastSale = async (
    collection, tokenId,
    fromTimestamp = null, toTimestamp = null,
    fromPrice = null, toPrice = null
) =>
{
    const sales = await getSales(collection, tokenId,
        fromTimestamp, toTimestamp,
        fromPrice, toPrice,
        "time", true, 1, 0)
    if (sales == null || sales.length == 0)
        return null;
    return sales[0];
}

const getAveragePrice = async (
    collection, tokenId,
    fromTimestamp, toTimestamp,
    fromPrice = null, toPrice = null
) => {
    if (fromTimestamp == null || toTimestamp == null)
        throw new Error("time range must be provided");

    let sum = 0;
    let count = 0;
    let lastFetchedResultCount = PAGE_SIZE;

    while (lastFetchedResultCount >= PAGE_SIZE && count <= 5000) {
        const sales = await getSales(
            collection, tokenId,
            fromTimestamp, toTimestamp,
            fromPrice, toPrice,
            null, null, PAGE_SIZE, count
        );
        if (sales == null)
            break;
        
        sum = sales.map(sale => sale.price).reduce((p, c) => bigDecimal.add(p, c), sum);
        
        lastFetchedResultCount = sales.length;
        count += lastFetchedResultCount;
    }

    if (count == 0)
        return null;

    return {
        average: bigDecimal.divide(sum, count, DIVISION_PRECISION),
        count: count
    };
};

const getFloorPrice = async (
    collection, tokenId = null,
    fromTimestamp = null, toTimestamp = null
) => {
    const sales = await getSales(collection, tokenId, fromTimestamp, toTimestamp, null, null, "price", false, 1, 0);

    if (sales == null || sales.length == 0)
        return null;

    return sales[0];
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
    fromTimestamp,
    toTimestamp,
    fromPrice,
    toPrice,
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
    filters.push(...getTimestampFilters(fromTimestamp, toTimestamp));
    filters.push(...getPriceFilters(fromPrice, toPrice));

    const criteria = [];
    if (offset != null)
        criteria.push(`skip: ${offset}`);
    criteria.push(`first: ${limit == null ? PAGE_SIZE : limit}`);
    if (order != null)
        criteria.push(`orderBy: ${order}`);
    if (desc != null)
        criteria.push(`orderDirection: ${desc ? "desc" : "asc"}`);
    if (filters.length != 0)
        criteria.push(`where: {${filters.join(", ")}}`);

    const query = `{
        sales(${criteria.join(", ")}){
            collection
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
    if (fromTimestamp != null && toTimestamp != null && fromTimestamp > toTimestamp)
        throw new Error("invalid time period");
    const filters = [];
    if (fromTimestamp != null)
        filters.push(`timestamp_gte: ${fromTimestamp}`);
    if (toTimestamp != null)
        filters.push(`timestamp_lt: ${toTimestamp}`);
    return filters;
}

const getPriceFilters = (fromPrice, toPrice) => {
    if (fromPrice != null && toPrice != null && fromPrice > toPrice)
        throw new Error("invalid price range");
    const filters = [];
    if (fromPrice != null)
        filters.push(`usdtPrice_gte: ${fromPrice}`);
    if (toPrice != null)
        filters.push(`usdtPrice_lt: ${toPrice}`);
    return filters;
}

const prepareOrder = (order) => {
    if (order == null)
        return null;
    switch (order) {
        case "time":
            return "timestamp";
        case "price":
            return "usdtPrice"
        default:
            throw new Error("Invalid order field");
    }
}

module.exports = {
    getSales,
    getLastSale,
    getAveragePrice,
    getFloorPrice,
};
