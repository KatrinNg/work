import React from 'react';
import { connect } from 'react-redux';
import { Grid, Typography } from '@material-ui/core';
import moment from 'moment';
import memoize from 'memoize-one';
import _ from 'lodash';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import CommonRegex from '../../../../constants/commonRegex';
import { updateState, getEncounterTypeListBySite, getSessionList } from '../../../../store/actions/appointment/booking/bookingAnonymousAction';
import {
    openCommonCircular,
    closeCommonCircular,
    getRoomsEncounterTypeList
} from '../../../../store/actions/common/commonAction';
import { deleteTabs } from '../../../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import BookAnonFormBasic from './bookForm/bookAnonFormBasic';
import BookAnonBtnGrp from './bookForm/bookAnonBtnGrp';
import { CommonUtil, AppointmentUtil, EnctrAndRmUtil } from '../../../../utilities';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';

import PhoneField from '../../../registration/component/phones/phoneField';
import Enum,{filterRoomsEncounterTypeSvc} from '../../../../enums/enum';
import FieldConstant from '../../../../constants/fieldConstant';

class BookAnonForm extends React.Component {

    handleOnChange = (name, value) => {
        const { serviceCd, encounterTypes, encntrGrpList } = this.props;
        let bookingData = _.cloneDeep(this.props.bookingData);
        bookingData[name] = value;
        if (name === 'siteId') {
            bookingData[name] = value;
            bookingData.rmId = '';
            bookingData.rmCd = '';
            bookingData.subEncounterTypeCd = '';
            bookingData.encounterTypeId = '';
            bookingData.encounterTypeCd = '';
            bookingData.appointmentDate = moment();
            bookingData.appointmentTime = moment();
            bookingData.elapsedPeriod = '';
            bookingData.elapsedPeriodUnit = '';
            bookingData.sessId = '';
            bookingData.encntrGrpCd='';
            this.props.updateState({ bookingData });
            if(filterRoomsEncounterTypeSvc.indexOf(serviceCd) > -1){
                this.props.getRoomsEncounterTypeList({params:{siteId:value}});
            }else{
                this.props.getEncounterTypeListBySite(serviceCd, value);
            }
            this.props.getSessionList(value);
            return;
        }

        if (name === 'encounterTypeCd') {
            let encounterSelected = bookingData.encounterTypeList.find(item => item.encounterTypeCd === value) || null;
            bookingData.encounterTypeId = encounterSelected ? encounterSelected.encntrTypeId : '';
            bookingData['caseTypeCd'] = CommonUtil.getCaseTypeCd(encounterTypes, bookingData.encounterTypeId);
            const _encntrList = _.cloneDeep(bookingData.encounterTypeList);
            if (encounterSelected) {
                const _rooms = _.cloneDeep(encounterSelected.subEncounterTypeList || null);
                const defaultRoom = AppointmentUtil.getDefaultRoom({
                    encntrId: encounterSelected.encntrTypeId,
                    rooms: _rooms,
                    siteId: bookingData.siteId
                });
                if (defaultRoom) {
                    bookingData.rmId = defaultRoom.rmId;
                    bookingData.rmCd = defaultRoom.subEncounterTypeCd;
                    bookingData.subEncounterTypeCd = defaultRoom.subEncounterTypeCd;
                } else {
                    bookingData.rmId = '';
                    bookingData.subEncounterTypeCd = '';
                    bookingData.rmCd = '';
                }
                bookingData.appointmentDate=null;
                bookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(bookingData, bookingData.encounterTypeId, _encntrList);
                bookingData = AppointmentUtil.getEncntrGrpByEncntrId(bookingData.encounterTypeId, _.cloneDeep(bookingData));
            }
        }

        if (name === 'invertedEncounterTypeCd'){
            const _roomsEncounterList = _.cloneDeep(this.props.roomsEncounterList);
            const getCurrentRooms = _roomsEncounterList.find(item => item.rmCd === bookingData.subEncounterTypeCd);
            const getCurrentEncounter = getCurrentRooms?.encounterTypeDtoList.find(item => item.encntrTypeCd === value);
            bookingData['caseTypeCd'] = CommonUtil.getCaseTypeCdByRoomEncounter(getCurrentEncounter, bookingData.encounterTypeId);
            if(getCurrentEncounter){
                bookingData.encounterTypeCd = value;
                bookingData.encounterTypeId = getCurrentEncounter.encntrTypeId;
                bookingData.appointmentDate=null;
                bookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(bookingData, bookingData.encounterTypeId, getCurrentEncounter, 'inverted');
                bookingData = AppointmentUtil.getEncntrGrpByEncntrId(bookingData.encounterTypeId, _.cloneDeep(bookingData));
            }
        }

        if (name === 'subEncounterTypeCd') {
            const encounterDto = (bookingData.encounterTypeList||[]).find(x => x.encntrTypeId === bookingData.encounterTypeId);
            bookingData.subEncounterTypeCd = '';
            bookingData.rmId = '';
            bookingData.rmCd = '';
            if(bookingData.encounterTypeId && encounterDto) {
                const subEncounterSelected = encounterDto.subEncounterTypeList.find(item => item.subEncounterTypeCd === value);
                if(subEncounterSelected) {
                    bookingData.subEncounterTypeCd = value;
                    bookingData.rmCd = subEncounterSelected.rmCd;
                    bookingData.rmId = subEncounterSelected.rmId;
                }
            }
        }

        if(name === 'invertedSubEncounterTypeCd'){
            bookingData.encounterTypeId = '';
            bookingData.encounterTypeCd = '';
            const _roomsEncounterList = _.cloneDeep(this.props.roomsEncounterList);
            const getCurrentRooms = _roomsEncounterList.find(item => item.rmCd === value);
            if(getCurrentRooms){
                bookingData.subEncounterTypeCd = value;
                bookingData.rmCd = getCurrentRooms.rmCd;
                bookingData.rmId = getCurrentRooms.rmId;
            }
        }

        if ((name === 'appointmentDate' || name === 'appointmentTime') && value) {
            bookingData['elapsedPeriod'] = '';
            bookingData['elapsedPeriodUnit'] = '';
            if (name === 'appointmentDate' && !bookingData['appointmentTime']) {
                if (moment(value).isAfter(moment(), 'day')) {
                    bookingData['appointmentTime'] = moment(value).set({hours: 0, minute: 0, second: 0});
                } else if (moment(value).isSame(moment(), 'day')) {
                    bookingData['appointmentTime'] = moment().set({hours: 0, minute: 0, second: 0});
                }
            }
        }

        if (name === 'elapsedPeriod' || name === 'bookingUnit') {
            let reg = new RegExp(CommonRegex.VALIDATION_REGEX_NOT_NUMBER);
            if (reg.test(value)) {
                return;
            }
        }

        if (name === 'elapsedPeriod' && value) {
            bookingData['appointmentDate'] = null;
            bookingData['appointmentTime'] = null;
        }

        if (name === 'elapsedPeriodUnit' && value && !bookingData['elapsedPeriod']) {
            bookingData[name] = '';
            value = '';
        }

        if(name==='remarkId'){
            if(value){
                let remarkDto = this.props.remarkCodeList.find(item => item.remarkId === value);
                if ((bookingData.memo || '').split('\n').length < 4){
                    let _memo = `${bookingData.memo ? bookingData.memo + '\n' : ''}${remarkDto && remarkDto.description}`;
                    bookingData.memo = _memo;
                }
            }
            bookingData[name] = value;
        }

        if (name === 'memo') {
            bookingData.memo = value;
        }

        if (name === 'sessId') {
            if (bookingData.sessId === '*All') {
                bookingData.sessId = '';
            }
        }
        if(name==='encntrGrpCd'){
            bookingData.rmId = '';
            bookingData.rmCd = '';
            bookingData.subEncounterTypeCd = '';
            bookingData.encounterTypeId = '';
            bookingData.encounterTypeCd = '';
        }

        this.props.updateState({ bookingData });
    }

