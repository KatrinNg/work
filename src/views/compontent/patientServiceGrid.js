import React, { Component } from 'react';
import classnames from 'classnames';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Box, Button, Card, CardContent, colors, Grid, Fade, Link, Paper, Popover, Popper, Typography, Tooltip } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Apps as AppsIcon, ArrowRightAlt as ArrowRightAltIcon, People as PeopleIcon, Person as PersonIcon, SignalCellularNullOutlined } from '@material-ui/icons';
import withWidth from '@material-ui/core/withWidth';
import moment from 'moment';
import _ from 'lodash';
import Enum from '../../enums/enum';
import * as CommonUtil from '../../utilities/commonUtilities';
import * as caseNoUtilities from '../../utilities/caseNoUtilities';
import * as PatientUtil from '../../utilities/patientUtilities';
import * as UserUtil from '../../utilities/userUtilities';
import * as EHRUtilities from '../../utilities/eHRUtilities';
import { openCommonCircular, closeCommonCircular, openCommonClinicalDocument } from '../../store/actions/common/commonAction';
import { auditAction } from '../../store/actions/als/logAction';
import { skipTab } from '../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import { getPatientBanner, clearPatientBanner, getPatientBannerData, clearPatientBannerData, getViewLogList, updateState as updatePatientState, addPsoInfo, toggleFamilyEncounterSearchDialog } from '../../store/actions/patient/patientAction';
import { getGravidaAndParity, getAntSvcIdInfoLog } from '../../store/actions/patient/bannerAction';
import CIMSeHRExternalButton from './CIMSeHRExternalButton';
import accessRightEnum from '../../enums/accessRightEnum'; // DH Anthony
import { caseSts } from '../../enums/anSvcID/anSvcIDEnum';
import { goPrint } from '../../store/actions/common/commonAction';
import { getAppointmentLog } from '../../store/actions/dts/appointment/bookingAction'; //DH Edmund //DH Miki
import ViewLogDialog from '../registration/component/viewLogDialog';

const preventDefault = event => event.preventDefault();

const preventDefaultClick = (event, callback) => {
    event.preventDefault();
    callback();
};

const pxToRem = fontPx => {
    const rootPx = +window.getComputedStyle(document.documentElement).getPropertyValue('font-size').replace('px', '');
    return `${fontPx / rootPx}rem`;
};

const useStyles = makeStyles({
    serviceLabel: {
        fontSize: '16px',
        textTransform: 'none',
        whiteSpace: 'pre'
    },
    fontWeightBold: {
        fontWeight: 'bold'
    },
    disabledFontColor: {
        color: colors.grey['A200']
    },
    fontColor: {
        color: props => props.fontColor
    }
});

function Label(props) {
    const { disabled, displayValue, fontColor, ...other } = props;
    const classes = useStyles(props);
    const classNames = [classes.serviceLabel, classes.fontWeightBold];

    if (disabled)
        classNames.push(classes.disabledFontColor);
    else
        classNames.push(classes.fontColor);
    return <Typography className={classnames(...classNames)} {...other}>{displayValue}</Typography>;
}

