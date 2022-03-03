import React,{Component} from 'react';
import {Select,MenuItem} from '@material-ui/core';


class JSeleteServiceList extends Component {
  constructor(props){
    super(props);
    const {value,options=[],children=[]}=props;
    this.state={
      value:value||(options.length?options[0].value:children.length?children[0].props.value:''),
      options:this.props.options
    };
  }
  componentDidMount(){
    const {onChange,value,name}=this.props;
    if(name==='Service'){
      onChange&&value&&onChange(name,value);
    }
    // onChange&&value&&onChange(value);
  }
  UNSAFE_componentWillReceiveProps(nextProp){

    if(nextProp.options!==this.state.options){
      const {value,options=[],children=[]}=nextProp;
      if(value!==undefined&&value!==''){
        this.setState({value});
      }
      else if(options.length||children.length){
        this.setState({value:options.length?options[0].value:children[0].value});
      }
      this.setState({options:options});
    }
    if(nextProp.value != this.state.value){
      this.setState({value:nextProp.value});
    }
  }
  handleChange=(e)=>{
    const {onChange, pastNoteChange, name}=this.props;
    this.setState({value:!pastNoteChange?e.target.value:this.state.value});
    onChange&&onChange(name,e.target.value);
  }
  render(){
    const { children, classes, ...rest } = this.props;
    const { options = [], value } = this.state;
    return (
      <Select {...rest} onChange={this.handleChange} value={value}
          classes={{disabled:classes.grayFont}}
      >
        {options.length?options.map(item=>{
          return (<MenuItem classes={{root:classes.backgroundColorFont}} key={item.value} value={item.value}>{item.title}</MenuItem>);
        }):children}
      </Select>
    );
  }
}

export default JSeleteServiceList;