    filterClinicList = memoize((list, siteId, isEnableCross, svcCd) => {
        if (isEnableCross) {
            return list && list.filter(item => item.svcCd === svcCd);
        } else {
            return list && list.filter(item => item.siteId === siteId && item.svcCd === svcCd);
        }
    });

    isbarChange = () => {
        const {currentAnonyomousBookingActiveInfo, anonymousPatint} = this.props;
        let hasChangeBar = false;
        for (const key in currentAnonyomousBookingActiveInfo) {
            if (key == 'docNo') {
                if (((currentAnonyomousBookingActiveInfo['docNo'] && currentAnonyomousBookingActiveInfo['docNo'].trim()) != (anonymousPatint['docNo'] && anonymousPatint['docNo'].trim()))
                    || (currentAnonyomousBookingActiveInfo['docTypeCd'] != anonymousPatint['docTypeCd'])
                ) {
                    hasChangeBar = true;
                } else {
                    hasChangeBar = false;
                }
            } else {
                if (currentAnonyomousBookingActiveInfo[key] != anonymousPatint[key]) {
                    hasChangeBar = true;
                }
            }
        }
        return hasChangeBar;
    }

    handleContactPhoneChange = (value, name) => {
        let contactPhone = _.cloneDeep(this.props.contactPhone);
        if (name === 'countryCd') {
            contactPhone['areaCd'] = '';
            let countryOptionsObj = this.props.countryList.find(item => item.countryCd == value);
            let dialingCd = countryOptionsObj && countryOptionsObj.dialingCd;
            contactPhone['dialingCd'] = dialingCd;
        }
        // phoneList[index][name] = value;
        if (name === 'phoneTypeCd') {
            if (value === Enum.PHONE_TYPE_MOBILE_SMS) {
                contactPhone['phoneTypeCd'] = Enum.PHONE_TYPE_MOBILE_PHONE;
                contactPhone['countryCd'] = FieldConstant.COUNTRY_CODE_DEFAULT_VALUE;
                contactPhone['smsPhoneInd'] = '1';
            } else {
                contactPhone['smsPhoneInd'] = '0';
            }
        }
        contactPhone[name] = value;

        let bookingAnonymousInformation = this.props.bookingAnonymousInformation;

        bookingAnonymousInformation.anonyomousBookingActiveInfo.mobile = contactPhone;

        // const selectSMSMobile = this.phoneListHasSMSMobile(phoneList);
        // this.props.onChange(phoneList, selectSMSMobile);
        this.props.updateField({bookingAnonymousInformation: bookingAnonymousInformation});
    }

