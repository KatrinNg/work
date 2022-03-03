import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    Tooltip,
    Badge
} from '@material-ui/core';
import CIMSButton from '../../components/Buttons/CIMSButton';
import Enum from '../../enums/enum';
import { CommonUtil, PatientUtil, CaseNoUtil, AppointmentUtil, EnctrAndRmUtil } from '../../utilities';
import moment from 'moment';
import { connect } from 'react-redux';
import { BookMeans } from '../../enums/appointment/booking/bookingEnum';
import FeaturedPlayListIcon from '@material-ui/icons/FeaturedPlayListOutlined';
import AddIcon from '@material-ui/icons/Add';
import FamilyBookingResultBtn from '../appointment/booking/component/bookForm/familyMember/FamilyBookingResultBtn';

const styles = theme => ({
    confirmationInfo: {
        height: '100%',
        backgroundColor: theme.palette.primary.main,
        position: 'relative'
    },
    confirmationInfoItem: {
        width: '100%',
        fontSize: '2.5em',
        color: theme.palette.white,
        textAlign: 'center',
        padding: '0px 8px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    nextBookingContent: {
        position: 'absolute',
        bottom: '40px',
        left: '70px'
    },
    caseContent: {
        fontSize: '1.25em',
        position: 'absolute',
        bottom: '40px',
        right: '70px',
        padding: '13px 25px',
        background: '#d1d11c',
        fontWeight: 'bolder'
    },
    customSizeSmall: {
        margin: `0px ${theme.spacing(1)}px`,
        padding: '4px 12px'
    },
    badge:{
        "& .MuiBadge-badge":{
            right: '10px'
        }
    },
    sppMultipleBookResult: {
        position: 'absolute',
        top: 40,
        left: 70
    }
});

const LightTooltip = withStyles((theme) => ({
    tooltip: {
        backgroundColor: '#ffffff',
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: '1em',
        marginTop: 5
    }
}))(Tooltip);

class ConfirmationWindow extends React.Component {

    getPrimaryDocType = (value) => {
        const docTypeCode = this.props.docTypeCodeList.find(item => item.code === value);
        if (value) {
            switch (value) {
                case 'ID':
                    return 'HKID';
                case 'BC':
                    return 'HKBC';
                default:
                    return docTypeCode && docTypeCode.code;
            }

        }
        return '';
    };

    getConfirmationDocPair = (patient) => {
        let docType = this.getPrimaryDocType(patient.primaryDocTypeCd);
        let docNo = PatientUtil.isHKIDFormat(docType) ? PatientUtil.getHkidFormat(patient.primaryDocNo) : (patient.primaryDocNo + ' (' + docType + ')');
        return docNo;
    }

    render() {
        const {
            classes,
            patientInfo,
            confirmationInfo,
            id,
            bookingDataEncounterTypeList,
            encounterTypes,
            rooms,
            patientStatusList = [],
            serviceCd,
            successCount,
            totalCount,
            type,
            isAttend,
            isDateBack
        } = this.props;

        // let hkid;
        // let hkidNum;
        // if (patientInfo && patientInfo.hkid) {
        //     hkid = patientInfo.hkid.substring(0, patientInfo.hkid.length - 1);
        //     hkidNum = patientInfo.hkid.substring(patientInfo.hkid.length - 1);
        // } else if (patientInfo && patientInfo.otherDocNo) {
        //     hkid = patientInfo.otherDocNo;
        //     hkidNum = patientInfo.docTypeCd;
        // }

        let patientStatusCdDisplay = null;
        if (confirmationInfo && confirmationInfo.patientStatusCd) {
            let patientStatus = patientStatusList.find(ps => ps.code === confirmationInfo.patientStatusCd);
            patientStatusCdDisplay = patientStatus ? patientStatus.superCode : null;
        }

        let encounterTypeName = confirmationInfo && confirmationInfo.encntrTypeDesc || '';
        let roomDesc = confirmationInfo && confirmationInfo.rmDesc || '';
        if (!encounterTypeName) {
            //let encounterTypeName = (encounterTypes && encounterTypes.find(x => x.encntrTypeId === confirmationInfo.encntrTypeId) || {}).encntrTypeDesc || '';
            const encounter = (encounterTypes && encounterTypes.find(x => x.encntrTypeId === confirmationInfo.encntrTypeId));
            encounterTypeName = encounter ? encounter.encntrTypeDesc || '' : '';
            // If the common.encounterTypeList is null; This is a CROSS_BOOK need check the bookingDataEncounterType;
            if (!encounterTypeName) {
                encounterTypeName = EnctrAndRmUtil.getEncounterTypeCdById(confirmationInfo.encntrTypeId, bookingDataEncounterTypeList);
            }
        }

        if (!roomDesc) {
            roomDesc = EnctrAndRmUtil.getRmCdById(confirmationInfo.rmId, rooms);
        }

        const isDisplayPaymentInfoSiteParam = CommonUtil.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, this.props.loginSiteId, 'IS_DISPLAY_PAYMENT_INFO');
        const useCaseNo = CommonUtil.isUseCaseNo();
        let isDisplayPaymentInfo = (isDisplayPaymentInfoSiteParam && isDisplayPaymentInfoSiteParam.configValue) || 0;

