import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import memoize from 'memoize-one';
import moment from 'moment';
import _ from 'lodash';
import { Grid } from '@material-ui/core';
import RequiredIcon from '../../../../../components/InputLabel/RequiredIcon';
import CIMSFormLabel from '../../../../../components/InputLabel/CIMSFormLabel';
import SelectFieldValidator from '../../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../../components/TextField/FastTextFieldValidator';
import TimeFieldValidator from '../../../../../components/FormValidator/TimeFieldValidator';
import DateFieldValidator from '../../../../../components/FormValidator/DateFieldValidator';
import CIMSMultiTextField from '../../../../../components/TextField/CIMSMultiTextField';
import DaysOfWeekPanel from '../../component/daysOfWeekPanel';
import Enum,{ filterRoomsEncounterTypeSvc } from '../../../../../enums/enum';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import { caseSts } from '../../../../../enums/anSvcID/anSvcIDEnum';
import CommonMessage from '../../../../../constants/commonMessage';
import { AppointmentUtil, CommonUtil, EnctrAndRmUtil, UserUtil } from '../../../../../utilities';
import { PageStatus as pageStatusEnum, BookMeans } from '../../../../../enums/appointment/booking/bookingEnum';
import AutoSelectFieldValidator from '../../../../../components/FormValidator/AutoSelectFieldValidator';
import GestWeekInput from '../gestWeekInput';
import EncounterWithRoom from '../../../../../components/EncounterWithRoom/index';

let quotaTypeList = null;
function getInitQuotaTypeList(where, clinicConfig, quotaConfig) {
    const defaultQuotaDesc = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.QUOTA_TYPE_DESC, clinicConfig, where);

    // const quotaArr = defaultQuotaDesc.configValue ? defaultQuotaDesc.configValue.split('|') : null;

    // let list = CommonUtil.transformToMap(quotaArr);
    // Set the QuotaConfig;
    let list = CommonUtil.quotaConfig(quotaConfig);
    list.push({
        code: 'W',
        engDesc: 'Walk-in'
    });
    // TODO : QT Type to clinic config
    // Fixed : Use CMN_SITE_PARAM Param_Value _ QUOTA_TYPE_DESC
    // list.push({
    //     code: Enum.QUOTA_1,
    //     engDesc: 'Normal'
    // });
    // list.push({
    //     code: Enum.QUOTA_2,
    //     engDesc: 'Force'
    // });
    // list.push({
    //     code: Enum.QUOTA_3,
    //     engDesc: 'Public'
    // });

    return list;
}

const getSubEncounterTypeList = memoize((encList, encntrTypeId) => {
    let list = [];
    if (encList && encntrTypeId) {
        const encDto = encList.find(item => item.encntrTypeId === encntrTypeId);
        list = encDto && encDto.subEncounterTypeList;
    }
    return list;
});

