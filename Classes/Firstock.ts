import axios, { AxiosInstance, AxiosError } from "axios";
import * as sha256 from "sha256";
import AFirstock from "./AFirstock";
import { saveData, readData, handleError, errorMessageMapping, checkifUserLoggedIn } from "../shared/commonFunction";
import * as Commonfunctions from "../shared/commonFunction";
import { API_LINK } from "../shared/constant";

interface Response {
  data: {
    [key: string]: any;
  };
}

interface LoginParams {
  userId: string;
  password: string;
  TOTP: string;
  vendorCode: string;
  apiKey: string;
  [key: string]: any;
}

interface ConfigData {
  [key: string]: {
    jKey: string;
  };
}

interface PlaceOrderParams {
  userId: string;
  exchange: string;
  tradingSymbol: string;
  quantity: string | number;
  price: string | number;
  product: string;
  transactionType: string;
  priceType: string;
  retention: string;
  remarks: string;
  triggerPrice: string;
  [key: string]: any;
}

interface CancelOrderParams {
  userId: string;
  orderNumber: string;
  [key: string]: any;
}

interface ModifyOrderParams {
  userId: string;
  orderNumber: string;
  price: string | number;
  quantity: string | number;
  triggerPrice: string | number;
  tradingSymbol: string;
  exchange: string;
  priceType: string;
  product: string;
  retention: string;
  [key: string]: any;
}

interface BasketItem {
  exchange: string;
  transactionType: string;
  product: string;
  tradingSymbol: string;
  quantity: string | number;
  priceType: string;
  price: string | number;
  [key: string]: any;
}

interface BasketMarginParams {
  userId: string;
  BasketList_Params: BasketItem[];
  [key: string]: any;
}

interface SingleOrderHistoryParams {
  userId: string;
  orderNumber: string;
  [key: string]: any;
}

interface UserDetailsParams {
  userId: string;
  [key: string]: any;
}

interface OrderMarginParams {
  userId: string;
  exchange: string;
  tradingSymbol: string;
  quantity: string | number;
  price: string | number;
  product: string;
  transactionType: string;
  priceType: string;
  [key: string]: any;
}

interface ProductConversionParams {
  userId: string;
  exchange: string;
  tradingSymbol: string;
  quantity: string | number;
  product: string;
  previousProduct: string;
  transactionType?: string;
  positionType?: string;
  [key: string]: any;
}

interface OrderBookParams {
  userId: string;
  [key: string]: any;
}

interface TradeBookParams {
  userId: string;
  [key: string]: any;
}

interface PositionsBookParams {
  userId: string;
  [key: string]: any;
}

interface MultiQuoteItem {
  exchange: string;
  tradingSymbol: string;
  [key: string]: any;
}

interface GetMultiQuotesParams {
  userId: string;
  data: MultiQuoteItem[];
  [key: string]: any;
}

interface OptionChainParams {
  userId: string;
  exchange: string;
  symbol: string;
  strikePrice: string | number;
  count: string | number;
  expiry?: string;
  [key: string]: any;
}

interface GetQuoteLTPParams {
  userId: string;
  exchange: string;
  tradingSymbol: string;
  [key: string]: any;
}

interface GetMultiQuotesLTPParams {
  userId: string;
  data: MultiQuoteItem[];
  [key: string]: any;
}

interface SearchScriptsParams {
  userId: string;
  stext: string;
  [key: string]: any;
}

interface GetSecurityInfoParams {
  userId: string;
  exchange: string;
  tradingSymbol: string;
  [key: string]: any;
}

interface HoldingsParams {
  userId: string;
  product?: string;
  [key: string]: any;
}

interface LimitsParams {
  userId: string;
  [key: string]: any;
}

interface GetQuotesParams {
  userId: string;
  exchange: string;
  tradingSymbol: string;
  [key: string]: any;
}

interface GetIndexListParams {
  userId: string;
  exchange: string;
  [key: string]: any;
}


interface TimePriceSeriesParams {
  userId: string;
  exchange: string;
  tradingSymbol: string;
  endTime: string;
  startTime: string;
  interval: string | number;
  [key: string]: any;
}

interface BrokerageCalculatorParams {
  userId: string;
  exchange: string;
  tradingSymbol: string;
  transactionType: string;
  Product: string;
  quantity: string | number;
  price: string | number;
  strike_price: string | number;
  inst_name: string;
  lot_size: string | number;
  [key: string]: any;
}
interface GetExpiryParams {
  userId: string;
  exchange: string;
  tradingSymbol: string;
  [key: string]: any;
}

const axiosInterceptor: AxiosInstance = axios.create({
  baseURL: API_LINK,
});

class Firstock extends AFirstock {
  private token: string;
  private userId: string;
  private jsonObj: ConfigData = {};

  constructor() {
    super();
    this.token = "";
    this.userId = "";
  }


/**
 * Authenticates the user with Firstock using credentials and retrieves a session token (susertoken).
 *
 * This method sends a secure login request to the Firstock API with SHA256-hashed password and TOTP (if applicable),
 * and stores the received session token locally for future authenticated requests.
 *
 * On success, updates the instance with `token` and `userId`, and saves the token to a configuration file.
 *
 * @param {Object} params - Login parameters.
 * @param {string} params.userId - Firstock user ID (e.g., AB1234).
 * @param {string} params.password - Plain password (will be SHA256 hashed before sending).
 * @param {string} params.TOTP - Two-factor authentication code, if enabled.
 * @param {string} params.vendorCode - Unique vendor code provided by Firstock.
 * @param {string} params.apiKey - API key issued by Firstock.
 *
 * @param {function} callBack - Callback with `(error, result)`:
 * - `error`: Error object if login fails.
 * - `result`: Parsed response containing login information and token if successful.
 */

