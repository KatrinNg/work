import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import {
    Grid
} from '@material-ui/core';
import { connect } from 'react-redux';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import * as commonUtilities from '../../../utilities/commonUtilities';
import * as dateUtilities from '../../../utilities/dateUtilities';
import Enum from '../../../enums/enum';
import moment from 'moment';
import _ from 'lodash';
import {
    requestData,
    resetAll,
    updateField,
    openPreviewWindow,
    getRoomUtilization,
    getFilterLists
} from '../../../store/actions/appointment/calendarView/calendarViewAction';
import { initBookingData } from '../../../constants/appointment/bookingInformation/bookingInformationConstants';
import {
    addTabs,
    skipTab,
    changeTabsActive,
    deleteSubTabs,
    deleteTabs,
    updateTabs
} from '../../../store/actions/mainFrame/mainFrameAction';
import AccessRightEnum from '../../../enums/accessRightEnum';
import FilterBar from './component/filterBar';
import CalendarDateBar from './component/calendarDateBar';
import RemarkDialog from './component/remarkDialog';
import RemarkPopper from './component/remarkPopper';
import DayView from './component/dayView/dayView';
import WeekView from './component/weekView/weekView';
import MonthView from './component/monthView/monthView';
import UtilisationBar from '../../compontent/utilisationBar';
import ShortNameBar from './component/shortNameBar';
import { updateState as updateAnonBookingState } from '../../../store/actions/appointment/booking/bookingAnonymousAction';
import { updateState as updateBookingState } from '../../../store/actions/appointment/booking/bookingAction';
import doCloseFuncSrc from '../../../constants/doCloseFuncSrc';
import { updateField as mainFrameUpdateField } from '../../../store/actions/mainFrame/mainFrameAction';
import {
    getPatientById,
    updateState as updatePatientState,
    getPatientEncounter
} from '../../../store/actions/patient/patientAction';
import ApptListViewDialog from './component/ApptListViewDialog';
import { print } from '../../../utilities/printUtilities';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import RoomUtilization from '../../compontent/roomUtilization';
import Form from '../../../components/FormValidator/ValidatorForm';
import { PageStatus as pageStatusEnum, anonPageStatus, SHS_APPOINTMENT_GROUP } from '../../../enums/appointment/booking/bookingEnum';
import { initBookData } from '../../../utilities/appointmentUtilities';
import { auditAction } from '../../../store/actions/als/logAction';
import CIMSDrawer from '../../../components/Drawer/CIMSDrawer';
import CIMSCommonSelect from '../../../components/Select/CIMSCommonSelect';

const styles = theme => ({
    root: {
        // padding: 16,
        // '&:last-child': { paddingBottom: 24 },
        height: '100%',
        display: 'flex'
    },
    form: {
        width: 200,
        paddingRight: 24,
        height: '100%'
    },
    formControl: {
        marginBottom: 10,
        width: '100%'
    },
    formLabel: {
        marginBottom: 10,
        fontWeight: 'bold'
    },
    formGroup: {
        overflowY: 'hidden',
        border: '1px solid #cccccc',
        padding: 6
    },
    checkboxFormGroup: {
        overflow: 'hidden',
        border: '1px solid #cccccc',
        paddingLeft: 6,
        height: 94
    },
    checkboxGroup: {
        overflow: 'auto'
    },
    formControlLabel: {
        margin: 0,
        width: '100%'
    },
    checkboxLabel: {
        width: '100%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    shortNameLable: {
        paddingLeft: 14,
        color: '#404040',
        wordBreak: 'break-all'
    },

    calendarRoot: {
        flex: 1,
        display: 'flex',
        flexFlow: 'column',
        overflow: 'hidden'
    },

    calendarDateBar: {
        display: 'flex',
        marginBottom: 10,
        '& .dateAction': {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            '& .buttonGroup': {
                marginRight: 10
            }
        }
    },
    calendarView: {
        flex: 1,
        overflow: 'auto'
    },
    boxBorder: {
        border: '1px solid #c4c4c4',
        borderRadius: '0.3rem'
    },
    buttonRoot: {
        textTransform: 'none',
        '&:hover': {
            backgroundColor: 'rgb(0, 152, 255)'
        },
        padding: '1px 12px'
    },
    buttonLabel: {
        fontSize: 12
    },
    buttonDisabled: {
        borderColor: theme.palette.action.disabledBackground
    },
    legendBar: {
        marginTop: '1rem',
        marginBottom: '1rem'
    },
    tooltipPlacementBottom: {
        transformOrigin: 'center top',
        margin: '12px 0',
        [theme.breakpoints.up('sm')]: {
            margin: '2px 0'
        }
    },
    monthViewPicker:{
        maxWidth:170,
        justifyContent:'center'
    },
    dayViewGroup: {
        width: '100%',
        // height: '100%',
        // overflow: 'auto',
        padding: '0px',
        margin: '0px'
    },
    dayViewContainer: {
        minWidth: '1%',
        maxWidth: '95%',
        padding: '0px 4px 0px 4px !important'
    },
    drawerRoot: {
        height: '67vh'
    },
    drawerNoIcon: {
        visibility: 'hidden'
    },
    drawerContainer: {
        padding: theme.spacing(1),
        height: '100%',
        flexDirection: 'column',
        flexWrap: 'nowrap'
    },
    dayViewRoot: {
        width: '100%',
        height: 'auto',
        display: 'flex',
        overflowY: 'auto'
    },
    labelRoot: {
        '&::after': {
            color: 'red',
            content: '\'*\''
        }
    }
});

const sortFunc = (a, b) => a.label > b.label ? 1 : b.label > a.label ? -1 : 0;

class CalendarView extends Component {
    constructor(props) {
        super(props);

        const siteParam = commonUtilities.getTopPriorityOfSiteParams(props.clinicConfig, props.serviceCd, props.siteId, 'IS_ALLOW_CROSS_CLINIC_CALENDAR_VIEW');

        this.state = {
            openRemarkDialog: false,
            remarkStore: [],
            dialogIndex: null,
            openPopper: false,
            popperAnchorEl: null,
            popperRemark: {},
            sessionsConfig: [],
            patientRemark: null,
            allowCrossClinicCalendarView: siteParam && siteParam.configValue === '1',
            openSecondaryDayView: false,
            clinicList: [],
            encounterTypeList1: [],
            encounterTypeList2: [],
            roomList1: [],
            roomList2: [],
            sessionList1: [],
            sessionList2: [],
            clinic1: null,
            clinic2: null,
            encounterType1: null,
            encounterType2: null,
            room1: null,
            room2: null,
            sessions1: null,
            sessions2: null
        };
        this.bookingAnonymousTab = props.accessRights.find((item) => item.name === AccessRightEnum.bookingAnonymous);
        this.bookingTab = props.accessRights.find((item) => item.name === AccessRightEnum.booking);
        this.patientSummaryTab = props.accessRights.find((item) => item.name === AccessRightEnum.patientSummary);
        this.props.resetAll();
    }

