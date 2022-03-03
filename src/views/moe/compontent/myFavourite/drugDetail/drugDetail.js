import React, { Component } from 'react';
import {
    Grid,
    Typography,
    IconButton,
    Tooltip
} from '@material-ui/core';
import iconCancel from '../../../../../images/moe/cancel.png';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import CIMSDialog from '../../../../../components/Dialog/CIMSDialog';
import * as myFavUtitlites from '../../../../../utilities/moe/myFavouriteUitlities';
import * as deptFavUtilities from '../../../../../utilities/prescriptionUtilities';
import * as moeUtilities from '../../../../../utilities/moe/moeUtilities';
import _ from 'lodash';
import warningIcon from '../../../../../images/moe/warning.gif';
import imgDangerDrug from '../../../../../images/moe/dangerous_drug.png';
import {
    ORDER_LINE_TYPE,
    PANEL_FIELD_NAME
} from '../../../../../enums/moe/moeEnums';
import {
    getTotalDangerDrug,
    getSpecialIntervalText
} from '../../../../../store/actions/moe/moeAction';
import {
    updateField,
    // getSpecialIntervalText,
    // getTotalDangerDrug,
    addToMyFavourite,
    // deleteDrugSet,
    // cancelCache
    deleteMyFavourite
} from '../../../../../store/actions/moe/myFavourite/myFavouriteAction';
import EditDrugPanel from './editDrugPanel';
import FrequencyDialog from '../../dialog/frequencyDialog';
import {
    openCommonCircular,
    closeCommonCircular
    // openErrorMessage
} from '../../../../../store/actions/common/commonAction';
//import * as commonUtilities from '../../utilities/commonUtilities';
import SpecialInterval from './specialInterval';
import DuplicateDrugDialog from '../../dialog/duplicateDrugDialog';
// import MaxDurationDialog from '../dialog/maxDurationDialog';
// import MinQuantityDialog from '../dialog/minQuantityDialog';
import CIMSAlertDialog from '../../../../../components/Dialog/CIMSAlertDialog';
import questionIcon from '../../../../../images/moe/icon-question.gif';
import * as commonUtilities from '../../../../../utilities/commonUtilities';
// import moment from 'moment';
// import Enum from '../../../../../enums/enum';
import * as prescriptionUtilities from '../../../../../utilities/prescriptionUtilities';
import { drugDetailStyles as styles } from '../../../../moe/moeStyles';

