
/*
 * Front-end UI for token template Management shows page
 * Load Token Template List Action: [tokenTemplateManagement.js] initData -> getTokenTemplateList
 * -> [tokenTemplateManagementAction.js] getTokenTemplateList
 * -> [tokenTemplateManagementSaga.js] getTokenTemplateList
 * -> Backend API = /ioe/listReminderTemplate
 * Save Action: [tokenTemplateManagement.js] Save -> saveReminderTemplateList
 * -> [tokenTemplateManagementAction.js] saveReminderTemplateList
 * -> [tokenTemplateManagementSaga.js] saveReminderTemplateList
 * -> Backend API = /ioe/saveReminderTemplateList
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { style } from './tokenTemplateManagementCss/tokenTemplateManagementCss';
import { withStyles } from '@material-ui/core/styles';
import { AddCircle, Edit, ArrowUpwardOutlined, ArrowDownward } from '@material-ui/icons';
import { Card, CardHeader, CardContent, Grid, Button, Typography } from '@material-ui/core';
import en_US from '../../../../locales/en_US';
import moment from 'moment';
import CIMSTable from '../../../../components/Table/CimsTableNoPagination';
import { getTokenTemplateList, saveReminderTemplateList, getPrintDialogList } from '../../../../store/actions/IOE/tokenTemplateManagement/tokenTemplateManagementAction';
import { TOKEN_TEMPLATE_MANAGEMENT_CODE } from '../../../../constants/message/IOECode/tokenTemplateManagementCode';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import ManageTokenInstruction from '../tokenTemplateManagement/manageTokenInstruction';
import TokenTemplateDialog from './tokenTemplateDialog';
import { openCommonCircularDialog, closeCommonCircularDialog } from '../../../../store/actions/common/commonAction';
import { COMMON_ACTION_TYPE } from '../../../../constants/common/commonConstants';
import { COMMON_CODE } from 'constants/message/common/commonCode';
import { updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../../../enums/accessRightEnum';
import Container from 'components/JContainer';
import PreviewPdfDialog from  '../../MRAM/components/PrintDialog/PreviewPdfDialog';
import { print } from '../../../../store/actions/common/commonAction';
import * as commonConstants from '../../../../constants/common/commonConstants';
import * as commonUtils from '../../../../utilities/josCommonUtilties';

class tokenTemplateManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      serviceCd:JSON.parse(sessionStorage.getItem('service')).serviceCd,//
      // clinicEngDesc:JSON.parse(sessionStorage.getItem('loginInfo')).clinic.engDesc,//暂时无法提供此字段，先写死（by wentao）
      clinicEngDesc: JSON.parse(sessionStorage.getItem('clinic')).clinicName!==undefined?JSON.parse(sessionStorage.getItem('clinic')).clinicName+'('+JSON.parse(sessionStorage.getItem('clinic')).clinicCd+')':JSON.parse(sessionStorage.getItem('clinic')).clinicCd,
      templateList: [],
      isChange: false,
      isSave: true,
      seq: null,
      getSelectRow: null,
      pageNum: null,
      selectRow: null,
      tipsListSize: parseInt(props.sysConfig.TMPL_TIPS_SIZE.value),
	    instructionOpen:false,
      open: false,
      isNew: true,
      ioeTokenTemplateId: '',
      templateDialogRefesh: false,
      previewTitle: '',
      previewShow: false,
      previewData: 'test',
      dispalyState: false,
      tableRows: [
        { name: 'seq', width: 52, label: 'Seq', id: 'Seq' },
        { name: 'templateName', width: 260, label: 'Template Name' },
        { name: 'followUpLocation', width: 'auto', label: 'Follow Up Location' },
        { name: 'instructionName', width: 'auto', label: 'Instruction' },
        { name: 'updatedBy', width: 175, label: 'Updated By' },
        {
          name: 'updatedDtm', label: 'Updated On', width: 175, customBodyRender: (value) => {
            return value ? moment(value).format('DD-MMM-YYYY') : null;
          }
        }
      ],
      tableOptions: {
        rowHover: true,
        rowsPerPage: 5,
        onSelectIdName: 'seq', //显示tips的列
        tipsListName: 'reminderTemplateItems', //显示tips的list
        tipsDisplayListName: 'codeIoeFormItem', //显示tips的列
        tipsDisplayName: 'frmItemName', //显示tips的值
        // onSelectedRow:(rowId,rowData,selectedData)=>{
        //   this.selectTableItem(selectedData);
        // },
        bodyCellStyle: this.props.classes.customRowStyle,
        headRowStyle: this.props.classes.headRowStyle,
        headCellStyle: this.props.classes.headCellStyle
      },
      ioeReminderInstructionId:null,
      InstructionResult:''
    };
  }

  componentDidMount() {
    this.props.ensureDidMount();
    this.initData();
    this.props.updateCurTab(accessRightEnum.tokenTemplateMaintenance, this.doClose);
    this.insertReminderTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} Reminder Template Maintenance`, '/ioe/listReminderTemplate');
  }

  initData = () => {
    let Params = {};
    this.props.getTokenTemplateList({Params, callback:(templateList)=>{
      this.setState({
        isSave:true,
        templateList: templateList,
        seq: null,
        selectRow:null,
        selectObj:null,
        isChange: false
      });
    }});
  };

    //关闭close tab
    doClose = (callback) => {
      let editFlag = this.state.isChange;
      if (editFlag) {
        this.props.openCommonMessage({
          msgCode: COMMON_CODE.SAVE_WARING,
          btnActions: {
            btn1Click: () => {
              this.handleClickSave();
              let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Reminder Template Maintenance');
              this.insertReminderTemplateLog(name,'/ioe/saveReminderTemplateList');
            }, btn2Click: () => {
              let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Reminder Template Maintenance');
              this.insertReminderTemplateLog(name,'');
              callback(true);
            }, btn3Click: () => {
              let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'Reminder Template Maintenance');
              this.insertReminderTemplateLog(name, '');
            }
          },
          params: [
            {
              name: 'title',
              value: 'Reminder Template Maintenance'
            }
          ]
        });
      }
      else {
        this.insertReminderTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close Reminder Template Maintenance`,'');
        callback(true);
      }
    }

  //获得选中行数据
  getSelectRow = (data) => {
      this.setState({
        seq: data.seq,
        selectRow:data.seq,
        selectObj:data
      });
    }
  //检查是否选中行数据，未选中提示相应提示
  checkSelect(msgCode){
    if(this.state.seq===null){
      let payload = {
        msgCode:msgCode,
        btnActions: {
          // Yes
          btn1Click: () => {
          }
        }
      };
      this.props.openCommonMessage(payload);
    }
  }

  handleCheckSave = (code) => {
    let payload = {
      msgCode:code,
      btnActions: {
        // Yes
        btn1Click: () => {
        }
      }
    };
    this.props.openCommonMessage(payload);
  }

  handleClickAdd = () => {
    let isSave = this.state.isSave;
	  if(!isSave){ //提示有其他操作判断未保存
      this.handleCheckSave(TOKEN_TEMPLATE_MANAGEMENT_CODE.SAVE_TEMPLATE_BEFORE_THE_ADD);
    } else {
      this.setState({templateDialogRefesh:false});
      this.handleOpenTokenTemplateDialog('I');
      //to do
    }
    this.insertReminderTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Add' button`, '');
  }

  handleClickEdit=()=>{
    let isSave = this.state.isSave;
    let selectObj=this.state.selectObj;
    if (!isSave) { //提示有其他操作判断未保存
      this.handleCheckSave(TOKEN_TEMPLATE_MANAGEMENT_CODE.SAVE_TEMPLATE_BEFORE_THE_EDIT);
    } else if (!selectObj) {  //提示未选中行
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (Template ID: null; Template Name: null)`;
      this.insertReminderTemplateLog(name,'');
      let payload = {
        msgCode: TOKEN_TEMPLATE_MANAGEMENT_CODE.IS_SELECTED_TEMPLATE_EDIT,
        params: [
          { name: 'descriptionType', value: 'edit' },
          { name: 'headerType', value: 'Edit' }
        ],
        btnActions: {
          // Yes
          btn1Click: () => {
          }
        }
      };
      this.props.openCommonMessage(payload);
    }
    else {
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (Template ID: ${selectObj.ioeReminderTemplateId}; Template Name: ${selectObj.templateName});`;
      this.insertReminderTemplateLog(name,'');
      this.setState({ioeTokenTemplateId:selectObj.ioeReminderTemplateId,templateDialogRefesh:false});
      this.handleOpenTokenTemplateDialog('U');
    }
  }

  handleClickInstruction = () => {
    let isSave = this.state.isSave;
    if (!isSave) {
      this.handleCheckSave(TOKEN_TEMPLATE_MANAGEMENT_CODE.SAVE_TEMPLATE_BEFORE_OPEN_TOKEN_INSTRUCTION);
    } else {
      this.setState({ instructionOpen: true,InstructionResult:'[Manage Reminder Instruction]' });
      this.insertReminderTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Instruction' button`, '');
    }
  }

  handleClickInstructionDialog = () => {
    let isSave = this.state.isSave;
    if (!isSave) {
      this.handleCheckSave(TOKEN_TEMPLATE_MANAGEMENT_CODE.SAVE_TEMPLATE_BEFORE_OPEN_TOKEN_INSTRUCTION);
    } else {
      this.setState({ instructionOpen: true, InstructionResult: '[Reminder Template Maintenance Dialog] [Manage Reminder Instruction]' });
    }
  }

  handleClickDown = () => {
    let msgCode = TOKEN_TEMPLATE_MANAGEMENT_CODE.IS_SELECTED_TEMPLATE_DOWN;
    this.checkSelect(msgCode);
    let templateList = this.state.templateList;
    let seq = this.state.seq;
    let name = '(No record is selected Template ID: null; Template Name: null)';
    if (seq) {
      let index = this.state.seq - 1;
      if (templateList[index + 1]) {
        name = `(Sequence Number: ${templateList[index].seq}; Template ID: ${templateList[index].ioeReminderTemplateId}; Template Name: ${templateList[index].templateName})`;
        templateList[index].seq = seq + 1;
        templateList[index + 1].seq = seq;
        [templateList[index], templateList[index + 1]] = [templateList[index + 1], templateList[index]];
        templateList[index].operationType = COMMON_ACTION_TYPE.UPDATE;
        templateList[index + 1].operationType = COMMON_ACTION_TYPE.UPDATE;
        this.setState({
          seq: seq + 1,
          selectRow: seq + 1,
          templateList: templateList,
          isSave: false,
          isChange: true
        });
      }
    }
    this.insertReminderTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Down' button ${name}`, '');
  }

  handleClickUp= () => {
    let msgCode = TOKEN_TEMPLATE_MANAGEMENT_CODE.IS_SELECTED_TEMPLATE_UP;
    this.checkSelect(msgCode);
    let templateList = this.state.templateList;
    let seq = this.state.seq;
    let name = '(No record is selected Template ID: null; Template Name: null)';
    if (seq) {
      let index = this.state.seq - 1;
      if (templateList[index - 1]) {
        name = `(Sequence Number: ${templateList[index].seq}; Template ID: ${templateList[index].ioeReminderTemplateId}; Template Name: ${templateList[index].templateName})`;
        templateList[index].seq = index;
        templateList[index - 1].seq = seq;
        [templateList[index], templateList[index - 1]] = [templateList[index - 1], templateList[index]];
        templateList[index].operationType = COMMON_ACTION_TYPE.UPDATE;
        templateList[index - 1].operationType = COMMON_ACTION_TYPE.UPDATE;
        this.setState({
          seq: index,
          selectRow: index,
          templateList: templateList,
          isSave: false,
          isChange: true
        });
      }
    }
    this.insertReminderTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Up' button ${name}`, '');
  }

  handleClickSave = (saveCallback) => {
    const templateList = this.state.templateList;
    let params = templateList;
    this.props.openCommonCircularDialog();//打开保存等待页面，后台调用返回后关闭
    this.props.saveReminderTemplateList({
      params,
      callback: (data) => {
        if(data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          let payload = {
            msgCode: data.msgCode,
            btnActions:
            {
              btn1Click: () => {
                this.refreshPageData(data);
              },
              btn2Click: () => {
                if (typeof saveCallback != 'function' || saveCallback === undefined) {
                  return false;
                } else {
                  saveCallback(true);
                }
                this.props.closeCommonCircularDialog();
              }
            }
          };
          this.props.openCommonMessage(payload);
        }else{
          this.refreshPageData(data);
          if (typeof saveCallback != 'function' || saveCallback === undefined) {
            this.insertReminderTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button `, '/ioe/saveReminderTemplateList');
            return false;
          } else {
            saveCallback();
          }
        }
      }
    });
  }

  refreshPageData = (data) => {
    const params = {};
    this.props.getTokenTemplateList({
      params,
      callback: (templateList) => {
        this.setState({
          isSave: true,
          templateList: templateList,
          seq: null,
          selectRow: null,
          selectObj: null,
          isChange: false
        });
      }
    });
    let payload = {
      msgCode: data.msgCode,
      showSnackbar: true //切换左下角（Snackbar）successfully 消息条
    };
    this.props.openCommonMessage(payload);
  }

  handleClickCancel = () => {
    let isChange = this.state.isChange;
    if (isChange){
      let payload = {
        msgCode :COMMON_CODE.SAVE_WARING,
        btnActions : {
          btn1Click: () => {
            this.initData();
          }
        }
      };
      this.props.openCommonMessage(payload);
    }else {
      this.initData();
    }
  }

  handleInstructionDialogCancel = () =>{
    this.setState({
      instructionOpen:false,
      templateDialogRefesh:true
    });
  }

  handleOpenTokenTemplateDialog=(type)=>{
    if(type==='I'){
      this.setState({
        open:true,
        isNew:true,
        InstructionResult: '[Reminder Template Maintenance Dialog] [Manage Reminder Instruction]'
      });
    }
    else if(type==='U'){
      this.setState({
        open:true,
        isNew:false,
        InstructionResult: '[Reminder Template Maintenance Dialog] [Manage Reminder Instruction]'
      });
    }
  }

  handleCloseTokenTemplateDialog=()=>{
    this.setState({open:false});
  }
  handleClickPrint=()=>{
    let selectObj = this.state.selectObj;
    const params=selectObj;
    if(params){
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Preview' button (Template ID: ${params.ioeReminderTemplateId}; Template Name: ${params.templateName})`;
      this.props.openCommonCircularDialog();
      this.props.getPrintDialogList({
        params, callback: previewData => {
          this.setState({
            previewData: previewData.data.reportData,
            previewShow: true,
            previewTitle: 'Reminder Template Report'
          });
          this.props.closeCommonCircularDialog();
        }
      });
      this.insertReminderTemplateLog(name, '/ioe/reminderTemplate/reminderReportForPreview');
    }else{
      let payload = {
        msgCode: TOKEN_TEMPLATE_MANAGEMENT_CODE.IS_SELECTED_TEMPLATE_EDIT,
        params: [
          { name: 'descriptionType', value: 'Preview' },
          { name: 'headerType', value: 'Preview' }
        ]
      };
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Preview' button (Template ID: null; Template Name: null)`;
      this.insertReminderTemplateLog(name,'');
      this.props.openCommonMessage(payload);
    }
  }

  updateState = (obj) => {
    this.setState({
      ...obj
    });
  }
  closePreviewDialog=()=>{
    this.setState({previewShow:false});
    this.insertReminderTemplateLog(`[Preview>>Reminder Template Report Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Close' button`, '');
  }
  insertReminderTemplateLog = (desc, apiName = '', content = null) => {
    commonUtils.commonInsertLog(apiName, 'F112', 'Reminder Template Maintenance', desc, 'ioe', content);
  };
  handleCancelLog = (name, apiName = '') => {
    this.insertReminderTemplateLog(name, apiName);
  }
  render() {
    const { classes,commonMessageList} = this.props;
    const { instructionOpen,open,isNew,ioeTokenTemplateId,templateDialogRefesh,ioeReminderInstructionId,InstructionResult} = this.state;
    let instructionPara={
      InstructionResult,
      instructionOpen:instructionOpen,
      handleInstructionDialogCancel:this.handleInstructionDialogCancel,
      refreshData:this.initData,
      insertReminderTemplateLog:this.insertReminderTemplateLog
    };
	  let tokenTemplateDialogParams={
      open:open,
      isNew:isNew,
      handleCloseDialog:this.handleCloseTokenTemplateDialog,
      insertReminderTemplateLog:this.insertReminderTemplateLog,
      ioeTokenTemplateId:ioeTokenTemplateId,
      refreshData:this.initData,
      openInstruction:this.handleClickInstructionDialog,
      templateDialogRefesh,
      updateState:this.updateState,
      ioeReminderInstructionId,
      commonMessageList
    };

    const buttonBar = {
      isEdit: this.state.isChange,
      title:'Reminder Template Maintenance',
      logSaveApi: '/ioe/saveReminderTemplateList',
      saveFuntion:this.handleClickSave,
      handleCancelLog:this.handleCancelLog,
      position: 'fixed',
      buttons: [
        {
          title: 'Preview',
          onClick: this.handleClickPrint,
          id: 'btn_tokenTemplate_print'
        },
        {
          title: 'Save',
          onClick: this.handleClickSave,
          id: 'btn_tokenTemplate_save'
        }
      ]
    };
    return (
      <Container buttonBar={buttonBar} className={classes.wrapper}>
        <Card className={classes.bigContainer}>
          <CardHeader
              classes={{
                root:classes.cardHeader
              }}
              titleTypographyProps={{
                style:{
                  fontSize: '1.5rem',
                  fontFamily: 'Arial'
                }
              }}
              title={`${en_US.tokenTemplateManagement.label_title} (${this.state.serviceCd})`}
          />
            <CardContent className={classes.cardContent}>
              <ManageTokenInstruction {...instructionPara} />
            <div className={classes.topDiv}>
              <Typography component="div" className={classes.labelDiv}>
                <Grid container style={{ marginTop: -10, marginLeft: -8 }}>
                  <label id="tokenTemplateForm_clinic_lable" className={classes.left_Label}>Clinic: {this.state.clinicEngDesc}</label>
                </Grid>
              </Typography>
              <Typography component="div" className={classes.btnDiv}>
                <Button id="btn_tokenTemplate_add" onClick={this.handleClickAdd} className={classes.btnRoot}>
                  <AddCircle color="primary" />
                  <span className={classes.font_color}>Add</span>
                </Button>
                <Button id="btn_tokenTemplate_edit"
                    onClick={this.handleClickEdit}
                    className={classes.btnRoot}
                >
                  <Edit color="primary" />
                  <span className={classes.font_color}>Edit</span>
                </Button>
                <Button id="btn_tokenTemplate_up"
                    onClick={this.handleClickUp}
                    className={classes.btnRoot}
                >
                  <ArrowUpwardOutlined color="primary" />
                  <span className={classes.font_color}>Up</span>
                </Button>
                <Button id="btn_tokenTemplate_down"
                    onClick={this.handleClickDown}
                    className={classes.btnRoot}
                >
                  <ArrowDownward color="primary" />
                  <span className={classes.font_color}>Down</span>
                </Button>
                <Button id="btn_tokenTemplate_instruction"
                    onClick={this.handleClickInstruction}
                    className={classes.btnRoot}
                >
                  <AddCircle color="primary" />
                  <span className={classes.font_color}>Instruction</span>
                </Button>
                <PreviewPdfDialog
                    open
                    id={'previewPdfDialog'}
                    previewTitle={this.state.previewTitle}
                    previewShow={this.state.previewShow}
                    previewData={this.state.previewData}
                    closePreviewDialog={this.closePreviewDialog}
                  // print={this.print}
                    dispalyState={this.state.dispalyState}
                />
                <TokenTemplateDialog {...tokenTemplateDialogParams} />
              </Typography>
            </div>
            <div className={classes.tableDiv}>
              <CIMSTable
                  data={this.state.templateList}
                  getSelectRow={this.getSelectRow}
                  id="tokenTemplateManagement_table"
                  options={this.state.tableOptions}
                  rows={this.state.tableRows}
                  rowsPerPage={this.state.pageNum}
                  selectRow={this.state.selectRow}
                  style={{ marginTop: 20 }}
                  tipsListSize={this.state.tipsListSize}
                  classes={{
                  label: classes.fontLabel
                }}
              />
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    tokenTemplateList: state.tokenTemplateManagement.tokenTemplateList,
    sysConfig: state.clinicalNote.sysConfig,
    commonMessageList:state.message.commonMessageList
  };
}
const mapDispatchToProps = {
  getTokenTemplateList,
  saveReminderTemplateList,
  getPrintDialogList,
  openCommonMessage,
  openCommonCircularDialog,
  updateCurTab,
  print,
  closeCommonCircularDialog
};
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(style)(tokenTemplateManagement));
