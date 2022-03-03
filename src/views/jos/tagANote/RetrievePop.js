import React,{Component} from 'react';
import { Popper,ClickAwayListener,Paper,Grid,Checkbox,List,ListItem,ListItemText,Collapse,ListItemIcon,Typography} from '@material-ui/core';
import {styles} from './clinicalNoteStyle';
import { withStyles } from '@material-ui/core/styles';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import {ExpandLess,ExpandMore } from '@material-ui/icons';
import '../common/css/commonStyle.css';

class RetrievePop extends Component {
  state={
    checkBoxList:[
      {label:'Current Assessment',value:'Current Assessment',checked:false,open:true,textName:'assessmentTextList'},
      // {label:'Chronic Problem',value:'Chronic Problem',checked:false,open:false,textName:'ChronicProblemTextList'},
      // {label:'Previous Dx',value:'Previous Dx',checked:false,open:false,textName:'previousDxTextList'},
      {label:'Chronic Problem & Previous Dx',value:'Chronic Problem & Previous Dx',checked:false,open:false,textName:'previousDxTextList'},
      {label:'Previous IOE',value:'Previous IOE',checked:false,open:false,textName:'previousIOETextList'},
      {label:'Previous MOE',value:'Previous MOE',checked:false,open:false,textName:'previousMOETextList'}
    ],
    copyType:'CA,CP,DX,IOE,MOE',
    detailOpen:false,
    // testList:[
    //   {label:'Current Assessment',value:'Height 180 cm',checked:false,open:false},
    //   {label:'Chronic Problem',value:'Weight 70 kg',checked:false,open:false},
    //   {label:'Previous Dx',value:'BMI 21.6 kg/m^2',checked:false,open:false},
    //   {label:'Previous IOE',value:'Pre-Pregnancy weight gain (BW) 67 kg Pre-pregnancy BMI: 20.7 kg/m(2)',checked:false,open:false}
    // ],
    checkBoxTextList:[[],[],[],[],[]]
  }

  handleCopy=()=>{
    const {onCopy,textList} = this.props;
    let assessmentChecked = this.state.checkBoxTextList[0];
    let chronicProblemChecked = this.state.checkBoxTextList[1];
    let previousDxChecked= this.state.checkBoxTextList[2];
    //let previousIOEChecked = this.state.checkBoxTextList[2];
    let previousMOEChecked = this.state.checkBoxTextList[3];
    let arr=[];

    textList[0].map((item,index)=>{
      if(assessmentChecked.indexOf(index)>-1){
        arr.push(item);
      }
    });
    textList[1][0].map((item,index)=>{
      if(chronicProblemChecked.indexOf(index)>-1){
        arr.push(item);
      }
    });
    textList[1][1].map((item,index)=>{
      if(previousDxChecked.indexOf(index)>-1){
        arr.push(item);
      }
    });
    // textList[2].map((item,index)=>{
    //   if(previousIOEChecked.indexOf(index)>-1){
    //     arr.push(item);
    //   }
    // });
    textList[3].map((item,index)=>{
      if(previousMOEChecked.indexOf(index)>-1){
        arr.push(item);
      }
    });
    let checkBoxTextList = [[],[],[],[],[],[]];
    onCopy&&onCopy(arr);
    this.setState({checkBoxTextList:checkBoxTextList});
  }

  // handleAllCopy=()=>{
  //   const {onCopy}=this.props;
  //   let {checkBoxList,copyType} = this.state;
  //   for(let item of checkBoxList){
  //     item['checked']= true;
  //   }
  //   // copyType = 'CA,CP,DX,IOE,MOE';
  //   this.setState({checkBoxList:checkBoxList,copyType:copyType});
  //   onCopy&&onCopy(copyType);
  // }

