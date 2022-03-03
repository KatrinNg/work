import React, { Component } from 'react';
import { Grid, TextField, FormControlLabel, RadioGroup, Checkbox } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Enum from '../../../../../../../../../src/enums/enum';
import { styles } from './RecordonG6PDDeficiencyStyle';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import ValidatorForm from '../../../../../../../../components/FormValidator/ValidatorForm';
import CustomizedSelectFieldValidator from '../../../../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import DateBox from '../../../../DateBox/DateBox';
import * as commonConstants from '../../../../../../../../constants/common/commonConstants';

class RecordonG6PDDeficiency extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paraValue: '',
            checkNeoJabox: '',
            othersValue: '',
            checkTreatmentbox: '',
            checkDietarybox: '',
            checkFhoG6PDbox: '',
            relationValue: '',
            actionOneValue: '',
            actionContactedValue: '',
            CACPODatePoint: '',
            informationToParent: '',
            currencies: [
                { label: 'Caesarean section', value: 'Caesarean section' },
                { label: 'Forceps', value: 'Forceps' },
                { label: 'N.S.D.', value: 'N.S.D.' },
                { label: 'Vacuum', value: 'Vacuum' }
            ],
            currency: '',
            informedDate: null,
            CACPODate: null,
            ILSTPDate: null,
            referDorpList: [],
            referVal: '',
            informedDateErrorFlag: false,
			 CACPODateErrorFlag: false,
            ILSTPDateErrorFlag:false,
            showClearRefer: false,
            showClearDelivery: false
        };
    }


    UNSAFE_componentWillReceiveProps(nextProps) {
        let { valMap } = nextProps;
        if (nextProps.valMap !== this.props.valMap) {
            let infoDate = valMap.has(2083) ? valMap.get(2083).itemVal : null;
            let cacDate = valMap.has(2085) ? valMap.get(2085).itemVal : null;
            let tpDate = valMap.has(2088) ? valMap.get(2088).itemVal : null;
            this.setState({
                paraValue: valMap.has(2075) ? valMap.get(2075).itemVal : '',
                currency: valMap.has(2076) ? valMap.get(2076).itemVal : '',
                checkNeoJabox: valMap.has(2077) ? valMap.get(2077).itemVal : '',
                checkTreatmentbox: valMap.has(2078) ? valMap.get(2078).itemVal : '',
                checkDietarybox: valMap.has(2079) ? valMap.get(2079).itemVal : '',
                checkFhoG6PDbox: valMap.has(2080) ? valMap.get(2080).itemVal : '',
                relationValue: valMap.has(2081) ? valMap.get(2081).itemVal : '',
                actionOneValue: valMap.has(2082) ? valMap.get(2082).itemVal : '',
                // informedDate: valMap.has(2083) ? valMap.get(2083).itemVal : null,
                informedDate : infoDate ? moment(infoDate, Enum.DATE_FORMAT_DMY).format(Enum.DATE_FORMAT_EDMY_VALUE) : null,
                actionContactedValue: valMap.has(2084) ? valMap.get(2084).itemVal : '',
                // CACPODate: valMap.has(2085) ? valMap.get(2085).itemVal :null,
                CACPODate: cacDate ? moment(cacDate, Enum.DATE_FORMAT_DMY).format(Enum.DATE_FORMAT_EDMY_VALUE) : null,
                CACPODatePoint: valMap.has(2086) ? valMap.get(2086).itemVal : '',
                informationToParent: valMap.has(2087) ? valMap.get(2087).itemVal : '',
                // ILSTPDate: valMap.has(2088) ? valMap.get(2088).itemVal : null,
                ILSTPDate: tpDate ? moment(tpDate, Enum.DATE_FORMAT_DMY).format(Enum.DATE_FORMAT_EDMY_VALUE) : null,
                referVal: valMap.has(2089) ? valMap.get(2089).itemVal : '',
                othersValue: valMap.has(2090) ? valMap.get(2090).itemVal : ''
            });
        }if(nextProps.deficiencyDrowDownList!==this.props.deficiencyDrowDownList){
            this.setState({
                referDorpList:cloneDeep(nextProps.deficiencyDrowDownList)
            });
        }
    }

    handleChecked = (event, typeName, value, rowId) => {
        if (!event.target.checked) {
            value = '';
        }
        if (typeName == 'neonatalJaundice') {
            this.setState({ checkNeoJabox: event.target.checked ? value : '' });
            if (value === 'No' || value === '') {
                this.setState({ checkTreatmentbox: '' });
                this.updateValObjByCodeFormId('', 2078);
            }
        } else if (typeName == 'treatment') {
            this.setState({ checkTreatmentbox: event.target.checked ? value : '' });
        } else if (typeName == 'dietaryHistory') {
            this.setState({ checkDietarybox: event.target.checked ? value : '' });
        } else if (typeName == 'familyHistory') {
            if (value != 'Yes') {
                this.updateValObjByCodeFormId('', 2081);
                this.setState({ relationValue: '' });
            }
            this.setState({ checkFhoG6PDbox: event.target.checked ? value : '' });
        }
        this.updateValObjByCodeFormId(value, rowId);
    }

    handleFocus = (name) => {
        this.setState({
            ['showClear' + name]: true
        });
    }

    handleSelectBlur = (name) => {
        this.setState({
            ['showClear' + name]: false
        });
    }


    handleChange = (e, name, rowId) => {
        let val = e ? e.value : '';
        if (name == 'Refer') {
            this.setState({ referVal: val });
        } else {
            this.setState({ currency: val });
        }
        this.updateValObjByCodeFormId(val, rowId);
    }

    handleTextChange = (event, type, maxLength, rowId) => {
        let val = event.target.value;
        if (type == 'others') {
            this.setState({ othersValue: val });
        } else if (type == 'para') {
            this.setState({ paraValue: val });
        } else if (type == 'relationship') {
            this.setState({ relationValue: val });
        } else if (type == 'actionOne') {
            this.setState({ actionOneValue: val });
        } else if (type == 'actionContacted') {
            this.setState({ actionContactedValue: val });
        } else {
            this.setState({ [type]: event.target.value });
        }
        this.updateValObjByCodeFormId(val, rowId);
    }

    updateValObjByCodeFormId = (value, cordFormItemId) => {
        let { valMap, updateState, dataCommon, neonatalDocId, changeEditFlag } = this.props;
        let objItems = {};
        if (valMap.size > 0 && valMap.has(cordFormItemId)) {
            objItems = valMap.get(cordFormItemId);
            let { version } = objItems;
            objItems.itemVal = value;
            if (version !== null && version != '') {
                if (value !== '') {
                    objItems.opType = commonConstants.COMMON_ACTION_TYPE.UPDATE;
                } else {
                    objItems.opType = commonConstants.COMMON_ACTION_TYPE.DELETE;
                }
            } else if ((version === null||version === '') && (value + '').trim() !== '') {
                objItems.opType = commonConstants.COMMON_ACTION_TYPE.INSERT;
            } else {
                objItems.opType = null;
                valMap.delete(cordFormItemId);
            }
        } else {
            if(value !== ''&&value!=null){
                let obj = {
                    docId: neonatalDocId,
                    patientKey: dataCommon.patientKey,
                    opType: commonConstants.COMMON_ACTION_TYPE.INSERT,
                    itemVal: value,
                    docItemId: Math.random(),
                    formItemId: cordFormItemId,
                    createDtm: '',
                    dbUpdateDtm: '',
                    createBy: '',
                    updateBy: '',
                    updateDtm: '',
                    version: '',
                    itemValErrorFlag: false
                };
                valMap.set(cordFormItemId, obj);
                updateState && updateState({ valMap });
                changeEditFlag && changeEditFlag();
            }
        }
    }

    handleDateAccept = (value, formItemId, attrName) => {
        let { valMap, updateState, neonatalDocId, dataCommon,changeEditFlag } = this.props;
        let validateFlag = moment(value).isValid();
        let errorFlag = value === null ? false : (validateFlag ? false : !validateFlag);
        let dataValue = value ? moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
        let dataValueDB = value ? moment(value).format(Enum.DATE_FORMAT_DMY) : null;
        if (valMap.size > 0 && valMap.has(formItemId)) {
            let tempObj = valMap.get(formItemId);
            if (tempObj.version) {
                tempObj.opType = dataValueDB == null ? commonConstants.COMMON_ACTION_TYPE.DELETE : commonConstants.COMMON_ACTION_TYPE.UPDATE;
                tempObj.itemVal = dataValueDB;
                tempObj.itemValErrorFlag = errorFlag;
            } else if (tempObj.opType == commonConstants.COMMON_ACTION_TYPE.INSERT && !validateFlag) {
                valMap.delete(formItemId);
            } else {
                tempObj.opType = commonConstants.COMMON_ACTION_TYPE.INSERT;
                tempObj.itemVal = dataValueDB;
                tempObj.itemValErrorFlag = errorFlag;
            }
        } else {
            if (dataValue != '' && dataValue != null) {
                let obj = {
                    docId: neonatalDocId,
                    patientKey: dataCommon.patientKey,
                    opType: commonConstants.COMMON_ACTION_TYPE.INSERT,
                    itemVal: dataValueDB,
                    docItemId: Math.random(),
                    formItemId: formItemId,
                    createDtm: '',
                    dbUpdateDtm: '',
                    createBy: '',
                    updateBy: '',
                    updateDtm: '',
                    version: '',
                    itemValErrorFlag: false
                };
                valMap.set(obj.formItemId, obj);
            }
        }
        this.setState({ [attrName]: dataValue, [`${attrName}ErrorFlag`]: errorFlag });
        updateState && updateState({ valMap });
        changeEditFlag && changeEditFlag();
    }

    render() {
        const { classes, valMap, roleActionType } = this.props;
        let {
            checkNeoJabox, checkTreatmentbox,
            checkDietarybox, checkFhoG6PDbox,
            paraValue, relationValue,
            currencies, currency, actionOneValue,
            othersValue, actionContactedValue,
            referDorpList, referVal, CACPODatePoint, informationToParent,
            informedDate,
            CACPODate,
  			ILSTPDate,
            informedDateErrorFlag,
            ILSTPDateErrorFlag,
            CACPODateErrorFlag,
			showClearRefer,
            showClearDelivery
        } = this.state;
        let roleActionFlag = (roleActionType != 'D' && roleActionType != 'N') ? true : false;
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
            <div style={{ height: 595, overflow: 'auto' }}>
                <div>
                    <Grid item xs={12} className={classes.root}><label className={classes.labelPad}>G6PD Activity:<span style={{ marginLeft: 10 }}>{valMap.has(2043) ? valMap.get(2043).itemVal + ' U/g Hb' : ''}</span></label><div></div> </Grid>
                </div>
                <div>
                    <Grid style={{ display: 'flex', alignItems: 'start', padding: '20px' }} item xs={12}>
                        <label className={classes.labelPad}>Birth history:</label>
                        <Grid>
                            <Grid style={{ display: 'flex', alignItems: 'center', marginTop: '-8px', marginBottom: '16px' }}>
                                <label className={classes.labelPad}>Para</label>
                                <TextField
                                    id="others"
                                    autoCapitalize="off"
                                    variant="outlined"
                                    // type="text"
                                    value={paraValue}
                                    // rowsMax={3}
                                    disabled={roleActionFlag}
                                    className={classes.inputField}
                                    onChange={(event) => this.handleTextChange(event, 'para', 30, 2075)}
                                    // onBlur={this.handleTextBlur}
                                    // error={errorFlag}
                                    {...inputProps}
                                />
                            </Grid>
                            <Grid style={{ display: 'flex', alignItems: 'center' }}>
                                <label className={classes.labelPad}>Mode of delivery:</label>

                                <div className={classes.wrapper} style={{ maxWidth: 350, minWidth: 350, flex: 1, height: 'auto' }}>
                                    <ValidatorForm id="search_result_form" onSubmit={() => { }}>
                                        <CustomizedSelectFieldValidator
                                            id={'selectbox_babywill'}
                                            options={
                                                currencies.map((option) => {
                                                    return ({ label: option.label, value: option.value });
                                                })}
                                            notShowMsg={false}
                                            errorMessages={'This field is required'}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }), flex: 1 }}
                                            menuPortalTarget={document.body}
                                            msgPosition="bottom"
                                            isValid
                                            value={currency}
                                            showErrorIcon={false}
                                            isClearable={showClearDelivery}
                                            onChange={(e) => { this.handleChange(e, 'delivery', 2076); }}
                                            onFocus={(e) => { this.handleFocus('Delivery'); }}
                                            onBlur={(e) => { this.handleSelectBlur('Delivery'); }}
                                            className={classes.inputProps}
                                            isDisabled={roleActionFlag}
                                        />
                                    </ValidatorForm>
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
                <div>
                    <Grid item xs={12} className={classes.flexStart}>
                        <label className={classes.labelPad}>Neonatal jaundice:</label>
                        <Grid style={{ marginTop: '-10px' }}>
                            <RadioGroup>
                                <FormControlLabel
                                    classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                    disabled={roleActionFlag}
                                    checked={checkNeoJabox === 'Yes'}
                                    value={'Yes'}
                                    control={<Checkbox color="primary" />}
                                    label={'Yes'}
                                    onChange={(event) => { this.handleChecked(event, 'neonatalJaundice', 'Yes', 2077); }}
                                />
                                <FormControlLabel
                                    classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                    disabled={roleActionFlag}
                                    checked={checkNeoJabox === 'No'}
                                    value={'No'}
                                    control={<Checkbox color="primary" />}
                                    label={'No'}
                                    onChange={(event) => { this.handleChecked(event, 'neonatalJaundice', 'No', 2077); }}
                                />
                            </RadioGroup>
                        </Grid>
                        <Grid style={{ display: 'flex' }}>
                            <label className={classes.labelPad}>Treatment</label>
                            <RadioGroup style={{ marginTop: '-10px' }}>
                                <FormControlLabel
                                    checked={checkTreatmentbox === 'Observation'}
                                    classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                    disabled={roleActionFlag || (checkNeoJabox === 'Yes' ? false : true)}
                                    value={'Observation'}
                                    control={<Checkbox color="primary" />}
                                    label={'Observation'}
                                    onChange={(event) => { this.handleChecked(event, 'treatment', 'Observation', 2078); }}
                                />
                                <FormControlLabel
                                    checked={checkTreatmentbox === 'Phototherapy'}
                                    classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                    disabled={roleActionFlag || (checkNeoJabox === 'Yes' ? false : true)}
                                    value={'Phototherapy'}
                                    control={<Checkbox color="primary" />}
                                    label={'Phototherapy'}
                                    onChange={(event) => { this.handleChecked(event, 'treatment', 'Phototherapy', 2078); }}
                                />
                                <FormControlLabel
                                    checked={checkTreatmentbox === 'Exchange Transfusion'}
                                    classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                    disabled={roleActionFlag || (checkNeoJabox === 'Yes' ? false : true)}
                                    value={'Exchange Transfusion'}
                                    control={<Checkbox color="primary" />}
                                    label={'Exchange Transfusion'}
                                    onChange={(event) => { this.handleChecked(event, 'treatment', 'Exchange Transfusion', 2078); }}
                                />
                            </RadioGroup>
                        </Grid>
                    </Grid>
                </div>
                <div>
                    <Grid item xs={12} className={classes.flexStart}>
                        <label className={classes.labelPad}>Dietary history</label>
                        <RadioGroup style={{ marginTop: '-10px' }}>
                            <FormControlLabel
                                classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                disabled={roleActionFlag}
                                checked={checkDietarybox === 'Breast feeding'}
                                value={'Breast feeding'}
                                control={<Checkbox color="primary" />}
                                label={'Breast feeding'}
                                onChange={(event) => { this.handleChecked(event, 'dietaryHistory', 'Breast feeding', 2079); }}
                            />
                            <FormControlLabel
                                classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                disabled={roleActionFlag}
                                checked={checkDietarybox === 'Formula'}
                                value={'Formula'}
                                control={<Checkbox color="primary" />}
                                label={'Formula'}
                                onChange={(event) => { this.handleChecked(event, 'dietaryHistory', 'Formula', 2079); }}
                            />
                            <FormControlLabel
                                classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                disabled={roleActionFlag}
                                checked={checkDietarybox === 'Combined'}
                                value={'Combined'}
                                control={<Checkbox color="primary" />}
                                label={'Combined'}
                                onChange={(event) => { this.handleChecked(event, 'dietaryHistory', 'Combined', 2079); }}
                            />
                        </RadioGroup>
                    </Grid>
                </div>
                <div>
                    <Grid item xs={12} className={classes.flexStart}>
                        <label className={classes.labelPad}>Family history of G6PD Deficiency:</label>
                        <RadioGroup style={{ marginTop: '-10px' }}>
                            <FormControlLabel
                                classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                disabled={roleActionFlag}
                                checked={checkFhoG6PDbox === 'Yes'}
                                value={'Yes'}
                                control={<Checkbox color="primary" />}
                                label={'Yes'}
                                onChange={(event) => { this.handleChecked(event, 'familyHistory', 'Yes', 2080); }}
                            />
                            <FormControlLabel
                                classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                disabled={roleActionFlag}
                                checked={checkFhoG6PDbox === 'No'}
                                value={'No'}
                                control={<Checkbox color="primary" />}
                                label={'No'}
                                onChange={(event) => { this.handleChecked(event, 'familyHistory', 'No', 2080); }}
                            />
                            <FormControlLabel
                                classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                disabled={roleActionFlag}
                                checked={checkFhoG6PDbox === 'Unknown'}
                                value={'Unknown'}
                                control={<Checkbox color="primary" />}
                                label={'Unknown'}
                                onChange={(event) => { this.handleChecked(event, 'familyHistory', 'Unknown', 2080); }}
                            />
                        </RadioGroup>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '-5px' }}>
                            <label className={classes.labelPad}>Relationship</label>
                            <TextField
                                id="relationship"
                                autoCapitalize="off"
                                variant="outlined"
                                type="text"
                                value={relationValue}
                                rowsMax={3}
                                disabled={roleActionFlag || (checkFhoG6PDbox === 'Yes' ? false : true)}
                                className={classes.inputField}
                                onChange={(event) => this.handleTextChange(event, 'relationship', 30, 2081)}
                                {...inputProps}
                            />

                        </div>
                    </Grid>
                </div>
                <div>
                    <Grid style={{ padding: 20 }} item xs={12}>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Action:</p>
                        <Grid className={classes.actionPadd}>
                            <Grid style={{ display: 'flex', alignItems: 'center' }}>
                                <Grid className={classes.flexCenRight}>
                                    <label className={classes.labelPad}>1.</label>
                                    <TextField
                                        id="actionOne"
                                        autoCapitalize="off"
                                        variant="outlined"
                                        // type="text"
                                        value={actionOneValue}
                                        // multiline
                                        // rowsMax={3}
                                        disabled={roleActionFlag}
                                        className={classes.inputField}
                                        onChange={(event) => this.handleTextChange(event, 'actionOne', 30, 2082)}
                                        // onBlur={this.handleTextBlur}
                                        // error={errorFlag}
                                        {...inputProps}
                                    />
                                </Grid>
                                <Grid className={classes.flexCenter}>
                                    <label className={classes.labelPad}>informed on</label>
                                    <div style={{ flex: 1 }}>
                                        <DateBox
                                            itemId="informedDate"
                                            attrName="informedDate"
                                            format={Enum.DATE_FORMAT_EDMY_VALUE}
                                            value={informedDate}
                                            errorFlag={informedDateErrorFlag}
                                            formItemId={2083}
                                            onChange={this.handleDateAccept}
                                            onAccept={(d) => { this.handleDateAccept(d, 2083, 'informedDate'); }}
                                            editMode={roleActionFlag}
                                        />
                                    </div>

                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid className={classes.actionPadd}>
                            <Grid style={{ display: 'flex', alignItems: 'center' }}>
                                <Grid className={classes.flexCenRight}>
                                    <label className={classes.labelPad}>2.</label>
                                    <TextField
                                        id="actionOne"
                                        autoCapitalize="off"
                                        variant="outlined"
                                        // type="text"
                                        value={actionContactedValue}
                                        // multiline
                                        // rowsMax={3}
                                        disabled={roleActionFlag}
                                        className={classes.inputField}
                                        onChange={(event) => this.handleTextChange(event, 'actionContacted', 30, 2084)}
                                        {...inputProps}
                                    />

                                </Grid>
                                <Grid className={classes.flexCenRight}>
                                    <label className={classes.labelPad}>contacted and counselling provided on</label>
                                    <div style={{ flex: 1 }}>
                                        <DateBox
                                            itemId="CACPODate"
                                            attrName="CACPODate"
                                            format={Enum.DATE_FORMAT_EDMY_VALUE}
                                            value={CACPODate}
                                            formItemId={2085}
                                            errorFlag={CACPODateErrorFlag}
                                            onChange={this.handleDateAccept}
                                            onAccept={(d) => { this.handleDateAccept(d, 2085, 'CACPODate'); }}
                                            editMode={roleActionFlag}
                                        />
                                    </div>

                                </Grid>
                                <Grid className={classes.flexCenter}>
                                    <label className={classes.labelPad}>at</label>
                                    <TextField
                                        id="CACPODatePoint"
                                        autoCapitalize="off"
                                        variant="outlined"
                                        type="text"
                                        value={CACPODatePoint}
                                        className={classes.inputField}
                                        onChange={(event) => this.handleTextChange(event, 'CACPODatePoint', 30, 2086)}
                                        disabled={roleActionFlag}
                                        {...inputProps}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid className={classes.actionPadd}>
                            <Grid style={{ display: 'flex', alignItems: 'center' }}>
                                <Grid className={classes.flexCenRight}>
                                    <label style={{ whiteSpace: 'nowrap', wordBreak: 'break-word' }} className={classes.labelPad}>3. Information letter sent to parent /</label>
                                    <TextField
                                        id="informationToParent"
                                        autoCapitalize="off"
                                        variant="outlined"
                                        type="text"
                                        value={informationToParent}
                                        className={classes.inputField}
                                        disabled={roleActionFlag}
                                        onChange={(event) => this.handleTextChange(event, 'informationToParent', 30, 2087)}
                                        {...inputProps}
                                    />
                                </Grid>
                                <Grid className={classes.flexCenRight}>
                                    <label className={classes.labelPad}>on</label>
                                    <div style={{ flex: 1 }}>
                                        <DateBox
                                            itemId="ILSTPDate"
                                            attrName="ILSTPDate"
                                            format={Enum.DATE_FORMAT_EDMY_VALUE}
                                            value={ILSTPDate}
                                            formItemId={2088}
                                            errorFlag={ILSTPDateErrorFlag}
                                            onChange={this.handleDateAccept}
                                            onAccept={(d) => { this.handleDateAccept(d, 2088, 'ILSTPDate'); }}
                                            editMode={roleActionFlag}
                                        />
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid className={classes.actionPadd} style={{ marginBottom: 10 }}>
                            <Grid style={{ display: 'flex', alignItems: 'center' }}>
                                <Grid className={classes.flexCenRight}>
                                    <label className={classes.labelPad}>4.Refer to</label>

                                    <div className={classes.wrapper} style={{ maxWidth: 350, minWidth: 350, flex: 1, height: 'auto' }}>
                                        <ValidatorForm id="search_result_form" onSubmit={() => { }}>
                                            <CustomizedSelectFieldValidator
                                                id={'outlined-select-currency'}
                                                options={
                                                    referDorpList.map((option) => {
                                                        return ({ label: option.valEng, value: option.valEng });
                                                    })}
                                                notShowMsg={false}
                                                errorMessages={'This field is required'}
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }), flex: 1 }}
                                                menuPortalTarget={document.body}
                                                msgPosition="bottom"
                                                isValid
                                                value={referVal}
                                                showErrorIcon={false}
                                                isClearable={showClearRefer}
                                                onChange={(e) => { this.handleChange(e, 'Refer', 2089); }}
                                                onFocus={(e) => { this.handleFocus('Refer'); }}
                                                onBlur={(e) => { this.handleSelectBlur('Refer'); }}
                                                className={classes.inputProps}
                                                isDisabled={roleActionFlag}
                                            />
                                        </ValidatorForm>

                                    </div>
                                    <span style={{ paddingLeft: 10 }}>for follow up.</span>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid className={classes.actionPadd}>
                            <Grid style={{ display: 'flex', alignItems: 'center', width: '64%' }}>
                                <label className={classes.labelPad}>5.Others</label>
                                <TextField
                                    id="others"
                                    autoCapitalize="off"
                                    variant="outlined"
                                    type="text"
                                    value={othersValue}
                                    multiline
                                    rowsMax={3}
                                    disabled={roleActionFlag}
                                    style={{ flex: 1 }}
                                    onChange={(event) => this.handleTextChange(event, 'others', 30, 2090)}
                                    // onBlur={this.handleTextBlur}
                                    // error={errorFlag}
                                    {...inputProps}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
            </div>
        );
    }
}
export default withStyles(styles)(RecordonG6PDDeficiency);