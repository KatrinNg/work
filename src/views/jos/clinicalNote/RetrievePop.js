import React,{Component} from 'react';
import { Popper,ClickAwayListener,Paper,Grid,Checkbox,List,ListItem,ListItemText,Collapse,ListItemIcon,Typography,FormControlLabel} from '@material-ui/core';
import {styles} from './clinicalNoteStyle';
import { withStyles } from '@material-ui/core/styles';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import {ExpandLess,ExpandMore } from '@material-ui/icons';
import '../common/css/commonStyle.css';

class RetrievePop extends Component {
  state={
    checkBoxList:[
      {label:'Current Assessment',value:'Current Assessment',checked:false,open:true,textName:'assessmentTextList'},
      {label:'Chronic Problem & Current Problem',value:'Chronic Problem & Previous Problem',checked:false,open:false,textName:'previousDxTextList'},
      {label:'Previous IOE',value:'Previous IOE',checked:false,open:false,textName:'previousIOETextList'},
      {label:'Current MOE',value:'Current MOE',checked:false,open:false,textName:'currentMOETextList'},
      {label:'Current Structured Alert',value:'Current Structured Alert',checked:false,open:false,textName:'currentSAAMTextList'},
      {label:'Medical Histories',value:'Current Medical History',checked:false,open:false,textName:'currentHMTextList'}
      // {label:'Previous MOE',value:'Previous MOE',checked:false,open:false,textName:'previousMOETextList'}
    ],
    copyType:'CA,CP,DX,IOE,MOE,CURMOE',
    detailOpen:false,
    checkBoxTextList:[[],[],[],[],[],[]]
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    let { open } = this.props;
    if (open !== nextProps.open) {
      this.setState({
        checkBoxList:[
          {label:'Current Assessment',value:'Current Assessment',checked:false,open:true,textName:'assessmentTextList'},
          {label:'Chronic Problem & Current Problem',value:'Chronic Problem & Previous Problem',checked:false,open:false,textName:'previousDxTextList'},
          {label:'Previous IOE',value:'Previous IOE',checked:false,open:false,textName:'previousIOETextList'},
          {label:'Current MOE',value:'Current MOE',checked:false,open:false,textName:'currentMOETextList'},
          {label:'Current Structured Alert',value:'Current Structured Alert',checked:false,open:false,textName:'currentSAAMTextList'},
          {label:'Medical Histories',value:'Current Medical History',checked:false,open:false,textName:'currentHMTextList'}
          // {label:'Previous MOE',value:'Previous MOE',checked:false,open:false,textName:'previousMOETextList'}
        ],
        copyType:'CA,CP,DX,IOE,MOE,CURMOE',
        detailOpen:false,
        checkBoxTextList:[[],[],[],[],[],[]]
      });
    }
  }

  handleCopy=()=>{
    const {onCopy,textList} = this.props;
    let { insertClinicalnoteLog,topbarProps } = this.props;
    let { encounterId, patientKey} = topbarProps;
    let assessmentChecked = this.state.checkBoxTextList[0];
    let chronicProblemChecked = this.state.checkBoxTextList[1];
    let previousDxChecked= this.state.checkBoxTextList[2];
    let currentMOEChecked = this.state.checkBoxTextList[3];
    let previousSAAMChecked=this.state.checkBoxTextList[4];
    let previousHMChecked=this.state.checkBoxTextList[5];
    let arr=[];
    let arrNameItem=[];

    textList[0].map((item,index)=>{
      if(assessmentChecked.indexOf(index)>-1){
        arr.push(item);
      }
    });
    if(assessmentChecked.length>0){
      arrNameItem.push('Current Assessment');
    }
    if(chronicProblemChecked.length>0){
      arr.push('Chronic Problem(s)');
      arrNameItem.push('Chronic Problem & Current Problem');
    }
    textList[1][0].map((item,index)=>{
      if(chronicProblemChecked.indexOf(index)>-1){
        arr.push(item);
      }
    });
    if(previousDxChecked.length>0){
      arr.push('Current Problem');
      arrNameItem.push('Current Problem');
    }
    textList[1][1].map((item,index)=>{
      if(previousDxChecked.indexOf(index)>-1){
        arr.push(item);
      }
    });

    if(currentMOEChecked.length>0){
      arr.push('Current MOE:');
      arrNameItem.push('Current MOE:');
    }

    textList[3].map((item,index)=>{
      if(currentMOEChecked.indexOf(index) > -1) {
        arr.push(item);
      }
    });

    if(previousSAAMChecked.length>0){
      arr.push('Current Structured Alert:');
      arrNameItem.push('Current Structured Alert');
    }
    textList[4].map((item, index) => {
      if (previousSAAMChecked.indexOf(index) > -1) {
        arr.push(item);
      }
    });
    if(previousHMChecked.length>0){
      arrNameItem.push('Medical Histories');
    }
    textList[5].map((item, index) => {
      if (previousHMChecked.indexOf(index) > -1 && item) {
        arr.push(item);
      }
    });
    let name=`Action: Click 'Copy' button in 'Retrieve' drop-down,copied items: ${arrNameItem}, PMI:${patientKey}, EncounterId:${encounterId}`;
    insertClinicalnoteLog && insertClinicalnoteLog(name, '', 'Copied data: ' + arr);
    let checkBoxTextList = [[],[],[],[],[],[],[]];
    onCopy&&onCopy(arr);
    this.setState({checkBoxTextList:checkBoxTextList});
  }

