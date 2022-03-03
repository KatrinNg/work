import React from 'react';
import { connect } from 'react-redux';
import { Box, FormControlLabel, Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import memoize from 'memoize-one';
import _ from 'lodash';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import CIMSRadioCombination from '../../../../components/Radio/CIMSRadioCombination';
import ECSInfo from './ecs/ecsInfo';
import BookFormBtnGrp from './bookForm/bookFormBtnGrp';
import BookFormBasic from './bookForm/bookFormBasic';
import WalkInAttendanceInfo from './bookForm/walkInAttendanceInfo';
import DefaulterTracingPanel from '../component/defaulterTracingPanel';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import { PageStatus as pageStatusEnum, BookMeans } from '../../../../enums/appointment/booking/bookingEnum';
import {
    updateState,
    getEncounterTypeListBySite,
    cancelEditAppointment,
    getRoomUtilization,
    getSessionList,
    init_bookingData,
    updateAppointmentListCart,
    getFamilyMember
} from '../../../../store/actions/appointment/booking/bookingAction';
import {
    openCommonCircular,
    closeCommonCircular,
    getRoomsEncounterTypeList
} from '../../../../store/actions/common/commonAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { AppointmentUtil, CommonUtil, UserUtil, EnctrAndRmUtil } from '../../../../utilities';
import RoomUtilization from '../../../compontent/roomUtilization';
import OutlinedRadioValidator from '../../../../components/FormValidator/OutlinedRadioValidator';
import CIMSCheckBox from '../../../../components/CheckBox/CIMSCheckBox';
import {pmiCaseWithEnctrGrpVal} from '../../../../utilities/caseNoUtilities';
import { caseSts } from 'enums/anSvcID/anSvcIDEnum';
import {filterRoomsEncounterTypeSvc,ACCEPT_DEFAULT_MULTIPLE_APPOINTMENT_SVC} from '../../../../enums/enum';

let clnDefaultRmConfig = [
    { service: 'FCS', siteId: 4, encounterTypeId: null, rmId: 4012 }
];

const styles = (theme) => ({
    radioGroup: {
        //height: 36
        height: 39 * theme.palette.unit - 2
    },
    crossServiceAppointment: {
        position: 'relative',
        backgroundColor: 'rgb(175,173,174)',
        width: '100%',
        height: '670px',
        margin: '-8px 0',
        borderRadius: '4px',
        boxShadow: '4px 3px 5px -1px rgba(0,0,0,0.2), 5px 6px 8px 0px rgba(0,0,0,0.14), 4px 2px 14px 0px rgba(0,0,0,0.12)',
        '& div': {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'white',
            fontSize: '3rem'
        }
    }
});


class BookingForm extends React.Component {
    state = {
        lmp: null
    };

    componentDidMount() {
        let bookingData = _.cloneDeep(this.props.bookingData);
        bookingData.caseTypeCd = bookingData.caseTypeCd || this.props.defaultCaseTypeCd;
        this.props.updateState({
            bookingData,
            appointmentMode: ACCEPT_DEFAULT_MULTIPLE_APPOINTMENT_SVC.indexOf(this.props.serviceCd) > -1 ? BookMeans.MULTIPLE : BookMeans.SINGLE
        });
        this.getLmp();
    }

    componentDidUpdate(prevProps) {
        const { currentSelectedApptInfo, patientInfo, familyMemberData, serviceCd } = this.props;
        if (prevProps.appointmentMode !== this.props.appointmentMode) {
            this.props.handleFormReset();
        }
        if (prevProps.serviceCd !== this.props.serviceCd || prevProps.patientInfo !== this.props.patientInfo) {
            this.getLmp();
        }
        if (serviceCd === 'CGS') {
            const pmiGrpName = patientInfo?.cgsSpecOut?.pmiGrpName;
            if (!currentSelectedApptInfo && pmiGrpName && familyMemberData.length === 0) this.props.getFamilyMember();
        }
    }

    getLmp = () => {
        const { serviceCd, patientInfo } = this.props;
        let _wrkEdc = serviceCd === 'ANT' && patientInfo?.antSvcInfo?.clcAntCurrent?.sts === caseSts.ACTIVE ? moment(patientInfo?.antSvcInfo?.clcAntCurrent?.wrkEdc).startOf('day') : null;
        let _lmp = _wrkEdc?.isValid?.() ? _wrkEdc.clone().add(-40, 'week').startOf('day') : null;
        // console.log('[ANT] lmp', _lmp);
        this.setState({ lmp: _lmp });
    }

    getRmCdFromRmId = (rmId) => {
        let rmCd = '';
        let rmSelected = this.props.rooms.find((item) => item.rmId === rmId);
        if (rmSelected && rmSelected.rmCd) {
            rmCd = rmSelected.rmCd;
        }
        return rmCd;
    }

    handleChange = (obj) => {
        const { serviceCd, caseNoInfo, encounterTypes, clinicList, encntrGrpList, roomsEncounterList } = this.props;
        let bookingData = _.cloneDeep(this.props.bookingData);
        bookingData = {
            ...bookingData,
            ...obj
        };
        const objKeys = Object.keys(obj);
        if (objKeys.includes('qtType')) {
            if (obj.qtType === 'W') {
                bookingData.appointmentDate = moment();
                bookingData.appointmentTime = moment();
                bookingData.elapsedPeriod = 1;
                bookingData.elapsedPeriodUnit = 'week';
                this.props.updateState({ pageStatus: pageStatusEnum.WALKIN });
                bookingData['caseTypeCd'] = '';
            }
            if (this.props.bookingData.qtType === 'W' && obj.qtType !== 'W') {
                bookingData.appointmentDate = null;
                bookingData.appointmentTime = null;
                bookingData.appointmentDateTo = null;
                bookingData.gestWeekFromWeek = null;
                bookingData.gestWeekFromDay = null;
                bookingData.gestWeekToWeek = null;
                bookingData.gestWeekToDay = null;
                if (bookingData.encounterTypeId) {
                    bookingData.appointmentDate=null;
                    bookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(bookingData, bookingData.encounterTypeId,bookingData.encounterTypeList);
                }
                this.props.updateState({ pageStatus: pageStatusEnum.VIEW });
            }
        }

        if (objKeys.includes('sessId')) {
            if (obj.sessId === '*All') {
                bookingData.sessId = '';
            }
        }

        if (objKeys.includes('caseTypeCd')) {
            // // If update the 'caseTypeCd'; Set the qtType New Old QT1~6 Setting
            // bookingData['qtType'] = AppointmentUtilities.getQuotaByCaseTypeCd(bookingData.qtType, value);
        }

        if (objKeys.includes('siteId')) {
            bookingData[objKeys] = obj.siteId;
            bookingData.rmId = '';
            bookingData.rmCd = '';
            bookingData.subEncounterTypeCd = '';
            bookingData.encounterTypeId = '';
            bookingData.encounterTypeCd = '';
            bookingData.appointmentDate = moment();
            bookingData.appointmentTime = moment();

            let gestWeek = AppointmentUtil.getGestWeekByLmpAndApptDate(this.state.lmp, bookingData.appointmentDate);
            if (gestWeek) {
                bookingData.gestWeekFromWeek = gestWeek.week;
                bookingData.gestWeekFromDay = gestWeek.day;
            }

            bookingData.elapsedPeriod = '';
            bookingData.elapsedPeriodUnit = '';
            bookingData.sessId = '';
            const isPmiCaseWithEnctrGrp = pmiCaseWithEnctrGrpVal();
            if (isPmiCaseWithEnctrGrp === true) {
                if (!caseNoInfo.encntrGrpCd) {
                    bookingData.encntrGrpCd = '';
                }
            }
            this.props.updateState({ bookingData });
            if(filterRoomsEncounterTypeSvc.indexOf(serviceCd) > -1){
                this.props.getRoomsEncounterTypeList({params:{siteId:obj.siteId}});
            }else{
                this.props.getEncounterTypeListBySite(serviceCd, obj.siteId);
            }
            this.props.getSessionList({ siteId: obj.siteId });

            return;
        }

        if(objKeys.includes('encntrGrpCd')){
            bookingData.rmId = '';
            bookingData.rmCd = '';
            bookingData.subEncounterTypeCd = '';
            bookingData.encounterTypeId = '';
            bookingData.encounterTypeCd = '';
        }


        // :. Refactoring User encounterTypeId
        if (objKeys.includes('encounterTypeId')) {
            let siteId = bookingData.siteId;
            let encounterTypeId = obj.encounterTypeId;
            const _encntrList = _.cloneDeep(bookingData.encounterTypeList);
            const _encntrDto = bookingData.encounterTypeList.find(x => x.encntrTypeId === encounterTypeId) || {};
            const _rooms = _.cloneDeep(_encntrDto.subEncounterTypeList || null);
            const defaultRoom = AppointmentUtil.getDefaultRoom({
                encntrId: encounterTypeId,
                rooms: _rooms,
                siteId: siteId
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
            if (this.props.bookingData.qtType !== 'W') {
                bookingData.appointmentDate = null;
                bookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(bookingData, encounterTypeId, _encntrList);
            }
            bookingData.encounterTypeCd = _encntrDto.encounterTypeCd || '';

            bookingData = AppointmentUtil.getEncntrGrpByEncntrId(encounterTypeId, _.cloneDeep(bookingData));
        }

        if (objKeys.includes('invertedEncounterTypeId')) {
            const encounterTypeId = obj.invertedEncounterTypeId;
            const _roomsEncounterList = _.cloneDeep(roomsEncounterList);
            const getCurrentRooms = _roomsEncounterList.find(item => item.rmId === bookingData.rmId);
            const getCurrentEncounter = getCurrentRooms?.encounterTypeDtoList.find(item => item.encntrTypeId === encounterTypeId);
            if (this.props.bookingData.qtType !== 'W') {
                bookingData.appointmentDate = null;
                bookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(bookingData, encounterTypeId, getCurrentEncounter,'inverted');
            }
            bookingData = AppointmentUtil.getEncntrGrpByEncntrId(bookingData.encounterTypeId, _.cloneDeep(bookingData));
            if(getCurrentEncounter){
                bookingData.encounterTypeCd = getCurrentEncounter.encntrTypeCd || '';
                bookingData.encounterTypeId = getCurrentEncounter.encntrTypeId;
            }
        }

        if (objKeys.includes('rmId')) {
            let enctSelected = bookingData.encounterTypeList.find(item => item.encntrTypeId === bookingData?.encounterTypeId);
            let rmSelected = enctSelected?.subEncounterTypeList.find(item => item.rmId === obj.rmId);
            bookingData.subEncounterTypeCd = rmSelected?.subEncounterTypeCd;
            bookingData.rmCd = rmSelected?.rmCd;
        }

        if (objKeys.includes('invertedRmId')) {
            bookingData.encounterTypeId = '';
            const _roomsEncounterList = _.cloneDeep(this.props.roomsEncounterList);
            const getCurrentRooms = _roomsEncounterList.find(item => item.rmId === obj.invertedRmId);
            if(getCurrentRooms){
                bookingData.rmId = obj.invertedRmId;
                bookingData.subEncounterTypeCd = obj.invertedRmId;
                bookingData.rmCd = getCurrentRooms.rmCd;
            }
        }

        if (objKeys.includes('appointmentDate') && obj.appointmentDate) {
            bookingData['elapsedPeriod'] = '';
            bookingData['elapsedPeriodUnit'] = '';
            if (!bookingData['appointmentTime'] && moment(obj.appointmentDate).isValid()) {
                bookingData['appointmentTime'] = moment(obj.appointmentDate).set({ hours: 0, minute: 0, second: 0 });
            }
        }

        if (objKeys.includes('appointmentTime') && obj.appointmentTime) {
            bookingData['elapsedPeriod'] = '';
            bookingData['elapsedPeriodUnit'] = '';
        }

        if (objKeys.includes('elapsedPeriod') && obj.elapsedPeriod) {
            bookingData['appointmentDate'] = null;
            bookingData['appointmentTime'] = null;
            bookingData['appointmentDateTo'] = null;
            bookingData['gestWeekFromWeek'] = null;
            bookingData['gestWeekFromDay'] = null;
            bookingData['gestWeekToWeek'] = null;
            bookingData['gestWeekToDay'] = null;
        }

        if (objKeys.includes('elapsedPeriodUnit') && obj.elapsedPeriodUnit && !bookingData['elapsedPeriod']) {
            bookingData['elapsedPeriodUnit'] = '';
        }
        if (objKeys.includes('isNep')) {
            if (!obj.isNep) {
                bookingData['nepRemark'] = '';
            }
        }

        this.props.updateState({ bookingData });
    }

    filterClinicList = memoize((list, serviceCd, clinicCd, isEnableCross,pageStatus,currentSelectedApptInfo) => {
        let result = _.cloneDeep(list || []);
        if (isEnableCross) {
            return result.filter(x => x.serviceCd === serviceCd);
        } else {
            if(currentSelectedApptInfo&&pageStatus===pageStatusEnum.VIEW){
                return result.filter(x => x.serviceCd === serviceCd);
            }else{
                return result && result.filter(item => item.serviceCd === serviceCd && item.clinicCd === clinicCd);
            }
        }
    });

    handleWalkInInfoChange = (info) => {
        let updateData = { walkInAttendanceInfo: info };
        this.props.updateState(updateData);
        if (updateData && updateData.patientStatus) {
            this.handleChange({ patientStatusCd: updateData.patientStatus });
        }
    }

    getRoomUtilization = (slotDate) => {
        const siteId = this.props.loginSiteId;
        this.props.getRoomUtilization({ siteId, slotDate });
    }

    setDisabledCheckSppAdd = () => {
        const {serviceCd, appointmentMode, appointmentListCart} = this.props;
        let disabled = false;
        if(serviceCd === 'SPP' && appointmentMode === BookMeans.MULTIPLE){
            if(appointmentListCart && appointmentListCart.length){
                disabled = true;
            }
        }
        return disabled;
    }

    render() {
        const {
            classes,
            serviceCd,
            bookingData,
            pageStatus,
            appointmentMode,
            clinicList,
            commonCodeList,
            clinicCd,
            isEnableCrossBookClinic,
            waitingList,
            roomUtilizationData,
            currentSelectedApptInfo,
            loginInfo,
            patientSvcExist,
            dftTraceRsnList,
            daysOfWeekValArr,
            isSppEnable,
            appointmentListCart
        } = this.props;

        // const { errorMessageList } = this.state;

        const patientStatusList = (commonCodeList && commonCodeList.patient_status) || [];
        const isCrossService = currentSelectedApptInfo && currentSelectedApptInfo.svcCd !== serviceCd;
        const _clinicList = this.filterClinicList(clinicList, serviceCd, clinicCd, isEnableCrossBookClinic,pageStatus,currentSelectedApptInfo);

        const isNewToSvcSiteParam = CommonUtil.getTopPriorityOfSiteParams(this.props.clinicConfig, serviceCd, this.props.loginSiteId, 'IS_NEW_USER_TO_SVC');
        const isAttenConfirmEcsEligibilitySiteParam = CommonUtil.getTopPriorityOfSiteParams(this.props.clinicConfig, serviceCd, this.props.loginSiteId, 'IS_ATND_CONFIRM_ECS_ELIGIBILITY');
        let isNewToSvc = (isNewToSvcSiteParam && isNewToSvcSiteParam.configValue) || '0';
        let isAttenConfirmEcsEligibility = (isAttenConfirmEcsEligibilitySiteParam && isAttenConfirmEcsEligibilitySiteParam.configValue) || '0';
        const isDisplayPaymentInfoSiteParam = CommonUtil.getTopPriorityOfSiteParams(this.props.clinicConfig, serviceCd, this.props.loginSiteId, 'IS_DISPLAY_PAYMENT_INFO');
        let isDisplayPaymentInfo = (isDisplayPaymentInfoSiteParam && isDisplayPaymentInfoSiteParam.configValue) || 0;
        const isCimsCounterBaseRole = UserUtil.hasSpecificRole(loginInfo.userDto, 'CIMS-COUNTER');

        const readMode = currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW;
        const editMode = pageStatus === pageStatusEnum.EDIT;

        return (
            <Grid item container spacing={2}>
                <Grid item container>
                    <RoomUtilization
                        id="appointment_booking"
                        rowData={roomUtilizationData}
                        getRoomUtilization={this.getRoomUtilization}
                        disabled={isSppEnable == null ? true : !isSppEnable}
                    />
                </Grid>
                {isCrossService ?
                    <Grid item container>
                        <div className={classes.crossServiceAppointment}>
                            <div>{'Cross Service\nAppointment'}</div>
                        </div>
                    </Grid>
                    :
                    <>
                        <Grid item container>
                            <Grid item container>
                                <Typography variant="h6">Appointment Booking</Typography>
                            </Grid>
                            <Grid item container spacing={2} justify="space-evenly" wrap="nowrap">
                                {
                                    pageStatus !== pageStatusEnum.WALKIN && pageStatus !== pageStatusEnum.EDIT && !waitingList && !currentSelectedApptInfo ?
                                        <Grid item container>
                                            <CIMSRadioCombination
                                                id="radioGroup_appointment_booking"
                                                row
                                                name="appointmentMode"
                                                value={appointmentMode}
                                                onChange={e => {
                                                    this.props.updateState({ appointmentMode: e.target.value });
                                                    // this.setState({ errorMessageList: [] });
                                                    this.props.init_bookingData();
                                                    this.props.resetDaysOfWeek();
                                                }}
                                                list={[
                                                    { value: BookMeans.SINGLE, label: 'Single Appointment' },
                                                    { value: BookMeans.MULTIPLE, label: 'Multiple Appointments' }
                                                ]}
                                                disabled={!isSppEnable}
                                            />
                                        </Grid> : null}
                                {
                                    pageStatus !== pageStatusEnum.WALKIN && !currentSelectedApptInfo || (pageStatus === pageStatusEnum.EDIT || (currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW)) ? null
                                        : (((isNewToSvc === '1' && !patientSvcExist) && (isAttenConfirmEcsEligibility !== '1'))) ?
                                        <Grid item xs={12} style={{ display: 'flex', alignItems: 'center' }}>
                                            <OutlinedRadioValidator
                                                id={'walkIn_caseIndicator'}
                                                name="caseIndicator"
                                                labelText="Case Indicator"
                                                isRequired
                                                value={bookingData.caseIndicator}
                                                onChange={e => this.handleChange({ 'caseIndicator': e.target.value })}
                                                list={
                                                    [{ label: 'New to Service', value: 'N' }, { label: 'Existing ' + CommonUtil.getPatientCall(), value: 'E' }]
                                                }
                                                validators={[ValidatorEnum.required]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                RadioGroupProps={{ className: classes.radioGroup }}
                                            />
                                        </Grid> : null}
                                {
                                    pageStatus !== pageStatusEnum.WALKIN && !currentSelectedApptInfo || (pageStatus === pageStatusEnum.EDIT || (currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW)) ? null :
                                        (isAttenConfirmEcsEligibility ==='1' && isNewToSvc === '1' && patientSvcExist)||((isAttenConfirmEcsEligibility === '1') && (isNewToSvc !== '1')) ?
                                            <Grid item xs={12} style={{ display: 'flex', alignItems: 'center' }}>
                                                <OutlinedRadioValidator
                                                    id={'walkIn_confirmECSEligibility'}
                                                    name="confirmECSEligibility"
                                                    labelText="Confirm ECS Eligibility"
                                                    isRequired
                                                    value={bookingData.confirmECSEligibility}
                                                    onChange={e => this.handleChange({ 'confirmECSEligibility': e.target.value })}
                                                    list={
                                                        [{ label: 'Confirm Eligibility', value: 'C' }, { label: 'Payment Settled', value: 'P' }]
                                                    }
                                                    validators={[ValidatorEnum.required]}
                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                    RadioGroupProps={{ className: classes.radioGroup }}
                                                    disabled={pageStatus === pageStatusEnum.EDIT || (currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW)}
                                                />
                                            </Grid> : null
                                }
                                <Grid item container>
                                    <BookFormBtnGrp
                                        handleBookClick={this.props.handleBookClick}
                                        handleUpdateAppointment={this.props.handleUpdateAppointment}
                                        handleCancelUpdateAppt={this.props.handleCancelUpdateAppt}
                                        handleGestationCalc={this.props.handleGestationCalc}
                                        isUseGestCalc={this.props.isUseGestCalc}
                                        daysOfWeekValArr={daysOfWeekValArr}
                                        isSppEnable={isSppEnable}
                                        checkIsDirty={this.props.checkIsDirty}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        {
                            pageStatus !== pageStatusEnum.WALKIN && !currentSelectedApptInfo || (pageStatus === pageStatusEnum.EDIT || (currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW)) ? null :
                                (isAttenConfirmEcsEligibility === '1') && (isNewToSvc === '1' && !patientSvcExist) ?
                                    <Grid item container>
                                        <Grid item container spacing={2} justify="space-between" wrap="nowrap">
                                            <Grid item xs={6} >
                                                <OutlinedRadioValidator
                                                    id={'walkIn_caseIndicator'}
                                                    name="caseIndicator"
                                                    labelText="Case Indicator"
                                                    isRequired
                                                    value={bookingData.caseIndicator}
                                                    onChange={e => this.handleChange({ 'caseIndicator': e.target.value })}
                                                    list={
                                                        [{ label: 'New to Service', value: 'N' }, { label: 'Existing Client', value: 'E' }]
                                                    }
                                                    validators={[ValidatorEnum.required]}
                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                    RadioGroupProps={{ className: classes.radioGroup }}
                                                />
                                            </Grid>  <Grid item xs={6} >
                                            <OutlinedRadioValidator
                                                id={'walkIn_confirmECSEligibility'}
                                                name="confirmECSEligibility"
                                                labelText="Confirm ECS Eligibility"
                                                isRequired
                                                value={bookingData.confirmECSEligibility}
                                                onChange={e => this.handleChange({ 'confirmECSEligibility': e.target.value })}
                                                list={
                                                    [{ label: 'Confirm Eligibility', value: 'C' }, { label: 'Payment Settled', value: 'P' }]
                                                }
                                                validators={[ValidatorEnum.required]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                RadioGroupProps={{ className: classes.radioGroup }}
                                                disabled={pageStatus === pageStatusEnum.EDIT || (currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW)}
                                            />
                                        </Grid>
                                        </Grid>
                                    </Grid> : null
                        }
                        {
                            serviceCd === 'SHS' ?
                                pageStatus === pageStatusEnum.WALKIN ? null
                                    : <Grid item container style={{ paddingRight: 0 }}>
                                        <DefaulterTracingPanel
                                            id={'booking_defaulter_tracing_panel'}
                                            dftTraceRsnList={dftTraceRsnList}
                                            bookingData={bookingData}
                                            comDisabled={currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW}
                                            onChange={this.handleChange}
                                        />
                                    </Grid>
                                : null
                        }
                        <Grid item container>
                            {
                                isCrossService ?
                                    <FastTextFieldValidator
                                        id="booking_select_appointment_booking_clinic"
                                        variant="outlined"
                                        label={<>Site<RequiredIcon /></>}
                                        onChange={null}
                                        disabled
                                        value={!isCimsCounterBaseRole ? currentSelectedApptInfo.clinicName : 'DH Clinic'}
                                    />
                                    :
                                    <SelectFieldValidator
                                        id="booking_select_appointment_booking_clinic"
                                        options={_clinicList && _clinicList.map(item => (
                                            { value: item.siteId, label: item.clinicName }
                                        ))}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: <>Site<RequiredIcon /></>
                                        }}
                                        value={bookingData.siteId}
                                        onChange={e => this.handleChange({ 'siteId': e.value })}
                                        placeholder=""
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        msgPosition="bottom"
                                        isDisabled={isSppEnable ? (editMode && !isEnableCrossBookClinic) || readMode || bookingData.qtType === 'W' || this.setDisabledCheckSppAdd() : true}
                                    />
                            }
                        </Grid>
                        <Grid item container>
                            <BookFormBasic
                                handleChange={this.handleChange}
                                daysOfWeekValArr={daysOfWeekValArr}
                                updateDaysOfWeek={this.props.updateDaysOfWeek}
                                isSppEnable={isSppEnable}
                            />
                        </Grid>
                        <Grid item container>
                            <ECSInfo id="booking_ecsInfo" isCrossService={isCrossService} isSppEnable={isSppEnable} />
                        </Grid>

                        {
                            pageStatus === pageStatusEnum.WALKIN ? <Grid item container xs={12} >
                                <Box display="flex" width={1}>
                                    <Box display="flex">
                                        <FormControlLabel
                                            control={
                                                <CIMSCheckBox
                                                    name={'isNep'}
                                                    isDisabled={isSppEnable ? editMode || readMode : true}
                                                    id={'nep_checkbox'}
                                                    value={bookingData.isNep}
                                                    onChange={e => this.handleChange({ isNep: e.target.checked })}
                                                />
                                            }
                                            label={'NEP'}
                                            checked={(bookingData.isNep) === true}
                                            disabled={!isSppEnable}
                                        />
                                    </Box>
                                    <Box pr={1} flexGrow={1}>
                                        <FastTextFieldValidator
                                            disabled={isSppEnable ? editMode || readMode || !bookingData.isNep : true}
                                            id={'nep_remark_txt'}
                                            name={'nepRemark'}
                                            ref={'nepRemark'}
                                            inputProps={{ maxLength: 400 }}
                                            value={bookingData.nepRemark}
                                            onBlur={e => this.handleChange({ nepRemark: e.target.value })}
                                            variant={'outlined'}
                                            label={'NEP Remark'}

                                        />
                                    </Box>
                                </Box>
                            </Grid> : null
                        }

                        <Grid item container xs={3}>
                            <SelectFieldValidator
                                id={'booking_patient_status'}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Patient Status</>
                                }}
                                value={bookingData.patientStatusCd}
                                options={patientStatusList.map((item) => (
                                    { value: item.code, label: item.superCode }
                                ))}
                                onChange={e => this.handleChange({ patientStatusCd: e.value })}
                                addNullOption
                                isDisabled={isSppEnable ? readMode : true}
                            />
                        </Grid>
                        {
                            pageStatus === pageStatusEnum.WALKIN ?
                                <Grid item xs={3} >
                                    <FastTextFieldValidator
                                        fullWidth
                                        disabled={isSppEnable ? readMode : true}
                                        variant={'outlined'}
                                        id={'booking_patient_discNum'}
                                        name={'discNum'}
                                        ref={'discNum'}
                                        onBlur={(e) => this.handleChange({ discNum: e.target.value })}
                                        value={bookingData.discNum}
                                        inputProps={{ maxLength: 5 }}
                                        label={'Disc Number'}
                                    />
                                </Grid> : null
                        }
                        {isDisplayPaymentInfo == 1 ? <Grid item container>
                            <WalkInAttendanceInfo
                                patientStatusList={patientStatusList}
                                id={'walkIn_appointment_Info'}
                                handleWalkInInfoChange={this.handleWalkInInfoChange}
                            />
                        </Grid> : null}
                    </>
                }
            </Grid>
        );
    }
}


const mapStatetoProps = (state) => {
    return ({
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        loginSiteId: state.login.clinic.siteId,
        bookingData: state.bookingInformation.bookingData,
        clinicConfig: state.common.clinicConfig,
        encounterTypes: state.common.encounterTypes,
        rooms: state.common.rooms,
        searchLogicList: state.bookingInformation.searchLogicList,
        remarkCodeList: state.bookingInformation.remarkCodeList,
        pageStatus: state.bookingInformation.pageStatus,
        appointmentMode: state.bookingInformation.appointmentMode,
        commonCodeList: state.common.commonCodeList,
        clinicList: state.common.clinicList || null,
        isEnableCrossBookClinic: state.bookingInformation.isEnableCrossBookClinic,
        defaultCaseTypeCd: state.bookingInformation.defaultCaseTypeCd,
        waitingList: state.bookingInformation.waitingList,
        roomUtilizationData: state.bookingInformation.roomUtilizationData,
        currentSelectedApptInfo: state.bookingInformation.currentSelectedApptInfo,
        loginInfo: state.login.loginInfo,
        clnDefaultRmConfig: state.common.clnDefaultRmConfig,
        patientSvcExist: state.bookingInformation.patientSvcExist,
        patientInfo: state.patient.patientInfo,
        encntrGrpList: state.caseNo.encntrGrpList,
        caseNoInfo:state.patient.caseNoInfo,
        dftTraceRsnList:state.common.commonCodeList.default_trace_reason,
        familyMemberData: state.bookingInformation.familyMemberData,
        roomsEncounterList: state.common.roomsEncounterList,
        appointmentListCart: state.bookingInformation.appointmentListCart
    });
};

const mapDispatchtoProps = {
    updateState,
    openCommonCircular,
    closeCommonCircular,
    cancelEditAppointment,
    getEncounterTypeListBySite,
    openCommonMessage,
    getRoomUtilization,
    getSessionList,
    init_bookingData,
    getFamilyMember,
    getRoomsEncounterTypeList,
    updateAppointmentListCart
};

export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(BookingForm));
