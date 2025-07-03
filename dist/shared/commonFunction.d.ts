interface BasketMarginObject {
    exchange?: string;
    tradingSymbol?: string;
    quantity?: string | number;
    transactionType?: string;
    [key: string]: any;
}
interface JsonData {
    [key: string]: {
        jKey: string;
        [key: string]: any;
    };
}
declare const saveData: (data: any, file: string, callback: (err: NodeJS.ErrnoException | null) => void) => void;
declare const readData: (callback: (err: Error | string | null, data: JsonData | null) => void) => void;
declare const checkifUserLoggedIn: ({ userId, jsonData }: {
    userId: string;
    jsonData: JsonData;
}, callback: (err: string | null, jKey: string | null) => void) => void;
declare const errorMessageMapping: (jsonData: {
    message?: string;
}) => string;
declare const validateBasketMarginObject: (data: BasketMarginObject) => boolean;
declare const validateBasketMargin: (data: BasketMarginObject[]) => boolean;
declare const handleError: (error: any) => any;
export { saveData, readData, validateBasketMarginObject, validateBasketMargin, handleError, checkifUserLoggedIn, errorMessageMapping, };
