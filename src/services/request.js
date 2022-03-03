import axios,{ AxiosRequestConfig, AxiosResponse } from 'axios';

const parseData=(data)=>{
  if (typeof data === 'string' && data.startsWith('{')) {
    data = JSON.parse(data);
  }
  return data;
};

const handleHttpError=(response)=>{
  //@Todo
  //handleLogic
  console.log('Http Error',response);
};

const request=axios.create({
  baseURL: '/',
  headers:{
    get: {
      'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'
    },
    post: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  },
  timeout:120000,
  transformRequest:[],
  transformResponse:[parseData],
  validateStatus:()=>{
    return true;
  }
});

request.interceptors.request.use(config=>{
  if (window.sessionStorage.getItem('token')) {
    config.headers.Authorization = `Bearer ${window.sessionStorage.getItem('token')}`;
  }
  return config;
});

request.interceptors.response.use((response: AxiosResponse)=>{
  const {status}=response;
  let data={};
  if(status < 200 || status >= 300) {
    handleHttpError(response);
  }else{
    data=response.data;
  }
  return data;
},error=>{
  console.log('errorhandle',error);
});

export default request;
