import moment from 'moment';
import _ from 'lodash';
import { getState } from '../store/util';

export function getEnctTypeIncludeAllClinic(siteId, encounterTypeList) {
    let _encounterTypeList = encounterTypeList ? _.cloneDeep(encounterTypeList).filter(x =>
        (!x.siteId || x.siteId === siteId)
        && x.subEncounterTypeList
        && x.subEncounterTypeList.length > 0) : [];
    _encounterTypeList.forEach(x => {
        x.subEncounterTypeList = _.cloneDeep(x.subEncounterTypeList).filter(x => (!x.siteId || x.siteId === siteId));
    });
    return _encounterTypeList;
}

//is encounter type object is active: not expired or inactive
export function isActiveEnctType(enctType) {
    return enctType
        && enctType.status === 'A'
        && (!enctType.expyDate || moment(enctType.expyDate).isSameOrAfter(moment(), 'days'))
        && (!enctType.efftDate || moment(enctType.efftDate).isSameOrBefore(moment(), 'days'));
}

//is room object is active: not expired or inactive
export function isActiveRoom(room) {
    return room
        && room.status === 'A'
        && (!room.expyDate || moment(room.expyDate).isSameOrAfter(moment(), 'days'))
        && (!room.efftDate || moment(room.efftDate).isSameOrBefore(moment(), 'days'));
}

/**is encounter type id is active encounterType */
export function isActiveEnctrTypeId(encntrTypeId, enctTypes) {
    const enctType = enctTypes && enctTypes.find(x => x.encntrTypeId === encntrTypeId);
    return !enctType || !isActiveEnctType(enctType) ? false : true;
}

/**is room id is active room */
export function isActiveRoomId(rmId, rooms) {
    const room = rooms && rooms.find(x => x.rmId === rmId);
    return !room || !isActiveRoom(room) ? false : true;
}

/**get status = 'A' and in efftDate and it's not over expyDate rooms */
export function getActiveRooms(rooms, siteId = null) {
    return rooms && rooms.filter(x => isActiveRoom(x)
        && (!siteId || !x.siteId || x.siteId === siteId));
}

/**get status = 'A' and in efftDate and it's not over expyDate sessions */
export function getActiveSessions(sessions, svcCd = null, siteId = null) {
    return sessions && sessions.filter(x => x.status === 'A'
        && (!x.efftDate || moment(x.efftDate).isSameOrBefore(moment()))
        && (!x.expyDate || moment(x.expyDate).isSameOrAfter(moment()))
        && (!siteId || x.siteId === siteId)
        && (!svcCd || x.svcCd === svcCd));
}

export const getEncounterTypeIdByTypeCd = (encounterTypeCd, encounterTypeList) => {
    let result;
    encounterTypeList.filter(item => item.encounterTypeCd === encounterTypeCd).forEach(encounterType => {
        result = encounterType.encntrTypeId;
    });
    return result;
};

export const getEncounterTypeCdById = (encounterTypeId, encounterTypeList) => {
    let result;
    encounterTypeList.filter(item => item.encntrTypeId === encounterTypeId).forEach(encounterType => {
        result = encounterType.description;
    });
    return result;
};

export const getEncounterTypeDescByTypeCd = (encounterTypeCd, encounterTypeList) => {
    let result;
    encounterTypeList.filter(item => item.encounterTypeCd === encounterTypeCd).forEach(encounterType => {
        result = encounterType.description;
    });
    return result;
};

export const getRmDescByCd = (rmCd, encounterTypeCd, encounterTypeList) => {
    let result;
    encounterTypeList.filter(item => item.encounterTypeCd === encounterTypeCd).forEach(encounterType => {
        encounterType.subEncounterTypeList.forEach(subEncounters => {
            if (subEncounters.subEncounterTypeCd === rmCd) {
                result = subEncounters.description;
            }
        });

    });
    return result;
};

export const getRmCdById = (rmId, rooms) => {
    let result;
    rooms.filter(item => item.rmId === rmId).forEach(room => {
        result = room.rmDesc;
    });
    return result;
};

export const getRmId = (rmCd, encounterTypeCd, encounterTypeList) => {
    let result;
    encounterTypeList.filter(item => item.encounterTypeCd === encounterTypeCd).forEach(encounterType => {
        encounterType.subEncounterTypeList.forEach(subEncounters => {
            if (subEncounters.subEncounterTypeCd === rmCd) {
                result = subEncounters.rmId;
            }
        });

    });
    return result;
};


/**
 * Returns an initialized encounterTypeList, subEncounterTypeList, encounterCd, subencounterCd object,
 * usually used for the associated drop-down of encounter and subEncounter
 * @method get_init_encounter
 * @author Justin Long
 * @param {Array} [encounterTypeList=[]] encounterTypeList is get from DB
 * @param {String} [defaultEncounterTypeCd=''] default encounterType code
 * @param {String} [defaultSubEncounterTypeCd=''] default sub encounterType code
 * @returns {Object} initialized object
 */
