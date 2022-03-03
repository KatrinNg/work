import React, { Component } from 'react';
import { withStyles, ExpansionPanel, ExpansionPanelDetails } from '@material-ui/core';
import { styles } from './NoteContainerStyle';
import NoteCard from '../NoteCard/NoteCard';

class NoteContainer extends Component {
  constructor(props){
    super(props);
    this.state={
      displayNoRecord:true
    };
  }

  handleFabLogClick = (event,tagaNoteId) => {
    const { onLogClick } = this.props;
    onLogClick&&onLogClick(event,tagaNoteId);
  }

  handleSaveClick = () => {
    const { handleSave ,infoObj} = this.props;
    handleSave&&handleSave(infoObj);
  }
  handleSaveAndPrintClick = () => {
    const { handleSaveAndPrint ,infoObj} = this.props;
    handleSaveAndPrint&&handleSaveAndPrint(infoObj);
  }

  handlePrintClick = () => {
    const { handlePrint ,infoObj} = this.props;
    handlePrint&&handlePrint(infoObj);
  }
  generateNoteContents = (note,isCurrentNoteInfo) => {
    const { insertEINLog,editEncounterIds,originDrag,dispatch,isPastEncounter,updateState,originPastNoteInfo,currentServiceAndClinic,clinicalNoteUseFlag,tagANoteTypes,loginInfo,noteCardTypeFlag} = this.props;
    let contents = [];
    if (note) {
        let noteCardProps = {
          noteCardTypeFlag,
          loginInfo,
          editEncounterIds,
          originDrag,
          dispatch,
          note,
          isCurrentNoteInfo,
          updateState,
          insertEINLog,
          originPastNoteInfo,
          isPastEncounter,
          currentServiceAndClinic,
          tagANoteTypes,
          clinicalNoteUseFlag,
          handleFabLogClick: this.handleFabLogClick,
          handleSaveClick: this.handleSaveClick,
          handleSaveAndPrintClick: this.handleSaveAndPrintClick,
          handlePrintClick: this.handlePrintClick
        };
        contents.push(
          <div>
            <NoteCard {...noteCardProps} />
          </div>
        );
    } else {
      // No record
      contents.push(
        <div key={`${Math.random()}`} style={{ padding: '5px 10px', color: styles.label.color, display: this.state.displayNoRecord ? 'block' : 'none' }}>
          <label>No Record</label>
        </div>
      );
    }
    return (<div style={{width:'100%'}}>{contents}</div>);
  }

  render() {
    const { classes,isPastEncounter,infoObj,isCurrentNoteInfo } = this.props;
    let noteContents = this.generateNoteContents(infoObj);
    return (
      <ExpansionPanel defaultExpanded style={{ marginTop: 0, marginBottom: 10, backgroundColor: isPastEncounter ? styles.pastBackgroud.backgroundColor : styles.currentBackgroud.backgroundColor }}>
        <ExpansionPanelDetails className={classes.border}>{noteContents}</ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(NoteContainer);

