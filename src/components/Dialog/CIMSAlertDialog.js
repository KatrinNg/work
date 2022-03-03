import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CIMSButton from '../Buttons/CIMSButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';

const styles =() => ({
    paper: {
        minWidth: 300
    },
    dialogTitle: {
        fontWeight: 'bold',
        fontSize: 16
    },
    formControlCss: {
        backgroundColor: '#b8bcb9',
        padding: '10px 10px 10px 10px'
    },
    formControl2Css: {
        backgroundColor: '#ffffff'
    }
});

class CIMSAlertDialog extends Component {

    render() {
        const { classes } = this.props;
        return (
            <Dialog
                classes={{
                    paper: classes.paper
                }}
                style={this.props.dialogStyle}
                id={this.props.id}
                open={this.props.open}
                onClose={this.props.onClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <FormControl className={classes.formControlCss}>
                    <Typography variant="subtitle2" className={classes.dialogTitle} id={this.props.id + '-title'}>{this.props.dialogTitle}</Typography>
                    <FormControl className={classes.formControl2Css}>
                        <DialogContent id={this.props.id + '-description'}>
                            <Typography variant="subtitle1">{this.props.dialogContentTitle}</Typography>
                            {this.props.dialogContentText}
                        </DialogContent>
                        <DialogActions>
                            <CIMSButton onClick={this.props.onClickOK} id={this.props.id + '-ok'} color="primary">{this.props.okButtonName}</CIMSButton>
                            {this.props.btnCancel ? <CIMSButton onClick={this.props.onClickCancel} color="primary" id={this.props.id + '-cancel'} autoFocus>{this.props.cancelButtonName}</CIMSButton> : null}
                            {this.props.buttonAction}
                        </DialogActions>
                    </FormControl>
                </FormControl>
            </Dialog>
        );
    }
}

CIMSAlertDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
    onClose: PropTypes.func,
    onClickOK: PropTypes.func.isRequired,
    dialogTitle: PropTypes.string,
    onClickCancel: PropTypes.func,
    btnCancel: PropTypes.bool,
    okButtonName: PropTypes.string,
    cancelButtonName: PropTypes.string,
    dialogContentText: PropTypes.node || PropTypes.string,
    dialogContentTitle: PropTypes.string
};

CIMSAlertDialog.defaultProps = {
    onClickCancel: () => { },
    onClose: () => { },
    okButtonName: 'OK',
    cancelButtonName: 'Cancel',
    dialogTitle: '',
    dialogContentTitle: '',
    dialogContentText: '',
    btnCancel: false
};

export default withStyles(styles)(CIMSAlertDialog);