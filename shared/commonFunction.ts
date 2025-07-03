import * as fs from "fs";

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


const saveData = (data: any, file: string, callback: (err: NodeJS.ErrnoException | null) => void): void => {
  const path = "./config.json";
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFile(path, jsonData, callback);
};



const readData = (callback: (err: Error | string | null, data: JsonData | null) => void): void => {
  const path = "./config.json";
  fs.readFile(path, "utf-8", (err: NodeJS.ErrnoException | null, jsonString: string) => {
    if (err) {
      if (err.code === "ENOENT") {
        // File not found: create it with "{}"
        fs.writeFile(path, "{}", "utf-8", (writeErr) => {
          if (writeErr) {
            callback(writeErr, null);
          } else {
            callback(null, {}); // Return an empty object
          }
        });
      } else {
        callback(err, null);
      }
   
    } else {
      try {
        const data = JSON.parse(jsonString);
        callback(null, data);
      } catch (error) {
        callback(error as Error, null);
      }
    }
  });
};

const checkifUserLoggedIn = (
  { userId, jsonData }: { userId: string; jsonData: JsonData },
  callback: (err: string | null, jKey: string | null) => void
): void => {
  if (jsonData[userId]) {
    const jKey = jsonData[userId].jKey;
    callback(null, jKey);
  } else {
    callback("Please login to Firstock", null);
  }
};

const jsonErrorMessage: { [key: string]: string } = {
  "Unexpected end of JSON input": "Please login to Firstock",
};

const errorMessageMapping = (jsonData: { message?: string }): string => {
    return jsonErrorMessage[jsonData.message || ""] ?? jsonData.message ?? "Unknown error";
  };

const validateBasketMarginObject = (data: BasketMarginObject): boolean => {
  if (
    data["exchange"] &&
    data["tradingSymbol"] &&
    data["quantity"] &&
    data["transactionType"]
  ) {
    return true;
  }
  return false;
};

const validateBasketMargin = (data: BasketMarginObject[]): boolean => {
  return data.every((a) => validateBasketMarginObject(a));
};

const handleError = (error: any): any => {
  if (error) {
    if (error.response) {
      if (error.response.data) {
        return error.response.data;
      } else {
        return error.response;
      }
    } else {
      return error;
    }
  }
  return "error";
};

export {
  saveData,
  readData,
  validateBasketMarginObject,
  validateBasketMargin,
  handleError,
  checkifUserLoggedIn,
  errorMessageMapping,
};