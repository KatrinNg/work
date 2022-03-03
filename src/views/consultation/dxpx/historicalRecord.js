import React, { Component } from 'react';
import { styles } from './historicalRecordCss';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    FormControl,
    Select,
    MenuItem,
    TextField,
    Avatar,
    IconButton,
    Checkbox,
    InputLabel,
    Tooltip,
    MuiThemeProvider,
    createMuiTheme,
    Button
} from '@material-ui/core';
import moment from 'moment';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import {
    openCommonMessage,
    closeCommonMessage
} from '../../../store/actions/message/messageAction';
import { connect } from 'react-redux';
import {
    openCommonCircularDialog,
    closeCommonCircularDialog
} from '../../../store/actions/common/commonAction';

import { MTableAction,MTableBodyRow } from 'material-table';
import {
    PROCEDURE_MODE,
    PROCEDURE_SEARCH_PROBLEM,
    PROCEDURE_SEARCH_LIST_TYPE,
    DEFAULT_PROCEDURE_SAVE_STATUS
} from '../../../constants/procedure/procedureConstants';
import FuzzySearchBox from '../../../components/Search/FuzzySearchBox';
import {
    PROBLEM_SEARCH_PROBLEM,
    PROBLEM_MODE,
    PROBLEM_SEARCH_LIST_TYPE,
    DEFAULT_PROBLEM_SAVE_STATUS,
    CHRONIC_SAVE_IND_TYPE,
    TABLE_CONTENT_TYPE,
    DIAGNOSIS_STATUS_ORDER,
    PROCEDURE_STATUS_ORDER,
    DIAGNOSIS_TYPE_CD
} from '../../../constants/diagnosis/diagnosisConstants';
import { find, isUndefined, toInteger, findIndex ,cloneDeep,isEmpty} from 'lodash';
import ServiceFavouriteDialog from '../dxpx/serviceFavourite/ServiceFavouriteDialog';
import {
    getInputProcedureList,
    getProcedureCodeDiagnosisStatusList,
    updatePatientProcedure,
    deletePatientProcedure,
    queryProcedureList,
    requestProcedureTemplateList
} from '../../../store/actions/consultation/dxpx/procedure/procedureAction';
import {
    getALLDxPxList,
    getProblemCodeDiagnosisStatusList,
    updatePatientProblem,
    deletePatientProblem,
    listCodeDiagnosisTypes,
    getHistoricalRecords,
    queryProblemList,
    requestProblemTemplateList,
    savePatient,
    getChronicProblemList,
    getCodeLocalTerm,
    addPsoriasis,
    getCurrentDate
} from '../../../store/actions/consultation/dxpx/diagnosis/diagnosisAction';
import {
    COMMON_ACTION_TYPE,
    COMMON_SYS_CONFIG_KEY,
    DEFAULT_OFFLINE_PAGE_SIZE,
    COMMON_CHECKBOX_TYPE
} from '../../../constants/common/commonConstants';
import {axios} from '../../../services/axiosInstance';
import { COMMON_CODE } from '../../../constants/message/common/commonCode';
import { Clear, Check, DeleteOutline, EditRounded,NavigateNext,NavigateBefore, TrainRounded } from '@material-ui/icons';
import { COMMON_STYLE } from '../../../constants/commonStyleConstant';
import Enum from '../../../enums/enum';
import { PROCEDURE_CODE } from '../../../constants/message/procedureCode';
import accessRightEnum from '../../../enums/accessRightEnum';
import { updateCurTab,deleteSubTabs } from '../../../store/actions/mainFrame/mainFrameAction';
import SelectComponent from '../../../components/JSelect';
import { BottomNavigation,BottomNavigationAction,ButtonGroup } from '@material-ui/core';
import {DeleteOutlined,SaveOutlined,FileCopyOutlined,ArrowBackIos,ArrowForwardIos} from '@material-ui/icons';
import Container from 'components/JContainer';
import _ from 'lodash';
import JTable from '../../../components/JTable';
import * as dxpxUtils from './utils/dxpxUtils';
import theme from '../../../components/JContainer/theme';
import * as commonConstants from '../../../constants/common/commonConstants';
import * as commonUtils from '../../../utilities/josCommonUtilties';
import doCloseFuncSrc from '../../../constants/doCloseFuncSrc';
import TextArea from './components/RecordDetails/TextArea';
import JCheck from './components/RecordDetails/JCheck';
import {getState} from '../../../store/util';
import * as commonActionType from '../../../store/actions/common/commonActionType';
import { refreshPatient } from '../../../store/actions/patient/patientAction';

const { color, font } = getState(state => state.cimsStyle) || {};

const List=({data,wrapperContentHeight,onSelectionChange,components,selectedHistoricalRecord})=>{
    let arr = [];
    arr.push(selectedHistoricalRecord);
    const columns = [
        {
            title: 'Encounter Date', field: 'encounterDate', headerStyle: { textAlign: 'center', padding: '8px 4px' }, cellStyle: { padding: 4 }, render: record => {
                return <Grid container style={{ minWidth: 100 }}>
                    <span>
                        &nbsp;
                        {moment(
                            record.encounterDate
                        ).format(
                            'DD-MMM-YYYY'
                        )}
                    </span>
                </Grid>;
            }
        },
        {
            title: 'Problem/Procedure', field: 'diagnosisText', headerStyle: { textAlign: 'left' }, cellStyle: { padding: 4, minWidth: 180, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }, render: record => {
                return record.diagnosisText;
            }
        },
        {
            title: 'Status', field: 'diagnosisStatusCd', headerStyle: { paddingRight: 8, padding: '8px 4px' }, cellStyle: { textAlign: 'center', width: 84, padding: '8px 4px' }, render: record => {
                if (record.chronicProblemId != null && record.chronicProblemId != '') {
                    return <Grid container >
                        <Avatar
                            style={{
                                fontSize: '13px',
                                fontFamily: font.fontFamily,
                                textAlign: 'center',
                                width: '20px',
                                height: '20px',
                                color: 'rgb(180,65,62)',
                                backgroundColor: 'rgb(254,178,179)',
                                marginRight: 2
                            }}
                        >
                            C
                        </Avatar>
                        <Avatar
                            style={{
                                fontSize: '13px',
                                fontFamily: font.fontFamily,
                                textAlign: 'center',
                                width: '20px',
                                height: '20px',
                                color: record.recordType === 'PX' ? '#F8D186' : COMMON_STYLE.whiteTitle.color,
                                backgroundColor: record.recordType === 'PX' ? '#F8D186' : '#38d1ff',
                                marginRight: 2
                            }}
                        >
                            {record.recordType === 'PX' ? 'Px' : 'Dx'}
                        </Avatar>
                        <Tooltip title={record.diagnosisStatusDesc}>
                            <span style={{ marginLeft: 5 }}>{record.diagnosisStatusCd}</span>
                        </Tooltip>
                    </Grid>;
                } else {
                    return <Grid container style={{ paddingLeft: 20 }} >
                        <Avatar
                            style={{
                                fontSize: '13px',
                                fontFamily: font.fontFamily,
                                textAlign: 'center',
                                width: '20px',
                                height: '20px',
                                color: COMMON_STYLE.whiteTitle.color,
                                backgroundColor: record.recordType === 'PX' ? '#F8D186' : '#38d1ff',
                                marginRight: 2
                            }}
                        >
                            {record.recordType === 'PX' ? 'Px' : 'Dx'}
                        </Avatar>
                        <Tooltip title={record.diagnosisStatusDesc}>
                            <span style={{ marginLeft: 5 }}>{record.diagnosisStatusCd}</span>
                        </Tooltip>
                    </Grid>;
                }
            }
        }
    ];
    let dropdownElmHeight = 0;
    if (document.getElementById('historyForm')) {
        dropdownElmHeight = document.getElementById('historyForm').clientHeight;
    }

    const options={
        maxBodyHeight:wrapperContentHeight-dropdownElmHeight||'undefined',
        draggable: false,
        headerStyle:{ color: COMMON_STYLE.whiteTitle,backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,fontWeight:600,fontSize:font.fontSize,fontFamily:font.fontFamily}
    };
    return (
      <JTable id="dxpx_history_table" components={components} columns={columns} data={data} options={options} onSelectionChange={onSelectionChange} selected={arr} size="small"/>
    );
  };

const Boxer=({title,height,children,contentRef,showDxPxHistory,onButtonClick})=>{
  return (
    <div style={{width:'100%',height:height||'auto'}}>
      <Grid direction="row" container   justify="space-between">
        <div style={{lineHeight:'32px',padding:'0 12px'}}>{title}</div>
        {
        showDxPxHistory?<IconButton onClick={onButtonClick}  style={{padding:'0px 7px 0px 0px'}}> <NavigateBefore /> </IconButton>:null
        }
      </Grid>
      <div ref={contentRef} style={{border: '1px solid rgba(0,0,0,0.5)',backgroundColor: color.cimsBackgroundColor ,height:'calc(100% - 38px)',overflow:'hidden'}}>{children}</div>
    </div>
  );
};

const Box=React.forwardRef((props,ref)=>{
    return <Boxer {...props} contentRef={ref}/>;
});

class HistoricalRecord extends Component {
    constructor(props) {
        super(props);
        this.boxContent=React.createRef();
        this.historyContent=React.createRef();
        this.dragTargetContentType = '';
        this.problemMaterialTableRef = React.createRef();
        this.procedureMaterialTableRef = React.createRef();
        this.chronicMaterialTableRef = React.createRef();
        this.detailsRef = React.createRef();
        this.newRef = React.createRef();
        let desc = commonUtils.getCurrentEncounterDesc();

        let { loginInfo } = props;
        let { problemEnquiryMode, procedureEnquiryMode } = dxpxUtils.checkProblemProcedurePrivileges(loginInfo.accessRights);

        this.state = {
            problemEnquiryMode,
            procedureEnquiryMode,
            encounterDesc:desc,
            service: null,
            clinic: null,
            serviceList: [],
            clinicList: [],
            recordType: '',
            medicalListData: [],
            diagnosisId: '', //judge current select item should be highlight
            isShowRecordDetailText: 'none',
            isShowRecordDetailDiv: 'none',
            noteContent: '',
            isShow: 'none',
            selectedHistoricalRecord: {},
            dragHistoricalRecord: {},
            statusList: [],
            problemStatusList: [],
            problemStatusCdList: [],
            procedureStatusList: [],
            problemDataList: [],
            problemOriginDataList: [],
            problemDeleteDataList: [],
            procedureDataList: [],
            procedureDeleteDataList: [],
            recordTypeListData: [],
            chronicProblemDataList:[],
            chronicOriginDataList:[],
            chronicProblemDeletedDataList:[],
            isNew: null, // diagnosis histroy detail
            status: '',
            statusValue: '',
            matchNum: 0,
            searchProblemRecordList: [],
            historicalRecordProcedureScrollFlag: false,
            historicalRecordProblemScrollFlag: false,
            problemEditFlag: false,
            procedureEditFlag: false,
            procedureColumns: [
                {
                    title: 'Procedure',
                    field: 'procedureText',
                    editable: 'never',
                    headerStyle: {
                        zIndex: '1',
                        width: '31%'
                    },
                    cellStyle: {
                        fontSize: font.fontSize,
                        wordBreak:'break-word',
                        whiteSpace: 'pre-wrap'
                    }
                },
                {
                    title: 'Status',
                    field: 'diagnosisStatusCd',
                    lookup: {},
                    headerStyle: {
                        zIndex: '1',
                        width: '10%',
                        minWidth: 90
                    },
                    cellStyle: {
                        fontSize: font.fontSize,
                        width: '10%'
                    }
                },
                {
                    title: 'Details',
                    field: 'remarks',
                    headerStyle: {
                        zIndex: '1',
                        width: '61%'
                    },
                    cellStyle: {
                        fontSize: font.fontSize
                    },
                    render: rowData => {
                        return (
                            <div
                                style={{
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 6,
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'pre-line'
                                }}
                                title={rowData.remarks}
                            >
                                {rowData.remarks}
                            </div>
                        );
                    },editComponent: props => {
                       let originChange = props.onChange;
                        return(
                            <TextField
                                style={{
                                    width: '92%',
                                    fontSize: font.fontSize,
                                    fontFamily: font.fontFamily
                                }}
                                multiline
                                rowsMax={6}
                                autoCapitalize="off"
                                value={props.value||''}
                                onChange={(e)=>{this.handleTextChange(e,originChange);}}
                            />
                        );
					}
                }
            ],
            problemColumns: [
                {
                    title: 'Problem',
                    field: 'diagnosisText',
                    editable: 'never',
                    headerStyle: {
                        zIndex: '1',
                        width:'24%'
                    },
                    cellStyle: {
                        fontSize: font.fontSize,
                        height: 46,
                        wordBreak:'break-word',
                        whiteSpace: 'pre-wrap'
                    }
                },
                {
                    title: 'Status',
                    field: 'diagnosisStatusCd',
                    lookup: {},
                    headerStyle: {
                        zIndex: '1',
                        width:'10%'
                    },
                    cellStyle: {
                        color: color.cimsTextColor,
                        fontSize: font.fontSize,
                        height: 46,
                        width:'10%'
                    }
                },
                {
                    title: 'Details',
                    field: 'remarks',
                    headerStyle: {
                        zIndex: '1',
                        width:'54%'
                    },
                    cellStyle: {
                        fontSize: font.fontSize,
                        color: color.cimsTextColor,
                        height: 46
                    },
                    render: rowData => {
                        return (
                            <div
                                style={{
                                    fontSize: font.fontSize,
                                    fontFamily: font.fontFamily,
                                    color: color.cimsTextColor,
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 6,
                                    textOverflow: 'ellipsis',
                                    wordBreak:'break-word',
                                    whiteSpace: 'pre-line'
                                }}
                                title={rowData.remarks}
                                placeholder={' '}
                            >
                                {rowData.remarks}
                            </div>
                        );
                    },editComponent: props => {
                        return(
                            <TextField
                                style={{
                                    color: color.cimsTextColor,
                                    backgroundColor: color.cimsBackgroundColor,
                                    fontSize: font.fontSize,
                                    fontFamily: font.fontFamily,
                                    width:'100%'
                                }}
                                multiline
                                rowsMax={6}
                                autoCapitalize="off"
                                value={props.value||''}
                                onChange={(e)=>{this.handleTextChange(e,props.onChange);}}
                            />
                        );
					}
                },{
                    title: 'New',
                    field: 'isNew',
                    headerStyle: {
                        zIndex: '1'
                    },
                    cellStyle: {
                        fontSize: font.fontSize,
                        height: 46
                    },
                    render: rowData => {
                        return(
                            <Checkbox
                                color="primary"
                                checked={!!rowData.isNew}
                                disabled
                            />
                        );
                    },
                    editComponent: props => {
                        let originChange = props.onChange;
                        return(
                            <Checkbox
                                color="primary"
                                checked={!!props.value}
                                onChange={(e)=>{this.handleIsNewChange(e,originChange);}}
                            />
                        );
                    }
                }
            ],
            chronicProblemColumns:[
                {
                    title:'Creation Date',
                    field:'createDtm',
                    editable: 'never',
                    headerStyle: {
                        minWidth: 105,
                        width:'9%'
                    },
                    cellStyle: {
                        height: 46,
                        width:'9%'
                    },
                    render: rowData => {
                        return (
                            <div
                                style={{
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 3,
                                    textOverflow: 'ellipsis',
                                    wordBreak:'break-word',
                                    whiteSpace: 'pre-line'
                                }}
                            >
                                {!!rowData.createDtm?moment(rowData.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE):''}
                            </div>
                        );
                    }
                },
                {
                    title: 'Problem',
                    field: 'problemText',
                    editable: 'never',
                    cellStyle: {
                        height: 46,
                        width:'32%',
                        wordBreak:'break-word',
                        whiteSpace: 'pre-wrap'
                    },
                    headerStyle: {
                        width:'32%'
                    }
                },
                {
                    title: 'Status',
                    field: 'status',
                    lookup: {},
                    cellStyle: {
                        height: 46,
                        width:'9%'
                    },
                    headerStyle: {
                        width:'9%'
                    }
                },
                {
                    title: 'Details',
                    field: 'remarks',
                    cellStyle: {
                        height: 46,
                        fontSize: font.fontSize,
                        fontFamily: font.fontFamily,
                        width:'42%'
                    },
                    render: rowData => {
                        return (
                            <div
                                style={{
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 6,
                                    textOverflow: 'ellipsis',
                                    wordBreak:'break-word',
                                    whiteSpace: 'pre-line'
                                }}
                                title={rowData.remarks}
                                placeholder={' '}
                            >
                                {rowData.remarks}
                            </div>
                        );
                    },editComponent: props => {
                        return(
                            <TextField
                                style={{
                                    fontSize: font.fontSize,
                                    fontFamily: font.fontFamily,
                                    wordBreak:'break-word',
                                    width:'100%'
                                }}
                                multiline
                                rowsMax={6}
                                autoCapitalize="off"
                                value={props.value||''}
                                onChange={(e)=>{this.handleTextChange(e,props.onChange);}}
                            />
                        );
					}
                }
            ],
            problemDialogOpenFlag: false,
            procedureDialogOpenFlag: false,
            historicalRecordList: [],
            remarks: '',
            searchProblemRecordTotalNums: 0,
            searchProcedureRecordList: [],
            searchProcedureRecordTotalNums: 0,
            isShowBtnProble: true,
            isShowBtnProcedure: true,
            leftEditFlag:false,
            rightEditFlag:false,
            height:0,
            diagnosisSelectionData:[],
            chronicProblemSelectionData:[],
            problemLocalTermChecked:true,
            procedureLocalTermChecked:true,
            problemLocalTermDisabled: false,
            procedureLocalTermDisabled: false,
            readMode:false,
            readOnlyRecordDetail:false,
            showDxPxHistory:true,
            initialProblem: {},
            initialProcedure: {},
            initialChronic: {},
            isCpDiagnosis:false,
            diagnosisText:'',
            iscallBack: true,
            refreshKey: Math.random(),
            psoMess: {
                privilege: false,
                label: 'PSO',
                type: 0
            }
        };
    }

    componentWillMount(){
        this.resetHeight();
        window.addEventListener('resize',this.resetHeight);
    }

