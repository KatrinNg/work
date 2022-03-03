const DL_PRIVILEGES_SERVICE_PROFILE = [
  {
    label:'Service Favourite',
    value:'S'
  },{
    label:'Nurse Permission',
    value:'N'
  }
];

const DL_PRIVILEGES_PERSONAL_PROFILE = [
  {
    label:'My Favourite',
    value:'M'
  }
];


const FORM_ITEM_TYPE = {
  DROP_DOWN_LIST:'DL',
  INPUT_BOX:'IB',
  OUTPUT_BOX:'OB',
  RADIO_BUTTON:'RB',
  CLICK_BOX:'CB'
};

const ITEM_VALUE = {
  TYPE1: '1',
  TYPE2: '2'
};

const ITEM_CATEGORY_TYPE = {
  TEST: 'test',
  SPECIMEN: 'specimen',
  INFO: 'info'
};

const TEST_ITEM_MASTER_TEST_FLAG = 1;
const TEST_ITEM_IOE_TYPE = {
  ITEO: 'ITEO',
  ITE: 'ITE',
  ITEF: 'ITEF'
};

const LAB_ID = {
  PHLC: 'PHLC',
  CPLC: 'CPLC'
};

const TEMPLATE_IS_NEW_FLAG = {
  YES:'Y',
  NO:'N'
};

const TEMPLATE_ACTIVE_STATUS = {
  ACTIVE: 1,
  NOT_ACTIVE: 0
};

const ITEM_CATEGORY_IOE_TYPE_SET = {
  TEST:new Set(['ITEO','ITE','ITEF']),
  SPECIMEN:new Set(['ISP']),
  INFO:new Set(['IRE','ICD'])
};

const TEST_IOE_TYPE_PROPORTION_MAP = new Map([
  ['ITE', 1],
  ['ITEO', 99],
  ['ITEF', 0]
]);

const INFO_DIALOG_ACTION_TYPE = {
  OK: 'OK',
  CANCEL: 'CANCEL'
};

const ORDER_NUMBER_OPTIONS = [
  {
    label:'1',
    value:1
  },{
    label:'2',
    value:2
  },{
    label:'3',
    value:3
  },{
    label:'4',
    value:4
  },{
    label:'5',
    value:5
  }
];

const DIALOG_TOP_TABS = [
  {
    label:'Discipline',
    value:'Discipline'
  }
];

const INFO_ITEM_FIELD_IOE_TYPE = {
  Diagnosis: 'ICD',
  Remark: 'IRE',
  Instruction: 'IRE'
};

export {
  DL_PRIVILEGES_SERVICE_PROFILE,
  DL_PRIVILEGES_PERSONAL_PROFILE,
  FORM_ITEM_TYPE,
  ITEM_VALUE,
  ITEM_CATEGORY_TYPE,
  TEST_ITEM_MASTER_TEST_FLAG,
  LAB_ID,
  TEST_ITEM_IOE_TYPE,
  TEMPLATE_IS_NEW_FLAG,
  TEMPLATE_ACTIVE_STATUS,
  ITEM_CATEGORY_IOE_TYPE_SET,
  INFO_DIALOG_ACTION_TYPE,
  ORDER_NUMBER_OPTIONS,
  DIALOG_TOP_TABS,
  TEST_IOE_TYPE_PROPORTION_MAP,
  INFO_ITEM_FIELD_IOE_TYPE
};
