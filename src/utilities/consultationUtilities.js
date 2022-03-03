import _ from 'lodash';
import moment from 'moment';
import Enum from '../enums/enum';
import * as CommonUtilities from './commonUtilities';

export function getPatientQueueList(data) {
    let result = {};
    if (data && data.patientQueueDtos) {
        result.page = data.page;
        result.pageSize = data.pageSize;
        result.totalPageNum = data.totalPageNum;
        result.totalNum = data.totalNum;
        result.patientQueueDtos = [];
        for (let i = 0; i < data.patientQueueDtos.length; i++) {
            let dto = {};
            const queueDto = data.patientQueueDtos[i];
            if (queueDto.patientDto) {
                const patient = queueDto.patientDto;
                dto.name = CommonUtilities.getFullName(patient.engSurname, patient.engGivename);
                dto.hkic = (patient.hkid ? patient.hkid : patient.otherDocNo) || '';
                dto.discNo = patient.discNo || '';
                dto.age = `${patient.age || ''} ${patient.ageUnit ? patient.ageUnit[0] || '' : ''}`;
                dto.genderCd = patient.genderCd || '';
                dto.nameChi = patient.nameChi || '';
                dto.docTypeCd = patient.docTypeCd || '';
                dto.dob = patient.dob ? moment(patient.dob).format(Enum.DATE_FORMAT_EDMY_VALUE) : '';
                dto.engSurname = patient.engSurname || '';
                dto.engGivename = patient.engGivename || '';
                dto.phoneNo = patient.phoneNo || '';
            }
            dto.patientKey = queueDto.patientKey || '';
            dto.appointmentId = queueDto.appointmentId || '';
            dto.appointmentTime = `${queueDto.appointmentDate || ''} ${queueDto.appointmentTime || ''}`;
            //dto.arrivalTime = `${queueDto.arrivalDate || ''} ${queueDto.arrivalTime || ''}`;
            dto.arrivalTime = queueDto.attnTime || '';
            dto.encounterType = queueDto.encounterType || '';
            dto.subEncounterType = queueDto.subEncounterType || '';
            dto.status = queueDto.attnStatusCd || '';
            dto.remark = queueDto.remark || '';
            dto.version = queueDto.version || '';
            dto.discNo = queueDto.discNumber || '';
            result.patientQueueDtos.push(dto);
        }
    }
    return result;
}

export function getEncounterTypeOption(encounterTypeList) {
    if (encounterTypeList) {
        let dataList = _.cloneDeep(encounterTypeList);
        dataList.splice(0, 0, { encounterTypeCd: '', shortName: 'All' });
        return dataList;
    }
    return null;
}

export function getSubEncounterTypeOption(encounterTypeList, encounterTypeCd) {
    let dataList = [{ subEncounterTypeCd: '', shortName: 'All' }];
    const encounterDo = encounterTypeList.find(item => item.encounterTypeCd === encounterTypeCd);
    if (encounterDo && encounterDo.subEncounterTypeList) {
        dataList = dataList.concat(encounterDo.subEncounterTypeList);
    }
    return dataList;
}

export function getStatusOption() {
    let statusList = _.cloneDeep(Enum.ATTENDANCE_STATUS_LIST);
    statusList.splice(0, 0, { value: '', label: 'All' });
    return statusList;
}