import React from 'react';
import { PatientUtil, CommonUtil, RegistrationUtil } from '../../../utilities';
import Chip from '@material-ui/core/Chip';
import Enum from '../../../enums/enum';
import moment from 'moment';
import _ from 'lodash';

const getFormatPMINO = (patientInfo) => {
    return PatientUtil.getFormatDHPMINO(patientInfo.patientKey, patientInfo.idSts);
};

const getPrimaryDocTypeDesc = (docPairList, docTypeList) => {
    let docPair = PatientUtil.getPatientPrimaryDoc(docPairList || []);
    let docTpye = docPair && docTypeList.find(item => item.code === docPair.docTypeCd);
    return docTpye && docTpye.engDesc || docPair && docPair.docTypeCd || '';
};

const getPrimaryDocNo = (docPairList) => {
    let docPair = PatientUtil.getPatientPrimaryDoc(docPairList || []);
    let docNo = PatientUtil.getFormatDocNoByDocumentPair(docPair);
    return docNo;
};

const getAdditionalDocTypeDesc = (docPairList, docTypeList) => {
    let docPair = PatientUtil.getPatientAdditionalDoc(docPairList || []);
    let docTpye = docPair && docTypeList.find(item => item.code === docPair.docTypeCd);
    return docTpye && docTpye.engDesc || docPair && docPair.docTypeCd || '';
};

const getAdditionalDocNo = (docPairList) => {
    let docPair = PatientUtil.getPatientAdditionalDoc(docPairList || []);
    let docNo = PatientUtil.getFormatDocNoByDocumentPair(docPair);
    return docNo;
};

const getEHRSS = (ehrInfo) => {
    if (!ehrInfo) {
        return 'Not Joined';
    }
    else {
        let isMatch = parseInt(ehrInfo.isMatch || 0);
        if (isMatch > 0) {
            return 'Joined';
        }
        else {
            return 'Not Joined';
        }
    }
};

const formatEncounter = (encounter) => {
    if (encounter) {
        let index = encounter.indexOf('(');
        let dateStr = encounter.substring(0, index);
        let rest = encounter.substring(index, encounter.length);
        dateStr = moment(dateStr).format(Enum.DATE_FORMAT_EDMY_VALUE);
        let formatEncounterStr = `${dateStr} ${rest}`;
        return formatEncounterStr;
    }
    else {
        return 'No';
    }

};

const formatPMIStatus = (value) => {
    if (value === 'N') {
        return 'Permanent';
    }
    if (value === 'T') {
        return 'Temporary PMI';
    }
};

export function getColumns(props) {
    const {
        classes,
        docTypeList,
        listConfig
    } = props;

    let columnDefs = [];
    if (listConfig && listConfig.NEW_PMI_SEARCH_RESULT_DIALOG) {
        columnDefs.push({
            headerName: 'Check ID',
            field: 'label',
            colId: 'label',
            width: 150,
            cellRenderer: 'labelRender',
            cellRendererParams: {
                classes: classes
            }
        });

        const configs = _.cloneDeep(listConfig.NEW_PMI_SEARCH_RESULT_DIALOG);
        configs
        .sort((a, b) => {
            return a.displayOrder - b.displayOrder;
        })
        .forEach(x => {
            let col = {
                headerName: x.labelName,
                width: x.labelLength,
                field: x.labelCd,
                tooltipValueGetter: params => params.value
            };
            switch(x.labelCd) {
                case 'patientKey':
                    col = {
                        ...col,
                        valueGetter: params => getFormatPMINO(params.data),
                        tooltipValueGetter: params => getFormatPMINO(params.data)
                    };
                    break;
                case 'engFullName':
                    col = {
                        ...col,
                        valueGetter: params => CommonUtil.getFullName(params.data.engSurname, params.data.engGivename),
                        tooltipValueGetter: params => CommonUtil.getFullName(params.data.engSurname, params.data.engGivename)
                    };
                    break;
                case 'docType':
                    col = {
                        ...col,
                        valueGetter: params => getPrimaryDocTypeDesc(params.data.documentPairList, docTypeList),
                        tooltipValueGetter: params => getPrimaryDocTypeDesc(params.data.documentPairList, docTypeList)
                    };
                    break;
                case 'docNo':
                    col = {
                        ...col,
                        valueGetter: params => getPrimaryDocNo(params.data.documentPairList),
                        tooltipValueGetter: params => getPrimaryDocNo(params.data.documentPairList)
                    };
                    break;
                case 'additionalDocType':
                    col = {
                        ...col,
                        valueGetter: params => getAdditionalDocTypeDesc(params.data.documentPairList, docTypeList),
                        tooltipValueGetter: params => getAdditionalDocTypeDesc(params.data.documentPairList, docTypeList)
                    };
                    break;
                case 'additionalDocNo':
                    col = {
                        ...col,
                        valueGetter: params => getAdditionalDocNo(params.data.documentPairList),
                        tooltipValueGetter: params => getAdditionalDocNo(params.data.documentPairList)
                    };
                    break;
                case 'dob':
                    col = {
                        ...col,
                        valueGetter: params => RegistrationUtil.getDobDateByFormat(params.data.exactDobCd, params.data.dob),
                        tooltipValueGetter: params => RegistrationUtil.getDobDateByFormat(params.data.exactDobCd, params.data.dob)
                    };
                    break;
                case 'patientEhr':
                    col = {
                        ...col,
                        valueGetter: params => getEHRSS(params.data.patientEhr),
                        tooltipValueGetter: params => getEHRSS(params.data.patientEhr)
                    };
                    break;
                case 'encounter':
                    col = {
                        ...col,
                        valueGetter: params => formatEncounter(params.data.encounter),
                        tooltipValueGetter: params => formatEncounter(params.data.encounter)
                    };
                    break;
                case 'futureAppt':
                    col = {
                        ...col,
                        valueGetter: params => params.data.futureAppt && moment(params.data.futureAppt).format(Enum.DATE_FORMAT_EDMY_VALUE) || 'No',
                        tooltipValueGetter: params => params.data.futureAppt && moment(params.data.futureAppt).format(Enum.DATE_FORMAT_EDMY_VALUE) || 'No'
                    };
                    break;
                case 'immunisation':
                    col = {
                        ...col,
                        valueGetter: params => params.data.isExistImmu,
                        tooltipValueGetter: params => params.data.isExistImmu
                    };
                    break;
                case 'idSts':
                    col = {
                        ...col,
                        valueGetter: params => formatPMIStatus(params.data.idSts),
                        tooltipValueGetter: params => formatPMIStatus(params.data.idSts)
                    };
                    break;
            }
            columnDefs.push(col);
        });
    }
    return columnDefs;
}

export const labelRender = (props) => {
    const { data, classes } = props;
    return (
        PatientUtil.isProblemPMI(data.documentPairList) ?
            <Chip className={classes.chip} label="CHECK ID" />
            : null
    );
};