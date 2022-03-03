import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import DtsEncounterHistory from './DtsEncounterHistory';
import DtsEncounterHistoryFooter from './DtsEncounterHistoryFooter';
import { resetAll, dtsGetEncounterHistory } from '../../../../store/actions/dts/patient/DtsPatientSummaryAction';
import { StatusList as EncounterStatusList } from '../../../../enums/dts/encounter/encounterStatusEnum';
import {
    //Checkbox,
    Typography,
    FormControlLabel
} from '@material-ui/core';
import CIMSCheckBox from '../../../../components/CheckBox/CIMSCheckBox';

const styles = () => ({
    dialogPaper: {
        width: '1400px'
    },
    row: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
        // margin: '10px 3px 0px 3px'
    },
    row2:{
        width: '100%',
        justifyContent: 'center'
    },
    checkLabelMagin: {
        margin: 0
    },
    checkPadding: {
        margin: 0,
        padding: 10
    },
    actionNotSave: {
        backgroundColor: '#ffff009c'
    },
    actionInProg: {
        backgroundColor: '#9de2ffc9'
    },
    actionPending: {
        backgroundColor: '#ff83fab8'
    },
    actionComp: {
        backgroundColor: '#55e29cb8'
    }
});

class DtsEncounterHistoryDialog extends Component {
    constructor(props) {
        super(props);
        this.state={
            viewAllDentalClinics: false
        };
    }

    componentDidUpdate =() => {

    }
    handleClose = () => {
        this.props.closeConfirmDialog();
    };

    handleViewAllDentalClinicsChange = (event) => {
        this.setState({ viewAllDentalClinics: event.target.checked }, this.getEncounterHistoryListByCheckbox);
        // this.getEncounterHistoryListByCheckbox();
    };

    getEncounterHistoryListByCheckbox = () => {
        if (this.state.viewAllDentalClinics === true){
            const flwupPara = {
                patientKey: this.props.patientInfo.patientKey,
                svcCd: 'DTS',
                sortByEncounterDate: 'D',
                siteId: ''
            };
            this.props.dtsGetEncounterHistory(flwupPara);
        }
        if (this.state.viewAllDentalClinics === false){
            const flwupPara = {
                patientKey: this.props.patientInfo.patientKey,
                svcCd: 'DTS',
                sortByEncounterDate: 'D',
                siteId: this.props.clinic.siteId
            };
            this.props.dtsGetEncounterHistory(flwupPara);
        }
    }
    getActionTypeClass = (encounterStatus) => {
        const { classes } = this.props;

        if (encounterStatus) {
            switch (encounterStatus) {
                case EncounterStatusList.NOT_YET_CALLED: {
                    return classes.actionNotSave;
                }
                case EncounterStatusList.CALLED_AND_IN_PROGRESS: {
                    return classes.actionInProg;
                }
                case EncounterStatusList.SURGERY_COMPLETED_BUT_WRITE_UP_NOT_YET_COMPLETED: {
                    return classes.actionPending;
                }
                case EncounterStatusList.ENCOUNTER_COMPLETED: {
                    return classes.actionComp;
                }
            }
        }
        else {
            return '';
        }
    }

    render() {
        const { openConfirmDialog, patientInfo, classes } = this.props;
        return (
            <CIMSPromptDialog
                open={openConfirmDialog}
                dialogTitle={'Encounter History'}
                classes={{
                    paper: classes.dialogPaper
                }}
                dialogContentText={
                    <div>
                        <div className={classes.row2}>
                            <FormControlLabel
                                control={
                                    <CIMSCheckBox
                                        id={'viewAllDentalClinics'}
                                        disabled={false}
                                        className={classes.checkPadding}
                                        onChange={this.handleViewAllDentalClinicsChange}
                                        checked={this.state.viewAllDentalClinics}
                                    />
                                }
                                className={classes.checkLabelMagin}
                                label={<Typography variant="subtitle1">View All Dental Clinics</Typography>}
                            />
                        </div>
                        <div className={classes.row}><DtsEncounterHistory /></div>
                        <div className={classes.row}><DtsEncounterHistoryFooter actionTypeClassFunc={this.getActionTypeClass} /></div>
                    </div>
                }
                buttonConfig={[
                    {
                        name: 'Close',
                        onClick: this.handleClose
                    }
                ]}
            />
        );
    }
}
function mapStateToProps(state) {
    return {
        patientInfo: state.patient.patientInfo,
        action: state.dtsPatientSummary.redirect.action,
        clinic: state.login.clinic
    };
}

const mapDispatchToProps = {
    dtsGetEncounterHistory
};
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(DtsEncounterHistoryDialog));