  login(
    { userId, password, TOTP, vendorCode, apiKey }: LoginParams,
    callBack: (error: Error | null, result: Response | null) => void
  ): void {
    const encryptedPassword = sha256.default(password);
        axiosInterceptor
      .post<Response>(`login`, {
        userId,
        password: encryptedPassword,
        TOTP,
        vendorCode,
        apiKey,
      })
      .then((response: { data: Response }) => {
        const { data } = response;
        this.token = data.data.susertoken;
        this.userId = data.data.actid;
        const finished = (error: Error | null) => {
          if (error) {
            callBack(error, null);
            return;
          }
          callBack(null, data);
        };
        readData((err: string | Error | null, jsonData: ConfigData | null) => {
          if (err) {
            if (err instanceof Error && err.message === "Unexpected end of JSON input") {
              let obj: ConfigData = {};
              obj[data.data.actid] = {
                jKey: data.data.susertoken,
              };
              saveData({ ...obj }, "config.json", finished);
            } else {
              callBack(err instanceof Error ? err : new Error(err as string), null);
            }
          } else if (jsonData) {
            jsonData[data.data.actid] = {
              jKey: data.data.susertoken,
            };
            saveData({ ...jsonData }, "config.json", finished);
          } else {
            callBack(new Error("No JSON data returned"), null);
          }
        });
      })
      .catch((error: AxiosError) => {
        callBack(handleError(error), null);
      });
  }
  /**
   * Fetches the Option Chain data from the Firstock API.
   *
   * This method retrieves nearby call and put option contracts for a given symbol and strike price.
   * It's useful for constructing an option chain view or for identifying options for trading.
   *
   * The user must be logged in before calling this method (valid `jKey` required).
   *
   * @param {Object} params - Parameters required to fetch the option chain.
   * @param {string} params.userId - Your Firstock user ID (must be same as used during login).
   * @param {string} params.exchange - Exchange name (typically `"NFO"` for NSE options).
   * @param {string} params.symbol - Underlying symbol or index (e.g., `"NIFTY"`).
   * @param {string|number} params.strikePrice - Central strike price to base the option chain on.
   * @param {string|number} params.count - Number of strike levels above and below the central price to retrieve.
   * @param {string} [params.expiry] - (Optional) Expiry date of options in `DDMONYY` format (e.g., `"17APR25"`).
   *
   * @param {function} callBack - A callback function receiving `(error, result)`.
   *                              On success, `result` contains an array of option contracts:
   *                              - `exchange`: "NFO"
   *                              - `lotSize`: Lot size of contract
   *                              - `optionType`: "CE" or "PE"
   *                              - `strikePrice`: Strike price of the contract
   *                              - `tradingSymbol`: Usable symbol to place orders
   *                              - `lastTradedPrice`: LTP of the option
   */

