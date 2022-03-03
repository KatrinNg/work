import React, { Component } from 'react';
import { Grid, FormControlLabel, RadioGroup, Checkbox, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import ValidatorForm from '../../../../../../../../components/FormValidator/ValidatorForm';
import CustomizedSelectFieldValidator from '../../../../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import * as commonConstants from '../../../../../../../../constants/common/commonConstants';
import moment from 'moment';
import { styles } from './ClientInformationStyle';
import classNames from 'classnames';
import _ from 'lodash';

class ClientInformation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            g6pdBtnArr: [
                { label: 'F', value: 'F'},
                { label: 'M', value: 'M' },
                { label: 'U', value: 'U' }
            ],
            CHTCheckbox: [
                {
                    label: 'Mother',
                    name: 'Mother',
                    Mother: false
                },
                {
                    label: 'Father',
                    name: 'Father',
                    Father: false
                },
                {
                    label: 'Other',
                    name: 'Other',
                    Other: false
                }
            ],
            options: [
                { label: 'Caesarean Section', value: 'CS' },
                { label: 'Forcep', value: 'Forcep' },
                { label: 'NSD', value: 'NSD' },
                { label: 'Vaccum', value: 'Vaccum' }
            ],
            showClear: false
        };
    }

    handleCheckBoxChange = (event, value) => {
        let { patientDto, updateState, changeEditFlag } = this.props;
        patientDto.genderCd = value;
        changeEditFlag && changeEditFlag();
        updateState && updateState({ patientDto });
    }

    processingData = (event, id, index) => {
        let boxArray = this.handleTransferFormat(id);
        let motherCode = boxArray[0];
        let fatherCode = boxArray[1];
        let otherCode = boxArray[2] == '0' ? boxArray[2] : `${boxArray[2]}-${boxArray[3] == undefined ? '' : boxArray[3]}`;
        if (index == 0) {
            motherCode = event.target.name == 'Mother' && event.target.checked ? 1 : 0;
        } else if (index == 1) {
            fatherCode = event.target.name == 'Father' && event.target.checked ? 2 : 0;
        } else if (index == 2) {
            let tempVal = boxArray[3] ? boxArray[3] : '';
            otherCode = event.target.name == 'Other' && event.target.checked ? `3-${tempVal}` : '0';
        }
        let checkboxState = `${motherCode}${fatherCode}${otherCode}`;
        return checkboxState;
    }
    handleChangeChecked = (event, index, name, id) => {
        let { valMap, updateState, neonatalDocId, patientKey, changeEditFlag } = this.props;
        let tempObj = {};
        if (valMap.size > 0 && valMap.has(id)) {
            tempObj = valMap.get(id);
            let checkboxState = this.processingData(event, id, index);
            tempObj.itemVal = checkboxState;
        }
        if (tempObj.formItemId) {
            if (tempObj.opType == commonConstants.COMMON_ACTION_TYPE.INSERT) {
                if (tempObj.itemVal === '000') {
                    valMap.delete(id);
                }
            } else {
                tempObj.opType = tempObj.itemVal === '000' && tempObj.version != '' ? 'D' : 'U';
            }
        } else {
            if (id == 2024) {
                tempObj = {
                    docId: neonatalDocId,
                    formItemId: id,
                    docItemId: Math.random(),
                    patientKey,
                    itemVal: '000',
                    itemValErrorFlag: false,
                    createBy: '',
                    createDtm: '',
                    dbUpdateDtm: '',
                    encounterId: '',
                    opType: commonConstants.COMMON_ACTION_TYPE.INSERT,
                    rslt: '',
                    updateBy: '',
                    updateDtm: '',
                    version: ''
                };
                valMap.set(id, tempObj);
                tempObj = valMap.get(id);
            } else {
                tempObj = {
                    docId: neonatalDocId,
                    formItemId: id,
                    docItemId: Math.random(),
                    patientKey,
                    encounterId: '',
                    itemVal: '000',
                    itemValErrorFlag: false,
                    createBy: '',
                    createDtm: '',
                    dbUpdateDtm: '',
                    opType: commonConstants.COMMON_ACTION_TYPE.INSERT,
                    rslt: '',
                    updateBy: '',
                    updateDtm: '',
                    version: ''
                };
                valMap.set(id, tempObj);
                tempObj = valMap.get(id);
            }
        }
        let checkboxState = this.processingData(event, id, index);
        tempObj.itemVal = checkboxState;
        changeEditFlag && changeEditFlag();
        updateState && updateState({ valMap });
    }

    handleChangeTextField = (event, id) => {
        let { valMap, updateState, patientKey, neonatalDocId, backData, changeEditFlag } = this.props;
        let val = event.target.value;
        let tempObj = {};
        if (valMap.size > 0 && valMap.has(id)) {
            tempObj = valMap.get(id);
            if (id == 2024 || id == 2025) {
                let tempArray = tempObj.itemVal.split('');
                let otherCode = tempArray[2] == '3' ? `${tempArray[2]}-${val}` : tempArray[2];
                let checkboxState = `${tempArray[0]}${tempArray[1]}${otherCode}`;
                tempObj.itemVal = checkboxState;
            } else {
                tempObj.itemVal = val;
            }
            if (tempObj.opType == commonConstants.COMMON_ACTION_TYPE.INSERT) {
                if (tempObj.itemVal == '' || tempObj.itemVal == '000') {
                    valMap.delete(id);
                }
            } else {
                if (backData.size > 0 && backData.has(id)) {
                    let itemObj = backData.get(id);
                    if (itemObj.version == tempObj.version && itemObj.itemVal == tempObj.itemVal) {
                        tempObj.opType = itemObj.opType;
                    } else {
                        tempObj.opType = tempObj.itemVal == '000' || tempObj.itemVal == '' ? 'D' : 'U';
                    }
                }
            }
        } else {
            const obj = {
                docId: neonatalDocId,
                formItemId: id,
                docItemId: Math.random(),
                patientKey,
                itemVal: val,
                itemValErrorFlag: false,
                opType: commonConstants.COMMON_ACTION_TYPE.INSERT,
                createBy: '',
                createDtm: '',
                dbUpdateDtm: '',
                updateBy: '',
                updateDtm: '',
                version: ''
            };
            valMap.set(id, obj);
            tempObj = valMap.get(id);
        }
        if (id == 2024) {
            let boxArray = this.handleTransferFormat(id);
            let otherCode = boxArray[2] == '3' ? `3-${val}` : boxArray[3];
            let checkboxState = `${boxArray[0]}${boxArray[1]}${otherCode}`;
            tempObj.itemVal = checkboxState;
        } else if (id == 2025) {
            let boxArray = this.handleTransferFormat(id);
            let otherCode = boxArray[2] == '3' ? `3-${val}` : boxArray[3];
            let checkboxState = `${boxArray[0]}${boxArray[1]}${otherCode}`;
            tempObj.itemVal = checkboxState;
        }
        changeEditFlag && changeEditFlag();
        updateState && updateState({ valMap });
    }

    handleTransferFormat = (id) => {
        let resArray = [];
        let { valMap } = this.props;
        let res = null;
        if (valMap.size > 0 && valMap.has(id)) {
            res = valMap.get(id).itemVal;
        }
        res = res ? res : '000';
        if (res.includes('-')) {
            let tempArray = res.split('-');
            resArray = tempArray[0].split('');
            tempArray[1] && resArray.push(tempArray[1]);
        } else {
            resArray = res.split('');
        }
        return resArray;
    }

    handleTransferDate = (type, params, date) => {
        let res = '';
        if (type == 'date') {
            switch (params) {
                case null:
                    res = moment(date).format('DD-MMM-YYYY');
                    break;
                case 'EMY':
                    res = moment(date).format('MMM-YYYY');
                    break;
                case 'EY':
                    res = moment(date).format('YYYY');
                    break;
                case 'EDMY':
                    res = moment(date).format('DD-MMM-YYYY');
                    break;
            }
        }
        return res;
    }

    handleSelectBlur = (event, rowId) => {
        this.setState({ selectFlag: false, showClear: false });
    }

    handleFocus = () => {
        this.setState({
            showClear: true
        });
    }

    handleSelectChange = (event, rowId) => {
        let { valMap, neonatalDocId, patientKey, updateState } = this.props;
        let dropValue = event ? event.value : '';
        if (valMap.size > 0 && valMap.has(rowId)) {
            let tempObj = valMap.get(rowId);
            if (tempObj.version) {
                tempObj.opType = event ? commonConstants.COMMON_ACTION_TYPE.UPDATE : commonConstants.COMMON_ACTION_TYPE.DELETE;
                tempObj.itemVal = dropValue;
            } else if (tempObj.opType == commonConstants.COMMON_ACTION_TYPE.INSERT && dropValue == '') {
                valMap.delete(rowId);
            } else {
                tempObj.opType = commonConstants.COMMON_ACTION_TYPE.INSERT;
                tempObj.itemVal = dropValue;
            }
        } else {
            let obj = {
                docId: neonatalDocId,
                formItemId: rowId,
                docItemId: Math.random(),
                patientKey,
                opType: commonConstants.COMMON_ACTION_TYPE.INSERT,
                itemVal: dropValue,
                itemValErrorFlag: false,
                createDtm: '',
                dbUpdateDtm: '',
                createBy: '',
                updateBy: '',
                updateDtm: '',
                version: ''
            };
            valMap.set(obj.formItemId, obj);
        }
        updateState && updateState({ valMap });
    }
    resultDataString = (itemId) => {
        let { valMap } = this.props;
        let dataVal = null;
        if (valMap.size > 0 && valMap.has(itemId)) {
            let obj = valMap.get(itemId);
            dataVal = obj.itemVal;
        }
        return dataVal;
    }
    render() {
        const { classes, clinicalDocumentType, patientDto, valMap, roleActionType, dataCommon } = this.props;
        let { g6pdBtnArr, CHTCheckbox, options, selectFlag, showClear } = this.state;
        let roleActionFlag = roleActionType == 'D' ? false : true;
        let gravidaVal = valMap.has(2023) ? valMap.get(2023).itemVal : '';
        let remarksVal = valMap.has(2126) ? valMap.get(2126).itemVal : '';

        let type = clinicalDocumentType === 'CHT' ? true : false;
        let mothersName_formId = type ? 2011 : 2027;
        let mothersId_formId = type ? 2014 : 2030;
        let birthWeight_formId = type ? 2016 : 2032;
        let ward_formId = type ? 2108 : 2109;
        let placeOfBirth_formId = type ? 2019 : 2035;
        let gestation_formId = type ? 2020 : 2036;

        let mothersName = valMap.has(mothersName_formId) ? valMap.get(mothersName_formId).itemVal : '';
        let mothersId = valMap.has(mothersId_formId) ? valMap.get(mothersId_formId).itemVal : '';
        let birthWeight = valMap.has(birthWeight_formId) ? valMap.get(birthWeight_formId).itemVal + ' kg' : '';
        let ward = valMap.has(ward_formId) ? valMap.get(ward_formId).itemVal : '';
        let placeOfBirth = valMap.has(placeOfBirth_formId) ? valMap.get(placeOfBirth_formId).itemVal : '';
        let gestation = valMap.has(gestation_formId) ? valMap.get(gestation_formId).itemVal + ' wk' : '';
        let babyName = patientDto ? patientDto.engSurname != null && patientDto.engGivename != null ?
            patientDto.engSurname + ' ' + patientDto.engGivename :
            (patientDto.engSurname != null ? patientDto.engSurname : patientDto.engGivename) : '';

        let inputProps = {
            InputProps: {
                classes: {
                    multiline: classes.multilineInput
                }
            },
            inputProps: {
                className: classes.inputProps,
                maxLength: 500
            }
        };
        return (
            <div style={{ padding: 10 }}>
                <div>
                    <Grid style={{ display: 'flex' }} xs={12}>
                        <Grid className={classes.root} xs={3}>
                            <label className={classes.labelPad}>Mother's name:</label>
                            <div>{mothersName}</div>
                        </Grid>
                        <Grid className={classes.root} xs={3}>
                            <label className={classes.labelPad}>Baby's Name:</label>
                            <div>{babyName}</div>
                        </Grid>
                        <Grid xs={3}>
                            <div className={classes.root}>
                                <label className={classes.labelPad}>Sex:</label>
                                <RadioGroup style={{ flexDirection: 'unset' }}>
                                    {
                                        g6pdBtnArr.map((item) => (
                                            <FormControlLabel
                                                disabled
                                                style={{ margin: 0, marginLeft: 5 }}
                                                checked={patientDto.genderCd == item.value ? true : false}
                                                value={item.value}
                                                control={<Checkbox color="primary" style={{ padding: 0 }} />}
                                                label={item.label}
                                                onChange={(event) => { this.handleCheckBoxChange(event, item.value); }}
                                            />
                                        ))
                                    }
                                </RadioGroup>
                            </div>
                        </Grid>
                        <Grid className={classes.root} xs={3}>
                            <label className={classes.labelPad}>PMI:</label>
                            <div>{dataCommon.displayPatientKey ? dataCommon.displayPatientKey : ''}</div>
                        </Grid>
                    </Grid>
                </div>
                <div>
                    <Grid style={{ display: 'flex', marginTop: 15 }} xs={12}>
                        <Grid className={classes.root} xs={3}>
                            <label className={classes.labelPad}>Mother's ID:</label>
                            <div>{mothersId}</div>
                        </Grid>
                        <Grid className={classes.root} xs={3}>
                            <label className={classes.labelPad}>Date of Birth:</label>
                            <div>{this.handleTransferDate('date', patientDto.exactDobCd, patientDto.dob) ? this.handleTransferDate('date', patientDto.exactDobCd, patientDto.dob) : ''}</div></Grid>
                        <Grid className={classes.root} xs={3}>
                            <label className={classes.labelPad}>Birth Weight:</label>
                            <div>{birthWeight}</div>
                        </Grid>
                        <Grid className={classes.root} xs={3}>
                            <label className={classes.labelPad}>Ward:</label>
                            <div>{ward}</div>
                        </Grid>
                    </Grid>
                </div>
                <div>
                    <Grid style={{ display: 'flex', marginTop: 15 }} xs={12}>
                        <Grid className={classes.root} xs={3}>
                            <label className={classes.labelPad}>Phone (Home):</label>
                            {/* <div>{patientDto.telephone ? patientDto.telephone : ''}</div> */}
                        </Grid>
                        <Grid className={classes.root} xs={2}>
                            <label className={classes.labelPad}>(Mobile):</label>
                            {/* <div>{patientDto.mobile ? patientDto.mobile : ''}</div> */}
                        </Grid>
                        <Grid className={classes.root} xs={3}>
                            <label className={classes.labelPad}>Place of Birth:</label>
                            <div>{placeOfBirth}</div>
                        </Grid>
                        <Grid className={classes.root} xs={4}>
                            <label className={classes.labelPad}>Gestation:</label>
                            <div>
                                <span>{gestation}</span>
                                <span className={classes.spanTitle}>
                                    {dataCommon.edc ? dataCommon.edc : ''}
                                </span>
                            </div>
                        </Grid>
                    </Grid>
                </div>
                <div>
                    <Grid style={{ display: 'flex', marginTop: 15 }} xs={12}>
                        <Grid className={classes.root} xs={12}>
                            <label className={classes.labelPad}>Address:</label>
                            <div>{/*dataCommon.address*/}</div>
                        </Grid>
                    </Grid>
                </div>
                <div>
                    {clinicalDocumentType === 'CHT' ?
                        <Grid style={{ marginTop: 15 }}>
                            <Grid style={{ display: 'flex', alignItems: 'center' }}>
                                <Grid style={{ width: '30%', display: 'flex', alignItems: 'center' }}>
                                    <span onClick={this.generateClientInformationObj}>Mode of Delivery：</span>
                                    <div style={{ width: '66%' }}>
                                        <ValidatorForm id="search_result_form" onSubmit={() => { }} >
                                            <CustomizedSelectFieldValidator
                                                id={'selectbox_babywill'}
                                                options={options}
                                                notShowMsg={false}
                                                errorMessages={'This field is required'}
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }), flex: 1 }}
                                                menuPortalTarget={document.body}
                                                msgPosition="bottom"
                                                value={this.resultDataString(2022)}
                                                isValid={!selectFlag}
                                                showErrorIcon={false}
                                                isClearable={showClear}
                                                onFocus={this.handleFocus}
                                                onChange={(e) => this.handleSelectChange(e, 2022)}
                                                onBlur={this.handleSelectBlur}
                                                className={classes.inputProps}
                                                isDisabled={roleActionFlag}
                                            />
                                        </ValidatorForm>
                                    </div>
                                </Grid>
                                <Grid style={{ width: '40%', marginLeft: '5%', display: 'flex', alignItems: 'center' }}>
                                    <span>Gravida：</span>
                                    <TextField
                                        id="outlined-basic"
                                        variant="outlined"
                                        value={gravidaVal}
                                        disabled={roleActionFlag}
                                        onChange={(event) => { this.handleChangeTextField(event, 2023); }}
                                        style={{ flex: 1 }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid >
                                <Grid style={{ display: 'flex', alignItems: 'center', marginTop: 15 }}>
                                    {CHTCheckbox.map((item, index) => {
                                        return (<Grid
                                            className={classNames({ [classes.Other]: item.label == 'Other' ? true : false })}
                                            style={{ display: 'flex', alignItems: 'center' }}
                                                >
                                            <FormControlLabel
                                                classes={{
                                                    label: classes.normalFont,
                                                    disabled: classes.disabledLabel
                                                }}
                                                disabled={roleActionFlag}
                                                control={
                                                    <Checkbox
                                                        checked={this.handleTransferFormat(2024)[index] === `${index + 1}` ? true : false}
                                                        onChange={(event) => { this.handleChangeChecked(event, index, 'AHT', 2024); }}
                                                        name={item.name}
                                                        color="primary"
                                                    />
                                                }
                                                label={item.label}
                                            />
                                            {item.label === 'Other' ?
                                                <TextField id="outlined-basic"
                                                    className={classNames({
                                                        [classes.disabledColor]: this.handleTransferFormat(2024)[index] !== '0' ? false : true,
                                                        [classes.textFieldBorder]: true
                                                    })}
                                                    style={{ width: '90%', padding: 0 }}
                                                    disabled={roleActionFlag || (this.handleTransferFormat(2024)[index] !== '0' ? false : true)}
                                                    variant="outlined"
                                                    value={this.handleTransferFormat(2024)[3] ? this.handleTransferFormat(2024)[3] : ''}
                                                    onChange={(event) => { this.handleChangeTextField(event, 2024); }}
                                                    inputProps={{ style: { padding: 0 } }}
                                                    multiline
                                                    rowsMax={3}
                                                    {...inputProps}
                                                />
                                                : ''}
                                        </Grid>);
                                    })}
                                    <Grid style={{ paddingLeft: 20 }}>attended health talk</Grid>
                                </Grid>
                                <Grid style={{ display: 'flex', alignItems: 'center', marginTop: 15 }}>
                                    {CHTCheckbox.map((item, index) => {
                                        return (<Grid
                                            className={classNames({ [classes.Other]: item.label == 'Other' ? true : false })}
                                            style={{ display: 'flex', alignItems: 'center' }}
                                                >
                                            <FormControlLabel
                                                classes={{
                                                    label: classes.normalFont,
                                                    disabled: classes.disabledLabel
                                                }}
                                                disabled={roleActionFlag}
                                                control={
                                                    <Checkbox
                                                        checked={this.handleTransferFormat(2025)[index] === `${index + 1}` ? true : false}
                                                        onChange={(event) => { this.handleChangeChecked(event, index, 'HTD', 2025); }}
                                                        name={item.name}
                                                        color="primary"
                                                    />
                                                }
                                                label={item.label}
                                            />{item.label === 'Other' ?
                                                <TextField id="outlined-basic"
                                                    className={classNames({
                                                        [classes.textFieldBorder]: true,
                                                        [classes.disabledColor]: this.handleTransferFormat(2025)[index] !== '0' ? false : true
                                                    })}
                                                    style={{ width: '90%' }}
                                                    disabled={roleActionFlag || (this.handleTransferFormat(2025)[index] !== '0' ? false : true)}
                                                    variant="outlined"
                                                    value={this.handleTransferFormat(2025)[3] ? this.handleTransferFormat(2025)[3] : ''}
                                                    onChange={(event) => { this.handleChangeTextField(event, 2025); }}
                                                    // inputProps={{style:{width:120}}}
                                                    multiline
                                                    rowsMax={3}
                                                    {...inputProps}
                                                />
                                                : ''}
                                        </Grid>);
                                    })}
                                    <Grid style={{ paddingLeft: 20 }}>History of Thyroid Disease</Grid>
                                </Grid>
                            </Grid>
                            <Grid style={{ display: 'flex', alignItems: 'center', marginTop: 15 }} >
                                <span>Remarks：</span>
                                <TextField
                                    style={{ width: '48%' }}
                                    id="outlined-basic"
                                    variant="outlined"
                                    value={remarksVal}
                                    multiline
                                    rowsMax={3}
                                    disabled={roleActionFlag}
                                    onChange={(event) => { this.handleChangeTextField(event, 2126); }}
                                    {...inputProps}
                                />
                            </Grid>
                        </Grid>
                        : ''}
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(ClientInformation);