  handleItemSelectedAllChecked=(index,item)=>{
    const { checkBoxTextList } = this.state;
    const {textList} = this.props;
    if(index===1){
      return textList[1][0].length+textList[1][1].length>0?
      textList[1][0].length+textList[1][1].length===checkBoxTextList[1].length+checkBoxTextList[2].length:item.checked;
    } else {
      return textList[index].length>0?textList[index].length===checkBoxTextList[index].length:item.checked;
    }
  }

  handleSelectAll=()=>{
    let {textList} = this.props;
    let {checkBoxList,checkBoxTextList} = this.state;
    for(let index = 0;index<checkBoxList.length;index++) {
      if(index===1){
        if(textList[1][0].length>0||textList[1][1].length>0){
          checkBoxList[index].checked =true;
          checkBoxTextList[1] = textList[1][0].map((item,index)=>index);
        checkBoxTextList[2] = textList[1][1].map((item,index)=>index);
        }
      }else {
        if(textList[index].length>0){
          checkBoxList[index].checked =true;
          checkBoxTextList[index] = textList[index].map((item,index)=>index);
        }
      }
      this.setState({checkBoxList:checkBoxList,checkBoxTextList:checkBoxTextList});
    }
  }

  // handleDetailItem=(item)=>{
  //   const {onItemCopy}=this.props;
  //   onItemCopy&&onItemCopy(item);
  // }

  handleItemSelectedAllChange=(event,index)=>{
    let {checkBoxList} = this.state;
    checkBoxList[index].checked =event.target.checked;
    this.checkBoxSelectAllClick(event.target.checked,index);
    this.setState({checkBoxList:checkBoxList});
  }

  checkBoxSelectAllClick=(checked,index)=>{
    let {textList} = this.props;
    let {checkBoxTextList} = this.state;
      if(index===1){
        if(checked){
          checkBoxTextList[1] = textList[1][0].map((item,index)=>index);
          checkBoxTextList[2] = textList[1][1].map((item,index)=>index);
        }else{
          checkBoxTextList[1] = [];
          checkBoxTextList[2] = [];
        }

      }else{
        if(checked){
          checkBoxTextList[index] = textList[index].map((item,index)=>index);
        }else{
          checkBoxTextList[index] = [];
        }
      }
      this.setState({checkBoxTextList:checkBoxTextList});
  }

