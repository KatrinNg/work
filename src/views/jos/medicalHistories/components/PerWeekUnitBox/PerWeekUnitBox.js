import React, { Component } from 'react';
import { withStyles, TextField, FormHelperText, Grid, Tooltip, Fab } from '@material-ui/core';
import { styles } from './PerWeekUnitBoxStyle';
import _ from 'lodash';
import classNames from 'classnames';
import * as utils from '../../util/utils';
import { Input } from '@material-ui/icons';
import {getState} from '../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};
// import EventEmitter from '../../../../../utilities/josCommonUtilties';

class PerWeekUnitBox extends Component {
  constructor(props){
    super(props);
    this.state={
      stdUnit: '',
      stdUnitErrorFlag: false,
      disabledFlag: false
    };
  }

  componentDidMount() {
    const { stdUnit } = this.props;
    this.setState({stdUnit});
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    const { itemId, valMap, type } = nextProps;
    if (valMap.get(type).has(itemId)) {
      let valObj = valMap.get(type).get(itemId);
      let disabledFlag = valObj.neverFlag!==undefined?valObj.neverFlag:false;
      let doClearFlag = disabledFlag&&!(disabledFlag&&this.state.disabledFlag);
      this.setState({
        disabledFlag: disabledFlag,
        stdUnit:valObj.stdUnit
      });
      doClearFlag&&this.handleClear();
    }
  }

  handleClear = () =>{
    this.handleTextChange(null,'stdUnit',true);
    this.handleTextBlur(null,'stdUnit',true);
  }

  handleCalculateUnit = (attrName) => {
    let { updateState, type, itemId, typeOptions, valMap, changeEditFlag, encounterExistFlag } = this.props;

    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      let statusErrorFlag = tempObj.status?false:true;
      let socialHistorySubtypeIdErrorFlag = tempObj.socialHistorySubtypeId?false:true;
      if (statusErrorFlag||socialHistorySubtypeIdErrorFlag) {
        if (statusErrorFlag) {
          tempObj.statusErrorFlag = statusErrorFlag;
        }
        if (socialHistorySubtypeIdErrorFlag) {
          tempObj.socialHistorySubtypeIdErrorFlag = socialHistorySubtypeIdErrorFlag;
        }
      } else {
        let amtVal = tempObj.amtTxt!==''?_.toNumber(tempObj.amtTxt):'';
        let volAmtVal = tempObj.volAmt!==''?_.toNumber(tempObj.volAmt):'';
        let val = null;
        if (_.isNumber(amtVal)&&_.isNumber(volAmtVal)&&amtVal!==''&&volAmtVal!==''&&!_.isNaN(amtVal)&&!_.isNaN(volAmtVal)) {
          let typeVal = tempObj.socialHistorySubtypeId;
          let typeObj = _.find(typeOptions, item=>{
            return item.value === typeVal;
          });
          if (typeObj) {
            let alcoholContainerFrom = typeObj.alchlCntntFrom;
            let alcoholContainerTo = typeObj.alchlCntntTo;
            if (alcoholContainerFrom&&alcoholContainerTo) {
              let alcoholContainerAverage = (alcoholContainerFrom+alcoholContainerTo)/2;
              val = alcoholContainerAverage * volAmtVal * amtVal * 0.789 / 1000;
            }
          }
        }
        tempObj[attrName] = val!==null?_.round(val,1):'';
        tempObj[`${attrName}ErrorFlag`] = tempObj[attrName] === ''?false:(!utils.validate5DigitIntegerWith1Decimal(tempObj[attrName]));
        this.setState({
          [attrName]: tempObj[attrName],
          [`${attrName}ErrorFlag`]: tempObj[`${attrName}ErrorFlag`]
        });
      }
      if(encounterExistFlag){
        changeEditFlag&&changeEditFlag();
      }
      updateState&&updateState({valMap});
    }
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
    this.setState({
      [attrName]: value,
      [`${attrName}ErrorFlag`]: value === ''?false:(!utils.validate5DigitIntegerWith1Decimal(value))
    });
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[attrName] = value;
      tempObj[`${attrName}ErrorFlag`] = value === ''?false:(!utils.validate5DigitIntegerWith1Decimal(value));
      updateState&&updateState({valMap});
    }
    // EventEmitter.emit(`medical_histories_${eventSignName}_age_error`,{attrName,itemId,type});
  }

  render() {
    const { classes, itemId, currentRowFlag } = this.props;
    let { stdUnitErrorFlag, stdUnit, disabledFlag } = this.state;
    let inputProps = {
      inputProps: {
        maxLength: 7,
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
          <Grid item md={12} xs={12} container style={{flexWrap:'nowrap'}}>
            <Tooltip title="Calculate Unit" classes={{tooltip:classes.tooltip}}>
              <Fab
                  size="small"
                  color="primary"
                  aria-label="Calculate Unit"
                  id={`btn_Calculate_Unit_${itemId}`}
                  disabled={disabledFlag}
                  className={classes.fab}
                  style={{marginRight: 5, minWidth: 40}}
                  onClick={()=>{this.handleCalculateUnit('stdUnit');}}
              >
                <Input />
              </Fab>
            </Tooltip>
            <div>
              <TextField
                  id={`amountbox_std_unit_${itemId}`}
                  autoCapitalize="off"
                  variant="outlined"
                  type="text"
                  value={stdUnit}
                  className={classes.inputField}
                  disabled={disabledFlag}
                  onChange={(e)=>{this.handleTextChange(e,'stdUnit');}}
                  onBlur={(e)=>{this.handleTextBlur(e,'stdUnit');}}
                  error={stdUnitErrorFlag}
                  {...inputProps}
              />
              {
                stdUnitErrorFlag?(
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
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(PerWeekUnitBox);
