import React, { Component } from 'react';
import { styles } from './SelectBoxStyle';
import { withStyles } from '@material-ui/core';
import CustomizedSelectFieldValidator from '../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import * as utils from '../../util/utils';
import * as constants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';

class SelectBox extends Component {
  constructor(props){
    super(props);
    this.state={
      val: null,
      errorFlag: false
    };
  }

  // componentDidMount() {
  //   const { val } = this.props;
  //   this.setState({val});
  // }

  UNSAFE_componentWillReceiveProps(nextProps){
    const { itemId, valMap, type, attrName } = nextProps;
    if (valMap.get(type).has(itemId)) {
      let valObj = valMap.get(type).get(itemId);
      this.setState({
        val:valObj[attrName],
        errorFlag:valObj[`${attrName}ErrorFlag`]
      });
    }
  }

  handleSelectChange = event => {
    let { updateState, type, itemId, valMap, attrName, changeEditFlag,encounterExistFlag } = this.props;
    this.setState({
      val: event.value
    });
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[attrName] = event.value;
      tempObj[`${attrName}ErrorFlag`] = false;
      utils.handleOperationType(tempObj);
      if (attrName === 'status') {
        // never cascade type
        let cascadeMap = constants.CASCADE_TYPE_MAP.get(type);
        if (cascadeMap.has(event.value)) {
          tempObj.socialHistorySubtypeId = cascadeMap.get(event.value);
          tempObj.socialHistorySubtypeIdErrorFlag = false;
          tempObj.neverFlag = true;
        } else {
          tempObj.neverFlag = false;
        }
      }
    }
    updateState&&updateState({valMap});
    if(encounterExistFlag){
      changeEditFlag&&changeEditFlag();
    }
  }

  handleSelectBlur = () => {
    let { updateState, type, itemId, valMap, attrName } = this.props;
    let { val } = this.state;
    this.setState({
      errorFlag: val?false:true
    });
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[`${attrName}ErrorFlag`] = val?false:true;
    }
    updateState&&updateState({valMap});
  }

  render() {
    const { classes,maxWidth,attrName,itemId, options } = this.props;
    let { val, errorFlag } = this.state;
    return (
      <div className={classes.wrapper} style={{maxWidth: maxWidth?maxWidth-20:undefined}}>
        <CustomizedSelectFieldValidator
            id={`${attrName}_selectbox_${itemId}`}
            options={options}
            notShowMsg={false}
            errorMessages={'This field is required'}
            styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
            menuPortalTarget={document.body}
            msgPosition="bottom"
            value={val}
            isValid={!errorFlag}
            showErrorIcon={false}
            onChange={this.handleSelectChange}
            onBlur={this.handleSelectBlur}
            className={classes.inputProps}
        />
      </div>
    );
  }
}

export default withStyles(styles)(SelectBox);
