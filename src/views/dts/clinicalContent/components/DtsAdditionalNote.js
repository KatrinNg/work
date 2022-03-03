import { withStyles, IconButton } from '@material-ui/core';
import { isEqual, cloneDeep } from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as clinicalNoteConstants from '../../../../constants/clinicalNote/clinicalNoteConstants';
import DtsNoteInputArea from './clinicalNoteComp/DtsNoteInputArea';
import { styles } from './DtsClinicalNoteStyle';
import Enum from '../../../../enums/enum';


class DtsAdditionalNote extends Component {
    constructor(props) {
        super(props);
        // Generate Service Dropdown List
        // console.log("DtsAdditionalNote");
        // console.log(props.inputAreaValMap);

        this.state = {
            userLogName: JSON.parse(sessionStorage.getItem('loginInfo')).loginName || null,
            currentAdditionalNoteInfo: props.currentAdditionalNoteInfo,
            // newNotes: new Set(),
            newNotes: props.newNotes,
            newNoteCount: props.newNotes.length,
            emptyNote: null
        };
    }

    componentDidMount() {
        const { onRef } = this.props;
        onRef(this);

        if (this.state.currentAdditionalNoteInfo) {
            let { encounterId, contents = [] } = this.state.currentAdditionalNoteInfo;
            for (let i = 0; i < contents.length; i++) {
                let noteObj = contents[i];
                let { notes = [] } = noteObj;
                let notesLength = notes.length;

                let emptyNote = { typeId: noteObj.typeId, clinicalnoteText: '' };
                this.setState({ emptyNote });
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.currentAdditionalNoteInfo !== this.props.currentAdditionalNoteInfo) {
            this.setState({
                currentAdditionalNoteInfo: this.props.currentAdditionalNoteInfo
            });
        }
        if (prevProps.newNotes !== this.props.newNotes) {
            this.setState({
                newNotes: this.props.newNotes
            });
        }

    }

    handleNoteUpdateChange = (value, noteId, encounterId) => {
        let { inputAreaValMap, updateState, editClinicalNoteIds } = this.props;
        let valObj = inputAreaValMap.get(noteId);

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
            editClinicalNoteIds: editClinicalNoteIds.add(noteId)
        };

        updateState && updateState(updateObj);
    }

    generateNotes = (infoObj) => {
        let NotePanels = [];
        let { classes, readyOnly, inputAreaValMap } = this.props;
        let { userLogName } = this.state;

        if (infoObj) {
            let { encounterId, contents = [] } = infoObj;
            for (let i = 0; i < contents.length; i++) {
                let noteObj = contents[i];
                let { notes = [] } = noteObj;
                let notesLength = notes.length;

                for (let y = 0; y < notesLength; y++) {
                    let note = notes[y];
                    let isCreator = userLogName == note.createBy;
                    let isReadOnly = (note.allowEdit === 'N') && !readyOnly;
                    let editorProps = {
                        note,
                        encounterId,
                        value: note.clinicalnoteText,
                        noteId: note.clinicalnoteId,
                        onChange: this.handleNoteUpdateChange,
                        editMode: !isReadOnly && isCreator,
                        ...this.props
                    };
                    delete editorProps.classes;

                    NotePanels.push(
                        <div key={i + '-' + y}>
                            <section>
                                <label className={classes.noteContentCreateUserLabel}>{note.createBy}</label>
                                <label className={classes.noteContentOtherUpdateDtmLabel}>{`${moment(note.updateDtm).format(Enum.DATE_FORMAT_24_HOUR)}`}</label>
                            </section>
                            <DtsNoteInputArea {...editorProps} />
                        </div>
                    );
                }
            }
        }
        return NotePanels;
    }

    addNote = () => {
        console.log(" == addNote 1");
        const { emptyNote, newNotes } = this.state;
        let { inputAreaValMap, updateState, editClinicalNoteIds } = this.props;
        let note = cloneDeep(emptyNote);
        note.clinicalnoteId = Math.random() * -1; // assign a dummy id

        // newNotes.add(note);
        newNotes.push(note);
        this.setState((prevState) => ({ newNoteCount : newNotes.length}));
        
        inputAreaValMap.set(note.clinicalnoteId, note);
        // console.log(" == addNote 2");

    }

    clearNewNote = () => {
        const { newNotes } = this.state;
        newNotes.splice(0, newNotes.length);
        this.setState((prevState) => ({ newNoteCount : newNotes.length}));
        // this.state.newNotes.clear();
    }

    render() {
        const { classes } = this.props;
        const { currentAdditionalNoteInfo, newNotes, newNoteCount } = this.state;
        let { encounterId } = currentAdditionalNoteInfo;
        return (
            <section >
                {this.generateNotes(currentAdditionalNoteInfo)}
                {newNoteCount > 0 && newNotes.map((note) => {
                    // console.log('new note: value: ' +JSON.stringify(note));
                    let editorProps = {
                        note,
                        encounterId,
                        value: note.clinicalnoteText,
                        noteId: note.clinicalnoteId,
                        onChange: this.handleNoteUpdateChange,
                        editMode: true,
                        autoFocus: true,
                        ...this.props
                    };
                    delete editorProps.classes;
                    return (
                        <div key={"new" + note.clinicalnoteId}>
                            <section>
                                <label className={classes.noteContentCreateUserLabel}>{this.state.userLogName}</label>
                            </section>
                            <DtsNoteInputArea {...editorProps} />
                        </div>);
                })}
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
)(withStyles(styles)(DtsAdditionalNote));
