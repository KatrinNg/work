import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Grid,
    SvgIcon,
    Tooltip,
    withStyles,
    Typography
} from '@material-ui/core';
import _ from 'lodash';
import moment from 'moment';
import memoize from 'memoize-one';
import CIMSPromptDialog from '../../components/Dialog/CIMSPromptDialog';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import SelectFieldValidator from '../../components/FormValidator/SelectFieldValidator';
import DateFieldValidator from '../../components/FormValidator/DateFieldValidator';
import CIMSTextField from '../../components/TextField/CIMSTextField';
import CIMSMultiTextField from '../../components/TextField/CIMSMultiTextField';
import CIMSButton from '../../components/Buttons/CIMSButton';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import Enum from '../../enums/enum';
import { codeList } from '../../constants/codeList';
import PregnantWomanSvg from '../../images/pregnant.svg';
import { auditAction } from '../../store/actions/als/logAction';

import {
    closeCaseNoDialog,
    updateCaseNoForm,
    updateState,
    getEncounterGroup,
    saveCaseNoWithAlias,
    getEncounterTypesBySiteId
} from '../../store/actions/caseNo/caseNoAction';
import { getCodeList, getEncounterTypeList } from '../../store/actions/common/commonAction';
import * as caseNoActionType from '../../store/actions/caseNo/caseNoActionType';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import { EnctrAndRmUtil, CommonUtil } from '../../utilities';
import { checkIsAutoGen, pmiCaseWithEnctrGrpVal, pmiCaseNoAliasGenSiteVal } from '../../utilities/caseNoUtilities';
import { getEnctrTypesByEnctrGroup } from '../../utilities/appointmentUtilities';

const styles = () => ({
    root: {
        paddingBottom: 40
    },
    dialog: {
        width: 500
    }
});

class CaseNoAliasGenDialog extends Component {

    constructor(props) {
        super();
        this.state = {
            encounterTypeList: []
        };
    }

    componentDidMount() {
        this.props.getCodeList({
            params: [codeList.patient_status],
            actionType: caseNoActionType.PUT_CODE_LIST
        });
        const { caseNoForm, clinic, aliasRule, encounterTypeList, selEncntrGrp, caseDialogStatus } = this.props;
        if (!caseNoForm.ownerClinicCd) {
            this.props.updateCaseNoForm({ ownerClinicCd: clinic.clinicCd });
        }
        // this.props.getEncounterGroup();

        if (aliasRule && aliasRule.length === 1) {
            this.props.updateCaseNoForm({ casePrefixCd: aliasRule[0].casePrefix });
            const currentGroup = aliasRule[0].encounterGroupDtos;
            this.props.updateState({ encounterGroupDtos: currentGroup });
        }

        if (!caseNoForm.regDtm) {
            this.props.updateCaseNoForm({ regDtm: moment() });
        }
        let isAutoGen = checkIsAutoGen(aliasRule);
        this.setState({ isAutoGen, encounterTypeList });
        if (caseDialogStatus === Enum.CASE_DIALOG_STATUS.CREATE) {
            this.mapRuleByEncntrGrp(aliasRule, selEncntrGrp);
        }
    }

    filterEncounterList = memoize((list, group, clinicCd) => {
        const isPmiCaseWithEnctrGrp = pmiCaseWithEnctrGrpVal();
        if (isPmiCaseWithEnctrGrp === true) {
            const { selEncntrGrp } = this.props;
            if (!selEncntrGrp) {
                return [];
            }
            let encounters = getEnctrTypesByEnctrGroup(list, selEncntrGrp.pmiCaseEncntrGrpDetlDtos);
            return encounters;
        } else {
            if (!group || group.length === 0) {
                return [];
            } else {
                let result = [];
                for (let i = 0; i < group.length; i++) {
                    if (group[i].clinicCd === '*All' || group[i].clinicCd === clinicCd) {
                        if (group[i].encounterTypeCd === '*All') {
                            return list;
                        } else {
                            const encounterDto = list.find(item => group[i].encounterTypeCd === item.encounterTypeCd);
                            encounterDto && result.push(encounterDto);
                        }
                    }
                }
                return result;
            }
        }
    });

