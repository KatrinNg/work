import React, { Component } from 'react';
import { connect } from 'react-redux';
import { styles } from './NoteInputAreaStyle';
import { withStyles, TextField, Grid } from '@material-ui/core';
import Topbar from '../../Topbar';
import { createMuiTheme,MuiThemeProvider } from '@material-ui/core/styles';
import * as actionTypes from '../../../../../store/actions/clinicalNote/clinicalNoteActionType';
import moment from 'moment';
import EventEmitter from '../../../../../utilities/josCommonUtilties';
import _ from 'lodash';
import * as commonConstants from '../../../../../constants/common/commonConstants';
import * as messageType from '../../../../../store/actions/message/messageActionType';


const theme = createMuiTheme({
  overrides: {
    PrivateNotchedOutline: {
      root: {
        border: 0
      }
    },
    MuiOutlinedInput: {
      notchedOutline: {
        border: 0
      }
    },
    MuiInputBase: {
      input:{
        '&::-webkit-input-placeholder':{
          color: '#a7a7a7',
          opacity: 1
        }
      }
    }
  }
});

class NoteInputArea extends Component {
  constructor(props){
    super(props);
    this.inputRef = React.createRef();
    this.inputContainerRef = React.createRef();
    const { value } = props;
    this.state={
      editMode: false,
      displayMode:'view',
      contentVal: value,
      templates: null,
      hasRetrieve: false,
      retrieveOpen: false,
      templateOpen: false,
      assessmentTextList:[],
      previousDxTextList:[],
      chronicProblemTextList:[],
      previousIOETextList:[],
      previousMOETextList:[],

      previousCurrentMoeTextList:[],
      previousSAAMTextList:[],
      previousHMTextList:[]
    };
  }

  UNSAFE_componentWillMount(){
    EventEmitter.on('clinical_note_copy', this.handleClinicalNoteCopyEvent);
  }