    componentDidMount() {
        // let where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
        // let defaultEncounterCd = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.DEFAULT_ENCOUNTER_CD, this.props.clinicConfig, where);
        // this.props.updateField({ serviceValue: this.props.serviceCd, clinicValue: this.props.clinicCd, encounterTypeValue: defaultEncounterCd.configValue ?? null });
        this.props.updateField({
            serviceValue: this.props.serviceCd,
            clinicValue: this.props.clinicCd,
            dateFrom: moment().startOf('day'),
            dateTo: moment().endOf('day'),
            date: moment()
        });
        this.setState({
            sessionsConfig: this.initSessionsConfig()
        });
        this.props.getFilterLists({ svcCd: this.props.serviceCd });
    }

    shouldComponentUpdate(nextP) {
        //Refresh data when entering the interface
        if (nextP.tabsActiveKey !== this.props.tabsActiveKey && nextP.tabsActiveKey === AccessRightEnum.calendarView) {
            this.handleRefresh();
            return false;
        }
        return true;
    }

    componentDidUpdate(prevProps) {
        if (this.props.filterLists !== prevProps.filterLists) {
            let clinicList = this.props.filterLists.clinicList.filter(x => x.status === 'A')
            .map(x => ({
                value: x.siteId,
                label: x.siteName,
                item: x
            }))
            .sort(sortFunc);

            this.setState({
                clinicList,
                clinic1: clinicList.find(x => x.value === this.props.siteId)
            }, async () => {
                await this.clinicOnChange(1, false);
                await this.encounterTypeOnChange(1, false);
                this.syncEncounterType(1);
                this.syncSubEncounterType(1);
            });
        }

        // console.log('[CAL] date', moment(this.props.date).format('YYYY-MM-DD HH:mm:ss'), moment(prevProps.date).format('YYYY-MM-DD HH:mm:ss'), dateUtilities.isSameDate(this.props.date, prevProps.date));
        // console.log('[CAL] dateFrom', moment(this.props.dateFrom).format('YYYY-MM-DD HH:mm:ss'), moment(prevProps.dateFrom).format('YYYY-MM-DD HH:mm:ss'), dateUtilities.isSameDate(this.props.dateFrom, prevProps.dateFrom));
        // console.log('[CAL] dateTo', moment(this.props.dateTo).format('YYYY-MM-DD HH:mm:ss'), moment(prevProps.dateTo).format('YYYY-MM-DD HH:mm:ss'), dateUtilities.isSameDate(this.props.dateTo, prevProps.dateTo));

        if (this.props.calendarViewValue !== prevProps.calendarViewValue ||
            !dateUtilities.isSameDate(this.props.date, prevProps.date) ||
            !dateUtilities.isSameDate(this.props.dateFrom, prevProps.dateFrom) ||
            !dateUtilities.isSameDate(this.props.dateTo, prevProps.dateTo)) {
            this.refreshAllCalendarView();
        }

        if (this.props.encounterTypeValue !== prevProps.encounterTypeValue ||
            this.props.subEncounterTypeValue !== prevProps.subEncounterTypeValue) {
            if (this.state.allowCrossClinicCalendarView)
                this.refreshCalendarView(1);
            else
                this.refreshCalendarView();
        }
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    handleRefresh = () => {
        this.refreshAllCalendarView();
    }

    refreshAllCalendarView = async () => {
        // console.log('[CAL] refreshAllCalendarView');
        if (!this.state.allowCrossClinicCalendarView || this.props.calendarViewValue !== 'D')
            this.refreshCalendarView();
        else {
            await this.setEncounterType(this.props.encounterTypeValue, 1, false);
            // await this.encounterTypeOnChange(1, false);
            // await this.setRoom(this.props.subEncounterTypeValue, 1, false);
            await this.setSelectedSessions(this.state.sessionsConfig, 1, false);
            this.refreshCalendarView(1);
            this.refreshCalendarView(2);
        }
    }

    refreshCalendarView = (index) => {
        const { calendarViewValue, serviceValue, clinicValue, date, siteId, subEncounterTypeValue } = this.props;
        let submitData = {
            ...(index != null && {index}),
            viewType: calendarViewValue,
            svcCd: serviceValue,
            date: date,
            siteId: index !== 2 ? siteId : this.state.clinic2?.value,
            subEncounterTypeValue: index !== 2 ? (index === 1 ? this.state.room1?.value : subEncounterTypeValue) : this.state.room2?.value
        };
        // console.log('[CAL] refreshCalendarView', submitData);
        if (moment(submitData.date).isValid() && moment(submitData.date).isSameOrAfter(moment('1990-01-01'))){
            this.getCalendarData(submitData);
            if (index !== 2) {
                if(this.roomUtilizationRef) {
                    const slotDate = this.roomUtilizationRef.getSlotDate();
                    const isExpanded = this.roomUtilizationRef.getExpandedStatus();
                    if (isExpanded && slotDate) {
                    this.getRoomUtilization(slotDate);
                    }
                }
            }
        }
    }

    clinicOnChange = (index, cascadeChange = true) => {
        return new Promise((resolve) => {
            let state = {};
            let sessionList = [];
            let encounterTypeList = [];
            if (this.state[`clinic${index}`]?.value) {
                sessionList = this.props.filterLists.sessionList.filter(x => x.status === 'A' && (x.siteId === this.state[`clinic${index}`]?.value || x.siteId == null))
                .map(x => ({
                    value: x.sessId,
                    label: x.sessDesc,
                    item: x
                }))
                .sort(sortFunc);

                encounterTypeList = this.props.filterLists.encounterTypeList.filter(x => x.status === 'A' && (x.siteId === this.state[`clinic${index}`]?.value || x.siteId == null))
                .map(x => ({
                    value: x.encounterTypeCd,
                    label: x.description,
                    item: x
                }))
                .sort(sortFunc);

                let defaultEncounterTypeCd = this.getDefaultEncounterTypeCd(this.props.serviceCd, this.state[`clinic${index}`]?.value);
                // console.log('[CAL] defaultEncounterTypeCd', defaultEncounterTypeCd);

                state = {
                    ...state,
                    [`encounterTypeList${index}`]: encounterTypeList,
                    [`sessionList${index}`]: sessionList,
                    [`encounterType${index}`]: encounterTypeList.find(x => x.value === defaultEncounterTypeCd)
                };
            }
            else {
                state = {
                    ...state,
                    [`encounterTypeList${index}`]: [],
                    [`sessionList${index}`]: sessionList,
                    [`encounterType${index}`]: null
                };
            }

            this.setState({
                ...state,
                [`roomList${index}`]: [],
                [`room${index}`]: null,
                [`sessions${index}`]: sessionList
            }, async () => {
                if (cascadeChange)
                    await this.encounterTypeOnChange(index);
                resolve();
            });
        });
    }

    encounterTypeOnChange = (index, cascadeChange = true) => {
        return new Promise((resolve) => {
            let state = {};
            let roomList = [];
            if (this.state[`encounterType${index}`]) {
                roomList = this.state[`encounterType${index}`].item.subEncounterTypeList.filter(x => x.status === 'A' && (x.siteId === this.state[`clinic${index}`]?.value || x.siteId == null))
                .map(x => ({
                    value: x.rmId,
                    label: x.description,
                    item: x
                }))
                .sort(sortFunc);

                let defaultRoomId = this.getDefaultRoomId(this.props.serviceCd, this.state[`clinic${index}`]?.value, this.state[`encounterType${index}`]?.value);
                // console.log('[CAL] defaultRoomId', defaultRoomId);

                state = {
                    ...state,
                    [`roomList${index}`]: roomList,
                    [`room${index}`]: roomList.find(x => x.value === defaultRoomId)
                };
            }
            else {
                state = {
                    ...state,
                    [`roomList${index}`]: roomList,
                    [`room${index}`]: null
                };
            }

            if(state[`roomList${index}`].length === 1){
                state[`room${index}`] = state[`roomList${index}`][0];
            }
            this.setState({
                ...state
            }, () => {
                if (cascadeChange)
                    this.roomOnChange(index);
                resolve();
            });
        });
    }

    roomOnChange = (index, loadCalendar = true) => {
        if(index === 1){
            this.syncSubEncounterType(1);
        }
        if (loadCalendar) {
            // setTimeout(() => {
                this.loadCalendar(index);
            // }, 0);
        }
    }

    sessionsOnChange = (index) => {
        this.loadCalendar(index);
    }

    loadCalendar = (index) => {
        const clinic = this.state[`clinic${index}`];
        const encounterType = this.state[`encounterType${index}`];
        const room = this.state[`room${index}`];

        // if (clinic && encounterType && room) {
            let fileData = {};
            fileData.index = this.state.allowCrossClinicCalendarView ? index : null;
            fileData.siteId = clinic?.value;
            fileData.encounterTypeValue = encounterType?.value;
            fileData.subEncounterTypeValue = room?.value;
            this.getCalendarData(fileData);
        // }
    }

    setEncounterType = (value, index, cascadeChange = true) => {
        return new Promise((resolve) => {
            this.setState({ [`encounterType${index}`]: this.state[`encounterTypeList${index}`]?.find(x => x.value === value) }, async () => {
                if (cascadeChange)
                    await this.encounterTypeOnChange(index);
                resolve();
            });
        });
    }

    syncEncounterType = (index) => {
        let clinic = this.state[`clinic${index}`];
        let encounterType = this.state[`encounterType${index}`];
        let keyAndValue = {};
        let fileData = {};
        fileData.encounterTypeValue = encounterType?.value;
        fileData.subEncounterTypeListData = encounterType?.item.subEncounterTypeList.filter(x => x.clinic === clinic.value).map(item => { keyAndValue[item.subEncounterTypeCd] = item; return item; });
        fileData.subEncounterTypeListKeyAndValue = keyAndValue;
        fileData.subEncounterTypeValue = null;
        fileData.selectEncounterType = { ...encounterType };
        this.props.updateField(fileData);
    }

    setRoom = (value, index, cascadeChange = true) => {
        return new Promise((resolve) => {
            this.setState({ [`room${index}`]: this.state[`roomList${index}`]?.find(x => x.value === value) }, () => {
                if (cascadeChange)
                    this.roomOnChange(index);
                resolve();
            });
        });
    }

    syncSubEncounterType = (index) => {
        let subEncounterType = this.state[`room${index}`];
        let keyAndValue = {};
        let fileData = {};
        fileData.subEncounterTypeValue = subEncounterType?.value;
        this.props.updateField(fileData);
        // this.getCalendarData(fileData);
    }

    getSelectedSessionIds = (index) => this.state[`sessions${index}`]?.map(x => x.value) ?? [];

    initSessionsConfig = () => (this.props.sessionsConfig.filter((sess) => (sess.status === 'A')).map((sess) => ({ ...sess, checked: true })));

    getSelectedSessIds = (sessionsConfig) => {
        sessionsConfig = sessionsConfig || this.state.sessionsConfig;
        let selectedSessIds = [];
        sessionsConfig.forEach((sess) => {
            if (sess.checked === true) {
                selectedSessIds.push(sess.sessId);
            }
        });
        return selectedSessIds;
    };

    setSelectedSessions = (sessionsConfig, index, cascadeChange = true) => {
        return new Promise((resolve) => {
            sessionsConfig = sessionsConfig || this.state.sessionsConfig;
            let selectedSessions = [];
            sessionsConfig.forEach((sess) => {
                if (sess.checked === true) {
                    let session = this.state[`sessionList${index}`]?.find(x => x.value === sess.sessId);
                    if (session)
                        selectedSessions.push(session);
                }
            });
            this.setState({ [`sessions${index}`]: selectedSessions }, () => {
                if (cascadeChange)
                    this.sessionsOnChange(index);
                resolve();
            });
        });
    };

    getSessStartEndTime = (sessionsConfig) => {
        sessionsConfig = sessionsConfig || this.state.sessionsConfig;
        let absSTime;
        let absETime;
        let filteredSessionsConfig = sessionsConfig.filter((sess) => sess.checked === true);
        if (filteredSessionsConfig.length > 0) {
            absSTime = filteredSessionsConfig[0].stime;
            absETime = filteredSessionsConfig[0].etime;
            filteredSessionsConfig.forEach((sess) => {
                if (moment(absSTime, 'HH:mm') - moment(sess.stime, 'HH:mm') > 0) {
                    absSTime = sess.stime;
                }
                if (moment(sess.etime, 'HH:mm') - moment(absETime, 'HH:mm') > 0) {
                    absETime = sess.etime;
                }
            });
        } else {
            absSTime = '08:00';
            absETime = '18:00';
        }
        return [absSTime, absETime];
    };

    toggleSessCheckbox = (sessId) => {
        let sessionsConfig = [...this.state.sessionsConfig];
        let idx = sessionsConfig.findIndex(x => x.sessId === sessId);
        sessionsConfig[idx].checked = !sessionsConfig[idx].checked;
        this.setState({
            sessionsConfig: sessionsConfig
        }, () => {
            if (this.state.allowCrossClinicCalendarView)
                this.setSelectedSessions(this.state.sessionsConfig, 1);
        });
    }

    syncSessCheckboxes = (index) => {
        return new Promise((resolve) => {
            let sessionsConfig = [...this.state.sessionsConfig];
            let sessions = this.state[`sessions${index}`];
            for (let i = 0; i < sessionsConfig.length; i++) {
                let sess = sessionsConfig[i];
                sess.checked = !!sessions?.find(x => x.value === sess.sessId);
            }
            this.setState({
                sessionsConfig: sessionsConfig
            }, resolve);
        });
    }

    bookQuota = (data) => {
        const { bookingPageSts, anonymousPageSts, encntrTypeList } = this.props;
        let prefilledData = {};
        prefilledData.siteId = this.props.siteId;
        prefilledData.encounterTypeCd = this.props.encounterTypeValue;
        prefilledData.subEncounterTypeCd = this.props.rooms.find((room) => room.rmId === this.props.subEncounterTypeValue).rmCd;
        prefilledData.rmCd = this.props.rooms.find((room) => room.rmId === this.props.subEncounterTypeValue).rmCd;
        prefilledData.rmId = this.props.subEncounterTypeValue;
        prefilledData.appointmentTypeCd = data.quota.toUpperCase();
        prefilledData.selectedSess = null;
        prefilledData.elapsedPeriod = '';
        prefilledData.elapsedPeriodUnit = '';
        prefilledData.clinicCd = this.props.clinicCd;
        let selectedSess = this.getSelectedSessIds();
        //if(selectedSess.length === 1){
        //prefilledData.sessId = selectedSess[0];
        //}
        prefilledData.appointmentDate = moment(data.datetime, Enum.DATE_FORMAT_24);
        prefilledData.appointmentTime = moment(data.datetime, Enum.DATE_FORMAT_24);

        //updated by Irving Wu for calendar view bug fixes
        prefilledData.qtType = _.toUpper(data.quota);
        prefilledData.encounterTypeId = this.props.selectEncounterType.encntrTypeId;

        prefilledData = initBookData(prefilledData, encntrTypeList);

        // patient specific booking
        if (this.props.patientInfo && this.props.patientInfo.patientKey) {
            // add patient key
            prefilledData.patientKey = this.props.patientInfo.patientKey;
            let bookingData = { ...this.props.bookingData };
            for (let k in prefilledData) {
                bookingData[k] = prefilledData[k];
            }
            if (bookingPageSts === pageStatusEnum.EDIT) {
                bookingData.bookingUnit = this.props.bookingData.bookingUnit;
                this.props.openCommonMessage({
                    msgCode: '130401',
                    btnActions: {
                        btn1Click: () => {
                            this.props.updateBookingState({ prefilledData, bookingData });
                            this.props.addTabs(this.bookingTab);
                        }
                    }
                });
            } else {
                this.props.updateBookingState({ prefilledData, bookingData, currentSelectedApptInfo: null });
                this.props.addTabs(this.bookingTab);
            }
            //updated by Irving Wu for calendar view bug fixes
            // this.props.updateBookingState({ prefilledData, bookingData,currentSelectedApptInfo:null });
            // this.props.addTabs(this.bookingTab);
            // const params = {
            //     bookData: bookingData,
            //     redirectFrom: AccessRightEnum.calendarView
            // };
            // if (this.props.bookingData.patientKey && this.props.bookingData.patientKey > 0) {
            //     this.props.openCommonMessage({
            //         // msgCode: '111109',
            //         msgCode: '112031',
            //         params: [{ name: 'PATIENT_CALL', value: commonUtilities.getPatientCall() }]
            //     });
            // } else {
            //     this.props.skipTab(AccessRightEnum.booking, params);
            // }
        }
        // anonymous booking
        else {
            let bookingData = { ...this.props.anonBookingData };
            for (let k in prefilledData) {
                bookingData[k] = prefilledData[k];
            }
            if (anonymousPageSts === anonPageStatus.UPDATE) {
                bookingData.bookingUnit = this.props.anonBookingData.bookingUnit;
                this.props.openCommonMessage({
                    msgCode: '130401',
                    btnActions: {
                        btn1Click: () => {
                            this.props.updateAnonBookingState({ prefilledData, bookingData });
                            this.props.addTabs(this.bookingAnonymousTab);
                        }
                    }
                });
            } else {
                this.props.updateAnonBookingState({ prefilledData, bookingData });
                this.props.addTabs(this.bookingAnonymousTab);
            }
            //updated by Irving Wu for calendar view bug fixes
            // this.props.updateAnonBookingState({ prefilledData, bookingData });
            // this.props.addTabs(this.bookingAnonymousTab);
            // const params = {
            //     bookData: bookingData,
            //     redirectFrom: AccessRightEnum.calendarView
            // };
            // if (this.props.anonPatientInfo) {
            //     this.props.openCommonMessage({
            //         // msgCode: '111109',
            //         msgCode: '112031',
            //         params: [{ name: 'PATIENT_CALL', value: commonUtilities.getPatientCall() }]
            //     });
            // } else {
            //     this.props.skipTab(AccessRightEnum.bookingAnonymous, params);
            // }
        }
    }

    getPatientInfo = item => {
        let params = {
            patientKey: item.patientKey,
            appointmentId: item.apptId,
            //caseNo: item.caseNo,
            callBack: () => {
                if (item.appointmentId) {
                    this.props.getPatientEncounter(item.apptId);
                }
                item.callback && item.callback();
                this.props.addTabs(this.patientSummaryTab);
            }
        };
        this.props.getPatientById(params);
    }

    openPatientSummary = async (item) => {
        // console.log('[CAL] openPatientSummary', item);
        this.props.auditAction('Open Patient Summary form Calendar View',null,null,false,'patient');
        let handledRegistration = true;
        let tabs = this.findRegistrationTab();
        if (tabs.length > 0) {
            // console.log('[CAL] Registration exist');
            handledRegistration = await this.closeRegistrationTab(tabs[0]);
        }
        // console.log('[CAL] handledRegistration', handledRegistration, item);
        if (handledRegistration) {
            if (item && item.patientKey > 0) {
                const getPatientFunc = () => {
                    let params = {
                        patientKey: item.patientKey,
                        appointmentId: item.apptId,
                        //caseNo: item.caseNo,
                        callBack: () => {
                            if (item.apptId) {
                                this.props.getPatientEncounter(item.apptId);
                            }
                            item.callback && item.callback();
                            this.props.addTabs(this.patientSummaryTab);

                            this.props.mainFrameUpdateField({
                                curCloseTabMethodType: doCloseFuncSrc.null
                            });
                        }
                    };
                    // console.log('[CAL] getPatientById', params);
                    this.props.getPatientById(params);
                };

                this.props.mainFrameUpdateField({
                    curCloseTabMethodType: doCloseFuncSrc.CLOSE_BY_HANDLE_BEFORE_OPEN_PATIENT_PANEL
                });

                commonUtilities.handleBeforeOpenPatientPanel(item.patientKey, getPatientFunc);
            }
        }
    }

    findRegistrationTab = () => {
        return this.props.tabs.filter(x => x.name === AccessRightEnum.registration);
    }

    closeRegistrationTab = async (tab) => {
        if (typeof tab.doCloseFunc === 'function') {
            this.props.changeTabsActive(tab.deep, tab.name);
            let doCloseParams = { ...tab.doCloseParams, src: doCloseFuncSrc.CLOSE_BY_CALENDAR_VIEW_CHANGE_PATIENT };
            this.props.updateTabs({ [tab.name]: { doCloseParams: doCloseParams } });
            return await new Promise((resolve, reject) => {
                let closeTabsAction = (success) => {
                    // console.log('[CAL] closeTabsAction', success);
                    if (success) {
                        this.props.deleteTabs(tab.name);
                        this.props.changeTabsActive(1, AccessRightEnum.calendarView);
                        resolve(true);
                    }
                };
                tab.doCloseFunc(closeTabsAction, doCloseParams);
            });
        }
        else {
            this.props.deleteTabs(tab.name);
            return true;
        }
    }

    getCalendarData = (newData) => {
        let fileData = newData || {};
        let submitData = {
            viewType: fileData.calendarViewValue || this.props.calendarViewValue,
            svcCd: fileData.serviceValue || this.props.serviceValue,
            date: fileData.date || this.props.date,
            siteId: fileData.siteId || (fileData.index === 2 ? null : this.props.siteId),
            roomIds: fileData.subEncounterTypeValue || (fileData.index === 2 ? null : this.props.subEncounterTypeValue)
        };
        let roomIds = submitData.roomIds;
        // console.log('[CAL] getCalendarData submitData', submitData);
        if ((!Array.isArray(roomIds) && roomIds) || (Array.isArray(roomIds) && roomIds.length)) {
            if (submitData.viewType === 'M') {
                submitData.year = moment(submitData.date).year();
                submitData.month = moment(submitData.date).month() + 1;
                this.props.requestData('calendarMonthData', submitData, fileData);
            }
            if (submitData.viewType === 'W') {
                submitData.dateFrom = moment(submitData.date).startOf('week').format(Enum.DATE_FORMAT_EYMD_VALUE);
                submitData.dateTo = moment(submitData.date).endOf('week').format(Enum.DATE_FORMAT_EYMD_VALUE);
                this.props.requestData('calendarWeekData', submitData, fileData);
            } else if (submitData.viewType === 'D') {
                submitData.date = moment(submitData.date).format(Enum.DATE_FORMAT_EYMD_VALUE);
                this.props.requestData('calendarDayData', submitData, fileData);
            }
        } else {
            let index = fileData.index ?? '';
            if (index === 2)
                fileData = {};
            else
                delete fileData['index'];
            this.props.updateField({
                ...fileData,
                [`calendarDayData${index}`]: null,
                calendarWeekData: null,
                calendarMonthData: null
            });
        }
    }

    encounterTypeValueOnChange = (e) => {
        let keyAndValue = {};
        let fileData = {};
        fileData.encounterTypeValue = e.value;
        fileData.subEncounterTypeListData = e.rowData && e.rowData.subEncounterTypeList.map(item => { keyAndValue[item.subEncounterTypeCd] = item; return item; });
        fileData.subEncounterTypeListKeyAndValue = keyAndValue;
        fileData.subEncounterTypeValue = null;
        fileData.selectEncounterType = { ...e.rowData };

        let defaultRoomId = this.getDefaultRoomId(this.props.serviceCd, this.props.siteId, e.value);

        fileData.subEncounterTypeValue = defaultRoomId;

        if (fileData.subEncounterTypeListData && fileData.subEncounterTypeListData.length === 1) {
            fileData.subEncounterTypeValue = fileData.subEncounterTypeListData[0].rmId;
        }
        this.props.updateField(fileData);

        if (this.state.allowCrossClinicCalendarView)
            this.setEncounterType(e.value, 1);
        // else
        //     this.getCalendarData(fileData);
    }

    subEncounterTypeValueOnChange = (e) => {
        let keyAndValue = {};
        let fileData = {};
        fileData.subEncounterTypeValue = e.value;
        this.props.updateField(fileData);

        if (this.state.allowCrossClinicCalendarView)
            this.setRoom(e.value, 1);
        // else
        //     this.getCalendarData(fileData);
    }

    // checkboxOnChange = (name, value) => {
    //     console.log('[CAL] checkboxOnChange');
    //     let fileData = {};
    //     fileData[name] = _.cloneDeep(this.props[name] || []);
    //     let valueIndex = fileData[name].indexOf(value);
    //     if (valueIndex === -1) {
    //         fileData[name].push(value);
    //     } else {
    //         fileData[name].splice(valueIndex, 1);
    //     }
    //     if (name === 'availableQuotaValue') {
    //         if (fileData[name].indexOf('force') === -1 && fileData[name].indexOf('normal') === -1) {
    //             fileData[name] = [];
    //         }
    //         this.props.updateField(fileData);
    //     } else {
    //         this.getCalendarData(fileData);
    //     }
    // }
    calendarViewValueOnChange = (value, date) => {
        let fileData = {};
        fileData.calendarViewValue = value;
        let dateType;
        switch (value) {
            case 'M':
                dateType = 'month';
                break;
            case 'W':
                dateType = 'week';
                break;
            default:
                dateType = 'day';
                break;
        }
        if (!date) date = this.props.date;
        fileData.dateFrom = date.clone().startOf(dateType);
        fileData.dateTo = date.clone().endOf(dateType);
        fileData.date = date;
        // this.getCalendarData(fileData);
        // console.log('[CAL] calendarViewValueOnChange', fileData);
        this.props.updateField(fileData);
    }

    getDefaultEncounterTypeCd = (svcCd, siteId) => {
        let { clinicConfig } = this.props;
        return commonUtilities.getTopPriorityOfSiteParams(clinicConfig, svcCd, siteId, 'DEFAULT_ENCOUNTER_CD').configValue;
    }

    getDefaultRoomId = (svcCd, siteId, encounterTypeId) => {
        let { clnDefaultRmConfig } = this.props;
        return commonUtilities.getDefaultRmConfig(clnDefaultRmConfig, svcCd, siteId, encounterTypeId).rmId;
    }

    getWeeks = () => {
        let fileData = {};
        fileData.dateFrom = moment(this.props.dateFrom).subtract(1, this.props.calendarViewValue === 'D' ? 'days' : this.props.calendarViewValue);
        fileData.dateTo = moment(this.props.dateTo).subtract(1, this.props.calendarViewValue === 'D' ? 'days' : this.props.calendarViewValue);
        this.getCalendarWeekData(fileData);
    }

    subtractDate = () => {
        let fileData = {};
        fileData.date = moment(this.props.date).subtract(1, this.props.calendarViewValue === 'D' ? 'days' : this.props.calendarViewValue);
        fileData.dateFrom = moment(this.props.dateFrom).subtract(1, this.props.calendarViewValue === 'D' ? 'days' : this.props.calendarViewValue);
        fileData.dateTo = moment(this.props.dateTo).subtract(1, this.props.calendarViewValue === 'D' ? 'days' : this.props.calendarViewValue);
        // this.getCalendarData(fileData);
        this.props.updateField(fileData);
    }
    addDate = () => {
        let fileData = {};
        fileData.date = moment(this.props.date).add(1, this.props.calendarViewValue === 'D' ? 'days' : this.props.calendarViewValue);
        fileData.dateFrom = moment(this.props.dateFrom).add(1, this.props.calendarViewValue === 'D' ? 'days' : this.props.calendarViewValue);
        fileData.dateTo = moment(this.props.dateTo).add(1, this.props.calendarViewValue === 'D' ? 'days' : this.props.calendarViewValue);
        // this.getCalendarData(fileData);
        this.props.updateField(fileData);
    }
    changeMonthViewDate=(value)=>{
        let fileData={};
        fileData.date = moment(value);
        fileData.dateFrom = moment(value);
        fileData.dateTo = moment(value);
        // fileData.calendarMonthData=null;
        this.props.updateField(fileData);
        // this.getCalendarData(fileData);
    }
    monthViewDateOnblur=(value)=>{
        let fileData={};
        fileData.date = moment(value);
        fileData.dateFrom = moment(value);
        fileData.dateTo = moment(value);
        if(moment(fileData.date).isValid()&&moment(fileData.date).isSameOrAfter(moment('1990-01-01'))){
            this.props.updateField(fileData);
            // this.getCalendarData(fileData);
        }
    }
    backToday = () => {
        let value = this.props.calendarViewValue;
        let today = moment();
        this.calendarViewValueOnChange(value, today);
    }

    dayViewSelectTimeSlot = (rowData) => {
        let appointmentData = {};
        let bookData = _.cloneDeep(initBookingData);
        bookData.encounterTypeCd = rowData.encounterType;
        bookData.subEncounterTypeCd = rowData.subEncounterType;
        bookData.appointmentDate = rowData.date;
        bookData.appointmentTime = rowData.time;
        bookData.appointmentTypeCd = rowData.normalRemain > 0 ? 'N' : 'F';
        bookData.clinicCd = this.props.clinicValue;
        appointmentData.bookData = bookData;
        appointmentData.showMakeAppointmentView = true;
        appointmentData.redirectFrom = AccessRightEnum.calendarView;
        if (this.props.patientInfo && this.props.patientInfo.patientKey) {
            this.props.skipTab(AccessRightEnum.booking, appointmentData, true);
        } else {
            this.props.skipTab(AccessRightEnum.bookingAnonymous, appointmentData, true);
        }
    }

    showRemarkDialog = (remarkStore, index) => {
        this.setState({ remarkStore: remarkStore, openRemarkDialog: true, dialogIndex: index });
    }

    closeRemarkDialog = () => {
        this.setState({ openRemarkDialog: false, dialogIndex: null });
    }
    openOrClosePopper = (e, action, remark, patientRemark) => {
        this.setState({
            openPopper: action,
            popperAnchorEl: e,
            popperRemark: remark,
            patientRemark: patientRemark
        });
    }

    closePreviewDialog = () => {
        this.props.updateField({ openApptListPreview: false, apptListReportData: null });
    }
    printApptList = () => {
        const { apptListReportData } = this.props;
        const callback = (printSuccess) => {
            if (printSuccess) {
                this.closePreviewDialog();
            }
        };
        this.props.auditAction('Print Appointment List',null,null,false,'clinical-doc');
        print({ base64: apptListReportData, callback: callback });
    }

    openPreviewWindow = () => {
        const { subEncounterTypeValue, encounterTypeValue, encounterTypeListData, dateTo, serviceCd, siteId } = this.props;
        const { sessionsConfig } = this.state;
        if(!encounterTypeValue || !subEncounterTypeValue || subEncounterTypeValue.length ===0 ){
            this.props.openCommonMessage({ msgCode: '111601' });
            return;
        }
        let enct = encounterTypeListData.find(x => x.encounterTypeCd === encounterTypeValue);
        if (enct) {
            this.props.openPreviewWindow(
                {
                    svcCd: serviceCd,
                    siteId: siteId,
                    // encntrTypeId: enct && enct.encntrTypeId,
                    roomId: subEncounterTypeValue,
                    apptDate: moment(dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
                    sessIds: sessionsConfig.filter(x => x.checked).map(x => x.sessId)
                });
        }
    }

    getRoomUtilization = (slotDate) => {
        const { siteId } = this.props;
        this.props.getRoomUtilization({ siteId, slotDate });
    }

    handleRedistribution = () => {
        this.props.skipTab(AccessRightEnum.redistribution);
    }

    render() {
        const {
            classes,
            siteId,
            encounterTypeListData,
            encounterTypeValue,
            selectEncounterType,
            subEncounterTypeListData,
            subEncounterTypeValue,
            calendarViewValue,
            dateFrom,
            dateTo,
            sessionsConfig,
            quotaConfig,
            openApptListPreview,
            apptListReportData,
            roomUtilizationData,
            accessRights
        } = this.props;
        let quotaName = quotaConfig && quotaConfig[0];
        const hasRedistributionRight = accessRights.findIndex(item => item.name === AccessRightEnum.redistribution) > -1;
        return (
            <Grid id={'calendarView'} className={classes.root}>
                {!this.state.allowCrossClinicCalendarView || calendarViewValue !== 'D' ?
                <FilterBar
                    id={'calendarViewFilterBar'}
                    classes={classes}
                    siteId={siteId}
                    encounterTypeListData={encounterTypeListData}
                    encounterTypeValue={encounterTypeValue}
                    encounterTypeValueOnChange={this.encounterTypeValueOnChange}
                    selectEncounterType={selectEncounterType}
                    subEncounterTypeListData={subEncounterTypeListData}
                    subEncounterTypeValue={subEncounterTypeValue}
                    subEncounterTypeValueOnChange={this.subEncounterTypeValueOnChange}
                    checkboxOnChange={this.checkboxOnChange}
                    calendarViewValue={calendarViewValue}
                    sessionsConfig={this.state.sessionsConfig}
                    toggleSessCheckbox={this.toggleSessCheckbox}
                />
                : null}
                {
                    //<button onClick={()=>{this.openPatientSummary()}}> add tabs</button>
                }
                <Grid className={classes.calendarRoot}>
                    <Form style={{ width: '100%' }}>
                        <RoomUtilization
                            id="calendarView"
                            innerRef={ref => this.roomUtilizationRef = ref}
                            rowData={roomUtilizationData}
                            getRoomUtilization={this.getRoomUtilization}
                        />

                    <CalendarDateBar
                        id={'calendarCalendarDateBar'}
                        classes={classes}
                        calendarViewValue={calendarViewValue}
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        hasRedistributionRight={hasRedistributionRight}
                        subtractDate={this.subtractDate}
                        addDate={this.addDate}
                        backToday={this.backToday}
                        calendarViewValueOnChange={this.calendarViewValueOnChange}
                        openPreviewWindow={this.openPreviewWindow}
                        handleRefresh={this.handleRefresh}
                        handleRedistribution={this.handleRedistribution}
                        changeMonthViewDate={this.changeMonthViewDate}
                        monthViewDateOnblur={this.monthViewDateOnblur}
                        allowCrossClinicCalendarView={this.state.allowCrossClinicCalendarView}
                        auditAction={this.props.auditAction}
                    /></Form>
                    <Grid className={classes.calendarView}>
                        {
                            calendarViewValue !== 'D' ? null :
                            (this.state.allowCrossClinicCalendarView ?
                                <Grid
                                    item
                                    container
                                    alignItems="flex-start"
                                    className={classes.dayViewGroup}
                                    wrap="nowrap"
                                    spacing={2}
                                >
                                    <Grid item xs={this.state.openSecondaryDayView ? 6 : 12} className={classes.dayViewContainer}>
                                        <CIMSDrawer
                                            id="primary_day_view"
                                            open
                                            title="Primary"
                                            onClick={() => {}}
                                            drawerWidth={'100%'}
                                            classes={{
                                                drawer: classes.drawerRoot,
                                                iconButton: classes.drawerNoIcon
                                            }}
                                        >
                                            <Grid container className={classes.drawerContainer}>
                                                <Grid item container justify="flex-end" spacing={1} style={{ marginBottom: 8 }}>
                                                    <Grid item xs={this.state.openSecondaryDayView ? 12 : 5}>
                                                        <CIMSCommonSelect
                                                            id={'primary_clinic'}
                                                            label="Clinic"
                                                            options={this.state.clinicList}
                                                            value={this.state.clinic1}
                                                            inputProps={{
                                                                isDisabled: true,
                                                                filterOption: {
                                                                    matchFrom: 'start'
                                                                }
                                                            }}
                                                            onBlur={() => {

                                                            }}
                                                            onChange={(value, params) => {
                                                                this.setState({ clinic1: value }, async () => {
                                                                    await this.clinicOnChange(1);
                                                                });
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={this.state.openSecondaryDayView ? 3 : 2}>
                                                        <CIMSCommonSelect
                                                            id={'primary_encounter_type'}
                                                            label="Encounter Type"
                                                            options={this.state.encounterTypeList1}
                                                            value={this.state.encounterType1}
                                                            labelProps={{
                                                                classes: {
                                                                    root: classes.labelRoot
                                                                }
                                                            }}
                                                            inputProps={{
                                                                isClearable: false
                                                            }}
                                                            onBlur={() => {

                                                            }}
                                                            onChange={(value, params) => {
                                                                this.setState({ encounterType1: value }, async () => {
                                                                    this.syncEncounterType(1);
                                                                    await this.encounterTypeOnChange(1);
                                                                });
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={this.state.openSecondaryDayView ? 3 : 2}>
                                                        <CIMSCommonSelect
                                                            id={'primary_room'}
                                                            label="Room"
                                                            options={this.state.roomList1}
                                                            value={this.state.room1}
                                                            labelProps={{
                                                                classes: {
                                                                    root: classes.labelRoot
                                                                }
                                                            }}
                                                            inputProps={{
                                                                isClearable: false
                                                            }}
                                                            onBlur={() => {

                                                            }}
                                                            onChange={(value, params) => {
                                                                this.setState({ room1: value }, () => {
                                                                    this.roomOnChange(1, false);
                                                                });
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={this.state.openSecondaryDayView ? 6 : 3}>
                                                        <CIMSCommonSelect
                                                            id={'primary_sessions'}
                                                            label="Sessions"
                                                            options={this.state.sessionList1}
                                                            value={this.state.sessions1}
                                                            inputProps={{
                                                                isMulti: true,
                                                                hideSelectedOptions: false,
                                                                closeMenuOnSelect: false,
                                                                // sortFunc: sortFunc,
                                                                selectAll: '[ Select All ]'
                                                            }}
                                                            onBlur={() => {

                                                            }}
                                                            onChange={(value, params) => {
                                                                this.setState({ sessions1: value }, async () => {
                                                                    await this.syncSessCheckboxes(1);
                                                                    this.sessionsOnChange(1);
                                                                });
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <DayView
                                                    id={'primary_calendarDayView'}
                                                    index={1}
                                                    selectTimeSlot={this.dayViewSelectTimeSlot}
                                                    showRemarkDialog={this.showRemarkDialog}
                                                    openOrClosePopper={this.openOrClosePopper}
                                                    sessionsConfig={this.state.sessionList1}
                                                    getSelectedSessIds={this.getSelectedSessionIds}
                                                    bookQuota={this.bookQuota}
                                                    openPatientSummary={this.openPatientSummary}
                                                    classes={{
                                                        root: classes.dayViewRoot
                                                    }}
                                                />
                                            </Grid>
                                        </CIMSDrawer>
                                    </Grid>
                                    <Grid item xs={this.state.openSecondaryDayView ? 6 : 'auto'} className={classes.dayViewContainer}>
                                        <CIMSDrawer
                                            id="secondary_day_view"
                                            open={this.state.openSecondaryDayView}
                                            title="Secondary (View-only)"
                                            onClick={() => { this.setState({ openSecondaryDayView: !this.state.openSecondaryDayView }); }}
                                            drawerWidth={'100%'}
                                            openIcon={<ChevronRightIcon htmlColor="white" />}
                                            classes={{
                                                drawer: classes.drawerRoot
                                            }}
                                        >
                                            <Grid container className={classes.drawerContainer}>
                                                <Grid item container justify="flex-end" spacing={1} style={{ marginBottom: 8 }}>
                                                    <Grid item xs={this.state.openSecondaryDayView ? 12 : 5}>
                                                        <CIMSCommonSelect
                                                            id={'secondary_clinic'}
                                                            label="Clinic"
                                                            options={this.state.clinicList}
                                                            value={this.state.clinic2}
                                                            inputProps={{
                                                                filterOption: {
                                                                    matchFrom: 'start'
                                                                }
                                                            }}
                                                            onBlur={() => {

                                                            }}
                                                            onChange={(value, params) => {
                                                                this.setState({ clinic2: value }, async () => {
                                                                    await this.clinicOnChange(2);
                                                                });
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={this.state.openSecondaryDayView ? 3 : 2}>
                                                        <CIMSCommonSelect
                                                            id={'secondary_encounter_type'}
                                                            label="Encounter Type"
                                                            options={this.state.encounterTypeList2}
                                                            value={this.state.encounterType2}
                                                            labelProps={{
                                                                classes: {
                                                                    root: classes.labelRoot
                                                                }
                                                            }}
                                                            inputProps={{
                                                                isClearable: false
                                                            }}
                                                            onBlur={() => {

                                                            }}
                                                            onChange={(value, params) => {
                                                                this.setState({ encounterType2: value }, async () => {
                                                                    await this.encounterTypeOnChange(2);
                                                                });
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={this.state.openSecondaryDayView ? 3 : 2}>
                                                        <CIMSCommonSelect
                                                            id={'secondary_room'}
                                                            label="Room"
                                                            options={this.state.roomList2}
                                                            value={this.state.room2}
                                                            labelProps={{
                                                                classes: {
                                                                    root: classes.labelRoot
                                                                }
                                                            }}
                                                            inputProps={{
                                                                isClearable: false
                                                            }}
                                                            onBlur={() => {

                                                            }}
                                                            onChange={(value, params) => {
                                                                this.setState({ room2: value }, () => {
                                                                    this.roomOnChange(2);
                                                                });
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={this.state.openSecondaryDayView ? 6 : 3}>
                                                        <CIMSCommonSelect
                                                            id={'secondary_sessions'}
                                                            label="Sessions"
                                                            options={this.state.sessionList2}
                                                            value={this.state.sessions2}
                                                            inputProps={{
                                                                isMulti: true,
                                                                hideSelectedOptions: false,
                                                                closeMenuOnSelect: false,
                                                                // sortFunc: sortFunc,
                                                                selectAll: '[ Select All ]'
                                                            }}
                                                            onBlur={() => {

                                                            }}
                                                            onChange={(value, params) => {
                                                                this.setState({ sessions2: value }, () => {
                                                                    this.sessionsOnChange(2);
                                                                });
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <DayView
                                                    id={'secondary_calendarDayView'}
                                                    index={2}
                                                    viewOnly
                                                    selectTimeSlot={this.dayViewSelectTimeSlot}
                                                    showRemarkDialog={this.showRemarkDialog}
                                                    openOrClosePopper={this.openOrClosePopper}
                                                    sessionsConfig={this.state.sessionList2}
                                                    getSelectedSessIds={this.getSelectedSessionIds}
                                                    bookQuota={this.bookQuota}
                                                    openPatientSummary={this.openPatientSummary}
                                                    classes={{
                                                        root: classes.dayViewRoot
                                                    }}
                                                />
                                            </Grid>
                                        </CIMSDrawer>
                                    </Grid>
                                </Grid>
                                :
                                <DayView
                                    id={'calendarDayView'}
                                    selectTimeSlot={this.dayViewSelectTimeSlot}
                                    showRemarkDialog={this.showRemarkDialog}
                                    openOrClosePopper={this.openOrClosePopper}
                                    sessionsConfig={this.state.sessionsConfig}
                                    getSelectedSessIds={this.getSelectedSessIds}
                                    bookQuota={this.bookQuota}
                                    openPatientSummary={this.openPatientSummary}
                                />
                            )
                        }
                        {
                            calendarViewValue !== 'W' ? null :
                                <WeekView
                                    id={'calendarWeekView'}
                                    sessionsConfig={this.state.sessionsConfig}
                                    getSelectedSessIds={this.getSelectedSessIds}
                                    getSessStartEndTime={this.getSessStartEndTime}
                                    bookQuota={this.bookQuota}
                                />
                        }
                        {
                            calendarViewValue !== 'M' ? null :
                                <MonthView
                                    id={'calendarMonthView'}
                                    sessionsConfig={this.state.sessionsConfig}
                                    getSelectedSessIds={this.getSelectedSessIds}
                                    bookQuota={this.bookQuota}
                                    calendarViewValueOnChange={this.calendarViewValueOnChange}
                                />
                        }

                    </Grid>
                    <Grid container className={classes.legendBar}>
                        <Grid item xs={6}>
                            <UtilisationBar />
                        </Grid>
                        <Grid item xs={6}>
                            <ShortNameBar
                                quotaName={quotaName}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <RemarkDialog
                    id={'calendarViewRemarkDialog'}
                    remarkStore={this.state.remarkStore}
                    open={this.state.openRemarkDialog}
                    // remarkHover={this.remarkHover}
                    onClose={this.closeRemarkDialog}
                    countryList={this.props.countryList}
                    openPatientSummary={this.openPatientSummary}
                    viewOnly={this.state.dialogIndex == null ? false : this.state.dialogIndex === 2}
                />
                <RemarkPopper
                    id={'calendarViewRemarkPopper'}
                    open={this.state.openPopper}
                    anchorEl={this.state.popperAnchorEl}
                    remarkData={this.state.popperRemark}
                    patientRemark={this.state.patientRemark}
                    countryList={this.props.countryList}
                    transition
                />

                <ApptListViewDialog
                    id={'calendarViewApptListView'}
                    open={openApptListPreview}
                    closeApptListDialog={this.closePreviewDialog}
                    previewData={apptListReportData}
                    print={this.printApptList}
                />

            </Grid>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        tabsActiveKey: state.mainFrame.tabsActiveKey,
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        clinicCd: state.login.clinic.clinicCd,
        clinicConfig: state.common.clinicConfig,
        clnDefaultRmConfig: state.common.clnDefaultRmConfig,
        rooms: state.common.rooms,
        sessionsConfig: state.common.sessionsConfig,
        calendarViewValue: state.calendarView.calendarViewValue,
        availableQuotaValue: state.calendarView.availableQuotaValue,
        serviceValue: state.calendarView.serviceValue,
        clinicValue: state.calendarView.clinicValue,
        encounterTypeValue: state.calendarView.encounterTypeValue,
        selectEncounterType: state.calendarView.selectEncounterType,
        subEncounterTypeValue: state.calendarView.subEncounterTypeValue,
        dateFrom: state.calendarView.dateFrom,
        dateTo: state.calendarView.dateTo,
        date: state.calendarView.date,
        quotaConfig: state.common.quotaConfig,
        encounterTypeListData: state.calendarView.encounterTypeListData,
        subEncounterTypeListData: state.calendarView.subEncounterTypeListData,
        calendarData: state.calendarView.calendarData,
        subEncounterTypeListKeyAndValue: state.calendarView.subEncounterTypeListKeyAndValue,
        patientInfo: state.patient.patientInfo,
        accessRights: state.login.accessRights,
        tabs: state.mainFrame.tabs,
        bookingData: state.bookingInformation.bookingData,
        anonBookingData: state.bookingAnonymousInformation.bookingData,
        countryList: state.patient.countryList || [],
        openApptListPreview: state.calendarView.openApptListPreview,
        apptListReportData: state.calendarView.apptListReportData,
        anonPatientInfo: state.bookingAnonymousInformation.anonPatientInfo,
        roomUtilizationData: state.calendarView.roomUtilizationData,
        bookingPageSts: state.bookingInformation.pageStatus,
        anonymousPageSts: state.bookingAnonymousInformation.pageStatus,
        encntrTypeList: state.common.encounterTypeList,
        filterLists: state.calendarView.filterLists
    };
};

const mapDispatchToProps = {
    mainFrameUpdateField,
    updateAnonBookingState,
    updateBookingState,
    requestData,
    resetAll,
    updateField,
    getPatientById,
    getPatientEncounter,
    addTabs,
    skipTab,
    changeTabsActive,
    deleteSubTabs,
    deleteTabs,
    updateTabs,
    openPreviewWindow,
    openCommonMessage,
    getRoomUtilization,
    auditAction,
    getFilterLists
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CalendarView));