class DrugDetail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            originalDrug: _.cloneDeep(this.props.curDrugDetail),

            panelTitleData: null,
            showConfirmButton: true,
            disabledBtn: false,
            showMultipleLine: false,
            showStepUpDown: false,
            errorMessageList: [],

            //preceed save
            showProceedBtn: null,

            //frequency
            frequencyItem: null,
            freqCodeList: [],

            isDeleteOrder: false,
            isShowSpecialInterval: false,
            isPopUpSpecialInterval: false,

            isDisabledConfirm: false,
            // showMaxDurationDialog: false,
            // showMinQuantityDialog: false

            showDelDrugSetDialog: false,

            //Panel
            updatingFieldName: null,
            updatingFiledVal: null
        };
    }


    componentDidMount() {
        // this.setState({prescriptionData: _.cloneDeep(this.props.curDrugDetail)});
        ValidatorForm.addValidationRule('isDecimal', (value) => {
            return deptFavUtilities.checkIsDecimal(value);
        });
        if (this.props.curDrugDetail.moeMedMultDoses && this.props.curDrugDetail.moeMedMultDoses.length > 0) {
            this.handleAddMulDoses(this.props.curDrugDetail.orderLineType);
        }
        // if (this.props.curDrugDetail && this.props.curDrugDetail.multipleLine && this.props.curDrugDetail.multipleLine.length > 0) {
        //     this.handleBtnMultipleLine();
        // }
        // if (this.props.curDrugDetail && this.props.curDrugDetail.stepUpDown && this.props.curDrugDetail.stepUpDown.length > 0) {
        //     this.handleBtnStepUpDown();
        // }
        if (this.props.curDrugDetail && this.props.curDrugDetail.specialInterval && this.props.curDrugDetail.specialInterval != null) {
            this.setState({
                disabledBtn: true,
                isShowSpecialInterval: true
            });
        }
    }

    componentDidUpdate() {
        const dialog = document.getElementById(this.props.id + '_PrescriptionPanel');
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

    //prescription panel validation
    validatorListener = (isValid, message, name, otherName) => {
        let { errorMessageList } = this.state;
        if (!errorMessageList) errorMessageList = [];

        if (isValid && message) {
            let otherList = [];
            otherList = errorMessageList.filter(item => item.fieldName === name && item.otherName !== otherName);
            errorMessageList = errorMessageList.filter(item => item.fieldName !== name);
            errorMessageList.push(...otherList);
        } else {
            let error = errorMessageList.find(item => item.fieldName === name && item.otherName === otherName);
            if (error) {
                error.errMsg = message;
            } else {
                errorMessageList.push({ fieldName: name, errMsg: message, otherName: otherName });
            }
        }
        this.setState({ errorMessageList });
    }

    //Pre-submission processing, if not modified do not call the API
    handlePreConfirm = () => {
        if (!this.state.isCheckingTotalDosage) {
            this.setState({
                isDisabledConfirm: true
            }, () => {
                this.props.openCommonCircular();
                const { originalDrug } = this.state;
                const prescriptionData = _.cloneDeep(this.props.curDrugDetail);
                // if (prescriptionData.orderDetailId && JSON.stringify(drug) === JSON.stringify(prescriptionData)) {
                if (this.props.drugSetItem && this.props.drugSetItem.moeMedProfiles && this.props.drugSetItem.moeMedProfiles.find(item => item.orgItemNo === originalDrug.orgItemNo) && commonUtilities.CompareJSON(originalDrug, prescriptionData)) {
                    this.closePrescriptionPanel();
                    this.props.closeCommonCircular();
                    return false;
                }
                this.refs.form.submit();
                // this.handleConfirm();
            });
        }
    }

    handleProceedSave = (isSave) => {
        this.setState({
            // openProceedSaveDialog: false,
            // errorLabelList: []
            showProceedBtn: false,
            isDisabledConfirm: true
        }, () => {
            if (isSave)
                this.handleConfirm();
        });
    }

    handleConfirm = () => {
        this.props.closeCommonCircular();
        this.setState({
            isDisabledConfirm: false
        }, () => {
            //this.minQuantityCheckAll([this.props.curDrugDetail]);
            this.confirmDrug(this.props.curDrugDetail, this.props.drugSetItem);
            // this.handleCheckDuplicate(this.props.curDrugDetail);
        });
        return;
    }

    confirmDrug = (data, drugSetList, delMultipleSet, isSkipSave) => {
        //let newItem = _.cloneDeep(this.props.drugSetItem);
        let newItem = drugSetList;
        if (!newItem) newItem = {
            moeMedProfiles: []
        };
        let moeMedProfiles = _.cloneDeep(newItem.moeMedProfiles) || [];

        //New data overrides existing data
        moeMedProfiles = moeMedProfiles.map(item => {
            if (data && data.orgItemNo === item.orgItemNo) {
                data.isNewForDelete = false;
                item = data;
            }
            return item;
        });

        // moeMedProfiles = moeMedProfiles && moeMedProfiles.filter(item => item.itemStatus !== 'D');

        // newItem.moeMedProfiles = moeMedProfiles;
        this.props.addToMyFavourite(
            moeMedProfiles,
            newItem,
            this.props.codeList,
            true,
            this.props.favKeyword,
            delMultipleSet,
            null,
            isSkipSave
        );
    }

    handleCheckDuplicate = (data) => {
        const existDrugSetItem = _.cloneDeep(this.props.drugSetItem);
        if (!existDrugSetItem || !data) return;

        let duplicateList = null;

        if (existDrugSetItem.myFavouriteName) {
            if (existDrugSetItem.moeMedProfiles && existDrugSetItem.moeMedProfiles.length > 0) {
                //Filter existing data
                existDrugSetItem.moeMedProfiles = existDrugSetItem.moeMedProfiles.filter(item => item.orgItemNo !== data.orgItemNo);
                duplicateList = myFavUtitlites.checkFavDuplicate(existDrugSetItem.moeMedProfiles, data);
            } else {
                this.confirmDrug(data, existDrugSetItem);
                return;
            }
        } else if (!existDrugSetItem.myFavouriteName) {
            let withoutDrugSet = [];
            for (let i = 0; i < this.props.myFavouriteList.length; i++) {
                if (!this.props.myFavouriteList[i].myFavouriteName) {
                    this.props.myFavouriteList[i].moeMedProfiles.map(item => {
                        if ((existDrugSetItem && existDrugSetItem.myFavouriteId
                            && existDrugSetItem.myFavouriteId !== this.props.myFavouriteList[i].myFavouriteId)
                            || (!existDrugSetItem)) {
                            item.isSingleDrug = true;
                            item.myFavouriteId = this.props.myFavouriteList[i].myFavouriteId;
                            item.delParams = {
                                'myFavouriteId': this.props.myFavouriteList[i].myFavouriteId,
                                'frontMyFavouriteId': this.props.myFavouriteList[i].frontMyFavouriteId,
                                'version': this.props.myFavouriteList[i].version
                            };
                            withoutDrugSet.push(item);
                        }
                    });
                }
            }
            data.delParams = {
                'myFavouriteId': existDrugSetItem.myFavouriteId,
                'frontMyFavouriteId': existDrugSetItem.frontMyFavouriteId,
                'version': existDrugSetItem.version
            };
            duplicateList = myFavUtitlites.checkFavDuplicate(withoutDrugSet, data);
        }

        //replace drug if drug set without drug name
        if (existDrugSetItem.moeMedProfiles
            && existDrugSetItem.moeMedProfiles.length > 0
            && !existDrugSetItem.myFavouriteName) {
            existDrugSetItem.moeMedProfiles = [];
        }

        if (duplicateList && duplicateList.length > 0) {
            //update reducer data
            let updateData = {};

            data.isNewForDelete = true;
            duplicateList.push(data);

            updateData.duplicateDrugList = duplicateList;
            updateData.openDuplicateDialog = true;
            updateData.isSaveSuccess = false;
            updateData.saveMessageList = null;
            this.props.updateField(updateData);
        } else {
            this.confirmDrug(data, this.props.drugSetItem);
        }
    }

    closeDuplicateDialog = (timeout) => {
        if (!timeout) timeout = 1000;
        let updateData = {};
        updateData.duplicateDrugList = [];
        updateData.openDuplicateDialog = false;
        updateData.selectedDeletedList = [];
        this.props.updateField(updateData);
        setTimeout(() => {
            this.props.closeCommonCircular();
        }, timeout);
    }

    confirmDeleteDuplicateDrug = (isSkipDelDialog) => {
        let selectedList = _.cloneDeep(this.props.selectedDeletedList);
        let curDrugSetItem = _.cloneDeep(this.props.drugSetItem);
        let curDrugDetail = _.cloneDeep(this.props.curDrugDetail);

        let delMultipleSet = [];

        if (!curDrugSetItem || !curDrugDetail) return;

        let isSingleDrug = !curDrugSetItem.myFavouriteName;

        let isSkipSave = false;

        if (selectedList && selectedList.length > 0) {

            if (!isSkipDelDialog && !isSingleDrug && curDrugSetItem.moeMedProfiles.length === selectedList.length) {
                this.setState({
                    showDelDrugSetDialog: true
                });
                return;
            }

            let selectedOrderDruglist = selectedList.filter(item => !item.isNewForDelete);
            //new drug list
            let selectedNewDrugList = selectedList.filter(item => item.isNewForDelete);

            if (selectedOrderDruglist && selectedOrderDruglist.length > 0) {

                if (isSingleDrug) {
                    //single drug set logic
                    selectedOrderDruglist.filter(item => {
                        delMultipleSet.push(item.delParams);
                    });
                } else {
                    curDrugSetItem.moeMedProfiles = curDrugSetItem.moeMedProfiles.filter(item => selectedOrderDruglist.find(ele => ele.orgItemNo !== item.orgItemNo));
                }
            }
            //handle new drugs
            if (selectedNewDrugList && selectedNewDrugList.length > 0) {
                if (isSingleDrug) {
                    //single drug set logic
                    selectedNewDrugList.filter(item => {
                        delMultipleSet.push(item.delParams);
                    });
                    isSkipSave = true;
                } else {
                    curDrugSetItem.moeMedProfiles = curDrugSetItem.moeMedProfiles.filter(item => selectedNewDrugList.find(ele => ele.orgItemNo !== item.orgItemNo));
                }
            }
            this.confirmDrug(null, curDrugSetItem, delMultipleSet, isSkipSave);
        } else {
            this.confirmDrug(curDrugDetail, curDrugSetItem, delMultipleSet, isSkipSave);
        }
    }

    handleChangeDeletedCb = (e, checked, item, index) => {
        let selectedList = _.cloneDeep(this.props.selectedDeletedList);
        if (checked) {
            selectedList.splice(index, 0, item);
        } else {
            selectedList.splice(index, 1);
        }
        let updateData = {};
        updateData.selectedDeletedList = selectedList;
        this.props.updateField(updateData);
    }

    // handleDeleteDialog = (curDrugDetail) => {
    //     let drugSetItem = this.props.drugSetItem;
    //     if (drugSetItem) {
    //         let isCreateDrug = true;
    //         for (let i = 0; i < drugSetItem.moeMedProfiles.length; i++) {
    //             if (drugSetItem.moeMedProfiles[i].orgItemNo === curDrugDetail.orgItemNo) {
    //                 isCreateDrug = false;
    //             }
    //         }
    //         if (isCreateDrug) {
    //             this.closePrescriptionPanel();
    //         } else {
    //             this.props.handleDeleteDialog('    Confirm delete this prescription item?', false);
    //         }
    //     } else {
    //         this.closePrescriptionPanel();
    //     }
    // }

    handleDeleteDrug = (curDrugDetail) => {
        let curDrugSet = _.cloneDeep(this.props.drugSetItem);

        let drugs = curDrugSet.moeMedProfiles;
        drugs = drugs.filter(item => item.orgItemNo !== curDrugDetail.orgItemNo);
        curDrugSet.moeMedProfiles = drugs;
        this.confirmDrug(null, curDrugSet);

        this.closePrescriptionPanel();
    }

    deleteDrugSet = () => {
        let drugSetItem = _.cloneDeep(this.props.drugSetItem);
        let params = {
            'myFavouriteId': drugSetItem.myFavouriteId,
            'frontMyFavouriteId': drugSetItem.frontMyFavouriteId,
            'version': drugSetItem.version
        };
        this.props.deleteDrugSet(params);
    }

    handleChange = (e) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        const name = e.target.name;
        if ((prescriptionData[name] || '') == e.target.value) return;
        prescriptionData[name] = e.target.value;
        if (name != 'txtSpecInst' && name != 'txtQty')
            prescriptionData.txtQty = '';
        // this.setState({
        //     prescriptionData
        // });
        moeUtilities.updateMultDoseFirstRow(prescriptionData, name, e.target.value);
        this.props.updateField({ curDrugDetail: prescriptionData });
        // let fields = { value: e.target.value, name: e.target.name };
        // this.updatePrescriptionField(fields);
        this.resetProceedBtn();
    }

    onSelectedItem = (e, name) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        if (prescriptionData[name] == e.value) return;
        if (name === 'ddlFreq') {
            let freqValue = 0;
            if (e.useInputValue === 'Y') {
                const freqCodeList = deptFavUtilities.getFreqCodeList(e.label);
                if (prescriptionData && prescriptionData.freq1 && prescriptionData.freq1 !== freqValue && prescriptionData.ddlFreq === e.value) {
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

        this.props.updateField({ curDrugDetail: prescriptionData });
        this.setState({ howProceedBtn: null });
    }

    updateOrderLineField = (e, lineId, name, listStyle) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
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
        this.props.updateField({ curDrugDetail: prescriptionData });
    }

    //Frequency
    closeFrequencyDialog = (name, value) => {
        let fields = { value: value, name: name };
        this.updatePrescriptionField(fields);
        this.setState({ frequencyItem: null, freqCodeList: [] });
        this.handleOnBlurChange();
    }

    updatePrescriptionField = (fields) => {
        let { name, value } = fields;
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        prescriptionData[name] = value;
        this.props.updateField({ curDrugDetail: prescriptionData });
    }

    resetProceedBtn = () => {
        this.setState({ showProceedBtn: false });
    }

    handleSubmitError = (errors) => {
        let showProceedBtn = false;
        let routeError = errors && errors.find(item => item.state.name === 'ddlRoute');
        if (!routeError) {
            const { errorMessageList } = this.state;
            if (errorMessageList) {
                let requiredList = errorMessageList.filter(item => item.errMsg.indexOf('required') !== -1);
                if (requiredList && requiredList.length > 0 && requiredList.length === errorMessageList.length) {
                    showProceedBtn = true;
                }
            }
        }
        this.props.closeCommonCircular();
        //this.props.updateField({ showProceedBtn: showProceedBtn });
        this.setState({ showProceedBtn: showProceedBtn, isDisabledConfirm: false });
    }

    showAdvanced = (isShowAdvanced, isMul) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
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

        if (!isShowAdvanced) {
            prescriptionData.ddlSite = '';
            prescriptionData.ddlPrep = '';
            prescriptionData.ddlActionStatus = null;
            prescriptionData.txtStartFrom = null;
        } else if (!isMul) {
            prescriptionData.ddlActionStatus = 'Y';
            let convertData = prescriptionData.convertData;
            let prep = prescriptionUtilities.getPrepForUI(convertData);
            prescriptionData.ddlPrep = prep.ddlPrep;
        }

        let updateState = {
            disabledBtn: false,
            showMultipleLine: false,
            showStepUpDown: false,
            isShowSpecialInterval: false
        };
        if (this.props.showEditPanel && !prescriptionData.isShowAdvanced) {
            let { errorMessageList } = this.state;
            let error = errorMessageList.filter(item => {
                if (item.otherName && (item.otherName.indexOf('multipleLine') === -1 || item.otherName.indexOf('stepUpDown') === -1)) {
                    return null;
                }
                return item;
            });
            updateState.errorMessageList = error;
        }
        this.props.updateField({ curDrugDetail: prescriptionData });
        this.setState(updateState);
    }

    handleAddMulDoses = (orderLineType, multDoseNo) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
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


        this.props.updateField({ curDrugDetail: prescriptionData });
        this.setState(updateState);
    }
    handleDeleteMulDosesRow = (index) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        prescriptionData.moeMedMultDoses.splice(index, 1);
        if (prescriptionData.moeMedMultDoses.length === 1) {
            this.showAdvanced(true, true);
            return;
        }
        this.props.updateField({ curDrugDetail: prescriptionData });
    }

    // handleBtnMultipleLine = () => {
    //     let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
    //     prescriptionData.txtQty = '';
    //     let multipleLine = prescriptionData.multipleLine;
    //     if (!multipleLine) multipleLine = [];
    //     if (multipleLine.length === 0) {
    //         multipleLine.push({
    //             multDoseNo: 1,
    //             txtDosage: '',
    //             ddlFreq: '',
    //             // freq1: 0,
    //             frequencyItem: '',
    //             txtDangerDrugQty: ''
    //         });
    //     }
    //     if (multipleLine.length === 1 /*&& this.props.curDrugDetail.dangerDrug === 'Y'*/) {
    //         let arryMulti = {
    //             multDoseNo: 2,
    //             txtDosage: '',
    //             ddlFreq: '',
    //             // freq1: 0,
    //             frequencyItem: '',
    //             txtDangerDrugQty: ''
    //         };
    //         multipleLine.push(arryMulti);
    //         multipleLine[0].txtDangerDrugQty = _.cloneDeep(this.props.curDrugDetail).txtDangerDrugQty;
    //     }
    //     prescriptionData.multipleLine = multipleLine;
    //     prescriptionData.orderLineType = ORDER_LINE_TYPE.MULTIPLE_LINE;
    //     this.props.updateField({ curDrugDetail: prescriptionData });
    //     this.setState({
    //         disabledBtn: true,
    //         showMultipleLine: true
    //     });
    // }

    // handleBtnStepUpDown = () => {
    //     let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
    //     prescriptionData.txtQty = '';
    //     let stepUpDown = prescriptionData.stepUpDown;
    //     if (!stepUpDown) stepUpDown = [];
    //     if (stepUpDown.length === 0) {
    //         stepUpDown.push({
    //             multDoseNo: 1,
    //             txtDosage: '',
    //             ddlFreq: '',
    //             chkPRN: 'N',
    //             txtDuration: '',
    //             ddlDurationUnit: '',
    //             // freq1: 0,
    //             frequencyItem: '',
    //             txtDangerDrugQty: ''
    //         });
    //     }
    //     if (stepUpDown.length === 1 /*&& this.props.curDrugDetail.dangerDrug === 'Y'*/) {
    //         let arryMulti = {
    //             multDoseNo: 2,
    //             txtDosage: '',
    //             ddlFreq: '',
    //             chkPRN: 'N',
    //             txtDuration: '',
    //             ddlDurationUnit: '',
    //             // freq1: 0,
    //             frequencyItem: '',
    //             txtDangerDrugQty: ''
    //         };
    //         stepUpDown.push(arryMulti);
    //         stepUpDown[0].txtDangerDrugQty = _.cloneDeep(this.props.curDrugDetail).txtDangerDrugQty;
    //     }
    //     prescriptionData.stepUpDown = stepUpDown;
    //     prescriptionData.orderLineType = ORDER_LINE_TYPE.STEP_UP_AND_DOWN;
    //     this.props.updateField({ curDrugDetail: prescriptionData });
    //     this.setState({
    //         disabledBtn: true,
    //         showStepUpDown: true
    //     });
    // }

    closeMultipleFrequencyDialog = (name, value, index) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        prescriptionData.moeMedMultDoses[index].frequencyItem = null;
        // if (this.state.showMultipleLine) {
        //     prescriptionData.multipleLine[index].frequencyItem = null;
        // }
        // else if (this.state.showStepUpDown) {
        //     prescriptionData.stepUpDown[index].frequencyItem = null;
        // }
        this.props.updateField({ curDrugDetail: prescriptionData });
    }

    closePrescriptionPanel = () => {
        let updateData = {
            showEditPanel: false,
            curDrugDetail: null
        };
        this.props.updateField(updateData);
        this.setState({
            errorMessageList: []
        });
    }

    //special interval
    handleBtnSpecialInterval = () => {
        let { specialInterval } = _.cloneDeep(this.props.curDrugDetail);
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
        this.setState({
            isPopUpSpecialInterval: true
        });
    }
    handleAddSpecialInterval = () => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
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
            // freq1: '',
            txtDangerDrugQty: ''
        };
        prescriptionData.specialInterval = arrySpecialInterval;
        prescriptionData.orderLineType = ORDER_LINE_TYPE.SPECIAL_INTERVAL;
        this.props.updateField({ curDrugDetail: prescriptionData });
        this.setState({
            isPopUpSpecialInterval: true
        });
    }

    handleCancelSpecInter = () => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        if (prescriptionData.specialInterval && !prescriptionData.specialInterval.supplFreqId) {
            this.handleDeleteSpecialInterval();
        }
        this.setState({
            isPopUpSpecialInterval: false
        });
    }

    handleDeleteSpecialInterval = () => {
        this.showAdvanced(true, true);
    }

    handleSpecialIntervalSelectChange = (e, name) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        if (prescriptionData.specialInterval == e.value) return;
        if (name === 'ddlFreq') {
            let freqValue = 0;
            if (e.useInputValue === 'Y') {
                const freqCodeList = deptFavUtilities.getFreqCodeList(e.label);
                if (prescriptionData && prescriptionData.specialInterval.freq1 && prescriptionData.specialInterval.freq1 !== freqValue && prescriptionData.specialInterval.ddlFreq === e.value) {
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
        this.props.updateField({ curDrugDetail: prescriptionData });
    }

    logOldData = (updatingFieldName, updatingFieldVal) => {
        this.setState({
            updatingFieldName,
            updatingFieldVal
        });
    }

    getOldField = (originalDrug) => {
        let oldDdlFreq = originalDrug.ddlFreq;
        let oldTxtDuration = originalDrug.txtDuration;
        let oldDdlDurationUnit = originalDrug.ddlDurationUnit;
        let oldDdlSite = originalDrug.ddlSite;

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

    handleOnBlurChange = (lineId, isFirstLine) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);
        let originalDrug = _.cloneDeep(this.state.originalDrug);
        if (prescriptionData.dangerDrug === 'Y') {
            if (prescriptionData.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE) {
                if (lineId) {
                    let item = prescriptionData.moeMedMultDoses[lineId];
                    if (item) {
                        let params = {
                            duration: prescriptionData.txtDuration,
                            durationUnit: prescriptionData.ddlDurationUnit,
                            freq1: item.freq1,
                            freqCode: item.ddlFreq,
                            moeEhrMedProfile: {
                                orderLineType: prescriptionData.orderLineType,
                                siteId: prescriptionData.ddlSite || null
                            },
                            moeMedMultDoses: [{
                                multDoseNo: 1,
                                duration: prescriptionData.txtDuration,
                                durationUnit: prescriptionData.ddlDurationUnit,
                                freq1: item.freq1,
                                freqCode: item.ddlFreq
                            }]
                        };
                        let oldDdlFreq = originalDrug.moeMedMultDoses
                            && originalDrug.moeMedMultDoses[lineId]
                            && originalDrug.moeMedMultDoses[lineId].ddlFreq;

                        if (this.state.updatingFieldName && this.state.updatingFieldName === PANEL_FIELD_NAME.FREQ) {
                            oldDdlFreq = this.state.updatingFieldVal;
                        }

                        if (item.ddlFreq && this.isIntNum(prescriptionData.txtDuration) && prescriptionData.ddlDurationUnit) {
                            if (oldDdlFreq !== item.ddlFreq) {
                                this.props.getTotalDangerDrug(params,
                                    (data) => {
                                        if (!data || !data.maxDosage.map || data.maxDosage.length === 0) return;
                                        prescriptionData.moeMedMultDoses[lineId].txtDangerDrugQty = data.maxDosage[0].maxDosage;
                                        this.props.updateField({
                                            curDrugDetail: prescriptionData
                                        });
                                    });
                            }
                        }
                    } else {
                        prescriptionData.moeMedMultDoses[lineId].txtDangerDrugQty = '';
                        this.props.updateField({
                            curDrugDetail: prescriptionData
                        });
                    }
                } else {
                    let params = {
                        duration: prescriptionData.txtDuration,
                        durationUnit: prescriptionData.ddlDurationUnit,
                        moeEhrMedProfile: {
                            orderLineType: prescriptionData.orderLineType,
                            siteId: prescriptionData.ddlSite || null
                        },
                        moeMedMultDoses: []
                    };

                    const oldFields = this.getOldField(originalDrug);
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
                        )
                    ) {
                        let arryMultDose = [];
                        for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
                            let item = prescriptionData.moeMedMultDoses[i];
                            if (i === 0 && prescriptionData.ddlFreq) {
                                arryMultDose.push({
                                    multDoseNo: 1,
                                    duration: prescriptionData.txtDuration,
                                    durationUnit: prescriptionData.ddlDurationUnit,
                                    freq1: prescriptionData.freq1,
                                    freqCode: prescriptionData.ddlFreq
                                });
                            } else if (i !== 0 && item.ddlFreq) {
                                arryMultDose.push({
                                    multDoseNo: item.multDoseNo,
                                    duration: prescriptionData.txtDuration,
                                    durationUnit: prescriptionData.ddlDurationUnit,
                                    freq1: item.freq1,
                                    freqCode: item.ddlFreq
                                });
                            } else {
                                break;
                            }
                        }
                        if (arryMultDose.length > 0) {
                            params.moeMedMultDoses = arryMultDose;
                            this.props.getTotalDangerDrug(params,
                                (data) => {
                                    if (!data || !data.maxDosage.map || data.maxDosage.length === 0) return;
                                    for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
                                        data.maxDosage.map((item) => {
                                            if (item.multDoseNo === 1 && item.multDoseNo === prescriptionData.multipleLine[i].multDoseNo) {
                                                prescriptionData.txtDangerDrugQty = item.maxDosage;
                                                prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = item.maxDosage;
                                            } else if (item.multDoseNo === prescriptionData.moeMedMultDoses[i].multDoseNo) {
                                                prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = item.maxDosage;
                                            }
                                            return true;
                                        });
                                    }
                                    this.props.updateField({
                                        curDrugDetail: prescriptionData
                                    });
                                });
                        }
                    } else if (!prescriptionData.ddlFreq || !prescriptionData.txtDuration || !prescriptionData.ddlDurationUnit) {
                        for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
                            prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = '';
                        }
                        prescriptionData.txtDangerDrugQty = '';
                        this.props.updateField({
                            curDrugDetail: prescriptionData
                        });
                    }
                }
            } else if (prescriptionData.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
                if (lineId) {
                    let item = prescriptionData.moeMedMultDoses[lineId];
                    if (item) {
                        let params = {
                            duration: item.txtDuration,
                            durationUnit: item.ddlDurationUnit,
                            freq1: item.freq1,
                            freqCode: item.ddlFreq,
                            moeEhrMedProfile: {
                                orderLineType: prescriptionData.orderLineType,
                                siteId: prescriptionData.ddlSite || null
                            },
                            moeMedMultDoses: [{
                                multDoseNo: 1,
                                duration: item.txtDuration,
                                durationUnit: item.ddlDurationUnit,
                                freq1: item.freq1,
                                freqCode: item.ddlFreq
                            }]
                        };
                        let oldDdlFreq = originalDrug.moeMedMultDoses
                            && originalDrug.moeMedMultDoses[lineId]
                            && originalDrug.moeMedMultDoses[lineId].ddlFreq;
                        let oldTxtDuration = originalDrug.moeMedMultDoses
                            && originalDrug.moeMedMultDoses[lineId]
                            && originalDrug.moeMedMultDoses[lineId].txtDuration;
                        let oldDdlDurationUnit = originalDrug.moeMedMultDoses
                            && originalDrug.moeMedMultDoses[lineId]
                            && originalDrug.moeMedMultDoses[lineId].oldDdlDurationUnit;

                        if (this.state.updatingFieldName) {
                            switch (this.state.updatingFieldName) {
                                case PANEL_FIELD_NAME.FREQ:
                                    oldDdlFreq = this.state.updatingFieldVal;
                                    break;
                                case PANEL_FIELD_NAME.DURATION:
                                    oldTxtDuration = this.state.updatingFieldVal;
                                    break;
                                case PANEL_FIELD_NAME.DURATION_UNIT:
                                    oldDdlDurationUnit = this.state.updatingFiledVal;
                                    break;
                            }
                        }

                        if (item.ddlFreq && this.isIntNum(item.txtDuration) && item.ddlDurationUnit
                            && (oldDdlFreq !== item.ddlFreq || oldTxtDuration !== item.txtDuration || oldDdlDurationUnit !== item.oldDdlDurationUnit)) {
                            this.props.getTotalDangerDrug(params,
                                (data) => {
                                    if (!data || !data.maxDosage.map || data.maxDosage.length === 0) return;
                                    prescriptionData.moeMedMultDoses[lineId].txtDangerDrugQty = data.maxDosage[0].maxDosage;
                                    this.props.updateField({
                                        curDrugDetail: prescriptionData
                                    });
                                });
                        } else if (!item.ddlFreq || !item.txtDuration || !item.ddlDurationUnit) {
                            prescriptionData.moeMedMultDoses[lineId].txtDangerDrugQty = '';
                            this.props.updateField({
                                curDrugDetail: prescriptionData
                            });
                        }
                    }
                } else if (isFirstLine) {
                    const oldFields = this.getOldField(originalDrug);
                    const oldDdlFreq = oldFields.oldDdlFreq;
                    const oldTxtDuration = oldFields.oldTxtDuration;
                    const oldDdlDurationUnit = oldFields.oldDdlDurationUnit;
                    const oldDdlSite = oldFields.oldDdlSite;

                    if (prescriptionData.ddlFreq && this.isIntNum(prescriptionData.txtDuration)
                        && prescriptionData.txtDuration
                        && prescriptionData.ddlDurationUnit
                        && (oldTxtDuration !== prescriptionData.txtDuration
                            || oldDdlDurationUnit !== prescriptionData.ddlDurationUnit
                            || oldDdlFreq !== prescriptionData.ddlFreq
                            || oldDdlSite !== prescriptionData.ddlSite)
                    ) {
                        let params = {
                            duration: prescriptionData.txtDuration,
                            durationUnit: prescriptionData.ddlDurationUnit,
                            freq1: prescriptionData.freq1,
                            freqCode: prescriptionData.ddlFreq,
                            moeEhrMedProfile: {
                                orderLineType: prescriptionData.orderLineType,
                                siteId: prescriptionData.ddlSite || null
                            },
                            moeMedMultDoses: [{
                                multDoseNo: 1,
                                duration: prescriptionData.txtDuration,
                                durationUnit: prescriptionData.ddlDurationUnit,
                                freq1: prescriptionData.freq1,
                                freqCode: prescriptionData.ddlFreq
                            }]
                        };
                        this.props.getTotalDangerDrug(params,
                            (data) => {
                                if (!data || !data.maxDosage.map || data.maxDosage.length === 0) return;
                                prescriptionData.txtDangerDrugQty = data.maxDosage[0].maxDosage;
                                this.props.updateField({
                                    curDrugDetail: prescriptionData
                                });
                            });
                    } else if (!prescriptionData.ddlFreq || !prescriptionData.txtDuration || !prescriptionData.ddlDurationUnit) {
                        prescriptionData.txtDangerDrugQty = '';
                        this.props.updateField({
                            curDrugDetail: prescriptionData
                        });
                    }
                } else {
                    const oldFields = this.getOldField(originalDrug);
                    const oldDdlFreq = oldFields.oldDdlFreq;
                    const oldTxtDuration = oldFields.oldTxtDuration;
                    const oldDdlDurationUnit = oldFields.oldDdlDurationUnit;
                    const oldDdlSite = oldFields.oldDdlSite;

                    if (oldDdlSite !== prescriptionData.ddlSite
                        || oldTxtDuration !== prescriptionData.txtDuration
                        || oldDdlDurationUnit !== prescriptionData.ddlDurationUnit
                        || oldDdlFreq !== prescriptionData.ddlFreq) {
                        let params = {
                            moeEhrMedProfile: {
                                orderLineType: prescriptionData.orderLineType,
                                siteId: prescriptionData.ddlSite || null
                            },
                            moeMedMultDoses: []
                        };
                        let arryMultDose = [];
                        for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
                            let item = prescriptionData.moeMedMultDoses[i];
                            if (i === 0 && prescriptionData.ddlFreq
                                && this.isIntNum(prescriptionData.txtDuration)
                                && prescriptionData.ddlDurationUnit
                            ) {
                                arryMultDose.push({
                                    multDoseNo: 1,
                                    duration: prescriptionData.txtDuration,
                                    durationUnit: prescriptionData.ddlDurationUnit,
                                    freq1: prescriptionData.freq1,
                                    freqCode: prescriptionData.ddlFreq
                                });
                            } else if (i !== 0 && item.ddlFreq && this.isIntNum(item.txtDuration) && item.ddlDurationUnit) {
                                arryMultDose.push({
                                    multDoseNo: item.multDoseNo,
                                    duration: item.txtDuration,
                                    durationUnit: item.ddlDurationUnit,
                                    freq1: item.freq1,
                                    freqCode: item.ddlFreq
                                });
                            } else if (i === 0 && (!prescriptionData.ddlFreq || !this.isIntNum(prescriptionData.txtDuration) || !prescriptionData.ddlDurationUnit)) {
                                prescriptionData.txtDangerDrugQty = '';
                            } else if (i !== 0 && (!item.ddlFreq || !this.isIntNum(item.txtDuration) || !item.ddlDurationUnit)) {
                                prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = '';
                            } else {
                                break;
                            }
                        }
                        if (arryMultDose.length > 0) {
                            params.moeMedMultDoses = arryMultDose;
                            this.props.getTotalDangerDrug(params,
                                (data) => {
                                    if (!data || !data.maxDosage.map || data.maxDosage.length === 0) return;
                                    for (let i = 0; i < prescriptionData.moeMedMultDoses.length; i++) {
                                        data.maxDosage.map((item) => {
                                            if (item.multDoseNo === 1 && item.multDoseNo === prescriptionData.stepUpDown[i].multDoseNo) {
                                                prescriptionData.txtDangerDrugQty = item.maxDosage;
                                                prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = item.maxDosage;
                                            } else if (item.multDoseNo === prescriptionData.stepUpDown[i].multDoseNo) {
                                                prescriptionData.moeMedMultDoses[i].txtDangerDrugQty = item.maxDosage;
                                            }
                                            return true;
                                        });
                                    }
                                    this.props.updateField({
                                        curDrugDetail: prescriptionData
                                    });
                                });
                        } else {
                            this.props.updateField({
                                curDrugDetail: prescriptionData
                            });
                        }
                    }
                }
            } else if (prescriptionData.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
                let specialIntervalData = prescriptionData.specialInterval;

                //get special interval text
                this.handleSpecialIntervalConfirm(specialIntervalData);

            } else {
                const oldFields = this.getOldField(originalDrug);
                const oldDdlFreq = oldFields.oldDdlFreq;
                const oldTxtDuration = oldFields.oldTxtDuration;
                const oldDdlDurationUnit = oldFields.oldDdlDurationUnit;
                const oldDdlSite = oldFields.oldDdlSite;

                if (oldDdlSite !== prescriptionData.ddlSite
                    || oldTxtDuration !== prescriptionData.txtDuration
                    || oldDdlDurationUnit !== prescriptionData.ddlDurationUnit
                    || oldDdlFreq !== prescriptionData.ddlFreq
                ) {
                    let params = {
                        duration: prescriptionData.txtDuration,
                        durationUnit: prescriptionData.ddlDurationUnit,
                        freq1: prescriptionData.freq1,
                        freqCode: prescriptionData.ddlFreq,
                        moeEhrMedProfile: {
                            orderLineType: prescriptionData.orderLineType || ORDER_LINE_TYPE.NORMAL,
                            siteId: prescriptionData.ddlSite || null
                        },
                        moeMedMultDoses: [{
                            multDoseNo: 1,
                            duration: prescriptionData.txtDuration,
                            durationUnit: prescriptionData.ddlDurationUnit,
                            freq1: prescriptionData.freq1,
                            freqCode: prescriptionData.ddlFreq
                        }]
                    };
                    if (prescriptionData.ddlFreq
                        && prescriptionData.txtDuration
                        && prescriptionData.ddlDurationUnit
                        && this.isIntNum(prescriptionData.txtDuration)
                    ) {
                        this.props.getTotalDangerDrug(params,
                            (data) => {
                                if (!data || !data.maxDosage.map || data.maxDosage.length === 0) return;
                                prescriptionData.txtDangerDrugQty = data.maxDosage[0].maxDosage;
                                this.props.updateField({
                                    curDrugDetail: prescriptionData
                                });
                            });
                    } else if (!prescriptionData.ddlFreq || !prescriptionData.txtDuration || !prescriptionData.ddlDurationUnit) {
                        prescriptionData.txtDangerDrugQty = '';
                        this.props.updateField({
                            curDrugDetail: prescriptionData
                        });
                    }
                } else if (!prescriptionData.ddlFreq || !prescriptionData.txtDuration || !prescriptionData.ddlDurationUnit) {
                    prescriptionData.txtDangerDrugQty = '';
                    this.props.updateField({
                        curDrugDetail: prescriptionData
                    });
                }
            }
        } else if (prescriptionData.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
            let specialIntervalData = prescriptionData.specialInterval;
            this.handleSpecialIntervalConfirm(specialIntervalData);
        }
    }
    isIntNum = (val) => {
        const regPos = /^[1-9]+[0-9]*]*$/;
        return regPos.test(val);
    }

    handleSpecialIntervalConfirm = (specialIntervalData) => {
        let prescriptionData = _.cloneDeep(this.props.curDrugDetail);

        if (commonUtilities.CompareJSON(specialIntervalData, prescriptionData.specialInterval)) {
            this.setState({
                isPopUpSpecialInterval: false
            });
            return;
        }

        prescriptionData.txtQty = '';
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
            // set duration unit
            let callBack = (specialIntervalText) => {
                prescriptionData.ddlDurationUnit = specialIntervalData.regimen.toLowerCase();
                specialIntervalData.specialIntervalText = specialIntervalText && specialIntervalText.specialIntervalText;
                specialIntervalData.supFreqText = specialIntervalText && specialIntervalText.inputBoxSpecialIntervalText;
                specialIntervalData.displayWithFreq = specialIntervalText && specialIntervalText.displayWithFreq;
                prescriptionData.specialInterval = specialIntervalData;
                this.props.updateField({ curDrugDetail: prescriptionData });
                this.setState({ isPopUpSpecialInterval: false });
            };
            this.props.getSpecialIntervalText(params, callBack);
        }
    }

    handleCloseDelDialog = () => {
        this.setState({
            showDelDrugSetDialog: false
        });
    }
    handleDeleteDrugSet = () => {
        let params = {
            'myFavouriteId': this.props.drugSetItem.myFavouriteId,
            'frontMyFavouriteId': this.props.drugSetItem.frontMyFavouriteId,
            'version': this.props.drugSetItem.version
        };
        this.props.deleteMyFavourite(params, true, this.props.favKeyword);
    }

    render() {
        const { classes, showEditPanel, id, curDrugDetail } = this.props;
        const { showMultipleLine, showStepUpDown, errorMessageList } = this.state;
        let titleClasses = '';
        if (showEditPanel) {
            titleClasses = classes.title;
        } else {
            titleClasses = classes.prescriptionTitle;
        }
        let titleProps = classes.withoutIcons;
        if (curDrugDetail) {
            if (curDrugDetail.dangerDrug && curDrugDetail.dangerDrug === 'Y' && curDrugDetail.allergens && curDrugDetail.allergens.length > 0) {
                titleProps = classes.withIcons;
            } else if ((curDrugDetail.dangerDrug && curDrugDetail.dangerDrug === 'Y') || (curDrugDetail.allergens && curDrugDetail.allergens.length > 0)) {
                titleProps = classes.withAnIcon;
            }
        }
        let strTitleRemark = curDrugDetail && curDrugDetail.remarkText ? 'Note: ' + curDrugDetail.remarkText : null;

        return (
            <CIMSDialog
                open={showEditPanel}
                id={id + '_dialog'}
                classes={{
                    paper: classes.fullWidth
                }}
                formControlStyle={{
                    paddingTop: 0
                }}
            >
                <Grid container className={`${classes.colorClasses}`}>
                    <Grid item container xs={11}>
                        <Grid item container xs={12}>
                            <Grid style={{ width: '24px' }}>
                                <IconButton
                                    id={id + '_deleteIconButton'}
                                    onClick={() => this.props.handleDeleteDialog(this.props.drugSetItem, curDrugDetail)}
                                    style={{ padding: 0 }}
                                    data-deletebtnid={'deleteBtn'}
                                >
                                    <img src={iconCancel} alt={''} />
                                </IconButton>
                            </Grid>
                            <Grid item container alignItems="center" xs={11} onClick={this.props.onClick} id={id + '_showDetailButton'}>
                                {curDrugDetail && curDrugDetail.dangerDrug && curDrugDetail.dangerDrug === 'Y' ?
                                    <Typography component="div" style={{ height: '100%', width: '3%' }}>
                                        <img src={imgDangerDrug} style={{ marginTop: '6px' }} alt="" />
                                    </Typography>
                                    :
                                    null
                                }
                                {curDrugDetail &&
                                    curDrugDetail.allergens && curDrugDetail.allergens.length > 0 ?
                                    <Typography component="div" style={{ height: '100%', width: '3%' }}>
                                        <Tooltip title={moeUtilities.getDACReason(curDrugDetail.allergens)} classes={{ tooltip: classes.toolTip }}>
                                            <img src={warningIcon} style={{ marginTop: '6px' }} alt="" onClick={(e) => { if (!showEditPanel) this.openEditHLAB1502Dialog(e); }} />
                                        </Tooltip>
                                    </Typography>
                                    :
                                    null
                                }
                                <Typography component="div" className={`${titleProps}`}>
                                    {/* <Typography variant={'subtitle2'} className={`${titleClasses}`} style={{ whiteSpace: 'pre-wrap' }}>{strTitle}</Typography> */}
                                    <Typography variant={'subtitle2'} className={`${titleClasses}`}>{deptFavUtilities.generatePanelTitle(curDrugDetail, this.props.codeList, true)}</Typography>
                                    <Typography variant={'subtitle2'} className={`${titleClasses}`} style={{ whiteSpace: 'pre-wrap' }}><i>{strTitleRemark}</i></Typography>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={1} container justify={'flex-end'}>
                        {showEditPanel && curDrugDetail && curDrugDetail.isShowAdvanced ?
                            <CIMSButton
                                id={id + '_basicCIMSButton'}
                                type={'button'}
                                className={classes.btn}
                                onClick={() => this.showAdvanced(false)}
                            >Basic</CIMSButton>
                            : null
                        }
                        {showEditPanel && curDrugDetail && !curDrugDetail.isShowAdvanced ?
                            <CIMSButton
                                id={id + '_advancedCIMSButton'}
                                type={'button'}
                                className={classes.btn}
                                onClick={() => this.showAdvanced(true)}
                            >Advanced</CIMSButton>
                            :
                            null
                        }
                    </Grid>
                </Grid>
                <Typography component={'div'}>
                    <ValidatorForm ref={'form'} onSubmit={(e) => this.handleConfirm(e)} onError={this.handleSubmitError} /*className={`${formClasses}`}*/>
                        {curDrugDetail && curDrugDetail.isShowAdvanced ?
                            <Grid container spacing={1} justify={'flex-end'}>
                                <Grid item>
                                    <CIMSButton
                                        id={id + '_MultiLineCIMSButton'}
                                        type={'button'}
                                        className={showMultipleLine ? classes.highlightBtn : classes.btn}
                                        // onClick={this.handleBtnMultipleLine}
                                        onClick={() => this.handleAddMulDoses(ORDER_LINE_TYPE.MULTIPLE_LINE, 1)}
                                        disabled={this.state.disabledBtn && !showMultipleLine}
                                    >Multiple Line</CIMSButton>
                                    <CIMSButton
                                        id={id + '_StepUpDownCIMSButton'}
                                        type={'button'}
                                        className={showStepUpDown ? classes.highlightBtn : classes.btn}
                                        // onClick={this.handleBtnStepUpDown}
                                        onClick={() => this.handleAddMulDoses(ORDER_LINE_TYPE.STEP_UP_AND_DOWN, 1)}
                                        disabled={this.state.disabledBtn && !showStepUpDown}
                                    >Step Up/Down</CIMSButton>
                                    <CIMSButton
                                        id={id + '_SpecInterCIMSButton'}
                                        type={'button'}
                                        className={this.state.isShowSpecialInterval ? classes.highlightBtn : classes.btn}
                                        disabled={this.state.disabledBtn && !this.state.isShowSpecialInterval}
                                        onClick={this.handleBtnSpecialInterval}
                                    >Special Interval</CIMSButton>
                                </Grid>

                            </Grid>
                            :
                            null}
                        <EditDrugPanel
                            id={id}
                            isShowAdvanced={curDrugDetail && curDrugDetail.isShowAdvanced}
                            panelClasses={classes}
                            handleChange={this.handleChange}
                            onSelectedItem={this.onSelectedItem}
                            validatorListener={this.validatorListener}
                            handleOnBlurChange={this.handleOnBlurChange}
                            showMultipleLine={showMultipleLine}
                            closeMultipleFrequencyDialog={this.closeMultipleFrequencyDialog}
                            updateOrderLineField={this.updateOrderLineField}
                            handleChangeDose={this.handleChangeDose}
                            showStepUpDown={showStepUpDown}
                            handleBtnPopUpSpecialinterval={this.handleBtnPopUpSpecialinterval}
                            handleDeleteSpecialInterval={this.handleDeleteSpecialInterval}
                            handleSpecialIntervalSelectChange={this.handleSpecialIntervalSelectChange}
                            showAdvanced={this.showAdvanced}
                            logOldData={this.logOldData}

                            handleAddMulDoses={this.handleAddMulDoses}
                            handleDeleteMulDosesRow={this.handleDeleteMulDosesRow}
                        />
                        {errorMessageList && errorMessageList.length > 0 &&
                            <Grid item container style={{ marginTop: '10px', padding: 5 }} id={id + '_errorMsgList'}>
                                {deptFavUtilities.getErrorMessageList(errorMessageList).map((item, i) => (
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
                            this.props.saveMessageList.map((item, index) => (
                                <Grid item container key={index} justify="flex-start">
                                    <Typography color={'error'} className={classes.errorFieldNameText}>{`${item.fieldName}: ${item.errMsg}`}</Typography>
                                </Grid>
                            ))
                            : <Grid item container justify="flex-start">
                                <Typography color={'error'} className={classes.errorFieldNameText}>{this.props.saveMessageList}</Typography>
                            </Grid>
                        }
                        <Grid container direction={'row'}>
                            <Grid item xs={6}>
                                {errorMessageList
                                    && errorMessageList.length > 0
                                    && this.state.showProceedBtn
                                    // && curDrugDetail
                                    // && curDrugDetail.dangerDrug === 'N'
                                    &&
                                    <div>
                                        <CIMSButton className={classes.btn} id={id + '_printMessageCIMSButton'}>Print Message</CIMSButton>
                                        {/* <CIMSButton className={classes.btn} onClick={() => this.handleProceedSave(false)} id={'prescription_goEditCIMSButton'}>Go to edit</CIMSButton> */}
                                        <CIMSButton className={classes.btn} onClick={() => this.handleProceedSave(true)} id={id + '_proceedSaveCIMSButton'}>Proceed to save</CIMSButton>
                                    </div>
                                }
                            </Grid>
                            <Grid item container xs={6} justify={'flex-end'}>
                                <CIMSButton
                                    id={id + '_confirmCIMSButton'}
                                    type={'button'}
                                    className={classes.btn}
                                    onClick={this.handlePreConfirm}
                                    disabled={this.state.isDisabledConfirm}
                                >Save</CIMSButton>
                                <CIMSButton
                                    id={id + '_cancelCIMSButton'}
                                    type={'button'}
                                    className={classes.btn}
                                    onClick={this.closePrescriptionPanel}
                                >Cancel</CIMSButton>
                            </Grid>
                        </Grid>
                    </ValidatorForm>
                </Typography>
                <FrequencyDialog
                    id={id + '_FrequencyDialog'}
                    frequency={this.state.frequencyItem}
                    dialogTitle={'Frequency'}
                    handleChange={this.state.frequencyItem && this.state.frequencyItem.type === 'R' ? (e) => this.updateOrderLineField(e, '', 'freq1', 'R') : this.updatePrescriptionField}
                    name={'freq1'}
                    freqValue={this.state.frequencyItem && this.state.frequencyItem.type === 'R' ? (curDrugDetail && curDrugDetail.specialInterval.freq1) : (curDrugDetail && curDrugDetail.freq1)}
                    codeList={this.state.freqCodeList}
                    okClick={this.closeFrequencyDialog}
                />
                <CIMSDialog
                    open={this.state.isPopUpSpecialInterval}
                    id={id + '_specialIntervalDialog'}
                >
                    <SpecialInterval
                        handleCancelSpecInter={this.handleCancelSpecInter}
                        curDrugDetail={curDrugDetail}
                        specialIntervalData={curDrugDetail && curDrugDetail.specialInterval}
                        handleSpecialIntervalConfirm={this.handleSpecialIntervalConfirm}
                        codeList={this.props.codeList}
                    />
                </CIMSDialog>
                <DuplicateDrugDialog
                    id={id + '_duplicateDrugDialog'}
                    open={this.props.openDuplicateDialog}
                    duplicateList={this.props.duplicateDrugList}
                    selectedDeletedList={this.props.selectedDeletedList}
                    closeDuplicateDialog={this.closeDuplicateDialog}
                    confirmDeleteDuplicateDrug={this.confirmDeleteDuplicateDrug}
                    handleChangeCb={this.handleChangeDeletedCb}
                    isHideDose
                />
                {this.state.showDelDrugSetDialog &&
                    <CIMSAlertDialog
                        id={id + '_deleteDrugSet_dialog'}
                        open={this.state.showDelDrugSetDialog}
                        onClickOK={this.handleDeleteDrugSet}
                        onClickCancel={() => this.confirmDeleteDuplicateDrug(true)}
                        dialogTitle="Question"
                        dialogContentText={
                            <Typography component={'div'} variant={'subtitle2'} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'pre-wrap' }}>
                                <img src={questionIcon} alt="Question" />
                                {'    There are no record in the drug set. Are you sure to delete this drug set?'}
                            </Typography>
                        }
                        cancelButtonName={'No'}
                        okButtonName={'Yes'}
                        btnCancel
                        buttonAction={
                            <CIMSButton id={id + '_deleteDrugSet_dialog_backCIMSButton'} onClick={this.handleCloseDelDialog}>Back</CIMSButton>
                        }
                    />
                }
            </CIMSDialog>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        showEditPanel: state.moeMyFavourite.showEditPanel,
        curDrugDetail: state.moeMyFavourite.curDrugDetail,
        drugSetItem: state.moeMyFavourite.drugSetItem,
        codeList: state.moe.codeList,
        specialIntervalText: state.moeMyFavourite.specialIntervalText,
        isSaveSuccess: state.moeMyFavourite.isSaveSuccess,
        saveMessageList: state.moeMyFavourite.saveMessageList,
        maxDosage: state.moeMyFavourite.maxDosage,
        myFavouriteList: state.moeMyFavourite.myFavouriteList,
        openDuplicateDialog: state.moeMyFavourite.openDuplicateDialog,
        selectedDeletedList: state.moeMyFavourite.selectedDeletedList,
        duplicateDrugList: state.moeMyFavourite.duplicateDrugList,
        //showProceedBtn: state.departmentFavourite.showProceedBtn,
        favKeyword: state.moeMyFavourite.favKeyword
    };
};

const mapDispatchToProps = {
    getTotalDangerDrug,
    updateField,
    getSpecialIntervalText,
    openCommonCircular,
    closeCommonCircular,
    addToMyFavourite,
    // openErrorMessage,
    deleteMyFavourite
    // deleteDrugSet,
    // cancelCache
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DrugDetail));