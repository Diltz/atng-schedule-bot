import axios from "axios";
import { unescape } from "querystring";

module.exports = async (day: String, group_name: String) => {
    let response

    try {
        response = await axios({
            url: "https://www.achtng.ru/atng/rasp.php?d=" + day
        })
    } catch (error) {
        console.log(error)
        return null
    }

    for await (let group of response.data[0].rr) {
        let decodedName = unescape(group.g)

        if (decodedName === group_name.toUpperCase()) {
            return group
        }
    }
}