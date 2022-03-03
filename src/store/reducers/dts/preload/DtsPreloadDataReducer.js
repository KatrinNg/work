import * as dtsPreloadDataActionType from '../../../actions/dts/preload/DtsPreloadDataActionType';
import * as bookingActionType from '../../../actions/dts/appointment/bookingActionType';
import _ from 'lodash';

const initState = {
    allSpecialties:[],
    anaCodeList:[],
    cncCodeList:[
        {'codCncId':10373,'category':'SPECIAL NEEDS CATEGORY','code':'1','value':'1','valueTraditionalChinese':'','valueSimplifiedChinese':'','supplementaryInformation':'','remark':''},
        {'codCncId':10493,'category':'SPECIAL NEEDS SUB-CATEGORY','code':'1.5','value':'1.5','valueTraditionalChinese':'','valueSimplifiedChinese':'','supplementaryInformation':'','remark':'Radiation Therapy to Head & Neck region'},
        {'codCncId':10489,'category':'SPECIAL NEEDS SUB-CATEGORY','code':'1.1','value':'1.1','valueTraditionalChinese':'','valueSimplifiedChinese':'','supplementaryInformation':'','remark':'Cleft Lip and Palate'},
        {'codCncId':10490,'category':'SPECIAL NEEDS SUB-CATEGORY','code':'1.2','value':'1.2','valueTraditionalChinese':'','valueSimplifiedChinese':'','supplementaryInformation':'','remark':'Severe Maxillofacial Deformity'},
        {'codCncId':10491,'category':'SPECIAL NEEDS SUB-CATEGORY','code':'1.3','value':'1.3','valueTraditionalChinese':'','valueSimplifiedChinese':'','supplementaryInformation':'','remark':'Reconstructive Surgery +/- prosthesis'}
    ],
    dtsMandatoryEncntrType:[],
    infectionControlUnavailablePeriodReasons: [],
    serveRoom: null,
    remarkType:[]
};

// dental Miki sprint 7 2020/08/13 - Start
export default (state = initState, action = {}) => {
    switch (action.type) {
        case dtsPreloadDataActionType.PUT_ALL_SPECIALTIES_SAGA: {
            let result = [];
            action.allSpecialties.forEach(sspec=>{
                let sspecCd = sspec.sspecCd;
                let sspecId = sspec.sspecId;
                let sspecName = sspec.sspecName;
                let status = sspec.status;
                result.push({'sspecCd': sspecCd, 'sspecId': sspecId, 'sspecName': sspecName, 'status':status});
            });
            console.log(result);
            return {
                ...state,
                allSpecialties: result || []
            };
        }
        case dtsPreloadDataActionType.PUT_ALL_ANA_CODE_SAGA: {
            // console.log("===========> ALL_ANA_CODE Reducer<==============");
            // console.log(action);
            let result = [];
            action.anaCodeList.forEach(ana=>{
                let codAnaId = ana.codAnaId;
                let category = ana.category;
                let code = ana.code;
                let value = ana.value || "";
                let supplementaryInformation = ana.supplementaryInformation || "";
                let remark = ana.remark || "" ;
                let valueTraditionalChinese = ana.valueTraditionalChinese || "";
                let valueSimplifiedChinese = ana.valueSimplifiedChinese || "";
                result.push({"codAnaId": codAnaId, "category": category, "code": code, "value":value, "valueTraditionalChinese":valueTraditionalChinese, "valueSimplifiedChinese":valueSimplifiedChinese, "supplementaryInformation":supplementaryInformation, "remark": remark });
            });
            return {
                ...state,
                anaCodeList: result || []
            };
        }
        case dtsPreloadDataActionType.PUT_ALL_CNC_CODE_SAGA: {
            // console.log("===========> ALL_CNC_CODE Reducer<==============");
            // console.log(action);
            let result = [];
            action.cncCodeList.forEach(cnc=>{
                let codCncId = cnc.codCncId;
                let category = cnc.category;
                let code = cnc.code;
                let value = cnc.value;
                let valueTraditionalChinese = cnc.valueTraditionalChinese || "";
                let valueSimplifiedChinese = cnc.valueSimplifiedChinese || "";
                let supplementaryInformation = cnc.supplementaryInformation || "";
                let remark = cnc.remark || "" ;
                result.push({"codCncId": codCncId, "category": category, "code": code, "value":value, "valueTraditionalChinese":valueTraditionalChinese, "valueSimplifiedChinese":valueSimplifiedChinese,"supplementaryInformation":supplementaryInformation, "remark": remark});
            });
            return {
                ...state,
                cncCodeList: result || []
            };
        }
        case dtsPreloadDataActionType.PUT_CATEGORIES_ANA_SAGA: {
            let result = [];
            action.anaCodeList.forEach(ana=>{
                let codAnaId = ana.codAnaId;
                let category = ana.category;
                let code = ana.code;
                let value = ana.value || "";
                let supplementaryInformation = ana.supplementaryInformation || "";
                let valueTraditionalChinese = ana.valueTraditionalChinese || "";
                let valueSimplifiedChinese = ana.valueSimplifiedChinese || "";
                let remark = ana.remark || "" ;
                result.push({"codAnaId": codAnaId, "category": category, "code": code, "value":value, "valueTraditionalChinese":valueTraditionalChinese, "valueSimplifiedChinese":valueSimplifiedChinese, "supplementaryInformation":supplementaryInformation,"remark": remark });
            });
            console.log(result);
            return {
                ...state,
                anaCodeList: result || []
            };
        }
        case dtsPreloadDataActionType.PUT_CATEGORIES_CNC_SAGA: {
            let result = [];
            action.cncCodeList.forEach(cnc=>{
                let codCncId = cnc.codCncId;
                let category = cnc.category;
                let code = cnc.code;
                let value = cnc.value;
                let valueTraditionalChinese = cnc.valueTraditionalChinese || "";
                let valueSimplifiedChinese = cnc.valueSimplifiedChinese || "";
                let supplementaryInformation = cnc.supplementaryInformation || "";
                let remark = cnc.remark || "" ;
                result.push({"codCncId": codCncId, "category": category, "code": code, "value":value, "valueTraditionalChinese":valueTraditionalChinese, "valueSimplifiedChinese":valueSimplifiedChinese,"supplementaryInformation":supplementaryInformation, "remark": remark});
            });
            console.log(result);
            return {
                ...state,
                cncCodeList: result || []
            };
        }
        case dtsPreloadDataActionType.GET_DTP_MAND_ETYPE_CNC_CODE_SAGA: {
            return {
                ...state,
                dtsMandatoryEncntrType: action.params
            };
        }
        case dtsPreloadDataActionType.PUT_UNAVAILABLE_PERIOD_REASONS_OF_INFECTION_CONTROL: {
            return {
                ...state,
                infectionControlUnavailablePeriodReasons: action.infectionControlUnavailablePeriodReasons || []
            };
        }
        case dtsPreloadDataActionType.PUT_ALL_REMARK_TYPE_SAGA: {
            return {
                ...state,
                remarkType: action.remarkType || []
            };
        }
        default: {
            return { ...state };
        }
    }
};
// dental Miki sprint 7 2020/08/13 - End
