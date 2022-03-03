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
    CardContent
  } from '@material-ui/core';
import en_US from '../../../locales/en_US';
import { withStyles } from '@material-ui/core/styles';
import { AddCircle } from '@material-ui/icons';
import { RemoveCircle } from '@material-ui/icons';
import { Edit } from '@material-ui/icons';
import { ArrowUpwardOutlined } from '@material-ui/icons';
import { ArrowDownward } from '@material-ui/icons';
import moment from 'moment';
import * as manageTagaNoteTemplateActionType from '../../../store/actions/tagaNoteTemplate/manageTagaNoteTemplateActionType';
import * as messageTypes from '../../../store/actions/message/messageActionType';
import 'react-quill/dist/quill.snow.css';
import CustomizedSelectFieldValidator from '../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import EditTagaNoteTemplate from './editTagaNoteTemplate';
import { style } from './manageTagaNoteTemplateCss';
import { MANAGE_TEMPLATE_CODE } from '../../../constants/message/manageTemplateCode';
import * as commonTypes from '../../../store/actions/common/commonActionType';
import { TAGA_NOTE_TEMPLATE_TYPE, ACTION_TYPE } from '../../../constants/clinicalNote/tagaNoteConstants';
import { COMMON_STYLE }from '../../../constants/commonStyleConstant';
import classNames from 'classnames';
import Container from 'components/JContainer';
import * as type from '../../../store/actions/mainFrame/mainFrameActionType';
import {COMMON_CODE} from '../../../constants/message/common/commonCode';
import accessRightEnum from '../../../enums/accessRightEnum';
import * as messageType from '../../../store/actions/message/messageActionType';
import Enum from '../../../../src/enums/enum';
import * as commonConstants from '../../../constants/common/commonConstants';
import * as commonUtils from '../../../utilities/josCommonUtilties';
import _ from 'lodash';

class manageTagaNoteTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectRowObj: null,
            displaySequence: null,
            open: false,
            codeTaganoteTmplTypeCd: TAGA_NOTE_TEMPLATE_TYPE.MY_FAVOURITE,
            isEdit: false,
            templateList: [],
            selectObj: {
                templateName: '',
                templateText: '',
                taganoteType: 'A'
            },
            emptySelectObj: {
                templateName: '',
                templateText: '',
                taganoteType: 'A'
            },
            upDownClick: false,
            editTemplateList: [],
            pageNum: null,
            deleteList: [],
            tableRows: [
                { name: 'displaySequence', width: 42, label: 'Seq' },
                { name: 'serviceCd', width: 'auto', label: 'Service' },
                { name: 'templateName', width: 'auto', label: 'Name' },
                { name: 'templateText', width: 'auto', label: 'Text' },
                { name: 'updatedByName', width: 180, label: 'Updated By' },
                {
                    name: 'updatedDtm', label: 'Updated On', width: 140, customBodyRender: (value) => {
                        return value ? moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
                    }
                }
            ],
            tableOptions: {
                rowHover: true,
                rowsPerPage: 5,
                onSelectIdName: 'displaySequence',
                tipsListName: 'diagnosisTemplates',
                tipsDisplayListName: null,
                tipsDisplayName: 'diagnosisDisplayName',
                onSelectedRow: (rowId, rowData, selectedData) => {
                    this.selectTableItem(selectedData);
                },
                bodyCellStyle: this.props.classes.customRowStyle,
                headRowStyle: this.props.classes.headRowStyle,
                headCellStyle: this.props.classes.headCellStyle
            },
            action: '',
            refreshDialogKey: 0,
            taganoteTypeList: [],
            taganoteTypeMap: {}
        };
    }
    componentDidMount() {
        const { dispatch } = this.props;
        this.props.ensureDidMount();
        dispatch({type:type.UPDATE_CURRENT_TAB,name:accessRightEnum.tagaNoteTemplateMaintenance,doCloseFunc:this.doClose});
        this.initData();
        this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} Encounter Independent Note Template Maintenance`, 'clinical-note/codeList/codeTaganoteTemplateType');
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
                            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Encounter Independent Note Template Maintenance');
                            this.insertClinicalNoteTemplateLog(name, `clinical-note/taganoteTemplate/${this.state.codeTaganoteTmplTypeCd}`);
                            setInterval(callback(true), 1000);
                        }, btn2Click: () => {
                            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Encounter Independent Note Template Maintenance');
                            this.insertClinicalNoteTemplateLog(name, '');
                            callback(true);
                        }, btn3Click: () => {
                            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'Encounter Independent Note Template Maintenance');
                            this.insertClinicalNoteTemplateLog(name, '');
                        }
                    }, params: [
                        {
                            name: 'title',
                            value: 'Encounter Independent Note Template Maintenance'
                        }
                    ]
                }
            });
        }
        else {
            this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close Encounter Independent Note Template Maintenance`, 'clinical-note/taganoteTemplate');
            callback(true);
        }
    }

    initData = () => {
        let codeTaganoteTmplTypeCd = this.state.codeTaganoteTmplTypeCd;
        if (JSON.parse(sessionStorage.getItem('loginInfo')).admin_login) {
            codeTaganoteTmplTypeCd = TAGA_NOTE_TEMPLATE_TYPE.SERVICE_FAVOURITE;
        }
        const params = {};
        const dispatch = this.props.dispatch;
        dispatch({ type: manageTagaNoteTemplateActionType.REQUEST_DATA, params });
        params.tagaNoteTmplType = codeTaganoteTmplTypeCd;
        dispatch({
            type: manageTagaNoteTemplateActionType.TEMPLATE_DATA, params, callback: (templateList) => {
                this.setState({
                    codeTaganoteTmplTypeCd: codeTaganoteTmplTypeCd,
                    templateList
                });
            }
        });
        dispatch({
            type: manageTagaNoteTemplateActionType.FETCH_TAGANOTE_TYPE_LIST,
            params,
            callback: (taganoteTypeList) => {
                taganoteTypeList = taganoteTypeList ? taganoteTypeList : [];
                let simpleList = taganoteTypeList.map(item => ({
                    label: item.typeDesc,
                    value: item.codeTaganoteTypeCd
                }));
                // 增加一个All选项
                let typeList =  [{ label: 'All', value: 'A' }, ...simpleList];
                let typeMap = {};
                typeList.forEach(item => {
                    typeMap[item.value] = item.label;
                });
                this.setState({
                    taganoteTypeList: typeList,
                    taganoteTypeMap: typeMap
                });
            }
        });
    };
    mapEINtype = (taganoteType) => {
        return this.state.taganoteTypeMap[taganoteType];
    }
    handleClickDeleteValidate = () => {
        let params = this.state.selectRowObj;
        if (params) {
            if (!this.state.upDownClick) {
                let payload = {
                    msgCode: MANAGE_TEMPLATE_CODE.IS_DELETE_MANAGE_TAGANOTE_TEMPLATE,
                    btnActions: {
                        // Yes
                        btn1Click: () => {
                            this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Delete' button (Template ID: ${params.taganoteTemplateId}; Template name: ${params.templateName})`, 'clinical-note/taganoteTemplate');
                            this.handleClickDelete();
                        },
                        btn2Click: () => { this.handleClose(); }
                    }
                };
                this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
            } else {
                this.checkUpDown();
            }
        } else {
            let payload = { msgCode: MANAGE_TEMPLATE_CODE.IS_SELECTED_TAGANOTE_DELETE };
            this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
            this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Delete' button (No record is selected; Template ID: null; Template name: null)`, '');
        }
    };
    handleClose = () => {
        this.setState({ open: false });
        this.props.dispatch({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
    }
    handleDialogClose = () => {
        this.handleClose();
        this.reloadList();
    }
    refreshPageData = () => {
        this.handleClose();
        this.reloadList();
    }
    insertClinicalNoteTemplateLog=(desc, apiName='', content=null) => {
        commonUtils.commonInsertLog(apiName, 'F125', 'Encounter Independent Note Template Maintenance', desc, 'clinical-note', content);
    };

    favoriteValueOnChange = (e) => {
        const { upDownClick, codeTaganoteTmplTypeCd } = this.state;
        const params = { tagaNoteTmplType: e.value };
        if (e.value === codeTaganoteTmplTypeCd) {
            return false;
        }
        if (upDownClick) {
            let payload = {
                msgCode: MANAGE_TEMPLATE_CODE.IS_CHANGE_CATEGORY,
                btnActions: {
                    // Yes
                    btn1Click: () => {
                        this.props.dispatch({ type: manageTagaNoteTemplateActionType.REQUEST_DATA, params });
                        this.props.dispatch({
                            type: manageTagaNoteTemplateActionType.TEMPLATE_DATA, params, callback: (templateList) => {
                                this.setState({
                                    templateList: templateList,
                                    isEdit: false,
                                    upDownClick: false,
                                    codeTaganoteTmplTypeCd: e.value,
                                    displaySequence:null,
                                    selectRowObj: null
                                });
                            }
                        });
                    }
                }
            };
            this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
        } else {
            this.props.dispatch({ type: manageTagaNoteTemplateActionType.REQUEST_DATA, params });
            this.props.dispatch({
                type: manageTagaNoteTemplateActionType.TEMPLATE_DATA, params, callback: (templateList) => {
                    this.setState({
                        templateList: templateList,
                        isEdit: false,
                        upDownClick: false,
                        codeTaganoteTmplTypeCd: e.value,
                        displaySequence:null,
                        selectRowObj: null
                    });
                }
            });
        }
        this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Select} favourite category: ${e.label} in drop-down list`,`clinical-note/taganoteTemplate/${e.value}`);

    }
    reloadList = () => {
        let { upDownClick } = this.state;
        if (upDownClick) {
            let payload = {
                msgCode: MANAGE_TEMPLATE_CODE.IS_CANCEL_CHANGE,
                btnActions: {
                    btn1Click: () => {
                        this.setState({
                            upDownClick: false,
                            displaySequence:null,
                            selectRowObj: null
                        });
                        const params = { tagaNoteTmplType:this.state.codeTaganoteTmplTypeCd };
                        this.props.dispatch({
                            type: manageTagaNoteTemplateActionType.TEMPLATE_DATA, params, callback: (templateList) => {
                                this.setState({
                                    open: false,
                                    templateList: templateList
                                });
                            }
                        });
                    }
                }
            };
            this.props.dispatch({
                type: messageTypes.OPEN_COMMON_MESSAGE,
                payload
            });
        } else {
            this.setState({
                upDownClick: false,
                displaySequence:null,
                selectRowObj: null
            });
            const params = { tagaNoteTmplType: this.state.codeTaganoteTmplTypeCd };
            this.props.dispatch({
                type: manageTagaNoteTemplateActionType.TEMPLATE_DATA, params, callback: (templateList) => {
                    this.setState({
                        open: false,
                        templateList: templateList
                    });
                }
            });
        }
    }
    getSelectTemplate = (e) => {
        this.setState({
            displaySequence:e.item.displaySequence,
            selectRowObj: e.item,
            selectObj: {
                templateName: e.item.templateName,
                templateText: e.item.templateText,
                taganoteType: e.item.taganoteType
            }
        });
    }
    recordListSave = (saveCallback) => {
        let params = this.state.templateList;
        !saveCallback && this.props.dispatch({ type: commonTypes.OPEN_COMMON_CIRCULAR_DIALOG });
        this.props.dispatch({
            type: manageTagaNoteTemplateActionType.RECORDLIST_DATA,
            params,
            callback: (data) => {
                if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                    let payload = {
                        msgCode: data.msgCode,
                        btnActions: {
                            btn1Click: () => {
                                this.setState({
                                    upDownClick: false,
                                    displaySequence:null,
                                    selectRowObj: null
                                });
                                this.props.dispatch({
                                    type: manageTagaNoteTemplateActionType.TEMPLATE_DATA,
                                    params: { tagaNoteTmplType:this.state.codeTaganoteTmplTypeCd },
                                    callback: (templateList) => {
                                        this.setState({
                                            templateList: templateList
                                        });
                                    }
                                });
                                this.props.dispatch({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG});
                            },
                            btn2Click: () => {
                                this.props.dispatch({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG});
                                if(typeof saveCallback != 'function' || saveCallback === undefined){
                                    this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`,`clinical-note/taganoteTemplate/${this.state.codeTaganoteTmplTypeCd}`);
                                    return false;
                                }else{
                                    saveCallback();
                                }
                            }
                        }
                    };
                    this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
                }else{
                    let params = { tagaNoteTmplType: this.state.codeTaganoteTmplTypeCd };
                    let payload = {
                        msgCode: data.msgCode,
                        showSnackbar: true,
                        btnActions: {
                            btn1Click: () => {
                                this.props.dispatch({
                                    type: manageTagaNoteTemplateActionType.TEMPLATE_DATA, params, callback: (templateList) => {
                                        this.props.dispatch({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG});
                                        this.setState({
                                            upDownClick: false,
                                            templateList: templateList,
                                            displaySequence:null,
                                            selectRowObj: null
                                        });
                                    }
                                });
                            }
                        }
                    };
                    this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
                    if(typeof saveCallback != 'function' || saveCallback === undefined){
                        this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`,`clinical-note/taganoteTemplate/${this.state.codeTaganoteTmplTypeCd}`);
                        return false;
                    }else{
                        saveCallback();
                    }
                }
            }
        });
    }
    handleClickDelete = () => {
        let selectRowObj = JSON.parse(JSON.stringify(this.state.selectRowObj));
        let params = JSON.parse(JSON.stringify(this.state.templateList));
        for (let index = 0; index < params.length; index++) {
            const element = params[index];
            if (element.taganoteTemplateId === selectRowObj.taganoteTemplateId) {
                params[index].deleteInd = 'Y';
            }
        }
        this.props.dispatch({ type: commonTypes.OPEN_COMMON_CIRCULAR_DIALOG });
        this.props.dispatch({
            type: manageTagaNoteTemplateActionType.DELETETEMPLATE_DATA,
            params,
            callback: (data) => {
                if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                    let payload = {
                        msgCode: data.msgCode,
                        btnActions: {
                            btn1Click: () => {
                                this.props.dispatch({ type: commonTypes.OPEN_COMMON_CIRCULAR_DIALOG});
                                this.setState({
                                    upDownClick: false,
                                    displaySequence:null,
                                    selectRowObj: null
                                });
                                this.props.dispatch({
                                    type: manageTagaNoteTemplateActionType.TEMPLATE_DATA,
                                    params: { tagaNoteTmplType:this.state.codeTaganoteTmplTypeCd },
                                    callback: (templateList) => {
                                        this.setState({ templateList: templateList });
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
                        msgCode: data.msgCode,
                        showSnackbar: true
                    };
                    this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
                }
            }
        });
    }
    checkUpDown = () => {
        let payload = {
            msgCode: MANAGE_TEMPLATE_CODE.IS_SAVE_COMFIRM
        };
        this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
    }
    checkSelect = (msgCode) => {
        let payload = {
            msgCode: msgCode,
            showSnackbar: false,
            btnActions: {
                btn1Click: () => {
                }
            }
        };
        this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
    }
    clickDownClick = () => {
        let rowObj = {};
        rowObj = this.state.selectRowObj;
        if (!rowObj) {
            let msgCode = MANAGE_TEMPLATE_CODE.IS_SELECTED_DOWN;
            this.checkSelect(msgCode);
            this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Down' button (No record is selected; Template ID: null; Template name: null)`, '');
        }
        let recordList = [];
        recordList = JSON.parse(JSON.stringify(this.state.templateList));
        if (rowObj && recordList[rowObj.displaySequence]) {
            recordList[rowObj.displaySequence].operationType = ACTION_TYPE.UPDATE;
            recordList[rowObj.displaySequence - 1].operationType = ACTION_TYPE.UPDATE;
            recordList[(rowObj.displaySequence - 1)].displaySequence = recordList[(rowObj.displaySequence - 1)].displaySequence + 1;
            recordList[rowObj.displaySequence].displaySequence = recordList[rowObj.displaySequence].displaySequence - 1;
            let tempa = [];
            tempa = recordList[rowObj.displaySequence - 1];
            recordList[rowObj.displaySequence - 1] = recordList[rowObj.displaySequence];
            recordList[rowObj.displaySequence] = tempa;
            this.setState({
                upDownClick: true,
                templateList: recordList,
                displaySequence: recordList[rowObj.displaySequence].displaySequence,
                selectRowObj: recordList[rowObj.displaySequence]
            });
            this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Down' button (Sequence Number: ${rowObj.displaySequence}; Template ID: ${rowObj.taganoteTemplateId}; Template name: ${rowObj.templateName})`, '');
        } else {
            return false;
        }
    }
    clickUpClick = () => {
        let rowObj = {};
        rowObj = this.state.selectRowObj;
        if (!rowObj) {
            let msgCode = MANAGE_TEMPLATE_CODE.IS_SELECTED_UP;
            this.checkSelect(msgCode);
            this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Up' button (No record is selected; Template ID: null; Template name: null)`, '');
        }
        let recordList = [];
        recordList = JSON.parse(JSON.stringify(this.state.templateList));
        if (rowObj && recordList[(rowObj.displaySequence - 2)]) {
            recordList[rowObj.displaySequence - 1].operationType = ACTION_TYPE.UPDATE;
            recordList[rowObj.displaySequence - 2].operationType = ACTION_TYPE.UPDATE;
            recordList[(rowObj.displaySequence - 1)].displaySequence = recordList[(rowObj.displaySequence - 1)].displaySequence - 1;
            recordList[rowObj.displaySequence - 2].displaySequence = recordList[rowObj.displaySequence - 2].displaySequence + 1;
            let tempa = [];
            tempa = recordList[rowObj.displaySequence - 2];
            recordList[rowObj.displaySequence - 2] = recordList[rowObj.displaySequence - 1];
            recordList[rowObj.displaySequence - 1] = tempa;
            this.setState({
                upDownClick: true,
                templateList: recordList,
                displaySequence: recordList[rowObj.displaySequence - 2].displaySequence,
                selectRowObj: recordList[rowObj.displaySequence - 2]
            });
            this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Up' button (Sequence Number: ${rowObj.displaySequence}; Template ID: ${rowObj.taganoteTemplateId}; Template name: ${rowObj.templateName})`, '');
        } else {
            return false;
        }
    }
    rerenderDialogComponent = () => {
        this.setState({
            refreshDialogKey: this.state.refreshDialogKey + 1
        });
    }
    handleClickAdd = () => {
        if (!this.state.upDownClick) {
            this.rerenderDialogComponent();
            this.setState({
                action: 'add',
                selectObj: Object.assign({}, this.state.emptySelectObj),
                open: true
            });
            this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Add' button`,'');
        } else {
            this.checkUpDown();
        }
    };
    handleClickEdit = () => {
        if (!this.state.upDownClick) {
            let params = this.state.selectRowObj;
            if (params == null) {
                let msgCode = MANAGE_TEMPLATE_CODE.IS_SELECTED_TAGANOTE_EDIT;
                this.checkSelect(msgCode);
                this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (No record is selected; Template ID: null; Template name: null)`, '');
                return;
            }
            this.rerenderDialogComponent();
            this.setState({
                open: true,
                action: 'update',
                selectObj: {
                    templateName: this.state.selectRowObj.templateName,
                    templateText: this.state.selectRowObj.templateText,
                    taganoteType: this.state.selectRowObj.taganoteType
                }
            });
            this.insertClinicalNoteTemplateLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (Template ID: ${params.taganoteTemplateId}; Template name: ${params.templateName})`,'');
        } else {
            this.checkUpDown();
        }
    };

    handleCancelLog = (name,apiName='') => {
        this.insertClinicalNoteTemplateLog(name,apiName);
    }

    //去掉前后空格
    trimInputValueBlank = (test) => {
        if(test!=''&&test!=undefined&&test!=null){
            return _.trimEnd(_.trimStart(test));
        }
    }

    render() {
        const { classes,commonMessageList } = this.props;
        let editTemplateProps = {
            commonMessageList,
            // refreshEditList: this.refreshEditList,
            // refreshList: this.refreshList,
            refreshPageData: this.refreshPageData,
            handleDialogClose: this.handleDialogClose,
            insertClinicalNoteTemplateLog:this.insertClinicalNoteTemplateLog
        };
        let disabled = this.state.upDownClick;
        const buttonBar = {
            isEdit: disabled,
            title:'Encounter Independent Note Template Maintenance',
            logSaveApi: `clinical-note/taganoteTemplate/${this.state.codeTaganoteTmplTypeCd}`,
            saveFuntion:this.recordListSave,
            handleCancelLog: this.handleCancelLog,
            position: 'fixed',
            buttons: [{
                title: 'Save',
                onClick: this.recordListSave,
                id: 'default_save_button'
            }]
        };
        let taganoteTypeList = this.state.taganoteTypeList;
        return (
            <Container className={classes.wrapper} buttonBar={buttonBar}  >
                <Card className={classes.cardContainer}>
                    <CardContent style={{ paddingTop: 0 }}>
                        <Typography
                            component="div"
                            className={classes.topDiv}
                        >
                            <Typography
                                component="div"
                                className={classes.label_div}
                            >
                                <label style={{ fontSize: '1.5rem', fontFamily: 'Arial' }}>Encounter Independent Note Template Maintenance</label>
                            </Typography>

                            <Typography
                                component="div"
                                style={{ padding: '5px 0px 15px' }}
                                className={classes.select_div}
                            >
                                <ValidatorForm
                                    id="manageTemplateForm"
                                    onSubmit={() => { }}
                                    ref="form"
                                >
                                    <Grid container style={{ marginTop: 10 }}>
                                        <label className={classes.left_Label}>{en_US.manageTemplate.label_favorite_category}</label>
                                        <Grid item
                                            style={{ padding: 0 }}
                                            xs={2}
                                        >
                                            <CustomizedSelectFieldValidator className={classes.favorite_category}
                                                id={'bookingEncounterTypeSelectField'}
                                                msgPosition="bottom"
                                                options={this.props.favoriteCategoryListData.map((item) => ({ value: item.codeTaganoteTmplTypeCd, label: item.templateTypeDesc }))}
                                                onChange={this.favoriteValueOnChange}
                                                value={this.state.codeTaganoteTmplTypeCd}
                                                width={'none'}
                                            />
                                        </Grid>
                                    </Grid>
                                </ValidatorForm>
                            </Typography>
                            <Typography
                                component="div"
                                className={classes.btn_div}
                            >
                                <Button id="template_btn_add" style={{ textTransform: 'none' }} onClick={this.handleClickAdd}>
                                    <AddCircle color="primary" />
                                    <span className={classes.font_color}>Add</span>
                                </Button>
                                <Button id="template_btn_edit" style={{ textTransform: 'none' }} onClick={this.handleClickEdit}>
                                    <Edit color="primary" />
                                    <span className={classes.font_color}>Edit</span>
                                </Button>
                                <Button id="template_btn_delete" style={{ textTransform: 'none' }} onClick={this.handleClickDeleteValidate}>
                                    <RemoveCircle color="primary" />
                                    <span className={classes.font_color}>Delete</span>
                                </Button>
                                <Button id="template_btn_up" style={{ textTransform: 'none' }} onClick={this.clickUpClick}>
                                    <ArrowUpwardOutlined color="primary" />
                                    <span className={classes.font_color}>Up</span>
                                </Button>
                                <Button id="template_btn_down" style={{ textTransform: 'none' }} onClick={this.clickDownClick} >
                                    <ArrowDownward color="primary" />
                                    <span className={classes.font_color}>Down</span>
                                </Button>
                                <EditTagaNoteTemplate style={{ height: 522 }} open={this.state.open}
                                    initData={this.initData}
                                    taganoteTypeList={taganoteTypeList}
                                    // 根据key的变化进行重现渲染
                                    key={this.state.refreshDialogKey}
                                    codeTaganoteTmplTypeCd={this.state.codeTaganoteTmplTypeCd}
                                    {...editTemplateProps} selectObj={this.state.selectObj}
                                    action={this.state.action}
                                    selectRowObj={this.state.selectRowObj} templateList={this.state.templateList}
                                />
                            </Typography>
                        </Typography>
                        <Typography
                            component="div" className={classes.tableDiv}
                        >
                            <Table id="manage_template_table" className={classes.table_itself}>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: COMMON_STYLE.TABLE_BGCKGROUNDCOLOR }} className={classes.table_head}>
                                        <TableCell
                                            style={{ width: '3%' }}
                                            className={classNames(classes.table_header, classes.tableCellBorder)}
                                            padding={'none'}
                                        >
                                            Seq
                                        </TableCell>
                                        <TableCell
                                            style={{ width: '5%' }}
                                            className={classNames(classes.table_header, classes.tableCellBorder)}
                                            padding={'none'}
                                        >
                                            Service
                                        </TableCell>
                                        <TableCell
                                            style={{ width: '10%', minWidth: '152px' }}
                                            className={classNames(classes.table_header, classes.tableCellBorder)}
                                            padding={'none'}
                                        >
                                            EIN Type
                                        </TableCell>
                                        <TableCell
                                            style={{ width: '27%' }}
                                            className={classNames(classes.table_header, classes.tableCellBorder)}
                                            padding={'none'}
                                        >
                                            Name
                                        </TableCell>
                                        <TableCell className={classNames(classes.table_header, classes.tableCellBorder)}
                                            style={{ width: '29%' }}
                                        >
                                            Text
                                        </TableCell>
                                        <TableCell className={classNames(classes.table_header, classes.tableCellBorder)}
                                            style={{ paddingLeft: 10, width: '6%' }}
                                            padding={'none'}
                                        >
                                            Updated&nbsp;By
                                        </TableCell>
                                        <TableCell className={classNames(classes.table_header, classes.tableCellBorder)}
                                            style={{ width: '6%' }}
                                        >
                                            Updated&nbsp;On
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.state.templateList.length > 0 ? this.state.templateList.map((item, index) => (
                                        <TableRow
                                            className={
                                                item.displaySequence === this.state.displaySequence ? classes.table_row_selected : classes.table_row
                                            }
                                            key={index}
                                            onClick={() => this.getSelectTemplate({ item })}
                                        >
                                            <TableCell style={{ width: '3%' }} padding={'none'} className={classNames(classes.table_cell, classes.tableCellBorder)}>
                                                {(item.displaySequence)}
                                            </TableCell>
                                            <TableCell padding={'none'}
                                                style={{ width: '5%' }}
                                                className={classNames(classes.table_cell, classes.tableCellBorder)}
                                            >
                                                {(item.serviceCd)}
                                            </TableCell>
                                            <TableCell padding={'none'}
                                                style={{ width: '10%', minWidth: '152px' }}
                                                className={classNames(classes.table_cell, classes.tableCellBorder)}
                                            >
                                                {(this.mapEINtype(item.taganoteType))}
                                            </TableCell>
                                            <TableCell padding={'none'}
                                                style={{ width: '26%' }}
                                                className={classNames(classes.table_cell, classes.tableCellBorder)}
                                            >
                                                {this.trimInputValueBlank(item.templateName)}
                                            </TableCell>
                                            <TableCell padding={'none'}
                                                className={classNames(classes.cell_text, classes.tableCellBorder)}
                                                style={{ padding: '4px 10px 4px 10px', width: '28%' }}
                                            >
                                                {this.trimInputValueBlank(item.templateText)}
                                            </TableCell>
                                            <TableCell
                                                className={classNames(classes.cell_text, classes.tableCellBorder)}
                                                style={{ paddingLeft: 10, width: '6%', wordBreak: 'normal' }}
                                            >
                                                {item.updatedByName}
                                            </TableCell>
                                            <TableCell
                                                className={classNames(classes.table_cell_1, classes.tableCellBorder)}
                                                style={{ paddingLeft: 10, width: '6%' }}
                                            >
                                                {moment(item.updateDtm).format(Enum.DATE_FORMAT_EDMY_VALUE)}
                                            </TableCell>
                                        </TableRow>
                                    )) :
                                        <TableRow >
                                            <TableCell classes={{ root: classes.tbNoData }} className={classes.tbNoData} align="center" colSpan={7}>There is no data.</TableCell>
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
        favoriteCategoryListData: state.manageTagaNoteTemplate.favoriteCategoryListData,
        deleteList: state.manageTagaNoteTemplate.deleteList,
        recordList: state.manageTagaNoteTemplate.recordList,
        commonMessageList:state.message.commonMessageList
    };
}
export default connect(mapStateToProps)(withStyles(style)(manageTagaNoteTemplate));
