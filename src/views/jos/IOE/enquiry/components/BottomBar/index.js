import React from 'react';
import { withStyles } from '@material-ui/core/styles';
const styles={
  fixedBottom: {
    display:'flex',
    left:0,
    right:0,
    color: '#6e6e6e',
    position:'fixed',
    bottom: 0,
    width: '100%',
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-end'
  }
};

const BottomBar=({classes,children})=>{
  return (
    <div className={classes.fixedBottom}>
      {children}
    </div>
  );
};

export default withStyles(styles)(BottomBar);
