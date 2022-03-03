import React, { Component } from 'react';
import { withStyles, Grid, Fab } from '@material-ui/core';
import { styles } from './EncounterNoteContainerStyle';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import { ArrowBackIos } from '@material-ui/icons';
import _ from 'lodash';
import classNames from 'classnames';
import LogPopover from '../LogPopover/LogPopover';
import * as actionTypes from '../../../../../store/actions/clinicalNote/clinicalNoteActionType';
import NoteContainer from '../NoteContainer/NoteContainer';
import * as commonConstants from '../../../../../constants/common/commonConstants';
import * as commonUtils from '../../../../../utilities/josCommonUtilties';
import moment from 'moment';


class EncounterNoteContainer extends Component {
  constructor(props){
    super(props);
    this.boxContent=React.createRef();
    this.titleContent=React.createRef();
    this.state={
      contentHeight: undefined,
      anchorEl:null,
      logContents:[]
    };
  }

  componentDidMount(){
    this.resetHeight();
    window.addEventListener('resize',this.resetHeight);
  }

  componentWillReceiveProps(){
    this.resetHeight();
  }

  componentWillUnmount(){
    window.removeEventListener('resize',this.resetHeight);
  }

  resetHeight=_.debounce(()=>{
    let windowHeight = window.innerHeight;
    let boxHeight = windowHeight - 294;
    if(this.boxContent.current&&this.boxContent.current.clientHeight&&this.titleContent.current&&this.titleContent.current.clientHeight){
      this.setState({
        contentWidth: this.titleContent.current.clientWidth,
        contentHeight: boxHeight
      });
    }
  },500);

  onLogClick = (event,params) => {
    let targetAnchor = event.currentTarget;
    const { dispatch, insertClinicalnoteLog, isPastEncounter,EINCancel,insertEINLog } = this.props;
    if(isPastEncounter){
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Log' button in past encounter (Type ID: ${params.typeId}; Clinical Note ID:${params.encntrId})`;
      if (EINCancel === 'EINCancel') {
        insertEINLog && insertEINLog(name, 'clinical-note/clinicalNote/logs');
      } else {
        insertClinicalnoteLog && insertClinicalnoteLog(name, 'clinical-note/clinicalNote/logs');
      }
    }else{
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Log' button in current encounter (Type ID: ${params.typeId}; Clinical Note ID:${params.encntrId})`;
      insertClinicalnoteLog && insertClinicalnoteLog(name, 'clinical-note/clinicalNote/logs');
    }
    dispatch&&dispatch({
      type: actionTypes.GET_NOTE_LOG_BY_CLINICAL_NOTE_ID,
      params:params,
      callback: data => {
        this.setState({
          logContents: data,
          anchorEl:targetAnchor
        });
      }
    });
  }

  generateNotes = (infoObj) => {
    let NotePanels = [];
    let {isPastEncounter,isAddDivFlag,insertClinicalnoteLog,currentEditFlag,pastEditFlag,accessCheckIn,setPastTimeout} =this.props;
    if (infoObj) {
      let { encounterId,contents=[] } = infoObj;
      for (let i = 0; i < contents.length; i++) {
        let noteObj = contents[i];
        let noteContainerProps = {
          noteObj,
          encounterId,
          isPastEncounter,
          isAddDivFlag,
          onLogClick:this.onLogClick,
          insertClinicalnoteLog,
          currentEditFlag,
          pastEditFlag,
          accessCheckIn,
          setPastTimeout,
          ...this.props
        };
        delete noteContainerProps.classes;

        NotePanels.push(
          <Grid id={isPastEncounter?'Past_Note_Type_Id_'+i:'Note_Type_Id_'+i} key={i} item xs={12}>
            <NoteContainer {...noteContainerProps} />
          </Grid>
        );
      }
    }
    return NotePanels;
  }

  handlePopverClose = () => {
    this.setState({anchorEl:null});
  }

  handlePopverExited = () => {
    this.setState({logContents:[]});
  }

  handleSave = () => {
    const { isPastEncounter, handleClinicalNoteSave } = this.props;
    handleClinicalNoteSave&&handleClinicalNoteSave(isPastEncounter);
  }

  handleCancel = () => {
    const { handleClinicalNoteCancel,isPastEncounter,isShowClinicalType,handleClosePastEncounter,handlePastClinicalNoteCancel,EINCancel,saveBtnIsDisabled,handleCloseTab } = this.props;
    if (isShowClinicalType) {
      if (EINCancel === 'EINCancel') {
        handlePastClinicalNoteCancel && handlePastClinicalNoteCancel();
      } else {
        handleClosePastEncounter && handleClosePastEncounter();
      }
    } else {
      let pastIsEdit = saveBtnIsDisabled && saveBtnIsDisabled(true);
      let currentIsEdit = saveBtnIsDisabled && saveBtnIsDisabled(false);
      if (isPastEncounter) {
        if (pastIsEdit) {
          handleClosePastEncounter && handleClosePastEncounter();
        } else {
          handleClinicalNoteCancel && handleClinicalNoteCancel(isPastEncounter);
        }
      } else {
        if(pastIsEdit && currentIsEdit) {
          handleCloseTab && handleCloseTab();
        }else {
          handleClinicalNoteCancel && handleClinicalNoteCancel(isPastEncounter);
        }
      }
    }
  }