  handleItemSelectedAllChecked = (index, item) => {
    const { checkBoxTextList } = this.state;
    const { textList } = this.props;
    if (index === 1) {
      return textList[1][0].length + textList[1][1].length > 0 ? textList[1][0].length + textList[1][1].length === checkBoxTextList[1].length + checkBoxTextList[2].length : item.checked;
    } else if(index === 5){
      let tempLength = 0;
      textList[index].map(item => item!='' ? tempLength++ : null);
      return textList[index].length > 0 ? tempLength === checkBoxTextList[index].length && tempLength !== 0: item.checked;
    }else {
      return textList[index].length > 0 ? textList[index].length === checkBoxTextList[index].length : item.checked;
    }
  }

  handleSelectAll=()=>{
    let {textList,insertClinicalnoteLog,topbarProps} = this.props;
    let {checkBoxList,checkBoxTextList} = this.state;
    let { encounterId, patientKey} = topbarProps;
    let name = `Action: Click 'Select All' button in 'Retrieve' drop-down, PMI:${patientKey}, EncounterId: ${encounterId}`;
    insertClinicalnoteLog && insertClinicalnoteLog(name, '');
    for (let checkBoxIndex = 0; checkBoxIndex < checkBoxList.length; checkBoxIndex++) {
      if (checkBoxIndex === 1) {
        if (textList[1][0].length > 0 || textList[1][1].length > 0) {
          checkBoxList[checkBoxIndex].checked = true;
          checkBoxTextList[1] = textList[1][0].map((item, index) => index);
          checkBoxTextList[2] = textList[1][1].map((item, index) => index);
        }
      } else if(checkBoxIndex === 5){
        if(this.calMedicalHistoryEmpty(textList[checkBoxIndex])) {
          let tempArray = [];
          textList[checkBoxIndex].map((item,index)=>item ? tempArray.push(index) : null);
          checkBoxTextList[checkBoxIndex] = tempArray;
          checkBoxList[checkBoxIndex].checked = true;
          // checkBoxTextList[checkBoxIndex] = textList[checkBoxIndex].map((item, index) => index);
        }
      } else {
        if (textList[checkBoxIndex].length > 0) {
          checkBoxList[checkBoxIndex].checked = true;
          checkBoxTextList[checkBoxIndex] = textList[checkBoxIndex].map((item, index) => index);
        }
      }
      this.setState({ checkBoxList: checkBoxList, checkBoxTextList: checkBoxTextList });
    }
  }

  handleItemSelectedAllChange=(event,index)=>{
    let {checkBoxList} = this.state;
    checkBoxList[index].checked =event.target.checked;
    this.checkBoxSelectAllClick(event.target.checked,index);
    this.setState({checkBoxList:checkBoxList});
  }

  checkBoxSelectAllClick=(checked,checkBoxIndex)=>{
    let {textList} = this.props;
    let {checkBoxTextList} = this.state;
      if(checkBoxIndex===1){
        if(checked){
          checkBoxTextList[1] = textList[1][0].map((item,index)=>index);
          checkBoxTextList[2] = textList[1][1].map((item,index)=>index);
        }else{
          checkBoxTextList[1] = [];
          checkBoxTextList[2] = [];
        }
      }else{
        if(checked){
          let tempArray = [];
          textList[checkBoxIndex].map((item,index)=> item ? tempArray.push(index) : null);
          checkBoxTextList[checkBoxIndex] = tempArray;
        }else{
          checkBoxTextList[checkBoxIndex] = [];
        }
      }
      this.setState({
        checkBoxTextList:checkBoxTextList
      });
  }

