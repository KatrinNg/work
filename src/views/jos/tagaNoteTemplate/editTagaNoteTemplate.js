import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, DialogActions, DialogTitle, Dialog, Paper, Typography, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import * as manageTemplateActionType from '../../../store/actions/tagaNoteTemplate/manageTagaNoteTemplateActionType';
import * as messageTypes from '../../../store/actions/message/messageActionType';
import * as commonTypes from '../../../store/actions/common/commonActionType';
import { style } from './manageTagaNoteTemplateCss';
import CustomizedSelectFieldValidator from '../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import { MANAGE_TEMPLATE_CODE } from '../../../constants/message/manageTemplateCode';
import Draggable from 'react-draggable';
import * as commonConstants from '../../../constants/common/commonConstants';
import * as commonUtils from '../../../utilities/josCommonUtilties';

function PaperComponent(props) {
  return (
    <Draggable enableUserSelectHack={false}
        onStart={(e) => e.target.getAttribute('customdrag') === 'allowed'}
    >
      <Paper style={{maxWidth:610}} {...props} />
    </Draggable>
  );
}

class EditTagaNoteTemplate extends Component {
  constructor(props) {
    super(props);
    let deafultTaganoteType = this.props.action === 'add' ?
      'A' :
      (this.props.selectRowObj && this.props.selectRowObj.taganoteType) || 'A';

    this.state = {
      open: this.props.open,
      fullWidth: true,
      nameValue: '',
      textValue: '',
      taganoteType: deafultTaganoteType,
      serviceCd: JSON.parse(sessionStorage.getItem('service')).serviceCd,
      nameErrorFlag: false,
      textErrorFlag: false,
      editFlag: false,
      nameValidation:'This field is required.'
    };
  }

