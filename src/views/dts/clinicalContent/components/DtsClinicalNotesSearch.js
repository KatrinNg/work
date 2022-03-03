/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Switch, FormControlLabel } from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CardContent,
  Typography
} from '@material-ui/core';
import { Grid, Box, Paper } from '@material-ui/core';
import moment from 'moment';
import ReactQuill from 'react-quill'; // ES6
import { getNotesAndProcedures } from '../../../../store/actions/dts/clinicalContent/encounterAction';
import DtsEditor from './clinicalNoteComp/DtsEditor';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import { axios } from '../../../../services/axiosInstance';
import FormGroup from '@material-ui/core/FormGroup';
import Enum from '../../../../enums/enum';
const styles = (theme) => ({
  root: {
    width: 300,
    '& > * + *': {
      marginTop: theme.spacing(3)
    }
  },
  content: {
    height: 'calc(100vh - 305px)',
    overflow: 'auto'
  },
  panelSize: {
    height: '60px',
    width: '80%'
  },
   encounterContent: {
    height: 'calc(100vh - 340px)',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: 0
  }
});

let ClinicalNoteViewList_sRow = 1;
let ClinicalNoteViewList_eRow = 5;
let ClinicalNoteViewList_rowInterval = 5;

class DtsClinicalNotesSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showProcedure: false,
      page: 0,
      rowsPerPage: 10,
      clinicalNotesAndProceduresState:[],
      listNotOwnSpecialityId:[],
      listNotShowsOwnClinicId:[],
      listNotShowsNotesProcedures:[],
      isNoData: false,
      isShowingNotesProcedures: false,
      isOwnClinicOnly: false,
      isOwnSpecialityOnly: false
    };
  }

  componentDidMount(prevProps) {
    const { classes, latestEncounter, ...rest } = this.props;

    if (latestEncounter && latestEncounter.encntrId != null) {
      this.props.getNotesAndProcedures({
        patientKey: this.props.patientInfo.patientKey,
        sRow: ClinicalNoteViewList_sRow,
        eRow: ClinicalNoteViewList_eRow
      });

      //this.setState({clinicalNotesAndProceduresState: this.props.notesAndProceduresList });


    }
  }

  componentDidUpdate(prevProps) {

     if(this.props.notesAndProceduresList != prevProps.notesAndProceduresList) {

       this.setState({clinicalNotesAndProceduresState: this.props.notesAndProceduresList});

       if(this.props.notesAndProceduresList.length < ClinicalNoteViewList_rowInterval) {

         this.setState({ isNoData: true });

       } else {

         this.setState({ isNoData: false });
      }

      this.updateNotesProceduresListState(this.props.notesAndProceduresList);
       //this.loadNotesAndProcedures();

    //   this.setState({
    //     ClinicalNoteAndProceduresState: this.props.notesAndProceduresList
    //   });
    //   if (this.props.notesAndProceduresList.length < ClinicalNoteViewList_rowInterval) {
    //     this.setState({ isNoData: true });
    //   } else {
    //     this.setState({ isNoData: false });
    //   }

     }
  }


  componentWillUnmount() {
      ClinicalNoteViewList_sRow = 1;
      ClinicalNoteViewList_eRow = 5;
      ClinicalNoteViewList_rowInterval = 5;
  }

  loadNotesAndProcedures =() => {

      this.setState({clinicalNotesAndProceduresState: this.props.notesAndProceduresList});
      if (this.props.notesAndProceduresList.length < ClinicalNoteViewList_rowInterval) {
        this.setState({ isNoData: true });
      } else {
        this.setState({ isNoData: false });
      }

      this.updateNotesProceduresListState(this.props.notesAndProceduresList);

  }

  handleChangePage = (event, newPage) => {
    this.setState({ page: newPage });
    //setPage(newPage);
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: +event.target.value });
    this.setPage(0);
    //setRowsPerPage(+event.target.value);
    //setPage(0);
  };

  getNotesAndProceduresText = (clinicalNoteDetailDtoList) => {
    let clinicalNoteDetailText = '';

    for (let i = 0; i < clinicalNoteDetailDtoList.length; i++) {
      clinicalNoteDetailText += clinicalNoteDetailDtoList[i].clinicalnoteText;
    }

    return clinicalNoteDetailText;
  };

  getEncounterTitle = (notesAndProceduresList) => {
    const { currentEncounter, latestEncounter, roomList, ...rest } = this.props;

    let encounterTitle;


    let encounterType = this.props.encounterTypes.find(
      (item) => item.encntrTypeId === notesAndProceduresList.encounterTypeId
    ).encntrTypeDesc;

     let roomCd = roomList.find((item) => item.rmId === notesAndProceduresList.rmId).rmCd;


    encounterTitle = encounterType + ' / ' + notesAndProceduresList.createClinicCd;

    return encounterTitle;
  };

  convert2Json = (text) => {
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  };

  getEditorProps = (clinicalNote) => {
    let editorProps;
    let readOnly = true;

    let note = clinicalNote;

    editorProps = {
      note,
      readOnly
    };

    return editorProps;
  };


  handleClickSeeMore =() =>{

    const { currentEncounter, latestEncounter, notesAndProceduresList,...rest } = this.props;

    ClinicalNoteViewList_sRow = ClinicalNoteViewList_sRow + ClinicalNoteViewList_rowInterval;
    ClinicalNoteViewList_eRow = ClinicalNoteViewList_eRow + ClinicalNoteViewList_rowInterval;
    axios
      .get(`/dts-cc/encounter/getMultiClinicalNoteAndProcedures?patientKey=${latestEncounter.patientKey}&sRow=${ClinicalNoteViewList_sRow}&eRow=${ClinicalNoteViewList_eRow}`)
      .then(response => {
        if (response.data.respCode === 0) {
          let data = response.data.data;
          if (data.length != 0) {
            let clinicalNotesAndProceduresState = this.state.clinicalNotesAndProceduresState;
            clinicalNotesAndProceduresState = clinicalNotesAndProceduresState.concat(data);
            this.setState({
              clinicalNotesAndProceduresState: clinicalNotesAndProceduresState
            });
            this.updateNotesProceduresListState(clinicalNotesAndProceduresState);
            //this.updateDateClinicalNoteState(ClinicalNoteAndProceduresState);
            if (data.length < ClinicalNoteViewList_rowInterval) {
              this.setState({ isNoData: false });
            }
          } else {
            this.setState({ isNoData: true });
          }
        }
      });
  }

  updateDateClinicalNoteState =() => {



  }

  handleShowNotesProceduresToogle =(e) =>{


    let toogleNotesProcedures = this.state.isShowingNotesProcedures;

    if(toogleNotesProcedures){
      this.setState({isShowingNotesProcedures: false});
    }else{
      this.setState({isShowingNotesProcedures: true});
    }

  }

  handleShowOwnClinicToogle =(e) =>{

    let listNotOwnSpecialityId = this.state.listNotOwnSpecialityId;
    let listNotShowsOwnClinicId = this.state.listNotOwnClinicId;

    console.log('Hin listNotShowsOwnClinicId: ' + listNotShowsOwnClinicId);

    let toogleOwnClinicList = this.state.isOwnClinicOnly;
    let toogleOwnSpecialityList = this.state.isOwnSpecialityOnly;


    if(toogleOwnClinicList){
      this.filterNotesProcedcuresViewList(listNotShowsOwnClinicId, listNotOwnSpecialityId, 'dts-cc-notesProcedures-view-id', toogleOwnSpecialityList , 'block');
      this.setState({isOwnClinicOnly: false});
    }else{
      this.filterNotesProcedcuresViewList(listNotShowsOwnClinicId, listNotOwnSpecialityId, 'dts-cc-notesProcedures-view-id', toogleOwnSpecialityList , 'none');
      this.setState({isOwnClinicOnly: true});
    }

  }

  handleShowOwnSpeciality =(e) => {

    let listNotOwnSpecialityId = this.state.listNotOwnSpecialityId;
    let listNotShowsOwnClinicId = this.state.listNotOwnClinicId;


    let toogleOwnClinicList = this.state.isOwnClinicOnly;
    let toogleOwnSpecialityList = this.state.isOwnSpecialityOnly;

    if(toogleOwnSpecialityList){
      this.filterNotesProcedcuresViewList(listNotOwnSpecialityId, listNotShowsOwnClinicId, 'dts-cc-notesProcedures-view-id', toogleOwnClinicList , 'block');
      this.setState({isOwnSpecialityOnly: false});
    }else{
      this.filterNotesProcedcuresViewList(listNotOwnSpecialityId, listNotShowsOwnClinicId, 'dts-cc-notesProcedures-view-id', toogleOwnClinicList , 'none');
      this.setState({isOwnSpecialityOnly: true});
    }
}


  // getNotesAndProceduresList =(row, idx, classes) =>{
  //   return (
  //     <React.Fragment key={'clinicalNote' + row}>
  //       {this.getEncounterTitle(row) + ' ' + moment(row.encounterDate).format(Enum.DATE_FORMAT_EDMY_VALUE)}
  //          <div style={{
  //               border: '1px solid rgba(224, 224, 224, 1)',
  //               marginBottom: '10px',
  //               width: '100%'}}
  //          >
  //             <DtsEditor {...this.getEditorProps(row)} />
  //         </div>
  //   </React.Fragment>

  //   );

  // }

 filterNotesProcedcuresViewList(list1, list2, type, toogle2, action) {
    let i;
    for (i = 0; i < list1.length; i++) {
        if (!toogle2) {
          console.log('Hin filterNotesProcedcuresViewList: ', type + '_' + list1[i]);

            document.getElementById(type + '_' + list1[i]).style.display = action;
        } else {
            if (!list2.includes(list1[i])) {
            document.getElementById(type + '_' + list1[i]).style.display = action;
            }
        }
    }
}

