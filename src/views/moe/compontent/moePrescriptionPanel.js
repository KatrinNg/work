import React, { Component } from 'react';
import {
    Grid,
    Typography,
    IconButton,
    ListItem,
    Tooltip
} from '@material-ui/core';
import iconCancel from '../../../images/moe/cancel.png';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import CIMSButton from '../../../components/Buttons/CIMSButton';
// import Enum from '../../../enums/enum';
// import CIMSAlertDialog from '../../../components/Dialog/CIMSAlertDialog';
import * as prescriptionUtilities from '../../../utilities/prescriptionUtilities';
import FrequencyDialog from './dialog/frequencyDialog';
import FreeTextPanelField from './freeTextPanelField';
import PanelField from './panelField';
import _ from 'lodash';
// import questionIcon from '../../../images/moe/icon-question.gif';
import warningIcon from '../../../images/moe/warning.gif';
import CIMSDialog from '../../../components/Dialog/CIMSDialog';
import SpecialInterval from './specialInterval';
import * as moeUtilities from '../../../utilities/moe/moeUtilities';
//import { weekdays } from 'moment';
import imgDangerDrug from '../../../images/moe/dangerous_drug.png';
import {
    getTotalDangerDrug,
    getAllergyChecking
} from '../../../store/actions/moe/moeAction';
import {
    ORDER_LINE_TYPE,
    PANEL_FIELD_NAME
} from '../../../enums/moe/moeEnums';
// import { truncate } from 'fs';
import {
    openCommonCircular,
    closeCommonCircular
} from '../../../store/actions/common/commonAction';
import * as commonUtilities from '../../../utilities/commonUtilities';
import CommonRegex from '../../../constants/commonRegex';
import moment from 'moment';
import Enum from '../../../enums/enum';
import { MOE_MSG_CODE } from '../../../constants/message/moe/commonRespMsgCodeMapping';
import {
    openCommonMessage
} from '../../../store/actions/message/messageAction';
import { prescriptionPanelStyles as styles } from '../../moe/moeStyles';

function initRouteCodeList(drug, codeList) {
    let routeCodeList = [];
    if (drug.ddlRoute) {
        const routeOption = codeList.route.find(item => item.routeId == drug.ddlRoute);
        routeCodeList = [
            { ...routeOption, code: drug.ddlRoute, engDesc: drug.routeEng },
            { code: 'others', engDesc: 'others...' }
        ];
    } else if (codeList && codeList.route && codeList.route[0]) {
        routeCodeList = codeList.route;
    }
    return routeCodeList;
}

class MoePrescriptionPanel extends Component {
    constructor(props) {
        super(props);
        //get site code list
        let prescriptionData = _.cloneDeep(this.props.drug);
        let sitesCodeList = prescriptionUtilities.getSiteCodeListByRoute(prescriptionData, this.props.codeList);
        this.state = {
            // showDeleteDialog: false,
            panelTitleData: null,
            prescriptionData: prescriptionData,
            showConfirmButton: true,
            disabledBtn: false,
            showMultipleLine: false,
            showStepUpDown: false,

            //frequency
            frequencyItem: null,
            freqCodeList: [],

            //preceed save
            showProceedBtn: null,

            sitesCodeList: sitesCodeList,
            // isDeleteOrder: false,
            isShowSpecialInterval: false,
            isPopUpSpecialInterval: false,
            isPopUpAmendedDose: false,
            // isPopupGreaterThanMaxDosage: false,
            isCheckingTotalDosage: false,
            // emptyDose: null,
            // SPData: null

            //route
            routeCodeList: initRouteCodeList(prescriptionData, this.props.codeList),
            openRouteComponent: null,

            //site
            openSiteComponent: null,

            isDisabledConfirm: false,

            doseFocusVal: null,

            //Panel
            updatingFieldName: null,
            updatingFiledVal: null,
            defaultDurationUnit: moeUtilities.getHospSetting().defaultDurationUnit
        };
    }

    // static getDerivedStateFromProps(nextProps) {
    //     if (this.props && nextProps.drug !== this.props.drug) {
    //         return {
    //             prescriptionData: _.cloneDeep(nextProps.drug)
    //         };
    //     }
    //     return null;
    // }

    componentDidMount() {
        // this.setState({prescriptionData: _.cloneDeep(this.props.drug)});
        ValidatorForm.addValidationRule('isDecimal', (value) => {
            return prescriptionUtilities.checkIsDecimal(value);
        });
        if (this.state.prescriptionData.moeMedMultDoses && this.state.prescriptionData.moeMedMultDoses.length > 0) {
            this.handleAddMulDoses(this.state.prescriptionData.orderLineType);
        }
        // if (this.state.prescriptionData.multipleLine && this.state.prescriptionData.multipleLine.length > 0) {
        //     this.handleBtnMultipleLine();
        // }
        // if (this.state.prescriptionData.stepUpDown && this.state.prescriptionData.stepUpDown.length > 0) {
        //     this.handleBtnStepUpDown();
        // }
        if (this.state.prescriptionData.specialInterval && this.state.prescriptionData.specialInterval != null) {
            this.setState({
                disabledBtn: true,
                isShowSpecialInterval: true
            });
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.drug !== this.props.drug)
            this.setState({ prescriptionData: nextProps.drug });
    }

    componentDidUpdate() {
        const dialog = document.getElementById('prescription_PrescriptionPanel' + this.props.index);
        if (dialog) {
            const height = window.screen.height;
            const prescriptionInputArea = document.getElementById('prescriptionInputArea');
            if (height <= 720 && prescriptionInputArea && prescriptionInputArea.offsetHeight > 220) {
                prescriptionInputArea.style.maxHeight = '220px';
                prescriptionInputArea.style.overflowX = 'hidden';
                prescriptionInputArea.style.overflowY = 'auto';
            } else if ((height > 720 && prescriptionInputArea) || (height <= 720 && prescriptionInputArea && prescriptionInputArea.offsetHeight <= 220)) {
                prescriptionInputArea.style.maxHeight = 'none';//scrollTop
                prescriptionInputArea.style.overflowX = 'unset';
                prescriptionInputArea.style.overflowY = 'unset';
            }
        }
    }

    componentUnmount() {
        ValidatorForm.removeValidationRule('isDecimal');
    }

    // eslint-disable-next-line react/sort-comp
    handleChangeSite = (e, name, filterList) => {
        let value = e.value;
        //const allRouteCodeList = this.props.codeList.route;
        let { sitesCodeList, prescriptionData } = { ...this.state };
        if (name === 'ddlSite' && value === 'others') {
            //sitesCodeList = prescriptionUtilities.getAllSiteCodeList(allRouteCodeList);
            sitesCodeList = this.props.codeList.site;
            // e.value = 0;
            this.setState({
                sitesCodeList: sitesCodeList,
                openSiteComponent: true
            });
            return;
        }

        if (name === 'ddlRoute') {
            //change route code list start
            if (value === 'others') {
                this.setState({
                    routeCodeList: this.props.codeList && this.props.codeList.route,
                    openRouteComponent: true
                });
                return;
            }
            //change route code list end

            prescriptionData.routeEng = e.label;

            //reset ddlSite value when change dllRoute
            if (value !== this.state.prescriptionData.ddlRoute) {
                prescriptionData.ddlSite = 0;
                //this.onSelectedItem({ value: 0 }, 'ddlSite');
                this.setState({ prescriptionData });
            }

            //site code list
            let curRouteCodeList = this.props.codeList.route.find(i => i.code === value);
            if (curRouteCodeList) {
                sitesCodeList = _.cloneDeep(curRouteCodeList.sites);
                const isExitOthers = sitesCodeList.find(item => item.siteId === 'others');
                if (!isExitOthers && sitesCodeList.length !== 0)
                    sitesCodeList.push({ siteId: 'others', siteEng: 'others' });
            }

            this.onUpdateRouteOption(e, filterList);
        }
        this.onSelectedItem(e, name);
        this.setState({
            sitesCodeList
        });
    }
    toggleRouteComponent = (isOpen) => {
        this.setState({
            openRouteComponent: isOpen
        });
    }

    toggleSiteComponent = (open) => {
        this.setState({
            openSiteComponent: open
        }, () => {
            console.log('openSiteComponent', open);
        });
    }

    updatePrescriptionField = (fields) => {
        let { name, value } = fields;
        let prescriptionData = { ...this.state.prescriptionData };
        prescriptionData[name] = value;
        this.setState({ prescriptionData: prescriptionData });
    }

    updateOrderLineField = (e, lineId, name, listStyle) => {
        let prescriptionData = { ...this.state.prescriptionData };
        if (listStyle === ORDER_LINE_TYPE.MULTIPLE_LINE
            || listStyle === ORDER_LINE_TYPE.STEP_UP_AND_DOWN
        ) {
            prescriptionData.moeMedMultDoses[lineId][name] = e.value;
        }
        // if (listStyle === ORDER_LINE_TYPE.MULTIPLE_LINE) {
        //     prescriptionData.multipleLine[lineId][name] = e.value;
        // }
        // else if (listStyle === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
        //     prescriptionData.stepUpDown[lineId][name] = e.value;
        // }
        else if (listStyle === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
            prescriptionData.specialInterval.freq1 = e.value;
        }
        this.setState({ prescriptionData });
    }


    handleMultipleChange = (e, index) => {
        let prescriptionData = { ...this.state.prescriptionData };
        let name = e.target.name;

        if ((prescriptionData.moeMedMultDoses[index][name] || '') == e.target.value) return;
        prescriptionData.moeMedMultDoses[index][name] = e.target.value;

        // if (this.state.showMultipleLine) {
        //     if ((prescriptionData.multipleLine[index][name] || '') == e.target.value) return;
        //     prescriptionData.multipleLine[index][name] = e.target.value;
        // }
        // else if (this.state.showStepUpDown) {
        //     if ((prescriptionData.stepUpDown[index][name] || '') == e.target.value) return;
        //     prescriptionData.stepUpDown[index][name] = e.target.value;
        // }
        prescriptionData.txtQty = '';
        this.setState({
            prescriptionData: prescriptionData,
            showProceedBtn: null
        });
        //this.resetProceedBtn();
    }

    onMultipleSelectedItem = (e, index, name) => {
        let prescriptionData = { ...this.state.prescriptionData };
        const freqCodeList = prescriptionUtilities.getFreqCodeList(e.label);

        if (prescriptionData.moeMedMultDoses[index][name] == e.value) return;
        if (name === 'ddlFreq') {
            let freqValue = 0;
            if (e.useInputValue === 'Y') {
                if (prescriptionData.moeMedMultDoses[index] && prescriptionData.moeMedMultDoses[index].freq1 && prescriptionData.multipleLine[index].freq1 !== freqValue && prescriptionData.multipleLine[index].ddlFreq === e.value) {
                    freqValue = prescriptionData.moeMedMultDoses[index].freq1;
                } else if (freqCodeList && freqCodeList[0])
                    freqValue = freqCodeList[0].code;
                prescriptionData.moeMedMultDoses[index].frequencyItem = { open: true, value: e.value, label: e.label };
                prescriptionData.moeMedMultDoses[index].freqCodeList = freqCodeList;
            }
            prescriptionData.moeMedMultDoses[index].freq1 = freqValue;

            if (this.state.showStepUpDown) {
                moeUtilities.autoSetDurationByFreq(
                    prescriptionData.moeMedMultDoses[index],
                    e,
                    this.props.codeList.duration_unit,
                    prescriptionData.orderLineType);
            }
        }
        prescriptionData.moeMedMultDoses[index][name] = e.value;

        // if (this.state.showMultipleLine) {
        //     if (prescriptionData.multipleLine[index][name] == e.value) return;
        //     if (name === 'ddlFreq') {
        //         let freqValue = 0;
        //         if (e.useInputValue === 'Y') {
        //             if (prescriptionData.multipleLine[index] && prescriptionData.multipleLine[index].freq1 && prescriptionData.multipleLine[index].freq1 !== freqValue && prescriptionData.multipleLine[index].ddlFreq === e.value) {
        //                 freqValue = prescriptionData.multipleLine[index].freq1;
        //             } else if (freqCodeList && freqCodeList[0])
        //                 freqValue = freqCodeList[0].code;
        //             prescriptionData.multipleLine[index].frequencyItem = { open: true, value: e.value, label: e.label };
        //             prescriptionData.multipleLine[index].freqCodeList = freqCodeList;
        //         }
        //         prescriptionData.multipleLine[index].freq1 = freqValue;
        //     }
        //     prescriptionData.multipleLine[index][name] = e.value;
        // }
        // else if (this.state.showStepUpDown) {
        //     if (prescriptionData.stepUpDown[index][name] == e.value) return;
        //     if (name === 'ddlFreq') {
        //         let freqValue = 0;
        //         if (e.useInputValue === 'Y') {
        //             if (prescriptionData.stepUpDown[index] && prescriptionData.stepUpDown[index].freq1 && prescriptionData.stepUpDown[index].freq1 !== freqValue && prescriptionData.stepUpDown[index].ddlFreq === e.value) {
        //                 freqValue = prescriptionData.stepUpDown[index].freq1;
        //             } else if (freqCodeList && freqCodeList[0])
        //                 freqValue = freqCodeList[0].code;
        //             prescriptionData.stepUpDown[index].frequencyItem = { open: true, value: e.value, label: e.label };
        //             prescriptionData.stepUpDown[index].freqCodeList = freqCodeList;
        //         }
        //         prescriptionData.stepUpDown[index].freq1 = freqValue;
        //         //auto set duration by freq
        //         moeUtilities.autoSetDurationByFreq(
        //             prescriptionData.stepUpDown[index],
        //             e,
        //             this.props.codeList.duration_unit,
        //             prescriptionData.orderLineType);
        //     }
        //     prescriptionData.stepUpDown[index][name] = e.value;
        // }
        prescriptionData.txtQty = '';
        this.setState({
            prescriptionData,
            showProceedBtn: null
        });
        //this.resetProceedBtn();
    }

    closeMultipleFrequencyDialog = (name, value, index) => {
        let prescriptionData = { ...this.state.prescriptionData };

        prescriptionData.moeMedMultDoses[index].frequencyItem = null;

        // if (this.state.showMultipleLine) {
        //     prescriptionData.multipleLine[index].frequencyItem = null;
        // }
        // else if (this.state.showStepUpDown) {
        //     prescriptionData.stepUpDown[index].frequencyItem = null;
        // }
        this.setState({
            prescriptionData
        });
        //let fields = { value: value, name: name };
        // this.onMultipleSelectedItem(fields, index, name);
        //this.onMultipleSelectedItem(index);
    }

    handelMultipleCheckboxChange = (e, index) => {
        let cbValue = 'N';
        if (e.target.checked) {
            cbValue = 'Y';
        }
        let prescriptionData = { ...this.state.prescriptionData };
        prescriptionData.moeMedMultDoses[index][e.target.name] = cbValue;

        // //let fields = { value: cbValue, name: e.target.name };
        // if (this.state.showMultipleLine) {
        //     prescriptionData.multipleLine[index][e.target.name] = cbValue;
        // }
        // else if (this.state.showStepUpDown) {
        //     prescriptionData.stepUpDown[index][e.target.name] = cbValue;
        // }
        this.setState({
            prescriptionData
        });
    }

    handleChange = (e) => {
        let prescriptionData = { ...this.state.prescriptionData };
        const name = e.target.name;
        if ((prescriptionData[name] || '') == e.target.value) return;
        prescriptionData[name] = e.target.value;
        if (name != 'txtSpecInst' && name != 'txtQty')
            prescriptionData.txtQty = '';

        moeUtilities.updateMultDoseFirstRow(prescriptionData, name, e.target.value);
        this.setState({
            prescriptionData: prescriptionData
        });
        // let fields = { value: e.target.value, name: e.target.name };
        // this.updatePrescriptionField(fields);
        this.resetProceedBtn();
    }

