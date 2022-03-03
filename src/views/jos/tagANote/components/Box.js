import React from 'react';
import {getState} from '../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};

const Box=({title,height,children,contentRef})=>{
  return (
    <div style={{width:'100%',height:height||'auto'}}>
      <div style={{lineHeight:'32px',padding:'0 12px',fontWeight:'bold'}}>{title}</div>
      <div ref={contentRef} style={{backgroundColor:color.cimsBackgroundColor,borderTop:'1px solid rgba(0,0,0,.5)',height:'calc(100% - 34px)',overflow:'hidden'}}>{children}</div>
    </div>
  );
};

export default React.forwardRef((props,ref)=>{
  return <Box {...props} contentRef={ref} />;
});
