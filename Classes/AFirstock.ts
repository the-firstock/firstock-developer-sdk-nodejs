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

interface GetOptionChainParams {
  userId: string;
  exchange: string;
  symbol: string;
  strikePrice: string | number;
  count: string | number;
  expiry?: string;
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
  
  
  abstract class AFirstock {
    constructor() {
      if (this.constructor === AFirstock) {
        throw new Error("Abstract classes can't be instantiated.");
      }
    }
  
    abstract getPosts(): Promise<any>;
  
    abstract getUsers(): any;
  
    abstract getPostByUserId(): any;
  
    abstract login(
      params: LoginParams,
      callBack: (error: Error | null, result: Response | null) => void
    ): void;
  
    abstract logout(
      params: { userId: string },
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;

    abstract userDetails(
      params: UserDetailsParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;

    abstract placeOrder(
      params: PlaceOrderParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;  

    abstract orderMargin(
      params: OrderMarginParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;   

    abstract cancelOrder(
      params: CancelOrderParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;

    abstract modifyOrder(
      params: ModifyOrderParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;

    abstract singleOrderHistory(
      params: SingleOrderHistoryParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;
    abstract orderBook(
      params: OrderBookParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;
  
    abstract tradeBook(
      params: TradeBookParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;
  
    abstract positionBook(
      params: PositionsBookParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;
  
    abstract productConversion(
      params: ProductConversionParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;  
    
    abstract holdings(
      params: HoldingsParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;

    abstract limit(
      params: LimitsParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;

    abstract basketMargin(
      params: BasketMarginParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;
    
    abstract getQuote(
      params: GetQuotesParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;  

    abstract getQuoteltp(
      params: GetQuoteLTPParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;  

    abstract getMultiQuotesltp(
      params: GetMultiQuotesLTPParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void; 

    abstract getMultiQuotes(
      params: GetMultiQuotesParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void; 

    abstract searchScrips(
      params: SearchScriptsParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;  

    abstract securityInfo(
      params: GetSecurityInfoParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;  

    abstract indexList(
      params: GetIndexListParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;
    
    abstract optionChain(
      params: GetOptionChainParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;
      
    abstract timePriceSeries(
      params: TimePriceSeriesParams,
      callBack: (error: Error | string | null, result: Response | null) => void
    ): void;

    abstract getExpiry(
        params: GetExpiryParams,
        callBack: (error: Error | string | null, result: Response | null) => void
      ): void;

    abstract brokerageCalculator(
        params: BrokerageCalculatorParams,
        callBack: (error: Error | string | null, result: Response | null) => void
      ): void;
  }
  
  export default AFirstock;