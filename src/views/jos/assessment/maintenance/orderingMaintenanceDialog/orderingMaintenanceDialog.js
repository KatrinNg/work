import React, { Component } from 'react';
import { connect } from 'react-redux';
import { styles } from './orderingMaintenanceDialogCss';
import { withStyles, Typography, Button, Grid, Dialog, DialogContent, DialogTitle,createMuiTheme,MuiThemeProvider } from '@material-ui/core';
import { ArrowDownward,ArrowUpwardOutlined } from '@material-ui/icons';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { openCommonMessage } from '../../../../../store/actions/message/messageAction';
import { openCommonCircularDialog, closeCommonCircularDialog } from '../../../../../store/actions/common/commonAction';
import Draggable from 'react-draggable';
import Paper from '@material-ui/core/Paper';
import CIMSTable from '../../../../../components/Table/CimsTableNoPagination';
import { getAssessmentOrderingList, saveAssessmentOrderingList} from '../../../../../store/actions/assessment/assessmentAction';
import { COMMON_ACTION_TYPE } from '../../../../../constants/common/commonConstants';
import { COMMON_CODE } from 'constants/message/common/commonCode';
import { ASSESSMENT_SETTING_CODE } from '../../../../../constants/message/assessmentCode';
import Container from 'components/JContainer';
import * as commonConstants from '../../../../../constants/common/commonConstants';
import Enum from '../../../../../../src/enums/enum';
import * as commonUtils from '../../../../../utilities/josCommonUtilties';

