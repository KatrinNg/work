import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
    colors,
    Grid
} from '@material-ui/core';
import CIMSLoadingButton from '../../../components/Buttons/CIMSLoadingButton';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';
import { getCodeList } from '../../../store/actions/common/commonAction';
import { codeList as codeType } from '../../../constants/codeList';
import * as patientSpecFuncType from '../../../store/actions/patient/patientSpecFunc/patientSpecFuncActionType';
import { skipTab } from '../../../store/actions/mainFrame/mainFrameAction';
import {
    resetLinkPatient,
    searchPatientPrecisely,
    confirmAnonymousPatient
} from '../../../store/actions/patient/patientSpecFunc/patientSpecFuncAction';
import AccessRightEnum from '../../../enums/accessRightEnum';
import HKIDInput from '../../compontent/hkidInput';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import Enum from '../../../enums/enum';
import moment from 'moment';
import * as AppointmentUtilites from '../../../utilities/appointmentUtilities';
import * as PatientUtil from '../../../utilities/patientUtilities';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import PatientLinkPmiConfirmDialog from './patientLinkPmiConfirmDialog';
import { updatePmiData, checkApptWithEncntrCaseStatus } from '../../../store/actions/appointment/booking/bookingAction';
import * as CaseNoUtil from '../../../utilities/caseNoUtilities';
import { auditAction } from '../../../store/actions/als/logAction';
import PhoneField from '../../registration/component/phones/phoneField';
import FieldConstant from '../../../constants/fieldConstant';
import { RegistrationUtil, SiteParamsUtil } from '../../../utilities';
import Chip from '@material-ui/core/Chip';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import NewPMISearchResultDialog from '../../compontent/newPMISearchResultDialog';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import UnexpectedEnctrApprlDialog from '../../appointment/booking/component/bookDialog/unexpectedEnctrApprlDialog';
import { UNEXPECTED_ACTION_TYPE } from '../../../enums/appointment/booking/bookingEnum';
import { logShsEncntrCase } from '../../../store/actions/appointment/booking/bookingAction';

const styles = () => ({
    customTableHeadCell: {
        // backgroundColor: '#b8bcb9',
        fontSize: '13px'
    },
    customTableBodyCell: {
        fontSize: '13px'
    },
    marginTop20: {
        marginTop: 6
    },
    inputPadding: {
        padding: '12px 4px'
    },
    padding12: {
        paddingLeft: 12,
        paddingRight: 12
    },
    dialogForm: {
        width: '80vw'
    },
    chip: {
        backgroundColor: colors.orange[600],
        color: 'white'
    }
});

const labelRender = (props) => {
    const { data, classes } = props;
    return (
        data.isProblem === 1 ?
            <Chip className={classes.chip} label="CHECK ID" />
            : null
    );
};

class SelectCheckboxRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Checkbox
                color="default"
                checkedIcon={<CheckBox />}
                icon={<CheckBoxOutlineBlank />}
            />
        );
    }
}

