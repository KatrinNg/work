import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';

const useStyle = makeStyles(theme => ({
    chargeableTxt: {
        fontWeight: 'bold',
        color: theme.palette.error.main,
        marginTop:4
    },
    unChargeableTxt: {
        fontWeight: 'bold'
    }
}));

const PaymentMsgDialog = (props) => {
    const { id, paymentMsgDialogParams, encounterTypes } = props;
    const classes = useStyle();
    const selectEnctr = encounterTypes.find(x => x.encntrTypeId === paymentMsgDialogParams.encounterTypeId);
    const contentTxt = () => {
        if (selectEnctr && selectEnctr.isCharge) {
            return (
                <Grid container>
                    <Grid item container>Attendance marked successfully.</Grid>
                    <Grid item container className={classes.chargeableTxt}>
                        No Encounter will be created as Payment is required.
                    </Grid>
                </Grid>
            );
        } else {
            return (
                <Grid className={classes.unChargeableTxt}>
                    Attendance marked successfully and Encounter is created.
                </Grid>
            );
        }
    };
    const handleOk = () => {
        props.handlePaymentMsgDialogOk();
    };
    return (
        <Grid>
            <CIMSPromptDialog
                open={paymentMsgDialogParams.open}
                id={id}
                dialogTitle={'Mark Attendance'}
                dialogContentText={
                    <Grid container>
                        {contentTxt()}
                    </Grid>
                }
                buttonConfig={
                    [
                        {
                            id: id + '_ok',
                            name: 'OK',
                            onClick: handleOk
                        }
                    ]
                }
            />
        </Grid>
    );
};

const mapState = (state) => {
    return {
        encounterTypes: state.common.encounterTypes
    };
};

const dispatch = () => {

};


export default connect(mapState, dispatch)(PaymentMsgDialog);