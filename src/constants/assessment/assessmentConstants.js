// import { styles } from './specimenCollectionStyle';

const OBJ_TYPE = {
  DROP_DOWN_LIST:'DL',
  INPUT_BOX:'IB',
  OUTPUT_BOX:'OB',
  RADIO_BUTTON:'RB',
  CLICK_BOX:'CB',
  TEXTAREA:'TA',
  BUTTON:'BTN'
};

const DATA_TYPE = {
  DOUBLE:'DOUBLE',
  INTEGER:'INTEGER',
  STRING:'STRING',
  TIME:'TIME',
  DATE:'DATE',
  DATETIME:'DATETIME'
};

const CHECKBOX_STATUS = {
  CHECKED:'1',
  UNCHECKED:''
};

let dataTypeForamtMap = new Map();
dataTypeForamtMap.set(DATA_TYPE.TIME,'HH:mm');

let specialUnitMap = new Map();
// specialUnitMap.set('kg/m^2','kg/㎡');
specialUnitMap.set('kg/m^2',`${'kg/m<sup style=font-size:smaller>2</sup>'}`);


export {
  OBJ_TYPE,
  DATA_TYPE,
  CHECKBOX_STATUS,
  dataTypeForamtMap,
  specialUnitMap
};
