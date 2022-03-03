import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import CIMSDialog from '../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import CIMSScrollBarTable from '../../../components/Table/CIMSScrollBarTable';
import { DialogContent, DialogActions, Typography, FormControl } from '@material-ui/core';

const styles = () => ({

});

class CommonTableDialog extends Component {

    handleClose = () => {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    render() {
        const { columns, store, open, message, showTable, dialogTitle } = this.props;
        const id = this.props.id || 'CommonTableDialog';
        return (
            <CIMSDialog open={open} id={id} dialogTitle={dialogTitle}>
                <DialogContent>
                    <FormControl fullWidth>
                        <Typography variant="subtitle1">{message}</Typography>
                    </FormControl>
                    {
                        showTable ?
                            <FormControl fullWidth>
                                <CIMSScrollBarTable
                                    id={id + '_scrollBarTable'}
                                    columns={columns}
                                    store={store}
                                />
                            </FormControl> : null
                    }
                </DialogContent>
                <DialogActions>
                    <CIMSButton onClick={this.handleClose} id={id + '_close'}>Close</CIMSButton>
                </DialogActions>
            </CIMSDialog>
        );
    }
}

export default withStyles(styles)(CommonTableDialog);