const MRAM_EYES_PREFIX = 'easm';
const MRAM_EYES_OTHER_INFORMATION_PREFIX = 'eaoi';

const MRAM_EYES_ID = {
  RIGHT_EYE_MYDRIATIC_USED:'68',
  LEFT_EYE_MYDRAIATIC_USED:'69',
  RIGHT_EYE_HX_OF_GLAUCOMA:'70',
  LEFT_EYE_HX_OF_GLAUCOMA:'71',
  RIGHT_EYE_BEST_VISUAL_ACUITY:'72',
  LEFT_EYE_BEST_VISUAL_ACUITY:'73',
  RIGHT_EYE_PRESENCE_OF_CATARACT:'74',
  LEFT_EYE_PRESENCE_OF_CATARACT:'75',
  RIGHT_EYE_CATARACT_EXTRACTED:'76',
  LEFT_EYE_CATARACT_EXTRACTED:'77',
  RIGHT_EYE_GRADABLE_FUNDUS_PHOTO:'78',
  LEFT_EYE_GRADABLE_FUNDUS_PHOTO:'79',
  RIGHT_EYE_MACULOPATHY:'80',
  LEFT_EYE_MACULOPATHY:'81',
  RIGHT_EYE_TRACTIONAL_RETINAL_DETACHMENT:'82',
  LEFT_EYE_TRACTIONAL_RETINAL_DETACHMENT:'83',
  RIGHT_EYE_NEOVASCULAR_GLAUCOMA:'84',
  LEFT_EYE_NEOVASCULAR_GLAUCOMA:'85',
  RIGHT_EYE_GRADE_OF_DIABETIC_RETINOPATHY:'86',
  LEFT_EYE_GRADE_OF_DIABETIC_RETINOPATHY:'87',
  RIGHT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY:'88',
  LEFT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY:'89',
  RIGHT_EYE_LASER_FOR_RETINOPATHY_OR_MACULOPATHY:'90',
  LEFT_EYE_LASER_FOR_RETINOPATHY_OR_MACULOPATHY:'91',
  RIGHT_EYE_VITRECTOMY:'92',
  LEFT_EYE_VITRECTOMY:'93',
  RIGHT_EYE_ANTIVEGF_RX:'94',
  LEFT_EYE_ANTIVEGF_RX:'95'
};

const MRAM_EYES_OTHER_INFORMATION_ID = {
  EYE_ASSESSED_BY:'96',
  EYE_ASSESSSMENT_DATE:'97',
  EYE_ASSESSMENT_PHYSICIANEXAMINER_NAME:'98',
  DIABETIC_RETINOPATHY_SUMMARY:'99',
  CURRENTLY_OPHTHALMOLOGIST_FU:'100',
  REMARKS:'101'
};

const DERIVING_RULE_DIABETIC_RETINOPATHY_SUMMARY_RELATED_ITEM_IDS = [
  MRAM_EYES_ID.RIGHT_EYE_GRADE_OF_DIABETIC_RETINOPATHY, MRAM_EYES_ID.LEFT_EYE_GRADE_OF_DIABETIC_RETINOPATHY,
  MRAM_EYES_ID.RIGHT_EYE_MACULOPATHY, MRAM_EYES_ID.LEFT_EYE_MACULOPATHY,
  MRAM_EYES_ID.RIGHT_EYE_TRACTIONAL_RETINAL_DETACHMENT, MRAM_EYES_ID.LEFT_EYE_TRACTIONAL_RETINAL_DETACHMENT,
  MRAM_EYES_ID.RIGHT_EYE_NEOVASCULAR_GLAUCOMA, MRAM_EYES_ID.LEFT_EYE_NEOVASCULAR_GLAUCOMA,
  MRAM_EYES_ID.RIGHT_EYE_LASER_FOR_RETINOPATHY_OR_MACULOPATHY,MRAM_EYES_ID.LEFT_EYE_LASER_FOR_RETINOPATHY_OR_MACULOPATHY,
  MRAM_EYES_ID.RIGHT_EYE_VITRECTOMY,MRAM_EYES_ID.LEFT_EYE_VITRECTOMY,
  MRAM_EYES_ID.RIGHT_EYE_ANTIVEGF_RX,MRAM_EYES_ID.LEFT_EYE_ANTIVEGF_RX
];

const MRAM_EYES_ID_MAP = new Map([
  [MRAM_EYES_PREFIX,MRAM_EYES_ID],
  [MRAM_EYES_OTHER_INFORMATION_PREFIX,MRAM_EYES_OTHER_INFORMATION_ID]
]);

const DL_GRADE_OF_DIABETIC_RETINOPATHY = [
  {
    label:'[Blank]',
    value:'[Blank]'
  },{
    label:'No DR',
    value:'No DR'
  },{
    label:'Mild NPDR',
    value:'Mild NPDR'
  },{
    label:'Moderate NPDR',
    value:'Moderate NPDR'
  },{
    label:'Severe NPDR',
    value:'Severe NPDR'
  },{
    label:'PDR',
    value:'PDR'
  }
];

const DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY = [
  {
    label:'[Blank]',
    value:'[Blank]'
  },{
    label:'No HR',
    value:'No HR'
  },{
    label:'Mild HR',
    value:'Mild HR'
  },{
    label:'Moderate HR',
    value:'Moderate HR'
  },{
    label:'Severe HR',
    value:'Severe HR'
  }
];

const DL_ACCESSED_BY = [
  {
    label:'[Blank]',
    value:'[Blank]'
  },{
    label:'N/A (please specify in Remarks)',
    value:'N/A (please specify in Remarks)'
  },{
    label:'Fundoscopy by physician',
    value:'Fundoscopy by physician'
  },{
    label:'Fundus photo reviewed by physician',
    value:'Fundus photo reviewed by physician'
  },{
    label:'Ophthalmologist',
    value:'Ophthalmologist'
  },{
    label:'Optometrist',
    value:'Optometrist'
  }
];

const DL_DIABETIC_RETINOPATHY_SUMMARY = [
  {
    label:'[Blank]',
    value:' '
  },{
    label:'No retinopathy',
    value:'No retinopathy'
  },{
    label:'Non sight threatening retinopathy',
    value:'Non sight threatening retinopathy'
  },{
    label:'Sight threatening retinopathy',
    value:'Sight threatening retinopathy'
  },{
    label:'Advanced DM Eye Disease',
    value:'Advanced DM Eye Disease'
  },{
    label:'Not known',
    value:'Not known'
  }
];

const RANGE_BEST_VISUAL_ACUITY = {
  minVal: 0,
  maxVal: 2
};

export {
  MRAM_EYES_ID_MAP,
  MRAM_EYES_OTHER_INFORMATION_PREFIX,
  MRAM_EYES_PREFIX,
  MRAM_EYES_ID,
  MRAM_EYES_OTHER_INFORMATION_ID,
  DL_GRADE_OF_DIABETIC_RETINOPATHY,
  DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY,
  DL_ACCESSED_BY,
  DL_DIABETIC_RETINOPATHY_SUMMARY,
  RANGE_BEST_VISUAL_ACUITY,
  DERIVING_RULE_DIABETIC_RETINOPATHY_SUMMARY_RELATED_ITEM_IDS
};