import React, { Component, useState, useEffect, useRef } from 'react';
import { withStyles, MuiThemeProvider } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import moment from 'moment';
import { Grid } from '@material-ui/core';
import _ from 'lodash';
import DtsLeftPanel from './components/DtsLeftPanel';
import DtsRightPanel from './components/DtsRightPanel';
import DtsDayViewPanel from './components/DtsDayViewPanel';
import Enum from '../../../enums/enum';
import DtsDailyNoteBooking from './components/DtsDailyNoteBooking';
import DtsUrgentAppointmentDialog from './components/DtsUrgentAppointmentDialog';
import DtsGpUrgentAppointmentDialog from './components/DtsGpUrgentAppointmentDialog';
import DtsDailyViewNavigationHistoryDialog from './components/DtsDailyViewNavigationHistoryDialog';
import DtsCloseTimeSlotDialog from './components/DtsCloseTimeslotDialog';
import * as dtsUtilities from '../../../utilities/dtsUtilities';
import * as dtsBookingConstant from '../../../constants/dts/appointment/DtsBookingConstant';
import { GD_SPECIALTY_CODE } from '../../../constants/dts/patient/DtsDefaultRoomConstant';
import { REDIRECT_ACTION_TYPE } from '../../../enums/dts/patient/DtsPatientSummaryEnum';
import { setRedirect } from '../../../store/actions/dts/patient/DtsPatientSummaryAction';

import DtsPatientSearch from '../components/DtsPatientSearch';
import DtsAttendanceConfirmationDialog from '../../dts/appointment/components/DtsAttendanceConfirmationDialog';

