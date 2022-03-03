import moment from 'moment';

const mapStatus = (value) => {
    switch (value) {
        case 'A':
            return 'Y';
        case 'I':
            return 'N';
    }
    return null;
};

const mapClinic = (value, clinicList) => {
    const site = clinicList && clinicList.find(x => x.siteId === value);
    return site ? site.siteCd : null;
};

const remapKeys = (keysMap, obj) => {
    let newKey, patch, value;
    return Object.keys(keysMap).reduce(
        (result, key) => {
            newKey = keysMap[key].key || key;
            patch = keysMap[key].patch;
            value = obj[newKey];
            return {
                ...result,
                ...{ [key]: (patch ? patch(value, obj, newKey) : value) }
            };
        },
        {}
    );
};

export const mapServiceList = (data) => {
    let keysMap = {
        serviceCd: { key: 'svcCd' },
        serviceName: { key: 'svcName' },
        cdFlag: {
            key: 'status',
            patch: mapStatus
        }
    };

    return data.map(x => ({ ...x, ...remapKeys(keysMap, x) }));
};

export const mapClinicList = (data) => {
    let keysMap = {
        clinicCd: { key: 'siteCd' },
        cdFlag: {
            key: 'status',
            patch: mapStatus
        },
        clinicName: { key: 'siteName' },
        // serviceCd: {key: 'svcCd', patch: value => value.svcCd},
        serviceCd: { key: 'svcCd' },
        clinicNameChi: { key: 'siteChiName' },
        locationEng: { key: 'addrEng' },
        locationChi: { key: 'addrChi' },
        phoneNo: { key: 'phn' },
        fax: {},
        ecsLocCd: {}
    };

    return data.map(x => ({ ...x, ...remapKeys(keysMap, x) }));
};

export const mapClinicConfig = (data, clinicList) => {
    let keysMap = {
        configId: { key: 'siteParamId', patch: value => '' + value },
        serviceCd: { key: 'svcCd' },
        clinicCd: {
            key: 'siteId',
            patch: value => {
                let site = clinicList.find(x => x.siteId == value);
                if (site)
                    return site.siteCd;
                return null;
            }
        },
        configName: { key: 'paramName' },
        configValue: { key: 'paramValue' }
    };

    return Object.keys(data).reduce((result, key) => { result[key] = data[key].map(x => ({ ...x, ...remapKeys(keysMap, x) })); return result; }, {});
};

// export const mapListConfigMap = (data) => {
//     let keysMap = {
//         configId: {key: 'listConfigId'},
//         serviceCd: {},
//         userGroupCd: {},
//         configName: {},
//         labelCd: {},
//         labelName: {},
//         labelLength: {},
//         displayOrder: {},
//         site: {}
//     };

//     return Object.keys(data).reduce((result, key) => (result[key] = data[key].map(x => remapKeys(keysMap, x)), result), {});
// };
export const mapEncounterTypeListNewApi = (data, svcCd, siteCd, clinicList) => {
    let keysMap = {
        service: { patch: (value) => value !== undefined ? value : svcCd },
        // clinic: { patch: (value) => value !== undefined ? value : siteCd },
        clinic: { key: 'siteId', patch: (value) => mapClinic(value, clinicList) },
        encntrTypeId: { key: 'encntrTypeId' },
        encounterTypeCd: { key: 'encntrTypeCd' },
        description: { key: 'encntrTypeDesc' },
        shortName: { key: 'encntrTypeCd' },
        activeStatus: { key: 'status', patch: mapStatus },
        status: { key: 'status' },
        expyDate: { key: 'expyDate' },
        efftDate: { key: 'efftDate' },
        siteId: { key: 'siteId' },
        sspecId: { key: 'sspecId' },
        isNewOld: { key: 'isNewOld' },
        apptInterval: { key: 'apptInterval' },
        apptIntervalUnit: { key: 'apptIntervalUnit' },
        isCharge: { key: 'isCharge' },
        version: {},
        subEncounterTypeList: {
            key: 'roomDtoList',
            patch: (rooms, parent) => {
                let roomKeysMap = {
                    service: '',
                    clinic: { key: 'siteId' },
                    siteId: { key: 'siteId' },
                    encounterTypeCd: { patch: () => parent.encntrTypeCd },
                    rmId: { key: 'rmId' },
                    rmCd: { key: 'rmCd' },
                    subEncounterTypeCd: { key: 'rmCd' },
                    description: { key: 'rmDesc' },
                    shortName: { key: 'rmCd' },
                    sessionTime: { patch: () => '13:00' },
                    activeStatus: { key: 'status', patch: mapStatus },
                    nighSessionTime: { patch: () => '18:00' },
                    chineseName: { key: 'rmCd' },
                    version: {},
                    status: { key: 'status' },
                    expyDate: { key: 'expyDate' },
                    efftDate: { key: 'efftDate' }
                };

                return rooms.map(x => remapKeys(roomKeysMap, x));
            }
        }
    };

    return data.map(x => remapKeys(keysMap, x));
};

