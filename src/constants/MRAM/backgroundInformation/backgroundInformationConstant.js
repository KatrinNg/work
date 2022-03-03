const MRAM_BACKGROUNDINFOMATION_DM_PREFIX = 'bidm';
const MRAM_BACKGROUNDINFOMATION_HT_PREFIX = 'biht';
const MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX = 'bish';
const MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_PREFIX = 'bism';
const MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX = 'bict';


const MRAM_BACKGROUNDINFOMATION_DM_ID = {
    YEAR_OF_DIAGNOSIS_DM:'1',
    TYPE_OF_DM:'2',
    HX_OF_DKA_HHS:'3',
    FAMILY_HX_DM:'4',
    FATHER_HX:'5',
    MOTHER_HX:'6',
    SIBLING_HX:'7',
    NO_OF_AFFECTED_SIBLING:'8',
    NO_OF_TOTAL_SIBLING:'9',
    CHILDREN_HX:'10',
    NO_OF_AFFECTED_CHILDREN:'11',
    NO_OF_TOTAL_CHILDREN:'12',
    DM:'208'
  };

  const MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID = {
    ETHNICITY:'13',
    ETHNICITY_DESCRIPTION:'14',
    SMOKING:'15',
    SMOKING_DAILY_CONSUMPTION:'16',
    SMOKING_DURATION:'17',
    OCCUPATION:'18',
    OCCUPATION_DESCRIPTION:'19',
    ALCOHOL:'20',
    ALCOHOL_DESCRIPTION:'21',
    EDUCATION:'22',
    PHYSICAL_ACTIVITY_OF_MODERATE_INTENSITY:'23'
  };

  const MRAM_BACKGROUNDINFOMATION_HT_ID = {
    HT:'24',
    YEAR_OF_DIAGNOSIS_HT:'25',
    FAMILY_HX_HT:'26',
    FAMILY_HX_PREMATURE_CVD:'27'
  };

  const MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_ID = {
    SELF_MONITORING_TYPE:'28'
  };

  const MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID = {
    ANTI_DIABETIC_DRUG:'29',
    INSULIN_TREATMENT:'30',
    ANTI_HYPERTENSIVE_DRUG:'31',
    ANTI_PLATELET_DRUG:'32',
    LIPID_LOWERING_DRUG:'33',
    LIPODYSTROPHY_AT_INJECTION_SITE:'34',
    DRUG_ADHERENCE:'35',
    REMARKS:'36'
  };


 const TYPE_OF_DM = [
    {value:' ',lable:'[Blank]'},
    {value:'Type 2',lable:'Type 2' },
    {value:'Type 1',lable:'Type 1' },
    {value:'Gestational',lable:'Gestational' },
    {value:'Unclassified',lable:'Unclassified' },
    {value:'Other',lable:'Other' }
];
const SELF_MONITORING_TYPE = [
    {value:' ',lable:'[Blank]' },
    {value:'Blood',lable:'Blood' },
    {value:'Urine',lable:'Urine' },
    {value:'Both blood and urine',lable:'Both blood and urine' },
    {value:'None',lable:'None' }
];
const ETHNICITY = [
    {value:' ',lable:'[Blank]' },
    {value:'Chinese',lable:'Chinese' },
    {value:'Caucasian',lable:'Caucasian' },
    {value:'South Asian',lable:'South Asian' },
    {value:'Others (Please specify)',lable:'Others (Please specify)' }
];
const SMOKING = [
    {value:' ',lable:'[Blank]' },
    {value:'Non-smoker',lable:'Non-smoker' },
    {value:'Current smoker',lable:'Current smoker' },
    {value:'Ex-smoker',lable:'Ex-smoker' },
    {value:'Not known',lable:'Not known' }
];
const OCCUPATION = [
    {value:' ',lable:'[Blank]' },
    {value:'Housewife',lable:'Housewife' },
    {value:'Manual non-skilled',lable:'Manual non-skilled' },
    {value:'Manual skilled',lable:'Manual skilled' },
    {value:'Non-manual',lable:'Non-manual' },
    {value:'Professional / Managerial',lable:'Professional / Managerial' },
    {value:'Retired',lable:'Retired' },
    {value:'Student',lable:'Student' },
    {value:'Unemployed',lable:'Unemployed' },
    {value:'Others (Please specify)',lable:'Others (Please specify)' }
];
const ALCOHOL = [
    {value:' ',lable:'[Blank]' },
    {value:'Non-drinker',lable:'Non-drinker' },
    {value:'Social drinker',lable:'Social drinker' },
    {value:'Current drinker',lable:'Current drinker' },
    {value:'Ex-drinker',lable:'Ex-drinker' },
    {value:'Not known',lable:'Not known' }
];
const EDUCATION = [
    {value:' ',lable:'[Blank]' },
    {value:'No formal education',lable:'No formal education' },
    {value:'Primary',lable:'Primary' },
    {value:'Secondary',lable:'Secondary' },
    {value:'Tertiary',lable:'Tertiary' }
];
const PHYSICAL_ACTIVITY_OF_MODERATE_INTENSITY = [
    {value:' ',lable:'[Blank]' },
    {value:'None',lable:'None' },
    {value:'<150 mins per week',lable:'<150 mins per week' },
    {value:'At least 150 mins per week',lable:'At least 150 mins per week' }
];
const LIPODYSTROPHY_AT_INJECTION_SITES = [
    {value:' ',lable:'[Blank]' },
    {value:'Yes',lable:'Yes' },
    {value:'No',lable:'No' },
    {value:'Not applicable',lable:'Not applicable' }
];

const MRAM_BACKGROUNDINFOMATION_ID_MAP = new Map([
    [MRAM_BACKGROUNDINFOMATION_DM_PREFIX,MRAM_BACKGROUNDINFOMATION_DM_ID],
    [MRAM_BACKGROUNDINFOMATION_HT_PREFIX,MRAM_BACKGROUNDINFOMATION_HT_ID],
    [MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_PREFIX,MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_ID],
    [MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX,MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID],
    [MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX,MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID]
  ]);

export {
    MRAM_BACKGROUNDINFOMATION_DM_PREFIX,
    MRAM_BACKGROUNDINFOMATION_HT_PREFIX,
    MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX,
    MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_PREFIX,
    MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX,
    MRAM_BACKGROUNDINFOMATION_DM_ID,
    MRAM_BACKGROUNDINFOMATION_HT_ID,
    MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID,
    MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_ID,
    MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID,
    MRAM_BACKGROUNDINFOMATION_ID_MAP,
    TYPE_OF_DM,
    SELF_MONITORING_TYPE,
    ETHNICITY,
    SMOKING,
    OCCUPATION,
    ALCOHOL,
    EDUCATION,
    PHYSICAL_ACTIVITY_OF_MODERATE_INTENSITY,
    LIPODYSTROPHY_AT_INJECTION_SITES
};