import storeConfig from '../store/storeConfig';

export function getMessageByMsgCode(msgCode) {
    const store = storeConfig.store.getState();
    const msgList = store && store['message']['commonMessageList'];
    if(msgList && msgCode){
        const msg = msgList.find(item => item.messageCode === msgCode);
        return msg;
    }
    return null;
}

export function getMessageDescriptionByMsgCode(msgCode) {
    const store = storeConfig.store.getState();
    const msgList = store && store['message']['commonMessageList'];
    if(msgList && msgCode){
        const msg = msgList.find(item => item.messageCode === msgCode);
        return msg && msg.description;
    }
    return '';
}