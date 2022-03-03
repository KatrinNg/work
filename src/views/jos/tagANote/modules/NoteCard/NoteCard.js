import React, { Component } from 'react';
import { withStyles, Grid, Tooltip, Fab,Typography } from '@material-ui/core';
import {styles} from './NoteCardStyle';
import moment from 'moment';
import { FileCopyOutlined, Edit, Notes } from '@material-ui/icons';
import * as clinicalNoteConstants from '../../../../../constants/clinicalNote/clinicalNoteConstants';
import NoteInputArea from '../NoteInputArea/NoteInputArea';
import EventEmitter from '../../../../../utilities/josCommonUtilties';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import Enum from '../../../../../enums/enum';
import PrintIcon from '@material-ui/icons/Print';

class NoteCard extends Component {
  constructor(props){
    super(props);
    this.state = {
      //note:null,
      noteIsEdit: false,
      showLog: false,
      showIconLog: false,
      displayButtons:true,
      taganoteText:undefined,
      taganoteTitle:undefined,
      taganoteType:undefined,
      taganoteTypeDesc:undefined,
      noteCardTypeFlag: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.note !== this.state.note) {
      this.setState({
        note: nextProps.note,
        noteIsEdit: false,
        showLog: false,
        showIconLog: nextProps.note.hasLog === 'Y' ? true : false,
        taganoteText:nextProps.note.taganoteText,
        taganoteType:nextProps.note.taganoteType,
        taganoteTypeDesc:nextProps.note.taganoteTypeDesc,
        taganoteTitle:nextProps.note.taganoteTitle
      });
    }
    this.setState({ noteCardTypeFlag: nextProps.noteCardTypeFlag });
  }

  onFabLogClick = (event) => {
    const { handleFabLogClick,note } = this.props;
    let { taganoteId } = note;
    handleFabLogClick&&handleFabLogClick(event,taganoteId);
  }

  onSaveClick = () => {
    const { handleSaveClick, updateState, note, isCurrentNoteInfo, tagANoteTypes } = this.props;
    const { taganoteText, taganoteTitle, taganoteType, taganoteTypeDesc } = this.state;
    let taganoteTypeValue = '';
    let taganoteTypeDescValue = '';
    let taganoteTypeArray = tagANoteTypes;
    for (let index = 0; index < taganoteTypeArray.length; index++) {
      const element = taganoteTypeArray[index];
      if (element.codeTaganoteTypeCd == taganoteType) {
        taganoteTypeValue = element.codeTaganoteTypeCd;
        taganoteTypeDescValue = element.typeDesc;
      }
    }
    if (taganoteText != null) {
      note.taganoteText = taganoteText;
    }
    if (taganoteTitle != null) {
      note.taganoteTitle = taganoteTitle;
    }
    if (taganoteType != null) {
      // note.taganoteType = taganoteType;
      // note.taganoteTypeDesc = taganoteTypeDesc;
      note.taganoteType = taganoteTypeValue;
      note.taganoteTypeDesc = taganoteTypeDescValue;
    }
    if (taganoteTypeValue === '') {
      // this.setState({ noteCardTypeFlag: true });
      updateState && updateState({ noteCardTypeFlag: true });
    } else {
      if (isCurrentNoteInfo) {
        updateState && updateState({
          currentNoteInfo: note
        }, () => handleSaveClick && handleSaveClick());
      } else {
        updateState && updateState({
          pastNoteInfo: note
        }, () => handleSaveClick && handleSaveClick());
      }
    }
  }

  onSaveAndPrintClick = () => {
    const { handleSaveAndPrintClick, updateState, note, isCurrentNoteInfo,tagANoteTypes } = this.props;
    const { taganoteText, taganoteTitle, taganoteType, taganoteTypeDesc } = this.state;
    let taganoteTypeValue = '';
    let taganoteTypeArray = tagANoteTypes;
    for (let index = 0; index < taganoteTypeArray.length; index++) {
      const element = taganoteTypeArray[index];
      if (element.codeTaganoteTypeCd == taganoteType) {
        taganoteTypeValue = element.codeTaganoteTypeCd;
      }
    }
    if (taganoteText != null) {
      note.taganoteText = taganoteText;
    }
    if (taganoteTitle != null) {
      note.taganoteTitle = taganoteTitle;
    }
    if (taganoteType != null) {
      note.taganoteType = taganoteType;
      note.taganoteTypeDesc = taganoteTypeDesc;
    }
    if (taganoteTypeValue === '') {
      // this.setState({ noteCardTypeFlag: true });
      updateState && updateState({ noteCardTypeFlag: true });
    } else {
      if (isCurrentNoteInfo) {
        updateState && updateState({
          currentNoteInfo: note
        });
      } else {
        updateState && updateState({
          pastNoteInfo: note
        });
      }
      handleSaveAndPrintClick && handleSaveAndPrintClick();
    }
  }

