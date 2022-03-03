import React from 'react';
import { Grid,Button,ButtonGroup } from '@material-ui/core';
import {ArrowDropDown} from '@material-ui/icons';
import TemplatePop from './TemplatePop';

const Topbar=({onClick,templates,toggleTemplate,templateOpen,maxHeight,classes})=>{
  const anchorRef = React.useRef(null);
  return(
    <Grid style={{ position: 'relative'}}>
      <ButtonGroup size="small" style={{ height: 33, marginTop: 10,marginBottom:5 }}>
        <Button style={{ textTransform: 'none', height: 'inherit' }} onClick={toggleTemplate} ref={anchorRef}>Template<ArrowDropDown /></Button>
      </ButtonGroup>
      <TemplatePop classes={classes} onClick={onClick} templates={templates} targetEl={anchorRef} open={templateOpen} toggleTemplate={toggleTemplate} maxHeight={maxHeight} />
    </Grid>
  );
};

export default Topbar;
