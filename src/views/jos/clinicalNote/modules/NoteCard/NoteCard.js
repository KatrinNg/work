import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, Grid, Tooltip, Fab } from '@material-ui/core';
import {styles} from './NoteCardStyle';
import moment from 'moment';
import { FileCopyOutlined, Edit, Notes } from '@material-ui/icons';
import * as clinicalNoteConstants from '../../../../../constants/clinicalNote/clinicalNoteConstants';
import NoteInputArea from '../NoteInputArea/NoteInputArea';
import EventEmitter from '../../../../../utilities/josCommonUtilties';
import * as messageType from '../../../../../store/actions/message/messageActionType';
import * as actionTypes from '../../../../../store/actions/clinicalNote/clinicalNoteActionType';
import * as commonConstants from '../../../../../constants/common/commonConstants';
import _ from 'lodash';

class NoteCard extends Component {
  constructor(props){
    super(props);
    this.state={
      noteIsEdit:false
    };
    this.copyFLag = {};
  }

  onFabLogClick = (event) => {
    const { handleFabLogClick, note, insertClinicalnoteLog, isPastEncounter } = this.props;
    let { typeId, serviceCd, encounterId, createBy, logId, clinicalnoteId} = note;
    let name='';
    if(isPastEncounter){
      name = 'Action: ' + commonConstants.INSERT_LOG_STATUS.Click + ' \'Log\' button in past encounter (Type ID: ' + typeId + '; Clinical Note ID:' + clinicalnoteId + ')';
    }else{
      name = 'Action: ' + commonConstants.INSERT_LOG_STATUS.Click + ' \'Log\' button in current encounter (Type ID: ' + typeId + '; Clinical Note ID:' + clinicalnoteId + ')';
    }
    insertClinicalnoteLog && insertClinicalnoteLog(name, '/clinical-note/clinicalNote');
    let params = {
      encntrId:encounterId,
      svcCd:serviceCd,
      typeId:typeId,
      noteOwner:createBy,
      logId:logId?logId:null
    };
    handleFabLogClick&&handleFabLogClick(event,params);
  }

  handleNoteUpdateChange = (value, noteId, encounterId) => {
    let { isPastEncounter,editEncounterIds,inputAreaValMap,updateState } = this.props;
    let tempMap = inputAreaValMap.get(encounterId);
    let valObj = tempMap.get(noteId);
    if(valObj.clinicalnoteText.trim() !== value.trim()){
      valObj.clinicalnoteText = value;
      if (valObj.version !== null) {
        valObj.actionType = clinicalNoteConstants.ACTION_TYPE.UPDATE;
      } else {
        valObj.actionType = clinicalNoteConstants.ACTION_TYPE.INSERT;
      }
    }
    let updateObj = {
      inputAreaValMap,
      editEncounterIds:editEncounterIds.add(encounterId)
    };
    if (isPastEncounter) {
      updateObj.isPastRecordEdit = true;
    }
    updateState&&updateState(updateObj);
  }

  generateDefaultValObj = (note) => {
    let obj ={
      allowEdit: note.allowEdit,
      clinicalnoteId: note.clinicalnoteId,
      encounterId: note.encounterId,
      typeId: note.typeId,
      userRoleTypeCd: note.userRoleTypeCd,
      serviceCd: note.serviceCd,
      patientKey: note.patientKey,
      clinicalnoteText: note.clinicalnoteText,
      encounterDate: note.encounterDate,
      encounterType: note.encounterType,
      createClinicCd: note.createClinicCd,
      createBy: note.createBy,
      createDtm: note.createDtm,
      updateClinicCd: note.updateClinicCd,
      updateBy: note.updateBy,
      updateDtm: note.updateDtm,
      version: note.version
    };
    return obj;
  }

