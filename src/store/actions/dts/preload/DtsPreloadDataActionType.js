const PRE = 'DTS_PRELOAD';

//GET
export const GET_ALL_SPECIALTIES = `${PRE}_GET_ALL_SPECIALTIES`;
export const GET_ALL_ANA_CODE = `${PRE}_GET_ALL_ANA_CODE`;
export const GET_ALL_CNC_CODE = `${PRE}_GET_ALL_CNC_CODE`;
export const GET_DTP_MAND_ETYPE_CNC_CODE = `${PRE}_GET_DTP_MAND_ETYPE_CNC_CODE`;
export const GET_UNAVAILABLE_PERIOD_REASONS_OF_INFECTION_CONTROL =  `${PRE}_GET_UNAVAILABLE_PERIOD_REASONS_OF_INFECTION_CONTROL`;
export const GET_ALL_REMARK_TYPE = `${PRE}_GET_ALL_REMARK_TYPE`;

//POST
//find Codes in ["category1", "category2",..., "categoryN"]
export const POST_CATEGORIES_ANA = `${PRE}_POST_CATEGORIES_ANA`;
export const POST_CATEGORIES_CNC = `${PRE}_POST_CATEGORIES_CNC`;
export const POST_ALL_REMARK_TYPE = `${PRE}_POST_ALL_REMARK_TYPE`;

//RESET
export const RESET_ALL_SPECIALTIES = `${PRE}_RESET_ALL_SPECIALTIES`;
export const RESET_ALL_ANA_CODE = `${PRE}_RESET_ALL_ANA_CODE`;
export const RESET_ALL_CNC_CODE = `${PRE}_RESET_ALL_CNC_CODE`;

//SAGA PUT
export const PUT_ALL_SPECIALTIES_SAGA = `${PRE}_PUT_ALL_SPECIALTIES_SAGA`;
export const PUT_ALL_ANA_CODE_SAGA = `${PRE}_PUT_ALL_ANA_CODE_SAGA`;
export const PUT_ALL_CNC_CODE_SAGA = `${PRE}_PUT_ALL_CNC_CODE_SAGA`;
export const PUT_CATEGORIES_ANA_SAGA = `${PRE}_POST_CATEGORIES_ANA_SAGA`;
export const PUT_CATEGORIES_CNC_SAGA = `${PRE}_POST_CATEGORIES_CNC_SAGA`;
export const GET_DTP_MAND_ETYPE_CNC_CODE_SAGA = `${PRE}_GET_DTP_MAND_ETYPE_CNC_CODE_SAGA`;
export const PUT_UNAVAILABLE_PERIOD_REASONS_OF_INFECTION_CONTROL =  `${PRE}_PUT_UNAVAILABLE_PERIOD_REASONS_OF_INFECTION_CONTROL`;
export const PUT_ALL_REMARK_TYPE_SAGA = `${PRE}_PUT_ALL_REMARK_TYPE_SAGA`;
