/*
 * Front-end UI for save/update/add/Up/Down  IOE manage token instruction
 * Load IOE token Instruction List From List Action: [manageTokenInstruction.js] componentDidMount
 * -> [tokenTemplateManagementAction.js] getInstructionList
 * -> [tokenTemplateManagementSaga.js] getInstructionList
 * -> [tokenTemplateManagementReducer.js] instructionListData
 * -> Backend API = /ioe/getTokenInsturcts
 * Save Action: [tokenTemplateManagementAction.js] Save -> handleSave
 * -> [tokenTemplateManagementSaga.js] updateIoeTurnaroundTimeList
 * -> [tokenTemplateManagementReducer.js] updateIoeTurnaroundTimeList
 * -> Backend API = /ioe/saveReminderInsturcts
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { styles } from './tokenTemplateManagementCss/instructionCss';
import { withStyles, Typography, Button, Grid, IconButton, Dialog, DialogContent, DialogTitle,createMuiTheme,MuiThemeProvider } from '@material-ui/core';
import { AddCircle, Clear, Check, EditRounded, ArrowUpwardOutlined, ArrowDownwardOutlined } from '@material-ui/icons';
import MaterialTable, { MTableAction, MTableToolbar ,MTableBodyRow} from 'material-table';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import StringTextField from './components/StringTextField/StringTextField';
import { trim, cloneDeep, find, isEqual } from 'lodash';
import moment from 'moment';
import DropdownField from './components/DropdownField/DropdownField';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { openCommonCircularDialog, closeCommonCircularDialog } from '../../../../store/actions/common/commonAction';
import { getInstructionList, saveInstructionList } from '../../../../store/actions/IOE/tokenTemplateManagement/tokenTemplateManagementAction';
import { TOKEN_TEMPLATE_MANAGEMENT_CODE } from '../../../../constants/message/IOECode/tokenTemplateManagementCode';
import DataOperationEnum from '../../../../enums/tokenTemplateManagement/dataOperationEnum';
import Draggable from 'react-draggable';
import Paper from '@material-ui/core/Paper';
import { COMMON_STYLE }from '../../../../constants/commonStyleConstant';
import * as commonConstants from '../../../../constants/common/commonConstants';
import {getState} from '../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

function PaperComponent(props) {
  return (
    <Draggable enableUserSelectHack={false}
        onStart={(e)=>{
      if (e.target.getAttribute('customdrag') === 'allowed') {
        return true;
      } else {
        return false;
      }
    }}
    >
      <Paper {...props} />
    </Draggable>
  );
}

const theme = createMuiTheme({
  overrides: {
    MuiPaper:{
      root:{
        backgroundColor: color.cimsBackgroundColor
      }
    },
    MuiTableCell: {
      root: {
        borderLeft: '1px solid rgba(224, 224, 224, 1)'
      },
      body: {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily
      }
    },
    MuiSelect: {
      root: {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily
      }
    },
    props: {
      MuiTable: {
        id: 'manage_instruction_table'
      }
    },
    MuiTableSortLabel: {
      root: {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily
      }
    },
    MuiTableRow: {
      root: {
        backgroundColor: color.cimsBackgroundColor
      }
    },
    ComponenthorizontalScrollContainer: {
      height: 300
    },
    MuiButton:{
      textPrimary:{
        color:'#0579c8'
      }
    }
  }
});

class ManageTokenInstruction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formRequireFlag: false,
      timeRequireFlag: false,
      timeIllegalFlag: false,
      columns: [
        {
          title: 'Seq',
          field: 'seq',
          cellStyle: {
            fontSize:font.fontSize,
            padding: '4px',
            borderRight: '1px solid rgba(224, 224, 224, 1)'
          },
          headerStyle: {
            borderRight: '1px solid rgba(224, 224, 224, 1)',
            width: '5%',
            height: '10%',
            padding: 8
          },
          editable: 'never'
        },
        {
          title: 'Instruction',
          field: 'instructDesc',
          cellStyle: {
            fontSize: font.fontSize,
            padding: '4px',
            borderRight: '1px solid rgba(224, 224, 224, 1)'
          },
          headerStyle: {
            padding: 8,
            borderRight: '1px solid rgba(224, 224, 224, 1)',
            width: '40%'
          },
          render: rowData => {
            return (
              <div style={{fontSize:font.fontSize, whiteSpace: 'pre-wrap'}}>{rowData.instructDesc}</div>
            );
          },
          editComponent: props => {
            let { timeRequireFlag, timeIllegalFlag } = this.state;
            let originChange = props.onChange;
            return (
              <StringTextField
                  style={{fontSize:font.fontSize}}
                  id="instructDesc"
                  placeholder="Instruction"
                  value={props.value}
                  valueChange={(value) => { this.handleTableCellChange(value, originChange); }}
                  updateState={this.updateState}
                  timeRequireFlag={timeRequireFlag}
                  timeIllegalFlag={timeIllegalFlag}
              />
            );
          }
        },
        {
          title: 'Active',
          field: 'isActive',
          lookup: {},
          cellStyle: {
            fontSize:font.fontSize,
            padding: '4px',
            borderRight: '1px solid rgba(224, 224, 224, 1)'
          },
          headerStyle: {
            padding: 8,
            borderRight: '1px solid rgba(224, 224, 224, 1)',
            width: '10%'
          },
          editable: 'always',
          render: rowData => {
            let { activeDropList } = this.state;
            let dataObj = find(activeDropList, obj => {
              let isActiveString = rowData.isActive + '';
              return obj.activeCode == isActiveString;
            });
            return (
              <div style={{fontSize:font.fontSize}}>{!!dataObj ? dataObj.activeValue + '' : ''}</div>
            );
          },
          editComponent: props => {
            let { formRequireFlag, activeDropList } = this.state;
            let originChange = props.onChange;
            return (
              <DropdownField
                  id="isActive"
                  // style={{fontSize:'1rem'}}
                  value={props.value!==undefined?props.value + '':props.value}
                  valueChange={(value) => { this.handleTableCellChange(value, originChange); }}
                  updateState={this.updateState}
                  formRequireFlag={formRequireFlag}
                  activeList={activeDropList}
                  // inputProps={{
                  //   style:{
                  //     fontSize:'1rem'
                  //   }
                  // }}
              />
            );
          }
        },
        {
          title: 'Updated By',
          field: 'updatedByName',
          editable: 'never',
          cellStyle: {
            fontSize: font.fontSize,
            padding: '4px',
            borderRight: '1px solid rgba(224, 224, 224, 1)'
          },
          headerStyle: {
            padding: 8,
            borderRight: '1px solid rgba(224, 224, 224, 1)',
            width: '20%'
          }
        },
        {
          title: 'Date',
          field: 'updatedDtm',
          editable: 'never',
          render: rowData => {
            return (
              <div style={{fontSize:font.fontSize}} id="updatedDtm" >{rowData !== undefined ? moment(rowData.updatedDtm).format('DD-MMM-YYYY') : null}</div>);
          },
          cellStyle: {
            fontSize: font.fontSize,
            padding: '4px',
            borderRight: '1px solid rgba(224, 224, 224, 1)'
          },
          headerStyle: {
            padding: 8,
            borderRight: '1px solid rgba(224, 224, 224, 1)',
            width: '20%'
          }
        }
      ],
      activeDropList: [{ activeCode: '1', activeValue: 'Yes' }, { activeCode: '0', activeValue: 'No' }],
      dataList: [],
      //serviceCd: JSON.parse(sessionStorage.getItem('service')).serviceCd,
      // serviceEngDesc: JSON.parse(sessionStorage.getItem('loginInfo')).service.engDesc,//暂无提供此字段，先写死（by wentao）
      //serviceEngDesc: JSON.parse(sessionStorage.getItem('service')).serviceName,
      serviceEngDesc:JSON.parse(sessionStorage.getItem('clinic')).clinicName!==undefined?JSON.parse(sessionStorage.getItem('clinic')).clinicName+'('+JSON.parse(sessionStorage.getItem('clinic')).clinicCd+')':JSON.parse(sessionStorage.getItem('clinic')).clinicCd,
      ableClick: false,
      addClickMark:false,
      noDataTip:'There is no data.'
    };
  }

  componentDidMount() {
    let { columns } = this.state;
    columns[2].lookup = { '0': 'No', '1': 'Yes' };
    let params = {};
    this.props.getInstructionList({
      params, callback: (data) => {
        this.setState({
          dataList: cloneDeep(data),
          seq: null,
          selectedObj: null,
          columns
        });
      }
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let { dataList } = this.state;
    if (!isEqual(dataList, nextProps.instructions)) {
      this.setState({
        dataList: cloneDeep(nextProps.instructions)
      });
    }
  }

  initData = () => {
    let params = {};
    this.props.getInstructionList({
      params, callback: (data) => {
        this.setState({
          dataList: cloneDeep(data),
          seq: null,
          selectedObj: null,
          ableClick: false,
          addClickMark:false
        });
      }
    });
  };

  handleTableCellChange = (value, originChange) => {
    originChange(value);
  }

  updateState = (obj) => {
    this.setState({
      ...obj
    });
  }

  dataRequiredCheck = (data) => {
    let formRequireFlag = false;
    let timeRequireFlag = false;
    let flag = false;
    if (trim(data.instructDesc) === '') {
      timeRequireFlag = true;
      flag = true;
    }
    if (data.isActive === undefined) {
      formRequireFlag = true;
      flag = true;
    }
    this.setState({
      formRequireFlag,
      timeRequireFlag
    });
    return flag;
  }

  handleActionAdd = (event, tableProps) => {
    const { insertReminderTemplateLog, InstructionResult } = this.props;
    let btnNode = document.getElementById('btn_token_instruction_cancel');
    if (btnNode) {
      if(!this.state.dataList.length>0){
        this.setState({
          noDataTip: 'There is no data.'
        });
      }
      this.setState({
        ableClick: false,
        addClickMark:false,
        seq: null
      });
    } else {
      if(!this.state.dataList.length>0){
        this.setState({
          noDataTip: ''
        });
      }
      this.setState({
        formRequireFlag: false,
        timeRequireFlag: false,
        timeIllegalFlag: false,
        ableClick: true,
        addClickMark:true,
        seq: null
      });
      insertReminderTemplateLog&&insertReminderTemplateLog(`${InstructionResult} Action: Click 'Add' button`, '');
    }
    tableProps.action.onClick(event, tableProps.data);
  }

  handleActionSave = (event, tableProps) => {
    //Test
    // const{insertReminderTemplateLog}=this.props;
    tableProps.action.onClick(event, tableProps.data);
    // insertReminderTemplateLog('Click Save Button Manage Reminder Instruction Dialog and Table Rows Add/Edit icon item','');
  }

  handleActionCancel = (event, tableProps) => {
    const{insertReminderTemplateLog,InstructionResult}=this.props;
    let dataValue = tableProps.data;
    let name = '';
    if (Object.keys(dataValue).length > 0) {
      name = `(Instruction ID: ${dataValue.ioeReminderInstructionId});`;
    } else {
      name = '(New record is selected; Instruction ID: null)';
    }
    if(!this.state.dataList.length>0){
      this.setState({
        noDataTip: 'There is no data.'
      });
    }
    this.setState({
      formRequireFlag: false,
      timeRequireFlag: false,
      timeIllegalFlag: false,
      ableClick: false,
      addClickMark:false
    });
    tableProps.action.onClick(event, dataValue);
    insertReminderTemplateLog&&insertReminderTemplateLog(`${InstructionResult} Action: Click 'X' (Cancel) button ${name}`,'');
  }

  handleRowAdd = (newData) => {
    const{insertReminderTemplateLog,InstructionResult}=this.props;
    let { dataList, formRequireFlag, timeRequireFlag, timeIllegalFlag } = this.state;
    insertReminderTemplateLog&&insertReminderTemplateLog(`${InstructionResult} Action: Click '✓' (Confirm) button (New record is selected; Instruction ID: null)`,'');
    return new Promise((resolve, reject) => {
      if (formRequireFlag || timeRequireFlag || timeIllegalFlag || this.dataRequiredCheck(newData)) {
        reject();
      } else {
        dataList.push({
          seq: dataList.length + 1,
          ioeReminderInstructionId: null,
          instructDesc: newData.instructDesc,
          isActive: parseInt(newData.isActive),
          updatedByName: JSON.parse(sessionStorage.getItem('loginInfo')).loginName,
          updatedDtm: new Date(),
          operationType: DataOperationEnum.Insert
        });
        this.setState({ dataList }, () => resolve());
      }
    });
  }

  handleRowUpdate = (newData, oldData) => {
    const { insertReminderTemplateLog,InstructionResult } = this.props;
    let { dataList, timeRequireFlag, timeIllegalFlag } = this.state;
    insertReminderTemplateLog(`${InstructionResult} Action: Click '✓' (Confirm) button (Instruction ID: ${oldData.ioeReminderInstructionId});`, '');
    return new Promise((resolve, reject) => {
      if (timeRequireFlag || timeIllegalFlag) {
        reject();
      } else {
        let index = dataList.indexOf(oldData);
        newData.operationType = DataOperationEnum.UPDATE;
        dataList[index] = newData;
        this.setState({ dataList }, () => resolve());
      }
    });
  }
  //Test 待定
  handleEdit = (event) => {
    let { insertReminderTemplateLog, InstructionResult } = this.props;
    // let dataRow = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.attributes[1];
    // console.log('aa', dataRow);
    insertReminderTemplateLog && insertReminderTemplateLog(`${InstructionResult} Action: Click 'Edit' button (New record is selected; Instruction ID: null ZH: TEST)`, '');
  }


  generateResultObj = () => {
    let { dataList } = this.state;
    let tempDataList = cloneDeep(dataList);
    tempDataList.forEach(element => {
      delete element.tableData;
    });
    return tempDataList;
  }

  handleSave = () => {
    let btnNode = document.getElementById('btn_token_instruction_cancel');
    const { handleInstructionDialogCancel, insertReminderTemplateLog, refreshData,InstructionResult } = this.props;
    if (btnNode) {
      let payload = {
        msgCode: TOKEN_TEMPLATE_MANAGEMENT_CODE.COMPLETE_PREVIOUS_ACTION_COMFIRM
      };
      this.props.openCommonMessage(payload);
    } else {
      this.props.openCommonCircularDialog();
      let resultList = this.generateResultObj();
      insertReminderTemplateLog && insertReminderTemplateLog(`${InstructionResult} Action: Click 'Save' button`, '/ioe/saveReminderInsturcts');
      this.props.saveInstructionList({
        params: resultList,
        callback: (data) => {
          if(data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
            let payload = {
              msgCode: data.msgCode,
              btnActions:
              {
                btn1Click: () => {
                  this.initData();
                  refreshData();
                  handleInstructionDialogCancel();
                  this.props.closeCommonCircularDialog();
                },
                btn2Click: () => {
                  this.props.closeCommonCircularDialog();
                }
              }
            };
            this.props.openCommonMessage(payload);
          }else{
            this.initData();
            let payload = {
              msgCode: data.msgCode,
              showSnackbar: true
            };
            this.props.openCommonMessage(payload);
            this.props.closeCommonCircularDialog();
            refreshData();
            handleInstructionDialogCancel();
          }
        }
      });
    }
  }

  dataEditStatusCheck = () => {
    const { instructions } = this.props;
    let { dataList } = this.state;
    let tempDataList = cloneDeep(dataList);
    tempDataList.forEach(element => {
      element.operationType = null;
      delete element.tableData;
    });
    if (!isEqual(tempDataList, instructions)) {
      return true;
    }
    return false;
  }

  handleCancel = () => {
    const { instructions, handleInstructionDialogCancel,InstructionResult,insertReminderTemplateLog } = this.props;
    let btnNode = document.getElementById('btn_token_instruction_cancel');
    if (this.dataEditStatusCheck() || !!btnNode) {
      let payload = {
        msgCode: TOKEN_TEMPLATE_MANAGEMENT_CODE.CANCEL_MANAGE_TOKEN_INSTRUCTION_CHANGE,
        btnActions: {
          // Yes
          btn1Click: () => {
            if (!!btnNode) {
              btnNode.click();
            }
            this.setState({
              formRequireFlag: false,
              timeRequireFlag: false,
              timeIllegalFlag: false,
              seq: null,
              noDataTip: 'There is no data.',
              dataList: cloneDeep(instructions)
            });
            insertReminderTemplateLog&&insertReminderTemplateLog(`${InstructionResult} Action: Click 'Cancel' button'`,'');
            handleInstructionDialogCancel();
          }
        }
      };
      this.props.openCommonMessage(payload);
    } else {
      this.setState({
        formRequireFlag: false,
        timeRequireFlag: false,
        timeIllegalFlag: false,
        seq: null,
        noDataTip: 'There is no data.'
      });
      handleInstructionDialogCancel();
    }
  }


  // handleClickCancle = () => {
  //   const { handleInstructionDialogCancel } = this.props;
  //   handleInstructionDialogCancel();
  // }

  handeleRowClick = (event, rowData) => {
    let btnNode = document.getElementById('btn_token_instruction_cancel');
    if (!btnNode) {
      let seq = rowData.seq;
      this.setState({
        seq: seq,
        selectedObj: rowData
      });
    }
  }


  handleClickDown = () => {
    const{insertReminderTemplateLog,InstructionResult}=this.props;
    let instructionList = this.state.dataList;
    let seq = this.state.seq;
    let btnNode = document.getElementById('btn_token_instruction_cancel');
    let name='';
    if (!btnNode) {
      if (seq) {
        let index = this.state.seq - 1;
        if (instructionList[index + 1]) {
          if (instructionList[index].ioeReminderInstructionId !== null) {
            name = `(Sequence Number: ${instructionList[index].seq}; Instruction ID: ${instructionList[index].ioeReminderInstructionId});`;
          } else {
            name = `(New record is selected; Sequence Number: ${index}; Instruction ID: null)`;
          }
          instructionList[index].seq = seq + 1;
          instructionList[index].operationType = DataOperationEnum.UPDATE;
          instructionList[index + 1].seq = seq;
          instructionList[index + 1].operationType = DataOperationEnum.UPDATE;
          [instructionList[index], instructionList[index + 1]] = [instructionList[index + 1], instructionList[index]];
          this.setState({
            seq: seq + 1,
            dataList: instructionList,
            isSave: false
          });
        }
      } else {
        name = '(No record is selected Instruction ID: null;)';
        let msgCode = TOKEN_TEMPLATE_MANAGEMENT_CODE.DOWN_MANAGE_TOKEN_INSTRUCTION_ACTION;
        this.checkSelect(msgCode);
      }
      insertReminderTemplateLog&&insertReminderTemplateLog(`${InstructionResult} Action: Click 'Down' button ${name}`, '');
    } else {
      if(this.state.addClickMark){
        let msgCode = TOKEN_TEMPLATE_MANAGEMENT_CODE.ADD_MANAGE_TOKEN_INSTRUCTION_ACTION;
        this.checkSelect(msgCode);
      }else{
        let msgCode = TOKEN_TEMPLATE_MANAGEMENT_CODE.EDIT_MANAGE_TOKEN_INSTRUCTION_ACTION;
        this.checkSelect(msgCode);
      }
    }
  }

  handleClickUp = () => {
    const{insertReminderTemplateLog,InstructionResult}=this.props;
    let btnNode = document.getElementById('btn_token_instruction_cancel');
    let instructionList = this.state.dataList;
    let seq = this.state.seq;
    let name='';
    if (!btnNode) {
      if (seq) {
        let index = this.state.seq - 1;
        if (instructionList[index - 1]) {
          if (instructionList[index].ioeReminderInstructionId !== null) {
            name = `(Sequence Number: ${instructionList[index].seq}; Instruction ID: ${instructionList[index].ioeReminderInstructionId})`;
          } else {
            name = `(New record is selected; Sequence Number: ${index}; Instruction ID: null)`;
          }
          instructionList[index].seq = index;
          instructionList[index].operationType = DataOperationEnum.UPDATE;
          instructionList[index - 1].seq = seq;
          instructionList[index - 1].operationType = DataOperationEnum.UPDATE;
          [instructionList[index], instructionList[index - 1]] = [instructionList[index - 1], instructionList[index]];
          this.setState({
            seq: index,
            dataList: instructionList
          });
        }
      } else {
        name = '(No record is selected Instruction ID: null;)';
        let msgCode = TOKEN_TEMPLATE_MANAGEMENT_CODE.UP_MANAGE_TOKEN_INSTRUCTION_ACTION;
        this.checkSelect(msgCode);
      }
      insertReminderTemplateLog && insertReminderTemplateLog(`${InstructionResult} Action: Click 'Up' button ${name}`, '');
    } else {
      if (this.state.addClickMark) {
        let msgCode = TOKEN_TEMPLATE_MANAGEMENT_CODE.ADD_MANAGE_TOKEN_INSTRUCTION_ACTION;
        this.checkSelect(msgCode);
      } else {
        let msgCode = TOKEN_TEMPLATE_MANAGEMENT_CODE.EDIT_MANAGE_TOKEN_INSTRUCTION_ACTION;
        this.checkSelect(msgCode);
      }
    }
  }


  checkSelect = (msgCode) => {
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

  handleEscKeyDown = () =>{
    this.handleCancel();
  }


  render() {
    const { classes, instructionOpen } = this.props;
    let { columns, dataList } = this.state;
    return (


      <Dialog
          open={instructionOpen}
          fullWidth
          maxWidth="lg"
          disableEnforceFocus
          PaperComponent={PaperComponent}
          onEscapeKeyDown={this.handleEscKeyDown}
      >
        <DialogTitle
            className={classes.dialogTitle}
            id="instruction_title"
            disableTypography customdrag="allowed"
        >Manage Reminder Instruction</DialogTitle>
        <Typography component="div" className={classes.divBorder}>
          <DialogContent className={classes.dialogContent}>
            <Typography
                component="div"
                style={{ marginLeft: 5, marginRight: 5 }}
            >
              <Grid container
                  style={{ marginTop: -10, marginLeft: -8 }}
              >
                <label className={classes.left_Label}
                    id="instruction_serviceLable"
                >Clinic: {this.state.serviceEngDesc}</label>
                 {/* ({this.state.serviceCd}) */}
              </Grid>
            </Typography>
            {/* table */}
            <Typography component="div" className={classes.tableWrapper}>
              {/* MaterialTable */}
              <MuiThemeProvider theme={theme}>
                <div id="manageTokenInstruction">
                <MaterialTable
                    className={classes.table}
                    columns={columns}
                    data={dataList}
                    onRowClick={this.handeleRowClick.bind(this)}
                    options={{
                    sorting: false,
                    search: false,
                    paging: false,
                    showTitle: false,
                    actionsColumnIndex: -1,
                    toolbarButtonAlignment: 'left',
                    maxBodyHeight:612,
                    headerStyle: {
                      fontSize: font.fontSize,
                      fontWeight: 'bold',
                      backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
                      color:'white',
                      padding: 8
                    },
                    rowStyle: rowData => {
                      if (rowData.seq == this.state.seq) {
                        return { backgroundColor: 'cornflowerblue', wordBreak: 'break-all', height: 53 };
                      }
                      return { wordBreak: 'break-all', height: 53 ,textDecoration:'text-decoration'};
                    },
                    cellStyle:()=>{
                        return { textDecoration:'text-decoration'};
                    }
                  }}
                    actions={[
                    {
                      icon: 'Up',
                      tooltip: 'Up',
                      isFreeAction: true,
                      onClick: () => {}
                    },
                    {
                      icon: 'Down',
                      tooltip: 'Down',
                      isFreeAction: true,
                      onClick: () => {}
                    }
                  ]}
                    components={{
                    Action: props => {
                      if (props.action.tooltip === 'Add') {
                        return (
                          <Button
                              id="btn_token_instruction_add"
                              color="primary"
                              style={{ float: 'left'}}
                              onClick={(event) => { this.handleActionAdd(event, props); }}
                          >
                            <AddCircle />
                            <span className={classes.btnSpan}>Add</span>
                          </Button>
                        );
                      }
                      else if (props.action.tooltip === 'Save') {
                        return (
                          <IconButton
                              id="btn_token_instruction_save"
                              className={classes.iconBtn}
                              onClick={(event) => { this.handleActionSave(event, props); }}
                          >
                            <Check />
                          </IconButton>
                        );
                      }
                      else if (props.action.tooltip === 'Cancel') {
                        return (
                          <IconButton
                              id="btn_token_instruction_cancel"
                              className={classes.iconBtn}
                              onClick={(event) => { this.handleActionCancel(event, props); }}
                          >
                            <Clear />
                          </IconButton>
                        );
                      } else if (props.action.icon === 'Up') {
                        return (
                          <Button
                              id="btn_instruction_up"
                              color="primary"
                              onClick={this.handleClickUp}
                              disabled={false}
                          >
                            <ArrowUpwardOutlined />
                            <span className={classes.btnSpan}>Up</span>
                          </Button>
                        );
                      }
                      else if (props.action.icon === 'Down') {
                        return (
                          <Button
                              id="btn_instruction_down"
                              color="primary"
                              onClick={this.handleClickDown}
                              disabled={false}
                          >
                            <ArrowDownwardOutlined />
                            <span className={classes.btnSpan}>Down</span>
                          </Button>
                        );
                      }
                      else {
                        return (
                          <MTableAction {...props} />
                        );
                      }
                    },
                    Row: props => (
                          <MTableBodyRow id={'manage_instruction_rowId_'+props.index} {...props} />
                    ),
                    Toolbar: props => {
                      return (
                        <div>
                          <MTableToolbar
                              classes={{
                                'root':classes.toolBar
                              }}
                              {...props}
                          />
                        </div>
                      );
                    },
                    OverlayLoading: () => null
                  }}
                    editable={{
                    onRowAdd: newData => {
                      return this.handleRowAdd(newData);
                    },
                    onRowUpdate: (newData, oldData) => {
                      return this.handleRowUpdate(newData, oldData);
                    }
                  }}
                    icons={{
                    Edit: (props) => <EditRounded id="btn_token_instruction_edit" onClick={(event)=>{this.handleEdit(event);}} {...props} />
                  }}
                    localization={{
                    body: {
                      addTooltip: 'Add',
                      emptyDataSourceMessage: this.state.noDataTip
                    }
                  }}
                />
                </div>
              </MuiThemeProvider>

              {/* button group */}
              <Typography component="div">
                <Grid container alignItems="center" justify="flex-end">
                  <Typography component="div">
                    <CIMSButton
                        classes={{
                          label:classes.fontLabel
                        }}
                        id="btn_token_instruction_save_all"
                        color="primary"
                        size="small"
                        onClick={this.handleSave}
                    >
                      Save
                    </CIMSButton>
                    <CIMSButton
                        classes={{
                          label:classes.fontLabel
                        }}
                        id="btn_token_instruction__cancel_All"
                        color="primary"
                        size="small"
                        onClick={this.handleCancel}
                    >
                      Cancel
                    </CIMSButton>
                  </Typography>
                </Grid>
              </Typography>
            </Typography>
          </DialogContent>
        </Typography>
      </Dialog>
    );
  }
}

const mapStateToProps = state => {
  return {
    loginService: state.login.service,
    turnaroundTimeList: state.turnaroundTime.turnaroundTimeList,
    instructions: state.tokenTemplateManagement.instructionListData
  };
};

const mapDispatchToProps = {
  openCommonMessage,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  getInstructionList,
  saveInstructionList
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ManageTokenInstruction));
