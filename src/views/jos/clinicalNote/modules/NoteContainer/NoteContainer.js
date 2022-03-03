import React, { Component } from 'react';
import { withStyles, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Divider, ExpansionPanelActions } from '@material-ui/core';
import { styles } from './NoteContainerStyle';
import NoteInputArea from '../NoteInputArea/NoteInputArea';
import { ExpandMore } from '@material-ui/icons';
import * as clinicalNoteConstants from '../../../../../constants/clinicalNote/clinicalNoteConstants';
import NoteCard from '../NoteCard/NoteCard';
import { Notes } from '@material-ui/icons';
import { Grid, Tooltip, Fab } from '@material-ui/core';
import moment from 'moment';
import { COMMON_STYLE } from '../../../../../constants/commonStyleConstant';

class NoteContainer extends Component {
  constructor(props){
    super(props);
    let { noteObj } = this.props;
    let displayInputArea = this.handleInputAreaDisplay(noteObj);
    this.state={
      inputCount: displayInputArea?1:0,
      displayNoRecord:true
    };
  }

  //refresh add NoteInputArea component.
  componentWillReceiveProps(nextProps){
    if(nextProps.noteObj!==this.props.noteObj){
      let { noteObj } = nextProps;
      let displayInputArea = this.handleInputAreaDisplay(noteObj);
      this.setState({
        inputCount: displayInputArea?1:0,
        displayNoRecord:true
      });
    }
  }

  handleFabLogClick = (event,params) => {
    const { onLogClick } = this.props;
    onLogClick&&onLogClick(event,params);
  }

  onFabLogClick = (event,note) => {
    let { typeId, serviceCd, encounterId, createBy, logId} = note;
    let params = {
      encntrId:encounterId,
      svcCd:serviceCd,
      typeId:typeId,
      noteOwner:createBy,
      logId:logId?logId:null
    };
    this.handleFabLogClick(event,params);
  }

