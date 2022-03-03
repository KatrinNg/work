export const getFieldFromObjArray = (...args) => {
    let r = [];
    let objArray = args[0];
    let arglist = [...args];
    arglist.shift();
    for(let i = 0; i < objArray.length; i++){
        let o = objArray[i];
        let f = o[arglist[0]];
        if(typeof f !== "undefined"  && f !== null){
            for( let j = 0; j < arglist.length; j++ ){
                let nextArg = arglist[j + 1];
                if(nextArg){
                    if (f !== null){
                        if (typeof f[nextArg] !== "undefined" ){
                            let innerField =  f[nextArg];
                            f = innerField;
                        } else {
                            f = null;
                        }
                    }
                }
            }
        }
        if(typeof f !== "undefined" && f !== null){
            r.push(f);
        }
    }
    return r;
};

export const uniqueList = (list) =>{
    let r = [];
    if(list) {
        r =list.filter((v, i, s) => s.indexOf(v) === i );
    } else{
        list = [];
    }
    return r;
};
