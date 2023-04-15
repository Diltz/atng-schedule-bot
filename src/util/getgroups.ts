import axios from "axios";
import { unescape } from "querystring";

module.exports = async (day: String, group_name: String) => {
    let response
    let groups = []

    try {
        response = await axios({
            url: "https://www.achtng.ru/atng/rasp.php"
        })
    } catch (error) {
        console.log(error)
        return null
    }

    for (let group of response.data[0].rr) {
        groups.push(unescape(group.g).replaceAll("+", " "))
    }

    return groups
}