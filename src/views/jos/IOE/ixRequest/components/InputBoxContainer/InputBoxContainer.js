import React, { Component } from 'react';
import { styles } from './InputBoxContainerStyle';
import { withStyles } from '@material-ui/core';
import { TextField, Button, Tooltip } from '@material-ui/core';
import { isUndefined, isNull, trim } from 'lodash';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import { getState } from '../../../../../../store/util';
import { IX_REQUEST_CODE } from '../../../../../../constants/message/IOECode/ixRequestCode';
import { connect } from 'react-redux';
const { color } = getState(state => state.cimsStyle) || {};

class InputBoxContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showInput: false,
      showInputLabelButton:true,
      val: '',
      inputOrderList: []
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if(nextProps.labelButtonDiabled!=this.props.labelButtonDiabled){
      if(nextProps.labelButtonDiabled){
        this.setState({
          showInputLabelButton: true
        });
      }else{
        this.setState({
          showInputLabelButton: true,
          showInput: false,
          inputOrderList: [],
          val: ''
        });
      }
    }
  }
  handleChanged = event => {
    this.setState({
      val: event.target.value
    });
  }


  handleLabelClick = () => {
    this.setState({
      showInput: true,
      showInputLabelButton:false
    });
  }

  handleInputButtonClick = () => {
    let {groupID,updateStateWithoutStatus,expressIoeMap,id,openCommonMessage}=this.props;
    let { val, inputOrderList = [] } = this.state;
    if(trim(val)!=''){
      let inputRepeatObj=inputOrderList.find(item => item.text === trim(val));
      if(inputOrderList.length===0||(inputOrderList.length>0&&inputRepeatObj===undefined)){
        let orderId = (Math.random() * 10000 + Date.now()).toString().substr(14 - 6, 14);
        let obj = { 'orderId': orderId, 'text': val };
        if(expressIoeMap.has(groupID)){
          let group=expressIoeMap.get(groupID);
          let {formMap}=group;
          let groupItem=formMap.get(id);
          if(!!groupItem){
            groupItem.inputOrderList=inputOrderList;
            updateStateWithoutStatus&&updateStateWithoutStatus({expressIoeMap});
          }
        }
        inputOrderList.push(obj);
        this.setState({
          inputOrderList,
          val:''
        });
      }else{
       let codeIoeRequestScatgryName = '';
       if(expressIoeMap.has(groupID)){
        let group=expressIoeMap.get(groupID);
        let {formMap}=group;
        let groupItem=formMap.get(id);
        if(!!groupItem){
          codeIoeRequestScatgryName = groupItem['codeIoeRequestScatgryName'];
        }
      }
       let  payload= {
         msgCode: IX_REQUEST_CODE.INVALID_REPEAT_ORDER_CODE,
         params: [
              {
                  name: 'ITEM',
                  value: codeIoeRequestScatgryName
              }
          ]
      };
        this.props.openCommonMessage(payload);
      }
    }
  }

  generateOrderItem = (orderList = []) => {
    let elements = [];
    const { classes } = this.props;
    for (let index = 0; index < orderList.length; index++) {
      elements.push(
  <div style={{display:'flex',paddingBottom:orderList.length -1 === index ? 0 : 2}}>
          <Button id={'order_btn_add' + index} onClick={this.deleteOrderItem.bind(this, orderList[index].orderId, index)} style={{ padding:0, textTransform: 'none', border: '1px solid #0579C8', minWidth: 26, marginRight: 4, height: 24}}>
            <span className={classes.font_color}>-</span>
          </Button>
          <Tooltip title={orderList[index].text} classes={{ tooltip: classes.tooltip }}>
              <label className={classes.label}>{orderList[index].text}</label>
          </Tooltip>
        </div>
      );
    }

    return elements;
  }

  deleteOrderItem = (orderId, index) => {
    let {groupID,updateStateWithoutStatus,expressIoeMap,id}=this.props;
    let { inputOrderList = [] } = this.state;
    let orderItem = inputOrderList.find(item => item.orderId === orderId);
    if (orderItem) {
      inputOrderList.splice(index, 1);
      if(expressIoeMap.has(groupID)){
        let group=expressIoeMap.get(groupID);
         let {formMap}=group;
         let groupItem=formMap.get(id);
          if(!!groupItem){
            groupItem.inputOrderList=inputOrderList;
            updateStateWithoutStatus&&updateStateWithoutStatus({expressIoeMap});
          }
        }
      this.setState({
        inputOrderList: inputOrderList
      });
    }
  }

  render() {
    const { classes, id = '', maxLength, inputLabel,labelButtonDiabled } = this.props;
    let { showInput, val, inputOrderList,showInputLabelButton } = this.state;
    return (
      <div>
        <div className={classes.itemWrapperDiv}>
          <label  style={{color:'#0579C8'}} >{inputLabel}</label>
          <Button id="template_btn_add"
              classes={{
                root: classes.root,
                disabled: classes.disabled
              }}
              disabled={labelButtonDiabled?false:true}
              onClick={this.handleLabelClick}
              style={{display: showInputLabelButton ? 'block':'none'}}
          >
             Add
          </Button>
        </div>

        <div style={{ marginTop: 5, display: showInput ? 'block' : 'none' }} id={'input_text'}>
          {this.generateOrderItem(inputOrderList)}
        </div>

        <div className={classes.itemWrapperDiv} style={{ marginTop: 5, display: showInput ? 'block' : 'none' }}>
          <TextField
              name="name"
              autoComplete="off"
              variant="outlined"
              className={classes.inputName}
              value={val}
              inputProps={{
              maxLength: maxLength,
              style: { height: '30px' }
            }}
              onChange={event => { this.handleChanged(event); }}
          />
          <Button
              id="template_btn_add"
              onClick={this.handleInputButtonClick}
              classes={{
                root: classes.inputRoot
              }}
          >
           Add
          </Button>
        </div>
      </div>
    );
  }
}


export default withStyles(styles)(InputBoxContainer);
