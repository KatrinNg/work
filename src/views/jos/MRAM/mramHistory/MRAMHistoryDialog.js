
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {style} from './css/mramHistoryDialogCss';
import { withStyles } from '@material-ui/core/styles';
import {Grid, Typography} from '@material-ui/core';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import EditTemplateDialog from '../../MRAM/mramHistory/EditMRAMHistoryDialog';
import {requestHistoryService} from '../../../../store/actions/MRAM/mramHistory/mramHistoryAction';
import { openCommonMessage, closeCommonMessage } from '../../../../store/actions/message/messageAction';
import {Check} from '@material-ui/icons';
import { getMramFieldValueList,initMramFieldValueList,checkDuplicatedMramRecordOnSameDay,checkMramRecordCreatedWithin6Months} from '../../../../store/actions/MRAM/mramAction';
import {openCommonCircularDialog,closeCommonCircularDialog} from '../../../../store/actions/common/commonAction';
import {MRAM_HISTORY_CODE} from '../../../../constants/message/MRAMCode/mramHistoryCode';
import {MRAM_CODE} from '../../../../constants/message/MRAMCode/mramCode';
import Paper from '@material-ui/core/Paper';
import { Card, CardContent, CardHeader } from '@material-ui/core';
import CIMSTable from '../../../../../src/components/Table/CimsTableNoPagination';
import moment from 'moment';
import * as constant from '../../../../constants/MRAM/mramConstant';
import _ from 'lodash';
import * as commonConstants from '../../../../constants/common/commonConstants';

class MRAMHistoryDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageNum:null,
      isEdit:false,
      selectRow: null,
      templateList:[],
      patientKey:0,
      tableOptions: {
        rowHover: true,
        rowsPerPage:5,
        onSelectIdName:'mramId',
        tipsListName:'diagnosisTemplates',
        tipsDisplayListName:null,
        tipsDisplayName: 'diagnosisDisplayName',
        onSelectedRow:(rowId,rowData,selectedData)=>{ this.selectTableItem(selectedData);},
        bodyCellStyle:this.props.classes.bodyCellStyle,
        headRowStyle:this.props.classes.headRowStyle,
        headCellStyle:this.props.classes.headCellStyle
      },
      tableRows: [
        {name:'mramAssessmentDtm', width: 300, label: 'Metabolic Risk Assessment Date', customBodyRender: (value) => {
            return value ? moment(value).format('DD-MMM-YYYY') : null;
        }},
        {name:'serviceCd', width: 150, label: 'Patient Specialty' },
        {name:'dmInput', width: 40, label: 'DM',customBodyRender: (value) => {
          return value==='Y'  ? <Check color="primary"/> :value;
        }},
        {name:'htInput', width: 40, label: 'HT',customBodyRender: (value) => {
          return value==='Y'  ? <Check color="primary"/> :value;
        }},
        {name:'eyesInput', width: 46, label: 'Eyes',customBodyRender: (value) => {
          return value==='Y'  ? <Check color="primary"/> :value;
        }},
        {name:'feetInput', width: 40, label: 'Feet',customBodyRender: (value) => {
          return value==='Y'  ? <Check color="primary"/> :value;
        }},
        {name:'dietInput', width: 40, label: 'Diet',customBodyRender: (value) => {
          return value==='Y'  ? <Check color="primary"/> :value;
        }},
        {name:'mramAssessmentStatusName', width: 'auto', label: 'Status',customBodyRender: (value,item) => {
          if (item.mramAssessmentStatus !== constant.mramAssessmentStatus.signedOff) {
            return !moment(item.mramAssessmentDtm).add(6, 'months').isAfter(moment()) ? value + ' > 6 months' : value;
          } else {
            return value;
          }
        }}
      ]
    };
  }

  // componentDidMount(){
  //   const { childRef } = this.props;
  //   childRef(this);
  // }

  UNSAFE_componentWillReceiveProps(nextProps){
    let { openHistory=false, recordList=[]} = nextProps;
    if (nextProps.patientKey!== this.state.patientKey) {
      this.initData(nextProps.patientKey);
    } else if (openHistory&&this.state.templateList.length === 0) {
      this.setState({
        patientKey:nextProps.patientKey,
        templateList: _.cloneDeep(recordList),
        selectRow:null
      });
    }
  }

  initData = (patientKey) => {
    if(patientKey!==undefined){
      this.props.openCommonCircularDialog();
      this.props.requestHistoryService({
        params: {patientKey},
        callback:(templateList) =>{
          let { updateState } = this.props;
          this.props.closeCommonCircularDialog();
          this.setState({
            templateList: templateList.data,
            patientKey,
            selectRow:null
          });
          updateState&&updateState({recordList: _.cloneDeep(templateList.data)});
        }
      });
    }
  };

  getSelectRow = (data) => {
    this.setState({
      selectRow:data.mramId,
      selectObj:data
    });
  }

  handleDialogClose=()=>{
    let {handleFunctionClose, selectRow, handleClose, isNewFlag,insertMramLog}=this.props;
    let name = '';
    if (selectRow) {
      name = '[MRAM History List Dialog] Action: Click \'Cancel\' button to close the dialog';
      handleClose && handleClose();
    } else {
      if (isNewFlag) {
        name = '[MRAM History List Dialog] Action: Click \'Cancel\' button to close the dialog';
        handleClose && handleClose();
      } else {
        name = '[MRAM History List Dialog] Action: Click \'Cancel\' button to close MRAM';
        handleFunctionClose && handleFunctionClose(true);
      }
    }
    insertMramLog && insertMramLog(name, '');
  }

  openInstruction=()=>{
    let {openInstruction}=this.props;
    openInstruction&&openInstruction();
  }

  handleResetMramData = (mode='new') => {
    let { handleClose,updateState,patientKey } = this.props;
    if (mode==='new') {
      this.props.initMramFieldValueList({
        param:{},
        callback: () => {
          let currentDate = new Date();
          this.props.openCommonCircularDialog();
          this.props.checkDuplicatedMramRecordOnSameDay({
            params:{
              currentDate:moment(currentDate).format('YYYY-MM-DD'),
              currentMramId: -1, // new:-1
              patientKey
            },
            callback:recordIds=>{
              this.props.closeCommonCircularDialog();
              if (recordIds.length>0) {
                this.props.openCommonMessage({
                  msgCode: MRAM_CODE.DUPLICATED_ASSESSMENT_DATE_RECORD_BY_NEW,
                  params: [ { name: 'assessmentDate', value: moment(currentDate).format('DD-MMM-YYYY') } ],
                  btnActions:{
                    btn1Click:()=>{
                      updateState&&updateState({
                        view:false,
                        isNewFlag:true,
                        selectRow:null,
                        dervieType:0,
                        dateTime: '',
                        originDateTime: null,
                        recordMramAssessmentStatus: constant.mramAssessmentStatus.inProgress,
                        editFlag: false,
                        refreshFlag: true
                      });
                      handleClose&&handleClose();
                    }
                  }
                });
              } else {
                updateState&&updateState({
                  view:false,
                  isNewFlag:true,
                  selectRow:null,
                  dervieType:0,
                  dateTime: currentDate,
                  originDateTime: null,
                  recordMramAssessmentStatus: constant.mramAssessmentStatus.inProgress,
                  editFlag: false,
                  refreshFlag: true
                });
                handleClose&&handleClose();
              }
            }
          });
        }
      });
    } else if (mode==='edit') {
      this.props.openCommonCircularDialog();
      this.props.getMramFieldValueList({
          params: {
            mramId: this.state.selectRow
          },
          callback: data => {
            if(data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE) {
              let payload = {
                msgCode: data.msgCode,
                btnActions:
                {
                  btn1Click: () => {
                    this.refreshMramHistoryData();
                  }
                }
              };
              this.props.openCommonMessage(payload);
            }else{
              updateState&&updateState({
                view:false,
                isNewFlag:false,
                selectRow:this.state.selectRow,
                dateTime:this.state.selectObj.mramAssessmentDtm,
                originDateTime: this.state.selectObj.mramAssessmentDtm,
                recordMramAssessmentStatus:data.mramAssessmentStatus,
                editFlag: false,
                refreshFlag: true,
                dervieType:3
              });
              handleClose&&handleClose();
              this.props.closeCommonCircularDialog();
              // check not sign off & assessment date > 6 month
              if (data.mramAssessmentStatus === constant.mramAssessmentStatus.inProgress && moment(data.mramAssessmentDtm).add(6, 'months').isSameOrBefore(moment())) {
                this.props.openCommonMessage({
                  msgCode: MRAM_CODE.OVER_6_MONTH_WITHOUT_SIGN_OFF
                });
              }
            }
          }
      });
    }
  }

  newMram=()=>{
    let {editFlag,handlePromptSave,patientKey,insertMramLog}=this.props;
    this.props.openCommonCircularDialog();
    this.props.checkMramRecordCreatedWithin6Months({
      params:{patientKey},
      callback: recordIds => {
        this.props.closeCommonCircularDialog();
        if (editFlag) {
          this.props.openCommonMessage({
            msgCode: MRAM_CODE.DISCARD_CHANGE_COMFIRM,
            btn1AutoClose: false,
            btn2AutoClose: false,
            btnActions: {
              btn1Click: () => {
                this.props.closeCommonMessage();
                if (recordIds.length>0) {
                  this.props.openCommonMessage({
                    msgCode: MRAM_CODE.ANOTHER_RECORD_WITHIN_6_MONTHS_FOUND,
                    btn1AutoClose:false,
                    btnActions: {
                      btn1Click: () => {
                        this.props.closeCommonMessage();
                        handlePromptSave&&handlePromptSave('new');
                      }
                    }
                  });
                } else {
                  handlePromptSave&&handlePromptSave('new');
                }
              },
              btn2Click: () => {
                this.props.closeCommonMessage();
                if (recordIds.length>0) {
                  this.props.openCommonMessage({
                    msgCode: MRAM_CODE.ANOTHER_RECORD_WITHIN_6_MONTHS_FOUND,
                    btn1AutoClose:false,
                    btnActions: {
                      btn1Click: () => {
                        this.props.closeCommonMessage();
                        this.handleResetMramData('new');
                      }
                    }
                  });
                } else {
                  this.handleResetMramData('new');
                }
              }
            }
          });
        } else {
          if (recordIds.length>0) {
            this.props.openCommonMessage({
              msgCode: MRAM_CODE.ANOTHER_RECORD_WITHIN_6_MONTHS_FOUND,
              btn1AutoClose:false,
              btnActions: {
                btn1Click: () => {
                  this.props.closeCommonMessage();
                  this.handleResetMramData('new');
                }
              }
            });
          } else {
            this.handleResetMramData('new');
          }
        }
      }
    });
    insertMramLog&&insertMramLog('[MRAM History List Dialog] Action: Click \'New\' button','mram/checkMramDuplicatedRecord');
  }

  viewMram=()=>{
    let {getPreviewReportData}=this.props;
    getPreviewReportData&&getPreviewReportData('Metabolic Risk Assessment Report',this.state.selectRow,this.refreshMramHistoryData);
  }

  editMram=()=>{
    let {editFlag,handlePromptSave}=this.props;
    if (editFlag) {
      this.props.openCommonMessage({
        msgCode: MRAM_CODE.DISCARD_CHANGE_COMFIRM,
        btn1AutoClose:false,
        btnActions: {
          btn1Click: () => {
            this.props.closeCommonMessage();
            handlePromptSave&&handlePromptSave('edit',this.state.selectRow);
          },
          btn2Click: () => {
            this.handleResetMramData('edit');
          }
        }
      });
    } else {
      this.handleResetMramData('edit');
    }
  }

  handleViewOpen = () => {
    const{insertMramLog}=this.props;
    let params=this.state.selectRow;
    if(params){
      let data = this.state.selectObj;
      insertMramLog&&insertMramLog(`[MRAM History List Dialog] Action: Click 'View' button (MRAM ID: ${data.mramId}; Metabolic Risk Assessment Date: ${data.mramAssessmentDtm})`,'mram/reportMramReport');
      this.viewMram();
    }else{
      insertMramLog&&insertMramLog('[MRAM History List Dialog] Action: Click \'View\' button (No record is selected; MRAM ID: null; Metabolic Risk Assessment Date: null)','');
      let payload = {
        msgCode:MRAM_HISTORY_CODE.IS_HISTORY_EDIT,
        params:[
          {
            name:'action',
            value:'view'
          },
          {
            name:'title',
            value:'View'
          }
        ]
      };
      this.props.openCommonMessage(payload);
    }
  }

  handleEditOpen = () => {
    const{insertMramLog}=this.props;
    let params=this.state.selectRow;
    if(params){
      let data = this.state.selectObj;
      this.editMram();
      insertMramLog&&insertMramLog(`[MRAM History List Dialog] Action: Click 'Edit' button (MRAM ID: ${data.mramId}; Metabolic Risk Assessment Date: ${data.mramAssessmentDtm})`,'mram/loadMramDetails');
    } else {
      insertMramLog&&insertMramLog('[MRAM History List Dialog] Action: Click \'Edit\' button (No record is selected; MRAM ID: null; Metabolic Risk Assessment Date: null)','');
      let payload = {
        msgCode:MRAM_HISTORY_CODE.IS_HISTORY_EDIT,
        params:[
          {
            name:'action',
            value:'edit'
          },
          {
            name:'title',
            value:'Edit'
          }
        ]
      };
      this.props.openCommonMessage(payload);
    }
  };

  resetState = () => {
    this.setState({
      templateList: [],
      selectRow: null
    });
  }

  refreshMramHistoryData = () =>{
    let { patientKey } = this.props;
    this.props.requestHistoryService({
      params: {patientKey},
      callback:(recordList) =>{
          this.props.closeCommonCircularDialog();
          this.setState({
            templateList: recordList.data
          });
      }
    });
  }

  render() {
    const {classes,openHistory} = this.props;

    return (
      <EditTemplateDialog
          dialogTitle={'MRAM History List'}
          open={openHistory}
          onExited={this.resetState}
          onEscapeKeyDown={() =>this.handleDialogClose()}
      >
        <Card className={classes.bigContainerbigContainer}>
          <CardHeader className={classes.cardHearder} title={'Please select a case for editing'} />
          <Paper className={classes.paperTable} >
            <CardContent style={{paddingTop:0}} className={classes.cardContent}>
              <div className={classes.tableDiv}>
                <CIMSTable
                    id="mram_history_table"
                    data={this.state.templateList}
                    getSelectRow={this.getSelectRow}
                    options={this.state.tableOptions}
                    rows={this.state.tableRows}
                    rowsPerPage={this.state.pageNum}
                    selectRow={this.state.selectRow}
                    style={{marginTop:20}}
                    tipsListSize={this.state.tipsListSize}
                />
              </div>
            </CardContent>
          </Paper>
        </Card>
        <Typography component="div">
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item xs={6}>
              <label className={classes.label}>MRAM records over 6 months old should be signed off.</label>
            </Grid>
            <Grid item xs>
              <div className={classes.btnGroup}>
                <CIMSButton
                    classes={{label:classes.fontLabel, root:classes.btnRoot}}
                    color="primary"
                    id="btn_mramHistory_view"
                    size="small"
                    onClick={this.handleViewOpen}
                >
                  View
                </CIMSButton>
                <CIMSButton
                    classes={{label:classes.fontLabel, root:classes.btnRoot}}
                    color="primary"
                    id="btn_mramHistory_new"
                    size="small"
                    onClick={this.newMram}
                >
                  New
                </CIMSButton>
                <CIMSButton
                    classes={{label:classes.fontLabel, root:classes.btnRoot}}
                    color="primary"
                    id="btn_mramHistory_save"
                    size="small"
                    onClick={this.handleEditOpen}
                >
                  Edit
                </CIMSButton>
                <CIMSButton
                    classes={{label:classes.fontLabel, root:classes.btnRoot}}
                    color="primary"
                    id="btn_mramHistory_reset"
                    onClick={() =>this.handleDialogClose()}
                    size="small"
                >
                  Cancel
                </CIMSButton>
              </div>
            </Grid>
          </Grid>
        </Typography>
      </EditTemplateDialog>
    );
  }
}

function mapStateToProps() {
  return {
    // templateList: state.diagnosisReducer.templateList
  };
}
const mapDispatchToProps = {
  requestHistoryService,
  getMramFieldValueList,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  openCommonMessage,
  closeCommonMessage,
  initMramFieldValueList,
  checkDuplicatedMramRecordOnSameDay,
  checkMramRecordCreatedWithin6Months
};
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(style)(MRAMHistoryDialog));
