const { getTokenPrice, getFloorPrice } = require("./src/opensea-source");

const main = async () => {
    // Example 1: Getting Latest and Average Price over a period of time (optional) for a specific token
    let priceData = await getTokenPrice(
        "0x11450058d796b02eb53e65374be59cff65d3fe7f",
        "4802",
        1647000000,
        1649167672
    );
    console.log(priceData);
    // output: {
    //   lastSalePrice: '80000000.00000',
    //   lastSaleToken: 'SHIB',
    //   lastSaleUsdtPrice: '1503.28642',
    //   lastSaleTime: '1647717019',
    //   totalSales: 2
    // }

    // Example 2: Getting floor price over a period of time (optional) for a specific collection
    priceData = await getFloorPrice(
        "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
        null,
        1647520000,
        1649167672
    );
    console.log(priceData);
    // output: {
    //   tokenId: '4019',
    //   price: '75.00000',
    //   paymentToken: 'WETH',
    //   usdtPrice: '209293.43282',
    //   time: '1647522015'
    // }

    // Example 3: Getting floor price over a period of time (optional) for a specific token
    priceData = await getFloorPrice(
        "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
        364,
        1647000000,
        1649167672
    );
    console.log(priceData);
    // output: {
    //   tokenId: '364',
    //   price: '105.00000',
    //   paymentToken: 'ETH',
    //   usdtPrice: '273186.45046',
    //   time: '1647404526'
    // }
};

main();