  componentDidMount(){
    let { editMode } = this.props;
    this.props.onRef && this.props.onRef(this);
    if (editMode) {
      this.setState({
        displayMode:'edit'
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    let { editMode } = this.state;
    if (editMode !== nextProps.editMode) {
      if (nextProps.editMode) {
        this.setState({
          editMode:true,
          displayMode:'edit'
        },()=>{
          let _that = this.inputRef.current;
          let _container = this.inputContainerRef.current;
          if (_that) {
            _that.focus();
            setTimeout(function () {
              _container.scrollIntoView({behavior: 'smooth'});
              _that.setSelectionRange(_that.selectionStart+_that.value.length, _that.selectionStart+_that.value.length);
            }, 0);
          }
        });
      }
    }
  }

  componentWillUnmount(){
    EventEmitter.remove('clinical_note_copy', this.handleClinicalNoteCopyEvent);
  }

  handleClinicalNoteCopyEvent = (payload) => {
    const { latestCursor=null,id='' } = this.props;
    if (latestCursor&&latestCursor===id) {
      let result = '';
      result = payload.copyNoteContent;
      this.insertTextInTextArea(result,false);
    }
  }

  accessCheckIn = (encounterId) =>{
    let { dispatch, loginInfo,id, noteId, noteTypeId, handleTextFieldFocus, updateState, setPastTimeout, isPastEncounter } = this.props;
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
          this.setState({
            displayMode:'edit'
          },()=>{
            if (this.inputContainerRef.current) {
              this.inputContainerRef.current.scrollIntoView({behavior: 'smooth'});
            }
          });
          if(isPastEncounter) {
            updateState&&updateState({
              pastEditFlag:''
            });
          } else {
            updateState&&updateState({
              currentEditFlag:''
            });
          }
          handleTextFieldFocus&&handleTextFieldFocus(id, encounterId, noteId, noteTypeId);
          setPastTimeout&&setPastTimeout(encounterId);
        }else{
          if(isPastEncounter) {
            updateState&&updateState({
              pastEditFlag:data.data
            });
          } else {
            updateState&&updateState({
              currentEditFlag:''
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

  handleFocus = () => {
    const { encounterId, currentEditFlag, isPastEncounter, insertClinicalnoteLog, topbarProps, typeId } = this.props;
    const {patientKey} = topbarProps;
    if(!isPastEncounter){
      let name = 'Action: ' + commonConstants.INSERT_LOG_STATUS.Click + ' \'Click to Add\' in current encounter (Note Type ID: ' + typeId + '), PMI:' + patientKey + ', patientKey:' + encounterId + '';
      insertClinicalnoteLog&&insertClinicalnoteLog(name,'');
    }else {
      let name = 'Action: ' + commonConstants.INSERT_LOG_STATUS.Click + ' \'Click to Add\' in past encounter (Note Type ID: ' + typeId + '), PMI:' + patientKey + ', patientKey:' + encounterId + '';
      insertClinicalnoteLog && insertClinicalnoteLog(name, '');
    }
    if(isPastEncounter||(!currentEditFlag&&currentEditFlag!=='N'&&!isPastEncounter)){
      this.accessCheckIn(encounterId);
    }
  }

  handleTextChange = e => {
    const { encounterId, noteId, onChange }=this.props;
    let value = e.target.value;
    this.setState({contentVal:value});
    onChange&&onChange(value, noteId, encounterId);
  }

  resetState = () => {
    this.setState({
      displayMode:'view',
      contentVal:''
    });
  }

  toggleRetrieve=()=>{
    const {topbarProps,insertClinicalnoteLog,typeId,clinicalnoteId}=this.props;
    const {dispatch,patientKey,encounterDate,encounterId,loginInfo} = topbarProps;
    let { service,clinic } = loginInfo;
    let { retrieveOpen } = this.state;
    if (!retrieveOpen) {
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Retrieve' from toolbar (Type ID: ${typeId}; Clinical Note ID: ${clinicalnoteId}), PMI: ${patientKey}, EncounterId: ${encounterId}`;
      insertClinicalnoteLog && insertClinicalnoteLog(name, '/clinical-note/clinicalNote/previousDataCopies');
      dispatch({
        type:actionTypes.GET_COPY_DATA,
        params:{
          patientKey,
          encounterId,
          encounterDate: moment(encounterDate).format('YYYY-MM-DD'),
          encounterClinic:clinic.siteCd,
          serviceCd: service.serviceCd
        },
        callback:(data)=>{
          this.setState({
            assessmentTextList: data.copyAssmentStr == null ? [] : data.copyAssmentStr,
            previousCurrentMoeTextList: data.copyCurMoeStr == null ? [] : data.copyCurMoeStr,
            previousSAAMTextList: data.copyCurSaamStr == null ? [] : data.copyCurSaamStr,
            previousHMTextList: data.copyCurMedicalHistoryStr == null ? [] : data.copyCurMedicalHistoryStr,
            previousDxTextList: data.copyDxStr == null ? [] : data.copyDxStr,
            chronicProblemTextList: data.copyChronicProblemStr == null ? [] : data.copyChronicProblemStr,
            previousIOETextList: data.copyIoeStr == null ? [] : data.copyIoeStr,
            previousMOETextList: data.copyMoeStr == null ? [] : data.copyMoeStr
          });
        }
      });
      this.setState({ retrieveOpen: !retrieveOpen});
    }

    this.setState({
      retrieveOpen:!this.state.retrieveOpen
    });
  }

  insertTextInTextArea=(value,type)=>{
    let { encounterId, noteId, onChange } = this.props;
    let _thisInput = this.inputRef.current;
    if (_thisInput) {
      let startStr = _thisInput.selectionStart;
      let noteVal = _thisInput.value;
      let preText = noteVal.substring(0, startStr);
      let lastText = noteVal.substring(startStr, noteVal.length);
      let result;
      if(preText != '' && !type){
         result = preText + '\n' + value + lastText;
         startStr += 1;
      }else{
         result = preText + value + lastText;

      }
      setTimeout(() => {
        _thisInput.focus();
        _thisInput.setSelectionRange(startStr + value.length, startStr + value.length);
      }, 20);
      this.setState({ contentVal: result });
      onChange && onChange(result, noteId, encounterId);
    }
  }

  handleNoteCopy=(value)=>{
    let result = '';
    value.forEach((item, index) => {
      if (value.length - 1 === index) {
        result = result + item;
      } else {
        result = result + item + '\n';
      }
    });
    let oldValue = '';
    oldValue = result;
    this.insertTextInTextArea(oldValue,false);
  }

  handleNoteAppend=(value, type)=>{
    const {topbarProps, insertClinicalnoteLog,typeId,clinicalnoteId}=this.props;
    const {patientKey,encounterId} = topbarProps;
    if(!type){
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} special character: special character from toolbar (Type ID: ${typeId};Clinical Note ID: ${clinicalnoteId}),PMI: ${patientKey}`;
      insertClinicalnoteLog && insertClinicalnoteLog(name, '');
    }else{
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Select} template: ${type} in dropdown list, PMI: ${patientKey}, EncounterId: ${encounterId}`;
      insertClinicalnoteLog && insertClinicalnoteLog(name, '', value);
    }
    this.insertTextInTextArea(value,!type);
  }

  toggleTemplate=()=>{
    if(!this.state.templateOpen){
      const {topbarProps,insertClinicalnoteLog,typeId,clinicalnoteId}=this.props;
      const {dispatch,currentServiceCd,currentClinicCd,userLogName,patientKey,encounterId}=topbarProps;
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Template' from toolbar (Type ID: ${typeId}; Clinical Note ID: ${clinicalnoteId}), PMI: ${patientKey}, EncounterId: ${encounterId}`;
      insertClinicalnoteLog && insertClinicalnoteLog(name, '/clinical-note/clinicalNoteTemplate');
      dispatch({
        type:actionTypes.GET_TEMPLATE_DATA_LIST,
        templateParams:{
          currentServiceCd,
          userLogName,
          currentClinicCd,
          typeId
        },
        callback:(data)=>{
          this.setState({
            templates: data.data
          });
        }
      });
      this.setState({ templateOpen: !this.state.templateOpen});
    }else{
      this.setState({
        templateOpen:!this.state.templateOpen
      });
    }
  }

  handleDragOver = event => {
    event.preventDefault();
    let { originDrag = false } = this.props;
    event.dataTransfer.dropEffect = originDrag?'all':'none';
  }

  handleDrop = event => {
    event.preventDefault();
    const { updateState, insertClinicalnoteLog } = this.props;
    insertClinicalnoteLog&&insertClinicalnoteLog(commonConstants.INSERT_LOG_STATUS.Drop+' data finish','');
    let noteVal = event.dataTransfer.getData('text/plain');
    this.insertTextInTextArea(noteVal,false);
    updateState&&updateState({
      originDrag:false
    });
  }

  handleEditFocus = () => {
    const { id,updateState } = this.props;
    updateState&&updateState({
      latestCursor:id
    });
  }

  handleAddDragOver = event => {
    event.preventDefault();
    let { originDrag = false } = this.props;
    event.dataTransfer.dropEffect = originDrag?'all':'none';
  }

  handleAddDrop = event => {
    event.preventDefault();
    const { updateState, insertClinicalnoteLog } = this.props;
    insertClinicalnoteLog&&insertClinicalnoteLog(commonConstants.INSERT_LOG_STATUS.Drop+' new data finish','');
    let noteVal = event.dataTransfer.getData('text/plain');
    this.handleFocus();
    setTimeout(() => {
      EventEmitter.emit('clinical_note_copy',{copyNoteContent:noteVal});
    },1000);
    updateState&&updateState({
      originDrag:false
    });
  }

  render() {
    const { classes, topbarProps,isPastEncounter,currentEditFlag,noteTypeId,insertClinicalnoteLog } = this.props;
    let { displayMode,contentVal,retrieveOpen } = this.state;
    let { loginInfo } = topbarProps;
    const topbarProps1={
      toggleTemplate:this.toggleTemplate,
      onClick:this.handleNoteAppend,
      onCopy:this.handleNoteCopy,
      // onItemCopy:this.handleItemCopy,
      templateOpen:this.state.templateOpen,
      templates:this.state.templates||{},
      retrieveOpen,
      toggleRetrieve:this.toggleRetrieve,
      loginInfo,
      isPastEncounter,
      assessmentTextList:this.state.assessmentTextList,
      previousDxTextList:this.state.previousDxTextList,
      chronicProblemTextList:this.state.chronicProblemTextList,
      previousIOETextList:this.state.previousIOETextList,
      previousMOETextList:this.state.previousMOETextList,

      previousCurrentMoeTextList:this.state.previousCurrentMoeTextList,
      previousSAAMTextList:this.state.previousSAAMTextList,
      previousHMTextList:this.state.previousHMTextList,
      insertClinicalnoteLog,
      topbarProps
    };
    return (
      <div style={{width:'100%',height:'100%'}}>
        {displayMode==='view'?(
          <MuiThemeProvider theme={theme}>
             {currentEditFlag&&currentEditFlag!=='N'&&!isPastEncounter?null:(
               <TextField
                   style={{width:'100%'}}
                   variant="outlined"
                   placeholder="Click to add..."
                   onClick={this.handleFocus}
                   disabled={currentEditFlag&&currentEditFlag!=='N'&&!isPastEncounter}
                   InputProps={{
                      classes: {
                        input: classes.input
                      }
                   }}
                   inputProps={{
                      style:{
                        height: 19,
                        padding: '0 3px'
                      }
                    }}
                   id={!isPastEncounter?'current_encounter_'+noteTypeId:'past_encounter_'+noteTypeId}
                   onDragOver={this.handleAddDragOver}
                   onDrop={this.handleAddDrop}
               />
             )}
          </MuiThemeProvider>
        ):
        (
          <Grid container ref={this.inputContainerRef}>
            <Topbar {...topbarProps1} />
            <Grid item xs={12}>
              <TextField
                  inputRef={this.inputRef}
                  autoFocus
                  style={{width:'100%'}}
                  variant="outlined"
                  multiline
                  // rows={5}
                  rowsMax={9999}
                  value={contentVal}
                  onFocus={this.handleEditFocus}
                  onChange={this.handleTextChange}
                  onDragOver={this.handleDragOver}
                  onDrop={this.handleDrop}
              />
            </Grid>
          </Grid>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    loginInfo: {
      ...state.login.loginInfo,
      service:state.login.service,
      clinic:state.login.clinic
    }
  };
}

export default connect(mapStateToProps)(withStyles(styles)(NoteInputArea));
