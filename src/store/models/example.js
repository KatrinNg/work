import {getServices} from 'api/clinicalNoteDemo';

export default {
  namespace:'example',
  state:{
    services:[],
    recordTypes:[],
    records:[]
  },
  effects: {
    *getServices ({payload},{put,call}) {
      const data=yield call(getServices,payload);
      console.log(data);
    }
  },
  reducers: {
    querySuccess (state={}, action) {
      console.log('querySuccess');
      return { ...state,
        ...action.payload
      };
    }
  }
};

