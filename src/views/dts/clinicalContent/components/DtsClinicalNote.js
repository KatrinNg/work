import { withStyles, IconButton } from '@material-ui/core';
import NoteAdd from '@material-ui/icons/NoteAdd';
import { isEqual } from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Enum from '../../../../enums/enum';
import * as clinicalNoteConstants from '../../../../constants/clinicalNote/clinicalNoteConstants';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import DtsEditor from './clinicalNoteComp/DtsEditor';
import { styles } from './DtsClinicalNoteStyle';


class DtsClinicalNote extends Component {
  constructor(props) {
    super(props);
    // Generate Service Dropdown List
    // console.log("DtsClinicalNote");
    // console.log(props.inputAreaValMap);

    this.state = {
      userLogName: JSON.parse(sessionStorage.getItem('loginInfo')).loginName || null,
      currentClinicalNoteInfo: props.currentClinicalNoteInfo,
      currentEditFlag: 'N',
      initFlag: true,
      addANote: false

    };
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps, prevState) {
    if( prevProps.currentClinicalNoteInfo !== this.props.currentClinicalNoteInfo ) {
      this.setState({
        currentClinicalNoteInfo: this.props.currentClinicalNoteInfo
      });
    }
  }

  handleNoteUpdateChange = (value, note, encounterId) => {
    let { inputAreaValMap, updateState, editClinicalNoteIds } = this.props;
    let { clinicalnoteId } = note;
    if (!inputAreaValMap.has(clinicalnoteId)) {
      let valObj = this.generateDefaultValObj(note);
      inputAreaValMap.set(clinicalnoteId, valObj);
    }

    let valObj = inputAreaValMap.get(clinicalnoteId);

    if (!isEqual(valObj.clinicalnoteText, value)) {
      valObj.clinicalnoteText = value;
      if (valObj.version !== null) {
        valObj.actionType = clinicalNoteConstants.ACTION_TYPE.UPDATE;
      } else {
        valObj.actionType = clinicalNoteConstants.ACTION_TYPE.INSERT;
      }
    }
    let updateObj = {
      inputAreaValMap,
      editClinicalNoteIds: editClinicalNoteIds.add(clinicalnoteId)
    };

    updateState && updateState(updateObj);
  }

  handleCreateNoteChange = (value, note, encounterId) => {
    let { inputAreaValMap, updateState, editClinicalNoteIds } = this.props;
    let valObj = this.generateDefaultValObj(note);
    inputAreaValMap.set('_ID_', valObj);
    valObj.clinicalnoteText = value;
    valObj.actionType = clinicalNoteConstants.ACTION_TYPE.INSERT;
    let updateObj = {
      inputAreaValMap,
      editClinicalNoteIds: editClinicalNoteIds.add('_ID_')
    };

    updateState && updateState(updateObj);
  }

  generateDefaultValObj = (note) => {
    let obj = {
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



  generateNotes = (infoObj) => {
    // console.log("DtsClinicalNote ==> generateNotes");
    let NotePanels = [];
    let EmptyNotePanel = [];
    let { classes } = this.props;
    let { userLogName, addANote } = this.state;

    if (infoObj) {
      let { encounterId, contents = [] } = infoObj;
      for (let i = 0; i < contents.length; i++) {
        let noteObj = contents[i];
        let { notes = [] } = noteObj;
        let notesLength = notes.length;
        let hasUserCreatedNote = notes.some(note => note.createBy === userLogName);

        let note = { typeId: noteObj.typeId, clinicalnoteText: ''};
        let editorProps = {
          note,
          encounterId,
          onChange: this.handleCreateNoteChange,
          ...this.props
        };
        EmptyNotePanel.push(
          <div key={i}>
            <DtsEditor {...editorProps} />
          </div>
        );


        for (let y = 0; y < notesLength; y++) {
          let note = notes[y];
          let isCreator = userLogName == note.createBy;
          let isReadOnly = (note.allowEdit === 'N');
          let editorProps = {
            note,
            encounterId,
            clinicalnoteId: note.clinicalnoteId,
            onChange: this.handleNoteUpdateChange,
            noteReadOnly: isReadOnly,
            ...this.props
          };

          console.log("generateNotes ==> note.allowEdit  ==> " + note.allowEdit );
          console.log("generateNotes ==> isReadOnly  ==> " + (isReadOnly));
          delete editorProps.classes;

          // console.log(note);
          // console.log("generateNotes.note.clinicalnoteText:" + note.clinicalnoteText);
          // console.log('dtsclinicalnote.generateNotes.note: ' + JSON.stringify(note));
          NotePanels.push(
            <div key={i+'-'+y}>
              {(notesLength > 1 || !isCreator ) &&
                <section>
                  <label className={classes.noteContentCreateUserLabel}>{note.createBy}</label>
                  {/* <label className={classes.noteContentCreateDtmLabel}>{moment(note.createDtm).format('DD-MMM-YYYY HH:mm')}</label> */}
                  {/* <label className={classes.noteContentOtherUpdateDtmLabel}>{`(edited by ${note.updateBy} on ${moment(note.updateDtm).format('DD-MMM-YYYY HH:mm')})`}</label> */}
                  <label className={classes.noteContentOtherUpdateDtmLabel}>{`${moment(note.updateDtm).format(Enum.DATE_FORMAT_24_HOUR)}`}</label>
                </section>
              }
              <DtsEditor {...editorProps} />
            </div>
          );
        }
        // console.log("dtsclinicalnote.generateNotes.infoObj: " + JSON.stringify(infoObj));
        // console.log("dtsclinicalnote.generateNotes.noteObj: " + JSON.stringify(noteObj));

        if (!hasUserCreatedNote && notesLength !== 0) {
          NotePanels.push(
            <section>
              <CIMSButton onClick={() => this.setState({ addANote: true })} disabled={this.state.addANote} ><NoteAdd />Add Clincial note</CIMSButton>
              {addANote &&
                EmptyNotePanel.pop()
              }

            </section>
          );
        }

        if (notesLength === 0) {
          NotePanels.push(
            EmptyNotePanel.pop()
          );
        }
      }
    }
    return NotePanels;
  }

  render() {
    const { classes, ...rest } = this.props;
    const { currentClinicalNoteInfo } = this.state;

    // console.log(currentClinicalNoteInfo);
    // console.log(this.props);
    // console.log( this.state);
    // console.log(contents &&  contents[0].notes);

    return (
      <section >
        {this.generateNotes(currentClinicalNoteInfo)}
      </section>
    );
  }
}

const mapStateToProps = (state) => {
  // console.log('pageStatus 1: ' + JSON.stringify(state.dtsAppointmentBooking.pageStatus));
  return {
    loginInfo: {
      ...state.login.loginInfo,
      service: state.login.service,
      clinic: state.login.clinic
    },
    common: state.common,
    encounter: state.patient.encounterInfo,
    patientInfo: state.patient.patientInfo,
    accessRights: state.login.accessRights,
    userRoleType: state.login.loginInfo && state.login.loginInfo.userRoleType,
    defaultClinic: state.login.clinic
  };
};

export default connect(
  mapStateToProps
)(withStyles(styles)(DtsClinicalNote));