const styles = theme => ({
    root: {
        width: '100%',
        // [theme.breakpoints.down('lg')]: {
        //     height: '110px'
        // },
        //height: '110px',
        height: '7rem',
        overflow: 'unset'
    },
    panelLeft: {
        width: '980px',
        [theme.breakpoints.down('lg')]: {
            width: '80%'
        },
        // [theme.breakpoints.down('lg')]: {
        //     height: '70px'
        // },
        height: '110px',
        padding: '3px',
        boxSizing: 'border-box'
    },
    panelRight: {
        width: 'auto',
        // [theme.breakpoints.down('lg')]: {
        //     height: '70px'
        // },
        height: '110px'
    },
    patientInfo: {
        fontSize: '10px',
        paddingLeft: '2px',
        paddingRight: '2px'
    },
    cardContentRoot: {
        padding: '2px 16px'
    },
    maleRoot: {
        backgroundColor: theme.palette.genderMaleColor.color,
        color: theme.palette.text.primary
    },
    femaleRoot: {
        backgroundColor: theme.palette.genderFeMaleColor.color,
        color: theme.palette.text.primary
    },
    unknownSexRoot: {
        backgroundColor: theme.palette.genderUnknownColor.color,
        color: theme.palette.text.primary
    },
    deadRoot: {
        backgroundColor: theme.palette.deadPersonColor.color,
        color: '#fff'
    },
    serviceSection: {
        backgroundColor: '#ccc'
    },
    content: {
        color: 'inherit',
        fontSize: '14pt'
    },
    contentPadding: {
        color: 'inherit',
        fontSize: '14pt',
        paddingRight: 10
    },
    popperRoot: {
        padding: '6px 8px',
        maxWidth: 500
    },
    popperTitle: {
        fontWeight: 'bold',
        minWidth: 110
    },
    popperContent: {
        wordBreak: 'break-all'
    },
    dialogContent: {
        marginTop: 10,
        marginBottom: 30
    },
    alertButton: {
        backgroundColor: colors.red['A700'],
        '&:hover': {
            backgroundColor: colors.red[900]
        },
        //boxShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0.75)',
        color: 'white',
        maxWidth: '100px',
        maxHeight: '100px',
        minWidth: '100px',
        minHeight: '100px'
        // width: '100%',
        // height: '100%',
        // padding: '1rem',
        // boxSizing: 'border-box'
    },
    alertLabel: {
        // [theme.breakpoints.down('lg')]: {
        //     fontSize: '50px'
        // },
        fontSize: '40px',
        textTransform: 'none'
    },
    checkIdSize: {
        // [theme.breakpoints.down('lg')]: {
        //     width: '80px'
        // },
        // width: '120px'
    },
    checkIdLabel: {
        // [theme.breakpoints.down('lg')]: {
        //     fontSize: '12px'
        // },
        fontSize: '16px'
    },
    checkIdButton: {
        backgroundColor: colors.orange[600],
        '&:disabled': {
            visibility: 'hidden'
            // border: 'solid 1px #aaaaaa',
            // boxShadow: '1px 1px 1px #6e6e6e'
        },
        '&:hover': {
            backgroundColor: colors.orange[900]
        },
        //boxShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0.75)',
        color: 'white'
    },
    serviceSize: {
        // [theme.breakpoints.down('lg')]: {
        //     maxWidth: '95px',
        //     minWidth: '95px'
        // },
        // maxWidth: '175px',
        // minWidth: '175px',
        // maxWidth: '100%',
        // minWidth: '100%',
        // maxHeight: '34px',
        // minHeight: '34px'
        // minWidth: '175px',
        // maxWidth: '175px',
        width: '100%',
        height: '36px'
    },
    serviceBorder: {
        borderBottom: '1px solid #fff',
        borderRight: '1px solid #fff',
        boxSizing: 'border-box'
    },
    serviceBorderTop: {
        borderTop: '1px solid #fff'
    },
    serviceBorderLeft: {
        borderLeft: '1px solid #fff'
    },
    serviceButton: {
        // maxWidth: '100%',
        // minWidth: '100%',
        // maxHeight: '100%',
        // minHeight: '100%',
        width: '100%',
        height: '100%',
        margin: '1px',
        boxSizing: 'border-box'
    },
    serviceLink: {},
    serviceLabel: {
        // [theme.breakpoints.down('lg')]: {
        //     fontSize: '12px'
        // },
        fontSize: '16px',
        textTransform: 'none',
        whiteSpace: 'pre'
    },
    serviceNextButtonRoot: {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.white,
        border: 'solid 1px #0579C8',
        boxShadow: '2px 2px 2px #6e6e6e',
        '&:hover': {
            color: theme.palette.white,
            backgroundColor: theme.palette.primary.main
        },
        '&$focusVisible': {
            color: theme.palette.white,
            backgroundColor: theme.palette.primary.main
        }
    },
    serviceNextButton: {
        // [theme.breakpoints.down('lg')]: {
        //     maxWidth: '44px',
        //     minWidth: '44px'
        // },
        maxWidth: '50px',
        minWidth: '50px',
        // maxWidth: '100%',
        // minWidth: '100%',
        maxHeight: '108px',
        minHeight: '108px',
        marginLeft: '2px',
        marginRight: '2px'
    },
    servicePatientLabel: {
        color: '#000'
    },
    englishNameFont: {
        [theme.breakpoints.down('lg')]: {
            fontSize: pxToRem(30)
        },
        fontSize: pxToRem(30)
    },
    chineseNameFont: {
        // [theme.breakpoints.down('lg')]: {
        //     fontSize: '24px'
        // },
        fontSize: pxToRem(30)
    },
    genderFont: {
        // [theme.breakpoints.down('lg')]: {
        //     fontSize: '24px'
        // },
        fontSize: pxToRem(30)
    },
    ageFont: {
        // [theme.breakpoints.down('lg')]: {
        //     fontSize: '24px'
        // },
        fontSize: pxToRem(30)
    },
    dobFont: {
        // [theme.breakpoints.down('lg')]: {
        //     fontSize: '18px'
        // },
        fontSize: pxToRem(22)
    },
    docNoFont: {
        // [theme.breakpoints.down('lg')]: {
        //     fontSize: '18px'
        // },
        fontSize: pxToRem(22)
    },
    fontWeightBold: {
        fontWeight: 'bold'
    },
    disabledFontColor: {
        color: colors.grey['A200']
    },
    tooltip: {
        maxWidth: 'none'
    }
});

class PatientServiceGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isViewLogOpen: false
        },
        this.colSize = 5;
        this.rowSize = 3;
        this.caseStsBackground = '#CCCCCC';
    }

    componentDidMount() {
        this.props.getPatientBannerData();
    }

    componentWillUnmount() {
        this.props.clearPatientBannerData();
    }

    openViewLogDialog = () => this.setState({ isViewLogOpen: !this.state.isViewLogOpen });

    // renderDemoPanel = () => {
    //     const { classes, colorClasses, isEHRSSRegistered, patient, caseNoInfo } = this.props;
    //     return (
    //         <React.Fragment>
    //             <Box display="flex" flex="auto" flexDirection="row" justifyContent="space-around" style={{ width: '40%' }} className={[classes.serviceSection]}>
    //                 <Box display="flex" flex={1} flexDirection="column" justifyContent="center">
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderTop, classes.serviceBorderLeft]}>
    //                         <Typography align="center" className={[classes.serviceLabel, classes.fontWeightBold]}>PMI ID: {patient && patient.idSts === 'T' ? 'T' : ''}{patient && patient.patientKey ? ('' + patient.patientKey).padStart(10, '0') : null}</Typography>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderLeft]}>
    //                         <Typography align="center" className={[classes.serviceLabel, classes.fontWeightBold]}>Patient Status</Typography>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderLeft]}>
    //                         <Typography align="center" className={[classes.serviceLabel, classes.fontWeightBold]}>{caseNoInfo && caseNoInfo.caseNo ? caseNoUtilities.getFormatCaseNo(caseNoInfo.caseNo) : null}</Typography>
    //                     </Box>
    //                 </Box>
    //                 <Box display="flex" flex={1} flexDirection="column" justifyContent="center">
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderTop]}>
    //                         <Link href="#" onClick={(event)=> {preventDefaultClick(event, this.props.onViewLogOpen);}} color="primary" className={classes.serviceLink}>
    //                         {/*<Button variant="contained" color="primary" className={classes.serviceButton}>*/}
    //                             <Typography className={[classes.serviceLabel, classes.fontWeightBold]} >View Log</Typography>
    //                         {/*</Button>*/}
    //                         </Link>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>
    //                         {/*<Link onClick={preventDefault} color="primary" className={classes.serviceLink}>
    //                             <Typography className={[classes.serviceLabel, classes.fontWeightBold]}>{isEHRSSRegistered ? 'eHRSS' : 'PPI-ePR'}</Typography>
    //                         </Link>*/}
    //                         <CIMSeHRExternalButton/>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>
    //                         <Link href="#" onClick={(event)=>{ preventDefaultClick(event,this.props.onMedicalSummaryDialogOpen);}} color="primary" className={classes.serviceLink}>
    //                             <Typography className={[classes.serviceLabel, classes.fontWeightBold]}>Medical Summary</Typography>
    //                         </Link>
    //                     </Box>
    //                 </Box>
    //             </Box>
    //             <Box display="flex" flex="auto" flexDirection="row" justifyContent="space-around" style={{ width: '60%' }} className={[classes.serviceSection]}>
    //                 <Box display="flex" flex={1} flexDirection="column" justifyContent="center">
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderTop]}>
    //                         <Link href="#" onClick={preventDefault} color="primary" className={classes.serviceLink}>
    //                             <Typography className={[classes.serviceLabel, classes.fontWeightBold]}>eHRSS Alert</Typography>
    //                         </Link>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>
    //                         <Typography align="center" className={[classes.serviceLabel, classes.servicePatientLabel, classes.fontWeightBold]}>Default Room</Typography>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>
    //                         <Typography align="center" className={[classes.serviceLabel, classes.servicePatientLabel, classes.fontWeightBold]}>GXX PXX</Typography>
    //                     </Box>
    //                 </Box>
    //                 <Box display="flex" flex={1} flexDirection="column" justifyContent="center">
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderTop]}>
    //                         <Typography align="center" className={[classes.serviceLabel, classes.servicePatientLabel, classes.fontWeightBold]}>Confidential</Typography>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>
    //                         <Typography align="center" className={[classes.serviceLabel, classes.servicePatientLabel, classes.fontWeightBold]}>Gestation (wk-d)</Typography>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>
    //                         <Typography align="center" className={[classes.serviceLabel, classes.servicePatientLabel, classes.fontWeightBold]}>LMP: 12-Dec-2019</Typography>
    //                     </Box>
    //                 </Box>
    //                 <Box display="flex" flex={1} flexDirection="column" justifyContent="center">
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderTop]}>
    //                         <Typography align="center" className={[classes.serviceLabel, classes.servicePatientLabel, classes.fontWeightBold]}>XXXXXXXX</Typography>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>
    //                         <Typography align="center" className={[classes.serviceLabel, classes.servicePatientLabel, classes.fontWeightBold]}>YYYYYYYY</Typography>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>
    //                         <Typography align="center" className={[classes.serviceLabel, classes.servicePatientLabel, classes.fontWeightBold]}>Wrk EDC: 12-Dec-2019</Typography>
    //                     </Box>
    //                 </Box>
    //             </Box>
    //         </React.Fragment>
    //     );
    // }

    // renderDemoPanel1() {
    //     const { classes, colorClasses, isEHRSSRegistered, patient, caseNoInfo } = this.props;
    //     return (
    //         <React.Fragment>
    //             <Box display="flex" flex="auto" flexDirection="row" justifyContent="space-around" style={{ width: '40%' }} className={[classes.serviceSection]}>
    //                 <Box display="flex" flex={1} flexDirection="column" justifyContent="center">
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderTop, classes.serviceBorderLeft]}>
    //                         <Typography align="center" className={[classes.serviceLabel, classes.fontWeightBold]}>PMI ID: {patient && patient.idSts === 'T' ? 'T' : ''}{patient && patient.patientKey ? ('' + patient.patientKey).padStart(10, '0') : null}</Typography>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderLeft]}>
    //                         <CIMSeHRExternalButton/>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderLeft]}>
    //                         {this.props.showReminder ? (
    //                             <Link href="#" onClick={(event)=> {preventDefaultClick(event, this.props.onReminderOpen);}} color="primary" className={classes.serviceLink}>
    //                                 <Typography className={[classes.serviceLabel, classes.fontWeightBold]} >Reminder</Typography>
    //                             </Link>
    //                         ): null}
    //                     </Box>
    //                 </Box>
    //                 <Box display="flex" flex={1} flexDirection="column" justifyContent="center">
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderTop]}>
    //                         <Link href="#" onClick={(event)=> {preventDefaultClick(event, this.props.onViewLogOpen);}} color="primary" className={classes.serviceLink}>
    //                             <Typography className={[classes.serviceLabel, classes.fontWeightBold]} >View Log</Typography>
    //                         </Link>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>
    //                         <Link href="#" onClick={(event)=>{ preventDefaultClick(event,this.props.onMedicalSummaryDialogOpen);}} color="primary" className={classes.serviceLink}>
    //                             <Typography className={[classes.serviceLabel, classes.fontWeightBold]}>Medical Summary</Typography>
    //                         </Link>
    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>

    //                     </Box>
    //                 </Box>
    //             </Box>
    //             <Box display="flex" flex="auto" flexDirection="row" justifyContent="space-around" style={{ width: '60%' }} className={[classes.serviceSection]}>
    //                 <Box display="flex" flex={1} flexDirection="column" justifyContent="center">
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderTop]}>

    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>

    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>

    //                     </Box>
    //                 </Box>
    //                 <Box display="flex" flex={1} flexDirection="column" justifyContent="center">
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderTop]}>

    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>

    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>

    //                     </Box>
    //                 </Box>
    //                 <Box display="flex" flex={1} flexDirection="column" justifyContent="center">
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder, classes.serviceBorderTop]}>

    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>

    //                     </Box>
    //                     <Box display="flex" justifyContent="center" alignItems="center" className={[classes.serviceSize, classes.serviceBorder]}>

    //                     </Box>
    //                 </Box>
    //             </Box>
    //         </React.Fragment>
    //     );
    // }

    showPmi = value => {
        const { patient } = this.props;
        return this.functionLabel(`${value ? value : 'PMI ID: '}${patient && patient.idSts === 'T' ? 'T' : ''}${patient && patient.patientKey ? ('' + patient.patientKey).padStart(10, '0') : null}`);
    };
    // dental Anthony sprint 6 2020/08/07 - Start
    showDefaultRoom = value => {
        const { defaultRoom, rooms, clinicList } = this.props;
        const room = defaultRoom && rooms.find(room => room.rmId === defaultRoom);
        const clinic = room && clinicList.find(clinic => clinic.siteId === room.siteId);
        // if (room && clinic) return this.functionLabel(clinic.siteCd + '(' + room.rmCd + ')');
        if (room && clinic) return this.tabLink(clinic.siteCd + '(' + room.rmCd + ')', accessRightEnum.DtsPatientDefaultRoom);
    };
    // dental Anthony sprint 6 2020/08/07 - End
    showCaseNo = value => {
        const { caseNoInfo } = this.props;
        return this.functionLabel(caseNoInfo && caseNoInfo.caseNo ? caseNoUtilities.getCaseAlias(caseNoInfo) : null);
    };

    viewLog = value => {
        const { classes } = this.props;
        return this.functionLink('View Log', this.props.onViewLogOpen);
    };

    chtDoc = () => {
        const geneticInfo = this.props.bannerData.geneticInfo;
        const result = geneticInfo.find((info) => info.docType === 'CHT');
        if (result)
            return this.functionLink('CHT Doc', this.props.openCommonClinicalDocument, {
                clinicalDocumentType: result.docType,
                neonatalDocId: result.docId
            });
        return this.tabLink('CHT Doc', '');
    };

    g6pdDoc = () => {
        const geneticInfo = this.props.bannerData.geneticInfo;
        const result = geneticInfo.find((info) => info.docType === 'G6PD');
        if (result)
            return this.functionLink('G6PD Doc', this.props.openCommonClinicalDocument, {
                clinicalDocumentType: result.docType,
                neonatalDocId: result.docId
            });
        return this.tabLink('G6PD Doc', '');
    };

    gccRequest = value => {
        return this.tabLink('GCC Request', 'F133');
    };

    familyNumber = () => {
        return this.familyNumLabel(this.props.patient.cgsSpecOut?.pmiGrpName || '');
    };

    clinicalNote = () => {
        return this.tabLink('Clinical Note', 'F102');
    }

    assessment = () => {
        return this.tabLink('Assessment', 'F104');
    }

    gccEnquiry = () => {
        return this.tabLink('GCC Enquiry', 'F134');
    }

    familyNoEnquiry = () => {
        return this.tabLink('Family No. Enquiry', 'F903');
    }

    cgsHx = () => {
        return this.tabLink('CGS Hx', 'F130');
    }

    pmiSummaryEditable = () => {
        return this.tabLink('PMI Summary (Edit)', 'F052');
    }

    medicalHistories = value => {
        return this.tabLink('Medical Histories', 'F127');
    };

    ehrViewer = value => {
        return <CIMSeHRExternalButton />;
    };

    patientReminder = value => {
        if (this.props.showReminder) {
            return this.functionLink('Reminder', this.props.onReminderOpen);
        } else {
            return this.functionLabel('Reminder', true);
        }
    };

    showCaseReference = value => {
        const { caseNoInfo } = this.props;
        return this.functionLabel(caseNoInfo && caseNoInfo.caseReference ? caseNoInfo.caseReference : null);
    };

    patientStatus = value => {
        const { patient, caseNoInfo, patientStatusCodeList } = this.props;
        let status = caseNoInfo?.patientStatus ?? patient.patientSts;
        return this.functionLabel(patientStatusCodeList.find(x => x.code === status)?.superCode);
    };

    openSickLeaveCert = value => {
        return this.tabLink('Sick Leave Cert', 'F032');
    };

    openAttendanceCert = value => {
        return this.tabLink('Attendance Cert', 'F031');
    };

    openReferralLetter = value => {
        return this.tabLink('Referral Letter', 'F033');
    };

    handleBackdateWalkAttendance = () => {
        this.props.auditAction('Patient Banner Click Backdate Walk-In Attend Button', null, null, false, 'ana');
        if (this.props.patient && this.props.patient.patientKey && !parseInt(this.props.patient.deadInd)) {
            if (this.props.patient.idSts === 'N') {
                this.handleSkipTab('backdateWalkIn', null, accessRightEnum.booking);
            } else {
                let patientLabel = CommonUtil.getPatientCall();
                this.props.openCommonMessage({
                    msgCode: '130209',
                    params: [{ name: 'PATIENT_LABEL', value: patientLabel },
                    { name: 'PATIENT_LABEL_LOWERCASE', value: patientLabel.toLowerCase() }
                    ]
                });
            }
        } else {
            this.props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }
    }

    backdateWalkAttendance = value => {
        let displayValue = 'Backdate';
        if (CommonUtil.isHaveAccessRight(accessRightEnum.AllowBackdateWalkIn))
            return this.functionLink(displayValue, this.handleBackdateWalkAttendance);
        else
            return this.functionLabel(displayValue, true);
    }

    handleWalkAttendance = () => {
        this.props.auditAction('Patient Banner Click Walk-In Attend Button', null, null, false, 'ana');
        if (this.props.patient && this.props.patient.patientKey && !parseInt(this.props.patient.deadInd)) {
            this.handleSkipTab('walkIn', null, accessRightEnum.booking);
        } else {
            this.props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }
    }

    walkAttendance = value => {
        return this.functionLink('Walk-in', this.handleWalkAttendance);
    }

    makeAppointment = value => {
        return this.tabLink('Make Appt', 'F007');
    }

    vaccinationHx = value => {
        return this.tabLink('Vaccination Hx', 'F203');
    }

    vaccination = value => {
        return this.tabLink('Vaccination', 'F204');
    }

    pcfb = value => {
        const { patient } = this.props;
        let label = !!patient.tbcPcfbDate ? 'PMCO Compensated' : '';
        return this.functionLabel(label);
    }

    functionLabel = (displayValue, disabled, fontColor) => {
        return <Label disabled={disabled} displayValue={displayValue} fontColor={fontColor}/>;
    };

    familyNumLabel = (displayValue='')=>{
        const isChief = this.props.patient?.cgsSpecOut?.isChief;
        return (
            <>
                <Label displayValue={displayValue} />
                <span style={{ fontSize: '24px' }}>{isChief ? '*' : ''}</span>
            </>
        );
    }

    functionLink = (displayValue, func, ...params) => {
        const { classes } = this.props;
        return (
            <Link
                href="#"
                onClick={event => {
                    event.preventDefault();
                    func(...params);
                }}
                color={PatientUtil.bannerColorHandler(displayValue) || 'primary'}
                className={classes.serviceLink}
            >
                {this.functionLabel(displayValue)}
            </Link>
        );
    };

    tabLink = (displayValue, tabName, ...params) => {
        const { accessRights, loginInfo, pucChecking, skipTab } = this.props;
        const menuItem = accessRights.find(x => x.name === tabName);
        const pucHandle = UserUtil.isPucHandle(loginInfo, pucChecking);
        if (menuItem && (!pucHandle || menuItem.isClinical === 'N'))
            return this.functionLink(displayValue, skipTab, tabName, ...params);
        else
            return this.functionLabel(displayValue, true);
    };

    handleSkipTab = (action, apptInfo, target) => {
        openCommonCircular();
        setTimeout(() => {
            this.props.skipTab(
                target,
                {
                    patientKey: this.props.patient.patientKey,
                    redirectFrom: accessRightEnum.patientSummary,
                    action: action,
                    apptInfo: apptInfo || null
                },
                true
            );
        }, 10);
        closeCommonCircular();
    };

    //will show case alias in sprint 43
    caseAlias = () => {
        // let antSvcId = null;
        // let antSvcInfo = PatientUtil.getCurAntSvcInfo();
        // if (antSvcInfo && antSvcInfo.clcAntCurrent) {
        //     antSvcId = antSvcInfo.clcAntCurrent.antSvcId || null;
        // }
        // return this.functionLabel(antSvcId);
        const { caseNoInfo } = this.props;
        return this.functionLabel(caseNoInfo && caseNoInfo.caseNo ? caseNoUtilities.getCaseAlias(caseNoInfo) : null);
    }

    fhsHospital = () => {
        let deliveHosp = null;
        let antSvcInfo = PatientUtil.getCurAntSvcInfo();
        if (antSvcInfo && antSvcInfo.clcAntCurrent && antSvcInfo.clcAntCurrent.sts === caseSts.ACTIVE) {
            deliveHosp = antSvcInfo.clcAntCurrent.deliveryHosp || null;
        }
        return this.functionLabel(deliveHosp);
    }

    fhsGest = () => {
        let gestWeek = null;
        let antSvcInfo = PatientUtil.getCurAntSvcInfo();
        if (antSvcInfo && antSvcInfo.clcAntCurrent && antSvcInfo.clcAntCurrent.sts === caseSts.ACTIVE) {
            gestWeek = antSvcInfo.clcAntCurrent.gestWeek || null;
        }
        return this.functionLabel(`Gest (wk-d) ${gestWeek ?? '      '}`);
    }

    fhsEdc = () => {
        const { isWrkEdcModified } = this.props.bannerData;
        let edc = null;
        let antSvcInfo = PatientUtil.getCurAntSvcInfo();
        if (antSvcInfo && antSvcInfo.clcAntCurrent && antSvcInfo.clcAntCurrent.sts === caseSts.ACTIVE) {
            edc = moment(antSvcInfo.clcAntCurrent.wrkEdc || null).isValid() ? moment(antSvcInfo.clcAntCurrent.wrkEdc).format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
        }
        return this.functionLabel(`EDC: ${(edc ?? '                      ')}${edc && isWrkEdcModified ? ' R' : '  '}`);
    }

    fhsLmp = () => {
        let lmp = null;
        let antSvcInfo = PatientUtil.getCurAntSvcInfo();
        if (antSvcInfo && antSvcInfo.clcAntCurrent && antSvcInfo.clcAntCurrent.sts === caseSts.ACTIVE) {
            lmp = moment(antSvcInfo.clcAntCurrent.lmp || null).isValid() ? moment(antSvcInfo.clcAntCurrent.lmp).format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
        }
        return this.functionLabel(`LMP: ${lmp ?? '                    '}`);
    }

    fhsViewLog = value => {
        return this.functionLink('View Log (PMI)', this.props.onViewLogOpen);
    };

    fhsAnt = () => {
        return this.tabLink('AN Module', 'F120');
    }

    moe = () => {
        return this.tabLink('MOE', 'F200');
    }

    problemReferral = () => {
        return this.tabLink('Problem & Referral', 'F141');
    }

    clinicalDocument = () => {
        return this.tabLink('Clinical Document', 'F055');
    }

    abdominalExamination = () => {
        return this.tabLink('Abdominal Examination', 'F144');
    }

    ioe = () => {
        return this.tabLink('Investigation request', 'F121');
    }

    fhsGp = () => {
        const { gravidaAndParity } = this.props.bannerData;
        return this.functionLabel(`G ${gravidaAndParity?.gravida ?? ' '}     P ${gravidaAndParity?.parity ?? ' '}`);
    }

    fhsFullCase = () => {
        const { patient } = this.props;
        let label = patient.isFullCase ? 'AN FULL Case' : '';
        return this.functionLabel(label);
    }

    getEncounterStatus = () => {
        const { shsInfo } = this.props;
        let label = '';
        let disabled = false;
        let func = null;
        if (shsInfo && shsInfo.skinLatestEncounterInfo) {                          //sspecId===3001->skinLatestEncounterInfo, sspecId===3002->stiLatestEncounterInfo
            const { isActive, isClose, sdt } = shsInfo.skinLatestEncounterInfo;
            this.caseStsBackground = '#CCCCCC';
            if (isClose) {
                label = 'Case Closed';
                this.caseStsBackground = '#ffffbd';
            } else {
                if (isActive) {
                    if ( sdt && moment(sdt).isSame(moment(), 'day')) {
                        disabled = true;
                    }else{
                        func = () => {
                            this.props.onCloseCaseClick();
                        };
                    }
                    label = 'Close Case';
                } else {
                    label = 'Inactive';
                    this.caseStsBackground = '#ffffbd';
                }
            }
        } else {
            if(shsInfo && shsInfo.skinLatestEncounterInfo === null){
                label = 'No Case';
            }
            disabled = true;
        }
        if (func) {
            return this.functionLink(label, func);
        } else {
            return this.functionLabel(label, disabled);
        }
    }

    // NOTE appointment
    appointment = () => {
        return this.tabLink('Appointment', 'F007');
    }

    transferOut = () => {
        return this.tabLink('Transfer Out', 'F073');
    }

    viewLogAppt = () => {
        return this.functionLink('View Log (Appt)', this.openViewLogDialog);
    }

    viewFamilyMemberEncounter = () => {
        return this.functionLink('Enc. of Fam. Member', this.props.toggleFamilyEncounterSearchDialog);
    }

    handleOpenViewLog = () => {
        //DH Edmund Start
        if (this.props.serviceCd === 'DTS') {
            this.props.getAppointmentLog(this.state.curSelectedAppt.appointmentId);
            return;
        }
        //DH Edmund End
        this.props.auditAction('Appointment Detail Click View Log Button', null, null, false, 'ana');
        this.props.openViewLog();
    };

    problemProcedure = () => {
        return this.tabLink('Problem/Procedure', 'F111');
    }

    problem = () => {
        return this.tabLink('Problem', 'F111');
    }

    /**
     * NOTE - PSO
     * bg-color: #B5EAD7
     * color: #FF9AA2
     */
    pso = () => {
        const { patient, encounterInfo, clinic, addPsoInfo, openCommonMessage } = this.props;
        if (patient?.psoInfo?.withPsoriasis === 1) {
            let { withPASI, dueDateOfLastPASI } = patient.psoInfo;
            if (withPASI === 0) {
                return this.functionLabel('PSO');
            }
            else {
                let dueDate = moment(dueDateOfLastPASI);
                if (dueDate.isValid()) {
                    let formattedDueDate = dueDate.format(Enum.DATE_FORMAT_EDMY_VALUE);
                    if (moment().startOf('day').isBefore(dueDate, 'day')) {
                        return this.functionLabel(`PSO: ${formattedDueDate}`, true);
                    }
                    else {
                        return this.functionLabel(`PSO: ${formattedDueDate}`, false, colors.red['A200']);
                    }
                }
                else {
                    return this.functionLabel('PSO', true);
                }
            }
        }
        else {
            if (encounterInfo && encounterInfo.encounterId) {
                let patientKey = patient.patientKey;
                let encounterId = encounterInfo.encounterId;
                let encounterDate = moment(encounterInfo.encounterDate).format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK);
                let ehrSiteId = clinic.ehrId;
                // return this.functionLink('PSO', addPsoInfo, patientKey, encounterId, encounterDate, ehrSiteId);
                return this.functionLink('PSO', () => {
                    addPsoInfo(patientKey, encounterId, encounterDate, ehrSiteId, this.psoCallback);
                });
            }
            else {
                // no encounter
                return this.functionLink('PSO', openCommonMessage, { msgCode: '115009' });
            }
        }
    }

    psoCallback = () => {
        console.log('davidtest callEsProblemFun',this.props.callEsProblemFun);
        this.props.callEsProblemFun && this.props.callEsProblemFun();
        this.props.callScnProblemFun && this.props.callScnProblemFun();
    }

    memo = () => {
        return this.tabLink('Memo', 'F053');
    }

    ioeShortForm = () => {
        return this.tabLink('IOE', 'F121');
    }

    takeSpecimen = () => {
        return this.tabLink('Take Specimen', 'F115');
    }

    referral = () => {
        // return this.tabLink('Referral', 'F033');
        return this.tabLink('Referral', 'F055', null, true, JSON.stringify({group :3005, template: 3107}));
    };

    ein = () => {
        return this.tabLink('EIN', 'F100');
    }

    go = () => {
        return this.functionLink('GO', () => {
            this.props.onNextPatient(true);
        });
        // return this.tabLink('GO', '');
    };

    render() {
        const {
            classes,
            isEHRSSRegistered,
            patient,
            caseNoInfo,
            svcCd,
            getViewLogList,
            viewLogState,
            deleteReasonsList,
            quotaConfig
        } = this.props;
        const { isViewLogOpen } = this.state;
        // const bannerItems = _.clone(this.props.bannerItems);
        // bannerItems.length = 0;
        // bannerItems.push(...[
        //     { bannerType: 'PATIENT', indexNo: 0, display: 'PMI: ', functionName: 'showPmi', fontColor: '#000000', bgColor: '#CCCCCC' },
        //     { bannerType: 'PATIENT', indexNo: 1, display: '', functionName: 'viewLog', fontColor: '#000000', bgColor: '#CCCCCC' },
        //     { bannerType: 'PATIENT', indexNo: 3, display: '', functionName: 'medicalSummary', fontColor: '#000000', bgColor: '#CCCCCC' },
        //     { bannerType: 'PATIENT', indexNo: 5, display: '', functionName: 'showCaseNo', fontColor: '#000000', bgColor: '#CCCCCC' },
        //     { bannerType: 'PATIENT', indexNo: 7, display: '', functionName: 'openSickLeaveCert', fontColor: '#000000', bgColor: '#CCCCCC' },
        //     { bannerType: 'PATIENT', indexNo: 8, display: '', functionName: 'openAttendanceCert', fontColor: '#000000', bgColor: '#CCCCCC' },
        //     { bannerType: 'PATIENT', indexNo: 9, display: '', functionName: 'openReferralLetter', fontColor: '#000000', bgColor: '#CCCCCC' },
        //     { bannerType: 'PATIENT', indexNo: 10, display: '', functionName: 'ehrViewer', fontColor: '#000000', bgColor: '#CCCCCC' },
        //     { bannerType: 'PATIENT', indexNo: 11, display: '', functionName: 'patientReminder', fontColor: '#000000', bgColor: '#CCCCCC' },
        //     { bannerType: 'PATIENT', indexNo: 12, display: '', functionName: 'showCaseReference', fontColor: '#000000', bgColor: '#CCCCCC' }
        // ]);
        let bannerItems = caseNoUtilities.handleCaseNoSection(_.clone(this.props.bannerItems), 'functionName', 'showCaseNo');
        // bannerItems.push({ bannerType: 'PATIENT', indexNo: 14, display: 'Go', functionName: 'go', fontColor: '#000000', bgColor: '#CCCCCC' });
        // if(this.props.serviceCd==='ANT'){
        //     bannerItems.push({
        //             bannerType: 'PATIENT',
        //             indexNo: 1,
        //             display: 'AN Service ID: ',
        //             functionName: 'showAntSvcID',
        //             fontColor: '#000000',
        //             bgColor: '#CCCCCC'
        //     });
        // }

        const cols = [];
        for (let c = 0; c < this.colSize; ++c) {
            const rows = [];
            for (let r = 0; r < this.rowSize; ++r) {
                const classNames = [classes.serviceSize, classes.serviceBorder];
                r === 0 && classNames.push(classes.serviceBorderTop);
                c === 0 && classNames.push(classes.serviceBorderLeft);
                const indexNo = r * this.colSize + c;
                const bannerItem = bannerItems.find(x => x.indexNo === indexNo);
                let item = null;
                let label = '';
                let bgColor = 'inherit';
                let fontColor = 'inherit';
                if (bannerItem) {
                    const { display, functionName } = bannerItem;
                    label = bannerItem?.functionName === 'viewFamilyMemberEncounter' ? 'Encounter of Family Members' : '';

                    if (functionName && this[functionName]) {
                        item = this[functionName](display);
                    } else {
                        item = `${functionName ? functionName : display}`;
                    }
                    if (functionName === 'getEncounterStatus') {
                        bgColor = this.caseStsBackground;
                    } else {
                        bgColor = PatientUtil.bannerBgColorHandler(bannerItem);
                    }
                    fontColor = bannerItem.fontColor;
                }
                rows.push(
                    <Tooltip title={label} classes={{ tooltip: classes.tooltip }}>
                        <Box
                            key={`cell-${c}-${r}`}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            className={classnames(...classNames)}
                            style={{
                                backgroundColor: bgColor,
                                color: fontColor
                            }}
                        >
                            {item}
                        </Box>
                    </Tooltip>
                );
            }
            cols.push(
                <Box key={`col-${c}`} display="flex" flex={1} flexDirection="column" justifyContent="center">
                    {rows}
                </Box>
            );
        }

        return (
            <React.Fragment>
                <Box display="flex" flex="auto" flexDirection="row" justifyContent="space-around" style={{ width: '100%' }} className={classes.serviceSection}>
                    {cols}
                </Box>

                <ViewLogDialog
                    open={isViewLogOpen}
                    rowData={viewLogState.apptList}
                    getViewLogList={getViewLogList}
                    onClose={this.openViewLogDialog}
                    deleteReasonsList={deleteReasonsList}
                    quotaConfig={quotaConfig}
                    svcCd={svcCd}
                />
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        patientStatusCodeList: state.common.commonCodeList.patient_status,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        clinic: state.login.clinic,
        accessRights: state.login.accessRights,
        loginInfo: state.login.loginInfo,
        patient: state.patient.patientInfo,
        bannerItems: state.patient.bannerItems,
        encounterInfo: state.patient.encounterInfo,
        caseNoInfo: state.patient.caseNoInfo,
        pucChecking: state.patient.pucChecking,
        docTypeCodeList: state.common.commonCodeList.doc_type,
        // dental Anthony sprint 6 2020/08/07 - Start
        rooms: state.common.rooms,
        defaultRoom: state.patient.defaultRoomId,
        clinicList: state.common.clinicList,
        // dental Anthony sprint 6 2020/08/07 - End
        bannerData: state.patient.bannerData,
        shsInfo: state.patient.shsInfo,
        goEsPrint: state.mainFrame.goEsPrint,
        svcCd: state.login.service.svcCd,
        viewLogState: state.patient.patientSummaryViewLog,
        deleteReasonsList: state.common.deleteReasonsList,
        quotaConfig: state.common.quotaConfig,
        callEsProblemFun:state.mainFrame.callEsProblemFun,
        callScnProblemFun:state.mainFrame.callScnProblemFun
    };
};

const mapDispatchToProps = {
    getPatientBanner,
    clearPatientBanner,
    openCommonCircular,
    closeCommonCircular,
    auditAction,
    skipTab,
    openCommonMessage,
    getPatientBannerData,
    clearPatientBannerData,
    getGravidaAndParity,
    getAntSvcIdInfoLog,
    goPrint,
    getAppointmentLog,
    getViewLogList,
    updatePatientState,
    addPsoInfo,
    toggleFamilyEncounterSearchDialog,
    openCommonClinicalDocument
};

export default connect(mapStateToProps, mapDispatchToProps)(withWidth()(withStyles(styles)(PatientServiceGrid)));
