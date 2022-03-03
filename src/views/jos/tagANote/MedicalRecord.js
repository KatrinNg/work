import React,{Component} from 'react';
import Box from './components/Box';
import { withStyles, Grid, FormControl, InputLabel, FormControlLabel, Checkbox, Avatar, MuiThemeProvider, createMuiTheme, Chip, Tooltip } from '@material-ui/core';
import JSeleteServiceList from './JSeleteServiceList';
import {debounce} from 'lodash';
import moment from 'moment';
// import { COMMON_STYLE } from '../../../constants/commonStyleConstant';
import { styles } from './clinicalNoteStyle';
import CommonTable from '../../jos/common/component/CommonTable';
import Enum from '../../../../src/enums/enum';
import MultipleSelect from './components/MultipleSelect';

const outerTheme = createMuiTheme({ palette: { secondary: { main: '#E57736' } } });
const Filter = ({
  disabledClinic,
  serviceOptions,
  currentService,
  tagNoteCheckedFlag,
  handleServiceChange,
  clinicOptions,
  handleClinicChange,
  currentClinicCd,
  handleShowTagNoteChange,
  classes,
  pastNoteChange,
  tagANoteTypesList,
  noteTypeOptions,
  handleNoteTypeChange
}) => {
  return(
    <Grid container spacing={2} className={classes.medicalGrid}>
      {/* Service */}
      <Grid item xs={6}>
        <FormControl id={'clincalNote_service_select'} className={classes.medicalFormControl}>
          <InputLabel>Service</InputLabel>
          <JSeleteServiceList name={'Service'} options={serviceOptions} pastNoteChange={pastNoteChange} value={currentService} onChange={handleServiceChange} classes={classes}/>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <FormControl id={'clincalNote_clinic_select'} className={classes.medicalFormControl}>
          <InputLabel>Clinic</InputLabel>
          <JSeleteServiceList name={'Clinic'} options={clinicOptions} pastNoteChange={pastNoteChange} value={currentClinicCd} onChange={handleClinicChange} disabled={disabledClinic} classes={classes} />
        </FormControl>
      </Grid>
      {/* Note Type */}
      <Grid item xs={6} style={{ paddingTop: 0, paddingBottom: 10 }}>
        <FormControl id={'clincalNote_note_type_select'} className={classes.medicalFormControl}>
          <MultipleSelect name={'Note Type'} id="tagANote_note_type" options={tagANoteTypesList} value={noteTypeOptions} onChange={handleNoteTypeChange} />
        </FormControl>
      </Grid>
      {/* Show Tag a Note */}
      <Grid item xs={6} style={{paddingTop:0,paddingBottom:10}}>
        <FormControl id={'clincalNote_show_tag_a_note'} className={classes.medicalFormControl}>
          {/* TODO */}
          <MuiThemeProvider theme={outerTheme}>
            <FormControlLabel
                classes={{ label: classes.tagnote_checkBox_label }}
                control={
                <Checkbox id="clincalNote_show_tag_a_note_checkbox"
                    checked={tagNoteCheckedFlag}
                    onChange={handleShowTagNoteChange}
                    classes={{ root: classes.showTagNote_checkbox }}
                />
              }
                label={<label style={{ marginLeft: 50 }}>Show Clinical Note</label>}
                labelPlacement="top"
            />
          </MuiThemeProvider>
        </FormControl>
      </Grid>
    </Grid>
  );
};

