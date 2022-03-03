import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, Grid, TextField } from '@material-ui/core';
import { styles } from './TagContainerStyle';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import moment from 'moment';
import _ from 'lodash';
import Container from 'components/JContainer';
import accessRightEnum from '../../../../../enums/accessRightEnum';
import {COMMON_CODE} from '../../../../../constants/message/common/commonCode';
import classNames from 'classnames';
import Topbar from '../../Topbar';
import EventEmitter from '../../../../../utilities/josCommonUtilties';
import * as actionTypes from '../../../../../store/actions/tagaNote/tagaNoteActionType';
import Enum from '../../../../../enums/enum';
import * as commonConstants from '../../../../../constants/common/commonConstants';
import { openCommonMessage,closeCommonMessage } from '../../../../../store/actions/message/messageAction';
import * as commonUtils from '../../../../../utilities/josCommonUtilties';
import * as utils from '../../../medicalHistories/util/utils';
class TagContainer extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.boxContent = React.createRef();
    this.titleContent = React.createRef();
    const { loginInfo = {}, patientInfo,tagANoteTypes=[]} = props;
    const { service = {}, clinic = {}, userRoleType } = loginInfo; const { patientKey } = patientInfo;
    this.state = {
      params: {
        currentServiceCd: service.serviceCd,
        currentClinicCd: clinic.clinicCd,
        pastPatientKey: null,
        serviceCd: service.serviceCd,
        userRoleType,  //common
        patientKey
      },
      userLogName:JSON.parse(sessionStorage.getItem('loginInfo')).loginName || null,
      contentHeight: undefined,
      anchorEl: null,
      seed: Math.random(),
      logContents: [],
      //temporary change
      isChangedNoteType: false,
      isFetchedNoteTypeTemplate: false,
      clickNoteType: '',
      clickNoteTypeDesc: '',
      noteDetails: '',
      noteTitle: '',
      typeValidate: false,
      noteDetailsValidate: false,
      noteTitleValidate: false,
      latestCursor: null,
      templateOpen: false,
      currentNote: 'N',
      tempCheck:true
    };
  }

