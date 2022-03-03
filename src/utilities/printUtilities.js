import axios from '../services/ccpAxiosInstance';
import { getState } from '../store/util';
import { PRINTER_TRAY_TYPE } from '../enums/enum';
import { getSiteParamsValueByName } from '../utilities/commonUtilities';

export function getPrinterTray(printType) {
    const workstationParams = getState(state => state.common.workstationParams);
    const tray = workstationParams.find(params => params.paramName === printType);
    const siteTraySetting = getSiteParamsValueByName(printType);
    if (tray) {
        return tray.paramValue;
    } else {
        return siteTraySetting;
    }
}

export function getPaperSize(printType) {
    const siteParams = getState((state) => state.common.siteParams);
    if (siteParams) return siteParams[printType][0].paramValue;
    else return null;
}

export function print(params) {
    const tray = getPrinterTray(PRINTER_TRAY_TYPE.OTHER);
    return axios.post('/ccp/check').then((check) => {
        if (check.data && check.data.status === 'OK') {
            let qs = require('qs');
            let requireParams = {
                tid: params.taskId,
                pt: params.printType || 5,
                url: params.documentUrl || 'http://localhost:17300',
                docParm: params.documentParameters,
                b64: params.base64,
                que: params.printQueue,
                tc: params.printTray || tray,
                fp: params.firstPage,
                lp: params.lastPage,
                ctr: params.isCenter || false,
                fit: params.isFitPage || false,
                shk: params.isShrinkPage || false,
                ps: params.paperSize,
                cps: params.copies,
                ori: Number.isInteger(params.orientation) ? params.orientation : -1,
                msz: params.mediaSize || 'N/A',
                os: params.isObjectStream || false,
                cb: params.callback,
                ref: params.referer,
                ver: check.data.agent_version,
                cbm: params.callbackMode || 1,
                pm: params.printMode,
                pdfPw: params.pdfPassword,
                sc: params.sheetCollate || 1
            };
            axios.post('/ccp/prn', qs.stringify(requireParams)).then((respan) => {
                let data = respan.data;
                let printSuccess;
                if (data.success) {
                    printSuccess = true;
                } else {
                    printSuccess = false;
                    // console.error(respan);
                }
                if (typeof params.callback === 'function') {
                    params.callback && params.callback(printSuccess);
                }
            });
        } else {
            // console.error(check);
            params.callback && params.callback(false);
        }
    }).catch(e => {
        params.callback && params.callback(false);
    });
}

export function printAsync(params) {
    return new Promise((resolve) => {
        print({
            ...params,
            callback: (printSuccess) => resolve(printSuccess)
        });
    });
}

export async function printWithRetryDefault(params) {
    let { callback, printQueue, ..._params } = params;
    // 1st try with specified printer
    let printSuccess = await printAsync({..._params, printQueue});
    if (!printSuccess) {
        console.log('1st print error');
        // failover to default printer if 1st try is not using the default one
        if (printQueue != null && printQueue !== '') {
            printSuccess = await printAsync({..._params});
            if (!printSuccess)
                console.log('2nd print error');
        }
    }
    callback && callback(printSuccess);
}