  handleNoteUpdateChange = (params) => {
    const { updateState, note, tagANoteTypes } = this.props;
    this.setState({ displayButtons: params.displayButtons });
    let taganoteTypeValue = '';
    let taganoteTypeDescValue = '';
    for (let index = 0; index < tagANoteTypes.length; index++) {
      const element = tagANoteTypes[index];
      if (element.codeTaganoteTypeCd == this.state.taganoteType) {
        taganoteTypeValue = element.codeTaganoteTypeCd;
        taganoteTypeDescValue = element.typeDesc;
      }
    }
    if (params.value != null) {
      let resultValue = params.value;
      this.setState({ taganoteText: resultValue });
      note.taganoteText = resultValue;

      note.taganoteType = taganoteTypeValue;
      note.taganoteTypeDesc = taganoteTypeDescValue;

      updateState && updateState({
        pastNoteInfo:note,
        taganoteTitleTmp: this.state.taganoteTitle,
        taganoteTextTmp: resultValue,
        // taganoteTypeTmp: this.state.taganoteType,
        // taganoteTypeDescTmp: this.state.taganoteTypeDesc
        taganoteTypeTmp: taganoteTypeValue,
        taganoteTypeDescTmp: taganoteTypeDescValue
      });
    }

    if (params.noteTitle != null) {
      let noteTitleValue = params.noteTitle;
      this.setState({ taganoteTitle: noteTitleValue });
      note.taganoteTitle = noteTitleValue;
      note.taganoteType = taganoteTypeValue;
      note.taganoteTypeDesc = taganoteTypeDescValue;
      updateState && updateState({
        pastNoteInfo:note,
        taganoteTitleTmp: noteTitleValue,
        taganoteTextTmp: this.state.taganoteText,
        // taganoteTypeTmp: this.state.taganoteType,
        // taganoteTypeDescTmp: this.state.taganoteTypeDesc
        taganoteTypeTmp: taganoteTypeValue,
        taganoteTypeDescTmp: taganoteTypeDescValue
      });
    }

    if (params.clickNoteType != null) {
      let taganoteTypeValue = params.clickNoteType;
      let clickNoteTypeDescValue = params.clickNoteTypeDesc;
      this.setState({
        taganoteType: taganoteTypeValue,
        taganoteTypeDesc: clickNoteTypeDescValue
      });
      note.taganoteType = taganoteTypeValue;
      note.taganoteTypeDesc = clickNoteTypeDescValue;
      updateState && updateState({
        pastNoteInfo: note,
        taganoteTitleTmp: this.state.taganoteTitle,
        taganoteTextTmp: this.state.taganoteText,
        taganoteTypeTmp: taganoteTypeValue,
        taganoteTypeDescTmp: clickNoteTypeDescValue
      });
    }
  }

  handleEditClick = () => {
    let { insertEINLog,note} = this.props;
    this.setState({
      noteIsEdit: true,
      showLog: true,
      displayButtons: true
    });
    insertEINLog && insertEINLog(`Action: Click 'Edit' button in past record (EIN ID: ${note.taganoteId}) `, '');
  }

  handleCopy = () => {
    let { note, updateState, insertEINLog } = this.props;
    note.taganoteType && updateState && updateState({ typeFlag: false });
    note.taganoteText && updateState && updateState({ isContentEdit: true });
    EventEmitter.emit('tag_a_note_copy', {
      copyNoteContent: note.taganoteText ? note.taganoteText : '',
      taganoteType:note.taganoteType ? note.taganoteType : '',
      taganoteTypeDesc: note.taganoteTypeDesc ? note.taganoteTypeDesc : '',
      taganoteTitle:note.taganoteTitle ? note.taganoteTitle : ''
    });
    let content = `Content: Copied type: ${note.taganoteType},Copied title: ${note.taganoteTitle},Copied details:${note.taganoteText}`;
    insertEINLog && insertEINLog(`Action: Click 'Copy' button in past record (From EIN ID: ${note.taganoteId}) `, '', content);
  }

  onPrintClick = () => {
    const { handlePrintClick, insertEINLog, note } = this.props;
    handlePrintClick&&handlePrintClick();
    insertEINLog && insertEINLog(`Action: Click 'Print' button in past record (EIN ID: ${note.taganoteId}) `, '');
  }

