import Firstock from "./index";

const firstock = new Firstock();

let orderNumber: string = "";
// const userDetails = {
//   userId: "NP2997",
//   password: "Skanda@202",
//   TOTP: "1997",
//   vendorCode: "NP2997_API",
//   apiKey: "65d837ab42a4b0000fbe05f37ee575fb",
// };
// const userDetails = {
//   userId: "",
//   password: "",
//   TOTP: "",
//   vendorCode: "",
//   apiKey: "",
// };
// // Login and user Details start
// firstock.login(
//   {
//     userId: userDetails.userId,
//     password: userDetails.password,
//     TOTP: userDetails.TOTP,
//     vendorCode: userDetails.vendorCode,
//     apiKey: userDetails.apiKey,
//   },
//   (err: Error | null, result: any) => {
//     console.log("Error: ", err);
//     console.log("Result: ", result);
//   }
// );

// // Order and report start
// firstock.placeOrder(
//   {
//     userId: userDetails.userId,
//     exchange: "NSE",
//     tradingSymbol: "IDEA-EQ",
//     quantity: "1",
//     price: "7.00",
//     product: "C",
//     transactionType: "B",
//     priceType: "LMT",
//     retention: "DAY",
//     triggerPrice: "0",
//     remarks: "Add market protection",
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("Error, ", err);
//     console.log("placeOrder Result: ", result);
//     if (result?.data?.orderNumber) {
//       orderNumber = result.data.orderNumber;
//       modifyOrder(orderNumber);
//     } else {
//       console.log("No orderNumber returned");
//     }
//   }
// );

//  const modifyOrder = (orderNumber: string) => {
//   firstock.modifyOrder(
//     {
//       userId: userDetails.userId,
//       orderNumber: orderNumber,
//       price: "7.01",
//       quantity: "1",
//       triggerPrice: "0",
//       tradingSymbol: "IDEA-EQ",
//       exchange: "NSE",
//       priceType: "LMT",
//       product:"C",
//       retention:"DAY"
//     },
//     (err: Error | string | null, result: any) => {
//       console.log("Error, ", err);
//       console.log("modifyOrder Result: ", result);
//       if (!err) {
//         singleOrderHistory(orderNumber);
//       }
//     }
//   );
//  }

// const singleOrderHistory = (orderNumber: string) => {
//   firstock.singleOrderHistory({ userId: userDetails.userId, orderNumber: orderNumber }, (err: Error | string | null, result: any) => {
//     console.log("Error, ", err);
//     console.log("singleOrderHistory Result: ", result);
//     if (!err) {
//       cancelOrder(orderNumber);
//     }
//   });
// };

// const cancelOrder = (orderNumber: string) => {
//   firstock.cancelOrder({ userId: userDetails.userId, orderNumber: orderNumber }, (err: Error | string | null, result: any) => {
//     console.log("Error, ", err);
//     console.log("Cancel Result: ", result);
//   });
// };

// // Get User Details
// firstock.userDetails(
//   { userId: userDetails.userId },
//   (err: Error | string | null, result: any) => {
//     console.log("getUserDetails Error, ", err);
//     console.log("getUserDetails Result: ", result);
//   }
// );

// // Order Margin
// firstock.orderMargin(
//   {
//     userId: userDetails.userId,
//     exchange: "NSE",
//     tradingSymbol: "IDEA-EQ",
//     quantity: "1",
//     price: "10.00",
//     product: "C",
//     transactionType: "B",
//     priceType: "LMT",
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("orderMargin Error, ", err);
//     console.log("orderMargin Result: ", result);
//   }
// );

// // Order Book
// firstock.orderBook(
//   { userId: userDetails.userId },
//   (err: Error | string | null, result: any) => {
//     console.log("Error, ", err);
//     console.log("orderBook Result: ", result);
//   }
// );

// // Trade Book
// firstock.tradeBook(
//   { userId: userDetails.userId },
//   (err: Error | string | null, result: any) => {
//     console.log("tradeBook Error, ", err);
//     console.log("tradeBook Result: ", result);
//   }
// );

// // Positions Book
// firstock.positionBook(
//   { userId: userDetails.userId },
//   (err: Error | string | null, result: any) => {
//     console.log("positionsBook Error, ", err);
//     console.log("positionsBook Result: ", result);
//   }
// );

// Product Conversion
// firstock.productConversion(
//   {
//     userId: userDetails.userId,
//     exchange: "NFO",
//     tradingSymbol: "NIFTY",
//     quantity: "250",
//     product: "C",
//     previousProduct: "I"
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("productConversion Error, ", err);
//     console.log("productConversion Result: ", result);
//   }
// );

// firstock.productConversion(
//   {
//     userId: userDetails.userId,
//     exchange: "NFO",
//     tradingSymbol: "NIFTY",
//     quantity: "250",
//     product: "C",
//     previousProduct: "I",
//     msgFlag: "1" // Buy and Day
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("productConversion (Buy & Day) Error: ", err);
//     console.log("productConversion (Buy & Day) Result: ", result);
//   }
// );

// Holdings
// firstock.holdings(
//   { userId: userDetails.userId},//, product: "C" 
//   (err: Error | string | null, result: any) => {
//     console.log("holdings Error, ", err);
//     console.log("holdings Result: ", result);
//   }
// );