const BookFormBasic = React.forwardRef((props, ref) => {
    const {
        classes,
        bookingData,
        appointmentMode,
        serviceCd,
        loginSiteId,
        clinicCd,
        clinicConfig,
        pageStatus,
        sessionList,
        currentSelectedApptInfo,
        waitingList,
        remarkCodeList,
        handleChange, //NOSONAR
        quotaConfig,
        loginInfo,
        backdateWalkInDay,
        isShowRemarkTemplate,
        encntrGrpList,
        daysOfWeekValArr,
        patientInfo,
        roomsEncounterList,
        isSppEnable,
        IPCLocCodeList
    } = props;

    const filterQuotaTypeList = memoize((list, mode, isFromWaiting, isCorssClinic) => {
        if (mode.toLowerCase() === 'multiple' || isFromWaiting || isCorssClinic || pageStatus === pageStatusEnum.EDIT ) {
            return list && list.filter(item => item.code !== 'W');
        } else {
            return list;
        }
    });

    const [encounterTypes,setEncounterTypes]=React.useState(()=>{
        const encounterTypes=_.cloneDeep(bookingData.encounterTypeList);
        return encounterTypes;
    });

    const [encounterTypesByRooms, setEncounterTypesByRooms] = React.useState([]);

    useEffect(() => {
        quotaTypeList = getInitQuotaTypeList({ serviceCd, clinicCd }, clinicConfig, quotaConfig);
        return () => {
            quotaTypeList = null;
        };
    }, []);

    let _quotaTypeList = filterQuotaTypeList(quotaTypeList, appointmentMode, waitingList ? true : false, bookingData.siteId !== loginSiteId);

    useEffect(() => {
        _quotaTypeList = filterQuotaTypeList(quotaTypeList, appointmentMode, waitingList ? true : false, bookingData.siteId !== loginSiteId);
    }, [appointmentMode]);

    useEffect(() => {
        if (bookingData.encntrGrpCd) {
            const encntrGp = encntrGrpList.find(x => x.encntrGrpCd === bookingData.encntrGrpCd);
            if (!encntrGp) {
                setEncounterTypes(bookingData.encounterTypeList);
            } else {
                const _encounterTypes = AppointmentUtil.getEnctrTypesByEnctrGroup(bookingData.encounterTypeList, encntrGp.pmiCaseEncntrGrpDetlDtos);
                setEncounterTypes(_encounterTypes);
            }

        } else {
            setEncounterTypes(bookingData.encounterTypeList);
        }
    }, [bookingData.encntrGrpCd,bookingData.encounterTypeList]);

    React.useEffect(() => {
        if(filterRoomsEncounterTypeSvc.indexOf(serviceCd) > -1){
            const getEncounterByRooms = roomsEncounterList.find(item => item.rmId === bookingData.rmId);
            setEncounterTypesByRooms(getEncounterByRooms?.encounterTypeDtoList);
        }
    }, [bookingData.rmId]);


    const isWalkIn = pageStatus === pageStatusEnum.WALKIN;
    const subEncounterTypes = getSubEncounterTypeList(bookingData.encounterTypeList, bookingData.encounterTypeId);

    const isCrossService = currentSelectedApptInfo && currentSelectedApptInfo.svcCd !== serviceCd;
    const isCimsCounterBaseRole = UserUtil.hasSpecificRole(loginInfo.userDto, 'CIMS-COUNTER');
    const daysOfWeek=daysOfWeekValArr.join('');
    const isANTAppt = currentSelectedApptInfo ? currentSelectedApptInfo.svcCd === 'ANT' : serviceCd === 'ANT';
    const maxRows = serviceCd === 'CGS' ? '5' : '4';

    const lmp = useMemo(() => {
        let _wrkEdc = serviceCd === 'ANT' && patientInfo?.antSvcInfo?.clcAntCurrent?.sts === caseSts.ACTIVE ? moment(patientInfo?.antSvcInfo?.clcAntCurrent?.wrkEdc).startOf('day') : null;
        let _lmp = _wrkEdc?.isValid?.() ? _wrkEdc.clone().add(-40, 'week').startOf('day') : null;
        return _lmp;
    }, [serviceCd, patientInfo]);

    const readMode = currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW;

    return (
        <CIMSFormLabel
            fullWidth
            labelText="Booking"
            className={classes.addEncounterContainerItem}
        >
            <Grid item container direction="column" spacing={1}>
                <Grid item container spacing={1}>
                    <EncounterWithRoom
                        encounterGroupConfig={{
                            id: 'booking_select_appointment_booking_encounter_group',
                            xs: 3,
                            isView: currentSelectedApptInfo,
                            textFieldProps: {
                                value: currentSelectedApptInfo?.encntrGrpCd
                            },
                            selectFieldProps: {
                                value: bookingData.encntrGrpCd,
                                isDisabled: isSppEnable ? readMode : true,
                                onChange: e => handleChange({'encntrGrpCd': e.value})
                            }
                        }}
                        encounterTypeConfig={{
                            id:'booking_select_appointment_booking_encounter_type',
                            xs: encntrGrpList && encntrGrpList.length > 1 ? 3 : 4,
                            isView: currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW,
                            textFieldProps: {
                                value: (isCrossService && !isCimsCounterBaseRole) || !isCrossService ? currentSelectedApptInfo?.encntrTypeDesc : '--'
                            },
                            selectFieldProps: {
                                options: filterRoomsEncounterTypeSvc.indexOf(serviceCd) > -1 ?
                                encounterTypesByRooms && encounterTypesByRooms.map(item => (
                                    { value: item.encntrTypeId, label: item.encntrTypeDesc}
                                ))
                                : encounterTypes && encounterTypes.map(item => (
                                    { value: item.encntrTypeId, label: item.description, encounterTypeCd: item.encounterTypeCd }
                                )),
                                value: bookingData.encounterTypeId,
                                isDisabled: isSppEnable ? readMode : true,
                                onChange: e => handleChange(filterRoomsEncounterTypeSvc.indexOf(serviceCd) > -1 ? {'invertedEncounterTypeId': e.value} : {'encounterTypeId': e.value})
                            }
                        }}
                        roomConfig={{
                            id: 'booking_select_appointment_booking_sub_encounter_type',
                            xs: 3,
                            isView: currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW,
                            textFieldProps: {
                                value: !isCrossService ? currentSelectedApptInfo?.rmDesc : '--'
                            },
                            selectFieldProps: {
                                options: filterRoomsEncounterTypeSvc.indexOf(serviceCd) > -1 ?
                                roomsEncounterList && roomsEncounterList.map(item => (
                                    { value: item.rmId, label: item.rmDesc}
                                ))
                                : subEncounterTypes && subEncounterTypes.map(item => (
                                    { value: item.rmId, label: item.description, subEncounterTypeCd: item.subEncounterTypeCd }
                                )),
                                value: bookingData.rmId,
                                isDisabled: isSppEnable ? readMode : true,
                                onChange: e => handleChange(filterRoomsEncounterTypeSvc.indexOf(serviceCd) > -1 ? {'invertedRmId': e.value} : {'rmId': e.value})
                            }
                        }}
                    />
                    {/* {encntrGrpList && encntrGrpList.length > 1 ? <Grid item container xs={3} alignContent="center">
                        {
                            currentSelectedApptInfo ?
                                <FastTextFieldValidator
                                    id={'booking_select_appointment_booking_encounter_group'}
                                    value={currentSelectedApptInfo.encntrGrpCd}
                                    variant="outlined"
                                    label={<>Encounter Group</>}
                                    onChange={null}
                                    disabled
                                />
                                :
                                <SelectFieldValidator
                                    id={'booking_select_appointment_booking_encounter_group'}
                                    placeholder=""
                                    options={encntrGrpList && encntrGrpList.map(item => (
                                        { value: item.encntrGrpCd, label: item.encntrGrpCd }
                                    ))}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Encounter Group<RequiredIcon/></>
                                    }}
                                    value={bookingData.encntrGrpCd}
                                    onChange={e => handleChange({ 'encntrGrpCd': e.value })}
                                    absoluteMessage
                                    isDisabled={currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW}
                                    sortBy="label"
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                />
                        }
                    </Grid> : null}
                    <Grid item container xs={encntrGrpList && encntrGrpList.length > 1 ? 3 : 4} alignContent="center">
                        {
                            currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW ?
                                <FastTextFieldValidator
                                    id={'booking_select_appointment_booking_encounter_type'}
                                    value={(isCrossService && !isCimsCounterBaseRole) || !isCrossService ? currentSelectedApptInfo.encntrTypeDesc : '--'}
                                    variant="outlined"
                                    label={<>Encounter Type</>}
                                    onChange={null}
                                    disabled
                                />
                                :
                                <SelectFieldValidator
                                    id={'booking_select_appointment_booking_encounter_type'}
                                    placeholder=""
                                    options={encounterTypes && encounterTypes.map(item => (
                                        { value: item.encntrTypeId, label: item.description, encounterTypeCd: item.encounterTypeCd }
                                    ))}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Encounter Type<RequiredIcon /></>
                                    }}
                                    value={bookingData.encounterTypeId}
                                    onChange={e => handleChange({ 'encounterTypeId': e.value })}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    absoluteMessage
                                    isDisabled={currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW}
                                    sortBy="label"
                                />
                        }
                    </Grid>
                    <Grid item container xs={3} alignContent="center">
                        {
                            currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW ?
                                <FastTextFieldValidator
                                    id={'booking_select_appointment_booking_sub_encounter_type'}
                                    value={!isCrossService ? currentSelectedApptInfo.rmDesc : '--'}
                                    variant="outlined"
                                    label={<>Room<RequiredIcon /></>}
                                    onChange={null}
                                    disabled
                                />
                                :
                                <AutoSelectFieldValidator
                                    id={'booking_select_appointment_booking_sub_encounter_type'}
                                    placeholder=""
                                    options={subEncounterTypes && subEncounterTypes.map(item => (
                                        { value: item.rmId, label: item.description, subEncounterTypeCd: item.subEncounterTypeCd }
                                    ))}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Room<RequiredIcon /></>
                                    }}
                                    value={bookingData.rmId}
                                    onChange={e => handleChange({ 'rmId': e.value })}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    absoluteMessage
                                    isDisabled={currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW}
                                    sortBy="label"
                                />
                        }
                    </Grid> */}
                    <Grid item container xs={encntrGrpList && encntrGrpList.length > 1 ? 3 : 5}>
                        <CIMSFormLabel
                            fullWidth
                            // labelText={Enum.APPOINTMENT_LABELS.QUOTA_TYPE}
                            labelText={'Quota Type / Appt. Type'}
                            className={classes.formLabelContainer}
                        >
                            <Grid item container wrap="nowrap" spacing={1}>
                                {/* <Grid item xs={6}>
                                    <SelectFieldValidator
                                        id={'booking_select_appointment_booking_case_type'}
                                        options={Enum.APPOINTMENT_TYPE_PERFIX.map(item => (
                                            { value: item.code, label: item.engDesc }
                                        ))}
                                        value={bookingData.caseTypeCd}
                                        placeholder=""
                                        onChange={e => handleChange({'caseTypeCd': e.value})}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        validatorListener={(...args) => validatorListener(...args, 'Appointment Type First Select')}
                                        notShowMsg
                                        isDisabled
                                    />
                                </Grid> */}
                                <Grid item xs={12}>
                                    {
                                        isCrossService ?
                                            <SelectFieldValidator
                                                id={'booking_select_appointment_booking_appointment_type'}
                                                options={[{ value: 'dh', label: '--' }]}
                                                value={'dh'}
                                                onChange={null}
                                                isDisabled
                                            />
                                            :
                                            <SelectFieldValidator
                                                id={'booking_select_appointment_booking_appointment_type'}
                                                options={_quotaTypeList && _quotaTypeList.map(item => (
                                                    { value: item.code, label: item.engDesc }
                                                ))}
                                                value={bookingData.qtType}
                                                placeholder=""
                                                onChange={e => handleChange({ 'qtType': e.value })}
                                                validators={[ValidatorEnum.required]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                absoluteMessage
                                                isDisabled={isSppEnable ? readMode : true}
                                                sortBy="label"
                                            />
                                    }
                                </Grid>
                            </Grid>
                        </CIMSFormLabel>
                    </Grid>
                </Grid>
                {
                    appointmentMode === BookMeans.SINGLE ?
                        <>
                            <Grid item container spacing={1}>
                                <Grid item container xs={7}>
                                    <CIMSFormLabel
                                        fullWidth
                                        labelText={serviceCd === 'ANT' ? 'Date/Time (FROM)' : 'Date/Time'}
                                        className={classes.formLabelContainer}
                                    >
                                        <Grid item container wrap="nowrap" spacing={1}>
                                            <Grid item container xs={7}>
                                                <DateFieldValidator
                                                    style={{ width: 'inherit' }}
                                                    id={'booking_date_appointment_booking_encounter_date'}
                                                    disablePast={!(isWalkIn || (currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW))}
                                                    value={bookingData.appointmentDate}
                                                    placeholder=""
                                                    shouldDisableDate={(date) => {
                                                        if (backdateWalkInDay && isWalkIn) {
                                                            return !moment(date).isBetween(moment().add(-backdateWalkInDay - 1, 'days'), moment());
                                                        } else {
                                                            return false;
                                                        }
                                                    }}
                                                    // TODO :. Next Sprint Delete
                                                    // shouldDisableDate={(date) => { return moment(date).isSame(moment(), 'days'); }}
                                                    // appointmentmindate={!isWalkIn ? moment().add(1, 'day').format(Enum.DATE_FORMAT_EYMD_VALUE) : null}
                                                    // shouldDisableDate={(date) => { return moment(date - 1).isSame(moment(), 'days'); }}
                                                    // appointmentmindate={!isWalkIn ? moment().add(0, 'day').format(Enum.DATE_FORMAT_EYMD_VALUE) : null}
                                                    onAccept={e => {
                                                        let gestWeek = AppointmentUtil.getGestWeekByLmpAndApptDate(lmp, e);
                                                        handleChange({
                                                            appointmentDate: e,
                                                            ...(gestWeek && {
                                                                gestWeekFromWeek: gestWeek.week, gestWeekFromDay: gestWeek.day
                                                            })
                                                        });
                                                    }}
                                                    onChange={e => {
                                                        handleChange({
                                                            appointmentDate: e
                                                        });
                                                    }}
                                                    onBlur={e => {
                                                        if (!e && !bookingData.appointmentTime) {
                                                            let _bookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(bookingData, bookingData.encounterTypeId, bookingData.encounterTypeList);
                                                            handleChange({
                                                                elapsedPeriodUnit: _bookingData.elapsedPeriodUnit,
                                                                elapsedPeriod: _bookingData.elapsedPeriod,
                                                                appointmentTime: null
                                                            });
                                                        }
                                                        if (e) {
                                                            let gestWeek = AppointmentUtil.getGestWeekByLmpAndApptDate(lmp, e);
                                                            handleChange({
                                                                ...(gestWeek && {
                                                                    gestWeekFromWeek: gestWeek.week, gestWeekFromDay: gestWeek.day
                                                                })
                                                            });
                                                        }
                                                        else {
                                                            handleChange({
                                                                gestWeekFromWeek: null,
                                                                gestWeekFromDay: null
                                                            });
                                                        }
                                                    }}
                                                    disabled={isSppEnable ? isWalkIn && !backdateWalkInDay || readMode : true}
                                                    isRequired={bookingData.elapsedPeriod || !bookingData.appointmentTime ? false : true}
                                                    absoluteMessage
                                                    validators={[...(isANTAppt && !isWalkIn && bookingData.appointmentDateTo?.isValid?.() ? [ValidatorEnum.maxDate(bookingData.appointmentDateTo)] : [])]}
                                                    errorMessages={[...(isANTAppt && !isWalkIn && bookingData.appointmentDateTo?.isValid?.() ? [CommonMessage.VALIDATION_NOTE_MAX_DATE(moment(bookingData.appointmentDateTo).format(Enum.DATE_FORMAT_EDMY_VALUE))] : [])]}
                                                />
                                            </Grid>
                                            <Grid item container xs={5}>
                                                <TimeFieldValidator
                                                    id={'booking_time_appointment_booking_encounter_time'}
                                                    helperText=""
                                                    value={bookingData.appointmentTime}
                                                    placeholder=""
                                                    onChange={e => handleChange({ 'appointmentTime': e })}
                                                    onBlur={e => {
                                                        if (!e && !bookingData.appointmentDate) {
                                                            let _bookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(bookingData, bookingData.encounterTypeId, bookingData.encounterTypeList);
                                                            handleChange({
                                                                elapsedPeriodUnit: _bookingData.elapsedPeriodUnit,
                                                                elapsedPeriod: _bookingData.elapsedPeriod,
                                                                appointmentDate: null
                                                            });
                                                        }
                                                    }}
                                                    disabled={isSppEnable ? isWalkIn && !backdateWalkInDay || readMode : true}
                                                    isRequired={bookingData.elapsedPeriod || !bookingData.appointmentDate ? false : true}
                                                    absoluteMessage
                                                />
                                            </Grid>
                                        </Grid>
                                    </CIMSFormLabel>
                                </Grid>
                                {
                                    !isWalkIn ?
                                        <Grid item container xs={5}>
                                            <CIMSFormLabel
                                                fullWidth
                                                labelText="Elapsed Period"
                                                className={classes.formLabelContainer}
                                            >
                                                <Grid item container wrap="nowrap" spacing={1}>
                                                    <Grid item xs={5}>
                                                        <FastTextFieldValidator
                                                            id={'booking_txt_appointment_booking_elapsed_period_num'}
                                                            value={bookingData.elapsedPeriod}
                                                            onChange={e => {
                                                                if (parseInt(e.target.value) === 0) {
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                            onBlur={e => {
                                                                if (e.target.value) {
                                                                    handleChange({ 'elapsedPeriod': e.target.value });
                                                                } else {
                                                                    if (!bookingData.appointmentDate && !bookingData.appointmentTime) {
                                                                        let today = moment().startOf('day');
                                                                        let gestWeek = AppointmentUtil.getGestWeekByLmpAndApptDate(lmp, today);
                                                                        handleChange({
                                                                            elapsedPeriodUnit: '',
                                                                            elapsedPeriod: '',
                                                                            appointmentDate: today,
                                                                            appointmentTime: moment().set({ hours: 0, minute: 0, second: 0 }),
                                                                            ...(gestWeek && {
                                                                                gestWeekFromWeek: gestWeek.week, gestWeekFromDay: gestWeek.day
                                                                            })
                                                                        });
                                                                    }
                                                                }
                                                            }}
                                                            validators={bookingData.appointmentDate || bookingData.appointmentTime ? [] : [ValidatorEnum.required]}
                                                            errorMessages={bookingData.appointmentDate || bookingData.appointmentTime ? [] : [CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                            // withRequiredValidator
                                                            inputProps={{ maxLength: 2 }}
                                                            type="number"
                                                            absoluteMessage
                                                            disabled={isSppEnable ? readMode : true}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={7}>
                                                        <SelectFieldValidator
                                                            id={'booking_select_appointment_booking_elapsed_period_type'}
                                                            options={Enum.ELAPSED_PERIOD_TYPE.map(item => (
                                                                { value: item.code, label: item.engDesc }
                                                            ))}
                                                            fullWidth
                                                            placeholder=""
                                                            value={bookingData.elapsedPeriodUnit}
                                                            onChange={e => handleChange({ 'elapsedPeriodUnit': e.value })}
                                                            validators={bookingData.elapsedPeriod ? [ValidatorEnum.required] : []}
                                                            errorMessages={bookingData.elapsedPeriod ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                                            isDisabled={isSppEnable ? !bookingData.elapsedPeriod || readMode : true}
                                                            TextFieldProps={{ variant: 'outlined' }}
                                                            absoluteMessage
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CIMSFormLabel>
                                        </Grid> : null
                                }
                            </Grid>
                            {isANTAppt && !isWalkIn ?
                            <Grid item container spacing={1}>
                                <Grid item container style={{ flexBasis: '35%' }}>
                                    <CIMSFormLabel
                                        fullWidth
                                        labelText="Date (TO)"
                                        className={classes.formLabelContainer}
                                    >
                                        <Grid item container wrap="nowrap" spacing={1}>
                                            <Grid item container xs={12}>
                                                <DateFieldValidator
                                                    style={{ width: 'inherit' }}
                                                    id={'booking_date_appointment_booking_encounter_date_to'}
                                                    disablePast={!(isWalkIn || (currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW))}
                                                    value={bookingData.appointmentDateTo}
                                                    placeholder=""
                                                    shouldDisableDate={(date) => {
                                                        if (backdateWalkInDay && isWalkIn) {
                                                            return !moment(date).isBetween(moment().add(-backdateWalkInDay - 1, 'days'), moment());
                                                        } else {
                                                            return false;
                                                        }
                                                    }}
                                                    // TODO :. Next Sprint Delete
                                                    // shouldDisableDate={(date) => { return moment(date).isSame(moment(), 'days'); }}
                                                    // appointmentmindate={!isWalkIn ? moment().add(1, 'day').format(Enum.DATE_FORMAT_EYMD_VALUE) : null}
                                                    // shouldDisableDate={(date) => { return moment(date - 1).isSame(moment(), 'days'); }}
                                                    // appointmentmindate={!isWalkIn ? moment().add(0, 'day').format(Enum.DATE_FORMAT_EYMD_VALUE) : null}
                                                    onAccept={e => {
                                                        let gestWeek = AppointmentUtil.getGestWeekByLmpAndApptDate(lmp, e);
                                                        handleChange({
                                                            appointmentDateTo: e,
                                                            ...(gestWeek && {
                                                                gestWeekToWeek: gestWeek.week, gestWeekToDay: gestWeek.day
                                                            })
                                                        });
                                                    }}
                                                    onChange={e => {
                                                        handleChange({
                                                            appointmentDateTo: e
                                                        });
                                                    }}
                                                    onBlur={e => {
                                                        if (e) {
                                                            let gestWeek = AppointmentUtil.getGestWeekByLmpAndApptDate(lmp, e);
                                                            handleChange({
                                                                ...(gestWeek && {
                                                                    gestWeekToWeek: gestWeek.week, gestWeekToDay: gestWeek.day
                                                                })
                                                            });
                                                        }
                                                        else {
                                                            handleChange({
                                                                gestWeekToWeek: null,
                                                                gestWeekToDay: null
                                                            });
                                                        }
                                                    }}
                                                    disabled={isWalkIn && !backdateWalkInDay || (currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW)}
                                                    isRequired={false}
                                                    absoluteMessage
                                                />
                                            </Grid>
                                        </Grid>
                                    </CIMSFormLabel>
                                </Grid>
                                <Grid item container style={{ flexBasis: '32.5%' }}>
                                    <CIMSFormLabel
                                        fullWidth
                                        labelText="Gest Week (FROM)"
                                        className={classes.formLabelContainer}
                                    >
                                        <Grid item container wrap="nowrap" spacing={1}>
                                            <GestWeekInput
                                                id={'booking_date_appointment_booking_gest_week_from'}
                                                weekValue={bookingData.gestWeekFromWeek}
                                                dayValue={bookingData.gestWeekFromDay}
                                                disabled={(isWalkIn && !backdateWalkInDay || (currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW)) || !lmp}
                                                onChange={(isValid, week, day) => {
                                                    let date = null;
                                                    if (isValid && week != null && day != null) {
                                                        date = lmp.clone().add(week, 'week').add(day, 'day');
                                                        // console.log('[ANT] From', 'wrkEdc', wrkEdc.format(), 'lmp', lmp.format(), 'date', date.format());
                                                        // if (!e && !bookingData.appointmentTime) {
                                                        //     let _bookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(bookingData, bookingData.encounterTypeId, bookingData.encounterTypeList);
                                                        //     handleChange({
                                                        //         elapsedPeriodUnit: _bookingData.elapsedPeriodUnit,
                                                        //         elapsedPeriod: _bookingData.elapsedPeriod,
                                                        //         appointmentTime: null
                                                        //     });
                                                        // }
                                                    }
                                                    handleChange({
                                                        // ...(!!date && { appointmentDate: date }),
                                                        appointmentDate: date,
                                                        gestWeekFromWeek: week,
                                                        gestWeekFromDay: day
                                                    });
                                                }}
                                            />
                                        </Grid>
                                    </CIMSFormLabel>
                                </Grid>
                                <Grid item container style={{ flexBasis: '32.5%' }}>
                                    <CIMSFormLabel
                                        fullWidth
                                        labelText="Gest Week (TO)"
                                        className={classes.formLabelContainer}
                                    >
                                        <Grid item container wrap="nowrap" spacing={1}>
                                            <GestWeekInput
                                                id={'booking_date_appointment_booking_gest_week_to'}
                                                weekValue={bookingData.gestWeekToWeek}
                                                dayValue={bookingData.gestWeekToDay}
                                                disabled={(isWalkIn && !backdateWalkInDay || (currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW)) || !lmp}
                                                onChange={(isValid, week, day) => {
                                                    let date = null;
                                                    if (isValid && week != null && day != null) {
                                                        date = lmp.clone().add(week, 'week').add(day, 'day');
                                                        // console.log('[ANT] To', 'wrkEdc', wrkEdc.format(), 'lmp', lmp.format(), 'date', date.format());
                                                    }
                                                    handleChange({
                                                        // ...(!!date && { appointmentDateTo: date }),
                                                        appointmentDateTo: date,
                                                        gestWeekToWeek: week,
                                                        gestWeekToDay: day
                                                    });
                                                }}
                                            />
                                        </Grid>
                                    </CIMSFormLabel>
                                </Grid>
                            </Grid>
                            : null}
                        </>: null
                }
                {
                    serviceCd === "CGS" && bookingData.encounterTypeCd === "IPC" ?
                        <Grid item container spacing={1}>
                            <Grid item container>
                                {
                                    currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW ?
                                        <SelectFieldValidator
                                            id={'booking_select_inpatient_consultation_loc'}
                                            options={IPCLocCodeList && IPCLocCodeList.map(item => (
                                                { value: item.otherId, label: item.engDesc }
                                            ))}
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                label: <>Inpatient Consultation Location</>
                                            }}
                                            value={((isCrossService && !isCimsCounterBaseRole) || !isCrossService) && currentSelectedApptInfo.encounterBaseVo ? currentSelectedApptInfo.encounterBaseVo.cgsInpatientCnsltLocId : '--'}
                                            onChange={null}
                                            isDisabled
                                        />
                                        :
                                        <SelectFieldValidator
                                            id={'booking_select_inpatient_consultation_loc'}
                                            placeholder=""
                                            options={IPCLocCodeList && IPCLocCodeList.map(item => (
                                                { value: item.code, label: item.engDesc, cgsInpatientCnsltLocId: item.otherId }
                                            ))}
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                label: <>Inpatient Consultation Location<RequiredIcon /></>
                                            }}
                                            value={bookingData.cgsInpatientCnsltLocCd}
                                            onChange={e => handleChange({ 'cgsInpatientCnsltLocCd': e.value, 'cgsInpatientCnsltLocId': e.cgsInpatientCnsltLocId })}
                                            validators={[ValidatorEnum.required]}
                                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                            absoluteMessage
                                            isDisabled={currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW}
                                            sortBy="label"
                                        />
                                }
                            </Grid>
                        </Grid> : null
                }
                {
                    appointmentMode === BookMeans.MULTIPLE ?
                        <Grid item container spacing={1}>
                            <Grid item container xs={4} alignContent="center">
                                <DateFieldValidator
                                    id={'booking_date_appointment_booking_multiple_appointmentDate'}
                                    disablePast
                                    value={bookingData.multipleAppointmentDate}
                                    placeholder=""
                                    onChange={e => handleChange({ 'multipleAppointmentDate': e })}
                                    isRequired
                                    absoluteMessage
                                    label={<>Date<RequiredIcon /></>}
                                    disabled={isSppEnable ? readMode : true}
                                />
                            </Grid>
                            <Grid item container xs={3} alignContent="center">
                                <SelectFieldValidator
                                    id={'booking_select_appointment_booking_multiple_noOfAppointment'}
                                    options={['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(item => (
                                        { value: item, label: item }
                                    ))}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>No. of Appt.<RequiredIcon /></>
                                    }}
                                    value={bookingData.multipleNoOfAppointment}
                                    placeholder=""
                                    onChange={e => handleChange({ 'multipleNoOfAppointment': e.value })}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    isDisabled={isSppEnable ? readMode : true}
                                    absoluteMessage
                                />
                            </Grid>
                            <Grid item container xs={5}>
                                <CIMSFormLabel
                                    fullWidth
                                    labelText={<>Interval<RequiredIcon /></>}
                                    className={classes.formLabelContainer}
                                >
                                    <Grid item container wrap="nowrap" spacing={1}>
                                        <Grid item xs={5}>
                                            <SelectFieldValidator
                                                id={'booking_txt_appointment_booking_multiple_interval_num'}
                                                options={['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(item => (
                                                    { value: item, label: item }
                                                ))}
                                                value={bookingData.multipleInterval}
                                                placeholder=""
                                                onChange={e => handleChange({ 'multipleInterval': e.value })}
                                                validators={[ValidatorEnum.required]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                isDisabled={isSppEnable ? readMode : true}
                                                absoluteMessage
                                            />
                                        </Grid>
                                        <Grid item xs={7}>
                                            <SelectFieldValidator
                                                id={'booking_select_appointment_booking_multiple_interval_type'}
                                                options={Enum.INTERVAL_TYPE.map(item => (
                                                    { value: item.code, label: item.engDesc }
                                                ))}
                                                fullWidth
                                                placeholder=""
                                                value={bookingData.multipleIntervalUnit}
                                                onChange={e => handleChange({ 'multipleIntervalUnit': e.value })}
                                                validators={[ValidatorEnum.required]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                isDisabled={isSppEnable ? readMode : true}
                                                absoluteMessage
                                            />
                                        </Grid>
                                    </Grid>
                                </CIMSFormLabel>
                            </Grid>
                        </Grid> : null
                }
                {
                    serviceCd === 'SHS' ?
                        pageStatus === pageStatusEnum.WALKIN ? null
                            : <Grid item container>
                                <DaysOfWeekPanel
                                    id={'booking_days_of_week_panel'}
                                    daysOfWeekValArr={daysOfWeekValArr}
                                    updateDaysOfWeek={props.updateDaysOfWeek}
                                    comDisabled={(currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW)}
                                    validators={(daysOfWeek === '0000000'||daysOfWeek==='1000001') ? [ValidatorEnum.required] : []}
                                    errorMessages={(daysOfWeek === '0000000'||daysOfWeek==='1000001') ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                />
                            </Grid>
                        : null
                }
                {
                    !isWalkIn ?
                        <Grid item container spacing={1}>
                            <Grid item container xs={6}>
                                {
                                    currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW ?
                                        <FastTextFieldValidator
                                            id={'booking_select_appointment_booking_sessions'}
                                            value={currentSelectedApptInfo.sessDesc}
                                            variant="outlined"
                                            label={<>Sessions<RequiredIcon /></>}
                                            disabled
                                        />
                                        :
                                        <SelectFieldValidator
                                            id={'booking_select_appointment_booking_sessions'}
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                label: <>Sessions<RequiredIcon /></>
                                            }}
                                            placeholder=""
                                            value={bookingData.sessId}
                                            options={sessionList && sessionList.map(item => (
                                                { value: item.sessId, label: `${item.sessDesc}` }
                                            ))}
                                            onChange={e => handleChange({ 'sessId': e.value })}
                                            addAllOption
                                            addNullOption={false}
                                            defaultValue="*All"
                                            isDisabled={isSppEnable ? readMode : true}
                                            sortBy="label"
                                        />
                                }
                            </Grid>
                            <Grid item container xs={6}>
                                <FastTextFieldValidator
                                    id={'booking_select_appointment_booking_booking_unit'}
                                    value={bookingData.bookingUnit}
                                    onChange={e => {
                                        if (parseInt(e.target.value) === 0) {
                                            e.target.value = '';
                                        }
                                    }}
                                    onBlur={e => {
                                        handleChange({ 'bookingUnit': e.target.value });
                                    }}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    inputProps={{ maxLength: 1 }}
                                    label={<>Booking Unit<RequiredIcon /></>}
                                    variant="outlined"
                                    disabled={isSppEnable ? readMode : true}
                                />
                            </Grid>
                        </Grid> : null
                }
                {
                    !isWalkIn ?
                        <Grid item container spacing={1}>
                            <Grid item xs={6}>
                                {isCrossService ?
                                    <FastTextFieldValidator
                                        id={'booking_txt_for_doctor_only'}
                                        value={'--'}
                                        variant="outlined"
                                        label="For Doctor Only"
                                        onChange={null}
                                        disabled
                                    />
                                    : <FastTextFieldValidator
                                        id="booking_txt_for_doctor_only"
                                        value={bookingData.forDoctorOnly}
                                        onBlur={e => handleChange({ 'forDoctorOnly': e.target.value })}
                                        inputProps={{ maxLength: 55 }}
                                        label="For Doctor Only"
                                        calActualLength
                                        disabled={isSppEnable ? readMode : true}
                                      />}
                            </Grid>
                            <Grid item xs={6}>
                                {isCrossService ?
                                    <FastTextFieldValidator
                                        id={'booking_txt_priority'}
                                        value={'--'}
                                        variant="outlined"
                                        label="Priority"
                                        onChange={null}
                                        disabled
                                    />
                                    : <FastTextFieldValidator
                                        id="booking_txt_priority"
                                        value={bookingData.priority}
                                        onBlur={e => handleChange({ 'priority': e.target.value })}
                                        inputProps={{ maxLength: 8 }}
                                        label="Priority"
                                        calActualLength
                                        disabled={isSppEnable ? readMode : true}
                                      />}
                            </Grid>
                        </Grid> : null
                }
                {
                    !isWalkIn && appointmentMode !== BookMeans.MULTIPLE && isShowRemarkTemplate ?
                        <Grid item container spacing={1}>
                            <Grid item container>
                                {
                                    isCrossService ?
                                        <SelectFieldValidator
                                            id={'booking_select_appointment_booking_remarkCode'}
                                            options={[{ value: 'dhClinic', label: '--' }]}
                                            value={'dhClinic'}
                                            onChange={null}
                                            isDisabled
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                label: 'Remark Template'
                                            }}
                                        />
                                        :
                                        <SelectFieldValidator
                                            id={'booking_select_appointment_booking_remarkCode'}
                                            value={bookingData.remarkId}
                                            options={remarkCodeList && remarkCodeList.map(item => (
                                                { value: item.remarkId, label: `${item.remarkCd} (${item.description})` }
                                            ))}
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                label: 'Remark Template'
                                            }}
                                            addNullOption
                                            onChange={e => {
                                                if (e.value) {
                                                    let remarkDto = remarkCodeList.find(item => item.remarkId === e.value);
                                                    let _memo = bookingData.memo;
                                                    if ((bookingData.memo || '').split('\n').length < 4) {
                                                        _memo = `${bookingData.memo ? bookingData.memo + '\n' : ''}${remarkDto && remarkDto.description}`;
                                                    }
                                                    handleChange({ 'memo': _memo, 'remarkId': e.value });
                                                } else {
                                                    handleChange({ 'remarkId': e.value });
                                                }
                                            }}
                                            isDisabled={isSppEnable ? readMode : true}
                                        />
                                }
                            </Grid>
                        </Grid> : null
                }
                {
                    !isWalkIn && appointmentMode !== BookMeans.MULTIPLE ?
                        <Grid item container spacing={1}>
                            <Grid item container>
                                {
                                    isCrossService ?
                                        <CIMSMultiTextField
                                            id={'booking_select_appointment_booking_memo'}
                                            fullWidth
                                            value={'--'}
                                            onChange={null}
                                            disabled
                                            label="Memo"
                                            rows={maxRows}
                                        />
                                        :
                                        <FastTextFieldValidator
                                            id={'booking_select_appointment_booking_memo'}
                                            fullWidth
                                            value={bookingData.memo}
                                            inputProps={{ maxLength: 500 }}
                                            label="Memo"
                                            calActualLength
                                            multiline
                                            rows={maxRows}
                                            wordMaxWidth="620"
                                            onBlur={e => handleChange({ 'memo': e.target.value })}
                                            disabled={isSppEnable ? readMode : true}
                                        />
                                }
                            </Grid>
                        </Grid> : null
                }
            </Grid>
        </CIMSFormLabel>
    );
});


