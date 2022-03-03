import React from 'react';

const type=(ob)=>{
    return Object.prototype.toString.call(ob).slice(8, -1).toLowerCase();
};


const ClickEventProvider =({children,onClick})=>{
  const renderChildren=(child,index)=>{
    if(type(child)=='object'&&child.props){
      let {children,eventvalue,...rest}=child.props;
      let ref=child.ref;
      if(eventvalue){
        return <child.type {...rest} ref={ref} children={renderChildren(children)} onClick={(e)=>{onClick&&onClick(eventvalue,e);}} key={index}/>;
      }else{
        return <child.type {...rest} ref={ref} children={renderChildren(children)} key={index}/>;
      }
    }else if(type(child)=='array'){
      return child.map((item,i)=>{
        return renderChildren(item,i);
      });
    }else{
      return child;
    }
  };
  return <>{renderChildren(children)}</>;
};

export default ClickEventProvider;
