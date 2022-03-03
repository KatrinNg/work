import React, { Component } from 'react';
import { withStyles, Grid, Fab } from '@material-ui/core';
import { styles } from './EncounterNoteContainerStyle';
import { ArrowBackIos } from '@material-ui/icons';
import moment from 'moment';
import _ from 'lodash';
import classNames from 'classnames';
import LogPopover from '../LogPopover/LogPopover';
import * as tagsActionTypes from '../../../../../store/actions/tagaNote/tagaNoteActionType';
import NoteContainer from '../NoteContainer/NoteContainer';
import Enum from '../../../../../enums/enum';
import * as commonConstants from '../../../../../constants/common/commonConstants';

class EncounterNoteContainer extends Component {
  constructor(props){
    super(props);
    this.boxContent=React.createRef();
    this.titleContent=React.createRef();
    this.state={
      // contentWidth: undefined||'calc(100% - 549px)',
      contentHeight: undefined,
      anchorEl:null,
      typeTmp:null,
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
    let boxHeight = windowHeight - 264;
    if(this.boxContent.current&&this.boxContent.current.clientHeight&&this.titleContent.current&&this.titleContent.current.clientHeight){
      this.setState({
        contentWidth: this.titleContent.current.clientWidth,
        contentHeight:boxHeight
      });
    }
  },500);

  onLogClick = (event,tagaNoteId) => {
    let targetAnchor = event.currentTarget;
    const { dispatch,insertEINLog,EINCancel,insertClinicalnoteLog } = this.props;
    let params = { taganoteId: tagaNoteId };
    dispatch&&dispatch({
      type: tagsActionTypes.GET_NOTE_LOG_BY_TAG_A_NOTE_ID,
      params,
      callback: data => {
        this.setState({
          logContents: data,
          anchorEl:targetAnchor
        });
      }
    });
    if (EINCancel === 'ClinicalNote') {
      insertClinicalnoteLog && insertClinicalnoteLog(`Action:${commonConstants.INSERT_LOG_STATUS.Click} 'Log' button in past record (EIN ID：${tagaNoteId})`, 'clinical-note/taganotes/logs');
    } else {
      insertEINLog && insertEINLog(`Action:${commonConstants.INSERT_LOG_STATUS.Click} 'Log' button in past record (EIN ID：${tagaNoteId})`, 'clinical-note/taganotes/logs');
    }
  }

  generateNotes = (infoObj,isCurrentNoteInfo) => {
    let NotePanels = [];
    if (infoObj) {
        let noteContainerProps = {
          infoObj,
          isCurrentNoteInfo:isCurrentNoteInfo,
          onLogClick:this.onLogClick,
          handleSave:this.handleSave,
          handleSaveAndPrint:this.handleSaveAndPrint,
          handlePrint:this.handlePrint,
          ...this.props
        };
        delete noteContainerProps.classes;
        NotePanels.push(
          <Grid  item xs={12}>
            <NoteContainer {...noteContainerProps} />
          </Grid>
        );
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
    const { pastNoteInfo, handleTagANoteSave  } = this.props;
    handleTagANoteSave&&handleTagANoteSave(pastNoteInfo);
  }

  handleSaveAndPrint = () => {
    const { pastNoteInfo, handleTagaNoteSaveAndPrint } = this.props;
    handleTagaNoteSaveAndPrint && handleTagaNoteSaveAndPrint(pastNoteInfo);
  }

  handlePrint = () => {
    const { pastNoteInfo, handleTagaNotePrint } = this.props;
    handleTagaNotePrint && handleTagaNotePrint(pastNoteInfo);
  }

  handleCancel = () => {
    const { handleClinicalNoteCancel,isPastEncounter } = this.props;
    handleClinicalNoteCancel&&handleClinicalNoteCancel(isPastEncounter);
  }

  handleClosePastEncounter = () => {
    const { pastNoteInfo, handleBackClosePastEncounter } = this.props;
    handleBackClosePastEncounter && handleBackClosePastEncounter(pastNoteInfo,null,null);
  }

  render() {
    const { classes, isPastEncounter, pastNoteInfo, currentNoteInfo,tagANoteTypes } = this.props;
    let { contentHeight,anchorEl,logContents } = this.state;
    let  infoObj = null;
    let  isCurrentNoteInfo=true;
    if (isPastEncounter) {
      infoObj = pastNoteInfo;
      isCurrentNoteInfo=false;
    } else {
      infoObj = currentNoteInfo;
    }
    let typeTmp='';
    //infoObj.taganoteType
     let desc = infoObj?`${moment(infoObj.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE)}  ${infoObj.taganoteTypeDesc}`:'';

    let logPopoverProps = {
      anchorEl,
      logContents,
      isOpen: Boolean(anchorEl),
      handlePopverClose: this.handlePopverClose,
      handlePopverExited: this.handlePopverExited
    };
    return (
      <div ref={this.boxContent} style={{height:'99.7%',paddingLeft: 10}} className={classNames({
          [classes.pastEncounterDiv]: isPastEncounter
        })}
      >
        <Grid container ref={this.titleContent}>
          {/* title */}
          <Grid item md={isPastEncounter?12:7} style={{display: 'flex',alignItems: 'center'}}>
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
          </Grid>
        </Grid>
        {/* Content */}
        <div className={classes.content} style={{height:contentHeight,display:!contentHeight?'none':'block'}} >
          <Grid container style={{paddingRight: 5}}>
            {this.generateNotes(infoObj,isCurrentNoteInfo)}
          </Grid>
        </div>
        <LogPopover {...logPopoverProps} />
      </div>
    );
  }
}

export default withStyles(styles)(EncounterNoteContainer);