    handelCheckboxChange = (e) => {
        const name = e.target.name;
        let cbValue = 'N';
        if (e.target.checked) {
            cbValue = 'Y';
        }
        let prescriptionData = { ...this.state.prescriptionData };
        if (prescriptionData[name] == cbValue) return;
        prescriptionData[name] = cbValue;
        if (name != 'chkPRN') {
            prescriptionData.txtQty = '';
        }

        moeUtilities.updateMultDoseFirstRow(prescriptionData, name, e.value);
        this.setState({
            prescriptionData
        });
        // let fields = { value: cbValue, name: e.target.name };
        // this.updatePrescriptionField(fields);
        this.resetProceedBtn();
    }

    onSelectedItem = (e, name) => {
        let prescriptionData = { ...this.state.prescriptionData };
        if (prescriptionData[name] == e.value) return;

        if (name === 'ddlFreq') {
            let freqValue = 0;
            if (e.useInputValue === 'Y') {
                const freqCodeList = prescriptionUtilities.getFreqCodeList(e.label);
                if (prescriptionData.freq1 && prescriptionData.freq1 !== freqValue && prescriptionData.ddlFreq === e.value) {
                    freqValue = prescriptionData.freq1;
                } else if (freqCodeList && freqCodeList[0])
                    freqValue = freqCodeList[0].code;
                this.setState({
                    frequencyItem: {
                        open: true,
                        value: e.value,
                        label: e.label
                    },
                    freqCodeList: freqCodeList
                });
            }
            prescriptionData.freq1 = freqValue;
            prescriptionData.freqId = e.freqId;
            prescriptionData.freqText = e.label;
            //auto set duration by freq
            moeUtilities.autoSetDurationByFreq(prescriptionData, e, this.props.codeList.duration_unit, prescriptionData.orderLineType);
        }
        prescriptionData[name] = e.value;
        // for (let i = 0; i < this.props.codeList.freq_code.length; i++) {
        //     if (this.props.codeList.freq_code[i].code === e.value) {
        //         prescriptionData.freqText = this.props.codeList.freq_code[i].engDesc;
        //     }
        // }
        prescriptionData.txtQty = '';

        moeUtilities.updateMultDoseFirstRow(prescriptionData, name, e.value);
        this.setState({ prescriptionData, showProceedBtn: null });
        // this.resetProceedBtn();
    }

    onSelectedDate = (e, name) => {
        let prescriptionData = { ...this.state.prescriptionData };
        if (moment(prescriptionData[name]).isSame(e)) return;
        prescriptionData[name] = e;
        if (name != 'txtStartFrom')
            prescriptionData.txtQty = '';
        this.setState({ prescriptionData });
        // let fields = { value: e, name: name };
        // this.updatePrescriptionField(fields);
        this.resetProceedBtn();
    }

    // handleDeleteDrug = () => {
    //     if (!this.state.prescriptionData.orderDetailId) {
    //         this.props.cancelClick(this.state.prescriptionData);
    //     } else if (this.state.isDeleteOrder) {
    //         this.showDeleteReamrk();
    //     }
    //     else {
    //         this.handelConfirmDelete();
    //     }
    // }

    // handelConfirmDelete = () => {
    //     let prescriptionData = { ...this.state.prescriptionData };
    //     prescriptionData.itemStatus = 'D';
    //     this.props.confirmDrug(prescriptionData, null, this.state.isDeleteOrder);
    //     this.handleDeleteDialog(false);
    // }
    // showDeleteReamrk = () => {
    //     this.handleDeleteDialog(false);
    //     this.props.showDeleteReamrk();
    // }
    handleDeleteDialog = () => {
        let prescriptionData = { ...this.state.prescriptionData };
        let isCache = prescriptionData.apiData && prescriptionData.apiData.isCache || prescriptionData.convertData && prescriptionData.convertData.isCache;
        let isDeleteOrder = false;
        let msgCode = MOE_MSG_CODE.DELETE_PRESCRIPTION_ITEM;
        if (isCache && this.props.drugList && this.props.drugList.length === 1) {
            isDeleteOrder = true;
            msgCode = MOE_MSG_CODE.DELETE_MOE_WITHOUT_ITEM;
        }
        // this.setState({
        //     showDeleteDialog: show,
        //     isDeleteOrder: isDeleteOrder
        // });
        this.props.openCommonMessage({
            msgCode: msgCode,
            btnActions: {
                btn1Click: () => {
                    if (!this.state.prescriptionData.orderDetailId) {
                        this.props.cancelClick(this.state.prescriptionData);
                    } else if (isDeleteOrder) {
                        this.props.showDeleteReamrk();
                    }
                    else {
                        let _prescriptionData = { ...this.state.prescriptionData };
                        _prescriptionData.itemStatus = 'D';
                        this.props.confirmDrug(_prescriptionData, null, isDeleteOrder);
                    }
                }
            }
        });
    }

    //Pre-submission processing, if not modified do not call the API
    handlePreConfirm = () => {
        if (!this.state.isCheckingTotalDosage) {
            this.setState({
                isDisabledConfirm: true
            }, () => {
                // this.props.openCommonCircular();
                const { drug } = this.props;
                const { prescriptionData } = this.state;

                // //Incomplete mandatory fields check for each drug
                // if (this.props.isFromTabs) {
                //     if (this.props.tabsCallback && typeof (this.props.tabsCallback) === 'function')
                //         this.props.tabsCallback(prescriptionData);
                //     return;
                // }

                if (prescriptionData.orderDetailId && commonUtilities.CompareJSON(drug, prescriptionData)) {
                    this.props.cancelClick(prescriptionData);
                    // this.props.closeCommonCircular();
                    return false;
                }
                this.refs.form.submit();
                // this.handleConfirm();
            });
        }
    }
    handleConfirm = (e, isProceed) => {
        this.setState({
            isDisabledConfirm: false
        }, () => {
            //Incomplete mandatory fields check for each drug
            const { prescriptionData } = this.state;
            if (this.props.isFromTabs) {
                if (this.props.tabsCallback && typeof (this.props.tabsCallback) === 'function')
                    this.props.tabsCallback(prescriptionData, isProceed);
                return;
            }
            this.props.confirmDrug(this.state.prescriptionData, true);
        });
        return;
    }

    //Frequency
    closeFrequencyDialog = (name, value) => {
        let fields = { value: value, name: name };
        this.updatePrescriptionField(fields);
        this.setState({ frequencyItem: null, freqCodeList: [] });
        this.handleOnBlurChange();
    }

    showAdvanced = (isShowAdvanced, isMul) => {
        let prescriptionData = { ...this.state.prescriptionData };
        const orderLineType = isShowAdvanced ? ORDER_LINE_TYPE.ADVANCED : ORDER_LINE_TYPE.NORMAL;
        //reset duration num if click btn 'baic' in special interval module
        // if (prescriptionData.specialInterval) {
        //     if (!(prescriptionData.ddlDurationUnit === 'd' || prescriptionData.ddlDurationUnit === 'w')) {
        //         prescriptionData.txtDuration = '';
        //         prescriptionData.ddlDurationUnit = '';
        //     }
        // }
        if (prescriptionData.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
            const freqOption = moeUtilities.getFreqOption(prescriptionData, this.props.codeList.freq_code);
            if (freqOption)
                moeUtilities.autoSetDurationByFreq(prescriptionData, freqOption, this.props.codeList.duration_unit, orderLineType);
        }
        //end reset duration num if click btn 'baic' in special interval module
        prescriptionData.moeMedMultDoses = [];
        // prescriptionData.multipleLine = [];
        // prescriptionData.stepUpDown = [];
        prescriptionData.specialInterval = null;
        prescriptionData.isShowAdvanced = isShowAdvanced;
        prescriptionData.orderLineType = orderLineType;
        prescriptionData.txtQty = '';

        if (this.props.showDetail && !prescriptionData.isShowAdvanced) {
            let { errorMessageList } = this.props;
            let error = errorMessageList.filter(item => {
                if (item.otherName && (item.otherName.indexOf('multipleLine') === -1 || item.otherName.indexOf('stepUpDown') === -1)) {
                    return null;
                }
                return item;
            });
            this.props.updateState('errorMessageList', error);
        }
        // 2020-1-10 malcolm reset Site value and recacular drug dose if current drug were dangerDrug when click 'basic' btn
        if (!isShowAdvanced) {
            prescriptionData.ddlSite = '';
            prescriptionData.ddlPrep = '';
            prescriptionData.txtStartFrom = null;
            prescriptionData.isShowAdvanced = false;
        } else if (!isMul) {
            if (!prescriptionData.txtStartFrom)
                prescriptionData.txtStartFrom = moment(this.props.backDate ? this.props.backDate : new Date(), Enum.DATE_FORMAT_EYMD_VALUE).valueOf();
            let convertData = prescriptionData.convertData;
            let prep = prescriptionUtilities.getPrepForUI(convertData);
            prescriptionData.ddlPrep = prep.ddlPrep;
            // prescriptionData.ddlPrepCodeList = prep.ddlPrepCodeList;
        }
        // end reset Site value and recacular drug dose if current drug were dangerDrug when click 'basic' btn

        this.setState({
            disabledBtn: false,
            showMultipleLine: false,
            showStepUpDown: false,
            isShowSpecialInterval: false,
            prescriptionData: prescriptionData
        }, () => {
            let data = _.cloneDeep(this.state.prescriptionData);
            if (data.dangerDrug && data.dangerDrug === 'Y') {
                let params = {
                    duration: data.txtDuration,
                    durationUnit: data.ddlDurationUnit,
                    freq1: data.freq1,
                    freqCode: data.ddlFreq,
                    moeEhrMedProfile: {
                        orderLineType: data.orderLineType || ORDER_LINE_TYPE.NORMAL,
                        siteId: data.ddlSite || null
                    },
                    moeMedMultDoses: [{
                        multDoseNo: 1,
                        duration: data.txtDuration,
                        durationUnit: data.ddlDurationUnit,
                        freq1: data.freq1,
                        freqCode: data.ddlFreq
                    }]
                };
                this.props.getTotalDangerDrug(params,
                    () => {
                        data.txtDangerDrugQty = this.props.maxDosage[0].maxDosage;
                        this.setState({
                            prescriptionData: data
                        });
                    }
                );
            }
        });
    }

    handleAddMulDoses = (orderLineType, multDoseNo) => {
        let prescriptionData = { ...this.state.prescriptionData };
        prescriptionData.txtQty = '';
        if (!prescriptionData.moeMedMultDoses
            || prescriptionData.moeMedMultDoses.length == 0
        ) {
            prescriptionData.orderLineType = orderLineType;
            if (multDoseNo)
                moeUtilities.addRowToMultDoses(prescriptionData, 1, this.state.defaultDurationUnit);
        }
        let updateState = {
            disabledBtn: true,
            showMultipleLine: orderLineType == ORDER_LINE_TYPE.MULTIPLE_LINE ? true : false,
            showStepUpDown: orderLineType == ORDER_LINE_TYPE.STEP_UP_AND_DOWN ? true : false
        };
        if (multDoseNo) {
            multDoseNo += 1;
            moeUtilities.addRowToMultDoses(prescriptionData, multDoseNo, this.state.defaultDurationUnit);
        }

        updateState.prescriptionData = prescriptionData;
        this.setState(updateState);
    }
    handleDeleteMulDosesRow = (index) => {
        let prescriptionData = { ...this.state.prescriptionData };
        prescriptionData.moeMedMultDoses.splice(index, 1);
        if (prescriptionData.moeMedMultDoses.length === 1) {
            // prescriptionData.moeMedMultDoses = [];
            this.showAdvanced(true, true);
            return;
        }
        this.setState({
            prescriptionData: prescriptionData
        });
    }

    // handleBtnMultipleLine = () => {
    //     // this.refs.form.resetValidations();
    //     // this.props.updateState('errorMessageList', []);
    //     let { multipleLine } = { ...this.state.prescriptionData };
    //     let prescriptionData = { ...this.state.prescriptionData };
    //     prescriptionData.txtQty = '';
    //     if (!multipleLine) multipleLine = [];
    //     if (multipleLine.length === 0) {
    //         multipleLine = this.handleAddMultipleLine(0);
    //     }
    //     if (multipleLine.length === 1) {
    //         let arryMulti = { multDoseNo: 2, txtDosage: '', ddlFreq: '', freq1: 0, frequencyItem: '', txtDangerDrugQty: '' };
    //         prescriptionData.orderLineType = ORDER_LINE_TYPE.MULTIPLE_LINE;
    //         multipleLine.push(arryMulti);
    //         multipleLine[0].txtDangerDrugQty = this.state.prescriptionData.txtDangerDrugQty;
    //         prescriptionData.multipleLine = multipleLine;
    //         this.setState({
    //             disabledBtn: true,
    //             showMultipleLine: true,
    //             prescriptionData: prescriptionData
    //         });
    //     } else {
    //         this.setState({
    //             disabledBtn: true,
    //             showMultipleLine: true
    //         });
    //     }
    // }
    // handleBtnStepUpDown = () => {
    //     // this.refs.form.resetValidations();
    //     // this.props.updateState('errorMessageList', []);
    //     let { stepUpDown } = { ...this.state.prescriptionData };
    //     let prescriptionData = { ...this.state.prescriptionData };
    //     prescriptionData.txtQty = '';
    //     if (!stepUpDown) stepUpDown = [];
    //     if (stepUpDown.length === 0) {
    //         stepUpDown = this.handleAddStepUpDown(0);
    //     }
    //     if (stepUpDown.length === 1) {
    //         let arryMulti = { multDoseNo: 2, txtDosage: '', ddlFreq: '', chkPRN: 'N', txtDuration: '', ddlDurationUnit: this.state.defaultDurationUnit, freq1: 0, frequencyItem: '', txtDangerDrugQty: '' };
    //         prescriptionData.orderLineType = ORDER_LINE_TYPE.STEP_UP_AND_DOWN;
    //         stepUpDown.push(arryMulti);
    //         stepUpDown[0].txtDangerDrugQty = this.state.prescriptionData.txtDangerDrugQty;
    //         prescriptionData.stepUpDown = stepUpDown;
    //         this.setState({
    //             disabledBtn: true,
    //             showStepUpDown: true,
    //             prescriptionData: prescriptionData
    //         });
    //     } else {
    //         this.setState({
    //             disabledBtn: true,
    //             showStepUpDown: true
    //         });
    //     }
    // }
    // handleAddStepUpDown = (multDoseNo) => {
    //     let { stepUpDown } = { ...this.state.prescriptionData };
    //     if (!stepUpDown) stepUpDown = [];
    //     let arryMulti = { multDoseNo: multDoseNo + 1, txtDosage: '', ddlFreq: '', chkPRN: 'N', txtDuration: '', ddlDurationUnit: this.state.defaultDurationUnit, freq1: 0, frequencyItem: '', txtDangerDrugQty: '' };
    //     stepUpDown.push(arryMulti);
    //     let fields = { value: stepUpDown, name: 'stepUpDown' };
    //     this.updatePrescriptionField(fields);
    //     return stepUpDown;
    // }

    // handleAddMultipleLine = (multDoseNo) => {
    //     let { multipleLine } = { ...this.state.prescriptionData };
    //     if (!multipleLine) multipleLine = [];
    //     let arryMulti = { multDoseNo: multDoseNo + 1, txtDosage: '', ddlFreq: '', freq1: 0, frequencyItem: '', txtDangerDrugQty: '' };
    //     multipleLine.push(arryMulti);
    //     let fields = { value: multipleLine, name: 'multipleLine' };
    //     this.updatePrescriptionField(fields);
    //     return multipleLine;
    // }

    // //update by Demi on 20191226 start
    // handleDeleteMultipleLine = (index) => {
    //     let panelName = '';
    //     let panelContainer = '';
    //     // let updateField = '';