// Limits
// firstock.limit(
//   { userId: userDetails.userId },
//   (err: Error | string | null, result: any) => {
//     console.log("Error, ", err);
//     console.log("limits Result: ", result);
//   }
// );

// Basket Margin
// firstock.basketMargin(
//   {
//     userId: userDetails.userId,
//     exchange: "NSE",
//     transactionType: "B",
//     product: "C",
//     tradingSymbol: "RELIANCE-EQ",
//     quantity: "1",
//     priceType: "MKT",
//     price: "0",
//     BasketList_Params: [
//       {
//         exchange: "NSE",
//         transactionType: "B",
//         product: "C",
//         tradingSymbol: "IDEA-EQ",
//         quantity: "1",
//         priceType: "MKT",
//         price: "0"
//       }
//     ],
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("basketMargin Error, ", err);
//     console.log("basketMargin Result: ", result);
//   }
// );
// Get Quotes
// firstock.getQuote(
//   {
//     userId: userDetails.userId,
//     exchange: "NSE",
//     tradingSymbol: "IDEA-EQ",
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("getQuotes Error, ", err);
//     console.log("getQuotes Result: ", result);
//   }
// );

// Get Quote LTP
// firstock.getQuoteltp(
//   {
//     userId: userDetails.userId,
//     exchange: "NSE",
//     tradingSymbol: "RELIANCE-EQ",
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("getQuoteltp Error, ", err);
//     console.log("getQuoteltp Result: ", result);
//   }
// );

// Get Multi Quotes
// firstock.getMultiQuotes(
//   {
//     userId: userDetails.userId,
//     data: [
//       { exchange: "NSE", tradingSymbol: "Nifty 50" },
//       { exchange: "NSE", tradingSymbol: "NIFTY03APR25C23500" },
//       { exchange: "NFO", tradingSymbol: "Nifty 50" },
//       { exchange: "NFO", tradingSymbol: "NIFTY03APR25C23500" },
//     ],
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("getMultiQuotes Error, ", err);
//     console.log("getMultiQuotes Result: ", result);
//   }
// );

// Get Multi Quotes LTP
// firstock.getMultiQuotesltp(
//   {
//     userId: userDetails.userId,
//     data: [{ exchange: "NSE", tradingSymbol: "Nifty 50" }],
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("getMultiQuotesltp Error, ", err);
//     console.log("getMultiQuotesltp Result: ", result);
//   }
// );

// Search Scripts
// firstock.searchScrips(
//   { userId: userDetails.userId, stext: "ITC" },
//   (err: Error | string | null, result: any) => {
//     console.log("searchScripts Error, ", err);
//     console.log("searchScripts Result: ", result);
//   }
// );

// firstock.securityInfo(
//   {
//     userId: userDetails.userId,
//     exchange: "NSE",
//     tradingSymbol: "NIFTY",
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("getSecurityInfo Error, ", err);
//     console.log("getSecurityInfo Result: ", result);
//   }
// );

// Get Index List
// firstock.indexList(
//   { userId: userDetails.userId, exchange: "NSE" },
//   (err: Error | string | null, result: any) => {
//     console.log("getIndexList Error, ", err);
//     console.log("getIndexList Result: ", result);
//   }
// );

// Get Option Chain
// firstock.optionChain(
//   {
//     userId: userDetails.userId,
//     exchange: "NFO",
//     symbol: "NIFTY",
//     expiry: "17APR25",
//     count: "5",
//     strikePrice: "23150"
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("optionChain Error, ", err);
//     console.log("optionChain Result: ", result);
//   }
// );


// firstock.timePriceSeries(
//   {
//     userId: userDetails.userId,
//     exchange: "NSE",
//     tradingSymbol: "NIFTY",
//     startTime: "09:15:00 23-04-2025",
//     endTime: "15:29:00 23-04-2025",
//     interval: "1mi",
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("timePriceSeries Error, ", err);
//     console.log("timePriceSeries Result: ", result);
//   }
// );

// firstock.getExpiry(
//   {
//     userId: userDetails.userId,
//     exchange: "NSE",
//     tradingSymbol: "NIFTY"
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("getExpiry Error, ", err);
//     console.log("getExpiry Result: ", result);
//   }
// );

// firstock.brokerageCalculator(
//   {
//     userId: userDetails.userId,
//     exchange: "NFO",
//     tradingSymbol: "RELIANCE27FEB25F",
//     transactionType: "B",
//     Product: "M",
//     quantity: "500",
//     price: "125930",
//     strike_price: "0",
//     inst_name: "FUTSTK",
//     lot_size: "1"
//   },
//   (err: Error | string | null, result: any) => {
//     console.log("brokerageCalculator Error, ", err);
//     console.log("brokerageCalculator Result: ", result)
//   }
// )

// Get Holdings Details
// firstock.getHoldingsDetails(
//   {
//     userId: userDetails.userId
//     },
//   (err: Error | null, result: any) => {
//     console.log("Error: ", err);
//     console.log("Result: ", result);
//   }
// );

// Logout
// firstock.logout(
//   { userId: userDetails.userId },
//   (err: Error | string | null, result: any) => {
//     console.log("Error, ", err);
//     console.log("Result: ", result);
//   }
// );