//   static getDerivedStateFromProps(props, state) {
//     if (props.displayPastEncounterFlag && state.tempCheck) {
//       return {
//         templateOpen: false,
//         tempCheck: false
//       };
//     } else {
//       if (!props.displayPastEncounterFlag && !state.tempCheck) {
//         return {
//           templateOpen: false,
//           tempCheck: true
//         };
//       }
//       return null;
//     }
//   }
  UNSAFE_componentWillMount() {
    EventEmitter.on('tag_a_note_copy', this.handleClinicalNoteCopyEvent);
  }

  UNSAFE_componentWillReceiveProps(props) {
    let { tempCheck } = this.state;
    let { tagANoteTypes = [] } = props;
    if (props.tagANoteTypes != this.props.tagANoteTypes) {
      let defaultNoteType = tagANoteTypes.find(item => item.isDefault === 'Y');
      if (defaultNoteType != null && defaultNoteType != undefined) {
        this.setState({
          clickNoteType: defaultNoteType.codeTaganoteTypeCd
        });
      }
    }
    if (props.displayPastEncounterFlag && tempCheck) {
      this.setState({
        templateOpen: false,
        tempCheck: false
      });
    } else {
      if (!props.displayPastEncounterFlag && !tempCheck) {
        this.setState({
          templateOpen: false,
          tempCheck: true
        });
      }
    }
    if (props.typeFlag) {
      this.setState({
        typeValidate: true
      });
    }
    if (props.titleFlag) {
      this.setState({
        noteTitleValidate: true
      });
    }
  }

  handleNoteTypeClick= (type) => {
    const { updateState,currentNoteInfo,insertEINLog} = this.props;
    if(type.codeTaganoteTypeCd !== this.state.clickNoteType) {
      this.setState({
        isChangedNoteType: true
      });
    }
    else {
      this.setState({
        isChangedNoteType: false
      });
    }
    this.setState({
        clickNoteType:type.codeTaganoteTypeCd,
        clickNoteTypeDesc: type.typeDesc,
        typeValidate:false
    });
    insertEINLog && insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} '${type.typeDesc}' button in past record`, '');
    currentNoteInfo.taganoteType = type.codeTaganoteTypeCd;
    updateState && updateState({ isContentRightEdit: true, currentNoteChange: true, currentNoteInfo, typeFlag: false });
  }

  inputTextChange = (name, event) => {
    const { updateState, currentNoteInfo } = this.props;
    let value = event.target.value;
    this.setState({
      [name]: value,
      [name + 'Validate']: false
    });
    if (name === 'noteTitle') {
      // 多于255字节做截取
      this.setState({
        [name]: utils.cutOutString(value, 255)
      });
      if (_.trim(value) != '') {
        currentNoteInfo.taganoteTitle = value;
        updateState && updateState({ currentNoteChange: true, currentNoteInfo, titleFlag: false });
      } else {
        currentNoteInfo.taganoteTitle = value;
        updateState && updateState({currentNoteChange: false, currentNoteInfo, titleFlag: true });
      }
    }
    if (name === 'noteDetails') {
      currentNoteInfo.taganoteText = value;
      updateState && updateState({currentNoteInfo });
    }
  }

  generateNoteTypes = (types = []) => {
    let contents = [];
    const { classes } = this.props;
    let { clickNoteType } = this.state;
    for (let index = 0; index < types.length; index++) {
      let type = types[index];
      contents.push(
        <CIMSButton
            inputRef={this.inputRef}
            key={index}
            id={'tag_a_note_button' + index}
            onClick={() => this.handleNoteTypeClick(type)}
            className={classNames({
            [classes.tagNoteButton]: clickNoteType === type.codeTaganoteTypeCd ? true : false
          })}
        >
          {type.typeDesc}
        </CIMSButton>
      );
    }
    return contents;
  }

  validationNoteDto = () => {
    let { clickNoteType, typeValidate } = this.state;
    let flag = true;
    if (clickNoteType === '') {
      typeValidate = true;
      flag = false;
    }
    this.setState({
      typeValidate: typeValidate
    });
    return flag;
  }

  validationCancelNoteDto = () => {
    let { clickNoteType, noteTitle, typeValidate, noteDetails } = this.state;
    let flag = true;
    if (_.trim(noteTitle) != '' || _.trim(noteDetails) != '') {
      if (clickNoteType === '') {
        typeValidate = true;
        flag = false;
        this.setState({ typeValidate: typeValidate });
      }
    }
    return flag;
  }

  handleClickSave = () =>{
    let {clickNoteType,noteTitle,noteDetails}=this.state;
    let {handleTagANoteSave,params,tagANoteTypes}=this.props;
    let  defaultNoteType = tagANoteTypes.find(item => item.isDefault ==='Y');
    let currentNoteInfo={};
    let flag=this.validationNoteDto();
    if(flag){
        currentNoteInfo.taganoteType=clickNoteType;
        currentNoteInfo.taganoteTitle=_.trim(noteTitle);
        currentNoteInfo.taganoteText=_.trim(noteDetails);
        currentNoteInfo.patientKey=params.patientKey;
        //currentNoteInfo.serviceCd=params.serviceCd==='ALL'?this.state.params.serviceCd:params.serviceCd;
        currentNoteInfo.serviceCd=this.state.params.serviceCd;
        handleTagANoteSave && handleTagANoteSave(currentNoteInfo);
        this.setState({
            clickNoteType:defaultNoteType!=null&&defaultNoteType!=undefined?defaultNoteType.codeTaganoteTypeCd:'',
            noteTitle:'',
            noteDetails:''
        });
    }
  }

  handleClickCancleBtnSave = () => {
    let { clickNoteType, noteTitle, noteDetails } = this.state;
    let { handleCancleBtnSave, params, updateState, isContentEdit, insertEINLog,isContentRightEdit} = this.props;
    const { dispatch, mainFrame } = this.props;
    const { subTabsActiveKey, tabsActiveKey } = mainFrame;
    let currentNoteObj = {};
    let checkedFlag = false;
    if (_.trim(noteTitle) != '' || _.trim(noteDetails) != '') {
      checkedFlag = true;
    }
    if (isContentEdit || isContentRightEdit || checkedFlag) {
      dispatch({
        type: 'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
        payload: {
          msgCode: COMMON_CODE.SAVE_WARING,
          params: [
            {
              name: 'title',
              value: 'Encounter Independent Note'
            }
          ],
          btn1AutoClose: false,
          btnActions: {
            btn1Click: () => {
              // if(flag){
              currentNoteObj.taganoteType = clickNoteType;
              currentNoteObj.taganoteTitle = noteTitle;
              currentNoteObj.taganoteText = noteDetails;
              currentNoteObj.patientKey = params.patientKey;
              //currentNoteObj.serviceCd=params.serviceCd==='ALL'?this.state.params.serviceCd:params.serviceCd;
              currentNoteObj.serviceCd = this.state.params.serviceCd;
              let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Encounter Independent Note');
              insertEINLog&&insertEINLog(name, 'clinical-note/taganotes/');
              updateState && updateState({ currentNoteInfo: currentNoteObj }, () => handleCancleBtnSave && handleCancleBtnSave());
              dispatch(closeCommonMessage());
            },
            btn2Click: () => {
              let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Encounter Independent Note');
              insertEINLog && insertEINLog(name, '');
              if (tabsActiveKey == accessRightEnum.patientSpec) {
                dispatch({ type: 'MAIN_FRAME_DELETE_SUB_TABS', params: subTabsActiveKey });
              } else {
                dispatch({ type: 'MAIN_FRAME_DELETE_TABS', params: tabsActiveKey });
              }
            }, btn3Click: () => {
              let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'Encounter Independent Note');
              insertEINLog && insertEINLog(name, '');
            }
          }
        }
      });
    } else {
      if(this.validationCancelNoteDto()){
        insertEINLog && insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Cancel' button in past record`, '');
        if (tabsActiveKey == accessRightEnum.patientSpec) {
          dispatch({ type: 'MAIN_FRAME_DELETE_SUB_TABS', params: subTabsActiveKey });
        } else {
          dispatch({ type: 'MAIN_FRAME_DELETE_TABS', params: tabsActiveKey });
        }
      }
    }
  }

  handleClinicalNoteCopyEvent = (payload) => {
    const { currentNoteInfo, updateState, tagANoteTypes } = this.props;
    let copyNoteContent = payload.copyNoteContent;
    if (_.trim(copyNoteContent) != '') {
      this.insertTextInTextArea(copyNoteContent);
    }
    let taganoteTitle = '';
    let { noteTitle } = this.state;
    taganoteTitle = payload.taganoteTitle;
    // let clickNoteType = payload.taganoteType;
    //预防DB直接改数据，影响Data Save
    let clickNoteType = '';
    for (let index = 0; index < tagANoteTypes.length; index++) {
      const element = tagANoteTypes[index];
      if (element.codeTaganoteTypeCd == payload.taganoteType) {
        clickNoteType = payload.taganoteType;
      }
    }

    if(clickNoteType !== this.state.clickNoteType) {
      this.setState({
        isChangedNoteType: true,
        noteTitle: utils.cutOutString(noteTitle + taganoteTitle, 255),
        clickNoteType: clickNoteType,
        typeValidate: false
      });
    }
    else {
      this.setState({
        isChangedNoteType: false,
        noteTitle: utils.cutOutString(noteTitle + taganoteTitle, 255),
        typeValidate: false
      });
    }

    currentNoteInfo.taganoteTitle = utils.cutOutString(noteTitle + taganoteTitle, 255);
    currentNoteInfo.taganoteType = clickNoteType;
    updateState && updateState({ currentNoteInfo, isContentRightEdit: true });
  }

  handleOnFocus = (value) => {
    const {updateState} = this.props;
    updateState && updateState({
      latestCursor: value
    });
  }

  handleNoteAppend = (value) => {
    let { insertEINLog } = this.props;
    this.insertTextInTextArea(value);
    let valueItem = this.state.templates;
    let content='My Favourite: ';
    let boo = true;
    for (let index = 0; index < valueItem.N.length; index++) {
      const element = valueItem.N[index];
      if (element.templateText === value) {
        boo = false;
      }
      content += element.templateText + '\n';
    }
    if (boo) {
      content = 'Service Favourite: ';
      for (let row = 0; row < valueItem.SN.length; row++) {
        const element = valueItem.SN[row];
        content += element.templateText + '\n';
      }
    }
    insertEINLog&&insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Select} template: ${value}`,'',`Template: ${content}`);
  }

  toggleTemplate=()=>{
    const {insertEINLog} = this.props;
    const { clickNoteType } = this.state;
    // 如过没拿数据或noteType发生了改变则重新拉数据
    if(!this.state.isFetchedNoteTypeTemplate || this.state.isChangedNoteType){
      const {dispatch}=this.props;
      dispatch(
        {
          type:actionTypes.GET_TEMPLATE_DATA_LIST,
          templateParams:{currentServiceCd:this.state.params.currentServiceCd,userLogName:this.state.userLogName, taganoteType: clickNoteType ? clickNoteType : 'A' },
          callback:(favTemplate,serTemplate)=>{
            this.setState({
              templates: { N: favTemplate, SN: serTemplate },
              templateOpen: !this.state.templateOpen,
              isFetchedNoteTypeTemplate: true,
              isChangedNoteType: false
            });
            insertEINLog && insertEINLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} Template button in past record`, `clinical-note/taganoteTemplate/${this.state.params.currentServiceCd}/${this.state.userLogName}`);
          }
        }
      );
    }else{
      this.setState({
        templateOpen:!this.state.templateOpen
      });
    }
  }
  insertTextInTextArea = (value) => {
    const {updateState,currentNoteInfo} = this.props;
    if (value === null) {
      this.setState({ noteDetails: 'null', templateOpen: false });
    } else {
      let _thisInput = this.inputRef.current;
      if (_thisInput) {
        let startStr = _thisInput.selectionStart;
        let noteVal = _thisInput.value;
        let preText = noteVal.substring(0, startStr);
        let lastText = noteVal.substring(startStr, noteVal.length);
        let valueTitle;
        if(preText != ''){
          valueTitle = preText + '\n' + value + lastText;
          startStr += 1;
        }else{
          valueTitle = preText + value + lastText;
        }
        setTimeout(() => {
          _thisInput.focus();
          _thisInput.setSelectionRange(startStr + value.length, startStr + value.length);
        }, 20);
        this.setState({ noteDetails: valueTitle, templateOpen: false });
        currentNoteInfo.taganoteText = valueTitle;
        // let bool = _.trim(value).length > 0 ? true : false;
        // updateState && updateState({ isContentRightEdit: bool, currentNoteInfo });
        updateState && updateState({ currentNoteInfo });
      }
    }
  }

  handleSaveAndPrint = () => {
    let { clickNoteType, clickNoteTypeDesc, noteTitle, noteDetails } = this.state;
    let { handleTagaNoteSaveAndPrint, params, tagANoteTypes } = this.props;
    let defaultNoteType = tagANoteTypes.find(item => item.isDefault === 'Y');
    let currentNoteInfo = {};
    let flag = this.validationNoteDto();
    let noteTypeFlag = defaultNoteType === undefined ? clickNoteType : defaultNoteType.codeTaganoteTypeCd;
    if (flag) {
      currentNoteInfo.taganoteType = clickNoteType;
      currentNoteInfo.taganoteTypeDesc = clickNoteTypeDesc;
      currentNoteInfo.taganoteTitle = noteTitle;
      currentNoteInfo.taganoteText = noteDetails;
      currentNoteInfo.patientKey = params.patientKey;
      currentNoteInfo.serviceCd = this.state.params.serviceCd;
      handleTagaNoteSaveAndPrint && handleTagaNoteSaveAndPrint(currentNoteInfo);
      this.setState({
        clickNoteType: noteTypeFlag,
        noteTitle: '',
        noteDetails: ''
      });
    }
  }

  render() {
    const {
      classes,
      isPastEncounter,
      tagANoteTypes,
      isContentEdit,
      displayPastEncounterFlag
    } = this.props;
    const topbarProps = {
      classes,
      maxHeight: displayPastEncounterFlag,
      toggleTemplate: this.toggleTemplate,
      onClick: this.handleNoteAppend,
      templateOpen: this.state.templateOpen,
      templates: this.state.templates || {}
    };
    const buttonBar = {
      isEdit: isContentEdit,
      defaultCancel:false,
      autoCloseBtn1:false,
      buttons: [
        {
          title: 'Save & Print',
          onClick: this.handleSaveAndPrint,
          id: 'default_save_and_print_button'
        },
        {
          title: 'Save',
          onClick: this.handleClickSave,
          id: 'default_save_button'
        },
        {
            title: 'Cancel',
            onClick: this.handleClickCancleBtnSave,
            id: 'default_cancle_button'
          }
      ],
      isPosition:true
    };

    let desc = `${moment(new Date()).format(Enum.DATE_FORMAT_EDMY_VALUE)}`;
    let { noteTitle, noteDetails } = this.state;
    return (
      <Container container direction={'column'} justify={'space-between'} alignItems={'stretch'} buttonBar={buttonBar}>
        <div
            ref={this.boxContent}
            style={{ height: '100%', paddingLeft: 10 }}
            className={classNames({
            [classes.pastEncounterDiv]: isPastEncounter
          })}
        >
          <Grid container ref={this.titleContent}>
            {/* title */}
            <Grid style={{ display: 'flex', alignItems: 'center' }}>
              {
                <div>
                  <p className={classes.title}>Encounter Independent Note</p><br></br>
                  {/* Description */}
                  <p className={classes.title}>Date: {desc}</p>
                </div>
              }
            </Grid>
          </Grid>
          {/* Content */}
          <div className={classes.content}>
            <Grid container row="true" className={classes.gridContainer}>
              <Grid item xs={1} className={classes.leftLableType}>
                <span className={classes.inputStyle}>Type:</span>
              </Grid>
              <Grid style={{ marginLeft: 11 }} item xs={10}>
                {this.generateNoteTypes(tagANoteTypes)}
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={1} className={classes.leftLableType}></Grid>
              <Grid item>
                <p className={classes.labelErrorMsg} style={{ display: this.state.typeValidate ? 'block' : 'none' }}>Please select a type.</p>
              </Grid>
            </Grid>
            <Grid container row="true" className={classes.gridContainer}>
              <Grid item xs={1} className={classes.leftLableTitle}>
                <span className={classes.inputStyle}>Title:</span>
              </Grid>
              <Grid item xs={10} style={{marginLeft:11}}  justify="flex-end">
                <TextField
                    inputRef={this.inputRef}
                    name="tag_a_note_title"
                    type="text"
                    variant="outlined"
                    className={classes.dmText}
                    id={'tag_a_note_title'}
                    value={noteTitle}
                    onChange={(event) => { this.inputTextChange('noteTitle', event); }}
                    onFocus={() => { this.handleOnFocus('noteTitle'); }}
                    classes={{root:classes.textField}}
                />
              </Grid>
            </Grid>
            <Grid container justify="flex-end" item xs={12}>
            <Grid  style={{width:displayPastEncounterFlag?'21.5%':'14.5%'}}>
                <Topbar {...topbarProps} />
            </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={1} className={classes.leftLableDetail} >
                <span className={classes.inputStyle}>Details:</span>
              </Grid>
              <Grid item xs={10} style={{marginLeft:11}}>
                <TextField
                    inputRef={this.inputRef}
                    id="tagaNoteDetail"
                    classes={{root:classes.textField}}
                    className={classes.tagNoteTestArea}
                    variant="outlined"
                    multiline
                    rows={10}
                    rowsMax={9999}
                    value={noteDetails}
                    onChange={(event) => { this.inputTextChange('noteDetails',event); }}
                    onFocus={() => { this.handleOnFocus('noteDetails'); }}
                />
              </Grid>
            </Grid>
          </div>
        </div>
      </Container>
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
    common: state.common,
    mainFrame:state.mainFrame,
    encounter: state.patient.encounterInfo,
    patientInfo: state.patient.patientInfo,
    appointmentInfo: state.patient.appointmentInfo,
    medicalRecords:state.clinicalNote.medicalListData,
    todayNotes:state.clinicalNote.todayClinicalNoteListData,
    subTabsActiveKey:state.mainFrame.subTabsActiveKey
  };
}
const mapDispatchToProps={
  openCommonMessage,
  closeCommonMessage
};
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(TagContainer));