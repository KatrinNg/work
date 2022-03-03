import * as dtsPatientSummaryActionType from '../../../actions/dts/patient/DtsPatientSummaryActionType';
import _ from 'lodash';

const INITIAL_STATE = {
    redirect: {
        appointmentId: null,
        action: null
    },
    pmiBarcodeData: null,
    pmiAddressData: null,
    pmiAppointmentLabelData: null, //DH Miki
    appointmentSlipData: null, //DH Miki sprint 8 04-09-2020
    openDtsPrintAppointmentSlipDialog: false,//DH Miki sprint 8 04-09-2020
    openDtsPrintPmiBarcodeDialog: false,
    openDtsPrintPmiAddressDialog: false,
    dtsDtsPrintPmiAddressDialogOpen: false,
    openDtsPrintPmiAppointmentDialog: false,
    addressLabelList: [
        {},{},{},{},{},{},{},{},
        {},{},{},{},{},{},{},{}
    ],
    addressLabel: {
        patientKey:'',
        nameChi: '',
        engSurname:'',
        engGivename:'',
        engNameOrder:'',
        addressList: []
    },
	dh65LabelData: null,
    openDtsPrintDH65LabelDialog: false,
    openDtsAppointmentSlipFormDialog:false,//DH Miki sprint 8 04-09-2020
    encounterHistory:[]//DH Miki 08-10-2020
};

export default (state = INITIAL_STATE, action = {}) => {
    switch (action.type) {
        case dtsPatientSummaryActionType.RESET_ALL: {
            return ({ ...INITIAL_STATE });
        }
        case dtsPatientSummaryActionType.UPDATE_STATE: {
            return {
                ...state,
                ...action.updateData
            };
        }
        case dtsPatientSummaryActionType.SET_REDIRECT: {
            let lastAction = { ...state };
            lastAction['redirect'] = { ...lastAction['redirect'], ...action.params };
            return lastAction;
        }
        case dtsPatientSummaryActionType.SET_ADDRESS_LABEL_LIST: {
            let lastAction = {...state};
            lastAction.addressLabelList = action.params;
            return lastAction;
        }
        case dtsPatientSummaryActionType.SET_ADDRESS_LABEL: {
            console.log(JSON.stringify(action));
            let lastAction = {...state};
            let temp = [...lastAction.addressLabelList];
            temp[action.idx] = action.addressLabel;
            // temp[action.idx].address = action.addressValue;
            // temp[action.idx].selectedAddressIndex = action.addressIdx;
            // temp[action.idx].patientKey = action.patientKey;
            // temp[action.idx].engNameOrder = action.engNameOrder;
            lastAction.addressLabelList = [...temp];

            console.log(JSON.stringify(temp[action.idx]));
            return lastAction;
        }
        case dtsPatientSummaryActionType.SEARCH_PATIENT_SAGA: {
            console.log('dtsPatientSummaryActionType.SEARCH_PATIENT_SAGA');
            let lastAction = {...state};
            let temp = [...lastAction.addressLabelList];
            console.log(JSON.stringify(temp));
            let addressDetail = action.addressLabel;
            console.log(JSON.stringify(addressDetail));
            let result = [];

            if(addressDetail.addressList != undefined){
                addressDetail.addressList.forEach(address => {
                    console.log('address detail');
                    console.log(address);
                    if (address.addressTypeCd == "C" && address.addressFormat=="L") {
                        let temp = "";
                        let room = address.room ? (address.room) : "";
                        let floor = address.floor ? (address.room ? (", "+ address.floor) : address.floor ) : "";
                        let block = address.block ? ((address.room||address.floor) ? (", "+ address.block) : address.block ) : "";
                        let building = address.building ? (address.building) :"";
                        let estate = address.estate ? ((address.building) ? (", "+ address.estate) : address.estate ):"";
                        let streetNo = address.streetNo ? ((address.building || address.estate) ? (", "+ address.streetNo ) : address.streetNo ):"";
                        let streetName = address.streetName ? ((address.building || address.estate || address.streetNo)? (", "+ address.streetName ) : address.streetName ):"";
                        let subDistrictCd = address.subDistrictCd ? address.subDistrictCd :"";
                        let districtCd = address.districtCd ? ((address.subDistrictCd) ? (", "+address.districtCd) : address.districtCd):"";
                        let region = address.region ? ((address.subDistrictCd || address.districtCd)? (", "+ address.region) : address.region):"";

                        let firstline = (room+floor+block!="") ? (room + floor + block + "\n"):"";
                        let secondline = (building+estate+streetNo+streetName!="" ) ? (building + estate + streetNo + streetName + "\n") : "";
                        let thirdline = (subDistrictCd+districtCd+region!="" ) ? (subDistrictCd + districtCd + region ) : "";

                        temp = firstline + secondline + thirdline;
                        result.push({ 'addressId': address.addressId, 'fullAddress': temp });
                        console.log(JSON.stringify(result));
                    } else if (address.addressTypeCd == "C" && address.addressFormat=="P"){
                        let temp = "";
                        let postOfficeName = address.postOfficeName ? (address.postOfficeName) : "";
                        let postOfficeBoxNo = address.postOfficeBoxNo ? (address.postOfficeName ? ("\n"+ address.postOfficeBoxNo) : address.postOfficeBoxNo ) : "";
                        let postOfficeRegion = address.postOfficeRegion ? ((address.postOfficeName||address.postOfficeBoxNo) ? ("\n"+ address.postOfficeRegion) : address.postOfficeRegion ) : "";
                        
                        temp = postOfficeName + postOfficeBoxNo + postOfficeRegion;
                        result.push({ 'addressId': address.addressId, 'fullAddress': temp });
                        console.log(JSON.stringify(result));
                    } else if (address.addressTypeCd == "C" && address.addressFormat=="F"){
                        let temp = "";
                        let addrTxt = address.addrTxt ? (address.addrTxt) : "";
                        temp = addrTxt ;
                        result.push({ 'addressId': address.addressId, 'fullAddress': temp });
                        console.log(JSON.stringify(result));
                    }
                });
            }
            else{
                result = null;
            }
            console.log("222 "+JSON.stringify(result));
            addressDetail.patientKey = action.patientKey;
            addressDetail.result = result;
            addressDetail.address = (addressDetail.result.length == 1) ? addressDetail.result[0].fullAddress : '';
            addressDetail.selectedAddressIndex = 0;

            console.log(JSON.stringify(addressDetail));
            temp.splice(action.idx, 1, addressDetail);
            lastAction.addressLabelList = [...temp];
            return lastAction;
        }
        default: {
            return { ...state };
        }
    }
};
