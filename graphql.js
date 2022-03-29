const fetch = require("node-fetch");
const { SUBGRAPH_ENDPOINT } = require('./constants.js')

const executeQuery = async (query) => {
    const data = JSON.stringify({ query });
    const response = await fetch(SUBGRAPH_ENDPOINT, {
        method: "post",
        body: data,
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length,
            "User-Agent": "Node",
        },
    });

    return await response.json();
};

module.exports = { executeQuery };
