import axios from "axios";

export async function getUrl(url, opt){
    try{
        const response = await axios.get(url,opt);
        return response;
    } catch (e) {
        console.error(e)
        return e.response
    }
}

export async function postUrl(url, data, opt){
    try{
        const response = await axios.post(url, data, opt);
        return response;
    } catch (e) {
        console.error(e)
        return e.response
    }
}