        return (
            <Grid item container direction="column" xs={12} justify="center" className={classes.confirmationInfo}>
                {
                    serviceCd === 'SPP' && confirmationInfo.appointmentMode === BookMeans.MULTIPLE ?
                        <Grid item className={classes.sppMultipleBookResult}>
                            <Badge
                                className={classes.badge}
                                color="secondary"
                                badgeContent={`${successCount}/${totalCount}`}
                            >
                                <CIMSButton
                                    id={`${id}_book_result_btn`}
                                    onClick={() => { }}
                                    classes={{
                                        sizeSmall: classes.customSizeSmall
                                    }}
                                ><>Book Result&nbsp;<FeaturedPlayListIcon/></></CIMSButton>
                            </Badge>
                        </Grid>
                        : null
                }

                <FamilyBookingResultBtn isAttend={isAttend} isDateBack={isDateBack} />

                <Typography
                    id={`${id}_doc_no`}
                    className={classes.confirmationInfoItem}
                >
                    {this.getConfirmationDocPair(patientInfo)}
                </Typography >

                <LightTooltip
                    title={CommonUtil.getFullName(patientInfo.engSurname, patientInfo.engGivename)}
                >
                    <Typography
                        id={`${id}_english_name`}
                        className={classes.confirmationInfoItem}

                    >
                        {CommonUtil.getFullName(patientInfo.engSurname, patientInfo.engGivename)}
                    </Typography>
                </LightTooltip>

                {
                    patientInfo.nameChi ?
                        <LightTooltip
                            title={`(${patientInfo.nameChi})`}
                        >
                            <Typography
                                id={`${id}_chinese_name`}
                                className={classes.confirmationInfoItem}
                            >
                                {`(${patientInfo.nameChi})`}
                            </Typography></LightTooltip>
                        : null
                }

                {
                    useCaseNo ?
                        <Typography
                            id={`${id}_case_no`}
                            className={classes.confirmationInfoItem}
                        >
                            {/* {confirmationInfo && `${CaseNoUtil.getFormatCaseNo(confirmationInfo.caseNo)}`} */}
                            {confirmationInfo && `${CaseNoUtil.getCaseAlias(confirmationInfo)}`}
                        </Typography>
                        : null
                }

                <LightTooltip title={confirmationInfo && `${encounterTypeName} - ${roomDesc}`}>
                    <Typography
                        id={`${id}_encounter_and_sub_encounter`}
                        className={classes.confirmationInfoItem}
                    >
                        {confirmationInfo && `${encounterTypeName} - ${roomDesc}`}
                    </Typography>
                </LightTooltip>

                <Typography
                    id={`${id}_appointment_date_and_time`}
                    className={classes.confirmationInfoItem}
                >
                    {
                        confirmationInfo && AppointmentUtil.combineApptDateAndTime(
                            {
                                appointmentDate: moment(confirmationInfo.appointmentDate).format(Enum.DATE_FORMAT_MMMM_24_HOUR),
                                appointmentTime: moment(confirmationInfo.appointmentDate).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)
                            },
                            Enum.APPOINTMENT_BOOKING_DATE
                        )
                    }
                </Typography>

                {
                    patientStatusCdDisplay ?
                        <Typography
                            id={`${id}_patient_status`}
                            className={classes.confirmationInfoItem}
                        >
                            {/* {`Status(${this.props.patientStatus})`} */}
                            {`Status (${patientStatusCdDisplay})`}
                        </Typography> : null
                }

                {
                    isDisplayPaymentInfo == 1 && confirmationInfo && confirmationInfo.amount ?
                        <Typography
                            id={`${id}_amount`}
                            className={classes.confirmationInfoItem}
                        >
                            {`Amt: $${confirmationInfo.amount}`}
                        </Typography> : null
                }

                {
                    isDisplayPaymentInfo == 1 && confirmationInfo && confirmationInfo.paymentMeanCD ?
                        <Typography
                            id={`${id}_pay_means`}
                            className={classes.confirmationInfoItem}
                        >
                            {`Pay Means: ${confirmationInfo.paymentMeanCD}`}
                        </Typography> : null
                }
                {
                    (confirmationInfo && confirmationInfo.appointmentMode === BookMeans.MULTIPLE && confirmationInfo.multipleNoOfAppointment&&serviceCd!=='SPP') ?
                        <Typography
                            id={`${id}_multipleNoOfAppointment`}
                            className={classes.confirmationInfoItem}
                            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                            {`No. of booked appointment : ${confirmationInfo.multipleNoOfAppointment}`}
                        </Typography>
                        : null
                }

                {/* {
                    confirmationInfo && confirmationInfo.remarkId ?
                        <Typography
                            id={`${id}_remark`}
                            className={classes.confirmationInfoItem}
                            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                            {`Remark : ${confirmationInfo.remark}`}
                        </Typography>
                        : null
                } */}
                {
                    confirmationInfo && confirmationInfo.memo ?
                        <LightTooltip
                            title={`Memo : ${confirmationInfo.memo}`}
                        >
                            <Typography
                                id={`${id}_memo`}
                                className={classes.confirmationInfoItem}
                            // style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                                {`Memo : ${confirmationInfo.memo}`}
                            </Typography>
                        </LightTooltip>
                        : null
                }
                {
                    this.props.nextBooking ?
                        <CIMSButton
                            id={`${id}_nextBookingBtn`}
                            onClick={() => { this.props.nextBooking(); }}
                            className={classes.nextBookingContent}
                        >Next Booking</CIMSButton> : null
                }
            </Grid>
        );
    }
}
const mapStatetoProps = (state) => {
    return ({
        encounterTypes: state.common.encounterTypes,
        bookingDataEncounterTypeList: state.bookingInformation.bookingData.encounterTypeList,
        rooms: state.common.rooms,
        docTypeCodeList: state.common.commonCodeList.doc_type,
        serviceCd: state.login.service.serviceCd,
        loginSiteId: state.login.clinic.siteId,
        clinicConfig: state.common.clinicConfig
    });
};
export default connect(mapStatetoProps)(withStyles(styles)(ConfirmationWindow));
