import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSAlertDialog from '../../../components/Dialog/CIMSAlertDialog';
import {
    openErrorMessage,
    closeErrorMessage
} from '../../../store/actions/common/commonAction';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { closeCommonCircular } from '../../../store/actions/common/commonAction';

const styles = () => ({
    root: {
        width: '100%',
        maxWidth: 360
    }
});

class CommonErrorDialog extends Component {

    componentDidMount(){
        this.props.closeCommonCircular();
    }

    handleClose = () => {
        this.props.closeErrorMessage();
    }

    render() {
        const { classes } = this.props;
        return (
            <CIMSAlertDialog
                id="common-dialog"
                open={this.props.openErrorDialog}
                onClickOK={this.handleClose}
                onClose={this.handleClose}
                dialogTitle={this.props.errorTitle || 'Error'}
                dialogContentTitle={this.props.errorMessage}
                dialogContentText={
                    this.props.errorData && this.props.errorData.length > 0 ?
                        <List className={classes.root}>
                            {this.props.errorData.map((item, index) => (
                                <ListItem disableGutters key={index}>
                                    {/* <ListItemText primary={item.fieldName} style={{ textAlign: 'left' }} />
                                    <ListItemText primary={item.errMsg} style={{ textAlign: 'left' }} /> */}
                                     <ListItemText primary={(item || '').toString()} style={{ textAlign: 'left' }} />
                                </ListItem>
                            ))}
                        </List> : null
                }
            />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        openErrorDialog: state.common.openErrorDialog,
        errorMessage: state.common.errorMessage,
        errorData: state.common.errorData,
        errorTitle: state.common.errorTitle
    };
};

const mapDispatchToProps = {
    openErrorMessage,
    closeErrorMessage,
    closeCommonCircular
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CommonErrorDialog));