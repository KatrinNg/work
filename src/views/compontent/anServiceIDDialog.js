import React from 'react';
import { connect } from 'react-redux';
import {
    Grid,
    withStyles,
    FormControlLabel,
    Typography
} from '@material-ui/core';
import _ from 'lodash';
import moment from 'moment';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import FastTextFieldValidator from '../../components/TextField/FastTextFieldValidator';
import SelectFieldValidator from '../../components/FormValidator/SelectFieldValidator';
import CIMSPromptDialog from '../../components/Dialog/CIMSPromptDialog';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';
import OutlinedRadioValidator from '../../components/FormValidator/OutlinedRadioValidator';
import CIMSCheckBox from '../../components/CheckBox/CIMSCheckBox';
import RegChCodeField from '../../views/registration/component/regChCodeField';
import RegDateBirthField from '../../views/registration/component/regDateBirthField';
import CIMSButton from '../../components/Buttons/CIMSButton';
import Enum from '../../enums/enum';
import RegFieldLength from '../../enums/registration/regFieldLength';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import {
    updateState,
    resetAll,
    getDeliveryHospital,
    getCaseStsChangeRsns,
    saveAntSvcInfo,
    modifyAnSvcIdInfo,
    listAntSvcIDInfoLog
} from '../../store/actions/anServiceID/anServiceID';
import * as AnSvcIdEnum from '../../enums/anSvcID/anSvcIDEnum';
import accessRightEnum from '../../enums/accessRightEnum';
import {
    filterRsnTypeList,
    disableChangeCaseSts,
    isInvalidCase,
    genAliasPrefix,
    updateFopChiName,
    getAliasRule
} from '../../utilities/anSvcIdUtilities';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import { auditAction } from '../../store/actions/als/logAction';
import ALSDesc from '../../constants/ALS/alsDesc';
import { skipTab } from '../../store/actions/mainFrame/mainFrameAction';
import { refreshAnSvcIDInfo, refreshPatient } from '../../store/actions/patient/patientAction';
import CommonRegex from '../../constants/commonRegex';
import AnServiceIdLogDialog from '../registration/component/anServiceIdLogDialog';
import { antenatalInfo } from '../../store/reducers/patient/patientReducer';
import * as UserUtilities from '../../utilities/userUtilities';     //CIMST-3408  Disable the case status of Case No. for base role = CIMS-COUNTER
import * as CommonUtil from '../../utilities/commonUtilities';

class AnServiceIDDialog extends React.Component {

    constructor(props) {
        super();
        this.state = {
            disableRemark: true,
            confirmation: false,
            anSvcIdLogList: [],
            openLog: false,
            clcAntInfo: _.cloneDeep(antenatalInfo),
            clcAntInfoBk: _.cloneDeep(antenatalInfo),
            deliveryHospitalList: null,
            caseStsChangeRsns: [],
            isAssBk: 0,
            ccCodeChiChar: [],
            anSvcIdSeq: '',
            singleNameInd: 0,
            antInfoIsDirty: false,
            ompIsDirty: false,
            fopIsDirty: false,
            isClcAntChange: 0,
            isClcOmpChange: 0,
            isClcFopChange: 0,
            encntrGrpCd: null,
            hasPromptedMessage: false
        };
    }

    componentDidMount() {
        const {
            clinicConfig,
            serviceCd,
            loginSiteId
        } = this.props;
        this.props.getCaseStsChangeRsns({ svcCd: this.props.service.svcCd, status: 'A' },
            (data) => { this.setState({ caseStsChangeRsns: data }); }
        );
        const { clcAntFullList, alias, encntrGrpCd, pageSts, patientInfo } = this.props;
        let siteId = this.props.siteId;
        if (pageSts === AnSvcIdEnum.pageSts.CREATE) {
            const isTransferInSiteParam = CommonUtil.getTopPriorityOfSiteParams(clinicConfig, serviceCd, loginSiteId, 'IS_TRANSFER_IN_CHECKED');
            const isTransferInChecked = isTransferInSiteParam ? parseInt(_.cloneDeep(isTransferInSiteParam).paramValue) : 1;
            let clcAntInfo;
            let newState = {};

            if (patientInfo.isFullCase || isTransferInChecked !== 1)
                clcAntInfo = _.cloneDeep(this.state.clcAntInfo);

            if (patientInfo.isFullCase && clcAntInfo) {
                clcAntInfo.isFullCase = 1;
                newState = {...newState, clcAntInfo: clcAntInfo, clcAntInfoBk: clcAntInfo, encntrGrpCd: encntrGrpCd};
            }

            if (isTransferInChecked !== 1 && clcAntInfo) {
                clcAntInfo.isHaXferIn = 0;
                newState = {...newState, clcAntInfo: clcAntInfo, clcAntInfoBk: clcAntInfo};
            }

            if (clcAntInfo)
                this.setState(newState);
        } else {
            if (clcAntFullList && clcAntFullList.length > 0) {
                let clcAntInfo = clcAntFullList.find(x => x.antSvcId === alias);
                // let clcAntInfo = clcAntFullList[0];
                if (clcAntInfo) {
                    if (!clcAntInfo.clcAntOmpDto) {
                        clcAntInfo.clcAntOmpDto = antenatalInfo.clcAntOmpDto;
                    }
                    if (!clcAntInfo.clcFopDto) {
                        clcAntInfo.clcFopDto = antenatalInfo.clcFopDto;
                    }
                    clcAntInfo.codInvldExpyRsnId = '';
                    clcAntInfo.invldExpyRsnTxt = '';
                    let fop = clcAntInfo.clcFopDto || null;
                    if (fop) {
                        if ((fop.engSurname && fop.engGivName) || (!fop.engSurname && !fop.engGivName)) {
                            this.setState({ singleNameInd: 0 });
                        } else {
                            this.setState({ singleNameInd: 1 });
                        }
                    }
                    this.setState({ clcAntInfo: clcAntInfo, clcAntInfoBk: clcAntInfo });
                }
                this.setState({ clcAntInfo: clcAntInfo, clcAntInfoBk: clcAntInfo, encntrGrpCd: encntrGrpCd });
                siteId = clcAntInfo.siteId;
            }
        }
        this.props.getDeliveryHospital({ siteId: siteId, rlatType: 'H', status: 'A' },
            (data) => { this.setState({ deliveryHospitalList: data }); }
        );
    }

