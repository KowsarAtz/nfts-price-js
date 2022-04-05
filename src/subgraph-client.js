const fetch = require("node-fetch");

const executeQuery = async (endpoint, query) => {
    const data = JSON.stringify({ query });
    // console.log("sending", query);

    const response = await fetch(endpoint, {
        method: "post",
        body: data,
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length,
            "User-Agent": "Node",
        },
    });
    const res = await response.json();
    // console.log("received", res);

    return res?.data;
};

module.exports = { executeQuery };
