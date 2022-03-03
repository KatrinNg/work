import React, { Component } from 'react';
import { withStyles, FormControl, FormGroup, Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import { styles } from './G6PDBorderlineStyle';
import Enum from '../../../../../../../../../src/enums/enum';
import DateBox from '../../../../DateBox/DateBox';
import moment from 'moment';
import ValidatorForm from '../../../../../../../../components/FormValidator/ValidatorForm';
import CustomizedSelectFieldValidator from '../../../../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import * as commonConstants from '../../../../../../../../constants/common/commonConstants';

class G6PDBorderline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gsuDateErrorFlag: false,
      pioErrorFlag: false,
      selectFlag: false,
      showClear: false,
      resultName: ''
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.valMap !== this.props.valMap) {
      let valMap = nextProps.valMap;
      let type = valMap.size > 0 && valMap.has(2041) ? valMap.get(2041).itemVal : '';
      let typeName = '';
      if (type == 'A') {
        typeName = 'Deficient';
      } else if (type == 'B') {
        typeName = 'Borderline';
      } else if (type == 'N') {
        typeName = 'Not Deficient';
      } else {
        typeName = parseFloat(type) > 0 ? type + ' U/g Hb' : type;
      }
      this.setState({ resultName: typeName });
    }
  }

  handleChange = (event, rowId, type) => {
    let { valMap, updateState, neonatalDocId, dataCommon, changeEditFlag } = this.props;
    let checkedVal = event.target.checked ? type : '';
    if (valMap.size > 0 && valMap.has(rowId)) {
      let tempObj = valMap.get(rowId);
      if (tempObj.version) {
        tempObj.opType = event.target.checked ? commonConstants.COMMON_ACTION_TYPE.UPDATE : commonConstants.COMMON_ACTION_TYPE.DELETE;;
        tempObj.itemVal = checkedVal;
      } else if (tempObj.opType == commonConstants.COMMON_ACTION_TYPE.INSERT && !event.target.checked) {
        valMap.delete(rowId);
      } else {
        tempObj.opType = commonConstants.COMMON_ACTION_TYPE.INSERT;
        tempObj.itemVal = checkedVal;
      }
    } else {
      let obj = {
        docId: neonatalDocId,
        patientKey: dataCommon.patientKey,
        opType: commonConstants.COMMON_ACTION_TYPE.INSERT,
        itemVal: checkedVal,
        docItemId: Math.random(),
        formItemId: rowId,
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
    updateState && updateState({ valMap });
    changeEditFlag && changeEditFlag();
  }

  handleSelectChange = (event, rowId) => {
    let { valMap, updateState, neonatalDocId, dataCommon,changeEditFlag } = this.props;
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
        patientKey: dataCommon.patientKey,
        opType: commonConstants.COMMON_ACTION_TYPE.INSERT,
        itemVal: dropValue,
        docItemId: Math.random(),
        formItemId: rowId,
        createDtm: '',
        dbUpdateDtm: '',
        createBy: '',
        updateBy: '',
        updateDtm: '',
        version: '',
        itemValErrorFlag:false
      };
      valMap.set(obj.formItemId, obj);
    }
    updateState && updateState({ valMap });
    changeEditFlag && changeEditFlag();
  }

  handleSelectBlur = (event, rowId) => {
    this.setState({ selectFlag: false, showClear: false });
  }

  handleFocus = () => {
    this.setState({
        showClear: true
    });
}

  resultDataString = (itemId) => {
    let { valMap } = this.props;
    let dataVal = null;
    if (valMap.size > 0 && valMap.has(itemId)) {
      let obj = valMap.get(itemId);
      if (itemId == 2047) {
        if (obj.itemVal == 'A') { dataVal = 'Deficient'; }
        else if (obj.itemVal == 'B') { dataVal = 'Borderline'; }
        else if (obj.itemVal == 'N') { dataVal = 'Not Deficient'; }
        else {
          dataVal = parseFloat(obj.itemVal) >= 0 ? obj.itemVal + ' U/g Hb' : obj.itemVal;
        }
      } else {
        dataVal = obj.itemVal;
      }
    }
    return dataVal;
  }

  resultDtmType = (itemId) => {
    let { valMap } = this.props;
    let dataVal = null;
    if (valMap.size > 0 && valMap.has(itemId)) {
      let obj = valMap.get(itemId);
      dataVal = obj.itemVal ? moment(obj.itemVal, Enum.DATE_FORMAT_DMY).format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
    }
    return dataVal;
  }

  handleDateAccept = (value, formItemId, attrName) => {
    let { valMap, updateState, neonatalDocId, dataCommon, changeEditFlag } = this.props;
    let validateFlag = moment(value).isValid();
    let errorFlag = value === null ? false : (validateFlag ? false : !validateFlag);
    let dataValue = value ? moment(value).format(Enum.DATE_FORMAT_DMY) : null;
    if (valMap.size > 0 && valMap.has(formItemId)) {
      let tempObj = valMap.get(formItemId);
      if (tempObj.version) {
        tempObj.opType = dataValue == null ? commonConstants.COMMON_ACTION_TYPE.DELETE : commonConstants.COMMON_ACTION_TYPE.UPDATE;
        tempObj.itemVal = dataValue;
        tempObj.itemValErrorFlag = errorFlag;
      } else if (tempObj.opType == commonConstants.COMMON_ACTION_TYPE.INSERT && dataValue == null) {
        valMap.delete(formItemId);
      } else {
        tempObj.opType = commonConstants.COMMON_ACTION_TYPE.INSERT;
        tempObj.itemVal = dataValue;
        tempObj.itemValErrorFlag = errorFlag;
      }
    } else {
      let obj = {
        docId: neonatalDocId,
        patientKey: dataCommon.patientKey,
        opType: commonConstants.COMMON_ACTION_TYPE.INSERT,
        itemVal: dataValue,
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
    this.setState({ [`${attrName}ErrorFlag`]: errorFlag });
    updateState && updateState({ valMap });
    changeEditFlag && changeEditFlag();
  }

  render() {
    const { classes, roleActionType, deficiencyDrowDownList } = this.props;
    const { gsuDateErrorFlag, pioErrorFlag, selectFlag, showClear, resultName } = this.state;
    let roleActionFlag = (roleActionType != 'D' && roleActionType != 'N') ? true : false;

    return (
      <div className={classes.wrapper}>
        <Typography component="div" className={classes.content}>
          <label>Lab No.:&nbsp;</label>
          <span>{this.resultDataString(2040)}</span>
        </Typography>
        <Typography component="div" className={classes.content}>
          <label>1st G6PD Result:&nbsp;</label>
          <span>{resultName}</span>
        </Typography>
        <Typography component="div" className={classes.content}>
          <label>Parent informed on:&nbsp;</label>
          <div style={{flex:1}}>
            <DateBox
                itemId="pio"
                attrName="pio"
                format={Enum.DATE_FORMAT_EDMY_VALUE}
                value={this.resultDtmType(2050)}
                formItemId={2050}
                errorFlag={pioErrorFlag}
                onChange={this.handleDateAccept}
                onAccept={(d) => { this.handleDateAccept(d, 2050, 'pio'); }}
                editMode={roleActionFlag}
            />
          </div>
        </Typography>
        <Typography component="div" className={classes.content}>
          <label>Health education on precautions of G6PD Deficiency advised. Pamphlets sent. Baby will return to GSU on:&nbsp;</label>
          <div style={{flex:1}}>
            <DateBox
                itemId="gsuDate"
                attrName="gsuDate"
                format={Enum.DATE_FORMAT_EDMY_VALUE}
                value={this.resultDtmType(2051)}
                errorFlag={gsuDateErrorFlag}
                formItemId={2051}
                onChange={this.handleDateAccept}
                onAccept={(d) => { this.handleDateAccept(d, 2051, 'gsuDate'); }}
                editMode={roleActionFlag}
            />
          </div>
        </Typography>
        <Typography component="div" className={classes.content}>
          <label>Baby will attend:&nbsp;</label>
          <div className={classes.wrapper} style={{ maxWidth: 300, flex:1, height: 'auto' }}>
            <ValidatorForm id="search_result_form" onSubmit={() => { }}>
              <CustomizedSelectFieldValidator
                  id={'selectbox_babywill'}
                  // options={options}
                  options={
                    deficiencyDrowDownList.map((option) => {
                      return ({ label: option.valEng, value: option.valEng });
                    })
                  }
                  notShowMsg={false}
                  errorMessages={'This field is required'}
                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }), flex:1 }}
                  menuPortalTarget={document.body}
                  msgPosition="bottom"
                  value={this.resultDataString(2049)}
                  isValid={!selectFlag}
                  showErrorIcon={false}
                  onChange={(e) => this.handleSelectChange(e, 2049)}
                  onBlur={this.handleSelectBlur}
                  onFocus={this.handleFocus}
                  isClearable={showClear}
                  className={classes.inputProps}
                  isDisabled={roleActionFlag}
              />
            </ValidatorForm>
          </div>
        </Typography>
        <Typography component="div" className={classes.title}>
          <label className={classes.titleLabel}>Repeat Result</label>
        </Typography>
        <Typography component="div" className={classes.content}>
          <label>Date:&nbsp;</label>
          <span>{this.resultDtmType(2048)}</span>
        </Typography>
        <Typography component="div" className={classes.content}>
          <label>G6PD:&nbsp;</label>
          <span>{this.resultDataString(2047)}</span>
        </Typography>
        <Typography component="div" className={classes.content}>
          <div className={classes.flexCenter}>
            <label>Status:&nbsp;</label>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormGroup row>
                <FormControlLabel
                    control={
                    <Checkbox
                        checked={this.resultDataString(2026) == 'N'}
                        onChange={(e) => this.handleChange(e, 2026, 'N')}
                        name="normal"
                        color="primary"
                    />
                  }
                    classes={{
                    label: classes.normalFont,
                    disabled: classes.disabledLabel
                  }}
                    // disabled={roleActionFlag}
                    disabled
                    labelPlacement="end"
                    label="Normal"
                />
                <FormControlLabel
                    control={
                    <Checkbox
                        checked={this.resultDataString(2026) == 'A'}
                        onChange={(e) => this.handleChange(e, 2026, 'A')}
                        name="deficiency"
                        color="primary"
                    />
                  }
                    classes={{
                    label: classes.normalFont,
                    disabled: classes.disabledLabel
                  }}
                    // disabled={roleActionFlag}
                    disabled
                    labelPlacement="end"
                    label="Deficiency"
                />
              </FormGroup>
            </FormControl>
          </div>
        </Typography>
      </div>
    );
  }
}

export default withStyles(styles)(G6PDBorderline);