  accessCheckIn = (encounterId,id,inputAreaValMap) =>{
    let { dispatch, loginInfo, updateState, setPastTimeout, isPastEncounter } = this.props;
    let { userDto } = loginInfo;
    let params = {
      appCode:'Clinicalnote',
      encounterId,
      loginName:userDto.loginName
    };
    dispatch({
      type:actionTypes.ACCESS_CHECK_IN,
      params,
      callback: data => {
        if(_.toUpper(userDto.loginName) === _.toUpper(data.data)){
          if(isPastEncounter) {
            updateState&&updateState({
              latestCursor: id,
              inputAreaValMap,
              pastEditFlag:''
            });
          }else {
            updateState&&updateState({
              latestCursor: id,
              inputAreaValMap,
              currentEditFlag:''
            });
          }
          this.setState({noteIsEdit:true});
          setPastTimeout&&setPastTimeout(encounterId);
        }else{
          if(isPastEncounter) {
            updateState&&updateState({
              pastEditFlag:data.data
            });
          } else{
            updateState&&updateState({
              currentEditFlag:data.data
            });
          }
          if(isPastEncounter){
            dispatch({
              type:messageType.OPEN_COMMON_MESSAGE,
              payload:{
                msgCode: data.msgCode,
                btnActions: {
                  btn1Click: () => {
                  }
                },
                params:[
                  {name:'userId',value:data.data}
                ]
              }
            });
          }
        }
      }
    });
  }

  handleEditClick = (id) => {
    let { inputAreaValMap, note, insertClinicalnoteLog, isPastEncounter, patientInfo } = this.props;
    let { patientKey } = patientInfo;
    let { encounterId,clinicalnoteId,typeId } = note;
    let tempInputAreaValMap = _.cloneDeep(inputAreaValMap);
    let name='';
    if(isPastEncounter){
      name = 'Action: ' + commonConstants.INSERT_LOG_STATUS.Click + ' \'Edit\' button in past encounter (Type ID: ' + typeId + '; Clinical Note ID:' + clinicalnoteId + '), PMI: ' + patientKey + ', EncounterId: ' + encounterId + '';
    }else{
      name = 'Action: ' + commonConstants.INSERT_LOG_STATUS.Click + ' \'Edit\' button in current encounter (Type ID: ' + typeId + '; Clinical Note ID:' + clinicalnoteId + '), PMI: ' + patientKey + ', EncounterId: ' + encounterId + '';
    }
    insertClinicalnoteLog && insertClinicalnoteLog(name, '/clinical-note/clinicalNote');
    if (!tempInputAreaValMap.has(encounterId)) {
      let valObj = this.generateDefaultValObj(note);
      let tempMap = new Map();
      tempInputAreaValMap.set(encounterId,tempMap.set(clinicalnoteId,valObj));
    } else {
      let noteValMap = tempInputAreaValMap.get(encounterId);
      if (!noteValMap.has(clinicalnoteId)) {
        let valObj = this.generateDefaultValObj(note);
        noteValMap.set(clinicalnoteId,valObj);
      }
    }
    this.accessCheckIn(encounterId,id,tempInputAreaValMap);
  }

  handleCopy = (val) => {
    let { note, insertClinicalnoteLog, isPastEncounter, patientInfo } = this.props;
    let { encounterId, clinicalnoteId, typeId } = note;
    let { patientKey } = patientInfo;
    let name='';
    let value ='';
    if(isPastEncounter){
      name = 'Action: ' + commonConstants.INSERT_LOG_STATUS.Click + ' \'Copy\' button in past encounter  (Type ID: ' + typeId + '; From Clinical Note ID: ' + clinicalnoteId + '),PMI: ' + patientKey + ', EncounterId: ' + encounterId + '';
      let vals = val != undefined ? val : note.clinicalnoteText;
      value = 'For both Past Encounter: ' + vals;
    }else{
      name = 'Action: ' + commonConstants.INSERT_LOG_STATUS.Click + ' \'Copy\' button in current encounter  (Type ID: ' + typeId + '; From Clinical Note ID: ' + clinicalnoteId + '),PMI: ' + patientKey + ', EncounterId: ' + encounterId + '';
      let vals = val != undefined ? val : note.clinicalnoteText;
      value = 'For current Past Encounter: ' + vals;
    }
    insertClinicalnoteLog && insertClinicalnoteLog(name, '/clinical-note/clinicalNote', value);
    if(isPastEncounter) {
      let {flag, isCopy = false } = this.copyReadModeData();
      if(isCopy){
        if(!flag){
          EventEmitter.emit('clinical_note_copy',{copyNoteContent:val?val:note.clinicalnoteText});
        }else{
          setTimeout(() => {
            EventEmitter.emit('clinical_note_copy',{copyNoteContent:val?val:note.clinicalnoteText});
          },2000);
        }
      }
    }else {
      EventEmitter.emit('clinical_note_copy',{copyNoteContent:val?val:note.clinicalnoteText});
    }
  }

