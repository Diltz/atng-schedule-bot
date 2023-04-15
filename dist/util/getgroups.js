"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const querystring_1 = require("querystring");
module.exports = async (day, group_name) => {
    let response;
    let groups = [];
    try {
        response = await (0, axios_1.default)({
            url: "https://www.achtng.ru/atng/rasp.php"
        });
    }
    catch (error) {
        console.log(error);
        return null;
    }
    for (let group of response.data[0].rr) {
        groups.push((0, querystring_1.unescape)(group.g).replaceAll("+", " "));
    }
    return groups;
};
//# sourceMappingURL=getgroups.js.map