class LinkPatient extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedItems: [],
            patientLinkPmiConfirmDialog: {
                isOpen: false,
                patientText: '',
                caseNo: ''
            },
            approvalDialogParams: {
                isOpen: false,
                staffId: '',
                rsnCd: null,
                rsnTxt: ''
            }
        };

        let params = [
            codeType.document_type
        ];
        this.props.getCodeList({
            params,
            actionType: patientSpecFuncType.PUT_CODE_LIST
        });
    }

    componentDidMount() {
        const { linkParameter } = this.props;
        if (linkParameter) {
            this.handleSearch();
        }
    }

    componentDidUpdate() {
        if (this.props.linkPatientStatus === 'success') {
            this.props.handleClose();
            this.props.openCommonMessage({
                msgCode: '110035',
                params: [
                    {
                        name: 'PATIENT_CALL',
                        value: CommonUtilities.getPatientCall()
                    }
                ],
                showSnackbar: true
            });
            this.props.getPatientQueue(this.props.searchParameter);
            let appt = this.getApptByApptId(this.props.linkParameter.appointmentId);
            this.props.selectAppointment(
                {
                    patientKey: this.props.transferredPatientKey,
                    appointmentId: appt.appointmentId,
                    appointmentDate: appt.apptDateTime,
                    statusCd: appt.attnStatusCd
                }
            );
        }
    }

    componentWillUnmount() {
        this.props.resetLinkPatient();
    }

    selectTableItem = (selected) => {
        let selectedItem = [];
        if (selected && selected.length > 0)
            selectedItem.push(selected[0].patientKey);
        this.setState({ selectedItems: selectedItem });
    }

    handleChange = (name, value) => {
        if (name === 'phoneNo') {
            value = value.replace(/\D/g, '');
        }
        this.props.handleChange(name, value);
    }

    handlePhoneChange = (value, name) => {
        let contactPhone = _.cloneDeep(this.props.linkParameter.contactPhone);
        if (name === 'countryCd') {
            contactPhone['areaCd'] = '';
            let countryOptionsObj = this.props.countryList.find(item => item.countryCd == value);
            let dialingCd = countryOptionsObj && countryOptionsObj.dialingCd;
            contactPhone['dialingCd'] = dialingCd;
        }
        if (name === 'phoneTypeCd') {
            if (value === Enum.PHONE_TYPE_MOBILE_SMS) {
                contactPhone['phoneTypeCd'] = Enum.PHONE_TYPE_MOBILE_PHONE;
                // contactPhone['countryCd'] = FieldConstant.COUNTRY_CODE_DEFAULT_VALUE;
                contactPhone['dialingCd'] = FieldConstant.DIALING_CODE_DEFAULT_VALUE;
                contactPhone['smsPhoneInd'] = '1';
            } else {
                contactPhone['smsPhoneInd'] = '0';
            }
        }
        if (name === 'dialingCd') {
            value = value.replace(/[^0-9]/ig, '');
            if (value !== contactPhone['dialingCd']) {
                contactPhone['areaCd'] = '';
            }
        }
        contactPhone[name] = value;
        this.props.handleChange('contactPhone', contactPhone);
    }

    handleSearch = () => {
        const linkPara = this.props.linkParameter;
        const { contactPhone } = linkPara;

        let params = {
            countryNo: '',
            documentNo: PatientUtil.isHKIDFormat(linkPara.docTypeCd) ? linkPara.hkidOrDoc.replace('(', '').replace(')', '') : linkPara.hkidOrDoc,
            documentType: linkPara.docTypeCd,
            givenName: linkPara.engGivename,
            surname: linkPara.engSurname,
            phoneNo: contactPhone.phoneNo,
            areaCd: contactPhone.phoneNo ? contactPhone.areaCd : '',
            dialingCd: contactPhone.phoneNo ? contactPhone.dialingCd || '' : '',
            phoneTypeCd: contactPhone.phoneNo ? contactPhone.phoneTypeCd : ''
        };

        if (params.documentNo && params.documentType) {
            params = {
                countryNo: '',
                documentNo: PatientUtil.isHKIDFormat(linkPara.docTypeCd) ? linkPara.hkidOrDoc.replace('(', '').replace(')', '') : linkPara.hkidOrDoc,
                documentType: linkPara.docTypeCd,
                givenName: '',
                surname: '',
                phoneNo: '',
                areaCd: '',
                dialingCd: '',
                phoneTypeCd: ''
            };
        }

        this.props.searchPatientPrecisely(params);
        this.clearTableSelected();
    }

    getPatientText = (patient) => {
        let patientText = '';
        let formatPMINo = PatientUtil.getFormatDHPMINO(patient.patientKey, patient.idSts);
        // patientText += patient.patientKey ? patient.patientKey + ' - ' : '';
        patientText += formatPMINo ? formatPMINo + '-' : '';
        patientText += patient.engSurname ? patient.engSurname + ' ' : '';
        patientText += patient.engGivename ? patient.engGivename + ' ' : '';
        patientText += patient.nameChi ? patient.nameChi : '';

        return patientText;
    }

    handleConfirm = () => {
        this.props.auditAction('Click Confirm Button In Link PMI Dialog', 'Patient List', 'Patient List', false, 'ana');
        if (this.props.linkPatientList.length > 0 && this.state.selectedItems.length === 1) {
            const selectedPatient = this.state.selectedItems[0];
            let patientText = this.getPatientText(selectedPatient);
            // if (CommonUtilities.isUseCaseNo() && CommonUtilities.isNewCaseBookingFlow()) {
            //     CaseNoUtil.handleCaseNoBeforeAnonBookOrLinkPatient(selectedPatient, (caseNo) => {
            //         this.setState({
            //             patientLinkPmiConfirmDialog: {
            //                 isOpen: open,
            //                 patientText: patientText,
            //                 caseNo: caseNo
            //             }
            //         });
            //     });
            // } else {

                // this.setState({
                //     patientLinkPmiConfirmDialog: {
                //         isOpen: open,
                //         patientText: patientText,
                //         caseNo: ''
                //     }
                // });
            if (this.props.svcCd === 'SHS') {
                const { linkParameter } = this.props;

                const bookingFunc = () => {
                    //should call check api here
                    const params = {
                        patientKey: selectedPatient.patientKey,
                        encntrTypeId: linkParameter.encounterTypeId
                        //excludeApptId:currentSelectedApptInfo?currentSelectedApptInfo.appointmentId:''
                    };
                    this.props.checkApptWithEncntrCaseStatus(params, (action) => {
                        if (action === UNEXPECTED_ACTION_TYPE.APPROVAL) {
                            this.setState({
                                approvalDialogParams: {
                                    ...this.state.approvalDialogParams,
                                    isOpen: true
                                }
                            });
                        } else if (action === UNEXPECTED_ACTION_TYPE.BLOCK) {
                            this.props.openCommonMessage({ msgCode: '110201' });
                        } else {
                            this.setState({
                                patientLinkPmiConfirmDialog: {
                                    isOpen: open,
                                    patientText: patientText,
                                    caseNo: ''
                                }
                            });
                        }
                    });
                };
                this.resetApprovalDialogParams(() => {
                    AppointmentUtilites.checkAppEncntrCaseStatusBeforeBook(bookingFunc);
                });
            } else {
                this.setState({
                    patientLinkPmiConfirmDialog: {
                        isOpen: open,
                        patientText: patientText,
                        caseNo: ''
                    }
                });
            }
            // }

            // this.props.openCommonMessage({
            //     msgCode: '130302',
            //     params: [
            //         { name: 'HEADER', value: 'Confirmation of Patient Association' },
            //         { name: 'MESSAGE', value: '<p>Please confirm to associate the current appointment with the below patient:</p>' + patientText }
            //     ],
            //     btnActions: {
            //         btn1Click: () => {
            //             const params = {
            //                 patientKey: selectedPatient.patientKey,
            //                 anonymousPatientKey: this.props.linkParameter.patientKey
            //             };
            //             this.props.confirmAnonymousPatient(params);
            //         },
            //         btn2Click: () => {
            //             this.clearTableSelected();
            //         }
            //     }
            // });
        } else {
            this.props.auditAction('Link Pmi Confirm Create New', 'Patient List', 'Patient List', false, 'ana');
            if (this.props.tabs.findIndex((item) => item.name === AccessRightEnum.registration) !== -1) {
                this.props.openCommonMessage({
                    msgCode: '110036',
                    params: [{ name: 'PATIENT_CALL', value: CommonUtilities.getPatientCall() }]
                });
            } else {
                const linkPara = this.props.linkParameter;

                this.props.updatePmiData(
                    'linkPmiData',
                    {
                        anonymousPatientKey: linkPara.patientKey,
                        appointmentId: [linkPara.appointmentId],
                        patientKey: null,
                        enCounter: linkPara.enCounter,
                        room: linkPara.room,
                        apptTime: linkPara.apptTime,
                        encntrTypeId:linkPara.encounterTypeId
                    }
                );

                const params = {
                    redirectFrom: 'linkPatient',
                    hkidOrDocNum: linkPara.hkidOrDoc,
                    docTypeCd: linkPara.docTypeCd,
                    engSurname: linkPara.engSurname,
                    engGivename: linkPara.engGivename,
                    // phoneNo: linkPara.phoneNo,
                    // ctryCd: linkPara.ctryCd,
                    // areaCd: linkPara.areaCd,
                    // dialingCd:linkPara.dialingCd
                    contactPhone: linkPara.contactPhone
                };

                this.props.skipTab(AccessRightEnum.registration, params);
                this.props.handleClose();
            }
        }
    }

    handleNewCaseConfirm = () => {
        const selectedPatient = this.state.selectedItems[0];
        let patientText = this.getPatientText(selectedPatient);
        CaseNoUtil.handleNewCaseNoBeforeAnonBookOrLinkPatient(selectedPatient, (caseNo) => {
            this.setState({
                patientLinkPmiConfirmDialog: {
                    isOpen: open,
                    patientText: patientText,
                    caseNo: caseNo
                }
            });
        });
    }

    patientLinkPmiConfirmDialogBtnClick = (action) => {
        const selectedPatient = this.state.selectedItems[0];

        const params = {
            patientKey: selectedPatient.patientKey,
            anonymousPatientKey: this.props.linkParameter.patientKey
            // newCaseNo: this.state.patientLinkPmiConfirmDialog.caseNo
        };
        const caseNoParam = this.state.patientLinkPmiConfirmDialog.caseNo;
        if (typeof caseNoParam === 'string') {
            params.newCaseNo = caseNoParam;
        } else {
            params.caseDto = caseNoParam;
        }

        switch (action) {
            case 'confirm': {
                this.props.confirmAnonymousPatient(params, () => {
                    this.fetchLogShsEncntrCaseDto();
                });
                break;
            }
            case 'cancel':
                break;
            default:
                break;
        }

        this.setState({
            patientLinkPmiConfirmDialog: {
                isOpen: false,
                patientText: '',
                caseNo: ''
            }
        });
    }

    fetchLogShsEncntrCaseDto = () => {
        const { approvalDialogParams } = this.state;
        const selectedPatient = this.state.selectedItems[0];
        const { linkParameter } = this.props;
        if (approvalDialogParams.staffId) {
            if (linkParameter) {
                this.props.logShsEncntrCase({
                    'actionType': 'A',
                    'approvalRsnCd': approvalDialogParams.rsnCd,
                    'approvalRsnTxt': approvalDialogParams.rsnTxt,
                    'approverId': approvalDialogParams.staffId,
                    'apptIds': [linkParameter.appointmentId],
                    'isNewOldEncntrType': '',
                    'patientKey': selectedPatient.patientKey,
                    'sspecId': ''
                });
            }
            this.resetApprovalDialogParams();
        }
    }

    clearTableSelected = () => {
        this.gridApi && this.gridApi.deselectAll();
        this.setState({
            ...this.state,
            selectedItems: []
        });
    }

    handleClose = () => {
        this.props.handleClose();
    }

    loadPatientList = (originData) => {
        const { codeList } = this.props;

        let resultList = [];
        if (originData && originData.length > 0) {
            originData.forEach(d => {
                let curDocType = codeList.doc_type.find(item => item.code === d.docTypeCd);
                let curGender = '';
                switch (d.genderCd) {
                    case Enum.GENDER_MALE_VALUE: {
                        curGender = 'Male';
                        break;
                    }
                    case Enum.GENDER_FEMALE_VALUE: {
                        curGender = 'Female';
                        break;
                    }
                    case Enum.GENDER_UNKNOWN_VALUE: {
                        curGender = 'Unkonwn';
                        break;
                    }
                    default: {
                        curGender = 'Unkonwn';
                        break;
                    }
                }
                let curPatient = {
                    ...d,
                    otherDocNo: PatientUtil.isHKIDFormat(d.docTypeCd) ? PatientUtil.getHkidFormat(d.otherDocNo) : PatientUtil.getOtherDocNoFormat(d.otherDocNo, d.docTypeCd),
                    docType: curDocType ? curDocType.engDesc : null,
                    gender: curGender
                };

                resultList.push(curPatient);
            });
        }
        return resultList;
    }

    getApptByApptId = (apptId) => {
        const { patientList } = this.props;
        let appt = null;
        if (patientList) {
            // appt=patientList.patientDto,find(item=>item.appointmentId===apptId)
            appt = AppointmentUtilites.getApptByApptId(apptId, patientList.patientQueueDtos);
        }
        return appt;
    }

    getColumns = (classes, linkPatientList) => {
        let columns = [
            {
                headerName: '',
                valueGetter: (params) => params.node.rowIndex + 1,
                minWidth: 50,
                maxWidth: 50,
                width: 50
            },
            {
                headerName: '',
                valueGetter: (params) => '',
                filter: false,
                headerCheckboxSelection: true,
                checkboxSelection: true,
                minWidth: 40,
                maxWidth: 40,
                width: 40
            },
            {
                headerName: '',
                field: 'label',
                colId: 'label',
                minWidth: 130,
                width: 130,
                cellRenderer: 'labelRender',
                cellRendererParams: {
                    classes: classes
                }
            },
            {
                headerName: 'PMI No',
                valueGetter: (params) => {
                    const formatPMINo = PatientUtil.getFormatDHPMINO(params.data.patientKey, params.data.idSts);
                    return formatPMINo || '';
                },
                tooltipValueGetter: (params) => params.value,
                width: 150
            },
            {
                headerName: 'Surname',
                valueGetter: (params) => {
                    return params.data.engSurname;
                },
                tooltipValueGetter: (params) => params.value,
                width: 160
            },
            {
                headerName: 'Given Name',
                valueGetter: (params) => {
                    return params.data.engGivename;
                },
                tooltipValueGetter: (params) => params.value,
                width: 160
            },
            {
                headerName: 'Chinese Name',
                valueGetter: (params) => {
                    return params.data.nameChi;
                },
                tooltipValueGetter: (params) => params.value,
                width: 160
            },
            {
                headerName: 'Doc. Type',
                valueGetter: (params) => {
                    return params.data.docType;
                },
                tooltipValueGetter: (params) => params.value,
                width: 200
            },
            {
                headerName: 'Doc. No',
                valueGetter: (params) => {
                    return params.data.otherDocNo;
                },
                tooltipValueGetter: (params) => params.value,
                width: 180
            },
            {
                headerName: 'Date of Birth',
                valueGetter: (params) => {
                    return RegistrationUtil.getDobDateByFormat(params.data.exactDobCd || Enum.DATE_FORMAT_EDMY_KEY, params.data.dob);
                },
                tooltipValueGetter: (params) => {
                    return RegistrationUtil.getDobDateByFormat(params.data.exactDobCd || Enum.DATE_FORMAT_EDMY_KEY, params.data.dob);
                },
                width: 140
            },
            {
                headerName: 'Sex',
                valueGetter: (params) => {
                    return params.data.gender;
                },
                tooltipValueGetter: (params) => params.value,
                width: 95
            }
        ];
        let isAllPMIValid = true;
        linkPatientList && linkPatientList.forEach(element => {
            if (element.isProblem && element.isProblem === 1) {

                isAllPMIValid = false;
            }
        });
        if (isAllPMIValid) {
            columns.splice(2, 1);
        }
        return columns;
    }

    getValidator = () => {
        const { linkParameter, patSearchTypeList } = this.props;
        const isHKIDFormat = PatientUtil.isHKIDFormat(linkParameter.docTypeCd);
        let validators = [], errorMessages = [];
        if (isHKIDFormat) {
            validators.push(ValidatorEnum.isHkid);
            let hkidFomratDocTypeList = patSearchTypeList.filter(item => item.searchTypeCd === linkParameter.docTypeCd);
            let replaceMsg = CommonMessage.VALIDATION_NOTE_HKIC_FORMAT_ERROR((hkidFomratDocTypeList[0] && hkidFomratDocTypeList[0].dspTitle) || 'HKID Card');
            errorMessages.push(replaceMsg);
        } else {
            let selSearchType = patSearchTypeList.find(item => item.searchTypeCd === linkParameter.docTypeCd);
            let minLength = selSearchType && selSearchType.minSearchLen ? selSearchType.minSearchLen : 1;
            // let selSearchType = getSelSearchType(availDocType, searchType);
            validators.push(ValidatorEnum.minStringLength(minLength));
            errorMessages.push(CommonMessage.VALIDATION_NOTE_BELOWMINWIDTH().replace('%LENGTH%', minLength));
        }
        return { validators, errorMessages };
    }

    getHeader = (id) => {
        const {
            classes,
            linkParameter
        } = this.props;

        const valid = this.getValidator();
        return (
            <ValidatorForm ref="form" onSubmit={() => { }} id={id + '_form'}>
                <Grid container spacing={2}>
                    <Grid item container xs={10}>
                        <Grid item xs={3} className={classes.inputPadding}>
                            <SelectFieldValidator
                                id={id + '_docTypeCd'}
                                options={this.props.codeList &&
                                    this.props.codeList.doc_type &&
                                    this.props.codeList.doc_type.map(item => ({
                                        label: item.engDesc,
                                        value: item.code
                                    }))}
                                value={linkParameter.docTypeCd}
                                onChange={e => this.handleChange('docTypeCd', e.value)}
                            />
                        </Grid>
                        <Grid item xs={3} className={classes.inputPadding}>
                            <HKIDInput
                                // label={linkParameter.docTypeCd === 'ID' ? 'HKID' : 'Document Number'}
                                isHKID={linkParameter.docTypeCd === 'ID'}
                                id={id + '_hkidOrDoc'}
                                value={linkParameter.hkidOrDoc}
                                // onChange={e => this.handleChange('hkidOrDoc', e.target.value)}
                                onBlur={e => this.handleChange('hkidOrDoc', e.target.value)}
                                validators={valid.validators}
                                errorMessages={valid.errorMessages}
                                absoluteMessage
                            />
                        </Grid>
                        <Grid item xs={3} className={classes.inputPadding}>
                            <TextFieldValidator
                                label="Surname"
                                onlyOneSpace
                                id={id + '_engSurname'}
                                upperCase
                                fullWidth
                                inputProps={{ maxLength: 40 }}
                                value={linkParameter.engSurname}
                                onChange={e => this.handleChange('engSurname', e.target.value)}
                                onBlur={e => this.handleChange('engSurname', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={3} className={classes.inputPadding}>
                            <TextFieldValidator
                                label="Given Name"
                                onlyOneSpace
                                id={id + '_engGivename'}
                                upperCase
                                fullWidth
                                inputProps={{ maxLength: 40 }}
                                value={linkParameter.engGivename}
                                onChange={e => this.handleChange('engGivename', e.target.value)}
                                onBlur={e => this.handleChange('engGivename', e.target.value)}
                            />
                        </Grid>
                        {/* <Grid item xs={4}>
                                <TextFieldValidator
                                    label="Phone"
                                    id={id + '_phoneNo'}
                                    fullWidth
                                    inputProps={{ maxLength: 15 }}
                                    value={linkParameter.phoneNo}
                                    onChange={e => this.handleChange('phoneNo', e.target.value)}
                                />
                            </Grid> */}
                        <Grid item xs={12} className={classes.inputPadding}>
                            {/* <ContactPhones
                                    id={id + '_otherPhones'}
                                    isNeedSMSMobile
                                    // isLackHKMobile={isLackHKMobile}
                                    // comDisabled={comDisabled}
                                    maxPhoneLength={5}
                                    // phoneCountryList={countryList}
                                    phoneList={linkParameter.contactPhone}
                                    onChange={this.handlePhoneChange}
                                    showAddRemoveBtn={false}
                                    showExtPhoneNo={false}
                                /> */}
                            <PhoneField
                                id={`${id}_contactPhone`}
                                phone={linkParameter.contactPhone}
                                isRequired={linkParameter.contactPhone.phoneNo}
                                // countryOptions={countryList}
                                phoneTypeOptions={Enum.PHONE_DROPDOWN_LIST.filter(item => item.value !== 'MSMS')}
                                onChange={this.handlePhoneChange}
                                // isSMSMobile={isSMSMobile}
                                isPreferPhone={false}
                                // comDisabled={waitDetail.patientKey > 0}
                                showExtPhoneNo={false}
                            // isPhoneRequired={waitDetail.patientKey <= 0}
                            />
                        </Grid>
                    </Grid>
                    <Grid item container xs={2} alignItems="center" justify="center">
                        <CIMSLoadingButton
                            onClick={() => {
                                this.props.auditAction('Click Search Button In Link PMI Dialog', 'Patient List', 'Patient List', false, 'ana');
                                this.handleSearch();
                            }}
                            id={id + '_search'}
                        >Search</CIMSLoadingButton>
                    </Grid>
                </Grid>
            </ValidatorForm>
        );
    }

    getButtons = (id, linkPatientList) => {
        let buttons = [
            {
                id: id + '_confirm',
                name: linkPatientList.length > 0 && this.state.selectedItems.length === 1 ? 'Confirm' : 'Create New',
                onClick: this.handleConfirm
            },
            {
                id: id + '_cancel',
                name: 'Cancel',
                onClick: this.handleClose
            }
        ];
        if (linkPatientList.length > 0
            && this.state.selectedItems.length === 1
            && CommonUtilities.isNewCaseBookingFlow()
            && CommonUtilities.isUseCaseNo()) {
            buttons.unshift({
                id: id + '_confirmWithNewCase',
                name: 'Confirm with New Case',
                onClick: this.handleNewCaseConfirm
            });
        }
        return buttons;
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    onRowSelected = event => {
        this.setState({
            ...this.state,
            selectedItems: this.gridApi.getSelectedRows() || []
        });
    }

    postSort = rowNodes => {
        let rowNode = rowNodes[0];
        if (rowNode) {
            setTimeout((rowNode) => {
                rowNode.gridApi.refreshCells();
            }, 100, rowNode);
        }
    }

    handleUpdateApprovalDialogParams = (name, value) => {
        let params = _.cloneDeep(this.state.approvalDialogParams);
        params[name] = value;
        if (name === 'rsnCd') {
            params = {
                ...params,
                rsnTxt: ''
            };
        } else if (name === 'rsnTxt') {
            params = {
                ...params,
                rsnCd: ''
            };
        }
        this.setState({
            approvalDialogParams: params
        });
    }

    resetApprovalDialogParams = (callback) => {
        this.setState({
            approvalDialogParams: {
                isOpen: false,
                staffId: '',
                rsnCd: null,
                rsnTxt: ''
            }
        }, () => { callback && callback(); });
    }

    render() {
        const { classes, siteParams, svcCd, siteId,linkParameter,encounterTypes } = this.props;
        const {approvalDialogParams}=this.state;
        const id = 'linkPatient';
        const linkPatientList = this.loadPatientList(this.props.linkPatientList);
        const header = this.getHeader(id);
        const footer = this.getButtons(id, linkPatientList);
        const isNewPmiSearchResultDialog = SiteParamsUtil.getIsNewPmiSearchResultDialogSiteParams(siteParams, svcCd, siteId);
        return (
            <Grid>
                {
                    isNewPmiSearchResultDialog ?
                        <NewPMISearchResultDialog
                            id={`${id}_searchPMIResultDialog`}
                            title={`Search for ${CommonUtilities.getPatientCall()}`}
                            results={linkPatientList || []}
                            header={header}
                            footer={footer.map(x => (
                                <CIMSButton
                                    key={x.id}
                                    children={x.name}
                                    onClick={x.onClick}
                                />
                            ))}
                            okBtnProps={{ onClick: null, style: { display: 'none' } }}
                            cancelBtnProps={{ onClick: null, style: { display: 'none' } }}
                            gridOptions={{
                                onRowSelected: this.onRowSelected,
                                postSort: this.postSort,
                                getRowNodeId: data => data.patientKey,
                                onRowClicked: () => {},
                                onRowDoubleClicked: () => {},
                                onGridReady: this.onGridReady
                            }}
                            gridStyle={{
                                height: '50vh'
                            }}
                        />
                        :
                        <CIMSPromptDialog
                            open
                            id={id}
                            dialogTitle={`Search for ${CommonUtilities.getPatientCall()}`}
                            classes={{
                                formControlCss: classes.dialogForm
                            }}
                            dialogContentText={
                                <Grid container>
                                    {header}
                                    <Grid item xs={12} className={classes.marginTop20}>
                                        <CIMSDataGrid
                                            gridTheme="ag-theme-balham"
                                            divStyle={{
                                                width: '100%',
                                                height: '50vh',
                                                display: 'block'
                                            }}
                                            gridOptions={{
                                                columnDefs: this.getColumns(classes, linkPatientList),
                                                onCellFocused: e => {
                                                    // if (e.column && this.disableClickSelectionRenderers.includes(e.column.colDef.cellRenderer)) {
                                                    //     e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
                                                    // }
                                                    // else {
                                                    //     e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = false;
                                                    // }
                                                },
                                                frameworkComponents: {
                                                    // wrappedTextRenderer: WrappedTextRenderer,
                                                    selectCheckboxRenderer: SelectCheckboxRenderer,
                                                    // weekdayButtonRenderer: WeekdayButtonRenderer
                                                    labelRender: labelRender
                                                },
                                                rowSelection: 'single',
                                                // rowMultiSelectWithClick: true,
                                                suppressRowClickSelection: false,
                                                headerHeight: 48,
                                                enableBrowserTooltips: true,
                                                rowData: linkPatientList,
                                                onRowSelected: this.onRowSelected,
                                                getRowHeight: (params) => 40,
                                                getRowNodeId: data => data.patientKey,
                                                postSort: this.postSort,
                                                onGridReady: this.onGridReady
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            }
                            buttonConfig={footer}
                        />
                }
                <PatientLinkPmiConfirmDialog
                    isOpen={this.state.patientLinkPmiConfirmDialog.isOpen}
                    patientText={this.state.patientLinkPmiConfirmDialog.patientText}
                    btnClick={this.patientLinkPmiConfirmDialogBtnClick}
                    auditAction={this.props.auditAction}
                />
                {
                    svcCd === 'SHS' ?
                        approvalDialogParams.isOpen ?
                            <UnexpectedEnctrApprlDialog
                                appointment={linkParameter}
                                approvalDialogParams={approvalDialogParams}
                                confirmCallback={() => {
                                    const selectedPatient = this.state.selectedItems[0];
                                    let patientText = this.getPatientText(selectedPatient);
                                    this.setState({
                                        patientLinkPmiConfirmDialog: {
                                            isOpen: open,
                                            patientText: patientText,
                                            caseNo: ''
                                        }
                                    });
                                }}
                                handleUpdateApprovalDialogParams={this.handleUpdateApprovalDialogParams}
                                //resetApprovalDialogParams={this.resetApprovalDialogParams}
                                encounterTypes={encounterTypes}
                            /> : null
                        : null
                }
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        codeList: state.patientSpecFunc.codeList,
        linkPatientList: state.patientSpecFunc.linkPatientList,
        patientList: state.patientSpecFunc.patientQueueList,
        linkPatientStatus: state.patientSpecFunc.linkPatientStatus,
        searchParameter: state.patientSpecFunc.searchParameter,
        transferredPatientKey: state.patientSpecFunc.transferredPatientKey,
        tabs: state.mainFrame.tabs,
        patSearchTypeList: state.common.patSearchTypeList,
        siteParams: state.common.siteParams,
        svcCd: state.login.service.svcCd,
        siteId: state.login.clinic.siteId,
        encounterTypes:state.common.encounterTypes,
        linkParameter: state.patientSpecFunc.linkParameter
    };
};

const mapDispatchToProps = {
    resetLinkPatient,
    getCodeList,
    skipTab,
    searchPatientPrecisely,
    confirmAnonymousPatient,
    openCommonMessage,
    updatePmiData,
    auditAction,
    checkApptWithEncntrCaseStatus,
    logShsEncntrCase
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LinkPatient));
