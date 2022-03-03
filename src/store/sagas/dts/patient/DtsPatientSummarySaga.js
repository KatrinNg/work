import { take, call, put, select } from 'redux-saga/effects';
import * as commonUtilities from '../../../../utilities/commonUtilities';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as messageType from '../../../actions/message/messageActionType';
import * as dtsPatientSummaryActionType from '../../../actions/dts/patient/DtsPatientSummaryActionType';
import * as dentalService from '../../../../services/dts/dentalService';
import { REDIRECT_ACTION_TYPE } from '../../../../enums/dts/patient/DtsPatientSummaryEnum';
import * as CTPUtil from '../../../../utilities/ctpUtilities';
import { maskAxios } from '../../../../services/axiosInstance';
import _ from 'lodash';

function* getChangeForm() {
    while (true) {
        let { params, callback } = yield take(dtsPatientSummaryActionType.GET_CHANGE_FORM);

        //console.log('DtsPatientSummarySaga.js > getChangeForm() > ' + JSON.stringify(params));
        let { data } = yield call(dentalService.getChangeForm, params, true);

        if (data.respCode === 0) {
            // console.log('DtsPatientSummarySaga.js > getChangeForm() > callback is null => '+ (callback === null));
            callback && callback(data);
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                error: data.errMsg ? data.errMsg : 'Service error',
                data: data.data
            });
        }
    }
}

