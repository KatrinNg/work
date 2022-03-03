/*
 * Front-end UI for insert/update problem template group
 * Save Action: [ServiceFavouriteDialog.js] Save -> recordListSave
 * -> [problemAction.js] saveEditTemplateList
 * -> [problemSaga.js] saveEditTemplateList
 * -> Backend API = /diagnosis/saveDiagnosisTmpls
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
  TextField,
  TableBody,
  Checkbox
} from '@material-ui/core';
import en_US from '../../locales/en_US';
import { withStyles } from '@material-ui/core/styles';
import { AddCircle } from '@material-ui/icons';
import { RemoveCircle } from '@material-ui/icons';
import { ArrowUpwardOutlined } from '@material-ui/icons';
import { ArrowDownward } from '@material-ui/icons';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import CIMSButton from '../../components/Buttons/CIMSButton';
import  EditTemplateDialog from './components/EditTemplateDialog';
import {style} from './EditTemplateCss';
import EditTemplateInput from './components/EditTemplateInput';
import EditTemplateText from './components/EditTemplateText';
import { openCommonMessage,closeCommonMessage } from '../../store/actions/message/messageAction';
import {saveEditTemplateList,searchProblemListNoPagination} from '../../store/actions/consultation/dxpx/diagnosis/diagnosisAction';
import Paper from '@material-ui/core/Paper';
import {DIAGNOSIS_TEMPLATE_CODE} from '../../constants/message/diagnosisTemplateCode';
import {PROBLEM_SEARCH_LIST_TYPE,ACTION_TYPE,NEW_STATUS} from '../../constants/diagnosis/diagnosisConstants';
import {openCommonCircularDialog,closeCommonCircularDialog} from '../../store/actions/common/commonAction';
import SelectAndCheckBox from './components/SelectAndCheckBox';

class EditDiagnosisTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // favoriteValue: 'Service Favorite',
      selectRowObj: null,
      sequence: null,
      open: this.props.open,  // open dialog
      // codeClinicalnoteTmplTypeCd: 'S',
      isEdit:false,
      templateList:this.props.templateList,
      selectObj : {
        templateName : '',
        templateText : ''
      },
      upDownClick:false,
      groupName:'',
      currentList:[],
      termDisplayList:[],
      selectTemplateGroup:{},
      isNew:false,
      oldList:[],
      editedGroupNameFlag:false,
      selectGroupSequence:this.props.selectGroupSequence,
      editMinListFlag:false,
      groupNameNullFlag:false,
      addFlag:false,
      saveFlag:true,
      problemLocalTermChecked:this.props.problemLocalTermChecked,
      localTermDisabled:this.props.localTermDisabled,
      nameValidation:'This field is required.',
      nameErrorFlag: false
    };
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.editTemplateList !== this.state.editTemplateList) {
      if(nextProps.editTemplateList.length>0){
        this.setState({
          groupName:nextProps.editTemplateList[0].dxpxTemplateGroup!==undefined?(nextProps.editTemplateList[0].dxpxTemplateGroup.groupName!==undefined?nextProps.editTemplateList[0].dxpxTemplateGroup.groupName:''):'',
          selectTemplateGroup:nextProps.editTemplateList[0].dxpxTemplateGroup!==undefined?nextProps.editTemplateList[0].dxpxTemplateGroup:{},
          isNew:false,
          problemLocalTermChecked:nextProps.problemLocalTermChecked,
          localTermDisabled:nextProps.localTermDisabled
        });
      }
      else{
      this.setState({
        groupName:'',
        isNew:true
      });
    }
    this.setState({
      currentList:nextProps.editTemplateList,
      oldList:nextProps.editTemplateList,
      templateList:nextProps.templateList,
      selectGroupSequence:nextProps.selectGroupSequence,
      problemLocalTermChecked:nextProps.problemLocalTermChecked,
      saveFlag:true
    });
    }
    this.setState({
      addFlag:false
    });
  }

  handleClickUp = () => {
    const{insertDiagnosisLog}=this.props;
    let params=this.state.selectRowObj;
    if(params){
      this.clickUp();
      insertDiagnosisLog&&insertDiagnosisLog('Click Up Button the ordering in Diagnosis Template Group Maintenance Dialog','');
    }else{
      let payload = { msgCode:DIAGNOSIS_TEMPLATE_CODE.IS_UP_PROBLEM_TEMPLATE_TIP};
      this.props.openCommonMessage(payload);
    }
  };

  handleClickDown = () => {
    const{insertDiagnosisLog}=this.props;
    let params=this.state.selectRowObj;
    if(params){
      this.clickDown();
      insertDiagnosisLog&&insertDiagnosisLog('Click Down Button the desc in Diagnosis Template Group Maintenance Dialog','');
    }else{
      let payload = { msgCode:DIAGNOSIS_TEMPLATE_CODE.IS_DOWN_PROBLEM_TEMPLATE_TIP};
      this.props.openCommonMessage(payload);
    }
  };

  handleClickOpen = () => {
    let params=this.state.selectRowObj;
    if(params){
      this.handleSave();
    }else{
      let payload = { msgCode:DIAGNOSIS_TEMPLATE_CODE.IS_DELETE_PROBLEM_TEMPLATE_TIP};
      this.props.openCommonMessage(payload);
    }
  };

  handleClose= () =>  {
    let {handleClose}=this.props;
    this.setState({
      selectRowObj:null,
      sequence:null,
      index:null,
      editMinListFlag:false,
      groupNameNullFlag:false,
      nameErrorFlag:false,
      nameValidation:'This field is required.'
    });
    handleClose&&handleClose();
}

  handleDialogClose=()=>{
    let {isEdit} = this.state;
    if (isEdit) {
      let payload = {
        msgCode: DIAGNOSIS_TEMPLATE_CODE.IS_CLOSE_DIALOG,
        btnActions: {
          // Yes
          btn1Click: () => {
            this.setState({ isEdit:false });
            this.handleClose();
          }
        }
      };
      this.props.openCommonMessage(payload);
    } else {
      this.handleClose();
    }
  }

  //重新加载列表数据
  reloadList = () => {

  }

  //获得选中行数据
  getSelectTemplate = (item,index) => {
    this.setState({
      index:index,
      sequence: item.displaySeq,
      selectRowObj:item
    });
  }

  handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.shiftKey === false) {
      event.preventDefault();
    }
  };


  recordListSave = () => {
    //Real List
    const { insertDiagnosisLog } = this.props;
    let List = [];
    for (let i = 0; i < this.state.currentList.length; i++) {
      if ((this.state.currentList[i].operationType !== undefined && this.state.currentList[i].operationType !== ACTION_TYPE.DELETE) || this.state.currentList[i].operationType === undefined) {
        if (List.length === 0) {
          List[0] = this.state.currentList[i];
        }
        else {
          List[List.length] = this.state.currentList[i];
        }
      }
    }
    if (List.length < 1 && (this.state.groupName.trim() !== '')) {
      let payload = { msgCode: DIAGNOSIS_TEMPLATE_CODE.IS_EDIT_MIN_LIST };
      this.props.openCommonMessage(payload);
      if (this.state.groupName.trim() === '') {
        this.setState({ saveFlag: false, groupNameNullFlag: true, editMinListFlag: true });
      } else {
        this.setState({ editMinListFlag: true });
      }
    } else if (this.state.groupName.trim() === '') {
      this.setState({ groupNameNullFlag: true, saveFlag: false });
    }
    else {
      this.setState({ editMinListFlag: false, groupNameNullFlag: false });
      //all validation will pass
      let Flag = true;
      for (let i = 0; i < this.state.currentList.length; i++) {
        if ((this.state.currentList[i].operationType !== undefined && this.state.currentList[i].operationType !== ACTION_TYPE.DELETE) || this.state.currentList[i].operationType === undefined) {
          if (this.state.currentList[i].diagnosisName.trim() === '' || this.state.currentList[i].diagnosisDisplayName.trim() === '' ||
            ((this.state.currentList[i].remarks === null || this.state.currentList[i].remarks.trim() === '') &&
              (this.state.currentList[i].displayKey === 1 || this.state.currentList[i].displayKey === 2))
            || this.state.currentList[i].displayKey === 3) {
            Flag = false;
            this.setState({ saveFlag: Flag });
          }
        }
      }
      if (Flag) {
        this.props.openCommonCircularDialog();
        let selectTemplateGroup = {};
        if (!this.state.isNew) {
          selectTemplateGroup = this.state.selectTemplateGroup;
          if (this.state.editedGroupNameFlag)
            selectTemplateGroup.operationType = ACTION_TYPE.UPDATE;
          else
            selectTemplateGroup.operationType = null;
          selectTemplateGroup.groupName = this.state.groupName.trim();
        }
        else {
          selectTemplateGroup = {
            createBy: null,
            createClinicCd: null,
            createDtm: new Date(),
            templateGrpId: 0,
            dxpxTemplates: null,
            diagnosisTypeCd: null,
            groupName: this.state.groupName.trim(),
            operationType: null,
            displaySeq: this.state.templateList.length > 0 ? this.state.templateList[this.state.templateList.length - 1].displaySeq + 1 : '1',
            serviceCd: null,
            updateBy: null,
            updateClinicCd: null,
            updateDtm: new Date(),
            userId: null,
            version: null
          };
        }

        let params = {
          dxpxTemplateGroupDto: selectTemplateGroup,
          dtos: this.state.currentList,
          isNew: this.state.isNew ? NEW_STATUS.YES : NEW_STATUS.NO,
          selectedSeq: this.state.selectGroupSequence === null ? 0 : this.state.selectGroupSequence,
          groupDtos: this.state.templateList
        };
        this.props.openCommonCircularDialog();
        this.props.saveEditTemplateList({
          params,
          callback: (result) => {
            this.props.closeCommonCircularDialog();
            if(result.msgCode===0){
              if (result.msgCode === DIAGNOSIS_TEMPLATE_CODE.SAVE_SUCCESSFUL) {
                let { refreshData, handleClose } = this.props;
                refreshData && refreshData();
                handleClose && handleClose();
              }
              let payload = {
                msgCode: result.msgCode
              };
              if (result.respCode === 0) {
                payload.showSnackbar = true;
              }
              this.props.openCommonMessage(payload);
              this.setState({
                editedGroupNameFlag: false,
                selectRowObj: null,
                sequence: null,
                index: null,
                editMinListFlag: false,
                groupNameNullFlag: false,
                saveFlag: true,
                isEdit: false,
                nameErrorFlag: false,
                nameValidation: 'This field is required.'
              });
            } else {
              // let message = commonMessageList.find(item => item.messageCode === result.msgCode); //.description
              let message='This template name already exists. Please use another one.';
              this.setState({ nameErrorFlag: true, nameValidation: message });
            }
          }
        });
      }
    }
    insertDiagnosisLog && insertDiagnosisLog('Click Save the Data in Diagnosis Template Group Maintenance Dialog', '');
  }

  handleClickDelete=()=>{
    const {insertDiagnosisLog}=this.props;
    if(this.state.selectRowObj!==null){
      if(this.state.isNew||this.state.currentList.length===0||this.state.selectRowObj.templateId===0){
        let index=this.state.index;
        this.state.currentList.splice(index,1);
        let currentList=JSON.parse(JSON.stringify(this.state.currentList));
        let count=1;
        for(let i=0;i<this.state.currentList.length;i++){
          if(currentList[i].operationType===null||(currentList[i].operationType!==null&&currentList[i].operationType!==ACTION_TYPE.DELETE)){
            currentList[i].displaySeq=count;
            count++;
          }
        }
        this.setState({
          isEdit:true,
          currentList: currentList,
          selectRowObj:null,
          sequence:null,
          index:null
        });
      }
      else{
        if(this.state.oldList.length>0&&this.state.selectRowObj.templateId!==0){
          let currentList=this.state.currentList;
          for(let i=0;i<this.state.oldList.length;i++){
            if(this.state.selectRowObj.templateId===this.state.oldList[i].templateId){
              let editObj=this.state.selectRowObj;
              editObj.operationType=ACTION_TYPE.DELETE;
              currentList[this.state.index]=editObj;
              let resultList=currentList;
              let count=1;
              for(let i=0;i<resultList.length;i++){
                if(resultList[i].operationType===null||(resultList[i].operationType!==null&&resultList[i].operationType!==ACTION_TYPE.DELETE)){
                  if(resultList[i].operationType===null&&i>this.state.index-1){
                    resultList[i].operationType=ACTION_TYPE.UPDATE;
                  }
                  resultList[i].displaySeq=count;
                  count++;
                }
              }
              this.setState({
                isEdit:true,
                currentList: resultList,
                selectRowObj:null,
                sequence:null,
                index:null
              });
              break;
            }
          }
        }
      }
      insertDiagnosisLog&&insertDiagnosisLog('Click Delete Button the Data in Diagnosis Template Group Maintenance Dialog','');
  }
}

  handleSave = () => {
    let payload = {
      msgCode:DIAGNOSIS_TEMPLATE_CODE.IS_DELETE_PROCEDURE_TEMPLATE,
      btnActions: {
        // Yes
        btn1Click: () => {
          this.handleClickDelete();
        }
      }
    };
    this.props.openCommonMessage(payload);
  }

  clickDown= () => {
    let rowObj={};
    rowObj=this.state.selectRowObj;
    let recordList=[];
    let resultList=[];
     //Real List
     let realIndex=-1;
     for(let i=this.state.index+1;i<this.state.currentList.length;i++){
       if((this.state.currentList[i].operationType!==undefined&&this.state.currentList[i].operationType!==ACTION_TYPE.DELETE)||this.state.currentList[i].operationType===undefined){
         realIndex=i;
         break;
       }
     }
     if(realIndex!==-1){
    recordList = JSON.parse(JSON.stringify(this.state.currentList));
    if(rowObj && recordList[realIndex]){
      let Sequence=rowObj.displaySeq;
      recordList[this.state.index].displaySeq=Sequence+1;
      recordList[realIndex].displaySeq=Sequence;
      let selectobj=recordList[this.state.index];
      recordList[this.state.index]=recordList[realIndex];
      recordList[realIndex]=selectobj;
      if(!this.state.isNew&&this.state.currentList.length>0){

          for(let i=0;i<this.state.oldList.length;i++){
            if(recordList[this.state.index].templateId!==0&&recordList[this.state.index].templateId===this.state.oldList[i].templateId){
              let editObj=recordList[this.state.index];
              editObj.operationType=ACTION_TYPE.UPDATE;
              recordList[this.state.index]=editObj;
          }
          else if(recordList[realIndex].templateId!==0&&recordList[realIndex].templateId===this.state.oldList[i].templateId){
            let editObj=recordList[realIndex];
            editObj.operationType=ACTION_TYPE.UPDATE;
            recordList[realIndex]=editObj;
          }
          }
        resultList=recordList;
      }
      resultList=recordList;
      this.setState({
        isEdit:true,
        upDownClick:true,
        currentList:resultList,
        sequence:recordList[realIndex].displaySeq,
        selectRowObj:recordList[realIndex],
        index:realIndex
      });
    }else{
      return false;
    }
  }
  }

  clickUp= () => {
    let rowObj={};
    rowObj=this.state.selectRowObj;
    let recordList=[];
    //Real List
    let realIndex=-1;
    for(let i=this.state.index-1;i>=0;i--){
      if((this.state.currentList[i].operationType!==undefined&&this.state.currentList[i].operationType!==ACTION_TYPE.DELETE)||this.state.currentList[i].operationType===undefined){
        realIndex=i;
        break;
      }
    }
    if(realIndex!==-1){
    recordList = JSON.parse(JSON.stringify(this.state.currentList));
    if(rowObj && recordList[realIndex]){
      let Sequence=rowObj.displaySeq;
      recordList[this.state.index].displaySeq=Sequence-1;
      recordList[realIndex].displaySeq=Sequence;
      [recordList[this.state.index], recordList[realIndex]] = [recordList[realIndex], recordList[this.state.index]];
      if(!this.state.isNew&&this.state.currentList.length>0){
          for(let i=0;i<this.state.oldList.length;i++){
            if(recordList[this.state.index].templateId!==0&&recordList[this.state.index].templateId===this.state.oldList[i].templateId){
              let editObj=recordList[this.state.index];
              editObj.operationType=ACTION_TYPE.UPDATE;
              recordList[this.state.index]=editObj;
            }
            else if(recordList[realIndex].templateId!==0&&recordList[realIndex].templateId===this.state.oldList[i].templateId){
            let editObj=recordList[realIndex];
            editObj.operationType=ACTION_TYPE.UPDATE;
            recordList[realIndex]=editObj;
          }
        }
      }
      this.setState({
        isEdit:true,
        upDownClick:true,
        currentList:recordList,
        sequence:recordList[realIndex].displaySeq,
        selectRowObj:recordList[realIndex],
        index:realIndex
      });
    }else{
      return false;
    }
  }
  }

  handleClickAdd = () => {
    const{insertDiagnosisLog}=this.props;
    let currentList=this.state.currentList;
    let params={};
     //Real List
     let List = [];
     this.setState({saveFlag:true});
     for(let i=0;i<this.state.currentList.length;i++){
       if((this.state.currentList[i].operationType!==undefined&&this.state.currentList[i].operationType!==ACTION_TYPE.DELETE)||this.state.currentList[i].operationType===undefined){
         if(List.length===0){
           List[0]=this.state.currentList[i];
         }
         else{
           List[List.length]=this.state.currentList[i];
         }
       }
     }
     //selected row
    if(this.state.selectRowObj!==null&&List.length>0){
    let recordListCopy = JSON.parse(JSON.stringify(this.state.currentList));
      params={
        templateId:0,
        diagnosisDisplayName:'',
        diagnosisName:'',
        createClinicCd:'',
        displaySeq:currentList[this.state.index].displaySeq+1,
        codeTermId:-9999,
        updateClinicCd:'',
        version:null,
        updateBy:null,
        updateDtm:null,
        updateByName: '',
        remarks:null,
        displayKey:0,
        operationType:ACTION_TYPE.INSERT
      };
      let currentIndex=-1;
      for(let i=this.state.index+1;i<this.state.currentList.length;i++){
        if((this.state.currentList[i].operationType!==undefined&&this.state.currentList[i].operationType!==ACTION_TYPE.DELETE)||this.state.currentList[i].operationType===undefined){
          currentIndex=i;
          break;
        }
      }
      if(currentIndex!==-1){
      currentList[currentIndex]=params;
      for(let i=currentIndex;i<recordListCopy.length;i++){
        recordListCopy[i].displaySeq=recordListCopy[i].displaySeq+1;
        if(recordListCopy[i].templateId!==0&&((recordListCopy[i].operationType!==undefined&&recordListCopy[i].operationType!==ACTION_TYPE.DELETE)||(recordListCopy[i].operationType===undefined)))
        recordListCopy[i].operationType=ACTION_TYPE.UPDATE;
        currentList[i+1]=recordListCopy[i];
    }
    }
    else{

      currentIndex=currentList.length;
      // currentList[currentIndex].sequence=
      currentList[currentIndex]=params;
    }
      this.setState({
        currentList:currentList,
        addFlag:true,
        selectRowObj:currentList[currentIndex],
        sequence:currentList[currentIndex].displaySeq,
        index:currentIndex
      });
    }
    else{
    let currentIndex=-1;
    let deleteFlag=false;
    if(List.length>0){
      for(let i=0;i<this.state.currentList.length;i++){
        if((this.state.currentList[i].operationType!==undefined&&this.state.currentList[i].operationType!==ACTION_TYPE.DELETE)||this.state.currentList[i].operationType===undefined){
          currentIndex=i;
        }
        if(this.state.currentList[i].operationType!==undefined&&this.state.currentList[i].operationType===ACTION_TYPE.DELETE){
          deleteFlag=true;
        }
      }
      params={
        templateId:0,
        diagnosisDisplayName:'',
        diagnosisName:'',
        createClinicCd:'',
        displaySeq:currentList[currentIndex].displaySeq+1,
        codeTermId:-9999,
        updatedClinicCd:'',
        version:null,
        updateBy:null,
        updateDtm:null,
        updateByName: '',
        remarks:null,
        displayKey:0,
        operationType:ACTION_TYPE.INSERT
    };
  }
  else{
    params={
      templateId:0,
      diagnosisDisplayName:'',
      diagnosisName:'',
      createClinicCd:'',
      displaySeq:1,
      codeTermId:-9999,
      updateClinicCd:'',
      version:null,
      updateBy:null,
      updateDtm:null,
      updateByName: '',
      remarks:null,
      displayKey:0,
      operationType:ACTION_TYPE.INSERT
  };
}
currentList[currentList.length]=params;

this.setState({
  currentList:currentList,
  editMinListFlag:false,
  groupNameNullFlag:false,
  selectRowObj:currentIndex!==-1?currentList[currentIndex+1]:currentList[currentList.length-1],
  sequence:currentIndex!==-1?currentList[currentIndex].displaySeq+1:currentList[currentList.length-1].displaySeq,
  index:currentIndex!==-1?(deleteFlag?currentList.length-1:currentIndex+1):currentList.length-1
});
  }
  insertDiagnosisLog&&insertDiagnosisLog('Click Add Button the Data in Diagnosis Template Group Maintenance Dialog','');
  this.setState({
    addFlag:true,
    isEdit:true
  });
}

  groupNameOnchange=(e)=>{
    this.setState({
      isEdit:true,
      editedGroupNameFlag:true,
      nameErrorFlag:false,
      groupName:e.target.value
    });
  }

  handleDiagnosisName=(index,event)=>{
    if(event!==undefined){
      let currentList=this.state.currentList;
      if(event.termDisplayName!==undefined){
      currentList[index].codeTermId=event.codeTermId;
      currentList[index].diagnosisName=event.termDisplayName;
      currentList[index].diagnosisDisplayName=event.termDisplayName;
      }else{
        currentList[index].diagnosisName=event;
        currentList[index].diagnosisDisplayName=event;
        currentList[index].codeTermId=-9999;
      }
      if(!this.state.isNew&&this.state.currentList.length>0){
        if(currentList[index].templateId!==0){

          for(let i=0;i<this.state.oldList.length;i++){
            if(currentList[index].templateId===this.state.oldList[i].templateId){
              let editObj=currentList[index];
              if(this.state.oldList[i].templateId!==0)
              editObj.operationType=ACTION_TYPE.UPDATE;
              editObj.diagnosisName=currentList[index].diagnosisName;
              editObj.diagnosisDisplayName=currentList[index].diagnosisName;
              currentList[index]=editObj;
            }

          }
        }
      }
      this.setState({
        isEdit:true,
        currentList:currentList
      });
    }

  }

  handleDiagnosisDisplayName=(index,event)=>{
    if(event!==undefined){
      let currentList=this.state.currentList;
      let resultList=[];
      if(event.termDisplayName!==undefined){
        currentList[index].diagnosisDisplayName=event.termDisplayName;
        if(currentList[index].templateId!==0)
        currentList[index].operationType=ACTION_TYPE.UPDATE;
      }
    else{
      currentList[index].diagnosisDisplayName=event;
      if(currentList[index].templateId!==0)
      currentList[index].operationType=ACTION_TYPE.UPDATE;
    }
      resultList=currentList;
      this.setState({
        isEdit:true,
        currentList:resultList
      });
    }
  }

  handleSearch=(e)=>{
    this.setState({
      termDisplayList: []
    });
    this.props.searchProblemListNoPagination({
      params: {
        localTerm:this.state.problemLocalTermChecked?'Y':'N',
        diagnosisTypeCd: PROBLEM_SEARCH_LIST_TYPE,
        diagnosisText: e
      },
      callback: (data) => {
        this.setState({
          termDisplayList: data
        });
      }
    });
  }

  handleEscKeyDown = () =>{
    this.handleDialogClose();
  }

  changeCheckBoxVal=(index,event)=>{
    const { insertDiagnosisLog } = this.props;
    if(event!==undefined){
      let currentList=this.state.currentList;
      let resultList=[];
      currentList[index].displayKey=event;
      if(currentList[index].templateId!==0)
      currentList[index].operationType=ACTION_TYPE.UPDATE;
      resultList=currentList;
      this.setState({
        // isEdit:true,
        currentList:resultList
      });
      insertDiagnosisLog && insertDiagnosisLog('Select Display Content selection list - select an item in Diagnosis Template Group Maintenance Dialog', '');
    }
  }

  changeInputVal=(index,event)=>{
    if(event!==undefined){
      let currentList=this.state.currentList;
      let resultList=[];
      currentList[index].remarks=event;
      if(currentList[index].templateId!==0)
      currentList[index].operationType=ACTION_TYPE.UPDATE;
      resultList=currentList;
      this.setState({
        // isEdit:true,
        currentList:resultList
      });
    }
  }

  handleProblemLocalTermChange=()=>{
    const{insertDiagnosisLog}=this.props;
    this.setState({
      problemLocalTermChecked:!this.state.problemLocalTermChecked
    });
    let typeName = !this.state.problemLocalTermChecked ? 'Select' : 'UnSelect';
    insertDiagnosisLog && insertDiagnosisLog(typeName + ' Local terms checkbox Button the Data in Diagnosis Template Group Maintenance Dialog', '');
  }

  render() {
    const { classes,open} = this.props;
    let { problemLocalTermChecked,localTermDisabled,nameErrorFlag,groupName,groupNameNullFlag } = this.state;
    return (
      <EditTemplateDialog
      // dialogContentProps={{ style: { minWidth: 1000} }}
          dialogTitle="Diagnosis Template Group Maintenance"
          open={open}
          handleEscKeyDown={this.handleEscKeyDown}
      >

        <Typography
            component="div"
            style={{ backgroundColor: 'white', marginLeft: 5, marginRight: 5, marginTop: 5,position:'relative'}}
        >
          <ValidatorForm
              id="bookingCalendarForm"
              onKeyDown={e => this.handleKeyDown(e)}
              onSubmit={this.recordListSave}
              ref="form"
          >
            <Grid alignItems="center"
                container
                style={{ marginTop: 10 }}
            >
              <label className={classes.left_Label}>{en_US.templateAdmin.label_group_name}<span style={{ color: 'red' }}>*</span>:</label>

              <Grid item xs={8}>
                {/* <TextFieldValidator
                    errorMessages={['This field is required.']}
                    fullWidth
                    id={'groupNameTextFiled'}
                    inputProps={{
                      maxLength: 40
                    }}
                    msgPosition="right"
                    onChange={this.groupNameOnchange}
                    validators={['required']}
                    value={this.state.groupName}
                /> */}
                <TextField
                    id={'groupNameTextFiled'}
                    variant="outlined"
                    className={classes.textField}
                    inputProps={{ maxLength: 1000, 'aria-label': 'bare' }}
                    onChange={this.groupNameOnchange}
                    autoComplete="off"
                    error={nameErrorFlag ? true : (groupName.trim() === '' && groupNameNullFlag ? true : false)}
                    InputProps={{
                      style: {
                        fontSize: '1rem',
                        fontFamily: 'Arial'
                      }
                    }}
                    value={groupName}
                />
                {groupName.trim() === '' && groupNameNullFlag ? <span id="groupNameTextFiled_helperText" className={classes.validation_span}>This field is required.</span> : null}
                {nameErrorFlag ? <span id="grounName" className={classes.validation_span}>{this.state.nameValidation}</span> : null}

              </Grid>
            </Grid>


          <Typography
              component="div"
              style={{ marginTop: 0, marginBottom: -15 }}
          >
            <Button onClick={this.handleClickAdd}
                id="btn_editProblemTemplate_add"
                style={{ textTransform: 'none' }}
            >
              <AddCircle color="primary" />
              <span className={classes.font_color}>Add</span>
            </Button>

            <Button onClick={this.handleClickOpen}
                id="btn_editProblemTemplate_delete"
                style={{ textTransform: 'none' }}
            >
              <RemoveCircle color="primary" />
              <span className={classes.font_color}>Delete</span>
            </Button>

            <Button onClick={this.handleClickUp}
                id="btn_editProblemTemplate_up"
                style={{ textTransform: 'none' }}
            >
              <ArrowUpwardOutlined color="primary" />
              <span className={classes.font_color}>Up</span>
            </Button>

            <Button onClick={this.handleClickDown}
                id="btn_editProblemTemplate_down"
                style={{ textTransform: 'none' }}
            >
              <ArrowDownward color="primary" />
              <span className={classes.font_color}>Down</span>
            </Button>
          </Typography>

          <Paper className={classes.paperTable} >
          <Table className={classes.table_itself}
              id="problem_template_dialog"
          >
            <TableHead>
              <TableRow className={classes.table_head}>
                <TableCell
                    className={classes.table_header}
                    padding={'none'}
                    style={{width: '5%'}}

                >
                  Seq
                  </TableCell>
                <TableCell
                    className={classes.table_header}
                    padding={'none'}
                    style={{width: '10%'}}

                >
                  <Grid container style={{minWidth:420}}>
                  <Grid container item xs={8} >
                    <label className={classes.label}>Diagnosis&nbsp;Name</label>
                  </Grid>
                  <Grid container item xs={4}>
                    <label className={classes.label}>Local terms</label>
                    <div className={classes.floatLeft}>
                      <Checkbox
                          classes={{
                              root:classes.localTermCheckbox
                            }}
                          disabled={localTermDisabled}
                          color="primary"
                          id="diagnosis_local_term"
                          checked={problemLocalTermChecked}
                          onChange={(event) => { this.handleProblemLocalTermChange(event);}}
                      />
                    </div>
                  </Grid>
                </Grid>
                </TableCell>
                <TableCell className={classes.table_header} padding={'none'} style={{ width: '20%' }}>
                    Display&nbsp;Name
                </TableCell>
                <TableCell className={classes.table_header} padding={'none'} style={{ width: '20%' }}>
                    Details
                </TableCell>
                <TableCell className={classes.table_header} padding={'none'} style={{ width: '12%' }}>
                    Display&nbsp;Content
                </TableCell>
                <TableCell className={classes.table_header}
                    padding={'none'}
                    style={{paddingLeft:10,width: '12%'}}
                >
                  Updated&nbsp;By
                  </TableCell>
                <TableCell className={classes.table_header}
                    // padding={'none'}
                    style={{width: '15%',paddingBottom:0}}
                >
                  Updated&nbsp;On
                  </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.currentList.map((item, index) => (
                <TableRow
                    className={
                    item.displaySeq === this.state.sequence ? classes.table_row_selected : classes.table_row
                  }
                    key={index}
                    onClick={this.getSelectTemplate.bind(this,item,index)}
                    style={{display:item.operationType===ACTION_TYPE.DELETE?'none':'table-row'}}
                >

                  <TableCell className={classes.table_cell}
                      padding={'none'}
                      style={{width: '5%'}}
                  >
                  <Typography
                      className={classes.fontLabel}
                      component="div"
                      style={(item.diagnosisName.trim()===''||item.diagnosisDisplayName.trim()===''||((item.remarks===null||item.remarks.trim()==='')&&(this.state.currentList[index].displayKey===1||this.state.currentList[index].displayKey===2))||item.displayKey===3)&&!this.state.saveFlag?{ height: 40}:null}
                  >
                    {(item.displaySeq)}
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.table_cell}
                      padding={'none'}
                      style={{width: '5%'}}
                  >
                    <Typography
                        component="div"
                        style={(item.diagnosisName.trim()===''||item.diagnosisDisplayName.trim()===''||((item.remarks===null||item.remarks.trim()==='')&&(this.state.currentList[index].displayKey===1||this.state.currentList[index].displayKey===2))||item.displayKey===3) &&!this.state.saveFlag?{}:null}
                    >
                      <EditTemplateInput
                          addflag={this.state.addFlag}
                          dataList={this.state.termDisplayList}
                          displayField={['termDisplayName']}
                          id={item.displaySeq}
                          limitValue={3}
                          onChange={this.handleSearch.bind(this)}
                          onSelectItem={this.handleDiagnosisName.bind(this, index)}
                          searchInputvalue={item.diagnosisName === undefined ? '' : item.diagnosisName}
                          sequence={this.state.sequence}
                      />
                      {item.diagnosisName.trim() === '' && !this.state.saveFlag ? (
                        <Typography component="div" style={{ paddingLeft: 8 }}>
                          <span className={classes.validation} id="span_editProblemTemplate_problemName_validation">This field is required.</span>
                        </Typography>
                      ) : null}
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.table_cell}
                      padding={'none'}
                      style={{width: '24%'}}
                  >
                   <Typography
                       component="div"
                       style={(item.diagnosisName.trim()===''||item.diagnosisDisplayName.trim()===''||((item.remarks===null||item.remarks.trim()==='')&&(this.state.currentList[index].displayKey===1||this.state.currentList[index].displayKey===2))||item.displayKey===3)&&!this.state.saveFlag?{}:null}
                   >
                     {/* EditTemplateInput EditTemplateText */}
                  <EditTemplateText
                      dataList={null}
                      displayField={['termDisplayName']}
                      id={item.displaySeq}
                      limitValue={3}
                      onChange={this.handleSearch.bind(this)}
                      onSelectItem={this.handleDiagnosisDisplayName.bind(this,index)}
                      searchInputvalue={item.diagnosisDisplayName===undefined?'':item.diagnosisDisplayName}
                  />
                      {item.diagnosisDisplayName.trim() === '' && !this.state.saveFlag ? (
                        <Typography component="div" style={{ paddingLeft: 8 }}>
                          <span className={classes.validation} id="span_editProblemTemplate_displayName_validation">This field is required.</span>
                        </Typography>
                      ) : null}
                    </Typography>
                  </TableCell>

                  <TableCell className={classes.table_cell}
                      padding={'none'}
                      style={{width: '24%'}}
                  >
                    <Typography
                        component="div"
                        style={(item.diagnosisName.trim()===''||item.diagnosisDisplayName.trim()===''||((item.remarks===null||item.remarks.trim()==='')&&(this.state.currentList[index].displayKey===1||this.state.currentList[index].displayKey===2))||item.displayKey===3)&&!this.state.saveFlag?{}:null}
                    >
                      <EditTemplateText
                          dataList={null}
                          displayField={['remarks']}
                          id={'remarks_'+item.displaySeq+'_'}
                          limitValue={3}
                          // onChange={this.changeCheckBoxVal.bind(this,index)}
                          onSelectItem={this.changeInputVal.bind(this,index)}
                          searchInputvalue={item.remarks===undefined||item.remarks===null?'':item.remarks}
                      />
                      {((item.remarks===null||item.remarks.trim()==='')&&(this.state.currentList[index].displayKey===1||this.state.currentList[index].displayKey===2))&&!this.state.saveFlag?(
                        <Typography
                            component="div"
                            style={{paddingLeft:8}}
                        ><span className={classes.validation}
                            id="span_editProceduerTemplate_displayName_validation"
                        >This field is required.</span></Typography>
                      ):null}
                    </Typography>
                  </TableCell>

                  <TableCell
                      className={classes.cell_text}
                      style={{width: '10%',paddingRight:5}}
                  >
                     <Typography
                         component="div"
                         style={(item.diagnosisName.trim()===''||item.diagnosisDisplayName.trim()===''||((item.remarks===null||item.remarks.trim()==='')&&(this.state.currentList[index].displayKey===1||this.state.currentList[index].displayKey===2))||item.displayKey===3)&&!this.state.saveFlag?{}:null}
                     >
                    <SelectAndCheckBox onChange={this.changeCheckBoxVal.bind(this,index)} defaultValue={item.displayKey}/>
                    {item.displayKey===3&&!this.state.saveFlag?(
                      <Typography
                          component="div"
                          style={{paddingLeft:8}}
                      ><span className={classes.validation}
                          id="span_editProceduerTemplate_displayName_validation"
                      >This field is required.</span></Typography>
                    ):null}
                    </Typography>
                  </TableCell>

                  <TableCell
                      className={classes.cell_text}
                      style={{width: '10%'}}
                  >
                   <Typography
                       component="div"
                       className={classes.fontLabel}
                       style={(item.diagnosisName.trim()===''||item.diagnosisDisplayName.trim()===''||((item.remarks===null||item.remarks.trim()==='')&&(this.state.currentList[index].displayKey===1||this.state.currentList[index].displayKey===2))||item.displayKey===3)&&!this.state.saveFlag?{}:null}
                   >
                  {item.updateByName}
                  </Typography>
                  </TableCell>
                  <TableCell
                      className={classes.table_cell_1}
                      style={{paddingLeft:10,width: '10%'}}
                  >
                    <Typography
                        component="div"
                        className={classes.fontLabel}
                        style={(item.diagnosisName.trim()===''||item.diagnosisDisplayName.trim()===''||((item.remarks===null||item.remarks.trim()==='')&&(this.state.currentList[index].displayKey===1||this.state.currentList[index].displayKey===2))||item.displayKey===3) &&!this.state.saveFlag?{}:null}
                    >
                   {item.updateDtm?moment(item.updateDtm).format('DD-MMM-YYYY'):null}
                    </Typography>
                  </TableCell>
                </TableRow>

              ))}
            </TableBody>
          </Table>
          </Paper>
          {/* {this.state.editMinListFlag?(
              <Typography
                  component="div"
                  style={{ marginTop: 0, marginBottom: -15, paddingLeft:8}}
              ><span className={classes.validation}
                  id="span_editProblemTemplate_validation"
              >At least one template.</span></Typography>
            ):null} */}
          <Typography component="div" className={classes.btnDiv}>
              <Grid alignItems="center"
                  container
                  justify="flex-end"
              >
                <Typography component="div">
                  <CIMSButton
                      classes={{
                        label:classes.fontLabel
                      }}
                      color="primary"
                      id="btn_diagnosis_template_save"
                      size="small"
                      type="submit"
                  >
                    Save
                  </CIMSButton>
                </Typography>
                <CIMSButton
                    classes={{
                      label:classes.fontLabel
                    }}
                    color="primary"
                    id="btn_diagnosis_template_reset"
                    onClick={() =>this.handleDialogClose()}
                    // onClick={() =>this.handleClose()}
                    size="small"
                >
                  Cancel
                </CIMSButton>
              </Grid>
            </Typography>
            </ValidatorForm>
          </Typography>
          {/* <div  className={classes.progress}>
        <CircularProgress />
        </div> */}
     </EditTemplateDialog>
    );
  }
}

function mapStateToProps(state) {
  return {
    deleteList: state.manageClinicalNoteTemplate.deleteList,
    recordList:state.manageClinicalNoteTemplate.recordList
  };
}

const mapDispatchToProps = {
  saveEditTemplateList,
  openCommonMessage,
  closeCommonMessage,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  searchProblemListNoPagination
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(style)(EditDiagnosisTemplate));
