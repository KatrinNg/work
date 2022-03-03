/*
 * Front-end UI for insert/update clinical note template
 * Insert template Action: [editTemplate.js] handleOk ->
 * -> action: ADDTEMPLATE_DATA
 * -> [medicalSummarySaga.js] addTemplateData
 * -> Backend API = clinical-note/insertClinicalNoteTemplate
 * Update template Action: [editTemplate.js] handleOk ->
 * -> action: EDITTEMPLATE_DATA
 * -> [medicalSummarySaga.js] editTemplateData
 * -> Backend API = clinical-note/updateClinicalNoteTemplate
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DialogActions, DialogTitle, Dialog, Paper, Typography, TextField, Grid, withStyles } from '@material-ui/core';
// import { withStyles } from '@material-ui/core/styles';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import * as manageTemplateActionType from '../../../store/actions/clinicalNoteTemplate/manageClinicalNoteTemplateActionType';
import * as messageTypes from '../../../store/actions/message/messageActionType';
import * as commonTypes from '../../../store/actions/common/commonActionType';
import { style } from './manageClinicalNoteTemplateCss';
import { MANAGE_TEMPLATE_CODE } from '../../../constants/message/manageTemplateCode';
import Draggable from 'react-draggable';
import JCustomizedSelectFieldValidator from '../../../components/JSelect/JCustomizedSelect/JCustomizedSelectFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import en_US from '../../../locales/en_US';
import * as commonConstants from '../../../constants/common/commonConstants';
import * as commonUtils from '../../../utilities/josCommonUtilties';

function PaperComponent(props) {
  return (
    <Draggable
        enableUserSelectHack={false}
        onStart={(e) => e.target.getAttribute('customdrag') === 'allowed'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class EditTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.open,
      fullWidth: true,
      nameValue: '',
      textValue: '',
      serviceCd: JSON.parse(sessionStorage.getItem('service')).serviceCd,
      clinicCd:  JSON.parse(window.sessionStorage.getItem('clinic')).clinicCd,
      nameErrorFlag: false,
      textErrorFlag: false,
      editFlag: false,
      noteTypeErrorFlag: false,
      nameValidation:'This field is required.'
    };
  }

  handelChange = (e) => {
    let targetName = e.target.name;
    let name = `${targetName}Value`;
    let errorFlag = `${targetName}ErrorFlag`;
    let flag = false;
    if( e.target.value.trim() === ''){
        flag = true;
        if(targetName==='name'){
            this.setState({
                [name]: e.target.value,
                nameValidation: 'This field is required.',
                [errorFlag]: flag,
                editFlag: true
              });
        }else{
            this.setState({
                [name]: e.target.value,
                [errorFlag]: flag,
                editFlag: true
              });
        }
    }else{
        this.setState({
            [name]: e.target.value,
            [errorFlag]: flag,
            editFlag: true
          });
    }
  }

  handleCancel = () => {
    let { handleDialogClose,insertClinicalNoteTemplateLog } = this.props;
    let { editFlag } = this.state;
    if (editFlag) {
      let payload = {
        msgCode: MANAGE_TEMPLATE_CODE.IS_CLOSE_DIALOG,
        btnActions: {
          // Yes
          btn1Click: () => {
            this.setState({
              nameErrorFlag: false,
              textErrorFlag: false,
              nameValue: '',
              textValue: '',
              editFlag: false,
              noteTypeErrorFlag:false
            });
            let name = commonUtils.commonMessageLog(MANAGE_TEMPLATE_CODE.IS_CLOSE_DIALOG, 'Yes', '[Clinical Note Template Maintenance Dialog]');
            insertClinicalNoteTemplateLog&&insertClinicalNoteTemplateLog(name,'');
            handleDialogClose && handleDialogClose();
          },btn2Click:()=>{
            let name = commonUtils.commonMessageLog(MANAGE_TEMPLATE_CODE.IS_CLOSE_DIALOG, 'No', '[Clinical Note Template Maintenance Dialog]');
            insertClinicalNoteTemplateLog&&insertClinicalNoteTemplateLog(name,'');
          }
        }
      };
      this.props.dispatch({
        type: messageTypes.OPEN_COMMON_MESSAGE,
        payload
      });
    } else {
      this.setState({
        nameValue: '',
        textValue: '',
        nameErrorFlag: false,
        textErrorFlag: false,
        editFlag: false,
        noteTypeErrorFlag:false
      });
      insertClinicalNoteTemplateLog&&insertClinicalNoteTemplateLog(`[Clinical Note Template Maintenance Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Cancel' button`,'');
      handleDialogClose && handleDialogClose();
    }
  }
  handleClose = () =>{
    this.setState({
        nameValue: '',
        textValue: '',
        nameErrorFlag: false,
        textErrorFlag: false,
        editFlag: false,
        nameValidation: 'This field is required.',
        noteTypeErrorFlag:false
      });
  }
  handleOk = () => {
    let { handleDialogSaveClose, refreshPageData, selectObj, isDisplayNoteType,commonMessageList } = this.props;
    let selectTypeId = this.props.selectObj.typeId;
    let { typeId } = selectObj;
    let { nameValue, textValue } = this.state;
    if (this.state.nameErrorFlag || this.state.textErrorFlag || (this.state.noteTypeErrorFlag && isDisplayNoteType) ? true : false) {
      return;
    }
    let editObj = this.props.selectObj;
    let editRowObj = this.props.selectRowObj;
    let templateList = this.props.templateList;
    let codeClinicalnoteTmplTypeCd = this.props.codeClinicalnoteTmplTypeCd;
    // templateList[0].typeId = typeId;
    if (editObj.templateName === null) {
      if (nameValue === '' || textValue === '' || (!selectTypeId && isDisplayNoteType)) {
        this.setState({
          nameErrorFlag: nameValue === '' ? true : false,
          textErrorFlag: textValue === '' ? true : false,
          nameValidation: 'This field is required.',
          noteTypeErrorFlag: !selectTypeId ? true : false
        });
        return;
      }
      let params = {
        dtos: templateList,
        insertTemplateDto:
        {
          clinicalnoteTemplateId: 0,
          codeClinicalnoteTmplTypeCd: codeClinicalnoteTmplTypeCd,
          createdBy: '',
          createdDtm: '',
          sequence: 0,
          serviceCd: this.state.serviceCd,
          clinicCd: this.state.clinicCd,
          templateName: nameValue.trim(),
          templateText: textValue,
          updatedBy: '',
          updatedByName: '',
          updatedDtm: '',
          userId: '',
          version: '',
          deleteInd: '',
          typeId: typeId
        },
        selectedSeq: editRowObj != null ? editRowObj.sequence : ''
      };
        this.props.dispatch({ type: commonTypes.OPEN_COMMON_CIRCULAR_DIALOG });
        this.props.dispatch({
            type: manageTemplateActionType.ADDTEMPLATE_DATA,
            params,
            callback: (data) => {
              if (data.respCode === 0) {
                let payload = {
                  msgCode: data.msgCode,
                  showSnackbar: true
                };
                this.props.dispatch({type: messageTypes.OPEN_COMMON_MESSAGE, payload});
                handleDialogSaveClose && handleDialogSaveClose('Add', params.insertTemplateDto.templateName, params.insertTemplateDto.templateText);
              } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                let payload = {
                  msgCode: data.msgCode,
                  btnActions: {
                    btn1Click: () => {
                      refreshPageData&&refreshPageData();
                    }
                  }
                };
                this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload});
              } else {
                let message=commonMessageList.find(item => item.messageCode === data.msgCode);
                if(!!message){
                  // let msgDescription=message.description.replace('%GroupName%','Clinical Template Name');
                  this.setState({
                      nameValidation: message.description,
                      nameErrorFlag: true
                  });
                }
              }
            }
        });
    } else {
      let insertTemplateDto = {
        clinicalnoteTemplateId: editRowObj.clinicalnoteTemplateId,
        codeClinicalnoteTmplTypeCd: editRowObj.codeClinicalnoteTmplTypeCd,
        createdBy: editRowObj.createdBy,
        createdDtm: editRowObj.createdDtm,
        sequence: editRowObj.sequence,
        serviceCd: editRowObj.serviceCd,
        clinicCd: editRowObj.clinicCd,
        templateName: this.state.nameValue === '' ? this.props.selectObj.templateName.trim() : this.state.nameValue.trim(),
        templateText: this.state.textValue === '' ? this.props.selectObj.templateText : this.state.textValue,
        updatedB: editRowObj.updatedB,
        updatedByName: editRowObj.updatedByName,
        updatedDtm: editRowObj.updatedDtm,
        userId: editRowObj.id,
        version: editRowObj.version,
        deleteInd: '',
        typeId: typeId
      };
      let params = {
        dtos: templateList,
        insertTemplateDto,
        selectedSeq: editRowObj.sequence ? editRowObj.sequence : ''
      };
      this.props.dispatch({ type: commonTypes.OPEN_COMMON_CIRCULAR_DIALOG });
      this.props.dispatch({
        type: manageTemplateActionType.EDITTEMPLATE_DATA,
        params,
        callback: (data) => {
          if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
            let payload = {
              msgCode: data.msgCode,
              btnActions: {
                btn1Click: () => {
                  refreshPageData&&refreshPageData();
                }
              }
            };
            this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload});
          } else {
            if (data.respCode === 0) {
              handleDialogSaveClose && handleDialogSaveClose('Edit', insertTemplateDto.templateName, insertTemplateDto.templateText);
              let payload = {
                  msgCode: data.msgCode,
                  showSnackbar: true
              };
              this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload});
            }else{
              let message=commonMessageList.find(item => item.messageCode === data.msgCode);
              if(!!message){
                let msgDescription=message.description.replace('%GroupName%','Clinical Template Name');
                this.setState({
                  nameValidation: msgDescription,
                  nameErrorFlag: true
                });
              }
            }
          }
        }
      });
    }
}

  handleEscKeyDown = () =>{
    this.handleCancel();
  }

  typeIdOnChange = (e) =>{
    let { updateState, selectObj } = this.props;
    selectObj.typeId = e.value;
    updateState && updateState({selectObj});
    this.setState({
      noteTypeErrorFlag:false
    });
  }

  render() {
    let templateName = this.props.selectObj.templateName;
    let templateText = this.props.selectObj.templateText;
    let selectTypeId = this.props.selectObj.typeId;
    let { isDisplayNoteType } = this.props;
    let { nameErrorFlag, textErrorFlag, noteTypeErrorFlag } = this.state;
    let { classes, noteTypeList } = this.props;
    return (
      <Dialog
          fullWidth={this.state.fullWidth}
          open={this.props.open}
          maxWidth="sm"
          PaperComponent={PaperComponent}
          onEscapeKeyDown={this.handleEscKeyDown}
        //   onClose={this.handleClose}
          onExit={this.handleClose}
      >
        <DialogTitle
            className={classes.dialogTitle}
            id="max-width-dialog-title"
            disableTypography customdrag="allowed"
        >
          Clinical Note Template Maintenance
        </DialogTitle>
        <Typography component="div" className={classes.dialogBorder}>
          <div style={{ display: 'flex', marginTop: 8, marginLeft: 10, marginRight: 13 }}>
            <span style={{ marginRight: 5,marginTop:7 }} className={classes.templatetitle}>Name:</span>
            <TextField
                fullWidth
                name="name"
                defaultValue={templateName}
                autoComplete="off"
                variant="outlined"
                className={classes.inputName}
                inputProps={{
                  maxLength: 255,
                  style: style.input
                }}
                onChange={this.handelChange}
            />
          </div>
          {
            nameErrorFlag ?
              (
                <div><span id="span_editTemplate_name_validation" style={{ marginLeft: '13%' }} className={classes.validation}>{this.state.nameValidation}</span></div>
              ) : null
          }
          {
            isDisplayNoteType ? (
              <>
                <div>
                  <ValidatorForm id="manageTemplateForm" onSubmit={() => { }} ref="form">
                    <Grid container style={{ marginTop: 10,marginLeft: 4 }}>
                      <label className={classes.left_Label}>{en_US.manageTemplate.label_dialog_note_type + ':'}</label>
                      <Grid item
                          style={{ padding: 0}}
                          xs={8}
                      >
                        <JCustomizedSelectFieldValidator
                            className={classes.favorite_category}
                            id={'manangeClinicalNoteTemplateNoteType'}
                            msgPosition="bottom"
                            options={noteTypeList.map((item) => ({ value: item.typeId, label: item.typeDesc }))}
                            onChange={this.typeIdOnChange}
                            value={selectTypeId}
                            width={'none'}
                        />
                      </Grid>
                    </Grid>
                  </ValidatorForm>
                </div>
                {
                  noteTypeErrorFlag ?
                  (
                    <div><span id="span_editTemplate_noteType_validation" style={{ marginLeft: '13%' }} className={classes.validation}>This field is required.</span></div>
                  ) : null
                }
              </>
            ) : null
          }
          <span><hr /></span>
          <div style={{ marginLeft: 10, marginRight: 30 }}>
            <div>
              <div>
                <span className={classes.templatetitle}>Text:</span>
              </div>
              <textarea
                  name="text"
                  defaultValue={templateText}
                  onChange={this.handelChange.bind(this)}
                  className={classes.inputText}
              />
              {
                textErrorFlag ? (
                  <div><span id="span_editTemplate_text_validation" className={classes.validation}>This field is required.</span></div>
                ) : null
              }
            </div>
          </div>
          <DialogActions>
            <CIMSButton
                classes={{
                  root: classes.btnRoot,
                  label: classes.fontLabel
                }}
                color="primary"
                id={'saveCimsButton'}
                onClick={this.handleOk}
                size="small"
                variant="contained"
            >
              Save
            </CIMSButton>
            <CIMSButton
                classes={{
                  root: classes.btnRoot,
                  label: classes.fontLabel
                }}
                color="primary"
                id={'cancelCimsButton'}
                onClick={this.handleCancel}
                size="small"
                variant="contained"
            >
              Cancel
            </CIMSButton>
          </DialogActions>
        </Typography>
      </Dialog>
    );
  }
}


function mapStateToProps() {
  return {
    // favoriteCategoryListData: state.manageTemplate.favoriteCategoryListData,
    // deleteList: state.manageTemplate.deleteList,
    // recordList:state.manageTemplate.recordList,
  };
}
export default connect(mapStateToProps)(withStyles(style)(EditTemplate));