  copyReadModeData = () => {
    let { note, currentNoteInfo, pastNoteInfo, inputAreaValMap, isPastEncounter } = this.props;
    let flag = false;
    let resultNoteType = '';
    let resultElement;
    let targetClinicalNoteId;
    let realCurrentNoteInfo = isPastEncounter?pastNoteInfo:currentNoteInfo;
    let realPastNoteInfo = isPastEncounter?currentNoteInfo:pastNoteInfo;
    let isCopy = true;
    //只有一条数据能被编辑且只能新增一条
    if(this.caculInputAreaValMapCount(inputAreaValMap)<1){
      outer:
      for (let index = 0; index < realCurrentNoteInfo.contents.length; index++) {
        let currentElement = realCurrentNoteInfo.contents[index];
        for (let elementIndex = 0; elementIndex < currentElement.notes.length; elementIndex++) {
          if(currentElement.notes[elementIndex].clinicalnoteId === note.clinicalnoteId){
            resultElement = currentElement;
            resultNoteType = currentElement.typeShortDesc;
            break outer;
          }
        }
      }
      let oneElement;
      let tagetDom;
      for (let index = 0; index < realPastNoteInfo.contents.length; index++) {
        let pastElement = realPastNoteInfo.contents[index];
        if(pastElement.typeShortDesc === resultNoteType){
          oneElement = pastElement;
          targetClinicalNoteId = pastElement.notes.length>0?pastElement.notes[0].clinicalnoteId:targetClinicalNoteId;
          break;
        }
      }
      if(resultElement && resultElement.allowCreateMulti === 'N'){
        if(oneElement && oneElement.notes.length > 0){
          let hasDeleteFlag = this.isHasDelete(oneElement.notes);
          tagetDom = document.getElementById(isPastEncounter?(hasDeleteFlag?'current_encounter_'+hasDeleteFlag:'btn_clinical_note_edit_' + targetClinicalNoteId):'past_encounter_'+targetClinicalNoteId);
          if(tagetDom && !tagetDom.disabled){
              tagetDom && tagetDom.click();
          }else{
            isCopy = false;
          }
          flag = true;
        }else if(oneElement && oneElement.notes.length < 1){
          tagetDom = document.getElementById(isPastEncounter?'current_encounter_'+oneElement.typeId:'past_encounter_'+oneElement.noteTypeId);
          if(tagetDom) {
            tagetDom.click();
          } else{
            isCopy = false;
          }
          flag = true;
        }
      }
      else if(oneElement && resultElement && resultElement.allowCreateMulti === 'Y' && resultElement.allowCreateOne === 'N'){
        tagetDom = document.getElementById(isPastEncounter?'current_encounter_'+oneElement.typeId:'past_encounter_'+oneElement.noteTypeId);
        if(tagetDom) {
          tagetDom.click();
        } else{
          isCopy = false;
        }
        flag = true;
      }
    }
    return {flag,isCopy};
  }