export const mapEncounterTypeList = (data, svcCd, siteCd) => {
    let keysMap = {
        service: { patch: () => svcCd },
        clinic: { patch: () => siteCd },
        encntrTypeId: { key: 'encntrTypeId' },
        encounterTypeCd: { key: 'encntrTypeCd' },
        description: { key: 'encntrTypeDesc' },
        shortName: { key: 'encntrTypeCd' },
        activeStatus: { key: 'status', patch: mapStatus },
        version: {},
        subEncounterTypeList: {
            key: 'roomDtoList',
            patch: (rooms, parent) => {
                let roomKeysMap = {
                    service: { patch: () => svcCd },
                    clinic: { patch: () => siteCd },
                    encounterTypeCd: { patch: () => parent.encntrTypeCd },
                    rmId: { key: 'rmId' },
                    subEncounterTypeCd: { key: 'rmCd' },
                    description: { key: 'rmDesc' },
                    shortName: { key: 'rmCd' },
                    sessionTime: { patch: () => '13:00' },
                    activeStatus: { key: 'status', patch: mapStatus },
                    nighSessionTime: { patch: () => '18:00' },
                    chineseName: { key: 'rmCd' },
                    version: {}
                };

                return rooms.map(x => remapKeys(roomKeysMap, x));
            }
        }
    };

    return data.map(x => remapKeys(keysMap, x));
};

export const mapRoomList = (data) => {
    let keysMap = {
        service: { patch: () => null },
        clinic: { key: 'siteId' },
        encounterTypeCd: { key: 'encntrTypeList', patch: (value) => value?.map(encounterType => encounterType.encntrTypeCd) },
        rmId: { key: 'rmId' },
        rmCd: { key: 'rmCd' },
        subEncounterTypeCd: { key: 'rmCd' },
        description: { key: 'rmDesc' },
        shortName: { key: 'rmCd' },
        sessionTime: { patch: () => '13:00' },
        activeStatus: { key: 'status', patch: mapStatus },
        nighSessionTime: { patch: () => '18:00' },
        chineseName: { key: 'rmCd' }
    };

    return data.map(x => ({ ...x, ...remapKeys(keysMap, x)}));
};

