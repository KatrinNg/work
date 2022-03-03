import { maskAxios} from '../axiosInstance';
import moment from 'moment';
import Enum from '../../enums/enum';
import {dispatch,getState} from '../../store/util';
import * as messageType from '../../store/actions/message/messageActionType';
import storeConfig from '../../store/storeConfig';

const url = {
  appointments: '/ana/appointments',
  encounter: '/ana/appointments/{apptIds}/encounters',
  attendance: '/ana/appointments/{apptId}/attendances'
};

export function listAppointments(params) {
  return maskAxios.get(url.appointments, { params: params });
}

export function getAppointmentById(appointmentId, siteId, serviceCd) {
  return maskAxios.get(`${url.appointments}/${appointmentId}`, { params: { siteId, serviceCd } });
}


export function getEncounters(encounterIds){
  return maskAxios.get(url.encounter.replace('{apptIds}', encounterIds.join(',')));
}

export function getAttendance(apptId){
  return maskAxios.get(url.attendance.replace('{apptId}', apptId));
}

export function resetAttendanceByAppointmentId(apptId, params){
  return maskAxios.delete(url.attendance.replace('{apptId}', apptId), {data: params});
}

export const appointmentToReduxState = (appt, clinicList, anaRemarkTypes, encounterTypes) => {

  let remarkObj = {};
  if (anaRemarkTypes) {
    remarkObj = anaRemarkTypes.reduce(
      (preVal, curVal) => {
        if (curVal && curVal.remarkTypeId) {
          preVal[curVal.remarkTypeId] = curVal;
        }
        return preVal;
      }, {}
    );
  }

  let siteObj = clinicList.reduce(
    (preVal, curVal) => {
      if (curVal && curVal.siteId) {
        preVal[curVal.siteId] = curVal;
      }
      return preVal;
    }, {}
  );

  return innerAppointmentToReduxState(appt, siteObj, remarkObj, encounterTypes);
};


const innerAppointmentToReduxState = (appt, siteObj, remarkObj, encounterTypes) => {

  let activeApptDetail = appt.appointmentDetlBaseVoList.find(ad => ad.isObs === 0);
  let encounterType = encounterTypes.find(type => type.encntrTypeId === activeApptDetail.encntrTypeId);
  let mapApptSlots = activeApptDetail? activeApptDetail.mapAppointmentTimeSlotVosList: null;

  if(!mapApptSlots){
    return {};
  }

  let slotSortAsc = mapApptSlots.sort((a, b) => moment(a.sdtm).diff(moment(b.sdtm)));

  let earliestStartTime = '';
  let earliestSlot = {};
  if (slotSortAsc.length > 0) {
    earliestStartTime = (slotSortAsc[0]).sdtm;
    earliestSlot = slotSortAsc[0];
  }
  let site = siteObj[appt.siteId] ? siteObj[appt.siteId] : null;

  return {
    ...appt,
    appointmentId: appt.appointmentId,
    qtType: earliestSlot.qtType,
    encntrTypeId: encounterType.encntrTypeId,
    isNewOld: encounterType.isNewOld ? encounterType.isNewOld === 1: undefined,
    //old mapping
    clinicCd: site ? site.siteCd : null,
    encounterTypeCd: appt.encntrTypeCd,
    subEncounterTypeCd: appt.rmCd,
    appointmentTime: moment(earliestStartTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
    caseTypeCd: '', //hardcode
    isWalkIn: ((appt.isUrg && appt.isUrg === 1) || (appt.isUrgSqueeze && appt.isUrgSqueeze === 1)) ? 'Y' : 'N',
    attnStatusCd: appt.attnStatusCd,
    encounterTypeShortName: appt.encntrTypeDesc,
    subEncounterTypeShortName: appt.rmDesc,
    clinicName: siteObj[appt.siteId] ? siteObj[appt.siteId].siteName : '',
    appointmentDate: moment(earliestStartTime).format(Enum.DATE_FORMAT_EDMY_VALUE),
    caseNo: appt.caseNo,
    apptSlipRemark: appt.apptSlipRemark,
    remark: remarkObj[appt.remarkTypeId] ? remarkObj[appt.remarkTypeId].remarkDesc : '',
    createDtm: appt.createDtm
  };
};

export function listAppointmentsToAttendanceReduxState(appts, clinicList, anaRemarkTypes, encounterTypes) {

  if (appts && appts.length > 0) {
    let remarkObj = {};
    if (anaRemarkTypes) {
      remarkObj = anaRemarkTypes.reduce(
        (preVal, curVal) => {
          if (curVal && curVal.remarkTypeId) {
            preVal[curVal.remarkTypeId] = curVal;
          }
          return preVal;
        }, {}
      );
    }

    let siteObj = clinicList.reduce(
      (preVal, curVal) => {
        if (curVal && curVal.siteId) {
          preVal[curVal.siteId] = curVal;
        }
        return preVal;
      }, {}
    );
    appts = appts.filter(appt => appt.appointmentDetlBaseVoList && appt.appointmentDetlBaseVoList.length > 0);

    return appts.map(a => innerAppointmentToReduxState(a, siteObj, remarkObj, encounterTypes));
  } else {
    return [];
  }
}

export const handleOperationFailed=(respCode,data)=>{
  if (respCode === 3) {
    dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
            msgCode: '110032'
        }
    });
  } else if (respCode === 100) {
    dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
            msgCode: '111203'
        }
    });
  } else if (respCode === 101) {
    dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
            msgCode: '111235'
        }
    });
  } else if (respCode === 102) {
    dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
            msgCode: '111203'
        }
    });
  } else if (respCode === 103) {
    dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
            msgCode: '111203'
        }
    });
  } else if (respCode === 104) {
    dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
            msgCode: '111201'
        }
    });
  } else if (respCode === 105) {
    dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
            msgCode: '110286'
        }
    });
  } else if (respCode === 106) {
    dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
            msgCode: '111114'
        }
    });
  } else if (respCode === 107) {
    dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
            msgCode: '110906'
        }
    });
  } else if (respCode === 108) {
    dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
            msgCode: '111238'
        }
    });
  } else if (respCode === 109) {
    dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
            msgCode: '111239'
        }
    });
  } else if (respCode === 110) {
    dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
            msgCode: '111242',
            params: [
              { name: 'HEADER', value: 'Book Confirm' },
              { name: 'MODULE_NAME', value: 'appointment booking' }
          ]
        }
    });
  } else if (respCode === 146) {
      dispatch({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
              msgCode: '110155'
          }
      });
  } else if (respCode === 148) {
      dispatch({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
              msgCode: '110139'
          }
      });
  } else if (respCode === 149) {
      dispatch({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
              msgCode: '110140'
          }
      });
  } else if (respCode === 150) {
      dispatch({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
              msgCode: '110153'
          }
      });
  } else if (respCode === 151) {
      dispatch({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
              msgCode: '110204'
          }
      });
  } else if (respCode === 152) {
      dispatch({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
              msgCode: '110205'
          }
      });
  } else if (respCode === 153) {
      const state = storeConfig?.store?.getState();
      const commonMessageList = state.message.commonMessageList;
      let message = '';
      data.data.map((messageCode,index)=>{
        let messageDesc = commonMessageList.find(msg=>msg.messageCode === messageCode);
        message += (index+1)+'.'+messageDesc?.description+'<br/>';
      });
      dispatch({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
              msgCode: '110076',
              params: [
                  { name: 'HEADER', value: 'Appointment booking failed with the following reason(s):' },
                  { name: 'MESSAGE', value: message }
              ]
          }
      });
  } else {
      dispatch({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
              msgCode: '110031'
          }
      });
  }
};