  render() {
    const { classes, note, latestCursor, updateState, originPastNoteInfo, currentServiceAndClinic,clinicalNoteUseFlag,tagANoteTypes,insertEINLog,loginInfo } = this.props;
    let { taganoteText } = note;
    let { noteIsEdit, showLog, showIconLog, displayButtons,noteCardTypeFlag } = this.state;
    let inputAreaUpdateProps = {
      noteCardTypeFlag,
      updateState,
      latestCursor,
      insertEINLog,
      loginInfo,
      editMode: noteIsEdit,
      noteId: note.taganoteId,
      taganoteTitle:note.taganoteTitle=== null ? '' :note.taganoteTitle,
      taganoteType: note.taganoteType,
      taganoteTypeDesc: note.taganoteTypeDesc,
      value: note.taganoteText === null ? '' : note.taganoteText,
      originPastNoteInfo: originPastNoteInfo,
      tagANoteTypes:tagANoteTypes,
      mode: clinicalNoteConstants.ACTION_TYPE.UPDATE,
      onChange: this.handleNoteUpdateChange,
      noteIsEdit: !noteIsEdit
    };
    return (
      <Grid container className={classes.noteContentContainer}>
            <Grid className={classes.noteContentTitle} item xs={12} md={9} >
              {!noteIsEdit ?<div>
              <label className={classes.noteContentCreateUserLabel}>{note.createClinicCd}</label>
              <label className={classes.updateByLabel}> {note.updateBy}</label>
              <label className={classes.noteContentCreateDtmLabel}>{moment(note.createDtm).format(Enum.DATE_FORMAT_24_HOUR)}</label>
              {showIconLog ?
                 <label className={classes.noteContentOtherUpdateDtmLabel}>{`(edited by ${note.updateBy} on ${moment(note.updateDtm).format(Enum.DATE_FORMAT_24_HOUR)})`}</label>
              : null}
              <br></br>
               <label className={classes.noteContentCreateUserLabel}>{note.taganoteTitle}</label>
              </div>
              :null}

          </Grid>
          {!noteIsEdit ?
        <Grid container item xs={12} md={3} direction="row" justify="flex-end" alignItems="center" >
          {showIconLog ? <Grid item>
            <Tooltip title="Log" classes={{ tooltip: classes.tooltip }}>
              <Fab
                  size="small"
                  color="primary"
                  id={`btn_taganote_note_log_${note.taganoteId}`}
                  className={classes.primaryFab}
                  onClick={(e) => { this.onFabLogClick(e, note.taganoteId); }}
              >
                <Notes className={classes.fabIcon} />
              </Fab >
            </Tooltip>
          </Grid> : null}
          {!clinicalNoteUseFlag?(
          <Grid item>
            <Tooltip title="Copy" classes={{tooltip:classes.tooltip}}>
              <Fab
                  size="small"
                  color="primary"
                  id={`btn_taganote_note_copy_${note.taganoteId}`}
                  className={classes.primaryFab}
                  onClick={()=>{this.handleCopy();}}
              >
                <FileCopyOutlined className={classes.fabIcon} />
              </Fab >
            </Tooltip>
          </Grid>
          ):null}
          {!currentServiceAndClinic&&!clinicalNoteUseFlag?(
            <Grid item>
              <Tooltip title="Edit" classes={{tooltip:classes.tooltip}}>
                <Fab
                    size="small"
                    color="primary"
                    id={`btn_taganote_note_edit_${note.taganoteId}`}
                    className={classes.primaryFab}
                    onClick={()=>{this.handleEditClick(inputAreaUpdateProps.id);}}
                >
                  <Edit className={classes.fabIcon} />
                </Fab >
              </Tooltip>
            </Grid>
           ):null}
           {!clinicalNoteUseFlag?(
          <Grid item>
            <Tooltip title="Print" classes={{tooltip:classes.tooltip}}>
              <Fab
                  size="small"
                  color="primary"
                  id={`btn_taganote_note_print_${note.taganoteId}`}
                  className={classes.primaryFab}
                  onClick={()=>{this.onPrintClick();}}
              >
                <PrintIcon className={classes.fabIcon} />
              </Fab >
            </Tooltip>
          </Grid>
          ):null}
        </Grid>
  :null}
        {/* content */}
        <Grid item xs={12} md={12} >
          <div id="clinical_Note_TextFiled" style={{display:noteIsEdit?'flex':'none',marginTop:8}}>
            <NoteInputArea {...inputAreaUpdateProps} />
          </div>
          <pre style={{display:noteIsEdit?'none':'block'}} className={classes.contentPre}>{taganoteText}</pre>
        </Grid>

        {showLog ?(
        <Grid alignItems="center"
            container
            justify="flex-end"
        >
            <Typography component="div">
                <CIMSButton
                    disabled={displayButtons}
                    classes={{
                      root: classes.btnRoot,
                      label:classes.fontLabel
                    }}
                    color="primary"
                    id="taganotepastnotesaveprint"
                    onClick={()=>{this.onSaveAndPrintClick();}}
                    size="small"
                >
                    Save & Print
                </CIMSButton>
            </Typography>

              <Typography component="div">
                <CIMSButton
                    disabled={displayButtons}
                    classes={{
                      root: classes.btnRoot,
                      label:classes.fontLabel
                    }}
                    color="primary"
                    id="taganotepastnotesave"
                    onClick={()=>{this.onSaveClick();}}
                    size="small"
                >
                    Save
                </CIMSButton>
              </Typography>
            </Grid>):null
            }
      </Grid>
    );
  }
}

export default withStyles(styles)(NoteCard);