    //init data
    componentDidMount() {
        this.props.ensureDidMount();
        const { loginInfo, encounterData } = this.props;
        // const { serviceList, clinicList } = common;
        const problemEditDom = document.getElementById('btn_diagnosis_row_edit');
        if(problemEditDom){
            problemEditDom.addEventListener('click',this.handleProblemEditClick);
        }
        let owneClinic = commonUtils.getOwnClinic();
        this.initServiceListAndClinicList('/diagnosis/diagnosisMedicalRecord');
        this.props.openCommonCircularDialog();
        this.setState({
            selectedEncounterVal: encounterData.encounterId,
            selectedPatientKey: encounterData.patientKey,
            recordType: '1'
        });
        // this.loadHistoricalRecords({
        //     patientKey: encounterData.patientKey,
        //     serviceCd: loginInfo.service.serviceCd,
        //     clinicCd: owneClinic?owneClinic:loginInfo.clinic.clinicCd,
        //     recordType: '1'
        // });
        this.loadData({
            patientKey: encounterData.patientKey,
            encounterId: encounterData.encounterId
        },false);

        //get record type status
        this.props.listCodeDiagnosisTypes({ params: {} });

        //get problem status
        this.props.getProblemCodeDiagnosisStatusList({
            params: { diagnosisTypeCd: 1 },
            callback: data => {
                if (data.length > 0) {
                    let mapObj = new Map();
                    for (let i = 0; i < data.length; i++) {
                        mapObj.set(
                            data[i].diagnosisStatusCd,
                            data[i].diagnosisStatusDesc
                        );
                    }
                    let problemColumns = this.state.problemColumns;
                    let { chronicProblemColumns } = this.state;
                    problemColumns[1].lookup = this.strMapToObj(mapObj);
                    chronicProblemColumns[2].lookup = this.strMapToObj(mapObj);
                    this.setState({
                        chronicProblemColumns,
                        problemColumns: problemColumns,
                        problemStatusList: data,
                        problemStatusCdList: data.map(item => item.diagnosisStatusCd)
                    });
                }
            }
        });

        if (loginInfo?.service?.serviceCd === 'SHS') {
            this.updatePsoriasisStatus();
        }

        //get procedure status
        this.props.getProcedureCodeDiagnosisStatusList({
            params: { diagnosisTypeCd: 2 },
            callback: data => {
                if (data.length > 0) {
                    let mapObj = new Map();
                    for (let i = 0; i < data.length; i++) {
                        mapObj.set(
                            data[i].diagnosisStatusCd,
                            data[i].diagnosisStatusDesc
                        );
                    }
                    let procedureColumns = this.state.procedureColumns;
                    procedureColumns[1].lookup = this.strMapToObj(mapObj);
                    this.setState({
                        procedureColumns: procedureColumns,
                        procedureStatusList: data
                    });

                }
              setTimeout(() => {
                this.props.closeCommonCircularDialog();
              }, 1000);
            }
        });

        this.props.updateCurTab(accessRightEnum.dxpxHistoricalRecord, this.doClose);
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Open+' Problem/Procedure','');
        this.getLocalTermStatus(loginInfo.service.serviceCd);
    }

    componentDidUpdate(prevProps) {
        this.resetHistoryHeight();
        if (this.state.historicalRecordProcedureScrollFlag) {
            this.scrollToBottom('historicalRecordProcedureDiv');
        }
        if (this.state.historicalRecordProblemScrollFlag) {
            this.scrollToBottom('historicalRecordProblemDiv');
        }
        if (this.props.loginInfo?.service?.serviceCd === 'SHS') {
            const prevPsoInfo = prevProps.psoInfo;
            if (this.props.psoInfo) {
                if (
                    !prevPsoInfo ||
                    prevPsoInfo.withPsoriasis !== this.props.psoInfo.withPsoriasis ||
                    prevPsoInfo.withPASI !== this.props.psoInfo.withPASI ||
                    prevPsoInfo.dueDateOfLastPASI !== this.props.psoInfo.dueDateOfLastPASI
                ) {
                    this.updatePsoriasisStatus();
                    this.handleRefreshData();
                }
            }
        }
    }

    componentWillUnmount(){
        window.removeEventListener('resize',this.resetHeight);
    }

    customTheme = (theme) => createMuiTheme({
        ...theme,
        overrides: {
            MuiMenu: {
                paper: {
                    backgroundColor: color.cimsBackgroundColor
                }
            },
          MuiCheckbox:{
            root:{
              margin:0,
              padding:'5px 14px'
            }
          },
          MuiInputBase:{
            root: {
                '&$disabled': {
                    backgroundColor: color.cimsDisableColor
                }
            },
            input:{
              height:'39px',
              padding:'0px 14px'
            }
          },
          MuiButton:{
            containedPrimary:{
                color: '#0579c8',
                border: 'solid 1px #0579C8',
                boxShadow: '2px 2px 2px #6e6e6e',
                backgroundColor: '#ffffff',
                // backgroundColor: color.cimsBackgroundColor,
                '&:hover': {
                    color: color.cimsBackgroundColor,
                    border: 'solid 1px #0579C8',
                    backgroundColor:'#0579c8'
                }
            },
            root:{
                minWidth:64
            },
            sizeSmall:{
                fontSize:font.fontSize
            }
          }
        }
      });

      initServiceListAndClinicList = (apiFunctionName) =>{
        const { dispatch, patientInfo, loginInfo }=this.props;
        let { patientKey } = patientInfo;
        let params = {
          apiFunctionName:apiFunctionName,
          patientKey : patientKey
        };
        dispatch({
          type:commonActionType.GET_COMMON_SERVICED_LIST,
          params,
          callback : (data) => {
            const currentServiceCd = this.state.service ? this.state.service : loginInfo.service.serviceCd; // first load的时候为空/flase
            let serviceList = commonUtils.getServiceListByServiceCdList(data);
            let serviceCdIsExist = _.find(serviceList,{ 'value': currentServiceCd });
            let clinicOptions = commonUtils.getClinicListByServiceCd(currentServiceCd);
            // let owneClinic = commonUtils.getOwnClinic();
            this.serviceValueOnChange(serviceList.length == 1 || !serviceCdIsExist ? 'ALL' : currentServiceCd, false);
            this.setState({
                clinicList: clinicOptions,
                serviceList
                // service: serviceList.length == 1 ? 'ALL' : loginInfo.service.serviceCd,
                // clinic: serviceList.length == 1 || !serviceCdIsExist ? 'ALL' : (owneClinic ? owneClinic : loginInfo.clinic.clinicCd)
            });
          }
        });
      }

    resetHeight=_.debounce(()=>{
        if(this.boxContent.current&&this.boxContent.current.clientHeight&&this.boxContent.current.clientHeight!==this.state.height){
          this.setState({
            height:this.boxContent.current.clientHeight-127
          });
        }
        this.resetHistoryHeight();
    },1000);

    resetHistoryHeight = () => {
        if (this.historyContent.current&&this.historyContent.current.clientHeight&&this.historyContent.current.clientHeight!==this.state.historyHeight) {
            this.setState({
                historyHeight:this.historyContent.current.clientHeight
            });
        }
    }

    doClose = (callback, doCloseParams) => {
        let editFlag = this.editStatusCheck();
        switch (doCloseParams.src) {
            case doCloseFuncSrc.CLOSE_BY_LOGOUT:
            case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
                if (editFlag) {
                    this.props.openCommonMessage({
                        msgCode: COMMON_CODE.SAVE_WARING,
                        params: [{ name: 'title', value: 'Problem/Procedure' }],
                        btn1AutoClose: false,
                        btnActions: {
                            btn1Click: () => {
                                this.handleClickCancleSave(callback);
                                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Problem/Procedure');
                                this.insertDxpxLog(name, '/diagnosis/diagnosisMedicalRecord/diagnosisAndProcedure');
                            }, btn2Click: () => {
                                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Problem/Procedure');
                                this.insertDxpxLog(name, '');
                                callback(true);
                            }, btn3Click: () => {
                                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'Problem/Procedure');
                                this.insertDxpxLog(name, '');
                            }
                        }
                    });
                } else {
                    this.insertDxpxLog(`${commonConstants.INSERT_LOG_ACTION.Action}: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close Problem/Procedure`, '');
                    callback(true);
                }
                break;
            case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
                editFlag ? this.handleClickCancleSaveInfo(callback, false) : callback(true);
                break;
        }
    }

    handleIsNewChange = (e,originChange) => {
        let typeName = e.target.checked ? 'Select New checkbox:true' : 'UnSelect New checkbox:false';
        this.insertDxpxLog(typeName, '');
        originChange(e.target.checked);
    }

    handleTextChange = (e,originChange) => {
        // let typeName =  `Update record details to ${e.target.value}`;
        // this.insertDxpxLog(typeName, '');
        originChange(e.target.value);
    }


    handleIsShowHistory = () => {
        let {showDxPxHistory}=this.state;
        if(showDxPxHistory){
            this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Search+' \'<\' to hide the history list','');
        }else{
            this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Search+' \'>\' to expand the history list','');
        }
        this.setState({
            showDxPxHistory:!showDxPxHistory
        });
    }

    //map change to obj
    strMapToObj = strMap => {
        let obj = Object.create(null);
        for (let [k, v] of strMap) {
            obj[k] = v;
        }
        return obj;
    };

    loadData = (obj,flag) => {
        let params = obj;
        this.props.getALLDxPxList({
            params,
            callback: data => {
                let {diagnosis=[],procedure=[],chronicProblem=[]}=data.data;
                diagnosis.forEach(element => {
                    element.rowId=element.codeTermId+Math.random()*100;
                    element.isEdit = false;
                    element.isNewFlag = false;
                });
                for (const key in procedure) {
                     procedure[key].isEdit = false;
                     procedure[key].isNewFlag = false;
                }
                chronicProblem.forEach(element => {
                                element.rowId=element.codeTermId+Math.random()*100;
                                element.isEdit = false;
                                element.isNewFlag = false;
                            });
                this.chronicNewDataList = _.cloneDeep(chronicProblem);
                this.procedureNewDataList = _.cloneDeep(procedure);
                this.problemNewDataList = _.cloneDeep(diagnosis);
                this.setState({
                    problemDataList: diagnosis ,
                    problemOriginDataList:diagnosis,
                    procedureDataList: procedure,
                    chronicProblemDataList: chronicProblem,
                    chronicOriginDataList:chronicProblem
                    });
                if(flag){
                    setTimeout(() => {
                        this.props.closeCommonCircularDialog();
                    },300);
                }
            }
        });
    }

    loadHistoricalRecords = (obj,flag,clickSaveFlag) => {
        let params = obj;
        if(!clickSaveFlag){
            this.props.getHistoricalRecords({
                params,
                callback: data => {
                    //update select data.
                    let selectedHistoricalRecord = this.state.selectedHistoricalRecord;
                    for (let index = 0; index < data.length; index++) {
                        if (
                            (data[index].recordType === 'DX'||data[index].recordType === 'PX') &&
                            data[index].diagnosisId ===
                                selectedHistoricalRecord.diagnosisId
                        ) {
                            selectedHistoricalRecord = data[index];
                            this.setState({
                                selectedHistoricalRecord:flag?selectedHistoricalRecord:{},
                                statusValue:
                                    selectedHistoricalRecord.diagnosisStatusDesc,
                                status: selectedHistoricalRecord.diagnosisStatusCd,
                                remarks:
                                    selectedHistoricalRecord.remarks === null
                                        ? ''
                                        : selectedHistoricalRecord.remarks,
                                diagnosisText: selectedHistoricalRecord.diagnosisText === null
                                ? ''
                                : selectedHistoricalRecord.diagnosisText,
                                isNew : selectedHistoricalRecord.isNew === null
                                ? ''
                                : selectedHistoricalRecord.isNew
                            });
                        }
                    }
                    this.setState({
                        historicalRecordList: data
                    });
                }
            });
        }else{
            this.initServiceListAndClinicList('/diagnosis/diagnosisMedicalRecord');
        }
    };

    serviceValueOnChange = (e, refreshFlag = true) => {
        let service = e;
        const { loginInfo,encounterData } = this.props;
        // let clinicOption = this.clinicListChangeByServiceCd(service);
        let clinicOptions = commonUtils.getClinicListByServiceCd(service);
        let ownerClinic = commonUtils.getOwnClinic();
        let clinicResult = !refreshFlag && this.state.clinic ? this.state.clinic :(loginInfo.service.serviceCd === service ? (ownerClinic ? ownerClinic : loginInfo.clinic.clinicCd) : clinicOptions[0].value);
        this.loadHistoricalRecords({
            patientKey: encounterData.patientKey,
            serviceCd: service,
            clinicCd: clinicResult,
            recordType: this.state.recordType
        },false);
        let anchorElement = document.getElementById('dxpx_history_table');
        let tableDivElement = anchorElement && anchorElement.getElementsByTagName('div');
        if (tableDivElement) {
        tableDivElement[3].scrollTop = 0;
        }
        this.setState({
            service: service,
            //clinic: clinicOption.length > 0 ? clinicResult: '',
            clinic: clinicResult,
            clinicList:clinicOptions,
            isShowRecordDetailText: 'none',
            isShowRecordDetailDiv: 'none',
            diagnosisId: '',
            historicalRecord:{}
        });
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Search+` service: ${service} in drop-down list`,'');
    };
    clinicListChangeByServiceCd = serviceCdValue => {
        const { common } = this.props;
        const { clinicList } = common;
        let defaultOption = [{ value: 'ALL', title: 'ALL' }];
        let clinicOption = clinicList.filter(item => {
            return item.serviceCd === serviceCdValue;
        });
        clinicOption = clinicOption.map(item => {
            if (item.serviceCd === serviceCdValue) {
                return { value: item.clinicCd, title: item.clinicCd };
            }
        });
        return defaultOption.concat(clinicOption);
    }

    clinicValueOnChange = e => {
        let clinic = e;
        const { encounterData } = this.props;
        this.loadHistoricalRecords({
            patientKey: encounterData.patientKey,
            serviceCd: this.state.service,
            clinicCd: clinic,
            recordType: this.state.recordType
        });
        let anchorElement = document.getElementById('dxpx_history_table');
        let tableDivElement = anchorElement && anchorElement.getElementsByTagName('div');
        if (tableDivElement) {
            tableDivElement[3].scrollTop = 0;
        }
        this.setState({
            clinic: clinic,
            isShowRecordDetailText: 'none',
            isShowRecordDetailDiv: 'none',
            diagnosisId: ''
        });
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Search+` clinic: ${clinic} in drop-down list;`,'');
    }

    recordTypeValueOnChange = e => {
        let recordType = e;
        let { encounterData } = this.props;
        let tempObj = encounterData;
        if (!isUndefined(tempObj)) {
            //get Historical Record List
            this.loadHistoricalRecords({
                patientKey: tempObj.patientKey,
                serviceCd: this.state.service,
                clinicCd: this.state.clinic,
                recordType: recordType
            });
        }
        this.setState({
            recordType: recordType,
            isShowRecordDetailText: 'none',
            isShowRecordDetailDiv: 'none',
            diagnosisId: ''
        });
        let anchorElement = document.getElementById('dxpx_history_table');
        let tableDivElement = anchorElement && anchorElement.getElementsByTagName('div');
         if (tableDivElement) {
            tableDivElement[3].scrollTop = 0;
         }
         this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Search+` record type: ${recordType} in drop-down list`,'');
    };

    changeMedicalRecord = record => {
        let medicalRecord=record[0]||{};
        let {readOnlyRecordDetail}=false;
        let {encounterData,loginInfo}=this.props;
        let { service, clinic } = loginInfo;
        let cpFlag=false;
        if(medicalRecord.serviceCd!==undefined){
            if (medicalRecord.serviceCd === this.state.service) {
                //show edit button
                if (medicalRecord.recordType === 'DX') {
                    if(medicalRecord.chronicProblemId!=null&&medicalRecord.chronicProblemId!=''&&medicalRecord.chronicProblemId!=undefined){
                        cpFlag=true;
                    }
                    this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Select+` a record in history list (Record Type: Problem; Record ID: ${medicalRecord.diagnosisId}; Problem: ${medicalRecord.diagnosisText})`,'');
                    this.setState({
                        statusList: this.state.problemStatusList,
                        status: medicalRecord.diagnosisStatusCd,
                        statusValue: medicalRecord.diagnosisStatusDesc,
                        isNew: medicalRecord.isNew,
                        remarks:
                            medicalRecord.remarks === null
                                ? ''
                                : medicalRecord.remarks,
                        diagnosisText: medicalRecord.diagnosisText === null
                        ? '': medicalRecord.diagnosisText,
                        isShowRecordDetailDiv: 'block',
                        isShowRecordDetailText: 'block',
                        isShow: 'block',
                        isCpDiagnosis:cpFlag
                    });
                } else if (medicalRecord.recordType === 'PX') {
                    this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Select+` a record in history list (Record Type: Procedure; Record ID: ${medicalRecord.diagnosisId}; Procedure: ${medicalRecord.diagnosisText})`,'');
                    this.setState({
                        statusList: this.state.procedureStatusList,
                        status: medicalRecord.diagnosisStatusCd,
                        statusValue: medicalRecord.diagnosisStatusDesc,
                        remarks:
                            medicalRecord.remarks === null
                                ? ''
                                : medicalRecord.remarks,
                         diagnosisText: medicalRecord.diagnosisText === null
                        ? '': medicalRecord.diagnosisText,
                        isShowRecordDetailDiv: 'block',
                        isShowRecordDetailText: 'block',
                        isShow: 'block'
                    });
                }
            } else {
                //hide edit button
                if (medicalRecord.recordType === 'DX') {
                    if(medicalRecord.chronicProblemId!=null&&medicalRecord.chronicProblemId!=''&&medicalRecord.chronicProblemId!=undefined){
                        cpFlag=true;
                    }
                    this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Select+` a record in history list (Record Type: Problem; Record ID: ${medicalRecord.diagnosisId}; Problem: ${medicalRecord.diagnosisText})`,'');
                    this.setState({
                        statusList: this.state.problemStatusList,
                        status: medicalRecord.diagnosisStatusCd,
                        statusValue: medicalRecord.diagnosisStatusDesc,
                        remarks:
                            medicalRecord.remarks === null
                                ? ''
                                : medicalRecord.remarks,
                                diagnosisText: medicalRecord.diagnosisText === null
                                ? '': medicalRecord.diagnosisText,
                        isShowRecordDetailDiv: 'block',
                        isShowRecordDetailText: 'none',
                        isShow: 'none',
                        isNew: medicalRecord.isNew,
                        isCpDiagnosis:cpFlag
                    });
                } else if (medicalRecord.recordType === 'PX') {
                    this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Select+` a record in history list (Record Type: Procedure; Record ID: ${medicalRecord.diagnosisId}; Procedure: ${medicalRecord.diagnosisText})`,'');
                    this.setState({
                        statusList: this.state.procedureStatusList,
                        status: medicalRecord.diagnosisStatusCd,
                        statusValue: medicalRecord.diagnosisStatusDesc,
                        remarks:
                            medicalRecord.remarks === null
                                ? ''
                                : medicalRecord.remarks,
                                diagnosisText: medicalRecord.diagnosisText === null
                                ? '': medicalRecord.diagnosisText,
                        isShowRecordDetailDiv: 'block',
                        isShowRecordDetailText: 'none',
                        isShow: 'none'
                    });
                }
            }
            medicalRecord.remarks =medicalRecord.remarks === null ? '' : medicalRecord.remarks;
            readOnlyRecordDetail=medicalRecord.encounterId===encounterData.encounterId?true:false;
            // judgment read mode
            let readMode = medicalRecord.serviceCd === service.serviceCd && medicalRecord.clinicCd === clinic.clinicCd?false:true;

            this.setState({
                diagnosisId: medicalRecord.diagnosisId,
                selectedHistoricalRecord: medicalRecord,
                leftEditFlag:false,
                readOnlyRecordDetail:readOnlyRecordDetail,
                readMode,
                isShow:readOnlyRecordDetail?'none':'blcok',
                isCpDiagnosis:cpFlag,
                refreshKey: Math.random()
            });
        }
        else{
            this.setState({
                isShowRecordDetailText: 'none',
                isShowRecordDetailDiv: 'none',
                isShow: 'none',
                selectedHistoricalRecord: medicalRecord,
                leftEditFlag: false,
                diagnosisId: '',
                isCpDiagnosis:cpFlag,
                refreshKey: Math.random()
            });
        }
    };

    hideRecordDetailSave = () => {
        if (!this.state.blurFlag) {
            this.setState({
                isShow: 'none'
            });
        }
    };

    changeRecordDetail = e => {
        this.setState({
            remarks: e.target.value,
            leftEditFlag:true
        });
    };

    editRecordDetail = () => {
        if (this.state.clinicalnoteId !== '') {
            this.setState({
                isShow: 'block'
            });
        }
    };

    blurMiss = () => {
        this.setState({
            blurFlag: false
        });
    };

    blurShow = () => {
        this.setState({
            blurFlag: true
        });
    };

    dragMedicalRecord = (event,medicalRecord) => {
        // event.dataTransfer.setData('text/plain',JSON.stringify(medicalRecord));
        event.dataTransfer.setData('text/plain',JSON.stringify(medicalRecord));
        this.dragTargetContentType = 'L'+medicalRecord.recordType;
        // this.setState({
        //     dragHistoricalRecord: medicalRecord,
        //     remarks: medicalRecord.remarks === null ? '' : medicalRecord.remarks
        // });
    };

    dragMedicalRecordEnd = event => {
        this.setState({
            dragHistoricalRecord: {}
            // remarks: medicalRecord.remarks === null ? '' : medicalRecord.remarks
        });
    }

    updateChildState = obj => {
        this.setState({
            ...obj
        });
    };

    handleChange = e => {
        this.setState({
            status: e.target.value,
            leftEditFlag:true
        });
    };

    handleDiagnosisHistoryDetailChange = event => {
        let typeName=event.target.checked?'Select New checkbox in Record Details':'UnSelect New checkbox in Record Details';
        this.setState({
            isNew: event.target.checked?COMMON_CHECKBOX_TYPE.CHECKED:COMMON_CHECKBOX_TYPE.UNCHECKED,
            leftEditFlag:true
        });
        this.insertDxpxLog(typeName,'');
    }

    handleDiagnosisName = event => {
        if (event !== undefined) {
            let currentList = this.state.currentList;
            let resultList = [];
            let obj = {};
            if (event.name !== undefined) {
                obj = { name: event.name };
            } else {
                obj = { name: event };
            }
            currentList.push(obj);
            resultList = currentList;
            this.setState({ currentList: resultList });
        }
    };

    handleProblemServiceFavouriteDialogClose = () => {
        this.setState({
            problemDialogOpenFlag: false
        });
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+' \'Service Favourite\' button in Problem' ,'');
    };

    handleProblemServiceFavouriteDialogOpen = () => {
        let cancelDiagnosisBtnNode = document.getElementById('btn_diagnosis_row_cancel');
        if (!!cancelDiagnosisBtnNode) {
            let saveBtnNode = document.getElementById(
                'btn_diagnosis_row_save'
            );
            if (saveBtnNode) {
                saveBtnNode.click();
            }
            this.props.requestProblemTemplateList({});
            this.setState({
                problemDialogOpenFlag: true
            });
            this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ' Service Favourite button in Problem', '/diagnosis/diagnosisTemplateGroup/');
        } else {
            this.props.requestProblemTemplateList({});
            this.setState({
                problemDialogOpenFlag: true
            });
            this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ' Service Favourite button in Problem', '/diagnosis/diagnosisTemplateGroup/');
        }
    };

    updatePatientProblem = obj => {
        let { encounterData } = this.props;
        this.setState({
            historicalRecordProcedureScrollFlag: false,
            historicalRecordProblemScrollFlag: false
        });
        let tempObj = encounterData;
        if (!isUndefined(tempObj)) {
            this.props.openCommonCircularDialog();
            let params = {
                patientKey: tempObj.patientKey,
                encounterId: tempObj.encounterId,
                dtos: obj
            };
            this.props.updatePatientProblem({
                params,
                callback: data => {
                    let payload = {
                        msgCode: data.msgCode,
                        showSnackbar: true
                    };
                    this.props.openCommonMessage(payload);
                    this.loadHistoricalRecords({
                        patientKey: tempObj.patientKey,
                        serviceCd: this.state.service,
                        clinicCd: this.state.clinic,
                        recordType: this.state.recordType
                    });
                    this.props.closeCommonCircularDialog();
                     this.tableScrollToTop('dxpx_diagnosis_table');
                }
            });
        }
    };

    // reorder by status
    reorder=(dataList,orderList)=>{
      const sortBy = orderList;//problemStatusList
      const customSort = ({ data, sortBy, sortField }) => {
        const sortByObject = sortBy.reduce(
          (obj, item, index) => ({
            ...obj,
            [item]: index
          }),
          {}
        );
        return data.sort(
          (a, b) => sortByObject[a[sortField]] - sortByObject[b[sortField]]
        );
      };
      const tasksWithDefault = dataList.map(item => ({
        ...item,
        sortStatus: sortBy.includes(item.diagnosisStatusCd?item.diagnosisStatusCd:item.status) ?(item.diagnosisStatusCd?item.diagnosisStatusCd:item.status) : ''
      }));
      return customSort({data: tasksWithDefault,sortBy: [...sortBy, 'other'],sortField: 'sortStatus'});//new data Lst sort by status
    }
    //update problem table record
    updateProblemObj = (newData, oldData,id) => {
        const { problemStatusCdList } = this.state;
        let editFlag=document.getElementById(id);
        if(!!!editFlag){
            // this.props.openCommonCircularDialog();
            let problemDataList = this.state.problemDataList;
            const index = problemDataList.indexOf(oldData);

            let copyProblemDataList=JSON.parse(JSON.stringify(problemDataList));
            copyProblemDataList[index] = newData;

            if (
                newData.operationType === undefined ||
                (newData.operationType !== undefined &&
                    newData.operationType !== 'I')
            ) {
                newData.operationType = 'U';
                 //order by update time desc
                copyProblemDataList.splice(index,1);
                copyProblemDataList.unshift(newData);
            }

            if ( newData.operationType == 'I') {
                //order by update time desc when operationType =='I'
                copyProblemDataList.splice(index,1);
                copyProblemDataList.unshift(newData);
            }

            copyProblemDataList = this.reorder(copyProblemDataList, problemStatusCdList);

            this.setState({
                problemDataList: copyProblemDataList,
                problemOriginDataList:copyProblemDataList,
                historicalRecordProcedureScrollFlag: false,
                historicalRecordProblemScrollFlag: false,
                problemEditFlag: true
            });
            this.insertDxpxLog(commonConstants.INSERT_LOG_STATUS.Click+` 'Edit' button in Problem list (Problem ID: ${newData.problemOriginDataList}; Problem: ${newData.problemText})`,'');
            //this.props.closeCommonCircularDialog();
        }
    };

    deleteProblemObj = (obj,id) => {
        let editFlag=document.getElementById(id);
        if(obj.operationType==='I'){
            this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+ ` 'Delete' button in Problem list (New record is selected; Problem ID: null; Problem: ${obj.diagnosisText})`,'');
        }else{
            this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+ ` 'Delete' button in Problem list(Problem ID: ${obj.diagnosisId}; Problem: ${obj.diagnosisText})`,'');
        }
        if(!!!editFlag){
                this.props.openCommonMessage({
                    msgCode: PROCEDURE_CODE.DELETE_CONFIRM,
                    btnActions: {
                    btn1Click: () => {
                        let problemDataList = JSON.parse(JSON.stringify(this.state.problemDataList));
                        let problemDeleteDataList = JSON.parse(JSON.stringify(this.state.problemDeleteDataList));
                        const index = this.state.problemDataList.indexOf(obj);
                        problemDataList.splice(index, 1);
                        if (
                            obj.operationType === undefined ||
                            (obj.operationType !== undefined && obj.operationType !== 'I')
                        ) {
                            obj.operationType = 'D';
                            problemDeleteDataList.push(obj);
                            this.setState({ problemDeleteDataList: problemDeleteDataList });
                        }
                        if(problemDataList.length===0){
                            this.setState({ diagnosisSelectionData: [], rightEditFlag: false });
                        }
                        this.setState({
                            problemDataList: problemDataList,
                            problemOriginDataList:problemDataList,
                            historicalRecordProcedureScrollFlag: false,
                            historicalRecordProblemScrollFlag: false,
                            problemEditFlag: problemDeleteDataList.length > 0 ? true : false,
                            diagnosisSelectionData:[]
                        });
                    }
                    },
                    params: [
                        {
                            name: 'record',
                            value: 'problem'
                        }
                    ]
                  });
            }
    };

    //procedure method
    handleProcedureServiceFavouriteDialogClose = () => {
        this.setState({
            procedureDialogOpenFlag: false
        });
    };

    handleProcedureServiceFavouriteDialogOpen = () => {
        let cancelProcedureBtnNode = document.getElementById('btn_procedure_row_cancel');
        if (!!cancelProcedureBtnNode) {
            let saveProcedureBtnNode = document.getElementById(
                'btn_procedure_row_save'
            );
            if (saveProcedureBtnNode) {
                saveProcedureBtnNode.click();
            }
            this.props.requestProcedureTemplateList({});
            this.setState({
                procedureDialogOpenFlag: true
            });
            this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ' Service Favourite button in Procedure', '/diagnosis/diagnosisTemplateGroup/');
        } else {
            this.props.requestProcedureTemplateList({});
            this.setState({
                procedureDialogOpenFlag: true
            });
            this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ' Service Favourite button in Procedure', '/diagnosis/diagnosisTemplateGroup/');
        }
    };

    updatePatientProcedure = obj => {
        let { encounterData } = this.props;
        this.setState({
            historicalRecordProcedureScrollFlag: false,
            historicalRecordProblemScrollFlag: false
        });
        let tempObj = encounterData;
        if (!isUndefined(tempObj)) {
            this.props.openCommonCircularDialog();
            let params = {
                patientKey: tempObj.patientKey,
                encounterId: tempObj.encounterId,
                dtos: obj
            };
            this.props.updatePatientProcedure({
                params,
                callback: data => {
                    let payload = {
                        msgCode: data.msgCode,
                        showSnackbar: true
                    };
                    this.props.openCommonMessage(payload);
                    this.loadHistoricalRecords({
                        patientKey: tempObj.patientKey,
                        serviceCd: this.state.service,
                        clinicCd: this.state.clinic,
                        recordType: this.state.recordType
                    });
                    this.scrollToTop('historicalRecordProcedureDiv');
                }
            });
        }
    };
    updateProcedureObj = (newData, oldData) => {
        // this.props.openCommonCircularDialog();
        let procedureDataList = this.state.procedureDataList;
        // delete oldData.tableData;
        const index = procedureDataList.indexOf(oldData);
        let copyProcedureDataList=JSON.parse(JSON.stringify(procedureDataList));
        copyProcedureDataList[index] = newData;

        if (
            newData.operationType === undefined ||
            (newData.operationType !== undefined &&
                newData.operationType !== 'I')
        ) {
            newData.operationType = 'U';
             //order by update time desc
             copyProcedureDataList.splice(index,1);
             copyProcedureDataList.unshift(newData);
        }

        if (newData.operationType == 'I'){
           //order by update time desc
           copyProcedureDataList.splice(index,1);
           copyProcedureDataList.unshift(newData);
      }

        copyProcedureDataList = this.reorder(copyProcedureDataList,PROCEDURE_STATUS_ORDER);

        this.setState({
            procedureDataList: copyProcedureDataList,
            historicalRecordProcedureScrollFlag: false,
            historicalRecordProblemScrollFlag: false,
            procedureEditFlag: true
        });
        //this.props.closeCommonCircularDialog();
    };

    deleteProcedureObj = obj => {
        if(this.valueIsNullable(obj.procedureId)||obj.operationType==='I'){
            this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+ ` 'Delete' button in Procedure list (New record is selected; Procedure ID: null; Procedure: ${obj.procedureText})`,'');
        }else{
            this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+ ` 'Delete' button in Procedure list(Procedure ID: ${obj.procedureId}; Procedure: ${obj.procedureText})`,'');
        }
        this.props.openCommonMessage({
            msgCode: PROCEDURE_CODE.DELETE_CONFIRM,
            btnActions: {
                btn1Click: () => {
                    let procedureDataList = JSON.parse(JSON.stringify(this.state.procedureDataList));
                    let procedureDeleteDataList = JSON.parse(JSON.stringify(this.state.procedureDeleteDataList));
                    const index = this.state.procedureDataList.indexOf(obj);
                    procedureDataList.splice(index, 1);
                    if (
                        obj.operationType === undefined ||
                        (obj.operationType !== undefined && obj.operationType !== 'I')
                    ) {
                        obj.operationType = 'D';
                        procedureDeleteDataList.push(obj);
                        this.setState({ procedureDeleteDataList: procedureDeleteDataList });
                    }
                    let closeBool = procedureDeleteDataList.length > 0 ? true : false;
                    this.setState({
                        procedureDataList: procedureDataList,
                        historicalRecordProcedureScrollFlag: false,
                        historicalRecordProblemScrollFlag: false,
                        procedureEditFlag: closeBool,
                        rightEditFlag: closeBool
                    });
                }
            },
            params: [
                {
                    name: 'record',
                    value: 'procedure'
                }
            ]
        });
    };

    copyHistoricalRecord = () => {
        //copy Record
        let historicalRecord = this.state.selectedHistoricalRecord;
        let { encounterData } = this.props;
        let tempObj = encounterData;
        this.setState({
            historicalRecordProcedureScrollFlag: false,
            historicalRecordProblemScrollFlag: false
        });
        if (!isUndefined(tempObj)) {
            if (historicalRecord.recordType === 'PX') {
                historicalRecord.diagnosisStatusCd = 'C';
                let cancelBtnNode = document.getElementById(
                    'btn_procedure_row_cancel'
                );
                if (!!cancelBtnNode) {
                    let saveBtnNode = document.getElementById(
                        'btn_procedure_row_save'
                    );
                    saveBtnNode.click();
                    setTimeout(() => {
                        this.copyHistoricalRecordProcedure(tempObj, historicalRecord);
                    }, 3000);
                } else {
                    if (
                        !(
                            this.detailsRef.current.getTextAreaValue() == '' &&
                            historicalRecord.remarks == null
                        ) &&
                        this.detailsRef.current.getTextAreaValue() !== historicalRecord.remarks
                    ) {
                        let payload = {
                            msgCode: '101101',
                            btnActions: {
                                btn1Click: () => {
                                    this.props.closeCommonCircularDialog();
                                },
                                btn2Click: () => {
                                    this.props.closeCommonCircularDialog();
                                }
                            }
                        };
                        this.props.openCommonMessage(payload);
                    } else {
                        this.copyHistoricalRecordProcedure(tempObj, historicalRecord);
                    }
                }
            } else if (historicalRecord.recordType === 'DX') {
                historicalRecord.diagnosisStatusCd = 'A';
                let cancelBtnNode = document.getElementById(
                    'btn_diagnosis_row_cancel'
                );
                if (!!cancelBtnNode) {
                    let saveBtnNode = document.getElementById(
                        'btn_diagnosis_row_save'
                    );
                    saveBtnNode.click();
                    setTimeout(() => {
                        this.copyHistoricalRecordDiagnosis(tempObj, historicalRecord);
                    }, 3000);
                } else {
                    if (
                        !(
                            this.detailsRef.current.getTextAreaValue() == '' &&
                            historicalRecord.remarks == null
                        ) &&
                        this.detailsRef.current.getTextAreaValue() !== historicalRecord.remarks
                    ) {
                        let payload = {
                            msgCode: '101101',
                            btnActions: {
                                btn1Click: () => {
                                    this.props.closeCommonCircularDialog();
                                },
                                btn2Click: () => {
                                    this.props.closeCommonCircularDialog();
                                }
                            }
                        };
                        this.props.openCommonMessage(payload);
                    } else {
                        this.copyHistoricalRecordDiagnosis(tempObj, historicalRecord);
                    }
                }
            }
        }
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Copy + ` 'Copy' button in Record Details (Details: ${historicalRecord.remarks})`, '');
    };
    //historicalRecord -> Copy
    copyHistoricalRecordProcedure=(tempObj,historicalRecord)=>{
        let procedureObj = {
            diagnosisStatusCd: historicalRecord.diagnosisStatusCd,
            encounterId: tempObj.encounterId,
            patientKey: tempObj.patientKey,
            procedureText: historicalRecord.diagnosisText === undefined ? historicalRecord.procedureText: historicalRecord.diagnosisText,
            remarks: '',
            codeTermId: historicalRecord.codeTermId,
            operationType: 'I'
        };
        let duplicateFlag = dxpxUtils.checkDuplicationByCopyHistory(this.state.procedureDataList,procedureObj);
        if (duplicateFlag) {
            this.props.openCommonMessage({
                msgCode:PROCEDURE_CODE.DUPLICATED_SELECTION,
                params:[
                    {name:'dxpxTypeTitle',value:'Procedure'},
                    {name:'dxpxType',value:'procedure'}
                ],
                btnActions: {
                    // OK
                    btn1Click: () => {
                        this.tableScrollToTop('dxpx_procedure_table');
                        this.setState({
                            initialProcedure: procedureObj,
                            procedureEditFlag: true
                        });
                        const materialTable = this.procedureMaterialTableRef.current;
                        materialTable.dataManager.changeRowEditing();
                        materialTable.setState({
                          ...materialTable.dataManager.getRenderState(),
                          showAddRow: true
                        });
                    }
                }
            });
        } else {
            this.tableScrollToTop('dxpx_procedure_table');
            this.setState({
                initialProcedure: procedureObj,
                procedureEditFlag: true
            });
            const materialTable = this.procedureMaterialTableRef.current;
            materialTable.dataManager.changeRowEditing();
            materialTable.setState({
              ...materialTable.dataManager.getRenderState(),
              showAddRow: true
            });
        }
    }
    //
    copyHistoricalRecordDiagnosis=(tempObj,historicalRecord)=>{
        let diagnosisId=this.genNonDuplicateID(3);
        let problemObj = {
            diagnosisStatusCd:historicalRecord.diagnosisStatusCd,
            encounterId: tempObj.encounterId,
            patientKey: tempObj.patientKey,
            diagnosisText: historicalRecord.diagnosisText === undefined ? historicalRecord.procedureText: historicalRecord.diagnosisText,
            remarks: '',
            codeTermId: historicalRecord.codeTermId,
            operationType: 'I',
            diagnosisId
        };
        let duplicateFlag = dxpxUtils.checkDuplicationByCopyHistory(this.state.problemDataList,problemObj);
        if (duplicateFlag) {
            this.props.openCommonMessage({
                msgCode:PROCEDURE_CODE.DUPLICATED_SELECTION,
                params:[
                    {name:'dxpxTypeTitle',value:'Problem'},
                    {name:'dxpxType',value:'problem'}
                ],
                btnActions: {
                    // OK
                    btn1Click: () => {
                        this.setState({
                            initialProblem: problemObj,
                            problemEditFlag: true
                        });
                        const materialTable = this.problemMaterialTableRef.current;
                        materialTable.dataManager.changeRowEditing();
                        materialTable.setState({
                          ...materialTable.dataManager.getRenderState(),
                          showAddRow: true
                        });
                         this.tableScrollToTop('dxpx_diagnosis_table');
                    }
                }
            });
        } else {
            this.setState({
                initialProblem: problemObj,
                problemEditFlag: true
            });
            const materialTable = this.problemMaterialTableRef.current;
            materialTable.dataManager.changeRowEditing();
            materialTable.setState({
              ...materialTable.dataManager.getRenderState(),
              showAddRow: true
            });
             this.tableScrollToTop('dxpx_diagnosis_table');
        }
    }

    saveHistoricalRecord = (clickSaveFlag, isRefreshBanner = true) => {
        //update Record
        let historicalRecord = this.state.selectedHistoricalRecord;
        let { encounterData } = this.props;
        this.setState({
            historicalRecordProcedureScrollFlag: false,
            historicalRecordProblemScrollFlag: false,
            leftEditFlag:false
        });
        let tempObj = encounterData;
        if (!isUndefined(tempObj)) {
            if (historicalRecord.recordType === 'PX') {
                this.saveProcedureHistoricalRecord(tempObj,historicalRecord,clickSaveFlag, isRefreshBanner);
            } else if (historicalRecord.recordType === 'DX') {
                this.saveDiagnosisHistoricalRecord(tempObj,historicalRecord,clickSaveFlag, isRefreshBanner);
            }
        }
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+' \'Save\' button in Record Details','/diagnosis/procedure/');
    }

    saveProcedureHistoricalRecord = (tempObj,historicalRecord,clickSaveFlag,isRefreshBanner=true) =>{
        this.props.openCommonCircularDialog();
        let params = {
            patientKey: tempObj.patientKey,
            encounterId: tempObj.encounterId,
            dtos: {
                createBy: historicalRecord.createBy,
                createClinicCd: historicalRecord.createClinicCd,
                createDtm: historicalRecord.createDtm,
                diagnosisStatusCd: this.state.status,
                encounterId: historicalRecord.encounterId,
                patientKey: historicalRecord.patientKey,
                procedureId:
                    historicalRecord.diagnosisId === undefined
                        ? historicalRecord.procedureId
                        : historicalRecord.diagnosisId,
                procedureText:
                        historicalRecord.diagnosisText === undefined
                            ? historicalRecord.procedureText
                            : historicalRecord.diagnosisText,
                remarks: this.detailsRef.current.getTextAreaValue(),
                statusDisPlayName: '',
                codeTermId: historicalRecord.codeTermId,
                updateBy: historicalRecord.updateBy,
                updateClinicCd: historicalRecord.updateClinicCd,
                updateDtm: historicalRecord.updateDtm,
                version: historicalRecord.version
            }
        };
        // this.setState({remarks: this.detailsRef.current.getTextAreaValue()});
        this.props.updatePatientProcedure({
            params,
            callback: data => {
                if(data.respCode === 0) {
                    let payload = {
                        msgCode: data.msgCode,
                        showSnackbar: true
                    };
                    this.props.openCommonMessage(payload);
                    isRefreshBanner && this.props.refreshPatient({ isRefreshBannerData: true });
                    this.refreshPatientProcedure(tempObj,false,clickSaveFlag);
                }else {
                    let payload = {
                        msgCode: data,
                        btnActions:
                        {
                          btn1Click: () => {
                            isRefreshBanner && this.props.refreshPatient({ isRefreshBannerData: true });
                            this.refreshPatientProcedure(tempObj,true,clickSaveFlag);
                            this.setState({
                                isShowRecordDetailText: 'none',
                                isShowRecordDetailDiv: 'none',
                                isShow: 'none',
                                selectedHistoricalRecord: {}
                            });
                          },
                          btn2Click: () => {
                            this.props.closeCommonCircularDialog();
                          }
                        }
                    };
                    this.props.openCommonMessage(payload);
                }
            }
        });
    };

    refreshPatientProcedure = (tempObj,flag,clickSaveFlag) => {
        this.loadHistoricalRecords({
            patientKey: tempObj.patientKey,
            serviceCd: this.state.service,
            clinicCd: this.state.clinic,
            recordType: this.state.recordType
        },true,clickSaveFlag);
        if(flag) {
            this.setState({
                isShowRecordDetailText: 'none',
                isShowRecordDetailDiv: 'none',
                isShow: 'none',
                selectedHistoricalRecord: {}
            });
        }
        this.props.closeCommonCircularDialog();
        this.scrollToTop('historicalRecordProcedureDiv');
    }

    saveDiagnosisHistoricalRecord= (tempObj,historicalRecord,clickSaveFlag,isRefreshBanner=true) =>{
        let params = {
            patientKey: tempObj.patientKey,
            encounterId: tempObj.encounterId,
            dtos: {
                createBy: historicalRecord.createBy,
                createClinicCd: historicalRecord.createClinicCd,
                createDtm: historicalRecord.createDtm,
                diagnosisStatusCd: this.state.status,
                encounterId: historicalRecord.encounterId,
                patientKey: historicalRecord.patientKey,
                diagnosisId: historicalRecord.diagnosisId ,
                diagnosisText: historicalRecord.diagnosisText,
                remarks: this.detailsRef.current.getTextAreaValue(),
                statusDisPlayName: '',
                codeTermId: historicalRecord.codeTermId,
                updateBy: historicalRecord.updateBy,
                updateClinicCd: historicalRecord.updateClinicCd,
                updateDtm: historicalRecord.updateDtm,
                version: historicalRecord.version,
                isNew: this.newRef.current.isCheck() ? COMMON_CHECKBOX_TYPE.CHECKED : COMMON_CHECKBOX_TYPE.UNCHECKED
            }
        };
        if(historicalRecord.ownerTable != undefined) {
            params.dtos.ownerTable = historicalRecord.ownerTable;
        }
        // this.setState({remarks: this.detailsRef.current.getTextAreaValue()});
        this.props.updatePatientProblem({
            params,
            callback: data => {
                if(data.respCode === 0) {
                    let payload = {
                        msgCode: data.msgCode,
                        showSnackbar: true
                    };
                    this.props.openCommonMessage(payload);
                    this.refreshPatientProblem(tempObj,false,clickSaveFlag);
                    isRefreshBanner && this.props.refreshPatient({ isRefreshBannerData: true });
                }else{
                    let payload = {
                        msgCode: data,
                        btnActions:
                        {
                          btn1Click: () => {
                            this.refreshPatientProblem(tempObj,true,clickSaveFlag);
                            isRefreshBanner && this.props.refreshPatient({ isRefreshBannerData: true });
                          },
                          btn2Click: () => {
                            this.props.closeCommonCircularDialog();
                          }
                        }
                    };
                    this.props.openCommonMessage(payload);
                }
            }
        });
    };

    refreshPatientProblem = (tempObj, flag, clickSaveFlag) => {
        this.props.openCommonCircularDialog();
        this.loadHistoricalRecords({
            patientKey: tempObj.patientKey,
            serviceCd: this.state.service,
            clinicCd: this.state.clinic,
            recordType: this.state.recordType
        }, true, clickSaveFlag);
        if (flag) {
            this.setState({
                isShowRecordDetailText: 'none',
                isShowRecordDetailDiv: 'none',
                isShow: 'none',
                selectedHistoricalRecord: {}
            });
        }
        this.props.closeCommonCircularDialog();
        this.tableScrollToTop('dxpx_diagnosis_table');
    }


    onEdit = e => {
        // this.refs.myTA.style.height = 'auto';
        // //关键是先设置为auto，目的为了重设高度（如果字数减少）
        // //如果高度不够，再重新设置
        // if (this.refs.myTA.scrollHeight >= this.refs.myTA.offsetHeight) {
        //   this.refs.myTA.style.height = this.refs.myTA.scrollHeight+'px';
        // }

        this.changeRecordDetail(e);
    };

    deleteHistoricalRecord = () => {
        //delete Record
        let historicalRecord = this.state.selectedHistoricalRecord;
        let { encounterData,loginInfo } = this.props;
        let tempObj = encounterData;
        if (!isUndefined(tempObj)) {
            if (historicalRecord.recordType === 'PX') {
                let payload = {
                    msgCode: '100906',
                    btnActions: {
                        btn1Click: () => {
                            this.props.openCommonCircularDialog();
                            let params = {
                                patientKey: tempObj.patientKey,
                                encounterId: tempObj.encounterId,
                                dtos: {
                                    createBy: historicalRecord.createBy,
                                    createClinicCd: historicalRecord.createClinicCd,
                                    createDtm: historicalRecord.createDtm,
                                    diagnosisStatusCd: this.state.status,
                                    encounterId: historicalRecord.encounterId,
                                    patientKey: historicalRecord.patientKey,
                                    procedureId:
                                        historicalRecord.diagnosisId === undefined
                                            ? historicalRecord.procedureId
                                            : historicalRecord.diagnosisId,
                                    procedureText:
                                        historicalRecord.diagnosisText === undefined
                                            ? historicalRecord.procedureText
                                            : historicalRecord.diagnosisText,
                                    remarks: this.detailsRef.current.getTextAreaValue(),
                                    statusDisPlayName: '',
                                    codeTermId: historicalRecord.codeTermId,
                                    updateBy: historicalRecord.updateBy,
                                    updateClinicCd: historicalRecord.updateClinicCd,
                                    updateDtm: historicalRecord.updateDtm,
                                    serviceCd:loginInfo.service.serviceCd,
                                    clinicCd:loginInfo.clinic.clinicCd,
                                    encounterDate:encounterData.encounterDate,
                                    ehrId:loginInfo.clinic.ehrId,
                                    version: historicalRecord.version
                                }
                            };
                            this.props.deletePatientProcedure({
                                params,
                                callback: data => {
                                    this.props.closeCommonCircularDialog();
                                    if(data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE){
                                        let payload = {
                                            msgCode: data.msgCode,
                                            btnActions:
                                            {
                                              btn1Click: () => {
                                                this.refreshPatientProcedure(tempObj,true);
                                                this.props.refreshPatient({ isRefreshBannerData: true });
                                              }
                                            }
                                        };
                                        this.props.openCommonMessage(payload);
                                    }else{
                                        let payload = {
                                            msgCode: data.msgCode,
                                            showSnackbar: true
                                        };
                                        this.props.openCommonMessage(
                                            payload
                                        );
                                        this.refreshPatientProcedure(tempObj,true);
                                        this.props.refreshPatient({ isRefreshBannerData: true });
                                    }
                                }
                            });
                        }
                    }
                };
                this.props.openCommonMessage(payload);
            } else if (historicalRecord.recordType === 'DX') {
                let payload = {
                    msgCode: '100813',
                    btnActions: {
                        btn1Click: () => {
                            this.props.openCommonCircularDialog();
                            let params = {
                                patientKey: tempObj.patientKey,
                                encounterId: tempObj.encounterId,
                                dtos: {
                                    createBy: historicalRecord.createBy,
                                    createClinicCd: historicalRecord.createClinicCd,
                                    createDtm: historicalRecord.createDtm,
                                    diagnosisStatusCd: historicalRecord.diagnosisStatusCd,
                                    encounterId: historicalRecord.encounterId,
                                    patientKey: historicalRecord.patientKey,
                                    diagnosisId: historicalRecord.diagnosisId,
                                    diagnosisText: historicalRecord.diagnosisText,
                                    remarks: this.detailsRef.current.getTextAreaValue(),
                                    statusDisPlayName: '',
                                    codeTermId: historicalRecord.codeTermId,
                                    updateBy: historicalRecord.updateBy,
                                    updateClinicCd: historicalRecord.updateClinicCd,
                                    updateDtm: historicalRecord.updateDtm,
                                    serviceCd:loginInfo.service.serviceCd,
                                    clinicCd:loginInfo.clinic.clinicCd,
                                    encounterDate:encounterData.encounterDate,
                                    isNew:this.state.isNew,
                                    ehrId:loginInfo.clinic.ehrId,
                                    version: historicalRecord.version
                                }
                            };
                            this.props.deletePatientProblem({
                                params,
                                callback: data => {
                                    this.props.closeCommonCircularDialog();
                                    if(data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE){
                                        let payload = {
                                            msgCode: data.msgCode,
                                            btnActions:
                                            {
                                              btn1Click: () => {
                                                this.refreshPatientProblem(tempObj,true);
                                                this.props.refreshPatient({ isRefreshBannerData: true });
                                              }
                                            }
                                          };
                                        this.props.openCommonMessage(payload);
                                    }else{
                                        let payload = {
                                            msgCode: data.msgCode,
                                            showSnackbar: true
                                        };
                                        this.props.openCommonMessage(
                                            payload
                                        );
                                        this.refreshPatientProblem(tempObj,true);
                                        this.props.refreshPatient({ isRefreshBannerData: true });
                                    }
                                }
                            });
                        }
                    }
                };
                this.props.openCommonMessage(payload);
            }
        }
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+' \'Delete\' button in Record Details','/diagnosis/procedure/');
    };

    handleAddSearchData = (textVal, clickAddMark) => {
        let { encounterData } = this.props;
        let tempObj = encounterData;
        let diagnosisId = this.genNonDuplicateID(3);
        let cancelDiagnosisBtnNode = document.getElementById('btn_diagnosis_row_cancel');
        let cancelProcedureBtnNode = document.getElementById('btn_procedure_row_cancel');
        if (!!cancelDiagnosisBtnNode || cancelProcedureBtnNode) {
            setTimeout(() => {
                if (clickAddMark != null && clickAddMark) {
                    this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ` '+' button in 'Search Problem' (Problem: ${textVal})`, '');
                    let problemObj = {
                        encounterId: tempObj.encounterId,
                        patientKey: tempObj.patientKey,
                        diagnosisText: textVal,
                        remarks: '',
                        codeTermId: '-9999',
                        operationType: 'I',
                        diagnosisStatusCd: 'A',
                        rowId: tempObj.codeTermId + Math.random() * 100,
                        diagnosisId
                    };
                    let saveBtnNode = document.getElementById(
                        'btn_diagnosis_row_save'
                    );
                    if (saveBtnNode) {
                        saveBtnNode.click();
                        setTimeout(() => {
                            this.setState({
                                problemEditFlag: true,
                                initialProblem: problemObj,
                                searchProblemRecordTotalNums: 0,
                                searchProblemRecordList: []
                            });
                            this.tableScrollToTop('dxpx_diagnosis_table');
                            const materialTable = this.problemMaterialTableRef.current;
                            materialTable.dataManager.changeRowEditing();
                            materialTable.setState({
                                ...materialTable.dataManager.getRenderState(),
                                showAddRow: true
                            });
                        }, 100);
                    } else {
                        this.setState({
                            problemEditFlag: true,
                            initialProblem: problemObj,
                            searchProblemRecordTotalNums: 0,
                            searchProblemRecordList: []
                        });
                        this.tableScrollToTop('dxpx_diagnosis_table');
                        const materialTable = this.problemMaterialTableRef.current;
                        materialTable.dataManager.changeRowEditing();
                        materialTable.setState({
                            ...materialTable.dataManager.getRenderState(),
                            showAddRow: true
                        });
                    }
                } else {
                    let saveProcedureBtnNode = document.getElementById(
                        'btn_procedure_row_save'
                    );
                    this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ` '+' button in 'Search Procedure' (Procedure: ${textVal})`, '');
                    let procedureObj = {
                        encounterId: tempObj.encounterId,
                        patientKey: tempObj.patientKey,
                        procedureText: textVal,
                        remarks: '',
                        codeTermId: '-9999',
                        operationType: 'I',
                        diagnosisStatusCd: 'C'
                    };
                    if (saveProcedureBtnNode) {
                        saveProcedureBtnNode.click();
                        setTimeout(() => {
                            this.setState({
                                initialProcedure: procedureObj,
                                procedureEditFlag: true,
                                isShowBtnProcedure: true,
                                searchProcedureRecordTotalNums: 0,
                                searchProcedureRecordList: []
                            });
                            this.tableScrollToTop('dxpx_procedure_table');
                            const materialProcedureTable = this.procedureMaterialTableRef.current;
                            materialProcedureTable.dataManager.changeRowEditing();
                            materialProcedureTable.setState({
                                ...materialProcedureTable.dataManager.getRenderState(),
                                showAddRow: true
                            });
                        }, 100);
                    } else {
                        this.setState({
                            initialProcedure: procedureObj,
                            procedureEditFlag: true,
                            isShowBtnProcedure: true,
                            searchProcedureRecordTotalNums: 0,
                            searchProcedureRecordList: []
                        });
                        this.tableScrollToTop('dxpx_procedure_table');
                        const materialProcedureTable = this.procedureMaterialTableRef.current;
                        materialProcedureTable.dataManager.changeRowEditing();
                        materialProcedureTable.setState({
                            ...materialProcedureTable.dataManager.getRenderState(),
                            showAddRow: true
                        });
                    }
                }
            }, 1000);
        } else {
            if (clickAddMark != null && clickAddMark) {
                let problemObj = {
                    encounterId: tempObj.encounterId,
                    patientKey: tempObj.patientKey,
                    diagnosisText: textVal,
                    remarks: '',
                    codeTermId: '-9999',
                    operationType: 'I',
                    diagnosisStatusCd: 'A',
                    rowId: tempObj.codeTermId + Math.random() * 100,
                    diagnosisId
                };
                let saveBtnNode = document.getElementById(
                    'btn_diagnosis_row_save'
                );
                if (saveBtnNode) {
                    saveBtnNode.click();
                    setTimeout(() => {
                        this.setState({
                            problemEditFlag: true,
                            initialProblem: problemObj,
                            searchProblemRecordTotalNums: 0,
                            searchProblemRecordList: []
                        });
                        this.tableScrollToTop('dxpx_diagnosis_table');
                        const materialTable = this.problemMaterialTableRef.current;
                        materialTable.dataManager.changeRowEditing();
                        materialTable.setState({
                            ...materialTable.dataManager.getRenderState(),
                            showAddRow: true
                        });
                    }, 100);
                } else {
                    this.setState({
                        problemEditFlag: true,
                        initialProblem: problemObj,
                        searchProblemRecordTotalNums: 0,
                        searchProblemRecordList: []
                    });
                    this.tableScrollToTop('dxpx_diagnosis_table');
                    const materialTable = this.problemMaterialTableRef.current;
                    materialTable.dataManager.changeRowEditing();
                    materialTable.setState({
                        ...materialTable.dataManager.getRenderState(),
                        showAddRow: true
                    });
                }
            } else {
                let saveProcedureBtnNode = document.getElementById(
                    'btn_procedure_row_save'
                );
                let procedureObj = {
                    encounterId: tempObj.encounterId,
                    patientKey: tempObj.patientKey,
                    procedureText: textVal,
                    remarks: '',
                    codeTermId: '-9999',
                    operationType: 'I',
                    diagnosisStatusCd: 'C'
                };
                if (saveProcedureBtnNode) {
                    saveProcedureBtnNode.click();
                    setTimeout(() => {
                        this.setState({
                            initialProcedure: procedureObj,
                            procedureEditFlag: true,
                            isShowBtnProcedure: true,
                            searchProcedureRecordTotalNums: 0,
                            searchProcedureRecordList: []
                        });
                        this.tableScrollToTop('dxpx_procedure_table');
                        const materialProcedureTable = this.procedureMaterialTableRef.current;
                        materialProcedureTable.dataManager.changeRowEditing();
                        materialProcedureTable.setState({
                            ...materialProcedureTable.dataManager.getRenderState(),
                            showAddRow: true
                        });
                    }, 100);
                } else {
                    this.setState({
                        initialProcedure: procedureObj,
                        procedureEditFlag: true,
                        isShowBtnProcedure: true,
                        searchProcedureRecordTotalNums: 0,
                        searchProcedureRecordList: []
                    });
                    this.tableScrollToTop('dxpx_procedure_table');
                    const materialProcedureTable = this.procedureMaterialTableRef.current;
                    materialProcedureTable.dataManager.changeRowEditing();
                    materialProcedureTable.setState({
                        ...materialProcedureTable.dataManager.getRenderState(),
                        showAddRow: true
                    });
                }
            }
        }
    };

    handleProcedureAddSearchData = (textVal, clickAddMark) => {
        if (clickAddMark != null && clickAddMark) {
            let { encounterData } = this.props;
            let tempObj = encounterData;
            let procedureObj = {
                diagnosisStatusCd: this.state.status,
                encounterId: tempObj.encounterId,
                patientKey: tempObj.patientKey,
                procedureText: textVal,
                remarks: '',
                codeTermId: '-9999',
                operationType: 'I'
                // diagnosisStatusCd:'CP'
            };
            let procedureDataList = this.state.procedureDataList;
            procedureDataList.push(procedureObj);
            procedureDataList = this.reorder(procedureDataList,PROCEDURE_STATUS_ORDER);
            this.setState({
                procedureDataList: procedureDataList,
                procedureEditFlag: true,
                addProcedureMark: true
            });
             this.tableScrollToTop('dxpx_diagnosis_table');
        }
    };

    handleProblemFuzzySearch = (textVal, InputBlur) => {
        let { sysConfig } = this.props;
        this.props.queryProblemList({
            params: {
                localTerm:this.state.problemLocalTermChecked?'Y':'N',
                diagnosisText: encodeURIComponent(textVal),
                diagnosisTypeCd: PROBLEM_SEARCH_LIST_TYPE,
                start: 0,
                end: !!sysConfig[COMMON_SYS_CONFIG_KEY.PAGE_SIZE]
                    ? toInteger(
                          sysConfig[COMMON_SYS_CONFIG_KEY.PAGE_SIZE].value
                      )
                    : DEFAULT_OFFLINE_PAGE_SIZE
            },
            callback: data => {
                this.setState({
                    searchProblemRecordList: data.recordList,
                    searchProblemRecordTotalNums: data.totalRecord || 0
                });
            }
        });
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Search+` ${textVal} in 'Search Problem' (Local terms: ${this.state.problemLocalTermChecked?'Yes':'No'})` ,'diagnosis/codeList/codeDxpxTerm/page/');
    };

    handleProblemSearchBoxLoadMoreRows = (
        startIndex,
        stopIndex,
        valText,
        dataList,
        updateState,
        localTerm = this.state.problemLocalTermChecked ? 'Y' : 'N',
        diagnosisText = valText,
        diagnosisTypeCd = PROBLEM_SEARCH_LIST_TYPE,
        start = startIndex,
        end = stopIndex + 1
    ) => {
        return axios
            .get(`/diagnosis/codeList/codeDxpxTerm/page/?localTerm=${localTerm}&diagnosisText=${unescape(encodeURIComponent(diagnosisText))}&diagnosisTypeCd=${diagnosisTypeCd}&start=${start}&end=${end}`)
            .then(response => {
                if (response.data.respCode === 0) {
                    dataList = dataList.concat(response.data.data.recordList);
                    updateState &&
                        updateState({
                            dataList
                        });
                }
            });
    };

    handleProblemSelectItem = item => {
        const { selectedPatientKey, selectedEncounterVal } = this.state;
        let paraObj = {
            patientKey: selectedPatientKey,
            encounterId: selectedEncounterVal,
            diagnosisStatusCd: DEFAULT_PROBLEM_SAVE_STATUS,
            codeTermId: item.codeTermId,
            diagnosisText: item.termDisplayName,
            remark: ''
        };
        let cancelBtnNode = document.getElementById('btn_diagnosis_row_cancel');
        if (!!cancelBtnNode) {
            let saveBtnNode = document.getElementById(
                'btn_diagnosis_row_save'
            );
            saveBtnNode.click();
            setTimeout(() => {
                this.problemSelectItem(paraObj);
            },3000);
        } else {
            this.problemSelectItem(paraObj);
        }
    };

    problemSelectItem = (paraObj) =>{
        let problemArr = [];
        problemArr.push(paraObj);
        this.addProblemObj(problemArr);
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Select+` a problem in 'Search Problem' Did You Mean drop-down list (Code Term ID: ${paraObj.codeTermId}; Procedure: ${paraObj.problemText})` ,'');
        this.setState({
            historicalRecordProblemScrollFlag: true,
            rightEditFlag:true,
            searchProblemRecordTotalNums:0,
            searchProblemRecordList:[]
        });
    }

    handleProcedureSearchBoxLoadMoreRows = (
        startIndex,
        stopIndex,
        valText,
        dataList,
        updateState,
        localTerm = this.state.procedureLocalTermChecked?'Y':'N',
        diagnosisText = valText,
        diagnosisTypeCd = PROCEDURE_SEARCH_LIST_TYPE,
        start = startIndex,
        end = stopIndex + 1
    ) => {
        return axios
            .get(`/diagnosis/codeList/codeDxpxTerm/page/?localTerm=${localTerm}&diagnosisText=${unescape(encodeURIComponent(diagnosisText))}&diagnosisTypeCd=${diagnosisTypeCd}&start=${start}&end=${end}`)
            .then(response => {
                if (response.data.respCode === 0) {
                    dataList = dataList.concat(response.data.data.recordList);
                    updateState &&
                        updateState({
                            dataList
                        });
                }
            });
    };

    handleProcedureFuzzySearch = textVal => {
        this.props.queryProcedureList({
            params: {
                localTerm: this.state.procedureLocalTermChecked ? 'Y' : 'N',
                diagnosisText: encodeURIComponent(textVal),
                diagnosisTypeCd: PROCEDURE_SEARCH_LIST_TYPE,
                start: 0,
                end: 30
            },
            callback: data => {
                let tempObj = find(data.recordList, item => {
                    return item.termDisplayName === textVal.trim();
                });
                if (tempObj) {
                    this.setState({
                        isShowBtnProcedure: true
                    });
                } else {
                    this.setState({
                        isShowBtnProcedure: false
                    });
                }
                this.setState({
                    searchProcedureRecordList: data.recordList,
                    searchProcedureRecordTotalNums: data.totalRecord || 0
                });
            }
        });
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Search + ` ${textVal} in 'Search Procedure' (Local terms: ${this.state.problemLocalTermChecked ? 'Yes' : 'No'})`, 'diagnosis/codeList/codeDxpxTerm/page/');
    };

    handleProcedureSelectItem = item => {
        const { selectedPatientKey, selectedEncounterVal } = this.state;
        let paraObj = {
            patientKey: selectedPatientKey,
            encounterId: selectedEncounterVal,
            diagnosisStatusCd: DEFAULT_PROCEDURE_SAVE_STATUS,
            codeTermId: item.codeTermId,
            procedureText: item.termDisplayName,
            remark: ''
        };
        let cancelBtnNode = document.getElementById('btn_procedure_row_cancel');
        if (!!cancelBtnNode) {
            let saveBtnNode = document.getElementById('btn_procedure_row_save');
            saveBtnNode.click();
            setTimeout(() => {
                this.procedureSelectItem(paraObj);
            },3000);
        } else {
           this.procedureSelectItem(paraObj);
        }
    };

    procedureSelectItem = (paraObj) =>{
        let procedureArr = [];
        procedureArr.push(paraObj);
        this.addProcedureObj(procedureArr);
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Select+` a procedure in 'Search Procedure' Did You Mean drop-down list (Code Term ID: ${paraObj.codeTermId}; Procedure: ${paraObj.procedureText})` ,'');
        this.setState({
            historicalRecordProcedureScrollFlag: true,
            isShowBtnProcedure: true,
            rightEditFlag:true,
            searchProcedureRecordTotalNums:0,
            searchProcedureRecordList:[]
        });
    }
    closeSearchData = () => {
        this.setState({
            searchProblemRecordTotalNums:0,
            searchProblemRecordList:[]
        });
    };
    closeProcedureSearchData = () => {
        this.setState({
            searchProcedureRecordTotalNums:0,
            searchProcedureRecordList:[]
        });
    };

    insertCloseLog = (type) =>{
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+` 'X' button to clear searching text in 'Search ${type}'` ,'');
    }

    // handle problem drag start
    handleDiagnosisDragStart = (event,selectedDiagnosis) => {
        event.dataTransfer.setData('text/plain',JSON.stringify(selectedDiagnosis));
        this.dragTargetContentType = TABLE_CONTENT_TYPE.CHRONIC;
    };

    // handle chronic problem drag start
    handleChronicProblemDragStart = (event,selectedChronicProblem) => {
        event.dataTransfer.setData('text/plain',JSON.stringify(selectedChronicProblem));
        this.dragTargetContentType = TABLE_CONTENT_TYPE.DIAGNOSIS;
    };

    // handle chronic problem drag over
    handleChronicProblemDragOver = event => {
        event.preventDefault();
        if (this.dragTargetContentType !== TABLE_CONTENT_TYPE.CHRONIC) {
            event.dataTransfer.dropEffect = 'none';
        } else {
            event.dataTransfer.dropEffect = 'all';
        }
    }

    handleChronicProblemDragEnd = event => {
        this.dragTargetContentType = '';
    }

    // handle chronic problem drop
    handleChronicProblemDrop = event => {
        event.preventDefault();
        let cancelBtnNode = document.getElementById('btn_chronic_problem_row_cancel');
        let data = event.dataTransfer.getData('text/plain');
        if (!!cancelBtnNode) {
            let saveBtnNode = document.getElementById(
                'btn_chronic_problem_row_save'
            );
            saveBtnNode.click();
            setTimeout(() => {
                this.chronicProblemDrop(event,data);
            },3000);
        } else {
            this.chronicProblemDrop(event,data);
        }
        this.dragTargetContentType = '';
    }

    chronicProblemDrop = (event,data) =>{
        const { encounterData ,loginInfo} = this.props;
            let chronicProblemDataList=JSON.parse(JSON.stringify(this.state.chronicProblemDataList));
            data = JSON.parse(data);
            let index = findIndex(chronicProblemDataList,(dataItem)=>{
                return dataItem.problemText === data.diagnosisText;
            });
            // validation
            let addChronicObj={};
            if (index !== -1) {
                this.props.openCommonMessage({
                    msgCode:PROCEDURE_CODE.DUPLICATE_CHRONIC_PROBLEM
                });
            } else {
                let diagnosisId=data.diagnosisId;
                if(data.diagnosisId===''||data.diagnosisId===undefined){
                  diagnosisId=this.genNonDuplicateID(3);
                }
                let currentDate = new Date();
                addChronicObj={
                    chronicProblemId:null,
                    patientKey:encounterData.patientKey,
                    codeTermId:data.codeTermId,
                    problemText:data.diagnosisText,
                    status:'A',
                    remarks:'',
                    saveInd:CHRONIC_SAVE_IND_TYPE.SAVE, // Add => Save
                    version:null,
                    operationType:COMMON_ACTION_TYPE.INSERT,
                    createBy:null,
                    createClinicCd:null,
                    createDtm:currentDate,
                    updateBy:null,
                    updateClinicCd:null,
                    updateDtm:null,
                    rowId:data.codeTermId+Math.random()*100,
                    serviceCd:loginInfo.service.serviceCd,
                    diagnosisId:diagnosisId,
                    relatedTable: data.ownerTable
                };
                this.tableScrollToTop('dxpx_chronic_problem_table');
                this.setState({
                    rightEditFlag:true,
                    initialChronic: addChronicObj
                });
                const materialTable = this.chronicMaterialTableRef.current;
                materialTable.dataManager.changeRowEditing();
                materialTable.setState({
                  ...materialTable.dataManager.getRenderState(),
                  showAddRow: true
                });
            }
        }

    handleChronicProblemRowUpdate = (newData,oldData) => {
        let chronicProblemDataList = this.state.chronicProblemDataList;
        const { problemStatusCdList } = this.state;
        return new Promise((resolve) => {
            let index = chronicProblemDataList.indexOf(oldData);
            if (!!newData.version) {
                newData.operationType = COMMON_ACTION_TYPE.UPDATE;
            }
            let copyChronicProblemDataList=JSON.parse(JSON.stringify(chronicProblemDataList));
            copyChronicProblemDataList[index] = newData;

            //order by update time desc
            copyChronicProblemDataList.splice(index,1);
            copyChronicProblemDataList.unshift(newData);
            copyChronicProblemDataList = this.reorder(copyChronicProblemDataList, problemStatusCdList);
            this.setState({
                chronicProblemDataList:copyChronicProblemDataList,
                chronicOriginDataList:copyChronicProblemDataList,
                problemEditFlag: true
            },()=>resolve());
        });
    }

    handleChronicProblemRowDelete = oldData => {
        if(this.valueIsNullable(oldData.chronicProblemId)||oldData.operationType==='I'){
            this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+ ` 'Delete' button in  Chronic Problem list (New record is selected; Chronic Problem ID: null; Problem: ${oldData.problemText})`,'');
        }else{
            this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+ ` 'Delete' button in  Chronic Problem list(Chronic Problem ID: ${oldData.chronicProblemId}; Problem: ${oldData.problemText})`,'');
        }
        let chronicProblemDataList = cloneDeep(this.state.chronicProblemDataList);
        let chronicProblemDeletedDataList  =  cloneDeep(this.state.chronicProblemDeletedDataList);
        this.props.openCommonMessage({
                    msgCode: PROCEDURE_CODE.DELETE_CONFIRM,
                    btnActions: {
                    btn1Click: () => {
                        return new Promise((resolve) => {
                            let index = this.state.chronicProblemDataList.indexOf(oldData);
                            if (!!oldData.version) {
                                oldData.saveInd = CHRONIC_SAVE_IND_TYPE.DELETE; // Delete => D
                                oldData.operationType = COMMON_ACTION_TYPE.DELETE;
                                chronicProblemDeletedDataList.push(oldData);
                            }
                            chronicProblemDataList.splice(index, 1);
                            let closeBool = chronicProblemDeletedDataList.length > 0 ? true : false;
                            this.setState({
                                chronicProblemDataList,
                                chronicOriginDataList:chronicProblemDataList,
                                chronicProblemDeletedDataList,
                                problemEditFlag: closeBool,
                                rightEditFlag: closeBool,
                                // problemEditFlag: true,
                                // rightEditFlag:true,
                                chronicProblemSelectionData:[]
                            },()=>resolve());
                        });
                    }
                    },
                    params: [
                        {
                            name: 'record',
                            value: 'chronic problem'
                        }
                    ]
                  });
                }

    onProblemDragOver = e => {
        e.preventDefault();
        let type = this.state.dragHistoricalRecord.recordType;
        if (this.dragTargetContentType!==TABLE_CONTENT_TYPE.DIAGNOSIS&&type !== 'DX'&&this.dragTargetContentType!==TABLE_CONTENT_TYPE.LEFTDIAGNOSIS) e.dataTransfer.dropEffect = 'none';
        else e.dataTransfer.dropEffect = 'all';
    };

    onProcedureDragOver = e => {
        e.preventDefault();
        let type = this.state.dragHistoricalRecord.recordType;
        if (type !== 'PX'&&this.dragTargetContentType!==TABLE_CONTENT_TYPE.LEFTPROCEDURE) e.dataTransfer.dropEffect = 'none';
        else e.dataTransfer.dropEffect = 'all';
    };

    onProcedureDrop = () => {
        let cancelBtnNode = document.getElementById('btn_procedure_row_cancel');
        let data = event.dataTransfer.getData('text/plain');
        if (!!cancelBtnNode) {
            let saveBtnNode = document.getElementById(
                'btn_procedure_row_save'
            );
            saveBtnNode.click();
            setTimeout(() => {
                this.procedureDrop(data);
            }, 3000);
        } else {
            this.procedureDrop(data);
        }
    };

    procedureDrop = (historicalRecord) =>{
        if (this.dragTargetContentType===TABLE_CONTENT_TYPE.LEFTPROCEDURE) {
            let { encounterData } = this.props;
            let tempObj = encounterData;
            historicalRecord = JSON.parse(historicalRecord);
            historicalRecord.diagnosisStatusCd='C';
            if (!isUndefined(tempObj)) {
                this.props.openCommonCircularDialog();
                let params = {
                    encounterId: encounterData.encounterId,
                    patientKey: historicalRecord.patientKey,
                    procedureText: historicalRecord.diagnosisText === undefined   ? historicalRecord.procedureText  : historicalRecord.diagnosisText,
                    remarks: historicalRecord.remarks=== null ? '' :historicalRecord.remarks,
                    diagnosisStatusCd: historicalRecord.diagnosisStatusCd,
                    codeTermId: historicalRecord.codeTermId
                };
                this.props.closeCommonCircularDialog();
                let procedureArr = [];
                procedureArr.push(params);
                this.addProcedureObj(procedureArr);
                this.loadHistoricalRecords({
                    patientKey: tempObj.patientKey,
                    serviceCd: this.state.service,
                    clinicCd: this.state.clinic,
                    recordType: this.state.recordType
                },true);
                this.setState({
                    historicalRecordProcedureScrollFlag: true,
                    rightEditFlag:true
                });
            }
        }
    }

    onProblemDrop = () => {
        let cancelBtnNode = document.getElementById('btn_diagnosis_row_cancel');
        let data = event.dataTransfer.getData('text/plain');
        if (!!cancelBtnNode) {
            let saveBtnNode = document.getElementById(
                'btn_diagnosis_row_save'
            );
            saveBtnNode.click();
            setTimeout(() => {
                this.problemDrop(data);
            },3000);
        } else {
            this.problemDrop(data);
        }
    };

    problemDrop = (data) =>{
        let diagnosisId=this.genNonDuplicateID(4);
        if (this.dragTargetContentType!==''&&this.dragTargetContentType===TABLE_CONTENT_TYPE.DIAGNOSIS) {
            data = JSON.parse(data);
            const { encounterData } = this.props;
            let problemDataList = JSON.parse(JSON.stringify(this.state.problemDataList));
            let duplicateFlag = dxpxUtils.checkDuplicationFromChronicProblem(problemDataList,[data]);
            if (duplicateFlag) {
                this.props.openCommonMessage({
                    msgCode:PROCEDURE_CODE.DUPLICATED_SELECTION,
                    params:[
                        {name:'dxpxTypeTitle',value:'Problem'},
                        {name:'dxpxType',value:'problem'}
                    ],
                    btnActions: {
                        // OK
                        btn1Click: () => {
                             this.tableScrollToTop('dxpx_diagnosis_table');
                           let addProblemObj={
                                diagnosisStatusCd: 'A',
                                encounterId: encounterData.encounterId,
                                patientKey: encounterData.patientKey,
                                diagnosisText: data.problemText,
                                remarks: '',
                                statusDisPlayName: '',
                                codeTermId: data.codeTermId,
                                operationType:COMMON_ACTION_TYPE.INSERT,
                                diagnosisId
                            };
                            this.setState({
                                initialProblem: addProblemObj,
                                problemEditFlag:true
                            });
                            const materialTable = this.problemMaterialTableRef.current;
                            materialTable.dataManager.changeRowEditing();
                            materialTable.setState({
                                ...materialTable.dataManager.getRenderState(),
                                showAddRow: true
                            });
                        }
                    }
                });
            } else {
                let addProblemObj={
                    diagnosisStatusCd: 'A',
                    encounterId: encounterData.encounterId,
                    patientKey: encounterData.patientKey,
                    diagnosisText: data.problemText,
                    remarks: data.remarks,
                    statusDisPlayName: '',
                    codeTermId: data.codeTermId,
                    operationType:COMMON_ACTION_TYPE.INSERT,
                    diagnosisId
                };
                this.setState({
                    initialProblem: addProblemObj,
                    problemEditFlag:true
                });
                 this.tableScrollToTop('dxpx_diagnosis_table');
                const materialTable = this.problemMaterialTableRef.current;
                materialTable.dataManager.changeRowEditing();
                materialTable.setState({
                    ...materialTable.dataManager.getRenderState(),
                    showAddRow: true
                });
            }
        } else if (this.dragTargetContentType===TABLE_CONTENT_TYPE.LEFTDIAGNOSIS) {
            this.props.openCommonCircularDialog();
            let { encounterData } = this.props;
            let tempObj = encounterData;
            let historicalRecord = data;
            historicalRecord = JSON.parse(historicalRecord);
            if (!isUndefined(tempObj)) {
                let params = {
                    diagnosisStatusCd: 'A',
                    encounterId: encounterData.encounterId,
                    patientKey: historicalRecord.patientKey,
                    diagnosisText: historicalRecord.diagnosisText,
                    remarks: historicalRecord.remarks=== null ? '' :historicalRecord.remarks,
                    statusDisPlayName: '',
                    codeTermId: historicalRecord.codeTermId,
                    diagnosisId
                };
                this.props.closeCommonCircularDialog();
                let problemArr = [];
                problemArr.push(params);
                this.addProblemObj(problemArr);
                this.loadHistoricalRecords({
                    patientKey: tempObj.patientKey,
                    serviceCd: this.state.service,
                    clinicCd: this.state.clinic,
                    recordType: this.state.recordType
                },true);
                this.setState({
                    historicalRecordProblemScrollFlag: true,
                    rightEditFlag:true
                });
            }
        }
    }

    handleActionCancel = (event, tableProps) => {
        let {problemOriginDataList,chronicOriginDataList}=this.state;
        let rowData=tableProps.data;
        tableProps.action.onClick(event, tableProps.data);
        if(event.target.id==='btn_chronic_problem_row_cancel_icon'||event.target.id==='btn_chronic_problem_row_cancel'){
            this.setState({
                initialChronic:{},
                chronicDataList:chronicOriginDataList
            });
            if(this.valueIsNullable(rowData.chronicProblemId)||rowData.operationType==='I'){
                this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+ ` 'X'(Cancel) button in Chronic Problem list (New record is selected; Chronic Problem ID: null; Problem: ${rowData.problemText})`,'');
            }else{
                this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+ ` 'X'(Cancel) button in Chronic Problem list(Chronic Problem ID: ${rowData.chronicProblemId}; Problem: ${rowData.problemText})`,'');
            }
        }else if(event.target.id==='btn_procedure_row_cancel_icon'||event.target.id==='btn_procedure_row_cancel'){
            this.setState({
                initialProcedure:{}
            });
            if(this.valueIsNullable(rowData.procedureId)||rowData.operationType==='I'){
                this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+ ` 'X'(Cancel) button in Procedure list (New record is selected; Procedure ID: null; Procedure: ${rowData.procedureText})`,'');
            }else{
                this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+ ` 'X'(Cancel) button in Procedure list(Procedure ID: ${rowData.procedureId}; Procedure: ${rowData.procedureText})`,'');
            }
        }else if(event.target.id==='btn_diagnosis_row_cancel_icon'||event.target.id==='btn_diagnosis_row_cancel'){
            this.setState({
                initialProblem: {},
                problemDataList:problemOriginDataList
            });
            if(rowData.operationType==='I'){
                this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+ ` 'X'(Cancel) button in Problem list (New record is selected; Problem ID: null; Problem: ${rowData.diagnosisText})`,'');
            }else{
                this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+ ` 'X'(Cancel) button in   Problem list(Problem ID: ${rowData.diagnosisId}; Problem: ${rowData.diagnosisText})`,'');
            }
        }

        }
    //material Table 添加列自动滚到顶部
    tableScrollToTop = type => {
        let parent = document.getElementById(type); // 获取父元素
        let divElement = parent && parent.getElementsByTagName('div');
        if (divElement) {
            divElement[3].scrollTop = 0;
        }
    };

    scrollToTop = type => {
        let anchorElement = document.getElementById(type);
        if (anchorElement) {
            anchorElement.scrollTop = 0;
        }
    };

    scrollToBottom = type => {
        let anchorElement = document.getElementById(type);
        if (anchorElement) {
            anchorElement.scrollTop = anchorElement.scrollHeight;
        }
    };

    addProblemObj = obj => {
        let {loginInfo}=this.props;
        let {clinic}=loginInfo;
        let duplicateFlag = dxpxUtils.checkDuplicationByServiceFavorite(this.state.problemDataList,obj);
        let addProblemObj={};
        let problemDataList = JSON.parse(JSON.stringify(this.state.problemDataList));
        const { problemStatusCdList } = this.state;
        for (let index = 0; index < obj.length; index++) {
             obj[index].ehrId = clinic.ehrId;
             let diagnosisId=obj[index].diagnosisId;
             if(_.isEmpty(obj[index].diagnosisId)||obj[index].diagnosisId===undefined){
              diagnosisId=this.genNonDuplicateID(3);
             }
             obj[index].diagnosisId=diagnosisId;
             if(obj[index].isServiceFavourite){
                obj[index].operationType = 'I';
             }else{
                obj[index].remarks ='';
                obj[index].operationType = 'I';
             }
            obj[index].rowId = obj[index].codeTermId+Math.random()*100;
            problemDataList.unshift(obj[index]);
            problemDataList = this.reorder(problemDataList, problemStatusCdList);
        }
        if (duplicateFlag) {
            this.props.openCommonMessage({
                msgCode:PROCEDURE_CODE.DUPLICATED_SELECTION,
                params:[
                    {name:'dxpxTypeTitle',value:'Problem'},
                    {name:'dxpxType',value:'problem'}
                ],
                btnActions: {
                    // OK
                    btn1Click: () => {
                        if(obj.length===1){
                            addProblemObj=obj[obj.length-1];
                            problemDataList.splice(obj[obj.length-1],1);
                            this.setState({
                                problemDataList: problemDataList,
                                historicalRecordProblemScrollFlag: true,
                                problemEditFlag: true,
                                rightEditFlag:true,
                                initialProblem: addProblemObj,
                                diagnosisSelectionData:[]
                            });
                             this.tableScrollToTop('dxpx_diagnosis_table');
                            const materialTable = this.problemMaterialTableRef.current;
                            materialTable.dataManager.changeRowEditing();
                            materialTable.setState({
                              ...materialTable.dataManager.getRenderState(),
                              showAddRow: true
                            });
                        }else{
                             this.tableScrollToTop('dxpx_diagnosis_table');
                            this.setState({
                                problemDataList: problemDataList,
                                problemOriginDataList:problemDataList,
                                historicalRecordProblemScrollFlag: true,
                                problemEditFlag: true,
                                rightEditFlag:true,
                                diagnosisSelectionData:[]
                            });
                        }
                    }
                }
            });
        } else {
            if(obj.length===1){
                addProblemObj=obj[obj.length-1];
                problemDataList.splice(obj[obj.length-1],1);
                this.setState({
                    problemDataList: problemDataList,
                    historicalRecordProblemScrollFlag: true,
                    problemEditFlag: true,
                    rightEditFlag:true,
                    initialProblem: addProblemObj,
                    diagnosisSelectionData:[]
                });
                 this.tableScrollToTop('dxpx_diagnosis_table');
                const materialTable = this.problemMaterialTableRef.current;
                materialTable.dataManager.changeRowEditing();
                materialTable.setState({
                  ...materialTable.dataManager.getRenderState(),
                  showAddRow: true
                });
            }else{
                 this.tableScrollToTop('dxpx_diagnosis_table');
                this.setState({
                    problemDataList: problemDataList,
                    problemOriginDataList:problemDataList,
                    historicalRecordProblemScrollFlag: true,
                    problemEditFlag: true,
                    rightEditFlag:true,
                    diagnosisSelectionData:[]
                });
            }
        }
    };

    addProblem = obj => {
        const { problemStatusCdList } = this.state;
        let problemDataList = JSON.parse(JSON.stringify(this.state.problemDataList));
            problemDataList.unshift(obj);
            problemDataList = this.reorder(problemDataList, problemStatusCdList);
         this.tableScrollToTop('dxpx_diagnosis_table');
        this.setState({
            problemDataList: problemDataList,
            problemOriginDataList:problemDataList,
            historicalRecordProblemScrollFlag: true,
            problemEditFlag: true,
            rightEditFlag:true,
            initialProblem: {}
        });
    };

    addProcedureObj = obj => {
        let {loginInfo}=this.props;
        let {clinic}=loginInfo;
        let addProcedureObj={};
        let duplicateFlag = dxpxUtils.checkDuplicationByServiceFavorite(this.state.procedureDataList,obj);
        let procedureDataList = JSON.parse(JSON.stringify(this.state.procedureDataList));
        for (let index = 0; index < obj.length; index++) {
            obj[index].ehrId = clinic.ehrId;
            if(obj[index].isServiceFavourite){
                obj[index].operationType = 'I';
             }else{
                obj[index].remarks ='';
                obj[index].operationType = 'I';
             }
            procedureDataList.unshift(obj[index]);
            procedureDataList = this.reorder(procedureDataList,PROCEDURE_STATUS_ORDER);
        }
        if (duplicateFlag) {
            this.props.openCommonMessage({
                msgCode:PROCEDURE_CODE.DUPLICATED_SELECTION,
                params:[
                    {name:'dxpxTypeTitle',value:'Procedure'},
                    {name:'dxpxType',value:'procedure'}
                ],
                btnActions: {
                    // OK
                    btn1Click: () => {
                        if(obj.length===1){
                            addProcedureObj=obj[obj.length-1];
                            this.tableScrollToTop('dxpx_procedure_table');
                            this.setState({
                                historicalRecordProcedureScrollFlag: true,
                                procedureEditFlag: true,
                                rightEditFlag:true,
                                initialProcedure: addProcedureObj
                            });
                            const materialTable = this.procedureMaterialTableRef.current;
                            materialTable.dataManager.changeRowEditing();
                            materialTable.setState({
                              ...materialTable.dataManager.getRenderState(),
                              showAddRow: true
                            });
                        }else{
                            this.setState({
                                procedureDataList: procedureDataList,
                                historicalRecordProcedureScrollFlag: true,
                                procedureEditFlag: true,
                                rightEditFlag:true
                            });
                        }
                    }
                }
            });
        } else {
            if(obj.length===1){
                addProcedureObj=obj[obj.length-1];
                procedureDataList.splice(obj[obj.length-1],1);
                this.tableScrollToTop('dxpx_procedure_table');
                this.setState({
                    historicalRecordProcedureScrollFlag: true,
                    procedureEditFlag: true,
                    rightEditFlag:true,
                    initialProcedure: addProcedureObj
                });
                const materialTable = this.procedureMaterialTableRef.current;
                materialTable.dataManager.changeRowEditing();
                materialTable.setState({
                  ...materialTable.dataManager.getRenderState(),
                  showAddRow: true
                });
            }else{
                procedureDataList = this.reorder(procedureDataList,PROCEDURE_STATUS_ORDER);
                this.tableScrollToTop('dxpx_procedure_table');
                this.setState({
                    procedureDataList: procedureDataList,
                    historicalRecordProcedureScrollFlag: true,
                    procedureEditFlag: true,
                    rightEditFlag:true
                });
            }
        }
    };

    addProcedure = obj => {
        let procedureDataList = JSON.parse(JSON.stringify(this.state.procedureDataList));
            procedureDataList.unshift(obj);
            procedureDataList = this.reorder(procedureDataList,PROCEDURE_STATUS_ORDER);
            this.setState({
                procedureDataList: procedureDataList,
                historicalRecordProcedureScrollFlag: true,
                procedureEditFlag: true,
                rightEditFlag:true,
                initialProcedure: {}
            });
    };

    reverse = arr =>{
      let newArr = [];
      for (let i = 0; i < arr.length; i++) {
        let newObj = [];
        for (let index = 0; index < arr[i].length; index++) {
          let item = arr[i][index];
          newObj.unshift(item);
        }
        newArr[i] = newObj;
      }
      return newArr;
    }

     handleClickSave = () => {
        let procedureCancelBtnNode = document.getElementById('btn_procedure_row_cancel');
        let diagnosisCancelBtnNode = document.getElementById('btn_diagnosis_row_cancel');
        let chronicProblemCancelBtnNode = document.getElementById('btn_chronic_problem_row_cancel');
        if (!!procedureCancelBtnNode||!!diagnosisCancelBtnNode||!!chronicProblemCancelBtnNode) {

            this.props.openCommonCircularDialog();
            this.clickBtn();
            setTimeout(() => {
                this.saveAllData();
            },3000);
        } else {
            this.saveAllData();
        }
        this.setState({rightEditFlag:false});
    };

    handleClickCancleSave = (saveCallback) => {
        let procedureCancelBtnNode = document.getElementById('btn_procedure_row_cancel');
        let diagnosisCancelBtnNode = document.getElementById('btn_diagnosis_row_cancel');
        let chronicProblemCancelBtnNode = document.getElementById('btn_chronic_problem_row_cancel');
        if (!!procedureCancelBtnNode || !!diagnosisCancelBtnNode || !!chronicProblemCancelBtnNode) {
            this.clickBtn();
            this.props.openCommonCircularDialog();
            setTimeout(() => {
                this.saveAllData(saveCallback);
                this.setState({ rightEditFlag: false });
                this.insertDxpxLog(commonConstants.INSERT_LOG_STATUS.Save + ' dxpx data changed', '/diagnosis/diagnosisMedicalRecord/diagnosisAndProcedure');
                this.props.closeCommonCircularDialog();
                this.props.closeCommonMessage();
            }, 2000);
        } else {
            this.saveAllData(saveCallback);
            this.setState({ rightEditFlag: false });
            this.insertDxpxLog(commonConstants.INSERT_LOG_STATUS.Save + ' dxpx data changed', '/diagnosis/diagnosisMedicalRecord/diagnosisAndProcedure');
        }
    };

    handleClickCancleSaveInfo = (saveCallback, isRefreshBanner=true) => {
        let procedureCancelBtnNode = document.getElementById('btn_procedure_row_cancel');
        let diagnosisCancelBtnNode = document.getElementById('btn_diagnosis_row_cancel');
        let chronicProblemCancelBtnNode = document.getElementById('btn_chronic_problem_row_cancel');
        if (!!procedureCancelBtnNode || !!diagnosisCancelBtnNode || !!chronicProblemCancelBtnNode) {
            if(document.getElementById('btn_procedure_row_save')){
                document.getElementById('btn_procedure_row_save').click();
            }
            if(document.getElementById('btn_diagnosis_row_save')){
                document.getElementById('btn_diagnosis_row_save').click();
            }
            if(document.getElementById('btn_chronic_problem_row_save')){
                document.getElementById('btn_chronic_problem_row_save').click();
            }
            this.props.openCommonCircularDialog();
            setTimeout(() => {
                this.saveAllData(saveCallback, isRefreshBanner);
                this.setState({ rightEditFlag: false });
                this.insertDxpxLog(commonConstants.INSERT_LOG_STATUS.Save + ' dxpx data changed', '/diagnosis/diagnosisMedicalRecord/diagnosisAndProcedure');
                this.props.closeCommonCircularDialog();
            }, 500);
        } else {
            this.saveAllData(saveCallback, isRefreshBanner);
            this.setState({ rightEditFlag: false });
        }
    };

    clickBtn = () =>{
        let procedureSaveBtnNode = document.getElementById('btn_procedure_row_save');
        let diagnosisSaveBtnNode = document.getElementById('btn_diagnosis_row_save');
        let chronicProblemSaveBtnNode = document.getElementById('btn_chronic_problem_row_save');
        if (procedureSaveBtnNode) {
            procedureSaveBtnNode.click();
        }
        if (diagnosisSaveBtnNode) {
            diagnosisSaveBtnNode.click();
        }
        if (chronicProblemSaveBtnNode) {
            chronicProblemSaveBtnNode.click();
        }
    }

    saveAllData = (saveCallback,isRefreshBanner=true) =>{
        let { clinic } = this.props.loginInfo;
        let encounterData = _.cloneDeep(this.props.encounterData);
        //test ALL
        encounterData.clinicCd = this.state.clinic;
        let procedureDataList = this.state.procedureDataList;
        let procedureDeleteDataList = this.state.procedureDeleteDataList;
        let procedureData = [];
        let problemDataList = this.state.problemDataList;
        let problemDeleteDataList = this.state.problemDeleteDataList;
        let problemData = [];
        let { chronicProblemDataList, chronicProblemDeletedDataList } = this.state;
        let chronicData = [];
        for (let index = 0; index < problemDataList.length; index++) {
            if (
                problemDataList[index].operationType !== undefined &&
                problemDataList[index].operationType !== null
            ) {
                problemDataList[index].isNew = problemDataList[index].isNew !== null ? (
                    problemDataList[index].isNew ? COMMON_CHECKBOX_TYPE.CHECKED : COMMON_CHECKBOX_TYPE.UNCHECKED
                ) : null;
                problemDataList[index].clinicCd = clinic.clinicCd;
                problemData.push(problemDataList[index]);
            }
        }
        problemData = problemDeleteDataList.concat(problemData);
        // chronic problem
        for (let i = 0; i < chronicProblemDataList.length; i++) {
            if (
                chronicProblemDataList[i].operationType !== undefined &&
                chronicProblemDataList[i].operationType !== null
            ) {
                chronicData.push(chronicProblemDataList[i]);
            }
        }
        chronicData = chronicData.concat(chronicProblemDeletedDataList);
        for (let index = 0; index < procedureDataList.length; index++) {
            if (
                procedureDataList[index].operationType !== undefined &&
                procedureDataList[index].operationType !== null
            ) {
                procedureDataList[index].clinicCd = clinic.clinicCd;
                procedureData.push(procedureDataList[index]);
            }
        }
        procedureData = procedureData.concat(procedureDeleteDataList);
        if (
            procedureData.length === 0 &&
            procedureDataList.length === 0 &&
            problemData.length === 0 &&
            problemDataList.length === 0 &&
            chronicData.length === 0 &&
            chronicProblemDataList.length === 0
        ) {
            this.setState({ iscallBack: false });
            let payload = { msgCode: '100103' };
            this.props.openCommonMessage(payload);
        } else {
            if (procedureData.length === 0 && problemData.length === 0 && chronicData.length === 0) {
                // Record Details this data Save
                if (saveCallback && !this.state.readMode && this.state.isShow === 'blcok') {
                    this.saveHistoricalRecord(true, isRefreshBanner);

                    if (typeof saveCallback != 'function') {
                        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+' \'Next Patient\' button' ,'/diagnosis/diagnosisMedicalRecord/diagnosisAndProcedure');
                        return false;
                    } else {
                        saveCallback(this.state.iscallBack);
                    }
                } else {
                    let payload = { msgCode: '100917', showSnackbar: true };
                    this.props.openCommonMessage(payload);
                }
                this.setState({
                    problemEditFlag: false,
                    procedureEditFlag: false,
                    iscallBack: true
                });
            } else {
                this.props.openCommonCircularDialog();
                //reverse data
                let newData = this.reverse([problemData, procedureData, chronicData]);
                let newProblemData = newData[0];
                let newProcedureData = newData[1];
                let newChronicData = newData[2];
                let params = {
                    diagnosisDtos: newProblemData,
                    procedureDtos: newProcedureData,
                    chronicProblemDtos: newChronicData,
                    encounterInfo: encounterData
                };
                //Record Details this data Save
                if (saveCallback && !this.state.readMode && this.state.isShow === 'blcok') {
                    this.saveHistoricalRecord(true, isRefreshBanner);
                }
                this.props.savePatient({
                    params,
                    callback: data => {
                        if(data.respCode===0){
                            let payload = { msgCode: data.msgCode, showSnackbar: true };
                            this.props.openCommonMessage(payload);
                            isRefreshBanner && this.props.refreshPatient({ isRefreshBannerData: true });
                            if (typeof saveCallback != 'function') {
                                this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+' \'Save\' button' ,'/diagnosis/diagnosisMedicalRecord/diagnosisAndProcedure');
                                this.refreshPageData(true);
                                return false;
                            } else {
                                this.props.closeCommonCircularDialog();
                                saveCallback(this.state.iscallBack);
                            }
                        }else{
                            if (data) {
                                this.props.closeCommonCircularDialog();
                                let payload = {
                                    msgCode: data,
                                    btnActions:
                                    {
                                        btn1Click: () => {
                                            this.refreshPageData(true);
                                            isRefreshBanner && this.props.refreshPatient({ isRefreshBannerData: true });
                                        },
                                        btn2Click: () => {
                                            this.props.closeCommonCircularDialog();
                                        }
                                    }
                                };
                                this.props.dispatch(openCommonMessage(payload));
                            } else{
                                isRefreshBanner && this.props.refreshPatient({ isRefreshBannerData: true });
                                if (typeof saveCallback != 'function') {
                                    this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+' \'Save\' button' ,'/diagnosis/diagnosisMedicalRecord/diagnosisAndProcedure');
                                    return false;
                                } else {
                                    saveCallback(this.state.iscallBack);
                                }
                                this.setState({
                                    historicalRecordProcedureScrollFlag: false,
                                    historicalRecordProblemScrollFlag: false,
                                    problemDeleteDataList: [],
                                    procedureDeleteDataList: [],
                                    chronicProblemDeletedDataList: [],
                                    rightEditFlag: false,
                                    iscallBack: true
                                });
                            }
                        }
                    }
                });
            }
        }
    }

    refreshPageData = (clickSaveFlag) => {
        let { encounterData } = this.props;
        let tempObj = encounterData;
        if (!isUndefined(tempObj)) {
            this.loadHistoricalRecords({
                patientKey: tempObj.patientKey,
                serviceCd: this.state.service,
                clinicCd: this.state.clinic,
                recordType: this.state.recordType
            },false,clickSaveFlag);
            this.loadData({
                patientKey: tempObj.patientKey,
                encounterId: tempObj.encounterId
            }, true);
            this.scrollToTop(
                'historicalRecordProcedureDiv'
            );
            this.scrollToTop(
                'historicalRecordProblemDiv'
            );
            this.setState({
                problemEditFlag: false,
                procedureEditFlag: false,
                isShowRecordDetailDiv: 'none',
                diagnosisId: '',
                //Record Details this data Save
                isShowRecordDetailText: 'none',
                isShow: 'none'
            });
        }
        this.setState({
            historicalRecordProcedureScrollFlag: false,
            historicalRecordProblemScrollFlag: false,
            problemDeleteDataList: [],
            procedureDeleteDataList: [],
            chronicProblemDeletedDataList: [],
            rightEditFlag: false,
            iscallBack: true
        });
    }

    handleCloseDialog = () => {
        let { leftEditFlag,rightEditFlag } = this.state;
        let detailChange = this.detailsRef.current.getTextAreaValue() != this.state.remarks ? true : false;
        let isNews = this.newRef.current.isCheck() ? COMMON_CHECKBOX_TYPE.CHECKED : COMMON_CHECKBOX_TYPE.UNCHECKED;
        let isNewsChange = isNews != this.state.isNews ? true : false;
        if (detailChange||isNewsChange||leftEditFlag||rightEditFlag) {
          let payload = {
            msgCode:COMMON_CODE.SAVE_WARING,
            btnActions:{
              btn1Click: () => {
                this.props.deleteSubTabs(accessRightEnum.dxpxHistoricalRecord);
              }
            }
          };
          this.props.openCommonMessage(payload);
        } else {
          this.props.deleteSubTabs(accessRightEnum.dxpxHistoricalRecord);
        }
    };

    handleActionSave = (event, tableProps, id) => {
        const { problemStatusList, procedureStatusList } = this.state;
        let rowData = tableProps.data;
        if (id === 'btn_chronic_problem_row_save') {
            this.setState({
                noDataTip: 'There is no data.',
                rightEditFlag: true,
                chronicProblemSelectionData: []
            });
            let statusProblemObj = problemStatusList.find(item => item.diagnosisStatusCd === rowData.status);
            if (this.valueIsNullable(rowData.chronicProblemId) || rowData.operationType === 'I') {
                this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ` '✓'(Confirm) button in Chronic Problem list (New record is selected; Chronic Problem ID: null; Problem: ${rowData.problemText}; Status: ${statusProblemObj.diagnosisStatusDesc}; Details: ${rowData.remarks})`, '');
            } else {
                this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ` '✓'(Confirm) button in Chronic Problem list(Chronic Problem ID: ${rowData.chronicProblemId}; Problem: ${rowData.problemText}; Status: ${statusProblemObj.diagnosisStatusDesc}; Details: ${rowData.remarks})`, '');
            }
        } else if (id === 'btn_diagnosis_row_save') {
            let statusChronicObj = problemStatusList.find(item => _.trim(item.diagnosisStatusCd) === _.trim(rowData.diagnosisStatusCd));
            this.setState({
                noDataTip: 'There is no data.',
                rightEditFlag: true,
                diagnosisSelectionData: []
            });
            if (rowData.operationType === 'I') {
                this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ` '✓'(Confirm) button in Problem list (New record is selected; Problem ID: null; Problem: ${rowData.diagnosisText}; Status: ${statusChronicObj.diagnosisStatusDesc}; Details: ${rowData.remarks}; Is New: ${rowData.isNew == COMMON_CHECKBOX_TYPE.CHECKED ? true : false})`, '');
            } else {
                this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ` '✓'(Confirm) button in   Problem list(Problem ID: ${rowData.diagnosisId}; Problem: ${rowData.diagnosisText}; Status: ${statusChronicObj.diagnosisStatusDesc}; Details: ${rowData.remarks}; Is New: ${rowData.isNew == COMMON_CHECKBOX_TYPE.CHECKED ? true : false})`, '');
            }
        } else {
            let statusProcedureObj = procedureStatusList.find(item => item.diagnosisStatusCd === rowData.diagnosisStatusCd);
            this.setState({
                noDataTip: 'There is no data.',
                rightEditFlag: true
            });
            if (this.valueIsNullable(rowData.procedureId) || rowData.operationType === 'I') {
                this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ` '✓'(Confirm) button in Procedure list (New record is selected; Procedure ID: null; Procedure: ${rowData.procedureText} ;Status: ${statusProcedureObj.diagnosisStatusDesc}; Details: ${rowData.remarks})`, '');
            } else {
                this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ` '✓'(Confirm) button in Procedure list(Procedure ID: ${rowData.procedureId}; Procedure: ${rowData.procedureText}; Status: ${statusProcedureObj.diagnosisStatusDesc}; Details: ${rowData.remarks})`, '');
            }
        }
        tableProps.action.onClick(event, tableProps.data);
    };

    editStatusCheck=()=>{
        let editFlag=false;
        let diagnosisEditFlag=document.getElementById('btn_diagnosis_row_cancel');
        let procedureEditFlag=document.getElementById('btn_procedure_row_cancel');
        let chronicEditFlag=document.getElementById('btn_chronic_problem_row_cancel');
        if(!!diagnosisEditFlag||!!procedureEditFlag||!!chronicEditFlag||this.state.leftEditFlag||this.state.rightEditFlag||this.detailsAndNewIsEdit()){
            editFlag=true;
        } else {
            editFlag=this.state.problemEditFlag||this.state.procedureEditFlag;
        }
        return editFlag;
    }

    detailsAndNewIsEdit= () => {
        let { selectedHistoricalRecord } = this.state;
        let isEdit = false;
        if(selectedHistoricalRecord.remarks != undefined) {
            let currentIsNew = this.newRef.current && this.newRef.current.isCheck() ? COMMON_CHECKBOX_TYPE.CHECKED : COMMON_CHECKBOX_TYPE.UNCHECKED;
            if(this.detailsRef.current.getTextAreaValue() !== selectedHistoricalRecord.remarks
            || (currentIsNew !== selectedHistoricalRecord.isNew)) {
                isEdit = true;
            }
        }
        return isEdit;
    }

    diagnosisSelectionChange=(selectionData)=>{
        this.setState({diagnosisSelectionData:selectionData});
    }

    chronicProblemSelectionChange=(selectionData)=>{
        this.setState({chronicProblemSelectionData:selectionData});
    }
    //cpoy Diagnosis to ChronicProblem
    validateDiagnosisSelectionToChronicProblemTable = () => {
        let cancelBtnNode = document.getElementById('btn_chronic_problem_row_cancel');
        if (!!cancelBtnNode) {
            let saveBtnNode = document.getElementById(
                'btn_chronic_problem_row_save'
            );
            saveBtnNode.click();
            setTimeout(() => {
                this.copyDiagnosisSelectionToChronicProblemTable();
            }, 2000);
        } else {
            this.copyDiagnosisSelectionToChronicProblemTable();
        }
    }
    copyDiagnosisSelectionToChronicProblemTable=()=>{
        const { loginInfo} = this.props;
        const {diagnosisSelectionData=[],chronicProblemSelectionData=[], problemStatusCdList }=this.state;
        let newChronicProblemSelectionData=[];
        let addChronicObj={};
        let currentDate = new Date();
        let content='Selected Problem(s):';
        if(diagnosisSelectionData.length){
            const { encounterData } = this.props;
            let chronicProblemDataList = JSON.parse(JSON.stringify(this.state.chronicProblemDataList))||[];
            let chronicSelectIndex=[];
            chronicProblemSelectionData.forEach((data)=>{
                chronicSelectIndex.push(data.rowId);
            });
            diagnosisSelectionData.forEach((data)=>{
                let index =findIndex(chronicProblemDataList,(dataItem)=>{
                    return dataItem.problemText === data.diagnosisText;
                });
                content+=` ${data.diagnosisId}(${data.diagnosisText});`;
                if(diagnosisSelectionData.length===1){
                    if (index === -1) {
                         addChronicObj={
                            chronicProblemId:null,
                            patientKey:encounterData.patientKey,
                            codeTermId:data.codeTermId,
                            problemText:data.diagnosisText,
                            status:'A',
                            remarks:'',
                            saveInd:CHRONIC_SAVE_IND_TYPE.SAVE, // Add => Save
                            version:null,
                            operationType:COMMON_ACTION_TYPE.INSERT,
                            createBy:null,
                            createClinicCd:null,
                            createDtm:currentDate,
                            updateBy:null,
                            updateClinicCd:null,
                            updateDtm:null,
                            rowId:data.codeTermId+Math.random()*100,
                            serviceCd:loginInfo.service.serviceCd,
                            diagnosisId:data.diagnosisId,
                            relatedTable: data.ownerTable
                        };
                        chronicProblemDataList.forEach(chronicProblem => {
                            chronicSelectIndex.forEach((rowId)=>{
                                if(rowId===chronicProblem.rowId){
                                    newChronicProblemSelectionData.push(chronicProblem);
                                }
                            });
                        });
                        this.tableScrollToTop('dxpx_chronic_problem_table');
                        this.setState({
                            rightEditFlag:true,
                            diagnosisSelectionData:[],
                            chronicProblemSelectionData:newChronicProblemSelectionData,
                            initialChronic: addChronicObj
                        });
                        const materialTable = this.chronicMaterialTableRef.current;
                        materialTable.dataManager.changeRowEditing();
                        materialTable.setState({
                          ...materialTable.dataManager.getRenderState(),
                          showAddRow: true
                        });
                    } else {
                        this.props.openCommonMessage({
                            msgCode:PROCEDURE_CODE.DUPLICATE_CHRONIC_PROBLEM
                        });
                    }

                }else{
                    if (index === -1) {
                        chronicProblemDataList.unshift({
                            chronicProblemId:null,
                            patientKey:encounterData.patientKey,
                            codeTermId:data.codeTermId,
                            problemText:data.diagnosisText,
                            status:'A',
                            remarks:'',
                            saveInd:CHRONIC_SAVE_IND_TYPE.SAVE, // Add => Save
                            version:null,
                            operationType:COMMON_ACTION_TYPE.INSERT,
                            createBy:null,
                            createClinicCd:null,
                            createDtm:currentDate,
                            updateBy:null,
                            updateClinicCd:null,
                            updateDtm:null,
                            rowId:data.codeTermId+Math.random()*100,
                            serviceCd:loginInfo.service.serviceCd,
                            diagnosisId:data.diagnosisId,
                            relatedTable: data.ownerTable
                        });
                    } else {
                        this.props.openCommonMessage({
                            msgCode:PROCEDURE_CODE.DUPLICATE_CHRONIC_PROBLEM
                        });
                    }
                    chronicProblemDataList.forEach(chronicProblem => {
                        chronicSelectIndex.forEach((rowId)=>{
                            if(rowId===chronicProblem.rowId){
                                newChronicProblemSelectionData.push(chronicProblem);
                            }
                        });
                    });
                    chronicProblemDataList = this.reorder(chronicProblemDataList, problemStatusCdList);
                    this.tableScrollToTop('dxpx_chronic_problem_table');
                    this.setState({
                        chronicProblemDataList,
                        rightEditFlag:true,
                        diagnosisSelectionData:[],
                        chronicProblemSelectionData:newChronicProblemSelectionData
                    });
                }
            });
        }
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click + ' \'>\' button to copy problem to chronic problem', '',content);
    }

    addChronic = obj => {
        const { problemStatusCdList } = this.state;
        let chronicDataList = JSON.parse(JSON.stringify(this.state.chronicProblemDataList));
        chronicDataList.unshift(obj);
        chronicDataList = this.reorder(chronicDataList, problemStatusCdList);
        this.setState({
            chronicProblemDataList: chronicDataList,
            chronicOriginDataList:chronicDataList,
            rightEditFlag:true,
            initialChronic: {}
        });
    }

    validateChronicProblemSelectionToDiagnosisTable = () => {
        const { chronicProblemSelectionData = [] } = this.state;
        let duplicateFlag = dxpxUtils.checkDuplicationFromChronicProblem(this.state.problemDataList, chronicProblemSelectionData);
        let cancelBtnNode = document.getElementById('btn_diagnosis_row_cancel');
        if (!!cancelBtnNode) {
            let saveBtnNode = document.getElementById(
                'btn_diagnosis_row_save'
            );
            saveBtnNode.click();
            setTimeout(() => {
                if (duplicateFlag) {
                    this.props.openCommonMessage({
                        msgCode: PROCEDURE_CODE.DUPLICATED_SELECTION,
                        params: [
                            { name: 'dxpxTypeTitle', value: 'Problem' },
                            { name: 'dxpxType', value: 'problem' }
                        ],
                        btnActions: {
                            // OK
                            btn1Click: () => {
                                this.copyChronicProblemSelectionToDiagnosisTable();
                            }
                        }
                    });
                } else {
                    this.copyChronicProblemSelectionToDiagnosisTable();
                }
            }, 3000);
        } else {
            this.copyChronicProblemSelectionToDiagnosisTable();
        }
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ' </copy to problem button the right table data is migrated to the left table', '');
    }
    copyChronicProblemSelectionToDiagnosisTable=()=>{
        const {chronicProblemSelectionData=[],diagnosisSelectionData=[]}=this.state;
        let newSelectProblemData=[],selectProblesIndex=[];
        diagnosisSelectionData.forEach(problem => {
            selectProblesIndex.push(problem.rowId);
        });
        let content='Selected Problem(s):';
        if(chronicProblemSelectionData.length){
            const { encounterData } = this.props;
            let problemDataList = JSON.parse(JSON.stringify(this.state.problemDataList));
            if(chronicProblemSelectionData.length===1){
               let diagnosisId=this.genNonDuplicateID(4);
               let selectedchronicProblem= chronicProblemSelectionData[chronicProblemSelectionData.length-1];
               let addProblemObj={
                    createBy: null,
                    createClinicCd: null,
                    createDtm: null,
                    diagnosisStatusCd: 'A',
                    encounterId: encounterData.encounterId,
                    patientKey: encounterData.patientKey,
                    diagnosisId,
                    diagnosisText: selectedchronicProblem.problemText,
                    remarks:'',
                    statusDisPlayName: '',
                    codeTermId: selectedchronicProblem.codeTermId,
                    updateBy: null,
                    updateClinicCd: null,
                    updateDtm: null,
                    version: null,
                    operationType:COMMON_ACTION_TYPE.INSERT,
                    rowId:selectedchronicProblem.codeTermId+Math.random()*100
                };
                this.tableScrollToTop('dxpx_diagnosis_table');
                this.setState({
                    chronicProblemSelectionData:[],
                    diagnosisSelectionData:newSelectProblemData,
                    problemEditFlag: true,
                    rightEditFlag:true,
                    initialProblem: addProblemObj
                });
                const materialTable = this.problemMaterialTableRef.current;
                materialTable.dataManager.changeRowEditing();
                materialTable.setState({
                  ...materialTable.dataManager.getRenderState(),
                  showAddRow: true
                });
                content+=` ${selectedchronicProblem.chronicProblemId}(${selectedchronicProblem.diagnosisText});`;
            }else{
                chronicProblemSelectionData.forEach((data)=>{
                    let diagnosisId=this.genNonDuplicateID(4);
                    content+=` ${data.chronicProblemId}(${data.problemText});`;
                    problemDataList.unshift({
                        createBy: null,
                        createClinicCd: null,
                        createDtm: null,
                        diagnosisStatusCd: 'A',
                        encounterId: encounterData.encounterId,
                        patientKey: encounterData.patientKey,
                        diagnosisId: diagnosisId,
                        diagnosisText: data.problemText,
                        remarks: data.remarks,
                        statusDisPlayName: '',
                        codeTermId: data.codeTermId,
                        updateBy: null,
                        updateClinicCd: null,
                        updateDtm: null,
                        version: null,
                        operationType:COMMON_ACTION_TYPE.INSERT,
                        rowId:data.codeTermId+Math.random()*100
                    });
                });
                problemDataList.forEach(problem => {
                    selectProblesIndex.forEach((rowId)=>{
                        if(rowId===problem.rowId){
                            newSelectProblemData.push(problem);
                        }
                    });
                });
            }
            this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click + ' \'<\' button to copy chronic problem to problem', '',content);
            this.tableScrollToTop('dxpx_diagnosis_table');
            this.setState({
                problemDataList,
                problemEditFlag:true,
                chronicProblemSelectionData:[],
                diagnosisSelectionData:newSelectProblemData
            });
        }
    }

    getLocalTermStatus=(serviceCd)=>{
      let params = {serviceCd: serviceCd};
      this.props.getCodeLocalTerm({params:params,callback:(valMap)=>{
        if(valMap!==null){
            let defaultLocalTerm = valMap.has(DIAGNOSIS_TYPE_CD.DEFAULT) ? valMap.get(DIAGNOSIS_TYPE_CD.DEFAULT) : null;
            let problemLocalTerm = valMap.has(DIAGNOSIS_TYPE_CD.PROBLEM) ? valMap.get(DIAGNOSIS_TYPE_CD.PROBLEM) : defaultLocalTerm;
            let procedureLocalTerm = valMap.has(DIAGNOSIS_TYPE_CD.PROCEDURE) ? valMap.get(DIAGNOSIS_TYPE_CD.PROCEDURE) : defaultLocalTerm;

            if (problemLocalTerm !== null) {
                this.setState({
                    problemLocalTermChecked:'Y'===problemLocalTerm.defaultLocalTerm,
                    problemLocalTermDisabled:'Y'===problemLocalTerm.disableTerm
                });
            }
            if (procedureLocalTerm !== null) {
                this.setState({
                    procedureLocalTermChecked:'Y'===procedureLocalTerm.defaultLocalTerm,
                    procedureLocalTermDisabled:'Y'===procedureLocalTerm.disableTerm
                });
            }
        }
      }});
    }

    handleProblemLocalTermChange=(event)=>{
      this.setState({
        problemLocalTermChecked:!this.state.problemLocalTermChecked
      });
    }

    handleProcedureLocalTermChange=(event)=>{
        this.setState({
            procedureLocalTermChecked:!this.state.procedureLocalTermChecked
        });
    }


    checkProblemToChronicData = (rowData) => {
        const { chronicProblemDataList, initialChronic } = this.state;
        let flag = false;
        let tempObj = {};
        if (chronicProblemDataList.length > 0) {
            tempObj = chronicProblemDataList.find(item => item.diagnosisId === rowData.diagnosisId && (!rowData.version || (rowData.version && rowData.ownerTable === item.relatedTable)));
            if (!isEmpty(tempObj)) {
                flag = true;
            }
            if (rowData.diagnosisId === initialChronic.diagnosisId) {
                flag = true;
            }
        } else {
            if (rowData.diagnosisId === initialChronic.diagnosisId) {
                flag = true;
            }
        }
        return flag;
    }

    insertDxpxLog = (desc, apiName = '',content='') => {
        commonUtils.commonInsertLog(apiName, 'F111', 'Problem/Procedure', desc, 'diagnosis',content);
    };
    genNonDuplicateID = (length) => {
        return Number(Math.random().toString().substr(3, length) + Date.now());
    }
    handleCancelLog = (name, apiName = '') => {
        this.insertDxpxLog(name, apiName);
    }
    handleProblemEditClick =() =>{
        this.insertDxpxLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Click+' \'Edit\' button' ,'');
    }
    valueIsNullable = (getValue) =>{
        let flag=true;
        let value=_.trim(getValue);
        if(!value||value!=''||value!=undefined||!_.isNull(value)){
            flag=false;
        }
        return flag;
    }

    handleAddPsoriasis = () => {
        const { patientInfo, encounterData, loginInfo } = this.props;
        let { encounterId, encounterDate } = encounterData;
        let { patientKey } = patientInfo;
        this.props.openCommonCircularDialog();

        this.props.addPsoriasis({
            params: {
                patientKey,
                encounterId,
                encounterDate: moment(encounterDate).format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK),
                ehrId_site: loginInfo.clinic.ehrId
            },
            callback: data => {
                this.props.closeCommonCircularDialog();
                if (data.msgCode) {
                    this.props.openCommonMessage({ msgCode: data.msgCode, showSnackbar: true });
                }
                // refresh patientBanner
                this.props.refreshPatient({
                    isRefreshBannerData: true
                });
            }
        });
    }

    checkPsoriasisStatus = (psoInfo, sysdate) => {
        let privilege = false;
        let label = 'PSO';
        let type = 0;
        if (!psoInfo) {
            return { privilege, label, type };
        }
        if (psoInfo.withPsoriasis === 0) {
            privilege = true;
        } else if (psoInfo.withPsoriasis === 1) {
            if (psoInfo.withPASI === 0) {
                type = 1;
            } else if (psoInfo.withPASI === 1) {
                if (psoInfo.dueDateOfLastPASI) {
                    const dueDateOfLastPASI = moment(psoInfo.dueDateOfLastPASI, Enum.DATE_FORMAT_EYMD_VALUE);
                    label = `PSO: ${dueDateOfLastPASI.format(Enum.DATE_FORMAT_EDMY_VALUE)}`;

                    if (sysdate.diff(dueDateOfLastPASI, 'days', true) >= 0) {
                        type = 2;
                    } else {
                        type = 1;
                    }
                }
            }
        }
        return { privilege, label, type };
    };

    updatePsoriasisStatus = () => {
        const { psoInfo = {} } = this.props;
        this.props.getCurrentDate({
            callback: data => {
                let sysdate = moment(data, Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK);
                const psoMess = this.checkPsoriasisStatus(psoInfo, sysdate);
                this.setState({ psoMess });
            }
        });
    }

    handleRefreshData = () => {
        let procedureCancelBtnNode = document.getElementById('btn_procedure_row_cancel');
        let diagnosisCancelBtnNode = document.getElementById('btn_diagnosis_row_cancel');
        let chronicProblemCancelBtnNode = document.getElementById('btn_chronic_problem_row_cancel');
        this.props.openCommonCircularDialog();
        if (!!procedureCancelBtnNode || !!diagnosisCancelBtnNode || !!chronicProblemCancelBtnNode) {
            this.clickBtn();
            setTimeout(() => {
                this.refreshWithChange();
            }, 2000);
        } else {
            this.refreshWithChange();
        }
    }

    refreshWithChange() {
        const { encounterData } = this.props;
        const { chronicProblemDataList, chronicProblemDeletedDataList, procedureDataList, procedureDeleteDataList, problemDataList, problemDeleteDataList } = this.state;
        let procedureData = [];
        let problemData = [];
        let chronicData = [];

        for (let index = 0; index < problemDataList.length; index++) {
            if (
                problemDataList[index].diagnosisId !== undefined &&
                problemDataList[index].diagnosisId !== null
            ) {
                problemData.push(problemDataList[index]);
            }
        }
        problemData = problemDeleteDataList.concat(problemData);

        // chronic problem
        for (let i = 0; i < chronicProblemDataList.length; i++) {
            if (
                chronicProblemDataList[i].diagnosisId !== undefined &&
                chronicProblemDataList[i].diagnosisId !== null
            ) {
                chronicData.push(chronicProblemDataList[i]);
            }
        }
        chronicData = chronicProblemDeletedDataList.concat(chronicData);

        for (let index = 0; index < procedureDataList.length; index++) {
            if (
                procedureDataList[index].procedureId !== undefined &&
                procedureDataList[index].procedureId !== null
            ) {
                procedureData.push(procedureDataList[index]);
            }
        }
        procedureData = procedureDeleteDataList.concat(procedureData);

        this.loadHistoricalRecords({
            patientKey: encounterData.patientKey,
            serviceCd: this.state.service,
            clinicCd: this.state.clinic,
            recordType: this.state.recordType
        }, true, false);

        const params = {
            patientKey: encounterData.patientKey,
            encounterId: encounterData.encounterId
        };
        this.props.getALLDxPxList({
            params,
            callback: data => {
                let {diagnosis=[],procedure=[],chronicProblem=[]}=data.data;
                diagnosis.forEach(element => {
                    element.rowId=element.codeTermId+Math.random()*100;
                    element.isEdit = false;
                    element.isNewFlag = false;
                });
                const filterDiagnosis = _.differenceBy(diagnosis, problemData, 'diagnosisId');

                for (const key in procedure) {
                     procedure[key].isEdit = false;
                     procedure[key].isNewFlag = false;
                }
                const filterProcedure = _.differenceBy(procedure, procedureData, 'procedureId');

                chronicProblem.forEach(element => {
                    element.rowId=element.codeTermId+Math.random()*100;
                    element.isEdit = false;
                    element.isNewFlag = false;
                });
                const filterChronicProblem = _.differenceBy(chronicProblem, chronicData, 'diagnosisId');
                const diagnosisData = filterDiagnosis.concat(problemDataList);
                const chronicProblemData = filterChronicProblem.concat(chronicProblemDataList);
                this.setState({
                    procedureDataList: filterProcedure.concat(procedureDataList),
                    problemDataList: diagnosisData,
                    chronicProblemDataList: chronicProblemData,
                    problemOriginDataList: diagnosisData,
                    chronicOriginDataList: chronicProblemData
                });
                this.props.closeCommonCircularDialog();
            }
        });
    }

    render() {
        const { classes, encounterData, sysConfig, loginInfo, psoInfo } = this.props;
        const serviceCd = loginInfo && loginInfo.service && loginInfo.service.serviceCd;
        let {
            problemEnquiryMode,
            procedureEnquiryMode,
            service,
            serviceList,
            clinic,
            clinicList,
            problemDialogOpenFlag,
            procedureDialogOpenFlag,
            searchProblemRecordTotalNums,
            searchProblemRecordList,
            searchProcedureRecordList,
            searchProcedureRecordTotalNums,
            isShowBtnProble,
            chronicProblemColumns,
            diagnosisSelectionData = [],
            chronicProblemSelectionData = [],
            problemLocalTermChecked,
            procedureLocalTermChecked,
            problemLocalTermDisabled,
            procedureLocalTermDisabled,
            showDxPxHistory,
            selectedHistoricalRecord,
            initialProblem,
            initialProcedure,
            initialChronic,
            encounterDesc,
            psoMess
        } = this.state;
         let searchAddProblem = {
            isShowBtnProble: isShowBtnProble,
            prbleMark: true,
            patientKey: !!encounterData ? encounterData.patientKey : null,
            encounterId: !!encounterData ? encounterData.encounterId : null,
            status: DEFAULT_PROBLEM_SAVE_STATUS,
            pageSize: !!sysConfig[COMMON_SYS_CONFIG_KEY.PAGE_SIZE]
                ? toInteger(sysConfig[COMMON_SYS_CONFIG_KEY.PAGE_SIZE].value)
                : DEFAULT_OFFLINE_PAGE_SIZE
        };

        let problemFavouriteDialogProps = {
            patientKey: !!encounterData ? encounterData.patientKey : null,
            encounterId: !!encounterData ? encounterData.encounterId : null,
            isOpen: problemDialogOpenFlag,
            mode: PROBLEM_MODE,
            handleClose: this.handleProblemServiceFavouriteDialogClose,
            cancelBtnNode: document.getElementById('btn_diagnosis_row_cancel'),
            addMethod: this.addProblemObj,
            type:'Problem',
            insertDxpxLog: this.insertDxpxLog
        };

        let searchAddProcedure = {
            patientKey: !!encounterData ? encounterData.patientKey : null,
            encounterId: !!encounterData ? encounterData.encounterId : null,
            status: DEFAULT_PROCEDURE_SAVE_STATUS,
            pageSize: !!sysConfig[COMMON_SYS_CONFIG_KEY.PAGE_SIZE]
                ? toInteger(sysConfig[COMMON_SYS_CONFIG_KEY.PAGE_SIZE].value)
                : DEFAULT_OFFLINE_PAGE_SIZE
        };

        let procedureFavouriteDialogProps = {
            patientKey: !!encounterData ? encounterData.patientKey : null,
            encounterId: !!encounterData ? encounterData.encounterId : null,
            isOpen: procedureDialogOpenFlag,
            mode: PROCEDURE_MODE,
            handleClose: this.handleProcedureServiceFavouriteDialogClose,
            cancelBtnNode: document.getElementById('btn_procedure_row_cancel'),
            addMethod: this.addProcedureObj,
            type:'Procedure',
            insertDxpxLog: this.insertDxpxLog
        };

        const MenuProps = {
            style: {
                fontSize: font.fontSize,
                fontFamily: font.fontFamily
            }
        };

        const buttonBar={
            isEdit:this.editStatusCheck,
            title:'Problem/Procedure',
            logSaveApi:'/diagnosis/diagnosisMedicalRecord/diagnosisAndProcedure',
            saveFuntion:this.handleClickCancleSave,
            handleCancelLog: this.handleCancelLog,
            autoCloseBtn1:false,
            buttons:[{
                title:'Save',
                onClick:this.handleClickSave,
                id:'default_save_button',
                disabled:problemEnquiryMode&&procedureEnquiryMode
            }],
            isPosition:true
          };
        return (
            <MuiThemeProvider theme={theme}>
                <MuiThemeProvider theme={this.customTheme}>
                    <Grid container style={{height:'100%'}}>
                        <Grid item xs style={{color: color.cimsTextColor, flex:'0 0 auto',width:'400px',background:'#ccc',height:'100%',display:showDxPxHistory?'block':'none'}}>
                            <Box ref={this.historyContent} onButtonClick={this.handleIsShowHistory} showDxPxHistory={'true'} title={'Problem/Procedure History'} height={'50%'}>
                                <div id="historyForm">
                                    <FormControl className={classes.formControl}>
                                        <Grid container spacing={2} style={{padding:'6px 12px'}}>
                                            <Grid item xs={4}>
                                                <FormControl style={{width:'100%' }}>
                                                    <InputLabel classes={{root: classes.inputLabel,focused: classes.inputLabel}}>Service</InputLabel>
                                                    <SelectComponent
                                                        className={classes.boxSelect}
                                                        id={'DxPx_ServiceTypeSelectField'}
                                                        onChange={this.serviceValueOnChange}
                                                        options={serviceList}
                                                        value={service}
                                                        onChangeFlag
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <FormControl style={{width:'100%'}}>
                                                    <InputLabel classes={{root: classes.inputLabel,focused: classes.inputLabel}}>Clinic</InputLabel>
                                                    <SelectComponent
                                                        className={classes.boxSelect}
                                                        id={'DxPx_ClinicTypeSelectFieldsss'}
                                                        onChange={this.clinicValueOnChange}
                                                        options={clinicList}
                                                        value={clinic}
                                                        disabled={service==='ALL'&&clinic==='ALL'?true:false}
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <FormControl style={{width:'100%'}}>
                                                <InputLabel classes={{root: classes.inputLabel,focused: classes.inputLabel}}>Record Type</InputLabel>
                                                <SelectComponent
                                                    className={classes.boxSelect}
                                                    id={'DxPx_RecordTypeSelectField'}
                                                    onChange={this.recordTypeValueOnChange}
                                                    options={this.props.recordTypeList.map(
                                                        item => ({
                                                            value: item.diagnosisTypeCd,
                                                            title: item.diagnosisTypeDesc
                                                        })
                                                    )}
                                                    value={this.state.recordType}
                                                />
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </FormControl>
                                </div>

                                <List data={this.state.historicalRecordList}
                                    wrapperContentHeight={this.state.historyHeight}
                                    onSelectionChange={this.changeMedicalRecord}
                                    components={{
                                        Row: props => {
                                            return (
                                                <MTableBodyRow
                                                    {...props}
                                                    draggable="true"
                                                    onDragEnd={this.dragMedicalRecordEnd}
                                                    onDragStart={(e)=>{ this.dragMedicalRecord(e,props.data); }}
                                                />
                                            );
                                        }
                                    }}
                                    selectedHistoricalRecord={selectedHistoricalRecord}
                                />
                            </Box>

                            <Box title={'Record Details'} height={'50%'}>
                                <Typography
                                    className={classes.table}
                                    component="div"
                                    id="textRecordWhite"
                                    style={{
                                        height: '100%',
                                        minHeight: '275px',
                                        position: 'relative',
                                        display: this.state.isShowRecordDetailDiv === 'none' ? 'block' : 'none'
                                    }}
                                />
                                <Typography
                                    className={classes.table}
                                    component="div"
                                    id="textRecord"
                                    style={{
                                        // height: '100%',
                                        height: 'inherit',
                                        position: 'relative',
                                        display: this.state.isShowRecordDetailDiv
                                    }}
                                >
                                <div style={{height:'calc(100% - 36px)'}}>
                                    <Grid container  item xs={12} style={{height:'100%',padding:'20px 5px 0px 5px'}}>
                                    <Grid container  item xs={12} >
                                        <Grid container  item xs={4}>
                                        <Typography
                                            component="div"
                                            style={{
                                                paddingLeft: '9px',
                                                fontStyle: 'normal',
                                                fontSize: font.fontSize

                                            }}
                                        >
                                            {this.state.selectedHistoricalRecord.recordType === 'PX'?'Procedure:':'Problem:'}
                                        </Typography>

                                        </Grid>
                                        <Grid container  item xs={8} className={classes.historyDetailsField}>
                                        <Typography
                                            component="div"
                                            style={{
                                                    fontStyle: 'normal',
                                                    fontSize: font.fontSize,
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'pre-wrap'
                                                }}
                                        >
                                            {this.state.diagnosisText !== undefined ? this.state.diagnosisText : ''}
                                        </Typography>
                                        </Grid>
                                        </Grid>
                                    <Grid container  item xs={12} >
                                    <Grid container  item xs={4}>
                                        <Typography
                                            component="div"
                                            style={{
                                                padding: '8px',
                                                fontStyle: 'normal',
                                                fontSize: font.fontSize
                                            }}
                                        >
                                        <span
                                            style={{
                                                fontStyle: 'normal',
                                                fontSize: font.fontSize
                                            }}
                                        >
                                            Status:
                                        </span>
                                        </Typography>
                                    </Grid>
                                    <Grid container  item xs={8} className={classes.historyDetailsField}>
                                        <Typography component="div" style={{ fontStyle: 'normal', fontSize: font.fontSize }}>
                                        <FormControl
                                            className={classes.SelectFormControl}
                                            style={{ display: 'contents'}}
                                        >
                                            <Select
                                                classes={{ selectMenu: classes.selectMenu }}
                                                className={classes.statusSelect}
                                                displayEmpty
                                                // SelectDisplayProps={MenuProps}
                                                onChange={this.handleChange}
                                                value={this.state.status}
                                                disabled={
                                                    ((this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.DIAGNOSIS&&problemEnquiryMode)||
                                                        (this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.PROCEDURE&&procedureEnquiryMode))?
                                                    true:(this.state.readMode?true:this.state.readOnlyRecordDetail)
                                                }
                                            >
                                            {this.state.statusList.map(
                                                (item, index) => (
                                                    <MenuItem
                                                        classes={{ root: classes.list_title }}
                                                        key={index}
                                                        value={item.diagnosisStatusCd}
                                                    >
                                                        {item.diagnosisStatusDesc}
                                                    </MenuItem>
                                                )
                                            )}
                                            </Select>
                                        </FormControl>
                                            {this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.DIAGNOSIS?(
                                        <Typography
                                            component="div"
                                            style={{
                                                display: 'inline-flex',
                                                paddingLeft: '35px',
                                                fontStyle: 'normal',
                                                fontSize: font.fontSize
                                            }}
                                        >
                                            <div style={{float:'left'}}>New:</div>
                                            {/* <div style={this.state.readOnlyRecordDetail?{float:'left',color:'#B8BCB9'}:{float:'left'}}>New:</div> */}
                                            <div>
                                                <JCheck
                                                    className={classes.historyCheckbox}
                                                    id="checkbox_diagnosis_history_detail_new"
                                                    color="primary"
                                                    checkedVal={this.state.isNew == COMMON_CHECKBOX_TYPE.CHECKED ? true : false}
                                                    // insertDxpxLog={this.insertDxpxLog}
                                                    // onChange={this.handleDiagnosisHistoryDetailChange}
                                                    key={this.state.refreshKey}
                                                    disabled={problemEnquiryMode?true:(this.state.readMode?true:this.state.readOnlyRecordDetail)}
                                                    ref={this.newRef}
                                                    updateState={this.updateChildState}
                                                />
                                            </div>
                                        </Typography>
                                        ):null}
                                        </Typography>
                                    </Grid>
                                    </Grid>
                                    <Grid container  item xs={12} style={{minHeight:155}}>
                                    <Grid container  item xs={4} >
                                        <Typography
                                            component="div"
                                            style={{
                                                float: 'left',
                                                marginTop: '2px',
                                                paddingLeft: '9px',
                                                fontStyle: 'normal'
                                            }}
                                        >
                                            <span style={{ fontSize: font.fontSize }}>
                                            Details:
                                            </span>
                                        </Typography>
                                    </Grid>
                                    <Grid container item xs={8} className={classes.historyDetailsField}>
                                        <TextArea
                                            className={classes.textAreaBorder}
                                            style={{
                                                borderRadius:4,
                                                padding: 5,
                                                marginTop: 5,
                                                color: color.cimsTextColor,
                                                fontFamily: font.fontFamily,
                                                fontSize: font.fontSize,
                                                height: '90%',
                                                width: '100%',
                                                resize: 'none',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-all',
                                                backgroundColor: ((this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.DIAGNOSIS&&problemEnquiryMode)||
                                                (this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.PROCEDURE&&procedureEnquiryMode))
                                                ?true:(this.state.readMode?true:this.state.readOnlyRecordDetail)?color.cimsDisableColor:color.cimsBackgroundColor
                                                // backgroundColor: this.state.readMode?color.cimsDisableColor:color.cimsBackgroundColor
                                            }}
                                            ref={this.detailsRef}
                                            readOnlyVal={
                                                ((this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.DIAGNOSIS&&problemEnquiryMode)||
                                                    (this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.PROCEDURE&&procedureEnquiryMode))
                                                    ?true:(this.state.readMode?true:this.state.readOnlyRecordDetail)
                                            }
                                            val={this.state.remarks}
                                            key={this.state.refreshKey}
                                            updateState={this.updateChildState}
                                        />
                                        <Typography
                                            component="div"
                                            style={{ clear: 'both' }}
                                        />
                                    </Grid>
                                    </Grid>
                                    <Grid container  item xs={12} style={{paddingTop:5}}>
                                    <Grid container  item xs={4}>
                                        <Typography
                                            component="div"
                                            style={{
                                                paddingTop: 2,
                                                paddingLeft: '8px',
                                                fontStyle: 'normal',
                                                fontSize: font.fontSize
                                            }}
                                        >
                                            Last Updated:
                                        </Typography>

                                    </Grid>
                                    <Grid container  item xs={8} className={classes.historyDetailsField}>
                                        <Typography
                                            component="div"
                                            style={{
                                                paddingTop: 2,
                                                fontStyle: 'normal',
                                                fontSize: font.fontSize
                                            }}
                                        >
                                        {(this.state.selectedHistoricalRecord
                                            .updateByName !== undefined
                                            ? this.state
                                                    .selectedHistoricalRecord
                                                    .updateByName
                                            : '')+
                                            ' / '+(this.state.selectedHistoricalRecord
                                                .updateDtm !== undefined
                                                ? moment(
                                                        this.state
                                                            .selectedHistoricalRecord
                                                            .updateDtm
                                                    ).format('DD-MMM-YYYY HH:mm')
                                                : '')}
                                        </Typography>
                                    </Grid>
                                    </Grid>
                                </Grid>
                                </div>
                                <BottomNavigation
                                    showLabels
                                    style={{
                                        display:(this.state.readMode?'none':'flex')
                                    }}
                                    classes={{ root:classes.historyButtomRoot}}
                                >
                                    <BottomNavigationAction
                                        classes={
                                            ((this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.DIAGNOSIS&&problemEnquiryMode)||
                                            (this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.PROCEDURE&&procedureEnquiryMode))?{wrapper:classes.buttonReadColor}:
                                            (this.state.readMode?{wrapper:classes.buttonReadColor}:(this.state.isShow!=='none'?(this.state.isCpDiagnosis?{wrapper:classes.buttonReadColor}:{wrapper:classes.buttonColor}):{wrapper:classes.buttonReadColor}))
                                        }
                                        disabled={
                                            ((this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.DIAGNOSIS&&problemEnquiryMode)||
                                            (this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.PROCEDURE&&procedureEnquiryMode))?true:
                                            (this.state.readMode?true:(this.state.isShow!=='none'?this.state.isCpDiagnosis:true))
                                        }
                                        label="Delete"
                                        icon={<DeleteOutlined />}
                                        onClick={this.deleteHistoricalRecord}
                                    />
                                    <BottomNavigationAction
                                        classes={
                                            ((this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.DIAGNOSIS&&problemEnquiryMode)||
                                            (this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.PROCEDURE&&procedureEnquiryMode))?{wrapper:classes.buttonReadColor}:
                                            (this.state.readMode?{wrapper:classes.buttonReadColor}:(this.state.isShow!=='none'?{wrapper:classes.buttonColor}:{wrapper:classes.buttonReadColor}))
                                        }
                                        disabled={
                                            ((this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.DIAGNOSIS&&problemEnquiryMode)||
                                            (this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.PROCEDURE&&procedureEnquiryMode))?true:
                                            (this.state.readMode?true:(this.state.isShow!=='none'?false:true))
                                        }
                                        label="Save"
                                        icon={<SaveOutlined />}
                                        onClick={this.saveHistoricalRecord}
                                    />
                                    <BottomNavigationAction
                                        classes={{
                                            wrapper:((this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.DIAGNOSIS&&problemEnquiryMode)||
                                            (this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.PROCEDURE&&procedureEnquiryMode))?classes.buttonReadColor:classes.buttonColor
                                        }}
                                        label="Copy"
                                        disabled={
                                            ((this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.DIAGNOSIS&&problemEnquiryMode)||
                                            (this.state.selectedHistoricalRecord.recordType === TABLE_CONTENT_TYPE.PROCEDURE&&procedureEnquiryMode))
                                        }
                                        icon={<FileCopyOutlined />}
                                        onClick={this.copyHistoricalRecord}
                                    />
                                </BottomNavigation>
                            </Typography>
                        </Box>
                        </Grid>

                        {/* extend button when Hx colleapse */}
                        <Grid direction={'column'} item onClick={this.handleIsShowHistory}  xs={0} style={{height:'100%',boxShadow:this.state.showDxPxHistory? null:'-2px 2px 6px #000',borderRight:this.state.showDxPxHistory? null:'1px solid darkgrey'}}  >
                            <div  style={{height:'49%'}}></div>
                            <IconButton  onClick={this.handleIsShowHistory} style={{padding:0}}>
                            {this.state.showDxPxHistory? null: <NavigateNext />}
                            </IconButton>
                        </Grid>

                        {/* DX/PX input */}
                        <Container item container direction={'column'} justify={'space-between'} alignItems={'stretch'} buttonBar={buttonBar}>
                            <MuiThemeProvider theme={this.customTheme}>
                                <div style={{overflowX: 'auto', width: '100%', height:'100%'}}>
                                {/* input problem  */}
                                <div style={{height:'100%',overflowY:'auto',minWidth: 1500, width: '100%'}}>
                                    <Grid item container direction={'column'} wrap={'nowrap'} ref={this.boxContent} style={{padding:'8px',flex:'auto',height:'50%'}}>
                                        <Grid item style={{flex:'0 0 auto'}}>
                                            <Avatar
                                                className={classes.diagnosisAvatar}
                                                style={{
                                                    marginBottom:2,
                                                    fontSize: '13px',
                                                    fontFamily: font.fontFamily,
                                                    textAlign: 'center',
                                                    width: '21px',
                                                    height: '21px',
                                                    float: 'left',
                                                    color: COMMON_STYLE.whiteTitle
                                                }}
                                            >
                                                Dx
                                            </Avatar>
                                            <span
                                                className={classes.list_title}
                                                style={{ float: 'left', marginLeft: 3 }}
                                            >
                                                {`Problem ${problemEnquiryMode?'[View Only]':''}`}
                                            </span>
                                            <span     className={classes.list_title}
                                                style={{ float: 'right' }}
                                            >
                                                {encounterDesc}
                                            </span>
                                        </Grid>
                                        <Grid container item style={{border:'1px solid #949494',padding:'6px 6px 6px 12px', flex:'auto',position:'relative',paddingBottom: 0}}>
                                            <ButtonGroup
                                                orientation="vertical"
                                                color="primary"
                                                aria-label="vertical outlined primary button group"
                                                style={{
                                                    position:'absolute',
                                                    left:'calc(50% - 12px)',
                                                    top:'72px',
                                                    bottom:'22px',
                                                    background:color.cimsBackgroundColor,
                                                    border:'1px solid #e9e9e9',
                                                    boxSizing:'border-box',
                                                    zIndex:99,
                                                    borderRadius:0,
                                                    flexDirection: 'column'
                                                }}
                                            >
                                                <IconButton disabled={problemEnquiryMode?true:(diagnosisSelectionData.length>0?false:true)} size="small" style={{height:'50%',borderRadius:0,minWidth:'15px'}} onClick={this.validateDiagnosisSelectionToChronicProblemTable}>
                                                    <ArrowForwardIos style={{width:20}} fontSize="inherit" />
                                                </IconButton>
                                                <IconButton disabled={problemEnquiryMode?true:(chronicProblemSelectionData.length>0?false:true)} size="small" style={{height:'50%',borderRadius:0,minWidth:'15px',paddingLeft:'8px'}} onClick={this.validateChronicProblemSelectionToDiagnosisTable}>
                                                    <ArrowBackIos style={{width:20}} fontSize="inherit" />
                                                </IconButton>
                                            </ButtonGroup>
                                            <Grid item xs={6} id="historicalRecordProblemDiv"style={{padding:'4px 16px 6px 0'}} onDragOver={problemEnquiryMode?null:this.onProblemDragOver} onDrop={this.onProblemDrop} >
                                                <Grid
                                                    alignItems="center"
                                                    container
                                                    direction="row"
                                                    // justify="space-between"
                                                >
                                                    <Grid item xs={12}>
                                                        <FuzzySearchBox
                                                            dataList={searchProblemRecordList}
                                                            displayField={['termDisplayName']}
                                                            handleSearchBoxLoadMoreRows={this.handleProblemSearchBoxLoadMoreRows}
                                                            id={PROBLEM_MODE}
                                                            inputPlaceHolder={'Search Problem'}
                                                            onChange={this.handleProblemFuzzySearch}
                                                            onSelectItem={this.handleProblemSelectItem.bind(this)}
                                                            totalNums={searchProblemRecordTotalNums}
                                                            closeSearchData={this.closeSearchData.bind(this)}
                                                            handleAddSearchData={this.handleAddSearchData.bind(this)}
                                                            limitValue={3}
                                                            type="Problem"
                                                            insertCloseLog={this.insertCloseLog}
                                                            disabled={problemEnquiryMode}
                                                            {...searchAddProblem}
                                                        />
                                                        <div className={classes.localTerm}>
                                                            <label className={classes.label}>Local terms</label>
                                                            <div className={classes.floatLeft}>
                                                                <Checkbox
                                                                    classes={{
                                                                        root:classes.localTermCheckbox
                                                                    }}
                                                                    disabled={problemEnquiryMode?problemEnquiryMode:problemLocalTermDisabled}
                                                                    color="primary"
                                                                    id="diagnosis_local_term"
                                                                    checked={problemLocalTermChecked}
                                                                    onChange={(event) => { this.handleProblemLocalTermChange(event);}}
                                                                />
                                                            </div>
                                                        </div>
                                                        <Grid item style={{marginTop:-10}}>
                                                            <CIMSButton
                                                                id="btn_inputProblem_favourite"
                                                                onClick={this.handleProblemServiceFavouriteDialogOpen}
                                                                variant="contained"
                                                                // color="primary"
                                                                className={classes.btnDiagnosisSerivceFavourite}
                                                                disabled={problemEnquiryMode}
                                                            >
                                                                {PROBLEM_SEARCH_PROBLEM}
                                                            </CIMSButton>

                                                            {serviceCd === 'SHS' && psoInfo && psoInfo.withPsoriasis !== null ? (
                                                                <Button
                                                                    disableFocusRipple
                                                                    id="btn_inputProblem_pso"
                                                                    variant="contained"
                                                                    className={classes.btnDiagnosisSerivceFavourite}
                                                                    disabled={!psoMess.privilege}
                                                                    classes={{
                                                                        root: classes.buttonRoot,
                                                                        label: psoMess.type > 0
                                                                            ? psoMess.type === 2 ? classes.buttonLabelRed : classes.buttonLabelWhite
                                                                            : null,
                                                                        disabled: classes.buttonDisabledSpecial,
                                                                        sizeSmall: classes.buttonSizeSmall
                                                                    }}
                                                                    color="primary"
                                                                    size="small"
                                                                    onClick={this.handleAddPsoriasis}
                                                                >
                                                                    {psoMess.label}
                                                                </Button>
                                                            ) : null}

                                                        </Grid>
                                                    </Grid>
                                                </Grid>

                                                <ServiceFavouriteDialog {...problemFavouriteDialogProps} />
                                                <JTable
                                                    size="small"
                                                    id="dxpx_diagnosis_table"
                                                    tableRef={this.problemMaterialTableRef}
                                                    actions={
                                                        [
                                                            // rubbish bin
                                                            rowData => ({
                                                                icon: () => (<DeleteOutline id="btn_diagnosis_row_delete" />),
                                                                onClick: (event,tempRowData) => {
                                                                    this.deleteProblemObj(tempRowData,'btn_diagnosis_row_cancel','btn_chronic_problem_row_save');
                                                                },
                                                                disabled:this.checkProblemToChronicData(rowData)
                                                            })
                                                        ]
                                                    }
                                                    columns={this.state.problemColumns}
                                                    components={{
                                                        Action: props => {
                                                            if (props.action.tooltip ==='Cancel') {
                                                                return (
                                                                    <IconButton
                                                                        className={classes.iconBtn}
                                                                        id="btn_diagnosis_row_cancel"
                                                                        onClick={event => {
                                                                            this.handleActionCancel(event,props);
                                                                        }}
                                                                        disabled={problemEnquiryMode}
                                                                    >
                                                                        <Clear  onClick={event => {
                                                                            this.handleActionCancel(event,props);
                                                                        }}  id="btn_diagnosis_row_cancel_icon" style={{border:'1px solid red',color:'red',borderRadius:'50%'}}
                                                                        />
                                                                    </IconButton>
                                                                );
                                                            } else if (props.action.tooltip ==='Save') {
                                                                return (
                                                                    <IconButton
                                                                        id="btn_diagnosis_row_save"
                                                                        className={classes.iconBtn}
                                                                        onClick={event => {
                                                                            this.handleActionSave(event,props,'btn_diagnosis_row_save');
                                                                        }}
                                                                        disabled={problemEnquiryMode}
                                                                    >
                                                                        <Check style={{border:'1px solid rgba(126,191,59)',color:'rgba(126,191,59)',borderRadius:'50%'}}/>
                                                                    </IconButton>
                                                                );
                                                            } else {
                                                                return (
                                                                    <MTableAction
                                                                        {...props}
                                                                        disabled={problemEnquiryMode}
                                                                    />
                                                                );
                                                            }
                                                        },
                                                        OverlayLoading: () => (
                                                            <div />
                                                        ),
                                                        Row: props => {
                                                            return (
                                                                <MTableBodyRow
                                                                    {...props}
                                                                    draggable="true"
                                                                    onDragStart={(e)=>{this.handleDiagnosisDragStart(e,props.data);}}
                                                                />
                                                            );
                                                        }
                                                    }}
                                                    initialFormData={this.state.initialProblem}
                                                    data={this.state.problemDataList}
                                                    editable={
                                                        {
                                                            onRowAdd: newData =>
                                                                new Promise(resolve => {
                                                                    setTimeout(() => {
                                                                        this.addProblem(newData);
                                                                        resolve();
                                                                    },100);
                                                                }
                                                            ),
                                                            onRowUpdate: (newData,oldData) =>
                                                                new Promise(resolve => {
                                                                    setTimeout(() => {
                                                                        this.updateProblemObj(newData,oldData);
                                                                        resolve();
                                                                    },100);
                                                                }
                                                            )
                                                        }
                                                    }
                                                    icons={{
                                                        Edit: props => (
                                                            <EditRounded
                                                                id="btn_diagnosis_row_edit"
                                                                {...props}
                                                                onClick={this.handleProblemEditClick}
                                                            />
                                                        )
                                                    }}
                                                    localization={{
                                                        body: {
                                                            emptyDataSourceMessage:
                                                            this.state.problemDataList.length===0&&isEmpty(initialProblem)?'There is no data.':'',
                                                            editRow: {
                                                                deleteText:
                                                                    'Are you sure delete this record?'
                                                            }
                                                        },
                                                        header: {
                                                            actions: 'Action'
                                                        }
                                                    }}
                                                    options={{
                                                        actionsColumnIndex: -1,
                                                        maxBodyHeight:this.state.height,
                                                        draggable: false,
                                                        selection:'rowId',
                                                        headerStyle:{ color: COMMON_STYLE.whiteTitle,backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,fontWeight:600,fontSize:font.fontSize,fontFamily:font.fontFamily},
                                                        actionsCellStyle: {
                                                            direction:'rtl',
                                                            fontSize: font.fontSize
                                                        },
                                                        addRowPosition:'first'
                                                    }}
                                                    onSelectionChange={this.diagnosisSelectionChange}
                                                    selected={this.state.diagnosisSelectionData}
                                                />
                                            </Grid>
                                            <Grid item xs={6} style={{padding:'6px 6px 6px 18px'}} onDragOver={problemEnquiryMode?null:this.handleChronicProblemDragOver} onDrop={this.handleChronicProblemDrop}>
                                                <div style={{height:'59px',lineHeight:'59px',fontWeight:'bold'}}>
                                                <Avatar
                                                    style={{
                                                    fontSize:'13px',
                                                    fontFamily:font.fontFamily,
                                                    textAlign:'center',
                                                    width:'25px',
                                                    height:'25px',
                                                    color: 'rgb(180, 65, 62)',
                                                    marginRight:3,
                                                    backgroundColor: 'rgb(254,178,179)',
                                                    display:'inline-flex'
                                                }}
                                                >
                                                    C
                                                </Avatar>
                                                    <span>Chronic Problem</span>
                                                </div>
                                                <JTable
                                                    size="small"
                                                    id="dxpx_chronic_problem_table"
                                                    tableRef={this.chronicMaterialTableRef}
                                                    initialFormData={initialChronic}
                                                    actions={
                                                        [{
                                                            icon: () => (<DeleteOutline id="btn_chronic_problem_row_delete" />),
                                                            onClick: (event,rowData) => {this.handleChronicProblemRowDelete(rowData);}
                                                        }]
                                                    }
                                                    columns={chronicProblemColumns}
                                                    components={{
                                                        Action: props => {
                                                            if (props.action.tooltip ==='Cancel') {
                                                                return (
                                                                    <IconButton
                                                                        id="btn_chronic_problem_row_cancel"
                                                                        className={classes.iconBtn}
                                                                        onClick={event => {
                                                                            this.handleActionCancel(event,props);
                                                                        }}
                                                                    >
                                                                        <Clear
                                                                            onClick={event => {
                                                                            this.handleActionCancel(event,props);
                                                                        }}
                                                                            id="btn_chronic_problem_row_cancel_icon" style={{border:'1px solid red',color:'red',borderRadius:'50%'}}
                                                                        />
                                                                    </IconButton>
                                                                );
                                                            } else if (props.action.tooltip === 'Save') {
                                                                return (
                                                                    <IconButton
                                                                        id="btn_chronic_problem_row_save"
                                                                        className={classes.iconBtn}
                                                                        onClick={event => {
                                                                            this.handleActionSave(event,props,'btn_chronic_problem_row_save');
                                                                        }}
                                                                    >
                                                                        <Check   style={{border:'1px solid rgba(126,191,59)',color:'rgba(126,191,59)',borderRadius:'50%'}} />
                                                                    </IconButton>
                                                                );
                                                            } else {
                                                                return (
                                                                    <MTableAction
                                                                        {...props}
                                                                        disabled={problemEnquiryMode}
                                                                    />
                                                                );
                                                            }
                                                        },
                                                        OverlayLoading: () => (
                                                            <div />
                                                        ),
                                                        Row: props => {
                                                            return (
                                                                <MTableBodyRow
                                                                    {...props}
                                                                    draggable="true"
                                                                    onDragEnd={this.handleChronicProblemDragEnd}
                                                                    onDragStart={(e)=>{
                                                                        this.handleChronicProblemDragStart(e,props.data);
                                                                    }}
                                                                />
                                                            );
                                                        }
                                                    }}
                                                    data={this.state.chronicProblemDataList}
                                                    editable={
                                                        {
                                                            onRowUpdate: (newData,oldData) =>{
                                                                return this.handleChronicProblemRowUpdate(newData,oldData);
                                                            },
                                                            onRowAdd: newData =>new Promise(
                                                                resolve => {
                                                                    setTimeout(() => {
                                                                        this.addChronic(newData);
                                                                        resolve();
                                                                    },100);
                                                                }
                                                            )
                                                        }
                                                    }
                                                    icons={{
                                                        Edit: props => (
                                                            <EditRounded
                                                                id="btn_chronic_problem_row_edit"
                                                                onClick={this.handleProblemEditClick}
                                                                {...props}
                                                            />
                                                        )
                                                    }}
                                                    localization={{
                                                        body: {
                                                            emptyDataSourceMessage:isEmpty(initialChronic)?'There is no data.':'',
                                                            editRow: {
                                                                deleteText:'Are you sure delete this record?'
                                                            }
                                                        },
                                                        header: {
                                                            actions: 'Action'
                                                        }
                                                    }}
                                                    options={{
                                                        actionsColumnIndex: -1,
                                                        maxBodyHeight:this.state.height,
                                                        draggable: false,
                                                        selection:'rowId',
                                                        headerStyle:{ color: COMMON_STYLE.whiteTitle,backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,fontWeight:600,fontSize:font.fontSize,fontFamily:font.fontFamily},
                                                        actionsCellStyle: {
                                                            direction:'rtl',
                                                            fontSize: font.fontSize
                                                        },
                                                        addRowPosition:'first'
                                                    }}
                                                    onSelectionChange={this.chronicProblemSelectionChange}
                                                    selected={this.state.chronicProblemSelectionData}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* input Procedure  */}
                                    <Grid item container direction={'column'} wrap={'nowrap'} style={{padding:'8px',flex:'auto',height:'50%',paddingBottom:0,minWidth:683}}>
                                        <Grid item style={{flex:'0 0 auto'}}>
                                            <Avatar
                                                className={
                                                    classes.procedureAvatar
                                                }
                                                style={{
                                                    marginBottom:2,
                                                    fontSize: '13px',
                                                    fontFamily: font.fontFamily,
                                                    textAlign: 'center',
                                                    width: '21px',
                                                    height: '21px',
                                                    float: 'left',
                                                    color: COMMON_STYLE.whiteTitle
                                                }}
                                            >
                                                Px
                                            </Avatar>
                                            <span
                                                className={classes.list_title}
                                                style={{ float: 'left', marginLeft: 3 }}
                                            >
                                                {`Procedure ${procedureEnquiryMode?'[View Only]':''}`}
                                            </span>
                                        </Grid>

                                        <Grid container item style={{border:'1px solid #949494',padding:'12px',flex:'auto'}}>
                                            <Grid id="historicalRecordProcedureDiv" style={{marginTop:'-6px',minWidth:527}} item xs={12} onDragOver={procedureEnquiryMode?null:this.onProcedureDragOver} onDrop={this.onProcedureDrop}>
                                                <Grid
                                                    alignItems="center"
                                                    container
                                                    direction="row"
                                                    justify="space-between"
                                                >
                                                <Grid item xs={12}>
                                                    <FuzzySearchBox
                                                        dataList={searchProcedureRecordList}
                                                        displayField={['termDisplayName']}
                                                        handleSearchBoxLoadMoreRows={this.handleProcedureSearchBoxLoadMoreRows}
                                                        id={PROCEDURE_MODE}
                                                        inputPlaceHolder={'Search Procedure'}
                                                        onChange={this.handleProcedureFuzzySearch}
                                                        onSelectItem={this.handleProcedureSelectItem.bind(this)}
                                                        totalNums={searchProcedureRecordTotalNums}
                                                        {...searchAddProcedure}
                                                        closeSearchData={this.closeProcedureSearchData.bind(this)}
                                                        handleAddSearchData={this.handleAddSearchData}
                                                        limitValue={3}
                                                        type="Procedure"
                                                        insertCloseLog={this.insertCloseLog}
                                                        disabled={procedureEnquiryMode}
                                                    />
                                                    <div className={classes.localTerm}>
                                                        <label className={classes.label}>Local terms</label>
                                                        <div className={classes.floatLeft}>
                                                        <Checkbox
                                                            classes={{root:classes.localTermCheckbox}}
                                                            disabled={procedureEnquiryMode?true:procedureLocalTermDisabled}
                                                            color="primary"
                                                            id="procedure_local_term"
                                                            checked={procedureLocalTermChecked}
                                                            onChange={(event) => { this.handleProcedureLocalTermChange(event);}}
                                                        />
                                                        </div>
                                                    </div>
                                                    <Grid item style={{marginTop:-12}}>
                                                    <CIMSButton
                                                        id="btn_inputProcedure_favourite"
                                                        onClick={this.handleProcedureServiceFavouriteDialogOpen}
                                                        variant="contained"
                                                        // color="primary"
                                                        disabled={procedureEnquiryMode}
                                                    >
                                                        {PROCEDURE_SEARCH_PROBLEM}
                                                    </CIMSButton>
                                                    </Grid>
                                                    </Grid>

                                                </Grid>
                                                <ServiceFavouriteDialog {...procedureFavouriteDialogProps} />

                                                <JTable
                                                    size="small"
                                                    id="dxpx_procedure_table"
                                                    tableRef={this.procedureMaterialTableRef}
                                                    actions={
                                                        [{
                                                            icon: () => (
                                                                <DeleteOutline id="btn_procedure_row_delete" />
                                                            ),
                                                            onClick: (event,rowData) => {
                                                                this.deleteProcedureObj(rowData);
                                                            }
                                                        }]
                                                    }
                                                    columns={this.state.procedureColumns}
                                                    components={{
                                                        Action: props => {
                                                            if (
                                                                props.action
                                                                    .tooltip ===
                                                                'Cancel'
                                                            ) {
                                                                return (
                                                                    <IconButton
                                                                        className={
                                                                            classes.iconBtn
                                                                        }
                                                                        id="btn_procedure_row_cancel"
                                                                        onClick={event => {
                                                                            this.handleActionCancel(
                                                                                event,
                                                                                props
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Clear  onClick={event => {this.handleActionCancel(event,props);  }}
                                                                            id="btn_procedure_row_cancel_icon"  style={{border:'1px solid red',color:'red',borderRadius:'50%'}}
                                                                        />
                                                                    </IconButton>
                                                                );
                                                            } else if (
                                                                props.action
                                                                    .tooltip ===
                                                                'Save'
                                                            ) {
                                                                return (
                                                                    <IconButton
                                                                        id="btn_procedure_row_save"
                                                                        className={
                                                                            classes.iconBtn
                                                                        }
                                                                        onClick={event => {
                                                                            this.handleActionSave(
                                                                                event,
                                                                                props
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Check   style={{border:'1px solid rgba(126,191,59)',color:'rgba(126,191,59)',borderRadius:'50%'}}/>
                                                                    </IconButton>
                                                                );
                                                            } else {
                                                                return (
                                                                    <MTableAction
                                                                        {...props}
                                                                        disabled={procedureEnquiryMode}
                                                                    />
                                                                );
                                                            }
                                                        },
                                                        OverlayLoading: props => (
                                                            <div />
                                                        )
                                                    }}
                                                    data={this.state.procedureDataList}
                                                    initialFormData={this.state.initialProcedure}
                                                    editable={
                                                        {
                                                            onRowAdd: newData => new Promise(
                                                                resolve => {
                                                                    setTimeout(() => {
                                                                        this.addProcedure(newData);
                                                                        resolve();
                                                                    }, 100);
                                                                }
                                                            ),
                                                            onRowUpdate: (newData,oldData) => new Promise(
                                                                resolve => {
                                                                    setTimeout(() => {
                                                                        this.updateProcedureObj(
                                                                            newData,
                                                                            oldData
                                                                        );
                                                                        resolve();
                                                                    },100);
                                                                }
                                                            )
                                                        }
                                                    }
                                                    icons={{
                                                        Edit: props => (
                                                            <EditRounded
                                                                id="btn_procedure_row_edit"
                                                                onClick={this.handleProblemEditClick}
                                                                {...props}
                                                            />
                                                        )
                                                    }}
                                                    localization={{
                                                        body: {
                                                            emptyDataSourceMessage:
                                                            isEmpty(initialProcedure)?'There is no data.':'',
                                                            editRow: {
                                                                deleteText:
                                                                    'Are you sure delete this record?'
                                                            }
                                                        },
                                                        header: {
                                                                actions: 'Action'
                                                            }
                                                    }}
                                                    options={{
                                                        actionsColumnIndex: -1,
                                                        maxBodyHeight:this.state.height,
                                                        draggable: false,
                                                        headerStyle:{ color: COMMON_STYLE.whiteTitle,backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,fontWeight:600,fontSize:font.fontSize,fontFamily:font.fontFamily},
                                                        rowStyle: {
                                                            wordBreak:'break-all',
                                                            height: '30px'
                                                        },
                                                        actionsCellStyle: {
                                                            direction:'rtl',
                                                            fontSize: font.fontSize
                                                        },
                                                        addRowPosition:'first'
                                                        }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </div>
                                </div>
                            </MuiThemeProvider>
                        </Container>
                    </Grid>
                </MuiThemeProvider>
            </MuiThemeProvider>
        );
    }
}


const mapDispatchToProps = {
    openCommonMessage,
    closeCommonMessage,
    openCommonCircularDialog,
    getALLDxPxList,
    getInputProcedureList,
    getProcedureCodeDiagnosisStatusList,
    updatePatientProcedure,
    deletePatientProcedure,
    getProblemCodeDiagnosisStatusList,
    updatePatientProblem,
    deletePatientProblem,
    listCodeDiagnosisTypes,
    getHistoricalRecords,
    closeCommonCircularDialog,
    queryProblemList,
    queryProcedureList,
    requestProcedureTemplateList,
    requestProblemTemplateList,
    savePatient,
    getChronicProblemList,
    deleteSubTabs,
    getCodeLocalTerm,
    updateCurTab,
    addPsoriasis,
    refreshPatient,
    getCurrentDate
};
function mapStateToProps(state) {
    return {
        loginInfo: {
            // ...state.login.loginInfo,
            accessRights: state.login.accessRights,
            service: state.login.service,
            clinic: state.login.clinic
        },
        common: state.common,
        encounterData:state.patient.encounterInfo,
        patientPanelInfo: state.patient.patientInfo,
        inputProcedureList: state.procedureReducer.inputProcedureList,
        inputProblemList: state.diagnosisReducer.inputProblemList,
        recordTypeList: state.diagnosisReducer.recordTypeList,
        sysConfig: state.clinicalNote.sysConfig,
        patientInfo: state.patient.patientInfo,
        psoInfo: state.patient.patientInfo && state.patient.patientInfo.psoInfo
    };
}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(HistoricalRecord));

