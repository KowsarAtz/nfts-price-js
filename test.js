const { getTokenPriceData } = require("./nft-price.js");
const { getFloorPrice } = require("./nft-floor-price.js");

const main = async () => {
    // Example 1: Getting Latest and Average Price over a period of time (optional) for a specific token
    priceData = await getTokenPriceData(
        "0x000e49c87d2874431567d38ff9548890ab39baac",
        "10153",
        1642920101,
        1642976543
    );
    console.log(priceData);
    // output: { latestPrice: '0.13500', averagePrice: '0.13250' }

    // Example 2: Getting floor price over a period of time (optional) for a specific collection
    priceData = await getFloorPrice(
        "0x000e49c87d2874431567d38ff9548890ab39baac",
        1543001982,
        1643001982
    );
    console.log(priceData);
    // output: 0.06500

    // Example 3: Getting floor price over a period of time (optional) for a specific token
    priceData = await getFloorPrice(
        "0x000e49c87d2874431567d38ff9548890ab39baac",
        1642920101,
        1642976543,
        "10153"
    );
    console.log(priceData);
    // output: 0.13000
};

main();