  handleDetailOpen=(index)=>{
    if (index !== 6) {
      let items = [...this.state.checkBoxList];
      if ( index === 4 ) {
        items[index].open = false;
      } else {
        items[index].open = !items[index].open;
      }
      this.setState({ checkBoxList: items });
    }
  }

  handleClick = (event, itemId,id) => {
    const { checkBoxTextList } = this.state;
    const selectedIndex = checkBoxTextList[itemId].indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(checkBoxTextList[itemId], id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(checkBoxTextList[itemId].slice(1));
    } else if (selectedIndex === checkBoxTextList[itemId].length - 1) {
      newSelected = newSelected.concat(checkBoxTextList[itemId].slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        checkBoxTextList[itemId].slice(0, selectedIndex),
        checkBoxTextList[itemId].slice(selectedIndex + 1)
      );
    }
    checkBoxTextList[itemId] = newSelected;
    this.setState({ checkBoxTextList: checkBoxTextList });
    // this.props.getSelectRow(newSelected);
  };

  checkBoxChecked = (index,rowId) => this.state.checkBoxTextList[index].indexOf(rowId) !== -1;

  generateCPDX=(paramKey)=>{
    if(paramKey>0){
      return ;
    }
    const { textList,classes } = this.props;
    let CPDxCheckBoxList = [];
    if(textList[1][0].length>0){
      CPDxCheckBoxList.push(
        <ListItem className={classes.listItem}>
          <ListItemText primary="Chronic Problem(s)" />
        </ListItem>
      );
      textList[1][0].map((item,key)=>{
        const checked = this.state.checkBoxTextList[1].indexOf(key) !== -1;
        CPDxCheckBoxList.push(
          <ListItem key={key} button alignItems="flex-start" className={classes.listItem} >
            <FormControlLabel
                control={
                <Checkbox
                    checked={checked}
                    color="primary"
                    id={`checkBox_CP_${key}`}
                    onClick={event => this.handleClick(event, 1, key)}
                />
              }
                classes={{ root: classes.textPadding }}
                className={classes.fontLabel}
                label={item}
            />
          </ListItem>
        );
      });
    }
    if(textList[1][1].length>0){
      CPDxCheckBoxList.push(
        <ListItem className={classes.listItem}>
          <ListItemText primary="Current Problem" />
        </ListItem>
      );
      textList[1][1].map((item,key)=>{
        const checked = this.state.checkBoxTextList[2].indexOf(key) !== -1;
        CPDxCheckBoxList.push(
          <ListItem  key={key} button alignItems="flex-start" className={classes.listItem} >
            <FormControlLabel
                control={
                <Checkbox
                    checked={checked}
                    color="primary"
                    id={`checkBox_DX_${key}`}
                    onClick={event => this.handleClick(event, 2, key)}
                />
              }
                classes={{ root: classes.textPadding }}
                className={classes.fontLabel}
                label={item}
            />
          </ListItem>
        );
      });
    }
    return CPDxCheckBoxList;
  }

