import fetch from "node-fetch";
import bigDecimal from "js-big-decimal";

const endpoint =
    "https://api.thegraph.com/subgraphs/name/kowsaratz/muon-data-test";


const pageSize = 1000;
const ethToWei = new bigDecimal("1000000000000000000");

const getTokenPartialPrices = async (
    collection,
    tokenId,
    fromTimestamp,
    toTimestamp,
    skip = null,
    first = pageSize
) => {
    const timeFilter =
        fromTimestamp == null || toTimestamp == null
            ? ""
            : `, where: {timestamp_gte: ${fromTimestamp}, timestamp_lte: ${toTimestamp}}`;
    const skipArgument = skip == null ? "" : `skip: ${skip}, `;

    const data = JSON.stringify({
        query: `{
            token(id: "${collection}:${tokenId}"){
                sales (${skipArgument}first: ${first} , orderBy: timestamp, orderDirection: desc${timeFilter}) {
                    price
                }
            }
        }`,
    });

    const response = await fetch(endpoint, {
        method: "post",
        body: data,
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length,
            "User-Agent": "Node",
        },
    });

    const sales = (await response.json())?.data?.token?.sales;

    if (sales == null)
        throw new Error("token not found");

    return sales.map((sale) => new bigDecimal(sale.price));
};

const getTokenPrices = async (
    collection,
    tokenId,
    fromTimestamp,
    toTimestamp
) => {
    const prices = [];
    let lastFetchedResultCount = pageSize;
    while (lastFetchedResultCount >= pageSize) {
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
    const prices = await getTokenPrices(
        collection,
        tokenId,
        fromTimestamp,
        toTimestamp
    );
    const result = {
        floorPrice: null,
        latestPrice: null,
        averagePrice: null,
    };
    if (prices.length == 0) return result;

    result.latestPrice = prices[0];
    result.floorPrice = prices[0];
    let sum = prices[0];
    for (let i = 1; i < prices.length; i++) {
        if (prices[i].compareTo(result.floorPrice) < 0)
            result.floorPrice = prices[i];
        sum = sum.add(prices[i]);
    }

    result.latestPrice = result.latestPrice.divide(ethToWei, 5).getValue();
    result.floorPrice = result.floorPrice.divide(ethToWei, 5).getValue();
    result.averagePrice = sum
        .divide(new bigDecimal(prices.length), 5)
        .divide(ethToWei, 5)
        .getValue();
    return result;
};

const main = async () => {
    let priceData = await getTokenPriceData(
        "0x000001e1b2b5f9825f4d50bd4906aff2f298af4e",
        "61",
        1642517743, // fromTimestamp
        1642517745 // toTimestamp
    );
    console.log(priceData);
    /** output:
     *  {
            floorPrice: '0.11000',
            latestPrice: '0.11000',
            averagePrice: '0.11000'
        }
     */

    priceData = await getTokenPriceData(
        "0x000e49c87d2874431567d38ff9548890ab39baac",
        "10153"
    );
    console.log(priceData);
    /** output:
     *  {
            floorPrice: '0.13000',
            latestPrice: '0.13500',
            averagePrice: '0.13250'
        }
    */
};

main();
