import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import CIMSDialog from '../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import CIMSScrollBarTable from '../../../components/Table/CIMSScrollBarTable';
import { DialogContent, DialogActions, Typography, FormControl } from '@material-ui/core';

const styles = () => ({

});

class EditMultipleDialog extends Component {

    handleClose = () => {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    handlePrint = () => {

    }

    render() {
        const { columns, store, open, message, showTable, dialogTitle } = this.props;
        const id = this.props.id || 'CommonTableDialog';
        return (
            <CIMSDialog open={open} id={id} dialogTitle={dialogTitle}>
                <DialogContent>
                    <FormControl fullWidth>
                        <Typography variant="subtitle1" id={id + '_message'}>{message}</Typography>
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
                    {showTable ? <CIMSButton onClick={this.handlePrint} id={id + '_print'}>Print</CIMSButton> : null}
                    <CIMSButton onClick={this.handleClose} id={id + '_close'}>Close</CIMSButton>
                </DialogActions>
            </CIMSDialog>
        );
    }
}

export default withStyles(styles)(EditMultipleDialog);