updateNotesProceduresListState = (data) => {
    this.setState({
      isOwnClinicOnly: false,
      isOwnSpecialityOnly: false
    });
    let listNotOwnSpecialityId = [];
    let listNotOwnClinicId = [];
    let i;

    let clinicCd = this.props.clinicList.find(item => item.siteId == this.props.latestEncounter.siteId).clinicCd;
    let specialityCd = this.props.roomList.find(item => item.sspecId == this.props.latestEncounter.sspecId).sspecId;

    for (i = 0; i < data.length; i++) {



      for(let j = 0; j< data[i].clinicalNoteDetailDtoList.length; j++){

        console.log('Hin data.clinicalNoteDetailDtoList: ', data[i].clinicalNoteDetailDtoList[j]);
        console.log('Hin this.props.latestEncounter.sspecId: ', this.props.latestEncounter.sspecId);
        console.log('Hin data[i].clinicalNoteDetailDtoList[j].sspecId: ', data[i].clinicalNoteDetailDtoList[j].sspecId);
        console.log('Hin this.props.latestEncounter.clinicCd: ', clinicCd);
        console.log('Hin data[i].clinicalNoteDetailDtoList[j].createClinicCd: ', data[i].clinicalNoteDetailDtoList[j].createClinicCd);

        if (!(data[i].clinicalNoteDetailDtoList[j].createClinicCd == clinicCd)) {
          console.log('Hin pushed');
          listNotOwnClinicId.push(data[i].clinicalNoteDetailDtoList[j].encounterId);
        }
        if (!(data[i].clinicalNoteDetailDtoList[j].sspecId == this.props.latestEncounter.sspecId)) {
          console.log('Hin  also');
          listNotOwnSpecialityId.push(data[i].clinicalNoteDetailDtoList[j].encounterId);
        }
      }


    }
    this.setState({
      listNotOwnSpecialityId: listNotOwnSpecialityId,
      listNotOwnClinicId: listNotOwnClinicId
    });
  };

  render() {
    const { classes, notesAndProceduresList, latestEncounter, clinicList, ...rest } = this.props;
    const {isNoData} = this.state;

    const table_header = {
      paddingTop: 20,
      paddingLeft: 10,
      width: 1750 * 0.5
    };

    const table_footer = {
      paddingTop: 20,
      paddingBottom: 70,
      width: 1750 * 0.5
    };

    const clinicalNotesAndProceduresState = this.state.clinicalNotesAndProceduresState;
    //const clinicalNotesAndProceduresState = this.state.clinicalNotesAndProceduresState;
    const getShowDataBtn = this.state.isNoData;
    const labNoMoreData = 'NO MORE DATA!';

    let clinicCd = this.props.clinicList.find(item => item.siteId == latestEncounter.siteId).clinicCd;
    let specialityCd = this.props.roomList.find(item => item.sspecId == latestEncounter.sspecId).sspecCd;

    // let clinicalNotesAndProceduresList = getcnPViewDataSet.map((pcState, i) => {
    //   let encntrId = pcState.perioChartDto.encntrId;
    //     return (<div key={i}><PerioChartView onClick={this.handleOnClickPrintSel} pcState={pcState} chartNum={i} uuid={getPCViewTypeForId + '_' + encntrId}/></div>);
    // });


    let footer = (getShowDataBtn) ? <td align="center">{labNoMoreData}</td> : <td align="center"><CIMSButton onClick={this.handleClickSeeMore}>See More</CIMSButton></td>;

    return (
      <div>
        <Grid container>
          <Grid item xs={12}>
            <Box component="div" p={0} m={2}>
              <FormControlLabel
                  control={
                      <Switch
                          onChange={this.handleShowOwnSpeciality}
                          checked={this.state.isShowingOwnSpeciality}
                          name="Own speciality"
                          color="primary"
                          size="small"
                      />
                    }
                  label="Own speciality"
                  labelPlacement="end"
              />
              <FormControlLabel
                  control={
                      <Switch
                          onChange={this.handleShowOwnClinicToogle}
                          checked={this.state.isShowingOwnClinic}
                          name="ownClinic"
                          color="primary"
                          size="small"
                      />
                    }
                  label="Own clinic"
                  labelPlacement="end"
              />
                <FormControlLabel
                    control={
                      <Switch
                          onChange={this.handleShowNotesProceduresToogle}
                          checked={this.state.isShowingNotesProcedures}
                          name="showProcedure"
                          color="primary"
                          size="small"
                      />
                    }
                    label="Show Procedures"
                    labelPlacement="end"
                />
            </Box>


          </Grid>
          <CardContent  id="contentRef" className={classes.encounterContent} >
          <Grid item xs={12}>

             <Box p={1} m={1} style={{ paddingBottom: '0px' }}>
              {clinicalNotesAndProceduresState && clinicalNotesAndProceduresState.map((row, index) => {
                  return (
                      <React.Fragment key={'clinicalNotesProcedure' + row}>

                            {row.clinicalNoteDetailDtoList.map((clinicalNote, clinicalNoteIndex) => {

                                return (
                                  <div id={'dts-cc-notesProcedures-view-id_' + clinicalNote.encounterId} key={index}>
                                    <React.Fragment key={'clinicalNote' + clinicalNote}>

                                        {moment(clinicalNote.encounterDate).format(Enum.DATE_FORMAT_EDMY_VALUE) + ' / ' + this.getEncounterTitle(row.clinicalNoteDetailDtoList[clinicalNoteIndex]) + ' '}


                                        <div style={{
                                              border: '1px solid rgba(224, 224, 224, 1)',
                                              marginBottom: '10px',
                                              width: '100%'}}
                                        >
                                          <DtsEditor {...this.getEditorProps(clinicalNote)} />
                                        </div>

                                        <div>
                                          <Collapse in={this.state.isShowingNotesProcedures} collapsedHeight={50} timeout="auto" unmountOnExit>
                                            Procedures:
                                            {/* {
                                                <ListItem key button className={classes.nested} dense>
                                                  <ListItemText
                                                      classes={{ primary: classes.list_text }}
                                                      primary={
                                                      <span className={classes.primaryText}>
                                                        {row.procedureText}
                                                      </span>
                                                    }
                                                      secondary={
                                                        <div
                                                            style={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            maxWidth: '90%'
                                                          }}
                                                        >
                                                          <Typography
                                                              component="span"
                                                              variant="body2"
                                                              color="textPrimary"
                                                          >
                                                            {row.encounterProcedureList.ProblemText}
                                                          </Typography>
                                                        </div>
                                                    }
                                                  />
                                                </ListItem>
                                            } */}
                                          </Collapse>
                                        </div>



                                      </React.Fragment>




                                  </div>

                                );
                            })
                        }

                      </React.Fragment>
                  );
                })}
            </Box>


          </Grid>
            <table style={table_footer}>
                    <tr>
                      {footer}
                    </tr>
                </table>

        </CardContent>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  // console.log(state.dtsAppointmentAttendance.patientKey);

  return {
    latestEncounter: state.clinicalContentEncounter.latestEncounter,
    notesAndProceduresList: state.clinicalContentEncounter.notesAndProceduresList,
    patientInfo: state.patient.patientInfo,
    encounterTypes: state.common.encounterTypes,
    clinicList: state.common.clinicList,
    roomList: state.common.rooms
  };
};

const mapDispatchToProps = {
  getNotesAndProcedures
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DtsClinicalNotesSearch));

