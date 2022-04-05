const { getSales, getLastSale, getAveragePrice, getFloorPrice } = require("./src/opensea-source");

const main = async () => {
    // Example 1: Getting Sales with filters on fields
    let priceData = await getSales(
        "0x11450058d796b02eb53e65374be59cff65d3fe7f", "4802",
        1647000000, 1649167672,
        null, null,
        null, null,
        10, 0
    );
    console.log(priceData);
    // output: [
    //   {
    //     collection: '0x11450058d796b02eb53e65374be59cff65d3fe7f',
    //     tokenId: '4802',
    //     price: '1503.28642',
    //     time: '1647717019'
    //   },
    //   {
    //     collection: '0x11450058d796b02eb53e65374be59cff65d3fe7f',
    //     tokenId: '4802',
    //     price: '1647.32043',
    //     time: '1647403397'
    //   }
    // ]

    // Example 2: Getting last price for a token
    priceData = await getLastSale(
        "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
        2501,
        1647520000,
        1649167672
    );
    console.log(priceData);
    // output: {
    //   collection: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    //   tokenId: '2501',
    //   price: '293633.07208',
    //   time: '1647879568'
    // }

    // Example 3: Getting average price over a period of time (optional) for a token
    priceData = await getAveragePrice(
        "0x11450058d796b02eb53e65374be59cff65d3fe7f", "4802",
        1647000000, 1649167672
    );
    console.log(priceData);
    // output: { average: '1575.30342', count: 2 }

    // Example 4: Getting floor price over a period of time (optional) for a collection
    priceData = await getFloorPrice(
        "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
        null,
        1647520000,
        1649167672
    );
    console.log(priceData);
    // output: {
    //   collection: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    //   tokenId: '4019',
    //   price: '209293.43282',
    //   time: '1647522015'
    // }
};

main();