    filterSubEncounterList = memoize((list, encounterTypeCd, group, clinicCd) => {
        const isPmiCaseWithEnctrGrp = pmiCaseWithEnctrGrpVal();
        if (isPmiCaseWithEnctrGrp === true) {
            const encounterDto = list.find(item => item.encounterTypeCd === encounterTypeCd);
            const subEncounterDtos = (encounterDto ? encounterDto.subEncounterTypeList : []).filter(x => EnctrAndRmUtil.isActiveRoom(x));
            return subEncounterDtos;
        } else {
            if (!encounterTypeCd || !group || group.length === 0 || !list || list.length === 0) {
                return [];
            } else {
                const encounterDto = list.find(item => item.encounterTypeCd === encounterTypeCd);
                const subEncounterDtos = (encounterDto ? encounterDto.subEncounterTypeList : []).filter(x => EnctrAndRmUtil.isActiveRoom(x));
                let result = [];
                for (let i = 0; i < group.length; i++) {
                    if (group[i].clinicCd === '*All' || group[i].clinicCd === clinicCd) {
                        if (group[i].encounterTypeCd === '*All' || group[i].encounterTypeCd === encounterTypeCd) {
                            if (group[i].subEncounterTypeCd === '*All') {
                                return subEncounterDtos;
                            } else {
                                const subEncounterDto = subEncounterDtos.find(item => group[i].subEncounterTypeCd === item.subEncounterTypeCd);
                                subEncounterDto && result.push(subEncounterDto);
                            }
                        }
                    }
                }
                return result;
            }
        }

    });

    filterClinicList = memoize((list, serviceCd) => {
        return list.filter(item => item.serviceCd === serviceCd);
    });

    handleSave = () => {
        if (this.refs.caseNoDialogForm) {
            const validPromise = this.refs.caseNoDialogForm.isFormValid(false);
            validPromise.then(result => {
                if (result) this.saveLogic();
            });
        } else {
            this.saveLogic();
        }
    }

    saveLogic = () => {
        const {
            caseDialogStatus,
            caseNoForm,
            clinic,
            caseCallBack,
            currentUpdateField,
            aliasRule,
            patient
        } = this.props;
        const { isAutoGen } = this.state;
        let params = _.cloneDeep(caseNoForm);
        const curRule = aliasRule.find(r => r.casePrefix === params.casePrefixCd);
        const encntrGp = curRule && curRule.encntrGp ? curRule.encntrGp : null;
        if (!curRule) {
            return;
        }
        if (caseDialogStatus === Enum.CASE_DIALOG_STATUS.CREATE) {
            this.props.auditAction('Generate Case');
            if (isAutoGen === 'Y') {
                let aliasRuleDto = curRule;
                if (aliasRule.length === 1) {
                    aliasRuleDto = aliasRule[0];
                }
                params.casePrefixCd = aliasRuleDto.casePrefix;
                params.ownerClinicCd = clinic.clinicCd;
                params.regDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
                params.ruleId = curRule.ruleId;
                let submitData = {
                    patientKey: patient.patientKey,
                    svcCd: aliasRuleDto.svcCd,
                    siteId: aliasRuleDto.siteId,
                    caseDto: params,
                    encntrGp: encntrGp
                };
                this.props.saveCaseNoWithAlias(caseDialogStatus, submitData, caseCallBack);
            } else if (isAutoGen === 'N') {
                params.regDtm = moment(params.regDtm).format(Enum.DATE_FORMAT_EYMD_VALUE);
                params.ruleId = curRule.ruleId;
                let submitData = {
                    patientKey: patient.patientKey,
                    svcCd: curRule.svcCd,
                    siteId: curRule.siteId,
                    caseDto: params,
                    encntrGp: encntrGp
                };
                this.props.saveCaseNoWithAlias(caseDialogStatus, submitData, caseCallBack);
            }
        } else {
            this.props.auditAction('Update Case');
            params.ruleId = curRule.ruleId;
            let submitData = {
                patientKey: patient.patientKey,
                svcCd: curRule.svcCd,
                siteId: curRule.siteId,
                caseDto: params,
                encntrGp: encntrGp
            };
            this.props.saveCaseNoWithAlias(caseDialogStatus, submitData, caseCallBack, currentUpdateField);
        }
        this.props.closeCaseNoDialog();
    }

    handleCancelBtn = () => {
        this.props.auditAction('Cancel Edit Case', null, null, false, 'patient');
        this.props.closeCaseNoDialog();
    }