    shouldComponentUpdate(nextP, nextS) {
        if (nextP.pageSts === AnSvcIdEnum.pageSts.EDIT) {
            if (nextS.hasPromptedMessage === false) {
                if (nextP.open && nextS.clcAntInfo.codHcinstId && nextS.deliveryHospitalList) {
                    const { deliveryHospitalList, clcAntInfo, clcAntInfoBk } = nextS;
                    if (clcAntInfo.sts === AnSvcIdEnum.caseSts.ACTIVE && clcAntInfoBk.sts === AnSvcIdEnum.caseSts.ACTIVE) {
                        let hcinstIdx = deliveryHospitalList.findIndex(x => x.hcinstId === clcAntInfo.codHcinstId);
                        if (hcinstIdx === -1) {
                            this.setState({ hasPromptedMessage: true });
                            this.props.openCommonMessage({
                                msgCode: '110168',
                                showSnackbar: true
                            });
                        }
                    }
                }
            }
        }
        return true;
    }


    componentDidUpdate(prevP, prevS) {
        const { clcAntInfo } = this.state;
        if (prevS.clcAntInfo.clcFopDto.codOcpId && prevS.clcAntInfo.clcFopDto.codOcpId !== clcAntInfo.clcFopDto.codOcpId) {
            if (clcAntInfo.clcFopDto.codOcpId === 5232 && prevS.clcAntInfo.clcFopDto.codOcpId !== 5232) {
                this.fopOtherOccRef.focus();
            }
        }

        if (prevS.clcAntInfo.clcFopDto.codEduLvlId && prevS.clcAntInfo.clcFopDto.codEduLvlId !== clcAntInfo.clcFopDto.codEduLvlId) {
            if (clcAntInfo.clcFopDto.codEduLvlId === 22629 && prevS.clcAntInfo.clcFopDto.codEduLvlId !== 22629) {
                this.fopOtherEduLvlRef.focus();
            }
        }
        if (prevS.clcAntInfo.codInvldExpyRsnId !== clcAntInfo.codInvldExpyRsnId) {
            if (clcAntInfo.codInvldExpyRsnId === 22612 || clcAntInfo.codInvldExpyRsnId === 22605) {
                this.otherCaseRsnRef.focus();
            }
        }
    }

    componentWillUnmount() {
        this.props.resetAll();
    }



    resetChineseNameFieldValid = () => {
        if (this.chineseNameField) {
            this.chineseNameField.makeValid();
        }
    }

    handleAntInfoChange = (name, value, dto) => {
        let clcAntInfo = _.cloneDeep(this.state.clcAntInfo);
        if (!clcAntInfo.clcAntOmpDto) {
            clcAntInfo.clcAntOmpDto = antenatalInfo.clcAntOmpDto;
        }
        const { clcAntInfoBk, isClcAntChange, isClcOmpChange, isClcFopChange } = this.state;
        if (dto === 'omp') {
            let ompIsDirty = false;
            if (name === 'genSts') {
                //this.setState({isClcOmpChange: 1});
                if (value === AnSvcIdEnum.genSts.UNSUBSCRIBE) {
                    clcAntInfo['clcAntOmpDto'].emailAddr = '';
                    clcAntInfo['clcAntOmpDto'].emailLangCd = '';
                    clcAntInfo['clcAntOmpDto'].recSts = AnSvcIdEnum.ompSts.DELETEDED;
                } else if (value === AnSvcIdEnum.genSts.SUBSCRIBE) {
                    const { patientInfo } = this.props;
                    clcAntInfo['clcAntOmpDto'].emailLangCd = patientInfo && patientInfo.commLangCd ? patientInfo.commLangCd : Enum.AN_SERVICE_ID_LANGUAGE_PREFERRED.TRADITIONAL_CHINESE;
                    clcAntInfo['clcAntOmpDto'].emailAddr = patientInfo && patientInfo.emailAddress ? patientInfo.emailAddress : '';
                    clcAntInfo['clcAntOmpDto'].recSts = AnSvcIdEnum.ompSts.CURRENT;
                }
            }
            clcAntInfo['clcAntOmpDto'][name] = value === '' ? null : value;
            ompIsDirty = !_.isEqual(clcAntInfo.clcAntOmpDto, clcAntInfoBk.clcAntOmpDto);
            if (isClcOmpChange === 0) {
                if (ompIsDirty === true) {
                    this.setState({ isClcOmpChange: 1 });
                }
            }
            this.setState({ ompIsDirty });
        } else if (dto === 'fop') {
            let fopIsDirty = false;
            if (name === 'engSurname') {
                let singleNameInd = 0;
                let fatherInfo = clcAntInfo.clcFopDto;
                if (value && fatherInfo.engGivName || !value && !fatherInfo.engGivName) {
                    singleNameInd = 0;
                } else {
                    let reg = new RegExp(CommonRegex.VALIDATION_REGEX_SPECIAL_ENGLISH);
                    if (reg.test(value) || !value) {
                        singleNameInd = 1;
                    }
                }
                this.setState({ singleNameInd });
            } else if (name === 'engGivName') {
                let fatherInfo = clcAntInfo.clcFopDto;
                let singleNameInd = 0;
                if (value && fatherInfo.engSurname || !value && !fatherInfo.engSurname) {
                    singleNameInd = 0;
                } else {
                    let reg = new RegExp(CommonRegex.VALIDATION_REGEX_SPECIAL_ENGLISH);
                    if (reg.test(value) || !value) {
                        singleNameInd = 1;
                    }
                }
                this.setState({ singleNameInd });
            } else if (name === 'nameChi') {
                let fatherInfo = clcAntInfo.clcFopDto;
                if (fatherInfo.nameChi !== value) {
                    for (let i = 5; i >= 0; i--) {
                        let name = 'ccCode' + (i + 1);
                        fatherInfo[name] = null;
                    }
                }
                this.updateFunc({ ccCodeChiChar: [] });
            } else if (name === 'dob') {

                if (!clcAntInfo['clcFopDto'].exactDateCd) {
                    clcAntInfo['clcFopDto'].exactDateCd = Enum.DATE_FORMAT_EDMY_KEY;
                }
                if (!value) {
                    clcAntInfo.clcFopDto.exactDateCd = null;
                }
            } else if (name === 'codEduLvlId') {
                if (value !== 22629) {
                    clcAntInfo.clcFopDto.otherEduLvl = null;
                }

            } else if (name === 'codOcpId') {
                if (value !== 5232) {
                    clcAntInfo.clcFopDto.otherOcp = '';
                }
            }
            clcAntInfo['clcFopDto'][name] = value === '' ? null : value;
            fopIsDirty = !_.isEqual(clcAntInfo.clcFopDto, clcAntInfoBk.clcFopDto);
            if (isClcFopChange === 0) {
                if (fopIsDirty === true) {
                    this.setState({ isClcFopChange: 1 });
                }
            }
            this.setState({ fopIsDirty });
        } else {
            let antInfoIsDirty = false;
            if (name === 'sts') {
                if (value === AnSvcIdEnum.caseSts.INVALIDATE) {
                    const oldGenSts = clcAntInfo.clcAntOmpDto.genSts;
                    if (oldGenSts === AnSvcIdEnum.genSts.SUBSCRIBE) {
                        clcAntInfo.clcAntOmpDto.genSts = AnSvcIdEnum.genSts.UNSUBSCRIBE;
                        clcAntInfo.clcAntOmpDto.recSts = AnSvcIdEnum.ompSts.DELETEDED;
                        clcAntInfo.clcAntOmpDto.emailAddr = null;
                        clcAntInfo.clcAntOmpDto.emailLangCd = null;
                        this.setState({ isClcOmpChange: 1 });
                    }

                }
            }
            if (name === 'codInvldExpyRsnId') {
                if (value === 22612 || value === 22605) {
                    this.setState({ disableRemark: false });
                }
                else {
                    this.setState({ disableRemark: true });
                    clcAntInfo.invldExpyRsnTxt = null;
                }
            }
            clcAntInfo[name] = value === '' ? null : value;
            if (isClcAntChange === 0) {
                let _clcAntInfo = _.cloneDeep(clcAntInfo);
                let _clcAntInfoBk = _.cloneDeep(clcAntInfoBk);
                delete _clcAntInfo.clcAntOmpDto;
                delete _clcAntInfo.clcFopDto;
                delete _clcAntInfoBk.clcAntOmpDto;
                delete _clcAntInfoBk.clcFopDto;
                antInfoIsDirty = !_.isEqual(_clcAntInfo, _clcAntInfoBk);
                if (antInfoIsDirty === true) {
                    this.setState({ isClcAntChange: 1 });
                }
                this.setState({ antInfoIsDirty });
            }
        }
        this.updateFunc({ clcAntInfo: clcAntInfo });
    }

