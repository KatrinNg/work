import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    DialogContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@material-ui/core';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import warningIcon from '../../../../images/moe/icon-warning.gif';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import CIMSCheckbox from '../../../../components/CheckBox/CIMSCheckBox';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';

const styles = {
    checkboxBtn: {
        height: 26,
        paddingTop: 0,
        paddingBottom: 0
    },
    multipleInputRoot: {
        height: 'calc(24*2px)',
        lineHeight: 'inherit'
    }
};

class Hlab1502Dialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            positiveCkbList: [false, false],
            noKnownCkbList: [false, false, false, false],
            hLABRemarkVal: '',
            isAbleClickOk: false,
            isAbleEnterRemark: false,
            positiveDescList: [
                { val: 0, desc: 'This patient has an established history of use of carbamazepine without problem' },
                { val: 1, desc: 'Others (Please specify reason below)' }
            ],
            noKnownDescList: [
                { val: 0, desc: 'The test result of HLA-B*1502 of this patient is negative' },
                { val: 1, desc: 'This patient has an established history of use of carbamazepine without problem' },
                { val: 2, desc: 'This patient does not belong to an Asian ethnicity' },
                { val: 3, desc: 'Others (Please specify reason below)' }
            ]
        };
    }

    componentDidMount = () => {
        if (this.props.savedReasonDesc && this.props.savedReasonDesc.length > 0) {
            if (this.props.isPositive) {
                let positiveCkbList = [];
                let hLABRemarkVal = '';
                for (let z = 0; z < this.state.positiveDescList.length; z++) {
                    let isChecked = false;
                    if (z === 1) {
                        for (let j = 0; j < this.props.savedReasonDesc.length; j++) {
                            let isOther = true;
                            for (let k = 0; k < this.state.positiveDescList.length; k++) {
                                if (this.props.savedReasonDesc[j] === this.state.positiveDescList[k].desc) {
                                    isOther = false;
                                    break;
                                }
                            }
                            if (isOther) {
                                isChecked = true;
                                hLABRemarkVal = this.props.savedReasonDesc[j];
                                break;
                            }
                        }
                    } else {
                        for (let i = 0; i < this.props.savedReasonDesc.length; i++) {
                            if (this.props.savedReasonDesc[i] === this.state.positiveDescList[z].desc) {
                                isChecked = true;
                                break;
                            }
                        }
                    }
                    positiveCkbList.push(isChecked);
                }

                this.setState({
                    isAbleClickOk: true,
                    positiveCkbList,
                    hLABRemarkVal,
                    isAbleEnterRemark: hLABRemarkVal.length > 0
                });
            } else {
                let noKnownCkbList = [];
                let hLABRemarkVal = '';
                for (let z = 0; z < this.state.noKnownDescList.length; z++) {
                    let isChecked = false;
                    if (z === 3) {
                        for (let j = 0; j < this.props.savedReasonDesc.length; j++) {
                            let isOther = true;
                            for (let k = 0; k < this.state.noKnownDescList.length; k++) {
                                if (this.props.savedReasonDesc[j] === this.state.noKnownDescList[k].desc) {
                                    isOther = false;
                                    break;
                                }
                            }
                            if (isOther) {
                                isChecked = true;
                                hLABRemarkVal = this.props.savedReasonDesc[j];
                                break;
                            }
                        }
                    } else {
                        for (let i = 0; i < this.props.savedReasonDesc.length; i++) {
                            if (this.props.savedReasonDesc[i] === this.state.noKnownDescList[z].desc) {
                                isChecked = true;
                                break;
                            }
                        }
                    }
                    noKnownCkbList.push(isChecked);
                }

                this.setState({
                    isAbleClickOk: true,
                    noKnownCkbList,
                    hLABRemarkVal,
                    isAbleEnterRemark: hLABRemarkVal.length > 0
                });
            }
        }
    }

    setAbleClickOk = (isAbleEnterRemark, hLABRemarkVal, ckbList) => {
        let isAbleClickOk = true;
        if (isAbleEnterRemark && hLABRemarkVal.length === 0) {
            isAbleClickOk = false;
        }
        if (ckbList) {
            let existCheck = ckbList.find((value) => {
                if (value) return true;
            }) ? true : false;
            if (!existCheck) isAbleClickOk = false;
        }
        return isAbleClickOk;
    }

    handleToggle = (e) => {
        const name = e.target.name;
        let isAbleClickOk = this.setAbleClickOk(this.state.isAbleEnterRemark, e.target.value);
        // if (this.state.isAbleEnterRemark && e.target.value.length === 0) {
        //     isAbleClickOk = false;
        // }
        this.setState({
            isAbleClickOk: isAbleClickOk,
            [name]: e.target.value
        });
    }

    handleCheckBoxChange = (index) => {
        let ckbList = this.props.isPositive ? this.state.positiveCkbList : this.state.noKnownCkbList;
        ckbList[index] = !ckbList[index];

        if (this.props.isPositive) {
            let isAbleEnterRemark = ckbList[1] ? true : false;
            let hLABRemarkVal = index === 1 ? '' : this.state.hLABRemarkVal;
            this.setState({
                positiveCkbList: ckbList,
                isAbleClickOk: this.setAbleClickOk(isAbleEnterRemark, hLABRemarkVal, ckbList),
                isAbleEnterRemark: isAbleEnterRemark,
                hLABRemarkVal: hLABRemarkVal
            });
        }
        else {
            let isAbleEnterRemark = ckbList[3] ? true : false;
            let hLABRemarkVal = index === 3 ? '' : this.state.hLABRemarkVal;
            this.setState({
                noKnownCkbList: ckbList,
                isAbleClickOk: this.setAbleClickOk(isAbleEnterRemark, hLABRemarkVal, ckbList),
                isAbleEnterRemark: isAbleEnterRemark,
                hLABRemarkVal: hLABRemarkVal
            });
        }
    }

    handleError = (errors) => {
        let routeError = errors && errors.find(item => item.props.name === 'ddlRoute');
        if (routeError) {
            return;
        } else {
            const { errorMessageList } = this.props;
            if (errorMessageList) {
                console.log(errorMessageList);
            }
        }
    }

    handleOkClick = () => {
        this.refs.form.submit();
    }

    render() {
        const { id, open, beCheckedItem, classes, cancelHLAB1502Dialog, isPositive, okHLAB1502Dialog } = this.props;

        if (beCheckedItem && isPositive !== null)
            return (
                <CIMSDialog
                    id={id + '_HLAB1502Dialog'}
                    open={open}
                    dialogTitle={isPositive ? 'HLA-B*1502 detected' : 'HLA-B*1502 Lab Test Reminder'}
                >
                    <ValidatorForm
                        ref={'form'}
                        onSubmit={() => okHLAB1502Dialog(
                            this.props.isPositive ? this.state.positiveCkbList : this.state.noKnownCkbList,
                            this.props.isPositive ? this.state.positiveDescList : this.state.noKnownDescList,
                            this.state.hLABRemarkVal
                        )}
                        onError={this.handleError}
                    >
                        <DialogContent>
                            <Grid container spacing={1} style={{ width: '800px' }}>
                                <Grid item xs={12}>
                                    <img src={warningIcon} alt={'Warning'} style={{ float: 'left' }} />
                                    {isPositive &&
                                        <Typography component={'div'} style={{ float: 'left', paddingLeft: '4px' }}>
                                            <Typography>This patient is <b>positive</b> for HLA-B*1502.</Typography>
                                            <Typography><font color={'red'}>carbamazepine</font> should <b>not</b> be prescribed.</Typography>
                                        </Typography>
                                    }
                                    {!isPositive &&
                                        <Typography component={'div'} style={{ float: 'left', paddingLeft: '4px' }}>
                                            <Typography><font color={'red'}>carbamazepine</font> should be prescribed only if</Typography>
                                            <br />
                                            <Typography>(1)HLA-B*1502 test result is <b>negative</b>; or</Typography>
                                            <Typography>(2)the patient has an established history of use of <font color={'red'}>carbamazepine</font> without problem.</Typography>
                                        </Typography>
                                    }
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography>If you wish to prescribe anyway, you must provide the reason(s) for overriding this alert:</Typography>
                                </Grid>
                                {isPositive &&
                                    <Typography component={'div'}>
                                        <List>
                                            {this.state.positiveDescList.map((item, index) => {
                                                return (
                                                    <ListItem key={'HLABPositiveCKB' + index} button onClick={() => this.handleCheckBoxChange(index)} style={{ height: '30px' }}>
                                                        <ListItemIcon>
                                                            <CIMSCheckbox
                                                                classes={{
                                                                    root: classes.checkboxBtn
                                                                }}
                                                                id={id + '_HLABPositiveCKB' + index}
                                                                checked={this.state.positiveCkbList[index]}
                                                            />
                                                        </ListItemIcon>
                                                        <ListItemText primary={item.desc} />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Typography>
                                }
                                {!isPositive &&
                                    <Typography component={'div'}>
                                        <List>
                                            {this.state.noKnownDescList.map((item, index) => {
                                                return (
                                                    <ListItem key={'HLABUnknownCKB0' + index} button onClick={() => this.handleCheckBoxChange(index)} style={{ height: '30px' }}>
                                                        <ListItemIcon>
                                                            <CIMSCheckbox
                                                                classes={{
                                                                    root: classes.checkboxBtn
                                                                }}
                                                                id={id + '_HLABUnknownCKB' + index}
                                                                onChange={(e) => this.handleCheckBoxChange(e, index)}
                                                                checked={this.state.noKnownCkbList[index]}
                                                            />
                                                        </ListItemIcon>
                                                        <ListItemText primary={item.desc} />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Typography>
                                }
                                <Grid item xs={12}>
                                    <Typography>Remark</Typography>
                                    <TextFieldValidator
                                        id={id + '_HLABRemark'}
                                        fullWidth
                                        autoComplete={'off'}
                                        onChange={this.handleToggle}
                                        value={this.state.hLABRemarkVal}
                                        name={'hLABRemarkVal'}
                                        multiline
                                        rows={'2'}
                                        inputProps={{
                                            maxLength: 255
                                        }}
                                        disabled={!this.state.isAbleEnterRemark}
                                        InputProps={{
                                            classes: { root: classes.multipleInputRoot }
                                        }}
                                        notShowMsg
                                        trim={'all'}
                                        labelPosition={'bottom'}
                                        isRequired={this.state.isAbleEnterRemark}
                                        validators={this.state.isAbleEnterRemark ? [ValidatorEnum.required] : []}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    />
                                </Grid>
                                {/* <Grid container item xs={6} justify={'flex-start'}>
                                {this.state.errorMessageList
                                 && this.state.errorMessageList.length > 0
                                 && this.state.errorMessageList.map((item,index)=>{
                                        return(
                                            // <Typography component={'div'} key={'errorMessage'+index} style={{color:'red'}}>
                                            //     {item.fieldName} : {item.errMsg}
                                            // </Typography>
                                            <Typography key={index} color={'error'}>{`${item.fieldName}: ${item.errMsg}`}</Typography>
                                        );
                                    })
                                }
                            </Grid> */}
                                <Grid container item xs={12} justify={'flex-end'}>
                                    <CIMSButton id={id + '_OkButton'} onClick={this.handleOkClick} disabled={this.state.isAbleClickOk ? false : true}>Prescribe with reason</CIMSButton>
                                    <CIMSButton id={id + '_CancelButton'} onClick={cancelHLAB1502Dialog}>Do not prescribe</CIMSButton>
                                </Grid>
                            </Grid>
                        </DialogContent>
                    </ValidatorForm>
                </CIMSDialog>
            );
        else
            return null;
    }
}

// const mapStateToProps = (state) => {
//     return {
//     };
// };
// const mapDispatchToProps = {
// };
export default connect(null, null)(withStyles(styles)(Hlab1502Dialog));