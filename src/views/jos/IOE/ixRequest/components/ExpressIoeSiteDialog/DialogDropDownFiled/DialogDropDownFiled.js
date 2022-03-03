import React, { Component } from 'react';
import { getState } from '../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};
import {  Typography, TextField, withStyles } from '@material-ui/core';
import { style } from '../ExpressIoeSiteDialogCss';
import CustomizedSelectFieldValidator from '../../../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';

class DialogDropDownFiled extends Component {
  constructor(props) {
    super(props);
    this.state={
     val:'',
     validation:'This field is required.',
     errorFlag:false,
     seed:Math.random()
    };
  }

  componentWillReceiveProps(props){
    const {selected}=props;
    if(selected){
      this.setState({
        selected:selected
      });
    }
  }

  handelChange = (e) => {
    let flag = false;
    if( e.target.value.trim() === ''){
        flag = true;
        this.setState({
            val: e.target.value,
            errorFlag: flag,
            editFlag: true
            });
    }else{
        this.setState({
            val: e.target.value,
            errorFlag: flag,
            editFlag: true
          });
    }
  }

  render() {
    const {classes,popupTitle,popupLabel,codeIoeFormItemId,inputObj,isClickOk} = this.props;
    let {errorFlag,val}=this.state;
    errorFlag = errorFlag || (isClickOk && (inputObj[codeIoeFormItemId] === '' || inputObj[codeIoeFormItemId] === undefined) ? true : false);
    return (
        <div>
        <p style={{ margin:'26px 0px 2px 6px'}}>{popupTitle}</p>
          <div style={{ display: 'flex', marginLeft: 10, marginRight: 13 }}>
          <span style={{color:'red', marginRight: 5,marginTop:7}}>*</span> <span style={{ marginRight: 5,marginTop:7 }} className={classes.templatetitle}>{popupLabel}</span>
          <CustomizedSelectFieldValidator
              id={'ix_request_site_dialog_dropdown'}
              options={[].map(option=>{
              return {
                label: option.label,
                value: option.value
              };
            })}
              notShowMsg
              isClearable
              value={val}
              onChange={event => {this.handleSelectChange(event);}}
              styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
              menuPortalTarget={document.body}
              isValid={!errorFlag}
            //   inputStyle={{
            //   borderRadius: '4px',
            //   backgroundColor: enableDisabled ?  color.cimsDisableColor : 'unset'
            // }}
          />
          </div>
          {
          errorFlag ?
              (
                <div><span id="span_ixpressIoe_dropdowm_validation" style={{ marginLeft: '13%' }} className={classes.validation}>{this.state.validation}</span></div>
              ) : null
          }
          </div>
    );
  }
}

export default withStyles(style)(DialogDropDownFiled);