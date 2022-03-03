import React,{Component} from 'react';
import {Select,MenuItem,FormControl} from '@material-ui/core';

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     formControl: {
//       margin: theme.spacing(1),
//       minWidth: 120
//     },
//     selectEmpty: {
//       marginTop: theme.spacing(2)
//     }
//   })
// );

class CustomizedSelect extends Component {
  constructor(props){
    super(props);
    const {value,options=[],children=[]}=props;
    this.state={
      value:value||(options.length?options[0].value:children.length?children[0].props.value:''),
      options:this.props.options
    };
  }
  componentDidMount(){
    const {onChange,value}=this.props;
    onChange&&value&&onChange(value);
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
  }
  handleChange=(e)=>{
    const {onChange}=this.props;
    this.setState({value:e.target.value});
    onChange&&onChange(e.target.value,e);
  }
  render(){
    const { children, ...rest} = this.props;
    const { options = [], value } = this.state;
    return (
      <Select {...rest} variant="filled" onChange={this.handleChange} value={value}>
        {options.length?options.map(item=>{
          return (<MenuItem key={item.value} value={item.value}>{item.title}</MenuItem>);
        }):children}
      </Select>
    );
  }
}

export default CustomizedSelect;