    //     const { prescriptionData } = this.state;

    //     if (this.state.showMultipleLine) {
    //         panelName = 'multipleLine';
    //         panelContainer = prescriptionData.multipleLine;
    //         // updateField = prescriptionData.multipleLine;
    //     }
    //     else if (this.state.showStepUpDown) {
    //         panelName = 'stepUpDown';
    //         panelContainer = prescriptionData.stepUpDown;
    //         // updateField = prescriptionData.stepUpDown;
    //     }
    //     panelContainer.splice(index, 1);

    //     if (prescriptionData[panelName].length === 1) {
    //         panelContainer = [];
    //         // updateField = [];
    //     }

    //     let fields = { value: panelContainer, name: panelName };
    //     this.updatePrescriptionField(fields);

    //     // if (updateField.length === 0) {
    //     if (panelContainer.length === 0) {
    //         this.showAdvanced(true, true);
    //     }
    // }
    // //update by Demi on 20191226 end

    //proceed save
    resetProceedBtn = () => {
        this.setState({ showProceedBtn: null });
    }
    handleSubmitError = (errors) => {
        let showProceedBtn;
        let routeError = errors && errors.find(item => item.props.name === 'ddlRoute');
        if (routeError) {
            showProceedBtn = false;
        } else {
            const { errorMessageList } = this.props;
            if (errorMessageList) {
                let requiredList = errorMessageList.filter(item => item.errMsg.indexOf('required') !== -1);
                if (requiredList && requiredList.length > 0 && requiredList.length === errorMessageList.length) {
                    showProceedBtn = true;
                } else {
                    showProceedBtn = false;
                }
            } else {
                showProceedBtn = false;
            }
        }
        this.props.closeCommonCircular();
        this.setState({ showProceedBtn, isDisabledConfirm: false });
    }
    handleProceedSave = (e, isSave) => {
        this.setState({
            // openProceedSaveDialog: false,
            // errorLabelList: []
            showProceedBtn: false,
            isDisabledConfirm: true
        }, () => {
            if (isSave)
                this.handleConfirm(e, true);
        });
    }

    //special interval
    handleBtnSpecialInterval = () => {
        // this.refs.form.resetValidations();
        // this.props.updateState('errorMessageList', []);
        let { specialInterval } = { ...this.state.prescriptionData };
        if (!specialInterval) specialInterval = null;
        if (specialInterval === null) {
            this.handleAddSpecialInterval();
        }
        this.setState({
            disabledBtn: true,
            isShowSpecialInterval: true
        });
    }
    handleBtnPopUpSpecialinterval = () => {
        // let prescriptionData = { ...this.state.prescriptionData };
        // let SPData = prescriptionData.specialInterval;
        this.setState({
            // SPData: _.cloneDeep(SPData),
            isPopUpSpecialInterval: true
        });
    }
    handleAddSpecialInterval = () => {
        // let { specialInterval } = { ...this.state.prescriptionData };
        // if (!specialInterval) specialInterval = null;
        let prescriptionData = { ...this.state.prescriptionData };
        let arrySpecialInterval = {
            regimen: 'D',
            supFreq1: null,
            supFreq2: null,
            supFreqCode: '',
            dayOfWeek: null,
            supFreqText: [],
            supplFreqId: null,
            cycleMultiplier: '28',
            txtDosage: '',
            ddlFreq: '',
            freqText: '',
            freq1: '',
            txtDangerDrugQty: ''
        };
        //specialInterval= arrySpecialInterval;
        prescriptionData.specialInterval = arrySpecialInterval;
        // prescriptionData.orderLineType = ORDER_LINE_TYPE.SPECIAL_INTERVAL;
        // let fields = { value: specialInterval, name: 'specialInterval' };
        // this.updatePrescriptionField(fields);
        // let SPData = specialInterval;
        this.setState({
            // SPData: _.cloneDeep(SPData),
            prescriptionData: prescriptionData,
            isPopUpSpecialInterval: true
        });
    }

    handleCancelSpecInter = () => {
        let { prescriptionData } = this.state;
        // prescriptionData.specialInterval = SPData;
        if (prescriptionData.specialInterval && !prescriptionData.specialInterval.supplFreqId) {
            this.handleDeleteSpecialInterval();
        }
        this.setState({
            // prescriptionData: prescriptionData,
            // SPData: null,
            isPopUpSpecialInterval: false
        });
    }

    handleSpecialIntervalConfirm = (specialIntervalData, isCountDose) => {
        let getThis = this;
        let prescriptionData = { ...this.state.prescriptionData };

        if (!isCountDose) {
            if (commonUtilities.CompareJSON(specialIntervalData, prescriptionData.specialInterval)) {
                this.setState({
                    isPopUpSpecialInterval: false
                });
                return;
            }
            prescriptionData.txtQty = '';
        }

        //get special interval text
        prescriptionData.orderLineType = ORDER_LINE_TYPE.SPECIAL_INTERVAL;
        if (specialIntervalData && specialIntervalData.supplFreqId) {
            const regimen_type = this.props.codeList.regimen_type[0];
            let supplFreqEng = '';
            for (let i = 0; i < regimen_type[specialIntervalData.regimen].length; i++) {
                if (parseInt(regimen_type[specialIntervalData.regimen][i].supplFreqId) === parseInt(specialIntervalData.supplFreqId)) {
                    supplFreqEng = regimen_type[specialIntervalData.regimen][i].supplFreqEng;
                }
            }
            specialIntervalData.supFreqCode = supplFreqEng;
            let freqCode = [prescriptionData.ddlFreq || null];
            if (specialIntervalData.regimen === 'D' && specialIntervalData.supplFreqId === 2) {
                freqCode.push(specialIntervalData.ddlFreq || null);
            }
            let params = {
                dayOfWeek: specialIntervalData.dayOfWeek,
                freqCode: freqCode,
                regimen: specialIntervalData.regimen,
                supFreq1: specialIntervalData.supFreq1,
                supFreq2: specialIntervalData.supFreq2,
                cycleMultiplier: specialIntervalData.regimen === 'C' ? specialIntervalData.cycleMultiplier : '',
                supFreqCode: specialIntervalData.supFreqCode
            };
            //clear duration
            if (specialIntervalData.regimen.toLowerCase() !== prescriptionData.ddlDurationUnit) {
                prescriptionData.txtDuration = '';
            }
            // set duration unit && get dangerous dose
            let callBack = (specialIntervalText) => {
                prescriptionData.ddlDurationUnit = specialIntervalData.regimen.toLowerCase();
                specialIntervalData.specialIntervalText = specialIntervalText && specialIntervalText.specialIntervalText;
                specialIntervalData.supFreqText = specialIntervalText && specialIntervalText.inputBoxSpecialIntervalText;
                specialIntervalData.displayWithFreq = specialIntervalText && specialIntervalText.displayWithFreq;
                prescriptionData.specialInterval = specialIntervalData;
                if (prescriptionData.dangerDrug === 'Y')
                    // get dose
                    this.setDangerDose(prescriptionData);
                else
                    getThis.setState({ prescriptionData: prescriptionData, isPopUpSpecialInterval: false });
            };
            getThis.props.getSpecialIntervalText(params, callBack);
        }
    }

    setDangerDose = (prescriptionData) => {
        let specialIntervalData = prescriptionData.specialInterval;
        let params = {
            duration: prescriptionData.txtDuration,
            durationUnit: prescriptionData.ddlDurationUnit,
            freq1: prescriptionData.freq1,
            freqCode: prescriptionData.ddlFreq,
            supFreqCode: specialIntervalData.supFreqCode,
            supplFreqId: specialIntervalData.supplFreqId,
            supFreq1: specialIntervalData.supFreq1,
            supFreq2: specialIntervalData.supFreq2,
            regimen: specialIntervalData.regimen,
            dayOfWeek: specialIntervalData.dayOfWeek || null,
            moeEhrMedProfile: {
                orderLineType: prescriptionData.orderLineType || ORDER_LINE_TYPE.SPECIAL_INTERVAL,
                siteId: prescriptionData.ddlSite || null,
                supplFreqId: specialIntervalData.supplFreqId,
                cycleMultiplier: specialIntervalData.cycleMultiplier
            },
            moeMedMultDoses: [
                {
                    freq1: prescriptionData.freq1,
                    freqCode: prescriptionData.ddlFreq,
                    multDoseNo: 1,
                    moeEhrMedMultDose: {
                        supplFreqId: specialIntervalData.supplFreqId
                    }

                },
                {
                    freq1: specialIntervalData.freq1,
                    // freqCode: specialIntervalData.ddlFreq,
                    freqCode: specialIntervalData.ddlFreq || 'nocte', // 2020-1-9 by malcolm fix bug :Special interval error when select on odd/even days item of dangerDrug
                    multDoseNo: 2,
                    moeEhrMedMultDose: {
                        supplFreqId: specialIntervalData.supplFreqId
                    }
                }
            ]
        };
        if (prescriptionData.ddlFreq && this.isIntNum(prescriptionData.txtDuration) && prescriptionData.ddlDurationUnit) {
            this.props.getTotalDangerDrug(params,
                () => {
                    prescriptionData.txtDangerDrugQty = this.props.maxDosage[0].maxDosage;
                    if (this.props.maxDosage.length === 2) {
                        prescriptionData.specialInterval.txtDangerDrugQty = this.props.maxDosage[1].maxDosage;
                    }
                    this.setState({
                        prescriptionData: prescriptionData,
                        isPopUpSpecialInterval: false
                    });
                });
        } else if (!prescriptionData.ddlFreq || !prescriptionData.txtDuration || !prescriptionData.ddlDurationUnit) {
            prescriptionData.txtDangerDrugQty = '';
            prescriptionData.specialInterval.txtDangerDrugQty = '';
            this.setState({
                prescriptionData: prescriptionData,
                isPopUpSpecialInterval: false
            });
        }
    }

    handleDeleteSpecialInterval = () => {
        this.showAdvanced(true, true);
    }
    handleSpecialIntervalChange = (e) => {
        let prescriptionData = { ...this.state.prescriptionData };
        if (prescriptionData.specialInterval[e.target.name] == e.target.value) return;
        prescriptionData.specialInterval[e.target.name] = e.target.value;
        prescriptionData.txtQty = '';
        this.setState({
            prescriptionData
        });
    }
    handleSpecialIntervalSelectChange = (e, name) => {
        let prescriptionData = { ...this.state.prescriptionData };
        if (prescriptionData.specialInterval == e.value) return;
        if (name === 'ddlFreq') {
            let freqValue = 0;
            if (e.useInputValue === 'Y') {
                const freqCodeList = prescriptionUtilities.getFreqCodeList(e.label);
                if (prescriptionData.specialInterval.freq1 && prescriptionData.specialInterval.freq1 !== freqValue && prescriptionData.specialInterval.ddlFreq === e.value) {
                    freqValue = prescriptionData.specialInterval.freq1;
                } else if (freqCodeList && freqCodeList[0])
                    freqValue = freqCodeList[0].code;
                this.setState({
                    frequencyItem: {
                        open: true,
                        value: e.value,
                        label: e.label,
                        type: 'R'
                    },
                    freqCodeList: freqCodeList
                });
            }
            prescriptionData.specialInterval.freq1 = freqValue;
        }
        prescriptionData.specialInterval.ddlFreq = e.value;
        for (let i = 0; i < this.props.codeList.freq_code.length; i++) {
            if (this.props.codeList.freq_code[i].code === e.value) {
                prescriptionData.specialInterval.freqText = this.props.codeList.freq_code[i].engDesc;
            }
        }
        prescriptionData.txtQty = '';
        this.setState({
            prescriptionData
        });
    }
    //add to my favourite

    //calculate max danger dose
    handleFocusDose = (item, lineIndex) => {
        const regex = new RegExp(CommonRegex.VALIDATION_REGEX_POSITIVE_INTEGER);
        if (regex.test(item.txtDangerDrugQty)) {
            let prescriptionData = { ...this.state.prescriptionData };
            if (prescriptionData.orderLineType === ORDER_LINE_TYPE.NORMAL) {
                prescriptionData.lastDoseVal = item.txtDangerDrugQty;
            } else {
                if (lineIndex) {
                    if (prescriptionData.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE
                        || prescriptionData.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
                        prescriptionData.moeMedMultDoses[lineIndex].lastDoseVal = item.txtDangerDrugQty;
                    }
                    // if (prescriptionData.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE) {
                    //     prescriptionData.multipleLine[lineIndex].lastDoseVal = item.txtDangerDrugQty;
                    // } else if (prescriptionData.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
                    //     prescriptionData.stepUpDown[lineIndex].lastDoseVal = item.txtDangerDrugQty;
                    // }
                    else if (prescriptionData.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
                        prescriptionData.specialInterval.lastDoseVal = item.txtDangerDrugQty;
                    }
                } else {
                    prescriptionData.lastDoseVal = item.txtDangerDrugQty;
                }
                // if (prescriptionData.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE) {
                //     prescriptionData.multipleLine[lineIndex].lastDoseVal = item.txtDangerDrugQty;
                // } else if (prescriptionData.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN && lineIndex) {
                //     prescriptionData.stepUpDown[lineIndex].lastDoseVal = item.txtDangerDrugQty;
                // } else if (prescriptionData.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
                //     if (!lineIndex)
                //         prescriptionData.lastDoseVal = item.txtDangerDrugQty;
                //     else if (lineIndex)
                //         prescriptionData.specialInterval.lastDoseVal = item.txtDangerDrugQty;
                // }
            }
            this.setState({
                // doseFocusVal: item.txtDangerDrugQty
                prescriptionData: prescriptionData
            });
        }
    }

