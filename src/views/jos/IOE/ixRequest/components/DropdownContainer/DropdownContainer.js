import React, { Component } from 'react';
import { styles } from './DropdownContainerStyle';
import { withStyles } from '@material-ui/core';
import { TextField, Button } from '@material-ui/core';
import { isUndefined, isNull, trim } from 'lodash';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import CustomizedSelectFieldValidator from '../../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import { getState } from '../../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};

class DropdownContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showInput: false,
      showInputLabelButton:true,
      val: '',
      selectOrderList:[],
      options: [{ label: 'Allied Health', value: 'AH' },
      { label: 'Blood tests', value: 'BT' },
      { label: 'Clinical assessment/study', value: 'CAS' },
      { label: 'Drug injection', value: 'DI' },
      { label: 'Medical Consultation', value: 'MC' },
      { label: 'Radiological examination', value: 'RE' },
      { label: 'Specimen collection', value: 'SC' },
      { label: 'Transfusion', value: 'T' },
      { label: 'Wound care/dressing', value: 'WCD' },
      { label: 'Others', value: 'O' }],
      disabledFlag: !isUndefined(props.disabledFlag) ? props.disabledFlag : true  //default:true
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if(nextProps.labelButtonDiabled!=this.props.labelButtonDiabled){
      if(!nextProps.labelButtonDiabled){
        this.setState({
          showInputLabelButton: true,
          showInput: false,
          selectOrderList: [],
          val: ''
        });
      }
    }
  }
  handleInputButtonClick = () => {
    let { val, selectOrderList = [],options } = this.state;
    if(trim(val)!=''){
      let orderItem = options.find(item => item.value === val);
      let orderId = (Math.random() * 10000 + Date.now()).toString().substr(14 - 6, 14);
      let obj = { 'orderId': orderId,...orderItem};
      selectOrderList.push(obj);
      this.setState({
        selectOrderList,
        showInput:true,
        val:''
      });
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
          <label>{orderList[index].label}</label>
        </div>
      );
    }

    return elements;
  }

  deleteOrderItem = (id, index) => {
    let { selectOrderList = [] } = this.state;
    let orderItem = selectOrderList.find(item => item.orderId === id);
    if (orderItem) {
      selectOrderList.splice(index, 1);
      this.setState({
        selectOrderList: selectOrderList
      });
    }
  }

  handleSelectChange = event => {
    let val = !!event?event.value:'';
    this.setState({ val });
  }

  render() {
    const { classes, id = '', labelButtonDiabled, enableDisabled } = this.props;
    let { val,options,selectOrderList,showInput} = this.state;
    return (
      <div>
        <div id={'input_text'} style={{display: showInput ? 'block':'none', marginTop: 5}}>
          {this.generateOrderItem(selectOrderList)}
        </div>
        <div className={classes.itemWrapperDiv}>
        <CustomizedSelectFieldValidator
            id={`ix_request_item_dropdown_${id}`}
            options={options.map(option=>{
              return {
                label: option.label,
                value: option.value
              };
            })}
            notShowMsg
            isClearable
            value={val}
            isDisabled={labelButtonDiabled?false:true}
            onChange={event => {this.handleSelectChange(event);}}
            styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
            menuPortalTarget={document.body}
            inputStyle={{
              borderRadius: '4px',
              backgroundColor: enableDisabled ?  color.cimsDisableColor : 'unset'
            }}
        />
          <Button id="template_btn_add"
              classes={{
                root: classes.root,
                disabled: classes.disabled
              }} onClick={this.handleInputButtonClick} disabled={labelButtonDiabled?false:true}
          >
            Add
          </Button>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(DropdownContainer);
