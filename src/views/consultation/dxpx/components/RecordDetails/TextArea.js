import React, { Component } from 'react';

class TextArea extends Component {
  constructor(props){
    super(props);
    this.ref = React.createRef();
    this.state = {
        val:props.val,
        readOnly:props.readOnlyVal,
        key:1
    };
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   let { val,readOnlyVal } = nextProps;
  //   if ( val != prevState.val || readOnlyVal != prevState.readOnly) {
  //     return {
  //       val,
  //       readOnly:readOnlyVal,
  //       key:Math.random()
  //     };
  //   }
  //   return null;
  // }
//   handleOnchange = (event)=>{
//     let { updateState } = this.props;
//     updateState && updateState({leftEditFlag: true});
//   }

  getTextAreaValue = () => {
      return this.ref.current.value;
  }


    render() {
        let { val, readOnly, key } = this.state;
        let { ...rest } = this.props;
        return (
        <textarea
            defaultValue={val}
            readOnly={readOnly}
            ref={this.ref}
            key={key}
            onChange={this.handleOnchange}
            {...rest}
        />);
    }
}

export default TextArea;