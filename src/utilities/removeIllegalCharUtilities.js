export function byRegular(regular,value,maxlenght){
    let returnValue = regular&&value?value.replace(regular,''):'';
    return maxlenght? returnValue.slice(0,maxlenght):returnValue;
}
export function nonNumber(value,maxlenght){
    return byRegular(/[^0-9]/ig,value,maxlenght);
}
export function nonEnglish(value,maxlenght){
    return byRegular(/[^A-Za-z]/ig,value,maxlenght);
}
export function nonNumberAndEnglish(value,maxlenght){
    return byRegular(/[^A-Za-z0-9]/ig,value,maxlenght);
}
