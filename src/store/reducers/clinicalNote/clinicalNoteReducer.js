// import * as clinicalNoteActionType from '../../actions/clinicalNote/clinicalNoteActionType';

const INITAL_STATE = {
  sysConfig: {
    PAGE_SIZE: {
      key: 'PAGE_SIZE',
      value: '20',
      engDesc: 'The page size for Pagination ',
      configType: 'INT'
    },
    TMPL_NAME_LEN: {
      key: 'TMPL_NAME_LEN',
      value: '30',
      engDesc: 'The Content of Template Name Visible Length',
      configType: 'Int'
    },
    TMPL_TIPS_SIZE: {
      key: 'TMPL_TIPS_SIZE',
      value: '30',
      engDesc: 'The Content of Template Tips Visible Length',
      configType: 'Int'
    }
  }
};

export default (state = INITAL_STATE) => {
  return state;
  // switch (action.type) {
  //   default:
  //     return state;
  // }
};