export const mapPatientQueueList = (data, clinicList) => {
    let keysMap = {
        totalNum: {},
        patientQueueDtos: {
            patch: (list) => {
                let patientQueueKeysMap = {
                    patientDto: {
                        patch: (_0, parent) => {
                            if (parent.patientDto)
                                return parent.patientDto;

                            if (parent.anonymousPatientDto) {
                                let patient = parent.anonymousPatientDto;
                                let patientDtoKeysMap = {
                                    patientKey: {},
                                    engSurname: {},
                                    engGivename: {},
                                    primaryDocNo: {key: 'docNo'},
                                    primaryDocTypeCd: {key: 'docTypeCd'},
                                    phoneList: {
                                        patch: (_1, _parent) => {
                                            let phoneList = [];
                                            let { ctryCd, cntctPhn,dialingCd,areaCd } = _parent;
                                            if (cntctPhn)
                                                // phoneList.push({ countryCd: ctryCd, phoneNo: cntctPhn, dialingCd: '852' });
                                                phoneList.push({ countryCd: ctryCd, phoneNo: cntctPhn, dialingCd: dialingCd,areaCd:areaCd });
                                            return phoneList;
                                        }
                                    },
                                    documentPairList: {
                                        patch: (_1, _parent) => {
                                            let documentPairList = [];
                                            let { priDocTypeCd, priDocNo, docTypeCd, docNo } = _parent;
                                            if (priDocTypeCd && priDocNo)
                                                documentPairList.push({ docTypeCd: priDocTypeCd, docNo: priDocNo, isPrimary: 1 });
                                            if (docTypeCd && docNo)
                                                documentPairList.push({ docTypeCd: docTypeCd, docNo: docNo });
                                            if(documentPairList.length === 1){
                                                documentPairList = documentPairList.map(d => {return {...d, isPrimary: 1};});
                                            }
                                            return documentPairList;
                                        }
                                    },
                                    countryCd: { key: 'ctryCd' },
                                    phoneNo: { key: 'cntctPhn' },
                                    dialingCd: { patch: () => '852' }
                                };

                                return remapKeys(patientDtoKeysMap, patient);
                            }

                            return null;
                        }
                    },
                    patientKey: {},
                    appointmentId: {},
                    encounterType: { key: 'encntrTypeDesc' },
                    encounterTypeCd: { key: 'encntrTypeCd' },
                    encntrId: { key: 'encntrId' },
                    subEncounterType: { key: 'rmDesc' },
                    subEncounterTypeCd: { key: 'rmCd' },
                    appointmentDate: { key: 'apptDateTime', patch: (value) => moment(value).format('DD-MMM-YYYY') },
                    appointmentTime: { key: 'apptDateTime', patch: (value) => moment(value).format('HH:mm') },
                    attnTime: { key: 'arrivalTime', patch: (value) => value ? moment(value).format('DD-MMM-YYYY HH:mm') : undefined },
                    attnStatus: { key: 'attnStatusCd', patch: (value) => value.toUpperCase() === 'Y' ? 'Attended' : undefined },
                    attnStatusCd: {},
                    version: {},
                    // caseNo: {
                    //     key: 'patientDto',
                    //     patch: (value) => {
                    //         let activeCase = value && value.caseList ? value.caseList.find(x => x.statusCd === 'A') : null;
                    //         return activeCase ? activeCase.caseNo : '';
                    //     }
                    // },
                    caseNo: { key: 'caseNo' },
                    alias: { key: 'alias' },
                    encntrGrpCd: { key: 'encntrGrpCd' },
                    discNumber: { key: 'attendanceBaseVo', patch: (value) => value && value.discNum },
                    remarkId: { key: 'remarkTypeId' },
                    remark: { key: 'remarkTypeBaseVo', patch: (value) => value && value.remarkDesc },
                    isAtndCancel: { key: 'isAtndCancel' },
                    appointmentDto: {
                        patch: (_0, parent) => {
                            let site = clinicList.find(x => x.siteId == parent.siteId);
                            let appointmentDetail = parent.appointmentDetlBaseVoList ? parent.appointmentDetlBaseVoList.find(x => x.isObs == 0) : null;
                            let bookingUnit = appointmentDetail ? appointmentDetail.mapAppointmentTimeSlotVosList.filter(x => x.apptDetlId == appointmentDetail.apptDetlId).length : 0;
                            let encntrTypeId = appointmentDetail ? appointmentDetail.encntrTypeId : null;

                            return {
                                clinicCd: site ? site.siteCd : '',
                                caseTypeCd: 'N',
                                appointmentTypeCd: 'N',
                                statusCd: appointmentDetail ? 'A' : 'C',
                                bookingUnit: bookingUnit,
                                isWalkIn: 'N',
                                createdDtm: '2020-01-01T00:00:00.000+0800',
                                encounterTypeId: encntrTypeId
                            };
                        }
                    }
                };

                return list.map(x => remapKeys(patientQueueKeysMap, x));
            }
        }
    };

    return data ? remapKeys(keysMap, data) : { totalNum: 0, patientQueueDtos: [] };
};

export const mapRemarkCodeList = (data) => {
    let keysMap = {
        remarkId: { key: 'remarkTypeId' },
        remarkCd: { key: 'remarkName' },
        description: { key: 'remarkDesc' }
    };

    return data.map(x => ({ ...x, ...remapKeys(keysMap, x) }));
};