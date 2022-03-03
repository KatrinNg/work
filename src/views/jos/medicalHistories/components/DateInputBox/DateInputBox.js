import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import {styles} from './DateInputBoxStyle';
import { KeyboardDatePicker } from '@material-ui/pickers';
import moment from 'moment';
import classNames from 'classnames';
import * as utils from '../../util/utils';
import {getState} from '../../../../../store/util';
const { color,font } = getState(state => state.cimsStyle) || {};
import EventEmitter from '../../../../../utilities/josCommonUtilties';

const customTheme = (theme) => createMuiTheme({
  ...theme,
  overrides: {
    ...theme.overrides,
    MuiPaper:{
      root:{
        backgroundColor:color.cimsBackgroundColor
      }
    },
    MuiInputBase: {
      ...theme.overrides.MuiInputBase,
      root: {
        height: 39,
        color:color.cimsTextColor
      }
    },
    MuiPickersCalendarHeader:{
      iconButton:{
        backgroundColor:color.cimsBackgroundColor
      }
    },
    MuiFormControl:{
      root:{
        borderRadius: 4,
        backgroundColor:color.cimsBackgroundColor
      }
    },
    MuiFormControlLabel:{
      label:{
        MuiDisabled:{
          color: color.cimsPlaceholderColor
        }
      }
    }
  }
});

class DateInputBox extends Component {
  constructor(props){
    super(props);
    this.state={
      val: null,
      errorFlag: false,
      disabledFlag: false
    };
  }

  componentDidMount(){
    const { val } = this.props;
    this.setState({
      val:val?moment(String(val)):null
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    const { itemId, valMap, type, attrName } = nextProps;
    if (valMap.get(type).has(itemId)) {
      let valObj = valMap.get(type).get(itemId);
      let disabledFlag = valObj.neverFlag !== undefined ? valObj.neverFlag : false;
      let doClearFlag = disabledFlag&&!(disabledFlag&&this.state.disabledFlag);
      this.setState({
        disabledFlag: disabledFlag,
        errorFlag:valObj[`${attrName}ErrorFlag`]
      });
      doClearFlag&&this.handleClear();
    }
  }

  handleClear = () =>{
    this.handleDateChange(null,true);
    this.handleBlur(null,true);
  }

  handleDateChange = (date,doClear =false) => {
    let { updateState, item, itemId, valMap, type, attrName, changeEditFlag, eventSignName, encounterExistFlag } = this.props;
    let value = doClear?'':date;
    let errorFlag = value?(!value.isValid()?true:moment(value).year()>moment(new Date()).year()):false;
    this.setState({
      val: value,
      errorFlag
    });
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[attrName] = value?value.format('YYYY'):null;
      tempObj[`${attrName}ErrorFlag`] = errorFlag;
      if (!doClear) {
        utils.handleOperationType(tempObj);
      }
      updateState&&updateState({valMap});
    } else {
      let tempObj = utils.generateHistoryValObj(type,item);
      tempObj[attrName] = value.format('YYYY');
      tempObj[`${attrName}ErrorFlag`] = errorFlag;
      valMap.get(type).set(itemId,tempObj);
      updateState&&updateState({valMap});
    }
    if(encounterExistFlag){
      !doClear&&changeEditFlag&&changeEditFlag();
    }
    EventEmitter.emit(`medical_histories_${eventSignName}_year_error`,{attrName,itemId,type});
  }

  handleDateError = () => {
    let { updateState, itemId, type, valMap, attrName } = this.props;
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[`${attrName}ErrorFlag`] = true;
      updateState&&updateState({valMap});
    }
    this.setState({errorFlag:true});
  }

  handleBlur = (event,doClear =false) => {
    let { attrName, updateState, itemId, valMap, type, eventSignName } = this.props;
    let value = doClear?null:event.target.value;
    let errorFlag = false;
    if (value!=='') {
      if (!moment(value).isValid()) {
        errorFlag = true;
      } else {
        // min year 1900 & not allow future year
        errorFlag = !moment(value).isSameOrAfter(moment('1900'))||moment(value).year()>moment(new Date()).year();
      }
    }
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[`${attrName}ErrorFlag`] = errorFlag;
      updateState&&updateState({valMap});
    }
    this.setState({errorFlag});
    EventEmitter.emit(`medical_histories_${eventSignName}_year_error`,{attrName,itemId,type});
  }

  render() {
    const { classes, currentRowFlag } = this.props;
    let { val, errorFlag, disabledFlag } = this.state;
    let pickerKeyboardButtonProps = {
      style: {
        padding: 2,
        position: 'absolute',
        right: 0
      }
    };
    return (
      <div className={classes.wrapper}>
        <MuiThemeProvider theme={customTheme}>
        <KeyboardDatePicker
            KeyboardButtonProps={pickerKeyboardButtonProps}
            views={['year']}
            value={val?moment(val).valueOf():null}
            FormHelperTextProps={{
              className:classNames(classes.helperTextError,{
                [classes.background]:currentRowFlag
              })
            }}
            disabled={disabledFlag}
            invalidDateMessage={'Invalid Year'}
            inputVariant="outlined"
            onChange={date => {this.handleDateChange(date);}}
            onBlur={this.handleBlur}
            onError={this.handleDateError}
            minDateMessage=""
            maxDateMessage=""
            format={'YYYY'}
            error={errorFlag}
            clearable
            InputProps={{
              style: {
                fontSize: font.fontSize,
                fontFamily: font.fontFamily,
                color: disabledFlag ? 'rgba(0, 0, 0, 0.26)' : color.cimsTextColor,
                backgroundColor: disabledFlag ? color.cimsDisableColor : 'unset',
                borderRadius: 4
              }
            }}
        />
        </MuiThemeProvider>
      </div>
    );
  }
}

export default withStyles(styles)(DateInputBox);
