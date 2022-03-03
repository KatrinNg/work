import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import {
    Grid,
    Typography
} from '@material-ui/core';
// import PatientPanel from '../compontent/patientPanel';
// import CIMSButton from '../../components/Buttons/CIMSButton';
// import Enum from '../../enums/enum';
import Moe from '../moe/moe';
// import GeneralAssessment from '../jos/assessment/general/GeneralAssessment';
// import ClinicalNote from '../jos/clinicalNote/clinicalNote';
// import { saveAll } from '../../store/actions/assessment/assessmentAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import { deleteSubTabs } from '../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../enums/accessRightEnum';
import EditModeMiddleware from '../compontent/editModeMiddleware';

const styles = () => ({
    alertButton: {
        color: '#fd0000',
        border: '1px solid #fd0000',
        '&:hover': {
            backgroundColor: '#fd0000',
            border: '1px solid #ffffff',
            color: '#ffffff'
        }
    },
    tabsRoot: {
        minHeight: 30
    },
    tabRoot: {
        minWidth: '72px',
        minHeight: 30,
        padding: ' 0px 12px'
    },
    tabAvatar: {
        width: 20,
        height: 20,
        borderRadius: '5%'
    }
});

// export function resizeHeight(dptid, minuend) {
//     let height = getOffsetHeight(dptid) - minuend;
//     let ele = document.querySelector('[dptid="' + dptid + '"]');
//     ele.style.height = ele.style.minHeight = ele.style.maxHeight = height + 'px';
// }

// export function getOffsetHeight(dptid) {
//     let ele = document.querySelector('[dptid="' + dptid + '"]');
//     return document.body.clientHeight - offset(ele).top;
// }


class ConsultationInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabValue: 0,
            prescTypeCd: 'O',
            patientTypeCd: 'O'
        };
    }

    componentDidMount() {
        this.props.ensureDidMount();
    }

    changeTabValue = (event, value) => {
        this.setState({ tabValue: value });
    }

    // handleNextPatient = () => {
    //     this.context.router.history.push('/index/consultation');
    // }
    onRef(name, ref) {
        switch (name) {
            case 'assessment':
                this.assessment = ref;
                break;
            case 'clinicalNote':
                this.clinicalNote = ref;
                break;
            default:
                break;
        }
    }
    saveAll = () => {
        this.props.saveAll({
            params: {
                'assessment': this.assessment.getSaveProps(),
                'clinicalNoteDtoList': this.clinicalNote.getSaveProps()
            },
            callback: (data) => {
                let payload = {
                    showSnackbar: true,
                    msgCode: data.msgCode
                };
                this.props.openCommonMessage(payload);
            }
        });
    }


    deleteSubTabs = () => {
        this.props.deleteSubTabs(accessRightEnum.precription);

    }

    render() {
        const { classes, appointmentInfo, patientInfo, encounterInfo } = this.props;
        if (patientInfo
            && patientInfo.patientKey > 0
            && appointmentInfo
            && appointmentInfo.appointmentId
            // && appointmentInfo.statusCd === 'A'
        ) {
            return (
                <Grid>
                    {/* <Grid>
                        <PatientPanel patient={this.state.patientKey ? this.props.patientInfo : null}>
                            <CIMSButton
                                variant="contained"
                                color="primary"
                                size="small"
                            >Medical Summary</CIMSButton>
                            <CIMSButton
                                variant="contained"
                                color="primary"
                                size="small"
                            >Immunisation</CIMSButton>
                            <CIMSButton
                                className={classes.alertButton}
                            >Alert</CIMSButton>
                        </PatientPanel>
                    </Grid> */}
                    <Grid>
                        <Grid container justify="space-between" alignItems="center">
                            {/* <Tabs
                                value={this.state.tabValue}
                                onChange={this.changeTabValue}
                                indicatorColor={'primary'}
                                classes={{ root: classes.tabsRoot }}
                            >
                                <Tab classes={{ root: classes.tabRoot }} label={<Typography style={{ fontSize: 16, textTransform: 'none' }}>Assessment</Typography>} />
                                <Tab classes={{ root: classes.tabRoot }} label={<Typography style={{ fontSize: 16, textTransform: 'none' }}>Note/Diagnosis</Typography>} />
                                <Tab classes={{ root: classes.tabRoot }} label={<Typography style={{ fontSize: 16, textTransform: 'none' }}>Prescription</Typography>} />
                                <Tab classes={{ root: classes.tabRoot }} label={<Typography style={{ fontSize: 16, textTransform: 'none' }}>Investigation</Typography>} />
                                <Tab classes={{ root: classes.tabRoot }} label={<Typography style={{ fontSize: 16, textTransform: 'none' }}>Letter</Typography>} />
                            </Tabs> */}
                        </Grid>
                        <Grid className={'nephele_content_body'}>
                            {/* <Typography component={'div'} style={{ display: this.state.tabValue === 0 ? 'block' : 'none' }}>
                                <Grid>
                                    <div style={{ minHeight: _minHeight }}></div>
                                </Grid>
                            </Typography>
                            <Typography component={'div'} style={{ display: this.state.tabValue === 1 ? 'block' : 'none' }}>
                                <Grid>
                                    <div style={{ minHeight: _minHeight }}></div>
                                </Grid>
                            </Typography> */}
                            <Typography component={'div'} >
                                <Grid /*style={{ minHeight: _minHeight }}*/>
                                    <Moe
                                        isCims
                                        patient={{
                                            ...this.props.patientInfo,
                                            encounterDateTime: appointmentInfo.appointmentDate && (appointmentInfo.appointmentDate + ' ' + appointmentInfo.appointmentTime),
                                            encounterId: encounterInfo.encounterId,
                                            prescTypeCd: this.state.prescTypeCd,
                                            patientTypeCd: this.state.patientTypeCd,
                                            clinic: this.props.clinicCd,
                                            spec: this.props.serviceCd
                                        }}
                                        cimsLoginInfo={this.props.loginInfo}
                                        presciptionClasses={classes}
                                        isSelectedPrescription
                                        logout={this.deleteSubTabs}
                                    />
                                </Grid>
                            </Typography>
                            {/* <Typography component={'div'} style={{ display: this.state.tabValue === 3 ? 'block' : 'none' }}>
                                <Grid>
                                    <div style={{ minHeight: _minHeight }}></div>
                                </Grid>
                            </Typography>
                            <Typography component={'div'} style={{ display: this.state.tabValue === 4 ? 'block' : 'none' }}>
                                <Grid>
                                    <div style={{ minHeight: _minHeight }}></div>
                                </Grid>
                            </Typography> */}
                        </Grid>
                    </Grid>
                    <EditModeMiddleware componentName={accessRightEnum.consultationInfo} when />
                </Grid>
            );
        } else {
            this.deleteSubTabs();
            this.props.openCommonMessage({ msgCode: '110501' });
            return null;
        }
    }
}

const mapStateToProps = (state) => {
    return {
        loginInfo: state.login.loginInfo,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        patientInfo: state.patient.patientInfo,
        appointmentInfo: state.patient.appointmentInfo,
        encounterInfo: state.patient.encounterInfo
    };
};

const mapDispatchToProps = {
    deleteSubTabs,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ConsultationInfo));