import React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CIMSDialog from '../../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';

import { DialogActions, DialogContent } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    settingEditDialog: {
        maxWidth: '45%'
    },
    title: {
        fontSize: '22px',
        color: 'rgb(255, 0, 0)',
        textAlign: 'center'
    }
}));

const RestrictedDialog = React.forwardRef((props, ref) => {
    const { id, isAdd, open } = props;
    const classes = useStyles();

    const handleCancelDialog = () => {
        props.handleCloseDialog();
    };


    const handleOKDialog = (e) => {
        e.preventDefault();
        props.handleConfirmDialog();
    };
    return (
        <CIMSDialog
            open={open}
            id={id}
            style={{ display: 'flex', flexDirection: 'row' }}
            classes={{
                paper: classes.settingEditDialog
            }}
            dialogTitle={'Warning'}
        >
            <DialogContent >
                <Typography component="div">
                    <p className={classes.title}>RESTRICTED</p>
                    <p>Beware! You are now exporting data with personal particular classified as "Restricted".</p>
                    <p>Any exporting of these data should follow the rules and regulation, guidelines, protocol, instructions on handling "Restricted" document set by HKSAP/Bureau/Department/Service. Prior approval one each occasion form the Service Head should be sought if exported data will be stored in any removable storage media.</p>
                    <p>Pelase click confirm to continue exporting the data or click cancel to stop the action.</p>
                </Typography>
            </DialogContent>
            <DialogActions style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                <CIMSButton onClick={handleOKDialog} id={id + '_OkCIMSButton'}>Confirm</CIMSButton>
                <CIMSButton onClick={handleCancelDialog} id={id + '_CancelCIMSButton'}>Cancel</CIMSButton>
            </DialogActions>
        </CIMSDialog>
    );
});

export default RestrictedDialog;