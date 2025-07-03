"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AFirstock {
    constructor() {
        if (this.constructor === AFirstock) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }
}
exports.default = AFirstock;