    caseStsOnChange = (value, curAntInfoIdx = -1) => {
        const { clcAntInfo } = this.state;
        if (value === AnSvcIdEnum.caseSts.INVALIDATE && value !== clcAntInfo) {
            this.setState({ confirmation: true });
        } else {
            this.handleAntInfoChange('sts', value);
        }
    }

    extDobOnChange = (dobData, updateFunc) => {
        let clcAntInfo = _.cloneDeep(this.state.clcAntInfo);
        let info = _.cloneDeep(clcAntInfo.clcFopDto);
        let extDob = {
            dob: dobData.dob,
            exactDateCd: dobData.exactDobCd
        };
        clcAntInfo['clcFopDto'] = {
            ...info,
            ...extDob
        };
        updateFunc({ clcAntInfo });
    }

    updateFunc = (newState) => {
        this.setState(newState);
    }

    handleSubmit = () => {
        const { patientInfo, service, pageSts, siteId, aliasRule, encntrGrp } = this.props;
        const { clcAntInfo, isAssBk, anSvcIdSeq, ompIsDirty, fopIsDirty, isClcAntChange, isClcOmpChange, isClcFopChange, encntrGrpCd } = this.state;
        let clcAntDto = _.cloneDeep(clcAntInfo);

        if (moment(clcAntDto.clcFopDto.dob).isValid()) {
            clcAntDto.clcFopDto.dob = moment(clcAntDto.clcFopDto.dob).format(Enum.DATE_FORMAT_EYMD_VALUE);
        } else {
            clcAntDto.clcFopDto.dob = null;
        }



        if (pageSts === AnSvcIdEnum.pageSts.CREATE) {
            // let rule=null;
            // if(encntrGrp){
            //     rule = aliasRule.find(item => item.encntrGp === encntrGrp.encntrGrpCd);
            // }else{
            //     rule = aliasRule[0];
            // }
            let rule = getAliasRule(aliasRule, encntrGrp);
            const _encntrGp = rule && rule.encntrGp ? rule.encntrGp : null;
            const aliasPrefix = genAliasPrefix(rule);
            const antSvcId = aliasPrefix + anSvcIdSeq;
            // if (curAntInfoIdx > -1) {
            if (isAssBk === 1) {
                clcAntDto.antSvcId = antSvcId;
            }
            clcAntDto.siteId = siteId;
            let submitData = {
                siteId: rule.siteId,
                patientKey: patientInfo.patientKey,
                svcCd: rule.svcCd,
                encntrGp: _encntrGp,
                clcAntDto
            };
            //submitData.siteId = siteId;
            if (ompIsDirty === false) {
                delete submitData.clcAntDto.clcAntOmpDto;
            }
            if (fopIsDirty === false) {
                delete submitData.clcAntDto.clcFopDto;
            }

            this.props.saveAntSvcInfo(submitData, (data) => {
                this.props.closeAntSvcInfoDialog();
                this.props.refreshPatient({ isRefreshCaseNo: true });
                this.resetFlag();
            });
        } else {
            let submitData = {
                //siteId: rule.siteId,
                patientKey: patientInfo.patientKey,
                svcCd: service.svcCd,
                //encntrGp: encntrGp,
                clcAntDto
            };
            submitData.clcAntDto.isClcAntChange = isClcAntChange;
            submitData.clcAntDto.isClcOmpChange = isClcOmpChange;
            submitData.clcAntDto.isClcFopChange = isClcFopChange;
            submitData.siteId = null;
            //submitData.svcCd=clcAntInfo.svcCd;
            submitData.encntrGp = encntrGrpCd;
            this.props.modifyAnSvcIdInfo(submitData, () => {
                this.props.closeAntSvcInfoDialog();
                this.props.refreshPatient({ isRefreshCaseNo: true });
                this.resetFlag();
            });
        }
    }


    handleListAnServiceIdLog = () => {
        const { clcAntInfo } = this.state;
        this.props.listAntSvcIDInfoLog({ clcAntId: clcAntInfo.clcAntId }, (data) => {
            this.setState({ anSvcIdLogList: data, openLog: true });
        });
    };

    closeAnServiceIdLog = () => {
        this.setState({ openLog: false });
    }

