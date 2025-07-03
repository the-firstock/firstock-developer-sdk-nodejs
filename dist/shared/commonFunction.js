"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMessageMapping = exports.checkifUserLoggedIn = exports.handleError = exports.validateBasketMargin = exports.validateBasketMarginObject = exports.readData = exports.saveData = void 0;
const fs = __importStar(require("fs"));
const saveData = (data, file, callback) => {
    const path = "./config.json";
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFile(path, jsonData, callback);
};
exports.saveData = saveData;
const readData = (callback) => {
    const path = "./config.json";
    fs.readFile(path, "utf-8", (err, jsonString) => {
        if (err) {
            callback(err, null);
        }
        else {
            try {
                const data = JSON.parse(jsonString);
                callback(null, data);
            }
            catch (error) {
                callback(error, null);
            }
        }
    });
};
exports.readData = readData;
const checkifUserLoggedIn = ({ userId, jsonData }, callback) => {
    if (jsonData[userId]) {
        const jKey = jsonData[userId].jKey;
        callback(null, jKey);
    }
    else {
        callback("Please login to Firstock", null);
    }
};
exports.checkifUserLoggedIn = checkifUserLoggedIn;
const jsonErrorMessage = {
    "Unexpected end of JSON input": "Please login to Firstock",
};
const errorMessageMapping = (jsonData) => {
    var _a, _b;
    return (_b = (_a = jsonErrorMessage[jsonData.message || ""]) !== null && _a !== void 0 ? _a : jsonData.message) !== null && _b !== void 0 ? _b : "Unknown error";
};
exports.errorMessageMapping = errorMessageMapping;
const validateBasketMarginObject = (data) => {
    if (data["exchange"] &&
        data["tradingSymbol"] &&
        data["quantity"] &&
        data["transactionType"]) {
        return true;
    }
    return false;
};
exports.validateBasketMarginObject = validateBasketMarginObject;
const validateBasketMargin = (data) => {
    return data.every((a) => validateBasketMarginObject(a));
};
exports.validateBasketMargin = validateBasketMargin;
const handleError = (error) => {
    if (error) {
        if (error.response) {
            if (error.response.data) {
                return error.response.data;
            }
            else {
                return error.response;
            }
        }
        else {
            return error;
        }
    }
    return "error";
};
exports.handleError = handleError;
