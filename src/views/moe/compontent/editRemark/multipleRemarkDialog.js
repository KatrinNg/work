import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Typography,
    DialogContent,
    DialogActions,
    //InputBase,
    Grid
} from '@material-ui/core';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSTextField from '../../../../components/TextField/CIMSTextField';
import * as prescriptionUtilities from '../../../../utilities/prescriptionUtilities';
import _ from 'lodash';
import SaveDrugErrorMessage from './../saveDrugErrorMessage/saveDrugErrorMessage';
import {
    updateField
} from '../../../../store/actions/moe/moeAction';

const styles = {
    titleFont: {
        wordWrap: 'break-word',
        wordBreak: 'normal',
        width: 'calc(100% - 80px)'
    },
    fullWidth: {
        maxWidth: '100%',
        width: '80%'
    }
};
class MultipleRemarkDialog extends React.Component {
    constructor(props) {
        super(props);

        //Initialize the data to get the remarkText, dialogTitle, multiline, data
        let orginalData = _.cloneDeep(this.props.data);
        const isArray = Array.isArray(orginalData);
        let remarkText, drugTitle, remarkMutiple = false, remarkData = orginalData, disabledOk;
        if (!orginalData) {
            remarkText = this.props.remarkValue;
            drugTitle = this.props.dialogTitle;
            remarkMutiple = this.props.multiline;
            disabledOk = this.props.remarkValue ? false : true;
        } else {
            if (isArray) {
                if (orginalData.length > 1) {
                    drugTitle = 'drugs';
                    remarkMutiple = true;
                    //Initializes the disabled state of the ok button
                    disabledOk = true;
                    for (let i = 0; i < orginalData.length; i++) {
                        if (orginalData[i].remarkText) {
                            disabledOk = false;
                        } else {
                            disabledOk = true;
                            break;
                        }
                    }
                } else if (orginalData.length > 0) {
                    remarkData = orginalData[0];
                    drugTitle = prescriptionUtilities.getDrugPartTitle(orginalData[0]);
                    remarkText = orginalData[0].remarkText;
                    disabledOk = orginalData[0].remarkText ? false : true;
                }
            } else {
                drugTitle = prescriptionUtilities.getDrugPartTitle(orginalData);
                remarkText = orginalData.remarkText;
                disabledOk = this.props.data.remarkText ? false : true;
            }
        }

        this.state = {
            disabledOk: disabledOk,
            inputRow: this.props.inputRow ? this.props.inputRow : 5,
            open: this.props.open,
            dialogTitle: 'Remark for updating ' + drugTitle,
            remarkValue: remarkText,
            multiline: remarkMutiple,
            data: remarkData
        };
    }

    componentDidMount(){
        this.props.updateField({
            isSaveSuccess:false,
            saveMessageList:[]
        });
    }

    cancelClick = () => {
        this.props.cancelClick();
    }

    okClick = () => {
        this.props.okClick(this.state.remarkValue, this.state.data);
    }

    hanldeMultipleRemarkChange = (e, item) => {
        let { data } = this.state;

        const value = e.target.value;

        let curEditDrug = data.find(ele => ele.cmsItemNo === item.cmsItemNo);
        curEditDrug.remarkText = value;

        let disabled = true;
        for (let i = 0; i < data.length; i++) {
            if (data[i].remarkText && data[i].remarkText.trim()) {
                disabled = false;
            } else {
                disabled = true;
                break;
            }
        }
        this.setState({
            data,
            disabledOk: disabled
        });
    }

    remarkOnChange = (e) => {
        let disabled = true;
        if (e.target.value && e.target.value.trim().length > 0) {
            disabled = false;
        }
        let { data, remarkValue } = this.state;
        if (data) {
            data.remarkText = e.target.value;
        } else {
            remarkValue = e.target.value;
        }
        this.setState({
            disabledOk: disabled,
            remarkValue,
            data
        });

    }
    render() {
        const { id, classes, codeList} = this.props;
        const { inputRow, data, dialogTitle, multiline, open  } = this.state;
        return (
            <CIMSDialog
                id={id}
                open={open}
                dialogTitle={dialogTitle}
                classes={{
                    paper: classes.fullWidth
                }}
            >
                <DialogContent style={{ maxHeight: `calc(${window.screen.availHeight - 300}px)` }}>
                    {multiline &&
                        data.map((item, index) => {
                            return <Typography key={index} component={'div'}>
                                <Typography>
                                    ({index + 1}) {prescriptionUtilities.generatePanelTitle(item, codeList)}
                                </Typography>
                                <CIMSTextField
                                    fullWidth
                                    id={id + '_RemarkInputBase' + index}
                                    inputProps={{
                                        spellCheck: false,
                                        maxLength: 100
                                    }}
                                    value={item.remarkText}
                                    onChange={(e) => this.hanldeMultipleRemarkChange(e, item)}
                                    autoComplete="off"
                                    trim={'all'}
                                    multiline
                                    rows={inputRow}
                                    // style={{
                                    //     display: 'inline-block', paddingLeft: '5px', paddingRight: '5px',
                                    //     height: `${24 * inputRow}px`, border: '1px solid #B8BCB9'
                                    // }}
                                    InputProps={{
                                        style: {
                                            height: 'calc(24*' + this.state.inputRow + 'px)',
                                            lineHeight: 'inherit'
                                        }
                                    }}
                                />
                            </Typography>;
                        })
                    }
                    {!multiline &&
                        <CIMSTextField
                            fullWidth
                            id={id + '_RemarkInputBase'}
                            inputProps={{
                                spellCheck: false,
                                maxLength: 100
                            }}
                            value={data ? data.remarkText : this.state.remarkValue}
                            onChange={this.remarkOnChange}
                            autoComplete="off"
                            trim={'all'}
                            multiline
                            rows={inputRow}
                            // style={{
                            //     display: 'inline-block', paddingLeft: '5px', paddingRight: '5px',
                            //     height: `${24 * inputRow}px`, border: '1px solid #B8BCB9'
                            // }}
                            InputProps={{
                                style: {
                                    height: 'calc(24*' + this.state.inputRow + 'px)',
                                    lineHeight: 'inherit'
                                }
                            }}
                        />
                    }
                </DialogContent>
                <DialogActions>
                    <Grid item container justify="flex-start">
                        <SaveDrugErrorMessage />
                    </Grid>
                    <CIMSButton onClick={this.okClick} id={id + '_OkCIMSButton'} disabled={this.state.disabledOk}>OK</CIMSButton>
                    <CIMSButton onClick={this.cancelClick} id={id + '_CancelCIMSButton'}>Cancel</CIMSButton>
                </DialogActions>
            </CIMSDialog>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        codeList: state.moe.codeList
    };
};
const mapDispatchToProps = {
    updateField
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MultipleRemarkDialog));