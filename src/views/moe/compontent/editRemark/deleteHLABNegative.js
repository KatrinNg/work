import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    DialogContent,
    DialogActions
} from '@material-ui/core';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';

const styles = {
    multipleInputRoot: {
        height: 'calc(24*6px)',//line height * row
        lineHeight: 'inherit'
    },
    fullWidth: {
        maxWidth: '100%',
        overflowY: 'unset',
        width: '80%'
    }
};
class DeleteHLABNegative extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            remarkValue: ''
        };
    }

    handleChange = (e) => {
        let name = e.target.name;
        this.setState({
            [name]: e.target.value
        });
    }

    okClick = () => {
        this.refs.form.submit();
    }

    render() {
        const { id, open, classes, okDeleteHLABRemark, cancelDeleteHLABRemark } = this.props;
        return (
            <CIMSDialog
                id={id}
                open={open}
                dialogTitle={'Confirm deletion - Alert'}
                classes={{
                    paper: classes.fullWidth
                }}
            >
                <ValidatorForm
                    ref={'form'}
                    onSubmit={() => okDeleteHLABRemark(this.state.remarkValue)}
                >
                    <DialogContent>
                        <TextFieldValidator
                            id={id + '_DeleteHLABNegativeRemark'}
                            fullWidth
                            autoComplete={'off'}
                            onChange={this.handleChange}
                            value={this.state.remarkValue}
                            name={'remarkValue'}
                            multiline
                            rows={'6'}
                            inputProps={{
                                maxLength: 255,
                                placeholder: 'Please enter reason of deletion'
                            }}
                            InputProps={{
                                classes: { root: classes.multipleInputRoot }
                            }}
                            trim={'all'}
                            notShowMsg
                            labelPosition={'bottom'}
                            isRequired
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        />
                    </DialogContent>
                    <DialogActions>
                        <CIMSButton onClick={this.okClick} id={id + '_OkDeleteHLABNegativeRemarkButton'} disabled={this.state.remarkValue ? false : true}>
                            Proceed
                    </CIMSButton>
                        <CIMSButton onClick={cancelDeleteHLABRemark} id={id + '_CancelDeleteHLABNegativeRemarkButton'}>Cancel</CIMSButton>
                    </DialogActions>
                </ValidatorForm>
            </CIMSDialog>
        );
    }
}
// const mapStateToProps = () => {
//     return {
//     };
// };
// const mapDispatchToProps = {
// };
export default connect(null, null)(withStyles(styles)(DeleteHLABNegative));