  handelChange = (e) => {
    let targetName = e.target.name;
    let name = `${targetName}Value`;
    let errorFlag = `${targetName}ErrorFlag`;
    let flag = false;
    if (e.target.value.trim() === '') {
      flag = true;
      if (targetName === 'name') {
        this.setState({
          [name]: e.target.value,
          [errorFlag]: flag,
          editFlag: true,
          nameValidation: 'This field is required.'
        });
      } else {
        this.setState({
          [name]: e.target.value,
          [errorFlag]: flag,
          editFlag: true
        });
      }
    } else {
      if (targetName === 'name') {
        this.setState({
          [name]: e.target.value,
          [errorFlag]: flag,
          editFlag: true,
          nameValidation: 'This field is required.'
        });
      } else {
        this.setState({
          [name]: e.target.value,
          [errorFlag]: flag,
          editFlag: true
        });
      }
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
              editFlag: false
            });
            let name = commonUtils.commonMessageLog(MANAGE_TEMPLATE_CODE.IS_CLOSE_DIALOG, 'Yes', '[Encounter Independent Note Template Maintenance Dialog]');
            insertClinicalNoteTemplateLog && insertClinicalNoteTemplateLog(name, '');
            handleDialogClose && handleDialogClose();
          },btn2Click:()=>{
            let name = commonUtils.commonMessageLog(MANAGE_TEMPLATE_CODE.IS_CLOSE_DIALOG, 'No', '[Encounter Independent Note Template Maintenance Dialog]');
            insertClinicalNoteTemplateLog && insertClinicalNoteTemplateLog(name, '');
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
        editFlag: false
      });
      insertClinicalNoteTemplateLog && insertClinicalNoteTemplateLog(`[Encounter Independent Note Template Maintenance Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Cancel' button`, '');
      handleDialogClose && handleDialogClose();
    }
  }

  handleClose = () => {
    this.setState({
      nameErrorFlag: false,
      textErrorFlag: false,
      nameValue: '',
      textValue: '',
      editFlag: false,
      nameValidation: 'This field is required.'
    });
  }

  handleOk = () => {
    let { handleDialogClose ,insertClinicalNoteTemplateLog,commonMessageList,refreshPageData} = this.props;
    if (this.state.nameErrorFlag || this.state.textErrorFlag ? true : false) {
      return;
    }
    let editRowObj = this.props.selectRowObj;
    let templateList = this.props.templateList;
    let codeTaganoteTmplTypeCd = this.props.codeTaganoteTmplTypeCd;
    let taganoteType = this.state.taganoteType;

    if (this.props.action === 'add') {
      if (this.state.nameValue === '' || this.state.textValue === '') {
        this.setState({
          nameErrorFlag: this.state.nameValue === '' ? true : false,
          textErrorFlag: this.state.textValue === '' ? true : false,
          nameValidation:'This field is required.'
        });
        return;
      }
      let params = {
        dtos: templateList,
        insertTemplateDto:
        {
          taganoteTemplateId: 0,
          codeTaganoteTmplTypeCd: codeTaganoteTmplTypeCd,
          taganoteType,
          createdBy: '',
          createdDtm: '',
          displaySequence: 0,
          serviceCd: this.state.serviceCd,
          templateName: this.state.nameValue.trim(),
          templateText: this.state.textValue,
          updatedBy: '',
          updatedByName: '',
          updatedDtm: '',
          userId: '',
          version: '',
          deleteInd: ''
        },
        selectedSeq: editRowObj != null ? editRowObj.displaySequence : ''
      };
      this.props.dispatch({ type: commonTypes.OPEN_COMMON_CIRCULAR_DIALOG });
        this.props.dispatch({
          type: manageTemplateActionType.ADDTEMPLATE_DATA, params, callback: (data) => {
            if (data.respCode === 0) {
            handleDialogClose && handleDialogClose();
            let payload = {
              msgCode: data.msgCode,
              showSnackbar: true
            };
            this.props.dispatch({
              type: messageTypes.OPEN_COMMON_MESSAGE, payload, callback: () => {
                this.setState({
                  editFlag: false,
                  nameValue: '',
                  textValue: '',
                  nameErrorFlag: false,
                  textErrorFlag: false
                });
              }
            });
          }else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
            let payload = {
              msgCode: data.msgCode,
              btnActions: {
                btn1Click: () => {
                  refreshPageData && refreshPageData();
                }
              }
            };
            this.props.dispatch({
              type: messageTypes.OPEN_COMMON_MESSAGE,
              payload
            });
          }else {
            let message=commonMessageList.find(item => item.messageCode === data.msgCode);
            if(!!message){
            let msgDescription=message.description.replace('%GroupName%','Encounter Independent Note Template Name');
                this.setState({
                    nameValidation: msgDescription,
                    nameErrorFlag: true
                });
              }
            }
          }
      });
    }
    else if(this.props.action === 'update') {
      let insertTemplateDto = {
        taganoteTemplateId: editRowObj.taganoteTemplateId,
        codeTaganoteTmplTypeCd: editRowObj.codeTaganoteTmplTypeCd,
        taganoteType,
        createdBy: editRowObj.createdBy,
        createdDtm: editRowObj.createdDtm,
        //sequence: editRowObj.sequence,
        displaySequence: editRowObj.displaySequence,
        serviceCd: editRowObj.serviceCd,
        templateName: this.state.nameValue === '' ? this.props.selectObj.templateName.trim() : this.state.nameValue.trim(),
        templateText: this.state.textValue === '' ? this.props.selectObj.templateText : this.state.textValue,
        updatedB: editRowObj.updatedB,
        updatedByName: editRowObj.updatedByName,
        updatedDtm: editRowObj.updatedDtm,
        userId: editRowObj.id,
        version: editRowObj.version,
        deleteInd: ''
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
                  refreshPageData && refreshPageData();
                }
              }
            };
            this.props.dispatch({
              type: messageTypes.OPEN_COMMON_MESSAGE,
              payload
            });
          } else {
            if (data.respCode === 0) {
              handleDialogClose && handleDialogClose();
              let payload = {
                msgCode: data.msgCode,
                showSnackbar: true
              };
              this.props.dispatch({
                type: messageTypes.OPEN_COMMON_MESSAGE,
                payload,
                callback: (data) => {
                  this.setState({
                      editFlag: false,
                      nameValue: '',
                      textValue: '',
                      nameErrorFlag: false,
                      textErrorFlag: false
                  });
                }
              });
            } else {
              let message=commonMessageList.find(item => item.messageCode === data.msgCode);
              if(!!message){
              //  let msgDescription=message.description.replace('%GroupName%','Encounter Independent Note Template Name');
                this.setState({
                    nameValidation: message.description,
                    nameErrorFlag: true
                });
              }
            }
          }
        }
      });
    }
    insertClinicalNoteTemplateLog && insertClinicalNoteTemplateLog(`[Encounter Independent Note Template Maintenance Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`, 'clinical-note/taganoteTemplate');
  }

  handleEscKeyDown = () =>{
    this.handleCancel();
  }

  handleTaganoteTypeChange = (selectedType) => {
    this.setState({
      taganoteType: selectedType.value
    });
  }

  render() {
    let { templateName, templateText } = this.props.selectObj;
    let { nameErrorFlag, textErrorFlag, taganoteType } = this.state;
    let { classes, taganoteTypeList } = this.props;
    return (
      <Dialog
          fullWidth={this.state.fullWidth}
          open={this.props.open}
          maxWidth={false}
          PaperComponent={PaperComponent}
          onEscapeKeyDown={this.handleEscKeyDown}
          onExit={this.handleClose}
      >
        <DialogTitle
            className={classes.dialogTitle}
            id="max-width-dialog-title"
            disableTypography customdrag="allowed"
        >
          Encounter Independent Note Template Maintenance
        </DialogTitle>
        <Typography component="div" className={classes.dialogBorder}>
          <div style={{ display: 'flex', marginTop: 4, marginBottom: '-4px', marginLeft: 10, marginRight: 13 }}>
            <span className={classes.templatetitle} style={{marginTop: 12}}>EIN Type:</span>
            <div style={{flex: 1}}>
              <ValidatorForm
                  id="manageTemplateForm"
                  onSubmit={() => { }}
                  ref="form"
                  style={{ width: '70%' }}
              >
                  <CustomizedSelectFieldValidator className={classes.favorite_category}
                      id={'bookingEncounterTypeSelectField'}
                      msgPosition="bottom"
                      options={taganoteTypeList}
                      onChange={this.handleTaganoteTypeChange}
                      value={taganoteType}
                  />
              </ValidatorForm>
            </div>
          </div>
          <hr />
          <div style={{ display: 'flex', marginTop: 8, marginLeft: 10, marginRight: 13 }}>
            <span className={classes.templatetitle}>Name:</span>
            <TextField
                fullWidth
                name="name"
                defaultValue={templateName}
                autoComplete="off"
                variant="outlined"
                className={classes.inputName}
                inputProps={{
                maxLength: 255,
                className: classes.inputProps
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
          <span><hr /></span>
          <div style={{ marginLeft: 10, marginRight: 30 }}>
            <div>
              <div style={{marginBottom:10}}>
                <span className={classes.templatetitle}>Text:</span>
              </div>
              <textarea
                  name="text"
                  defaultValue={templateText}
                  onChange={this.handelChange.bind(this)}
                  className={classes.inputText}
              />
              {textErrorFlag ? (<div><span id="span_editTemplate_text_validation" className={classes.validation}>This field is required.</span></div> ) : null}
            </div>
          </div>
          <DialogActions>
            <CIMSButton
                classes={{
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
                classes={{ label: classes.fontLabel}}
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

  };
}
export default connect(mapStateToProps)(withStyles(style)(EditTagaNoteTemplate));