    render() {
        const {
            bookingData,
            anonPatientInfo,
            clinicList,
            siteId,
            isEnableCrossBookClinic,
            handleBtnClick,
            bookingDataBackup,
            contactPhone,
            serviceCd,
            handleOpenDeleteReason, //NOSONAR
            handleGestationCalc, //NOSONAR
            daysOfWeekValArr
        } = this.props;

        const _clinicList = this.filterClinicList(clinicList, siteId, isEnableCrossBookClinic, serviceCd);

        let hasChangeBar = this.isbarChange();

        const isDirty =
            anonPatientInfo
            && anonPatientInfo.patientKey
            && !parseInt(anonPatientInfo.deadInd)
            && (AppointmentUtil.isBookingDataEditing(bookingDataBackup, bookingData, daysOfWeekValArr) || hasChangeBar);

        const isSMSMobile = parseInt(contactPhone.smsPhoneInd) === 1;
        if (isSMSMobile) {
            contactPhone.phoneTypeCd = Enum.PHONE_TYPE_MOBILE_SMS;
        }

        return (
            <Grid>
                <Typography variant="h6" style={{'marginBottom': '1.5rem'}}>Appointment Details</Typography>

                <Grid style={{'marginBottom': '1.5rem'}}>
                    <SelectFieldValidator
                        id="bookingAnonymous_select_appointment_booking_clinic"
                        options={_clinicList && _clinicList.map(item => (
                            {value: item.siteId, label: item.clinicName}
                        ))}
                        TextFieldProps={{
                            variant: 'outlined',
                            label: <>
                                Site<RequiredIcon/>
                            </>
                        }}
                        value={bookingData.siteId}
                        onChange={e => this.handleOnChange('siteId', e.value)}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                    />
                </Grid>

                <BookAnonFormBasic
                    handleOnChange={this.handleOnChange}
                    daysOfWeekValArr={daysOfWeekValArr}
                    updateDaysOfWeek={this.props.updateDaysOfWeek}
                />

                <BookAnonBtnGrp
                    isDirty={isDirty}
                    handleBtnClick={handleBtnClick}
                    handleOpenDeleteReason={handleOpenDeleteReason}
                    handleGestationCalc={handleGestationCalc}
                    isUseGestCalc={this.props.isUseGestCalc}
                />
            </Grid>
        );
    }
}


const mapStatetoProps = (state) => {
    return ({
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        anonPatientInfo: state.bookingAnonymousInformation.anonPatientInfo,
        bookingData: state.bookingAnonymousInformation.bookingData,
        encounterTypes: state.common.encounterTypes,
        clinicList: state.common.clinicList,
        bookingDataBackup: state.bookingAnonymousInformation.bookingDataBackup,
        anonymousPatint: state.bookingAnonymousInformation.anonyomousBookingActiveInfo,
        currentAnonyomousBookingActiveInfo: state.bookingAnonymousInformation.currentAnonyomousBookingActiveInfo,
        isEnableCrossBookClinic: state.bookingAnonymousInformation.isEnableCrossBookClinic,
        contactPhone: state.bookingAnonymousInformation.anonyomousBookingActiveInfo.mobile,
        bookingAnonymousInformation: state.bookingAnonymousInformation,
        anonyomous: state.bookingAnonymousInformation.anonyomous,
        remarkCodeList: state.bookingAnonymousInformation.remarkCodeList,
        encntrGrpList: state.caseNo.encntrGrpList,
        roomsEncounterList: state.common.roomsEncounterList
    });
};

const mapDispatchtoProps = {
    updateState,
    openCommonCircular,
    closeCommonCircular,
    openCommonMessage,
    deleteTabs,
    getEncounterTypeListBySite,
    getSessionList,
    getRoomsEncounterTypeList
};

export default connect(mapStatetoProps, mapDispatchtoProps)(BookAnonForm);
