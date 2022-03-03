import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import moment from 'moment';
import { Grid } from '@material-ui/core';
import _ from 'lodash';
import { makeStyles } from '@material-ui/styles';
import RequiredIcon from '../../../../../components/InputLabel/RequiredIcon';
import CIMSFormLabel from '../../../../../components/InputLabel/CIMSFormLabel';
import SelectFieldValidator from '../../../../../components/FormValidator/SelectFieldValidator';
import FastTextField from '../../../../../components/TextField/FastTextField';
import FastTextFieldValidator from '../../../../../components/TextField/FastTextFieldValidator';
import TimeFieldValidator from '../../../../../components/FormValidator/TimeFieldValidator';
import DateFieldValidator from '../../../../../components/FormValidator/DateFieldValidator';
import CIMSMultiTextField from '../../../../../components/TextField/CIMSMultiTextField';
import Enum,{ filterRoomsEncounterTypeSvc } from '../../../../../enums/enum';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import { anonPageStatus } from '../../../../../enums/appointment/booking/bookingEnum';
import CommonMessage from '../../../../../constants/commonMessage';
import * as CommonUtil from '../../../../../utilities/commonUtilities';
import { updateState } from '../../../../../store/actions/appointment/booking/bookingAnonymousAction';
import { AppointmentUtil } from '../../../../../utilities';
import AutoSelectFieldValidator from '../../../../../components/FormValidator/AutoSelectFieldValidator';
import DaysOfWeekPanel from '../../component/daysOfWeekPanel';
import EncounterWithRoom from '../../../../../components/EncounterWithRoom/index';


const useStyles = makeStyles(theme => ({
    bookingContainerItem: {
        border: '1px solid rgba(0, 0, 0, 0.23)',
        padding: '16px 18px 16px 18px',
        borderRadius: '4px',
        marginBottom: '2px'
    },
    errorFieldNameText: {
        fontSize: '12px',
        wordBreak: 'break-word',
        color: '#fd0000'
    },
    formLabelContainer: {
        paddingTop: 15,
        paddingBottom: 15
    }
}));

let quotaTypeList = null;

function getInitQuotaTypeList(quotaConfig) {
    let list = CommonUtil.quotaConfig(quotaConfig);
    return list;
}