const mapStatetoProps = (state) => {
    return ({
        remarkCodeList: state.bookingInformation.remarkCodeList,
        appointmentMode: state.bookingInformation.appointmentMode,
        waitingList: state.bookingInformation.waitingList,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        loginSiteId: state.login.clinic.siteId,
        bookingData: state.bookingInformation.bookingData,
        clinicConfig: state.common.clinicConfig,
        sessionList: state.bookingInformation.sessionList,
        quotaConfig: state.common.quotaConfig,
        pageStatus: state.bookingInformation.pageStatus,
        currentSelectedApptInfo: state.bookingInformation.currentSelectedApptInfo,
        loginInfo: state.login.loginInfo,
        backdateWalkInDay: state.bookingInformation.backdateWalkInDay,
        isShowRemarkTemplate: state.bookingInformation.isShowRemarkTemplate,
        encntrGrpList: state.caseNo.encntrGrpList,
        patientInfo: state.patient.patientInfo,
        IPCLocCodeList: state.common.commonCodeList.cgs_inpatient_cnslt_loc_cd,
        roomsEncounterList: state.common.roomsEncounterList
    });
};

const mapDispatchtoProps = {
};

const styles = theme => ({
    addEncounterContainerItem: {
        padding: 4
    },
    formLabelContainer: {
        paddingTop: 15,
        paddingBottom: 15
    },
    errorFieldNameText: {
        fontSize: '12px',
        wordBreak: 'break-word',
        color: '#fd0000'
    }
});


export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(BookFormBasic));
