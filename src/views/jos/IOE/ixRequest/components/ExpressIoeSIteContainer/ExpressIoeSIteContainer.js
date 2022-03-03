import React, { Component } from 'react';
import { styles } from './ExpressIoeSIteContainerStyle';
import { withStyles } from '@material-ui/core';
import {Button, Tooltip } from '@material-ui/core';
import { trim } from 'lodash';
import { getState } from '../../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};
import ExpressIoeSiteDialog from '../ExpressIoeSiteDialog/ExpressIoeSiteDialog';
class ExpressIoeSIteContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showInput: false,
      showInputLabelButton:true,
      inputOrderList: [],
      open:false,
      seed:Math.random()
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
          inputOrderList: []
        });
      }
    }
  }

  handleLabelClick = () => {
    this.setState({
      showInput: true,
      open: true
    });
  }

  generateOrderItem = (orderList = []) => {
    let elements = [];
    const { classes } = this.props;
    for (let index = 0; index < orderList.length; index++) {
      let label = '';
      elements.push(
        <div>
          <Button id={'expressIoe_btn_site_order_btn_add' + index} onClick={this.deleteOrderItem.bind(this, orderList[index].orderId, index)} style={{ padding:0, textTransform: 'none', border: '1px solid #0579C8', minWidth: 26, marginRight: 4, height: 24}}>
            <span className={classes.font_color}>-</span>
          </Button>
          {
           orderList[index].arrayList.map((item)=> {
            label = label === '' ? label + item.popupLabel + ':' + orderList[index][item.codeIoeFormItemId] : label + ' ' + item.popupLabel + ':' + orderList[index][item.codeIoeFormItemId];
           })
          }
          <Tooltip title={label} classes={{ tooltip: classes.tooltip }}>
              <label className={classes.label}>{label}</label>
          </Tooltip>
          {/* <label>{`site:${orderList[index]} drugs:${orderList[index].drugs}`}</label> */}
        </div>
      );
    }

    return elements;
  }

  deleteOrderItem = (id, index) => {
    let { inputOrderList = [] } = this.state;
    let orderItem = inputOrderList.find(item => item.orderId === id);
    if (orderItem) {
      inputOrderList.splice(index, 1);
      this.setState({
        inputOrderList: inputOrderList
      });
    }
  }

  handleClose= () =>  {
    this.setState({ open: false });
  }

  updateState=(obj)=>{
    this.setState({
      ...obj
    });
  }

  render() {
    const { classes, id = '', inputLabel,labelButtonDiabled,isFieldArray,updateStateWithoutStatus} = this.props;
    let { showInput,  inputOrderList,showInputLabelButton,open } = this.state;
    const expressIoeSiteDialogParams={
      open,
      handleDialogClose:this.handleClose,
      updateIoeSiteDialogState:this.updateState,
      inputOrderList,
      ...this.props
    };
    return (
      <div>
        <div style={{ marginTop: 5, display: showInput ? 'block' : 'none' }} id={'expressIoe_btn_site_input_text'}>
          {this.generateOrderItem(inputOrderList)}
        </div>

        <div className={classes.itemWrapperDiv}>
          <label  style={{color:'#0579C8'}} >{inputLabel}</label>
          <Button id="expressIoe_btn_site_add"
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
        <ExpressIoeSiteDialog {...expressIoeSiteDialogParams}></ExpressIoeSiteDialog>
      </div>
    );
  }
}

export default withStyles(styles)(ExpressIoeSIteContainer);
