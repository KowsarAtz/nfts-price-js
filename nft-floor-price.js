const bigDecimal = require("js-big-decimal");
const { executeQuery } = require("./graphql.js");
const { ETH_TO_WEI, DIVISION_PRECISION, PAGE_SIZE } = require("./constants.js");

const getTokenFloorPrice = async (
    collection,
    tokenId,
    fromTimestamp,
    toTimestamp
) => {
    const timeFilter =
        fromTimestamp == null || toTimestamp == null
            ? ""
            : `, where: {timestamp_gte: ${fromTimestamp}, timestamp_lte: ${toTimestamp}}`;

    const query = `{
        token(id: "${collection}:${tokenId}"){
            sales(first: 1, orderBy: price, orderDirection: asc${timeFilter}){
                price
            }
        }
    }`;

    const sales = (await executeQuery(query))?.data?.token?.sales;

    if (sales == null) throw new Error("token not found");

    return sales.length > 0
        ? new bigDecimal(sales[0].price)
              .divide(ETH_TO_WEI, DIVISION_PRECISION)
              .getValue()
        : null;
};

const getCollectionPartialTokensFloorPrices = async (
    collection,
    fromTimestamp,
    toTimestamp,
    skip = 0
) => {
    const timeFilter =
        fromTimestamp == null || toTimestamp == null
            ? ""
            : `, where: {timestamp_gte: ${fromTimestamp}, timestamp_lte: ${toTimestamp}}`;

    const query = `{
        collection(id: "${collection}"){
            tokens(skip: ${skip}, first: ${PAGE_SIZE}, orderBy: tokenId, orderDirection: asc){
                sales(first: 1, orderBy: price, orderDirection: asc${timeFilter}){
                    price
                }
            }
        }
    }`;

    const tokens = (await executeQuery(query))?.data?.collection?.tokens;

    if (tokens == null) throw new Error("collection not found");

    return tokens.map((token) =>
        token.sales != null && token.sales.length > 0
            ? new bigDecimal(token.sales[0].price)
            : null
    );
};

const getCollectionFloorPrice = async (
    collection,
    fromTimestamp = null,
    toTimestamp = null
) => {
    let floorPrices = [];
    let latestFetchResultCount = PAGE_SIZE;
    while (latestFetchResultCount == PAGE_SIZE) {
        const result = await getCollectionPartialTokensFloorPrices(
            collection,
            fromTimestamp,
            toTimestamp,
            floorPrices.length
        );
        floorPrices.push(...result);
        latestFetchResultCount = result.length;
    }
    floorPrices = floorPrices.filter((price) => price != null);
    return floorPrices.length > 0
        ? floorPrices
              .reduce((a, b) => (a.compareTo(b) < 0 ? a : b))
              .divide(ETH_TO_WEI, DIVISION_PRECISION)
              .getValue()
        : null;
};

const getFloorPrice = async (
    collection,
    fromTimestamp = null,
    toTimestamp = null,
    tokenId = null
) => {
    if (tokenId == null)
        return await getCollectionFloorPrice(
            collection,
            fromTimestamp,
            toTimestamp
        );
    return await getTokenFloorPrice(
        collection,
        tokenId,
        fromTimestamp,
        toTimestamp
    );
};

module.exports = { getFloorPrice };