    handleFieldChange = (value, name) => {
        const { caseNoForm, aliasRule, service } = this.props;
        if (name === 'casePrefixCd' && caseNoForm.casePrefixCd !== value) {
            const rule = aliasRule.find(item => item.casePrefix === value);
            const currentGroup = rule.encounterGroupDtos;
            this.props.updateState({ encounterGroupDtos: currentGroup });
        }
        if (name === 'ownerClinicCd' && caseNoForm.ownerClinicCd !== value) {
            this.props.updateCaseNoForm({ encounterTypeCd: '', subEncounterTypeCd: '' });
            const siteId = CommonUtil.getSiteIdBySiteCd(value);
            this.props.getEncounterTypesBySiteId(service.svcCd, siteId, (data) => {
                this.setState({ encounterTypeList: data });
            });
        }
        if (name === 'regDtm' && !value) {
            value = moment();
        }
        if (name === 'encounterTypeCd') {
            this.props.updateCaseNoForm({ subEncounterTypeCd: '' });
        }
        this.props.updateState({ currentUpdateField: name });
        this.props.updateCaseNoForm({ [name]: value });
    }

    mapRuleByEncntrGrp = (aliasRule, selEncntrGrp) => {
        let rule = null;
        const isPmiCaseWithEnctrGrp = pmiCaseWithEnctrGrpVal();
        if (isPmiCaseWithEnctrGrp) {
            if (aliasRule && aliasRule.length > 0 && selEncntrGrp) {
                rule = aliasRule.find(x => x.encntrGp === selEncntrGrp.encntrGrpCd);
                if (rule) {
                    this.handleFieldChange(rule.casePrefix, 'casePrefixCd');
                    const isAutoGen=checkIsAutoGen(rule);
                    this.setState({isAutoGen});
                }
            }
        }
    };

    renderContent = () => {
        const {
            classes,
            caseDialogStatus,
            caseNoForm,
            clinicList,
            encounterGroupDtos,
            service,
            // codeListDtos,
            patientStatusList,
            patient,
            //encounterTypeList,
            aliasRule,
            selEncntrGrp
        } = this.props;
        const siteId = CommonUtil.getSiteIdBySiteCd(caseNoForm.ownerClinicCd);
        const { encounterTypeList } = this.state;
        const _encounterTypeList = EnctrAndRmUtil.getActiveEnctrTypeIncludeAllClinic(siteId, encounterTypeList);
        const encounterList = this.filterEncounterList(_encounterTypeList, encounterGroupDtos, caseNoForm.ownerClinicCd);
        const subEncounterList = this.filterSubEncounterList(_encounterTypeList, caseNoForm.encounterTypeCd, encounterGroupDtos, caseNoForm.ownerClinicCd);
        const filterClinic = this.filterClinicList(clinicList, service.serviceCd);
        return (
            <ValidatorForm ref="caseNoDialogForm">
                <Grid container spacing={2} className={classes.root}>

                    <Grid item container>
                        <SelectFieldValidator
                            id="caseNoDialog_ownerClinic"
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Owner Clinic<RequiredIcon /></>
                            }}
                            options={filterClinic.map(item => (
                                { value: item.clinicCd, label: item.clinicName }
                            ))}
                            isDisabled={caseNoForm.statusCd !== Enum.CASE_STATUS.ACTIVE}
                            value={caseNoForm.ownerClinicCd}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            onChange={e => this.handleFieldChange(e.value, 'ownerClinicCd')}
                        />
                    </Grid>

