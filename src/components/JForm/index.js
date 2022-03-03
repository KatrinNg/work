import React from 'react';
import {FormControl,InputLabel,Grid} from '@material-ui/core';

export default function Form({onSubmit,children,maxWidth,...rest}){
  const handleSubmit=(e)=>{
    let form=e.target;
    let formData={};
    for (let i=0;i<form.length;i++){
      let name=form[i].name;
      if(name){
        formData[name]=form[name].value;
      }
    }
    e.preventDefault();
    onSubmit(formData,e);
  };

  const isNeedLabel=(item)=>{
    if(item.props){
      return !item.props['no-need-input-label'];
    }
    return false;
  };
  return (
    <form onSubmit={handleSubmit} {...rest} >
      <Grid container spacing={4}>
      {
        children.map((item,index)=>{
          if (typeof item === 'string') {
            return false;
          } else if (typeof item === 'object') {
            if(!item){return false;}
          } else if (typeof item === 'boolean') {
            return false;
          }
          return (
            <Grid item lg={2} md={3} xs={4} key={index} style={{maxWidth:item.props.maxWidth!==undefined?item.props.maxWidth:maxWidth,flexBasis:item.props.flexBasis!==undefined?item.props.flexBasis:'',paddingRight:item.props.paddingRight!==undefined?item.props.paddingRight:''}}>
            <FormControl style={{minWidth:item.props.minWidth!==undefined?item.props.maxWidth:'120px',width:'100%'}}>
              {isNeedLabel(item)&&<InputLabel>{item.props.label}</InputLabel>}
              <item.type {...item.props}/>
            </FormControl>
            </Grid>
          );
        })
      }
      </Grid>
    </form>
  );
}
