import React, { Component } from 'react';
import classnames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Box, Button, Card, CardContent, colors, Grid, Fade, Link, Paper, Popover, Popper, Typography } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Apps as AppsIcon, ArrowRightAlt as ArrowRightAltIcon, People as PeopleIcon, Person as PersonIcon } from '@material-ui/icons';
import MrgIcon from '../../images/mrg_icon.png';
import withWidth from '@material-ui/core/withWidth';
import moment from 'moment';
import { debounce } from 'lodash';
import Enum from '../../enums/enum';
import * as CommonUtilities from '../../utilities/commonUtilities';
import * as caseNoUtilities from '../../utilities/caseNoUtilities';
import * as PatientUtil from '../../utilities/patientUtilities';
import * as EHRUtilities from '../../utilities/eHRUtilities';
import { addTabs } from '../../store/actions/mainFrame/mainFrameAction';
import { resetAll, getPatientBanner, clearPatientBanner } from '../../store/actions/patient/patientAction';
import { getSaamPatientSummary, clearSaamPatientSummary } from '../../store/actions/saam/saamPatientAction';
import PatientServiceGrid from './patientServiceGrid';
import CIMSeHRExternalButton from './CIMSeHRExternalButton';
import * as RegUtil from '../../utilities/registrationUtilities';
import * as UserUtilities from '../../utilities/userUtilities';
import {auditAction} from '../../store/actions/als/logAction';

// dental Anthony sprint 6 2020/08/07 - Start
import { getGdDefaultRoom } from '../../store/actions/dts/patient/DtsDefaultRoomAction';
// dental Anthony sprint 6 2020/08/07 - End

const preventDefault = event => event.preventDefault();

const preventDefaultClick = (event, callback) => {
    event.preventDefault();
    callback();
};

const pxToRem = fontPx => {
    const rootPx = +window.getComputedStyle(document.documentElement).getPropertyValue('font-size').replace('px', '');
    return `${fontPx / rootPx}rem`;
};

const theme = createMuiTheme({
    palette: {
        white: colors.common.white,
        black: colors.common.black,
        genderMaleColor: {
            color: 'rgba(209, 238, 252, 1)',
            transparent: 'rgba(209, 238, 252, 0.1)'
        },
        genderFeMaleColor: {
            color: 'rgba(254, 222, 237, 1)',
            transparent: 'rgba(254, 222, 237, 0.1)'
        },
        genderUnknownColor: {
            color: 'rgba(248, 209, 134, 1)',
            transparent: 'rgba(248, 209, 134, 0.1)'
        },
        deadPersonColor: {
            color: 'rgba(64, 64, 64, 1)',
            transparent: 'rgba(64, 64, 64, 1)',
            fontColor: () => this.white
        }
    }
});

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
        minWidth: 120
    },
    popperContent: {
        wordBreak: 'break-all'
    },
    alertPopperRoot: {
        zIndex: 100
    },
    alertPaperRoot: {
        padding: '8px 8px'
    },
    alertPopperGrid: {
        marginLeft: 8,
        marginRight: 8,
        marginTop: 16,
        marginBottom: 16
    },
    alertPopperContent: {
        fontFamily: 'inherit',
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
    },
    dialogContent: {
        marginTop: 10,
        marginBottom: 30
    },
    alertButtonHidden: {
        maxWidth: '100px',
        maxHeight: '100px',
        minWidth: '100px',
        minHeight: '100px',
        visibility: 'hidden !important'
    },
    alertButtonDisable: {
        backgroundColor: colors.grey[500],
        '&:hover': {
            backgroundColor: colors.grey[700]
        },
        color: 'white',
        maxWidth: '100px',
        maxHeight: '100px',
        minWidth: '100px',
        minHeight: '100px',
        visibility: 'visible !important'
    },
    alertButtonEnable: {
        backgroundColor: colors.red[500],
        '&:hover': {
            backgroundColor: colors.red[700]
        },
        color: 'white',
        maxWidth: '100px',
        maxHeight: '100px',
        minWidth: '100px',
        minHeight: '100px',
        visibility: 'visible !important'
    },
    alertLabel: {
        // [theme.breakpoints.down('lg')]: {
        //     fontSize: '50px'
        // },
        fontSize: '35px',
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
        textTransform: 'none'
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
        fontSize: pxToRem(30),
        maxWidth: '850px'
    },
    englishNameFontWithMrgIcon: {
        maxWidth: '800px !important'
    },
    chineseNameFont: {
        // [theme.breakpoints.down('lg')]: {
        //     fontSize: '24px'
        // },
        fontSize: pxToRem(30),
        maxWidth: '315px'
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
        fontSize: pxToRem(22),
        maxWidth: '275px'
    },
    fontWeightBold: {
        fontWeight: 'bold'
    }
});

