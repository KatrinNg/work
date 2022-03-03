import * as scannerCertificateActionType from './scannerCertificateActionType';

export const triggerGetAllDocListForScanner = (callback = null) => {
    return {
        type: scannerCertificateActionType.GET_ALL_DOCLIST_FOR_SCANNER,
        callback: callback
    };
};

export const triggerUpdateHistoryContainerOpenClose = (open) => {
    return {
        type: scannerCertificateActionType.UPDATE_HISTORY_CONTAINER_OPEN_CLOSE,
        open: open
    };
};
export const triggerCloseScannerHistory = () => {
    return {
        type: scannerCertificateActionType.CLOSE_SCANNER_HISTORY
    };
};


