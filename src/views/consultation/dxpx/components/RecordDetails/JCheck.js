import React, { Component } from 'react';
import { Checkbox } from '@material-ui/core';

class JCheck extends Component {
  constructor(props){
    super(props);
    this.ref = React.createRef();
    this.state = {
        checked:props.checkedVal,
        key:Math.random()
    };
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   let { checkedVal } = nextProps;
  //   if ( checkedVal != prevState.checked) {
  //     return {
  //       checked:checkedVal,
  //       key:Math.random()
  //     };
  //   }
  //   return null;
  // }

  handleOnchange = (event)=>{
    let { insertDxpxLog, updateState } = this.props;
    let typeName=event.target.checked?'Select New checkbox in Record Details':'UnSelect New checkbox in Record Details';
    updateState && updateState({leftEditFlag: true});
    insertDxpxLog && insertDxpxLog(typeName,'');
  }

  isCheck = () => {
    let { id } = this.props;
    return document.getElementById(id).checked;
  }


    render() {
        let { checked, key } = this.state;
        let { ...rest } = this.props;
        return (
        <Checkbox
            ref={this.ref}
            key={key}
            defaultChecked={checked}
            onChange={this.handleOnchange}
            {...rest}
        />);
    }
}

export default JCheck;