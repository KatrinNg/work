/*
 * Front-end UI for save/update IOE turnaround time
 * Load IOE From List Action: [turnaroundTime.js] componentDidMount
 * -> [turnaroundTimeAction.js] getIoeFormDropList
 * -> [turnaroundTimeSaga.js] getIoeFormDropList
 * -> Backend API = /ioe/listCodeIoeForm
 * Load IOE Turnaround Time List Action: [turnaroundTime.js] componentDidMount
 * -> [turnaroundTimeAction.js] getIoeTurnaroundTimeList
 * -> [turnaroundTimeSaga.js] getIoeTurnaroundTimeList
 * -> Backend API = /ioe/listTurnaroundTime
 * Save Action: [turnaroundTime.js] Save -> handleSave
 * -> [turnaroundTimeAction.js] updateIoeTurnaroundTimeList
 * -> [turnaroundTimeSaga.js] updateIoeTurnaroundTimeList
 * -> Backend API = /ioe/saveTurnaroundTime
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { styles } from './turnaroundTimeStyle';
import { withStyles, Card, CardContent, Typography, Button, IconButton } from '@material-ui/core';
import { AddCircle, Clear, Check, EditRounded, DeleteOutline } from '@material-ui/icons';
import MaterialTable, { MTableAction,MTableToolbar } from 'material-table';
import IntegerTextField from './components/IntegerTextField/IntegerTextField';
import { trim,cloneDeep,find,isEqual,debounce} from 'lodash';
import DropdownField from './components/DropdownField/DropdownField';
import { getIoeFormDropList, getIoeTurnaroundTimeList, updateIoeTurnaroundTimeList } from '../../../../store/actions/IOE/turnaroundTime/turnaroundTimeAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { openCommonCircularDialog, closeCommonCircularDialog } from '../../../../store/actions/common/commonAction';
import { TURNAROUD_TIME_CODE } from '../../../../constants/message/IOECode/turnaroundTimeCode';
import { COMMON_CODE } from '../../../../constants/message/common/commonCode';
import { COMMON_ACTION_TYPE } from '../../../../constants/common/commonConstants';
import { COMMON_STYLE }from '../../../../constants/commonStyleConstant';
import { createMuiTheme,MuiThemeProvider } from '@material-ui/core/styles';
import Container from 'components/JContainer';
import {updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../../../enums/accessRightEnum';
import * as commonConstants from '../../../../constants/common/commonConstants';
import * as commonUtils from '../../../../utilities/josCommonUtilties';
import {getState} from '../../../../store/util';
const { color,font } = getState(state => state.cimsStyle) || {};

const theme = createMuiTheme({
  overrides: {
    MuiTableCell: {
      paddingNone: {
        borderLeft: '1px  solid rgba(224, 224, 224, 1)',
        backgroundColor: color.cimsBackgroundColor
      },
      body:{
        fontSize: font.fontSize,
        fontFamily: font.fontFamily
      }
    },
    MuiMenuItem : {
      gutters : {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily
      }
    },
    MuiSelect : {
      root : {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily
      }
    },
    MuiInput : {
      root : {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily
      }
    },
    MuiTableSortLabel:{
      root: {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily
      }
    },
    MuiList: {
      root: {
        backgroundColor: color.cimsBackgroundColor
      }
    },
    MuiButton:{
      textPrimary:{
        color:'#0579c8'
      }
    }
  }
});

class TurnaroundTime extends Component {
  constructor(props) {
    super(props);
    this.cardContent=React.createRef();
    this.state = {
      formRequireFlag: false,
      timeRequireFlag: false,
      timeIllegalFlag: false,
      selectedRow: null,
      columns: [
        {
          title: 'Form Name (Form ID)',
          field: 'codeIoeFormId',
          lookup: {},
          cellStyle: {
            fontSize: font.fontSize,
            borderRight: '1px  solid rgba(224, 224, 224, 1)',
            backgroundColor: color.cimsBackgroundColor
          },
          headerStyle: {
            width: '50%',
            borderRight: '1px  solid rgba(224, 224, 224, 1)'
          },
          editable: 'onAdd',
          render: rowData => {
            let { originDropList } = this.state;
            let dataObj = find(originDropList, obj=>{
              return obj.codeIoeFormId === rowData.codeIoeFormId;
            });
            return (
              <div style={{ fontSize: font.fontSize }}>{!!dataObj ? dataObj.nameAndNum : ''}</div>
            );
          },
          editComponent: props => {
            let {formRequireFlag,originDropList,dataList} = this.state;
            let originChange = props.onChange;
            return (
              <DropdownField
                  id="codeIoeFormId"
                  value={props.value}
                  valueChange={(value)=>{this.handleTableCellChange(value,originChange,'select');}}
                  updateState={this.updateState}
                  formRequireFlag={formRequireFlag}
                  originDropList={originDropList}
                  dataList={dataList}
              />
            );
          }
        },
        {
          title: 'Exp. Turnaround Time (Day)',
          field: 'turnaroundTime',
          cellStyle: {
            fontSize: font.fontSize,
            color: color.cimsTextColor,
            borderRight: '1px  solid rgba(224, 224, 224, 1)',
            backgroundColor: color.cimsBackgroundColor
          },
          headerStyle: {
            width: '50%',
            borderRight: '1px solid rgba(224, 224, 224, 1)'
          },
          render: rowData => {
            return (
              <div style={{ fontSize: font.fontSize }}>{rowData.turnaroundTime}</div>
            );
          },
          editComponent: props => {
            let {timeRequireFlag,timeIllegalFlag} = this.state;
            let originChange = props.onChange;
            return (
              <IntegerTextField
                  id="turnaroundTime"
                  placeholder="Exp. Turnaround Time (Day)"
                  value={props.value}
                  valueChange={(value)=>{this.handleTableCellChange(value,originChange,'input');}}
                  updateState={this.updateState}
                  timeRequireFlag={timeRequireFlag}
                  timeIllegalFlag={timeIllegalFlag}
              />
            );
          }
        }
      ],
      originDropList: [],
      deleteDataList: [],
      dataList:props.turnaroundTimeList||[],
      noDataTip:'There is no data.',
      isloadding:true,
      cardHeight:778,
      isSelectVal:''
    };
  }

  componentWillMount(){
    this.resetHeight();
    window.addEventListener('resize',this.resetHeight);
  }

  componentDidMount(){
    this.props.ensureDidMount();
    const {loginService} = this.props;
    let {columns} = this.state;
    this.props.getIoeTurnaroundTimeList({
      params: {
        serviceCd:loginService.serviceCd
      }
    });
    this.props.getIoeFormDropList({
      params:{},
      callback:(data) => {
        if (data.length > 0) {
          let tempObj = {};
          for (let i = 0; i < data.length; i++) {
            const element = data[i];
            tempObj[element.codeIoeFormId] = element.nameAndNum;
          }
          columns[0].lookup = tempObj;
          this.setState({
            columns,
            originDropList:cloneDeep(data),
            isloadding:false
          });
        }
      }
    });
    this.props.updateCurTab(accessRightEnum.turnaroundTimeMaintenance,this.doClose);
    this.insertTurnaroundTimeLog(`Actions: ${commonConstants.INSERT_LOG_STATUS.Open} Turnaround Time Maintenance`, 'ioe/listTurnaroundTime');
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if (!isEqual(this.props.turnaroundTimeList,nextProps.turnaroundTimeList)) {
      this.setState({
        dataList:cloneDeep(nextProps.turnaroundTimeList)
      });
    }
  }

  componentWillUnmount(){
    window.removeEventListener('resize',this.resetHeight);
  }

  resetHeight=debounce(()=>{
    if(this.cardContent.current&&this.cardContent.current.clientHeight&&this.cardContent.current.clientHeight!==this.state.cardHeight){
      this.setState({
        cardHeight:this.cardContent.current.clientHeight
      });
    }
  },1000);

  //关闭close tab
  doClose = (callback) => {
    let editFlag = this.dataEditStatusCheck();
    if (editFlag) {
      this.props.openCommonMessage({
        msgCode: COMMON_CODE.SAVE_WARING,
        btnActions: {
          btn1Click: () => {
            this.handleCancleSave(callback);
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Turnaround Time Maintenance');
            this.insertTurnaroundTimeLog(name,'/ioe/saveTurnaroundTime');
            // setInterval(callback(true), 1000);
          }, btn2Click: () => {
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Turnaround Time Maintenance');
            this.insertTurnaroundTimeLog(name,'');
            callback(true);
          }, btn3Click: () => {
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'Turnaround Time Maintenance');
            this.insertTurnaroundTimeLog(name, '');
          }
        },
        params: [
          {
            name: 'title',
            value: 'Turnaround Time Maintenance'
          }
        ]
      });
    }
    else {
      this.insertTurnaroundTimeLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close Turnaround Time Maintenance`,'');
      callback(true);
    }
  }

  handleTableCellChange = (value,originChange,typeHtml) => {
    if (typeHtml === 'select') {
      let { originDropList } = this.state;
      let dataObj = find(originDropList, obj => {
        return obj.codeIoeFormId === value;
      });
      let values = originDropList.length > 0 ? dataObj.nameAndNum : '';
      this.setState({ isSelectVal: values });
    }
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
    if (trim(data.turnaroundTime) === '') {
      timeRequireFlag = true;
      flag = true;
    }
    if (data.codeIoeFormId === undefined) {
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
    let btnNode = document.getElementById('btn_turnaround_time_row_cancel');
    if (!this.state.dataList.length > 0) {
      this.setState({
        noDataTip: ''
      });
    }
    if (!!btnNode) {
      let payload = {
        msgCode: COMMON_CODE.COMPLETE_PREVIOUS_ACTION_COMFIRM,
		    btnActions: {
          btn1Click: () => {
              let saveBtnNode = document.getElementById(
                  'btn_turnaround_time_row_save'
              );
              saveBtnNode.click();
              setTimeout(() => {
                let {formRequireFlag, timeRequireFlag, timeIllegalFlag} = this.state;
                if (!formRequireFlag && !timeRequireFlag && !timeIllegalFlag) {
                  this.handleActionAdd(event,tableProps);
                }
              },3000);
          }
        },
        params:[
          {name:'type',value:'Turnaround Time'}
        ]
      };
      this.props.openCommonMessage(payload);
    } else {
      this.setState({
        formRequireFlag: false,
        timeRequireFlag: false,
        timeIllegalFlag: false
      });
      tableProps.action.onClick(event, tableProps.data);
    }
    this.insertTurnaroundTimeLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Add' button`, '');
  }

  handleActionSave = (event, tableProps) => {
    let dataValue = tableProps.data;
    if (Object.keys(dataValue).length > 0) {
      let name = '';
      if (dataValue.ioeTurnaroundTimeId === null) {
        name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} '✓' (Confirm) button (New record is selected; IOE Turnaround Time ID: null; Code IOE Form ID: ${dataValue.codeIoeFormId}; Form Name: ${dataValue.nameAndNum}; Turnaround Time (Day): ${dataValue.turnaroundTime})`;
      } else {
        name = `Action: ${commonConstants.INSERT_LOG_STATUS.click} '✓' (Confirm) button (IOE Turnaround Time ID: ${dataValue.ioeTurnaroundTimeId}; Code IOE Form ID: ${dataValue.codeIoeFormId}; Form Name: ${dataValue.nameAndNum}; Turnaround Time (Day): ${dataValue.turnaroundTime})`;
      }
      this.insertTurnaroundTimeLog(name, '');
    }
    tableProps.action.onClick(event, dataValue);
  }

  handleActionCancel = (event,tableProps) => {
    let dataVal = tableProps.data;
    if (Object.keys(dataVal).length > 0) {
      let name = '';
      if (dataVal.ioeTurnaroundTimeId === null) {
        name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' (Cancel) button (New record is selected; IOE Turnaround Time ID: null; Code IOE Form ID: ${dataVal.codeIoeFormId}; Form Name: ${dataVal.nameAndNum})`;
      } else {
        name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' (Cancel) button (IOE Turnaround Time ID: ${dataVal.ioeTurnaroundTimeId}; Code IOE Form ID: ${dataVal.codeIoeFormId}; Form Name: ${dataVal.nameAndNum});`;
      }
      this.insertTurnaroundTimeLog(name, '');
    }
    this.setState({
      formRequireFlag: false,
      timeRequireFlag: false,
      timeIllegalFlag: false,
      noDataTip: 'There is no data.'
    });
    tableProps.action.onClick(event, dataVal);
  }

  handleRowAdd = (newData) => {
    let { dataList, formRequireFlag, timeRequireFlag, timeIllegalFlag,isSelectVal } = this.state;
    let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} '✓' (Confirm) button (New record is selected; IOE Turnaround Time ID: null; Code IOE Form ID: ${newData.codeIoeFormId}; Form Name: ${isSelectVal};Exp. Turnaround Time (Day): ${newData.turnaroundTime})`;
    this.insertTurnaroundTimeLog(name, '');
    return new Promise((resolve, reject) => {
      if (formRequireFlag||timeRequireFlag||timeIllegalFlag||this.dataRequiredCheck(newData)) {
        reject();
      } else {
        dataList.push({
          ioeTurnaroundTimeId: null,
          nameAndNum: isSelectVal,
          codeIoeFormId: newData.codeIoeFormId,
          turnaroundTime: newData.turnaroundTime,
          createdBy: null,
          createdDtm: null,
          version: null,
          operationType: COMMON_ACTION_TYPE.INSERT
        });
        this.setState({dataList},()=>resolve());
      }
    });
  }

  handleRowUpdate = (newData, oldData) => {
    let { dataList, timeRequireFlag, timeIllegalFlag } = this.state;
    return new Promise((resolve,reject) => {
      if (timeRequireFlag||timeIllegalFlag) {
        reject();
      } else {
        let index = dataList.indexOf(oldData);
        if (!!newData.version) {
          newData.operationType = COMMON_ACTION_TYPE.UPDATE;
        }
        dataList[index] = newData;
        this.setState({dataList},()=>resolve());
      }
    });
  }

  handleRowDelete = (oldData) => {
    let { dataList,deleteDataList } = this.state;
    let name = '';
    if (oldData.ioeTurnaroundTimeId === null) {
      name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Delete' button (New record is selected; IOE Turnaround Time ID: null; Code IOE Form ID: ${oldData.codeIoeFormId}; Form Name: ${oldData.nameAndNum})`;
    }else{
      name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Delete' button (IOE Turnaround Time ID: ${oldData.ioeTurnaroundTimeId}; Code IOE Form ID: ${oldData.codeIoeFormId}; Form Name: ${oldData.nameAndNum})`;
    }
    this.insertTurnaroundTimeLog(name,'');
    return new Promise((resolve) => {
      let index = dataList.indexOf(oldData);
      if (!!oldData.version) {
        oldData.operationType = COMMON_ACTION_TYPE.DELETE;
        deleteDataList.push(oldData);
      }
      dataList.splice(index, 1);
      this.setState({
        dataList,
        deleteDataList,
        noDataTip: dataList.length===0?'There is no data.':''
      }, () => resolve());
    });
  }

  handleRowEdit = (event) => {
    let dataRow = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.attributes[1];
    console.log('aa', dataRow);
    let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (IOE Turnaround Time ID: ${0}; Code IOE Form ID: ${0}; Form Name: {ZH Test 20201223})`;
    // if (oldData.ioeTurnaroundTimeId === null) {
    //   name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (New record is selected; IOE Turnaround Time ID: null; Code IOE Form ID: ${oldData.codeIoeFormId}; Form Name: ${oldData.nameAndNum})`;
    // } else {
    //   name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (IOE Turnaround Time ID: ${oldData.ioeTurnaroundTimeId}; Code IOE Form ID: ${oldData.codeIoeFormId}; Form Name: ${oldData.nameAndNum})`;
    // }
    this.insertTurnaroundTimeLog(name, '');
  }

  generateResultObj = () => {
    const { loginService } = this.props;
    let { dataList,deleteDataList } = this.state;
    let tempDataList = cloneDeep(dataList);
    let tempDeleteDataList = cloneDeep(deleteDataList);
    tempDataList = tempDataList.concat(tempDeleteDataList);
    let resultObj = {
      serviceCd: loginService.serviceCd,
      dtos:[]
    };
    tempDataList.forEach(element => {
      delete element.tableData;
      element.serviceCd = loginService.serviceCd;
      resultObj.dtos.push(element);
    });

    return resultObj;
  }

  handleSave = () => {
    let btnNode = document.getElementById('btn_turnaround_time_row_cancel');
    if (!!btnNode) {
      let payload = {
        msgCode: COMMON_CODE.COMPLETE_PREVIOUS_ACTION_COMFIRM,
        btnActions: {
          btn1Click: () => {
            let saveBtnNode = document.getElementById(
                'btn_turnaround_time_row_save'
            );
            saveBtnNode.click();
            setTimeout(() => {
              let {formRequireFlag, timeRequireFlag, timeIllegalFlag} = this.state;
              if (!formRequireFlag && !timeRequireFlag && !timeIllegalFlag) {
                this.saveAction();
              }
            },3000);
        }
        },
        params: [
          { name: 'type', value: 'Turnaround Time' }
        ]
      };
      this.props.openCommonMessage(payload);
    } else {
      this.saveAction();
    }
  }

  saveAction = () => {
    let resultObj = this.generateResultObj();
    if (resultObj.dtos.length === 0) {
      let payload = {
        msgCode: COMMON_CODE.SUBMITTING_DATA_NULL
      };
      this.props.openCommonMessage(payload);
    } else {
      let { formRequireFlag, timeRequireFlag, timeIllegalFlag } = this.state;
      if (!formRequireFlag && !timeRequireFlag && !timeIllegalFlag) {
        this.props.openCommonCircularDialog();
        this.props.updateIoeTurnaroundTimeList({
          params: resultObj,
          callback: (data) => {
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
                  }
                }
              };
              this.props.openCommonMessage(payload);
            }else{
              this.setState({
                deleteDataList: []
              });
              let payload = {
                msgCode: data.msgCode,
                showSnackbar: true
              };
              this.props.openCommonMessage(payload);
            }
          }
        });
        this.insertTurnaroundTimeLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`, 'ioe/saveTurnaroundTime');
      }
    }
  }

  refreshPageData = () =>{
    const {loginService} = this.props;
    this.props.getIoeTurnaroundTimeList({
      params: {
        serviceCd:loginService.serviceCd
      }
    });
    this.setState({deleteDataList:[]});
  }

  handleCancleSave = (saveCallback) => {
    let resultObj = this.generateResultObj();
    if (resultObj.dtos.length === 0) {
      let payload = { msgCode: COMMON_CODE.SUBMITTING_DATA_NULL };
      this.props.openCommonMessage(payload);
    } else {
      this.props.openCommonCircularDialog();
      this.props.updateIoeTurnaroundTimeList({
        params: resultObj,
        callback: (data) => {
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
                  if (typeof saveCallback != 'function' || saveCallback === undefined) {
                    return false;
                  } else {
                    saveCallback(true);
                  }
                }
              }
            };
            this.props.openCommonMessage(payload);
          }else{
            this.setState({
              deleteDataList: []
            });
            let payload = {
              msgCode: data.msgCode,
              showSnackbar: true
            };
            this.props.openCommonMessage(payload);
            if (typeof saveCallback != 'function' || saveCallback === undefined) {
              this.insertTurnaroundTimeLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`, 'ioe/saveTurnaroundTime');
              return false;
            } else {
              saveCallback(true);
            }
          }
        }
      });
    }
  }

  dataEditStatusCheck = () => {
    const { turnaroundTimeList } = this.props;
    let { dataList } = this.state;
    let tempDataList = cloneDeep(dataList);
    tempDataList.forEach(element => {
      delete element.tableData;
    });
    let btnNode = document.getElementById('btn_turnaround_time_row_cancel');
    if (!isEqual(tempDataList,turnaroundTimeList)||!!btnNode) {
      return true;
    }
    return false;
  }

  handleCancel = () => {
    const { turnaroundTimeList } = this.props;
    let btnNode = document.getElementById('btn_turnaround_time_row_cancel');
    if (this.dataEditStatusCheck()||!!btnNode) {
      let payload = {
        msgCode: TURNAROUD_TIME_CODE.CANCEL_CHANGE,
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
              dataList: cloneDeep(turnaroundTimeList),
              deleteDataList: []
            });
          }
        }
      };
      this.props.openCommonMessage(payload);
    }
  }
  insertTurnaroundTimeLog = (desc, apiName = '', content = '') => {
    commonUtils.commonInsertLog(apiName, 'F113', 'Turnaround Time Maintenance', desc, 'ioe', content);
  };
  handleCancelLog = (name, apiName = '') => {
    this.insertTurnaroundTimeLog(name, apiName);
  }

  render() {
    const { classes, loginService } = this.props;
    let { columns, dataList, originDropList, isloadding } = this.state;
    const buttonBar={
      isEdit:this.dataEditStatusCheck,
      title:'Turnaround Time Maintenance',
      logSaveApi: '/ioe/saveTurnaroundTime',
      saveFuntion:this.handleCancleSave,
      handleCancelLog:this.handleCancelLog,
      position:'fixed',
      buttons:[{
        title:'Save',
        onClick:this.handleSave,
        id:'save_button'
      }]
    };
    if(isloadding){
        return <div>Loading...</div>;
    }

    return (
      <Container buttonBar={buttonBar}>
        <Typography component="div"
            id="wrapper"
            className={classes.wrapper}
        >
          <Card ref={this.cardContent} className={classes.cardWrapper}>
            <div className={classes.titleDiv} >{`Turnaround Time Maintenance (${loginService.serviceCd})`}</div>
            <CardContent style={{paddingBottom: '0px'}} className={classes.cardContent}>
              {/* table */}
              <Typography component="div" className={classes.tableWrapper}>
                {/* MaterialTable */}
                <MuiThemeProvider theme={theme}>
                  <MaterialTable
                      className={classes.table}
                      id={'materialTableTest'}
                      columns={columns}
                      data={dataList}
                      onRowClick={((evt, selectedRow) => this.setState({ selectedRow }))}
                      options={{
                        sorting: false,
                        search: false,
                        paging: false,
                        showTitle: false,
                        actionsColumnIndex: -1,
                        toolbarButtonAlignment: 'left',
                        draggable:false,
                        maxBodyHeight: this.state.cardHeight-40-68,
                        // minBodyHeight: 300,
                        headerStyle: {
                          fontSize: font.fontSize,
                          fontWeight: 'bold',
                          backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
                          color: COMMON_STYLE.whiteTitle,
                          paddingLeft: 8
                        },
                        rowStyle: rowData => ({
                          wordBreak: 'break-all',
                          height: 53,
                          backgroundColor: (this.state.selectedRow && this.state.selectedRow.tableData.id === rowData.tableData.id) ? 'cornflowerblue' : color.cimsBackgroundColor
                        }),
                        actionsCellStyle: {
                          direction: 'rtl'
                        }
                      }}
                      actions={[  // add buttons to rows or toolbar by using actions prop.
                        {
                          icon: () => <DeleteOutline id="btn_turnaround_time_row_delete" />,
                          onClick: (event, rowData) => {
                            this.handleRowDelete(rowData);
                          }
                        }
                      ]}
                      components={{ //Action Overriding
                        Action: props => {
                          if (props.action.tooltip === 'Add') {
                            return (
                              <Button
                                  style={{padding: '0px'}}
                                  id="btn_turnaround_time_add"
                                  color="primary"
                                  disabled={dataList.length === originDropList.length?true:false}
                                  onClick={(event) => {this.handleActionAdd(event,props);}}
                              >
                                <AddCircle />
                                <span className={classes.btnSpan}>Add</span>
                              </Button>
                            );
                          } else if (props.action.tooltip === 'Save') {
                            return (
                              <IconButton
                                  id="btn_turnaround_time_row_save"
                                  className={classes.iconBtn}
                                  onClick={(event) => {this.handleActionSave(event,props);}}
                              >
                                <Check />
                              </IconButton>
                            );
                          } else if (props.action.tooltip === 'Cancel') {
                            return (
                              <IconButton
                                  id="btn_turnaround_time_row_cancel"
                                  className={classes.iconBtn}
                                  onClick={(event) => {this.handleActionCancel(event,props);}}
                              >
                                <Clear />
                              </IconButton>
                            );
                          } else {
                            return (
                              <MTableAction {...props} />
                            );
                          }
                        },
                        Toolbar: props => { //Toolbar Overriding
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
                        // EditRow:props=>{
                        //   return <MTableEditRow {...props}/>;
                        // }
                      }}
                      editable={{ //具有内联编辑功能，允许用户添加、删除和更新新行
                        onRowAdd: (newData) => {
                          return this.handleRowAdd(newData);
                        },
                        onRowUpdate: (newData, oldData) => {
                          this.setState({isEdit:true});
                          return this.handleRowUpdate(newData, oldData);
                        }
                      }}
                      icons={{
                        Edit: (props) => {
                          return <EditRounded id="btn_turnaround_time_row_edit" onClick={(event) => { this.handleRowEdit(event); }} {...props} />;
                        }
                      }}
                      localization={{
                        body:{
                          addTooltip: 'Add',
                          emptyDataSourceMessage: this.state.noDataTip,
                          editRow:{
                            deleteText:'Are you sure delete this record?'
                          }
                        }
                      }}
                  />
                </MuiThemeProvider>
              </Typography>
            </CardContent>
          </Card>
        </Typography>
      </Container>
    );
  }
}

const mapStateToProps = state => {
  return {
    loginService: state.login.service,
    turnaroundTimeList: state.turnaroundTime.turnaroundTimeList
  };
};

const mapDispatchToProps = {
  openCommonMessage,
  openCommonCircularDialog,
  getIoeFormDropList,
  getIoeTurnaroundTimeList,
  updateIoeTurnaroundTimeList,
  updateCurTab,
  closeCommonCircularDialog
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(TurnaroundTime));
