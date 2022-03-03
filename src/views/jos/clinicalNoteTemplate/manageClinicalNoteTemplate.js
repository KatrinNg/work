/*
 * Front-end UI for clinical note template management
 * Load favourite list Action: [manageClinicalNoteTemplate.js] initData ->
 * -> [medicalSummarySaga.js] requestFavouriteList
 * -> Backend API = clinical-note/getClinicalNoteTmplTypeList
 * Load template list Action: [manageClinicalNoteTemplate.js] initData ->
 * -> [medicalSummarySaga.js] requestTemplateList
 * -> Backend API = clinical-note/listClinicalNoteTemplatesByType
 * Save template list Action: [manageClinicalNoteTemplate.js] recordListSave ->
 * -> [medicalSummarySaga.js] recordTemplateData
 * -> Backend API = clinical-note/reorderClinicalNoteTmpls
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Grid,
  Button,
  Table,
  TableRow,
  Typography,
  TableCell,
  TableHead,
  TableBody,
  Card,
  CardContent,
  withStyles
} from '@material-ui/core';
import en_US from '../../../locales/en_US';
import { AddCircle } from '@material-ui/icons';
import { RemoveCircle } from '@material-ui/icons';
import { Edit } from '@material-ui/icons';
import { ArrowUpwardOutlined } from '@material-ui/icons';
import { ArrowDownward } from '@material-ui/icons';
import moment from 'moment';
import _ from 'lodash';
import * as manageClinicalNoteTemplateActionType from '../../../store/actions/clinicalNoteTemplate/manageClinicalNoteTemplateActionType';
import * as messageTypes from '../../../store/actions/message/messageActionType';
import 'react-quill/dist/quill.snow.css';
import JCustomizedSelectFieldValidator from '../../../components/JSelect/JCustomizedSelect/JCustomizedSelectFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import EditTemplate from './editTemplate';
import {MANAGE_TEMPLATE_CODE} from '../../../constants/message/manageTemplateCode';
import * as commonTypes from '../../../store/actions/common/commonActionType';
import { CLINICAL_NOTE_TEMPLATE_TYPE,ACTION_TYPE } from '../../../constants/clinicalNote/clinicalNoteConstants';
import {style} from './manageClinicalNoteTemplateCss';
import { COMMON_STYLE }from '../../../constants/commonStyleConstant';
import classNames from 'classnames';
import Container from 'components/JContainer';
import * as type from '../../../store/actions/mainFrame/mainFrameActionType';
import {COMMON_CODE} from '../../../constants/message/common/commonCode';
import accessRightEnum from '../../../enums/accessRightEnum';
import * as messageType from '../../../store/actions/message/messageActionType';
import Enum from '../../../../src/enums/enum';
import * as commonConstants from '../../../constants/common/commonConstants';
import * as actionTypes from '../../../store/actions/clinicalNote/clinicalNoteActionType';
import * as commonUtils from '../../../utilities/josCommonUtilties';

class manageClinicalNoteTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // favoriteValue: 'My Service',
      selectRowObj: null,
      sequence: null,
      open: false,  // open dialog
      codeClinicalnoteTmplTypeCd: CLINICAL_NOTE_TEMPLATE_TYPE.MY_FAVOURITE,
      isEdit:false,
      templateList:[],
      selectObj : {
        templateName : '',
        templateText : '',
        typeId: 0
      },
      upDownClick:false,
      editTemplateList:[],
      pageNum:null,
      deleteList:[],
      tableRows: [
        { name: 'sequence',width: 42, label:'Seq'},
        { name: 'serviceCd', width: 'auto', label: 'Service' },
        { name: 'templateName', width: 'auto', label: 'Name' },
        { name: 'templateText', width: 'auto', label: 'Text' },
        { name: 'updatedByName', width: 180, label: 'Updated By' },
        {
          name: 'updatedDtm', label: 'Updated On',  width: 140, customBodyRender: (value) => {
              return value ? moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
          }
      }
    ],
    tableOptions: {
        rowHover: true,
        rowsPerPage:5,
        onSelectIdName:'sequence',
        tipsListName:'diagnosisTemplates',
        tipsDisplayListName:null,
        tipsDisplayName:'diagnosisDisplayName',
        onSelectedRow:(rowId,rowData,selectedData)=>{
            this.selectTableItem(selectedData);
        },
        bodyCellStyle:this.props.classes.customRowStyle,
        headRowStyle:this.props.classes.headRowStyle,
        headCellStyle:this.props.classes.headCellStyle
    },
    noteTypeList:[]
    };
  }

  componentDidMount() {
    const {dispatch}=this.props;
    this.props.ensureDidMount();
    dispatch({type:type.UPDATE_CURRENT_TAB,name:accessRightEnum.clinicalNoteTemplateMaintenance,doCloseFunc:this.doClose});
    this.initData();
  }

  doClose = (callback) => {
    const { dispatch } = this.props;
    let editFlag = this.state.upDownClick;
    if (editFlag) {
      dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
          msgCode: COMMON_CODE.SAVE_WARING,
          btnActions: {
            btn1Click: () => {
              this.recordListSave();
              let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Clinical Note Template Maintenance');
              this.insertClinicalNoteTemplateLog(name,'clinicalNoteTemplate/manageClinicalNoteTemplate');
              setInterval(callback(true), 1000);
            }, btn2Click: () => {
              let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Clinical Note Template Maintenance');
              this.insertClinicalNoteTemplateLog(name,'');
              callback(true);
            }, btn3Click: () => {
              let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Clinical Note Template Maintenance');
              this.insertClinicalNoteTemplateLog(name, '');
            }
          }, params: [
            {
              name: 'title',
              value: 'Clinical Note Template Maintenance'
            }
          ]
        }
      });
    }
    else {
      this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close Clinical Note Template Maintenance`, '');
      callback(true);
    }
  }


  initData = () => {
    let codeClinicalnoteTmplTypeCd = this.state.codeClinicalnoteTmplTypeCd;
    let {loginInfo} = this.props;
    let {isClinicalAdmin} = loginInfo;
    if(JSON.parse(sessionStorage.getItem('loginInfo')).admin_login){
      codeClinicalnoteTmplTypeCd = CLINICAL_NOTE_TEMPLATE_TYPE.SERVICE_FAVOURITE;
    }
    const params = {};
    this.props.dispatch({ type: manageClinicalNoteTemplateActionType.REQUEST_DATA, params });//拿到favorite Category List
    params.clinicalNoteTmplType = codeClinicalnoteTmplTypeCd;  //拿到templateList需要的条件clinicalNoteTmplType
    this.props.dispatch({ type: manageClinicalNoteTemplateActionType.TEMPLATE_DATA, params,callback:(templateList)=>{
      this.setState({
        codeClinicalnoteTmplTypeCd : codeClinicalnoteTmplTypeCd,
        templateList: templateList
       });
    }});
    if(isClinicalAdmin){
      this.getNoteTypeList(loginInfo);
    }
    this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} Clinical Note Template Maintenance`,'clinicalNoteTemplate/manageClinicalNoteTemplate');
  };

  getNoteTypeList = (loginInfo) => {
    let { service } = loginInfo;
    let params = {
      serviceCd: service.serviceCd
    };
    this.props.dispatch({
      type:actionTypes.GET_NOTETYPE_LIST,
      params,
      callback: data =>{
        this.setState({noteTypeList:data});
      }
    });
  }

  handleClickDeleteValidate = () => {
    let params=this.state.selectRowObj;
    if(params){
      if(!this.state.upDownClick){
        let payload = {
          msgCode:MANAGE_TEMPLATE_CODE.IS_DELETE_MANAGE_TEMPLATE,
          btnActions: {
            // Yes
            btn1Click: () => {
              this.handleClickDelete();
            },
            btn2Click:()=>{
              this.handleClose();
            }
          }
        };
        this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
      }else{
        this.checkUpDown();
      }
    }else{
		  let payload = { msgCode:MANAGE_TEMPLATE_CODE.IS_SELECTED_DELETE};
      this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
      this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Delete' button (No record is selected; Template ID: null; Template name: null)`, '');
    }
  };

  handleClose= () =>  {
    this.setState({ open: false });
    this.props.dispatch({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG});
  }

  handleDialogClose=()=>{
    this.handleClose();
    this.reloadList();
  }

  handleDialogSaveClose=()=>{
    this.handleClose();
    this.reloadList();
    this.insertClinicalNoteTemplateLog(`[Clinical Note Template Maintenance Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`,'clinical-note/clinicalNoteTemplate');
  }

  refreshPageData = () => {
    this.handleClose();
    this.reloadList();
  }

  favoriteValueOnChange = (e) => {
    const {upDownClick,codeClinicalnoteTmplTypeCd}=this.state;
    const params = { clinicalNoteTmplType: e.value };
    if(e.value===codeClinicalnoteTmplTypeCd){
        return false;
    }
    if (upDownClick) {
      let payload = {
        msgCode: MANAGE_TEMPLATE_CODE.IS_CHANGE_CATEGORY,
        btnActions: {
          // Yes
          btn1Click: () => {
            this.props.dispatch({ type: manageClinicalNoteTemplateActionType.REQUEST_DATA, params });//获取favoriteList的数据
            this.props.dispatch({
              type: manageClinicalNoteTemplateActionType.TEMPLATE_DATA, params, callback: (templateList) => {
                this.setState({
                  templateList: templateList,
                  isEdit: false,
                  upDownClick: false,
                  codeClinicalnoteTmplTypeCd: e.value,
                  sequence: null,
                  selectRowObj: null
                });
              }
            });
          }
        }
      };
      this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
    } else {
      this.props.dispatch({ type: manageClinicalNoteTemplateActionType.REQUEST_DATA, params });//获取favoriteList的数据
      this.props.dispatch({
        type: manageClinicalNoteTemplateActionType.TEMPLATE_DATA, params, callback: (templateList) => {
          let anchorElement = document.getElementById('manageClinicalNoteTemplateCard');
          anchorElement.scrollTop = 0;
          this.setState({
            templateList: templateList,
            isEdit: false,
            upDownClick: false,
            codeClinicalnoteTmplTypeCd: e.value,
            sequence: null,
            selectRowObj: null
          });
        }
      });
    }
    this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Select} favourite Category: ${e.label} in drop-down list`,`clinicalNoteTemplate/manageClinicalNoteTemplate/${e.value}`);
  }

  //重新加载列表数据
  reloadList = () => {
    let {upDownClick} = this.state;
    if (upDownClick) {
      let payload = {
        msgCode: MANAGE_TEMPLATE_CODE.IS_CANCEL_CHANGE,
        btnActions: {
          // Yes
          btn1Click: () => {
            this.setState({
              upDownClick:false,
              sequence:null,
              selectRowObj:null
            });
            const params = { clinicalNoteTmplType: this.state.codeClinicalnoteTmplTypeCd};
            this.props.dispatch({ type: manageClinicalNoteTemplateActionType.TEMPLATE_DATA, params,callback:(templateList)=>{
              this.setState({
                open:false,
                templateList: templateList
                });
            }});
          }
        }
      };
      this.props.dispatch({
        type: messageTypes.OPEN_COMMON_MESSAGE,
        payload
      });
    } else {
      this.setState({
        upDownClick:false,
        sequence:null,
        selectRowObj:null
      });
      const params = { clinicalNoteTmplType: this.state.codeClinicalnoteTmplTypeCd};
      this.props.dispatch({ type: manageClinicalNoteTemplateActionType.TEMPLATE_DATA, params,callback:(templateList)=>{
        this.setState({
          open:false,
          templateList: templateList
          });
      }});
    }
  }

  //获得选中行数据
  getSelectTemplate = (e) => {
    this.setState({
      sequence: e.item.sequence,
      selectRowObj:e.item,
      selectObj: {
        templateName : e.item.templateName,
        templateText : e.item.templateText,
        typeId: e.item.typeId
      }
    });
  }

    //去掉前后空格
    trimInputValueBlank = (test) => {
        if(test!=''&&test!=undefined&&test!=null){
            return _.trimEnd(_.trimStart(test));
        }
    }



  recordListSave = (saveCallback) =>{
    let params=this.state.templateList;
    this.props.dispatch({ type: commonTypes.OPEN_COMMON_CIRCULAR_DIALOG});
    this.props.dispatch({
      type: manageClinicalNoteTemplateActionType.RECORDLIST_DATA,
      params,
      callback:(data)=>{
        if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          let payload = {
            msgCode: data.msgCode,
            btnActions: {
              btn1Click: () => {
                this.setState({
                  upDownClick:false,
                  sequence:null,
                  selectRowObj:null
                });
                const params = { clinicalNoteTmplType: this.state.codeClinicalnoteTmplTypeCd};
                this.props.dispatch({
                  type: manageClinicalNoteTemplateActionType.TEMPLATE_DATA,
                  params,
                  callback:(templateList)=>{
                    this.setState({
                      open:false,
                      templateList: templateList
                    });
                    this.props.dispatch({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG});
                  }
                });
              },
              btn2Click: () => {
                this.props.dispatch({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG});
              }
            }
          };
          this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
        } else {
          let params = { clinicalNoteTmplType: this.state.codeClinicalnoteTmplTypeCd};
          let payload = {
            msgCode:data.msgCode,
            showSnackbar:true,
            btnActions: {
              // Yes
              btn1Click: () => {
                  this.props.dispatch({ type: manageClinicalNoteTemplateActionType.TEMPLATE_DATA, params,callback:(templateList)=>{
                  this.props.dispatch({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG});
                  this.setState({
                    upDownClick:false,
                    templateList: templateList,
                    sequence:null,
                    selectRowObj:null
                  });
                  }
                });
              }
            }
          };
          this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
          if(typeof saveCallback != 'function' || saveCallback === undefined){
            this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`,'clinicalNoteTemplate/manageClinicalNoteTemplate');
            return false;
          }else{
            saveCallback();
          }
        }
      }
    });
  }

  handleClickDelete=()=>{
    let selectRowObj=JSON.parse(JSON.stringify(this.state.selectRowObj));
    let params=JSON.parse(JSON.stringify(this.state.templateList));
    for (let index = 0; index < params.length; index++) {
      const element = params[index];
      if(element.clinicalnoteTemplateId===selectRowObj.clinicalnoteTemplateId){
        params[index].deleteInd='Y';
      }
    }
    this.props.dispatch({ type: commonTypes.OPEN_COMMON_CIRCULAR_DIALOG });
    this.props.dispatch({
      type: manageClinicalNoteTemplateActionType.DELETETEMPLATE_DATA,
      params,
      callback:(data)=>{
        if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          let payload = {
            msgCode: data.msgCode,
            btnActions: {
              btn1Click: () => {
                this.props.dispatch({ type: commonTypes.OPEN_COMMON_CIRCULAR_DIALOG});
                this.setState({
                  upDownClick:false,
                  sequence:null,
                  selectRowObj:null
                });
                const params = { clinicalNoteTmplType: this.state.codeClinicalnoteTmplTypeCd};
                this.props.dispatch({
                  type: manageClinicalNoteTemplateActionType.TEMPLATE_DATA,
                  params,
                  callback:(templateList)=>{
                    this.setState({
                      open:false,
                      templateList: templateList
                    });
                    this.props.dispatch({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG});
                  }
                });
              },
              btn2Click: () => {
                this.props.dispatch({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG});
              }
            }
          };
          this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
        } else {
          this.reloadList();
          let payload = {
            msgCode:data.msgCode,
            showSnackbar:true
          };
          this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
        }
      }
    });
    this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Delete' button (Template ID: ${selectRowObj.clinicalnoteTemplateId}; Template name: ${selectRowObj.templateName})`,'clinical-note/clinicalNoteTemplate');
  }
  checkUpDown = () => {
    let payload = {
      msgCode:MANAGE_TEMPLATE_CODE.IS_SAVE_COMFIRM,
      btnActions: {
        // Yes
        btn1Click: () => {
        }
      }
    };
    this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
  }

  checkSelect = (msgCode) => {
    let payload = {
      msgCode:msgCode,
      showSnackbar:false,
      btnActions: {
        // Yes
        btn1Click: () => {
        }
      }
    };
    this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
  }

  clickDownClick= () => {
    let rowObj={};
    rowObj=this.state.selectRowObj;
    if(!rowObj){
      let msgCode = MANAGE_TEMPLATE_CODE.CLINICALNOTE_TEMPLAT_IS_SELECTED_DOWN;
      this.checkSelect(msgCode);
      this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Down' button (No record is selected; Template ID: null; Template name: null)`, '');
    }
    let recordList=[];
    recordList = JSON.parse(JSON.stringify(this.state.templateList));
    if(rowObj && recordList[rowObj.sequence]){
      recordList[rowObj.sequence].operationType=ACTION_TYPE.UPDATE;
      recordList[rowObj.sequence-1].operationType=ACTION_TYPE.UPDATE;
      recordList[(rowObj.sequence-1)].sequence=recordList[(rowObj.sequence-1)].sequence+1;
      recordList[rowObj.sequence].sequence=recordList[rowObj.sequence].sequence-1;
      let tempa=[];
      tempa=recordList[rowObj.sequence-1];
	    recordList[rowObj.sequence-1]=recordList[rowObj.sequence];
      recordList[rowObj.sequence]=tempa;
      this.setState({
        upDownClick:true,
        templateList:recordList,
        sequence:recordList[rowObj.sequence].sequence,
        selectRowObj:recordList[rowObj.sequence]
      });
      this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Down' button (Sequence before action: ${rowObj.sequence}; Template ID: ${rowObj.clinicalnoteTemplateId}; Template name: ${rowObj.templateName})`, '');
    }else{
      return false;
    }
  }

  clickUpClick= () => {
    let rowObj={};
    rowObj=this.state.selectRowObj;
    if(!rowObj){
      let msgCode = MANAGE_TEMPLATE_CODE.CLINICALNOTE_TEMPLAT_IS_SELECTED_UP;
      this.checkSelect(msgCode);
      this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Up' button (No record is selected; Template ID: null; Template name: null)`, '');
    }
    let recordList=[];
    recordList = JSON.parse(JSON.stringify(this.state.templateList));
    if(rowObj && recordList[(rowObj.sequence-2)]){
      recordList[rowObj.sequence-1].operationType=ACTION_TYPE.UPDATE;
      recordList[rowObj.sequence-2].operationType=ACTION_TYPE.UPDATE;
      recordList[(rowObj.sequence-1)].sequence=recordList[(rowObj.sequence-1)].sequence-1;
      recordList[rowObj.sequence-2].sequence=recordList[rowObj.sequence-2].sequence+1;
      let tempa=[];
      tempa=recordList[rowObj.sequence-2];
	    recordList[rowObj.sequence-2]=recordList[rowObj.sequence-1];
      recordList[rowObj.sequence-1]=tempa;
      this.setState({
        upDownClick:true,
        templateList:recordList,
        sequence:recordList[rowObj.sequence-2].sequence,
        selectRowObj:recordList[rowObj.sequence-2]
      });
      this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Up' button (Sequence before action: ${rowObj.sequence}; Template ID: ${rowObj.clinicalnoteTemplateId}; Template name: ${rowObj.templateName})`,'');
    }else{
      return false;
    }
  }

  handleClickAdd = () => {
    if(!this.state.upDownClick){
      this.setState({
        selectObj :{
          templateName : null,
          templateText : null,
          typeId:null
        },
        open: true
      });
    }else {
      this.checkUpDown();
    }
    this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Add' button`,'');
  };

  handleClickEdit = () => {
    // eslint-disable-next-line no-debugger
    if(!this.state.upDownClick){
      let params=this.state.selectRowObj;
      if(params==null){
        let msgCode = MANAGE_TEMPLATE_CODE.IS_SELECTED_EDIT;
        this.checkSelect(msgCode);
        this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (No record is selected; Template ID: null; Template name: null)`,'');
        return;
      }
      this.setState({
        open: true,
        selectObj :{
          templateName : this.state.selectRowObj.templateName ,
          templateText : this.state.selectRowObj.templateText,
          typeId: this.state.selectRowObj.typeId
        }
      });
      this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (Template ID: ${params.clinicalnoteTemplateId}; Template name: ${params.templateName})`,'');
    }else {
      this.checkUpDown();
    }
  };

  insertClinicalNoteTemplateLog=(desc, apiName='', content = null) => {
    commonUtils.commonInsertLog(apiName, 'F105', 'Clinical Note Template Maintenance', desc, 'clinical-note', content);
  };

  handleCancelLog=(name,apiName='')=>{
    this.insertClinicalNoteTemplateLog(name, apiName);
  }

  updateState = obj => {
    this.setState({
      ...obj
    });
  }

  findNoteTypeName = (typeId) => {
    let { noteTypeList } = this.state;
    let result = noteTypeList.map(item => {
      if(item.typeId == typeId){
        return item.typeDesc;
      }});
      return result;
  }

  render() {
    const { classes, favoriteCategoryListData, loginInfo = {},commonMessageList } = this.props;
    let { noteTypeList, selectObj, selectRowObj, templateList, codeClinicalnoteTmplTypeCd, open } = this.state;
    let {isServiceAdmin,isClinicalAdmin} = loginInfo;
    if(!isServiceAdmin) {
      for (let index = 0; index < favoriteCategoryListData.length; index++) {
        const element = favoriteCategoryListData[index];
        if(element.codeClinicalnoteTmplTypeCd === 'S'){
          favoriteCategoryListData.splice(index,1);
          break;
        }
      }
    }
    if(!isClinicalAdmin) {
      for (let index = 0; index < favoriteCategoryListData.length; index++) {
        const element = favoriteCategoryListData[index];
        if(element.codeClinicalnoteTmplTypeCd === 'C'){
          favoriteCategoryListData.splice(index,1);
          break;
        }
      }
    }
    let editTemplateProps = {
      refreshEditList:this.refreshEditList,
      refreshList:this.refreshList,
      noteTypeList,
      selectObj,
      selectRowObj,
      templateList,
      codeClinicalnoteTmplTypeCd,
      open,
      commonMessageList,
      isDisplayNoteType: codeClinicalnoteTmplTypeCd == 'C' ? true : false,
      handleDialogClose:this.handleDialogClose,
      insertClinicalNoteTemplateLog: this.insertClinicalNoteTemplateLog,
      handleDialogSaveClose:this.handleDialogSaveClose,
      initData:this.initData,
      updateState:this.updateState,
      refreshPageData: this.refreshPageData
    };
    let disabled = this.state.upDownClick;

    const buttonBar={
      isEdit:disabled,
      title:'Clinical Note Template Maintenance',
      logSaveApi: 'clinicalNoteTemplate/manageClinicalNoteTemplate',
      saveFuntion:this.recordListSave,
      handleCancelLog: this.handleCancelLog,
      // height:'64px',
      position:'fixed',
      buttons:[{
        title:'Save',
        onClick:this.recordListSave,
        id:'default_save_button'
      }]
    };
    return (
      <Container className={classes.wrapper} buttonBar={buttonBar}>
        <EditTemplate style={{ height: 522}} {...editTemplateProps}/>
        <Card className={classes.cardContainer} id="manageClinicalNoteTemplateCard">
          <CardContent style={{paddingTop:0}}>
            <Typography component="div" className={classes.topDiv}>
              <Typography component="div" className={classes.label_div}>Clinical Note Template Maintenance</Typography>
              <Typography component="div" style={{ padding: '5px 0px 15px' }} className={classes.select_div}>
                <ValidatorForm id="manageTemplateForm" onSubmit={() => { }} ref="form">
                  <Grid container style={{ marginTop: 10 }}>
                    <label className={classes.left_Label}>{en_US.manageTemplate.label_favorite_category}</label>
                    <Grid item style={{ padding: 0 }} xs={2}>
                      <JCustomizedSelectFieldValidator
                          className={classes.favorite_category}
                          id={'bookingEncounterTypeSelectField'}
                          msgPosition="bottom"
                          options={favoriteCategoryListData.map((item) => ({ value: item.codeClinicalnoteTmplTypeCd, label: item.templateTypeDesc }))}
                          onChange={this.favoriteValueOnChange}
                          value={codeClinicalnoteTmplTypeCd}
                          width={'none'}
                      />
                    </Grid>
                  </Grid>
                </ValidatorForm>
              </Typography>
              <Typography component="div" className={classes.btn_div}>
                <Button id="template_btn_add" style={{ textTransform: 'none' }}  onClick={this.handleClickAdd}>
                  <AddCircle color="primary" />
                  <span className={classes.font_color}>Add</span>
                </Button>
                <Button  id="template_btn_edit"  style={{ textTransform: 'none' }} onClick={this.handleClickEdit}>
                  <Edit color="primary" />
                  <span className={classes.font_color}>Edit</span>
                </Button>
                <Button  id="template_btn_delete"  style={{ textTransform: 'none' }} onClick={this.handleClickDeleteValidate}>
                  <RemoveCircle color="primary" />
                  <span className={classes.font_color}>Delete</span>
                </Button>
                <Button id="template_btn_up" style={{ textTransform: 'none' }} onClick={this.clickUpClick}>
                  <ArrowUpwardOutlined color="primary" />
                  <span className={classes.font_color}>Up</span>
                </Button>
                <Button id="template_btn_down" style={{ textTransform: 'none' }}  onClick={this.clickDownClick} >
                  <ArrowDownward color="primary" />
                  <span className={classes.font_color}>Down</span>
                </Button>
              </Typography>
            </Typography>
            <Typography component="div" className={classes.tableDiv}>
              <Table id="manage_template_table" className={classes.table_itself}>
                <TableHead>
                  <TableRow style={{backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR}} className={classes.table_head}>
                    <TableCell
                        style={{width: '3%'}}
                        className={classNames(classes.table_header,classes.tableCellBorder)}
                        padding={'none'}
                    >
                      Seq
                    </TableCell>
                    <TableCell
                        style={{width: '6%'}}
                        className={classNames(classes.table_header,classes.tableCellBorder)}
                        padding={'none'}
                    >
                      Service
                    </TableCell>
                    {
                      codeClinicalnoteTmplTypeCd === 'C'?
                      <TableCell
                          style={{width: '6%'}}
                          className={classNames(classes.table_header,classes.tableCellBorder)}
                          padding={'none'}
                      >
                        Clinic
                      </TableCell> : null
                    }
                    {
                      codeClinicalnoteTmplTypeCd === 'C'?
                      <TableCell
                          style={{width: '10%'}}
                          className={classNames(classes.table_header,classes.tableCellBorder)}
                          padding={'none'}
                      >
                        Note Type
                      </TableCell> : null
                    }
                    <TableCell
                        style={{width: '27%'}}
                        className={classNames(classes.table_header,classes.tableCellBorder)}
                        padding={'none'}
                    >
                      Name
                    </TableCell>
                    <TableCell className={classNames(classes.table_header,classes.tableCellBorder)}
                        style={{width: '30%'}}
                    >
                      Text
                    </TableCell>
                    <TableCell className={classNames(classes.table_header,classes.tableCellBorder)}
                        style={{paddingLeft:10,width: '7%'}}
                        padding={'none'}
                    >
                      Updated&nbsp;By
                    </TableCell>
                    <TableCell className={classNames(classes.table_header,classes.tableCellBorder)}
                        style={{width: '7%'}}
                    >
                      Updated&nbsp;On
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.templateList.length>0?this.state.templateList.map((item, index) => (
                    <TableRow
                        className={
                        item.sequence === this.state.sequence ? classes.table_row_selected : classes.table_row
                      }
                        key={index}
                        onClick={() => this.getSelectTemplate({ item })}
                    >
                      <TableCell style={{width: '3%'}} padding={'none'} className={classNames(classes.table_cell,classes.tableCellBorder)}>
                        {item.sequence}
                      </TableCell>
                      <TableCell padding={'none'}
                          style={{width: '5%'}}
                          className={classNames(classes.table_cell,classes.tableCellBorder)}
                      >
                        {item.serviceCd}
                      </TableCell>
                      {
                        this.state.codeClinicalnoteTmplTypeCd === 'C'?
                        <TableCell padding={'none'}
                            style={{width: '5%'}}
                            className={classNames(classes.table_cell,classes.tableCellBorder)}
                        >
                          {item.clinicCd}
                        </TableCell> : null
                      }
                      {
                        this.state.codeClinicalnoteTmplTypeCd === 'C'?
                        <TableCell padding={'none'}
                            style={{width: '5%'}}
                            className={classNames(classes.table_cell,classes.tableCellBorder)}
                        >
                          {this.findNoteTypeName(item.typeId)}
                        </TableCell> : null
                      }
                      <TableCell padding={'none'}
                          style={{width: '26%'}}
                          className={classNames(classes.table_cell,classes.tableCellBorder)}
                      >
                        {this.trimInputValueBlank(item.templateName)}
                      </TableCell>
                      <TableCell padding={'none'}
                          className={classNames(classes.cell_text,classes.tableCellBorder)}
                          style={{padding:'4px 10px 4px 10px',width: '26%'}}
                      >
                        {this.trimInputValueBlank(item.templateText)}
                      </TableCell>
                      <TableCell
                          className={classNames(classes.cell_text,classes.tableCellBorder)}
                          style={{paddingLeft:10,width: '7%',wordBreak:'normal'}}
                      >
                        {item.updatedByName}
                      </TableCell>
                      <TableCell
                          className={classNames(classes.table_cell_1,classes.tableCellBorder)}
                          style={{paddingLeft:10,width: '7%'}}
                      >
                        {moment(item.updatedDtm).format('DD-MMM-YYYY')}
                      </TableCell>
                    </TableRow>
                  )):
                  <TableRow >
                    <TableCell classes={{root:classes.tbNoData}} className={classes.tbNoData} align="center" colSpan={6}>There is no data.</TableCell>
                  </TableRow>}
                </TableBody>
              </Table>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    favoriteCategoryListData: state.manageClinicalNoteTemplate.favoriteCategoryListData,
    deleteList: state.manageClinicalNoteTemplate.deleteList,
    recordList:state.manageClinicalNoteTemplate.recordList,
    commonMessageList:state.message.commonMessageList,
    loginInfo: {
      ...state.login.loginInfo,
      isServiceAdmin: state.login.isServiceAdmin,
      isClinicalAdmin:state.login.isClinicalAdmin,
      service:state.login.service
    },
    encounter: state.patient.encounterInfo
  };
}
export default connect(mapStateToProps)(withStyles(style)(manageClinicalNoteTemplate));