export function get_init_encounter(encounterTypeList = [], defaultEncounterTypeCd = '', defaultSubEncounterTypeCd = '') {




    let encounterTypeCd = '', subEncounterTypeCd = '', subEncounterTypeList = [];
    let _encounterTypeList = encounterTypeList.sort((a, b) => a.description.localeCompare(b.description));
    if (_encounterTypeList.length > 0) {
        if (defaultEncounterTypeCd && _encounterTypeList.some(
            item => item.encounterTypeCd === defaultEncounterTypeCd
                // For room is not null case in encounterTypeCd
                && item.subEncounterTypeList
                && item.subEncounterTypeList.length > 0
        )) {
            encounterTypeCd = defaultEncounterTypeCd;
        } else {
            // For room is not null case in encounterTypeCd
            encounterTypeCd = _encounterTypeList.filter(item => item.encounterTypeCd
                && item.subEncounterTypeList
                && item.subEncounterTypeList.length > 0)[0].encounterTypeCd;
            if (encounterTypeCd === '') {
                return {
                    encounterTypeCd,
                    subEncounterTypeCd,
                    _encounterTypeList,
                    subEncounterTypeList
                };
            }
        }
        const selectedEncounter = _encounterTypeList.find(item => item.encounterTypeCd === encounterTypeCd);
        if (selectedEncounter.subEncounterTypeList && selectedEncounter.subEncounterTypeList.length > 0) {
            subEncounterTypeList = selectedEncounter.subEncounterTypeList;
            if (defaultSubEncounterTypeCd && subEncounterTypeList.findIndex(item => item.subEncounterTypeCd === defaultSubEncounterTypeCd) > -1) {
                subEncounterTypeCd = defaultSubEncounterTypeCd;
            } else {
                subEncounterTypeCd = selectedEncounter.subEncounterTypeList[0].subEncounterTypeCd;
            }
        }
    }
    return {
        encounterTypeCd,
        subEncounterTypeCd,
        encounterTypeList: _encounterTypeList,
        subEncounterTypeList
    };
}

/**
 * get encounterTypeList and subEncounterTypeList and encounterTypeCd and subEncounterTypeCd
 * @author JustinLong
 * @param {String} serviceCd filter by service
 * @param {String} clinicCd filter by clinic
 * @param {String} defaultEncounterCd default encounterTypeCd
 * @param {String} defaultSubEncounterTypeCd default subEncounterTypeCd
 */
export function getAndInitEncounterTypeList(serviceCd = '', clinicCd = '', defaultEncounterCd = '', defaultSubEncounterTypeCd = '') {
    const encounterTypeList = getState(item => item.common.encounterTypeList);
    if (encounterTypeList) {
        let eTypeList = encounterTypeList.filter(item => (!serviceCd || serviceCd === item.service) && (!clinicCd || clinicCd === item.clinic));
        const initEncounterDto = get_init_encounter(_.cloneDeep(eTypeList), defaultEncounterCd, defaultSubEncounterTypeCd);
        return initEncounterDto;
    }
    return null;
}

/**
 * Returns an subEncounterTypeList when selected a encounterTypeCd
 * @method get_subEncounterTypeList_by_encounterTypeCd
 * @author Justin Long
 * @param {Array} [encounterTypeList=[]] encounterTypeList
 * @param {Array} [encounterTypeCd=''] selected encounterTypeCd
 * @returns {Array} subEncounterTypeList
 */
export function get_subEncounterTypeList_by_encounterTypeCd(encounterTypeList = [], encounterTypeCd = '') {
    if (!encounterTypeList || encounterTypeList.length === 0) {
        return [];
    }
    let codeList = _.cloneDeep(encounterTypeList).find(item => item.encounterTypeCd === encounterTypeCd);
    if (codeList && codeList.subEncounterTypeList && codeList.subEncounterTypeList.length > 0) {
        return codeList.subEncounterTypeList;
    } else {
        return [];
    }
}

export function getActiveEnctrTypeIncludeAllClinic(siteId, encounterTypeList) {
    let _encounterTypeList = getEnctTypeIncludeAllClinic(siteId, encounterTypeList).filter(x => isActiveEnctType(x));
    _encounterTypeList.forEach(x => {
        x.subEncounterTypeList = _.cloneDeep(x.subEncounterTypeList).filter(x => isActiveRoom(x));
    });
    _encounterTypeList = _encounterTypeList.filter(x => x.subEncounterTypeList && x.subEncounterTypeList.length > 0);
    return _encounterTypeList;
}

export function getActiveRoomList(siteId, roomList) {
    let _roomList = _.cloneDeep(roomList).filter(x => (!x.siteId || x.siteId === siteId) && x.encntrTypeList?.some(y => isActiveEnctType(y)) && isActiveRoom(x));
    return _roomList;
}