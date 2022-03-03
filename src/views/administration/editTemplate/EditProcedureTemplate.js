/*
 * Front-end UI for insert/update procedure template group
 * Save Action: [ServiceFavouriteDialog.js] Save -> recordListSave
 * -> [problemAction.js] saveEditTemplateList
 * -> [problemSaga.js] saveEditTemplateList
 * -> Backend API = /diagnosis/saveProcedureTmpls
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Button, Table, TableRow, Typography, TableCell, TableHead, TableBody, TextField, Checkbox } from '@material-ui/core';
import en_US from '../../../locales/en_US';
import { withStyles } from '@material-ui/core/styles';
import { AddCircle } from '@material-ui/icons';
import { RemoveCircle } from '@material-ui/icons';
import { ArrowUpwardOutlined } from '@material-ui/icons';
import { ArrowDownward } from '@material-ui/icons';
import moment from 'moment';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import EditTemplateDialog from './components/EditTemplateDialog';
import { style } from './EditTemplateCss';
import EditTemplateInput from './components/EditTemplateInput';
import EditTemplateText from './components/EditTemplateText';
import 'react-quill/dist/quill.snow.css';
import { openCommonMessage, closeCommonMessage } from '../../../store/actions/message/messageAction';
import { saveEditTemplateList, searchProcedureList } from '../../../store/actions/consultation/dxpx/procedure/procedureAction';
import Paper from '@material-ui/core/Paper';
import { PROCEDURE_CODE } from '../../../constants/message/procedureCode';
import { openCommonCircularDialog, closeCommonCircularDialog } from '../../../store/actions/common/commonAction';
import { PROCEDURE_SEARCH_LIST_TYPE, ACTION_TYPE, NEW_STATUS } from '../../../constants/procedure/procedureConstants';
import SelectAndCheckBox from './components/SelectAndCheckBox';
import * as commonConstants from '../../../constants/common/commonConstants';

class EditProcedureTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // favoriteValue: 'Service Favorite',
      selectRowObj: null,
      sequence: null,
      open: this.props.open, // open dialog
      // codeClinicalnoteTmplTypeCd: 'S',
      isEdit: false,
      templateList: this.props.templateList,
      selectObj: {
        templateName: '',
        templateText: ''
      },
      upDownClick: false,
      groupName: '',
      currentList: [],
      termDisplayList: [],
      selectTemplateGroup: {},
      isNew: false,
      oldList: [],
      editedGroupNameFlag: false,
      editMinListFlag: false,
      groupNameNullFlag: false,
      addFlag: false,
      saveFlag: true,
      procedureLocalTermChecked: this.props.procedureLocalTermChecked,
      localTermDisabled: this.props.localTermDisabled,
      nameErrorFlag: false,
      nameValidation: 'This field is required.'
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.editTemplateList !== this.state.editTemplateList) {
      if (nextProps.editTemplateList.length > 0) {
        this.setState({
          groupName:
            nextProps.editTemplateList[0].dxpxTemplateGroup !== undefined
              ? nextProps.editTemplateList[0].dxpxTemplateGroup.groupName !== undefined
                ? nextProps.editTemplateList[0].dxpxTemplateGroup.groupName
                : ''
              : '',
          selectTemplateGroup: nextProps.editTemplateList[0].dxpxTemplateGroup !== undefined ? nextProps.editTemplateList[0].dxpxTemplateGroup : {},
          isNew: false
        });
      } else {
        this.setState({
          groupName: '',
          isNew: true
        });
      }
      this.setState({
        currentList: nextProps.editTemplateList,
        oldList: nextProps.editTemplateList,
        templateList: nextProps.templateList,
        selectGroupSequence: nextProps.selectGroupSequence,
        procedureLocalTermChecked: nextProps.procedureLocalTermChecked,
        localTermDisabled: nextProps.localTermDisabled,
        saveFlag: true
      });
    }
    this.setState({ addFlag: false });
  }

  handleClickUp = () => {
    const { insertProcedureLog } = this.props;
    let params = this.state.selectRowObj;
    let name = '';
    if (params) {
      let typeNum = params.templateId === 0 ? 'New record is selected;' : `(Sequence Number: ${params.displaySeq};`;
      name = `[Procedure Template Group Maintenance Dialog] Action: Click 'Up' button ${typeNum} Template ID: ${params.templateId}; Code Term ID: ${params.codeTermId}; Problem Name: ${this.state.groupName})`;
      this.clickUp();
    } else {
      name =
        '[Procedure Template Group Maintenance Dialog] Action: Click \'Up\' button (No record is selected; Sequence Number: null; Template ID: null; Code Term ID: null; Problem Name: null)';
      let payload = { msgCode: PROCEDURE_CODE.IS_UP_PROCEDURE_TEMPLATE_TIP };
      this.props.openCommonMessage(payload);
    }
    insertProcedureLog && insertProcedureLog(name, '');
  };

  handleClickDown = () => {
    const { insertProcedureLog } = this.props;
    let params = this.state.selectRowObj;
    let name = '';
    if (params) {
      let typeNum = params.templateId === 0 ? '(New record is selected;' : `(Sequence Number: ${params.displaySeq};`;
      name = `[Procedure Template Group Maintenance Dialog] Action: Click 'Down' button ${typeNum} Template ID: ${params.templateId}; Code Term ID: ${params.codeTermId}; Problem Name: ${this.state.groupName})`;
      this.clickDown();
    } else {
      name =
        '[Procedure Template Group Maintenance Dialog] Action: Click \'Down\' button (No record is selected; Sequence Number: null; Template ID: null; Code Term ID: null; Problem Name: null)';
      let payload = { msgCode: PROCEDURE_CODE.IS_DOWN_PROCEDURE_TEMPLATE_TIP };
      this.props.openCommonMessage(payload);
    }
    insertProcedureLog && insertProcedureLog(name, '');
  };

  handleClickOpen = () => {
    const { insertProcedureLog } = this.props;
    let params = this.state.selectRowObj;
    if (params) {
      let payload = {
        msgCode: PROCEDURE_CODE.IS_DELETE_PROCEDURE_TEMPLATE,
        btnActions: {
          btn1Click: () => {
            let typeNum = params.templateId === 0 ? '(New record is selected;' : `(Template ID: ${params.templateId};`;
            let name = `[Procedure Template Group Maintenance Dialog] Action: Click 'Delete' button ${typeNum} Code Term ID: ${params.codeTermId}; Problem Name: ${this.state.groupName})`;
            insertProcedureLog && insertProcedureLog(name, '');
            this.handleClickDelete();
          }
        }
      };
      this.props.openCommonMessage(payload);
    } else {
      let name = '[Procedure Template Group Maintenance Dialog] Action: Click \'Delete\' button (No record is selected; Template ID: null; Code Term ID: null; Procedure Name: null)';
      insertProcedureLog && insertProcedureLog(name, '');
      let payload = { msgCode: PROCEDURE_CODE.IS_DELETE_PROCEDURE_TEMPLATE_TIP };
      this.props.openCommonMessage(payload);
    }
  };

  handleClose = () => {
    let { handleClose } = this.props;
    this.setState({
      selectRowObj: null,
      sequence: null,
      index: null,
      editMinListFlag: false,
      groupNameNullFlag: false,
      nameErrorFlag: false,
      nameValidation: 'This field is required.'
    });
    handleClose && handleClose();
  };

  handleDialogClose = () => {
    let { insertProcedureLog } = this.props;
    let { isEdit } = this.state;
    if (isEdit) {
      let payload = {
        msgCode: PROCEDURE_CODE.IS_CLOSE_DIALOG,
        btnActions: {
          // Yes
          btn1Click: () => {
            insertProcedureLog && insertProcedureLog('[Procedure Template Group Maintenance Dialog] Action: Click \'Cancel\' button', '');
            this.setState({ isEdit: false });
            this.handleClose();
          }
        }
      };
      this.props.openCommonMessage(payload);
    } else {
      this.handleClose();
    }
  };

  //重新加载列表数据
  reloadList = () => {};

  //获得选中行数据
  getSelectTemplate = (item, index) => {
    this.setState({
      index: index,
      sequence: item.displaySeq,
      selectRowObj: item
    });
  };

  recordListSave = () => {
    const { insertProcedureLog, commonMessageList } = this.props;
    //Real List
    let List = [];
    for (let i = 0; i < this.state.currentList.length; i++) {
      if (
        (this.state.currentList[i].operationType !== undefined && this.state.currentList[i].operationType !== ACTION_TYPE.DELETE) ||
        this.state.currentList[i].operationType === undefined
      ) {
        if (List.length === 0) {
          List[0] = this.state.currentList[i];
        } else {
          List[List.length - 1] = this.state.currentList[i];
        }
      }
    }
    if (List.length < 1 && this.state.groupName.trim() !== '') {
      let payload = { msgCode: PROCEDURE_CODE.IS_EDIT_MIN_LIST };
      this.props.openCommonMessage(payload);
      if (this.state.groupName.trim() === '') {
        this.setState({ saveFlag: false, groupNameNullFlag: true, editMinListFlag: true });
      } else {
        this.setState({ editMinListFlag: true });
      }
    } else if (this.state.groupName.trim() === '') {
      this.setState({ groupNameNullFlag: true, saveFlag: false });
    } else {
      this.setState({ editMinListFlag: false, groupNameNullFlag: false });
      //all validation will pass
      let Flag = true;
      for (let i = 0; i < this.state.currentList.length; i++) {
        if (
          (this.state.currentList[i].operationType !== undefined && this.state.currentList[i].operationType !== ACTION_TYPE.DELETE) ||
          this.state.currentList[i].operationType === undefined
        ) {
          if (
            this.state.currentList[i].diagnosisName.trim() === '' ||
            this.state.currentList[i].diagnosisDisplayName.trim() === '' ||
            ((this.state.currentList[i].remarks === null || this.state.currentList[i].remarks.trim() === '') &&
              (this.state.currentList[i].displayKey === 1 || this.state.currentList[i].displayKey === 2)) ||
            this.state.currentList[i].displayKey === 3
          ) {
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
          if (this.state.editedGroupNameFlag) selectTemplateGroup.operationType = ACTION_TYPE.UPDATE;
          else selectTemplateGroup.operationType = null;
          selectTemplateGroup.groupName = this.state.groupName.trim();
        } else {
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
        this.props.saveEditTemplateList({
          params,
          callback: (result) => {
            this.props.closeCommonCircularDialog();
            if (result.respCode === 0) {
              if (result.msgCode === PROCEDURE_CODE.SAVE_SUCCESSFUL) {
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
            } else if (result.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
              let payload = {
                msgCode: result.msgCode,
                btnActions: {
                  btn1Click: () => {
                    this.refreshPageData();
                  },
                  btn2Click: () => {
                    this.props.closeCommonCircularDialog();
                  }
                }
              };
              this.props.openCommonMessage(payload);
            } else {
              let message = commonMessageList.find((item) => item.messageCode === result.msgCode);
              this.setState({ nameErrorFlag: true, nameValidation: message.description });
            }
            insertProcedureLog && insertProcedureLog('[Procedure Template Group Maintenance Dialog] Action: Click \'Save\' button ', '/diagnosis/procedureTemplate/');
          }
        });
      }
    }
  };

  refreshPageData = () => {
    let { refreshData, handleClose } = this.props;
    refreshData && refreshData();
    handleClose && handleClose();
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
  };

  handleClickDelete = () => {
    if (this.state.selectRowObj !== null) {
      if (this.state.isNew || this.state.currentList.length === 0 || this.state.selectRowObj.templateId === 0) {
        let index = this.state.index;
        this.state.currentList.splice(index, 1);
        let currentList = this.state.currentList;
        let count = 1;
        for (let i = 0; i < this.state.currentList.length; i++) {
          if (currentList[i].operationType === null || (currentList[i].operationType !== null && currentList[i].operationType !== ACTION_TYPE.DELETE)) {
            currentList[i].displaySeq = count;
            count++;
          }
        }
        this.setState({
          isEdit: true,
          currentList: currentList,
          selectRowObj: null,
          sequence: null,
          index: null
        });
      } else {
        if (this.state.oldList.length > 0 && this.state.selectRowObj.templateId !== 0) {
          let currentList = this.state.currentList;
          for (let i = 0; i < this.state.oldList.length; i++) {
            if (this.state.selectRowObj.templateId === this.state.oldList[i].templateId) {
              let editObj = this.state.selectRowObj;
              editObj.operationType = ACTION_TYPE.DELETE;
              currentList[this.state.index] = editObj;
              let resultList = currentList;
              let count = 1;
              for (let i = 0; i < resultList.length; i++) {
                if (resultList[i].operationType === null || (resultList[i].operationType !== null && resultList[i].operationType !== ACTION_TYPE.DELETE)) {
                  if (resultList[i].operationType === null && i > this.state.index - 1) {
                    resultList[i].operationType = ACTION_TYPE.UPDATE;
                  }
                  resultList[i].displaySeq = count;
                  count++;
                }
              }
              this.setState({
                isEdit: true,
                currentList: resultList,
                selectRowObj: null,
                sequence: null,
                index: null
              });
              break;
            }
          }
        }
      }
    }
  };

  clickDown = () => {
    let rowObj = {};
    rowObj = this.state.selectRowObj;
    let recordList = [];
    let resultList = [];
    //Real List
    let realIndex = -1;
    for (let i = this.state.index + 1; i < this.state.currentList.length; i++) {
      if (
        (this.state.currentList[i].operationType !== undefined && this.state.currentList[i].operationType !== ACTION_TYPE.DELETE) ||
        this.state.currentList[i].operationType === undefined
      ) {
        realIndex = i;
        break;
      }
    }
    if (realIndex !== -1) {
      recordList = JSON.parse(JSON.stringify(this.state.currentList));
      if (rowObj && recordList[realIndex]) {
        let Sequence = rowObj.displaySeq;
        recordList[this.state.index].displaySeq = Sequence + 1;
        recordList[realIndex].displaySeq = Sequence;
        let selectobj = recordList[this.state.index];
        recordList[this.state.index] = recordList[realIndex];
        recordList[realIndex] = selectobj;
        if (!this.state.isNew && this.state.currentList.length > 0) {
          for (let i = 0; i < this.state.oldList.length; i++) {
            if (recordList[this.state.index].templateId !== 0 && recordList[this.state.index].templateId === this.state.oldList[i].templateId) {
              let editObj = recordList[this.state.index];
              editObj.operationType = ACTION_TYPE.UPDATE;
              recordList[this.state.index] = editObj;
            } else if (recordList[realIndex].templateId !== 0 && recordList[realIndex].templateId === this.state.oldList[i].templateId) {
              let editObj = recordList[realIndex];
              editObj.operationType = ACTION_TYPE.UPDATE;
              recordList[realIndex] = editObj;
            }
          }
          resultList = recordList;
        }
        resultList = recordList;
        this.setState({
          isEdit: true,
          upDownClick: true,
          currentList: resultList,
          sequence: recordList[realIndex].displaySeq,
          selectRowObj: recordList[realIndex],
          index: realIndex
        });
      } else {
        return false;
      }
    }
  };

  clickUp = () => {
    let rowObj = {};
    rowObj = this.state.selectRowObj;
    let recordList = [];
    let resultList = [];
    //Real List
    let realIndex = -1;
    for (let i = this.state.index - 1; i >= 0; i--) {
      if (
        (this.state.currentList[i].operationType !== undefined && this.state.currentList[i].operationType !== ACTION_TYPE.DELETE) ||
        this.state.currentList[i].operationType === undefined
      ) {
        realIndex = i;
        break;
      }
    }
    if (realIndex !== -1) {
      recordList = JSON.parse(JSON.stringify(this.state.currentList));
      if (rowObj && recordList[realIndex]) {
        let Sequence = rowObj.displaySeq;
        recordList[this.state.index].displaySeq = Sequence - 1;
        recordList[realIndex].displaySeq = Sequence;
        let selectobj = recordList[this.state.index];
        recordList[this.state.index] = recordList[realIndex];
        recordList[realIndex] = selectobj;
        if (!this.state.isNew && this.state.currentList.length > 0) {
          for (let i = 0; i < this.state.oldList.length; i++) {
            if (recordList[this.state.index].templateId !== 0 && recordList[this.state.index].templateId === this.state.oldList[i].templateId) {
              let editObj = recordList[this.state.index];
              editObj.operationType = ACTION_TYPE.UPDATE;
              recordList[this.state.index] = editObj;
            } else if (recordList[realIndex].templateId !== 0 && recordList[realIndex].templateId === this.state.oldList[i].templateId) {
              let editObj = recordList[realIndex];
              editObj.operationType = ACTION_TYPE.UPDATE;
              recordList[realIndex] = editObj;
            }
            resultList = recordList;
          }
        }
        resultList = recordList;
        this.setState({
          isEdit: true,
          upDownClick: true,
          currentList: resultList,
          sequence: recordList[realIndex].displaySeq,
          selectRowObj: recordList[realIndex],
          index: realIndex
        });
      } else {
        return false;
      }
    }
  };

  handleClickAdd = () => {
    const { insertProcedureLog } = this.props;
    let currentList = this.state.currentList;
    let params = {};
    //Real List
    let List = [];
    this.setState({ saveFlag: true });
    for (let i = 0; i < this.state.currentList.length; i++) {
      if (
        (this.state.currentList[i].operationType !== undefined && this.state.currentList[i].operationType !== ACTION_TYPE.DELETE) ||
        this.state.currentList[i].operationType === undefined
      ) {
        if (List.length === 0) {
          List[0] = this.state.currentList[i];
        } else {
          List[List.length] = this.state.currentList[i];
        }
      }
    }
    if (this.state.selectRowObj !== null && List.length > 0) {
      let recordListCopy = JSON.parse(JSON.stringify(this.state.currentList));
      params = {
        templateId: 0,
        diagnosisDisplayName: '',
        diagnosisName: '',
        createClinicCd: '',
        displaySeq: currentList[this.state.index].displaySeq + 1,
        codeTermId: -9999,
        updateClinicCd: '',
        version: null,
        updateBy: null,
        updateDtm: null,
        updateByName: '',
        remarks: null,
        displayKey: 0,
        operationType: ACTION_TYPE.INSERT
      };
      let currentIndex = -1;
      for (let i = this.state.index + 1; i < this.state.currentList.length; i++) {
        if (
          (this.state.currentList[i].operationType !== undefined && this.state.currentList[i].operationType !== ACTION_TYPE.DELETE) ||
          this.state.currentList[i].operationType === undefined
        ) {
          currentIndex = i;
          break;
        }
      }
      if (currentIndex !== -1) {
        currentList[currentIndex] = params;
        for (let i = currentIndex; i < recordListCopy.length; i++) {
          recordListCopy[i].displaySeq = recordListCopy[i].displaySeq + 1;
          if (
            recordListCopy[i].templateId !== 0 &&
            ((recordListCopy[i].operationType !== undefined && recordListCopy[i].operationType !== ACTION_TYPE.DELETE) || recordListCopy[i].operationType === undefined)
          )
            recordListCopy[i].operationType = ACTION_TYPE.UPDATE;
          currentList[i + 1] = recordListCopy[i];
        }
      } else {
        currentIndex = currentList.length;
        // currentList[currentIndex].sequence=
        currentList[currentIndex] = params;
      }
      this.setState({
        currentList: currentList,
        addFlag: true,
        selectRowObj: currentList[currentIndex],
        sequence: currentList[currentIndex].displaySeq,
        index: currentIndex
      });
    } else {
      let currentIndex = -1;
      let deleteFlag = false;
      if (List.length > 0) {
        for (let i = 0; i < this.state.currentList.length; i++) {
          if (
            (this.state.currentList[i].operationType !== undefined && this.state.currentList[i].operationType !== ACTION_TYPE.DELETE) ||
            this.state.currentList[i].operationType === undefined
          ) {
            currentIndex = i;
          }
          if (this.state.currentList[i].operationType !== undefined && this.state.currentList[i].operationType === ACTION_TYPE.DELETE) {
            deleteFlag = true;
          }
        }
        params = {
          templateId: 0,
          diagnosisDisplayName: '',
          diagnosisName: '',
          createClinicCd: '',
          displaySeq: currentList[currentIndex].displaySeq + 1,
          codeTermId: -9999,
          updatedClinicCd: '',
          version: null,
          updateBy: null,
          updateDtm: null,
          updateByName: '',
          remarks: null,
          displayKey: 0,
          operationType: ACTION_TYPE.INSERT
        };
      } else {
        params = {
          templateId: 0,
          diagnosisDisplayName: '',
          diagnosisName: '',
          createClinicCd: '',
          displaySeq: 1,
          codeTermId: -9999,
          updateClinicCd: '',
          version: null,
          updateBy: null,
          updateDtm: null,
          updateByName: '',
          remarks: null,
          displayKey: 0,
          operationType: ACTION_TYPE.INSERT
        };
      }
      currentList[currentList.length] = params;
      this.setState({
        currentList: currentList,
        editMinListFlag: false,
        groupNameNullFlag: false,
        selectRowObj: currentIndex !== -1 ? currentList[currentIndex + 1] : currentList[currentList.length - 1],
        sequence: currentIndex !== -1 ? currentList[currentIndex].displaySeq + 1 : currentList[currentList.length - 1].displaySeq,
        index: currentIndex !== -1 ? (deleteFlag ? currentList.length - 1 : currentIndex + 1) : currentList.length - 1
      });
    }
    insertProcedureLog && insertProcedureLog('[Procedure Template Group Maintenance Dialog] Action: Click \'Add\' button', '');
    this.setState({
      isEdit: true,
      addFlag: true
    });
  };

  groupNameOnchange = (e) => {
    this.setState({
      isEdit: true,
      editedGroupNameFlag: true,
      nameErrorFlag: false,
      groupName: e.target.value
    });
  };

  handleDiagnosisName = (index, event) => {
    if (event !== undefined) {
      let currentList = this.state.currentList;
      if (event.termDisplayName !== undefined) {
        currentList[index].codeTermId = event.codeTermId;
        currentList[index].diagnosisName = event.termDisplayName;
        currentList[index].diagnosisDisplayName = event.termDisplayName;
      } else {
        currentList[index].diagnosisName = event;
        currentList[index].diagnosisDisplayName = event;
        currentList[index].codeTermId = -9999;
      }
      if (!this.state.isNew && this.state.currentList.length > 0) {
        if (currentList[index].templateId !== 0) {
          for (let i = 0; i < this.state.oldList.length; i++) {
            if (currentList[index].templateId === this.state.oldList[i].templateId) {
              let editObj = currentList[index];
              if (this.state.oldList[i].templateId !== 0) editObj.operationType = ACTION_TYPE.UPDATE;
              editObj.diagnosisName = currentList[index].diagnosisName;
              editObj.diagnosisDisplayName = currentList[index].diagnosisName;
              currentList[index] = editObj;
            }
          }
        }
      }
      this.setState({
        isEdit: true,
        currentList: currentList
      });
    }
  };

  handleDiagnosisDisplayName = (index, event) => {
    if (event !== undefined) {
      let currentList = this.state.currentList;
      let resultList = [];
      if (event.termDisplayName !== undefined) {
        currentList[index].diagnosisDisplayName = event.termDisplayName;
        if (currentList[index].templateId !== 0) currentList[index].operationType = ACTION_TYPE.UPDATE;
      } else {
        currentList[index].diagnosisDisplayName = event;
        if (currentList[index].templateId !== 0) currentList[index].operationType = ACTION_TYPE.UPDATE;
      }
      resultList = currentList;
      this.setState({
        isEdit: true,
        currentList: resultList
      });
    }
  };

  handleSearch = (e) => {
    let { insertProcedureLog } = this.props;
    this.setState({ termDisplayList: [] });
    let checkbox = this.state.procedureLocalTermChecked ? 'Yes' : 'No';
    let name = `[Procedure Template Group Maintenance Dialog] Action: Search searching word in 'Procedure Name' (Local terms: ${checkbox})`;
    this.props.searchProcedureList({
      params: {
        localTerm: this.state.procedureLocalTermChecked ? 'Y' : 'N',
        diagnosisTypeCd: PROCEDURE_SEARCH_LIST_TYPE,
        diagnosisText: e
      },
      callback: (data) => {
        this.setState({
          termDisplayList: data
        });
      }
    });
    insertProcedureLog && insertProcedureLog(name, '/diagnosis/codeList/codeDxpxTerm/');
  };

  handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.shiftKey === false) {
      event.preventDefault();
    }
  };

  handleEscKeyDown = () => {
    this.handleDialogClose();
  };

  changeCheckBoxVal = (index, event) => {
    if (event !== undefined) {
      let currentList = this.state.currentList;
      let resultList = [];
      currentList[index].displayKey = event;
      if (currentList[index].templateId !== 0) currentList[index].operationType = ACTION_TYPE.UPDATE;
      resultList = currentList;
      this.setState({
        // isEdit:true,
        currentList: resultList
      });
    }
  };

  changeInputVal = (index, event) => {
    if (event !== undefined) {
      let currentList = this.state.currentList;
      let resultList = [];
      currentList[index].remarks = event;
      if (currentList[index].templateId !== 0) currentList[index].operationType = ACTION_TYPE.UPDATE;
      resultList = currentList;
      this.setState({
        // isEdit:true,
        currentList: resultList
      });
    }
  };

  handleProcedureLocalTermChange = () => {
    this.setState({
      procedureLocalTermChecked: !this.state.procedureLocalTermChecked
    });
  };

  render() {
    const { classes, open } = this.props;
    let { procedureLocalTermChecked, localTermDisabled, nameErrorFlag, groupName, groupNameNullFlag } = this.state;
    return (
      <EditTemplateDialog
          // dialogContentProps={{ style: { minWidth: 1000} }}
          dialogTitle="Procedure Template Group Maintenance"
          open={open}
          handleEscKeyDown={this.handleEscKeyDown}
      >
        <Typography component="div" className={classes.rootWrapper}>
          <ValidatorForm id="bookingCalendarForm" onKeyDown={(e) => this.handleKeyDown(e)} onSubmit={this.recordListSave} ref="form">
            <Grid alignItems="center" container style={{ marginTop: 10 }}>
              <label className={classes.left_Label}>
                {en_US.templateAdmin.label_group_name}
                <span style={{ color: 'red' }}>*</span>:
              </label>
              <Grid item xs={8}>
                <TextField
                    id={'groupNameTextFiled'}
                    variant="outlined"
                    className={classes.textField}
                    inputProps={{ maxLength: 1000, 'aria-label': 'bare' }}
                    onChange={this.groupNameOnchange}
                    error={nameErrorFlag ? true : groupName.trim() === '' && groupNameNullFlag ? true : false}
                    autoComplete="off"
                    value={groupName}
                    InputProps={{
                      classes: { input: classes.input }
                    }}
                />
                {groupName.trim() === '' && groupNameNullFlag ? (
                  <span id="groupNameTextFiled_helperText" className={classes.validation_span}>
                    This field is required.
                  </span>
                ) : null}
                {nameErrorFlag ? <span className={classes.validation_span}>{this.state.nameValidation}</span> : null}
              </Grid>
            </Grid>

            <Typography component="div" style={{ marginTop: 0, marginBottom: -15 }}>
              <Button onClick={this.handleClickAdd} id="btn_editProcedureTemplate_add" style={{ textTransform: 'none' }}>
                <AddCircle color="primary" />
                <span className={classes.font_color}>Add</span>
              </Button>

              <Button onClick={this.handleClickOpen} id="btn_editProcedureTemplate_delete" style={{ textTransform: 'none' }}>
                <RemoveCircle color="primary" />
                <span className={classes.font_color}>Delete</span>
              </Button>

              <Button onClick={this.handleClickUp} id="btn_editProcedureTemplate_up" style={{ textTransform: 'none' }}>
                <ArrowUpwardOutlined color="primary" />
                <span className={classes.font_color}>Up</span>
              </Button>

              <Button onClick={this.handleClickDown} id="btn_editProcedureTemplate_down" style={{ textTransform: 'none' }}>
                <ArrowDownward color="primary" />
                <span className={classes.font_color}>Down</span>
              </Button>
            </Typography>

            <Paper className={classes.paperTable}>
              <Table id="procedure_template_dialog">
                <TableHead>
                  <TableRow className={classes.table_head}>
                    <TableCell className={classes.table_header} padding={'none'} style={{ width: '5%' }}>
                      Seq
                    </TableCell>
                    <TableCell className={classes.table_header} padding={'none'} style={{ width: '10%' }}>
                      <Grid container style={{ minWidth: 420 }}>
                        <Grid container item xs={8}>
                          <label className={classes.label}>Procedure&nbsp;Name</label>
                        </Grid>
                        <Grid container item xs={4}>
                          <label className={classes.label}>Local terms</label>
                          <div className={classes.floatLeft}>
                            <Checkbox
                                classes={{
                                  root: classes.localTermCheckbox
                                }}
                                disabled={localTermDisabled}
                                color="primary"
                                id="procedure_local_term"
                                checked={procedureLocalTermChecked}
                                onChange={(event) => {
                                  this.handleProcedureLocalTermChange(event);
                                }}
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
                    <TableCell className={classes.table_header} padding={'none'} style={{ paddingLeft: 10, width: '12%' }}>
                      Updated&nbsp;By
                    </TableCell>
                    <TableCell
                        className={classes.table_header}
                        // padding={'none'}
                        style={{ width: '15%', paddingBottom: 0 }}
                    >
                      Updated&nbsp;On
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.currentList.map((item, index) => (
                    <TableRow
                        className={item.displaySeq === this.state.sequence ? classes.table_row_selected : classes.table_row}
                        key={index}
                        onClick={this.getSelectTemplate.bind(this, item, index)}
                        style={{ display: item.operationType === ACTION_TYPE.DELETE ? 'none' : 'table-row' }}
                    >
                      <TableCell className={classes.table_cell} padding={'none'} style={{ width: '5%' }}>
                        <Typography
                            component="div"
                            className={classes.fontLabel}
                            style={
                              (item.diagnosisName.trim() === '' ||
                                item.diagnosisDisplayName.trim() === '' ||
                                ((item.remarks === null || item.remarks.trim() === '') &&
                                  (this.state.currentList[index].displayKey === 1 || this.state.currentList[index].displayKey === 2)) ||
                                item.displayKey === 3) &&
                              !this.state.saveFlag
                                ? { height: 40 }
                                : null
                            }
                        >
                          {item.displaySeq}
                        </Typography>
                      </TableCell>
                      <TableCell className={classes.table_cell} padding={'none'} style={{ width: '5%' }}>
                        <Typography
                            component="div"
                            style={
                              (item.diagnosisName.trim() === '' ||
                                item.diagnosisDisplayName.trim() === '' ||
                                ((item.remarks === null || item.remarks.trim() === '') &&
                                  (this.state.currentList[index].displayKey === 1 || this.state.currentList[index].displayKey === 2)) ||
                                item.displayKey === 3) &&
                              !this.state.saveFlag
                                ? {}
                                : null
                            }
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
                              <span className={classes.validation} id="span_editProcedureTemplate_procedureName_validation">
                                This field is required.
                              </span>
                            </Typography>
                          ) : null}
                        </Typography>
                      </TableCell>

                      <TableCell className={classes.table_cell} padding={'none'} style={{ width: '24%' }}>
                        <Typography
                            component="div"
                            style={
                              (item.diagnosisName.trim() === '' ||
                                item.diagnosisDisplayName.trim() === '' ||
                                ((item.remarks === null || item.remarks.trim() === '') &&
                                  (this.state.currentList[index].displayKey === 1 || this.state.currentList[index].displayKey === 2)) ||
                                item.displayKey === 3) &&
                              !this.state.saveFlag
                                ? {}
                                : null
                            }
                        >
                          <EditTemplateText
                              dataList={null}
                              displayField={['termDisplayName']}
                              id={item.displaySeq}
                              limitValue={3}
                              onChange={this.handleSearch.bind(this)}
                              onSelectItem={this.handleDiagnosisDisplayName.bind(this, index)}
                              searchInputvalue={item.diagnosisDisplayName === undefined ? '' : item.diagnosisDisplayName}
                          />
                          {item.diagnosisDisplayName.trim() === '' && !this.state.saveFlag ? (
                            <Typography component="div" style={{ paddingLeft: 8 }}>
                              <span className={classes.validation} id="span_editProceduerTemplate_displayName_validation">
                                This field is required.
                              </span>
                            </Typography>
                          ) : null}
                        </Typography>
                      </TableCell>
                      <TableCell className={classes.table_cell} padding={'none'} style={{ width: '24%' }}>
                        <Typography
                            component="div"
                            style={
                              (item.diagnosisName.trim() === '' ||
                                item.diagnosisDisplayName.trim() === '' ||
                                ((item.remarks === null || item.remarks.trim() === '') &&
                                  (this.state.currentList[index].displayKey === 1 || this.state.currentList[index].displayKey === 2)) ||
                                item.displayKey === 3) &&
                              !this.state.saveFlag
                                ? {}
                                : null
                            }
                        >
                          <EditTemplateText
                              dataList={null}
                              displayField={['remarks']}
                              id={'remarks_' + item.displaySeq + '_'}
                              limitValue={3}
                              // onChange={this.changeCheckBoxVal.bind(this,index)}
                              onSelectItem={this.changeInputVal.bind(this, index)}
                              searchInputvalue={item.remarks === undefined || item.remarks === null ? '' : item.remarks}
                          />
                          {(item.remarks === null || item.remarks.trim() === '') &&
                          (this.state.currentList[index].displayKey === 1 || this.state.currentList[index].displayKey === 2) &&
                          !this.state.saveFlag ? (
                            <Typography component="div" style={{ paddingLeft: 8 }}>
                              <span className={classes.validation} id="span_editProceduerTemplate_displayName_validation">
                                This field is required.
                              </span>
                            </Typography>
                          ) : null}
                        </Typography>
                      </TableCell>

                      <TableCell className={classes.cell_text} style={{ width: '10%', paddingRight: 5 }}>
                        <Typography
                            component="div"
                            style={
                              (item.diagnosisName.trim() === '' ||
                                item.diagnosisDisplayName.trim() === '' ||
                                ((item.remarks === null || item.remarks.trim() === '') &&
                                  (this.state.currentList[index].displayKey === 1 || this.state.currentList[index].displayKey === 2)) ||
                                item.displayKey === 3) &&
                              !this.state.saveFlag
                                ? {}
                                : null
                            }
                        >
                          <SelectAndCheckBox onChange={this.changeCheckBoxVal.bind(this, index)} defaultValue={item.displayKey} />
                          {item.displayKey === 3 && !this.state.saveFlag ? (
                            <Typography component="div" style={{ paddingLeft: 8 }}>
                              <span className={classes.validation} id="span_editProceduerTemplate_displayName_validation">
                                This field is required.
                              </span>
                            </Typography>
                          ) : null}
                        </Typography>
                      </TableCell>

                      <TableCell className={classes.cell_text} style={{ width: '10%' }}>
                        <Typography
                            component="div"
                            className={classes.fontLabel}
                            style={
                              (item.diagnosisName.trim() === '' ||
                                item.diagnosisDisplayName.trim() === '' ||
                                ((item.remarks === null || item.remarks.trim() === '') &&
                                  (this.state.currentList[index].displayKey === 1 || this.state.currentList[index].displayKey === 2)) ||
                                item.displayKey === 3) &&
                              !this.state.saveFlag
                                ? {}
                                : null
                            }
                        >
                          {item.updateByName}
                        </Typography>
                      </TableCell>
                      <TableCell className={classes.table_cell_1} style={{ paddingLeft: 10, width: '10%' }}>
                        <Typography
                            component="div"
                            className={classes.fontLabel}
                            style={
                              (item.diagnosisName.trim() === '' ||
                                item.diagnosisDisplayName.trim() === '' ||
                                ((item.remarks === null || item.remarks.trim() === '') &&
                                  (this.state.currentList[index].displayKey === 1 || this.state.currentList[index].displayKey === 2)) ||
                                item.displayKey === 3) &&
                              !this.state.saveFlag
                                ? {}
                                : null
                            }
                        >
                          {item.updateDtm ? moment(item.updateDtm).format('DD-MMM-YYYY') : null}
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
                  id="span_editProcedureTemplate_validation"
              >At least one template.</span></Typography>
            ):null} */}
            <Typography component="div">
              <Grid alignItems="center" container justify="flex-end">
                <Typography component="div">
                  <CIMSButton
                      color="primary"
                      id="btn_procedure_template_save"
                      //   onClick={() =>this.recordListSave()}
                      size="small"
                      type="submit"
                  >
                    Save
                  </CIMSButton>
                </Typography>
                <CIMSButton
                    color="primary"
                    id="btn_procedure_template_reset"
                    onClick={() => this.handleDialogClose()}
                    // onClick={() =>this.handleClose()}
                    size="small"
                >
                  Cancel
                </CIMSButton>
              </Grid>
            </Typography>
          </ValidatorForm>
        </Typography>
      </EditTemplateDialog>
    );
  }
}

function mapStateToProps(state) {
  return {
    deleteList: state.manageClinicalNoteTemplate.deleteList,
    recordList: state.manageClinicalNoteTemplate.recordList
  };
}

const mapDispatchToProps = {
  saveEditTemplateList,
  openCommonMessage,
  closeCommonMessage,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  searchProcedureList
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(EditProcedureTemplate));
