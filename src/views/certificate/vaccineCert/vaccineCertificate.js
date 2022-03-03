import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import _ from 'lodash';
import {
    resetAll,
    updateField,
    saveAndPrintVaccineCert,
    listVaccineCertificates,
    updateVaccineCertificate
} from '../../../store/actions/certificate/vaccineCert/vaccineCertAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import {
    updateCurTab
} from '../../../store/actions/mainFrame/mainFrameAction';
import {
    getLetterDefaultValue
} from '../../../store/actions/common/commonAction';
import accessRightEnum from '../../../enums/accessRightEnum';
import Enum from '../../../enums/enum';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import * as CaseNoUtil from '../../../utilities/caseNoUtilities';
import * as CertUtil from '../../../utilities/certificateUtilities';
import * as CertEnum from '../../../enums/certificate/certEformEnum';
import NewVaccineCertificate from './newVaccineCertificate';
import CIMSButtonGroup from '../../../components/Buttons/CIMSButtonGroup';
import HistoryList from '../component/historyList';
import { auditAction } from '../../../store/actions/als/logAction';
import AlsDesc from '../../../constants/ALS/alsDesc';
import CIMSLightToolTip from '../../../components/ToolTip/CIMSLightToolTip';

const styles = theme => ({
    container: {
        height: '100%',
        padding: theme.spacing(1) / 2,
        overflow: 'hidden'
    },
    enctRoom: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    }
});

