import {postUrl} from "./apiServices";

export const FormService = {
    postFormData,
    sendQrCodeToEmail
};

async function postFormData(data){
    const url = "/vis/generateRsaQrCode";
    const opt = {
        responseType: "arraybuffer",
    };
    data.creationTime = Date.now();
    const res = await postUrl(url,data, opt);
    return res
}

async function sendQrCodeToEmail(data){
    const url = "/vis/sendRsaQrCodeToEmail";
    data.creationTime = Date.now();
    const res = await postUrl(url,data);
    return res;
}

async function readData(form) {}
