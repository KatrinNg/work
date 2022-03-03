import React from 'react';
import { Grid,Typography} from '@material-ui/core';
import CIMSButton from '../../consultation/dxpx/components/CIMSButton';

const style={
  height:'44px',
  lineHeight:'44px',
  flex:'0 0 auto',
  borderTop:'1px solid #e6e6e6',
  padding:'0 12px',
  overflow:'hiddent'
  // button:{
  //   border:'1px solid #0579C8',
  //   borderRadius: 5,
  //   color:'#0579C8',
  //   backgroundColor: '#FFFFFF',
  //   padding: 3,
  //   // fontSize: 14,
  //   '&:hover': {
  //     color: '#FFFFFF',
  //     backgroundColor:'#0579C8'
  //   }
  // }
};

const Bottombar=({onClean,onSave})=>{
  return (
    <Grid item xs={12} container justify="flex-end" style={style}>
      <Typography component="div">
        <CIMSButton onClick={onSave}>Save</CIMSButton>
        <CIMSButton onClick={onClean}>Cancel</CIMSButton>
      </Typography>
    </Grid>
  );
};

export default Bottombar;
