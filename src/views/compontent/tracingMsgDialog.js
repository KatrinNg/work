import React from 'react';
import CIMSPromptDialog from '../../components/Dialog/CIMSPromptDialog';

const TracingMsgDialog = props => {
    const { id, openTracingMsgDialog, handleTracingMsgDialogOk } = props;
    return (
        <CIMSPromptDialog
            open={openTracingMsgDialog}
            dialogTitle={'Defaulter Tracing Case'}
            classes={{
                paper: { width: '50%' }
            }}
            dialogContentText={
                <div style={{ fontWeight: 'bold' }}>Please contact nurse before the appointment is rescheduled/deleted.</div>
            }
            buttonConfig={
                [
                    {
                        id: `${id}_ok`,
                        name: 'OK',
                        onClick: () => { handleTracingMsgDialogOk(); }
                    }
                ]
            }
        />
    );
};

export default TracingMsgDialog;