function PaperComponent(props) {
  return (
    <Draggable enableUserSelectHack={false}
        onStart={(e) => e.target.getAttribute('customdrag') === 'allowed'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

const theme = createMuiTheme({
  overrides: {
    MuiTableCell: {
      root: {
        borderLeft: '1px solid rgba(224, 224, 224, 1)',
        paddingTop: 0
      },
      body: {
        fontSize: '1rem',
        fontFamily: 'Arial'
      }
    },
    MuiTableSortLabel: {
      root: {
        fontSize: '1rem',
        fontFamily: 'Arial'
      }
    },
    CimsTableNoPagination: {
      table: {
        marginBotton: 50
      }
    }
  }
});

class OrderingMaintenanceDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableRows: [
        { name: 'displaySeq', width: 52, label: 'Seq', id: 'displaySeq' },
        { name: 'assessmentName', width: 260, label: 'Code Assessment' },
        { name: 'updatedBy', width: 175, label: 'Updated By' },
        {
          name: 'updatedDtm', label: 'Updated On', width: 175, customBodyRender: (value) => {
            return value ? moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
          }
        }
      ],
      tableOptions: {
        rowHover: true,
        rowsPerPage: 5,
        onSelectIdName: 'displaySeq', //显示tips的列
        headRowStyle: this.props.classes.headRowStyle,
        headCellStyle: this.props.classes.headCellStyle,
        bodyCellStyle: this.props.classes.customRowStyle,
        tableStyles:this.props.classes.tableStyles
      },
      dataList: [],
      noDataTip:'There is no data.',
      isChange:false,
      seq:null,
      selectObj:null
    };
  }

  componentDidMount() {
    this.initData();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.open) {
        this.initData();
    }
  }

  initData = () => {
    let { loginService } = this.props;
    let params = { serviceCd: loginService.serviceCd };
    this.props.openCommonCircularDialog();
    this.props.getAssessmentOrderingList({
      params,
      callback: (data) => {
        this.props.closeCommonCircularDialog();
        this.setState({
          dataList: cloneDeep(data),
          seq: null,
          selectedObj: null,
          isChange:false
        });
      }
    });
  };


  getSelectRow = (data) => {
    this.setState({
      seq: data.displaySeq,
      selectObj:data
    });
  }

  handleClickUp= () => {
    let { insertGeneralAssessmentMaintenanceLog } = this.props;
    let msgCode = ASSESSMENT_SETTING_CODE.UP_GENERAL_ASSESSMENT_ORDERING_ACTION;
    this.checkSelect(msgCode);
    let templateList = this.state.dataList;
    let seq = this.state.seq;
    let itemName = '(No record is selected)';
    if (seq) {
      let index = this.state.seq - 1;
      itemName=`(Sequence Number: ${templateList[index].displaySeq}; Assessment Item ID: ${templateList[index].assessmentItemId}; Code Assessment Code: ${templateList[index].codeAssessmentCd}; Assessment: ${templateList[index].assessmentName})`;
      if (templateList[index - 1]) {
        templateList[index].displaySeq = index;
        templateList[index - 1].displaySeq = seq;
        templateList[index - 1].operationType = commonConstants.COMMON_ACTION_TYPE.UPDATE;
        templateList[index].operationType = commonConstants.COMMON_ACTION_TYPE.UPDATE;
        [templateList[index], templateList[index - 1]] = [templateList[index - 1], templateList[index]];
        templateList[index].operationType = COMMON_ACTION_TYPE.UPDATE;
        templateList[index - 1].operationType = COMMON_ACTION_TYPE.UPDATE;
        this.setState({
          seq: index,
          dataList: templateList,
          isSave: false,
          isChange: true
        });
      }
    }
    let name = `[General Assessment Ordering Maintenance Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Up' button ${itemName}`;
    insertGeneralAssessmentMaintenanceLog && insertGeneralAssessmentMaintenanceLog(name, '');
  }

  handleClickDown= () => {
    let { insertGeneralAssessmentMaintenanceLog } = this.props;
    let msgCode = ASSESSMENT_SETTING_CODE.DOWN_GENERAL_ASSESSMENT_ORDERING_ACTION;
    this.checkSelect(msgCode);
    let templateList = this.state.dataList;
    let seq = this.state.seq;
    let itemName = '(No record is selected)';
    if(seq){
      let index = this.state.seq - 1;
      itemName=`(Sequence Number: ${templateList[index].displaySeq}; Assessment Item ID: ${templateList[index].assessmentItemId}; Code Assessment Code: ${templateList[index].codeAssessmentCd}; Assessment: ${templateList[index].assessmentName})`;
      if (templateList[index + 1]) {
        templateList[index].displaySeq = seq + 1;
        templateList[index + 1].displaySeq = seq;
        templateList[index].operationType = commonConstants.COMMON_ACTION_TYPE.UPDATE;
        templateList[index + 1].operationType = commonConstants.COMMON_ACTION_TYPE.UPDATE;
        [templateList[index], templateList[index + 1]] = [templateList[index + 1], templateList[index]];
        templateList[index].operationType = COMMON_ACTION_TYPE.UPDATE;
        templateList[index + 1].operationType = COMMON_ACTION_TYPE.UPDATE;
        this.setState({
          seq: seq + 1,
          dataList: templateList,
          isSave: false,
          isChange: true
        });
      }
    }
    let name=`[General Assessment Ordering Maintenance Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Down' button ${itemName}`;
    insertGeneralAssessmentMaintenanceLog&&insertGeneralAssessmentMaintenanceLog(name, '');
  }

  handleCancel = () => {
    const { handleOrderingMaintenanceDialogCancel,insertGeneralAssessmentMaintenanceLog } = this.props;
    let isChange = this.state.isChange;
    if (isChange) {
      let payload = {
        msgCode: COMMON_CODE.SAVE_WARING,
        btnActions: {
          btn1Click: () => {
            this.handleClickSave();
            handleOrderingMaintenanceDialogCancel();
          },
          btn2Click: () => {
            this.initData();
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '[General Assessment Ordering Maintenance Dialog]', 'title', 'General Assessment Ordering Maintenance');
            insertGeneralAssessmentMaintenanceLog && insertGeneralAssessmentMaintenanceLog(name, '');
            handleOrderingMaintenanceDialogCancel();
          }
        },
        params: [
          {
            name: 'title',
            value: 'General Assessment Ordering Maintenance'
          }
        ]
      };
      this.props.openCommonMessage(payload);
    } else {
      this.initData();
      insertGeneralAssessmentMaintenanceLog && insertGeneralAssessmentMaintenanceLog(`[General Assessment Ordering Maintenance Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Cancel' button`, '');
      handleOrderingMaintenanceDialogCancel();
    }
  }

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

  handleEscKeyDown = () =>{
    let { insertGeneralAssessmentMaintenanceLog } = this.props;
    insertGeneralAssessmentMaintenanceLog && insertGeneralAssessmentMaintenanceLog(`[General Assessment Ordering Maintenance Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Cancel' button`, '');
    this.handleCancel();
  }

  handleClickSave = () => {
    let {insertGeneralAssessmentMaintenanceLog}=this.props;
    const templateList = this.state.dataList;
    let params = templateList;
    this.props.openCommonCircularDialog();
    let name = `[General Assessment Ordering Maintenance Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`;
    insertGeneralAssessmentMaintenanceLog && insertGeneralAssessmentMaintenanceLog(name, 'assessment/assessmentSetting/updateAssessmentItemOrder');
    this.props.saveAssessmentOrderingList({
      params,
      callback:(data)=>{
        this.props.closeCommonCircularDialog();
        if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          let payload = {
            msgCode: data.msgCode,
            btnActions: {
              btn1Click: () => {
                let name = commonUtils.commonMessageLog(data.msgCode, 'Refresh Page', '[General Assessment Ordering Maintenance Dialog]');
                insertGeneralAssessmentMaintenanceLog && insertGeneralAssessmentMaintenanceLog(name, '');
                this.initData();
              },
              btn2Click: () => {
                let name = commonUtils.commonMessageLog(data.msgCode, 'Cancel', '[General Assessment Ordering Maintenance Dialog]');
                insertGeneralAssessmentMaintenanceLog && insertGeneralAssessmentMaintenanceLog(name, '');
              }
            }
          };
          this.props.openCommonMessage(payload);
        } else {
          this.initData();
          let payload = {
            msgCode:data.msgCode,
            showSnackbar:true //切换左下角（Snackbar）successfully 消息条
          };
          this.props.openCommonMessage(payload);
        }
      }
    });
  }

  handleClickSaveAndClose = () => {
    let { insertGeneralAssessmentMaintenanceLog } = this.props;
    const templateList = this.state.dataList;
    this.props.openCommonCircularDialog();
    let name = `[General Assessment Ordering Maintenance Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save & Close' button`;
    insertGeneralAssessmentMaintenanceLog && insertGeneralAssessmentMaintenanceLog(name, 'assessment/assessmentSetting/updateAssessmentItemOrder');
    this.props.saveAssessmentOrderingList({
      params:templateList,
      callback:(data)=>{
        this.props.closeCommonCircularDialog();
        if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          let payload = {
            msgCode: data.msgCode,
            btnActions: {
              btn1Click: () => {
                let name = commonUtils.commonMessageLog(data.msgCode, 'Refresh Page', '[General Assessment Ordering Maintenance Dialog]');
                insertGeneralAssessmentMaintenanceLog && insertGeneralAssessmentMaintenanceLog(name, '');
                this.initData();
              },
              btn2Click: () => {
                let name = commonUtils.commonMessageLog(data.msgCode, 'Cancel', '[General Assessment Ordering Maintenance Dialog]');
                insertGeneralAssessmentMaintenanceLog && insertGeneralAssessmentMaintenanceLog(name, '');
              }
            }
          };
          this.props.openCommonMessage(payload);
        } else {
          this.initData();
          this.props.openCommonMessage({
            msgCode:data.msgCode,
            showSnackbar:true
          });
          // close dialog
          this.props.handleOrderingMaintenanceDialogCancel();
        }
      }
    });
  }

  render() {
    const { classes, open,id,loginService} = this.props;
    let { isChange } = this.state;
    const buttonBar = {
      isEdit:this.state.isChange,
      // height:'64px',
      position: 'fixed',
      defaultCancel:false,
      style:{
        display: 'flex',
        height: 50
      },
      buttons: [
        {
          title: 'Save',
          onClick: this.handleClickSave,
          id: 'btn_order_maintenance_dialog_save',
          disabled: !isChange
        },
        {
          title: 'Save & Close',
          onClick: this.handleClickSaveAndClose,
          id: 'btn_order_maintenance_dialog_save_close',
          disabled: !isChange
        },
        {
          title: 'Cancel',
          onClick: this.handleCancel,
          id: 'btn_order_maintenance_dialog_cancel'
        }
      ]
    };
    return (
      <Dialog
          open={open}
          fullWidth
          maxWidth="lg"
          disableEnforceFocus
          PaperComponent={PaperComponent}
          onEscapeKeyDown={this.handleEscKeyDown}
      >
        <DialogTitle
            className={classes.dialogTitle}
            id={`${id}+title`}
            disableTypography customdrag="allowed"
        >General Assessment Ordering Maintenance</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Container buttonBar={buttonBar} >
            <Typography
                component="div"
                className={classes.titleDiv}
            >
              <Grid container>
                <label className={classes.left_Label}
                    id={`${id}+serviceLable`}
                >{`Service: ${loginService.serviceName} (${loginService.serviceCd})`}</label>
              </Grid>
            </Typography>
            {/* table */}

            {/* MaterialTable */}
            <MuiThemeProvider theme={theme}>
              <div id={`${id}Container`} style={{ position: 'sticky', top: 26 }}>
                <Typography
                    component="div"
                    className={classes.btnGroup}
                >
                  <Button id={`${id}ButtonUp`}
                      onClick={this.handleClickUp}
                      style={{ textTransform: 'none' }}
                  >
                    <ArrowUpwardOutlined color="primary" />
                    <span className={classes.font_color}>Up</span>
                  </Button>
                  <Button
                      id={`${id}+ButtonDown`}
                      onClick={this.handleClickDown}
                      style={{ textTransform: 'none' }}
                  >
                    <ArrowDownward color="primary" />
                    <span className={classes.font_color}>Down</span>
                  </Button>
                </Typography>
              </div>
              <div style={{ height: 600, paddingRight: 1, paddingBottom: 15 }}>
                <CIMSTable data={this.state.dataList}
                    getSelectRow={this.getSelectRow}
                    id={`${id}Table`}
                    options={this.state.tableOptions}
                    rows={this.state.tableRows}
                    rowsPerPage={this.state.pageNum}
                    selectRow={this.state.seq}
                    style={{ marginTop: 20 }}
                    tableStyles={classes.tableStyles}
                />
              </div>
            </MuiThemeProvider>
          </Container>
        </DialogContent>
      </Dialog>
    );
  }
}

const mapStateToProps = state => {
  return {
    loginService: state.login.service,
    patientInfo: state.patient.patientInfo
  };
};

const mapDispatchToProps = {
  openCommonMessage,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  getAssessmentOrderingList,
  saveAssessmentOrderingList
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(OrderingMaintenanceDialog));
