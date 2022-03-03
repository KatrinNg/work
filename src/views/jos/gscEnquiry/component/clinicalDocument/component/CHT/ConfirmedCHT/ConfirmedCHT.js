import React, { Component } from 'react';
import { withStyles, Grid, TextField, FormControlLabel, Checkbox, FormGroup } from '@material-ui/core';
import { styles } from './ConfirmedCHTStyle';
import moment from 'moment';
import Enum from '../../../../../../../../../src/enums/enum';

class ConfirmedCHT extends Component {
    constructor(props) {
        super(props);
        this.state = {
            otherFlag: false,
            disabledFlag: false,
            checkboxValRow: '',
            updateOn: '',
            pcChtRslt: '',
            otherVal: '',
            normalFlag: false,
            CCHFlag: false
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        let { valMap, dataCommon } = nextProps;
        if (nextProps.valMap !== this.props.valMap) {
            let num = dataCommon.chtRslt;
            let numVal = dataCommon.chtRsltTxt;
            let flag = num > 2 ? false : true;
            let normal = num == 1 ? true : false;
            let cch = num > 2 ? true : false;
            let othFlag = num == 8 ? true : false;
            let val = valMap.has(2094) ? valMap.get(2094).itemVal : '';
            let updateOn = dataCommon.caseCloseDate != null ? moment(dataCommon.caseCloseDate).format(Enum.DATE_FORMAT_EDMY_VALUE) : '';
            let numRsl = valMap.has(2093) ? valMap.get(2093).itemVal : '';
            let pcChtRsltVal = '';
            if (numRsl != '' && numRsl != '1' && numRsl != '2') {
                pcChtRsltVal = 'Previous Confirmed Congenital Hypothyroidism Result:';
                switch (numRsl) {
                    case '3':
                        pcChtRsltVal = pcChtRsltVal + ' Dysgenesis - Agenesis / Hypoplasia';
                        break;
                    case '4':
                        pcChtRsltVal = pcChtRsltVal + ' Dysgenesis - Ectopic Thyroid';
                        break;
                    case '5':
                        pcChtRsltVal = pcChtRsltVal + ' Dyshormonogenesis';
                        break;
                    case '6':
                        pcChtRsltVal = pcChtRsltVal + ' Transient Hyperthyrotropinemia';
                        break;
                    case '7':
                        pcChtRsltVal = pcChtRsltVal + ' Transient CHT';
                        break;
                    case '8':
                        let valResult = val != '' ? ' - ' + val : '';
                        pcChtRsltVal = pcChtRsltVal + ' Other' + valResult;
                        break;
                    case '10':
                        pcChtRsltVal = pcChtRsltVal + ' No pathology substantiated';
                        break;
                }
            }
            this.setState({
                normalFlag: normal,
                CCHFlag: cch,
                checkboxValRow: num,
                disabledFlag: flag,
                otherFlag: othFlag,
                pcChtRslt: pcChtRsltVal,
                otherVal: numVal,
                updateOn
            });
        }
    }

    handleNorChange = (event) => {
        const { changeEditFlag, updateState, dataCommon } = this.props;
        let val = event.target.checked ? 1 : 2;
        let disabled = val == 1 ? true : false;
        this.setState({
            normalFlag: disabled,
            CCHFlag: false,
            disabledFlag: true,
            checkboxValRow: '',
            otherFlag: false,
            otherVal: ''
        });
        updateState && updateState({
            chtRslt: val,
            dataCommon: {
                ...dataCommon,
                chtRsltTxt: ''
            }
        });
        changeEditFlag && changeEditFlag();
    }

    handleCCHChange = (event) => {
        const { changeEditFlag, updateState,dataCommon } = this.props;
        let val = event.target.checked;
        this.setState({
            CCHFlag: val,
            normalFlag: false,
            disabledFlag: !val,
            checkboxValRow: '',
            otherFlag: false,
            otherVal: ''
        });
        updateState && updateState({
            chtRslt: 2,
            dataCommon: {
                ...dataCommon,
                chtRsltTxt: ''
            }
        });
        changeEditFlag && changeEditFlag();
    }

    handleCheckedChange = (event, type) => {
        let { updateState, changeEditFlag,dataCommon } = this.props;
        let che = event.target.checked ? type : 2;
        let otherFlag = che == 8 ? true : false;
        this.setState({
            checkboxValRow: che,
            otherFlag,
            otherVal: ''
        });
        updateState && updateState({
            chtRslt: che,
            dataCommon: {
                ...dataCommon,
                chtRsltTxt: ''
            }
        });
        changeEditFlag && changeEditFlag();
    }

    handleTextChange = (event) => {
        let { updateState, changeEditFlag, dataCommon } = this.props;
        let val = this.cutOutString(event.target.value, 500);
        this.setState({ otherVal: val });
        updateState && updateState({
            dataCommon:{
                ...dataCommon,
                chtRsltTxt: val
            }
        });
        changeEditFlag && changeEditFlag();
    }

    cutOutString = (value, maxValue) => {
        let countIn = 0;
        let realCount = 0;
        for (let i = 0; i < value.length; i++) {
            const element = value.charCodeAt(i);
            if (element >= 0 && element <= 255) {
                if (countIn + 1 > maxValue) {
                    break;
                } else {
                    countIn += 1;
                    realCount++;
                }
            } else {
                if (countIn + 3 > maxValue) {
                    break;
                } else {
                    countIn += 3;
                    realCount++;
                }
            }
        }
        return value ? value.slice(0, realCount) : value;
    }

    render() {
        let { classes, roleActionType } = this.props;
        let { otherFlag, disabledFlag, checkboxValRow, updateOn, normalFlag, CCHFlag, pcChtRslt, otherVal } = this.state;
        let roleActionFlag = roleActionType == 'D' ? false : true;
        let inputProps = {
            InputProps: {
                classes: {
                    multiline: classes.multilineInput
                }
            },
            inputProps: {
                wrap: 'on',
                style: {
                    ...styles.inputProps,
                    overflowX: 'auto'
                }
            }
        };
        return (
            <div className={classes.wrapper}>
                <Grid>
                    <Grid className={classes.wrapper}>
                        <FormControlLabel
                            classes={{
                                label: classes.normalFont,
                                disabled: classes.disabledLabel
                            }}
                            className={classes.formControlLabel}
                            disabled={roleActionFlag}
                            control={
                                <Checkbox
                                    classes={{ root: classes.checkBoxStyle }}
                                    checked={normalFlag}
                                    onChange={(e) => { this.handleNorChange(e); }}
                                    id="checkbox_1"
                                    color="primary"
                                />
                            }
                            label="Normal"
                        />
                    </Grid>
                    <Grid className={classes.wrapper}>
                        <FormControlLabel
                            classes={{
                                label: classes.normalFont,
                                disabled: classes.disabledLabel
                            }}
                            className={classes.formControlLabel}
                            disabled={roleActionFlag}
                            control={
                                <Checkbox
                                    classes={{ root: classes.checkBoxStyle }}
                                    checked={CCHFlag}
                                    onChange={(e) => { this.handleCCHChange(e); }}
                                    id="checkbox_2"
                                    color="primary"
                                />
                            }
                            label="Confirmed Congenital Hypothyroidism"
                        />
                    </Grid>
                </Grid>
                <Grid>
                    <Grid style={{ paddingLeft: 30 }}>
                        <FormGroup>
                            <FormControlLabel
                                classes={{
                                    label: classes.normalFont,
                                    disabled: classes.disabledLabel
                                }}
                                className={classes.formControlLabel}
                                disabled={disabledFlag || roleActionFlag}
                                control={
                                    <Checkbox
                                        classes={{ root: classes.checkBoxStyle }}
                                        checked={checkboxValRow == 3}
                                        onChange={(e) => { this.handleCheckedChange(e, 3); }}
                                        id="checkbox_3"
                                        color="primary"
                                    />
                                }
                                label="Dysgenesis - Agenesis / Hypoplasia"
                            />
                            <FormControlLabel
                                classes={{
                                    label: classes.normalFont,
                                    disabled: classes.disabledLabel
                                }}
                                className={classes.formControlLabel}
                                disabled={disabledFlag || roleActionFlag}
                                control={
                                    <Checkbox
                                        classes={{ root: classes.checkBoxStyle }}
                                        checked={checkboxValRow == 4}
                                        onChange={(e) => { this.handleCheckedChange(e, 4); }}
                                        id="checkbox_4"
                                        color="primary"
                                    />
                                }
                                label="Dysgenesis - Ectopic Thyroid"
                            />
                            <FormControlLabel
                                classes={{
                                    label: classes.normalFont,
                                    disabled: classes.disabledLabel
                                }}
                                className={classes.formControlLabel}
                                disabled={disabledFlag || roleActionFlag}
                                control={
                                    <Checkbox
                                        classes={{ root: classes.checkBoxStyle }}
                                        checked={checkboxValRow == 5}
                                        onChange={(e) => { this.handleCheckedChange(e, 5); }}
                                        id="checkbox_5"
                                        color="primary"
                                    />
                                }
                                label="Dyshormonogenesis"
                            />
                            <FormControlLabel
                                classes={{
                                    label: classes.normalFont,
                                    disabled: classes.disabledLabel
                                }}
                                className={classes.formControlLabel}
                                disabled={disabledFlag || roleActionFlag}
                                control={
                                    <Checkbox
                                        classes={{ root: classes.checkBoxStyle }}
                                        checked={checkboxValRow == 6}
                                        onChange={(e) => { this.handleCheckedChange(e, 6); }}
                                        id="checkbox_6"
                                        color="primary"
                                    />
                                }
                                label="Transient Hyperthyrotropinemia"
                            />
                            <FormControlLabel
                                classes={{
                                    label: classes.normalFont,
                                    disabled: classes.disabledLabel
                                }}
                                className={classes.formControlLabel}
                                disabled={disabledFlag || roleActionFlag}
                                control={
                                    <Checkbox
                                        cclasses={{ root: classes.checkBoxStyle }}
                                        checked={checkboxValRow == 7}
                                        onChange={(e) => { this.handleCheckedChange(e, 7); }}
                                        id="checkbox_7"
                                        color="primary"
                                    />
                                }
                                label="Transient CHT"
                            />
                            <FormControlLabel
                                classes={{
                                    label: classes.normalFont,
                                    disabled: classes.disabledLabel
                                }}
                                className={classes.formControlLabel}
                                disabled={disabledFlag || roleActionFlag}
                                control={
                                    <Checkbox
                                        cclasses={{ root: classes.checkBoxStyle }}
                                        checked={checkboxValRow == 10}
                                        onChange={(e) => { this.handleCheckedChange(e, 10); }}
                                        id="checkbox_7"
                                        color="primary"
                                    />
                                }
                                label="No pathology substantiated"
                            />
                            <Grid style={{ display: 'flex' }}>
                                <FormControlLabel
                                    classes={{
                                        label: classes.normalFont,
                                        disabled: classes.disabledLabel
                                    }}
                                    className={classes.formControlLabel}
                                    disabled={disabledFlag || roleActionFlag}
                                    control={
                                        <Checkbox
                                            classes={{ root: classes.checkBoxStyle }}
                                            checked={checkboxValRow == 8}
                                            onChange={(e) => { this.handleCheckedChange(e, 8); }}
                                            id="checkbox_8"
                                            color="primary"
                                        />
                                    }
                                    label="Other"
                                />
                                <div style={{ width: '50%', marginTop: 2, display: otherFlag ? 'block' : 'none' }}>
                                    <TextField
                                        id={'textarea_other'}
                                        autoCapitalize="off"
                                        variant="outlined"
                                        type="text"
                                        value={otherVal}
                                        disabled={roleActionFlag}
                                        multiline
                                        rowsMax={3}
                                        className={classes.inputField}
                                        onChange={this.handleTextChange}
                                        // onBlur={this.handleTextBlur}
                                        // error={errorFlag}
                                        {...inputProps}
                                    />
                                </div>
                            </Grid>
                        </FormGroup>
                    </Grid>
                </Grid>
                <Grid>
                    <Grid className={classes.wrapper} style={{ marginLeft: 15, marginTop: 10 }}>
                        <lable title={pcChtRslt}>
                            {pcChtRslt.length > 110 ? pcChtRslt.slice(0, 110) + '...' : pcChtRslt}
                        </lable>
                    </Grid>
                    <Grid className={classes.wrapper} style={{ marginLeft: 15, marginTop: 10 }}>
                        <label>Last Update On:&nbsp;<label>{updateOn}</label></label>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles)(ConfirmedCHT);