                    <Grid item container>
                        <SelectFieldValidator
                            id="caseNoDialog_casePrefix"
                            isDisabled={caseDialogStatus !== Enum.CASE_DIALOG_STATUS.CREATE || caseNoForm.statusCd !== Enum.CASE_STATUS.ACTIVE || _.isObject(selEncntrGrp)}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Case Prefix<RequiredIcon /></>
                            }}
                            autoFocus={caseDialogStatus === Enum.CASE_DIALOG_STATUS.CREATE && aliasRule.length > 1}
                            options={aliasRule.map(item => (
                                { value: item.casePrefix, label: `${item.casePrefix} - ${item.casePrefixDesc || ''}` }
                            ))}
                            value={caseNoForm.casePrefixCd}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            onChange={e => this.handleFieldChange(e.value, 'casePrefixCd')}
                        />
                    </Grid>

                    <Grid item container spacing={2}>
                        <Grid item xs={6}>
                            <SelectFieldValidator
                                id="caseNoDialog_encounterCd"
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: 'Encounter Type'
                                }}
                                autoFocus={
                                    (caseDialogStatus === Enum.CASE_DIALOG_STATUS.CREATE && aliasRule.length === 1)
                                    || caseDialogStatus === Enum.CASE_DIALOG_STATUS.EDIT
                                }
                                options={encounterList.map(item => (
                                    { value: item.encounterTypeCd, label: item.description }
                                ))}
                                isDisabled={caseNoForm.statusCd !== Enum.CASE_STATUS.ACTIVE}
                                value={caseNoForm.encounterTypeCd}
                                addNullOption
                                onChange={e => this.handleFieldChange(e.value, 'encounterTypeCd')}
                                sortBy="label"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <SelectFieldValidator
                                id="caseNoDialog_subEncounter"
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: 'Room'
                                }}
                                options={subEncounterList.map(item => (
                                    { value: item.subEncounterTypeCd, label: item.description }
                                ))}
                                addNullOption
                                isDisabled={caseNoForm.statusCd !== Enum.CASE_STATUS.ACTIVE}
                                value={caseNoForm.subEncounterTypeCd}
                                msgPosition="bottom"
                                onChange={e => this.handleFieldChange(e.value, 'subEncounterTypeCd')}
                            />
                        </Grid>
                    </Grid>

                    <Grid item container spacing={2}>
                        <Grid item xs={6}>
                            <DateFieldValidator
                                id="caseNoDialog_registrationDate"
                                isRequired
                                disabled={caseNoForm.statusCd !== Enum.CASE_STATUS.ACTIVE}
                                label={<>Registration Date<RequiredIcon /></>}
                                onChange={e => this.handleFieldChange(e, 'regDtm')}
                                value={caseNoForm.regDtm}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <SelectFieldValidator
                                id="caseNoDialog_patientStatus"
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: 'Patient Status'
                                }}
                                // options={codeListDtos.patient_status && codeListDtos.patient_status.map(item => (
                                //     { value: item.code, label: item.engDesc }
                                // ))}
                                // options={codeListDtos.patient_status && codeListDtos.patient_status.map((item) => (
                                //     { value: item.code, label: item.superCode }
                                // ))}
                                options={patientStatusList && patientStatusList.map((item) => ({ value: item.code, label: item.superCode }))}
                                addNullOption
                                isDisabled={caseNoForm.statusCd !== Enum.CASE_STATUS.ACTIVE}
                                value={caseNoForm.patientStatus}
                                onChange={e => this.handleFieldChange(e.value, 'patientStatus')}
                            />
                        </Grid>
                    </Grid>

                    <Grid item container direction="row" alignContent="flex-start">
                        <Grid item xs>
                            <CIMSTextField
                                id="caseNoDialog_caseReference"
                                label="Case Reference"
                                variant="outlined"
                                fullWidth
                                calActualLength
                                inputProps={{ maxLength: 20 }}
                                disabled={caseNoForm.statusCd !== Enum.CASE_STATUS.ACTIVE}
                                value={caseNoForm.caseReference}
                                onChange={e => this.handleFieldChange(e.target.value, 'caseReference')}
                            />
                        </Grid>
                        {(service.serviceCd === 'THS' && patient && patient.patientKey && patient.genderCd === 'F') ?
                            <>
                                <Grid item xs="auto">
                                    <Tooltip
                                        title={<Typography>Pregnant / Breastfeed</Typography>}
                                    >
                                        <CIMSButton
                                            aria-label="Set Pregnant or Breastfeed"
                                            style={{ margin: '0px 0px 0px 8px', minWidth: '38px', maxWidth: '38px', minHeight: '38px', maxHeight: '38px' }}
                                            onClick={() => this.handleFieldChange('Pregnant/Breastfeed', 'caseReference')}
                                        >
                                            <SvgIcon
                                                viewBox="0 0 512 512"
                                                component={PregnantWomanSvg}
                                                style={{ minWidth: '28px', maxWidth: '28px', minHeight: '28px', maxHeight: '28px' }}
                                            />
                                            {/* <PregnantWomanIcon
                                            style={{ minWidth: '35px', maxWidth: '35px', minHeight: '35px', maxHeight: '35px' }}
                                        /> */}
                                        </CIMSButton>
                                    </Tooltip>
                                </Grid>
                            </> : null}
                    </Grid>

                    <Grid item container>
                        <CIMSMultiTextField
                            id="caseNoDialog_remark"
                            label="Remark"
                            variant="outlined"
                            fullWidth
                            calActualLength
                            inputProps={{ maxLength: 255 }}
                            disabled={caseNoForm.statusCd !== Enum.CASE_STATUS.ACTIVE}
                            value={caseNoForm.remark}
                            rows="4"
                            onChange={e => this.handleFieldChange(e.target.value, 'remark')}
                        />
                    </Grid>

                    {
                        caseDialogStatus === Enum.CASE_DIALOG_STATUS.EDIT ?
                            <Grid item container>
                                <SelectFieldValidator
                                    id="caseNoDialog_caseStatus"
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Case Status<RequiredIcon /></>
                                    }}
                                    options={Enum.CASE_STATUS_LIST.map(item => (
                                        { value: item.value, label: item.label }
                                    ))}
                                    value={caseNoForm.statusCd}
                                    msgPosition="bottom"
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    onChange={e => this.handleFieldChange(e.value, 'statusCd')}
                                />
                            </Grid> : null
                    }
                </Grid>
            </ValidatorForm>
        );
    }

    render() {
        const { classes, openCaseNo, caseDialogStatus, isNoPopup } = this.props;
        const { isAutoGen } = this.state;
        if (isAutoGen === 'Y' && caseDialogStatus !== Enum.CASE_DIALOG_STATUS.EDIT) {
            if (!openCaseNo) {
                return null;
            }
            if (isNoPopup) {
                this.handleSave();
            } else {
                this.props.openCommonMessage({
                    msgCode: '110037',
                    btnActions: {
                        btn1Click: () => {
                            this.handleSave();
                        },
                        btn2Click: () => {
                            this.props.auditAction('Cancel Generate Case', null, null, false, 'patient');
                            this.props.closeCaseNoDialog();
                        }
                    }
                });
            }
        } else if (isAutoGen === 'N' || (isAutoGen === 'Y' && caseDialogStatus === Enum.CASE_DIALOG_STATUS.EDIT)) {
            return (
                <CIMSPromptDialog
                    id={'caseNoDialog'}
                    classes={{
                        paper: classes.dialog
                    }}
                    dialogTitle={caseDialogStatus === Enum.CASE_DIALOG_STATUS.CREATE ? 'Create Case' : 'Edit Case'}
                    dialogContentText={this.renderContent()}
                    open={openCaseNo}
                    buttonConfig={
                        [
                            {
                                id: 'caseNoDialog_createBtn',
                                name: caseDialogStatus === Enum.CASE_DIALOG_STATUS.CREATE ? 'Create' : 'Save',
                                onClick: this.handleSave
                            },
                            {
                                id: 'caseNoDialog_cancelBtn',
                                name: 'Cancel',
                                onClick: this.handleCancelBtn
                            }
                        ]
                    }
                />
            );
        }
        return null;
    }
}