function* getPmiLabel() {
    while (true) {
        let { params } = yield take(dtsPatientSummaryActionType.GET_PMI_LABEL);
        const patientInfo = params.patientInfo;
        const doc_type = params.doc_type;

        const docNo = patientInfo.documentPairList
            .filter(mainDoc => mainDoc.isPrimary === 1)
            .map(doc => {
                const docType = doc_type.find(docType => docType.code === doc.docTypeCd);
                // if (docType.superCode === '1') {
                return dtsUtilities.maskDocNo(doc.docNo);
                // } else {
                //
                //    return doc.docTypeCd + '-' + dtsUtilities.maskDocNo(doc.docNo);
                // }
            });
        let params2 = {
            patientKey: ('' + patientInfo.patientKey).padStart(10, '0'),
            nameChi: patientInfo.nameChi || "",
            engSurname: patientInfo.engSurname || "",
            engGivename: patientInfo.engGivename || "",
            docNo: docNo[0] || ""
        };

        let { data } = yield call(dentalService.getPmiLabel, params2, true);

        if (data.respCode === 0) {
            yield put({
                type: dtsPatientSummaryActionType.UPDATE_STATE,
                updateData: { pmiBarcodeData: data.data, openDtsPrintPmiBarcodeDialog: true || [] }
            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}
function* getAddressLabel() {
    while (true) {
        let { params } = yield take(dtsPatientSummaryActionType.OPEN_PREVIEW_WINDOW);
        if (params.action === REDIRECT_ACTION_TYPE.PRINT_ADDRESS_LABEL) {
            console.log('params saga');
            console.log(params);
            const addressInfo = params.addressInfo;
            // const selectedAddressIndex = params.addressInfo[idx].selectedAddressIndex;
            let paramArray = [];
            console.log('print pmi address 123123');
            console.log(addressInfo);
            addressInfo.forEach(address => {
                console.log(address);
                // let selectedAddressIndex = address.selectedAddressIndex != undefined ? address.selectedAddressIndex : 0;
                // console.log(selectedAddressIndex);
                // console.log(address.addressList[selectedAddressIndex]);
                if (_.isEmpty(address) || address.address == "" || address.patientKey == undefined || address.patientKey == "") {
                    let param = {
                        patientKey: 0,
                        engSurname: "",
                        engGivename: "",
                        nameChi: "",
                        addressTypeCd: null,
                        room: null,
                        floor: null,
                        block: null,
                        building: null,
                        estate: null,
                        streetNo: null,
                        streetName: null,
                        subDistrictCd: null,
                        districtCd: null,
                        region: null,
                        addrTxt: null,
                        addressFormat: null,
                        postOfficeName: null,
                        postOfficeBoxNo: null,
                        postOfficeRegion: null,
                        engNameOrder: null
                    };
                    paramArray.push(param);
                    // } else if (address.address==""){
                    //     let param = {
                    //         patientKey: address.patientKey != undefined ? address.patientKey : 0,
                    //         engSurname: null,
                    //         engGivename: null,
                    //         nameChi: null,
                    //         addressTypeCd: null,
                    //         room: null,
                    //         floor: null,
                    //         block: null,
                    //         building: null,
                    //         estate: null,
                    //         streetNo: null,
                    //         streetName: null,
                    //         subDistrictCd: null,
                    //         districtCd:null,
                    //         region:null,
                    //         addrTxt:null,
                    //         addressFormat:null,
                    //         postOfficeName:null,
                    //         postOfficeBoxNo:null,
                    //         postOfficeRegion:null,
                    //         engNameOrder:null
                    //     };
                    //     paramArray.push(param);
                } else {
                    let findAddressId = address.result[address.selectedAddressIndex].addressId != undefined ? address.result[address.selectedAddressIndex].addressId : 0;
                    console.log(findAddressId);
                    let findAddressDetail = [];
                    address.addressList.forEach(addressDetailById => {
                        if (addressDetailById.addressId == findAddressId) {
                            findAddressDetail.push(addressDetailById);
                        }
                    });
                    console.log('find address detail!!!!!!');
                    console.log(findAddressDetail);
                    let param = {
                        patientKey: address.patientKey != undefined ? address.patientKey : 0,
                        engSurname: address.engSurname != undefined ? address.engSurname : null,
                        engGivename: address.engGivename != undefined ? address.engGivename : null,
                        nameChi: address.chiName != undefined ? address.chiName : null,
                        addressTypeCd: findAddressDetail[0].addressTypeCd != undefined ? findAddressDetail[0].addressTypeCd : null,
                        room: findAddressDetail[0].room != undefined ? findAddressDetail[0].room : null,
                        floor: findAddressDetail[0].floor != undefined ? findAddressDetail[0].floor : null,
                        block: findAddressDetail[0].block != undefined ? findAddressDetail[0].block : null,
                        building: findAddressDetail[0].building != undefined ? findAddressDetail[0].building : null,
                        estate: findAddressDetail[0].estate != undefined ? findAddressDetail[0].estate : null,
                        streetNo: findAddressDetail[0].streetNo != undefined ? findAddressDetail[0].streetNo : null,
                        streetName: findAddressDetail[0].streetName != undefined ? findAddressDetail[0].streetName : null,
                        subDistrictCd: findAddressDetail[0].subDistrictCd != undefined ? findAddressDetail[0].subDistrictCd : null,
                        districtCd: findAddressDetail[0].districtCd != undefined ? findAddressDetail[0].districtCd : null,
                        region: findAddressDetail[0].region != undefined ? findAddressDetail[0].region : null,
                        addrTxt: findAddressDetail[0].addrTxt != undefined ? findAddressDetail[0].addrTxt : null,
                        addressFormat: findAddressDetail[0].addressFormat != undefined ? findAddressDetail[0].addressFormat : null,
                        postOfficeName: findAddressDetail[0].postOfficeName != undefined ? findAddressDetail[0].postOfficeName : null,
                        postOfficeBoxNo: findAddressDetail[0].postOfficeBoxNo != undefined ? findAddressDetail[0].postOfficeBoxNo : null,
                        postOfficeRegion: findAddressDetail[0].postOfficeRegion != undefined ? findAddressDetail[0].postOfficeRegion : null,
                        engNameOrder: address.engNameOrder != undefined ? address.engNameOrder : 'SURN'
                    };
                    paramArray.push(param);
                    console.log('Param Array1');
                    console.log(paramArray);
                }
            });
            console.log('Param Array2');
            console.log(paramArray);

            let { data } = yield call(dentalService.getAddressLabel, paramArray, true);
            if (data.respCode === 0) {
                yield put({
                    type: dtsPatientSummaryActionType.UPDATE_STATE,
                    updateData: { pmiAddressData: data.data, dtsPreviewAddressLabelDialogOpen: true || [] }
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        }
    }
}
function* searchPatientByPatientKey() {
    while (true) {
        let { params, idx, callback } = yield take(dtsPatientSummaryActionType.SEARCH_PATIENT);
        const patientInfo = params.patientInfo;
        let { data } = yield call(dentalService.getPatient, { patientKey: patientInfo }, true);
        if (data.respCode === 0) {
            console.log('DATATATATATAT');
            console.log(data);
            if (data.data.addressList && data.data.addressList.length > 0) {
                const addressLabel = {
                    chiName: data.data.nameChi ? data.data.nameChi : "",
                    engSurname: data.data.engSurname ? data.data.engSurname : "",
                    engGivename: data.data.engGivename ? data.data.engGivename : "",
                    addressList: data.data.addressList ? data.data.addressList : []
                };
                yield put({ type: dtsPatientSummaryActionType.SEARCH_PATIENT_SAGA, patientKey: patientInfo, addressLabel: addressLabel, idx: idx });

                if (callback) {
                    callback();
                }
            } else if (data.data.addressList == undefined || data.data.addressList.length == 0) {
                const addressLabel = {
                    chiName: data.data.nameChi ? data.data.nameChi : "",
                    engSurname: data.data.engSurname ? data.data.engSurname : "",
                    engGivename: data.data.engGivename ? data.data.engGivename : "",
                    addressList: data.data.addressList ? data.data.addressList : []
                };
                yield put({ type: dtsPatientSummaryActionType.SEARCH_PATIENT_SAGA, patientKey: patientInfo, addressLabel: addressLabel, idx: idx });

                if (callback) {
                    callback();
                }
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '140005'
                    }
                });
            } else if (data.respCode === 1) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '140005'
                    }
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        }
    }
}
function* getDH65Label() {
    while (true) {
        let { params } = yield take(dtsPatientSummaryActionType.GET_DH65_LABEL);
        // console.log('=====> DtsPatientSummarySaga.js ==> getDH65Label');
        // console.log('=====> DtsPatientSummarySaga.js ==> getDH65Label() > ' + JSON.stringify(params));
        const patientInfo = params.patientInfo;
        const commonCodeList = params.commonCodeList;
        const relationshipList = commonCodeList && commonCodeList.relationship;
        const selectedRoom = params.selectedRoom;
        const doc_type = commonCodeList && commonCodeList.doc_type;
        const rooms = params.rooms || [];
        const defaultRoom = rooms && rooms.find(item => item.rmId === params.defaultRoomId);

        const _contactPer = patientInfo.contactPersonList || [];
        let relationship = null;
        let contactPersonName = null;
        if (!_.isEmpty(_contactPer)) {
            relationship = relationshipList && relationshipList.find(item => item.code === _contactPer[0]['relationshipCd']);
            contactPersonName = commonUtilities.getFullName(_contactPer[0]['engSurname'], _contactPer[0]['engGivename']);
        }
        let tempDob = patientInfo.dob + "";
        tempDob = tempDob.split("-").reverse().join("-");

        let params2 = {
            patientKey: patientInfo.patientKey.toString().padStart(10, '0'),
            engSurname: patientInfo.engSurname || "",
            engGivename: patientInfo.engGivename || "",
            chiName: patientInfo.nameChi || "",
            room: selectedRoom || "",
            gender: patientInfo.genderCd || "",
            pensioner: patientInfo.isPnsn || 0,
            address: params.address || "",
            dob: tempDob || "",
            statusCd: patientInfo.patientSts || "O",
            contactPersonRelationship: relationship && relationship.engDesc || "",
            contactPersonName: contactPersonName || "",
            contactPersonDocNo: 'E1234567'
        };
        console.log(params2);
        patientInfo.documentPairList
            .filter(mainDoc => mainDoc.isPrimary === 1)
            .map(doc => {
                const docType = doc_type.find(docType => docType.code === doc.docTypeCd);
                params2 = { ...params2, docNo: doc.docNo };
                if (docType.superCode !== '1') {
                    params2 = { ...params2, docType: doc.docTypeCd };
                }
            });

        //console.log('=====> DtsPatientSummarySaga.js ==> getDH65Label() > params2 > ' + JSON.stringify(params2));

        const _patientPhones = patientInfo.phoneList ? patientInfo.phoneList : [];
        if (_patientPhones.length > 0) {
            for (let i = 0; i < _patientPhones.length; i++) {
                const phoneNo = _patientPhones[i].phoneNo;
                switch (_patientPhones[i].phoneTypeCd) {
                    case 'M':
                        params2 = { ...params2, mobile: phoneNo.substr(0, 4) + " " + phoneNo.substr(4, 4) };
                        break;
                    case 'H':
                        params2 = { ...params2, home: phoneNo.substr(0, 4) + " " + phoneNo.substr(4, 4) };
                        break;
                    case 'O':
                        params2 = { ...params2, office: phoneNo.substr(0, 4) + " " + phoneNo.substr(4, 4) };
                        break;
                    case 'F':
                        params2 = { ...params2, fax: phoneNo.substr(0, 4) + " " + phoneNo.substr(4, 4) };
                        break;
                    case 'T':
                        params2 = { ...params2, other: phoneNo.substr(0, 4) + " " + phoneNo.substr(4, 4) };
                        break;
                    case 'MSMS':
                        break;
                }
            }
        }

        //console.log('=====> DtsPatientSummarySaga.js ==> getDH65Label() > addPhones > ' + JSON.stringify(params2));

        let { data } = yield call(dentalService.getDH65Label, params2, true);

        //console.log('=====> DtsPatientSummarySaga.js ==> getDH65Label() > after dentalService.getDH65Label > data > ' + JSON.stringify(data));

        if (data.respCode === 0) {
            yield put({
                type: dtsPatientSummaryActionType.UPDATE_STATE,
                updateData: { dh65LabelData: data.data, openDtsPrintDH65LabelDialog: true || [] }
            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

// dental Miki sprint 8 2020/08/19 - Start
function* getPmiAppointmentLabel() {
    while (true) {
        let { params } = yield take(dtsPatientSummaryActionType.GET_APPOINTMENT_LABEL);
        console.log("====================== getPmiAppointmentLabel param ======================");
        console.log(params);

        let appointmentLabelData = {
            appointmentDate: params.appointmentDate || "",
            appointmentTime: params.appointmentTime || "",
            encntrTypeDesc: params.encntrTypeDesc || "",
            rmCd: params.rmCd || "",
            engSurname: params.engSurname || "",
            engGivename: params.engGivename || "",
            otherDocNo: params.otherDocNo || ""
        };
        console.log(appointmentLabelData);
        let { data } = yield call(dentalService.getPmiAppointmentLabel, appointmentLabelData, true);
        console.log(data);
        if (data.respCode === 0) {
            yield put({
                type: dtsPatientSummaryActionType.UPDATE_STATE,
                updateData: { pmiAppointmentLabelData: data.data, openDtsPrintPmiAppointmentDialog: true || [] }
            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

function* getPmiAppointmentSlip() {
    while (true) {
        let { params } = yield take(dtsPatientSummaryActionType.GET_APPOINTMENT_SLIP);
        console.log("====================== getPmiAppointmentSlip param ======================");
        console.log(params);

        let appointmentSlipData = {
            address: params.address || " ",
            appointments: params.appointments || [{
                "dateAndTime": "01-02-2021 08:45 AM/上午 Mon/星期一",
                "encType": "recall",
                "remark": "",
                "rmCd": "S01"
            },
            {
                "dateAndTime": "02-02-2021 10:30 AM/上午 Tue/星期二",
                "encType": "consultation",
                "remark": "",
                "rmCd": "S01"
            },
            {
                "dateAndTime": "03-02-2021 16:30 PM/下午 Wed/星期三",
                "encType": "consultation",
                "remark": "",
                "rmCd": "S01"
            },
            {
                "dateAndTime": "04-02-2021 14:00 PM/下午 Thu/星期四",
                "encType": "consultation",
                "remark": "",
                "rmCd": "S01"
            }],
            clinicAddress: params.clinicAddress || " ",
            clinicName: params.clinicName || " ",
            fax: params.fax || " ",
            tel: params.tel || " ",
            remarks: params.remarks || " ",
            patientKey:params.patientKey || "",
            engSurname: params.engSurname || " ",
            engGivename: params.engGivename || " ",
            chiName: params.chiName || " ",
            emailAddr: params.emailAddr
        };
        console.log(appointmentSlipData);
        let { data } = yield call(dentalService.getAppointmentSlip, appointmentSlipData, true);
        console.log(data);
        if (data.respCode === 0) {
            yield put({
                type: dtsPatientSummaryActionType.UPDATE_STATE,
                updateData: { appointmentSlipData: data.data, openDtsAppointmentSlipFormDialog: true || [] }
            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

function* getEncounterHistory() {
    while (true) {
        let { params } = yield take(dtsPatientSummaryActionType.GET_ENCOUNTER_HISTORY);
        let flwupUrl = '/ana/Encounter?';
        for (let flwP in params) {
            flwupUrl += `${flwP}=${params[flwP]}&`;
        }
        flwupUrl = flwupUrl.substring(0, flwupUrl.length - 1);
        let { data } = yield call(maskAxios.get, flwupUrl);

        const service = yield select(state => state.common.serviceList);
        const clinic = yield select(state => state.common.clinicList);
        if (data.respCode === 0) {
            const encntrTypes = yield select(state => state.common.encounterTypes);
            let flwUpList = CTPUtil.loadFlwUp(data.data.list, service, clinic, encntrTypes);
            yield put({
                type: dtsPatientSummaryActionType.UPDATE_STATE,
                updateData: { encounterHistory: flwUpList || [] }
            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}
// dental Miki sprint 8 2020/08/19 - End
export const dtsPatientSummarySaga = [getChangeForm, getPmiLabel, getAddressLabel, searchPatientByPatientKey, getDH65Label, getPmiAppointmentLabel, getPmiAppointmentSlip, getEncounterHistory];
