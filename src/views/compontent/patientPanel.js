import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import {
    Card,
    CardContent,
    Grid,
    Fade,
    Paper,
    Popper,
    Typography
} from '@material-ui/core';
import moment from 'moment';
import Enum from '../../enums/enum';
import * as CommonUtilities from '../../utilities/commonUtilities';
import * as caseNoUtilities from '../../utilities/caseNoUtilities';
import * as PatientUtil from '../../utilities/patientUtilities';
import { resetAll } from '../../store/actions/patient/patientAction';

const styles = theme => ({
    root: {
        width: '100%',
        overflow: 'unset'
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
    }
});

class PatientPanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            anchorEl: null
        };
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    handleMouseEnter = (e) => {
        this.setState({ anchorEl: e.currentTarget, open: true });
    }

    handleMouseLeave = () => {
        this.setState({ anchorEl: null, open: false });
    }

    getPrimaryDocType = (value) => {
        if (value) {
            const docTypeCode = this.props.docTypeCodeList.find(item => item.code === value);
            return docTypeCode && docTypeCode.engDesc;
        }
        return '';
    };


    getDocPair = (patient) => {
        let docType = this.getPrimaryDocType(patient.primaryDocTypeCd);
        let docNo = PatientUtil.isHKIDFormat(docType) ? PatientUtil.getHkidFormat(patient.primaryDocNo) : patient.primaryDocNo;
        return (docType&&docNo)?(docType + ': ' + docNo):'';
    }

    render() {
        const { classes, patient, caseNoInfo } = this.props;

        if (patient && patient.patientKey) {
            // const hkid = patient.hkid && patient.hkid.substring(0, patient.hkid.length - 1);
            // const hkidNum = patient.hkid && patient.hkid.substring(patient.hkid.length - 1);
            let colorClasses = '';
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
                    default: break;
                }
            }
            return (
                <Card className={`${classes.root} ${colorClasses}`}>
                    <Grid container justify="space-between">
                        <Grid item container xs={8} className={classes.cardContentRoot}>
                            <Grid container direction="row" id={'patient_panel_name_row_div'}>
                                <Grid item container xs={12} wrap="nowrap" direction="row" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                                    <Typography className={classes.content} noWrap>{CommonUtilities.getFullName(patient.engSurname,patient.engGivename)}</Typography>
                                    <Typography className={classes.content} noWrap>{patient.nameChi ? `(${patient.nameChi})` : ''}</Typography>
                                </Grid>
                                {/* <Grid item container xs={3} justify="center">
                                    <Typography className={classes.content}></Typography>
                                </Grid> */}
                            </Grid>
                            <Grid container id={'patient_panel_patient_information_row_div'}>
                                <Typography className={classes.contentPadding}>{this.getDocPair(patient)}</Typography>
                                <Typography className={classes.contentPadding}>DOB: {moment(patient.dob).format(Enum.DATE_FORMAT_EDMY_VALUE)}</Typography>
                                <Typography className={classes.contentPadding}>Age: {`${patient.age}${patient.ageUnit[0]}`}</Typography>
                                <Typography className={classes.contentPadding}>Sex: {patient.genderCd}</Typography>
                                {
                                    caseNoInfo && caseNoInfo.caseNo ? <Typography className={classes.contentPadding}>Case No: {caseNoUtilities.getCaseAlias(caseNoInfo)}</Typography> : null
                                }
                            </Grid>
                        </Grid>
                        <Grid item container alignItems="center" justify="flex-end" xs={4} wrap="nowrap">
                            {this.props.children}
                        </Grid>
                    </Grid>
                    <Popper
                        open={this.state.open}
                        placement="bottom-start"
                        anchorEl={this.state.anchorEl}
                        transition
                    >
                        {({ TransitionProps }) => (
                            <Fade {...TransitionProps} timeout={350}>
                                <Paper className={classes.popperRoot}>
                                    <Grid container direction="row" wrap="nowrap" style={{ marginBottom: 15 }}>
                                        <Typography className={classes.popperTitle}>English Name:</Typography>
                                        <Typography className={classes.popperContent}>{CommonUtilities.getFullName(patient.engSurname,patient.engGivename)}</Typography>
                                    </Grid>
                                    <Grid container direction="row" wrap="nowrap">
                                        <Typography className={classes.popperTitle}>Chinese Name:</Typography>
                                        <Typography className={classes.popperContent}>{patient.nameChi}</Typography>
                                    </Grid>
                                </Paper>
                            </Fade>
                        )}
                    </Popper>
                </Card>
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

const mapStateToProps = (state) => {
    return {
        patient: state.patient.patientInfo,
        encounterInfo: state.patient.encounterInfo,
        caseNoInfo: state.patient.caseNoInfo,
        docTypeCodeList: state.common.commonCodeList.doc_type
    };
};

const mapDispatchToProps = {
    resetAll
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PatientPanel));