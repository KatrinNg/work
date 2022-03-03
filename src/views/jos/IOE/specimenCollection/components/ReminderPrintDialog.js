import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Typography, TextField, Card, CardContent } from '@material-ui/core';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import EditTemplateDialog from '../../../../administration/editTemplate/components/EditTemplateDialog';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import CustomizedSelectFieldValidator from '../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import { openCommonMessage } from '../../../../../store/actions/message/messageAction';
import { josPrint, openCommonCircularDialog,closeCommonCircularDialog } from '../../../../../store/actions/common/commonAction';
import { printIoeSpecimenCollectionReminderReport } from '../../../../../store/actions/IOE/specimenCollection/specimenCollectionAction';
import { doAllOperation } from '../../../../../store/actions/IOE/ixRequest/ixRequestAction';
import { isNull, cloneDeep } from 'lodash';
import * as commonUtils from '../../../../../utilities/josCommonUtilties';
import { getState } from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const useStyles = () => ({
  inputStyle: {
    fontWeight: 400,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    display: 'inline-block',
    marginTop: 12
  },
  templateDetailStyle: {
    fontWeight: 'bold',
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  fullWidth: {
    width: '100%'
  },
  checkBoxGrid: {
    marginTop: '-10px'
  },
  normalFont: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  searchGrid: {
    maxWidth: '39%',
    marginTop: -8
  },
  validation: {
    color: '#fd0000',
    margin: '0',
    fontSize: '0.75rem',
    float: 'left',
    minHeight: '1em',
    display: 'block',
    marginTop: 4,
    marginLeft: 12
  },
  templateDetailValidation: {
    color: '#fd0000',
    margin: '0',
    fontSize: '0.75rem',
    float: 'left',
    minHeight: '1em',
    display: 'block',
    marginTop: 4
  },
  templateDetailValidationFail: {
    margin: '0',
    fontSize: '0.75rem',
    float: 'left',
    minHeight: '1em',
    display: 'block',
    marginTop: 4,
    height: 18
  },
  normal_input: {
    float: 'left',
    color:color.cimsTextColor
  },
  fontLabel: {
    fontSize: font.fontSize
  },
  paper: {
    borderRadius: 5,
    minWidth: '44%',
    maxWidth: '100%',
    overflowY: 'unset'
  },
  cardContent: {
    '&:last-child': {
      backgroundColor: color.cimsBackgroundColor,
      paddingBottom: 24
    }
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  },
  input:{
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  },
  selelct:{
      whiteSpace:'pre-wrap'
  }
});

class ReminderPrintDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTemplateId: ' ',
      followUpLocation: '',
      remarkValue: '',
      instructDesc: '',
      selectedTemplate: {},
      changed: false,
      printTimes: 0,
      noTemplate: true,
      multipleParams: {}
    };
  }
  handleCloseDialog = () => {
    const { handleCloseDialog, insertIxEnquiryLog,reminderUpdateState } = this.props;
    insertIxEnquiryLog && insertIxEnquiryLog('[Print Reminder Dialog] Action: Click \'Cancel\' button', '');
    handleCloseDialog && handleCloseDialog();
    reminderUpdateState && reminderUpdateState({ printCheckedFlagSubmit: false });
    this.setState({
      selectedTemplateId: ' ',
      followUpLocation: '',
      remarkValue: '',
      instructDesc: '',
      selectedTemplate: {},
      changed: false,
      printTimes: 0,
      noTemplate: true,
      printSuccess: false
    });
    this.props.closeCommonCircularDialog();
  }


  inputOnchange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      changed: true
    });
  }

  handleTemplateChanged = (e) => {
    const { templateList } = this.props;
    let selectedTemplateId = e.value;
    let selectedTemplate = cloneDeep(templateList).find(function (item) {
      return item.ioeReminderTemplateId === selectedTemplateId;
    });
    if (selectedTemplate.ioeReminderTemplateId && this.valueValidation(selectedTemplate.ioeReminderTemplateId)) {
      let { followUpLocation = ' ', instructDesc = ' ', remarkValue = ' ' } = selectedTemplate;
      followUpLocation = this.valueValidation(followUpLocation) ? followUpLocation : ' ';
      instructDesc = this.valueValidation(instructDesc) ? instructDesc : ' ';
      remarkValue = this.valueValidation(remarkValue) ? remarkValue : ' ';
      this.setState({
        selectedTemplateId: e.value,
        selectedTemplate: selectedTemplate,
        followUpLocation: followUpLocation,
        instructDesc: instructDesc,
        remarkValue: remarkValue,
        changed: false,
        noTemplate: true
      });
    } else {
      this.setState({
        selectedTemplateId: e.value,
        selectedTemplate: selectedTemplate,
        followUpLocation: '',
        instructDesc: '',
        remarkValue: '',
        changed: false,
        noTemplate: false
      });
    }
  }

  //验证值不为空和Null
  valueValidation = (value) => {
    let validationCheck = true;
    if (isNull(value) || (value + '').trim() === '') {
      validationCheck = false;
    }
    return validationCheck;
  }

  handleEscKeyDown = () => {
    this.handleCloseDialog();
  }

  handleClickPrint = (printSuccess) => {
    const { patientDto, insertIxEnquiryLog, specimentCollectionDTSwitch, requestDtos } = this.props;
    let { selectedTemplate, remarkValue, instructDesc, followUpLocation, changed, printTimes } = this.state;
    if (!specimentCollectionDTSwitch) {
      for (let index = 0; index < requestDtos.length; index++) {
        requestDtos[index].specimenCollectDatetime = null;
      }
    }
    if (selectedTemplate.ioeReminderTemplateId && this.valueValidation(selectedTemplate.ioeReminderTemplateId)) {
      this.props.openCommonCircularDialog();
      if (changed) {
        selectedTemplate.remarkValue = remarkValue;
        selectedTemplate.instructDesc = instructDesc;
        selectedTemplate.followUpLocation = followUpLocation;
      }
      let attr = [];
      attr.push(requestDtos[printTimes]);
      let multipleParams = {
        patientDto: patientDto,
        ioeReminderTemplateReportDto: selectedTemplate,
        requestDtos: attr
      };
      this.printMultipleReport(multipleParams);
      let content = `Template ID: ${selectedTemplate.ioeReminderTemplateId};
        Template Name: ${selectedTemplate.templateName};
        Follow up Location: ${followUpLocation};
        Instruction: ${instructDesc};
        Remark: ${remarkValue};`;
      insertIxEnquiryLog && insertIxEnquiryLog('[Print Reminder Dialog] Action: Click \'Print\' button', '', content);
    } else {
      this.setState({ noTemplate: false });
    }
    if (printSuccess && printTimes === requestDtos.length) {
      let payload = {
        msgCode: '101317',
        showSnackbar: true,
        params: [
          { name: 'reportType', value: 'reminder' }
        ]
      };
      this.props.openCommonMessage(payload);
      this.props.closeCommonCircularDialog();
    }
  }

  printMultipleReport = (multipleParams) => {
    let { printTimes } = this.state;
    const { handleMultipleReportCallback, handleCloseDialog, lableIsChecked, outputFormIsChecked } = this.props;
    let { specimentCollectionDTSwitch, requestDtos } = this.props;
    if (!specimentCollectionDTSwitch) {
      for (let index = 0; index < requestDtos.length; index++) {
        requestDtos[index].specimenCollectDatetime = null;
      }
    }
    let params = {
      ioeReminderTemplateReportDto: multipleParams.ioeReminderTemplateReportDto,
      ioeRequestDtos: multipleParams.requestDtos,
      operationType: 'PR',
      patientDto: multipleParams.patientDto,
      userHclDrCode: commonUtils.getUserHclDrCode()
    };
    if (printTimes < requestDtos.length) {
      this.props.openCommonCircularDialog();
      this.props.doAllOperation({
        params,
        callback: (data) => {
          if (data.data.reportData) {
            let params = {
              base64: data.data.reportData, callback: this.handleClickPrint
            };
            this.props.josPrint(params);
            // this.props.closeCommonCircularDialog();
          } else {
            handleCloseDialog && handleCloseDialog();
            this.setState({
              selectedTemplateId: ' ',
              followUpLocation: '',
              remarkValue: '',
              instructDesc: '',
              selectedTemplate: {},
              changed: false,
              printTimes: 0,
              noTemplate: true
            });
            this.handleClickPrint();
            this.props.closeCommonCircularDialog();
          }
          this.setState({
            printTimes: printTimes + 1
          });
        }
      });
    } else {
      if (lableIsChecked || outputFormIsChecked) {
        handleMultipleReportCallback && handleMultipleReportCallback(true);
        this.handleCloseDialog();
      } else {
        handleMultipleReportCallback && handleMultipleReportCallback(false, requestDtos);
        this.handleCloseDialog();
      }
    }
  }

  render() {
    const { classes, open, templateList } = this.props;
    const { selectedTemplate } = this.state;
    return (
      <EditTemplateDialog
          dialogTitle={'Print Reminder'}
          open={open}
          handleEscKeyDown={this.handleEscKeyDown}
          classes={classes}
      >
        <Card
            component="div"
            id={'printReminderDialog'}
            style={{ margin: '15px 15px 8px 15px' }}
        >
          <CardContent classes={{ root: classes.cardContent }}>
            <ValidatorForm onSubmit={() => { }} autoCapitalize="off" >
              <Grid container>
                <Grid item xs={3}>
                  <span className={classes.inputStyle}>Template Name</span>
                </Grid>
                <Grid item xs={8}>
                  <CustomizedSelectFieldValidator
                      id="rminderPrintDialog_Template"
                      value={this.state.selectedTemplateId}
                      selectClassName={classes.selelct}
                      options={templateList.map((item) => ({ value: item.ioeReminderTemplateId, label: item.templateName }))}
                      onChange={(e) => { this.handleTemplateChanged(e); }}
                  />
                  {this.state.noTemplate ? null : (
                    <span className={classes.validation} style={{ lineHeight: 2.5 }}
                        id="rminderPrintDialog_Template_validation"
                    >This field is required.</span>
                  )}
                </Grid>
              </Grid>
              <Grid container style={{ marginTop: 10 }}>
                <Grid item xs={3}>
                  <span className={classes.inputStyle}>Follow up Location</span>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                      type="text"
                      autoCapitalize="off"
                      className={classes.normal_input}
                      id={'tokenTemplateDialog_FollowUpLocation'}
                      name="followUpLocation"
                      onChange={this.inputOnchange}
                      style={{ width: '100%' }}
                      value={this.state.followUpLocation}
                      disabled={selectedTemplate.isFollowUpLocationEnable === 'Y' ? false : true}
                      variant="outlined"
                      inputProps={{
                      inputProps: {
                        className:classes.inputProps
                      },
                      InputProps:{
                        classes: {
                          input: classes.input
                        }
                      },
                      style: {
                        color:color.cimsTextColor,
                        backgroundColor: selectedTemplate.isFollowUpLocationEnable === 'Y' ? 'unset' : (selectedTemplate.isFollowUpLocationEnable === undefined ? 'unset' : color.cimsDisableColor)
                      }
                    }}
                  />
                </Grid>
              </Grid>
              <Grid container style={{ marginTop: 10 }}>
                <Grid item xs={3}>
                  <span className={classes.inputStyle}>Instruction</span>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                      autoCapitalize="off"
                      className={classes.normal_input}
                      id={'ReminderPrintDialog_instructDesc'}
                      name="instructDesc"
                      onChange={this.inputOnchange}
                      style={{ width: '100%' }}
                      type="text"
                      value={this.state.instructDesc}
                      variant="outlined"
                      InputProps={{
                      style: {
                        fontSize: font.fontSize,
                        fontFamily: font.fontFamily,
                        color: color.cimsTextColor
                      }
                    }}
                  />
                </Grid>
              </Grid>
              <Grid container style={{ marginTop: 10 }}>
                <Grid item xs={3}>
                  <span className={classes.inputStyle}>Remark</span>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                      autoCapitalize="off"
                      type="text"
                      className={classes.normal_input}
                      id={'reminderPrintDialog_remark'}
                      name="remarkValue"
                      onChange={this.inputOnchange}
                      style={{ width: '100%' }}
                      value={this.state.remarkValue}
                      disabled={selectedTemplate.isRemarkEnable === 'Y' ? false : true}
                      variant="outlined"
                      InputProps={{
                      style: {
                        fontSize: font.fontSize,
                        fontFamily: font.fontFamily,
                        color: color.cimsTextColor,
                        backgroundColor: selectedTemplate.isRemarkEnable === 'Y' ? 'unset' : (selectedTemplate.isRemarkEnable === undefined ? 'unset' : color.cimsDisableColor)
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </ValidatorForm>
          </CardContent>
        </Card>
        <Typography component="div">
          <Grid alignItems="center"  container justify="flex-end">
            <Typography component="div">
              <CIMSButton classes={{  label: classes.fontLabel }}
                  color="primary"
                  id="reminderPrintDialog_btn_print"
                  onClick={() => this.handleClickPrint()}
                  size="small"
              >
                Print
                </CIMSButton>
            </Typography>
            <CIMSButton classes={{ label: classes.fontLabel }}
                color="primary"
                id="reminderPrintDialog_btn_reset"
                onClick={() => this.handleCloseDialog()}
                size="small"
            >
              Cancel
              </CIMSButton>
          </Grid>

        </Typography>
      </EditTemplateDialog>
    );
  }
}

function mapStateToProps(state) {
  return {
    tokenTemplateList: state.tokenTemplateManagement.tokenTemplateList
  };
}
const mapDispatchToProps = {
  openCommonMessage,
  printIoeSpecimenCollectionReminderReport,
  josPrint,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  doAllOperation
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles)(ReminderPrintDialog));
