const bigDecimal = require("js-big-decimal");
const { executeQuery } = require("./graphql.js");
const {
    ETH_TO_WEI,
    DIVISION_PRECISION,
    checkTimePeriod,
} = require("./constants.js");

const getFloorPrice = async (
    collection,
    fromTimestamp = null,
    toTimestamp = null,
    tokenId = null
) => {
    checkTimePeriod(fromTimestamp, toTimestamp);
    const timeFilter =
        fromTimestamp == null || toTimestamp == null
            ? ""
            : `, timestamp_gte: ${fromTimestamp}, timestamp_lte: ${toTimestamp}`;

    const tokenFilter =
        tokenId == null
            ? `token_starts_with: "${collection.toLowerCase()}:"`
            : `token: "${collection.toLowerCase()}:${tokenId}"`;

    const query = `{
        sales(first: 1, orderBy: price, orderDirection: asc, where : {${tokenFilter}${timeFilter}}){
            price
        }
    }`;

    const sales = (await executeQuery(query))?.data?.sales;

    if (sales == null || sales.length == 0)
        throw new Error(
            `${tokenId == null ? "collection" : "token"} not found`
        );

    return new bigDecimal(sales[0].price)
        .divide(ETH_TO_WEI, DIVISION_PRECISION)
        .getValue();
};

module.exports = { getFloorPrice };
