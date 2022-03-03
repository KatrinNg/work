/* Save Action: [procedureTemplate.js] Save -> handleCheckSave -> [procedureTemplateAction.js] saveTemplateList
-> [procedureTemplateSaga.js] saveTemplateList ->Backend API = /procedure/saveProcedureTemplateGroup  */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Card,
  CardContent,
  Grid,
  Button,
  Typography,
  CardHeader
} from '@material-ui/core';
import en_US from '../../../locales/en_US';
import { withStyles } from '@material-ui/core/styles';
import { AddCircle } from '@material-ui/icons';
import { RemoveCircle } from '@material-ui/icons';
import { Edit } from '@material-ui/icons';
import { ArrowUpwardOutlined } from '@material-ui/icons';
import { ArrowDownward } from '@material-ui/icons';
import moment from 'moment';
import { requestProcedureTemplateList, saveTemplateList, getEditTemplateList } from '../../../store/actions/consultation/dxpx/procedure/procedureAction';
import { getCodeLocalTerm } from '../../../store/actions/consultation/dxpx/diagnosis/diagnosisAction';
import 'react-quill/dist/quill.snow.css';
import { openCommonMessage, closeCommonMessage } from '../../../store/actions/message/messageAction';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import CIMSTable from '../../../components/Table/CimsTableNoPagination';
import { style } from './procedureCss';
import EditProcedureTemplate from '../editTemplate/EditProcedureTemplate';
import { PROCEDURE_CODE } from '../../../constants/message/procedureCode';
import { openCommonCircularDialog } from '../../../store/actions/common/commonAction';
import { SYSCONFIGKEY_CODE } from '../../../constants/sysConfigKey';
import Container from 'components/JContainer';
import {COMMON_CODE} from 'constants/message/common/commonCode';
import {updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../../enums/accessRightEnum';
import * as commonConstants from '../../../constants/common/commonConstants';
import * as commonUtils from '../../../utilities/josCommonUtilties';
import { DIAGNOSIS_TYPE_CD } from '../../../constants/diagnosis/diagnosisConstants';

class ProcedureTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sequence: null,
      isSave: true,
      open: false,  // open dialog
      serviceCd: JSON.parse(sessionStorage.getItem('service')).serviceCd,//
      serviceEngDesc: JSON.parse(sessionStorage.getItem('service')).serviceName,//
      isEdit: false,
      templateList: [],
      editTemplateList: [],
      pageNum: null,
      deleteList: [],
      selectObj: null, //选中的行对象
      tableRows: [
        { name: 'displaySeq', width: 42, label: 'Seq' },
        { name: 'groupName', width: 'auto', label: 'Procedure Template Group Name' },
        { name: 'updateByName', width: 180, label: 'Updated By' },
        {
          name: 'updateDtm', label: 'Updated On', width: 140, customBodyRender: (value) => {
            return value ? moment(value).format('DD-MMM-YYYY') : null;
          }
        }
      ],
      tableOptions: {
        rowHover: true,
        rowsPerPage: 5,
        onSelectIdName: 'displaySeq',
        tipsListName: 'dxpxTemplates',
        tipsDisplayListName: null,
        tipsDisplayName: 'diagnosisDisplayName',
        onSelectedRow: (rowId, rowData, selectedData) => {
          this.selectTableItem(selectedData);
        },
        bodyCellStyle: this.props.classes.customRowStyle,
        headRowStyle: this.props.classes.headRowStyle,
        headCellStyle: this.props.classes.headCellStyle
      },
      procedureLocalTermChecked:true,
      localTermDisabled:false
    };
  }

  componentDidMount() {
    this.props.ensureDidMount();
    this.props.updateCurTab(accessRightEnum.procedureTemplateMaintenance, this.doClose);
    this.initData();
    this.insertProcedureLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} Procedure Template Group Maintenance`,'diagnosis/diagnosisTemplateGroup/');
  }

  //关闭close tab
  doClose = (callback) => {
    let editFlag = !this.state.isSave;
    if (editFlag) {
      this.props.openCommonMessage({
        msgCode: COMMON_CODE.SAVE_WARING,
        btnActions: {
          btn1Click: () => {
            this.handleClickSave(callback);
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Precedure Template Group Maintenance');
            this.insertProcedureLog(name, '/diagnosis/procedureTemplateGroup/');
          }, btn2Click: () => {
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Precedure Template Group Maintenance');
            this.insertProcedureLog(name, '');
            callback(true);
          }, btn3Click: () => {
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'Precedure Template Group Maintenance');
            this.insertProcedureLog(name, '');
          }
        },
        params: [
          {
            name: 'title',
            value: 'Precedure Template Group Maintenance'
          }
        ]
      });
    }
    else {
      this.insertProcedureLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close Procedure Template Group Maintenance`, '');
      callback(true);
    }
  }

  getTipsSize = () => {
    const { sysConfig } = this.props;
    this.setState({
      tipsListSize: parseInt(sysConfig[SYSCONFIGKEY_CODE.TMPL_TIPS_SIZE].value)
    });
  };

  initData = () => {
    const params = {};
    this.getTipsSize();
    this.props.requestProcedureTemplateList({
      params,
      callback: (templateList) => {
        this.setState({
          isSave: true,
          templateList: templateList.data,
          sequence: null,
          selectRow: null,
          selectObj: null
        });
      }
    });
    this.getLocalTermStatus(this.props.loginInfo.service.code);
  };

  //获得选中行数据
  getSelectRow = (data) => {
    this.setState({
      sequence: data.displaySeq,
      selectRow: data.displaySeq,
      selectObj: data
    });
  }

  checkSelect(msgCode) {
    if (this.state.sequence === null) {
      let payload = {
        msgCode: msgCode,
        btnActions: {
          // Yes
          btn1Click: () => {
          }
        }
      };
      this.props.openCommonMessage(payload);
    }
  }

  handleClickDown = () => {
    let msgCode = PROCEDURE_CODE.IS_SELECTED_TEMPLATE_GROUP_DWON;
    this.checkSelect(msgCode);
    let {sequence,templateList}=this.state;
    if (sequence) {
      let index = this.state.sequence - 1;
      if (templateList[index + 1]) {
        let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Down' button (Sequence Number: ${templateList[index].displaySeq}; Template Group ID: ${templateList[index].templateGrpId}; Template Group Name: ${templateList[index].groupName})`;
        templateList[index].displaySeq = sequence + 1;
        templateList[index + 1].displaySeq = sequence;
        [templateList[index], templateList[index + 1]] = [templateList[index + 1], templateList[index]];
        this.setState({
          sequence: sequence + 1,
          selectRow: sequence + 1,
          templateList: templateList,
          isSave: false
        });
        this.insertProcedureLog(name,'');
      }
    }else{
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Down' button (No record is selected; Sequence Number: null; Template Group ID: null, Template Group Name: null)`;
      this.insertProcedureLog(name,'');
    }
  }

  handleClickUp = () => {
    let msgCode = PROCEDURE_CODE.IS_SELECTED_TEMPLATE_GROUP_UP;
    this.checkSelect(msgCode);
    let {sequence,templateList}=this.state;
    if (sequence) {
      let index = this.state.sequence - 1;
      if (templateList[index - 1]) {
        let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Up' button (Sequence Number: ${templateList[index].displaySeq}; Template Group ID: ${templateList[index].templateGrpId}; Template Group Name: ${templateList[index].groupName})`;
        this.insertProcedureLog(name,'');
        templateList[index].displaySeq = index;
        templateList[index - 1].displaySeq = sequence;
        [templateList[index], templateList[index - 1]] = [templateList[index - 1], templateList[index]];
        this.setState({
          sequence: index,
          selectRow: index,
          templateList: templateList,
          isSave: false
        });
      }
    }else{
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Up' button (No record is selected; Sequence Number: null; Template Group ID: null, Template Group Name: null)`;
      this.insertProcedureLog(name,'');
    }
  }

  handleCheckSave = () => {
    let payload = {
      msgCode: PROCEDURE_CODE.IS_TP_SAVE_COMFIRM,
      btnActions: {
        // Yes
        btn1Click: () => {
        }
      }
    };
    this.props.openCommonMessage(payload);
  }

  handleClickSave = (saveCallback) => {
    let saveList = this.state.templateList.concat(this.state.deleteList);
    this.setState({
      isSave: true,
      sequence: null,
      selectRow: null,
      deleteList: [],
      saveList: saveList
    });
    let params = saveList;
    this.props.openCommonCircularDialog();
    this.props.saveTemplateList({
      params, callback: (data) => {
        if(data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          let payload = {
            msgCode: data.msgCode,
            btnActions:
            {
              btn1Click: () => {
                this.refreshPageData();
              },
              btn2Click: () => {
                this.props.closeCommonCircularDialog();
                if(typeof saveCallback != 'function' || saveCallback === undefined){
                  return false;
                }else{
                    saveCallback(true);
                }
              }
            }
          };
          this.props.openCommonMessage(payload);
        }else{
          this.refreshPageData();
          let payload = {
            msgCode: data.msgCode,
            showSnackbar: true,
            btnActions: {
            }
          };
          this.props.openCommonMessage(payload);
          if(typeof saveCallback != 'function' || saveCallback === undefined){
            this.insertProcedureLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button `,'/diagnosis/procedureTemplateGroup/');
              return false;
          }else{
              saveCallback(true);
          }
        }
      }
    });
  };

  refreshPageData = () => {
    this.props.requestProcedureTemplateList({
      params:{},
      callback: (templateList) => {
        this.setState({
          isSave: true,
          templateList: templateList.data,
          sequence: null,
          selectRow: null,
          selectObj: null
        });
      }
    });
  }

  handleClickCancel = () => {
    let isChange = this.state.isSave;
    if (!isChange) {
      let payload = {
        msgCode: PROCEDURE_CODE.IS_CANCEL_CHANGE,
        btnActions: {
          btn1Click: () => {
            this.initData();
          }
        }
      };
      this.props.openCommonMessage(payload);
    } else {
      this.initData();
    }
  }

  handleClickAdd = () => {
    let isSave = this.state.isSave;
    this.setState({
      editTemplateList: []
    });
    if (!isSave) {
      this.handleCheckSave();
    } else {
      this.setState({ open: true });
    }
    this.insertProcedureLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Add' button`,'');
  };

  handleClose = () => {
    this.setState({ open: false });
  }

  handleClickEdit = () => {
    let { isSave, selectObj } = this.state;
    if (!isSave) {//提示有其他操作判断未保存
      this.handleCheckSave();
    } else {
      if (selectObj !== null) {
        this.setState({ editTemplateList: [] });
        let params = { groupId: selectObj.templateGrpId };
        this.props.getEditTemplateList({
          params,
          callback: (editTemplateList) => {
            this.setState({
              editTemplateList: editTemplateList
            });
          }
        });
        this.setState({ open: true });
        let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (Template Group ID: ${selectObj.templateGrpId}; Template Group Name: ${selectObj.groupName})`;
        this.insertProcedureLog(name, '/diagnosis/procedureTemplate/');
      } else {
        let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (No record is selected; Template Group ID: null; Template Group Name: null)`;
        this.insertProcedureLog(name,'');
        let payload = { msgCode: PROCEDURE_CODE.IS_TP_SELECTED_EDIT };
        this.props.openCommonMessage(payload);
      }
    }
  }
  //点击删除方法
  handleClickDelete = () => {
    //获得选中行sequence
    let { sequence, selectObj } = this.state;
    if (sequence === null) {
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Delete' button (No record is selected; Template Group ID: null; Template Group Name: null)`;
      this.insertProcedureLog(name, '');
      let payload = { msgCode: PROCEDURE_CODE.IS_TP_SELECTED_DELETE };
      this.props.openCommonMessage(payload);
    } else {
      let payload = {
        msgCode: PROCEDURE_CODE.CONFIRM_TEMPLATEGROUP_DELETE,
        btnActions: {
          // Yes
          btn1Click: () => {
            let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Delete' button (Template Group ID: ${sequence}; Template Group Name: ${selectObj.groupName})`;
            this.insertProcedureLog(name, '');
            this.delete(); //已有选中行，进入删除方法，进行后台数据交互
          },
          btn2Click: () => {
          }
        }
      };
      this.props.openCommonMessage(payload);
    }
  };

  // 删除指定行后台数据交互方法
  delete = () => {
    let delSequence = this.state.sequence;
    let templateList = this.state.templateList;
    let index = this.state.sequence - 1;
    let deleteList = this.state.deleteList;
    templateList[index].delFlag = 'Y';
    deleteList = deleteList.concat(templateList[index]);

    templateList.splice(index, 1);

    templateList = templateList.map((item) => {
      item.displaySeq = item.displaySeq > delSequence ? (item.displaySeq - 1) : (item.displaySeq);
      return item;
    });  //页面重新更新templateList
    this.setState({
      deleteList: deleteList,
      templateList: templateList, //页面重新更新templateList
      selectObj: null,
      sequence: null,
      selectRow: null,
      isSave: false
    });
  }

  getLocalTermStatus=(serviceCd)=>{
    let params = {serviceCd: serviceCd};
    this.props.getCodeLocalTerm({params:params,callback:(valMap)=>{
      if(valMap!==null){
        let defaultLocalTerm = valMap.has(DIAGNOSIS_TYPE_CD.DEFAULT) ? valMap.get(DIAGNOSIS_TYPE_CD.DEFAULT) : null;
        let procedureLocalTerm = valMap.has(DIAGNOSIS_TYPE_CD.PROCEDURE) ? valMap.get(DIAGNOSIS_TYPE_CD.PROCEDURE) : defaultLocalTerm;

        if (procedureLocalTerm !== null) {
          this.setState({
            procedureLocalTermChecked:'Y'===procedureLocalTerm.defaultLocalTerm,
            localTermDisabled:'Y'===procedureLocalTerm.disableTerm
          });
        }
      }
    }});
  }
  insertProcedureLog=(desc,apiName='',content='') => {
    commonUtils.commonInsertLog(apiName,'F107','Procedure Template Group Maintenance',desc,'diagnosis',content);
  };
  handleCancelLog = (name, apiName = '') => {
    this.insertProcedureLog(name, apiName);
  }

  render() {
    const { classes,commonMessageList } = this.props;
    const { open, editTemplateList, templateList, sequence, procedureLocalTermChecked, localTermDisabled} = this.state;
    let editTemplateProps = {
      open,
      commonMessageList,
      handleClose: this.handleClose,
      editTemplateList: editTemplateList,
      refreshData: this.initData,
      templateList: templateList,
      selectGroupSequence: sequence,
      procedureLocalTermChecked: procedureLocalTermChecked,
      localTermDisabled:localTermDisabled,
      insertProcedureLog:this.insertProcedureLog
    };
    const buttonBar={
      isEdit:!this.state.isSave,
      title:'Precedure Template Group Maintenance',
      logSaveApi:'/diagnosis/procedureTemplateGroup/',
      saveFuntion:this.handleClickSave,
      handleCancelLog: this.handleCancelLog,
      // height:'64px',
      position:'fixed',
      buttons:[{
        title:'Save',
        id:'btn_procedureTemplate_save',
        onClick:() => this.handleClickSave()
      }]
    };
    return (
        <Container buttonBar={buttonBar}>
          <div className={classes.wrapper}>
            <Card className={classes.bigContainer}>
              <CardHeader
                  classes={{
                    root:classes.cardHeader
                  }}
                  titleTypographyProps={{
                  style: {
                    fontSize: '1.5rem',
                    fontFamily: 'Arial'
                  }
                }}
                  title={en_US.procedureTemplate.label_title}
              />
              <CardContent style={{paddingTop: 0}}>
                <div className={classes.topDiv}>
                  <Typography
                      component="div"
                      style={{ marginBottom: 15, marginLeft: 5, marginRight: 5, marginTop: 5 }}
                  >
                    <ValidatorForm
                        id="bookingCalendarForm"
                        onSubmit={() => { }}
                        ref="form"
                    >
                      <Grid container
                          style={{ marginTop: -10, marginLeft: -8 }}
                      >
                        <label className={classes.left_Label}
                            id="procedureTemplate_serviceLable"
                        >Service: {this.state.serviceEngDesc} ({this.state.serviceCd})</label>
                      </Grid>
                    </ValidatorForm>
                  </Typography>

                  <Typography component="div"
                      style={{ marginTop: 0, marginLeft: -7 }}
                  >
                    <Button id="btn_procedureTemplate_add"
                        onClick={this.handleClickAdd}
                        style={{ textTransform: 'none' }}
                    >
                      <AddCircle color="primary" />
                      <span className={classes.font_color}>Add</span>
                    </Button>

                    <Button id="btn_procedureTemplate_edit"
                        onClick={this.handleClickEdit}
                        style={{ textTransform: 'none' }}
                    >
                      <Edit color="primary" />
                      <span className={classes.font_color}>Edit</span>
                    </Button>

                    <Button id="btn_procedureTemplate_delete"
                        onClick={this.handleClickDelete}
                        style={{ textTransform: 'none' }}
                    >
                      <RemoveCircle color="primary" />
                      <span className={classes.font_color}>Delete</span>
                    </Button>

                    <Button id="btn_procedureTemplate_up"
                        onClick={this.handleClickUp}
                        style={{ textTransform: 'none' }}
                    >
                      <ArrowUpwardOutlined color="primary" />
                      <span className={classes.font_color}>Up</span>
                    </Button>

                    <Button id="btn_procedureTemplate_down"
                        onClick={this.handleClickDown}
                        style={{ textTransform: 'none' }}
                    >
                      <ArrowDownward color="primary" />
                      <span className={classes.font_color}>Down</span>
                    </Button>
                    <EditProcedureTemplate  {...editTemplateProps} />
                  </Typography>
                </div>
                <div className={classes.tableDiv}>
                  <CIMSTable id="manage_procedure_template_group_table" data={this.state.templateList}
                      getSelectRow={this.getSelectRow}
                      options={this.state.tableOptions}
                      rows={this.state.tableRows}
                      rowsPerPage={this.state.pageNum}
                      tipsListSize={this.state.tipsListSize}
                      selectRow={this.state.selectRow}
                      style={{ marginTop: 20 }}
                  />
                </div>
                {/* <Prompt message={FieldConstant.LEAVE_CONFIRM_PROMPT_CONTENT}
                    when={!this.state.isSave}
                /> */}
              </CardContent>
            </Card>
            <Typography component="div" className={classes.fixedBottom}>
            </Typography>
          </div>
        </Container>
    );
  }
}



const mapDispatchToProps = {
  requestProcedureTemplateList,
  saveTemplateList,
  getEditTemplateList,
  openCommonMessage,
  closeCommonMessage,
  openCommonCircularDialog,
  getCodeLocalTerm,
  updateCurTab
};

function mapStateToProps(state) {
  return {
    loginInfo: {
        service: {
            code: state.login.service.serviceCd
        }
    },
    templateList: state.procedureReducer.templateList,
    saveTemplateList: state.procedureReducer.saveTemplateList,
    sysConfig: state.clinicalNote.sysConfig,
    commonMessageList:state.message.commonMessageList
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(ProcedureTemplate));