    handleChangeDose = (lineId, curDose) => {
        let prescriptionData = { ...this.state.prescriptionData };

        if (prescriptionData.dangerDrug !== 'Y' || this.state.isCheckingTotalDosage) return;
        const { params, curItem } = moeUtilities.getParamsForDose(lineId, prescriptionData);

        const oldDose = curItem.lastDoseVal;
        if (oldDose == curDose) return;

        const totalMaxDosage = (_curItem, _arrayName, _index, callApiCondition, emptyDose) => {
            let field;
            if (_arrayName && _index)
                field = [_arrayName][_index];
            if (_arrayName)
                field = [_arrayName];
            if (callApiCondition) {
                this.props.getTotalDangerDrug(params,
                    () => {
                        if (_curItem.txtDangerDrugQty
                            && (
                                (oldDose && parseInt(this.props.maxDosage[0].maxDosage) >= parseInt(_curItem.txtDangerDrugQty))
                                || (!oldDose && parseInt(this.props.maxDosage[0].maxDosage) > parseInt(_curItem.txtDangerDrugQty))
                            )
                        ) {
                            this.setState({
                                isCheckingTotalDosage: true
                            }, () => {
                                this.props.openCommonMessage({
                                    msgCode: MOE_MSG_CODE.AMEND_DOSE,
                                    btnActions: {
                                        btn1Click: () => {
                                            this.preConfirmInEditDoes();
                                        },
                                        btn2Click: () => {
                                            this.emptyDose(emptyDose);
                                        }
                                    }
                                });
                            });
                        } else if (_curItem.txtDangerDrugQty
                            && parseInt(this.props.maxDosage[0].maxDosage) < parseInt(_curItem.txtDangerDrugQty)
                        ) {
                            this.setState({
                                isCheckingTotalDosage: true
                            }, () => {
                                this.props.openCommonMessage({
                                    msgCode: MOE_MSG_CODE.GREATHER_THAN_MAX_DOSAGE,
                                    params: [
                                        {
                                            name: 'TOTAL_DOSE',
                                            value: (this.props.maxDosage && emptyDose ?
                                                emptyDose.substr(0, 1) === ORDER_LINE_TYPE.SPECIAL_INTERVAL && emptyDose.substr(1, 1) === '2' ?
                                                    this.props.maxDosage[1].maxDosage
                                                    : this.props.maxDosage[0].maxDosage
                                                : '')
                                        }
                                    ],
                                    btnActions: {
                                        btn1Click: () => {
                                            this.emptyDose(emptyDose);
                                        }
                                    }
                                });
                            });
                        }
                    });
                return;
            }

            if (field)
                prescriptionData[field].txtDangerDrugQty = '';
            else {
                prescriptionData.txtDangerDrugQty = '';
            }
            this.setState({
                prescriptionData
            });

        };
        switch (prescriptionData.orderLineType) {
            case ORDER_LINE_TYPE.MULTIPLE_LINE && lineId:
            case ORDER_LINE_TYPE.STEP_UP_AND_DOWN && lineId:
                if (this.isIntNum(curItem.txtDangerDrugQty) && oldDose !== parseInt(curItem.txtDangerDrugQty)) {
                    const condition = curItem.ddlFreq && curItem.txtDuration && curItem.ddlDurationUnit;
                    totalMaxDosage(curItem, 'moeMedMultDoses', lineId, condition, prescriptionData.orderLineType + lineId);
                }
                break;
            case ORDER_LINE_TYPE.SPECIAL_INTERVAL:
                if (lineId
                    && this.isIntNum(curItem.txtDangerDrugQty)
                    && oldDose !== parseInt(curItem.txtDangerDrugQty)
                ) {
                    const condition = curItem.ddlFreq && prescriptionData.txtDuration;
                    totalMaxDosage(curItem, 'specialInterval', null, condition, ORDER_LINE_TYPE.SPECIAL_INTERVAL + '2');
                } else if (!lineId
                    && oldDose
                    && this.isIntNum(curItem.txtDangerDrugQty)
                    && oldDose !== parseInt(curItem.txtDangerDrugQty)
                ) {
                    const condition = curItem.ddlFreq && curItem.txtDuration && curItem.ddlDurationUnit;
                    totalMaxDosage(curItem, null, null, condition, ORDER_LINE_TYPE.SPECIAL_INTERVAL + '1');
                }
                break;
            default: {
                const condition = oldDose !== parseInt(curItem.txtDangerDrugQty) && curItem.ddlFreq && curItem.txtDuration && curItem.ddlDurationUnit;
                totalMaxDosage(curItem, null, null, condition, ORDER_LINE_TYPE.NORMAL);
                break;
            }
        }
    }
    // handleChangeDose = (lineId, curDose) => {
    //     let prescriptionData = { ...this.state.prescriptionData };

    //     if (prescriptionData.dangerDrug !== 'Y' || this.state.isCheckingTotalDosage) return;

    //     if (prescriptionData.dangerDrug === 'Y' && !this.state.isCheckingTotalDosage) {
    //         if (prescriptionData.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE) {
    //             if (lineId) {
    //                 let item = prescriptionData.multipleLine[lineId];
    //                 let params = {
    //                     duration: prescriptionData.txtDuration,
    //                     durationUnit: prescriptionData.ddlDurationUnit,
    //                     freq1: item.freq1,
    //                     freqCode: item.ddlFreq,
    //                     moeEhrMedProfile: {
    //                         orderLineType: prescriptionData.orderLineType,
    //                         siteId: prescriptionData.ddlSite || null
    //                     },
    //                     moeMedMultDoses: [{
    //                         multDoseNo: 1,
    //                         duration: prescriptionData.txtDuration,
    //                         durationUnit: prescriptionData.ddlDurationUnit,
    //                         freq1: item.freq1,
    //                         freqCode: item.ddlFreq
    //                     }]
    //                 };
    //                 const oldDose = item.lastDoseVal;
    //                 if (oldDose == curDose) return;
    //                 // const oldDose = this.state.doseFocusVal;
    //                 //const oldDose = this.props.drug.multipleLine && this.props.drug.multipleLine[lineId] && this.props.drug.multipleLine[lineId].txtDangerDrugQty;
    //                 if (this.isIntNum(item.txtDangerDrugQty) && oldDose !== parseInt(item.txtDangerDrugQty)) {
    //                     if (item.ddlFreq && prescriptionData.txtDuration && prescriptionData.ddlDurationUnit) {
    //                         this.props.getTotalDangerDrug(params,
    //                             () => {
    //                                 if (prescriptionData.multipleLine[lineId].txtDangerDrugQty
    //                                     && (
    //                                         (oldDose && parseInt(this.props.maxDosage[0].maxDosage) >= parseInt(prescriptionData.multipleLine[lineId].txtDangerDrugQty))
    //                                         || (!oldDose && parseInt(this.props.maxDosage[0].maxDosage) > parseInt(prescriptionData.multipleLine[lineId].txtDangerDrugQty))
    //                                     )
    //                                 ) {
    //                                     this.setState({
    //                                         // isPopUpAmendedDose: true,
    //                                         isCheckingTotalDosage: true
    //                                         // emptyDose: ORDER_LINE_TYPE.MULTIPLE_LINE + lineId
    //                                     }, () => {
    //                                         const emptyDose = ORDER_LINE_TYPE.MULTIPLE_LINE + lineId;
    //                                         this.props.openCommonMessage({
    //                                             msgCode: MOE_MSG_CODE.AMEND_DOSE,
    //                                             btnActions: {
    //                                                 btn1Click: () => {
    //                                                     this.preConfirmInEditDoes();
    //                                                 },
    //                                                 btn2Click: () => {
    //                                                     this.emptyDose(emptyDose);
    //                                                 }
    //                                             }
    //                                         });
    //                                     });

    //                                 } else if (prescriptionData.multipleLine[lineId].txtDangerDrugQty && parseInt(this.props.maxDosage[0].maxDosage) < parseInt(prescriptionData.multipleLine[lineId].txtDangerDrugQty)) {
    //                                     this.setState({
    //                                         // isPopupGreaterThanMaxDosage: true,
    //                                         isCheckingTotalDosage: true
    //                                         // emptyDose: ORDER_LINE_TYPE.MULTIPLE_LINE + lineId
    //                                     }, () => {
    //                                         const emptyDose = ORDER_LINE_TYPE.MULTIPLE_LINE + lineId;
    //                                         this.props.openCommonMessage({
    //                                             msgCode: MOE_MSG_CODE.GREATHER_THAN_MAX_DOSAGE,
    //                                             params: [
    //                                                 {
    //                                                     name: 'TOTAL_DOSE',
    //                                                     value: (this.props.maxDosage && emptyDose ?
    //                                                         emptyDose.substr(0, 1) === ORDER_LINE_TYPE.SPECIAL_INTERVAL && emptyDose.substr(1, 1) === '2' ?
    //                                                             this.props.maxDosage[1].maxDosage
    //                                                             : this.props.maxDosage[0].maxDosage
    //                                                         : '')
    //                                                 }
    //                                             ],
    //                                             btnActions: {
    //                                                 btn1Click: () => {
    //                                                     this.emptyDose(emptyDose);
    //                                                 }
    //                                             }
    //                                         });
    //                                     });
    //                                 }
    //                             });
    //                     } else {
    //                         prescriptionData.multipleLine[lineId].txtDangerDrugQty = '';
    //                         this.setState({
    //                             prescriptionData
    //                         });
    //                     }
    //                 }
    //             }
    //             else {
    //                 this.checkNormalDose(prescriptionData);
    //             }
    //         } else if (prescriptionData.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
    //             if (lineId) {
    //                 let item = prescriptionData.stepUpDown[lineId];
    //                 let params = {
    //                     duration: item.txtDuration,
    //                     durationUnit: item.ddlDurationUnit,
    //                     freq1: item.freq1,
    //                     freqCode: item.ddlFreq,
    //                     moeEhrMedProfile: {
    //                         orderLineType: prescriptionData.orderLineType,
    //                         siteId: prescriptionData.ddlSite || null
    //                     },
    //                     moeMedMultDoses: [{
    //                         multDoseNo: 1,
    //                         duration: item.txtDuration,
    //                         durationUnit: item.ddlDurationUnit,
    //                         freq1: item.freq1,
    //                         freqCode: item.ddlFreq
    //                     }]
    //                 };
    //                 // const oldDose = this.state.doseFocusVal;
    //                 const oldDose = item.lastDoseVal;
    //                 if (oldDose == curDose) return;
    //                 //const oldDose = this.props.drug.stepUpDown && this.props.drug.stepUpDown[lineId] && this.props.drug.stepUpDown[lineId].txtDangerDrugQty;
    //                 if (this.isIntNum(item.txtDangerDrugQty) && oldDose !== parseInt(item.txtDangerDrugQty)) {
    //                     if (item.ddlFreq && item.txtDuration && item.ddlDurationUnit) {
    //                         this.props.getTotalDangerDrug(params,
    //                             () => {
    //                                 if (prescriptionData.stepUpDown[lineId].txtDangerDrugQty
    //                                     && (
    //                                         (oldDose && parseInt(this.props.maxDosage[0].maxDosage) >= parseInt(prescriptionData.stepUpDown[lineId].txtDangerDrugQty))
    //                                         || (!oldDose && parseInt(this.props.maxDosage[0].maxDosage) > parseInt(prescriptionData.stepUpDown[lineId].txtDangerDrugQty))
    //                                     )
    //                                 ) {
    //                                     this.setState({
    //                                         // isPopUpAmendedDose: true,
    //                                         isCheckingTotalDosage: true
    //                                         // emptyDose: ORDER_LINE_TYPE.STEP_UP_AND_DOWN + lineId
    //                                     }, () => {
    //                                         const emptyDose = ORDER_LINE_TYPE.STEP_UP_AND_DOWN + lineId;
    //                                         this.props.openCommonMessage({
    //                                             msgCode: MOE_MSG_CODE.AMEND_DOSE,
    //                                             btnActions: {
    //                                                 btn1Click: () => {
    //                                                     this.preConfirmInEditDoes();
    //                                                 },
    //                                                 btn2Click: () => {
    //                                                     this.emptyDose(emptyDose);
    //                                                 }
    //                                             }
    //                                         });
    //                                     });
    //                                 } else if (prescriptionData.stepUpDown[lineId].txtDangerDrugQty
    //                                     && parseInt(this.props.maxDosage[0].maxDosage) < parseInt(prescriptionData.stepUpDown[lineId].txtDangerDrugQty)
    //                                 ) {
    //                                     this.setState({
    //                                         // isPopupGreaterThanMaxDosage: true,
    //                                         isCheckingTotalDosage: true
    //                                         // emptyDose: ORDER_LINE_TYPE.STEP_UP_AND_DOWN + lineId
    //                                     }, () => {
    //                                         const emptyDose = ORDER_LINE_TYPE.MULTIPLE_LINE + lineId;
    //                                         this.props.openCommonMessage({
    //                                             msgCode: MOE_MSG_CODE.GREATHER_THAN_MAX_DOSAGE,
    //                                             params: [
    //                                                 {
    //                                                     name: 'TOTAL_DOSE',
    //                                                     value: (this.props.maxDosage && emptyDose ?
    //                                                         emptyDose.substr(0, 1) === ORDER_LINE_TYPE.SPECIAL_INTERVAL && emptyDose.substr(1, 1) === '2' ?
    //                                                             this.props.maxDosage[1].maxDosage
    //                                                             : this.props.maxDosage[0].maxDosage
    //                                                         : '')
    //                                                 }
    //                                             ],
    //                                             btnActions: {
    //                                                 btn1Click: () => {
    //                                                     this.emptyDose(emptyDose);
    //                                                 }
    //                                             }
    //                                         });
    //                                     });
    //                                 }
    //                             });
    //                     } else {
    //                         prescriptionData.stepUpDown[lineId].txtDangerDrugQty = '';
    //                         this.setState({
    //                             prescriptionData
    //                         });
    //                     }
    //                 }
    //             } else {
    //                 this.checkNormalDose(prescriptionData);
    //             }
    //         } else if (prescriptionData.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
    //             let _prescriptionData = { ...this.state.prescriptionData };
    //             let params = {
    //                 duration: _prescriptionData.txtDuration,
    //                 durationUnit: _prescriptionData.ddlDurationUnit,
    //                 freq1: _prescriptionData.freq1,
    //                 freqCode: _prescriptionData.ddlFreq,
    //                 supFreqCode: _prescriptionData.specialInterval.supFreqCode,
    //                 supplFreqId: _prescriptionData.specialInterval.supplFreqId,
    //                 supFreq1: _prescriptionData.specialInterval.supFreq1,
    //                 supFreq2: _prescriptionData.specialInterval.supFreq2,
    //                 regimen: _prescriptionData.specialInterval.regimen,
    //                 dayOfWeek: _prescriptionData.specialInterval.dayOfWeek || null,
    //                 moeEhrMedProfile: {
    //                     orderLineType: _prescriptionData.orderLineType || ORDER_LINE_TYPE.SPECIAL_INTERVAL,
    //                     siteId: _prescriptionData.ddlSite || null,
    //                     supplFreqId: _prescriptionData.specialInterval.supplFreqId,
    //                     cycleMultiplier: _prescriptionData.specialInterval.cycleMultiplier
    //                 },
    //                 moeMedMultDoses: [
    //                     {
    //                         freq1: _prescriptionData.freq1,
    //                         freqCode: _prescriptionData.ddlFreq,
    //                         multDoseNo: 1,
    //                         moeEhrMedMultDose: {
    //                             supplFreqId: _prescriptionData.specialInterval.supplFreqId
    //                         }

    //                     },
    //                     {
    //                         freq1: _prescriptionData.specialInterval.freq1,
    //                         freqCode: _prescriptionData.specialInterval.ddlFreq,
    //                         multDoseNo: 2,
    //                         moeEhrMedMultDose: {
    //                             supplFreqId: _prescriptionData.specialInterval.supplFreqId
    //                         }
    //                     }
    //                 ]
    //             };
    //             //const oldDose = this.props.drug.txtDangerDrugQty;
    //             // const oldDose = this.state.doseFocusVal;
    //             let oldDose = lineId ? _prescriptionData.specialInterval.lastDoseVal : _prescriptionData.lastDoseVal;
    //             if (oldDose == curDose) return;
    //             //...to do
    //             // const oldSecDose = this.props.drug.specialInterval && this.props.drug.specialInterval.txtDangerDrugQty;
    //             if (lineId
    //                 && this.isIntNum(_prescriptionData.specialInterval.txtDangerDrugQty)
    //                 && oldDose !== parseInt(_prescriptionData.specialInterval.txtDangerDrugQty)
    //             ) {
    //                 if (_prescriptionData.specialInterval
    //                     && _prescriptionData.specialInterval.ddlFreq
    //                     && _prescriptionData.txtDuration
    //                 ) {
    //                     this.props.getTotalDangerDrug(params, () => {
    //                         if (
    //                             (oldDose && parseInt(this.props.maxDosage[1].maxDosage) >= parseInt(_prescriptionData.specialInterval.txtDangerDrugQty))
    //                             || (!oldDose && parseInt(this.props.maxDosage[1].maxDosage) > parseInt(_prescriptionData.specialInterval.txtDangerDrugQty))
    //                         ) {
    //                             this.setState({
    //                                 // isPopUpAmendedDose: true,
    //                                 isCheckingTotalDosage: true
    //                                 // emptyDose: ORDER_LINE_TYPE.SPECIAL_INTERVAL + '2'
    //                             }, () => {
    //                                 const emptyDose = ORDER_LINE_TYPE.SPECIAL_INTERVAL + '2';
    //                                 this.props.openCommonMessage({
    //                                     msgCode: MOE_MSG_CODE.AMEND_DOSE,
    //                                     btnActions: {
    //                                         btn1Click: () => {
    //                                             this.preConfirmInEditDoes();
    //                                         },
    //                                         btn2Click: () => {
    //                                             this.emptyDose(emptyDose);
    //                                         }
    //                                     }
    //                                 });
    //                             });

