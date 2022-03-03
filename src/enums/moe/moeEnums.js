export const ORDER_LINE_TYPE = {
    MULTIPLE_LINE: 'M',
    STEP_UP_AND_DOWN: 'S',
    SPECIAL_INTERVAL: 'R',
    ADVANCED: 'A',
    NORMAL: 'N'
};

export const DURATION_UNIT = {
    DAY: 'd',
    WEEK: 'w',
    DOSE: 's'
};

export const DANGER_DRUG_DEFAULT_VALUE = 'N';

export const DRUG_DISPLAY_NAME = {
    DISPLAY_NAME_TYPE_BAN: 'B',
    DISPLAY_NAME_TYPE_VTM: 'V',
    DISPLAY_NAME_TYPE_TRADENAME: 'T',
    DISPLAY_NAME_TYPE_ABB: 'A',
    DISPLAY_NAME_TYPE_OTHER: 'O',
    DISPLAY_NAME_TYPE_ALLERGENGROUP: 'G',
    DISPLAY_NAME_TYPE_FREE_TEXT: 'F',
    DISPLAY_NAME_TYPE_LOCAL_DRUG: 'L',
    DISPLAY_NAME_TYPE_TRADE_NAME_ALIAS: 'N',
    TYPE_NO_KNOWN_DRUG_ALLERGY: 'N',
    ALLERGEN_TYPE_FREE_TEXT_DRUG: 'O',
    ALLERGEN_TYPE_FREE_TEXT_NON_DRUG: 'X',
    ALLERGEN_TYPE_FREE_TEXT_IMPORT: 'C',
    ALLERGEN_TYPE_STRUCTURE_IMPORT: 'S',
    ALIAS_NAME_TYPE_LOCAL_DRUG: 'L'
};

export const SEARCH_MOE_DISPLAY_FIELD = 'displayString';
export const PANEL_DISPLAY_FIELD = 'vtm';

export const ALLERGY_CERTAINTY = {
    C: 'CERTAIN',
    S: 'SUSPECTED'
};

export const RESIZEHEIGHT_PANEL = {
    OUTMOST_MOEOUTER_CONTAINER: { ID: 'outmost_moeouter_container', MINUEND: (() => { return 1; }) },
    OUTMOST_MOE_DETAIL_CONTAINER: { ID: 'outmost_moe_detail_container', MINUEND: (() => { return 185; }) },
    OUTMOST_MOEINNER_CONTAINER: { ID: 'outmost_moeinner_container', MINUEND: (() => { return 60; }) },
    OUTMOST_MOE_SLIDELAYER_CONTAINER: { ID: 'outmost_moe_slayer_container', MINUEND: (() => { return 50; }) },
    OUTMOST_MOE_MYFAVER_CONTAINER: { ID: 'outmost_moe_myfaver_container', MINUEND: (() => { return 150; }) },
    OUTMOST_MOE_DEPTFAVER_CONTAINER: { ID: 'outmost_moe_deptfaver_container', MINUEND: (() => { return 150; }) },
    OUTMOST_MOE_DRUGHISTORY_CONTAINER: { ID: 'outmost_moe_drufhistory_container', MINUEND: (() => { return 150; }) },
    PRESCRIPTION: { ID: 'prescription', MINUEND: (() => { return 8 + document.querySelector('[dptid="prescription_btnPanel"]').offsetHeight; }) },
    DRUGSET: { ID: 'drugSet', MINUEND: (() => { return 16; }) }
};

//From GWT: ModuleConstant.NO_OF_ING_SHOW_ICON = 3
export const NO_OF_ING_SHOW_ICON = 3;
//From Moe1 Server: ServerConstant.DRUG_GENERIC_IND_YES = "Y"
export const DRUG_GENERIC_IND_YES = 'Y';

export const PANEL_FIELD_NAME = {
    FREQ: 'FREQ',
    // ROUTE: 'ROUTE',
    DURATION: 'DURATION',
    DURATION_UNIT: 'DURATION_UNIT',
    SITE: 'SITE'
};

export const CHECKING_TYPE = {
    MIN_DOSAGE: 'minDosage',
    MANDATORY_FIELD: 'mandatoryFields'
};

export const ADD_DRUG_ROUTE = {
    TAB: 'tab'
};

export const MOE_DRUG_STATUS = {
    DELETE: 'D',
    NORMAL: 'A'
};

export const ACTION_STATUS_TYPE = {
    DISPENSE_PHARMACY: 'Y',
    DISPENSE_CLINIC: 'D',
    ADMIN_CLINIC: 'C',
    PURCHASE_COMMUNITY: 'P',
    RECORD_ONLY: 'R'
};