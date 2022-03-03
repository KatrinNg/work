/*
 * Front-end UI for  problem templates shows page
 Save Action: [problem.js] Save -> handleCheckSave -> [problemAction.js] saveTemplateList
-> [problemSaga.js] saveTemplateList ->Backend API = /procedure/saveProblemTemplateGroup  */
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
import { requestProblemTemplateList, saveTemplateList, getEditTemplateList,getCodeLocalTerm } from '../../../store/actions/consultation/dxpx/diagnosis/diagnosisAction';
import 'react-quill/dist/quill.snow.css';
import { openCommonMessage, closeCommonMessage } from '../../../store/actions/message/messageAction';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import CIMSTable from '../../../components/Table/CimsTableNoPagination';
import { style } from './diagnosisCss';
import EditDiagnosisTemplate from '../editTemplate/EditDiagnosisTemplate';
import { DIAGNOSIS_TEMPLATE_CODE } from '../../../constants/message/diagnosisTemplateCode';
import { openCommonCircularDialog, closeCommonCircularDialog } from '../../../store/actions/common/commonAction';
import { SYSCONFIGKEY_CODE } from '../../../constants/sysConfigKey';
import Container from 'components/JContainer';
import {COMMON_CODE} from 'constants/message/common/commonCode';
import {updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../../enums/accessRightEnum';
import * as commonConstants from '../../../constants/common/commonConstants';
import * as commonUtils from '../../../utilities/josCommonUtilties';
import { DIAGNOSIS_TYPE_CD } from '../../../constants/diagnosis/diagnosisConstants';

class DiagnosisTemplate extends Component {
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
        { name: 'groupName', width: 'auto', label: 'Problem Template Group Name' },
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
      problemLocalTermChecked:true,
      localTermDisabled:false
    };
  }

  componentDidMount() {
    this.props.ensureDidMount();
    this.props.updateCurTab(accessRightEnum.diagnosisTemplateMaintenance, this.doClose);
    this.initData();
    this.insertDiagnosisLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} Problem Template Group Maintenance`,'diagnosis/diagnosisTemplateGroup/');
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
    this.props.requestProblemTemplateList({
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

  doClose = (callback) => {
    let editFlag = !this.state.isSave;
    if (editFlag) {
      this.props.openCommonMessage({
        msgCode: COMMON_CODE.SAVE_WARING,
        btnActions: {
          btn1Click: () => {
            this.handleClickSave(callback);
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Problem Template Group Maintenance');
            this.insertDiagnosisLog(name,'/diagnosis/diagnosisTemplateGroup/');
            // setInterval(callback(true), 1000);
          }, btn2Click: () => {
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Problem Template Group Maintenance');
            this.insertDiagnosisLog(name,'');
            callback(true);
          }, btn3Click: () => {
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'Problem Template Group Maintenance');
            this.insertDiagnosisLog(name, '');
          }
        },
        params: [
          {
            name: 'title',
            value: 'Problem Template Group Maintenance'
          }
        ]
      });
    }
    else {
      this.insertDiagnosisLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close Problem Template Group Maintenance`,'');
      callback(true);
    }
  }

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
    let msgCode = DIAGNOSIS_TEMPLATE_CODE.IS_SELECTED_TEMPLATE_GROUP_DWON;
    this.checkSelect(msgCode);
    let templateList = this.state.templateList;
    let sequence = this.state.sequence;
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
        this.insertDiagnosisLog(name,'');
      }
    }else{
      this.insertDiagnosisLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Down' button (No record is selected; Sequence Number: null; Template Group ID: null; Template Group Name: null)`,'');
    }
  }

  handleClickUp = () => {
    let msgCode = DIAGNOSIS_TEMPLATE_CODE.IS_SELECTED_TEMPLATE_GROUP_UP;
    this.checkSelect(msgCode);
    let templateList = this.state.templateList;
    let sequence = this.state.sequence;
    if (sequence) {
      let index = this.state.sequence - 1;
      if (templateList[index - 1]) {
        let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Up' button (Sequence Number: ${templateList[index].displaySeq}; Template Group ID: ${templateList[index].templateGrpId}; Template Group Name: ${templateList[index].groupName})`;
        templateList[index].displaySeq = index;
        templateList[index - 1].displaySeq = sequence;
        [templateList[index], templateList[index - 1]] = [templateList[index - 1], templateList[index]];
        this.setState({
          sequence: index,
          selectRow: index,
          templateList: templateList,
          isSave: false
        });
        this.insertDiagnosisLog(name,'');
      }
    }else{
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Up' button (No record is selected; Sequence Number: null; Template Group ID: null; Template Group Name: null)`;
      this.insertDiagnosisLog(name, '');
    }
  }

  handleCheckSave = (code) => {
    let payload = {
      msgCode: code,
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
          if (typeof saveCallback != 'function' || saveCallback === undefined) {
            this.insertDiagnosisLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`, '/diagnosis/diagnosisTemplateGroup/');
            return false;
          } else {
            saveCallback(true);
          }
        }
      }
    });
  };

  refreshPageData = () => {
    this.props.requestProblemTemplateList({
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
        msgCode: DIAGNOSIS_TEMPLATE_CODE.IS_CANCEL_CHANGE,
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
      this.handleCheckSave(DIAGNOSIS_TEMPLATE_CODE.IS_SAVE_ADD_TIP);
    } else {
      this.setState({ open: true });
    }
    this.insertDiagnosisLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Add' button`,'');
  };

  handleClose = () => {
    this.setState({ open: false });
  }

  handleClickEdit = () => {
    let isSave = this.state.isSave;
    let selectObj = this.state.selectObj;
    if (!isSave) { //提示有其他操作判断未保存
      this.handleCheckSave(DIAGNOSIS_TEMPLATE_CODE.IS_SAVE_EDIT_TIP);
    } else if (!selectObj) {  //提示未选中行
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Clear} 'Edit' button (No record is selected; Template Group ID: null; Template Group Name: null)`;
      this.insertDiagnosisLog(name, '');
      let payload = {
        msgCode: DIAGNOSIS_TEMPLATE_CODE.IS_SELECTED_EIDT_TIP,
        btnActions: {
          // Yes
          btn1Click: () => {
          }
        }
      };
      this.props.openCommonMessage(payload);
    }
    else {
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (Template Group ID: ${selectObj.templateGrpId}; Template Group Name: ${selectObj.groupName})`;
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
      this.insertDiagnosisLog(name, '');
    }
  }

  //点击删除方法
  handleClickDelete = () => {
    //获得选中行sequence
    let { sequence, selectObj } = this.state;
    if (sequence === null) {
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Delete' button (No record is selected; Template Group ID: null; Template Group Name: null)`;
      this.insertDiagnosisLog(name, '');
      let payload = { msgCode: DIAGNOSIS_TEMPLATE_CODE.IS_SAVE_DELETE_TIP };
      this.props.openCommonMessage(payload);
    } else {
      let payload = {
        msgCode: DIAGNOSIS_TEMPLATE_CODE.CONFIRM_TEMPLATEGROUP_DELETE,
        btnActions: {
          // Yes
          btn1Click: () => {
            let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Delete' button (Template Group ID: ${sequence}; Template Group Name: ${selectObj.groupName})`;
            this.insertDiagnosisLog(name, '');
            this.deleteSelectedTemplateGroup(); //已有选中行，进入删除方法，进行后台数据交互
          },
          btn2Click: () => {
          }
        }
      };
      this.props.openCommonMessage(payload);
    }
  };

  // 删除指定行后台数据交互方法
  deleteSelectedTemplateGroup = () => {
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
        let problemLocalTerm = valMap.has(DIAGNOSIS_TYPE_CD.PROBLEM) ? valMap.get(DIAGNOSIS_TYPE_CD.PROBLEM) : defaultLocalTerm;

        if (problemLocalTerm !== null) {
          this.setState({
            problemLocalTermChecked:'Y'===problemLocalTerm.defaultLocalTerm,
            localTermDisabled:'Y'===problemLocalTerm.disableTerm
          });
        }
      }
    }});
  }

  insertDiagnosisLog=(desc,apiName='',content='') => {
    commonUtils.commonInsertLog(apiName,'F106','Diagnosis Template Group Maintenance',desc,'diagnosis',content);
  };
  handleCancelLog = (name, apiName = '') => {
    this.insertDiagnosisLog(name, apiName);
  }

  render() {
    const { classes,commonMessageList } = this.props;
    const { open, editTemplateList, templateList, sequence, problemLocalTermChecked, localTermDisabled } = this.state;
    let editTemplateProps = {
      open,
      commonMessageList,
      handleClose: this.handleClose,
      editTemplateList: editTemplateList,
      refreshData: this.initData,
      templateList: templateList,
      selectGroupSequence: sequence,
      problemLocalTermChecked: problemLocalTermChecked,
      localTermDisabled: localTermDisabled,
      insertDiagnosisLog:this.insertDiagnosisLog
    };
    const buttonBar={
      isEdit:!this.state.isSave,
      title:'Problem Template Group Maintenance',
      logSaveApi: '/diagnosis/diagnosisTemplateGroup/',
      saveFuntion:this.handleClickSave,
      handleCancelLog: this.handleCancelLog,
      // height:'64px',
      position:'fixed',
      buttons:[{
        title:'Save',
        id:'btn_problemTemplate_save',
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
                  fontSize: '1.5rem'
                }
              }}
                title={en_US.problemTemplate.label_title}
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
                          id="problemTemplate_serviceLable"
                      >Service: {this.state.serviceEngDesc} ({this.state.serviceCd})</label>
                    </Grid>
                  </ValidatorForm>
                </Typography>
                <Typography component="div"
                    style={{ marginTop: 0, marginLeft: -7 }}
                >
                  <Button id="btn_problemTemplate_add"
                      onClick={this.handleClickAdd}
                      style={{ textTransform: 'none' }}
                  >
                    <AddCircle color="primary" />
                    <span className={classes.font_color}>Add</span>
                  </Button>

                  <Button id="btn_problemTemplate_edit"
                      onClick={this.handleClickEdit}
                      style={{ textTransform: 'none' }}
                  >
                    <Edit color="primary" />
                    <span className={classes.font_color}>Edit</span>
                  </Button>

                  <Button id="btn_problemTemplate_delete"
                      onClick={this.handleClickDelete}
                      style={{ textTransform: 'none' }}
                  >
                    <RemoveCircle color="primary" />
                    <span className={classes.font_color}>Delete</span>
                  </Button>

                  <Button id="btn_problemTemplate_up"
                      onClick={this.handleClickUp}
                      style={{ textTransform: 'none' }}
                  >
                    <ArrowUpwardOutlined color="primary" />
                    <span className={classes.font_color}>Up</span>
                  </Button>

                  <Button id="btn_problemTemplate_down"
                      onClick={this.handleClickDown}
                      style={{ textTransform: 'none' }}
                  >
                    <ArrowDownward color="primary" />
                    <span className={classes.font_color}>Down</span>
                  </Button>
                  <EditDiagnosisTemplate  {...editTemplateProps} />
                </Typography>
              </div>
              <div className={classes.tableDiv}>
                <CIMSTable id="manage_problem_template_group_table"
                    data={this.state.templateList}
                    getSelectRow={this.getSelectRow}
                    options={this.state.tableOptions}
                    rows={this.state.tableRows}
                    rowsPerPage={this.state.pageNum}
                    selectRow={this.state.selectRow}
                    tableRowStyle={{ whiteSpace:'pre-wrap'}}
                    style={{ marginTop: 20 }}
                    tipsListSize={this.state.tipsListSize}
                />
              </div>
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
  requestProblemTemplateList,
  saveTemplateList,
  getEditTemplateList,
  openCommonMessage,
  closeCommonMessage,
  openCommonCircularDialog,
  closeCommonCircularDialog,
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
    templateList: state.diagnosisReducer.templateList,
    saveTemplateList: state.diagnosisReducer.saveTemplateList,
    sysConfig: state.clinicalNote.sysConfig,
    commonMessageList:state.message.commonMessageList
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(DiagnosisTemplate));
