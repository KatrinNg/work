import React from 'react';
import {
    Grid
} from '@material-ui/core';
import CIMSPromptDialog from '../../components/Dialog/CIMSPromptDialog';
import CIMSButton from '../../components/Buttons/CIMSButton';

const ApptAssociationConfirmDialog = (props) => {
    const idPrefix = 'apptAssociationConfirmDialog';

    const {isOpen, apptData, btnClick} = props;

    return (
        <Grid>
            <CIMSPromptDialog
                open={isOpen}
                id={idPrefix}
                dialogTitle={'Confirmation of Appointment Association'}
                // classes={{ paper: classes.dialogPaper }}
                dialogContentText={
                    <Grid container>
                        <Grid item xs={12}>
                            <p>Please confirm to associate the below appointment with this patient:</p>
                            <table>
                                <tr>
                                    <td>{apptData.enCounter.name}:</td>
                                    <td>{apptData.enCounter.value}</td>
                                </tr>
                                <tr>
                                    <td>{apptData.room.name}:</td>
                                    <td>{apptData.room.value}</td>
                                </tr>
                                <tr>
                                    <td>{apptData.apptTime.name}:</td>
                                    <td>{apptData.apptTime.value}</td>
                                </tr>
                            </table>
                        </Grid>
                    </Grid>
                }
                dialogActions={
                    <Grid container wrap="nowrap" justify="flex-end">
                        <CIMSButton
                            id={`${idPrefix}_confirmBtn`}
                            onClick={() => {
                                btnClick('confirm');
                            }}
                            // disabled={!this.state.selectPatient}
                        >Confirm</CIMSButton>
                        <CIMSButton
                            id={`${idPrefix}_cancelBtn`}
                            onClick={() => {
                                btnClick('cancel');
                            }}
                        >Cancel</CIMSButton>
                    </Grid>
                }
            />
        </Grid>
    );
};

export default ApptAssociationConfirmDialog;