class vaccineCertificate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            history: {
                open: true,
                // serviceCd: this.props.service && this.props.service.serviceCd,
                serviceCd: '*All',
                dateFrom: moment().subtract(1, 'years'),
                dateTo: moment(),
                selectedIndex: '',
                selectedSite: '',
                // siteId: this.props.clinic.siteId,
                siteId: '*All',
                clinicList: CommonUtilities.getClinicListByServiceCode(this.props.clinicList, this.props.service && this.props.service.serviceCd)
            },
            isEdit: false,
            pageStatus: CertEnum.PAGESTATUS.CERT_VIEWING,
            certId: '',
            printType: '',
            certCdtm: '',
            certVer: '',
            selCert: { certInfo: '', copyPage: 1 },
            createDtm: '',
            createBy: '',
            filterSvc: [],
            initState: {
                certNo: '',
                name: CommonUtilities.getFullName(this.props.patientInfo.engSurname, this.props.patientInfo.engGivename, ' '),
                nationality: this.props.patientInfo.nationality,
                doctorName: '',
                doctorPost: (this.props.service && this.props.service.serviceCd === 'THS') ? 'Port Health Officer' : '',
                manufacturer: '',
                batchNo: '',
                issueDate: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
                validDate: moment().add('days', 10).format(Enum.DATE_FORMAT_EYMD_VALUE),
                otherDocNo: '',
                vaccineType: 'YF',
                vaccineName: '',
                pageStatus: CertEnum.PAGESTATUS.CERT_VIEWING
            }
        };
        this.state = Object.assign({}, this.state, this.getInitState());
    }

    componentDidMount() {
        this.updateHistoryList((rows) => {
            this.svcOptsFiltering(rows);
        }, false);
        const hasEditRight = CommonUtilities.isHaveAccessRight(accessRightEnum.AllowEditVaccinationCert);
        this.doClose = CommonUtilities.getDoCloseFunc_1(accessRightEnum.vaccineFeverCert, () => this.checkCertIsDirty(hasEditRight), this.handleSaveprint);
        this.props.updateCurTab(accessRightEnum.vaccineFeverCert, this.doClose);
        this.setState({ hasEditRight });
        this.getLetterDefaultValue();
    }

    componentWillUnmount() {
        this.props.resetAll();
        this.setState = () => false;
    }

    getLetterDefaultValue = () => {
        this.props.getLetterDefaultValue({ svcCd: this.props.service.svcCd, siteId: this.props.clinic.siteId, certType: 'VaccinationCertificate', userId: this.props.userId }, (data) => {
            let currentFieldList = [
                {
                    label: 'Manufacturer',
                    fieldName: 'manufacturer'
                },
                {
                    label: 'Doctor\'s Post',
                    fieldName: 'doctorPost'
                }
            ];
            let { initState } = this.state;
            currentFieldList.forEach(field => {
                let fieldIndex = data.findIndex(item => item.fieldName === field.fieldName);
                if (fieldIndex >= 0) {
                    initState[field.fieldName] = data[fieldIndex].defaultValue;
                } else {
                    initState[field.fieldName] = '';
                }
            });
            this.setState(initState);
        });
    }

    getInitState = () => {
        const initState = _.cloneDeep(this.state.initState);
        return initState;
    }

    svcOptsFiltering = (rows, isSave) => {
        const { serviceList, service, clinic } = this.props;
        let filterSvc = CommonUtilities.filterContentSvc(rows, serviceList);
        const history = _.cloneDeep(this.state.history);
        if (filterSvc.findIndex(x => x.svcCd === service.svcCd) === -1) {
            history.serviceCd = '*All';
            history.siteId = '*All';
            if (filterSvc.length === 0) {
                history.clinicList = [];
            }
        } else {
            if (!isSave) {
                history.serviceCd = service.svcCd;
                history.siteId = clinic.siteId;
            }
            history.clinicList = CommonUtilities.getClinicListByServiceCode(this.props.clinicList, service && service.serviceCd);
        }
        if (history.serviceCd !== '*All') {
            rows = rows.filter(item => item.svcCd === history.serviceCd);
        }
        if (history.siteId !== '*All') {
            rows = rows.filter(item => item.siteId === history.siteId);
        }
        this.setState({ filterSvc, history: history }, ()=>{
            if (CertUtil.isPastEncounterDate(this.props.encounterInfo.encounterDate) && rows && rows[0]) {
                this.handleHistoryListItemClick('0', rows && rows[0]);
            }
        });
        this.props.updateField({ historyList: rows });
    };

    updateHistoryList = (callback, isDel) => {
        const { patientInfo } = this.props;
        let { dateFrom, dateTo, serviceCd, siteId } = this.state.history;
        const isHistoryValid = this.refs.historyListRef.isFormValid();
        isHistoryValid.then(result => {
            if (result) {
                if (isDel) {
                    serviceCd = '';
                    siteId = '';
                }
                this.props.listVaccineCertificates({
                    patientKey: patientInfo && patientInfo.patientKey,
                    svcCd: serviceCd === '*All' ? '' : serviceCd,
                    from: dateFrom.format(Enum.DATE_FORMAT_EYMD_VALUE),
                    to: dateTo.format(Enum.DATE_FORMAT_EYMD_VALUE),
                    siteId: siteId === '*All' ? '' : siteId
                }, (data) => {
                    if (typeof callback === 'function') {
                        data = data && data.filter(item => item.status === 'A');
                        callback(data);
                    } else {
                        return;
                    }
                });
            }
        });
    }

    handleOnChange = (value, name) => {
        this.setState({ [name]: value, isEdit: true });
    }

    getCertDto = () => {
        const {
            copyPage,
            patientInfo,
            caseNoInfo,
            encounterInfo,
            service,
            clinic
        } = this.props;

        let {
            name,
            batchNo,
            validDate,
            issueDate,
            doctorPost,
            doctorName,
            otherDocNo,
            manufacturer,
            nationality,
            certNo,
            vaccineType,
            vaccineName
        } = this.state;

        let certDto = {
            batchNo: batchNo,
            caseNo: caseNoInfo && caseNoInfo.caseNo,
            certNo: certNo,
            svcCd: service && service.serviceCd,
            siteId: clinic && clinic.siteId,
            encntrId: encounterInfo && encounterInfo.encounterId,
            patientKey: patientInfo.patientKey,
            noOfCopy: copyPage,
            docNumber: otherDocNo,
            doctorName: doctorName,
            doctorPost: doctorPost,
            issueDate: issueDate && moment(issueDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            manufacturer: manufacturer,
            nationalityCd: nationality,
            patientName: name,
            validDate: validDate && moment(validDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            vaccineType: vaccineType,
            vaccineName: vaccineName
        };
        return certDto;
    }

    handlePrint = (opType) => {
        if (this.props.isReissue) {
            opType = 'RP';
        }
        const {
            handlingPrint,
            copyPage,
            patientInfo
        } = this.props;

        let {
            name,
            batchNo,
            validDate,
            issueDate,
            doctorPost,
            doctorName,
            otherDocNo,
            manufacturer,
            nationality,
            certNo
        } = this.state;

        if (handlingPrint) {
            return;
        }

        let params = {
            opType: opType,
            patientName: name,
            batch: batchNo,
            certificateValid: moment(validDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            date: moment(issueDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            doctorPosition: doctorPost,
            doctorSign: doctorName,
            identification: otherDocNo,
            manufacturer: manufacturer,
            nationality: nationality,
            patientKey: patientInfo.patientKey,
            certNo: certNo
        };
        let certDto = this.getCertDto();
        certDto = {
            ...certDto,
            printType: 'New',
            opType: opType
        };
        const { pageStatus, certId, certVer, history } = this.state;
        if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING && certId) {
            certDto = {
                ...certDto,
                id: certId,
                version: certVer
            };
            delete certDto.printType;
        }
        params.vaccinationCertificateDto = certDto;

        this.props.updateField({ handlingPrint: true });
        this.props.saveAndPrintVaccineCert(
            params,
            (printSuccess) => {
                this.props.updateField({ handlingPrint: false });
                if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
                    this.setState({
                        isEdit: false,
                        pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                    }, () => {
                        this.updateHistoryList((rows) => {
                            this.setState({ pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED });
                            this.svcOptsFiltering(rows, true);
                            this.handleHistoryListItemClick(history.selectedIndex, rows && rows[history.selectedIndex]);
                        }, true);
                    });
                } else {
                    let { history } = this.state;
                    history.selectedIndex = '0';
                    this.setState({
                        isEdit: false,
                        history,
                        pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                    }, () => {
                        this.updateHistoryList((rows) => {
                            this.props.updateField({ isReissue: false });
                            this.svcOptsFiltering(rows, true);
                            this.handleHistoryListItemClick('0', rows && rows[0]);
                        }, true);
                    });
                }
                if (printSuccess) {
                    console.log('Print Success');
                }
            }, copyPage);
    }


    handleHistoryChange = (value, name) => {
        let { history, filterSvc } = this.state;
        if (name === 'selectedSite') {
            history.siteId = value;
        } else if (name === 'serviceCd') {
            history[name] = value;
            if (value === '*All') {
                // history.clinicList = this.props.clinicList;
                history.clinicList = this.props.clinicList.filter((item) => {
                    const obj = filterSvc.find(i => i.svcCd === item.svcCd);
                    return obj !== undefined;
                });
            } else {
                history.clinicList = CommonUtilities.getClinicListByServiceCode(this.props.clinicList, value);
            }
            history.siteId = '*All';
        } else {
            history[name] = value;
        }
        this.setState({ history }, () => {
            if (name !== 'dateFrom' && name !== 'dateTo' && name !== 'open') {
                this.updateHistoryList(() => {
                    this.updateHistoryList((rows) => {
                        this.handleHistoryListItemClick('0', rows && rows[0]);
                    });
                }, false);
            }
        });
    }

    handleHistoryBlur = (value, name) => {
        let { history } = this.state;
        if (name === 'dateFrom' || name === 'dateTo') {
            if (name === 'dateFrom' && moment(value).isAfter(history.dateTo)) {
                history.dateTo = value;
            } else if (name === 'dateTo' && moment(value).isBefore(history.dateFrom)) {
                history.dateFrom = value;
            }
            this.setState({ history }, () => {
                this.updateHistoryList();
            });
        }
    }

    handleHistoryListItemClick = (value, rowData) => {
        let { history, selCert } = this.state;
        history.selectedIndex = value;
        this.setState({ history });
        let noOfCopy = 1;
        if (rowData) {
            selCert.certInfo = {
                certNo: rowData.certNo,
                name: rowData.patientName,
                nationality: rowData.nationalityCd,
                doctorName: rowData.doctorName,
                doctorPost: rowData.doctorPost,
                manufacturer: rowData.manufacturer,
                batchNo: rowData.batchNo,
                issueDate: rowData.issueDate,
                validDate: rowData.validDate,
                otherDocNo: rowData.docNumber,
                vaccineType: rowData.vaccineType,
                vaccineName: rowData.vaccineName
            };
            noOfCopy = rowData.copyPage || 1;
            selCert.copyPage = rowData.copyPage || 1;
            this.setState({
                ...selCert.certInfo,
                pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED,
                certId: rowData.id,
                printType: rowData.printType,
                certCdtm: moment(rowData.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE),
                certVer: rowData.version,
                selCert,
                createDtm: rowData.createDtm,
                createBy: rowData.createBy
            });
        } else {
            let initState = this.getInitState();
            selCert.certInfo = initState;
            // initState.selCert = selCert;
            this.setState(initState);
        }
        this.props.updateField({ copyPage: noOfCopy, isReissue: false });
    }

    handleSaveprint = (closeTab) => {
        this.props.updateField({ closeTabFunc: closeTab || null });
        const { pageStatus, printType } = this.state;
        if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
            const formValid = this.refs.vaccineCertForm.isFormValid(false);
            formValid.then(result => {
                if (result) {
                    this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                    if (printType === 'R') {
                        this.handlePrint('RP');
                    } else {
                        this.handlePrint('SP');
                    }
                }
            });
        } else {
            const formValid = this.refs.vaccineCertForm.isFormValid(false);
            formValid.then(result => {
                if (result) {
                    this.props.auditAction(AlsDesc.CERT_SAVE_AND_PRINT);
                    this.handlePrint('SP');
                } else {
                    this.refs.vaccineCertForm.focusFail();
                }
            });
        }
    }

    handleReissue = () => {
        let { history } = this.state;
        history.selectedIndex = '';
        this.setState({ history, certNo: '', pageStatus: CertEnum.PAGESTATUS.CERT_VIEWING });
        this.props.updateField({ isReissue: true });
    }

    handleClose = () => {
        const { pageStatus, history, hasEditRight, selCert } = this.state;
        const isDirty = this.checkCertIsDirty(hasEditRight);
        if (pageStatus === CertEnum.PAGESTATUS.CERT_EDITING) {
            this.props.auditAction(AlsDesc.CANCEL, null, null, false, 'clinical-doc');
            if (isDirty) {
                this.props.openCommonMessage({
                    msgCode: '110054',
                    btnActions: {
                        btn1Click: () => {
                            this.props.auditAction('Discard Changes', null, null, false, 'clinical-doc');
                            this.handleHistoryListItemClick(history.selectedIndex, this.props.historyList[history.selectedIndex]);
                            this.setState({
                                pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                            });
                        },
                        btn2Click: () => {
                            this.props.auditAction('Keep Editing', null, null, false, 'clinical-doc');
                        }
                    }
                });
            } else {
                this.setState({
                    pageStatus: CertEnum.PAGESTATUS.CERT_SELECTED
                });
            }
        } else if (pageStatus === CertEnum.PAGESTATUS.CERT_SELECTED) {
            this.props.auditAction('Cancel Certificate Selection', null, null, false, 'clinical-doc');
            history.selectedIndex = '';
            this.setState({ history });
            let initState = this.getInitState();
            selCert.certInfo = initState;
            this.setState(initState);
        } else {
            this.props.auditAction(AlsDesc.CLOSE, null, null, false, 'clinical-doc');
            CommonUtilities.runDoClose(this.doClose, accessRightEnum.vaccineFeverCert);
        }
    }

    handleEditCert = () => {
        this.props.auditAction(AlsDesc.EDIT, null, null, false, 'clinical-doc');
        let pageStatus = CertEnum.PAGESTATUS.CERT_EDITING;
        this.setState({ pageStatus });
    }

    checkCertIsDirty = (hasEditRight) => {
        const { selCert } = this.state;
        let cmpInfo = this.getInitState();
        let sourceInfo = _.cloneDeep(cmpInfo);
        for (let p in cmpInfo) {
            sourceInfo[p] = this.state[p];
        }
        if (selCert && selCert.certInfo) {
            cmpInfo = selCert.certInfo;
        }
        delete cmpInfo.certCdtm;
        delete cmpInfo.certId;
        delete cmpInfo.printType;
        delete cmpInfo.pageStatus;
        delete sourceInfo.certCdtm;
        delete sourceInfo.certId;
        delete sourceInfo.printType;
        delete sourceInfo.pageStatus;
        cmpInfo = {
            ...cmpInfo,
            issueDate: cmpInfo.issueDate && moment(cmpInfo.issueDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            validDate: cmpInfo.validDate && moment(cmpInfo.validDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        sourceInfo = {
            ...sourceInfo,
            issueDate: sourceInfo.issueDate && moment(sourceInfo.issueDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            validDate: sourceInfo.validDate && moment(sourceInfo.validDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        return hasEditRight ? !CommonUtilities.isEqualObj(cmpInfo, sourceInfo) || this.props.copyPage !== selCert.copyPage : false;
    }

    onListItemClickListener = (value, rowData) => {
        const hasEditRight = CommonUtilities.isHaveAccessRight(accessRightEnum.AllowEditVaccinationCert);
        let certIsDirty = this.checkCertIsDirty(hasEditRight);
        if (this.props.isReissue) {
            this.props.openCommonMessage({
                msgCode: '110072',
                btnActions: {
                    btn1Click: () => {
                        this.props.auditAction('Confirm select history');
                        this.handleHistoryListItemClick(value, rowData);
                    },
                    btn2Click: () => {
                        this.props.auditAction('Cancel select history');
                    }
                }
            });
        } else {
            if (certIsDirty) {
                this.props.openCommonMessage({
                    msgCode: '110072',
                    btnActions: {
                        btn1Click: () => {
                            this.props.auditAction('Confirm select history');
                            this.handleHistoryListItemClick(value, rowData);
                        },
                        btn2Click: () => {
                            this.props.auditAction('Cancel select history');
                        }
                    }
                });
            } else {
                this.handleHistoryListItemClick(value, rowData);
            }
        }
    }

    render() {
        const { classes, historyList, clinicList } = this.props;
        const {
            history,
            pageStatus,
            filterSvc,
            hasEditRight
        } = this.state;
        const isSelected = pageStatus === CertEnum.PAGESTATUS.CERT_SELECTED;
        const isOtherServiceAndSite = (history.selectedIndex !== '' && historyList[history.selectedIndex] && (historyList[history.selectedIndex].svcCd !== this.props.service.serviceCd))
            || (history.selectedIndex !== '' && historyList[history.selectedIndex] && (historyList[history.selectedIndex].siteId !== this.props.clinic.siteId));

        return (
            <Grid
                container
                alignItems="flex-start"
                className={classes.container}
                wrap="nowrap"
                spacing={4}
                style={{ height: 'unset', overflow: 'hidden' }}
            >
                <Grid item xs>
                    <HistoryList
                        {...history}
                        id="vaccineCert"
                        ref="historyListRef"
                        data={historyList}
                        serviceList={filterSvc}
                        onChange={this.handleHistoryChange}
                        onBlur={this.handleHistoryBlur}
                        onListItemClick={this.onListItemClickListener}
                        cliniclist={clinicList}
                        renderChild={(item, index) => {
                            const site = clinicList.find(siteItem => siteItem.siteId === item.siteId);
                            const serviceClinc = site ? `${item.svcCd} - ${site.siteCd || ''}` : `${item.svcCd}`;
                            return (
                                <Grid container key={index}>
                                    <Grid item container justify="space-between">
                                        <Typography variant="body1">{serviceClinc}</Typography>
                                        <Typography variant="body1">{item.createDtm && moment(item.createDtm).format(Enum.DATE_FORMAT_24_HOUR)}</Typography>
                                    </Grid>
                                    <Grid item container justify="space-between">
                                        {/* <Typography variant="body1">{CaseNoUtil.getFormatCaseNo(item.caseNo)}</Typography> */}

                                        <Typography variant="body1">{CaseNoUtil.getCaseAlias(item)}</Typography>
                                        <Typography variant="body1">{item.createBy}</Typography>
                                    </Grid>
                                    <Grid item container justify="space-between" >
                                        {
                                            (item.encntrTypeDesc) && (item.rmDesc) ?
                                                <CIMSLightToolTip
                                                    title={`${item.encntrTypeDesc} / ${item.rmDesc}`}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        // style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}
                                                        className={classes.enctRoom}
                                                    >
                                                        {`${item.encntrTypeDesc} / ${item.rmDesc}`}
                                                    </Typography>
                                                </CIMSLightToolTip>
                                                : null
                                        }

                                    </Grid>
                                    <Grid item container justify="space-between">
                                        {
                                            item.vaccineType ?
                                                <Typography variant="body1">{`${item.vaccineType == 'YF' ? 'Yellow Fever' : (item.vaccineType == 'OTHER' ? 'Others' : 'Poliomyelitis')}`}</Typography> : null
                                        }

                                    </Grid>
                                </Grid>
                            );
                        }}
                        disabled={pageStatus === CertEnum.PAGESTATUS.CERT_EDITING}
                    />
                </Grid>
                <Grid item container>
                    <ValidatorForm
                        id="vaccineCert_form"
                        ref={'vaccineCertForm'}
                    >
                        <NewVaccineCertificate
                            id={'vaccineCertNewVaccineCertificate'}
                            allowCopyList={this.props.allowCopyList}
                            copyPage={this.props.copyPage}
                            handleOnChange={this.handleOnChange}
                            name={this.state.name}
                            nationality={this.state.nationality}
                            otherDocNo={this.state.otherDocNo}
                            issueDate={this.state.issueDate}
                            doctorName={this.state.doctorName}
                            doctorPost={this.state.doctorPost}
                            manufacturer={this.state.manufacturer}
                            batchNo={this.state.batchNo}
                            validDate={this.state.validDate}
                            certNo={this.state.certNo}
                            vaccineType={this.state.vaccineType}
                            vaccineName={this.state.vaccineName}
                            isSelected={isSelected}
                            tempName={this.state.tempName}
                        />
                    </ValidatorForm>
                </Grid>
                {
                    isSelected ?
                        <CIMSButtonGroup
                            buttonConfig={
                                [
                                    // {
                                    //     id: 'vaccineCert_btnEdit',
                                    //     name: 'Edit',
                                    //     style: { display: (!isEditable || isOtherServiceAndSite) ? 'none' : '' },
                                    //     // style: { display: (!isEditable || CertUtil.isPastEncounterDate(encounterInfo.encounterDate) ? true : isPastCert) ? 'none' : '' },
                                    //     onClick: this.handleEditCert
                                    // },
                                    {
                                        id: 'vaccineCert_btnReissue',
                                        name: 'Re-issue',
                                        style: { display: (!hasEditRight || isOtherServiceAndSite) ? 'none' : '' },
                                        onClick: () => {
                                            this.props.auditAction('Click Re Issue Button', null, null, false, 'clinical-doc');
                                            this.handleReissue();
                                        }
                                    },
                                    {
                                        id: 'vaccineCert_btnClose',
                                        name: 'Cancel',
                                        onClick: this.handleClose
                                    }
                                ]
                            }
                        />
                        :
                        <CIMSButtonGroup
                            buttonConfig={
                                [
                                    {
                                        id: 'vaccineCert_btnSaveAndPrint',
                                        name: 'Save & Print',
                                        style: { display: (!hasEditRight) ? 'none' : '' },
                                        onClick: () => { this.handleSaveprint(); }
                                    },
                                    {
                                        id: 'vaccineCert_btnCancel',
                                        name: pageStatus === CertEnum.PAGESTATUS.CERT_EDITING ? 'Cancel' : 'Close',
                                        onClick: this.handleClose
                                    }
                                ]
                            }
                        />
                }
            </Grid>
        );
    }
}

const stateToProps = (state) => {
    return {
        historyList: state.vaccineCert.historyList,
        caseNoInfo: state.patient.caseNoInfo,
        encounterInfo: state.patient.encounterInfo,
        service: state.login.service,
        clinic: state.login.clinic,
        serviceList: state.common.serviceList,
        handlingPrint: state.vaccineCert.handlingPrint,
        patientInfo: state.patient.patientInfo,
        allowCopyList: state.vaccineCert.allowCopyList,
        copyPage: state.vaccineCert.copyPage,
        isReissue: state.vaccineCert.isReissue,
        clinicList: state.common.clinicList,
        encounterTypes: state.common.encounterTypes,
        rooms: state.common.rooms,
        userId: state.login.loginInfo.userDto.userId
    };
};

const dispatchToProps = {
    resetAll,
    updateField,
    saveAndPrintVaccineCert,
    openCommonMessage,
    updateCurTab,
    listVaccineCertificates,
    updateVaccineCertificate,
    auditAction,
    getLetterDefaultValue
};

export default connect(stateToProps, dispatchToProps)(withStyles(styles)(vaccineCertificate));