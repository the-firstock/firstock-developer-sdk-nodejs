
# The Firstock Developer API Nodejs client - 

To communicate with the Firstock Developer API using Nodejs, you can use the official Nodejs client library provided by Firstock.
Licensed under the MIT License.


[Version - 1.0.0](https://www.npmjs.com/package/firstock)


## Documentation

* Nodejs client documentation

## Installing the client

Use the package manager [npm](https://www.npmjs.com/) to install thefirstock.

```bash
npm install firstock
```

## API usage

```javascript
const Firstock = require("firstock");

const firstock = new Firstock();

// Login
firstock.login({
  userId: "",
  password: "",
  TOTP: "",
  DOBnPAN: "",
  vendorCode: "",
  apiKey: ""
}, (err, result) => {
  console.log("login Error, ", err);
  console.log("login Result: ", result);
});

// Place an Order
firstock.placeOrder({
  userId: "",
  exchange: "",
  tradingSymbol: "",
  quantity: "",
  price: "",
  product: "",
  transactionType: "",
  priceType: "",
  retention: "",
  triggerPrice: "",
  remarks: "",
}, (err, result) => {
  console.log("placeOrder Error, ", err);
  console.log("placeOrder Result: ", result);
});

// Modify an Order
firstock.modifyOrder({
  userId: "",
  orderNumber: "",
  price: "",
  quantity: "",
  triggerPrice: "",
  tradingSymbol: "",
  exchange: "",
  priceType: "",
  product: "",
  retention: ""
}, (err, result) => {
  console.log("modifyOrder Error, ", err);
  console.log("modifyOrder Result: ", result);
});

// Cancel an Order
firstock.cancelOrder({
  userId: "",
  orderNumber: ""
}, (err, result) => {
  console.log("cancelOrder Error, ", err);
  console.log("cancelOrder Result: ", result);
});

// Single Order History
firstock.singleOrderHistory({
  userId: "",
  orderNumber: ""
}, (err, result) => {
  console.log("singleOrderHistory Error, ", err);
  console.log("singleOrderHistory Result: ", result);
});

// Order Book
firstock.orderBook({ userId: "" }, (err, result) => {
  console.log("orderBook Error, ", err);
  console.log("orderBook Result: ", result);
});

// Trade Book
firstock.tradeBook({ userId: "" }, (err, result) => {
  console.log("tradeBook Error, ", err);
  console.log("tradeBook Result: ", result);
});

// Position Book
firstock.positionBook({ userId: "" }, (err, result) => {
  console.log("positionBook Error, ", err);
  console.log("positionBook Result: ", result);
});

// Holdings
firstock.holdings({ userId: "" }, (err, result) => {
  console.log("holdings Error, ", err);
  console.log("holdings Result: ", result);
});

// Limits
firstock.limit({ userId: "" }, (err, result) => {
  console.log("limit Error, ", err);
  console.log("limit Result: ", result);
});

// Order Margin
firstock.orderMargin({
  userId: "",
  exchange: "",
  tradingSymbol: "",
  quantity: "",
  price: "",
  product: "",
  transactionType: "",
  priceType: ""
}, (err, result) => {
  console.log("orderMargin Error, ", err);
  console.log("orderMargin Result: ", result);
});

// Basket Margin
firstock.basketMargin({
  userId: "",
  exchange: "",
  transactionType: "",
  product: "",
  tradingSymbol: "",
  quantity: "",
  priceType: "",
  price: "",
  BasketList_Params: [ /* array of order objects */ ]
}, (err, result) => {
  console.log("basketMargin Error, ", err);
  console.log("basketMargin Result: ", result);
});

// Product Conversion
firstock.productConversion({
  userId: "",
  exchange: "",
  tradingSymbol: "",
  quantity: "",
  product: "",
  previousProduct: ""
}, (err, result) => {
  console.log("productConversion Error, ", err);
  console.log("productConversion Result: ", result);
});

// Brokerage Calculator
firstock.brokerageCalculator({
  userId: "",
  exchange: "",
  tradingSymbol: "",
  transactionType: "",
  Product: "",
  quantity: "",
  price: "",
  strike_price: "",
  inst_name: "",
  lot_size: ""
}, (err, result) => {
  console.log("brokerageCalculator Error, ", err);
  console.log("brokerageCalculator Result: ", result);
});

// Get Quote
firstock.getQuote({
  userId: "",
  exchange: "",
  tradingSymbol: ""
}, (err, result) => {
  console.log("getQuote Error, ", err);
  console.log("getQuote Result: ", result);
});

// Get LTP
firstock.getQuoteltp({
  userId: "",
  exchange: "",
  tradingSymbol: ""
}, (err, result) => {
  console.log("getQuoteltp Error, ", err);
  console.log("getQuoteltp Result: ", result);
});

// Get Multi Quotes
firstock.getMultiQuotes({
  userId: "",
  data: [
    { exchange: "", tradingSymbol: "" },
    // more symbols
  ]
}, (err, result) => {
  console.log("getMultiQuotes Error, ", err);
  console.log("getMultiQuotes Result: ", result);
});

// Get Multi Quotes LTP
firstock.getMultiQuotesltp({
  userId: "",
  data: [
    { exchange: "", tradingSymbol: "" },
    // more symbols
  ]
}, (err, result) => {
  console.log("getMultiQuotesltp Error, ", err);
  console.log("getMultiQuotesltp Result: ", result);
});

// Get Index List
firstock.indexList({ userId: "", exchange: "" }, (err, result) => {
  console.log("indexList Error, ", err);
  console.log("indexList Result: ", result);
});

// Get Expiry
firstock.getExpiry({
  userId: "",
  exchange: "",
  tradingSymbol: ""
}, (err, result) => {
  console.log("getExpiry Error, ", err);
  console.log("getExpiry Result: ", result);
});

// Option Chain
firstock.optionChain({
  userId: "",
  exchange: "",
  symbol: "",
  expiry: "",
  count: "",
  strikePrice: ""
}, (err, result) => {
  console.log("optionChain Error, ", err);
  console.log("optionChain Result: ", result);
});

// Search Scrips
firstock.searchScrips({ userId: "", stext: "" }, (err, result) => {
  console.log("searchScrips Error, ", err);
  console.log("searchScrips Result: ", result);
});

// Historical Data
firstock.timePriceSeries({
  userId: "",
  exchange: "",
  tradingSymbol: "",
  startTime: "",
  endTime: "",
  interval: ""
}, (err, result) => {
  console.log("timePriceSeries Error, ", err);
  console.log("timePriceSeries Result: ", result);
});
```

Refer to the [Firstock Connect Documentation](https://connect.thefirstock.com/)  for the complete list of supported methods.



## Changelog

Check release notes.






