const OTHER_ITEM_MAP_KEY = 'otherItems';
const REMARK_ITEM_NAME = 'Remark';
const INSTRUCTION_ITEM_NAME = 'Instruction';
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

const TEST_ITEM_MASTER_TEST_FLAG = 1;
const TEST_ITEM_IOE_TYPE = {
  ITEO: 'ITEO',
  ITE: 'ITE',
  ITEF: 'ITEF'
};

const LAB_ID = {
  PHLC: 'PHLC',
  CPLC: 'CPLC',
  NSL:'NSL'
};

const TEMPLATE_IS_NEW_FLAG = {
  YES:'Y',
  NO:'N'
};

const TEMPLATE_ACTIVE_STATUS = {
  ACTIVE: 1,
  NOT_ACTIVE: 0
};

const ITEM_CATEGORY_IOE_TYPE = {
  TEST:new Set(['ITEO','ITE','ITEF']),
  SPECIMEN:new Set(['ISP']),
  OTHER:{
    Urgent: 'IUR',
    RefNo: 'ICN',
    Diagnosis: 'ICD',
    Remark: 'IRE',
    Instruction: 'IRE',
    ReportTo: 'IRT'
  },
  QUESTION:new Set(['IQU','IQS','IQUM']),
  OPTION: 'IRE'
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

const OTHER_ITEM_FIELD_IOE_TYPE = {
  Urgent: 'IUR',
  RefNo: 'ICN',
  Diagnosis: 'ICD',
  Remark: 'IRE',
  Instruction: 'IRE',
  ReportTo: 'IRT'
};

const ITEM_CATEGORY_TYPE = {
  TEST: 'test',
  SPECIMEN: 'specimen',
  INFO: 'info',
  OTHER: 'other',
  QUESTION: 'question',
  BACKUPQUESTION:'backupQuestion'
};

const ITEM_QUESTION_TYPE = {
  IQU: 'IQU',
  IQS: 'IQS',
  IQUM: 'IQUM',
  IRE: 'IRE'
};

const PRIVILEGES_DOCTOR_TABS = [
   {
     label:'Discipline',
    value:'Discipline'
   },
  {
    label:'Service',
    value:'S'
  },{
    label:'Personal',
    value:'M'
  }
];

const PRIVILEGES_NURSE_TABS = [
  {
    label:'Nurse',
    value:'N'
  }
];

const PRIVILEGES_EXPRESS_IOE_TABS = [
  {
    label:'Express',
    value:'E'
  }
];


const IOE_REQUEST_TYPE = {
  DOCTOR: 'DO',
  NURSE: 'NO'
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

const IX_REQUEST_SAVE_TYPE = {
  IX_REQUEST_SAVE:'data',
  IX_REQUEST_SAVE_AND_PRINT_REMINDER:'dataReminder',
  IX_REQUEST_SAVE_PRINT_LABEL_OR_OUTPUT_FORM:'dataLabelOrForm'
};

const IX_REQUEST_TEMPLATE_CB = {
  LEVEL_1: '1',
  LEVEL_2: '2',
  LEVEL_3: '3'
};

const IX_REQUEST_TEMPLATE_SELECT_BOTH = {
  LipidProfileKey: 704,
  CholesterolLDLKey: 276
};


const FUNCTION_NAME = 'IX_REQUEST';
const PANEL_FORM_ITEM_ID = 662;

export {
  FORM_ITEM_TYPE,
  ITEM_VALUE,
  ITEM_CATEGORY_TYPE,
  PRIVILEGES_DOCTOR_TABS,
  PRIVILEGES_NURSE_TABS,
  PRIVILEGES_EXPRESS_IOE_TABS,
  ORDER_NUMBER_OPTIONS,
  TEST_ITEM_MASTER_TEST_FLAG,
  TEST_ITEM_IOE_TYPE,
  OTHER_ITEM_FIELD_IOE_TYPE,
  LAB_ID,
  TEMPLATE_IS_NEW_FLAG,
  TEMPLATE_ACTIVE_STATUS,
  ITEM_CATEGORY_IOE_TYPE,
  INFO_DIALOG_ACTION_TYPE,
  ITEM_QUESTION_TYPE,
  OTHER_ITEM_MAP_KEY,
  REMARK_ITEM_NAME,
  INSTRUCTION_ITEM_NAME,
  IOE_REQUEST_TYPE,
  IX_REQUEST_SAVE_TYPE,
  IX_REQUEST_TEMPLATE_CB,
  TEST_IOE_TYPE_PROPORTION_MAP,
  FUNCTION_NAME,
  PANEL_FORM_ITEM_ID,
  IX_REQUEST_TEMPLATE_SELECT_BOTH
};