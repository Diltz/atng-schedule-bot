"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const querystring_1 = require("querystring");
module.exports = async (day, group_name) => {
    let response;
    try {
        response = await (0, axios_1.default)({
            url: "https://www.achtng.ru/atng/rasp.php?d=" + day
        });
    }
    catch (error) {
        console.log(error);
        return null;
    }
    for await (let group of response.data[0].rr) {
        let decodedName = (0, querystring_1.unescape)(group.g);
        if (decodedName === group_name.toUpperCase()) {
            return group;
        }
    }
};
//# sourceMappingURL=getschedule.js.map