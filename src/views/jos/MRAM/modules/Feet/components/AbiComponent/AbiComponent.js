import React, { Component } from 'react';
import { styles } from './AbiComponentStyle';
import { withStyles } from '@material-ui/core/styles';
import { TextField, FormHelperText } from '@material-ui/core';
import { MergeType,ErrorOutline } from '@material-ui/icons';
import {
  MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX,
  MRAM_FEET_VASCULAR_ASSESSMENT_ID,
  RANGE_ANKLE_SYSTOLIC_BP,
  RANGE_BRACHIAL_SYSTOLIC_BP,
  RANGE_ABI
} from '../../../../../../../constants/MRAM/feet/feetConstant';
import * as generalUtil from '../../../../utils/generalUtil';
import { trim,toNumber } from 'lodash';

class AbiComponent extends Component {
  constructor(props){
    super(props);
    this.state={
      AbpErrorFlag: false,
      AbpAbnormalFlag: false,
      AbpVal:'',
      BbpErrorFlag: false,
      BbpAbnormalFlag: false,
      BbpVal:'',
      AbiAbnormalFlag: false,
      AbiVal:''
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { fieldValMap,direction='LEFT' } = props;
    let AbpVal = '',
        AbpErrorFlag = false,
        AbpAbnormalFlag = false,
        BbpVal = '',
        BbpErrorFlag = false,
        BbpAbnormalFlag = false,
        AbiVal = '',
        AbiAbnormalFlag = false;
    let AbpFieldValObj = fieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID[`${direction}_FOOT_ANKLE_SYSTOLIC_BP`]}`);
    let BbpFieldValObj = fieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID[`${direction}_FOOT_BRACHIAL_SYSTOLIC_BP`]}`);
    let AbiFieldValObj = fieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID[`${direction}_FOOT_ABI`]}`);
    AbpVal = AbpFieldValObj!==undefined?AbpFieldValObj.value:'';
    AbpErrorFlag = AbpFieldValObj!==undefined?AbpFieldValObj.isError:false;
    AbpAbnormalFlag = AbpFieldValObj!==undefined?AbpFieldValObj.isAbnormal:false;
    BbpVal = BbpFieldValObj!==undefined?BbpFieldValObj.value:'';
    BbpErrorFlag = BbpFieldValObj!==undefined?BbpFieldValObj.isError:false;
    BbpAbnormalFlag = BbpFieldValObj!==undefined?BbpFieldValObj.isAbnormal:false;
    AbiVal = AbiFieldValObj!==undefined?AbiFieldValObj.value:'';

    AbiAbnormalFlag = generalUtil.abnormalCheck(AbiVal,RANGE_ABI);

    if (AbpVal!==state.AbpVal||BbpVal!==state.BbpVal||AbiVal!==state.AbiVal
      ||AbpErrorFlag!==state.AbpErrorFlag||BbpErrorFlag!==state.BbpErrorFlag
      ||AbpAbnormalFlag!==state.AbpAbnormalFlag||BbpAbnormalFlag!==state.BbpAbnormalFlag||AbiAbnormalFlag!==state.AbiAbnormalFlag) {
      return {
        AbpVal,
        AbpErrorFlag,
        AbpAbnormalFlag,
        BbpVal,
        BbpErrorFlag,
        BbpAbnormalFlag,
        AbiVal,
        AbiAbnormalFlag
      };
    }
    return null;
  }

  /**
   * ABI = ABP/BBP
   */
  calculateABI = () => {
    let { updateState,fieldValMap,direction='LEFT' } = this.props;
    let AbpVal = '',
        BbpVal = '',
        AbiVal = '';
    let AbpFieldValObj = fieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID[`${direction}_FOOT_ANKLE_SYSTOLIC_BP`]}`);
    let BbpFieldValObj = fieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID[`${direction}_FOOT_BRACHIAL_SYSTOLIC_BP`]}`);
    let AbiFieldValObj = fieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID[`${direction}_FOOT_ABI`]}`);

    AbpVal = AbpFieldValObj!==undefined?AbpFieldValObj.value:'';
    BbpVal = BbpFieldValObj!==undefined?BbpFieldValObj.value:'';
    AbiVal = AbiFieldValObj!==undefined?AbiFieldValObj.value:'';

    if (AbpFieldValObj&&BbpFieldValObj&&!AbpFieldValObj.isError&&!BbpFieldValObj.isError) {
      AbpVal = trim(AbpVal);
      BbpVal = trim(BbpVal);
      if (AbpVal!==''&&BbpVal!==''&&BbpVal!=='0') {
        AbiVal = (toNumber(AbpVal)/toNumber(BbpVal)).toFixed(3);
      } else if (AbpVal === '' || BbpVal === '' ) {
        AbiVal = '';
      }
    }
    let abnormalFlag = generalUtil.abnormalCheck(AbiVal,RANGE_ABI);
    if(AbiFieldValObj){
      AbiFieldValObj.value = AbiVal;
      AbiFieldValObj.isAbnormal = abnormalFlag;
    }
    generalUtil.handleOperationType(AbiFieldValObj);

    this.setState({
      AbiAbnormalFlag: abnormalFlag,
      AbiVal
    });
    updateState&&updateState({
      fieldValMap
    });
  }

  handleNaturalChanged = (event,prefix,mramId) => {
    let { updateState,fieldValMap } = this.props;
    let errorFlag = false;
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    fieldValObj.value = event.target.value;

    if (event.target.value!=='') {
      if (!generalUtil.NaturalValCheck(event.target.value)) {
        errorFlag = false;
      } else {
        errorFlag = true;
      }
    }
    let rangeValObj = null;
    let statePrefix = '';
    if (mramId === '142' || mramId === '143') {
      //ABP
      rangeValObj = RANGE_ANKLE_SYSTOLIC_BP;
      statePrefix = 'Abp';
    } else if (mramId === '144' || mramId === '145') {
      //BBP
      rangeValObj = RANGE_BRACHIAL_SYSTOLIC_BP;
      statePrefix = 'Bbp';
    }
    let abnormalFlag = generalUtil.abnormalCheck(event.target.value,rangeValObj);
    fieldValObj.isAbnormal = abnormalFlag;
    fieldValObj.isError = errorFlag;
    generalUtil.handleOperationType(fieldValObj);
    this.setState({
      [`${statePrefix}Val`]:event.target.value,
      [`${statePrefix}ErrorFlag`]:errorFlag,
      [`${statePrefix}AbnormalFlag`]:abnormalFlag
    });
    //handle ABI
    this.calculateABI();
    updateState&&updateState({
      fieldValMap
    });

  }

  render() {
    const { classes, maxLength, direction='LEFT', viewMode=false } = this.props;
    let {
      AbpErrorFlag,
      AbpAbnormalFlag,
      AbpVal,
      BbpErrorFlag,
      BbpAbnormalFlag,
      BbpVal,
      AbiAbnormalFlag,
      AbiVal
    } = this.state;

    let numberInputProps = {
      autoCapitalize:'off',
      variant:'outlined',
      type:'text',
      inputProps: {
        maxLength: maxLength || null
      }
    };

    let abiFieldProps = {
      autoCapitalize:'off',
      variant:'outlined',
      type:'text'
    };

    return (
      <div>
        <div>
          {AbpErrorFlag||AbpAbnormalFlag?(
            <FormHelperText
                error
                classes={{
                  error:classes.helper_error
                }}
            >
              <ErrorOutline className={classes.error_icon} />
              {/* Illegal Characters */}
              {AbpErrorFlag?'Invalid Entry':(AbpAbnormalFlag?'The value should be between 30 and 300.':'')}
            </FormHelperText>
          ):null}
        </div>
        <div className={classes.coreWrapper}>
          <div className={classes.inputWrapper}>
            <div className={classes.abpWrapper}>
              <TextField
                  id={`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID[`${direction}_FOOT_ANKLE_SYSTOLIC_BP`]}`}
                  error={!AbpErrorFlag?AbpAbnormalFlag:true}
                  value={AbpVal}
                  disabled={viewMode}
                  InputProps={{
                    className: AbpErrorFlag?classes.abnormal:(AbpAbnormalFlag?classes.abnormal:null),
                    classes: {
                      input: classes.input,
                      disabled: classes.disabled
                    }
                  }}
                  onChange={event => {this.handleNaturalChanged(event,MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX,MRAM_FEET_VASCULAR_ASSESSMENT_ID[`${direction}_FOOT_ANKLE_SYSTOLIC_BP`]);}}
                  className={classes.normalInput}
                  {...numberInputProps}
              />
              <div className={classes.extraContent}>
                <label className={classes.extraContentLabel}>mmHg</label>
              </div>
            </div>
            <div className={classes.bbpWrapper}>
              <TextField
                  id={`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID[`${direction}_FOOT_BRACHIAL_SYSTOLIC_BP`]}`}
                  error={!BbpErrorFlag?BbpAbnormalFlag:true}
                  value={BbpVal}
                  disabled={viewMode}
                  InputProps={{
                    className: BbpErrorFlag?classes.abnormal:(BbpAbnormalFlag?classes.abnormal:null),
                    classes: {
                      input: classes.input,
                      disabled: classes.disabled
                    }
                  }}
                  onChange={event => {this.handleNaturalChanged(event,MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX,MRAM_FEET_VASCULAR_ASSESSMENT_ID[`${direction}_FOOT_BRACHIAL_SYSTOLIC_BP`]);}}
                  className={classes.normalInput}
                  {...numberInputProps}
              />
              <div className={classes.extraContent}>
                <label className={classes.extraContentLabel}>mmHg</label>
              </div>
            </div>
          </div>
          <div className={classes.abiWrapper}>
            <MergeType
                className={classes.icon}
            />
            <TextField
                id={`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID[`${direction}_FOOT_ABI`]}`}
                error={AbiAbnormalFlag}
                disabled={viewMode}
                InputProps={{
                  readOnly: true,
                  className: AbiAbnormalFlag?classes.abnormal:null,
                  classes: {
                    input: classes.input,
                    disabled: classes.disabled
                  }
                }}
                className={classes.abiInput}
                value={AbiVal}
                {...abiFieldProps}
            />
          </div>
        </div>
        <div className={classes.bottomWrapper}>
          {BbpErrorFlag||BbpAbnormalFlag?(
            <FormHelperText
                error
                classes={{
                  error:classes.helper_error
                }}
            >
              <ErrorOutline className={classes.error_icon} />
              {/* Illegal Characters */}
              {BbpErrorFlag?'Invalid Entry ':(BbpAbnormalFlag?'The value should be between 10 and 300.':'')}
            </FormHelperText>
          ):null}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(AbiComponent);