const List=({data,wrapperContentHeight,onSelectionChange,selected,classes,tagNoteCheckedFlag,noteTypes,errorFlag})=>{
  function turnToDescription(params) {
    let result = '';
    noteTypes.forEach(element => {
      if(element.typeShortDesc === params){
        result = element.typeDesc;
      }
    });
    return result;
  }

  const headers =[
    {
      title:'Date & Service',
      headerStyle: { width: 113, ...styles.tableHead },
      cellStyle:{padding:'1px 7px',height:38}
    },
    {
      title:tagNoteCheckedFlag?'Encounter Type / Note Description':'Note Description',
      cellStyle:{padding:'1px 7px'},
      headerStyle: { zIndex: 1, ...styles.tableHead },
      colSpan:2
    }
  ];

  const tSplit=[
    {
      name:'encounterDate',
      cellStyle:{padding:'1px 7px',height:38},
      render: record => {
        return (
          <div>
            <p className={classes.tSplitDivP}>{moment(record.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE)}</p>
            <div className={classes.tSplitDivPDiv}>{record.serviceCd}</div>
          </div>);
      }
    },
    {
      name:'noteDescription',
      cellStyle:{padding:'1px 7px',verticalAlign:'top'},
      render: record => {
        if(tagNoteCheckedFlag){
          if (record.encounterTypeId == 0) {
            return <div><span style={{fontWeight:'bold',wordBreak:'break-word'}}>{record.noteDescription}</span></div>;
          } else {
            return <div><span style={{fontWeight:'bold',wordBreak:'break-word'}}>{record.encounterTypeDesc}</span></div>;
          }
        }else{
          return <span style={{fontWeight:'bold',fontSize:16,wordBreak:'break-word'}}>{record.noteDescription}</span>;
        }
      }
    },
    {
      name:'showIcons',
      cellStyle:{padding:'1px 7px 1px 10px',width:104,textAlign:'right'},
      render: record => {
        let icons = record.showIcons || null;
        let iconElements =[];
        if (icons !== null) {
          let iconStr = icons.split(',');
          if(iconStr.length<=4){
                for (let index = 0; index <4-iconStr.length;index++) {
                    iconElements.push(<div  className={classes.whiteAvatar}></div>);
                }
                iconStr.forEach((item,index) => {
                    iconElements.push(<Tooltip key={index} title={turnToDescription(item)}><Avatar  className={classes.noteTypeAvatarLeft}>{item}</Avatar></Tooltip>);
                });
            }else{
                 let row=1;
                iconStr.forEach((item,index) => {
                    if(row%2!=0){
                        iconElements.push(<Tooltip key={item} title={turnToDescription(item)}><Avatar  className={classes.noteTypeAvatarLeft}>{item}</Avatar></Tooltip>);
                    }else{
                        iconElements.push(<Tooltip key={item} title={turnToDescription(item)}><Avatar  className={classes.noteTypeAvatar}>{item}</Avatar></Tooltip>);
                    }
                    if((index+1)%4===0){
                        row++;
                    }
                });
            }
            return iconElements;
        }else {
          if(tagNoteCheckedFlag && record.encounterId == 0 ) {
            return (<Chip classes={{labelSmall: classes.sizeSmall}} size="small" style={{backgroundColor:'rgb(123, 193, 217)',color:'white'}} label="EIN" variant="outlined" />);
          }
        }
      }
    }
  ];
  const options={
    maxBodyHeight: wrapperContentHeight- 118 || 'undefined'
    // draggable: false,//会影响tips的style
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
    this.boxContent = React.createRef();
    this.state={};
  }

  componentDidMount(){
    this.resetHeight();
    window.addEventListener('resize', this.debounceResetHeight);
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.debounceResetHeight);
  }

  resetHeight = () => {
    let windowHeight = window.innerHeight;
    let boxOffsetTop = this.boxContent.current.getBoundingClientRect().top;
    let boxHeight = windowHeight - boxOffsetTop;

    this.setState({
      height: boxHeight
    });
  };

  debounceResetHeight = debounce(this.resetHeight, 300);

  render() {
    const {medicalRecords=[],height,onSelectionChange,historySelected,...rest}=this.props;
    return (
      <Box ref={this.boxContent} title={'Encounter Independent Note History List'} height={height} >
        <Filter {...rest}/>
        <List
            selected={historySelected}
            data={medicalRecords}
            wrapperContentHeight={this.state.height}
            onSelectionChange={onSelectionChange}
            {...rest}
        />
      </Box>
    );
  }
}

export default withStyles(styles)(MedicalRecord);
