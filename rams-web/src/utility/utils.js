import _, { cloneDeep, isEmpty } from 'lodash';
import moment from 'moment';

export const getCookie = (name) => {
  let arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
  if(arr=document.cookie.match(reg))
    return arr[2];
  else
    return null;
}

export const produce = (base, processFunction) => {
    if (typeof base === 'function') {
        return (prevState) => {
            return updateState(base)(prevState);
        };
    } else {
        return updateValue(base, processFunction);
    }
};
export const updateValue = (base, processFunction) => {
    let newBase = _.cloneDeep(base);
    processFunction(newBase);
    return newBase;
};

export const updateState = (processFunction) => (prevState) => {
    let newBase = _.cloneDeep(prevState);
    processFunction(newBase);
    return newBase;
};
export const generateRandomId = (length = 20) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

export const isString = (value) => {
    return typeof value === 'string' && value.constructor === String
}

export const getTimeWithTimeZone = (dateString) => {
    // adding 28800 second to the utc timestamp, and force frontend to display in utc timezone.
    const currentTimestamp = new Date(dateString).getTime() + 28800 * 1000;
    return moment(currentTimestamp).utc();
};

export const ellipsis = (currentPage, totalPage) => {

    const arr = []
  
    if (totalPage < 8) {
      for (let i = 1; i < totalPage + 1; i++) {
        arr.push(i)
      }
    } else {
      if(currentPage < 5){
        
        for (let i = 1; i < 5 + 1; i++) {
        arr.push(i)
      }
      arr.push("...")
      arr.push(totalPage)
      } 
      else if(totalPage - currentPage <=3 ){
        arr.push(1)
        arr.push("...")
        for(let i = totalPage -4; i<= totalPage;i++ ){
          arr.push(i)
        }
      } else{
        arr.push(1)
        arr.push("...")
        for(let i = currentPage-1; i <currentPage+2;i++ ){
          arr.push(i)
        }
        arr.push("...")
        arr.push(totalPage)
      }
    }
    return arr
}