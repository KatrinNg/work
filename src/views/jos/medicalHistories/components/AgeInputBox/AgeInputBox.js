import React, { Component } from 'react';
import { withStyles, TextField, FormHelperText } from '@material-ui/core';
import { styles } from './AgeInputBoxStyle';
import _ from 'lodash';
import classNames from 'classnames';
import * as utils from '../../util/utils';
import EventEmitter from '../../../../../utilities/josCommonUtilties';
import {getState} from '../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};

class AgeInputBox extends Component {
  constructor(props){
    super(props);
    this.state={
      val: '',
      errorFlag: false,
      disabledFlag: false
    };
  }

  componentDidMount() {
    const { val } = this.props;
    this.setState({val});
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    const { itemId, valMap, type, attrName } = nextProps;
    if (valMap.get(type).has(itemId)) {
      let valObj = valMap.get(type).get(itemId);
      let disabledFlag = valObj.neverFlag!==undefined?valObj.neverFlag:false;
      let doClearFlag = disabledFlag&&!(disabledFlag&&this.state.disabledFlag);
      this.setState({
        disabledFlag: disabledFlag,
        errorFlag:valObj[`${attrName}ErrorFlag`]
      });
       doClearFlag&&this.handleClear();
    }
  }

  handleClear = () =>{
    this.handleTextChange(null,true);
    this.handleTextBlur(null,true);
  }

  handleTextChange = (event,doClear = false) => {
    let { updateState, type, itemId, item, valMap, attrName, changeEditFlag, encounterExistFlag } = this.props;
    let value = doClear?'':event.target.value;
    this.setState({val:value});
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[attrName] = value;
      if (!doClear) {
        utils.handleOperationType(tempObj);
      }
    } else {
      let tempObj = utils.generateHistoryValObj(type,item);
      tempObj[attrName] = value;
      valMap.get(type).set(itemId,tempObj);
    }
    updateState&&updateState({valMap});
    if(encounterExistFlag){
      !doClear&&changeEditFlag&&changeEditFlag();
    }
  }

  handleTextBlur = (event,doClear = false) => {
    let { updateState, type, itemId, valMap, attrName, eventSignName } = this.props;
    let value = doClear?'':_.trim(event.target.value);
    this.setState({
      val: value,
      errorFlag: value === ''?false:(!utils.validateAge(value))
    });
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[attrName] = value;
      tempObj[`${attrName}ErrorFlag`] = value === ''?false:(!utils.validateAge(value));
      updateState&&updateState({valMap});
    }
    EventEmitter.emit(`medical_histories_${eventSignName}_age_error`,{attrName,itemId,type});
  }

  render() {
    const { classes, attrName, itemId, currentRowFlag } = this.props;
    let { val, errorFlag, disabledFlag } = this.state;
    let inputProps = {
      inputProps: {
        className: classes.inputProps,
        maxLength: 3
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
        <TextField
            id={`${attrName}_agebox_${itemId}`}
            autoCapitalize="off"
            variant="outlined"
            type="text"
            value={val}
            disabled={disabledFlag}
            className={classes.inputField}
            onChange={this.handleTextChange}
            onBlur={this.handleTextBlur}
            error={errorFlag}
            {...inputProps}
        />
        {
          val!==''&&!utils.validateAge(val)?(
            <FormHelperText
                error
                classes={{
                  error: classNames(classes.helperTextError,{
                    [classes.background]:currentRowFlag
                  })
                }}
            >
              Invalid Age
            </FormHelperText>
          ):null
        }
      </div>
    );
  }
}

export default withStyles(styles)(AgeInputBox);
