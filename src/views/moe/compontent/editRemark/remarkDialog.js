import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    DialogContent,
    DialogActions
    //InputBase
} from '@material-ui/core';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSTextField from '../../../../components/TextField/CIMSTextField';

const styles = {
    titleFont: {
        wordWrap: 'break-word',
        wordBreak: 'normal',
        width: 'calc(100% - 80px)'
    },
    fullWidth: {
        maxWidth: '100%',
        overflowY: 'unset',
        width: '80%'
    }
};
class RemarkDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // disabledOk: this.props.remarkValue ? false : true,
            inputRow: this.props.inputRow ? this.props.inputRow : 5
            // remarkValue: this.props.remarkValue
        };
    }

    initState = {
        // disabledOk: this.props.remarkValue ? false : true,
        inputRow: this.props.inputRow ? this.props.inputRow : 5
        //remarkValue: this.props.remarkValue
    };


    cancelClick = () => {
        this.setState({
            ...this.initState
        });
        this.props.cancelClick();
    }



    okClick = () => {
        this.props.okClick();
    }

    remarkOnChange = (e) => {
        let disabled = true;
        if (e.target.value && e.target.value.trim().length > 0) {
            disabled = false;
        }
        this.setState({ disabledOk: disabled });
        this.props.handleUpdateRemark('remarkValue', e.target.value);
    }
    render() {
        const { id, open, dialogTitle, classes } = this.props;
        const { inputRow } = this.state;

        // if (!remarkValue) remarkValue = this.props.remarkValue;
        return (
            <CIMSDialog
                id={id}
                open={open}
                dialogTitle={dialogTitle}
                classes={{
                    paper: classes.fullWidth
                }}
            >
                <DialogContent>
                    <CIMSTextField
                        fullWidth
                        id={id + '_RemarkInputBase'}
                        inputProps={{
                            spellCheck: false,
                            maxLength: 100
                        }}
                        value={this.props.remarkValue || ''}
                        onChange={this.remarkOnChange}
                        autoComplete="off"
                        multiline
                        rows={inputRow}
                        InputProps={{
                            style: {
                                height: 'calc(24*' + this.state.inputRow + 'px)',
                                lineHeight: 'inherit'
                            }
                        }}
                        // style={{
                        //     display: 'inline-block', paddingLeft: '5px', paddingRight: '5px',
                        //     height: `${24 * inputRow}px`, border: '1px solid #B8BCB9'
                        // }}
                        trim={'all'}
                    />
                </DialogContent>
                <DialogActions>
                    <CIMSButton onClick={this.okClick} id={id + '_OkCIMSButton'} disabled={this.props.remarkValue ? false :
                        true}
                    >OK</CIMSButton>
                    <CIMSButton onClick={this.cancelClick} id={id + '_CancelCIMSButton'}>Cancel</CIMSButton>
                </DialogActions>
            </CIMSDialog>
        );
    }
}
const mapStateToProps = () => {
    return {
    };
};
const mapDispatchToProps = {
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RemarkDialog));