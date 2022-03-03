import React, { Component } from 'react';
import { styles } from './NoteInputAreaStyle';
import { withStyles, TextField, Grid } from '@material-ui/core';
// import { createMuiTheme } from '@material-ui/core/styles';
import EventEmitter from '../../../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../../../constants/common/commonConstants';
import * as actionTypes from '../../../../../store/actions/tagaNote/tagaNoteActionType';
import classNames from 'classnames';
import Topbar from '../../Topbar';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import _ from 'lodash';
import { connect } from 'react-redux';
import * as utils from '../../../../jos/medicalHistories/util/utils';

class NoteInputArea extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.inputContainerRef = React.createRef();
    const { loginInfo = {}, taganoteTitle, taganoteType, taganoteTypeDesc, value } = props;
    const { service = {}, clinic = {}, userRoleType } = loginInfo;
    this.state = {
      editMode: false,
      contentVal: value,
      noteTitle: taganoteTitle,
      clickNoteType: taganoteType,
      clickNoteTypeDesc: taganoteTypeDesc,
      isChangedNoteType: false,
      isFetchedNoteTypeTemplate: false,
      userLogName: JSON.parse(sessionStorage.getItem('loginInfo')).loginName || null,
      params: {
        currentServiceCd: service.serviceCd,
        currentClinicCd: clinic.clinicCd,
        serviceCd: service.serviceCd,
        userRoleType  //common
      },
      templateOpen: false,
      typeValidate: false
    };
  }

  UNSAFE_componentWillMount() {
    EventEmitter.on('clinical_note_copy', this.handleClinicalNoteCopyEvent);
  }

  componentWillReceiveProps(nextProps) {
    let { editMode } = this.state;
    if (editMode !== nextProps.editMode) {
      if (nextProps.editMode) {
        this.setState({
          editMode: true
        }, () => {
          let _that = this.inputRef.current;
          let _container = this.inputContainerRef.current;
          if (_that) {
            _that.focus();
            setTimeout(function () {
              _container.scrollIntoView({ behavior: 'smooth' });
              _that.setSelectionRange(_that.selectionStart + _that.value.length, _that.selectionStart + _that.value.length);
            }, 0);
          }
        });
      }
    }
    if (nextProps.value !== this.state.value) {
      if (nextProps.editMode) {
        this.setState({
          contentVal: nextProps.value,
          taganoteType: nextProps.taganoteType,
          taganoteTypeDesc: nextProps.taganoteTypeDesc,
          noteTitle: nextProps.taganoteTitle,
          clickNoteType: nextProps.taganoteType,
          clickNoteTypeDesc: nextProps.clickNoteTypeDesc,
          editMode: true,
          typeValidate: nextProps.noteCardTypeFlag
        });
      } else {
        this.setState({
          contentVal: nextProps.value,
          noteTitle: nextProps.taganoteTitle,
          taganoteType: nextProps.taganoteType,
          taganoteTypeDesc: nextProps.taganoteTypeDesc,
          typeValidate: nextProps.noteCardTypeFlag
        });
      }
    }
  }

  componentWillUnmount() {
    EventEmitter.remove('clinical_note_copy', this.handleClinicalNoteCopyEvent);
  }

  handleClinicalNoteCopyEvent = (payload) => {
    const { latestCursor = null, id = '' } = this.props;
    if (latestCursor && latestCursor === id) {
      let { contentVal } = this.state;
      let result = '';
      if (_.trim(contentVal) !== '') {
        result = '\n' + payload.copyNoteContent;
      } else {
        result = payload.copyNoteContent;
      }
      this.insertTextInTextArea(result);
    }
  }

  toggleTemplate = () => {
    const { insertEINLog, dispatch } = this.props;
    const { params, templates, userLogName, templateOpen, clickNoteType, isFetchedNoteTypeTemplate, isChangedNoteType } = this.state;
    // 如果没有加载过template或notetype发生了改变则重新加载template
    if (!isFetchedNoteTypeTemplate || isChangedNoteType) {
      dispatch(
        {
          type: actionTypes.GET_TEMPLATE_DATA_LIST,
          templateParams: { currentServiceCd: params.currentServiceCd, userLogName: userLogName, taganoteType: clickNoteType ? clickNoteType : 'A' },
          callback: (favTemplate, serTemplate) => {
            this.setState({
              templates: { N: favTemplate, SN: serTemplate },
              templateOpen: !templateOpen,
              isFetchedNoteTypeTemplate: true,
              isChangedNoteType: false
            });
            insertEINLog && insertEINLog(`Action：${commonConstants.INSERT_LOG_STATUS.Click} Template button in new record`, `clinical-note/taganoteTemplate/${params.currentServiceCd}/${userLogName}`);
          }
        }
      );
    } else {
      this.setState({
        templateOpen: !templateOpen
      });
    }
  }
  handleNoteTypeClick = (type) => {
    const { originPastNoteInfo, updateState, onChange, insertEINLog } = this.props;
    if(type.codeTaganoteTypeCd !== this.state.clickNoteType) {
      this.setState({
        isChangedNoteType: true
      });
    }
    else {
      this.setState({
        isChangedNoteType: false
      });
    };
    this.setState({
      clickNoteType: type.codeTaganoteTypeCd,
      clickNoteTypeDesc: type.typeDesc
    });
    if (_.trim(type.codeTaganoteTypeCd) != _.trim(originPastNoteInfo.taganoteType) || _.trim(this.state.contentVal) != _.trim(originPastNoteInfo.taganoteText) || _.trim(this.state.noteTitle) != _.trim(originPastNoteInfo.taganoteTitle)) {
      updateState && updateState({ isContentEdit: true, pastNoteChange: true });
      onChange && onChange({ displayButtons: false, clickNoteType: type.codeTaganoteTypeCd, clickNoteTypeDesc: type.typeDesc });
    } else {
      updateState && updateState({ isContentEdit: false, pastNoteChange: false });
      onChange && onChange({ displayButtons: true, clickNoteType: type.codeTaganoteTypeCd, clickNoteTypeDesc: type.typeDesc });
    }
    insertEINLog && insertEINLog(`Action: Click '${type.typeDesc}' button in past record`, '');
  }
  insertTextInTextArea = (value) => {
    const { updateState, onChange, originPastNoteInfo } = this.props;
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
        if (preText != '') {
          valueTitle = preText + '\n' + value + lastText;
          startStr += 1;
        } else {
          valueTitle = preText + value + lastText;
        }
        setTimeout(() => {
          _thisInput.focus();
          _thisInput.setSelectionRange(startStr + value.length, startStr + value.length);
        }, 20);
        //|| _.trim(originPastNoteInfo.taganoteText) != _.trim(this.state.contentVal)
        if (_.trim(valueTitle) != _.trim(originPastNoteInfo.taganoteText) || _.trim(originPastNoteInfo.taganoteType) != _.trim(this.state.clickNoteType)) {
          updateState && updateState({ isContentEdit: true, pastNoteChange: true });
          onChange && onChange({ value: valueTitle, displayButtons: false });
        } else {
          updateState && updateState({ isContentEdit: false, pastNoteChange: false });
          onChange && onChange({ value: valueTitle, displayButtons: true });
        }
        this.setState({ noteDetails: valueTitle, templateOpen: false, contentVal: valueTitle });
      }
    }
  }
  handleNoteAppend = (value) => {
    const { originPastNoteInfo } = this.props;
    this.insertTextInTextArea(value);
    let valueItem = this.state.templates;
    let content = 'My Favourite：';
    let boo = true;
    for (let index = 0; index < valueItem.N.length; index++) {
      const element = valueItem.N[index];
      if (element.templateText === value) {
        boo = false;
      }
      content += element.templateText + '\n';
    }
    if (boo) {
      content = 'Service Favourite：';
      for (let row = 0; row < valueItem.SN.length; row++) {
        const element = valueItem.SN[row];
        content += element.templateText + '\n';
      }
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
            key={index}
            id={'tag_a_note_inputArea_button_' + index}
            onClick={() => this.handleNoteTypeClick(type)}
            className={classNames({
            [classes.tagNoteButton]: clickNoteType === type.codeTaganoteTypeCd
          })}
        >
          {type.typeDesc}
        </CIMSButton>
      );
    }
    return contents;
  }

  handleTextChange = e => {
    const { onChange, originPastNoteInfo, updateState } = this.props;
    let value = e.target.value;
    this.setState({ contentVal: value });
    if (_.trim(value) != _.trim(originPastNoteInfo.taganoteText) || _.trim(originPastNoteInfo.taganoteType) != _.trim(this.state.clickNoteType) || _.trim(originPastNoteInfo.taganoteTitle) != _.trim(this.state.noteTitle)) {
      updateState && updateState({ isContentEdit: true, pastNoteChange: true });
      onChange && onChange({ value: value, displayButtons: false });
    } else {
      updateState && updateState({ isContentEdit: false, pastNoteChange: false });
      onChange && onChange({ value: value, displayButtons: true });
    }
  }
  inputTextChange = e => {
    const { onChange, originPastNoteInfo, updateState } = this.props;
    let value = e.target.value;
    // 多于255字节做截取
    value = utils.cutOutString(value, 255);
    this.setState({
      noteTitle: value
    });
    if (_.trim(value) != _.trim(originPastNoteInfo.taganoteTitle) || _.trim(this.state.contentVal) != _.trim(originPastNoteInfo.taganoteText) || _.trim(this.state.clickNoteType) != _.trim(originPastNoteInfo.taganoteType)) {
      updateState && updateState({ isContentEdit: true, pastNoteChange: true });
      onChange && onChange({ noteTitle: value, displayButtons: false });
    } else {
      updateState && updateState({ isContentEdit: false, pastNoteChange: false });
      onChange && onChange({ noteTitle: value, displayButtons: true });
    }
  }

  render() {
    const {
      classes,
      displayPastEncounterFlag,
      tagANoteTypes
    } = this.props;
    const topbarProps = {
      classes,
      maxHeight: displayPastEncounterFlag,
      toggleTemplate: this.toggleTemplate,
      onClick: this.handleNoteAppend,
      templateOpen: this.state.templateOpen,
      templates: this.state.templates || {}
    };

    let { contentVal } = this.state;
    let { noteTitle } = this.state;
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <Grid container ref={this.inputContainerRef}>
          <Grid container row="true" className={classes.gridContainer}>
            <Grid item className={classes.leftLableType} style={{ marginTop: '2%' }}>
              <span className={classes.inputStyle}>Type:</span>
            </Grid>
            <Grid item style={{ width: '86%', paddingBottom: '2%', paddingLeft: '3%' }}>
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
            <Grid item className={classes.leftLableTitle}>
              <span className={classes.inputStyle}>Title:</span>
            </Grid>
            <Grid item style={{ width: '86%' }}>
              <TextField
                  name="tag_a_note_inputArea_title"
                  type="text"
                  variant="outlined"
                  className={classes.dmText}
                  id={'tag_a_note_inputArea_title'}
                  value={noteTitle}
                  onChange={this.inputTextChange}
                // onFocus={() => { this.handleOnFocus('noteTitle'); }}
                  classes={{ root: classes.textField }}
              />
            </Grid>
          </Grid>
          <Grid container>
            <Grid item style={{ position: 'relative', marginLeft: '80%' }}>
              <Topbar {...topbarProps} />
            </Grid>
          </Grid>
          <Grid item className={classes.leftLableDetail}>
            <span className={classes.inputStyle}>Details:</span>
          </Grid>
          <Grid item style={{ width: '86%' }}>
            <TextField
                inputRef={this.inputRef}
                autoFocus
                style={{ width: '100%' }}
                variant="outlined"
                multiline
                rows={10}
                rowsMax={9999}
                value={contentVal}
                onChange={this.handleTextChange}
                inputProps={{
                style: {
                  padding: '0 3px'
                }
              }}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default connect()(withStyles(styles)(NoteInputArea));
