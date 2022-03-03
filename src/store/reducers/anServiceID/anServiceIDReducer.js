import * as anSvcIDTypes from '../../actions/anServiceID/anServiceID';
import Enum from '../../../enums/enum';
import _ from 'lodash';
import { ompSts, genSts, caseSts, pageSts } from '../../../enums/anSvcID/anSvcIDEnum';
import {setChCode,setChChineseName} from '../../../utilities/registrationUtilities';


export const omp = {
    clcAntIdSrc: 0,
    clcAntOmpId: 0,
    emailAddr: '',
    emailLangCd: Enum.AN_SERVICE_ID_LANGUAGE_PREFERRED.TRADITIONAL_CHINESE,
    recSts: ompSts.CURRENT,
    genSts: genSts.UNSUBSCRIBE,
    genDateTime: null
};

export const fatherInfo = {
    //isProvide: '0',
    clcFopId: 0,
    clcAntId: 0,
    engSurname: '',
    engGivName: '',
    singNameInd: 0,
    nameChi: '',
    ccCode1: '',
    ccCode2: '',
    ccCode3: '',
    ccCode4: '',
    ccCode5: '',
    ccCode6: '',
    dob: null,
    exactDateCd: Enum.DATE_FORMAT_EDMY_KEY,
    codEduLvlId: null,
    otherEduLvl: '',
    codOcpId: null,
    otherOcp:'',
    phn: ''
    //caseSts: ''
};

export const antenatalInfo = {
    clcAntIdSrc: 0,
    clcAntOmpId: 0,
    codHcinstId: '',
    antSvcId:'',
    isHaXferIn: 1,
    confirmLetterRefNum: '',
    isFopRefuse:0,
    haRefNum: '',
    isFullCase: 0,
    codInvldExpyRsnId: null,
    invldExpyRsnTxt: '',
    sts: caseSts.ACTIVE,
    clcAntSrcs:[],
    clcAntOmpDtos: [{
        clcAntIdSrc: 0,
        clcAntOmpId: 0,
        emailAddr: '',
        //emailLangCd: Enum.AN_SERVICE_ID_LANGUAGE_PREFERRED.TRADITIONAL_CHINESE,
        emailLangCd:'',
        recSts: ompSts.CURRENT,
        genSts: genSts.UNSUBSCRIBE,
        genDateTime: null
    }],
    clcFopDto: {
        clcFopId: 0,
        clcAntId: 0,
        engSurname: '',
        engGivName: '',
        singNameInd: 0,
        nameChi: '',
        ccCode1: '',
        ccCode2: '',
        ccCode3: '',
        ccCode4: '',
        ccCode5: '',
        ccCode6: '',
        dob: null,
        exactDateCd: null,
        codEduLvlId: null,
        otherEduLvl: '',
        codOcpId: null,
        otherOcp: '',
        phn: ''
    }
};

const initState = {
    // openCaseNo: false,
    // caseDialogStatus: '',
    // isAutoGen: '',
    // isNoPopup: false,
    // caseNoForm: _.cloneDeep(initCaseNoForm),
    // casePrefixList: [],
    // encounterGroupDtos: [],
    // caseCallBack: null,
    // codeListDtos: {},
    // openSelectCase: Enum.CASE_SELECTOR_STATUS.CLOSE,
    // caseSelectCallBack: null,
    // selectCaseList: null,
    // currentUpdateField: ''
    anSvcIdDialogSts: false,
    ccCodeChiChar: [],
    antenatalInfo: _.cloneDeep(antenatalInfo),
    antenatalInfoBk: _.cloneDeep(antenatalInfo),
    // omp: _.cloneDeep(omp),
    // ompBk: _.cloneDeep(omp),
    // fatherInfo: _.cloneDeep(fatherInfo),
    // fatherInfoBk: _.cloneDeep(fatherInfo),
    //isFopRefuse: 0,
    deliveryHospital: [],
    caseStsChangeRsns: [],
    pageSts: pageSts.DEFAULT,
    activeOmpIdx:0,
    anSvcIdSeq:'',
    isAssBk:0,
    antSvcIdList:[]
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case anSvcIDTypes.RESET_ALL: {
            return {...initState};
        }
        case anSvcIDTypes.UPDATE_STATE: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }
        case anSvcIDTypes.PUT_DELIVERY_HOSPITAL: {
            return {
                ...state,
                deliveryHospital: action.data
            };
        }
        case anSvcIDTypes.PUT_CASE_STS_CHANGE_REASONS: {
            return {
                ...state,
                caseStsChangeRsns: action.data
            };
        }
        default:
            return { ...state };
    }
};