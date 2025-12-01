const { Firstock, FirstockWebSocket } = require('./websockets');
const { appendFileSync } = require('fs');

function subscribeFeedData(data) {
    try {
        appendFileSync('websocket.log', `${JSON.stringify(data)}\n`);
        console.log(data);
    } catch (e) {
        console.error(`Error writing to log: ${e}`);
    }
}

function subscribeOptionGreeksData(data) {
    try {
        const timestamp = new Date().toISOString();
        appendFileSync('option_greeks.log', `${timestamp} - ${JSON.stringify(data)}\n`);
    } catch (e) {
        console.error(`Error writing option Greeks: ${e}`);
    }
}

function orderBookData(data) {
    try {
        const timestamp = new Date().toISOString();
        appendFileSync('order_detail.log', `${timestamp} - ${JSON.stringify(data)}\n`);
    } catch (e) {
        console.error(`Error opening log file: ${e}`);
    }
}

function positionBookData(data) {
    try {
        const timestamp = new Date().toISOString();
        appendFileSync('position_detail.log', `${timestamp} - ${JSON.stringify(data)}\n`);
    } catch (e) {
        console.error(`Error opening log file: ${e}`);
    }
}

function subscribeFeedData2(data) {
    try {
        const timestamp = new Date().toISOString();
        appendFileSync('websocket2.log', `${timestamp} - ${JSON.stringify(data)}\n`);
    } catch (e) {
        console.error(`Error opening log file: ${e}`);
    }
}

function subscribeFeedData3(data) {
    try {
        const timestamp = new Date().toISOString();
        appendFileSync('websocket3.log', `${timestamp} - ${JSON.stringify(data)}\n`);
    } catch (e) {
        console.error(`Error opening log file: ${e}`);
    }
}

function subscribeFeedData4(data) {
    try {
        const timestamp = new Date().toISOString();
        appendFileSync('websocket4.log', `${timestamp} - ${JSON.stringify(data)}\n`);
    } catch (e) {
        console.error(`Error opening log file: ${e}`);
    }
}

async function main() {
    const userId = 'NP2997';

    // Connection reference holder
    const connectionRef = { conn: null };

    // Reconnection callback
    function onReconnectCallback(newWs) {
        console.log("🔄 Connection reference updated");
        connectionRef.conn = newWs;
    }

    // Create WebSocket model
    const model = new FirstockWebSocket({
        tokens: [],
        option_greeks_tokens: [],
        order_data: orderBookData,
        position_data: positionBookData,
        subscribe_feed_data: subscribeFeedData,
        subscribe_option_greeks_data: subscribeOptionGreeksData,
        on_reconnect: onReconnectCallback
    });

    // Initialize WebSocket
    const [conn, err] = await Firstock.initializeWebsockets(userId, model);
    connectionRef.conn = conn;
    
    console.log("Error:", err);

    if (err) {
        console.log(`Connection failed: ${JSON.stringify(err)}`);
        return;
    } else {
        console.log("WebSocket connected successfully!");
    }

    // Subscribe to tokens
    const subscribeErr = await Firstock.subscribe(connectionRef.conn, ["BSE:500470|NSE:26000"]);
    console.log("Subscribe Error:", subscribeErr);

    // Subscribe to option Greeks (uncomment to use)
    // const optionErr = await Firstock.subscribeOptionGreeks(connectionRef.conn, ["NFO:44297"]);
    // console.log("Option Greeks Subscribe Error:", optionErr);

    // // Later, unsubscribe (uncomment to use)
    // await new Promise(resolve => setTimeout(resolve, 30000));
    // const unsubErr = await Firstock.unsubscribeOptionGreeks(connectionRef.conn, ["NFO:44283"]);
    // console.log("Option Greeks Unsubscribe Error:", unsubErr);

    // Multiple connections example (uncomment to use)
    
    // const model2 = new FirstockWebSocket({
    //     tokens: [],
    //     subscribe_feed_data: subscribeFeedData2
    // });
    // const [conn2, err2] = await Firstock.initializeWebsockets(userId, model2);
    // console.log("Error:", err2);
    
    // const subscribeErr2 = await Firstock.subscribe(conn2, ["BSE:1"]);
    // console.log("Error:", subscribeErr2);

    // const model3 = new FirstockWebSocket({
    //     tokens: [],
    //     subscribe_feed_data: subscribeFeedData3
    // });
    // const [conn3, err3] = await Firstock.initializeWebsockets(userId, model3);
    // console.log("Error:", err3);
    
    // const subscribeErr3 = await Firstock.subscribe(conn3, ["NSE:26000|BSE:1"]);
    // console.log("Error:", subscribeErr3);

    // const model4 = new FirstockWebSocket({
    //     tokens: [],
    //     subscribe_feed_data: subscribeFeedData4
    // });
    // const [conn4, err4] = await Firstock.initializeWebsockets(userId, model4);
    // console.log("Error:", err4);
    
    // const subscribeErr4 = await Firstock.subscribe(conn4, ["NSE:26000"]);
    // console.log("Error:", subscribeErr4);
    
    // Unsubscribe example
    await new Promise(resolve => setTimeout(resolve, 2000));
    const unsubErr = await Firstock.unsubscribe(connectionRef.conn, ["BSE:500470|NSE:26000"]);
    console.log("Unsubscribe Error:", unsubErr);

    // Wait for 25 seconds
    await new Promise(resolve => setTimeout(resolve, 200000));

    // Close WebSocket connection
    const closeErr = await Firstock.closeWebsocket(connectionRef.conn);
    console.log("Close Error:", closeErr);

    // Close additional connections (uncomment if using multiple connections)
    // const closeErr2 = await Firstock.closeWebsocket(conn2);
    // console.log("Close Error:", closeErr2);
    
    // const closeErr3 = await Firstock.closeWebsocket(conn3);
    // console.log("Close Error:", closeErr3);

    // Keep program running
    console.log("\nWebSocket test running. Press Ctrl+C to exit.");
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log("\nExiting...");
        if (connectionRef.conn) {
            await Firstock.closeWebsocket(connectionRef.conn);
        }
        process.exit(0);
    });

    // Keep alive - never resolves, keeps running until SIGINT
    await new Promise(() => {});
}

// Run main function
main().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
});