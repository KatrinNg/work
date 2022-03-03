import React, { Component } from 'react';
import { withStyles, TextField, FormHelperText } from '@material-ui/core';
import { styles } from './TextareaBoxStyle';
import _ from 'lodash';
import classNames from 'classnames';
import * as utils from '../../util/utils';

class TextareaBox extends Component {
  constructor(props){
    super(props);
    this.state={
      val: '',
      errorFlag: false
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
      this.setState({errorFlag:valObj[`${attrName}ErrorFlag`]});
      // if (valObj[`${attrName}ErrorFlag`]!==this.state.errorFlag) {
      //   this.setState({errorFlag:valObj[`${attrName}ErrorFlag`]});
      // }
    }
  }

  handleTextChange = (event) => {
    let { updateState, itemId, valMap, type, attrName, changeEditFlag, encounterExistFlag } = this.props;
    this.setState({
      val:event.target.value
    });
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[attrName] = event.target.value;
      utils.handleOperationType(tempObj);
      updateState&&updateState({valMap});
    }
    if(encounterExistFlag){
      changeEditFlag&&changeEditFlag();
    }
  }

  handleTextBlur = (event) => {
    let { updateState, itemId, valMap, type, attrName, mandatoryFlag=false } = this.props;
    let value = _.trim(event.target.value);
    this.setState({
      val: value,
      errorFlag: mandatoryFlag?(value === ''?true:false):false
    });
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[attrName] = value;
      tempObj[`${attrName}ErrorFlag`] = mandatoryFlag?(value === ''?true:false):false;
      updateState&&updateState({valMap});
    }
  }

  render() {
    const { classes, itemId, attrName, mandatoryFlag=false, currentRowFlag } = this.props;
    let { val, errorFlag } = this.state;
    let inputProps = {
      InputProps:{
        classes:{
          multiline:classes.multilineInput
        }
      },
      inputProps: {
        className:classes.inputProps
      }
    };
    return (
      <div className={classes.wrapper}>
        <TextField
            id={`${attrName}_textarea_${itemId}`}
            autoCapitalize="off"
            variant="outlined"
            type="text"
            value={val}
            multiline
            rows={3}
            className={classes.inputField}
            onChange={this.handleTextChange}
            onBlur={this.handleTextBlur}
            error={errorFlag}
            {...inputProps}
        />
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

export default withStyles(styles)(TextareaBox);