  isCancelBtnDisabled = () => {
    const { isPastEncounter, isPastRecordEdit, pastEditFlag } = this.props;
    let flag = false;
    if (isPastEncounter) {
      if (!isPastRecordEdit && pastEditFlag == 'N') {
        flag = true;
      }
    }
    return flag;
  }

  isSaveBtnDisabled = () => {
    const { saveBtnIsDisabled,isPastEncounter } = this.props;
    return saveBtnIsDisabled&&saveBtnIsDisabled(isPastEncounter);
  }

  handleClosePastEncounter = () => {
    let { handleClosePastEncounter,insertClinicalnoteLog,topbarProps,isShowClinicalType,saveBtnIsDisabled,isPastEncounter,handleClinicalNoteCancel } = this.props;
    let { patientKey, encounterId } = topbarProps;
    insertClinicalnoteLog && insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} '<' (Close tab) button in past encounter,PMI:${patientKey}, EncounterId:${encounterId}`,'');
    if(isShowClinicalType) {
      handleClosePastEncounter && handleClosePastEncounter();
    }else {
      let pastIsEdit = saveBtnIsDisabled && saveBtnIsDisabled(true);
      if (isPastEncounter) {
        if (pastIsEdit) {
          handleClosePastEncounter && handleClosePastEncounter();
        } else {
          handleClinicalNoteCancel && handleClinicalNoteCancel(isPastEncounter);
        }
      }
    }
  }

  render() {
    const { classes, isPastEncounter, pastNoteInfo, currentNoteInfo, currentEditFlag, isShowClinicalType } = this.props;
    let { contentHeight,anchorEl,logContents } = this.state;
    let type = '', infoObj = null, desc = '';
    if (isPastEncounter) {
      type = 'past';
      infoObj = pastNoteInfo;
      desc = infoObj?`${moment(infoObj.encounterDate).format('DD-MMM-YYYY')} ${infoObj.encounterDesc?infoObj.encounterDesc:''}`:'';
    } else {
      type = 'current';
      infoObj = currentNoteInfo;
      desc = commonUtils.getCurrentEncounterDesc('Y');
    }
    let saveBtnDisabledFlag = this.isSaveBtnDisabled();
    let cancelBtnDisabledFlag = this.isCancelBtnDisabled();
    let logPopoverProps = {
      anchorEl,
      logContents,
      isOpen: Boolean(anchorEl),
      handlePopverClose: this.handlePopverClose,
      handlePopverExited: this.handlePopverExited,
      isPastEncounter
    };
    return (
      <div ref={this.boxContent} style={{height:'99.7%',paddingLeft: 10}} className={classNames({
          [classes.pastEncounterDiv]: isPastEncounter
        })}
      >
        <Grid container ref={this.titleContent}>
          {/* title */}
          <Grid item md={!isPastEncounter?5:7} style={{display: 'flex',alignItems: 'center'}}>
            {isPastEncounter?(
              <div>
                <Fab
                    size="small"
                    color="primary"
                    id="btn_clinical_back"
                    className={classes.primaryFab}
                    onClick={this.handleClosePastEncounter}
                >
                  <ArrowBackIos className={classes.backfabIcon} />
                </Fab>
                <label className={classes.title}>{desc}</label>
              </div>
            ):(
              <div>
                <p className={classes.title}>Encounter Date: {desc}</p>
              </div>
            )}
          </Grid>
          <Grid item md={!isPastEncounter?7:5}>
            {currentEditFlag&&!isPastEncounter&&currentEditFlag!=='N'?
              <div className={classes.LabelGroup}>
                The current page is locked for editing by {currentEditFlag}
              </div>
            :null}
            {isShowClinicalType ?
              <div className={classes.btnGroup}>
                <CIMSButton id={`${type}_encounter_btn_cancel`} classes={{root: classes.btnRoot}} onClick={this.handleCancel}>Cancel</CIMSButton>
              </div>:
              <div className={classes.btnGroup}>
                <CIMSButton id={`${type}_encounter_btn_save`} classes={{root: classes.btnRoot}} disabled={saveBtnDisabledFlag} onClick={this.handleSave} >Save</CIMSButton>
                <CIMSButton id={`${type}_encounter_btn_cancel`} classes={{root: classes.btnRoot}} disabled={cancelBtnDisabledFlag} onClick={this.handleCancel}>Cancel</CIMSButton>
              </div>
            }
          </Grid>
        </Grid>
        {/* Content */}
        <div className={classes.content} style={{height:contentHeight,display:!contentHeight?'none':'block'}} >
          <Grid container style={{paddingRight: 5}}>
            {this.generateNotes(infoObj)}
          </Grid>
        </div>
        <LogPopover {...logPopoverProps} />
      </div>
    );
  }
}

export default withStyles(styles)(EncounterNoteContainer);