  isHasDelete = (notes) => {
    let flag = true;
    for (let index = 0; index < notes.length; index++) {
      let element = notes[index];
      if(element.isDelete !== 'Y'){
        flag = false;
        break;
      }
    }
    if(flag){
      flag = notes[0].typeId;
    }
    return flag;
  }

  caculInputAreaValMapCount = (inputAreaValMap) => {
    let count = 0;
    if(inputAreaValMap.size>0){
      inputAreaValMap.forEach(function(value){
  　　　　if(value.size > 0){
            count++;
          }
  　　});
    }
    return count;
  }

  handleDragStart = (event,note) => {
    event.dataTransfer.setData('text/plain',note.clinicalnoteText);
    event.dataTransfer.setData('dropClinicalNoteId',note.clinicalnoteId);
    let { updateState } = this.props;
    updateState&&updateState({
      originDrag:true
    });
    NoteCard.copyFLag = note;
  }

  handleHasVauleDragOver = (event,note) => {
    event.preventDefault();
    let { originDrag = false } = this.props;
    let val = !NoteCard.copyFLag?'none':NoteCard.copyFLag.clinicalnoteId === note.clinicalnoteId?'none':(originDrag && note.allowEdit === 'Y'?'all':'none');
    event.dataTransfer.dropEffect = val;
  }

  handleHasVauleDrop = (event,id,clinicalnoteId) => {
    let { noteIsEdit } = this.state;
    const { updateState, insertClinicalnoteLog } = this.props;
    if(NoteCard.copyFLag.clinicalnoteText == event.dataTransfer.getData('text/plain')){
      insertClinicalnoteLog&&insertClinicalnoteLog(commonConstants.INSERT_LOG_STATUS.Drop+' data finish','');
      if(!noteIsEdit){
        event.preventDefault();
        let dropClinicalNoteId = event.dataTransfer.getData('dropClinicalNoteId');
        event.dataTransfer.dropEffect = dropClinicalNoteId === clinicalnoteId?'none':'all';
        if(dropClinicalNoteId !== clinicalnoteId.toString()){
          let noteVal = event.dataTransfer.getData('text/plain');
          this.handleEditClick(id);
          setTimeout(() => {
            EventEmitter.emit('clinical_note_copy',{copyNoteContent:noteVal});
          },1000);
        }
      }
    }
    updateState&&updateState({
      originDrag:false
    });
  }

