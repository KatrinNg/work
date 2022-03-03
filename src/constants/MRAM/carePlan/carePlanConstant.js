
const MRAM_CARE_PLAN_PREFIX = 'capl';

const MRAM_CARE_PLAN_ID = {
    RISK_LEVEL_CATEGORY:'193',
    DIETITIAN:'194',
    PODIARTRIST:'195',
    NURSE_EDUCATION:'196',
    OPHTHALMOLOGIST:'197',
    PATIENT_EMPOWERMENT_PROGRAMME:'198',
    NAHC_WOUND_CARE:'199',
    PATIENT_SUPPORT_CALL_CENTRE:'200',
    SMOKING_COUNSELLING_CESSATION_PROGRAMME:'201',
    MANAGEMENT_CARE_PLAN:'202',
    REMARKS:'203'
  };

const RISK_LEVEL_CATEGORY= [
    {value:' ',lable:'[Blank]' },
    {value:'Low risk',lable:'Low risk' },
    {value:'Medium risk',lable:'Medium risk' },
    {value:'High risk',lable:'High risk' },
    {value:'Very high risk',lable:'Very high risk' },
    {value:'Not known',lable:'Not known' }
];

const MRAM_CARE_PLAN_ID_MAP = new Map([
    [MRAM_CARE_PLAN_PREFIX,MRAM_CARE_PLAN_ID]
  ]);

export {
    MRAM_CARE_PLAN_PREFIX,
    MRAM_CARE_PLAN_ID,
    MRAM_CARE_PLAN_ID_MAP,
    RISK_LEVEL_CATEGORY
};