import React from 'react';
import {
    Grid
} from '@material-ui/core';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import CIMSButton from '../../../components/Buttons/CIMSButton';

const PatientLinkPmiConfirmDialog = (props) => {
    const idPrefix = 'PatientLinkPmiConfirmDialog';

    return (
        <Grid>
            <CIMSPromptDialog
                open={props.isOpen}
                id={idPrefix}
                dialogTitle={'Confirmation of Patient Association'}
                // classes={{ paper: classes.dialogPaper }}
                dialogContentText={
                    <Grid container>
                        <Grid item xs={12}>
                            <p>Please confirm to associate the current appointment with the below patient</p>
                            <p>{props.patientText}</p>
                        </Grid>
                    </Grid>
                }
                dialogActions={
                    <Grid container wrap="nowrap" justify="flex-end">
                        <CIMSButton
                            id={`${idPrefix}_confirmBtn`}
                            onClick={() => {
                                props.auditAction('Click Confirm Button In Confirmation of Patient Association','Patient List');
                                props.btnClick('confirm'); }}
                        // disabled={!this.state.selectPatient}
                        >Confirm</CIMSButton>
                        <CIMSButton
                            id={`${idPrefix}_cancelBtn`}
                            onClick={() => {
                                props.auditAction('Click Cancel Button In Confirmation of Patient Association','Patient List','Patient List',false,'ana');
                                props.btnClick('cancel');
                            }}
                        >Cancel</CIMSButton>
                    </Grid>
                }
            />
        </Grid>
    );
};

export default PatientLinkPmiConfirmDialog;