import {
    resetAll,
    setPageStatus,
    getPatientAppointment,
    setDailyViewNavigationHistory,
    insertAppointment,
    getDailyView,
    setCalendarDetailMth,
    updateAppointment,
    getAvailableCalendarTimeSlot,
    getAvailableCalendarDetailMth,
    rescheduleAppointment,
    setSelectedRescheduleAppointment,
    setEmptyTimeslotDateList,
    insertUrgentAppointment,
    setSelectedRoom,
    getEncounterTypeList,
    setSelectedEncounterType,
    setDuration,
    getServeRoom,
    getRoomList,
    setIsUpdated,
    getReferralList,
    getReferralDefaultRoom,
    deleteAppointment,
    setCalendarDetailDate,
    setReferralShowAppointmentId,
    setFilterMode
} from '../../../store/actions/dts/appointment/bookingAction';
import { CREATE_MODE } from '../../../constants/dts/appointment/DtsWaitingListConstant';
import { getGdDefaultRoom } from '../../../store/actions/dts/patient/DtsDefaultRoomAction';
import { updatePatientListField } from '../../../store/actions/patient/patientSpecFunc/patientSpecFuncAction';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import accessRightEnum from '../../../enums/accessRightEnum';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import { addTabs, deleteTabs, deleteSubTabs, changeTabsActive, cleanTabParams, skipTab, updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import { setPatientKeyNAppointment, setSelectedAppointmntTask, confirmAttendance } from '../../../store/actions/dts/appointment/attendanceAction';
import { PageStatus as pageStatusEnum } from '../../../enums/dts/appointment/bookingEnum';
import { contactHistoryAction } from '../../../enums/dts/appointment/contactHistoryActionEnum';
import dtstheme from '../theme';
import DtsButton from '../components/DtsButton';
import DtsOpenTimeslotDialog from './components/DtsOpenTimeslotDialog';
import DtsDeleteAppointmentDialog from './components/DtsDeleteAppointmentDialog';
import DtsReserveAppointmentDialog from './components/DtsReserveAppointmentDialog';
import DtsAppointmentDialogBooking from './components/DtsAppointmentDialogBooking';
import DtsContactHistoryDialog from './components/DtsContactHistoryDialog';
import DtsTimeslotLogDialog from './components/DtsTimeslotLogDialog';
import DtsWaitingListDetailDialog from './components/DtsWaitingListDetailDialog';

const styles = (theme) => ({
    root: {
        width: '101%',
        overflow: 'initial',
        // margin:'-8px -8px -8px -8px',
        margin:'-15px -8px -8px -8px',
        fontFamily: 'Microsoft JhengHei, Calibri',
        backgroundColor:'#F8F8F840'
    }
});

const patientFunctionCd = accessRightEnum.DtsBooking;
const nonPatientFunctionCd = accessRightEnum.DtsBookingNonPatient;

let patientCall = CommonUtilities.getPatientCall();

class Booking extends Component {
    constructor(props){
        super(props);
        this.patientTab = props.accessRights.find((item) => item.name === patientFunctionCd);
        this.nonPatientTab = props.accessRights.find((item) => item.name === nonPatientFunctionCd);
        this.state = {
            bookingMode: dtsBookingConstant.DTS_BOOKING_MODE_APPT,

            // Dialog control flags
            openConfirmDialog: false,
            counterOpenSubTab: false,
            handleSearchPatientClick: false,
            openUrgentAppointmentDialog: false,
            openGpUrgentAppointmentDialog: false,
            openCloseTimeSlotDialog: false,
            openUnavailableTimeSlotDialog: false,
            openDeleteAppointmentDialog: false,
            openReserveAppointmentDialog: false,
            selectedReserveAppointment: null,
            openContactHistoryDialog: false,
            contactHistoryAppointment: null,
            openDailyViewNavigationHistoryDialog: false,
            openTimeslotLogDialog: false,
            openAttendanceConfirmDialog:false,
            openWaitingListDialog:false,

            // For DtsTimeslotLogDialog data
            timeslotLogTimeslots: [],

            // Global veriable of booking page
            generalAppointmentObjList: [],
            urgentAppointmentObj: null,
            maxMultipleAppointmentCount: 9,

            // default room variable
            newDefaultRoomId: null,

            //preset PMI for waitingList
            pmi:null,

            // Referral list for patient
            referralRoomId: null,
            referralPatientKey: null,
            referralListForPatient: []

            //testFactoryObj: this.createBaseFactoryObj() // Tony test
        };

        this.patientLoaded = this.patientLoaded.bind(this);
    }

    componentDidMount() {
        this.initDoClose();
        this.initPassInParams();
        this.updateBookingModeFromOtherTab();
        this.resetToPatientDefaultRoom();
        //this.loadServeRoomInfo();
        this.loadReferralList();

        //this.createFactoryObj();  // Tony test
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps && !prevProps.patient && this.props.patient && this.state.handleSearchPatientClick){
            if (this.props.userRoleType === Enum.USER_ROLE_TYPE.COUNTER) {
                this.setState({counterOpenSubTab: true});
            }
            else {
                setTimeout(this.openPatientTab(), 0);
            }
            this.setState({handleSearchPatientClick: false});

        }
        if (this.state.counterOpenSubTab){
            if (this.props.subTabs.find(item => item.name == accessRightEnum.patientSummary)){
                this.setState({counterOpenSubTab: false});
                setTimeout(this.openPatientTab(), 0);
            }
        }

        if (this.props.patient?.patientKey !== prevProps?.patient?.patientKey) {
            this.props.getReferralDefaultRoom(this.props.defaultClinic.siteId, this.props.patient.patientKey);
        }

        this.updateReferralListForPatient();
        this.updateBookingModeFromOtherTab();
        this.resetToPatientDefaultRoom();

        // console.log('this.props.functionCd = '+this.props.functionCd+' / prevState.bookingMode = '+prevState.bookingMode+' / this.state.bookingMode = '+this.state.bookingMode);
        // console.log('selected encounter type = '+((this.props.pageLevelState.selectedEncounterType === undefined) ? 'Null' : this.props.pageLevelState.selectedEncounterType.encntrTypeDesc));
        this.resetRoomAndEncounterForRescheduleAppt(prevState);
    }
    // Tony test
    // createBaseFactoryObj = () => {
    //     return {
    //         basePropA: 'a',
    //         basePropB: 'b',
    //         setProp(entry, value) {
    //             if (entry == 'a'){
    //                 this.basePropA = value;
    //             }
    //             else {
    //                 this.basePropB = value;
    //             }
    //         },
    //         printProp() {
    //             console.log('basePropA: ' + (this.basePropA ? this.basePropA : 'undefined') + ' basePropB: ' + (this.basePropB ? this.basePropB : 'undefined'));
    //             console.log(this);
    //         }
    //     };
    // }

    // createFactoryObj = () => {
    //     let baseObj = this.createBaseFactoryObj();
    //     if (this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT) {
    //         let testFactoryObj = { ...baseObj,
    //             sayHello() {
    //                 console.log('Hello');
    //             },
    //             setProp(entry, value) {
    //                 this.sayHello();
    //                 if (entry == 'a'){
    //                     this.basePropA = 'DTS_BOOKING_MODE_APPT> ' + value;
    //                 }
    //                 else {
    //                     this.basePropB = 'DTS_BOOKING_MODE_APPT> ' + value;
    //                 }
    //             }
    //         };
    //         this.setState({testFactoryObj: testFactoryObj});
    //     }
    // }
    // Tony test - End
    updateBookingModeFromOtherTab = () => {
        // get data from dtsEmptyTimeslotPatientGroup
        // console.log('location state at '+this.props.functionCd +':'+ JSON.stringify(this.props.location.state)+' ');
        if (this.props.functionCd === patientFunctionCd){
            if(this.props.location.state){
                let param = this.props.location.state;

                if(param.paramFrom != null){

                    if(param.paramFrom == 'DtsEmptyTimeslotPatientGroup' || param.paramFrom == 'DtsAppointmentList' || param.paramFrom == 'DtsDayViewPanel'){
                        this.setBookingMode(param.bookingMode, this.resetLocationState);
                    }
                    else if(param.paramFrom == 'patientSummary' && param.action == 'showDailyView'){
                        this.showAppointment(param.data);
                        this.resetLocationState();
                    }
                }
            }
        }
    }

    resetLocationState = () => {
        const history = this.props.history;
        // console.log('resetLocationState :'+JSON.stringify(history));
        if (history.location && history.location.state) {
            let location = history.location;
            location.state = undefined;
            history.replace({ ...location });
        }
    }

    // set default room for single booking mode only.
    resetToPatientDefaultRoom = () => {
        // console.log(this.props.functionCd+' resetToPatientDefaultRoom');
        if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT){
            if(this.props.patient && this.props.patientDefaultRoomId !== undefined){
                if(this.props.pageLevelState.selectedRoom == null || this.props.pageLevelState.selectedRoom == undefined){
                    this.setDefaultRoom([this.props.serveRoom?.[0]?.roomId, this.props.patientDefaultRoomId, this.props.referralDefaultRoomId])(this.props.dtsRoomList);
                }
            }
        }
    }

    resetRoomAndEncounterForRescheduleAppt = (prevState) => {
        // console.log(this.props.functionCd+' resetRoomAndEncounterForRescheduleAppt');
        // console.log(this.props.functionCd+' prevState.bookingMode = '+prevState.bookingMode);
        // console.log(this.props.functionCd+' this.state.bookingMode = '+this.state.bookingMode);

        // Reschedule flow set encounter type ref from appointment
        if(prevState.bookingMode != dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT && this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT){
            if (this.props.selectedRescheduleAppointment != null && this.props.selectedRescheduleAppointment.fromAppointment != null)
            {
                // Set room for reschedule appointment.
                // if reschedule from empty timeslot page, this.props.emptyTimeslotDateList should have more then one object.
                // So will not assign the room for this case.
                const tempRoomId = this.props.selectedRescheduleAppointment.fromAppointment.roomId;
                const tempEncounterTypeId = this.props.selectedRescheduleAppointment.fromAppointment.appointmentDetlBaseVoList[0].encounterTypeId;

                if(this.props.emptyTimeslotDateList == null || this.props.emptyTimeslotDateList.length == 0){
                    if(this.props.dtsRoomList.length == 0){
                        this.props.getRoomList({siteId:this.props.defaultClinic.siteId}, this.setDefaultRoom([tempRoomId], tempEncounterTypeId));
                    }
                    else
                        this.setDefaultRoom([tempRoomId], tempEncounterTypeId)(this.props.dtsRoomList);
                }
                else
                    this.setDefaultEncounterType(tempEncounterTypeId)(this.props.dtsEncounterTypeList);
            }
        }
    }

    setDefaultRoom = (targetRoomIds, targetEncounterTypeId = null) => (
        (dbRoomList) => {
            // console.log(this.props.functionCd+' setDefaultRoom targetRoomId = '+targetRoomId+'/ targetEncounterTypeId = '+targetEncounterTypeId);
            let defaultRoom = null;
            for (let targetRoomId of targetRoomIds) {
                defaultRoom = dbRoomList.find(room => room.rmId == targetRoomId);
                if (defaultRoom) break;
            }

            let callbackSetEncounter = null;
            if(targetEncounterTypeId != null){
                callbackSetEncounter = this.setDefaultEncounterType(targetEncounterTypeId);
            }

            if(defaultRoom != undefined){
                this.props.setSelectedRoom({room:defaultRoom});
                this.props.getEncounterTypeList({roomIdList: [defaultRoom.rmId]}, callbackSetEncounter);
            }
        }
    );

    setDefaultEncounterType = (targetEncounterTypeId) => (
        (dbEncounterTypeList) => {
            // console.log(this.props.functionCd+' setDefaultEncounterType targetEncounterTypeId = '+targetEncounterTypeId);
            if (dbEncounterTypeList.length > 0)
            {
                let encounterType = dbEncounterTypeList.filter(encounterType => encounterType.encntrTypeId === targetEncounterTypeId)[0];
                if(!_.isEmpty(encounterType)) {
                    this.props.setSelectedEncounterType({encounterType:encounterType});
                    this.props.setDuration(encounterType.drtn);
                }
            }
        }
    );

    loadServeRoomInfo = () => {
        if(!this.props.serveRoom || this.props.serveRoom.length == 0){
            this.props.getServeRoom({userId: this.props.loginInfo.userDto.userId, date: moment()});
        }
    }

    updateReferralListForPatient = () => {
        // console.log('updateReferralListForPatient with '+this.props.functionCd);
        if(this.props.functionCd == patientFunctionCd){
            if(this.props.pageLevelState.selectedRoom != undefined &&
                (this.state.referralPatientKey == null || this.state.referralPatientKey != this.props.patient.patientKey || this.state.referralRoomId != this.props.pageLevelState.selectedRoom.rmId)){
                let tempReferralList = [];
                this.props.referralList.forEach((referralItem) => {
                    if(referralItem.patientKey == this.props.patient.patientKey && !referralItem.isDischarged && referralItem.sspecIdTo == this.props.pageLevelState.selectedRoom.sspecId)
                        tempReferralList.push(referralItem);
                });
                this.setState(
                    {
                        referralRoomId: this.props.pageLevelState.selectedRoom.rmId,
                        referralPatientKey: this.props.patient.patientKey,
                        referralListForPatient: tempReferralList
                    }
                );
            }
        }
    }

    updateReferralList = () => {
        this.props.getReferralList(
            this.props.defaultClinic.siteId,
            null,
            () => {
                this.setState(
                    {
                        referralRoomId: null,
                        referralPatientKey: null
                    }
                );
            }
        );
    }

    loadReferralList = () => {
        if(_.isEmpty(this.props.referralList)) {
            this.updateReferralList();
        }
        this.props.getReferralDefaultRoom(this.props.defaultClinic.siteId, this.props.patient?.patientKey);
    }

    showAppointment = (appointment) => {
        const roomId = (appointment.roomId != undefined) ? appointment.roomId : appointment.rmId;
        const appointmentDate = (appointment.appointmentDate != undefined) ? appointment.appointmentDate : appointment.appointmentDateTime;

        this.props.setReferralShowAppointmentId(appointment.appointmentId);
        this.props.setSelectedRoom({ room: this.props.dtsRoomList.find(s => s.rmId == roomId) });
        this.props.getEncounterTypeList({ roomIdList: [roomId] },
            encounterTypeList => {
                const encounterType = encounterTypeList.find(e => e.encntrTypeCd === appointment.encounterTypeCd);
                this.props.setSelectedEncounterType({ encounterType });
                this.props.setDuration(encounterType.drtn);
        });
        this.props.setCalendarDetailDate(moment(appointmentDate));
        this.props.setFilterMode(1);
        this.props.getDailyView({ rmId: roomId, date: moment(appointmentDate).startOf('day')});
    }

    //////////////////////////////////////////////
    //// Appointment level data init function ////
    //////////////////////////////////////////////

    addToGeneralAppointmentObjList = (dayViewObj) => {
        if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT){
            console.log('Add to DTS_BOOKING_MODE_APPT');
            this.setState({generalAppointmentObjList: [this.newInsertAppointmentObj(dayViewObj)]});
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE){
            console.log('Add to DTS_BOOKING_MULTIPLE_MODE');
            let tempAppointmentObjList = this.state.generalAppointmentObjList;
            let dailyViewExist = false;
            let apptCountExceedMaxLimit = true;

            tempAppointmentObjList.forEach(apptObj => {
                if(apptObj.date == dayViewObj.date)
                    dailyViewExist = true;
            });

            if(this.state.generalAppointmentObjList.length < this.state.maxMultipleAppointmentCount){
                apptCountExceedMaxLimit = false;
            }

            if(!dailyViewExist && !apptCountExceedMaxLimit){
                // sort the appointment object list by Date
                let tempApptList = [...tempAppointmentObjList, this.newInsertAppointmentObj(dayViewObj)];
                tempApptList.sort(function(a, b){
                    if(moment(a.date).isSameOrBefore(moment(b.date)))
                        return -1;
                    else
                        return 1;
                });

                this.setState({generalAppointmentObjList: tempApptList});
            }
            else if(apptCountExceedMaxLimit){
                this.props.openCommonMessage({
                    msgCode: '140015',
                    showSnackbar: true,
                    variant: 'warning',
                    params: [
                        { name: 'MAX_APPT_COUNT', value: this.state.maxMultipleAppointmentCount}
                    ]
                });
            }
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE){
            console.log('Add to DTS_BOOKING_EXPRESS_MODE');
            let tempAppointmentObjList = this.state.generalAppointmentObjList;
            this.setState({generalAppointmentObjList: [...tempAppointmentObjList, this.newExpressAppointmentObj(dayViewObj)]});
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT){
            console.log('Add to DTS_BOOKING_MODE_UPDATE_APPT');
            this.setState({generalAppointmentObjList: [this.newUpdateAppointmentObj(dayViewObj)]});
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT){
            console.log('Add to DTS_BOOKING_MODE_RESCHEDULE_APPT');
            this.setState({generalAppointmentObjList: [this.newRescheduleAppointmentObj(dayViewObj)]});
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_EMPTY_TIMESLOT){
            //
        }
    }

    addToUrgentAppointmentObj = (urgentAppointmentObj, callback) => {
        this.setState({ urgentAppointmentObj: urgentAppointmentObj }, callback);
    }

    removeFromGeneralAppointmentObjList = removeIdx => event => {
        // console.log('removeFromGeneralAppointmentObjList at index : '+removeIdx);
        let outputDailyViewTimeslotList = [...this.state.generalAppointmentObjList];
        outputDailyViewTimeslotList.splice(removeIdx, 1);
        this.updateGeneralAppointmentObjList(outputDailyViewTimeslotList);
    }

    updateGeneralAppointmentObjList = (newList) => {
        this.setState({generalAppointmentObjList: newList});
    }

    resetGeneralAppointmentObjList = () => {
        this.setState({
            bookingMode: dtsBookingConstant.DTS_BOOKING_MODE_APPT,
            generalAppointmentObjList: []
        });
    }

    resetUrgentAppointmentObj = () => {
        this.setState({
            urgetntAppointmentObj: null
        });
    }

    newInsertAppointmentObj = (dayViewObj) => {
        // console.log('newInsertAppointmentObj');
        return {
            selectedPatient: this.props.patient,
            selectedClinic: this.props.pageLevelState.selectedClinic,
            selectedRoom: this.props.pageLevelState.selectedRoom,
            selectedEncounterType: this.props.pageLevelState.selectedEncounterType,
            appointmentTime: null,
            specialRequest: '',
            justificationMode: false,
            justification: '',
            isSqueezeIn: dayViewObj.type === 'A',
            isSelfSqueezeIn: false,
            hasError: false,
            specialtyId: '',
            type: dayViewObj.type,
            errMsg: [],
            date: this.props.pageLevelState.calendarDetailDate,
            timeslots: dayViewObj.timeslots,
            tmsltList: [],
            referralItemList: [],
            showReferralSection: false,
            session: dayViewObj.session,
            durationMin: null,
            selectedDayTimeslotList:this.props.selectedDayTimeslotList
        };
    }

    newExpressAppointmentObj = (dayViewObj) => {
        // built overall timeslot list
        let dayViewTimeslotList = {amList:[], pmList:[], ameohList:[], pmeohList:[], edcList:[]};
        let sessionDesc = '';
        let timeslotType = '';
        let patientKeyVal = '';
        if(dayViewObj != null){
            sessionDesc = dayViewObj.session.sessionDescription;
            timeslotType = dayViewObj.type;
            patientKeyVal = (dayViewObj.appointment) ? dayViewObj.appointment.patientKey : '';
            dayViewObj.timeslots.forEach(timeslot => {
                let newTimeslot = {...timeslot, type:timeslotType, patientKey:patientKeyVal};
                if(sessionDesc == 'AM')
                    dayViewTimeslotList.amList.push(newTimeslot);
                else if(sessionDesc == 'PM')
                    dayViewTimeslotList.pmList.push(newTimeslot);
                else if(sessionDesc == 'AMEOH')
                    dayViewTimeslotList.ameohList.push(newTimeslot);
                else if(sessionDesc == 'PMEOH')
                    dayViewTimeslotList.pmeohList.push(newTimeslot);
                else if(sessionDesc == 'EDC')
                    dayViewTimeslotList.edcList.push(newTimeslot);
            });
        }

        return {
            selectedPatient: this.props.patient,
            selectedClinic: this.props.pageLevelState.selectedClinic,
            selectedRoom: this.props.pageLevelState.selectedRoom,
            selectedEncounterType: this.props.pageLevelState.selectedEncounterType,
            appointmentTime: null,
            specialRequest: '',
            justificationMode: false,
            justification: '',
            isSqueezeIn: false,
            isSelfSqueezeIn: false,
            hasError: false,
            specialtyId: '',
            type: dayViewObj.type,
            errMsg: [],
            date: dayViewObj.date,
            timeslots: dayViewObj.timeslots,
            tmsltList: [],
            session: dayViewObj.session,
            durationMin: null,
            selectedDayTimeslotList:dayViewTimeslotList
        };
    }

    newUpdateAppointmentObj = (appointmentObj) => {
        console.log('newUpdateAppointmentObj');

        // if dtsEncounterTypeList don't have the specified encounter, pass the code to dtsAppoitnmentDialog to find out the encounterType object.
        let apptEncounterType = this.props.dtsEncounterTypeList.find(encounterType => encounterType.encntrTypeCd == appointmentObj.encounterTypeCd);
        if(apptEncounterType == undefined){
            apptEncounterType = {
                encounterTypeCd: appointmentObj.encounterTypeCd
            };
        }

        let apptRoom = this.props.dtsRoomList.find(room => room.rmId == appointmentObj.roomId);
        let specialRequest = (
            (appointmentObj.appointmentSpecialRequestVo != null)
            ? appointmentObj.appointmentSpecialRequestVo.remark
            : null
        );
        let justification = (
            (appointmentObj.appointmentJustificationVo != null)
            ? appointmentObj.appointmentJustificationVo.exemptReason
            : null
        );

        let selectedDayTimeslotList = {
            amList: [],
            ameohList: [],
            pmList: [],
            pmeohList: [],
            edcList:[]
        };

        let timeslots = [];
        appointmentObj.appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList.forEach(element => {
            timeslots.push(element.timeslotVo);
        });
        timeslots = timeslots.sort(function(a,b){
            if(a.startTime < b.startTime)
                return -1;
            if(a.startTime > b.startTime)
                return 1;
            return 0;
        });

        return {
            selectedPatient: appointmentObj.patientDto,
            selectedClinic: this.props.pageLevelState.selectedClinic,
            selectedRoom: apptRoom,
            selectedEncounterType: apptEncounterType,
            appointmentId:appointmentObj.appointmentId,         // update appointment case only
            appointmentTime: null,
            specialRequest: specialRequest,
            justificationMode: false,
            justification: justification,
            isSqueezeIn: false,
            isSelfSqueezeIn: false,
            hasError: false,
            specialtyId: '',
            type: '',
            errMsg: [],
            date: appointmentObj.appointmentDateTime,
            timeslots: timeslots,
            tmsltList: [],
            session: {},
            durationMin: null,
            selectedDayTimeslotList:selectedDayTimeslotList
        };
    }

    newRescheduleAppointmentObj = (dayViewObj) => {
        console.log('newRescheduleAppointmentObj');

        let specialRequest = (
            (this.props.selectedRescheduleAppointment.appointmentSpecialRequestVo != null)
            ? this.props.selectedRescheduleAppointment.appointmentSpecialRequestVo.remark
            : null
        );
        let justification = (
            (this.props.selectedRescheduleAppointment.appointmentJustificationVo != null)
            ? this.props.selectedRescheduleAppointment.appointmentJustificationVo.exemptReason
            : null
        );
        let apptEncounterType = null;
        if(this.props.pageLevelState.selectedEncounterType != null){
            apptEncounterType = this.props.pageLevelState.selectedEncounterType;
        }
        else{
            apptEncounterType = this.props.dtsEncounterTypeList.find(encounterType => encounterType.encntrTypeCd == this.props.selectedRescheduleAppointment.fromAppointment.encounterTypeCd);
        }

        return {
            selectedPatient: this.props.patient,
            selectedClinic: (this.props.pageLevelState.selectedClinic && this.props.pageLevelState.selectedClinic.clinicName) ? this.props.pageLevelState.selectedClinic : this.props.defaultClinic,
            selectedRoom: this.props.pageLevelState.selectedRoom,
            selectedEncounterType: apptEncounterType,
            appointmentTime: null,
            specialRequest: specialRequest,
            justificationMode: false,
            justification: justification,
            isSqueezeIn: false,
            isSelfSqueezeIn: false,
            hasError: false,
            specialtyId: '',
            type: dayViewObj.type,
            errMsg: [],
            date: this.props.pageLevelState.calendarDetailDate,
            timeslots: dayViewObj.timeslots,
            tmsltList: [],
            session: dayViewObj.session,
            durationMin: null,
            selectedDayTimeslotList:this.props.selectedDayTimeslotList,
            removeReserveItem: (this.props.selectedRescheduleAppointment.fromAppointment.reserve != null) ? true : false,   // reschedule appointment only
            fromAppointment: this.props.selectedRescheduleAppointment.fromAppointment,                                      // reschedule appointment only
            reschRsnRemark: '',         // reschedule appointment only
            reschRsnTypeId: ''          // reschedule appointment only
        };
    }

    ////////////////////////////////////////
    //// Confirm params action function ////
    ////////////////////////////////////////

    confirmOverallAppointmentDialog = () => {
        if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT){
            return this.confirmInsertAppointmentDialog();
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE){
            return this.confirmInsertAppointmentDialog();
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE){
            return this.confirmInsertAppointmentDialog();
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT){
            return this.confirmUpdateAppointmentDialog();
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT){
            return this.confirmRescheduleAppointmentDialog();
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_EMPTY_TIMESLOT){
            return null;
        }
    }

    confirmInsertAppointmentDialog = () => {
        console.log('confirmInsertAppointmentDialog');

        let appointmentDataList = [];
        let gdSpecialty = this.props.allSpecialties.find(specialty => specialty.sspecCd === GD_SPECIALTY_CODE);
        let needRefeashReferralList = false;

        this.state.generalAppointmentObjList.forEach(apptObj => {
            let formatApptDate = moment(apptObj.date).format('YYYY-MM-DD') + ' 00:00';
            let formatStartTime = moment(apptObj.date).format('YYYY-MM-DD') + ' ' + apptObj.tmsltList[0].startTime;
            let formatEndTime = moment(apptObj.date).format('YYYY-MM-DD') + ' ' + apptObj.tmsltList[apptObj.tmsltList.length -1].endTime;

            // check is it necessary to update referral list
            if(apptObj.referralItemList.length > 0)
                needRefeashReferralList = true;

            let appointmentData = {
                apptDate:dtsUtilities.formatDateParameter(formatApptDate),
                encntrTypeId:apptObj.selectedEncounterType.encntrTypeId,
                isObs:0,
                isSqueeze:apptObj.isSqueezeIn ? 1 : 0,
                patientKey:apptObj.selectedPatient.patientKey,
                qtId:'QT1',
                rmId:apptObj.selectedRoom.rmId,
                seq:0,
                sessId:apptObj.appointmentTime.sessionId,
                siteId:apptObj.selectedClinic.siteId,
                sdtm: dtsUtilities.formatDateParameter(formatStartTime),
                edtm: dtsUtilities.formatDateParameter(formatEndTime),
                tmsltIdList: apptObj.tmsltList.map(item => item.id),
                rerLstIdList: (apptObj.referralItemList.length > 0) ? apptObj.referralItemList.map(item => item.referralListId) : null,
                specialRequest: apptObj.specialRequest,
                justificationReason:apptObj.justification,
                updateDefaultRoom: (this.state.newDefaultRoomId == apptObj.selectedRoom.rmId) ? true : false,
                specialtyId: this.state.newDefaultRoomId ? gdSpecialty.sspecId : null
            };
            appointmentDataList.push(appointmentData);
        });

        let params = {
            byPassWarning: false,
            confirmAppointmentDtoList: appointmentDataList
        };

        let callbackList = [];

        // refeash calendar value
        callbackList.push(this.refreshCalendarList);
        callbackList.push(this.refreshCalendarDetail);

        // for appointment data reset
        callbackList.push(this.refreshDailyView);
        callbackList.push(this.refreshPatientAppointmentList);

        if(needRefeashReferralList){
            callbackList.push(this.updateReferralList);
        }

        // default room logic
        callbackList.push(
            () => {
                if (this.props.appointmentList && this.props.appointmentList.length > 0 &&
                    this.props.appointmentList[0].outputBaseVo.defaultRoomUpdated) {
                    console.log('refresh GD default room');

                    // refresh the patient banner
                    this.props.getGdDefaultRoom({ patientKey: this.props.patient.patientKey, serviceCd: 'DTS' });
                }
            }
        );

        // clear Data
        callbackList.push(this.closeAppointmentDialogBox);
        callbackList.push(this.resetGeneralAppointmentObjList);

        this.props.insertAppointment(
            params, callbackList
        );
    }

    confirmUpdateAppointmentDialog = () => {

        this.props.updateAppointment(
            {
                appointmentId: this.state.generalAppointmentObjList[0].appointmentId,
                justificationReason: this.state.generalAppointmentObjList[0].justification,
                specialRequest: this.state.generalAppointmentObjList[0].specialRequest
            },
            [
                // refeash calendar value
                this.refreshCalendarList,
                // this.refreshCalendarDetail,

                // for appointment data reset
                this.refreshDailyView,
                this.refreshPatientAppointmentList,
                this.updateReferralList,

                // clear Data
                this.closeAppointmentDialogBox,
                this.resetGeneralAppointmentObjList
            ]
        );
    }

    confirmRescheduleAppointmentDialog = () => {

        let selectedDailyViewTimeslot = this.state.generalAppointmentObjList[0];
        let currentAppoinment = selectedDailyViewTimeslot.fromAppointment;
        let formatApptDate = moment(selectedDailyViewTimeslot.date).format('YYYY-MM-DD') + ' 00:00';
        let tmsltList = selectedDailyViewTimeslot.tmsltList;

        let rescheduleAppointmentData = {
            apptDate:dtsUtilities.formatDateParameter(formatApptDate),
            apptId:currentAppoinment.appointmentId,
            encntrTypeId:selectedDailyViewTimeslot.selectedEncounterType.encntrTypeId,
            justificationReason:selectedDailyViewTimeslot.justification,
            patientKey:selectedDailyViewTimeslot.selectedPatient.patientKey,
            reschRsnRemark:selectedDailyViewTimeslot.reschRsnRemark,
            reschRsnTypeId:selectedDailyViewTimeslot.reschRsnTypeId,
            rmId:selectedDailyViewTimeslot.selectedRoom.rmId,
            tmsltId:selectedDailyViewTimeslot.appointmentTime.id,
            tmsltIdList: tmsltList.map(item => item.id),
            removeReserveListItem: selectedDailyViewTimeslot.removeReserveItem,
            reserveListId: (selectedDailyViewTimeslot.removeReserveItem) ? currentAppoinment.reserve.reserveListId : null
        };

        this.props.rescheduleAppointment(
            rescheduleAppointmentData,
            [
                // refeash calendar value
                this.refreshCalendarList,
                this.refreshCalendarDetail,

                // for appointment data reset
                this.refreshDailyView,
                this.refreshPatientAppointmentList,
                this.updateReferralList,

                // clear Data
                this.closeAppointmentDialogBox,
                this.refreshEmptyTimeslotList,
                this.resetGeneralAppointmentObjList,
                this.refreshRescheduleAppointment
            ]
        );
    }

    confirmDeleteAppointmentDialog = (otherReason, selectedReasonId, remarks) => {
        if(this.props.selectedDeleteAppointment && this.props.selectedDeleteAppointment.appointment){
            this.props.deleteAppointment(
                {
                    apptId: this.props.selectedDeleteAppointment.appointment.appointmentId,
                    delRsnRemark: otherReason,
                    delRsnTypeId: selectedReasonId,
                    delRemark: remarks,
                    version: this.props.selectedDeleteAppointment.appointment.version,
                    patientKey: this.props.selectedDeleteAppointment.appointment.patientKey
                },
                [
                    // refeash calendar value
                    this.refreshCalendarList,
                    this.refreshCalendarDetail,

                    // for appointment data reset
                    this.refreshDailyView,
                    this.refreshPatientAppointmentList,
                    this.updateReferralList,

                    () => {
                        if(this.props.patient != null)
                            this.props.getGdDefaultRoom({ patientKey: this.props.patient.patientKey, serviceCd: 'DTS' });
                        this.closeDeleteAppointmentDialogBox();
                    }
                ]
            );
        }
    }

    ////////////////////////////////
    //// Cancel action function ////
    ////////////////////////////////

    cancelOverallAppointmentDialog = () => {
        if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT){
            return this.cancelSingleAppointmentDialog();
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE){
            return this.cancelMultipleAppointmentDialog();
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE){
            return this.cancelSingleAppointmentDialog();
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT){
            return this.cancelUpdateAppointmentDialog();
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT){
            return this.cancelSingleAppointmentDialog();
        }
        else if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_EMPTY_TIMESLOT){
            return null;
        }
    }

    cancelSingleAppointmentDialog = () => {
        this.updateGeneralAppointmentObjList([]);
    }

    cancelMultipleAppointmentDialog = () => {
        this.updateGeneralAppointmentObjList([...this.state.generalAppointmentObjList]);
    }

    cancelUpdateAppointmentDialog = () => {
        this.setBookingMode(dtsBookingConstant.DTS_BOOKING_MODE_APPT);
    }

    ///////////////////////////////
    //// refresh page function ////
    ///////////////////////////////

    refreshDailyView = () => {
        console.log('refreshDailyView');
        if(this.props.pageLevelState.selectedRoom != undefined && this.props.pageLevelState.selectedRoom.rmId != null && this.props.pageLevelState.calendarDetailDate != null)
            this.props.getDailyView({ rmId: this.props.pageLevelState.selectedRoom.rmId, date: this.props.pageLevelState.calendarDetailDate});
    }

    refreshPatientAppointmentList = (callback = null) => {
        console.log('refreshPatientAppointmentList');
        if(this.props.patient != null) {
            this.props.getPatientAppointment(
                {
                    patientKey: this.props.patient.patientKey,
                    appointmentDateFrom: dtsUtilities.formatDateParameter(moment().subtract(5, 'years').set('hour', 0).set('minute', 0)),
                    appointmentDateTo: dtsUtilities.formatDateParameter(moment().add(5, 'years').set('hour', 23).set('minute', 59)),
                    includeDeletedAppointments: 1
                }
                , callback
            );
        }
    }

    refreshCalendarList = () => {
        console.log('refreshCalendarList');
        let startCalendarListDate;
        let endCalendarListDate;
        if(Array.isArray(this.props.pageLevelState.calendarDataGroupList) && this.props.pageLevelState.calendarDataGroupList.length > 0 &&
            this.props.pageLevelState.selectedClinic != undefined && this.props.pageLevelState.selectedRoom != undefined && this.props.pageLevelState.selectedEncounterType != undefined){
            let tempLastMonth = this.props.pageLevelState.calendarDataGroupList[this.props.pageLevelState.calendarDataGroupList.length -1];
            let lastApptObj = this.state.generalAppointmentObjList[this.state.generalAppointmentObjList.length - 1];
            let deleteObj = (this.props.selectedDeleteAppointment) ? this.props.selectedDeleteAppointment.appointment : null;

            startCalendarListDate = moment(this.props.pageLevelState.calendarDataGroupList[0].calendarDateList[0].dateValue);
            endCalendarListDate = moment(tempLastMonth.calendarDateList[tempLastMonth.calendarDateList.length - 1].dateValue);

            if(
                ((lastApptObj) && moment(lastApptObj.date).isBetween(startCalendarListDate, endCalendarListDate)) ||
                ((deleteObj) && moment(deleteObj.appointmentDateTime).isBetween(startCalendarListDate, endCalendarListDate))
            ){
                this.props.getAvailableCalendarTimeSlot({
                    dateFrom: dtsUtilities.formatDateParameter(startCalendarListDate),
                    dateTo: dtsUtilities.formatDateParameter(endCalendarListDate),
                    clinicCd: this.props.pageLevelState.selectedClinic ? this.props.pageLevelState.selectedClinic.siteCd : null,
                    roomCd: this.props.pageLevelState.selectedRoom.rmCd,
                    slot: this.props.pageLevelState.duration / 15,
                    encounterTypeId: this.props.pageLevelState.selectedEncounterType ? this.props.pageLevelState.selectedEncounterType.encntrTypeId : null
                });
            }
        }
    }

    refreshCalendarDetail = () => {
        console.log('refreshCalendarDetail');
        if(this.props.pageLevelState.appointmentSearchPanelTabVal == 1 && this.props.pageLevelState.calendarDetailMth != null &&
            this.props.pageLevelState.selectedClinic != undefined && this.props.pageLevelState.selectedRoom != undefined && this.props.pageLevelState.selectedEncounterType != undefined){
            let startCalendarMthDate;
            let endCalendarMthDate;
            let lastApptObj = this.state.generalAppointmentObjList[this.state.generalAppointmentObjList.length - 1];
            let deleteObj = (this.props.selectedDeleteAppointment) ? this.props.selectedDeleteAppointment.appointment : null;

            startCalendarMthDate = moment(this.props.pageLevelState.calendarDetailMth.calendarDateList[0].dateValue);
            endCalendarMthDate = moment(this.props.pageLevelState.calendarDetailMth.calendarDateList[this.props.pageLevelState.calendarDetailMth.calendarDateList.length - 1].dateValue);

            if(
                ((lastApptObj) && moment(lastApptObj.date).isBetween(startCalendarMthDate, endCalendarMthDate)) ||
                ((deleteObj) && moment(deleteObj.appointmentDateTime).isBetween(startCalendarMthDate, endCalendarMthDate))
            ){
                this.props.getAvailableCalendarDetailMth({
                    dateFrom:dtsUtilities.formatDateParameter(startCalendarMthDate),
                    dateTo:dtsUtilities.formatDateParameter(endCalendarMthDate),
                    clinicCd:this.props.pageLevelState.selectedClinic.clinicCd,
                    roomCd:this.props.pageLevelState.selectedRoom.rmCd,
                    slot: this.props.pageLevelState.duration / 15,
                    encounterTypeId: this.props.pageLevelState.selectedEncounterType ? this.props.pageLevelState.selectedEncounterType.encntrTypeId : null
                }, true);
            }
        }
    }

    refreshRescheduleAppointment = () => {
        this.props.setSelectedRescheduleAppointment(null);
    }

    refreshEmptyTimeslotList = () => {
        // this.props.setEmptyTimeslotDateList(null);
        this.props.setEmptyTimeslotDateList([]);
    }

    ///////////////////////////////
    //// Page control function ////
    ///////////////////////////////

    setDefaultRoomId = (value) => {
        this.setState({newDefaultRoomId: value});
    }

    setBookingModeAsync = (value) => {
        return new Promise((resolve) => {
            this.setBookingMode(value, resolve);
        });
    }

    setBookingMode = (value, callback = null) => {
        // console.log('setBookingMode value = '+value);
        if(this.state.bookingMode != value){

            // Reset Calendar Detail when get into or get out from express mode
            if(this.state.bookingMode == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE || value == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE)
                this.props.setCalendarDetailMth({calendarDataGroupCode: '', calendarDateList: []});

            if(callback){
                // console.log('setBookingMode with callback');
                return this.setState({
                    bookingMode: value,
                    generalAppointmentObjList: []
                }, callback);
            }
            else{
                // console.log('setBookingMode without callback');
                return this.setState({
                    bookingMode: value,
                    generalAppointmentObjList: []
                });
            }

        }
    }

    openPatientTab = () => {
        if (!this.props.tabs.find(item => item.name === this.patientTab.name)){
            this.props.addTabs(this.patientTab);
            //this.props.deleteTabs(nonPatientTab.name);
        }
    };

    openNonPatientTab = () => {
        if (!this.props.tabs.find(item => item.name === this.nonPatientTab.name)){
            this.props.addTabs(this.nonPatientTab);
        }
    };

    checkCounterpartPageOpened = (currFunctionCd) => {
        if (currFunctionCd === this.nonPatientTab.name) {
            if (this.props.subTabs.find(item => item.name === this.patientTab.name)){
                return true;
            }
        }
        else {
            if (this.props.tabs.find(item => item.name === this.nonPatientTab.name)){
                return true;
            }
        }
        return false;
    };

    //////////////////////////////////////
    //// Dialog open / close function ////
    //////////////////////////////////////

    openAppointmentDialogBox = () => {
        this.setState({openConfirmDialog: true});
    };

    closeAppointmentDialogBox = () => {
        this.setState({openConfirmDialog: false});
    };


    closeUrgentAppointmentDialogBox = () => {
        this.setState({openUrgentAppointmentDialog: false});
    }


    closeGpUrgentAppointmentDialogBox = () => {
        this.setState({openGpUrgentAppointmentDialog: false});
    }

    closeTimeSlotDialogBox = () => {
        this.setState({openCloseTimeSlotDialog: false});
    };

    openTimeSlotDialogBox = () => {
        this.setState({openCloseTimeSlotDialog: true});
    };

    openUnavailableTimeSlotDialogBox = () => {
        this.setState({openUnavailableTimeSlotDialog: true});

    };

    closeOpenUnavailableTimeSlotDialogBox = () => {
        this.setState({openUnavailableTimeSlotDialog: false});

    };

    closeDeleteAppointmentDialogBox= () => {
        this.setState({openDeleteAppointmentDialog: false});
    }

    openDeleteAppointmentDialogBox = () => {
        this.setState({openDeleteAppointmentDialog: true});

    };

    openReserveAppointmentDialogBox = (appointment) => {
        this.setState({openReserveAppointmentDialog: true, selectedReserveAppointment: appointment});
    };

    closeReserveAppointmentDialogBox = () => {
        this.setState({openReserveAppointmentDialog: false, selectedReserveAppointment: null});
    };

    openContactHistoryDialogBox = (appointment) => {
        this.setState({openContactHistoryDialog: true, contactHistoryAppointment: appointment});
    };

    closeContactHistoryDialogBox = () => {
        this.setState({openContactHistoryDialog: false, contactHistoryAppointment: null});
    };

    openDailyViewNavigationHistoryDialog = () => {
        this.setState({ openDailyViewNavigationHistoryDialog: true });
    }

    closeDailyViewNavigationHistoryDialog = () => {
        this.setState({ openDailyViewNavigationHistoryDialog: false });
    }

    openTimeslotLogDialogBox = (timeslots) => {
        this.setState({openTimeslotLogDialog: true, timeslotLogTimeslots: timeslots});
    };

    closeTimeslotLogDialogBox = () => {
        this.setState({openTimeslotLogDialog: false, timeslotLogTimeslots: []});
    };

    openWaitingListDialogBox = (pmiNo) => {
        //console.log('openWaitingListDialogBox',pmi);
        this.setState({
            openWaitingListDialog:true,
            pmi:pmiNo
        });
    }

    handleCloseWaitingDialog = () => {
        this.setState({openWaitingListDialog:false});
    }

    splitBtnOnClick = (selectedItem) => {
       // console.log('splitBtnOnClick:',selectedItem);
        switch (selectedItem) {
            case dtsBookingConstant.DTS_DAILY_VIEW_HISTORY:
                this.setState({ openDailyViewNavigationHistoryDialog: true });
                break;
            case dtsBookingConstant.DTS_URGENT_APPOINTMENT:
                this.setState({openUrgentAppointmentDialog: true});
                break;
            case dtsBookingConstant.DTS_GP_APPOINTMENT:
                this.setState({openGpUrgentAppointmentDialog: true});
                break;
        }

    }

    initDoClose = () => {
        // const checkDirty = (callback, skipReset) => {
        //     const { pageStatus } = props;
        //     if (pageStatus !== pageStatusEnum.VIEW) {
        //         props.openCommonMessage({
        //             msgCode: '110018',
        //             btnActions: {
        //                 btn1Click: () => {
        //                     callback(true);
        //                     if (!skipReset){
        //                         props.resetAll();
        //                     }
        //                 }
        //             }
        //         });
        //     }
        //     else {
        //         callback(true);
        //         if (!skipReset){
        //             props.resetAll();
        //         }
        //     }
        // };

        // const doClose = (callback) => {

        //     //const { pageStatus } = this.props;
        //     const { bookingPageStatus } = this.props;

        //     console.log('doClose pageStatus:' + bookingPageStatus);
        //     if (bookingPageStatus !== pageStatusEnum.VIEW){
        //         this.props.openCommonMessage({
        //             msgCode: '110018',
        //             btnActions: {
        //                 btn1Click: () => {
        //                     if (this.checkCounterpartPageOpened(this.props.functionCd)){
        //                         callback(true);
        //                     }
        //                     else {
        //                         if (this.props.functionCd === nonPatientFunctionCd){
        //                             this.props.resetAll();
        //                             callback(true);
        //                         }
        //                         else {
        //                             this.openNonPatientTab();
        //                             callback(true);
        //                         }
        //                     }
        //                 }
        //             }
        //         });
        //     }
        //     else {
        //         this.props.resetAll();
        //         callback(true);
        //     }
        //     // if (props.functionCd == patientFunctionCd){
        //     //     if (!props.tabs.find(item => item.name === nonPatientTab.name)){
        //     //         props.openCommonMessage({
        //     //             msgCode: '140001',
        //     //             btnActions: {
        //     //                 btn1Click: () => {
        //     //                     openNonPatientTab();
        //     //                     //checkDirty(callback, true);
        //     //                     callback(true);
        //     //                 },
        //     //                 btn2Click: () => {
        //     //                     checkDirty(callback);
        //     //                 }
        //     //             }
        //     //         });
        //     //     }
        //     //     else {
        //     //         checkDirty(callback);
        //     //     }
        //     // }
        //     // else {
        //     //     checkDirty(callback);
        //     // }
        // };
        const doClose = (callback) => {
            if (this.props.isUpdated){
                this.props.openCommonMessage({
                    msgCode: '110018',
                    btnActions: {
                        btn1Click: () => {
                            if (this.checkCounterpartPageOpened(this.props.functionCd)){
                                this.props.setIsUpdated({isUpdated:false});
                                callback(true);
                            }
                            else {
                                if (this.props.functionCd === nonPatientFunctionCd){
                                    this.props.resetAll();
                                    callback(true);
                                }
                                else {
                                    this.props.setIsUpdated({isUpdated:false});
                                    this.openNonPatientTab();
                                    callback(true);
                                }
                            }
                        }
                    }
                });
            } else {
                this.props.resetAll();
                callback(true);
            }
        };
        this.props.updateCurTab(this.props.functionCd, doClose);
    };

    /////////////////////////////////////
    //// Urgent appointment function ////
    /////////////////////////////////////

    /*
    * code return : D, I, R
    * D = disable urgent function
    * I = allow insert urgent appointment
    * R = allow reassign urgent appointment
    */
    urgentAppointmentStatue = () => {
        if(!this.props.patient){
            // console.log(value + 'D');
            return 'D';
        }
        else{
            let urgentFoundToday = false;
            let output = '';
            if(Array.isArray(this.props.pageLevelState.patientAppointmentList)){
                this.props.pageLevelState.patientAppointmentList.forEach(appt => {
                    if (moment(appt.appointmentDateTime).format('YYYYMMDD') == moment().format('YYYYMMDD') ){
                        if(appt.isUrgentSqueeze == 1){
                            urgentFoundToday = true;
                            if(appt.encounterBaseVo.encounterStatus == 'N'){
                                output = 'R';
                            }
                        }
                    }
                });
            }
            if(output != ''){
                return output;
            }
            else if(urgentFoundToday){
                return 'D';
            }
            else{
                return 'I';
            }
        }
    }

    urgentAppointmentCallback = () => {
        this.refreshPatientAppointmentList();
    }

    followUpActionForPatientAppointmentList = (patientAppointments) => {
        // console.log('followUpActionForPatientAppointmentList:' + JSON.stringify(patientAppointments));
        let param = { redirectFrom: 'bookingPatientSearch' };
        const todayNotAttendAppointments = patientAppointments ? patientAppointments.filter(
            appt => appt.siteId == this.props.loginClinic.siteId  // Same clinic
            && moment(appt.appointmentDateTime).isSame(moment(), 'day') // Same date
            && appt.appointmentTypeCode != dtsBookingConstant.DTS_APPOINTMENT_TYPE_CD_CANCEL // Not deleted
            && (!appt.attendanceBaseVo || appt.attendanceBaseVo.isCancel) // Not yet take attendance
            ).sort((a, b) => moment(a).diff(moment(b))) : null;
        if (todayNotAttendAppointments && todayNotAttendAppointments.length > 0){
            param.action = 'takeAttendance';
            param.targetAppointment = todayNotAttendAppointments[0];
            //console.log('todayNotAttendAppointments'+JSON.stringify(todayNotAttendAppointments));
        }
        this.props.skipTab(patientFunctionCd, param);
    }

    patientLoaded = (patient, appointmentList) => {
        // console.log('Booking callback:' + JSON.stringify(patient));
        if (this.props.userRoleType && this.props.userRoleType === Enum.USER_ROLE_TYPE.DOCTOR) {
            this.props.skipTab(accessRightEnum.patientSummary, {redirectFrom: 'DTSBooking', action: 'execCallBack', callBack: () => dtsUtilities.openEncounterPage()});
        } else {
            this.props.skipTab(accessRightEnum.patientSummary, {redirectFrom: 'DTSBooking', action: 'execCallBack', callBack: () => this.props.skipTab(accessRightEnum.DtsBooking, {redirectFrom: 'patientSummary', action: 'execCallBack', callBack: () => this.props.skipTab(accessRightEnum.patientSummary) })});
        }

        // if (patient.deadInd === '1') {
        //     this.props.skipTab(accessRightEnum.patientSummary);
        // }
        // else {
        //     //this.refreshPatientAppointmentList(this.followUpActionForPatientAppointmentList);
        //     this.followUpActionForPatientAppointmentList(appointmentList);
        // }
    }

    initPassInParams = () => {
        if (this.props.location.state) {
            const params = this.props.location.state;
            if (params.redirectFrom === 'patientSummary'){
                switch (params.action) {
                    case 'execCallBack':{
                        if (params.callBack) {
                            params.callBack();
                        }
                    }
                }
            }
            if (params.redirectFrom === 'bookingPatientSearch'){
                switch (params.action) {
                    case 'takeAttendance':{
                        let ecsResult = dtsUtilities.checkEcsStatus(this.props.selectedPatientEcsStatus);
                        //if (!dtsUtilities.isEcsPassed(ecsResult)) {
                            this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.ATTEND_APPOINTMENT, appointmentId: params.targetAppointment.appointmentId });
                            this.props.setPatientKeyNAppointment({
                                patientKey: this.props.patient.patientKey,
                                selectedAppointmentTask: params.targetAppointment,
                                selectedPatientEcsResult: ecsResult
                            });
                            this.handleOpenDtsAttendanceConfirmDialog();
                        // } else {
                        //     this.props.confirmAttendance(
                        //         {
                        //             apptId: params.targetAppointment.appointmentId,
                        //             apptVersion: moment(params.targetAppointment.version).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z',
                        //             atndSrc: 'C',
                        //             discNum: '',
                        //             isRealtime: true,
                        //             patientKey: this.props.patient.patientKey,
                        //             siteId: params.targetAppointment.siteId,
                        //             svcCd: 'DTS',
                        //             isEcsResultNo: !dtsUtilities.isEcsPassed(ecsResult),
                        //             ecsReasonCode: '',
                        //             ecsReasonRemarks: ''
                        //         },
                        //         null,
                        //         true
                        //     );
                        // }
                    }
                }
            }
        }
    }

    handleOpenDtsAttendanceConfirmDialog = () => {
        this.setState({ openAttendanceConfirmDialog: true });
    }
    handleCloseDtsAttendanceConfirmDialog = () => {
        this.setState({ openAttendanceConfirmDialog: false });
    }

    render(){
        const { classes, functionCd, ...rest } = this.props;
        return(
          <MuiThemeProvider theme={dtstheme}>
            <Grid container className={classes.root} >
                <Grid container item xs={4} style={{padding:10}}>
                    {/* <DtsPatientBanner></DtsPatientBanner> */}
                    {/* {functionCd === nonPatientFunctionCd && !this.props.patient ? <DtsButton onClick={() => {
                        this.props.addTabs({
                            name: accessRightEnum.patientSpec,
                            label: `${patientCall}-specific Function(s)`,
                            disableClose: true,
                            path: 'indexPatient',
                            deep: 1
                        });
                        this.props.updatePatientListField({ isFocusSearchInput: true });
                        this.setState({handleSearchPatientClick: true});}}
                        iconType={'SEARCH'}
                                                                                  >Search Patient</DtsButton> : null} */}
                    {this.props.functionCd === nonPatientFunctionCd && <DtsPatientSearch id={'bookingSearchPatient'} ref={ref => this.searchPatientRef = ref} didLoadPatient={this.patientLoaded}></DtsPatientSearch>}
                    {/* <DtsPatientSearch id={'bookingSearchPatient2'} ></DtsPatientSearch> */}
                    {/* <DtsButton onClick={() => {
                            //this.searchPatientRef.focus();
                            this.searchPatientRef.setPatientSearchParam({ searchType: Enum.DOC_TYPE.MACAO_ID_CARD, searchValue: 'cute cute'});
                        }}
                        iconType={'SEARCH'}
                    >Search Patient</DtsButton> */}
                </Grid>
                <Grid container item xs={8}></Grid>
                <div className={classes.root}>
                    <table border="0 solid black">
                        <tbody>
                            <tr>
                                {/* <td width="320px" style={{verticalAlign: 'top', paddingLeft:15, paddingTop:10}}>  // Miki*/}
                                <td width="450px" style={{verticalAlign: 'top'}}>
                                    <DtsLeftPanel
                                        appointmentAction={this.openAppointmentDialogBox}
                                        setBookingMode={this.setBookingMode}
                                        bookingMode={this.state.bookingMode}
                                        addToGeneralAppointmentObjList={this.addToGeneralAppointmentObjList}
                                        updateGeneralAppointmentObjList={this.updateGeneralAppointmentObjList}
                                        generalAppointmentObjList={this.state.generalAppointmentObjList}
                                    />
                                </td>
                                <td width="900px" style={{verticalAlign: 'top', padding:'10px 0px 0px 0px'}}>
                                    <DtsDailyNoteBooking splitBtnOnClick={item => this.splitBtnOnClick(item)} splitList={this.urgentAppointmentStatue() == 'D' ? [dtsBookingConstant.DTS_DAILY_VIEW_HISTORY] : [dtsBookingConstant.DTS_DAILY_VIEW_HISTORY,dtsBookingConstant.DTS_URGENT_APPOINTMENT,dtsBookingConstant.DTS_GP_APPOINTMENT]}/>
                                    <DtsDayViewPanel
                                        appointmentAction={this.openAppointmentDialogBox}
                                        closeTimeSlotAction={this.openTimeSlotDialogBox}
                                        openUnavailableTimeSlotAction={this.openUnavailableTimeSlotDialogBox}
                                        openDeleteAppointmentAction={this.openDeleteAppointmentDialogBox}
                                        openReserveListDialogAction={this.openReserveAppointmentDialogBox}
                                        openContactHistoryDialogAction={this.openContactHistoryDialogBox}
                                        openTimeslotLogDialogAction={this.openTimeslotLogDialogBox}
                                        openWaitingListDialogAction={this.openWaitingListDialogBox}
                                        bookingMode={this.state.bookingMode}
                                        setBookingMode={this.setBookingMode}
                                        setBookingModeAsync={this.setBookingModeAsync}


                                        generalAppointmentObjList={this.state.generalAppointmentObjList}
                                        addToGeneralAppointmentObjList={this.addToGeneralAppointmentObjList}
                                        updateGeneralAppointmentObjList={this.updateGeneralAppointmentObjList}
                                        removeFromGeneralAppointmentObjList={this.removeFromGeneralAppointmentObjList}

                                        isPatientTab={this.props.functionCd === patientFunctionCd}
                                        //tonyTestSetValue={(entry, value) => this.state.testFactoryObj.setProp(entry, value)}// Tony test
                                        //printtonyTestSetValue={() => this.state.testFactoryObj.printProp()}// Tony test
                                    />
                                    {this.state.openDeleteAppointmentDialog &&
                                        <DtsDeleteAppointmentDialog
                                            id={'dtsDeleteAppointmentDialog'}
                                            openConfirmDialog={this.state.openDeleteAppointmentDialog}
                                            closeConfirmDialog={this.closeDeleteAppointmentDialogBox}
                                            confirmDeleteAppointment={this.confirmDeleteAppointmentDialog}
                                        />
                                    }
                                    {this.state.openCloseTimeSlotDialog &&
                                        <DtsCloseTimeSlotDialog id={'dtsCloseTimeSlotDialog'}  openConfirmDialog={this.state.openCloseTimeSlotDialog} closeConfirmDialog={this.closeTimeSlotDialogBox}/>}
                                    {this.state.openUnavailableTimeSlotDialog &&
                                        <DtsOpenTimeslotDialog id={'dtsOpenTimeSlotDialog'}  openConfirmDialog={this.state.openUnavailableTimeSlotDialog} closeConfirmDialog={this.closeOpenUnavailableTimeSlotDialogBox}/>}
                                    {this.state.openConfirmDialog &&
                                        <DtsAppointmentDialogBooking
                                            id={'dtsAppointmentBookingDialog'}
                                            openConfirmDialog={this.state.openConfirmDialog}
                                            closeConfirmDialog={this.closeAppointmentDialogBox}
                                            setBookingMode={this.setBookingMode}
                                            bookingMode={this.state.bookingMode}

                                            generalAppointmentObjList={this.state.generalAppointmentObjList}
                                            updateGeneralAppointmentObjList={this.updateGeneralAppointmentObjList}
                                            removeFromGeneralAppointmentObjList={this.removeFromGeneralAppointmentObjList}
                                            confirmOverallAppointmentDialog={this.confirmOverallAppointmentDialog}
                                            cancelOverallAppointmentDialog={this.cancelOverallAppointmentDialog}

                                            newDefaultRoomId={this.state.newDefaultRoomId}
                                            setDefaultRoomId={this.setDefaultRoomId}

                                            referralListForPatient={this.state.referralListForPatient}
                                        />}
                                    {this.state.openUrgentAppointmentDialog &&
                                        <DtsUrgentAppointmentDialog
                                            id={'dtsUrgentAppointmentDialog'}
                                            sourceFrom={'DtsBooking'}
                                            urgentFunctionStatus={this.urgentAppointmentStatue()}
                                            openConfirmDialog={this.state.openUrgentAppointmentDialog}
                                            closeConfirmDialog={this.closeUrgentAppointmentDialogBox}
                                            callbackList={[this.refreshPatientAppointmentList, this.refreshDailyView]}
                                        />}
                                    {this.state.openGpUrgentAppointmentDialog &&
                                        <DtsGpUrgentAppointmentDialog
                                            id={'dtsGpUrgentAppointmentDialog'}
                                            sourceFrom={'DtsBooking'}
                                            urgentFunctionStatus={this.urgentAppointmentStatue()}
                                            openConfirmDialog={this.state.openGpUrgentAppointmentDialog}
                                            closeConfirmDialog={this.closeGpUrgentAppointmentDialogBox}
                                            callbackList={[this.refreshPatientAppointmentList, this.refreshDailyView]}
                                        />}
                                    {this.state.openReserveAppointmentDialog &&
                                        <DtsReserveAppointmentDialog id={'dtsReserveAppointmentDialog'}  openConfirmDialog={this.state.openReserveAppointmentDialog} closeConfirmDialog={this.closeReserveAppointmentDialogBox} appointment={this.state.selectedReserveAppointment}/>}
                                    {this.state.openContactHistoryDialog &&
                                        <DtsContactHistoryDialog id={'dtsContactHistoryDialog'} contactHistoryAction={contactHistoryAction.VIEW} openContactHistoryDialog={this.state.openContactHistoryDialog} closeContactHistoryDialog={this.closeContactHistoryDialogBox} appointment={this.state.contactHistoryAppointment}/>}
                                    {this.state.openDailyViewNavigationHistoryDialog &&
                                        <DtsDailyViewNavigationHistoryDialog id={'dtsDailyViewNavigationHistoryDialog'} sourceFrom={'DtsBooking'} openConfirmDialog={this.state.openDailyViewNavigationHistoryDialog} closeConfirmDialog={this.closeDailyViewNavigationHistoryDialog}/>}
                                    {this.state.openTimeslotLogDialog &&
                                        <DtsTimeslotLogDialog id={'dtsTimeslotLogDialog'} open={this.state.openTimeslotLogDialog} close={this.closeTimeslotLogDialogBox} timeslots={this.state.timeslotLogTimeslots}/>}
                                    {this.state.openWaitingListDialog &&
                                        <DtsWaitingListDetailDialog id={'dtsWaitingListDetailDialog'} openWaitingListDialog={this.state.openWaitingListDialog} closeWaitingDialog={this.handleCloseWaitingDialog} editMode={CREATE_MODE} pmi={this.state.pmi}/>}
                                </td>
                                <td width="670px" style={{verticalAlign: 'top', paddingRight:5}}>
                                    <DtsRightPanel
                                        functionCd={functionCd}
                                        appointmentAction={this.openAppointmentDialogBox}
                                        openDeleteAppointmentAction={this.openDeleteAppointmentDialogBox}
                                        openReserveListDialogAction={this.openReserveAppointmentDialogBox}
                                        bookingMode={this.state.bookingMode}
                                        setBookingMode={this.setBookingMode}
                                        setBookingModeAsync={this.setBookingModeAsync}
                                        openTimeslotLogDialogAction={this.openTimeslotLogDialogBox}
                                        addToGeneralAppointmentObjList={this.addToGeneralAppointmentObjList}
                                        openContactHistoryDialogAction={this.openContactHistoryDialogBox}
                                        showAppointment={this.showAppointment}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {this.state.openAttendanceConfirmDialog &&
                    <DtsAttendanceConfirmationDialog id={'dtsBookingAttendanceDialog'}
                        openConfirmDialog={this.state.openAttendanceConfirmDialog}
                        closeConfirmDialog={this.handleCloseDtsAttendanceConfirmDialog}
                    />
                }
            </Grid>
            </MuiThemeProvider>
          );
    }
}