const ALERT_STATE = {
    UNDEFINED: 0,
    NO_SHOW: 1,
    NO_ALLERGY_NO_ADR_ALERT: 2,
    NO_ALLERGY_WITH_ADR_ALERT: 3,
    NKDA_NO_ADR_ALERT: 4,
    NKDA_WITH_ADR_ALERT: 5,
    WITH_ALLERGY_NO_ADR_ALERT: 6,
    WITH_ALLERGY_WITH_ADR_ALERT: 7
};

class PatientPanel2 extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            anchorEl: null,
            isEHRSSRegistered: EHRUtilities.isEHRSSRegistered(props.patient),
            isIdentityPatient: EHRUtilities.isIdentityPatient(props.patient),
            isMenuOpen: false,
            menuAnchorEl: null,
            alertOpen: false,
            alertAnchorEl: null,
            alertState: ALERT_STATE.UNDEFINED,
            mrgMsgOpen: false,
            mrgMsgAnchorEl: null
        };
    }

    componentDidMount() {


        const { getPatientBanner, getSaamPatientSummary, loginInfo, pucChecking, serviceCd, patient } = this.props;
        const pucHandle = UserUtilities.isPucHandle(loginInfo, pucChecking);
        const roleName = pucHandle ? 'CIMS-COUNTER' : UserUtilities.getBaseRoleName(loginInfo.userDto);
        getPatientBanner(serviceCd, patient && patient.patientKey, roleName);
        getSaamPatientSummary(patient && patient.patientKey);

        window.addEventListener('resize', this.updateDimensions);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.saamPatientSummary !== this.props.saamPatientSummary) {
            this.getAlertState(this.props.saamPatientSummary);
        }
    }

    componentWillUnmount() {
        const { resetAll, clearPatientBanner, clearSaamPatientSummary } = this.props;

        resetAll();

        window.removeEventListener('resize', this.updateDimensions);

        clearPatientBanner();
        clearSaamPatientSummary();


    }

    getAlertState = sps => {
        let { isClinicalUser, loginInfo, pucChecking } = this.props;
        let alertState = ALERT_STATE.UNDEFINED;

        if (isClinicalUser.toUpperCase() === 'Y') {
            if (sps) {
                if (sps.patientAllergyList.length > 0) {
                    if (sps.patientAllergyList[0].allergenType === 'N') {
                        if (this.isAlertOrADR(sps)) {
                            alertState = ALERT_STATE.NKDA_WITH_ADR_ALERT;
                        } else {
                            alertState = ALERT_STATE.NKDA_NO_ADR_ALERT;
                        }
                    } else {
                        if (this.isAlertOrADR(sps)) {
                            alertState = ALERT_STATE.WITH_ALLERGY_WITH_ADR_ALERT;
                        } else {
                            alertState = ALERT_STATE.WITH_ALLERGY_NO_ADR_ALERT;
                        }
                    }
                } else {
                    if (this.isAlertOrADR(sps)) {
                        alertState = ALERT_STATE.NO_ALLERGY_WITH_ADR_ALERT;
                    } else {
                        alertState = ALERT_STATE.NO_ALLERGY_NO_ADR_ALERT;
                    }
                }
            }
        } else {
            alertState = ALERT_STATE.NO_SHOW;
        }

        const isClinicalBaseRole = UserUtilities.isClinicalBaseRole(loginInfo.userDto);
        const pucHandle = UserUtilities.isPucHandle(loginInfo, pucChecking);
        if (!isClinicalBaseRole)
            alertState = ALERT_STATE.NO_SHOW;
        else if (isClinicalBaseRole && pucHandle)
            alertState = ALERT_STATE.NO_SHOW;



        this.setState({ alertState });
    };

    isAlertOrADR = sps => {
        return (sps.patientAlertList && sps.patientAlertList.length > 0) || (sps.patientAdrList && sps.patientAdrList.length > 0);
    };

    getAlertClass = () => {
        let { classes } = this.props;

        switch (this.state.alertState) {
            case ALERT_STATE.UNDEFINED:
                return classes.alertButtonHidden;
            case ALERT_STATE.NO_SHOW:
                return classes.alertButtonHidden;
            case ALERT_STATE.NO_ALLERGY_NO_ADR_ALERT:
                return classes.alertButtonDisable;
            case ALERT_STATE.NO_ALLERGY_WITH_ADR_ALERT:
                return classes.alertButtonEnable;
            case ALERT_STATE.NKDA_NO_ADR_ALERT:
                return classes.alertButtonDisable;
            case ALERT_STATE.NKDA_WITH_ADR_ALERT:
                return classes.alertButtonEnable;
            case ALERT_STATE.WITH_ALLERGY_NO_ADR_ALERT:
                return classes.alertButtonEnable;
            case ALERT_STATE.WITH_ALLERGY_WITH_ADR_ALERT:
                return classes.alertButtonEnable;
            default:
                return classes.alertButtonHidden;
        }
    };

    getAlertDesc = () => {
        switch (this.state.alertState) {
            case ALERT_STATE.UNDEFINED:
            case ALERT_STATE.NO_SHOW:
                return '';
            case ALERT_STATE.NO_ALLERGY_NO_ADR_ALERT:
                return '+Alert';
            case ALERT_STATE.NO_ALLERGY_WITH_ADR_ALERT:
            case ALERT_STATE.NKDA_WITH_ADR_ALERT:
            case ALERT_STATE.WITH_ALLERGY_NO_ADR_ALERT:
            case ALERT_STATE.WITH_ALLERGY_WITH_ADR_ALERT:
                return 'Alert';
            case ALERT_STATE.NKDA_NO_ADR_ALERT:
                return 'NKDA';
            default:
                return '';
        }
    }

    getAlertDesc = () => {
        switch (this.state.alertState) {
            case ALERT_STATE.UNDEFINED:
            case ALERT_STATE.NO_SHOW:
                return '';
            case ALERT_STATE.NO_ALLERGY_NO_ADR_ALERT:
                return '+Alert';
            case ALERT_STATE.NO_ALLERGY_WITH_ADR_ALERT:
            case ALERT_STATE.NKDA_WITH_ADR_ALERT:
            case ALERT_STATE.WITH_ALLERGY_NO_ADR_ALERT:
            case ALERT_STATE.WITH_ALLERGY_WITH_ADR_ALERT:
                return 'Alert';
            case ALERT_STATE.NKDA_NO_ADR_ALERT:
                return 'NKDA';
            default:
                return '';
        }
    }

    handleMouseEnter = (e) => {
        this.setState({ anchorEl: e.currentTarget, open: true });
    };

    handleMouseLeave = () => {
        this.setState({ anchorEl: null, open: false });
    };

    handleAlertMouseEnter = e => {
        this.setState({ alertAnchorEl: e.currentTarget, alertOpen: true });
    };

    handleAlertMouseLeave = () => {
        this.setState({ alertAnchorEl: null, alertOpen: false });
    };

    handleMenuClick = e => {
        e.persist();
        this.handleMenuOpen(e.currentTarget);
    };

    handleMenuOpen = debounce(target => {
        this.setState({ isMenuOpen: true, menuAnchorEl: target });
    }, 100);

    handleMenuClose = () => {

        this.setState({ isMenuOpen: false, menuAnchorEl: null });
    };

    handleAlert = () => {
        this.openTab('F207');
    };

    /* Kk Lam - Add mrg_icon -> 2021-02-26 -> start */
    handleMrgMsgMouseEnter = (e) => {
        this.setState({ mrgMsgAnchorEl: e.currentTarget, mrgMsgOpen: true });
    };

    handleMrgMsgMouseLeave = () => {
        this.setState({ mrgMsgAnchorEl: null, mrgMsgOpen: false });
    };
    /* Kk Lam - Add mrg_icon -> 2021-02-26 -> start */

    canAccessTab = funcName => {
        let item = this.props.menuList.reduce((acc, val) => acc.concat(val.child), []).find(x => x.name === funcName);
        return item !== undefined;
    };

    openTab = funcName => {
        let item = this.props.menuList.reduce((acc, val) => acc.concat(val.child), []).find(x => x.name === funcName);
        if (item) this.props.addTabs(item);
    };

    updateDimensions = () => {
        console.log(window.outerWidth + 'x' + window.outerHeight);
    };

    getPrimaryDocType = value => {
        if (value) {
            switch (value) {
                case 'ID':
                    return 'HKID';
                case 'BC':
                    return 'HKBC';
                default:
                    return 'Other Doc.';
            }
        }
        return '';
    };

    getPrimaryDocTypeDesc = (value) => {
        if (value) {
            const docTypeCode = this.props.docTypeCodeList.find(item => item.code === value);
            return docTypeCode && docTypeCode.engDesc;
        }
        return '';
    };

    getDocNo = (docType, patient) => {
        return PatientUtil.isHKIDFormat(docType) ? PatientUtil.getHkidFormat(patient.primaryDocNo) : patient.primaryDocNo;
    };

    getDocPair = patient => {
        let docType = this.getPrimaryDocType(patient.primaryDocTypeCd);
        let docNo = this.getDocNo(docType, patient);
        return (docType && docNo) ? (docType + ': ' + docNo) : '';
    };

    getReminderRecords = pmiPersRemarkList => {
        let reminderRecords = [];
        if (pmiPersRemarkList) {
            reminderRecords = pmiPersRemarkList.filter(item => {
                if (item.statusCd === 'A') {
                    if (item.scope === 'A') {
                        return true;
                    } else if (item.scope === 'S') {
                        return this.props.serviceCd === item.serviceCd;
                    } else {
                        return this.props.clinicCd === item.clinicCd;
                    }
                } else {
                    return false;
                }
            });
            reminderRecords = reminderRecords.sort((a, b) => moment(b.createDtm).diff(moment(a.createDtm)));
        }

        return reminderRecords;
    };

    render() {
        // dental Anthony sprint 6 2020/08/07 - Start
        //const { classes, userRoleType, patient, saamPatientSummary, encounterInfo, caseNoInfo } = this.props;
        const { classes, userRoleType, patient, saamPatientSummary, encounterInfo, caseNoInfo, serviceCd } = this.props;
        // dental Anthony sprint 6 2020/08/07 - End

        if (patient && patient.patientKey) {
            const hkid = patient.hkid && patient.hkid.substring(0, patient.hkid.length - 1);
            const hkidNum = patient.hkid && patient.hkid.substring(patient.hkid.length - 1);
            let colorClasses = '';
            let sps = saamPatientSummary;
            if (parseInt(patient.deadInd)) {
                colorClasses = classes.deadRoot;
            } else {
                switch (patient.genderCd) {
                    case Enum.GENDER_MALE_VALUE:
                        colorClasses = classes.maleRoot;
                        break;
                    case Enum.GENDER_FEMALE_VALUE:
                        colorClasses = classes.femaleRoot;
                        break;
                    case Enum.GENDER_UNKNOWN_VALUE:
                        colorClasses = classes.unknownSexRoot;
                        break;
                    default:
                        break;
                }
            }
            const { width } = this.props;
            if (width == 'xl' && this.state.isMenuOpen) {
                this.handleMenuClose();
            }
            // dental Anthony sprint 6 2020/08/07 - Start
            if (serviceCd === 'DTS') this.props.getGdDefaultRoom({ patientKey: patient.patientKey, serviceCd: serviceCd });
            // dental Anthony sprint 6 2020/08/07 - End
            const gridComponent = (
                <PatientServiceGrid
                    colorClasses={colorClasses}
                    isEHRSSRegistered={this.state.isEHRSSRegistered}
                    patient={patient}
                    caseNoInfo={caseNoInfo}
                    canAccessTab={this.canAccessTab}
                    openTab={this.openTab}
                    onViewLogOpen={this.props.onViewLogOpen}
                    onReminderOpen={this.props.onReminderOpen}
                    showReminder={this.getReminderRecords((patient && patient.pmiPersRemarkList) || []).length > 0}
                    onCloseCaseClick={this.props.onCloseCaseClick}
                    onNextPatient={this.props.onNextPatient}
                />
            );
            return (
                <div className={`${classes.root} ${colorClasses}`}>
                    <Box display="flex" flexDirection="row" justifyContent="flex-start">
                        <Box display="flex" flexDirection="row" justifyContent="space-around" alignItems="stretch" className={classes.panelLeft}>
                            <Box display="flex">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    style={{
                                        border: 'unset',
                                        visibility: 'hidden'
                                    }}
                                    className={this.getAlertClass()}
                                    onClick={this.handleAlert}
                                    onMouseEnter={this.handleAlertMouseEnter}
                                    onMouseLeave={this.handleAlertMouseLeave}
                                >
                                    <Typography className={classes.alertLabel}>{this.getAlertDesc()}</Typography>
                                </Button>
                            </Box>
                            <Box display="flex" flex={1} flexDirection="column" justifyContent="space-around" className={classes.patientInfo}>
                                <Box display="flex" flex={1} flexDirection="row" justifyContent="flex-start" alignItems="center">
                                    {/* Kk Lam - Add mrg_icon -> 2021-02-26 -> start */}
                                    <Box display="flex" mx={1} id={'patient_panel2_patient_engName'}><Typography className={patient.mrgSts !== 'N' ? classnames(classes.englishNameFontWithMrgIcon, classes.englishNameFont, classes.fontWeightBold) : classnames(classes.englishNameFont, classes.fontWeightBold)} noWrap onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>{CommonUtilities.getFullName(patient.engSurname, patient.engGivename)} {(serviceCd === 'CGS' && patient?.cgsSpecOut?.isChief) && '*'} {/*AU YEUNG, MEI LAI*/}{/*'W'.repeat(30)*/}</Typography></Box>
                                    {patient.mrgSts !== 'N' ?
                                        <Box display="flex" mx={1} id={'patient_panel2_patient_mrgIcon'}>
                                            <img src={MrgIcon} alt={''} onMouseEnter={this.handleMrgMsgMouseEnter} onMouseLeave={this.handleMrgMsgMouseLeave} />
                                        </Box>
                                        : null}
                                    {/* Kk Lam - Add mrg_icon -> 2021-02-26 -> end */}
                                </Box>
                                <Box display="flex" flex={1} flexDirection="row" justifyContent="space-between" alignItems="center">
                                    {patient.nameChi ? <Box display="flex" mx={1} id={'patient_panel2_patient_chiName'}><Typography className={classnames(classes.chineseNameFont, classes.fontWeightBold)} noWrap>{patient.nameChi}{/*歐陽美麗*/}{/*六個中文字位*/}</Typography></Box> : null}
                                    <Box display="flex" mx={1} id={'patient_panel2_patient_gender'}><Typography className={classes.genderFont}>{patient.genderCd}</Typography></Box>
                                    <Box display="flex" mx={1} id={'patient_panel2_patient_age_unit'}><Typography className={classes.ageFont}>{`${patient.age}${patient.ageUnit[0]}`}</Typography></Box>
                                    <Box display="flex" mx={1} id={'patient_panel2_patient_dob'}><Typography className={classnames(classes.dobFont, classes.fontWeightBold)} noWrap>{RegUtil.getDobDateByFormat(patient.exactDobCd, patient.dob)}</Typography></Box>
                                    <Box display="flex" mx={1} id={'patient_panel2_patient_pri_doc_pair'}><Typography className={classnames(classes.docNoFont, classes.fontWeightBold)} noWrap>{this.getDocPair(patient)}</Typography></Box>
                                    <Box display="flex" mx={1}>
                                        <Button
                                            id={'patient_panel2_check_id_btn'}
                                            variant="contained"
                                            color="secondary"
                                            className={classes.checkIdButton}
                                            disabled={!patient.documentPairList || !patient.documentPairList.some(x => x.isProblem === 1)}
                                        >
                                            <Typography className={classes.checkLabel}>CHECK ID</Typography>
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                        <Box display="flex" flex="auto" flexDirection="row" justifyContent="flex-end" className={classes.panelRight}>
                            {width == 'xl' ? (
                                gridComponent
                            ) :
                                (
                                    <Box display="flex" flex="auto" flexDirection="row" justifyContent="flex-end" style={{ width: '100%' }}>
                                        <Button variant="contained" color="primary" className={classnames(classes.serviceNextButtonRoot, classes.serviceNextButton)} onClick={this.handleMenuClick}>
                                            <Box display="flex" flexDirection="column" justifyContent="center">
                                                <AppsIcon />
                                            </Box>
                                        </Button>
                                    </Box>
                                )}
                            <Box display="flex" felx={1} flexDirection="column" justifyContent="space-around" className={classnames(classes.serviceSection, { [classes.serviceBorderLeft]: width == 'xl' })}>
                                <Button variant="contained" color="primary" className={classnames(classes.serviceNextButtonRoot, classes.serviceNextButton)} onClick={()=>{this.props.auditAction('Click Next Patient','Patient Panel','Patient Panel',false,'patient');this.props.onNextPatient();}}>
                                    <Box display="flex" flexDirection="column" justifyContent="center">
                                        <PersonIcon />
                                        <ArrowRightAltIcon />
                                    </Box>
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                    <Popper open={this.state.open} placement="bottom-start" anchorEl={this.state.anchorEl} transition>
                        {({ TransitionProps }) => {
                            let docType = patient.primaryDocTypeCd;
                            let docTypeDesc = this.getPrimaryDocTypeDesc(docType);
                            let docNo = this.getDocNo(docType, patient);
                            return (
                                <Fade {...TransitionProps} timeout={350}>
                                    <Paper className={classes.popperRoot}>
                                        <Grid container direction="row" wrap="nowrap" style={{ marginBottom: 15 }}>
                                            <Typography className={classes.popperTitle}>{docTypeDesc}:</Typography>
                                            <Typography className={classes.popperContent}>{docNo}</Typography>
                                        </Grid>
                                        <Grid container direction="row" wrap="nowrap" style={{ marginBottom: 15 }}>
                                            <Typography className={classes.popperTitle}>English Name:</Typography>
                                            <Typography className={classes.popperContent}>{CommonUtilities.getFullName(patient.engSurname, patient.engGivename)}</Typography>
                                        </Grid>
                                        <Grid container direction="row" wrap="nowrap">
                                            <Typography className={classes.popperTitle}>Chinese Name:</Typography>
                                            <Typography className={classes.popperContent}>{patient.nameChi}</Typography>
                                        </Grid>
                                    </Paper>
                                </Fade>
                            );
                        }}
                    </Popper>
                    <Popper className={classes.alertPopperRoot} open={this.state.alertOpen} placement="bottom-start" anchorEl={this.state.alertAnchorEl} transition>
                        {({ TransitionProps }) => (
                            <Fade {...TransitionProps} timeout={350}>
                                <Paper className={classes.alertPaperRoot} elevation={5}>
                                    {sps?.patientAllergyList?.length > 0 || sps?.patientAdrList?.length > 0 || sps?.patientAlertList?.length > 0 ?
                                        (<>
                                            {sps?.patientAllergyList?.length > 0 ?
                                                (<Grid container direction="row" wrap="nowrap" className={classes.alertPopperGrid}>
                                                    <Typography className={classes.popperTitle}>Allergy:</Typography>
                                                    <Typography>
                                                        <pre className={classes.alertPopperContent}>{sps.patientAllergyList.map((x, i, arr) => `${arr.length > 1 ? '(' + (i + 1) + ') ' : ''}${x.displayName}`).join('\n')}</pre>
                                                    </Typography>
                                                </Grid>)
                                                : null}{sps?.patientAdrList?.length > 0 ?
                                                    (<Grid container direction="row" wrap="nowrap" className={classes.alertPopperGrid}>
                                                        <Typography className={classes.popperTitle}>ADR:</Typography>
                                                        <Typography>
                                                            <pre className={classes.alertPopperContent}>{sps.patientAdrList.map((x, i, arr) => `${arr.length > 1 ? '(' + (i + 1) + ') ' : ''}${x.drugDesc}`).join('\n')}</pre>
                                                        </Typography>
                                                    </Grid>)
                                                    : null}{sps?.patientAlertList?.length > 0 ?
                                                        (<Grid container direction="row" wrap="nowrap" className={classes.alertPopperGrid}>
                                                            <Typography className={classes.popperTitle}>Alert:</Typography>
                                                            <Typography>
                                                                <pre className={classes.alertPopperContent}>{sps.patientAlertList.map((x, i, arr) => `${arr.length > 1 ? '(' + (i + 1) + ') ' : ''}${x.alertDesc}`).join('\n')}</pre>
                                                            </Typography>
                                                        </Grid>) : null}
                                        </>) :
                                        (
                                            <Grid container direction="row" wrap="nowrap" className={classes.alertPopperGrid}>
                                                <Typography className={classes.popperTitle}>No Allergy Record</Typography>
                                                <Typography className={classes.popperContent}>
                                                    <pre className={classes.alertPopperContent}>{''}</pre>
                                                </Typography>
                                            </Grid>
                                        )}
                                </Paper>
                            </Fade>
                        )}
                    </Popper>
                    <Popover
                        open={this.state.isMenuOpen}
                        onClose={this.handleMenuClose}
                        anchorEl={this.state.menuAnchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right'
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                        }}
                    >
                        <Paper elevation={5}>
                            <Box display="flex" flexDirection="row" justifyContent="space-around" style={{ width: '880px', height: '110px' }}>
                                {gridComponent}
                            </Box>
                        </Paper>
                    </Popover>
                    {/* Kk Lam - Add mrg_icon -> 2021-02-26 -> start */}
                    <Popper open={this.state.mrgMsgOpen} placement="bottom-start" anchorEl={this.state.mrgMsgAnchorEl} transition style={{marginTop: 5}}>
                        {({ TransitionProps }) => {
                            return (
                                <>
                                    {patient.mrgStsMsg ?
                                        <Fade {...TransitionProps} timeout={350}>
                                            <Paper style={{maxWidth: '600px', padding: '6px 8px'}}>
                                                <Typography style={{whiteSpace: 'pre-line', wordBreak: 'break-all'}}>{patient.mrgStsMsg.split('\\n').join('\n')}</Typography>
                                            </Paper>
                                        </Fade>
                                        : null}
                                </>
                            );
                        }}
                    </Popper>
                    {/* Kk Lam - Add mrg_icon -> 2021-02-26 -> end */}
                </div>
            );
        }
        return (
            <Card className={classes.root}>
                <CardContent>
                    <Typography variant="h5">No {CommonUtilities.getPatientCall()} Message</Typography>
                </CardContent>
            </Card>
        );
    }
}

const mapStateToProps = state => {
    return {
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        loginInfo: state.login.loginInfo,
        userRoleType: state.login.loginInfo && state.login.loginInfo.userRoleType,
        isClinicalUser: state.login.loginInfo && state.login.loginInfo.isClinicalUser,
        menuList: state.login.menuList,
        patient: state.patient.patientInfo,
        encounterInfo: state.patient.encounterInfo,
        caseNoInfo: state.patient.caseNoInfo,
        pucChecking: state.patient.pucChecking,
        docTypeCodeList: state.common.commonCodeList.doc_type,
        saamPatientSummary: state.saamPatient.patientSummary
    };
};

const mapDispatchToProps = {
    addTabs,
    resetAll,
    getPatientBanner,
    clearPatientBanner,
    getSaamPatientSummary,
    clearSaamPatientSummary,
    auditAction,
    // dental Anthony sprint 6 2020/08/07 - Start
    getGdDefaultRoom
    // dental Anthony sprint 6 2020/08/07 - End
};

export default connect(mapStateToProps, mapDispatchToProps)(withWidth()(withStyles(styles)(PatientPanel2)));
