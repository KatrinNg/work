import React from 'react';
import { connect } from 'react-redux';
import { Grid, Popper, Paper, Fade, Badge } from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import { cancelEditAppointment, init_bookingData } from '../../../../../store/actions/appointment/booking/bookingAction';
import { openCommonMessage } from '../../../../../store/actions/message/messageAction';
import * as AppointmentUtil from '../../../../../utilities/appointmentUtilities';
import { PageStatus as pageStatusEnum, BookMeans } from '../../../../../enums/appointment/booking/bookingEnum';
import * as CommonUtil from '../../../../../utilities/commonUtilities';
import Enum from '../../../../../enums/enum';
import {auditAction} from '../../../../../store/actions/als/logAction';
import CIMSLightToolTip from '../../../../../components/ToolTip/CIMSLightToolTip';
import FamilyNumberBtn from './familyMember/FamilyNumberBtn';

const BookFormBtnGrp = React.forwardRef((props, ref) => {
    const {
        appointmentMode, //NOSONAR
        pageStatus, //NOSONAR
        patientInfo, //NOSONAR
        currentSelectedApptInfo, //NOSONAR
        bookingData, //NOSONAR
        handleBookClick, //NOSONAR
        handleUpdateAppointment, //NOSONAR
        cancelEditAppointment, //NOSONAR
        handleCancelUpdateAppt, //NOSONAR
        openCommonMessage, //NOSONAR
        waitingList, //NOSONAR
        handleGestationCalc, //NOSONAR
        isUseGestCalc, //NOSONAR
        clinicConfig, //NOSONAR
        svcCd, //NOSONAR
        siteId, //NOSONAR
        daysOfWeekValArr,
        isSppEnable,
        appointmentListCart,
        checkIsDirty,
        serviceCd,
        familyMemberData
    } = props;

    const styles = makeStyles(theme => ({
        popperRoot: {
            padding: '6px 8px',
            marginTop: 5
        },
        customSizeSmall: {
            margin: `0px ${theme.spacing(1)}px`,
            padding: '4px 12px'
        },
        badge:{
            "& .MuiBadge-badge":{
                right: '10px'
            }
        }
    }));

    const isDataEditing = AppointmentUtil.isBookingDataEditing(currentSelectedApptInfo, bookingData, daysOfWeekValArr);
    const isShowNewCaseBooking = React.useMemo(() => {
        return pageStatus === pageStatusEnum.VIEW
            && CommonUtil.isNewCaseBookingFlow()
            && CommonUtil.isUseCaseNo()
            && !waitingList;
    }, [pageStatus, waitingList]);

    const isShowGestationCalc = React.useMemo(() => {
        return isUseGestCalc
            && bookingData && bookingData.encounterTypeCd === 'ENC_NEW'
            && pageStatus !== pageStatusEnum.WALKIN
            && appointmentMode === BookMeans.SINGLE;
    }, [bookingData, pageStatus, appointmentMode]);

    const isShowAttendAndPrint = React.useMemo(() => {
        let where = { serviceCd: svcCd, siteId };
        let config = CommonUtil.getHighestPrioritySiteParams(Enum.CLINIC_CONFIGNAME.IS_ALLOW_WALK_IN_PRINT_APPT_SLIP, clinicConfig, where);
        let configVal = config && config.paramValue;
        return pageStatus === pageStatusEnum.WALKIN
            && parseInt(configVal) === 1;
    }, [pageStatus]);

    const isShowNepMessage = React.useMemo(() => {
        let encounterTypeList = bookingData.encounterTypeList;
        let encounter = encounterTypeList.find(encounter => encounter.encntrTypeId === bookingData.encounterTypeId);
        return svcCd === 'SHS'
            && bookingData.isNep
            && encounter && encounter.isCharge === 0
            && pageStatus === pageStatusEnum.WALKIN;
    }, [bookingData, pageStatus]);

    const [openSppDisableTooltip, setOpenSppDisableTooltip] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleBookBtnMouseIn = (e) => {
        if (svcCd === 'SPP' && !isSppEnable) {
            setOpenSppDisableTooltip(true);
            setAnchorEl(e.currentTarget);
        }
    };

    const handleBookBtnMouseOut = () => {
        if (svcCd === 'SPP' && !isSppEnable) {
            setOpenSppDisableTooltip(false);
            setAnchorEl(null);
        }
    };

    const classes = styles();

    const setDisabledForSppMultipleAppointment = () => {
        let disabled = false;
        if(appointmentListCart && appointmentListCart.length){
            disabled = false;
        }else{
            if(checkIsDirty()){
                disabled = false;
            }else{
                disabled = true;
            }
        }
        return disabled;
    };
    const pmiGrpName = patientInfo?.cgsSpecOut?.pmiGrpName || '';

    return (
        <Grid item container alignItems="center" justify="flex-end">
            {serviceCd === 'CGS' && appointmentMode === BookMeans.SINGLE && pageStatus !== pageStatusEnum.WALKIN && pmiGrpName && (
                <FamilyNumberBtn
                    isShowHistory
                    isEdit={pageStatus === pageStatusEnum.EDIT}
                    disabled={currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW || familyMemberData.length < 2 ? true : false}
                    appointmentId={currentSelectedApptInfo?.appointmentId || null}
                />
            )}
            {isShowNepMessage ? <Grid style={{ color: 'red', fontWeight: 'bold' }}>Payment is required for NEP status.</Grid> : null}
            {
                isShowGestationCalc ?
                    <CIMSButton
                        id="appointment_gestationCalBtn"
                        style={{ marginRight: 0 }}
                        onClick={() => { props.auditAction('Open Gestation Calculator', null, null, false, 'ana'); handleGestationCalc(); }}
                        children="Gestation Calculator"
                        disabled={pageStatus === pageStatusEnum.VIEW && currentSelectedApptInfo ? true : false}
                    />
                    : null
            }
            {
                isShowAttendAndPrint && pageStatus === pageStatusEnum.WALKIN ?
                    <CIMSButton
                        id={'btn_appointment_attend_print'}
                        disabled={isSppEnable ? patientInfo && patientInfo.patientKey && !parseInt(patientInfo.deadInd) ? false : true : true}
                        onClick={() => { props.auditAction('Click Attend and Print Button', null, null, false, 'ana'); handleBookClick('AttendAndPrint'); }}
                    >Attend and Print</CIMSButton> : null
            }
            {
                pageStatus === pageStatusEnum.WALKIN ?
                    <CIMSButton
                        id={'btn_appointment_walkIn_booking'}
                        disabled={isSppEnable ? patientInfo && patientInfo.patientKey && !parseInt(patientInfo.deadInd) ? false : true : true}
                        onClick={() => { props.auditAction('Click Book and Attend Button', null, null, false, 'ana'); handleBookClick('Book'); }}
                    >Book and Attend</CIMSButton> : null
            }
            {
                isShowNewCaseBooking ?
                    <CIMSButton
                        id="btn_appointment_booking_newCaseBooking"
                        disabled={currentSelectedApptInfo ? true : false}
                        onClick={() => { props.auditAction('Click New Case Booking Button', null, null, false, 'ana'); handleBookClick('NewCaseBook'); }}
                    >New Case Booking</CIMSButton> : null
            }
            {
                pageStatus === pageStatusEnum.VIEW ?
                    <Grid
                        onMouseEnter={handleBookBtnMouseIn}
                        onMouseLeave={handleBookBtnMouseOut}
                    >
                        {
                            svcCd === 'SPP' && appointmentMode === BookMeans.MULTIPLE?
                                <Grid>
                                    <CIMSButton
                                        id="btn_appointment_booking_booking"
                                        disabled={isSppEnable ? currentSelectedApptInfo ? true : setDisabledForSppMultipleAppointment() : true}
                                        onClick={() => {
                                            props.auditAction('Click Book Button', null, null, false, 'ana');
                                            handleBookClick('sppBook');
                                        }}
                                        classes={{
                                            sizeSmall:classes.customSizeSmall
                                        }}
                                    >Book</CIMSButton>
                                    <CIMSButton
                                        id="btn_appointment_booking_add"
                                        disabled={isSppEnable ? currentSelectedApptInfo ? true : false : true}
                                        onClick={() => { props.auditAction('Click Add Button', null, null, false, 'ana'); handleBookClick('Add'); }}
                                        classes={{
                                            sizeSmall:classes.customSizeSmall
                                        }}
                                    >Add</CIMSButton>
                                    <Badge
                                        className={classes.badge}
                                        color="secondary"
                                        badgeContent={appointmentListCart?.length || 0}
                                        showZero
                                    >
                                        <CIMSButton
                                            id="btn_appointment_booking_detail"
                                            disabled={isSppEnable && appointmentListCart && appointmentListCart.length ? currentSelectedApptInfo ? true : false : true}
                                            onClick={() => { props.auditAction('Click Detail Button', null, null, false, 'ana'); handleBookClick('DETAIL'); }}
                                            classes={{
                                                sizeSmall:classes.customSizeSmall
                                            }}
                                        >DETAIL</CIMSButton>
                                    </Badge>
                                </Grid> :
                            <CIMSButton
                                id="btn_appointment_booking_booking"
                                disabled={isSppEnable ? currentSelectedApptInfo ? true : false : true}
                                onClick={() => { props.auditAction('Click Book Button', null, null, false, 'ana'); handleBookClick('Book'); }}
                                classes={{
                                    sizeSmall:classes.customSizeSmall
                                }}
                            >Book</CIMSButton>
                        }
                        {
                            isSppEnable ? null :
                                <Popper open={openSppDisableTooltip} placement="bottom" anchorEl={anchorEl} transition>
                                    {({ TransitionProps }) => {
                                        return (
                                            <Fade {...TransitionProps} timeout={350}>
                                                <Paper className={classes.popperRoot}>
                                                    <Grid item container>
                                                        SPP service is not enabled!
                                                    </Grid>
                                                </Paper>
                                            </Fade>
                                        );
                                    }}
                                </Popper>
                        }
                    </Grid>
                    : null
            }
            {
                pageStatus === pageStatusEnum.EDIT ?
                    <Grid>
                        <CIMSButton
                            id="btn_appointment_booking_update_appointment"
                            style={{ marginRight: 0 }}
                            disabled={!isDataEditing}
                            onClick={() => { props.auditAction('Click Update Button', null, null, false, 'ana'); handleUpdateAppointment(); }}
                        >Update</CIMSButton>
                        <CIMSButton
                            id="btn_appointment_booking_update_appointment"
                            onClick={() => {
                                props.auditAction('Cancel Edit Appointment',null,null,false,'ana');
                                if (!isDataEditing) {
                                    cancelEditAppointment();
                                    handleCancelUpdateAppt();
                                } else {
                                    openCommonMessage({
                                        msgCode: '111214',
                                        btnActions: {
                                            btn1Click: () => {
                                                cancelEditAppointment();
                                                handleCancelUpdateAppt();
                                            }
                                        }
                                    });
                                }
                            }}
                            disabled={!isSppEnable}
                        >Cancel</CIMSButton>
                    </Grid> : null
            }
        </Grid>
    );
});


const mapStatetoProps = (state) => {
    return ({
        patientInfo: state.patient.patientInfo,
        pageStatus: state.bookingInformation.pageStatus,
        bookingData: state.bookingInformation.bookingData,
        currentSelectedApptInfo: state.bookingInformation.currentSelectedApptInfo,
        waitingList: state.bookingInformation.waitingList,
        appointmentMode: state.bookingInformation.appointmentMode,
        clinicConfig: state.common.clinicConfig,
        svcCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        appointmentListCart: state.bookingInformation.appointmentListCart,
        serviceCd: state.login.service.serviceCd,
        familyMemberData: state.bookingInformation.familyMemberData
    });
};

const mapDispatchtoProps = {
    openCommonMessage,
    cancelEditAppointment,
    init_bookingData,
    auditAction
};

export default connect(mapStatetoProps, mapDispatchtoProps)(BookFormBtnGrp);
