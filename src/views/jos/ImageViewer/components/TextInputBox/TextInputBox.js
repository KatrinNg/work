import React, { Component } from 'react';
import { withStyles, TextField, FormHelperText } from '@material-ui/core';
import { styles } from './TextInputBoxStyle';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import _ from 'lodash';
import classNames from 'classnames';
import * as utils from '../../util/utils';
import {getState} from '../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};
const customTheme = (theme) => {
  return createMuiTheme({
    ...theme,
    overrides: {
      MuiOutlinedInput: {
        multiline: {
          padding: '2px 10px',
          minHeight: 36
        }
      }
    }
  });
};
class TextInputBox extends Component {
  constructor(props){
    super(props);
    this.state={
      val: '',
      errorFlag: false,
      disabledFlag: false
    };
  }

  componentDidMount() {
    const { val, attrName, itemId, enableAutoFocus=false } = this.props;
    this.setState({val:val||''});
    if (enableAutoFocus) {
      document.getElementById(`${attrName}_textbox_${itemId}`).focus();
    }
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

  handleTextChange = (event, doClear = false) => {
    let { updateState, type, itemId, valMap, attrName, changeEditFlag, encounterExistFlag } = this.props;
    let value = doClear?'':utils.cutOutString(event.target.value, 1000);
    this.setState({ val: value });
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[attrName] = value;
      if (!doClear) {
        utils.handleOperationType(tempObj);
      }
    }
    updateState && updateState({ valMap });
    if (encounterExistFlag) {
      !doClear && changeEditFlag && changeEditFlag();
    }
  }


  handleTextBlur = (event, doClear = false) => {
    let { updateState, type, itemId, valMap, attrName, mandatoryFlag=false } = this.props;
    let value = doClear?'':event.target.value;
    this.setState({
      val: _.trim(value),
      errorFlag: mandatoryFlag?(_.trim(value) === ''?true:false):false
    });
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[attrName] = _.trim(value);
      tempObj[`${attrName}ErrorFlag`] = mandatoryFlag?(_.trim(value) === ''?true:false):false;
      updateState&&updateState({valMap});
    }
  }

  render() {
    const { classes, attrName, itemId, mandatoryFlag = false, currentRowFlag, maxLength = undefined, disabledFlag} = this.props;
    let { val, errorFlag } = this.state;
    let inputProps = {
      inputProps: {
        maxLength: maxLength,
        className: attrName==='details' ? classes.multiInputProps : classes.inputProps
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
        <MuiThemeProvider theme={customTheme}>
            <TextField
                id={`${attrName}_textbox_${itemId}`}
                autoCapitalize="off"
                variant="outlined"
                type="text"
                value={val}
                disabled={disabledFlag}
                className={classes.inputField}
                onChange={this.handleTextChange}
                onBlur={this.handleTextBlur}
                error={errorFlag}
                rows={3}
                multiline={attrName==='details'?true:false}
                {...inputProps}
            />
        </MuiThemeProvider>
        {
          mandatoryFlag&&errorFlag?(
            <FormHelperText
                error
                classes={{
                  error: classNames(classes.helperTextError,{
                    [classes.background]:currentRowFlag
                  })
                }}
            >
              This field is required.
            </FormHelperText>
          ):null
        }
      </div>
    );
  }
}

export default withStyles(styles)(TextInputBox);