    handleAnSvcIdSeqChange = (value) => {
        this.updateFunc({ anSvcIdSeq: value });
    }

    backUpSvcId = (id) => {
        const { aliasRule, encntrGrp } = this.props;
        //let rule = aliasRule.find(item => item.svcCd === service.svcCd);
        let rule = getAliasRule(aliasRule, encntrGrp);
        const aliasPrefix = genAliasPrefix(rule);
        return (
            <Grid container>
                <Grid item container id={id + '_aliasPrefix'} xs={2} justify={'flex-end'} style={{ marginTop: 12 }}>{aliasPrefix}</Grid>
                <Grid item xs={10}>
                    <FastTextFieldValidator
                        id={id + '_aliasSeq'}
                        inputProps={{
                            maxLength: 3
                        }}
                        onBlur={(e) => this.handleAnSvcIdSeqChange(e.target.value)}
                        type={'number'}
                        validators={[ValidatorEnum.minStringLength(3), ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_ALIAS_SEQ_ERROR().replace('%FORMAT%', rule.aliasFormat), CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        style={{
                            width: '20%'
                        }}
                    />
                </Grid>
            </Grid>
        );
    }

    updateChiChar = (charIndex, char, ccCodeList) => {
        let clcAntInfo = _.cloneDeep(this.state.clcAntInfo);
        let ccCodeChiChar = _.cloneDeep(this.state.ccCodeChiChar);
        let updateData = updateFopChiName(ccCodeList, clcAntInfo, ccCodeChiChar, charIndex, char);
        clcAntInfo.clcFopDto = updateData.patientInfo;
        ccCodeChiChar = updateData.ccCodeChiChar;
        const { clcAntInfoBk, isClcFopChange } = this.state;
        let fopIsDirty = false;
        fopIsDirty = !_.isEqual(clcAntInfo.clcFopDto, clcAntInfoBk.clcFopDto);
        if (isClcFopChange === 0) {
            if (fopIsDirty === true) {
                this.setState({ isClcFopChange: 1 });
            }
        }
        this.setState({
            clcAntInfo: clcAntInfo,
            ccCodeChiChar: ccCodeChiChar
        });
    }

    resetFlag = () => {
        this.setState({ antInfoIsDirty: false, ompIsDirty: false, fopIsDirty: false, isClcAntChange: 0, isClcFopChange: 0, isClcOmpChange: 0 });
    }

    getStatusOptions = () => {
        const { clcAntInfoBk } = this.state;
        if (clcAntInfoBk.sts !== AnSvcIdEnum.caseSts.EXPIRY) {
            return AnSvcIdEnum.caseStsList.filter(x => x.value !== AnSvcIdEnum.caseSts.EXPIRY);
        } else {
            return AnSvcIdEnum.caseStsList.filter(x => x.value !== AnSvcIdEnum.caseSts.INVALIDATE);
        }
    }

    genDialogContent = (id) => {
        const {
            classes,
            commonCodeList,
            pageSts,
            loginInfo
        } = this.props;
        const { disableRemark, clcAntInfo, clcAntInfoBk, isAssBk, deliveryHospitalList, caseStsChangeRsns, ccCodeChiChar } = this.state;
        const isFopRefuse = clcAntInfo.isFopRefuse;
        const refuse = isFopRefuse === 1;

        const caseRsnTypeList = filterRsnTypeList(caseStsChangeRsns, clcAntInfo, clcAntInfoBk);
        const omp = clcAntInfo.clcAntOmpDto;
        const fatherInfo = clcAntInfo.clcFopDto;
        const isClinicalBaseRole = UserUtilities.isClinicalBaseRole(loginInfo.userDto);     //CIMST-3408  Disable the case status of Case No. for base role = CIMS-COUNTER
        const disableCaseOpt = !isClinicalBaseRole || disableChangeCaseSts(clcAntInfo, clcAntInfoBk, pageSts, ccCodeChiChar);
        const invalidCase = isInvalidCase(clcAntInfo, clcAntInfoBk);
        const { singleNameInd } = this.state;
        const statusOptions = this.getStatusOptions();
        return (
            <Grid container>
                <ValidatorForm onSubmit={() => this.handleSubmit()} ref={ref => this.form = ref}>
                    {/* Case No */}
                    <Grid container item xs={12}>
                        <Grid item container xs={12} className={classes.sectionTitle}>
                            <Grid item xs={4}>
                                <Typography className={classes.titleTxt} variant={'h6'}>AN Service ID</Typography>
                            </Grid>
                            <CIMSButton
                                id={id + '_anSvcIdLogBtn'}
                                children={'Log'}
                                onClick={this.handleListAnServiceIdLog}
                                disabled={pageSts === AnSvcIdEnum.pageSts.CREATE}
                                style={{
                                    position: 'absolute',
                                    right: 25
                                }}
                            />
                        </Grid>
                        <Grid item xs={3} className={classes.itemPadding}>
                            {isAssBk === 1 ? this.backUpSvcId(id)
                                :
                                <FastTextFieldValidator
                                    id={`${id}_anServiceId`}
                                    variant={'outlined'}
                                    value={clcAntInfo.antSvcId}
                                    disabled={pageSts === AnSvcIdEnum.pageSts.CREATE ? true : isInvalidCase}
                                    onBlur={(e) => this.handleAntInfoChange('antSvcId', e.target.value)}
                                />
                            }
                        </Grid>
                        {
                            pageSts === AnSvcIdEnum.pageSts.CREATE ?
                                <Grid item xs={3} className={classes.itemPadding}>
                                    <FormControlLabel
                                        control={
                                            <CIMSCheckBox
                                                id={id + '_assignAnBackup'}
                                                onChange={e => this.setState({ 'isAssBk': e.target.checked ? 1 : 0 })}
                                            />
                                        }
                                        checked={isAssBk === 1}// eslint-disable-line
                                        label={'Assign AN Backup'}
                                    />
                                </Grid>
                                : null
                        }

                        <Grid container item xs={12}>
                            <Grid item xs={3} className={classes.itemPadding}>
                                <SelectFieldValidator
                                    id={id + '_caseSts'}
                                    style={{ width: '100%' }}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Case Status{pageSts === AnSvcIdEnum.pageSts.CREATE || disableCaseOpt ? null : <RequiredIcon />}</>
                                    }}
                                    value={clcAntInfo.sts}
                                    options={statusOptions.map(item => (
                                        { value: item.value, label: item.engDesc }
                                    ))}
                                    onChange={(e) => this.caseStsOnChange(e.value)}
                                    isDisabled={pageSts === AnSvcIdEnum.pageSts.CREATE || disableCaseOpt}
                                    validators={[
                                        ValidatorEnum.required
                                    ]}
                                    errorMessages={[
                                        CommonMessage.VALIDATION_NOTE_REQUIRED()
                                    ]}
                                    absoluteMessage
                                />
                            </Grid>
                            <Grid item xs={4} className={classes.itemPadding}>
                                <SelectFieldValidator
                                    id={id + '_remark'}
                                    style={{ width: '100%' }}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Remarks
                                            {
                                                clcAntInfo.sts === clcAntInfoBk.sts ? null : <RequiredIcon />
                                            }</>
                                    }}
                                    value={clcAntInfo.codInvldExpyRsnId}
                                    options={caseRsnTypeList.map(item => (
                                        { value: item.caseStatusChangeRsnId, label: item.rsnDesc }
                                    ))}
                                    onChange={(e) => {
                                        this.handleAntInfoChange('codInvldExpyRsnId', e.value);
                                    }
                                    }
                                    isDisabled={clcAntInfo.sts === clcAntInfoBk.sts}
                                    validators={[
                                        ValidatorEnum.required
                                    ]}
                                    errorMessages={[
                                        CommonMessage.VALIDATION_NOTE_REQUIRED()
                                    ]}
                                    absoluteMessage
                                />
                            </Grid>
                            <Grid item xs={5} className={classes.itemPadding}>
                                <FastTextFieldValidator
                                    id={id + '_otherRemark'}
                                    label={<>Other Remarks (Please Specify){clcAntInfo.codInvldExpyRsnId === 22605 || clcAntInfo.codInvldExpyRsnId === 22612 ? <RequiredIcon /> : null}</>}
                                    value={clcAntInfo.invldExpyRsnTxt}
                                    onBlur={e => {
                                        this.handleAntInfoChange('invldExpyRsnTxt', e.target.value);
                                    }}
                                    ref={ref => this.otherCaseRsnRef = ref}
                                    disabled={disableRemark}
                                    variant={'outlined'}
                                    validators={[
                                        ValidatorEnum.required
                                    ]}
                                    errorMessages={[
                                        CommonMessage.VALIDATION_NOTE_REQUIRED()
                                    ]}
                                    inputProps={{
                                        maxLength: 500
                                    }}
                                    calActualLength
                                    absoluteMessage
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    {/* Antenatal Information */}
                    <Grid container item xs={12}>
                        <Grid item xs={12} className={classes.sectionTitle}>
                            <Typography className={classes.titleTxt} variant={'h6'}>Antenatal Information</Typography>
                        </Grid>
                        <Grid container item xs={12}>
                            <Grid item xs={3} className={classes.itemPadding}>
                                {
                                    invalidCase ?
                                        <FastTextFieldValidator
                                            id={id + '_deliveryHospital'}
                                            style={{ width: '100%' }}
                                            label={'Delivery Hospital'}
                                            value={clcAntInfo.hcinstName || ''}
                                            disabled={invalidCase}
                                        /> : <SelectFieldValidator
                                            id={id + '_deliveryHospital'}
                                            style={{ width: '100%' }}
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                label: <>Delivery Hospital<RequiredIcon /></>
                                            }}
                                            value={clcAntInfo.codHcinstId}
                                            options={deliveryHospitalList && deliveryHospitalList.map(item => (
                                                { value: item.hcinstId, label: item.name }
                                            ))}
                                            validators={[
                                                ValidatorEnum.required
                                            ]}
                                            errorMessages={[
                                                CommonMessage.VALIDATION_NOTE_REQUIRED()
                                            ]}
                                            onChange={(e) => this.handleAntInfoChange('codHcinstId', e.value)}
                                            isDisabled={invalidCase}
                                            absoluteMessage
                                             />
                                }
                            </Grid>
                            <Grid item xs={3} className={classes.itemPadding}>
                                <FormControlLabel
                                    control={
                                        <CIMSCheckBox
                                            id={id + '_isFullCase'}
                                            onChange={e => this.handleAntInfoChange('isFullCase', e.target.checked ? 1 : 0)}
                                        />
                                    }
                                    checked={clcAntInfo.isFullCase === 1}// eslint-disable-line
                                    label={'FULL Case'}
                                    disabled={invalidCase}
                                />
                            </Grid>
                        </Grid>
                        <Grid container item xs={12}>
                            <Grid item xs={3} className={classes.itemPadding}>
                                <FormControlLabel
                                    control={
                                        <CIMSCheckBox
                                            id={id + '_transferIn'}
                                            onChange={(e) => {
                                                let isHaXferIn = 0;
                                                if (e.target.checked) {
                                                    isHaXferIn = 1;
                                                }
                                                this.handleAntInfoChange('isHaXferIn', isHaXferIn);
                                            }}
                                            value={clcAntInfo.isHaXferIn}
                                        />
                                    }
                                    checked={(clcAntInfo.isHaXferIn === 1)}// eslint-disable-line
                                    label={'Transfer-In from HA'}
                                    disabled={invalidCase}
                                />
                            </Grid>
                            <Grid item xs={3} className={classes.itemPadding}>
                                <FastTextFieldValidator
                                    id={id + '_haRefNo'}
                                    label={'HA Reference No.'}
                                    value={clcAntInfo.haRefNum}
                                    onBlur={e => this.handleAntInfoChange('haRefNum', e.target.value)}
                                    inputProps={{
                                        maxLength: 20
                                    }}
                                    disabled={invalidCase}
                                    noChinese
                                //upperCase
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    {/* Online Membership Programme (OMP) Subscription */}
                    <Grid container item xs={12}>
                        <Grid item container xs={12} className={classes.sectionTitle}>
                            <Grid item xs={4}>
                                <Typography className={classes.titleTxt} variant={'h6'}>Online Membership Programme (OMP) Subscription</Typography>
                            </Grid>
                            <Grid item xs={3} style={{ margin: 'auto 0px' }}>
                                <Typography style={{ color: 'black' }}>
                                    Last Updated On: {omp.updateDtm && moment(omp.updateDtm).isValid() ? moment(omp.updateDtm).format(Enum.DATE_FORMAT_24) : null}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={6}>
                            <Grid item xs={3}>
                                <CIMSButton
                                    id={id + '_subscribeBtn'}
                                    children={'Subscribe OMP'}
                                    onClick={() => { this.handleAntInfoChange('genSts', AnSvcIdEnum.genSts.SUBSCRIBE, 'omp'); }}
                                    disabled={invalidCase ? true : omp.genSts === AnSvcIdEnum.genSts.SUBSCRIBE}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <CIMSButton
                                    id={id + '_unsubscribeBtn'}
                                    children={'Unsubscribe OMP'}
                                    onClick={() => { this.handleAntInfoChange('genSts', AnSvcIdEnum.genSts.UNSUBSCRIBE, 'omp'); }}
                                    disabled={invalidCase ? true : omp.genSts === AnSvcIdEnum.genSts.UNSUBSCRIBE}
                                />
                            </Grid>
                            <Grid item xs={6} className={classes.itemPadding} style={{ margin: 'auto' }}>
                                <FastTextFieldValidator
                                    id={id + '_subscribeEmail'}
                                    variant={'outlined'}
                                    label={<>Email{omp.genSts === AnSvcIdEnum.genSts.SUBSCRIBE ? <RequiredIcon /> : null}</>}
                                    disabled={invalidCase ? true : omp.genSts === AnSvcIdEnum.genSts.UNSUBSCRIBE}
                                    value={omp.emailAddr}
                                    onBlur={e => this.handleAntInfoChange('emailAddr', e.target.value, 'omp')}
                                    validators={[ValidatorEnum.required, ValidatorEnum.isEmail]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_EMAILFIELD()]}
                                    inputProps={{
                                        maxLength: 80
                                    }}
                                    absoluteMessage
                                />
                            </Grid>
                        </Grid>
                        <Grid container item xs={6} className={classes.itemPadding}>
                            <OutlinedRadioValidator
                                id={id + '_languagePreferred'}
                                ref="outlinedRaiodRef"
                                name="languagePreferred"
                                labelText={'Language Preferred'}
                                onChange={e => this.handleAntInfoChange('emailLangCd', e.target.value, 'omp')}
                                value={omp.emailLangCd || ''}
                                list={Enum.AN_SERVICE_ID_LANGUAGE_PREFERRED_MAP.map(item => ({ label: item.engDesc, value: item.code }))}
                                disabled={invalidCase ? true : omp.genSts === AnSvcIdEnum.genSts.UNSUBSCRIBE}
                            />
                        </Grid>
                    </Grid>
                    {/* Father of Pregnancy */}
                    <Grid container item xs={12}>
                        <Grid item xs={12} className={classes.sectionTitle}>
                            <Typography className={classes.titleTxt} variant={'h6'}>Father of Pregnancy</Typography>
                        </Grid>
                        <Grid item xs={2} style={{ padding: '0px 8px' }}>
                            <FormControlLabel
                                control={
                                    <CIMSCheckBox
                                        id={id + '_fopRefuseToProvide'}
                                        onChange={(e) => {
                                            const { isClcAntChange } = this.state;
                                            if (e.target.checked) {
                                                let _clcAntInfo = _.cloneDeep(clcAntInfo);
                                                _clcAntInfo.isFopRefuse = 1;
                                                this.updateFunc({ clcAntInfo: _clcAntInfo, ccCodeChiChar: [] });
                                                if (isClcAntChange === 0) {
                                                    this.setState({ isClcAntChange: 1 });
                                                }
                                            } else {
                                                let antInfo = _.cloneDeep(clcAntInfo);
                                                antInfo.isFopRefuse = 0;
                                                this.updateFunc({ clcAntInfo: antInfo });
                                                if (isClcAntChange === 0) {
                                                    this.setState({ isClcAntChange: 1 });
                                                }
                                            }
                                        }}
                                        value={isFopRefuse}
                                    />
                                }
                                checked={isFopRefuse === 1}// eslint-disable-line
                                label={'Refuse to Provide'}
                                disabled={invalidCase}
                            />
                        </Grid>
                        <Grid item container xs={12}>
                            <Grid container item xs={12}>
                                <Grid item xs={4} className={classes.itemPadding}>
                                    <FastTextFieldValidator
                                        id={id + '_fopEngSurName'}
                                        label={'Surname'}
                                        value={fatherInfo.engSurname}
                                        ref={ref => this.surNameRef = ref}
                                        upperCase
                                        onlyOneSpace
                                        absoluteMessage
                                        trim={'all'}
                                        inputProps={
                                            {
                                                maxLength: 40
                                            }
                                        }
                                        warning={refuse ? [] : [ValidatorEnum.isEnglishWarningChar]}
                                        warningMessages={refuse ? [] : [CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()]}
                                        validators={[ValidatorEnum.isSpecialEnglish, ValidatorEnum.maxStringLength(40)]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH(), CommonMessage.VALIDATION_NOTE_BELOWMAXWIDTH(40)]}
                                        onBlur={e => this.handleAntInfoChange('engSurname', e.target.value, 'fop')}
                                        disabled={invalidCase ? true : refuse}
                                    />
                                </Grid>
                                <Grid item xs={4} className={classes.itemPadding}>
                                    <FastTextFieldValidator
                                        label={'Given Name'}
                                        id={id + '_fopEngGivName'}
                                        value={fatherInfo.engGivName}
                                        ref={ref => this.givNameRef = ref}
                                        upperCase
                                        onlyOneSpace
                                        absoluteMessage
                                        trim={'all'}
                                        inputProps={
                                            {
                                                maxLength: 40
                                            }
                                        }
                                        warning={refuse ? [] : [ValidatorEnum.isEnglishWarningChar]}
                                        warningMessages={refuse ? [] : [CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()]}
                                        validators={[ValidatorEnum.isSpecialEnglish, ValidatorEnum.maxStringLength(40)]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH(), CommonMessage.VALIDATION_NOTE_BELOWMAXWIDTH(40)]}
                                        onBlur={e => this.handleAntInfoChange('engGivName', e.target.value, 'fop')}
                                        disabled={invalidCase ? true : refuse}
                                    />
                                </Grid>
                                <Grid item xs={2} className={classes.itemPadding}>
                                    <FormControlLabel
                                        control={
                                            <CIMSCheckBox
                                                id={id + '_fopSingleNameInd'}
                                                onChange={e => {
                                                    //this.handleAntInfoChange('singleNameInd', e.target.checked ? 1 : 0, 'fop');
                                                    this.setState({ singleNameInd: e.target.checked ? 1 : 0 });
                                                }}
                                                value={singleNameInd}
                                            />
                                        }
                                        checked={singleNameInd === 1}// eslint-disable-line
                                        label={'Single Name Ind'}
                                        disabled={invalidCase ? true : refuse}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item xs={12}>
                                <Grid item xs={2} className={classes.itemPadding}>
                                    <FastTextFieldValidator
                                        id={id + '_fopNameChi'}
                                        label={'中文姓名'}
                                        ref={ref => this.chineseNameField = ref}
                                        disabled={invalidCase ? true : refuse}
                                        value={fatherInfo.nameChi}
                                        absoluteMessage
                                        trim={'all'}
                                        inputProps={{ maxLength: 20 }}
                                        // validators={refuse ? [] : [ValidatorEnum.isChinese]}
                                        // errorMessages={refuse ? [] : [CommonMessage.VALIDATION_NOTE_CHINESEFIELD()]}
                                        onBlur={e => this.handleAntInfoChange('nameChi', e.target.value, 'fop')}
                                    />
                                </Grid>
                                <Grid item xs={6} className={classes.itemPadding}>
                                    <RegChCodeField
                                        id={id + '_fopChinaCode'}
                                        updateChiChar={this.updateChiChar}
                                        comDisabled={invalidCase ? true : refuse}
                                        resetChineseNameFieldValid={this.resetChineseNameFieldValid}
                                        ccCode1={fatherInfo.ccCode1}
                                        ccCode2={fatherInfo.ccCode2}
                                        ccCode3={fatherInfo.ccCode3}
                                        ccCode4={fatherInfo.ccCode4}
                                        ccCode5={fatherInfo.ccCode5}
                                        ccCode6={fatherInfo.ccCode6}
                                    />
                                </Grid>

                            </Grid>
                            <Grid container item xs={12}>
                                <Grid item xs={4} className={classes.itemPadding}>
                                    <RegDateBirthField
                                        id={id + '_fopDobField'}
                                        dobProps={{ isRequired: false }}
                                        exactDobProps={{
                                            TextFieldProps: {
                                                variant: 'outlined',
                                                label: <>DOB Format{fatherInfo.dob ? <RequiredIcon /> : null}</>
                                            },
                                            validators: fatherInfo.dob ? [ValidatorEnum.required] : [],
                                            errorMessages: fatherInfo.dob ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : [],
                                            isDisabled: invalidCase ? true : !moment(fatherInfo.dob).isValid() || refuse
                                        }}
                                        comDisabled={invalidCase ? true : refuse}
                                        handleExtDobChange={(dobData) => this.extDobOnChange(dobData, this.updateFunc)}
                                        onChange={(value, name) => this.handleAntInfoChange(name, value, 'fop')}
                                        dobValue={fatherInfo.dob}
                                        exact_dobValue={fatherInfo.exactDateCd}
                                        exact_dobList={commonCodeList && commonCodeList.exact_dob || null}
                                    />
                                </Grid>
                                <Grid item xs={4} className={classes.itemPadding}>
                                    <SelectFieldValidator
                                        id={id + '_fopEduLvl'}
                                        style={{ width: '100%' }}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: <>Education Level</>
                                        }}
                                        isDisabled={invalidCase ? true : refuse}
                                        value={fatherInfo.codEduLvlId}
                                        options={
                                            commonCodeList &&
                                            commonCodeList.edu_level &&
                                            commonCodeList.edu_level.map((item) => (
                                                { value: item.otherId, label: item.engDesc }))}
                                        onChange={(e) => this.handleAntInfoChange('codEduLvlId', e.value, 'fop')}
                                    />
                                </Grid>
                                <Grid item xs={4} className={classes.itemPadding}>
                                    <FastTextFieldValidator
                                        id={id + '_fopOtherEduLvl'}
                                        ref={ref => this.fopOtherEduLvlRef = ref}
                                        label={<>Other Education Level (Please Specify){fatherInfo.codEduLvlId === 22629 ? <RequiredIcon /> : null}</>}
                                        value={fatherInfo.otherEduLvl}
                                        disabled={invalidCase ? true : refuse ? true : fatherInfo.codEduLvlId !== 22629}
                                        validators={fatherInfo.codEduLvlId === 22629 ? [ValidatorEnum.required] : []}
                                        errorMessages={fatherInfo.codEduLvlId === 22629 ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                        onBlur={e => this.handleAntInfoChange('otherEduLvl', e.target.value, 'fop')}
                                        inputProps={{
                                            maxLength: 500
                                        }}
                                        absoluteMessage
                                        calActualLength
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item xs={12}>
                                <Grid item xs={4} className={classes.itemPadding}>
                                    <FastTextFieldValidator
                                        id={id + '_fopCnctPhn'}
                                        label={'Contact Telephone No.'}
                                        disabled={invalidCase ? true : refuse}
                                        value={fatherInfo.phn}
                                        validators={
                                            [
                                                ValidatorEnum.minStringLength(RegFieldLength.CONTACT_PHONE_DEFAULT_MAX),
                                                ValidatorEnum.maxStringLength(RegFieldLength.CONTACT_PHONE_DEFAULT_MAX),
                                                ValidatorEnum.isHKMobilePhone
                                            ]
                                        }
                                        errorMessages={[
                                            CommonMessage.VALIDATION_NOTE_PHONE_BELOWMINWIDTH(),
                                            CommonMessage.VALIDATION_NOTE_OVERMAXWIDTH(),
                                            CommonMessage.VALIDATION_NOTE_IS_SPECIFIC_PHONE('Hong Kong Mobile', '5, 6, 7, 9')
                                        ]}
                                        onBlur={e => this.handleAntInfoChange('phn', e.target.value, 'fop')}
                                        inputProps={{
                                            maxLength: 8
                                        }}
                                        type={'number'}
                                        absoluteMessage
                                    />
                                </Grid>
                                <Grid item xs={4} className={classes.itemPadding}>
                                    <SelectFieldValidator
                                        id={id + '_fopOcc'}
                                        style={{ width: '100%' }}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: <>Occupation</>
                                        }}
                                        isDisabled={invalidCase ? true : refuse}
                                        value={fatherInfo.codOcpId}
                                        options={
                                            commonCodeList &&
                                            commonCodeList.occupation &&
                                            commonCodeList.occupation.map((item) => (
                                                { value: item.otherId, label: item.engDesc }))}
                                        onChange={(e) => this.handleAntInfoChange('codOcpId', e.value, 'fop')}
                                    />
                                </Grid>
                                <Grid item xs={4} className={classes.itemPadding}>
                                    <FastTextFieldValidator
                                        label={<>Other Occupation (Please Specify){fatherInfo.codOcpId === 5232 ? <RequiredIcon /> : null}</>}
                                        id={id + '_fopOtherOcc'}
                                        ref={ref => this.fopOtherOccRef = ref}
                                        value={fatherInfo.otherOcp}
                                        disabled={invalidCase ? true : refuse ? true : fatherInfo.codOcpId !== 5232}
                                        validators={fatherInfo.codOcpId === 5232 ? [ValidatorEnum.required] : []}
                                        errorMessages={fatherInfo.codOcpId === 5232 ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                        onBlur={e => this.handleAntInfoChange('otherOcp', e.target.value, 'fop')}
                                        inputProps={{
                                            maxLength: 500
                                        }}
                                        absoluteMessage
                                        calActualLength
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </ValidatorForm>
            </Grid>
        );
    }

    render() {
        const { classes, pageSts, patientInfo, service, open } = this.props;
        const { confirmation, openLog, anSvcIdLogList, clcAntInfoBk } = this.state;
        const id = 'anSvcIdDialog';
        return (
            <Grid container>
                <CIMSPromptDialog
                    id={id}
                    open={open}
                    dialogTitle={'AN Service ID Registration'}
                    classes={{
                        paper: classes.paper
                    }}
                    dialogContentText={
                        this.genDialogContent(id)
                    }
                    buttonConfig={
                        [
                            {
                                id: id + '_saveBtn',
                                name: 'Save',
                                disabled: clcAntInfoBk.sts === AnSvcIdEnum.caseSts.EXPIRY,
                                onClick: () => {
                                    this.props.auditAction(ALSDesc.SAVE, null, null, false, 'patient');
                                    if (pageSts === AnSvcIdEnum.pageSts.CREATE) {
                                        const formValid = this.form.isFormValid(false);
                                        formValid.then(result => {
                                            if (result) {
                                                this.props.openCommonMessage({
                                                    msgCode: '110156',
                                                    btnActions: {
                                                        btn1Click: () => {
                                                            this.props.auditAction('Confirm Create New AN Service ID');
                                                            this.form.submit();
                                                        },
                                                        btn2Click: () => {
                                                            this.props.auditAction('Cancel Create New AN Service ID', null, null, 'patient');
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        this.form.submit();
                                    }
                                }
                            },
                            {
                                id: id + '_resetBtn',
                                name: 'Reset',
                                disabled: clcAntInfoBk.sts === AnSvcIdEnum.caseSts.EXPIRY,
                                onClick: () => {
                                    this.props.auditAction('Click Reset Button', null, null, false, 'patient');
                                    this.form.resetValidations();
                                    this.setState({
                                        disableRemark: true,
                                        isAssBk: false,
                                        clcAntInfo: this.state.clcAntInfoBk,
                                        ccCodeChiChar: [],
                                        hasPromptedMessage: false
                                    });
                                    this.resetFlag();
                                }
                            },
                            {
                                id: id + 'cancelBtn',
                                name: 'Cancel',
                                onClick: () => {
                                    this.props.auditAction('Close Genarate AN Service ID Dialog', null, null, false, 'patient');
                                    this.props.closeAntSvcInfoDialog();
                                    this.props.refreshAnSvcIDInfo({ patientKey: patientInfo.patientKey, svcCd: service.svcCd });
                                    this.resetFlag();
                                }
                            }
                        ]
                    }
                />
                <CIMSPromptDialog
                    id={id + '_confirmation'}
                    open={confirmation}
                    dialogTitle={'Confirmation'}
                    dialogContentText={
                        <Grid container>
                            <Grid item container>Please check for future appointment(s) of the client before invalidation</Grid>
                            <Grid item container justify={'center'}>
                                <Grid item>
                                    <CIMSButton
                                        id={id + '_toApptPageBtn'}
                                        children={'Go to Appointment'}
                                        onClick={() => {
                                            this.props.auditAction('Go To Appointment Page', null, null, false, 'patient');
                                            this.setState({ confirmation: false }, () => {
                                                this.props.closeAntSvcInfoDialog();
                                                this.props.skipTab(accessRightEnum.booking);
                                            });
                                        }}
                                    />
                                </Grid>
                                <Grid item style={{ paddingLeft: 32 }}>
                                    <CIMSButton
                                        id={id + '_continueBtn'}
                                        children={'Continue'}
                                        onClick={() => {
                                            this.props.auditAction('Continue Mark AN Service ID To Invalid', null, null, false, 'patient');
                                            this.setState({ confirmation: false });
                                            this.handleAntInfoChange('sts', AnSvcIdEnum.caseSts.INVALIDATE);
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    }
                />
                <AnServiceIdLogDialog
                    open={openLog}
                    rowData={anSvcIdLogList}
                    onClose={this.closeAnServiceIdLog}
                    clinicList={this.props.clinicList}
                    caseStsChangeRsns={this.props.caseStsChangeRsns}
                />
            </Grid>
        );
    }
}


const styles = (theme) => ({
    paper: {
        width: '80%'
    },
    itemPadding: {
        padding: '12px 8px'
    },
    sectionTitle: {
        padding: '0px 8px',
        color: theme.palette.primaryColor
    },
    titleTxt: {
        fontWeight: 'bold'
    }
});

const mapState = (state) => {
    return {
        registerCodeList: state.registration.codeList,
        commonCodeList: state.common.commonCodeList,
        loginInfo: state.login.loginInfo,       //CIMST-3408  Disable the case status of Case No. for base role = CIMS-COUNTER
        siteId: state.login.clinic.siteId,
        service: state.login.service,
        patientInfo: state.patient.patientInfo,
        clinicList: state.common.clinicList,
        aliasRule: state.caseNo.aliasRule,
        encntrGrp: state.caseNo.encntrGrp,
        clinicConfig: state.common.clinicConfig,
        loginSiteId: state.login.clinic.siteId,
        serviceCd: state.login.service.serviceCd,
        ...state.patient.patientInfo.antSvcInfo
    };
};

const dispatch = {
    updateState,
    resetAll,
    getDeliveryHospital,
    getCaseStsChangeRsns,
    saveAntSvcInfo,
    openCommonMessage,
    auditAction,
    modifyAnSvcIdInfo,
    skipTab,
    refreshAnSvcIDInfo,
    listAntSvcIDInfoLog,
    refreshPatient
};


export default connect(mapState, dispatch)(withStyles(styles)(AnServiceIDDialog));