  generateNoteContents = (notes,allowCreateMulti,allowCreateOne, typeId) => {
    const { classes,editEncounterIds,originDrag,latestCursor,dispatch,seed,inputAreaValMap,topbarProps,isPastEncounter,pastNoteInfo,currentNoteInfo,updateState,isAddDivFlag,insertClinicalnoteLog,currentEditFlag,pastEditFlag,accessCheckIn,setPastTimeout,isShowClinicalType,errorFlag=false } = this.props;
    let contents = [];
    const isVaccinationCode = typeId === clinicalNoteConstants.CLINICAL_NOTE_TYPE_ID.VACCINATION;
    if (notes&&notes.length>0&&!(notes.length===1&&notes[0].isDelete==='Y'&&allowCreateMulti==='N')) {
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        let noteCardProps = {
          editEncounterIds,
          originDrag,
          dispatch,
          latestCursor,
          note,
          seed,
          inputAreaValMap,
          topbarProps,
          updateState,
          isPastEncounter,
          pastNoteInfo,
          currentNoteInfo,
          isAddDivFlag,
          notes,
          allowCreateMulti,
          allowCreateOne,
          handleFabLogClick:this.handleFabLogClick,
          insertClinicalnoteLog,
          currentEditFlag,
          pastEditFlag,
          accessCheckIn,
          setPastTimeout,
          isShowClinicalType,
          handleTextFieldFocus:this.handleTextFieldFocus
        };
        contents.push(
          <div key={`${note.clinicalnoteId}_${i}`}>
            <NoteCard {...noteCardProps} />
            <Divider />
          </div>
        );
      }
    } else {
      // No record
      if(notes.length===0){
        contents.push(
          <div key={`${Math.random()}`} className={classes.label} style={{padding: '5px 10px', display:this.state.displayNoRecord?'block':'none'}} >
            <label style={{ color: errorFlag && isVaccinationCode ? 'red': COMMON_STYLE.labelColor }}>{errorFlag && isVaccinationCode ? 'Fail to connect service.' : 'No Record'}</label>
          </div>
        );
      }else{
        let { createBy, createDtm, updateBy, updateDtm, isDelete='N', hideLogIcon='N' } = notes[0];
        contents.push(
          <Grid container className={classes.noteContentContainer} style={{display:this.state.displayNoRecord?'flex':'none'}}>
            <Grid className={classes.noteContentTitle} xs={12} md={10}  style={{display:'flex'}}>
              <div key={`${Math.random()}`} className={classes.label}>
                {
                    hideLogIcon === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES && isDelete === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES?(
                      <>
                        <label className={isDelete === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES?classes.noteContentCreateUserDeleteLabel:classes.noteContentCreateUserLabel}>{createBy}</label>
                        <label className={classes.noteContentCreateDtmLabel}>{moment(createDtm).format('DD-MMM-YYYY HH:mm')}</label>
                        <label className={classes.noteContentOtherUpdateDtmLabel}>{`(deleted by ${updateBy} on ${moment(updateDtm).format('DD-MMM-YYYY HH:mm')})`}</label>
                      </>
                    ):
                  <label style={{ color: errorFlag && isVaccinationCode ? 'red': COMMON_STYLE.labelColor }}>{errorFlag && isVaccinationCode ? 'Fail to connect service.' : 'No Record'}</label>
                }
              </div>
            </Grid>
            <Grid container item xs={12} md={2} direction="row" justify="flex-end" alignItems="center" style={{display:'flex'}}>
              {hideLogIcon === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES ? null :(
                <Grid item>
                  <Tooltip title="Log" classes={{tooltip:classes.tooltip}}>
                    <Fab
                        size="small"
                        color="primary"
                        id={`btn_clinical_note_log_${notes[0].clinicalnoteId}`}
                        className={classes.primaryFab}
                        onClick={(e)=>{this.onFabLogClick(e,notes[0]);}}
                    >
                      <Notes className={classes.fabIcon} />
                    </Fab >
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </Grid>
        );
      }
    }
    return (<div style={{width:'100%'}}>{contents}</div>);
  }

  handleNoRecordDragOver = (event) => {
    this.dropZone && this.dropZone.handleAddDragOver && this.dropZone.handleAddDragOver(event);
  }

  handleNoRecordDrop = (event) => {
    this.dropZone && this.dropZone.handleAddDrop && this.dropZone.handleAddDrop(event);
  }

  handleInputAreaDisplay = (noteObj) => {
    let { notes, allowCreateOne,allowCreateMulti } = noteObj;
    let flag = false;
    if ((allowCreateMulti === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES) ||
    (allowCreateOne === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES&&notes.length === 0) ||
    (allowCreateOne === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES&&allowCreateMulti === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.NO&&(notes.length === 1&&notes[0].isDelete==='Y'))) {
      flag = true;
    }
    return flag;
  }

  generateDefaultValObj = (noteId,encounterId,noteTypeId) => {
    const { params } = this.props;
    let obj ={
      allowEdit: clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES,
      clinicalnoteId: noteId,
      encounterId,
      typeId: noteTypeId,
      userRoleTypeCd: params.userRoleType,
      serviceCd: params.currentServiceCd,
      patientKey: params.patientKey,
      clinicalnoteText: '',
      encounterDate: params.currentEncounterDate,
      encounterType: params.currentEncounterTypeCd,
      createClinicCd: params.currentClinicCd,
      createBy: params.currentloginName,
      createDtm: null,
      updateClinicCd: null,
      updateBy: null,
      updateDtm: null,
      version: null
    };
    return obj;
  }

  handleTextFieldFocus = (id,encounterId,noteId,noteTypeId) => {
    let { inputAreaValMap,params,updateState,noteObj } = this.props;
    if (!inputAreaValMap.has(encounterId)) {
      let valObj = this.generateDefaultValObj(noteId,params.currentEncounterId,noteTypeId);
      let tempMap = new Map();
      inputAreaValMap.set(encounterId,tempMap.set(noteId,valObj));
    } else {
      let noteValMap = inputAreaValMap.get(encounterId);
      if (!noteValMap.has(noteId)) {
        let valObj = this.generateDefaultValObj(noteId,params.currentEncounterId,noteTypeId);
        noteValMap.set(noteId,valObj);
      }
    }
    updateState&&updateState({
      latestCursor:id,
      inputAreaValMap
    });
    if (noteObj.allowCreateMulti === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES) {
      this.setState({
        inputCount:this.state.inputCount+1,
        displayNoRecord: false
      });
    } else {
      this.setState({
        displayNoRecord: false
      });
    }
  }

  handleCreateNoteChange = (value,noteId,encounterId) => {
    let { isPastEncounter,inputAreaValMap,updateState,editEncounterIds } = this.props;
    let tempMap = inputAreaValMap.get(encounterId);
    let valObj = tempMap.get(noteId);
    valObj.clinicalnoteText = value;
    valObj.actionType = clinicalNoteConstants.ACTION_TYPE.INSERT;
    let updateObj = {
      inputAreaValMap,
      editEncounterIds:editEncounterIds.add(encounterId)
    };
    if (isPastEncounter) {
      updateObj.isPastRecordEdit = true;
    }
    updateState&&updateState(updateObj);
    // updateState&&updateState({
    //   inputAreaValMap,
    //   editEncounterIds:editEncounterIds.add(encounterId)
    //   // isRecordEdit:true
    // });
  }

  handleGenerateInputArea = (noteObj) => {
    const {isPastEncounter,originDrag,latestCursor,classes,seed,topbarProps,encounterId,updateState,isAddDivFlag,insertClinicalnoteLog,currentEditFlag,pastEditFlag,accessCheckIn,setPastTimeout,isShowClinicalType } = this.props;
    let { inputCount } = this.state;
    let elements =[];
    for (let i = 0; i < inputCount; i++) {
      let inputAreaCreateOneProps = {
        isPastEncounter,
        originDrag,
        updateState,
        topbarProps,
        latestCursor,
        encounterId,
        key:`${seed}_${noteObj.typeId}_${i}`,
        id:`${seed}_${noteObj.typeId}_${i}`,
        noteTypeId:noteObj.typeId,
        noteId:`C_${encounterId}_${noteObj.typeId}_${i}`,
        mode:clinicalNoteConstants.ACTION_TYPE.INSERT,
        typeId:noteObj.typeId,
        onChange:this.handleCreateNoteChange,
        handleTextFieldFocus:this.handleTextFieldFocus,
        insertClinicalnoteLog,
        currentEditFlag,
        pastEditFlag,
        accessCheckIn,
        setPastTimeout,
        clinicalnoteId:noteObj.clinicalnoteId
      };
      elements.push(
        <div id="clinical_Note_TextFiled" key={`input_area_${i}`}>
          <Divider />
          {isShowClinicalType ? null:
          <ExpansionPanelActions className={classes.border} style={{padding:currentEditFlag&&currentEditFlag!=='N'&&!isPastEncounter?0:8}}>
            {!isAddDivFlag?<NoteInputArea onRef={this.onRef} {...inputAreaCreateOneProps} />:null}
          </ExpansionPanelActions>
          }
        </div>
      );
    }
    return (<div>{elements}</div>);
  }

  onRef = (ref) => {
    this.dropZone = ref;
  }

  render() {
    const { classes,isPastEncounter,noteObj,isShowClinicalType } = this.props;
    let { typeDesc,notes,allowCreateMulti,allowCreateOne, typeId } = noteObj;
    let noteContents = this.generateNoteContents(notes,allowCreateMulti,allowCreateOne, typeId);
    let inputAreas = this.handleGenerateInputArea(noteObj);
    return (
      <ExpansionPanel defaultExpanded style={{marginTop:0,marginBottom:10,backgroundColor:isPastEncounter?styles.pastBackgroud.backgroundColor:styles.currentBackgroud.backgroundColor}}>
        <ExpansionPanelSummary
            classes={{
              root:classes.expansionPanelSummaryRoot,
              expandIcon:classes.expansionPanelSummaryIcon
            }}
            expandIcon={<ExpandMore />}
        >
          <label className={classes.expansionPanelSummaryLabel}>{typeDesc}</label>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.border}>{noteContents}</ExpansionPanelDetails>
        {isShowClinicalType ? null : inputAreas}
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(NoteContainer);
