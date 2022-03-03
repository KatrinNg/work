import React,{Component} from 'react';
import Box from './components/Box';
import { withStyles, Grid,FormControl,FormControlLabel,Checkbox, Avatar,Tooltip} from '@material-ui/core';
import SearchSelect from './components/SearchSelect';
import {debounce} from 'lodash';
import moment from 'moment';
// import { COMMON_STYLE } from '../../../constants/commonStyleConstant';
import { styles } from './clinicalNoteStyle';
import MultipleSelect from './components/MultipleSelect';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import CommonTable from '../../jos/common/component/CommonTable';

const outerTheme = createMuiTheme({ palette: { secondary: { main: '#E57736' } } });

const Filter=({serviceOptions,encounterTypeOptions,noteTypeOptions,currentService,selectedEncounterTypes,selectedNoteTypes,tagNoteCheckedFlag,clinicOptions,currentClinic,clinicIsDisabled,handleServiceChange,handleEncounterTypeChange,handleNoteTypeChange,handleShowTagNoteChange,handleClincChange,isPastRecordEdit,classes})=>{
  return(
    <Grid container spacing={2} style={{padding:'12px 12px',width:400}}>
      {/* Service */}
      <Grid item xs={5} style={{paddingTop:0,paddingBottom:0}}>
        <FormControl id={'clincalNote_service_select'} style={{width:'100%'}}>
          <SearchSelect name={'Service'} id={'clincalNote_service_select'} options={serviceOptions} value={currentService} onChange={handleServiceChange} isPastRecordEdit={isPastRecordEdit}/>
        </FormControl>
      </Grid>
      {/* Clinc */}
      <Grid item xs={4} style={{paddingTop:0,paddingBottom:0}}>
        <FormControl id={'clincalNote_clinic_select'} style={{width:'100%'}}>
          <SearchSelect name={'Clinic'} id={'clincalNote_clinic_select'} options={clinicOptions} value={currentClinic} onChange={handleClincChange} clinicIsDisabled={clinicIsDisabled} isPastRecordEdit={isPastRecordEdit}/>
        </FormControl>
      </Grid>
       {/* Show Tag a Note */}
      <Grid item xs={3} style={{padding:'0 0',paddingTop:0,paddingBottom:0}}>
        <MuiThemeProvider theme={outerTheme}>
          <FormControl id={'clincalNote_show_tag_a_note'} style={{width:'100%'}}>
            <FormControlLabel
                classes={{label:classes.checkBox_label}}
                control={
                  <Checkbox
                      id="clincalNote_show_tag_a_note_checkbox"
                      checked={tagNoteCheckedFlag}
                      onChange={handleShowTagNoteChange}
                      classes={{root:classes.showTagNote_checkbox}}
                  />
                }
                label={<label style={{marginLeft:20}}>Show EIN</label>}
                labelPlacement="top"
            />
          </FormControl>
        </MuiThemeProvider>
      </Grid>
      {/* Encounter Type */}
      <Grid item xs={6} style={{paddingTop:0,paddingBottom:0}}>
        <FormControl id={'clincalNote_encounter_type_select'} style={{width:'100%'}}>
          <MultipleSelect name={'Encounter Type'} id="encounter_type" options={encounterTypeOptions} value={selectedEncounterTypes} onChange={handleEncounterTypeChange} isPastRecordEdit={isPastRecordEdit}/>
        </FormControl>
      </Grid>
      {/* Note Type */}
      <Grid item xs={6} style={{paddingTop:0,paddingBottom:0}}>
        <FormControl id={'clincalNote_note_type_select'} style={{width:'100%'}}>
          <MultipleSelect name={'Note Type'} id="note_type" options={noteTypeOptions} value={selectedNoteTypes} onChange={handleNoteTypeChange} isPastRecordEdit={isPastRecordEdit}/>
        </FormControl>
      </Grid>
    </Grid>
  );
};

