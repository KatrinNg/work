import { useState } from 'react';


const useInitialize = () => {
    // blocking api here
    const [isInit, setInit] = useState(true);
   
    return isInit;
};

export default useInitialize;
