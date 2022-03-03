import React, { Component } from 'react';
import { getState } from '../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};
import {  TextField, withStyles } from '@material-ui/core';
import { style } from '../ExpressIoeSiteDialogCss';

class DialogInputFiled extends Component {
  constructor(props) {
    super(props);
    this.state={
     val:'',
     validation:'This field is required.',
     errorFlag:false,
     seed:Math.random()
    };
  }
  // componentWillReceiveProps(props){
  //   let {inputObj,codeIoeFormItemId}=props;
  //   if(inputObj[codeIoeFormItemId]===''){
  //     this.setState({
  //       val:''
  //     });
  //   }
  // }

  handelChange = (e) => {
    let flag = false;
    let {codeIoeFormItemId,inputObj,updateStateForSiteDialog} = this.props;
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
    inputObj[codeIoeFormItemId]=(e.target.value).trim();
    updateStateForSiteDialog&&updateStateForSiteDialog({inputObj});
  }

  render() {
    const {classes,popupLabel,popupTitle,codeIoeFormItemId,inputObj,isClickOk} = this.props;
    let {errorFlag,val}=this.state;
    errorFlag = errorFlag || (isClickOk && (inputObj[codeIoeFormItemId] === '' || inputObj[codeIoeFormItemId] === undefined) ? true : false);
    return (
        <div>
        <p style={{ margin:'26px 0px 2px 6px'}}>{popupTitle}</p>
          <div style={{ display: 'flex', marginLeft: 10, marginRight: 13 }}>
          <span style={{color:'red', marginRight: 5,marginTop:7}}>*</span> <span style={{ marginRight: 5,marginTop:7 }} className={classes.templatetitle}>{popupLabel}</span>
            <TextField
                fullWidth
                value={val}
                autoComplete="off"
                variant="outlined"
                className={classes.inputName}
                inputProps={{
                  maxLength: 255,
                  style: style.input
                }}
                onChange={this.handelChange}
                error={errorFlag}
            />
          </div>
          {
          errorFlag ?
              (
                <div><span id="span_ixpressIoe_validation" style={{ marginLeft: '13%' }} className={classes.validation}>{this.state.validation}</span></div>
              ) : null
          }
          </div>
    );
  }
}

export default withStyles(style)(DialogInputFiled);