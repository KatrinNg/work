import { take, call, put } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as patientActionType from '../../../actions/dts/patient/DtsPatientActionType';
import * as messageType from '../../../actions/message/messageActionType';
import { REDIRECT_ACTION_TYPE } from '../../../../enums/dts/patient/DtsPatientSummaryEnum';
import _ from 'lodash';

function* fetchPreviewData() {
    while (true) {
        let { params } = yield take(patientActionType.OPEN_PREVIEW_WINDOW);
        if (params.action === REDIRECT_ACTION_TYPE.PRINT_PMI_BARCODE) {
            const patientInfo = params.patientInfo;
            const doc_type = params.doc_type;

            const docNo = patientInfo.documentPairList
                .filter(mainDoc => mainDoc.isPrimary === 1)
                .map(doc => {
                    const docType = doc_type.find(docType => docType.code === doc.docTypeCd);
                    if (docType.superCode === '1') {
                        return doc.docNo;
                    } else {
                        return doc.docTypeCd + '-' + doc.docNo;
                    }
                });
            let params2 = {
                patientKey: patientInfo.patientKey,
                nameChi: patientInfo.nameChi,
                engSurname: patientInfo.engSurname,
                engGivename: patientInfo.engGivename,
                docNo: docNo[0]
            };

            let { data } = yield call(maskAxios.post, '/dts-ana/reports/patient/pmiBarcodeLabel', params2);
            if (data.respCode === 0) {
                yield put({
                    type: patientActionType.UPDATE_STATE,
                    updateData: { pmiBarcodeData: data.data, dtsDtsPrintPmiBarcodeDialogOpen: true || [] }
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        } else if (params.action === REDIRECT_ACTION_TYPE.PRINT_ADDRESS_LABEL) {
            console.log("params saga");
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
                if (_.isEmpty(address)) {
                    let param = {
                        patientKey: 0,
                        engSurname: null,
                        engGivename: null,
                        nameChi: null,
                        addressTypeCd: null,
                        room: null,
                        floor: null,
                        block: null,
                        building: null,
                        estate: null,
                        streetNo: null,
                        streetName: null
                    };
                    paramArray.push(param);
                } else {
                    let findAddressId = address.result[address.selectedAddressIndex].addressId != undefined ? address.result[address.selectedAddressIndex].addressId : 0;
                    console.log(findAddressId);
                    let findAddressDetail = [];
                    address.addressList.forEach(addressDetailById => {
                        if (addressDetailById.addressId == findAddressId) {
                            findAddressDetail.push(addressDetailById);
                        }
                    });
                    console.log("find address detail!!!!!!");
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
                        streetName: findAddressDetail[0].streetName != undefined ? findAddressDetail[0].streetName : null
                    };
                    // let param = {
                    //     patientKey: address.patientKey != undefined ? address.patientKey : 0,
                    //     engSurname: address.engSurname != undefined ? address.engSurname : null,
                    //     engGivename: address.engGivename != undefined ? address.engGivename : null,
                    //     nameChi: address.chiName  != undefined ? address.chiName : null,
                    //     addressTypeCd: address.addressList[address.selectedAddressIndex].addressTypeCd != undefined ? address.addressList[address.selectedAddressIndex].addressTypeCd : null,
                    //     room: address.addressList[address.selectedAddressIndex].room != undefined ? address.addressList[address.selectedAddressIndex].room : null,
                    //     floor: address.addressList[address.selectedAddressIndex].floor != undefined ? address.addressList[address.selectedAddressIndex].floor : null,
                    //     block: address.addressList[address.selectedAddressIndex].block != undefined ? address.addressList[address.selectedAddressIndex].block : null,
                    //     building: address.addressList[address.selectedAddressIndex].building != undefined ? address.addressList[address.selectedAddressIndex].building : null,
                    //     estate: address.addressList[address.selectedAddressIndex].estate != undefined ? address.addressList[address.selectedAddressIndex].estate : null,
                    //     streetNo: address.addressList[address.selectedAddressIndex].streetNo != undefined ? address.addressList[address.selectedAddressIndex].streetNo : null,
                    //     streetName: address.addressList[address.selectedAddressIndex].streetName != undefined ? address.addressList[address.selectedAddressIndex].streetName : null
                    // };
                    paramArray.push(param);
                    console.log("Param Array1");
                    console.log(paramArray);
                }
            });

            //     const firstPatient = [{
            //         patientKey: patientInfo.patientKey,
            //         nameChi: patientInfo.nameChi,
            //         engSurname: patientInfo.engSurname,
            //         engGivename: patientInfo.engGivename
            //     }
            // ];
            console.log("Param Array2");
            console.log(paramArray);

            let { data } = yield call(maskAxios.post, '/dts-ana/reports/patient/pmiAddressLabel', paramArray);
            if (data.respCode === 0) {
                yield put({
                    type: patientActionType.UPDATE_STATE,
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
        let { params, idx, callback } = yield take(patientActionType.SEARCH_PATIENT);
        const patientInfo = params.patientInfo;
        let { data } = yield call(maskAxios.post, '/patient/getPatient', { patientKey: patientInfo });
        if (data.respCode === 0) {
            console.log("DATATATATATAT");
            console.log(data);
            const addressLabel = {
                chiName: data.data.nameChi,
                engSurname: data.data.engSurname,
                engGivename: data.data.engGivename,
                addressList: data.data.addressList
            };
            yield put({ type: patientActionType.SEARCH_PATIENT_SAGA, patientKey: patientInfo, addressLabel: addressLabel, idx: idx });

            if (callback) {
                callback();
            }

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

export const dtsPatientSaga = [fetchPreviewData, searchPatientByPatientKey];