  optionChain(
    params: OptionChainParams,
    callBack: (error: Error | string | null, result: any | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post(`optionChain`, {
                userId,
                jKey,
                exchange: params.exchange,
                symbol: params.symbol,
                strikePrice: params.strikePrice,
                count: params.count,
                ...(params.expiry && { expiry: params.expiry }),
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
  /**
   * Fetches intraday candlestick data for a given trading symbol and interval.
   *
   * This method provides time-series data (OHLCV) for short-term intervals like 1min, 2min, 5min, etc.
   * It's ideal for charting, intraday analysis, and short-term strategy backtesting.
   *
   * ⚠️ The user must be logged in (valid jKey) before calling this method.
   *
   * @param {Object} params - Parameters for fetching time price series.
   * @param {string} params.userId - Firstock user ID (same as used during login).
   * @param {string} params.exchange - Exchange code (e.g., "NSE", "BSE", "NFO").
   * @param {string} params.tradingSymbol - Symbol or instrument for intraday data (e.g., "NIFTY").
   * @param {string} params.startTime - Start time in `"HH:MM:SS DD-MM-YYYY"` format (24-hour clock).
   * @param {string} params.endTime - End time in `"HH:MM:SS DD-MM-YYYY"` format.
   * @param {string|number} params.interval - Candle interval (e.g., `"1mi"`, `"2mi"`, `"5mi"`).
   *
   * @param {function} callBack - Callback function receiving `(error, result)`.
   *                              On success, result includes an array of candlestick objects:
   *                              - `time`: ISO timestamp
   *                              - `epochTime`: UNIX time
   *                              - `open`, `high`, `low`, `close`: Prices for the interval
   *                              - `volume`: Volume during the interval
   *                              - `oi`: Open interest (if applicable)
   */

  timePriceSeries(
    params: TimePriceSeriesParams,
    callBack: (error: Error | string | null, result: any | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post(`timePriceSeries`, {
                userId,
                jKey,
                exchange: params.exchange,
                tradingSymbol: params.tradingSymbol,
                endTime: params.endTime,
                startTime: params.startTime,
                interval: params.interval,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }

  // Implement other abstract methods from AFirstock
  getPosts(): Promise<any> {
    throw new Error("Method 'getPosts()' must be implemented.");
  }

  getUsers(): any {
    throw new Error("Method 'getUsers()' must be implemented.");
  }

  getPostByUserId(): any {
    throw new Error("Method 'getPostByUserId()' must be implemented.");
  }
  /**
   * Logs the user out of the Firstock platform and invalidates the session token (`jKey`).
   *
   * This method securely ends the authenticated session by calling the Firstock `/logout` API.
   * It ensures that the session token is no longer valid, preventing unauthorized future requests.
   *
   * The user must be logged in before calling this method. Otherwise, it returns an error.
   *
   * Best Practice: Always log the user out after completing trading activity or on app exit.
   *
   * @param {Object} params - Parameters for logout.
   * @param {string} params.userId - Firstock user ID (same as used during login).
   *
   * @param {function} callBack - Callback function receiving `(error, result)`:
   *                              - `error`: Error message or `null` on success.
   *                              - `result`: Logout response object if successful, otherwise `null`.
   *
   * Security:
   * - After successful logout, the jKey/token becomes invalid.
   * - Any further API calls with the same token will be rejected.
   */

  logout(
    params: { userId: string },
    callBack: (error: Error | string | null, result: Response | null) => void
  ): void {
    const currentUserId: string = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId: string = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data || {} }, (err: string | null, jKey: string | null) => { // Handle null with default empty object
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`logout`, {
                userId,
                jKey,
              })
              .then((response) => {
                const { data } = response;
                const finished = (error: Error | string | null) => {
                  if (error) {
                    callBack(error, null);
                    return;
                  } else {
                    callBack(null, data);
                  }
                };
                delete this.jsonObj[userId]; // Use this.jsonObj
                saveData(
                  { ...this.jsonObj },
                  "config.json",
                  finished
                );
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
  /**
   * Fetches detailed profile and privilege information of the logged-in Firstock user.
   *
   * This method sends a POST request to the `/userDetails` endpoint to retrieve user-specific
   * account information including email, enabled exchanges, order types, and privilege level.
   * It first checks for valid login session data (jKey) before making the API call.
   *
   * @param {Object} params - Parameters for the request.
   * @param {string} params.userId - The Firstock user ID used during login.
   * 
   * @param {function} callBack - Callback function that returns either an error or the result.
   * @param {Error|string|null} callBack.error - An error message if the request fails.
   * @param {UserDetailsResponse|null} callBack.result - The user details data if successful.
   *
   * Response includes:
   * - actid: Account ID (same as userId)
   * - email: Registered email address
   * - exchange: Array of enabled exchanges (e.g., NSE, BSE)
   * - orarr: Allowed order types (e.g., MKT, LMT)
   * - uprev: User privilege level (e.g., INVESTOR)
   * - userName: Full name of the user
   * - requestTime: Timestamp of the request
   *
   * Notes:
   * - If the user is not logged in or the session token is expired, an appropriate error is returned.
   * - Always ensure the session token (jKey) used is from the latest successful login.
   */

  userDetails(params: UserDetailsParams, callBack: (error: Error | string | null, result: Response | null) => void): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`userDetails`, {
                userId,
                jKey,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
  /**
   * Places a new trade order on the Firstock trading platform.
   *
   * This method sends a POST request to the `/placeOrder` endpoint using the provided parameters.
   * It supports market, limit, and stop-loss order types across supported exchanges like NSE, BSE, and NFO.
   *
   * @param {Object} params - Required order parameters.
   * @param {string} params.userId - Firstock user ID (same as used during login).
   * @param {string} params.exchange - Exchange to place order on (e.g., "NSE", "BSE", "NFO").
   * @param {string} params.retention - Order validity period ("DAY", "IOC").
   * @param {string} params.product - Product type ("C", "I", "M").
   * @param {string} params.priceType - Type of order ("MKT", "LMT", "SL-MKT", "SL-LMT").
   * @param {string} params.tradingSymbol - Instrument symbol (e.g., "IDEA-EQ", "NIFTY06MAR25C22500").
   * @param {string} params.transactionType - "B" (Buy) or "S" (Sell).
   * @param {string} params.price - Order price (0 for market orders).
   * @param {string} params.triggerPrice - Trigger price for stop-loss orders (0 for others).
   * @param {string} params.quantity - Quantity of shares or lots to trade.
   * @param {string} params.remarks - Optional order remark or note.
   *
   * @param {function} callBack - Callback function.
   * @param {Error|string|null} callBack.error - Error message, if any.
   * @param {OrderResponse|null} callBack.result - Response data containing the order details.
   *
   * Notes:
   * - Requires a valid session token (jKey), obtained during login.
   * - Returns `orderNumber` and `requestTime` on success.
   * - Handles various error conditions such as missing fields or invalid sessions.
   * - URL-encode special characters in trading symbols (e.g., use `L%26TFH-EQ` instead of `L&TFH-EQ`).
   */

  placeOrder(
    params: PlaceOrderParams,
    callBack: (error: Error | string | null, result: Response | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`placeOrder`, {
                userId,
                jKey,
                exchange: params.exchange,
                tradingSymbol: params.tradingSymbol,
                quantity: params.quantity,
                price: params.price,
                product: params.product,
                transactionType: params.transactionType,
                priceType: params.priceType,
                retention: params.retention,
                remarks: params.remarks,
                triggerPrice: params.triggerPrice,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
  /**
   * Fetches the margin requirements for a prospective order on the Firstock trading platform.
   *
   * This API helps preview the required margin, available margin, cash balance, and potential warnings (e.g., insufficient funds)
   * before placing a live trade. It's recommended for risk checks and order feasibility validation.
   *
   * @param {Object} params - Required parameters for order margin calculation.
   * @param {string} params.userId - Firstock user ID (same as used during login).
   * @param {string} params.exchange - Exchange where the order is intended ("NSE", "BSE", "NFO", etc.).
   * @param {string} params.transactionType - "B" for Buy or "S" for Sell.
   * @param {string} params.product - Product type ("C", "M", "I").
   * @param {string} params.tradingSymbol - Instrument symbol (e.g., "IDEA-EQ", "NIFTY06MAR25C22500").
   * @param {string} params.quantity - Number of shares or lots.
   * @param {string} params.priceType - Order type ("MKT", "LMT", "SL-LMT", "SL-MKT").
   * @param {string} params.price - Order price (use "0" for market orders).
   *
   * @param {function} callBack - Callback function.
   * @param {Error|string|null} callBack.error - Error object or message, if any.
   * @param {OrderMarginResponse|null} callBack.result - Margin data including total cash, required margin, available margin, remarks, and timestamp.
   *
   * Notes:
   * - Requires a valid `jKey` (session token) obtained during login.
   * - The method returns key margin fields: `marginOnNewOrder`, `availableMargin`, `cash`, `remarks`, and `requestTime`.
   * - Use this to verify sufficient margin before attempting to place the order.
   * - `remarks` may include warnings such as "Insufficient Balance".
   * - Ensure that the selected product type is supported on the specified exchange.
   * - If `jKey` is missing or expired, the response will indicate session invalidation.
   */

  orderMargin(
    params: OrderMarginParams,
    callBack: (error: Error | string | null, result: Response | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`orderMargin`, {
                userId,
                actid: userId, // Added as per your code
                jKey,
                exchange: params.exchange,
                tradingSymbol: params.tradingSymbol,
                quantity: params.quantity,
                price: params.price,
                product: params.product,
                transactionType: params.transactionType,
                priceType: params.priceType,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
  /**
   * Retrieves the list of all orders placed by the user, including open, filled, and rejected orders.
   *
   * This method sends a request to the Firstock Order Book API and returns a structured list of all orders 
   * along with their details such as exchange, transaction type, quantity, price, status, rejection reasons, etc.
   *
   * Useful for real-time order tracking, trade reconciliation, and identifying rejected or pending trades.
   *
   * @param {Object} params - Required parameters for retrieving the order book.
   * @param {string} params.userId - Unique Firstock user ID (same as used during login).
   *
   * @param {function} callBack - Callback function.
   * @param {Error|string|null} callBack.error - Error object or message, if any.
   * @param {OrderBookResponse|null} callBack.result - Array of order details including order number, quantity, status, average price, and rejection reason.
   *
   * Notes:
   * - Requires a valid `jKey` (session token) obtained at login.
   * - Orders include both current and historical data such as `REJECTED`, `FILLED`, or `OPEN`.
   * - Each order record contains fields like `orderNumber`, `exchange`, `transactionType`, `quantity`, `priceType`, `status`, `remarks`, and `rejectReason`.
   * - Use this data for populating order history in user dashboards or triggering logic based on order state.
   * - If `jKey` is invalid or expired, response will indicate session expiration.
   * - Frequent polling should be rate-limited; consider WebSocket alternatives if available.
   */

  orderBook(params: OrderBookParams, callBack: (error: Error | string | null, result: Response | null) => void): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`orderBook`, {
                userId,
                jKey,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
  /**
   * Cancels a previously placed order that has not yet been fully executed.
   *
   * This method interacts with the Firstock Cancel Order API to invalidate an active order. It is useful for
   * real-time risk management and preventing undesired executions when market conditions change or the user
   * decides to withdraw the order.
   *
   * @param {Object} params - Required parameters for cancelling an order.
   * @param {string} params.userId - Unique Firstock user ID (same as used during login).
   * @param {string} params.orderNumber - The unique identifier of the order to be cancelled.
   *
   * @param {function} callBack - Callback function to handle the response.
   * @param {Error|string|null} callBack.error - Error message or object, if the request fails.
   * @param {OrderResponse|null} callBack.result - Response data containing order cancellation status.
   *
   * Notes:
   * - Only orders in an “open” or “partially filled” state are eligible for cancellation.
   * - The session token (`jKey`) must be valid and active; otherwise, a re-login may be required.
   * - Responses include fields like `orderNumber`, `rejreason`, and `requestTime`.
   * - A failed cancellation may return reasons such as "order is not open to cancel".
   * - It's recommended to verify the final order status using the Order Book API after cancellation.
   */

  cancelOrder(params: CancelOrderParams, callBack: (error: Error | string | null, result: Response | null) => void): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`cancelOrder`, {
                userId,
                jKey,
                orderNumber: params.orderNumber,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
  /**
   * Modifies an existing active order with updated parameters like price, quantity, or trigger price.
   *
   * This method interacts with the Firstock Modify Order API to alter a live order without canceling it.
   * It's useful for adapting orders in response to changing market conditions without losing order priority.
   *
   * @param {Object} params - Parameters required to modify an order.
   * @param {string} params.userId - Firstock user ID used during login.
   * @param {string} params.orderNumber - The order identifier to be modified.
   * @param {string} params.priceType - Order type ("MKT", "LMT", "SL-LMT", "SL-MKT").
   * @param {string} params.tradingSymbol - Trading symbol (e.g., "IDEA-EQ").
   * @param {string} [params.price] - Price for limit orders. Should be "0" for market orders.
   * @param {string} [params.quantity] - Number of shares/lots to modify.
   * @param {string} [params.triggerPrice] - Trigger price for SL orders. Optional for other types.
   * @param {string} [params.retention] - Optional order duration (e.g., "DAY", "IOC").
   * @param {string} [params.product] - Product type (e.g., "C", "M", "I").
   *
   * @param {function} callBack - Callback to handle response or error.
   * @param {Error|string|null} callBack.error - Error object or message if request fails.
   * @param {OrderResponse|null} callBack.result - Response data on successful order modification.
   *
   * Notes:
   * - Only open or partially filled orders can be modified.
   * - Session token (jKey) must be valid.
   * - Use consistent combinations of `priceType`, `price`, and `triggerPrice`.
   * - Invalid combinations or closed orders will cause the request to fail.
   * - Always verify status using the Order Book API after calling this method.
   */

  modifyOrder(
    params: ModifyOrderParams,
    callBack: (error: Error | string | null, result: Response | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`modifyOrder`, {
                userId,
                jKey,
                quantity: params.quantity,
                price: params.price,
                triggerPrice: params.triggerPrice,
                orderNumber: params.orderNumber,
                exchange: params.exchange,
                tradingSymbol: params.tradingSymbol,
                priceType: params.priceType,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Fetches detailed history of a specific order including each step or fill event.
 *
 * This method provides a breakdown of an order's lifecycle such as status changes,
 * partial fills, rejection reasons, and timestamps for each transition.
 *
 * **Endpoint:** POST `/singleOrderHistory`  
 * **URL:** https://api.firstock.in/V1/singleOrderHistory
 *
 * @param {SingleOrderHistoryParams} params - The order details required to fetch history.
 * @param {string} params.userId - Unique Firstock user ID (same as login).
 * @param {string} params.orderNumber - Unique identifier for the order to retrieve.
 *
 * @param {(error: Error | string | null, result: OrderResponse | null) => void} callBack - Callback function with either error or response.
 *
 * @returns {void}
 *
 * @example
 * firstock.singleOrderHistory(
 *   { userId: "AB1234", orderNumber: "24121300003425" },
 *   (err, result) => {
 *     if (err) console.error(err);
 *     else console.log(result);
 *   }
 * );
 */
  singleOrderHistory(params: SingleOrderHistoryParams, callBack: (error: Error | string | null, result: Response | null) => void): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`singleOrderHistory`, {
                userId,
                jKey,
                orderNumber: params.orderNumber,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Retrieves the trade history (executed orders) for a user account.
 *
 * Unlike the Order Book, which includes pending and partially filled orders, this method
 * returns only completed or partially executed trades, including fill details such as
 * price, quantity, and timestamps.
 *
 * **Endpoint:** POST `/tradeBook`  
 * **URL:** https://api.firstock.in/V1/tradeBook
 *
 * @param {TradeBookParams} params - Parameters for fetching the trade book.
 * @param {string} params.userId - Unique Firstock user ID (used during login).
 *
 * @param {(error: Error | string | null, result: TradeBookResponse | null) => void} callBack - Callback function with error or trade data.
 *
 * @returns {void}
 *
 * @remarks
 * - Ensure `jKey` is valid (session token from login). An invalid or expired session will trigger an error.
 * - Useful for profit/loss calculations, compliance audits, and trade reconciliation.
 * - Typical failure reasons: invalid `userId`, expired session, or no trades found.
 */
  tradeBook(params: TradeBookParams, callBack: (error: Error | string | null, result: Response | null) => void): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`tradeBook`, {
                userId,
                jKey,
                actid: userId,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Fetches the list of current open positions for the given user.
 *
 * This API provides detailed information about each open position such as:
 * - Buy/sell quantities and average prices for the day
 * - Net quantity and average price
 * - Unrealized mark-to-market (MTM) and realized profit/loss
 * - Exchange, product type, trading symbol, and more
 *
 * Common uses include:
 * - Real-time profit/loss tracking
 * - Position reconciliation with order/trade books
 * - Margin requirement assessment based on product type
 *
 * @param {PositionsBookParams} params - Parameters including userId (Firstock ID)
 * @param {(error: Error | string | null, result: PositionsBookResponse | null) => void} callBack - Callback to receive either error or response
 *
 * @returns {void}
 */
positionBook(params: PositionsBookParams, callBack: (error: Error | string | null, result: Response | null) => void): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`positionBook`, {
                userId,
                jKey,
                actid: userId,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null); // Fixed to use handleError
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Converts the product type for an existing open position.
 *
 * Enables traders to change a position's product type (e.g., from MIS to CNC) without closing and reopening it.
 * This is useful for margin optimization or carrying over intraday positions.
 *
 * Benefits:
 * - Adjust strategy without exiting trades
 * - Free up or reallocate margin
 * - Avoid unnecessary brokerage or slippage
 *
 * Restrictions and considerations:
 * - Ensure jKey (session token) is valid
 * - Conversion may not be allowed after square-off time
 * - Check position size before attempting partial conversions
 * - Only supported symbols and product types are eligible
 *
 * @param {ProductConversionParams} params - Includes userId, tradingSymbol, exchange, quantity, product, and previousProduct
 * @param {(error: Error | string | null, result: ProductConversionResponse | null) => void} callBack - Callback that returns the conversion result or error
 *
 * @returns {void}
 */
  productConversion(
    params: ProductConversionParams,
    callBack: (error: Error | string | null, result: Response | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`productConversion`, {
                userId,
                jKey,
                exchange: params.exchange,
                tradingSymbol: params.tradingSymbol,
                quantity: params.quantity,
                product: params.product,
                previousProduct: params.previousProduct,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Retrieves the user's holdings (portfolio) from Firstock.
 *
 * This method fetches a summary of securities held in the user's Demat account or portfolio.
 * Unlike the position book (which reflects intraday/open positions), holdings represent delivery-based investments.
 *
 * Key Features:
 * - Provides long-term investment details.
 * - Shows exchange and trading symbol for each holding.
 * - Useful for portfolio valuation and analysis.
 *
 * @param {HoldingsParams} params - Required parameters to fetch holdings.
 * @param {string} params.userId - Unique identifier of the user (same as login).
 * @param {string} [params.product] - Optional product type (e.g., CNC, MIS).
 * @param {(error: Error | string | null, result: HoldingsResponse | null) => void} callBack - Callback function with error or result.
 *
 * Endpoint: POST /holdings  
 * Headers: { "Content-Type": "application/json" }
 * 
 * Response:
 * - On success: { status: "success", message: "Fetched holdings", data: [...] }
 * - On error: Error string such as "INVALID_JKEY" or "No config data found"
 *
 * Notes:
 * - Requires a valid session (jKey). If the jKey is invalid or expired, prompt the user to log in again.
 */
  holdings(params: HoldingsParams, callBack: (error: Error | string | null, result: Response | null) => void): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`holdings`, {
                userId,
                jKey,
                ...(params.product && { product: params.product }), // Include product if provided
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Calculates the margin required for placing a basket of orders in a single request.
 *
 * The Basket Margin API is used to compute the net margin impact of multiple orders, which is particularly useful
 * for complex strategies like spreads, options combinations, or simultaneous stock purchases.
 *
 * Key Features:
 * - Evaluates margin requirements for multiple trades together.
 * - Helps prevent partial order failures due to insufficient margin.
 * - Optimized for complex order execution.
 *
 * @param {Object} params - Basket margin request parameters.
 * @param {string} params.userId - Firstock user ID (same as used during login).
 * @param {string} params.exchange - Exchange code (e.g., "NSE", "BSE", "NFO").
 * @param {string} params.transactionType - "B" (Buy) or "S" (Sell) for the first order.
 * @param {string} params.product - Product type (e.g., "C", "M", "I").
 * @param {string} params.tradingSymbol - Trading symbol (e.g., "RELIANCE-EQ").
 * @param {string | number} params.quantity - Quantity of the first order.
 * @param {string} params.priceType - Price type (e.g., "MKT", "LMT").
 * @param {string | number} params.price - Price for the first order. Use "0" for market orders.
 * @param {Array<Object>} params.BasketList_Params - Additional orders in the basket.
 * @param {string} params.BasketList_Params[].exchange - Exchange code for each order.
 * @param {string} params.BasketList_Params[].transactionType - "B" or "S" for each order.
 * @param {string} params.BasketList_Params[].product - Product type for each order.
 * @param {string} params.BasketList_Params[].tradingSymbol - Symbol for each order.
 * @param {string | number} params.BasketList_Params[].quantity - Quantity for each order.
 * @param {string} params.BasketList_Params[].priceType - Price type for each order.
 * @param {string | number} params.BasketList_Params[].price - Price for each order.
 *
 * @param {(error: Error | string | null, result: any | null) => void} callBack - Callback with error or result.
 *
 * Response:
 * - status: "success" or "error"
 * - message: Description of result
 * - data: Contains fields like `BasketMargin`, `MarginOnNewOrder`, `PreviousMargin`, `TradedMargin`, and `Remarks`.
 *
 * Notes:
 * - Requires a valid `jKey` (session token).
 * - Combine this with the RMS Limits API to check available margin.
 * - Ensure all basket items are accurately populated to avoid miscalculations.
 *
 * Endpoint: POST /basketMargin
 * Content-Type: application/json
 */

  basketMargin(
    params: { userId: string; exchange: string; transactionType: string; product: string; tradingSymbol: string; quantity: string | number; priceType: string; price: string | number; BasketList_Params: { exchange: string; transactionType: string; product: string; tradingSymbol: string; quantity: string | number; priceType: string; price: string | number; }[] },
    callBack: (error: Error | string | null, result: any | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post(`basketMargin`, {
                userId,
                jKey,
                exchange: params.exchange,
                transactionType: params.transactionType,
                product: params.product,
                tradingSymbol: params.tradingSymbol,
                quantity: params.quantity,
                priceType: params.priceType,
                price: params.price,
                BasketList_Params: params.BasketList_Params,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Fetches the real-time RMS limits for a user account.
 *
 * This API provides detailed information about a user's trading limits and margin utilization.
 * It helps in assessing available margin, broker collateral, cash balance, collateral values,
 * exposure used, and other key risk metrics.
 *
 * Key Use Cases:
 * - Check if the user has sufficient buying power before placing new trades.
 * - Monitor exposure, margin used, collateral, and available limits.
 * - Ensure session is valid using the jKey.
 *
 * @param {Object} params - The input parameters.
 * @param {string} params.userId - The Firstock user ID (used during login).
 *
 * @param {(error: Error | string | null, result: LimitsResponse | null) => void} callBack - Callback function
 * to handle the response. Returns either an error or a `LimitsResponse` object.
 *
 * Response Structure:
 * - status: "success" or "error"
 * - message: Description of the result
 * - data: Object containing:
 *   - availableMargin: Margin available for new orders
 *   - brkcollamt: Broker collateral amount
 *   - cash: Cash balance in the account
 *   - collateral: Value of pledged holdings
 *   - expo: Exposure margin used
 *   - marginused: Total margin used
 *   - payin: Incoming funds not yet cleared
 *   - peak_mar: Peak margin used in the session
 *   - premium: Option premium paid or received
 *   - span: SPAN margin used (for F&O)
 *   - requestTime: Timestamp of data retrieval
 *
 * Notes:
 * - Always ensure the session token (`jKey`) is valid.
 * - If jKey is invalid, prompt the user to re-authenticate.
 * - This API is essential for real-time risk and margin tracking.
 *
 * Endpoint: POST /limit
 * Headers: Content-Type: application/json
 */

  limit(
    params:LimitsParams,
    callBack: (error: Error | string | null, result: Response | null) => void
  ): void {
    const currentUserId: string = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId: string = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data || {} }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`limit`, {
                userId,
                jKey,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Fetches live market quotes for a given trading symbol on a specified exchange.
 *
 * This method retrieves real-time pricing and order book data such as last traded price,
 * day high/low, and best bid/ask levels. It is useful for market analysis and building
 * live trading interfaces.
 *
 * @param {GetQuotesParams} params - Request parameters including userId, exchange, and tradingSymbol.
 * @param {(error: Error | string | null, result: GetQuotesResponse | null) => void} callBack - 
 *        Callback function that handles the response or error.
 *
 * @remarks
 * - Requires the user to be logged in with a valid session key (`jKey`).
 * - Calls the POST /getQuote endpoint.
 * - Parses and returns the latest quote data if successful.
 *
 * @example
 * firstock.getQuotes(
 *   {
 *     userId: 'AB1234',
 *     exchange: 'NSE',
 *     tradingSymbol: 'RELIANCE-EQ'
 *   },
 *   (error, result) => {
 *     if (error) {
 *       console.error('Quote Error:', error);
 *     } else {
 *       console.log('Quote Data:', result);
 *     }
 *   }
 * );
 */
  getQuote(
    params: GetQuotesParams,
    callBack: (error: Error | string | null, result: Response | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`getQuote`, {
                userId,
                jKey,
                exchange: params.exchange,
                tradingSymbol: params.tradingSymbol,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Fetches the Last Traded Price (LTP) for a given trading symbol on a specified exchange.
 *
 * This API provides a lightweight response containing the most recent traded price, 
 * without full market depth. Ideal for simple UIs or price checks.
 *
 * @param {GetQuoteLTPParams} params - Request parameters including:
 * - `userId` (string): Unique Firstock user ID.
 * - `exchange` (string): Exchange name ("NSE", "BSE", "NFO", etc.).
 * - `tradingSymbol` (string): Trading symbol (e.g., "RELIANCE-EQ").
 *
 * @param {(error: Error | string | null, result: GetQuoteLTPResponse | null) => void} callBack - 
 * Callback function invoked with the LTP response or error.
 *
 * @remarks
 * - Endpoint: `POST /getQuote/ltp`
 * - Requires valid session (`jKey`) from a successful login.
 * - Returns fields like company name, exchange, last traded price, and token.
 * - Useful for real-time updates, alerts, or minimal display dashboards.
 *
 * @returns {void}
 *
 */
  getQuoteltp(
    params: GetQuoteLTPParams,
    callBack: (error: Error | string | null, result: Response | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`getQuote/ltp`, {
                userId,
                jKey,
                exchange: params.exchange,
                tradingSymbol: params.tradingSymbol,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Get Last Traded Prices (LTP) for multiple instruments.
 *
 * This method is used to retrieve the latest traded prices (LTP) for multiple stocks or derivatives 
 * from Firstock's trading API. It is efficient for watchlists or dashboards where only price is required.
 *
 * **Endpoint:** POST `/getMultiQuotes/ltp`
 *
 * **Required Fields in `params`:**
 * - `userId` (string): Firstock user ID.
 * - `data` (Array<{ exchange: string, tradingSymbol: string }>): List of instruments to fetch LTP for.
 *
 * **Usage Notes:**
 * - Each item in `data` must have `exchange` (e.g., NSE, BSE) and `tradingSymbol`.
 * - A valid `jKey` (from login) is auto-fetched from local config.
 * - This is a lightweight alternative to the full quote API.
 *
 * **Example Data:**
 * ```ts
 * {
 *   userId: "AB1234",
 *   data: [
 *     { exchange: "NSE", tradingSymbol: "RELIANCE-EQ" },
 *     { exchange: "NFO", tradingSymbol: "NIFTY03APR25C23500" }
 *   ]
 * }
 * ```
 *
 * @param {GetMultiQuotesLTPParams} params - Parameters including userId and instrument list.
 * @param {(error: Error | string | null, result: GetMultiQuotesLTPResponse | null) => void} callBack - Callback with either error or result.
 *
 * @returns {void}
 */
  getMultiQuotesltp(
    params: GetMultiQuotesLTPParams,
    callBack: (error: Error | string | null, result: Response | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`getMultiQuotes/ltp`, {
                userId,
                jKey,
                data: params.data,
              })
              .then((response) => {
                callBack(null, response.data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Fetches detailed market quotes for multiple instruments (symbols) in a single API request.
 * This includes last traded price, best bid/ask levels, open interest, daily high/low/open/close prices, and more.
 * 
 * @param {GetMultiQuotesParams} params - Parameters required for the API call.
 * @param {string} params.userId - Unique identifier for the Firstock user.
 * @param {Array<{ exchange: string, tradingSymbol: string }>} params.data - Array of exchange-symbol pairs for which quotes are to be retrieved.
 * @param {(error: Error | string | null, result: GetMultiQuotesResponse | null) => void} callBack - Callback function to handle the API response or error.
 * 
 * @returns {void} - No return value; the result is returned via the callback.
 * 
 * @example
 * getMultiQuotes(
 *   {
 *     userId: 'AB1234',
 *     data: [
 *       { exchange: 'NSE', tradingSymbol: 'RELIANCE-EQ' },
 *       { exchange: 'NFO', tradingSymbol: 'NIFTY28JUN29P39000' }
 *     ]
 *   },
 *   (err, result) => {
 *     if (err) {
 *       console.error(err);
 *     } else {
 *       console.log(result);
 *     }
 *   }
 * );
 */
  getMultiQuotes(
    params: GetMultiQuotesParams,
    callBack: (error: Error | string | null, result: Response | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`getMultiQuotes`, {
                userId,
                jKey,
                data: params.data,
              })
              .then((response) => {
                callBack(null, response.data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Searches for tradable instruments (scrips) across multiple exchanges based on partial or full input text.
 * 
 * This API is useful for autocompleting trading symbols in client applications.
 * 
 * @param {SearchScriptsParams} params - Parameters for the search request.
 * @param {string} params.userId - Unique identifier for the Firstock user (same as used during login).
 * @param {string} params.stext - Partial or full text to search trading symbols (e.g., "ITC").
 * 
 * @param {(error: Error | string | null, result: SearchScriptsResponse | null) => void} callBack - 
 * Callback to handle the response or error.
 * 
 * @returns {void} - Result is returned via the callback function.
 * 
 * @example
 * searchScripts(
 *   {
 *     userId: 'AB1234',
 *     stext: 'ITC'
 *   },
 *   (err, result) => {
 *     if (err) {
 *       console.error('Error:', err);
 *     } else {
 *       console.log('Matched Scrips:', result?.data);
 *     }
 *   }
 * );
 */
searchScrips(
    params: SearchScriptsParams,
    callBack: (error: Error | string | null, result: Response | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`searchScrips`, {
                userId,
                jKey,
                stext: params.stext,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Retrieves detailed security information about a trading symbol on a specific exchange.
 * 
 * This API helps validate and fetch metadata like segment, instrument name, lot size, and token ID
 * before placing or managing trades (especially useful in derivatives trading).
 * 
 * @param {GetSecurityInfoParams} params - Parameters for fetching security information.
 * @param {string} params.userId - Firstock user ID (used during login).
 * @param {string} params.exchange - Exchange name (e.g., "NSE", "BSE", "NFO").
 * @param {string} params.tradingSymbol - Symbol identifier (e.g., "IDEA-EQ", "NIFTY06MAR25C22500").
 * 
 * @param {(error: Error | string | null, result: GetSecurityInfoResponse | null) => void} callBack - 
 * Callback function to handle the response or error.
 * 
 * @returns {void} - Result is returned via the callback.
 * 
 * @example
 * getSecurityInfo(
 *   {
 *     userId: "AB1234",
 *     exchange: "NSE",
 *     tradingSymbol: "NIFTY"
 *   },
 *   (err, result) => {
 *     if (err) {
 *       console.error("Security Info Error:", err);
 *     } else {
 *       console.log("Security Info:", result?.data);
 *     }
 *   }
 * );
 */

  securityInfo(
    params: GetSecurityInfoParams,
    callBack: (error: Error | string | null, result: Response | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post<Response>(`securityInfo`, {
                userId,
                jKey,
                exchange: params.exchange,
                tradingSymbol: params.tradingSymbol,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Fetches the list of major stock market indices from the Firstock API.
 *
 * This method is useful for retrieving a consolidated list of index tokens and trading symbols
 * (such as NIFTY50, BANKNIFTY, SENSEX, etc.). These identifiers can then be used for quote-related APIs.
 *
 * The user must be logged in before calling this method (a valid `jKey` is required).
 *
 * @param {Object} params - Parameters required to fetch the index list.
 * @param {string} params.userId - Your Firstock user ID (must be the same as used during login).
 * @param {string} params.exchange - Exchange from which to fetch index list (e.g., "NSE" or "BSE").
 *
 * @param {function} callBack - A callback function receiving `(error, result)`.
 *                              On success, `result` contains an array of index objects:
 *                              - `exchange`: The exchange code (e.g., "NSE")
 *                              - `token`: Numeric identifier for the index
 *                              - `tradingSymbol`: Usable symbol for quote APIs
 *                              - `symbol`: Abbreviated symbol
 *                              - `idxname`: Descriptive name like "NIFTY 50", "BANKNIFTY", etc.
 *
 * @returns {void}
 */
indexList(
    params:GetIndexListParams,
    callBack: (error: Error | string | null, result: any | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post(`indexList`, {
                userId,
                jKey,
                exchange: params.exchange,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Fetches available expiry dates for a given trading symbol on the specified exchange.
 *
 * Useful for retrieving valid expiry dates for derivatives (Futures & Options) contracts.
 * A valid session (jKey) is required before calling this method.
 *
 * @param {Object} params - Parameters for the API call.
 * @param {string} params.userId - The Firstock user ID (must match the login session).
 * @param {string} params.exchange - The exchange code (e.g., "NSE", "NFO").
 * @param {string} params.tradingSymbol - The trading symbol (e.g., "NIFTY").
 *
 * @param {function} callBack - Callback function with `(error, result)` arguments.
 *                              On success, result contains an array of expiry dates.
 */
  getExpiry(
    params: GetExpiryParams,
    callBack: (error: Error | string | null, result: any | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post(`getExpiry`, {
                userId,
                jKey,
                exchange: params.exchange,
                tradingSymbol: params.tradingSymbol,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }
/**
 * Calculates total brokerage charges, taxes, and final costs for a given trade.
 *
 * This API helps estimate the net cost or profitability of a trade before execution.
 * It supports equity and derivatives markets and provides a breakdown of all applicable charges.
 *
 * Requires a valid login session (jKey). Ideal for use before placing or simulating trades.
 *
 * @param {Object} params - Parameters required for brokerage calculation.
 * @param {string} params.userId - The Firstock user ID (must match logged-in session).
 * @param {string} params.exchange - The exchange where the order is placed (e.g., "NSE", "NFO").
 * @param {string} params.tradingSymbol - The symbol of the instrument (e.g., "RELIANCE27FEB25F").
 * @param {string} params.transactionType - The order side: "B" (Buy) or "S" (Sell).
 * @param {string} params.Product - The product type: e.g., "M", "C", "I".
 * @param {string|number} params.quantity - Quantity of the instrument to trade.
 * @param {string|number} params.price - Price at which the order is to be placed.
 * @param {string|number} params.strike_price - Applicable strike price (mandatory for F&O instruments).
 * @param {string} params.inst_name - Instrument name, such as FUTSTK, OPTIDX, etc. (required for derivatives).
 * @param {string|number} params.lot_size - Lot size of the instrument (required for derivatives).
 *
 * @param {function} callBack - Callback function with signature `(error, result)`.
 *                              On success, result contains detailed brokerage information.
 */

  brokerageCalculator(
    params: BrokerageCalculatorParams,
    callBack: (error: Error | string | null, result: any | null) => void
  ): void {
    const currentUserId = params.userId;
    readData((err: Error | string | null, data: ConfigData | null) => {
      if (err) {
        callBack(errorMessageMapping({ message: err instanceof Error ? err.message : err }), null);
      } else if (data) {
        const userId = currentUserId;
        checkifUserLoggedIn({ userId, jsonData: data }, (err: string | null, jKey: string | null) => {
          if (err) {
            callBack(err, null);
          } else if (jKey) {
            axiosInterceptor
              .post(`brokerageCalculator`, {
                userId,
                jKey,
                exchange: params.exchange,
                tradingSymbol: params.tradingSymbol,
                transactionType: params.transactionType,
                Product: params.Product,
                quantity: params.quantity,
                price: params.price,
                strike_price: params.strike_price,
                inst_name: params.inst_name,
                lot_size: params.lot_size,
              })
              .then((response) => {
                const { data } = response;
                callBack(null, data);
              })
              .catch((error: AxiosError) => {
                callBack(handleError(error), null);
              });
          } else {
            callBack("No jKey found", null);
          }
        });
      } else {
        callBack("No config data found", null);
      }
    });
  }

}

export default Firstock;