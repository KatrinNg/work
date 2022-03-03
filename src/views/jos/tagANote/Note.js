import React,{Component} from 'react';
import { Grid,TextField } from '@material-ui/core';

class Note extends Component{
  constructor(props) {
    super(props);
    const {value=''}=this.props;
    this.state = {
      content:value
    };
  }

  componentWillReceiveProps(nextProps){
    const {value=''}=nextProps;
    if(value!==this.state.content){
      this.setState({content:value});
    }
  }

  handleFocus=()=>{
    const {onFocus,noteType}=this.props;
    onFocus&&onFocus(noteType);
  }

  handleChange=(e)=>{
    const {onChange,noteType}=this.props;
    let value=e.target.value;
    this.setState({content:value});
    onChange&&onChange(value,noteType);
  }
  render(){
    const {title,id,handleDragOver,handleDrop,...res}=this.props;
    return (
      <Grid item {...res}>
        <TextField
            id={id}
            label={title}
            value={this.state.content} onFocus={this.handleFocus} onChange={this.handleChange}   multiline rows={1} variant="outlined" style={{width:'100%',height:'100%'}}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        />
      </Grid>
    );
  }
}

export default Note;