const BookAnonFormBasic = React.forwardRef((props, ref) => {
    const {
        bookingData,
        handleOnChange,
        remarkCodeList,
        pageStatus,
        quotaConfig,
        sessionList,
        isShowRemarkTemplate,
        encntrGrpList,
        daysOfWeekValArr,
        serviceCd,
        roomsEncounterList
    } = props;
    const classes = useStyles();

    const [encounterTypes,setEncounterTypes]=React.useState(()=>{
        const encounterTypes=_.cloneDeep(bookingData.encounterTypeList);
        return encounterTypes;
    });

    const [encounterTypesByRooms, setEncounterTypesByRooms] = React.useState([]);

    React.useEffect(() => {
        quotaTypeList = getInitQuotaTypeList(quotaConfig);
        return () => {
            quotaTypeList = null;
        };
    }, []);

    React.useEffect(() => {
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
            const getEncounterByRooms = roomsEncounterList.find(item => item.rmCd === bookingData.subEncounterTypeCd);
            setEncounterTypesByRooms(getEncounterByRooms?.encounterTypeDtoList);
        }
    }, [bookingData.subEncounterTypeCd]);



    const getSubEncounterTypeList = memoize((encList, encntrTypeId) => {
        let list = [];
        if (encList && encntrTypeId) {
            const encDto = encList.find(item => item.encntrTypeId === encntrTypeId);
            list = encDto && encDto.subEncounterTypeList;
        }
        return list;
    });

    const subEncounterTypes = getSubEncounterTypeList(bookingData.encounterTypeList, bookingData.encounterTypeId);
    const daysOfWeek=daysOfWeekValArr.join('');
    return (
        <Grid>
            <Grid container spacing={3} style={{ 'marginBottom': '1rem' }}>
                <Grid item container spacing={1} xs={6} alignContent="center">
                    <Grid item xs={encntrGrpList && encntrGrpList.length > 1? 9 : 6}>
                        <Grid item container spacing={1}>
                            <EncounterWithRoom
                                encounterGroupConfig={{
                                    id: 'bookingAnonymous_select_appointment_booking_encounter_group',
                                    xs: 4,
                                    isView: bookingData.appointmentId,
                                    textFieldProps: {
                                        value: bookingData.encntrGrpCd
                                    },
                                    selectFieldProps: {
                                        value: bookingData.encntrGrpCd,
                                        isDisabled: pageStatus === anonPageStatus.UPDATE,
                                        onChange: e => handleOnChange('encntrGrpCd', e.value)
                                    }
                                }}
                                encounterTypeConfig={{
                                    id:'bookingAnonymous_select_appointment_booking_encounter_type',
                                    xs: encntrGrpList.length > 1 ? 4 : 6,
                                    isView: false,
                                    invertedSelectFieldProps: {},
                                    selectFieldProps: {
                                        options: filterRoomsEncounterTypeSvc.indexOf(serviceCd) > -1 ?
                                        encounterTypesByRooms && encounterTypesByRooms.map(item => (
                                            { value: item.encntrTypeCd, label: item.encntrTypeDesc}
                                        ))
                                        : encounterTypes && encounterTypes.map(item => (
                                            { value: item.encounterTypeCd, label: item.description, shortName: item.shortName }
                                        )),
                                        value: bookingData.encounterTypeCd,
                                        onChange: e => handleOnChange(filterRoomsEncounterTypeSvc.indexOf(serviceCd) > -1 ? 'invertedEncounterTypeCd' : 'encounterTypeCd', e.value)
                                    }
                                }}
                                roomConfig={{
                                    id: 'bookingAnonymous_select_appointment_booking_sub_encounter_type',
                                    xs: encntrGrpList.length > 1 ? 4 : 6,
                                    isView: false,
                                    selectFieldProps: {
                                        options: filterRoomsEncounterTypeSvc.indexOf(serviceCd) > -1 ?
                                        roomsEncounterList && roomsEncounterList.map(item => (
                                            { value: item.rmCd, label: item.rmDesc}
                                        ))
                                        : subEncounterTypes && subEncounterTypes.map(item => (
                                            { value: item.subEncounterTypeCd, label: item.description, shortName: item.shortName }
                                        )),
                                        value: bookingData.subEncounterTypeCd,
                                        onChange: e => handleOnChange(filterRoomsEncounterTypeSvc.indexOf(serviceCd) > -1 ? 'invertedSubEncounterTypeCd' : 'subEncounterTypeCd', e.value)
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                    {/* {encntrGrpList && encntrGrpList.length > 1 ? <Grid item xs={3}>
                        {bookingData.appointmentId ?
                            <FastTextField
                                id={'bookingAnonymous_select_appointment_booking_encounter_group'}
                                value={bookingData.encntrGrpCd}
                                variant="outlined"
                                label={<>Encounter Group</>}
                                onChange={null}
                                disabled
                            />
                            : <AutoSelectFieldValidator
                                id={'bookingAnonymous_select_appointment_booking_encounter_group'}
                                placeholder=""
                                options={encntrGrpList && encntrGrpList.map(item => (
                                    { value: item.encntrGrpCd, label: item.encntrGrpCd }
                                ))}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Encounter Group<RequiredIcon/></>
                                }}
                                value={bookingData.encntrGrpCd}
                                onChange={e => handleOnChange('encntrGrpCd', e.value)}
                                absoluteMessage
                                sortBy="label"
                                isDisabled={pageStatus === anonPageStatus.UPDATE}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                              />
                        }
                    </Grid> : null}
                    <Grid item xs={3}>
                        <SelectFieldValidator
                            id={'bookingAnonymous_select_appointment_booking_encounter_type'}
                            options={encounterTypes && encounterTypes.map(item => (
                                { value: item.encounterTypeCd, label: item.description, shortName: item.shortName }
                            ))}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Encounter<RequiredIcon /></>
                            }}
                            value={bookingData.encounterTypeCd}
                            onChange={e => handleOnChange('encounterTypeCd', e.value)}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            absoluteMessage
                            sortBy="label"
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <AutoSelectFieldValidator
                            id={'bookingAnonymous_select_appointment_booking_sub_encounter_type'}
                            options={subEncounterTypes && subEncounterTypes.map(item => (
                                {
                                    value: item.subEncounterTypeCd,
                                    label: item.description,
                                    shortName: item.shortName
                                }
                            ))}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Room<RequiredIcon /></>
                            }}
                            value={bookingData.subEncounterTypeCd}
                            onChange={e => handleOnChange('subEncounterTypeCd', e.value)}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            absoluteMessage
                        />
                    </Grid> */}
                    <Grid item xs={encntrGrpList && encntrGrpList.length > 1 ? 3 : 6}>
                        <SelectFieldValidator
                            id={'bookingAnonymous_select_appointment_booking_appointment_type'}
                            options={quotaTypeList && quotaTypeList.map(item => (
                                { value: item.code, label: item.engDesc }
                            ))}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Quota Type / Appt. Type<RequiredIcon /></>
                            }}
                            value={bookingData.qtType}
                            onChange={e => handleOnChange('qtType', e.value)}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            absoluteMessage
                        />
                    </Grid>
                </Grid>

                {/* <Grid item container spacing={1} xs={3} alignContent="center">
                    <CIMSFormLabel
                        // fullWidth
                        labelText={<>Appointment Type<RequiredIcon /></>}
                        className={classes.formLabelContainer}
                    >
                    <Grid container wrap="nowrap" alignContent="center">
                        <Grid item xs={12}>
                    <SelectFieldValidator
                        id={'bookingAnonymous_select_appointment_booking_appointment_type'}
                        options={quotaTypeList && quotaTypeList.map(item => (
                            {value: item.code, label: item.engDesc}
                        ))}
                        TextFieldProps={{
                            variant: 'outlined',
                            label: <>Quota Type<RequiredIcon/></>
                        }}
                        value={bookingData.qtType}
                        // onChange={e => handleOnChange('appointmentTypeCd', e.value)}
                        onChange={e => handleOnChange('qtType', e.value)}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                    />
                    </Grid>
                    </Grid>
                    </CIMSFormLabel>
                </Grid> */}
                <Grid item xs={3}>
                    <CIMSFormLabel
                        labelText="Date/Time"
                        className={classes.formLabelContainer}
                    >
                        <Grid container wrap="nowrap" spacing={1}>
                            <Grid item xs={7}>
                                <DateFieldValidator
                                    id={'bookingAnonymous_date_appointment_booking_encounter_date'}
                                    disablePast
                                    value={bookingData.appointmentDate}
                                    onChange={e => handleOnChange('appointmentDate', e)}
                                    onBlur={e => {
                                        if (!e && !bookingData.appointmentTime) {
                                            let _bookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(bookingData, bookingData.encounterTypeId, bookingData.encounterTypeList);
                                            handleOnChange({
                                                elapsedPeriodUnit: _bookingData.elapsedPeriodUnit,
                                                elapsedPeriod: _bookingData.elapsedPeriod,
                                                appointmentTime: null
                                            });
                                        }
                                    }}
                                    isRequired={!bookingData.elapsedPeriod}
                                    absoluteMessage
                                    placeholder=""
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <TimeFieldValidator
                                    id={'bookingAnonymous_time_appointment_booking_encounter_time'}
                                    value={bookingData.appointmentTime}
                                    helperText=""
                                    onChange={e => handleOnChange('appointmentTime', e)}
                                    onBlur={e => {
                                        if (!e && !bookingData.appointmentDate) {
                                            let _bookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(bookingData, bookingData.encounterTypeId, bookingData.encounterTypeList);
                                            handleOnChange({
                                                elapsedPeriodUnit: _bookingData.elapsedPeriodUnit,
                                                elapsedPeriod: _bookingData.elapsedPeriod,
                                                appointmentDate: null
                                            });
                                        }
                                    }}
                                    validators={bookingData.elapsedPeriod ? [] : [ValidatorEnum.required]}
                                    errorMessages={bookingData.elapsedPeriod ? [] : [CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    absoluteMessage
                                    placeholder=""
                                />
                            </Grid>
                        </Grid>
                    </CIMSFormLabel>
                </Grid>
                <Grid item xs={3} style={{ 'paddingRight': '0' }}>
                    <CIMSFormLabel
                        // fullWidth
                        labelText={<>{'Elapsed Period'}</>}
                        className={classes.formLabelContainer}
                    >
                        <Grid container wrap="nowrap" spacing={1}>
                            <Grid item xs={6}>
                                <FastTextFieldValidator
                                    id={'bookingAnonymous_txt_appointment_booking_elapsed_period_num'}
                                    value={bookingData.elapsedPeriod}
                                    onChange={e => {
                                        if (parseInt(e.target.value) === 0) {
                                            e.target.value = '';
                                        }
                                    }}
                                    onBlur={e => {
                                        if (e.target.value) {
                                            handleOnChange('elapsedPeriod', e.target.value);
                                        } else {
                                            if (!bookingData.appointmentDate && !bookingData.appointmentTime) {
                                                props.updateState({
                                                    bookingData: {
                                                        ...bookingData,
                                                        elapsedPeriod: '',
                                                        elapsedPeriodUnit: '',
                                                        appointmentDate: moment(),
                                                        appointmentTime: moment().set({ hours: 0, minute: 0, second: 0 })
                                                    }
                                                });
                                            }
                                        }
                                        // if(!e.target.value && !bookingData.appointmentDate && !bookingData.appointmentTime) {
                                        //     props.updateState({
                                        //         bookingData: {
                                        //             ...bookingData,
                                        //             elapsedPeriod: '',
                                        //             elapsedPeriodUnit: '',
                                        //             appointmentDate: moment(),
                                        //             appointmentTime: moment().set({ hours: 0, minute: 0, second: 0 })
                                        //         }
                                        //     });
                                        // }
                                    }}
                                    validators={bookingData.appointmentDate || bookingData.appointmentTime ? [] : [ValidatorEnum.required]}
                                    errorMessages={bookingData.appointmentDate || bookingData.appointmentTime ? [] : [CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    inputProps={{ maxLength: 2 }}
                                    type="number"
                                    absoluteMessage
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <SelectFieldValidator
                                    id={'bookingAnonymous_select_appointment_booking_elapsed_period_type'}
                                    options={Enum.ELAPSED_PERIOD_TYPE.map(item => (
                                        { value: item.code, label: item.engDesc }
                                    ))}
                                    fullWidth
                                    value={bookingData.elapsedPeriodUnit}
                                    onChange={e => handleOnChange('elapsedPeriodUnit', e.value)}
                                    validators={bookingData.elapsedPeriod ? [ValidatorEnum.required] : []}
                                    errorMessages={bookingData.elapsedPeriod ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                />
                            </Grid>
                        </Grid>
                    </CIMSFormLabel>
                </Grid>
                {
                    props.serviceCd === 'SHS' ?
                        <Grid item xs={6}>
                            <DaysOfWeekPanel
                                id={'bookingAnonymous_days_of_week_panel'}
                                daysOfWeekValArr={daysOfWeekValArr}
                                updateDaysOfWeek={props.updateDaysOfWeek}
                                validators={(daysOfWeek === '0000000'||daysOfWeek==='1000001') ? [ValidatorEnum.required] : []}
                                errorMessages={(daysOfWeek === '0000000'||daysOfWeek==='1000001') ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                            />
                        </Grid>
                        : null
                }
            </Grid>

            {/* {
                props.serviceCd === 'SHS' ?
                    <Grid container spacing={3} style={{ 'marginBottom': '1rem',padding:8 }}>
                        <DaysOfWeekPanel
                            id={'bookingAnonymous_days_of_week_panel'}
                            daysOfWeekValArr={daysOfWeekValArr}
                            updateDaysOfWeek={props.updateDaysOfWeek}
                        />
                    </Grid>
                    : null
            } */}
            <Grid container spacing={3} style={{ 'marginBottom': '1rem' }}>
                <Grid item xs={3}>
                    <SelectFieldValidator
                        id={'bookingAnonymous_select_appointment_booking_sessions'}
                        fullWidth
                        TextFieldProps={{
                            variant: 'outlined',
                            label: <>Sessions<RequiredIcon /></>
                        }}
                        value={bookingData.sessId}
                        options={sessionList && sessionList.map(item => (
                            { value: item.sessId, label: `${item.sessDesc}` }
                        ))}
                        onChange={e => handleOnChange('sessId', e.value)}
                        // notShowMsg
                        addAllOption
                        addNullOption={false}
                        defaultValue="*All"
                    />
                </Grid>
                <Grid item xs={3}>
                    <FastTextFieldValidator
                        id={'bookingAnonymous_select_appointment_booking_booking_unit'}
                        value={bookingData.bookingUnit}
                        label={<>{'Booking Unit'}<RequiredIcon /></>}
                        onChange={e => {
                            if (parseInt(e.target.value) === 0) {
                                e.target.value = '';
                            }
                        }}
                        onBlur={e => {
                            handleOnChange('bookingUnit', e.target.value);
                        }}
                        validators={['isPositiveInteger']}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                        inputProps={{ maxLength: 1 }}
                        type="number"
                    />
                </Grid>
                <Grid item xs={6}>
                    {
                        isShowRemarkTemplate ?
                            <SelectFieldValidator
                                id={'bookingAnonymous_select_appointment_booking_remarkCode'}
                                fullWidth
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Remark Template</>
                                }}
                                value={bookingData.remarkId}
                                options={remarkCodeList && remarkCodeList.map(item => (
                                    { value: item.remarkId, label: `${item.remarkCd} (${item.description})` }
                                ))}
                                onChange={e => handleOnChange('remarkId', e.value)}
                                isDisabled={pageStatus === anonPageStatus.CONFIRMED}
                            />
                            : null
                    }
                </Grid>
            </Grid>
            <Grid container spacing={3} style={{ 'marginBottom': '1rem' }}>
                <Grid item xs={12}>
                    <FastTextField
                        id={'bookingAnonymous_select_appointment_booking_memo'}
                        label={'Memo'}
                        value={bookingData.memo}
                        inputProps={{ maxLength: 500 }}
                        multiline
                        rows="4"
                        wordMaxWidth="620"
                        calActualLength
                        onBlur={e => handleOnChange('memo', e.target.value)}
                    // onChange={e => {
                    //     // eslint-disable-next-line no-constant-condition
                    //     while (true) {
                    //         const byteSize = CommonUtil.getUTF8StringLength(e.target.value);
                    //         if (byteSize <= e.target.maxLength) {
                    //             break;
                    //         }
                    //         e.target.value = e.target.value.substr(0, e.target.value.length - 1);
                    //     }
                    //     handleOnChange('memo', e.target.value);
                    // }}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
});

const mapStatetoProps = (state) => {
    return {
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        clinicConfig: state.common.clinicConfig,
        bookingData: state.bookingAnonymousInformation.bookingData,
        remarkCodeList: state.bookingAnonymousInformation.remarkCodeList,
        pageStatus: state.bookingAnonymousInformation.pageStatus,
        quotaConfig: state.common.quotaConfig,
        sessionList: state.bookingAnonymousInformation.sessionList,
        loginSiteId: state.login.clinic.siteId,
        isShowRemarkTemplate: state.bookingAnonymousInformation.isShowRemarkTemplate,
        encntrGrpList: state.caseNo.encntrGrpList,
        roomsEncounterList: state.common.roomsEncounterList
    };
};

const mapDispatchtoProps = {
    updateState
};

export default connect(mapStatetoProps, mapDispatchtoProps)(BookAnonFormBasic);