  render() {
    const { classes,note,seed,topbarProps,latestCursor,originDrag,updateState,isPastEncounter,insertClinicalnoteLog,currentEditFlag,pastEditFlag,isShowClinicalType,handleTextFieldFocus } = this.props;
    let { noteIsEdit } = this.state;
    let { allowEdit,clinicalnoteText,isDelete,hasLog='N',clinicalnoteId,hideLogIcon} = note;
    let inputAreaUpdateProps = {
      isPastEncounter,
      updateState,
      originDrag,
      latestCursor,
      editMode:noteIsEdit,
      topbarProps,
      encounterId:note.encounterId,
      key:`${seed}_${note.clinicalnoteId}`,
      id:`${seed}_${note.clinicalnoteId}`,
      noteTypeId:note.typeId,
      noteId:note.clinicalnoteId,
      value:note.clinicalnoteText,
      mode:clinicalNoteConstants.ACTION_TYPE.UPDATE,
      onChange:this.handleNoteUpdateChange,
      insertClinicalnoteLog,
      currentEditFlag,
      pastEditFlag,
      clinicalnoteId:note.clinicalnoteId,
      handleTextFieldFocus,
      typeId:note.typeId,
      handleCopy:this.handleCopy
    };
    return (
      <Grid onDragOver={(e)=>this.handleHasVauleDragOver(e,note)} onDrop={(e)=>{this.handleHasVauleDrop(e,inputAreaUpdateProps.id,clinicalnoteId);}} container className={classes.noteContentContainer}>
        <Grid className={classes.noteContentTitle} item xs={12} md={10} style={{display:noteIsEdit?'none':'flex'}}>
        <div>
          <label className={isDelete === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES?classes.noteContentCreateUserDeleteLabel:classes.noteContentCreateUserLabel}>{note.createBy}</label>
          <label className={classes.noteContentCreateDtmLabel}>{moment(note.createDtm).format('DD-MMM-YYYY HH:mm')}</label>
          {isDelete === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES?(
            <label className={classes.noteContentOtherUpdateDtmLabel}>{`(deleted by ${note.updateBy} on ${moment(note.updateDtm).format('DD-MMM-YYYY HH:mm')})`}</label>
          ):
          hasLog === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES || note.createDtm != note.updateDtm?(
            <label className={classes.noteContentOtherUpdateDtmLabel}>{`(edited by ${note.updateBy} on ${moment(note.updateDtm).format('DD-MMM-YYYY HH:mm')})`}</label>
          ):null}
        </div>
        </Grid>
        <Grid container item xs={12} md={2} direction="row" justify="flex-end" alignItems="center" style={{display:noteIsEdit?'none':'flex'}}>
          {hideLogIcon !== clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES && hasLog === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES?(
            <Grid item>
              <Tooltip title="Log" classes={{tooltip:classes.tooltip}}>
                <Fab
                    size="small"
                    color="primary"
                    id={`btn_clinical_note_log_${note.clinicalnoteId}`}
                    className={classes.primaryFab}
                    onClick={(e)=>{this.onFabLogClick(e,note.clinicalnoteId);}}
                >
                  <Notes className={classes.fabIcon} />
                </Fab >
              </Tooltip>
            </Grid>
          ):null}
          {isShowClinicalType? null : isDelete !== clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES?
            (<Grid item>
              <Tooltip title="Copy" classes={{tooltip:classes.tooltip}}>
                <Fab
                    size="small"
                    color="primary"
                    id={`btn_clinical_note_copy_${note.clinicalnoteId}`}
                    className={classes.primaryFab}
                    onClick={()=>{this.handleCopy();}}
                    disabled={currentEditFlag&&currentEditFlag!=='N'&&!isPastEncounter}
                >
                  <FileCopyOutlined className={classes.fabIcon} />
                </Fab >
              </Tooltip>
            </Grid>):null
          }

          {isShowClinicalType? null: isDelete !== clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES && allowEdit === clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES?(
            <Grid item>
              <Tooltip title="Edit" classes={{tooltip:classes.tooltip}}>
                <Fab
                    size="small"
                    color="primary"
                    id={`btn_clinical_note_edit_${note.clinicalnoteId}`}
                    className={classes.primaryFab}
                    onClick={()=>{this.handleEditClick(inputAreaUpdateProps.id);}}
                    disabled={currentEditFlag&&currentEditFlag!=='N'&&!isPastEncounter}
                >
                  <Edit className={classes.fabIcon} />
                </Fab >
              </Tooltip>
            </Grid>
          ):null}
        </Grid>
        <Grid item xs={12} md={12}>
          {noteIsEdit?(
          <div style={{display:'flex'}}>
            <NoteInputArea {...inputAreaUpdateProps} />
          </div>)
          :null}
          {isDelete !== clinicalNoteConstants.OPERATION_ALLOWED_TYPE.YES?
          (isPastEncounter?<pre draggable="true" onDragStart={(e)=>{this.handleDragStart(e,note);}} style={{display:noteIsEdit?'none':'block'}} className={classes.contentPre}>{clinicalnoteText}</pre>
          :<pre style={{display:noteIsEdit?'none':'block'}} className={classes.contentPre}>{clinicalnoteText}</pre>)
          :null}
        </Grid>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    loginInfo: {
      ...state.login.loginInfo,
      service:state.login.service,
      clinic:state.login.clinic
    },
    patientInfo: state.patient.patientInfo
  };
}

export default connect(mapStateToProps)(withStyles(styles)(NoteCard));
