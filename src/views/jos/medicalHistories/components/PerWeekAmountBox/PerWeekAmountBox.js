import React, { Component } from 'react';
import { withStyles, TextField, FormHelperText, Grid } from '@material-ui/core';
import { styles } from './PerWeekAmountBoxStyle';
import _ from 'lodash';
import classNames from 'classnames';
import * as utils from '../../util/utils';
import CustomizedSelectFieldValidator from '../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import {getState} from '../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};
// import EventEmitter from '../../../../../utilities/josCommonUtilties';

class PerWeekAmountBox extends Component {
  constructor(props){
    super(props);
    this.state={
      amtTxt: '',
      amtTxtErrorFlag: false,
      codeContainerId: null,
      volAmt: '',
      volAmtErrorFlag: false,
      disabledFlag: false
    };
  }

  componentDidMount() {
    const { amtTxt, codeContainerId, volAmt } = this.props;
    this.setState({amtTxt, codeContainerId, volAmt});
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    const { itemId, valMap, type } = nextProps;
    if (valMap.get(type).has(itemId)) {
      let valObj = valMap.get(type).get(itemId);
      let disabledFlag = valObj.neverFlag !== undefined ? valObj.neverFlag : false;
      let doClearFlag = disabledFlag&&!(disabledFlag&&this.state.disabledFlag);
      this.setState({
        disabledFlag: disabledFlag
      });
      doClearFlag&&this.handleClear();
    }
  }

  handleClear = () =>{
    this.handleTextChange(null,'volAmt',true);
    this.handleTextChange(null,'amtTxt',true);
    this.handleSelectChange(null,true);
    this.handleTextBlur(null,'amtTxt',true);
    this.handleTextBlur(null,'volAmt',true);
  }

  handleTextChange = (event,attrName,doClear = false) => {
    let { updateState, type, itemId, valMap, changeEditFlag,encounterExistFlag } = this.props;
    let value = doClear?'':event.target.value;
    this.setState({
      [attrName]:value
    });
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[attrName] = value;
      if (!doClear) {
        utils.handleOperationType(tempObj);
      }
    }
    updateState&&updateState({valMap});
    if(encounterExistFlag){
      !doClear&&changeEditFlag&&changeEditFlag();
    }
  }

  handleTextBlur = (event,attrName,doClear = false) => {
    let { updateState, type, itemId, valMap } = this.props;
    let value = doClear?'':_.trim(event.target.value);
    let validate = attrName === 'amtTxt'?utils.validate5DigitIntegerWith2Decimal:utils.validate8DigitInteger;
    this.setState({
      [attrName]: value,
      [`${attrName}ErrorFlag`]: value === ''?false:(!validate(value))
    });
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[attrName] = value;
      tempObj[`${attrName}ErrorFlag`] = value === ''?false:(!validate(value));
      updateState&&updateState({valMap});
    }
    // EventEmitter.emit(`medical_histories_${eventSignName}_age_error`,{attrName,itemId,type});
  }

  handleSelectChange = (event,doClear = false) => {
    let { updateState, type, itemId, valMap, changeEditFlag, options,encounterExistFlag } = this.props;
    let val = doClear?null:event.value;
    let targetOption = _.find(options, item => {
      return item.value === val;
    });
    let vol = doClear?null:targetOption.vol;
    this.setState({
      codeContainerId: val,
      volAmt: vol,
      volAmtErrorFlag: false
    });
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj.codeContainerId = val;
      tempObj.volAmt = vol;
      tempObj.volAmtErrorFlag = false;
      if (!doClear) {
        utils.handleOperationType(tempObj);
      }
    }
    updateState&&updateState({valMap});
    if(encounterExistFlag){
      !doClear&&changeEditFlag&&changeEditFlag();
    }
  }

  render() {
    const { classes, itemId, options, currentRowFlag } = this.props;
    let { volAmtErrorFlag, amtTxtErrorFlag, amtTxt, codeContainerId, volAmt, disabledFlag } = this.state;
    let inputProps = {
      inputProps: {
        maxLength: 8,
        className:classes.inputProps
      },
      InputProps:{
        style:{
          backgroundColor: disabledFlag ? color.cimsDisableColor : 'unset',
          borderRadius: 4
        }
      }
    };
    return (
      <div className={classes.wrapper}>
        <Grid container alignItems="center">
          <Grid item md={3} xs={12} style={{maxWidth: '32%', flexBasis: '32%'}}>
            <div>
              <TextField
                  id={`amountbox_amt_text_${itemId}`}
                  autoCapitalize="off"
                  variant="outlined"
                  type="text"
                  disabled={disabledFlag}
                  value={amtTxt}
                  className={classes.inputField}
                  onChange={(e)=>{this.handleTextChange(e,'amtTxt');}}
                  onBlur={(e)=>{this.handleTextBlur(e,'amtTxt');}}
                  error={amtTxtErrorFlag}
                  {...inputProps}
              />
              {
                amtTxtErrorFlag?(
                  <FormHelperText
                      error
                      classes={{
                        error: classNames(classes.helperTextError,{
                          [classes.background]:currentRowFlag
                        })
                      }}
                  >
                    Invalid Entry
                  </FormHelperText>
                ):null
              }
            </div>
          </Grid>
          <Grid item md={5} xs={12} style={{maxWidth: '32%', flexBasis: '32%'}}>
            <div style={{width:'95%'}}>
              <CustomizedSelectFieldValidator
                  isDisabled={disabledFlag}
                  id={`amountbox_containerId_${itemId}`}
                  options={options}
                  notShowMsg={false}
                  onChange={this.handleSelectChange}
                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                  menuPortalTarget={document.body}
                  value={codeContainerId}
                  className={classes.inputStyle}
                  inputStyle={{
                    backgroundColor: disabledFlag ? color.cimsDisableColor : 'unset'
                  }}
              />
            </div>
          </Grid>
          <Grid item md={4} xs={12} container alignItems="baseline" justify="space-between" style={{maxWidth: '36%', flexBasis: '36%'}}>
            <TextField
                id={`amountbox_vol_amt_${itemId}`}
                autoCapitalize="off"
                variant="outlined"
                type="text"
                disabled={disabledFlag}
                value={volAmt}
                className={classes.inputFieldVol}
                onChange={(e)=>{this.handleTextChange(e,'volAmt');}}
                onBlur={(e)=>{this.handleTextBlur(e,'volAmt');}}
                error={volAmtErrorFlag}
                {...inputProps}
            />
            <span style={{float:'right'}}>(ml)</span>
            {
              volAmtErrorFlag?(
                <FormHelperText
                    error
                    classes={{
                      error: classNames(classes.helperTextError,{
                        [classes.background]:currentRowFlag
                      })
                    }}
                >
                  Invalid Entry
                </FormHelperText>
              ):null
            }
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(PerWeekAmountBox);