    //                         }
    //                         else if (parseInt(this.props.maxDosage[1].maxDosage) < parseInt(_prescriptionData.specialInterval.txtDangerDrugQty)) {
    //                             this.setState({
    //                                 // isPopupGreaterThanMaxDosage: true,
    //                                 isCheckingTotalDosage: true
    //                                 // emptyDose: ORDER_LINE_TYPE.SPECIAL_INTERVAL + '2'
    //                             }, () => {
    //                                 const emptyDose = ORDER_LINE_TYPE.SPECIAL_INTERVAL + '2';
    //                                 this.props.openCommonMessage({
    //                                     msgCode: MOE_MSG_CODE.GREATHER_THAN_MAX_DOSAGE,
    //                                     params: [
    //                                         {
    //                                             name: 'TOTAL_DOSE',
    //                                             value: (this.props.maxDosage && emptyDose ?
    //                                                 emptyDose.substr(0, 1) === ORDER_LINE_TYPE.SPECIAL_INTERVAL && emptyDose.substr(1, 1) === '2' ?
    //                                                     this.props.maxDosage[1].maxDosage
    //                                                     : this.props.maxDosage[0].maxDosage
    //                                                 : '')
    //                                         }
    //                                     ],
    //                                     btnActions: {
    //                                         btn1Click: () => {
    //                                             this.emptyDose(emptyDose);
    //                                         }
    //                                     }
    //                                 });
    //                             });
    //                         }
    //                     });
    //                 } else {
    //                     _prescriptionData.specialInterval.txtDangerDrugQty = '';
    //                     this.setState({
    //                         prescriptionData: _prescriptionData
    //                     });
    //                 }
    //             } else if (!lineId
    //                 && oldDose
    //                 && this.isIntNum(_prescriptionData.txtDangerDrugQty)
    //                 && oldDose !== parseInt(_prescriptionData.txtDangerDrugQty)
    //             ) {
    //                 if (_prescriptionData.ddlFreq && _prescriptionData.txtDuration && _prescriptionData.ddlDurationUnit) {
    //                     this.props.getTotalDangerDrug(params, () => {
    //                         if ((parseInt(this.props.maxDosage[0].maxDosage) >= parseInt(_prescriptionData.txtDangerDrugQty))
    //                             // || (!oldDose && parseInt(this.props.maxDosage[0].maxDosage) > parseInt(_prescriptionData.txtDangerDrugQty))
    //                         ) {
    //                             this.setState({
    //                                 // isPopUpAmendedDose: true,
    //                                 isCheckingTotalDosage: true
    //                                 // emptyDose: ORDER_LINE_TYPE.SPECIAL_INTERVAL + '1'
    //                             }, () => {
    //                                 const emptyDose = ORDER_LINE_TYPE.SPECIAL_INTERVAL + '1';
    //                                 this.props.openCommonMessage({
    //                                     msgCode: MOE_MSG_CODE.AMEND_DOSE,
    //                                     btnActions: {
    //                                         btn1Click: () => {
    //                                             this.preConfirmInEditDoes();
    //                                         },
    //                                         btn2Click: () => {
    //                                             this.emptyDose(emptyDose);
    //                                         }
    //                                     }
    //                                 });
    //                             });
    //                         } else if (parseInt(this.props.maxDosage[0].maxDosage) < parseInt(_prescriptionData.txtDangerDrugQty)) {
    //                             this.setState({
    //                                 // isPopupGreaterThanMaxDosage: true,
    //                                 isCheckingTotalDosage: true
    //                                 // emptyDose: ORDER_LINE_TYPE.SPECIAL_INTERVAL + '1'
    //                             }, () => {
    //                                 const emptyDose = ORDER_LINE_TYPE.SPECIAL_INTERVAL + '1';
    //                                 this.props.openCommonMessage({
    //                                     msgCode: MOE_MSG_CODE.GREATHER_THAN_MAX_DOSAGE,
    //                                     params: [
    //                                         {
    //                                             name: 'TOTAL_DOSE',
    //                                             value: (this.props.maxDosage && emptyDose ?
    //                                                 emptyDose.substr(0, 1) === ORDER_LINE_TYPE.SPECIAL_INTERVAL && emptyDose.substr(1, 1) === '2' ?
    //                                                     this.props.maxDosage[1].maxDosage
    //                                                     : this.props.maxDosage[0].maxDosage
    //                                                 : '')
    //                                         }
    //                                     ],
    //                                     btnActions: {
    //                                         btn1Click: () => {
    //                                             this.emptyDose(emptyDose);
    //                                         }
    //                                     }
    //                                 });
    //                             });

    //                         }
    //                     });
    //                 } else {
    //                     _prescriptionData.txtDangerDrugQty = '';
    //                     this.setState({
    //                         prescriptionData: _prescriptionData
    //                     });
    //                 }
    //             }
    //         } else {
    //             this.checkNormalDose(prescriptionData);
    //         }
    //     }
    // }

    // checkNormalDose = (prescriptionData) => {
    //     if (this.isIntNum(prescriptionData.txtDangerDrugQty)) {
    //         let params = {
    //             duration: prescriptionData.txtDuration,
    //             durationUnit: prescriptionData.ddlDurationUnit,
    //             freq1: prescriptionData.freq1,
    //             freqCode: prescriptionData.ddlFreq,
    //             moeEhrMedProfile: {
    //                 orderLineType: prescriptionData.orderLineType || ORDER_LINE_TYPE.NORMAL,
    //                 siteId: prescriptionData.ddlSite || null
    //             },
    //             moeMedMultDoses: [{
    //                 multDoseNo: 1,
    //                 duration: prescriptionData.txtDuration,
    //                 durationUnit: prescriptionData.ddlDurationUnit,
    //                 freq1: prescriptionData.freq1,
    //                 freqCode: prescriptionData.ddlFreq
    //             }]
    //         };
    //         //const oldDose = this.props.drug.txtDangerDrugQty;
    //         // const oldDose = this.state.doseFocusVal;
    //         const oldDose = prescriptionData.lastDoseVal;

    //         if (oldDose == prescriptionData.txtDangerDrugQty) return;

    //         if (oldDose !== parseInt(prescriptionData.txtDangerDrugQty) && prescriptionData.ddlFreq && prescriptionData.txtDuration && prescriptionData.ddlDurationUnit) {
    //             this.props.getTotalDangerDrug(params,
    //                 () => {
    //                     if (prescriptionData.txtDangerDrugQty
    //                         && (
    //                             (!oldDose && parseInt(this.props.maxDosage[0].maxDosage) > parseInt(prescriptionData.txtDangerDrugQty))
    //                             || (oldDose && parseInt(this.props.maxDosage[0].maxDosage) >= parseInt(prescriptionData.txtDangerDrugQty))
    //                         )
    //                     ) {
    //                         this.setState({
    //                             // isPopUpAmendedDose: true,
    //                             isCheckingTotalDosage: true
    //                             // emptyDose: ORDER_LINE_TYPE.NORMAL
    //                         }, () => {
    //                             this.props.openCommonMessage({
    //                                 msgCode: MOE_MSG_CODE.AMEND_DOSE,
    //                                 btnActions: {
    //                                     btn1Click: () => {
    //                                         this.preConfirmInEditDoes();
    //                                     },
    //                                     btn2Click: () => {
    //                                         this.emptyDose(ORDER_LINE_TYPE.NORMAL);
    //                                     }
    //                                 }
    //                             });
    //                         });

    //                     } else if (prescriptionData.txtDangerDrugQty && parseInt(this.props.maxDosage[0].maxDosage) < parseInt(prescriptionData.txtDangerDrugQty)) {
    //                         this.setState({
    //                             // isPopupGreaterThanMaxDosage: true,
    //                             isCheckingTotalDosage: true
    //                             // emptyDose: ORDER_LINE_TYPE.NORMAL
    //                         }, () => {
    //                             const emptyDose = ORDER_LINE_TYPE.NORMAL;
    //                             this.props.openCommonMessage({
    //                                 msgCode: MOE_MSG_CODE.GREATHER_THAN_MAX_DOSAGE,
    //                                 params: [
    //                                     {
    //                                         name: 'TOTAL_DOSE',
    //                                         value: (this.props.maxDosage && emptyDose ?
    //                                             emptyDose.substr(0, 1) === ORDER_LINE_TYPE.SPECIAL_INTERVAL && emptyDose.substr(1, 1) === '2' ?
    //                                                 this.props.maxDosage[1].maxDosage
    //                                                 : this.props.maxDosage[0].maxDosage
    //                                             : '')
    //                                     }
    //                                 ],
    //                                 btnActions: {
    //                                     btn1Click: () => {
    //                                         this.emptyDose(emptyDose);
    //                                     }
    //                                 }
    //                             });
    //                         });

    //                     }
    //                 });
    //         } else if (!prescriptionData.txtDangerDrugQty || !prescriptionData.ddlFreq || !prescriptionData.txtDuration || !prescriptionData.ddlDurationUnit) {
    //             prescriptionData.txtDangerDrugQty = '';
    //             this.setState({
    //                 prescriptionData
    //             });
    //         }
    //     }
    // }

    emptyDose = (emptyDose) => {
        let prescriptionData = { ...this.state.prescriptionData };
        // let oldQty = this.state.doseFocusVal;
        if (emptyDose && emptyDose === ORDER_LINE_TYPE.NORMAL) {
            let oldQty = prescriptionData.lastDoseVal;
            //prescriptionData.txtDangerDrugQty = this.props.drug.txtDangerDrugQty;
            prescriptionData.txtDangerDrugQty = oldQty;
            this.setState({
                // isPopUpAmendedDose: false,
                // isPopupGreaterThanMaxDosage: false,
                isCheckingTotalDosage: false,
                prescriptionData: prescriptionData
            });
        } else {
            const orderLineType = emptyDose.substr(0, 1);
            const lineIndex = emptyDose.substr(1, 1);

            if ((orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE
                || orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN
            ) && lineIndex) {
                let oldQty = prescriptionData.moeMedMultDoses[lineIndex].lastDoseVal;
                prescriptionData.moeMedMultDoses[lineIndex].txtDangerDrugQty = oldQty;
            }
            // if (orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE && lineIndex) {
            //     let oldQty = prescriptionData.multipleLine[lineIndex].lastDoseVal;
            //     // let oldQty = this.props.drug.multipleLine && this.props.drug.multipleLine.length > lineIndex && this.props.drug.multipleLine[lineIndex].txtDangerDrugQty;
            //     prescriptionData.multipleLine[lineIndex].txtDangerDrugQty = oldQty;
            // } else if (orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN && lineIndex) {
            //     let oldQty = prescriptionData.stepUpDown[lineIndex].lastDoseVal;
            //     // let oldQty = this.props.drug.stepUpDown && this.props.drug.stepUpDown.length > lineIndex && this.props.drug.stepUpDown[lineIndex].txtDangerDrugQty;
            //     prescriptionData.stepUpDown[lineIndex].txtDangerDrugQty = oldQty;
            // }
            else if (orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL && lineIndex) {
                if (lineIndex === '1') {
                    let oldQty = prescriptionData.lastDoseVal;
                    prescriptionData.txtDangerDrugQty = oldQty;
                    // prescriptionData.txtDangerDrugQty = this.props.drug.txtDangerDrugQty;
                }
                else if (lineIndex === '2') {
                    let oldQty = prescriptionData.specialInterval.lastDoseVal;
                    prescriptionData.specialInterval.txtDangerDrugQty = oldQty;
                    //prescriptionData.specialInterval.txtDangerDrugQty = this.props.drug.specialInterval && this.props.drug.specialInterval.txtDangerDrugQty;
                }
            }
            this.setState({
                // isPopUpAmendedDose: false,
                // isPopupGreaterThanMaxDosage: false,
                isCheckingTotalDosage: false,
                prescriptionData: prescriptionData
            });
        }
    }

    preConfirmInEditDoes = () => {
        let prescriptionData = { ...this.state.prescriptionData };
        this.setState({
            // isPopUpAmendedDose: false,
            isCheckingTotalDosage: false,
            prescriptionData: prescriptionData
        }/*,this.handlePreConfirm*/);
        //setTimeout(this.handlePreConfirm, 300);
    }

    logOldData = (updatingFieldName, updatingFieldVal) => {
        this.setState({
            updatingFieldName,
            updatingFieldVal
        });
    }

