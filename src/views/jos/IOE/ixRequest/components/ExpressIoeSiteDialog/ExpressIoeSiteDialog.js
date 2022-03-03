
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DialogActions, DialogTitle, Dialog, Paper, Typography, TextField, Grid, withStyles } from '@material-ui/core';
import CIMSButton from '../../../../../../components/Buttons/CIMSButton';
import DialogInputFiled from '../ExpressIoeSiteDialog/DialogInputFiled/DialogInputFiled';
import DialogDropDownFiled from '../ExpressIoeSiteDialog/DialogDropDownFiled/DialogDropDownFiled';
import * as commonTypes from '../../../../../../store/actions/common/commonActionType';
import { IX_REQUEST_CODE } from '../../../../../../constants/message/IOECode/ixRequestCode';
import { style } from './ExpressIoeSiteDialogCss';

import Draggable from 'react-draggable';


function PaperComponent(props) {
  return (
    <Draggable
        enableUserSelectHack={false}
        onStart={(e) => e.target.getAttribute('customdrag') === 'allowed'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class ExpressIoeSiteDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.open,
      fullWidth: true,
      siteErrorFlag: false,
      drugsValidation: false,
      editFlag: false,
      siteValidation:'This field is required.',
      inputObj:{
        orderId: (Math.random() * 10000 + Date.now()).toString().substr(14 - 6, 14),
        arrayList:props.isFieldArray||[]
      },
      isClickOk: false
    };
  }

  handleCancel = () => {
    let { handleDialogClose } = this.props;
      this.setState({
        siteValue: '',
        drugsValue: '',
        siteErrorFlag: false,
        drugsValidation: false,
        editFlag: false
      });
      handleDialogClose && handleDialogClose();
  }

  handleClose = () =>{
    this.setState({
        siteValue: '',
        drugsValue: '',
        siteErrorFlag: false,
        drugsValidation: false,
        editFlag: false,
        siteValidation: 'This field is required.'
      });
  }

  isRepeatField = (obj) => {
    let {  inputOrderList,isFieldArray=[],updateStateWithoutStatus, groupID}=this.props;
    let flag = false;
    if(inputOrderList.length===0){
      flag = true;
      return flag;
    }
    for(let orderIndex = 0; orderIndex < inputOrderList.length; orderIndex++) {
      let order=inputOrderList[orderIndex];
    for (let index = 0; index < obj.arrayList.length; index++) {
      const element = obj.arrayList[index];
      if(obj[element.codeIoeFormItemId] !== order[element.codeIoeFormItemId]) {
        flag = true;
      }
    }
  }
    return flag;
  }

  handleOk = () => {
    let {id,expressIoeMap,inputOrderList,updateIoeSiteDialogState,isFieldArray=[],updateStateWithoutStatus,openCommonMessage, codeIoeRequestScatgryName,groupID}=this.props;
    let {inputObj}=this.state;
    if(!this.hasEmptyField(inputObj)) {
      if(this.isRepeatField(inputObj)){
        let  inputTempObj={
          orderId: (Math.random() * 10000 + Date.now()).toString().substr(14 - 6, 14),
          arrayList:isFieldArray
        };
        inputOrderList.push(inputObj);
        if(expressIoeMap.has(groupID)){
          let group=expressIoeMap.get(groupID);
          let {formMap}=group;
          let groupItem=formMap.get(id);
          if(!!groupItem){
            groupItem.inputOrderList=inputOrderList;
            updateStateWithoutStatus&&updateStateWithoutStatus({expressIoeMap});
          }
        }
        this.setState({inputObj:inputTempObj, isClickOk:false});
        updateIoeSiteDialogState&&updateIoeSiteDialogState({inputOrderList,open:false});

      }else{
        let  payload= {
          msgCode: IX_REQUEST_CODE.NOTNULL_ORDER_CODE,
          params: [
               {
                   name: 'ITEM',
                   value: `${codeIoeRequestScatgryName}`
               }
           ]
       };
       openCommonMessage&&openCommonMessage(payload);
      }
    }else{
      this.setState({isClickOk:true});
    }
}

  hasEmptyField = (obj) => {
    let flag = false;
    for (let index = 0; index < obj.arrayList.length; index++) {
      const element = obj.arrayList[index];
      if(obj[element.codeIoeFormItemId] === undefined || obj[element.codeIoeFormItemId] === '') {
        flag = true;
      }
    }
    return flag;
  }

  handleEscKeyDown = () =>{
    this.handleCancel();
  }

  updateStateForSiteDialog = (obj) => {
    this.setState({
      ...obj
    });
  }

  generateItems =() =>{
  let { isFieldArray=[] } = this.props;
  let {inputObj,isClickOk}=this.state;
  let elements=[];
  for (let index = 0; index < isFieldArray.length; index++) {
    const item = isFieldArray[index];
    // inputObj[item.codeIoeFormItemId]='';
    let itemParament={
      updateStateForSiteDialog:this.updateStateForSiteDialog,
      inputObj,
      isClickOk,
      ...item
    };
    if(item.frmItemTypeCd==='IB'){
      elements.push(<DialogInputFiled  {...itemParament}/>);
    }else if(item.frmItemTypeCd==='DL'){
      elements.push(<DialogDropDownFiled {...itemParament}/>);
    }
  }
  return elements;
  }


  render() {
    let { classes } = this.props;
    return (
      <Dialog
          fullWidth={this.state.fullWidth}
          open={this.props.open}
          maxWidth="sm"
          PaperComponent={PaperComponent}
          onEscapeKeyDown={this.handleEscKeyDown}
          onExit={this.handleClose}
      >
        <DialogTitle
            className={classes.dialogTitle}
            id="max-width-dialog-title"
            disableTypography customdrag="allowed"
        >
          Ix Request Order Dialog
        </DialogTitle>
        <Typography component="div" className={classes.dialogBorder}>
          {this.generateItems()}
          {/* <span><hr /></span> */}
          <DialogActions>
            <CIMSButton
                classes={{
                  root: classes.btnRoot,
                  label: classes.fontLabel
                }}
                color="primary"
                id={'saveCimsButton'}
                onClick={this.handleOk}
                size="small"
                variant="contained"
            >
              Add
            </CIMSButton>
            <CIMSButton
                classes={{
                  root: classes.btnRoot,
                  label: classes.fontLabel
                }}
                color="primary"
                id={'cancelCimsButton'}
                onClick={this.handleCancel}
                size="small"
                variant="contained"
            >
              Cancel
            </CIMSButton>
          </DialogActions>
        </Typography>
      </Dialog>
    );
  }
}


function mapStateToProps() {
  return {};
}
export default connect(mapStateToProps)(withStyles(style)(ExpressIoeSiteDialog));