const List=({data,wrapperContentHeight,onSelectionChange,selected,multiSelectheight,classes,tagNoteCheckedFlag,noteTypes,currentService,errorFlag})=>{
  function turnToDescription(params) {
    let result = '';
    noteTypes.forEach(element => {
      if(element.shortName === params){
        result = element.value;
      }
    });
    return result;
  }
  const headers =[
    {
      title:'Date & Clinic',
      headerStyle: {width:102, ...styles.tableHead},
      cellStyle:{padding:'1px 7px',height:38}
    },
    {
      title:tagNoteCheckedFlag?'Encounter Type / Note Description':'Encounter Type',
      cellStyle:{padding:'1px 7px'},
      headerStyle: { zIndex:1, ...styles.tableHead},
      colSpan:2
    }
  ];

  const tSplit=[
    {
      name:'encounterDate',
      cellStyle:{padding:'1px 7px',height:38},
      render:record=>{
        return (
          <div>
            <p className={classes.mainLabel}>{moment(record.encounterDate).format('DD-MMM-YYYY')}</p>
            <div className={classes.subLabel}>{currentService == 'ALL'? record.serviceCd + ' - ' + record.clinicCd:record.clinicCd}</div>
          </div>
        );
      }
    },
    {
      name:'encounterTypeShortName',
      cellStyle:{padding:'1px 7px',verticalAlign:'top'},
      render: record => {
        return (
          <div className={classes.encounterTypeShortName}>
            {tagNoteCheckedFlag?(
              <div>
                <span>{record.encounterId != 0?record.encounterTypeDescription:record.noteDescription}</span>
              </div>):record.encounterTypeDescription}
          </div>
        );
      }
    },
    {
      name:'encounterId',
      cellStyle:{padding:'1px 7px 1px 10px',width:104,textAlign:'right'},
      render: record => {
        let icons = record.showIcons || [];
        let iconElements=[];
        if(record.encounterId == 0 ) {
          return (<Chip size="small" classes={{labelSmall: classes.sizeSmall, outlined: classes.chipOutlined}} label={'EIN'} variant="outlined" />);
        }else{
            if(icons.length<=4){
                for (let index = 0; index <4-icons.length;index++) {
                    iconElements.push(<div  className={classes.whiteAvatar}></div>);
                }
                icons.forEach((item,index) => {
                     iconElements.push(<Tooltip key={index} title={turnToDescription(item)}><Avatar  className={classes.noteTypeAvatarLeft}>{item}</Avatar></Tooltip>);
                });
            }else{
            let row=1;
            icons.forEach((item,index) => {
                if(row%2!=0){
                    iconElements.push(<Tooltip key={index} title={turnToDescription(item)}><Avatar  className={classes.noteTypeAvatarLeft}>{item}</Avatar></Tooltip>);
                }else{
                    iconElements.push(<Tooltip key={index} title={turnToDescription(item)}><Avatar  className={classes.noteTypeAvatar}>{item}</Avatar></Tooltip>);
                }
                if((index+1)%4===0){
                   row++;
                }
            });
            }
        }
 		return iconElements;
      }
    }
  ];
  const options={
    maxBodyHeight:(wrapperContentHeight-149-multiSelectheight)||'undefined'
    // headerStyle:{ color: '#ffffff',backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,fontWeight:600,fontSize:'1rem',fontFamily:'Arial'}
  };
  return (
    <CommonTable
        id="medical_table"
        tSplit={tSplit}
        data={data}
        headers={headers}
        options={options}
        onSelectionChange={onSelectionChange}
        selected={selected}
        errorFlag={errorFlag}
    />
  );
};

class MedicalRecord extends Component{
  constructor(props) {
    super(props);
    this.boxContent=React.createRef();
    this.state={};
  }

  componentDidMount(){
    this.resetHeight();
    window.addEventListener('resize',this.resetHeight);
  }

  componentWillUnmount(){
    window.removeEventListener('resize',this.resetHeight);
  }

  resetHeight=debounce(()=>{
    // Gets the screen height to calculate the height of the table
    let screenHeight = document.documentElement.clientHeight;
    if (screenHeight > 0) {
      let contentHeight = screenHeight - 270;
      this.setState({height: contentHeight });
    }
    if(document.getElementById('note_type_control')&&document.getElementById('encounter_type_control')){
      if(((document.getElementById('note_type_control').clientHeight-54)+(document.getElementById('encounter_type_control').clientHeight-54))!==this.state.multiSelectheight){
        this.setState({
          multiSelectheight:(document.getElementById('note_type_control').clientHeight-54)+(document.getElementById('encounter_type_control').clientHeight-54)
        });
      }
    }
  },500);

  render() {
    const {medicalRecords=[],height,onSelectionChange,historySelected,...rest}=this.props;
    let  realSelectHeight = this.state.multiSelectheight;
    return (
      <Box ref={this.boxContent} title={'Note History'} height={height} >
        <Filter {...rest}/>
        <List
            selected={historySelected}
            data={medicalRecords}
            wrapperContentHeight={this.state.height}
            onSelectionChange={onSelectionChange}
            multiSelectheight={realSelectHeight}
            {...rest}
        />
      </Box>
    );
  }
}

export default withStyles(styles)(MedicalRecord);