    getOldField = () => {
        let oldDdlFreq = this.props.drug.ddlFreq;
        let oldTxtDuration = this.props.drug.txtDuration;
        let oldDdlDurationUnit = this.props.drug.ddlDurationUnit;
        let oldDdlSite = this.props.drug.ddlSite;

        if (this.state.updatingFieldName) {
            const oldVal = this.state.updatingFieldVal;
            switch (this.state.updatingFieldName) {
                case PANEL_FIELD_NAME.FREQ:
                    oldDdlFreq = oldVal;
                    break;
                case PANEL_FIELD_NAME.SITE:
                    oldDdlSite = oldVal;
                    break;
                case PANEL_FIELD_NAME.DURATION:
                    oldTxtDuration = oldVal;
                    break;
                case PANEL_FIELD_NAME.DURATION_UNIT:
                    oldDdlDurationUnit = oldVal;
                    break;
            }
        }

        let oldFields = {
            oldDdlFreq,
            oldTxtDuration,
            oldDdlDurationUnit,
            oldDdlSite
        };
        return oldFields;
    }
    handleOnBlurChange = (name, lineId, isFirstLine) => {
        let prescriptionData = { ...this.state.prescriptionData };

        if (prescriptionData.dangerDrug !== 'Y' && prescriptionData.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
            let specialIntervalData = prescriptionData.specialInterval;
            this.handleSpecialIntervalConfirm(specialIntervalData, true);
            return;
        }

        let { params, curItem } = moeUtilities.getParamsForDose(lineId, prescriptionData);
        switch (prescriptionData.orderLineType) {
            case ORDER_LINE_TYPE.MULTIPLE_LINE: {
                if (!prescriptionData.moeMedMultDoses) break;

                if (lineId) {
                    if (!curItem) {
                        prescriptionData.moeMedMultDoses[lineId].txtDangerDrugQty = '';
                        this.setState({
                            prescriptionData: prescriptionData
                        });
                        break;
                    }

                    let _oldDdlFreq = curItem.ddlFreq;
                    if (this.state.updatingFieldName && this.state.updatingFieldName === PANEL_FIELD_NAME.FREQ) {
                        _oldDdlFreq = this.state.updatingFieldVal;
                    }
                    if (curItem.ddlFreq
                        && this.isIntNum(prescriptionData.txtDuration)
                        && prescriptionData.ddlDurationUnit
                    ) {
                        if (_oldDdlFreq !== curItem.ddlFreq) {
                            this.props.getTotalDangerDrug(params,
                                () => {
                                    prescriptionData.moeMedMultDoses[lineId].txtDangerDrugQty = this.props.maxDosage[0].maxDosage;
                                    this.setState({
                                        prescriptionData: prescriptionData
                                    });
                                });
                        }
                    }
                    break;
                }

                //count dose for first line start
                const oldFields = this.getOldField();
                const oldDdlFreq = oldFields.oldDdlFreq;
                const oldTxtDuration = oldFields.oldTxtDuration;
                const oldDdlDurationUnit = oldFields.oldDdlDurationUnit;
                const oldDdlSite = oldFields.oldDdlSite;

                if (this.isIntNum(prescriptionData.txtDuration)
                    && prescriptionData.ddlFreq
                    && prescriptionData.ddlDurationUnit
                    && (
                        oldDdlFreq !== prescriptionData.ddlFreq
                        || oldTxtDuration !== prescriptionData.txtDuration
                        || oldDdlDurationUnit !== prescriptionData.ddlDurationUnit
                        || oldDdlSite !== prescriptionData.ddlSite
                    )) {
                    let arryMultDose = [];
                    for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
                        let item = prescriptionData.moeMedMultDoses[i];
                        arryMultDose.push({
                            multDoseNo: item.multDoseNo,
                            duration: prescriptionData.txtDuration,
                            durationUnit: prescriptionData.ddlDurationUnit,
                            freq1: item.freq1,
                            freqCode: item.ddlFreq
                        });
                    }
                    if (arryMultDose.length > 0) {
                        if (name != 'ddlFreq') params.moeMedMultDoses = arryMultDose;
                        this.props.getTotalDangerDrug(params,
                            () => {
                                for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
                                    this.props.maxDosage.map((item) => {
                                        if (item.multDoseNo === 1 && item.multDoseNo === prescriptionData.moeMedMultDoses[i].multDoseNo) {
                                            prescriptionData.txtDangerDrugQty = item.maxDosage;
                                            prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = item.maxDosage;
                                        } else if (item.multDoseNo === prescriptionData.moeMedMultDoses[i].multDoseNo) {
                                            prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = item.maxDosage;
                                        }
                                        return true;
                                    });
                                }
                                this.setState({
                                    prescriptionData: prescriptionData
                                });
                            });
                    }
                } else if (!prescriptionData.ddlFreq || !prescriptionData.txtDuration || !prescriptionData.ddlDurationUnit) {
                    for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
                        prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = '';
                    }
                    prescriptionData.txtDangerDrugQty = '';
                    this.setState({
                        prescriptionData: prescriptionData
                    });
                }
                //count dose for first line end
                break;
            }
            case ORDER_LINE_TYPE.STEP_UP_AND_DOWN: {
                if (lineId) {
                    if (!curItem.ddlDurationUnit || !this.isIntNum(curItem.txtDuration)) break;

                    let _oldDdlFreq = curItem.ddlFreq;
                    let _oldTxtDuration = curItem.txtDuration;
                    let _oldDdlDurationUnit = curItem.oldDdlDurationUnit;

                    if (this.state.updatingFieldName) {
                        switch (this.state.updatingFieldName) {
                            case PANEL_FIELD_NAME.FREQ:
                                _oldDdlFreq = this.state.updatingFieldVal;
                                break;
                            case PANEL_FIELD_NAME.DURATION:
                                _oldTxtDuration = this.state.updatingFieldVal;
                                break;
                            case PANEL_FIELD_NAME.DURATION_UNIT:
                                _oldDdlDurationUnit = this.state.updatingFiledVal;
                                break;
                        }
                    }

                    if (curItem.ddlFreq
                        && (
                            _oldDdlFreq !== curItem.ddlFreq
                            || _oldTxtDuration !== curItem.txtDuration
                            || _oldDdlDurationUnit !== curItem.oldDdlDurationUnit)
                    ) {
                        this.props.getTotalDangerDrug(params,
                            () => {
                                prescriptionData.moeMedMultDoses[lineId].txtDangerDrugQty = this.props.maxDosage[0].maxDosage;
                                this.setState({
                                    prescriptionData: prescriptionData
                                });
                            });
                    } else if (!curItem.ddlFreq || !curItem.txtDuration || !curItem.ddlDurationUnit) {
                        prescriptionData.moeMedMultDoses[lineId].txtDangerDrugQty = '';
                        this.setState({
                            prescriptionData: prescriptionData
                        });
                    }
                    break;
                }

                const oldFields = this.getOldField();
                const oldDdlFreq = oldFields.oldDdlFreq;
                const oldTxtDuration = oldFields.oldTxtDuration;
                const oldDdlDurationUnit = oldFields.oldDdlDurationUnit;
                const oldDdlSite = oldFields.oldDdlSite;

                const oldDataCondition = (oldDdlSite !== prescriptionData.ddlSite
                    || oldTxtDuration !== prescriptionData.txtDuration
                    || oldDdlDurationUnit !== prescriptionData.ddlDurationUnit
                    || oldDdlFreq !== prescriptionData.ddlFreq);

                if (isFirstLine) {
                    if (prescriptionData.ddlFreq
                        && this.isIntNum(prescriptionData.txtDuration)
                        && prescriptionData.txtDuration
                        && prescriptionData.ddlDurationUnit
                        && oldDataCondition
                    ) {
                        this.props.getTotalDangerDrug(params,
                            () => {
                                prescriptionData.txtDangerDrugQty = this.props.maxDosage[0].maxDosage;
                                this.setState({
                                    prescriptionData: prescriptionData
                                });
                            });
                    } else if (!prescriptionData.ddlFreq
                        || !prescriptionData.txtDuration
                        || !prescriptionData.ddlDurationUnit) {
                        prescriptionData.txtDangerDrugQty = '';
                        this.setState({
                            prescriptionData: prescriptionData
                        });
                    }
                    break;
                }

                if (oldDataCondition) {
                    let arryMultDose = [];
                    for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
                        let item = prescriptionData.moeMedMultDoses[i];
                        if (item.ddlFreq && this.isIntNum(item.txtDuration) && item.ddlDurationUnit) {
                            arryMultDose.push({
                                multDoseNo: item.multDoseNo,
                                duration: item.txtDuration,
                                durationUnit: item.ddlDurationUnit,
                                freq1: item.freq1,
                                freqCode: item.ddlFreq
                            });
                        } else if (!item.ddlFreq || !this.isIntNum(item.txtDuration) || !item.ddlDurationUnit) {
                            if (i == 0)
                                prescriptionData.txtDangerDrugQty = '';
                            prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = '';
                        } else {
                            break;
                        }
                    }
                    if (arryMultDose.length > 0) {
                        if (name != 'ddlRoute' && name != 'ddlSite') params.moeMedMultDoses = arryMultDose;
                        this.props.getTotalDangerDrug(params,
                            () => {
                                for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
                                    this.props.maxDosage.map((item) => {
                                        if (item.multDoseNo === 1 && item.multDoseNo === prescriptionData.moeMedMultDoses[i].multDoseNo) {
                                            prescriptionData.txtDangerDrugQty = item.maxDosage;
                                            prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = item.maxDosage;
                                        } else if (item.multDoseNo === prescriptionData.moeMedMultDoses[i].multDoseNo) {
                                            prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = item.maxDosage;
                                        }
                                        return true;
                                    });
                                }
                                this.setState({
                                    prescriptionData: prescriptionData
                                });
                            });
                    } else {
                        this.setState({
                            prescriptionData: prescriptionData
                        });
                    }
                }
                break;
            }
            case ORDER_LINE_TYPE.SPECIAL_INTERVAL:
                this.handleSpecialIntervalConfirm(prescriptionData.specialInterval, true);
                break;
            default: {
                const oldFields = this.getOldField();
                const oldDdlFreq = oldFields.oldDdlFreq;
                const oldTxtDuration = oldFields.oldTxtDuration;
                const oldDdlDurationUnit = oldFields.oldDdlDurationUnit;
                const oldDdlSite = oldFields.oldDdlSite;

                if (oldDdlSite != curItem.ddlSite
                    || oldTxtDuration != curItem.txtDuration
                    || oldDdlDurationUnit != curItem.ddlDurationUnit
                    || oldDdlFreq != curItem.ddlFreq
                ) {
                    if (curItem.ddlFreq
                        && curItem.txtDuration
                        && curItem.ddlDurationUnit
                        && this.isIntNum(curItem.txtDuration)
                    ) {
                        this.props.getTotalDangerDrug(params,
                            () => {
                                prescriptionData.txtDangerDrugQty = this.props.maxDosage[0].maxDosage;
                                this.setState({
                                    prescriptionData: prescriptionData
                                });
                            });
                    } else if (!curItem.ddlFreq || !curItem.txtDuration || !curItem.ddlDurationUnit) {
                        prescriptionData.txtDangerDrugQty = '';
                        this.setState({
                            prescriptionData: prescriptionData
                        });
                    }
                    break;
                }
            }
        }
    }
    // handleOnBlurChange = (lineId, isFirstLine) => {
    //     let prescriptionData = { ...this.state.prescriptionData };
    //     if (prescriptionData.dangerDrug === 'Y') {
    //         if (prescriptionData.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE) {
    //             if (lineId) {
    //                 let item = prescriptionData.moeMedMultDoses[lineId];
    //                 if (item) {
    //                     let params = {
    //                         duration: prescriptionData.txtDuration,
    //                         durationUnit: prescriptionData.ddlDurationUnit,
    //                         freq1: item.freq1,
    //                         freqCode: item.ddlFreq,
    //                         moeEhrMedProfile: {
    //                             orderLineType: prescriptionData.orderLineType,
    //                             siteId: prescriptionData.ddlSite || null
    //                         },
    //                         moeMedMultDoses: [{
    //                             multDoseNo: 1,
    //                             duration: prescriptionData.txtDuration,
    //                             durationUnit: prescriptionData.ddlDurationUnit,
    //                             freq1: item.freq1,
    //                             freqCode: item.ddlFreq
    //                         }]
    //                     };
    //                     let oldDdlFreq = this.props.drug.moeMedMultDoses
    //                         && this.props.drug.moeMedMultDoses[lineId]
    //                         && this.props.drug.moeMedMultDoses[lineId].ddlFreq;
    //                     if (this.state.updatingFieldName && this.state.updatingFieldName === PANEL_FIELD_NAME.FREQ) {
    //                         oldDdlFreq = this.state.updatingFieldVal;
    //                     }
    //                     if (item.ddlFreq && this.isIntNum(prescriptionData.txtDuration) && prescriptionData.ddlDurationUnit) {
    //                         if (oldDdlFreq !== item.ddlFreq) {
    //                             this.props.getTotalDangerDrug(params,
    //                                 () => {
    //                                     prescriptionData.moeMedMultDoses[lineId].txtDangerDrugQty = this.props.maxDosage[0].maxDosage;
    //                                     this.setState({
    //                                         prescriptionData: prescriptionData
    //                                     });
    //                                 });
    //                         }
    //                     }
    //                 } else {
    //                     prescriptionData.moeMedMultDoses[lineId].txtDangerDrugQty = '';
    //                     this.setState({
    //                         prescriptionData: prescriptionData
    //                     });
    //                 }
    //             } else {
    //                 let params = {
    //                     duration: prescriptionData.txtDuration,
    //                     durationUnit: prescriptionData.ddlDurationUnit,
    //                     moeEhrMedProfile: {
    //                         orderLineType: prescriptionData.orderLineType,
    //                         siteId: prescriptionData.ddlSite || null
    //                     },
    //                     moeMedMultDoses: []
    //                 };

    //                 const oldFields = this.getOldField();
    //                 const oldDdlFreq = oldFields.oldDdlFreq;
    //                 const oldTxtDuration = oldFields.oldTxtDuration;
    //                 const oldDdlDurationUnit = oldFields.oldDdlDurationUnit;
    //                 const oldDdlSite = oldFields.oldDdlSite;

    //                 if (this.isIntNum(prescriptionData.txtDuration)
    //                     && prescriptionData.ddlFreq
    //                     && prescriptionData.ddlDurationUnit
    //                     && (
    //                         oldDdlFreq !== prescriptionData.ddlFreq
    //                         || oldTxtDuration !== prescriptionData.txtDuration
    //                         || oldDdlDurationUnit !== prescriptionData.ddlDurationUnit
    //                         || oldDdlSite !== prescriptionData.ddlSite
    //                     )) {
    //                     let arryMultDose = [];
    //                     for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
    //                         let item = prescriptionData.moeMedMultDoses[i];
    //                         if (i === 0 && prescriptionData.ddlFreq) {
    //                             arryMultDose.push({
    //                                 multDoseNo: 1,
    //                                 duration: prescriptionData.txtDuration,
    //                                 durationUnit: prescriptionData.ddlDurationUnit,
    //                                 freq1: prescriptionData.freq1,
    //                                 freqCode: prescriptionData.ddlFreq
    //                             });
    //                         } else if (i !== 0 && item.ddlFreq) {
    //                             arryMultDose.push({
    //                                 multDoseNo: item.multDoseNo,
    //                                 duration: prescriptionData.txtDuration,
    //                                 durationUnit: prescriptionData.ddlDurationUnit,
    //                                 freq1: item.freq1,
    //                                 freqCode: item.ddlFreq
    //                             });
    //                         } else {
    //                             break;
    //                         }
    //                     }
    //                     if (arryMultDose.length > 0) {
    //                         params.moeMedMultDoses = arryMultDose;
    //                         this.props.getTotalDangerDrug(params,
    //                             () => {
    //                                 for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
    //                                     this.props.maxDosage.map((item) => {
    //                                         if (item.multDoseNo === 1 && item.multDoseNo === prescriptionData.moeMedMultDoses[i].multDoseNo) {
    //                                             prescriptionData.txtDangerDrugQty = item.maxDosage;
    //                                             prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = item.maxDosage;
    //                                         } else if (item.multDoseNo === prescriptionData.moeMedMultDoses[i].multDoseNo) {
    //                                             prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = item.maxDosage;
    //                                         }
    //                                         return true;
    //                                     });
    //                                 }
    //                                 this.setState({
    //                                     prescriptionData: prescriptionData
    //                                 });
    //                             });
    //                     }
    //                 } else if (!prescriptionData.ddlFreq || !prescriptionData.txtDuration || !prescriptionData.ddlDurationUnit) {
    //                     for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
    //                         prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = '';
    //                     }
    //                     prescriptionData.txtDangerDrugQty = '';
    //                     this.setState({
    //                         prescriptionData: prescriptionData
    //                     });
    //                 }
    //             }
    //         } else if (prescriptionData.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
    //             if (lineId) {
    //                 let item = prescriptionData.moeMedMultDoses[lineId];
    //                 if (item) {
    //                     let params = {
    //                         duration: item.txtDuration,
    //                         durationUnit: item.ddlDurationUnit,
    //                         freq1: item.freq1,
    //                         freqCode: item.ddlFreq,
    //                         moeEhrMedProfile: {
    //                             orderLineType: prescriptionData.orderLineType,
    //                             siteId: prescriptionData.ddlSite || null
    //                         },
    //                         moeMedMultDoses: [{
    //                             multDoseNo: 1,
    //                             duration: item.txtDuration,
    //                             durationUnit: item.ddlDurationUnit,
    //                             freq1: item.freq1,
    //                             freqCode: item.ddlFreq
    //                         }]
    //                     };
    //                     let oldDdlFreq = this.props.drug.moeMedMultDoses && this.props.drug.moeMedMultDoses[lineId] && this.props.drug.moeMedMultDoses[lineId].ddlFreq;
    //                     let oldTxtDuration = this.props.drug.moeMedMultDoses && this.props.drug.moeMedMultDoses[lineId] && this.props.drug.moeMedMultDoses[lineId].txtDuration;
    //                     let oldDdlDurationUnit = this.props.drug.moeMedMultDoses && this.props.drug.moeMedMultDoses[lineId] && this.props.drug.moeMedMultDoses[lineId].oldDdlDurationUnit;

    //                     if (this.state.updatingFieldName) {
    //                         switch (this.state.updatingFieldName) {
    //                             case PANEL_FIELD_NAME.FREQ:
    //                                 oldDdlFreq = this.state.updatingFieldVal;
    //                                 break;
    //                             case PANEL_FIELD_NAME.DURATION:
    //                                 oldTxtDuration = this.state.updatingFieldVal;
    //                                 break;
    //                             case PANEL_FIELD_NAME.DURATION_UNIT:
    //                                 oldDdlDurationUnit = this.state.updatingFiledVal;
    //                                 break;
    //                         }
    //                     }

    //                     if (item.ddlFreq && this.isIntNum(item.txtDuration) && item.ddlDurationUnit && (oldDdlFreq !== item.ddlFreq || oldTxtDuration !== item.txtDuration || oldDdlDurationUnit !== item.oldDdlDurationUnit)) {
    //                         this.props.getTotalDangerDrug(params,
    //                             () => {
    //                                 prescriptionData.moeMedMultDoses[lineId].txtDangerDrugQty = this.props.maxDosage[0].maxDosage;
    //                                 this.setState({
    //                                     prescriptionData: prescriptionData
    //                                 });
    //                             });
    //                     } else if (!item.ddlFreq || !item.txtDuration || !item.ddlDurationUnit) {
    //                         prescriptionData.moeMedMultDoses[lineId].txtDangerDrugQty = '';
    //                         this.setState({
    //                             prescriptionData: prescriptionData
    //                         });
    //                     }
    //                 }
    //             } else if (isFirstLine) {
    //                 const oldFields = this.getOldField();
    //                 const oldDdlFreq = oldFields.oldDdlFreq;
    //                 const oldTxtDuration = oldFields.oldTxtDuration;
    //                 const oldDdlDurationUnit = oldFields.oldDdlDurationUnit;
    //                 const oldDdlSite = oldFields.oldDdlSite;

    //                 if (prescriptionData.ddlFreq && this.isIntNum(prescriptionData.txtDuration) && prescriptionData.txtDuration && prescriptionData.ddlDurationUnit && (oldTxtDuration !== prescriptionData.txtDuration || oldDdlDurationUnit !== prescriptionData.ddlDurationUnit || oldDdlFreq !== prescriptionData.ddlFreq || oldDdlSite !== prescriptionData.ddlSite)) {
    //                     let params = {
    //                         duration: prescriptionData.txtDuration,
    //                         durationUnit: prescriptionData.ddlDurationUnit,
    //                         freq1: prescriptionData.freq1,
    //                         freqCode: prescriptionData.ddlFreq,
    //                         moeEhrMedProfile: {
    //                             orderLineType: prescriptionData.orderLineType,
    //                             siteId: prescriptionData.ddlSite || null
    //                         },
    //                         moeMedMultDoses: [{
    //                             multDoseNo: 1,
    //                             duration: prescriptionData.txtDuration,
    //                             durationUnit: prescriptionData.ddlDurationUnit,
    //                             freq1: prescriptionData.freq1,
    //                             freqCode: prescriptionData.ddlFreq
    //                         }]
    //                     };
    //                     this.props.getTotalDangerDrug(params,
    //                         () => {
    //                             prescriptionData.txtDangerDrugQty = this.props.maxDosage[0].maxDosage;
    //                             this.setState({
    //                                 prescriptionData: prescriptionData
    //                             });
    //                         });
    //                 } else if (!prescriptionData.ddlFreq || !prescriptionData.txtDuration || !prescriptionData.ddlDurationUnit) {
    //                     prescriptionData.txtDangerDrugQty = '';
    //                     this.setState({
    //                         prescriptionData: prescriptionData
    //                     });
    //                 }
    //             } else {
    //                 const oldFields = this.getOldField();
    //                 const oldDdlFreq = oldFields.oldDdlFreq;
    //                 const oldTxtDuration = oldFields.oldTxtDuration;
    //                 const oldDdlDurationUnit = oldFields.oldDdlDurationUnit;
    //                 const oldDdlSite = oldFields.oldDdlSite;

    //                 if (oldDdlSite !== prescriptionData.ddlSite || oldTxtDuration !== prescriptionData.txtDuration || oldDdlDurationUnit !== prescriptionData.ddlDurationUnit || oldDdlFreq !== prescriptionData.ddlFreq) {
    //                     let params = {
    //                         moeEhrMedProfile: {
    //                             orderLineType: prescriptionData.orderLineType,
    //                             siteId: prescriptionData.ddlSite || null
    //                         },
    //                         moeMedMultDoses: []
    //                     };
    //                     let arryMultDose = [];
    //                     for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
    //                         let item = prescriptionData.moeMedMultDoses[i];
    //                         if (i === 0 && prescriptionData.ddlFreq && this.isIntNum(prescriptionData.txtDuration) && prescriptionData.ddlDurationUnit) {
    //                             arryMultDose.push({
    //                                 multDoseNo: 1,
    //                                 duration: prescriptionData.txtDuration,
    //                                 durationUnit: prescriptionData.ddlDurationUnit,
    //                                 freq1: prescriptionData.freq1,
    //                                 freqCode: prescriptionData.ddlFreq
    //                             });
    //                         } else if (i !== 0 && item.ddlFreq && this.isIntNum(item.txtDuration) && item.ddlDurationUnit) {
    //                             arryMultDose.push({
    //                                 multDoseNo: item.multDoseNo,
    //                                 duration: item.txtDuration,
    //                                 durationUnit: item.ddlDurationUnit,
    //                                 freq1: item.freq1,
    //                                 freqCode: item.ddlFreq
    //                             });
    //                         } else if (i === 0 && (!prescriptionData.ddlFreq || !this.isIntNum(prescriptionData.txtDuration) || !prescriptionData.ddlDurationUnit)) {
    //                             prescriptionData.txtDangerDrugQty = '';
    //                         } else if (i !== 0 && (!item.ddlFreq || !this.isIntNum(item.txtDuration) || !item.ddlDurationUnit)) {
    //                             prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = '';
    //                         } else {
    //                             break;
    //                         }
    //                     }
    //                     if (arryMultDose.length > 0) {
    //                         params.moeMedMultDoses = arryMultDose;
    //                         this.props.getTotalDangerDrug(params,
    //                             () => {
    //                                 for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
    //                                     this.props.maxDosage.map((item) => {
    //                                         if (item.multDoseNo === 1 && item.multDoseNo === prescriptionData.moeMedMultDoses[i].multDoseNo) {
    //                                             prescriptionData.txtDangerDrugQty = item.maxDosage;
    //                                             prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = item.maxDosage;
    //                                         } else if (item.multDoseNo === prescriptionData.moeMedMultDoses[i].multDoseNo) {
    //                                             prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = item.maxDosage;
    //                                         }
    //                                         return true;
    //                                     });
    //                                 }
    //                                 this.setState({
    //                                     prescriptionData: prescriptionData
    //                                 });
    //                             });
    //                     } else {
    //                         this.setState({
    //                             prescriptionData: prescriptionData
    //                         });
    //                     }
    //                 }
    //             }
    //         } else if (prescriptionData.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
    //             let specialIntervalData = prescriptionData.specialInterval;

    //             //get special interval text
    //             this.handleSpecialIntervalConfirm(specialIntervalData, true);

    //         } else {
    //             const oldFields = this.getOldField();
    //             const oldDdlFreq = oldFields.oldDdlFreq;
    //             const oldTxtDuration = oldFields.oldTxtDuration;
    //             const oldDdlDurationUnit = oldFields.oldDdlDurationUnit;
    //             const oldDdlSite = oldFields.oldDdlSite;

    //             if (oldDdlSite != prescriptionData.ddlSite || oldTxtDuration != prescriptionData.txtDuration || oldDdlDurationUnit != prescriptionData.ddlDurationUnit || oldDdlFreq != prescriptionData.ddlFreq) {
    //                 let params = {
    //                     duration: prescriptionData.txtDuration,
    //                     durationUnit: prescriptionData.ddlDurationUnit,
    //                     freq1: prescriptionData.freq1,
    //                     freqCode: prescriptionData.ddlFreq,
    //                     moeEhrMedProfile: {
    //                         orderLineType: prescriptionData.orderLineType || ORDER_LINE_TYPE.NORMAL,
    //                         siteId: prescriptionData.ddlSite || null
    //                     },
    //                     moeMedMultDoses: [{
    //                         multDoseNo: 1,
    //                         duration: prescriptionData.txtDuration,
    //                         durationUnit: prescriptionData.ddlDurationUnit,
    //                         freq1: prescriptionData.freq1,
    //                         freqCode: prescriptionData.ddlFreq
    //                     }]
    //                 };
    //                 if (prescriptionData.ddlFreq && prescriptionData.txtDuration && prescriptionData.ddlDurationUnit && this.isIntNum(prescriptionData.txtDuration)) {
    //                     this.props.getTotalDangerDrug(params,
    //                         () => {
    //                             prescriptionData.txtDangerDrugQty = this.props.maxDosage[0].maxDosage;
    //                             this.setState({
    //                                 prescriptionData: prescriptionData
    //                             });
    //                         });
    //                 } else if (!prescriptionData.ddlFreq || !prescriptionData.txtDuration || !prescriptionData.ddlDurationUnit) {
    //                     prescriptionData.txtDangerDrugQty = '';
    //                     this.setState({
    //                         prescriptionData: prescriptionData
    //                     });
    //                 }
    //             } else if (!prescriptionData.ddlFreq || !prescriptionData.txtDuration || !prescriptionData.ddlDurationUnit) {
    //                 prescriptionData.txtDangerDrugQty = '';
    //                 this.setState({
    //                     prescriptionData: prescriptionData
    //                 });
    //             }
    //         }
    //     } else if (prescriptionData.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
    //         let specialIntervalData = prescriptionData.specialInterval;
    //         this.handleSpecialIntervalConfirm(specialIntervalData, true);
    //     }
    // }

    isIntNum = (val) => {
        const regPos = /^[1-9]+[0-9]*]*$/;
        return regPos.test(val);
    }
    //end calculate max danger dose

    //HLA-B Start
    openEditHLAB1502Dialog = (e, index) => {
        if (this.props.drug.apiData.moeEhrMedAllergens && this.props.drug.apiData.moeEhrMedAllergens.length > 0) {
            let hlabReason = this.props.drug.apiData.moeEhrMedAllergens.filter((item) => {
                return item.matchType === 'H';
            });
            if (hlabReason && hlabReason.length > 0) {
                e.stopPropagation();
                let reasonDesc = [];
                for (let i = 0; i < hlabReason.length; i++) {
                    reasonDesc.push(hlabReason[i].overrideReason);
                }
                this.props.openEditHLAB1502Dialog(reasonDesc, this.props.drug, true, this.state.prescriptionData, index);
            }
        }
        // if (this.props.drug.apiData.moeEhrMedAllergens
        //     && this.props.drug.apiData.moeEhrMedAllergens.find((item) => {
        //         if (item.matchType === 'H')
        //             return true;
        //         else
        //             return false;
        //     })) {
        //     e.stopPropagation();
        //     let reasonDesc = [];
        //     for (let i = 0; i < this.props.drug.apiData.moeEhrMedAllergens.length; i++) {
        //         reasonDesc.push(this.props.drug.apiData.moeEhrMedAllergens[i].overrideReason);
        //     }
        //     this.props.openEditHLAB1502Dialog(reasonDesc, this.props.drug, true, this.state.prescriptionData, index);
        // }
    }
    //HLA-B End

    onUpdateRouteOption = (curOption, filterList) => {
        if (!filterList || filterList.length == 0) return;
        let routeCodeList = _.cloneDeep(this.state.routeCodeList);
        if (!routeCodeList || routeCodeList.length == 0) return;
        for (let i = 0; i < routeCodeList.length; i++) {
            if (routeCodeList[i].code != curOption.value) continue;
            if (routeCodeList[i].hadFilterAbbreviation) continue;
            const filterInput = filterList.find(m => m == routeCodeList[i].routeOtherName);
            if (filterInput)
                routeCodeList[i].hadFilterAbbreviation = true;
        }
        this.setState({
            routeCodeList: routeCodeList
        });
    }

    render() {
        const { classes,/* patient, isCims,*/ index, errorMessageList, setting } = this.props;
        const { prescriptionData, showMultipleLine, showStepUpDown } = this.state;
        let titleClasses = '';
        if (this.props.showDetail) {
            titleClasses = classes.title;
        } else {
            titleClasses = classes.prescriptionTitle;
        }
        let titleProps = classes.withoutIcons;
        if (prescriptionData.dangerDrug && prescriptionData.dangerDrug === 'Y' && prescriptionData.allergens && prescriptionData.allergens.length > 0) {
            titleProps = classes.withIcons;
        } else if ((prescriptionData.dangerDrug && prescriptionData.dangerDrug === 'Y') || (prescriptionData.allergens && prescriptionData.allergens.length > 0)) {
            titleProps = classes.withAnIcon;
        }

        //let strTitle = prescriptionUtilities.getPanelTitle(prescriptionData, this.props.codeList, this.props.backDate, this.state.sitesCodeList);
        let strTitleRemark = prescriptionData.remarkText ? 'Note: ' + prescriptionData.remarkText : null;
        console.log('dmei test panel', prescriptionData);
        return (
            <Typography component={'div'}
                style={{ justifyItems: 'center', width: '100%' }}
                id={'prescription_PrescriptionPanel' + index}
                onContextMenu={(e) => !this.props.showDetail && !setting.isEnquiry ? this.props.handleContextMenu(e, index, prescriptionData) : null}
            >
                <ListItem
                    button={this.props.showDetail ? false : true}
                    style={{ padding: 0, margin: 0 }}
                    divider
                >
                    <Grid container className={`${this.props.showDetail ? classes.colorClasses : null}`}>
                        <Grid item container xs={this.props.showDetail ? 11 : 12}>
                            <Grid item container xs={12}>
                                {!this.props.isFromTabs &&
                                    <Grid style={{ width: '24px', display: setting.isEnquiry ? 'none' : 'block' }}>
                                        <IconButton
                                            id={'prescription_PrescriptionPanel' + index + '_deleteIconButton'}
                                            // onClick={() => this.handleDeleteDialog(true)}
                                            onClick={this.handleDeleteDialog}
                                            style={{ padding: 0 }}
                                            data-deletebtnid={'deleteBtn' + index}
                                        >
                                            <img src={iconCancel} alt={''} />
                                        </IconButton>
                                    </Grid>
                                }
                                <Grid item container alignItems="center" xs={11} onClick={this.props.onClick} id={'prescription_PrescriptionPanel' + index + '_showDetailButton'}>
                                    {prescriptionData.dangerDrug && prescriptionData.dangerDrug === 'Y' ?
                                        <Typography component="div" style={{ height: '100%', width: '3%' }}>
                                            <img src={imgDangerDrug} style={{ marginTop: '6px' }} alt=""
                                                title="Dangerous Drug"
                                            //20200107 Fix issue 74 mouse over the icon will shown "Dangerous Drug" by Louis Chen
                                            />
                                        </Typography>
                                        :
                                        null
                                    }
                                    {
                                        prescriptionData.allergens && prescriptionData.allergens.length > 0 ?
                                            <Typography component="div" style={{ height: '100%', width: '3%' }}>
                                                <Tooltip title={moeUtilities.getDACReason(prescriptionData.allergens)} classes={{ tooltip: classes.toolTip }}>
                                                    <img src={warningIcon} style={{ marginTop: '6px' }} alt="" onClick={(e) => { if (!this.props.showDetail) this.openEditHLAB1502Dialog(e, index); }} />
                                                </Tooltip>
                                            </Typography>
                                            :
                                            null
                                    }
                                    <Typography component="div" className={`${titleProps}`}>
                                        {/* <Typography variant={'subtitle2'} className={`${titleClasses}`} style={{ whiteSpace: 'pre-wrap' }}>{strTitle}</Typography> */}
                                        <Typography variant={'subtitle2'} className={`${titleClasses}`}>{prescriptionUtilities.generatePanelTitle(prescriptionData, this.props.codeList, false, this.props.ordDate)}</Typography>
                                        <Typography variant={'subtitle2'} className={`${titleClasses}`} style={{ whiteSpace: 'pre-wrap' }}><i>{strTitleRemark}</i></Typography>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        {this.props.showDetail ?
                            <Grid item xs={1} container justify={'flex-end'}>
                                {this.props.showDetail && prescriptionData.isShowAdvanced &&
                                    <CIMSButton
                                        id={'prescription_PrescriptionPanel' + index + '_basicCIMSButton'}
                                        type={'button'}
                                        className={classes.btn}
                                        onClick={() => this.showAdvanced(false)}
                                    >Basic</CIMSButton>
                                }
                                {this.props.showDetail && !prescriptionData.isShowAdvanced &&
                                    <CIMSButton
                                        id={'prescription_PrescriptionPanel' + index + '_advancedCIMSButton'}
                                        type={'button'}
                                        className={classes.btn}
                                        onClick={() => this.showAdvanced(true)}
                                    >Advanced</CIMSButton>
                                }
                            </Grid>
                            :
                            null}
                    </Grid>
                </ListItem>
                {
                    this.props.showDetail ?
                        <Typography component={'div'}>
                            <ValidatorForm ref={'form'} onSubmit={(e) => this.handleConfirm(e)} onError={this.handleSubmitError} /*className={`${formClasses}`}*/>
                                {prescriptionData.isShowAdvanced &&
                                    <Grid container spacing={1} justify={'flex-end'}>
                                        <Grid item>
                                            <CIMSButton
                                                id={'prescription_PrescriptionPanel' + index + '_MultiLineCIMSButton'}
                                                type={'button'}
                                                className={showMultipleLine ? classes.highlightBtn : classes.btn}
                                                // onClick={this.handleBtnMultipleLine}
                                                onClick={() => this.handleAddMulDoses(ORDER_LINE_TYPE.MULTIPLE_LINE, 1)}
                                                disabled={this.state.disabledBtn && !showMultipleLine}
                                            >Multiple Line</CIMSButton>
                                            <CIMSButton
                                                id={'prescription_PrescriptionPanel' + index + '_StepUpDownCIMSButton'}
                                                type={'button'}
                                                className={showStepUpDown ? classes.highlightBtn : classes.btn}
                                                // onClick={this.handleBtnStepUpDown}
                                                onClick={() => this.handleAddMulDoses(ORDER_LINE_TYPE.STEP_UP_AND_DOWN, 1)}
                                                disabled={this.state.disabledBtn && !showStepUpDown}
                                            >Step Up/Down</CIMSButton>
                                            <CIMSButton
                                                id={'prescription_PrescriptionPanel' + index + '_SpecInterCIMSButton'}
                                                type={'button'}
                                                className={this.state.isShowSpecialInterval ? classes.highlightBtn : classes.btn}
                                                disabled={this.state.disabledBtn && !this.state.isShowSpecialInterval}
                                                onClick={this.handleBtnSpecialInterval}
                                            >Special Interval</CIMSButton>
                                        </Grid>

                                    </Grid>
                                }
                                {prescriptionData.freeText === 'F' ?
                                    <FreeTextPanelField
                                        id={'prescription_PrescriptionPanel'}
                                        handleChange={this.handleChange}
                                        onSelectedItem={this.onSelectedItem}
                                        handelCheckboxChange={this.handelCheckboxChange}
                                        validatorListener={this.props.validatorListener}
                                        panelClasses={classes}
                                        index={index}
                                        prescriptionData={prescriptionData}
                                        codeList={this.props.codeList}
                                        freqCodeList={this.state.freqCodeList}
                                        isShowAdvanced={prescriptionData.isShowAdvanced}
                                        showMultipleLine={showMultipleLine}
                                        showStepUpDown={showStepUpDown}
                                        // handleAddMultipleLine={this.handleAddMultipleLine}
                                        // handleAddStepUpDown={this.handleAddStepUpDown}
                                        // handleDeleteMultipleLine={this.handleDeleteMultipleLine}
                                        handleMultipleChange={this.handleMultipleChange}
                                        onMultipleSelectedItem={this.onMultipleSelectedItem}
                                        handelMultipleCheckboxChange={this.handelMultipleCheckboxChange}
                                        closeMultipleFrequencyDialog={this.closeMultipleFrequencyDialog}
                                        handleChangeSite={this.handleChangeSite}
                                        sitesCodeList={this.state.sitesCodeList}
                                        updateOrderLineField={this.updateOrderLineField}
                                        isShowSpecialInterval={this.state.isShowSpecialInterval}
                                        handleBtnPopUpSpecialinterval={this.handleBtnPopUpSpecialinterval}
                                        handleDeleteSpecialInterval={this.handleDeleteSpecialInterval}
                                        handleSpecialIntervalChange={this.handleSpecialIntervalChange}
                                        handleSpecialIntervalSelectChange={this.handleSpecialIntervalSelectChange}
                                        handleSpecialIntervalConfirm={this.handleSpecialIntervalConfirm}
                                        handleFocusDose={this.handleFocusDose}
                                        logOldData={this.logOldData}
                                        //route
                                        routeCodeList={this.state.routeCodeList}
                                        openRouteComponent={this.state.openRouteComponent}
                                        toggleRouteComponent={this.toggleRouteComponent}
                                        //site
                                        openSiteComponent={this.state.openSiteComponent}
                                        toggleSiteComponent={this.toggleSiteComponent}

                                        handleAddMulDoses={this.handleAddMulDoses}
                                        handleDeleteMulDosesRow={this.handleDeleteMulDosesRow}
                                    />
                                    :
                                    <PanelField
                                        id={'prescription_PrescriptionPanel'}
                                        handleChange={this.handleChange}
                                        onSelectedItem={this.onSelectedItem}
                                        handelCheckboxChange={this.handelCheckboxChange}
                                        onSelectedDate={this.onSelectedDate}
                                        validatorListener={this.props.validatorListener}
                                        panelClasses={classes}
                                        index={index}
                                        prescriptionData={prescriptionData}
                                        codeList={this.props.codeList}
                                        isShowAdvanced={prescriptionData.isShowAdvanced}
                                        showMultipleLine={showMultipleLine}
                                        showStepUpDown={showStepUpDown}
                                        // handleAddMultipleLine={this.handleAddMultipleLine}
                                        // handleAddStepUpDown={this.handleAddStepUpDown}
                                        // handleDeleteMultipleLine={this.handleDeleteMultipleLine}
                                        handleMultipleChange={this.handleMultipleChange}
                                        onMultipleSelectedItem={this.onMultipleSelectedItem}
                                        handelMultipleCheckboxChange={this.handelMultipleCheckboxChange}
                                        closeMultipleFrequencyDialog={this.closeMultipleFrequencyDialog}
                                        backDate={this.props.backDate}
                                        handleChangeSite={this.handleChangeSite}
                                        sitesCodeList={this.state.sitesCodeList}
                                        updateOrderLineField={this.updateOrderLineField}
                                        isShowSpecialInterval={this.state.isShowSpecialInterval}
                                        handleBtnPopUpSpecialinterval={this.handleBtnPopUpSpecialinterval}
                                        handleDeleteSpecialInterval={this.handleDeleteSpecialInterval}
                                        handleSpecialIntervalChange={this.handleSpecialIntervalChange}
                                        handleSpecialIntervalSelectChange={this.handleSpecialIntervalSelectChange}
                                        handleDoseOnBlur={this.handleDoseOnBlur}
                                        handleMaxDoseConditionOnBlur={this.handleMaxDoseConditionOnBlur}
                                        handleOnBlurChange={this.handleOnBlurChange}
                                        handleChangeDose={this.handleChangeDose}
                                        handleFocusDose={this.handleFocusDose}
                                        handleSpecialIntervalConfirm={this.handleSpecialIntervalConfirm}
                                        logOldData={this.logOldData}
                                        //route
                                        routeCodeList={this.state.routeCodeList}
                                        openRouteComponent={this.state.openRouteComponent}
                                        toggleRouteComponent={this.toggleRouteComponent}
                                        //site
                                        openSiteComponent={this.state.openSiteComponent}
                                        toggleSiteComponent={this.toggleSiteComponent}
                                        drug={this.props.drug}

                                        handleAddMulDoses={this.handleAddMulDoses}
                                        handleDeleteMulDosesRow={this.handleDeleteMulDosesRow}
                                    />
                                }
                                {errorMessageList && errorMessageList.length > 0 &&
                                    <Grid item container style={{ marginTop: '10px', padding: 5 }} id={'prescription_PrescriptionPanel' + index + '_errorMsgList'}>
                                        {prescriptionUtilities.getErrorMessageList(errorMessageList).map((item, i) => (
                                            <Grid item container key={i} justify="flex-start">
                                                <Typography color={'error'} className={classes.errorFieldNameText}>{`${item.fieldName}: ${item.errMsg}`}</Typography>
                                            </Grid>
                                        ))
                                        }
                                    </Grid>
                                }
                                {this.props.isSaveSuccess === false
                                    && this.props.saveMessageList
                                    && Array.isArray(this.props.saveMessageList) ?
                                    this.props.saveMessageList.map((item, _index) => (
                                        <Grid item container key={_index} justify="flex-start">
                                            <Typography color={'error'} className={classes.errorFieldNameText}>{`${item.fieldName}: ${item.errMsg}`}</Typography>
                                        </Grid>
                                    ))
                                    : <Grid item container key={index} justify="flex-start">
                                        <Typography color={'error'} className={classes.errorFieldNameText}>{this.props.saveMessageList}</Typography>
                                    </Grid>
                                }
                                <Grid container direction={'row'}>
                                    <Grid item xs={6}>
                                        {errorMessageList
                                            && errorMessageList.length > 0
                                            && this.state.showProceedBtn
                                            && prescriptionData.dangerDrug === 'N'
                                            &&
                                            <div>
                                                <CIMSButton className={classes.btn} id={'prescription_printMessageCIMSButton'}>Print Message</CIMSButton>
                                                {/* <CIMSButton className={classes.btn} onClick={() => this.handleProceedSave(false)} id={'prescription_goEditCIMSButton'}>Go to edit</CIMSButton> */}
                                                <CIMSButton className={classes.btn} onClick={(e) => this.handleProceedSave(e, true)} id={'prescription_proceedSaveCIMSButton'} disabled={this.state.isDisabledConfirm}>Proceed to save</CIMSButton>
                                            </div>
                                        }
                                    </Grid>
                                    <Grid item container xs={6} justify={'flex-end'} /*className={`${classes.colorClasses}`}*/>
                                        <CIMSButton
                                            id={'confirmCIMSButton'}
                                            type={'button'}
                                            className={classes.btn}
                                            onClick={this.handlePreConfirm}
                                            disabled={this.state.isDisabledConfirm}
                                        >Confirm</CIMSButton>
                                        <CIMSButton
                                            id={'cancelCIMSButton'}
                                            type={'button'}
                                            className={classes.btn}
                                            onClick={() => this.props.cancelClick(this.state.prescriptionData)}
                                        >Cancel</CIMSButton>
                                    </Grid>
                                </Grid>
                            </ValidatorForm>

                        </Typography>
                        : null
                }
                {/* <CIMSAlertDialog
                    id="delete_dialog"
                    open={this.state.showDeleteDialog}
                    // onClickOK={this.state.isDeleteOrder ? this.showDeleteReamrk : this.handelConfirmDelete }
                    onClickOK={this.handleDeleteDrug}
                    onClickCancel={() => this.handleDeleteDialog(false)}
                    dialogTitle="Question"
                    dialogContentText={
                        <Typography component={'div'} variant={'subtitle2'} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'pre-wrap' }}>
                            <img src={questionIcon} alt="" />{(this.state.prescriptionData.orderDetailId && this.state.isDeleteOrder) ? '    No item in the prescription, this order will be deleted.' : '    Confirm delete this prescription item?'}
                        </Typography>

                    }
                    cancelButtonName={this.state.isDeleteOrder ? 'Cancel' : 'No'}
                    okButtonName={this.state.isDeleteOrder ? 'OK' : 'Yes'}
                    // dialogTitle="Question"
                    // dialogContentText={'No item in the prescription, this order will be deleted.'}
                    // okButtonName={'OK'}
                    btnCancel
                /> */}
                {this.state.frequencyItem && this.state.frequencyItem.open &&
                    <FrequencyDialog
                        id={'prescription_PrescriptionPanel_FrequencyDialog' + index}
                        frequency={this.state.frequencyItem}
                        dialogTitle={'Frequency'}
                        handleChange={this.state.frequencyItem && this.state.frequencyItem.type === 'R' ? (e) => this.updateOrderLineField(e, '', 'freq1', 'R') : this.updatePrescriptionField}
                        name={'freq1'}
                        freqValue={this.state.frequencyItem && this.state.frequencyItem.type === 'R' ? (prescriptionData && prescriptionData.specialInterval.freq1) : (prescriptionData && prescriptionData.freq1)}
                        codeList={this.state.freqCodeList}
                        okClick={this.closeFrequencyDialog}
                    />
                }
                <CIMSDialog
                    open={this.state.isPopUpSpecialInterval}
                    id="SpecialIntervalDialog"
                >
                    <SpecialInterval
                        handleCancelSpecInter={this.handleCancelSpecInter}
                        prescriptionData={prescriptionData}
                        specialIntervalData={prescriptionData && prescriptionData.specialInterval}
                        // handleSpecInterRadioChange={this.handleSpecInterRadioChange}
                        // handleSpecInterBehindRadionInputChange={this.handleSpecInterBehindRadionInputChange}
                        // handleSpeIntDayOfWeekChange={this.handleSpeIntDayOfWeekChange}
                        // handleFromToDay={this.handleFromToDay}
                        // handleChangeTab={this.handleChangeTab}
                        index={this.props.index}
                        handleSpecialIntervalConfirm={this.handleSpecialIntervalConfirm}
                        codeList={this.props.codeList}
                    />
                </CIMSDialog>
                {/* <CIMSAlertDialog
                    id="amendDose_dialog"
                    open={this.state.isPopUpAmendedDose}
                    // onClickOK={() => { this.setState({ isPopUpAmendedDose: false, isCheckingTotalDosage: false }); }}
                    onClickOK={() => this.preConfirmInEditDoes()}
                    onClickCancel={() => this.emptyDose()}
                    dialogTitle="Notice to Prescriber"
                    dialogContentText={
                        <Typography component={'div'} variant={'subtitle2'} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'pre-wrap', minWidth: '500px' }}>
                            The prescribed dose(s) is/are amended.
                        </Typography>

                    }
                    cancelButtonName="Edit total dose"
                    okButtonName="Confirm amended dose"
                    btnCancel
                /> */}
                {/* {this.props.maxDosage ?
                    <CIMSAlertDialog
                        id="greaterThanMaxDosage_dialog"
                        open={this.state.isPopupGreaterThanMaxDosage}
                        onClickOK={() => this.emptyDose()}
                        dialogTitle="Notice to Prescriber"
                        dialogContentText={
                            <Typography component={'div'} variant={'subtitle2'} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'pre-wrap', minWidth: '500px' }}>
                                The prescribed total doses cannot be greater than {this.props.maxDosage && this.state.emptyDose ? this.state.emptyDose.substr(0, 1) === ORDER_LINE_TYPE.SPECIAL_INTERVAL && this.state.emptyDose.substr(1, 1) === '2' ? this.props.maxDosage[1].maxDosage : this.props.maxDosage[0].maxDosage : ''}
                            </Typography>
                        }
                        cancelButtonName="Edit total dose"
                        okButtonName="Edit total dose"
                    />
                    :
                    null
                } */}

            </Typography >
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isSaveSuccess: state.moe.isSaveSuccess,
        saveMessageList: state.moe.saveMessageList,
        drugList: state.moe.drugList,
        specialIntervalText: state.moe.specialIntervalText,
        actionCd: state.moe.actionCd,
        maxDosage: state.moe.maxDosage,
        allergyChecking: state.moe.allergyChecking,
        backDate: state.moe.backDate
    };
};

const mapDispatchToProps = {
    getTotalDangerDrug,
    getAllergyChecking,
    openCommonCircular,
    closeCommonCircular,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MoePrescriptionPanel));