  handleDetailOpen=(index)=>{
    if (index !== 3) {
      let items = [...this.state.checkBoxList];
      items[index].open = !items[index].open;
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

  generateCPDX=(key)=>{
    if(key>0){
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
          <ListItem  key={key} button alignItems="flex-start" className={classes.listItem} >
            <Checkbox checked={checked}
                color="primary"
                id={`checkBox_CP_${key}`}
                onClick={event=>this.handleClick(event,1,key)}
            />
            <ListItemText
                classes={{
                  root: classes.textPadding
                }}
                primary={
                    <Typography className={classes.fontLabel} >
                        {item}
                    </Typography>
                }
            />
          </ListItem>
        );
      });
    }
    if(textList[1][1].length>0){
      CPDxCheckBoxList.push(
        <ListItem className={classes.listItem}>
          <ListItemText primary="Previous Diagnosis" />
        </ListItem>
      );
      textList[1][1].map((item,key)=>{
        const checked = this.state.checkBoxTextList[2].indexOf(key) !== -1;
        CPDxCheckBoxList.push(
          <ListItem  key={key} button alignItems="flex-start" className={classes.listItem} >
            <Checkbox checked={checked}
                color="primary"
                id={`checkBox_DX_${key}`}
                onClick={event=>this.handleClick(event,2,key)}
            />
            <ListItemText
                classes={{
                  root: classes.textPadding
                }}
                primary={
                    <Typography className={classes.fontLabel} >
                        {item}
                    </Typography>
                }
            />
          </ListItem>
        );
      });
    }
    return CPDxCheckBoxList;
  }



  render(){
    const {toggleRetrieve,targetEl,open,classes,textList}=this.props;
    // const {checkBoxTextList}=this.state;
    return (
      <Popper open={open} anchorEl={targetEl.current} placement={'bottom-end'} style={{zIndex:1000,width:'330px'}}>
        <Paper>
          <ClickAwayListener onClickAway={toggleRetrieve}>
            <List style={{maxHeight:'50vh',overflow:'auto'}}>
              {
                this.state.checkBoxList.map((item,index)=>{
                  let checked = this.handleItemSelectedAllChecked(index,item);
                  return (
                    <div  key={index}>
                      <ListItem button key={index} className={classes.listItem}>
                        <Checkbox color="primary" checked={checked}
                            id={`checkBox_${index}`}
                            onClick={(e)=>this.handleItemSelectedAllChange(e,index)}
                            inputProps={{
                              style:{
                                width:30
                              }
                            }}
                            classes={{
                              root:classes.checkbox_sty
                            }}
                            disabled={index===1?(textList[1][0].length+textList[1][1].length>0?false:true):(textList[index].length>0?false:true)}
                        />
                        <ListItemText
                            classes={{
                          root:classes.listItemText}}
                            primary={
                              <Typography className={(index===1?(textList[1][0].length+textList[1][1].length>0):(textList[index].length>0))?classes.fontLabel:classes.fontGrey} noWrap>
                                {item.label}
                              </Typography>
                            }
                            onClick={()=>this.handleDetailOpen(index)}
                        />
                        {index !== 3 ?
                          <ListItemIcon className={classes.listItemIcon} onClick={() => this.handleDetailOpen(index)}>
                            {
                              (index === 1 ? (textList[1][0].length + textList[1][1].length > 0) : (textList[index].length > 0)) ? (item.open ? <ExpandLess /> : <ExpandMore />) : null
                            }
                          </ListItemIcon> : null
                        }
                      </ListItem>
                      {(index===1?(textList[1][0].length+textList[1][1].length>0):(textList[index].length!==0))?
                      <Collapse in={item.open} timeout="auto" unmountOnExit style={{marginLeft:35,color: '#0579c8'}}>
                        <List component="div" disablePadding>
                          {/* <ListItem button className={classes.listSubheader} onClick={()=>this.handleCopy(copyType)}>Copy All</ListItem> */}
                          {
                            textList[index].map((item,key)=>{
                              const checked = this.checkBoxChecked(index,key);
                              return index===1?(this.generateCPDX(key)):(
                                // <ListItem  key={index} button className={classes.listItem} onClick={()=>this.handleDetailItem(item)}>
                                <ListItem  key={key} button alignItems="flex-start" className={classes.listItem} >
                                  <Checkbox checked={checked}
                                      color="primary"
                                      id={`checkBox_${index}${key}`}
                                      onClick={event=>this.handleClick(event,index,key)}
                                  />
                                  <ListItemText
                                      primary={
                                          <Typography className={classes.fontLabel} >
                                              {item.indexOf('kg/m^2')!==-1&&index===0?item.replace('kg/m^2',''):item}
                                              {item.indexOf('kg/m^2')!==-1&&index===0?(<span>kg/m<sup>2</sup></span>):null}
                                          </Typography>
                                      }
                                  />
                                  {/* {item} */}
                                </ListItem>
                              );
                            })
                          }
                        </List>
                      </Collapse>
                      :null}
                    </div>
                  );
                })
              }

              <Grid alignItems="center"
                  container
                  justify="flex-end"
              >
                <CIMSButton
                    classes={{
                      label:classes.fontLabel
                  }}
                    color="primary"
                    id="btn_retrieve_copy"
                    // onClick={() =>this.previousReport()}
                    size="small"
                    onClick={()=>this.handleCopy()}
                >
                  Copy
                </CIMSButton>
                <CIMSButton
                    classes={{
                      label:classes.fontLabel
                  }}
                    color="primary"
                    id="btn_retrieve_copy_all"
                    // onClick={() =>this.previousReport()}
                    size="small"
                    // onClick={()=>this.handleAllCopy()}
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
