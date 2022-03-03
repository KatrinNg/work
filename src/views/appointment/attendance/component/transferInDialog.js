import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { Grid, Typography } from '@material-ui/core';
import CIMSPromptDialog from 'components/Dialog/CIMSPromptDialog';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import {
    getDeliveryHospital
} from '../../../../store/actions/anServiceID/anServiceID';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';

class TransferInDialog extends React.Component {

    state = {
        tranferInDialogOpen: false,
        inputParams: null,
        deliveryHospitalList: [],
        hcinstId: null
    }

    componentDidMount() {
        // this.props.getDeliveryHospital({ siteId: this.props.siteId, rlatType: 'H', status: 'A' },
        //     (data) => { this.setState({ deliveryHospitalList: data }); }
        // );
    }

    shouldComponentUpdate(nextP, nextS) {
        if (this.state.tranferInDialogOpen===false&&nextS.tranferInDialogOpen === true) {
            this.props.getDeliveryHospital({ siteId: this.props.siteId, rlatType: 'H', status: 'A' },
                (data) => { this.setState({ deliveryHospitalList: data }); }
            );
        }
        return true;
    }

    handleConfirmTransferIn = () => {
        const formValid = this.transferInForm.isFormValid(false);
        const { inputParams, hcinstId } = this.state;
        formValid.then(result => {
            if (result) {
                this.props.confirm({ codHcinstId: hcinstId, isClcAntChange: 1 }, ...inputParams);
            }
        });
        this.resetAll();
    }

    doTransferIn = (...inputParams) => {
        this.setState({
            tranferInDialogOpen: true,
            inputParams: inputParams
        });
    }

    resetAll = () => {
        this.setState({
            tranferInDialogOpen: false,
            inputParams: null,
            hcinstId: null
        });
    }

    render() {
        const { classes } = this.props;
        const { hcinstId, deliveryHospitalList } = this.state;
        return (
            <CIMSPromptDialog
                open={this.state.tranferInDialogOpen}
                id={'attendance_tranferInDialog'}
                dialogTitle={'Transfer In'}
                classes={{
                    paper: classes.dialogPaper
                }}
                dialogContentText={
                    <ValidatorForm
                        ref={r => this.transferInForm = r}
                        onSubmit={this.handleConfirmTransferIn}
                    >
                        <Grid container spacing={2}>
                            <Grid item container xs={12}>
                                <Typography>This is a Transfer-in case. Please update the Delivery Hospital if necessary.</Typography>
                            </Grid>
                            <Grid item container xs={8}>
                                <SelectFieldValidator
                                    id={'attendance_deliveryHospital'}
                                    options={deliveryHospitalList.map(item => (
                                        { value: item.hcinstId, label: item.name }
                                    ))}
                                    value={hcinstId}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Delivery Hospital<RequiredIcon /></>
                                    }}
                                    //addNullOption
                                    name={'Delivery Hospital'}
                                    onChange={e => { this.setState({ hcinstId: e.value }); }}
                                    validators={[
                                        ValidatorEnum.required
                                    ]}
                                    errorMessages={[
                                        CommonMessage.VALIDATION_NOTE_REQUIRED()
                                    ]}
                                    absoluteMessage
                                />
                            </Grid>
                        </Grid>
                    </ValidatorForm>
                }
                buttonConfig={
                    [
                        {
                            id: 'attendance_tranferIn_confirm',
                            name: 'Confirm',
                            onClick: () => {
                                this.props.auditAction('Confirm Transfer In');
                                this.transferInForm.submit();
                            }
                        },
                        {
                            id: 'attendance_tranferIn_cancel',
                            name: 'Cancel',
                            onClick: () => {
                                this.props.auditAction('Cancel Transfer In', null, null, false, 'ana');
                                this.resetAll();
                            }
                        }
                    ]
                }
            />
        );
    }
}


const mapStatetoProps = (state) => {
    return ({
        siteId: state.login.clinic.siteId
    });
};

const mapDispatchtoProps = {
    getDeliveryHospital
};

const styles = theme => ({
    dialogPaper: {
        minWidth: '40%',
        maxWidth: '40%'
    }
});


export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(TransferInDialog));