const mapStateToProps = (state) => {
    return {
        casePrefixList: state.caseNo.casePrefixList,
        caseNoForm: state.caseNo.caseNoForm,
        clinicList: state.common.clinicList,
        caseDialogStatus: state.caseNo.caseDialogStatus,
        openCaseNo: state.caseNo.openCaseNo,
        service: state.login.service,
        clinic: state.login.clinic,
        isNoPopup: state.caseNo.isNoPopup,
        encounterGroupDtos: state.caseNo.encounterGroupDtos,
        caseCallBack: state.caseNo.caseCallBack,
        codeListDtos: state.caseNo.codeListDtos,
        currentUpdateField: state.caseNo.currentUpdateField,
        patientStatusList: state.common.commonCodeList.patient_status,
        patient: state.patient.patientInfo,
        subTabsActiveKey: state.mainFrame.subTabsActiveKey,
        subTabs: state.mainFrame.subTabs,
        encounterTypeList: state.common.encounterTypeList,
        aliasRule: state.caseNo.aliasRule,
        selEncntrGrp: state.caseNo.encntrGrp
    };
};

const mapDispatchToProps = {
    closeCaseNoDialog,
    updateCaseNoForm,
    updateState,
    saveCaseNoWithAlias,
    getEncounterTypeList,
    getEncounterGroup,
    openCommonMessage,
    getCodeList,
    auditAction,
    getEncounterTypesBySiteId
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CaseNoAliasGenDialog));