  calMedicalHistoryEmpty = (data) => {
    let flag = false;
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if(element.trim() != '') {
        flag = true;
      }
    }
    return flag;
  }

  checkSelectBoxIsClick = () => {
    let { checkBoxTextList } = this.state;
    let flag = false;
    checkBoxTextList.map((item)=>{
      if(item.length > 0){
        flag = true;
      }
    });
    return flag ? false : true;
  }

  render(){
    const {toggleRetrieve,targetEl,open,classes,textList}=this.props;
    // const {checkBoxTextList}=this.state;
    return (
      <Popper open={open} anchorEl={targetEl.current} placement={'bottom'}  style={{zIndex:1000,width:'366px'}}>
        <Paper>
          <ClickAwayListener onClickAway={toggleRetrieve}>
            <List style={{maxHeight:'42vh',overflow:'auto'}}>
              {
                this.state.checkBoxList.map((item,index)=>{
                  //hide Previous IOE tab
                  if(index !== 2){
                    let checked = this.handleItemSelectedAllChecked(index,item);
                    return (
                      <div  key={index} style={{marginBottom:index!== 5?'unset':52}}>
                        <ListItem button key={index} className={classes.listItem}>
                          <Checkbox color="primary" checked={checked}
                              id={`checkBox_${index}`}
                              onClick={(e)=>this.handleItemSelectedAllChange(e,index)}
                              inputProps={{ style: { width: 30 } }}
                              classes={{ root: classes.checkbox_sty }}
                              disabled={index===1?(textList[1][0].length+textList[1][1].length>0?false:true):(index == 5 ? !this.calMedicalHistoryEmpty(textList[index]) : !textList[index].length > 0)}
                          />
                          <ListItemText
                              classes={{ root: classes.listItemText }}
                              primary={
                              <Typography className={(index === 1 ? (textList[1][0].length + textList[1][1].length > 0) : (index == 5 ? this.calMedicalHistoryEmpty(textList[index]) : textList[index].length > 0)) ? classes.fontLabel : classes.fontGrey} noWrap>
                                {item.label}
                              </Typography>
                            }
                              onClick={()=>this.handleDetailOpen(index)}
                          />
                          {/* {index !== 6 ? */}
                          <ListItemIcon className={classes.listItemIcon} onClick={() => this.handleDetailOpen(index)}>
                            {
                              ( index != 1 && index != 0 && index != 5) ? null :
                              (index === 1 ? ( textList[1][0].length + textList[1][1].length > 0) : (index == 5 ? this.calMedicalHistoryEmpty(textList[index]) : textList[index].length > 0)) ? (item.open ? <ExpandLess /> : <ExpandMore />) : null
                            }
                          </ListItemIcon>
                          {/* } */}
                        </ListItem>
                        {(index===1?(textList[1][0].length+textList[1][1].length>0):(index == 5 ? this.calMedicalHistoryEmpty(textList[index]) : (index != 3 && textList[index].length!==0)))?
                        <Collapse in={item.open} timeout="auto" unmountOnExit style={{marginLeft:35,color: '#0579c8'}}>
                          <List component="div" disablePadding>
                            {
                              textList[index].map((textListItem,key)=>{
                                let DXChecked = this.checkBoxChecked(index,key);
                                return index==1?(this.generateCPDX(key))
                                : index == 5 ? (
                                  <ListItem key={key} button alignItems="flex-start" className={classes.listItem} >
                                    <FormControlLabel
                                        control={
                                          <Checkbox
                                              checked={textListItem ? DXChecked : false}
                                              color="primary"
                                              id={`checkBox_${index}${key}`}
                                              onClick={event=> textListItem ? this.handleClick(event,index,key) : true}
                                              disabled={textListItem ? false : true}
                                          />
                                        }
                                        classes={{label: textListItem ? classes.fontLabel : classes.labelDisabled}}
                                        label={key == 0 ? 'Past Medical History': key == 1 ? 'Social History':key == 2 ? 'Occupational History': key == 3 ? 'Family History' : ''}
                                        disabled={textListItem ? false : true}

                                    />
                                  </ListItem>
                                ):
                                (
                                  <ListItem key={key} button alignItems="flex-start" className={classes.listItem} >
                                    <FormControlLabel
                                        control={
                                          <Checkbox
                                              checked={DXChecked}
                                              color="primary"
                                              id={`checkBox_${index}${key}`}
                                              onClick={event=>this.handleClick(event,index,key)}
                                          />
                                        }
                                        className={classes.fontLabel}
                                        label={textListItem.indexOf('kg/m^2') !== -1 && index === 0 ? textListItem.replace('kg/m^2', '') : textListItem}
                                    />
                                  </ListItem>
                                );
                              })
                            }
                          </List>
                        </Collapse>
                        :null}
                      </div>
                    );
                  }
                })
              }
              <Grid
                  alignItems="center"
                  container
                  justify="flex-end"
                  className={classes.popBottomGrid}
              >
                <CIMSButton
                    classes={{ label: classes.fontLabel, root: classes.btnRoot }}
                    color="primary"
                    id="btn_retrieve_copy"
                    size="small"
                    disabled={this.checkSelectBoxIsClick()}
                    onClick={()=>this.handleCopy()}
                >
                  Copy
                </CIMSButton>
                <CIMSButton
                    classes={{ label: classes.fontLabel, root: classes.btnRoot }}
                    color="primary"
                    id="btn_retrieve_copy_all"
                    size="small"
                    onClick={()=>this.handleSelectAll()}
                >
                  Select All
                </CIMSButton>
              </Grid>
            </List>
          </ClickAwayListener>
        </Paper>
      </Popper>
    );
  }
}

export default (withStyles)(styles)(RetrievePop);
