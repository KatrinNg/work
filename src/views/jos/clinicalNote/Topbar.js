import React from 'react';
import { Grid,Button,ButtonGroup } from '@material-ui/core';
import {ArrowDropDown} from '@material-ui/icons';
import TemplatePop from './TemplatePop';
import RetrievePop from './RetrievePop';
const style={
  // height:'33px',
  lineHeight:'33px',
  flex:'none',
  // borderBottom:'1px solid #e6e6e6',
  // padding:'0 12px',
  position:'relative',
  minWidth:560,
  marginBottom: 5
};
const tools=['°C','°F','↑','↓','√','×','±'];
const Topbar = (
  {
    onCopy,
    onClick,
    templates,
    toggleTemplate,
    templateOpen,
    retrieveOpen,
    toggleRetrieve,
    loginInfo,
    assessmentTextList,
    previousCurrentMoeTextList,
    previousSAAMTextList,
    previousHMTextList,
    chronicProblemTextList,
    previousDxTextList,
    previousIOETextList,
    // previousMOETextList,
    isPastEncounter,
    insertClinicalnoteLog,
    topbarProps
  }) => {
  const textList = [
    assessmentTextList,
    [chronicProblemTextList, previousDxTextList],
    previousIOETextList,
    previousCurrentMoeTextList,
    previousSAAMTextList,
    previousHMTextList
    // previousMOETextList
  ];

  const anchorRef = React.useRef(null);
  return(
    <Grid item container xs={12} style={style}>
      <Grid item xs={12} md={6}>
        <label style={{fontWeight: 'bold'}}>{loginInfo.loginName}</label>
      </Grid>
      <Grid item container justify="flex-end" xs={12} md={6} >
          <ButtonGroup size="small" style={{height:33}}>
            {
              tools.map(item=>{
                return <Button key={item} style={{height:'inherit'}} onClick={()=>{onClick(item,null);}}>{item}</Button>;
              })
            }
            {!isPastEncounter?<Button style={{textTransfolabrm:'none', height:'inherit', textTransform:'none'}} onClick={toggleRetrieve} ref={anchorRef}>Retrieve<ArrowDropDown /></Button>:''}
            <Button style={{textTransform:'none',height:'inherit'}} onClick={toggleTemplate} ref={anchorRef}>Template<ArrowDropDown /></Button>
          </ButtonGroup>
        {!isPastEncounter?<RetrievePop onCopy={onCopy} targetEl={anchorRef} open={retrieveOpen} toggleRetrieve={toggleRetrieve} textList={textList} insertClinicalnoteLog={insertClinicalnoteLog} topbarProps={topbarProps} />:''}
        <TemplatePop onClick={onClick} templates={templates} targetEl={anchorRef} open={templateOpen} toggleTemplate={toggleTemplate}/>
      </Grid>
    </Grid>
  );
};

export default Topbar;
