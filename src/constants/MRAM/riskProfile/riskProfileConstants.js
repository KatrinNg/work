import {derivePara} from './derivePara';

const MRAM_RISKPROFILE_RSPF_PREFIX = 'rspf';
const MRAM_RISKPROFILE_RSPF_EXAMINATION_ID = {
  CORONARY_HEART_DISEASE:'173',
  STROKE:'174',
  MACROVASCULAR_PERIPHERAL_ARTERIAL_DISEASE:'175',
  HYPERTENSENSIVE_RETINOPATHY:'176',
  DIABETIC_RETINOPATHY:'177',
  ALBUMINURIA:'178',
  CHRONIC_KIDNEY_DISEASE:'179',
  MODIFIED_FOOT_RISK_CATEGORY:'180',
  FOOT_PATHOLOGY:'181',
  LOPS:'182',
  FOOT_RISK_SUMMARY_PERIPHERAL_ARTERIAL_DISEASE:'183',
  HISTORY_OF_ULCER:'184',
  SMOKING:'185',
  HYPERTENSION:'186',
  DIABETES_MELLITUS:'187',
  OBESITY_BY_MBI:'188',
  CENTRAL_OBESITY:'189',
  DYSLIPIDAEMIA:'190',
  GLYCERMIA_CONTROL:'191',
  RISK_LEVEL_CATEGORY:'192'
};

const ACTION_TYPE = {
  INSERT: 'I',
  UPDATE: 'U',
  DELETE: 'D'
};

const MRAM_RISKPROFILE_ID_MAP = new Map([
  [MRAM_RISKPROFILE_RSPF_PREFIX,MRAM_RISKPROFILE_RSPF_EXAMINATION_ID]
]);

const DL_ALBUMINURIA = [
  {
    label:'[Blank]',  // default
    value:derivePara.NOT_KNOWN
  },{
    label:'(A1) Normal',
    value:derivePara.ALBUM_NORMAL_A1
  },{
    label:'(A2) Microalbuminuria',
    value:derivePara.MICRO_ALBUM_A2
  },{
    label:'(A3) Macroalbuminuria / Proteinuria',
    value:derivePara.MACRO_PROT_A3
  },{
    label:derivePara.NOT_KNOWN,
    value:derivePara.BLANK
  }
];

const MRAM_RISKPROFILE_DISPLAY_ALBUMINURIA_MAP = new Map([
  [derivePara.NOT_KNOWN, derivePara.NOT_KNOWN],
  [derivePara.ALBUM_NORMAL_A1, '(A1) Normal'],
  [derivePara.MICRO_ALBUM_A2, '(A2) Microalbuminuria'],
  [derivePara.MACRO_PROT_A3, '(A3) Macroalbuminuria / Proteinuria']
]);

const MRAM_RISKPROFILE_DISPLAY_CKD_MAP = new Map([
  [derivePara.NOT_KNOWN, derivePara.NOT_KNOWN],
  [derivePara.CKD_G1, 'G1 (Normal or high)'],
  [derivePara.CKD_G2, 'G2 (Mildly decreased)'],
  [derivePara.CKD_G3a, 'G3a (Mildly to moderately decreased)'],
  [derivePara.CKD_G3b, 'G3b (Moderately to severely decreased)'],
  [derivePara.CKD_G4, 'G4 (Severely decreased)'],
  [derivePara.CKD_G5, 'G5 (Kidney failure)']
]);

const MRAM_RISKPROFILE_DISPLAY_FOOT_RISK_MAP = new Map([
  [derivePara.NOT_KNOWN, derivePara.NOT_KNOWN],
  [derivePara.FOOT_RISK_0, '0:no LOPS/PAD/hx of ulcer/amputation'],
  [derivePara.FOOT_RISK_1, '1:LOPS or LOPS with deformity'],
  [derivePara.FOOT_RISK_2, '2:PAD or PAD with LOPS'],
  [derivePara.FOOT_RISK_3, '3:History of ulcer or amputation']
]);

export {
  ACTION_TYPE,
  MRAM_RISKPROFILE_ID_MAP,
  MRAM_RISKPROFILE_RSPF_EXAMINATION_ID,
  MRAM_RISKPROFILE_RSPF_PREFIX,
  MRAM_RISKPROFILE_DISPLAY_ALBUMINURIA_MAP,
  MRAM_RISKPROFILE_DISPLAY_CKD_MAP,
  MRAM_RISKPROFILE_DISPLAY_FOOT_RISK_MAP,
  DL_ALBUMINURIA
};