const mapStateToProps = (state) => {
    // console.log();
    return {
        defaultClinic: state.login.clinic,
        bookingPageStatus: state.dtsAppointmentBooking.pageLevelState.pageStatus,
        patient: state.patient.patientInfo,
        patientDefaultRoomId: state.patient.defaultRoomId,
        referralDefaultRoomId: state.patient.referralDefaultRoomId,
        tabs: state.mainFrame.tabs,
        subTabs: state.mainFrame.subTabs,
        accessRights: state.login.accessRights,
        userRoleType: state.login.loginInfo && state.login.loginInfo.userRoleType,
        loginInfo: state.login.loginInfo,
        allSpecialties: state.dtsPreloadData.allSpecialties,
        appointmentList: state.dtsAppointmentBooking.appointmentList,
        pageLevelState: state.dtsAppointmentBooking.pageLevelState,
        selectedDayTimeslotList: state.dtsAppointmentBooking.selectedDayTimeslotList,
        dtsEncounterTypeList: state.dtsAppointmentBooking.pageLevelState.encounterTypeList,
        dtsRoomList: state.dtsAppointmentBooking.pageLevelState.roomList,
        roomList: state.common.rooms,
        clinicList: state.common.clinicList,
        selectedRescheduleAppointment:state.dtsAppointmentBooking.selectedRescheduleAppointment,
        loginClinic: state.login.clinic,
        selectedPatientEcsStatus: state.ecs.selectedPatientEcsStatus,
        emptyTimeslotDateList: state.dtsAppointmentBooking.emptyTimeslotDateList,
        serveRoom: state.dtsPreloadData.serveRoom,
        isUpdated: state.dtsAppointmentBooking.isUpdated,
        referralList: state.dtsAppointmentBooking.referralList,
        selectedDeleteAppointment: state.dtsAppointmentBooking.selectedDeleteAppointment
    };
};

const mapDispatchToProps = {
    openCommonMessage,
    addTabs,
    deleteTabs,
    deleteSubTabs,
    updateCurTab,
    resetAll,
    setPageStatus,
    getPatientAppointment,
    setDailyViewNavigationHistory,
    insertAppointment,
    getDailyView,
    setCalendarDetailMth,
    updateAppointment,
    getAvailableCalendarTimeSlot,
    getAvailableCalendarDetailMth,
    getGdDefaultRoom,
    rescheduleAppointment,
    skipTab,
    setPatientKeyNAppointment,
    setSelectedAppointmntTask,
    confirmAttendance,
    setSelectedRescheduleAppointment,
    setEmptyTimeslotDateList,
    insertUrgentAppointment,
    setSelectedRoom,
    getEncounterTypeList,
    setSelectedEncounterType,
    setDuration,
    getServeRoom,
    getRoomList,
    setIsUpdated,
    getReferralList,
    getReferralDefaultRoom,
    setRedirect,
    deleteAppointment,
    setCalendarDetailDate,
    setReferralShowAppointmentId,
    setFilterMode
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Booking));
