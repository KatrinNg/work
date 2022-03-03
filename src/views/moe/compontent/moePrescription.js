import React from 'react';
import { connect } from 'react-redux';
import {
    Typography,
    Grid,
    RadioGroup,
    FormControlLabel,
    Radio,
    MenuList,
    MenuItem,
    Paper
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import MoeSearch from './moeSearch';
import MoePrescriptionPanel from './moePrescriptionPanel';
import MdsEnqPanel from './mdsEnqPanel';
import {
    searchDrug,
    searchItemCollapse,
    // getDrug,
    getCodeList,
    // deleteDrug,
    resetDrugList,
    updateField,
    saveDrug,
    cancelOrder,
    deleteOrder,
    confirmDuplicateDrug,
    getOrderDrugList,
    getPdf,
    getSpecialIntervalText,
    convertDrug,
    getTotalDangerDrug,
    getAllergyChecking,
    getHlab1502VTM,
    saveHlab1502Negative,
    deleteHlabNegative
} from '../../../store/actions/moe/moeAction';
import {
    print,
    openErrorMessage
} from '../../../store/actions/common/commonAction';
import {
    addToMyFavourite,
    updateField as myFavouriteUpdateField,
    updateMyFavSearchInputVal
} from '../../../store/actions/moe/myFavourite/myFavouriteAction';
import {
    updateField as updateDrugHistoryField
} from '../../../store/actions/moe/drugHistory/drugHistoryAction';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import AllergyInfo from './allergyInfo';
import SlideLayer from './slideLayer';
import CIMSDialog from '../../../components/Dialog/CIMSDialog';
import * as prescriptionUtilities from '../../../utilities/prescriptionUtilities';
import DuplicateDrugDialog from './dialog/duplicateDrugDialog';
import Hlab1502Dialog from '../compontent/dialog/hlab1502Dialog';
import PdfPreviewDialog from './dialog/pdfPreviewDialog';
import moment from 'moment';
import _ from 'lodash';
import MyFavouriteDrugSetDialog from './myFavourite/myFavouriteDrugSetDialog';
import {
    openCommonCircular,
    closeCommonCircular
} from '../../../store/actions/common/commonAction';
// import CIMSAlertDialog from '../../../components/Dialog/CIMSAlertDialog';
// import questionIcon from '../../../images/moe/icon-question.gif';
import * as moeUtilities from '../../../utilities/moe/moeUtilities';
import RemarkDialog from './editRemark/remarkDialog';
import MultipleRemarkDialog from './editRemark/multipleRemarkDialog';
import DurationDialog from './dialog/durationDialog';
//import AllergyRemarkDialog from '../compontent/allergyRemarkDialog';
import MaxDurationDialog from '../compontent/warning/maxDurationDialog';
import MinQuantityDialog from '../compontent/warning/minQuantityDialog';
import AllergyDialog from '../compontent/dialog/allergyDialog';
import DeleteHLABNegative from '../compontent/editRemark/deleteHLABNegative';

import {
    updateField as updateHistoryField
} from '../../../store/actions/moe/drugHistory/drugHistoryAction';
import styles from './../moeStyles';
import EmailIcon from '@material-ui/icons/EmailOutlined';
import { resizeHeight } from '../../../utilities/moe/moeUtilities';
import {
    RESIZEHEIGHT_PANEL,
    CHECKING_TYPE,
    ADD_DRUG_ROUTE,
    ORDER_LINE_TYPE,
    MOE_DRUG_STATUS,
    DURATION_UNIT,
    ACTION_STATUS_TYPE
} from '../../../enums/moe/moeEnums';
import Enum from '../../../enums/enum';
import {
    openCommonMessage
} from '../../../store/actions/message/messageAction';
import {
    MOE_MSG_CODE
} from '../../../constants/message/moe/commonRespMsgCodeMapping';
import MandatoryFieldsDialog from './dialog/mandatoryFieldsDialog';

const localClass = {
    buttonPosition: {
        // width: '340px',
        marginLeft: '4px',
        border: '1px solid rgb(128, 128, 128)',
        display: 'flex',
        justifyContent: 'center',
        alignItem: 'center'
    }
};

class MoePresciption extends React.Component {
    constructor(props) {
        super(props);
        let dosageType = '';
        // if(this.props.patient && this.props.patient.age)
        // {
        //     dosageType = this.getDosageType(this.props.patient.age);
        // }
        this.state = {
            //The parent-child fields to display in the search box
            searchParentField: [
                {
                    name: 'displayString', customRender: (item) => {
                        //return moeUtilities.getDisplayString(item, SEARCH_MOE_DISPLAY_FIELD);
                        //console.log(item.formEng + '' + item.txtForm + ' ' + item.routeEng);
                        let formRoute = (item.formEng || item.txtForm) + ' ' + item.routeEng;
                        let displayRoute = prescriptionUtilities.isDisplayRoute(this.props.codeList.form_route_map, formRoute);
                        return moeUtilities.getDrugName(item, displayRoute);//20191206 Rewrite drug name method by Louis Chen
                    }
                },
                { name: 'children' }
            ],
            searchChildField: [
                { name: 'dosageEng' },
                { name: 'freqCode' }, //20191219-MK with freqCode instead
                { name: 'prnDesc' },
                { name: 'routeEng' }
            ],

            dosageType: dosageType,
            openDrawer: true,

            deleteFlag: false,
            errorMessageList: [],
            previewShow: false,

            anchorEl: null,
            anchorE1Index: -2,
            contextMenuSelectedItem: null,

            selectDrugIndex: null,
            isReprint: false,
            // showDeleteOrderDialog: false,
            showDeleteOrderReamrkDialog: false,
            deleteOrderRemark: '',


            //remark dialog
            showRemarkDialog: false,
            remarkDialogTitle: '',
            remarkDialogMode: '',
            remarkValue: '',
            remarkMutiple: false,
            remarkMutipleData: [],

            openDurationDialog: false,

            //multiple remark dialog
            showMultipleRemarkDialog: false,
            multipleRemarkData: null,

            //drug allergy checking
            isAllergy: false,
            showAllergyRemark: false,
            showAllergyDialog: false,
            newAddedDrugList: [],

            //remark dialog
            showMyFavRemarkDialog: false,
            myFavRemarkData: null,

            //MDS Enquiry
            showMDSEnq: false,

            showMaxDurationDialog: false,
            showMinQuantityDialog: false,

            //HLA-B*1502
            openHLAB1502Dialog: false,
            isPositive: false,
            drugIndex: 0,
            isMoeSearch: true,
            beCheckedItem: null,
            beCheckedList: [],
            savedReasonDesc: [],
            isEditHLAB: false,
            prescriptionData: null,
            showDeleteNegativeRemark: false,
            alertSeqNo: '',
            alertVersion: 0,
            hlabCkbList: [],
            hlabReasonDesc: [],
            hlabRemarkVal: '',
            // reset height
            outmostOutterHeight: 0,
            outmostInnerrHeight: 0,
            outmostdetailHeight: 0,

            //Incomplete Mandatory fields checking and complement for adding drug(s) from History / My favorite / Department favorite
            addDrugRoute: null,
            checkingType: null,
            openMandatoryDialog: false,
            mandatoryFieldsData: null
        };

        this.PrescriptionRef = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('click', this.handleContextMenuClick);
        document.addEventListener('wheel', this.handleContextMenuClick);
        // while(!this.props.codeList || !this.props.patientAlertList){
        //     continue;
        // }
        this.setState({
            outmostOutterHeight: resizeHeight(
                RESIZEHEIGHT_PANEL.OUTMOST_MOEOUTER_CONTAINER.ID,
                RESIZEHEIGHT_PANEL.OUTMOST_MOEOUTER_CONTAINER.MINUEND()
            ),
            outmostInnerrHeight: resizeHeight(
                RESIZEHEIGHT_PANEL.OUTMOST_MOEINNER_CONTAINER.ID,
                RESIZEHEIGHT_PANEL.OUTMOST_MOEINNER_CONTAINER.MINUEND()
            ),
            outmostdetailHeight: resizeHeight(
                RESIZEHEIGHT_PANEL.OUTMOST_MOE_DETAIL_CONTAINER.ID,
                RESIZEHEIGHT_PANEL.OUTMOST_MOE_DETAIL_CONTAINER.MINUEND()
            )
        });
        this.props.onRef(this);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleContextMenuClick);
        document.removeEventListener('wheel', this.handleContextMenuClick);
        this.props.resetDrugList();
    }

    updateState = (name, value) => {
        this.setState({ [name]: value });
    }

    //searc drug
    searchDrug = value => {
        let systemSetting = moeUtilities.getSystemSetting(this.props.codeList.system_setting);
        let redis = (systemSetting.enable_moe_redis && systemSetting.enable_moe_redis.paramValue.toUpperCase() === 'Y') || false;
        if (value.trim()) {
            const params = {
                dosageType: this.state.dosageType ? this.state.dosageType : this.getDosageType(this.props.patient),
                limit: 50,
                loginId: this.props.loginInfo.user.loginId,
                searchString: value,
                showDosage: true,
                showFav: false,
                redis: redis
            };
            this.props.searchDrug(params);
        }
    }

    handleChange = (e) => {
        this.setState({ dosageType: e.target.value });
    }

    searchItemCollapse = (item) => {
        this.props.searchItemCollapse(item);
    }

    getDangerDose = (prescriptionData) => {
        let params = {
            duration: prescriptionData.txtDuration,
            durationUnit: prescriptionData.ddlDurationUnit,
            freq1: prescriptionData.freq1,
            freqCode: prescriptionData.ddlFreq,
            moeEhrMedProfile: {
                orderLineType: ORDER_LINE_TYPE.NORMAL,
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

        return this.props.getTotalDangerDrug(params, () => {
            prescriptionData.txtDangerDrugQty = this.props.maxDosage && this.props.maxDosage[0].maxDosage;
            let updateData = {};
            updateData.selectedPrescriptionItem = prescriptionData;
            updateData.showDetail = true;
            updateData.saveMessageList = [];
            this.props.updateField(updateData);
            this.setState({
                errorMessageList: [],
                selectDrugIndex: prescriptionData.orgItemNo,
                addDrugRoute: null,
                checkingType: null
            });
        });
    }

    //get drug after select item in searching
    getDrug = (item, childItem, value) => {
        let getThis = this;
        let prescriptionData = {};
        let newDrugList = _.cloneDeep(this.props.drugList);
        let actionType = moeUtilities.getMoeSetting();

        let callback = (_prescriptionData) => {
            const orderData = getThis.props.orderData;
            if (orderData && orderData.moeOrder && orderData.moeOrder.remarkText)
                _prescriptionData.remarkText = (actionType.isBackdate || actionType.isEdit) && orderData.moeOrder.remarkText ? orderData.moeOrder.remarkText : '';

            // prescriptionData.txtStartFrom = moment(getThis.props.backDate ? getThis.props.backDate : new Date(), 'YYYY-MM-DD').valueOf();
            // prescriptionData.txtStartFrom = moment(getThis.props.backDate ? getThis.props.backDate : new Date(), Enum.DATE_FORMAT_EYMD_VALUE).valueOf();

            const validDrugList = newDrugList && newDrugList.filter(ele => ele.itemStatus != MOE_DRUG_STATUS.DELETE);
            //auto set duration by selected freq
            const freqOptions = moeUtilities.getFreqOption(_prescriptionData, this.props.codeList.freq_code);
            if (freqOptions && freqOptions.durationUnit) {
                moeUtilities.autoSetDurationByFreq(
                    _prescriptionData,
                    freqOptions,
                    this.props.codeList.duration_unit,
                    _prescriptionData.orderLineType);
            } else if (validDrugList && validDrugList.length > 0) {
                let i, isAutoCarry = false;
                //Automatic carring first normal or advanced drug duration
                for (i = 0; i < validDrugList.length; i++) {
                    const curFreqOption = moeUtilities.getFreqOption(validDrugList[i], this.props.codeList.freq_code);
                    if (!validDrugList[i].specialInterval
                        // && !validDrugList[i].multipleLine
                        // && !validDrugList[i].stepUpDown
                        && !validDrugList[i].moeMedMultDoses
                        && (!curFreqOption || !curFreqOption.durationUnit)
                        && validDrugList[i].ddlDurationUnit != DURATION_UNIT.DOSE
                    ) {
                        _prescriptionData.txtDuration = validDrugList[i].txtDuration;
                        _prescriptionData.ddlDurationUnit = validDrugList[i].ddlDurationUnit;
                        isAutoCarry = true;
                        break;
                    }
                }
                //set default duration unit by db setting
                if (!isAutoCarry)
                    _prescriptionData.ddlDurationUnit = !_prescriptionData.ddlDurationUnit && moeUtilities.getHospSetting().defaultDurationUnit;
            } else {
                _prescriptionData.ddlDurationUnit = !_prescriptionData.ddlDurationUnit && moeUtilities.getHospSetting().defaultDurationUnit;
            }

            _prescriptionData.orgItemNo = newDrugList ? newDrugList.length + 1 : 1;
            _prescriptionData.cmsItemNo = prescriptionUtilities.getMaxId(getThis.props.drugList, 'cmsItemNo') + 1;
            let convertData = _prescriptionData.convertData;
            let prep = prescriptionUtilities.getPrepForUI(convertData);
            // prescriptionData.ddlPrep = prep.ddlPrep;
            _prescriptionData.ddlPrepCodeList = prep.ddlPrepCodeList;
            //DAC params
            if (_prescriptionData.freeText !== 'F') {
                _prescriptionData.aliasName = convertData.moeEhrMedProfile.aliasName;
                _prescriptionData.doseFormExtraInfo = convertData.moeEhrMedProfile.doseFormExtraInfo;
                _prescriptionData.genericIndicator = convertData.moeEhrMedProfile.genericIndicator;
                _prescriptionData.ingredientList = convertData.moeEhrMedProfile.ingredientList;
                _prescriptionData.manufacturer = convertData.moeEhrMedProfile.manufacturer;
                _prescriptionData.nameType = convertData.nameType;
                _prescriptionData.drugRouteEng = convertData.moeEhrMedProfile.drugRouteEng;
                _prescriptionData.screenDisplay = convertData.moeEhrMedProfile.screenDisplay;
                _prescriptionData.strengthLevelExtraInfo = convertData.moeEhrMedProfile.strengthLevelExtraInfo;
                _prescriptionData.prepCodeList = convertData.prep;
                _prescriptionData.strengths = convertData.strengths;
                _prescriptionData.ddlActionStatus = ACTION_STATUS_TYPE.DISPENSE_PHARMACY;
            }
            //end DAC params

            //set action status for free test start
            if (_prescriptionData.freeText == 'F') {
                const defaultFreeTextActionStatus = moeUtilities.getSysSettingByParamName(this.props.codeList.system_setting, 'default_free_text_action_status');
                if (defaultFreeTextActionStatus && defaultFreeTextActionStatus.paramValue) {
                    _prescriptionData.ddlActionStatus = defaultFreeTextActionStatus.paramValue;
                    // _prescriptionData.ddlActionStatus = ACTION_STATUS_TYPE.PURCHASE_COMMUNITY;
                }
            }
            //set action status for free test start

            let newDrugWillbeCheckedList = [];

            newDrugWillbeCheckedList.push(_prescriptionData);

            this.handleCheckAllergen(newDrugWillbeCheckedList, getThis, true);

            // if (prescriptionData.dangerDrug === 'Y' && prescriptionData.txtDuration && prescriptionData.ddlDurationUnit && prescriptionData.ddlFreq) {
            //     getThis.getDangerDose(prescriptionData);
            //     //prescriptionData.txtDangerDrugQty = this.state.totalDose;
            // } else {
            //     // prescriptionData.isNew = true;
            //     let updateData = {};
            //     updateData.selectedPrescriptionItem = prescriptionData;
            //     updateData.showDetail = true;
            //     updateData.saveMessageList = [];
            //     getThis.props.updateField(updateData);
            //     getThis.setState({
            //         errorMessageList: [],
            //         selectDrugIndex: prescriptionData.orgItemNo
            //     });
            // }
        };

        if (item) {
            prescriptionData = prescriptionUtilities.getSelectedPrescriptionData(item, childItem);
            let params = {
                data: prescriptionData.drugDto,
                callback: callback,
                callbackParams: prescriptionData
            };
            this.props.convertDrug(params);
        } else {
            prescriptionData.drugName = value;
            prescriptionData.displayString = value;
            prescriptionData.freeText = 'F';
            callback(prescriptionData);
        }
    }
    toggleDrawer = (isOpen) => {
        this.setState({ openDrawer: isOpen });
    }
    //open prescription panel
    prescriptionPanelClick = (item, index) => {
        let updateData = {};
        updateData.selectedPrescriptionItem = item;
        updateData.showDetail = true;
        updateData.saveMessageList = [];
        updateData.isSaveSuccess = false;
        // updateData.saveMessageList = [];
        this.props.updateField(updateData);
        this.setState({
            errorMessageList: [],
            selectDrugIndex: index,
            addDrugRoute: null,
            checkingType: null
        });
    }
    closePrescriptionPanel = (drug) => {
        this.cancelDrugForTabs(drug);
        let updateData = {};
        // if (data && data.isNew) {
        //     let newDrugList = [...this.props.drugList];
        //     newDrugList = newDrugList.filter(item => item.cmsItemNo !== data.cmsItemNo);
        //     updateData.drugList = newDrugList;
        // }
        updateData.showDetail = false;
        this.props.updateField(updateData);
        this.setState({
            // showDetail: false,
            errorMessageList: [],
            selectDrugIndex: null
        });
        // }
    }

    //prescription panel validation
    panelValidatorListener = (isValid, message, name, otherName) => {
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

    //DAC
    handleCheckAllergen = (newDrugList, getThis, isMoeSearch) => {
        if (this.props.patientAllergyList && this.props.patientAllergyList.length > 0) {
            const isHosp = moeUtilities.getHospSetting();
            //const setting = moeUtilities.getMoeSetting();
            let DACDrug = [];
            for (let i = 0; i < newDrugList.length; i++) {
                newDrugList[i].orderLineRowNum = i;
                let { allergyCheckFlag, vtm, freeText } = newDrugList[i];
                if ((isHosp.enableMds && allergyCheckFlag === 'Y' && vtm && freeText !== 'F') || (isHosp.enableMds && !isMoeSearch && vtm && freeText !== 'F')) {
                    let drugData = newDrugList[i];
                    let patientMedications = {
                        aliasName: drugData.aliasName,
                        doseFormExtraInfo: drugData.doseFormExtraInfo,
                        formDesc: drugData.txtForm,
                        format: false,
                        genericIndicator: drugData.genericIndicator,
                        ingredients: drugData.ingredientList,
                        manufacturer: drugData.manufacturer,
                        myFavourite: false,
                        nameType: drugData.nameType,
                        orderLineRowNum: i,
                        routeEng: drugData.routeEng,
                        screenDisplay: drugData.screenDisplay,
                        strength: prescriptionUtilities.getStrengthForBackend(drugData.prepCodeList, drugData.ddlPrep, drugData.strengthCompulsory) || '',
                        strengthCompulsory: drugData.strengthCompulsory,
                        strengthLevelExtraInfo: drugData.strengthLevelExtraInfo,
                        strengths: drugData.strengths && drugData.strengths.map(item => item.strength),
                        tradeName: drugData.drugName,
                        vtm: drugData.vtm
                    };
                    DACDrug.push(patientMedications);
                }
            }
            let params = {
                patientAllergies: [],
                patientMedications: [],
                userId: this.props.loginInfo.user.loginId,
                workStationIp: 'workStationIp'
            };
            for (let i = 0; i < this.props.patientAllergyList.length; i++) {
                if (this.props.patientAllergyList[i].allergenType !== 'C' && this.props.patientAllergyList[i].allergenType !== 'S' && this.props.patientAllergyList[i].allergenType !== 'N') {
                    //let patientAllergies = {};
                    // let allergyReactions = [];
                    // for(let index = 0; index < this.props.patientAllergyList[i].allergyReactions.length; index++){
                    //     let reactionItem = {};
                    //     reactionItem = {
                    //         displayName: this.props.patientAllergyList[i].allergyReactions[index].displayName,
                    //         reactionSeqNo:this.props.patientAllergyList[i].allergyReactions[index].reactionSeqNo
                    //     };
                    //     allergyReactions.push(reactionItem);
                    // }
                    let patientAllergies = {
                        additionalInfo: this.props.patientAllergyList[i].additionInfo || '',
                        allergen: this.props.patientAllergyList[i].allergen && this.props.patientAllergyList[i].allergen.vtm ? this.props.patientAllergyList[i].allergen.vtm : this.props.patientAllergyList[i].displayName,
                        allergenTermID: '',
                        allergenType: this.props.patientAllergyList[i].allergenType,
                        allergySeqNo: this.props.patientAllergyList[i].allergySeqNo,
                        certainty: this.props.patientAllergyList[i].certainty,
                        displayName: this.props.patientAllergyList[i].displayName,
                        allergyReactions: this.props.patientAllergyList[i].allergyReactions.map(item => {
                            return {
                                displayName: item.displayName,
                                reactionSeqNo: item.reactionSeqNo
                            };
                        })
                    };
                    params.patientAllergies.push(patientAllergies);
                }
            }
            //params.patientAllergies = this.props.patientAllergyList.map(item => )
            //params.patientAllergies = moeUtilities.getPatientAllergen();
            params.patientMedications = DACDrug;

            this.setState({
                isMoeSearch
            },
                () => {
                    if (params.patientAllergies && params.patientAllergies.length > 0) {
                        this.props.getAllergyChecking(params, () => {
                            if (this.props.allergyChecking && this.props.allergyChecking.length > 0) {
                                this.handleOpenDACDialog(newDrugList, 0);
                            } else {
                                // this.confirmDrug(newDrugList, false);
                                this.checkAllHLAB(newDrugList);
                            }
                        });
                    } else {
                        this.checkAllHLAB(newDrugList);
                    }
                });
        } else {
            for (let i = 0; i < newDrugList.length; i++) {
                newDrugList[i].orderLineRowNum = i;
            }
            this.setState({
                isMoeSearch
            }, () => {
                this.checkAllHLAB(newDrugList);
            });
        }
    }

    handleOpenDACDialog = (newDrugList, drugIndex) => {
        this.setState({
            showAllergyDialog: true,
            newAddedDrugList: newDrugList,
            drugIndex: drugIndex
        });
    }

    handleCloseDACDialog = (newDrugList) => {
        this.setState({
            showAllergyDialog: false,
            newAddedDrugList: newDrugList
        }, () => {
            if (this.state.newAddedDrugList && this.state.newAddedDrugList.length > 0)
                this.checkAllHLAB(this.state.newAddedDrugList);
        });
    }

    handleOKAllergyRemark = (DACDrug, selectedReason, remark) => {
        const DACReason = moeUtilities.getDACReasonCodelist();
        //combine allergen reason
        let allergens = '';
        for (let i = 0; i < DACDrug.patientAllergies.length; i++) {
            allergens += DACDrug.patientAllergies[i].allergen + '; ';
        }
        allergens = allergens.substr(0, allergens.length - 2);
        //end combine allergen reason
        let allergyReason = [];
        for (let i = 0; i < DACReason.length; i++) {
            if (selectedReason[i] === DACReason[i].id) {
                if (selectedReason[i] === 6) {
                    allergyReason.push(
                        {
                            allergen: allergens,
                            matchType: 'A',
                            certainty: null,
                            additionInfo: null,
                            overrideReason: remark,
                            manifestation: null,
                            overrideStatus: 'A',
                            ackBy: null,
                            ackDate: null,
                            screenMsg: ''
                        }
                    );
                } else {
                    allergyReason.push(
                        {
                            allergen: allergens,
                            matchType: 'A',
                            certainty: null,
                            additionInfo: null,
                            overrideReason: DACReason[i].value,
                            manifestation: null,
                            overrideStatus: 'A',
                            ackBy: null,
                            ackDate: null,
                            screenMsg: ''
                        }
                    );
                }
            }
        }
        let newAddedDrugList = this.state.newAddedDrugList;
        newAddedDrugList.map(item => {
            if (parseInt(item.orderLineRowNum) === parseInt(DACDrug.patientMedication.orderLineRowNum))
                item.allergens = allergyReason;
        });
        this.setState({
            showAllergyDialog: false,
            drugIndex: this.state.drugIndex + 1
        }, () => {
            if (this.state.drugIndex < this.props.allergyChecking.length)
                this.handleOpenDACDialog(newAddedDrugList, this.state.drugIndex);
            else
                this.handleCloseDACDialog(newAddedDrugList);
        });
    }

    handleNotPrescribeDAC = (DACDrug) => {
        let newAddedDrugList = this.state.newAddedDrugList;
        for (let i = 0; i < newAddedDrugList.length; i++) {
            if (parseInt(newAddedDrugList[i].orderLineRowNum) === parseInt(DACDrug.patientMedication.orderLineRowNum)) {
                newAddedDrugList.splice(i, 1);
                break;
            }

        }
        this.setState({
            showAllergyDialog: false,
            drugIndex: this.state.drugIndex + 1
        }, () => {
            if (this.state.drugIndex < this.props.allergyChecking.length)
                this.handleOpenDACDialog(newAddedDrugList, this.state.drugIndex);
            else
                this.handleCloseDACDialog(newAddedDrugList);
        });
    }
    //end DAC

    openAddDrugDetailPanel = (newDrug) => {
        if (newDrug.dangerDrug === 'Y' && newDrug.txtDuration && newDrug.ddlDurationUnit && newDrug.ddlFreq) {
            this.getDangerDose(newDrug);
            //prescriptionData.txtDangerDrugQty = this.state.totalDose;
        } else {
            // prescriptionData.isNew = true;
            let updateData = {};
            updateData.selectedPrescriptionItem = newDrug;
            updateData.showDetail = true;
            updateData.saveMessageList = [];
            this.props.updateField(updateData);
            this.setState({
                errorMessageList: [],
                selectDrugIndex: newDrug.orgItemNo,
                addDrugRoute: null,
                checkingType: null
            });
        }
    }

    //Start HLA-B check
    isPositive = () => {
        let isPositive = false;
        for (let i = 0; i < this.props.codeList.system_setting.length; i++) {
            if (this.props.codeList.system_setting[i].paramName.toUpperCase() === 'saam_alert_desc_hlab1502_positive'.toUpperCase()) {
                for (let z = 0; z < this.props.patientAlertList.length; z++) {
                    if (this.props.codeList.system_setting[i].paramValue === this.props.patientAlertList[z].alertDesc) {
                        isPositive = true;
                        break;
                    }
                }
            }
        }
        return isPositive;
    }

    isNegative = () => {
        let isNegative = false;
        let alertSeqNo = '';
        let alertVersion = 0;
        for (let i = 0; i < this.props.codeList.system_setting.length; i++) {
            if (this.props.codeList.system_setting[i].paramName.toUpperCase() === 'saam_alert_desc_hlab1502_negative'.toUpperCase()) {
                for (let z = 0; z < this.props.patientAlertList.length; z++) {
                    if (this.props.codeList.system_setting[i].paramValue === this.props.patientAlertList[z].alertDesc) {
                        isNegative = true;
                        alertSeqNo = this.props.patientAlertList[z].alertSeqNo;
                        alertVersion = this.props.patientAlertList[z].version;
                        break;
                    }
                }
            }
        }
        return {
            isNegative,
            alertSeqNo,
            alertVersion
        };
    }

    isEnableSaam = () => {
        let isEnableSaam = false;
        for (let i = 0; i < this.props.codeList.system_setting.length; i++) {
            if (this.props.codeList.system_setting[i].paramName === 'enable_saam') {
                if (this.props.codeList.system_setting[i].paramValue === 'Y')
                    isEnableSaam = true;
            }
        }
        return isEnableSaam;
    }

    checkAllHLAB = (newDrugList) => {
        if (this.isEnableSaam() && this.props.patientAllergyConnectedFlag && this.props.codeList.system_setting.find((item) => { return (item.paramName.toUpperCase() === 'enable_hla-b*1502_reminder'.toUpperCase() && item.paramValue === 'Y'); })) {

            let hlab1502VtmPromise = new Promise(this.props.getHlab1502VTM);
            hlab1502VtmPromise.then(() => {
                let emptyHLAB1502 = true;
                if (this.props.codeList.system_setting) {
                    for (let index = 0; index < this.props.codeList.system_setting.length; index++) {
                        if (this.props.codeList.system_setting[index].paramName.toUpperCase() === 'saam_alert_desc_hlab1502_negative'.toUpperCase()) {
                            for (let z = 0; z < this.props.patientAlertList.length; z++) {
                                if (this.props.codeList.system_setting[index].paramValue === this.props.patientAlertList[z].alertDesc) {
                                    emptyHLAB1502 = false;
                                    break;
                                }
                            }
                        }
                    }
                }

                let beCheckedList = [];
                if (emptyHLAB1502) {
                    for (let i = 0; i < newDrugList.length; i++) {
                        for (let key in this.props.hlab1502VtmList) {
                            if (key === newDrugList[i].vtm) {
                                beCheckedList.push(newDrugList[i]);
                            }
                        }
                    }
                }

                if (beCheckedList.length > 0) {
                    // let saamAlertVtmList = [];
                    // for (let key in this.props.hlab1502VtmList) {
                    //     saamAlertVtmList.push(this.props.hlab1502VtmList[key].vtm);
                    // }
                    //To be implemented (about matchType)

                    // if (this.state.isMoeSearch) {
                    this.openHLAB1502Dialog(beCheckedList, 0, newDrugList, false);
                    // }
                    // //My Fav & Drug History
                    // else {
                    //     this.openHLAB1502Dialog(beCheckedList, 0, newDrugList, false);
                    // }
                }
                else {
                    if (this.state.isMoeSearch)
                        this.openAddDrugDetailPanel(newDrugList[0]);
                    //My Fav & Drug History
                    else {
                        this.confirmDrug(newDrugList, true);
                    }
                }
            });
        }
        else {
            if (this.state.isMoeSearch)
                this.openAddDrugDetailPanel(newDrugList[0]);
            //My Fav & Drug History
            else {
                this.confirmDrug(newDrugList, true);
            }
        }
    }

    openDeleteNegativeRemark = (alertSeqNo, alertVersion) => {
        this.setState({
            alertSeqNo,
            alertVersion,
            showDeleteNegativeRemark: true
        });
    }

    okDeleteHLABRemark = (deleteReason) => {
        let params = {
            alertSeqNo: this.state.alertSeqNo,
            deleteReason,
            version: this.state.alertVersion
        };
        this.props.deleteHlabNegative(params);
        this.setState({
            showDeleteNegativeRemark: false
        }, () => {
            this.saveHLAB1502Reason();
        });
    }

    cancelDeleteHLABRemark = () => {
        this.setState({
            showDeleteNegativeRemark: false
        });
    }

    openHLAB1502Dialog = (beCheckedList, drugIndex, newDrugList, isEditHLAB) => {
        this.setState({
            openHLAB1502Dialog: this.isEnableSaam() && this.props.patientAllergyConnectedFlag,
            beCheckedList,
            beCheckedItem: beCheckedList[drugIndex],
            drugIndex,
            newAddedDrugList: newDrugList ? newDrugList : this.state.newAddedDrugList,
            isPositive: this.isPositive(),
            isEditHLAB
        });
    }

    openEditHLAB1502Dialog = (savedReasonDesc, beCheckedItem, isEditHLAB, prescriptionData, index = null) => {
        this.setState({
            openHLAB1502Dialog: this.isEnableSaam() && this.props.patientAllergyConnectedFlag,
            savedReasonDesc,
            beCheckedItem,
            isPositive: this.isPositive(),
            isEditHLAB,
            prescriptionData,
            selectDrugIndex: index
        });
    }

    okHLAB1502Dialog = (hlabCkbList, hlabReasonDesc, hlabRemarkVal) => {
        this.setState({
            hlabCkbList,
            hlabReasonDesc,
            hlabRemarkVal
        }, () => {
            if (this.isEnableSaam()) {
                const { isNegative, alertSeqNo, alertVersion } = this.isNegative();
                if (isNegative && !hlabCkbList[0]) {
                    this.openDeleteNegativeRemark(alertSeqNo, alertVersion);
                    return;
                }
                if (!this.state.isPositive && !isNegative && hlabCkbList[0]) {
                    this.props.saveHlab1502Negative();
                }
            }
            this.saveHLAB1502Reason();
        });
    }

    saveHLAB1502Reason = () => {
        let allergyReason = [];
        for (let i = 0; i < this.state.hlabCkbList.length; i++) {
            if (this.state.hlabCkbList[i] && i === this.state.hlabReasonDesc[i].val) {
                if (this.state.isPositive) {
                    if (i === 1) {
                        allergyReason.push(
                            {
                                allergen: this.state.beCheckedItem.vtm ? this.state.beCheckedItem.vtm : '',
                                matchType: 'H',
                                certainty: null,
                                additionInfo: null,
                                overrideReason: this.state.hlabRemarkVal,
                                manifestation: null,
                                overrideStatus: 'A',
                                ackBy: null,
                                ackDate: null,
                                screenMsg: 'This patient is <b>positive</b> for HLA-B*1502.'
                            }
                        );
                    } else {
                        allergyReason.push(
                            {
                                allergen: this.state.beCheckedItem.vtm ? this.state.beCheckedItem.vtm : '',
                                matchType: 'H',
                                certainty: null,
                                additionInfo: null,
                                overrideReason: this.state.hlabReasonDesc[i].desc,
                                manifestation: null,
                                overrideStatus: 'A',
                                ackBy: null,
                                ackDate: null,
                                screenMsg: 'This patient is <b>positive</b> for HLA-B*1502.'
                            }
                        );
                    }
                } else {
                    if (i === 3) {
                        allergyReason.push(
                            {
                                allergen: this.state.beCheckedItem.vtm ? this.state.beCheckedItem.vtm : '',
                                matchType: 'H',
                                certainty: null,
                                additionInfo: null,
                                overrideReason: this.state.hlabRemarkVal,
                                manifestation: null,
                                overrideStatus: 'A',
                                ackBy: null,
                                ackDate: null,
                                screenMsg: ''
                            }
                        );
                    } else {
                        allergyReason.push(
                            {
                                allergen: this.state.beCheckedItem.vtm ? this.state.beCheckedItem.vtm : '',
                                matchType: 'H',
                                certainty: null,
                                additionInfo: null,
                                overrideReason: this.state.hlabReasonDesc[i].desc,
                                manifestation: null,
                                overrideStatus: 'A',
                                ackBy: null,
                                ackDate: null,
                                screenMsg: ''
                            }
                        );
                    }
                }
            }
        }

        if (!this.state.isEditHLAB) {
            let tmpList = this.state.newAddedDrugList;
            for (let i = 0; i < tmpList.length; i++) {
                // if (this.state.drugIndex > 0 && tmpList[i].allergens && tmpList[i].allergens.find((item) => { return item.matchType === 'H'; })) {
                //     tmpList[i].allergens = allergyReason;
                // }
                if (parseInt(tmpList[i].orderLineRowNum) === parseInt(this.state.beCheckedItem.orderLineRowNum)) {
                    let dacAllergens = [];
                    if (tmpList[i].allergens && tmpList[i].allergens.length > 0) {
                        dacAllergens = tmpList[i].allergens.filter((item) => {
                            return item.matchType === 'A';
                        });
                    }
                    tmpList[i].allergens = _.cloneDeep(dacAllergens.concat(allergyReason));
                    break;
                }
            }

            this.setState({
                openHLAB1502Dialog: false,
                newAddedDrugList: tmpList,
                drugIndex: this.state.drugIndex + 1
            },
                () => {
                    if (this.state.isMoeSearch) {
                        this.openAddDrugDetailPanel(this.state.beCheckedList[0]);
                    }
                    else if (this.state.drugIndex < this.state.beCheckedList.length) {
                        this.openHLAB1502Dialog(this.state.beCheckedList, this.state.drugIndex, null, false);
                    }
                    else if (this.state.drugIndex >= this.state.beCheckedList.length) {
                        this.closeHLAB1502Dialog(false);
                    }
                });
        }
        else {
            let tmpPrescriptionData = this.state.prescriptionData;
            let dacAllergens = [];
            if (tmpPrescriptionData.allergens && tmpPrescriptionData.allergens.length > 0) {
                dacAllergens = tmpPrescriptionData.allergens.filter((item) => {
                    return item.matchType === 'A';
                });
            }
            tmpPrescriptionData.allergens = _.cloneDeep(dacAllergens.concat(allergyReason));
            // let tmpDrugList = _.cloneDeep(this.props.drugList);
            // for (let i = 0; i < tmpDrugList.length; i++) {
            //     if (tmpDrugList[i].allergens && tmpDrugList[i].allergens.find((item) => { return item.matchType === 'H'; })) {
            //         tmpDrugList[i].allergens = allergyReason;
            //     }
            // }
            this.setState({
                newAddedDrugList: tmpPrescriptionData
            }, () => {
                this.closeHLAB1502Dialog(false);
            });
        }
    }

    cancelHLAB1502Dialog = () => {
        if (!this.state.isEditHLAB) {
            let tmpNewAddedDrugList = this.state.newAddedDrugList;
            for (let i = 0; i < tmpNewAddedDrugList.length; i++) {
                if (parseInt(tmpNewAddedDrugList[i].orderLineRowNum) === parseInt(this.state.beCheckedItem.orderLineRowNum)) {
                    tmpNewAddedDrugList.splice(i, 1);
                    break;
                }
            }
            this.setState({
                openHLAB1502Dialog: false,
                newAddedDrugList: tmpNewAddedDrugList,
                drugIndex: this.state.drugIndex + 1
            },
                () => {
                    if (this.state.isMoeSearch) {
                        return;
                        // this.openAddDrugDetailPanel(this.state.beCheckedList[0]);
                    }
                    else if (this.state.drugIndex < this.state.beCheckedList.length) {
                        this.openHLAB1502Dialog(this.state.beCheckedList, this.state.drugIndex, null, false);
                    }
                    else if (this.state.drugIndex >= this.state.beCheckedList.length) {
                        this.closeHLAB1502Dialog(this.state.isEditHLAB);
                    }
                });
        } else {
            this.closeHLAB1502Dialog(this.state.isEditHLAB);
        }
    }

    closeHLAB1502Dialog = (isEditHLABCancel) => {
        const drugList = this.state.newAddedDrugList;
        const selectDrugIndex = this.state.selectDrugIndex;
        const isEditHLAB = this.state.isEditHLAB;
        this.setState({
            openHLAB1502Dialog: false,
            savedReasonDesc: [],
            isEditHLAB: false,
            prescriptionData: null,
            newAddedDrugList: [],
            selectDrugIndex: null,
            hlabCkbList: [],
            hlabReasonDesc: [],
            hlabRemarkVal: ''
        });
        if (!isEditHLABCancel && drugList && (Array.isArray(drugList) ? drugList.length > 0 : true))
            this.confirmDrug(drugList, !isEditHLAB);
        else if (isEditHLABCancel) {
            document.querySelector('[data-deletebtnid=deleteBtn' + selectDrugIndex + ']').click();
        }
    }
    //End HLA-B check

    minQuantityCheckAll = (drugDatas) => {
        let minQuantityDataList = [];
        if (drugDatas && drugDatas.length > 0) {
            for (let row = 0; row < drugDatas.length; row++) {
                let data = drugDatas[row];
                // let minQuantityRows = [];
                // let minDosages = null;
                // let minDosagesMessage = '';

                // if (data.apiData) {
                //     minDosages = data.apiData.minDosages;
                //     minDosagesMessage = data.apiData.minDosagesMessage;
                // } else if (data.convertData) {
                //     minDosages = data.convertData.minDosages;
                //     minDosagesMessage = data.convertData.minDosagesMessage;
                // }

                // if (!minDosages) {
                //     continue;
                // }
                // //row 1 check
                // if (this.minQuantityCheck(data, minDosages)) {
                //     minQuantityRows.push(1);
                // }

                // //other rows check
                // let otherRows = [];
                // let orderLineType = data.orderLineType;
                // let startIndex = 1;
                // let showMultiLine = false;
                // // if (data.dangerDrug === 'Y') startIndex = 1;
                // if (data.multipleLine && data.multipleLine.length > startIndex) {
                //     otherRows = data.multipleLine;
                //     showMultiLine = true;
                // } else if (data.stepUpDown && data.stepUpDown.length > startIndex) {
                //     otherRows = data.stepUpDown;
                //     showMultiLine = true;
                // } else if (orderLineType === 'R' && data.specialInterval) {
                //     if (data.specialInterval.supFreqCode === 'on odd / even days') {
                //         otherRows = [
                //             { multDoseNo: 1, txtDosage: data.txtDosage },
                //             { multDoseNo: 2, txtDosage: data.specialInterval.txtDosage }
                //         ];
                //         showMultiLine = true;
                //     }
                // }
                // for (let i = startIndex; i < otherRows.length; i++) {
                //     if (this.minQuantityCheck(otherRows[i], minDosages)) {
                //         minQuantityRows.push(i + 2 - startIndex);
                //     }
                // }

                // // let startIndex = 0;
                // // if (data.dangerDrug === 'Y') startIndex = 1;
                // // //other rows check
                // // if (data.multipleLine && data.multipleLine.length > 0) {
                // //     for (let i = startIndex; i < data.multipleLine.length; i++) {
                // //         if (this.minQuantityCheck(data.multipleLine[i], minDosages)) {
                // //             minQuantityRows.push(i + 2 - startIndex);
                // //         }
                // //     }
                // // } else if (data.stepUpDown && data.stepUpDown.length > 0) {
                // //     for (let i = startIndex; i < data.stepUpDown.length; i++) {
                // //         if (this.minQuantityCheck(data.stepUpDown[i], minDosages)) {
                // //             minQuantityRows.push(i + 2 - startIndex);
                // //         }
                // //     }
                // // }

                // let minQuantityDataItem = {
                //     minDosages: minDosages,
                //     minDosagesMessage: minDosagesMessage,
                //     drugName: data.displayString,
                //     showMultiLine: showMultiLine,
                //     rowNums: minQuantityRows,
                //     orderLineType: orderLineType,
                //     drug: data
                // };
                let minQuantityDataItem = moeUtilities.getMinQuantityCheckItem(data);

                if (minQuantityDataItem && minQuantityDataItem.rowNums.length) minQuantityDataList.push(minQuantityDataItem);
            }
        }

        let minQuantityData = {
            minQuantityData: minQuantityDataList,
            saveData: drugDatas,
            onProceed: (data) => {
                // const saveData = this.state.minQuantityData.saveData;
                this.setState({
                    showMinQuantityDialog: false,
                    minQuantityData: null
                },
                    () => {
                        if (data) {
                            const validDrug = data.filter(item => item.itemStatus !== MOE_DRUG_STATUS.DELETE);
                            // this.maxDurationChecking(drugDatas)
                            if (validDrug && validDrug.length > 0)
                                this.maxDurationChecking(validDrug);
                        }
                    }
                );
            },
            onReturnEdit: () => {
                this.setState({
                    showMinQuantityDialog: false,
                    minQuantityData: null
                },
                    this.closeDuplicateDialog(100)
                );
            }
        };

        if (minQuantityDataList.length > 0) {
            this.setState({
                showMinQuantityDialog: true,
                minQuantityData: minQuantityData
            });
        } else {
            this.maxDurationChecking(drugDatas);
        }
    }

    // //true:poup
    // maxDurationCheck = (data, maxDuration, allDurationDto) => {
    //     let result = true;
    //     let duration = 0;
    //     let max_duration = 0;
    //     let unit = 1;
    //     if (allDurationDto) {
    //         if (this.props.codeList.duration_unit_map && allDurationDto.ddlDurationUnit) unit = parseInt(this.props.codeList.duration_unit_map[0][allDurationDto.ddlDurationUnit]);
    //         duration = allDurationDto.txtDuration;
    //     } else {
    //         if (this.props.codeList.duration_unit_map && data.ddlDurationUnit) unit = parseInt(this.props.codeList.duration_unit_map[0][data.ddlDurationUnit]);
    //         if (data.txtDuration) duration = parseInt(data.txtDuration);
    //     }
    //     if (maxDuration) max_duration = parseInt(maxDuration);

    //     if (duration * unit <= max_duration) {
    //         result = false;
    //     }
    //     return result;
    // }

    _saveDrug = (data) => {
        const setting = moeUtilities.getMoeSetting();
        if (setting.isEdit || setting.backDate) {
            if (data.length === 1) {
                this.handleEditRemark();
            }
            else if (data.length > 1) {
                this.handleMultipleRemark(data);
            }
        }
        else {
            let arry = data;
            if (this.props.existDrugList) arry = arry.concat(this.props.existDrugList);
            //prescriptionUtilities.sortList(arry,'cmsItemNo');
            this.confirmDrug(arry, false);
        }
    };
    maxDurationChecking = (drugDatas, allDurationDto) => {
        let maxDurationDataList = [];
        if (drugDatas && drugDatas.length > 0) {
            for (let row = 0; row < drugDatas.length; row++) {
                // let data = drugDatas[row];
                // let maxDurationRows = [];
                // let maxDuration = null;

                // if (data.apiData) {
                //     maxDuration = data.apiData.maxDuration;
                // } else if (data.convertData) {
                //     maxDuration = data.convertData.maxDuration;
                // }

                // //for edit all duration start
                // if (allDurationDto) {
                //     if (data.itemStatus === MOE_DRUG_STATUS.DELETE) continue;
                //     let _orderLineType = data.orderLineType;
                //     if (moeUtilities.checkAllDuration(data, allDurationDto)) {
                //         if (maxDuration && moeUtilities.maxDurationCheck(data, maxDuration, this.props.codeList, allDurationDto)) {
                //             maxDurationRows.push(1);
                //             let _maxDurationDataItem = {
                //                 drugData: data,
                //                 unit: parseInt(this.props.codeList && this.props.codeList.duration_unit_map[0][data.ddlDurationUnit]),
                //                 allDurationUnit: parseInt(this.props.codeList && this.props.codeList.duration_unit_map[0][allDurationDto.ddlDurationUnit]),
                //                 maxDuration: maxDuration,
                //                 drugName: data.displayString,
                //                 itemIndex: row,
                //                 rowNums: maxDurationRows,
                //                 orderLineType: _orderLineType
                //             };
                //             maxDurationDataList.push(_maxDurationDataItem);
                //         } else {
                //             if (_orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
                //                 const unit = parseInt(this.props.codeList && this.props.codeList.duration_unit_map[0][data.ddlDurationUnit]);
                //                 data.txtDuration = allDurationDto.txtDuration / unit;
                //             } else {
                //                 // data = moeUtilities.editAllDuration(data, allDurationDto);
                //                 data.txtDuration = allDurationDto.txtDuration;
                //                 data.ddlDurationUnit = allDurationDto.ddlDurationUnit;
                //             }
                //             drugDatas[row] = data;
                //         }
                //     }
                //     continue;
                // }
                // //for edit all duration end

                // if (!maxDuration) {
                //     // break;
                //     continue;
                // }
                // //row 1 check
                // if (moeUtilities.maxDurationCheck(data, maxDuration, this.props.codeList)) {
                //     maxDurationRows.push(1);
                // }
                // //other rows check
                // // if (data.multipleLine && data.multipleLine.length > 1) {
                // //     for (let i = startIndex; i < data.multipleLine.length; i++) {
                // //         if (this.maxDurationCheck(data.multipleLine[i], maxDuration)) {
                // //             maxDurationRows.push(i + 2 - startIndex);
                // //         }
                // //     }
                // // } else if (data.stepUpDown && data.stepUpDown.length > 1) {
                // //     for (let i = startIndex; i < data.stepUpDown.length; i++) {
                // //         if (this.maxDurationCheck(data.stepUpDown[i], maxDuration)) {
                // //             maxDurationRows.push(i + 2 - startIndex);
                // //         }
                // //     }
                // // }

                // let orderLineType = data.orderLineType;
                // let otherRows = [];
                // let startIndex = 1;
                // // if (data.dangerDrug === 'Y') startIndex = 1;
                // if (data.multipleLine && data.multipleLine.length > startIndex) {
                //     otherRows = [data.multipleLine[0]];
                // } else if (data.stepUpDown && data.stepUpDown.length > startIndex) {
                //     otherRows = data.stepUpDown;
                // }

                // for (let i = startIndex; i < otherRows.length; i++) {
                //     if (moeUtilities.maxDurationCheck(otherRows[i], maxDuration, this.props.codeList)) {
                //         maxDurationRows.push(i + 2 - startIndex);
                //     }
                // }
                // let maxDurationDataItem = {
                //     drugData: data,
                //     unit: parseInt(this.props.codeList && this.props.codeList.duration_unit_map[0][data.ddlDurationUnit]),
                //     maxDuration: maxDuration,
                //     drugName: data.displayString,
                //     itemIndex: row,
                //     rowNums: maxDurationRows,
                //     orderLineType: orderLineType
                // };

                // if (maxDurationDataItem.rowNums.length) maxDurationDataList.push(maxDurationDataItem);
                moeUtilities.getMaxDurationCheckingItem(drugDatas, row, maxDurationDataList, this.props.codeList, allDurationDto);
            }
        }
        let maxDurationData = {
            maxDurationData: maxDurationDataList,
            saveData: drugDatas,
            onSave: (data) => {
                this.setState({
                    showMaxDurationDialog: false,
                    maxDurationData: null,
                    contextMenuSelectedItem: data
                }, () => {
                    if (this.state.addDrugRoute === ADD_DRUG_ROUTE.TAB) {
                        this.mandatoryFieldsChecking(data);
                        return;
                    }
                    this._saveDrug(data);
                });
            },
            allDurationDto: allDurationDto
        };

        if (maxDurationDataList.length > 0) {
            this.setState({
                showMaxDurationDialog: true,
                maxDurationData: maxDurationData
            });
        } else {
            this.setState({
                showMaxDurationDialog: false,
                maxDurationData: null,
                contextMenuSelectedItem: drugDatas
            }, () => {
                if (this.state.addDrugRoute === ADD_DRUG_ROUTE.TAB) {
                    this.mandatoryFieldsChecking(drugDatas);
                    return;
                }
                this._saveDrug(drugDatas);
            });
        }
    }

    saveDrug(newDrugList, isDeleteOrder, callback, isSubmit, spaCallback) {
        this.props.saveDrug(this.props.codeList, newDrugList, this.props.orderData, this.props.patient, isDeleteOrder, true, callback, null, isSubmit, spaCallback);
        this.props.updateField({ 'existDrugList': null });
    }

    //save drug
    confirmDrug = (data, isCheckedDuplicate, isDeleteOrder, callback) => {
        let newDrugList = this.props.drugList;
        if (!newDrugList) newDrugList = [];
        let isArray = Array.isArray(data);

        let newData = [];
        if (isArray) {
            newData = data;
        } else {
            newData.push(data);
        }

        // if (false) {
        //     let maxDurationData = {
        //         maxDuration: data.maxDuration,
        //         drugName: data.displayString
        //     };
        //     this.setState({
        //         showMaxDurationDialog: true,
        //         maxDurationData: maxDurationData
        //     });
        //     return;
        // }

        //Whether to delete the order number
        if (isDeleteOrder && !data.orderDetailId && !isArray) {
            let drugList = newDrugList.filter(item => item.cmsItemNo !== data.cmsItemNo);
            let updateData = {};
            updateData.drugList = drugList;
            this.props.updateField(updateData);
            return;
        }

        if (isCheckedDuplicate) {
            //check duplicate
            let duplicateList = prescriptionUtilities.checkDrugDuplicate(newDrugList, newData);
            if (duplicateList && duplicateList.length > 1) {
                //update reducer data
                let updateData = {};
                updateData.duplicateDrugList = duplicateList;
                updateData.openDuplicateDialog = true;
                updateData.isSaveSuccess = false;
                updateData.saveMessageList = null;
                updateData.disDuplicateDrugList = newData.filter(item => !duplicateList.find(ele => ele.cmsItemNo === item.cmsItemNo));

                if (callback)
                    callback();
                this.props.updateField(updateData);
                //The data that does not belong to duplicate is saved directly
                // let newList = newData.filter(item => !duplicateList.find(ele => ele.cmsItemNo === item.cmsItemNo));
                // if (newList && newList.length > 0) {
                //     newList = prescriptionUtilities.reassignCmsItemNoForList(newList, newDrugList);
                //     newList = newDrugList.concat(newList);
                //     this.props.saveDrug(this.props.codeList, newList, this.props.orderData, this.props.patient, isDeleteOrder, false, () => {
                //         if (callback)
                //             callback();
                //         this.props.updateField(updateData);
                //     });
                // } else {
                //     if (callback)
                //         callback();
                //     this.props.updateField(updateData);
                // }
                // return;
            } else {
                this.minQuantityCheckAll(newData);
                // if (newData.length === 1) {
                //     this.minQuantityCheckAll(newData, newDrugList);
                // }
                // //skip check minDosage and maxDuration while save one drug
                // else {
                //     this.confirmDrug(newData, false);
                // }
            }
            return;
        }

        //New data overrides existing data
        newDrugList = newDrugList.map(item => {
            let existDrug = newData.find(e => e.cmsItemNo === item.cmsItemNo && e.orderDetailId === item.orderDetailId);
            if (existDrug) {
                existDrug.isNewForDelete = false;
                item = existDrug;
                newData = newData.filter(ele => ele.cmsItemNo !== item.cmsItemNo);
            }
            return item;
        });

        //Reorder the cmsItemNo
        newData = prescriptionUtilities.reassignCmsItemNoForList(newData, newDrugList);

        newDrugList = newDrugList.concat(newData);
        prescriptionUtilities.sortList(newDrugList, 'cmsItemNo');
        this.saveDrug(newDrugList, isDeleteOrder, callback);
        //this.props.saveDrug(this.props.codeList, newDrugList, this.props.orderData, this.props.patient, isDeleteOrder, true, callback);

    }

    //duplication drug start
    //update by demi on 2019/12/20
    confirmDeleteDuplicateDrug = () => {
        try {
            let selectedList = _.cloneDeep(this.props.selectedDeletedList);

            let orderDrugList = _.cloneDeep(this.props.drugList);
            let duplicateDrugList = _.cloneDeep(this.props.duplicateDrugList);
            let newDuplicateDrugList = duplicateDrugList && duplicateDrugList.filter(item => item.isNewForDelete);

            if (selectedList && selectedList.length > 0) {
                // const selectedOrderDruglist = selectedList && selectedList.filter(item => orderDrugList.find(ele => item.cmsItemNo === ele.cmsItemNo));
                // //new drug list
                // const selectedNewDrugList = selectedList && selectedList.filter(item => !orderDrugList.find(ele => item.cmsItemNo === ele.cmsItemNo));
                const selectedOrderDruglist = selectedList.filter(item => !item.isNewForDelete);
                //new drug list
                const selectedNewDrugList = selectedList.filter(item => item.isNewForDelete);

                const newDrugExistOrderList = orderDrugList && orderDrugList.filter(item => selectedNewDrugList && selectedNewDrugList.find(ele => item.cmsItemNo === ele.cmsItemNo));

                //is invalid list
                const isInValidSelectedOrderDruglist = (!selectedOrderDruglist || selectedOrderDruglist.length === 0);
                //disDuplicateDrugList:The list belongs to drugs that are not duplicated
                const isInValidDisDuplicateDrugList = (!this.props.disDuplicateDrugList || this.props.disDuplicateDrugList.length === 0);
                const isInValidSelectedNewDrugList = (!selectedNewDrugList || selectedNewDrugList.length === 0);
                // const isInValidDrugList = (!this.props.drugList || this.props.drugList.length === 0);
                const isInValidDrugExistOrderList = (!newDrugExistOrderList || newDrugExistOrderList.length === 0);

                //each item in the selectedList is a new drug start
                if (isInValidSelectedOrderDruglist
                    && !isInValidSelectedNewDrugList
                    && selectedNewDrugList.length === newDuplicateDrugList.length
                    && isInValidDisDuplicateDrugList
                    && isInValidDrugExistOrderList
                ) {
                    let updateData = {};
                    // updateData.drugList = newDrugList;
                    updateData.showDetail = false;
                    updateData.duplicateDrugList = [];
                    updateData.openDuplicateDialog = false;
                    updateData.selectedDeletedList = [];
                    updateData.disDuplicateDrugList = [];
                    this.props.updateField(updateData);
                    return;
                }
                //each item in the selectedList is a new drug end

                if (!isInValidSelectedOrderDruglist) {
                    orderDrugList && orderDrugList.map(item => {
                        let curDrug = selectedOrderDruglist.find(ele => ele.cmsItemNo === item.cmsItemNo);
                        if (curDrug) {
                            item.itemStatus = MOE_DRUG_STATUS.DELETE;
                        }
                        return item;
                    });
                }

                //handle new drugs
                if (isInValidSelectedNewDrugList) {
                    //Check max duration Or minimun quantity
                    this.handleCheckMaxDurationOrMiniQTY(newDuplicateDrugList, orderDrugList);
                } else {
                    //exist deleted new drug in selectedList
                    let newOrgItemNo = orderDrugList ? orderDrugList.length + 1 : 1;
                    let newCmsItemId = prescriptionUtilities.getMaxId(this.props.drugList, 'cmsItemNo') + 1;

                    newDuplicateDrugList = newDuplicateDrugList && newDuplicateDrugList.filter(item => {
                        //deleted new drug Will not be saved to newDrugList
                        if (selectedNewDrugList.find(deletedItem => item.cmsItemNo === deletedItem.cmsItemNo)) {
                            return null;
                        }
                        item.cmsItemNo = newCmsItemId;
                        item.orgItemNo = newOrgItemNo;
                        newOrgItemNo++;
                        newCmsItemId++;
                        return item;
                    });
                    if (!isInValidDrugExistOrderList) {
                        orderDrugList && orderDrugList.map(item => {
                            let curDrug = newDrugExistOrderList.find(ele => ele.cmsItemNo === item.cmsItemNo);
                            if (curDrug) {
                                item.itemStatus = MOE_DRUG_STATUS.DELETE;
                            }
                            return item;
                        });
                    }

                    //Check max duration Or minimun quantity
                    // if (!isInValidSelectedOrderDruglist
                    //     // && !isInValidSelectedNewDrugList
                    //     && (selectedNewDrugList.length + selectedOrderDruglist.length === duplicateDrugList.length)
                    //     && isInValidDisDuplicateDrugList
                    //     && !isInValidDrugList
                    //     // && selectedOrderDruglist.length === this.props.drugList.length
                    //     && selectedOrderDruglist.length + (newDrugExistOrderList && newDrugExistOrderList.length) === this.props.drugList.length
                    //     && this.props.orderData && this.props.orderData.isCache !== 'Y' //except cache
                    // ) {
                    //     this.showDeleteReamrk();
                    // } else {
                    this.handleCheckMaxDurationOrMiniQTY(newDuplicateDrugList, orderDrugList);
                    // }
                }
            } else {
                // const data = this.props.duplicateDrugList.filter(item => item.isNewForDelete);
                // this.confirmDrug(data);
                //Check max duration Or minimun quantity
                this.handleCheckMaxDurationOrMiniQTY(newDuplicateDrugList, orderDrugList);
            }
            this.closeDuplicateDialog();
        } catch (error) {
            console.log(error);
            this.props.openErrorMessage('Error', null, 'Service error.');
        }
    }

    handleCheckMaxDurationOrMiniQTY = (newDuplicateDrugList, orderDrugList) => {
        let newAddedDrugList = null;
        if (this.props.disDuplicateDrugList && this.props.disDuplicateDrugList.length > 0) {
            newAddedDrugList = _.cloneDeep(newDuplicateDrugList.concat(this.props.disDuplicateDrugList));
        } else {
            newAddedDrugList = _.cloneDeep(newDuplicateDrugList);
        }
        prescriptionUtilities.sortList(newAddedDrugList, 'cmsItemNo');

        if (newAddedDrugList.length === 0) {
            this.confirmDrug(orderDrugList, false);
            //this.saveDrug(orderDrugList,)
        } else {
            let updateData = {};
            updateData.existDrugList = orderDrugList;
            this.props.updateField(updateData);
            this.minQuantityCheckAll(newAddedDrugList);
        }

        // if (newDuplicateDrugList.length > 0) {
        //     let updateData = {};
        //     updateData.existDrugList = orderDrugList;
        //     this.props.updateField(updateData);
        //     this.minQuantityCheckAll(newDuplicateDrugList);
        //     return;
        // } else {
        //     newDuplicateDrugList = newDuplicateDrugList.concat(orderDrugList);
        //     this.confirmDrug(newDuplicateDrugList, false);
        // }
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
    closeDuplicateDialog = (timeout) => {
        if (!timeout) timeout = 1000;
        let newDrugList = _.cloneDeep(this.props.drugList);
        newDrugList = newDrugList && newDrugList.filter(item => {
            if (item.isNewForDelete) {
                item.isNewForDelete = false;
            }
            if (item.isFavouriteToPre) {
                // eslint-disable-next-line
                return null;
            }
            return item;
        });
        let updateData = {};
        updateData.drugList = newDrugList;
        updateData.duplicateDrugList = [];
        updateData.openDuplicateDialog = false;
        updateData.selectedDeletedList = [];
        updateData.disDuplicateDrugList = [];
        this.props.updateField(updateData);
        setTimeout(() => {
            this.props.closeCommonCircular();
        }, timeout);
    }
    //duplication drug end

    handleDeleteOrder = () => {
        // let newDrugList = _.cloneDeep(this.props.drugList);
        // newDrugList = newDrugList && newDrugList.filter(item => item.orderDetailId);
        // newDrugList = newDrugList && newDrugList.map(item => {
        //     if (!item.orderDetailId)
        //         // eslint-disable-next-line
        //         return;
        //     item.itemStatus = MOE_DRUG_STATUS.DELETE;
        //     return item;
        // });
        // this.props.saveDrug(newDrugList, this.props.orderData, this.props.patient, true, true,
        //     () => { this.setState({ isReprint: false }); });
        if (this.props.orderData.moeOrder && this.state.remarkValue) {
            let params = { 'ordNo': this.props.orderData.moeOrder.ordNo, 'moeOrder': { 'remarkText': this.state.remarkValue } };
            params.callback = this.props.logout;
            this.props.deleteOrder(params);
        }
        // close duplicate panel
        // let updateData = {};
        // updateData.duplicateDrugList = [];
        // updateData.openDuplicateDialog = false;
        // this.props.updateField(updateData);

        //close prescription panel
        //this.closePrescriptionPanel();

        //close remark panel
        this.setState({
            // showDeleteOrderReamrkDialog: false,
            // deleteOrderRemark: ''
            errorMessageList: [],
            selectDrugIndex: null,
            remarkValue: '',
            showDeleteOrderReamrkDialog: false
        });
    }

    deleteOrder = () => {
        this.props.openCommonMessage({
            msgCode: MOE_MSG_CODE.DELETE_MOE_ORDER,
            btnActions: {
                btn1Click: () => {
                    this.showDeleteReamrk();
                }
            }
        });
    }
    showDeleteReamrk = () => {
        this.setState({
            showDeleteOrderReamrkDialog: true
            // showDeleteOrderDialog: false
        });
    }

    getDosageType = (patient) => {
        let dosageType = '';
        if (patient && patient.age) {
            if (patient.age) {
                let ageParas = patient.age.split(' ');
                if (ageParas.length === 2) {
                    if (ageParas[0] >= 12 && ageParas[1] && ageParas[1].toUpperCase().indexOf('YEAR') > -1) {
                        dosageType = 'A';
                    } else {
                        dosageType = 'P';
                    }
                }
            }
        }
        return dosageType;
    }

    refreshPrintFlag = () => {
        setTimeout(() => {
            let getOrderParams = {};
            getOrderParams.ordNo = this.props.orderData.ordNo;
            getOrderParams.caseNo = this.props.orderData.moeCaseNo;
            getOrderParams.hospcode = this.props.orderData.hospcode;
            getOrderParams.patientKey = this.props.orderData.moePatientKey;
            this.props.getOrderDrugList(getOrderParams);
        }, 50);
    }
    print = (previewData, callback) => {
        let thisProps = this.props;
        if (previewData) {
            thisProps.openCommonCircular();
            let paras = {
                base64: previewData.reportBase64
            };
            // if (moeUtilities.getHospSetting().enableCcp) {
            let printCallback = () => {
                thisProps.closeCommonCircular();
                if (typeof callback === 'function') {
                    this.refreshPrintFlag();
                    // setTimeout(() => {
                    //     let getOrderParams = {};
                    //     getOrderParams.ordNo = thisProps.orderData.ordNo;
                    //     getOrderParams.caseNo = thisProps.orderData.moeCaseNo;
                    //     getOrderParams.hospcode = thisProps.orderData.hospcode;
                    //     getOrderParams.patientKey = thisProps.orderData.moePatientKey;
                    //     this.props.getOrderDrugList(getOrderParams);
                    // }, 50);

                    // if(thisProps.orderData.printType === 'P')
                    // {
                    //     //...GET ORDER
                    //     this.props.getOrderDrugList(thisProps.orderData);
                    // }else{
                    //     let updateData = {};
                    //     updateData.orderData = thisProps.orderData;
                    //     updateData.orderData.moeOrder.printType = 'R';
                    //     thisProps.updateField(updateData);
                    // }
                    callback(); //close dialog
                }
            };
            paras.callback = printCallback;
            paras.printType = thisProps.orderData.printType;
            thisProps.print(paras);
            // } else {
            //     const blob = moeUtilities.b64toBlob(paras.base64, 'application/pdf');
            //     const blobUrl = URL.createObjectURL(blob);
            //     const iframe = document.createElement('iframe');
            //     iframe.src = blobUrl;
            //     iframe.setAttribute('style', 'position: fixed; left: -9999px;');
            //     document.body.appendChild(iframe);
            //     iframe.contentWindow.focus();
            //     iframe.contentWindow.print();
            //     thisProps.closeCommonCircular();
            // }
        }
    }

    previewClick = (timeout) => {
        if (!timeout) timeout = 0;
        setTimeout(() => {
            let orderNo = 0;
            if (this.props.orderData && this.props.orderData.moeOrder && this.props.orderData.moeOrder.ordNo)
                orderNo = this.props.orderData.moeOrder.ordNo;

            let callback = (previewData) => {
                if (previewData.directPrintFlag === 'Y') {
                    this.print(previewData);
                }
                else if (previewData.directPrintFlag === 'N') {
                    this.setState({
                        previewShow: true
                    });
                }
            };
            let isReprint = this.getIsReprint(this.props.orderData);
            this.props.getPdf({
                'isReprint': isReprint ? 'Y' : 'N',
                'ordNo': orderNo,
                'callback': callback
            });
        }, timeout);
    }

    checkOrderItem = () => {
        const { orderData } = this.props;
        if (orderData && orderData.moeOrder) {
            if (!orderData.moeOrder.moeMedProfiles) return false;
            let dbList, cacheList;
            if (orderData.moeOrder.moeMedProfiles) {
                dbList = orderData.moeOrder.moeMedProfiles.filter(item => item.ordNo);
                cacheList = orderData.moeOrder.moeMedProfiles.filter(item => item.itemStatus !== MOE_DRUG_STATUS.DELETE && !item.ordNo);
            }
            if ((!cacheList || cacheList.length === 0)
                && (!dbList || dbList.length === 0)
            ) {
                // this.props.handleRecoverDialog(false);
                this.cancelOrderClick();
                return true;
            }
            const dbValidList = dbList && dbList.filter(item => item.itemStatus !== MOE_DRUG_STATUS.DELETE);
            if ((!dbValidList || dbValidList.length === 0) && (!cacheList || cacheList.length === 0)) {
                this.props.openCommonMessage({
                    msgCode: MOE_MSG_CODE.CHECK_NO_ITEM_FOR_PRESCRIPTION,
                    btnActions: {
                        btn1Click: () => {
                            this.showDeleteReamrk();
                        }
                    }
                });
                return true;
            }
        }
        return false;
    }
    saveClick = (spaCallback) => {
        if (this.checkOrderItem()) return;
        this.saveDrug(this.props.orderData, false, null, true, spaCallback);
    }
    saveAndPrintClick = () => {
        if (this.checkOrderItem()) return;
        this.saveDrug(this.props.orderData, false, () => { this.previewClick(50); }, true);
    }

    cancelOrderClick = () => {
        const { loginInfo, orderData } = this.props;
        let dataParams = {
            'caseNo': loginInfo && loginInfo.user && loginInfo.user.moeCaseNo,
            'hospcode': loginInfo && loginInfo.user && loginInfo.user.hospitalCd,
            'ordNo': orderData && orderData.ordNo,
            'patientKey': loginInfo && loginInfo.user && loginInfo.user.moePatientKey
        };
        this.props.cancelOrder(dataParams);
    }

    closePreviewDialog = () => {
        this.setState({
            previewShow: false
        });
    }

    //context menu
    handleClose = (resetItem) => {
        let contextMenuSelectedItem = this.state.contextMenuSelectedItem;
        if (resetItem) {
            contextMenuSelectedItem = null;
        }
        this.setState({
            anchorEl: null,
            anchorElIndex: null,
            contextMenuSelectedItem: contextMenuSelectedItem
        });
    };

    handleContextMenu = (e, index, item) => {
        e.stopPropagation();
        e.preventDefault();
        let clickX = e.clientX;
        let clickY = e.clientY;

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        let menu = document.getElementById('prescriptionContextMenuPaper');
        const menuW = menu.offsetWidth;
        const menuH = menu.offsetHeight;

        const right = (screenW - clickX) > menuW;
        const left = !right;
        const bottom = (screenH - clickY) > menuH;
        const top = !bottom;

        if (right) {
            menu.style.left = `${clickX}px`;
        }

        if (left) {
            menu.style.left = `${clickX - menuW}px`;
        }

        if (bottom) {
            menu.style.top = `${clickY}px`;
        }
        if (top) {
            menu.style.top = `${clickY - menuH}px`;
        }

        this.setState({
            anchorEl: e.currentTarget,
            anchorElIndex: index + 1,
            contextMenuSelectedItem: item
        });

    }
    handleContextMenuClick = () => {
        if (this.state.anchorEl)
            this.handleClose();
    }

    //my favourit
    addToMyFavourite = () => {
        let { contextMenuSelectedItem } = this.state;
        this.props.addToMyFavourite(contextMenuSelectedItem, null, this.props.codeList);
        this.props.updateMyFavSearchInputVal({ favKeyword: '' });
        this.handleClose(true);
    }

    openMyFavouriteDrugSetDialog = (isOpen) => {
        let updateData = {};
        updateData.drugSet = null;
        updateData.showDugSetDialog = isOpen;
        this.props.myFavouriteUpdateField(updateData);
        this.handleClose();
    }

    // handleAddMyFavDrugToPriscription = (item, isParent) => {
    //     let newData;
    //     if (isParent) {
    //         newData = item.moeMedProfiles;
    //     } else {
    //         newData = item;
    //     }
    //     let newItems = prescriptionUtilities.getNewOrderDrugListOrObject(newData, this.props.drugList);
    //     //show remark dialog
    //     // const setting = moeUtilities.getMoeSetting();
    //     // if ((setting.isEdit || setting.isBackdate) && newItems) {
    //     //     this.handleMyFavRemark(newItems);
    //     //     return;
    //     // }

    //     // this.confirmDrug(newItems, true);
    //     let newDrugWillbeCheckedList = [];

    //     if (!newItems.length) {
    //         newDrugWillbeCheckedList.push(newItems);
    //     }
    //     else {
    //         for (let index = 0; index < newItems.length; index++) {
    //             newDrugWillbeCheckedList.push(newItems[index]);
    //         }
    //     }
    //     //this.handleCheckAllergen(newItems,this,false);
    //     this.handleCheckAllergen(newDrugWillbeCheckedList, this, false);
    // }
    //remark dialog
    handleMyFavRemark = (drugData) => {
        this.setState({
            showMyFavRemarkDialog: true,
            myFavRemarkData: drugData
        });
    }
    handleMyFavRemarkOk = (remarkValue, data) => {
        this.props.confirmDrug(data, true, null, () => {
            this.setState({
                showMyFavRemarkDialog: false,
                myFavRemarkData: null
            });
        });
    }
    handleMyFavRemarkCancel = () => {
        this.setState({
            showMyFavRemarkDialog: false,
            myFavRemarkData: null
        });
    }

    //drag start
    setDrugPrescriptionStyle = (isClearBorder) => {
        let ele = document.getElementById('prescriptionDrugListGrid');
        if (isClearBorder) {
            // ele.style.backgroundColor='';
            ele.style.border = '3px dotted #fff';
        } else {
            // ele.style.backgroundColor='rgb(0,102,255,0.08)';
            ele.style.border = '3px dotted #99CCFF';
        }
    }
    // handleDragEnter = () => {
    //     this.setDrugPrescriptionStyle();
    // }
    handleDragOver = (event) => {
        event.preventDefault();
        this.setDrugPrescriptionStyle();
    }
    handleDragLeave = () => {
        this.setDrugPrescriptionStyle(true);
    }
    handleDrop = (event) => {
        event.stopPropagation();
        event.preventDefault();
        this.setDrugPrescriptionStyle(true);

        let flag = event.dataTransfer.getData('flag');
        // // My favourite start
        // if (flag === 'MOEMYFAV') {
        //     let isParent = event.dataTransfer.getData('isParent');

        //     if (!isParent) return;
        //     let isParentBool = false;
        //     let data = null;
        //     if (isParent === 'true') {
        //         isParentBool = true;
        //         data = event.dataTransfer.getData('item');
        //     }
        //     else {
        //         data = event.dataTransfer.getData('subItem');
        //     }
        //     if (!data) return;
        //     let item = JSON.parse(data);
        //     this.handleAddMyFavDrugToPriscription(item, isParentBool);
        // }
        // // My favourite end

        //update by demi on 20191023
        let isDrugSet = event.dataTransfer.getData('isDrugSet');
        let isDrugSetBool = false;
        if (isDrugSet === 'true') {
            isDrugSetBool = true;
        }
        let data;

        if (flag === 'MOEMYFAV') {//my favourite
            if (isDrugSetBool) {
                data = event.dataTransfer.getData('item');
            } else {
                data = event.dataTransfer.getData('subItem');
            }
        } else {
            data = event.dataTransfer.getData('item');
        }
        let item = JSON.parse(data);
        if (!isDrugSetBool && (item && item.freeText === 'F')) {
            return;
        }

        if (flag === 'MOEDEPTFAV' || flag === 'MOEHISTORY' || flag === 'MOEMYFAV') {
            this.handleAddDrugToPriscription(item, isDrugSetBool, flag);
        }
        //update by demi on 20191023 end
    }
    //drag end

    //add by david 20200306
    existUnavailable = (drugItem, isDrugSet, tabName, addDrug) => {
        let drugsText = '';
        let _drugItem = _.cloneDeep(drugItem);
        if (isDrugSet) {
            let subItemList = moeUtilities.getUnavailableList(_drugItem);
            if (subItemList.length > 0) {
                for (let i = 0; i < subItemList.length; i++) {
                    let _subItem = subItemList[i];
                    let title = moeUtilities.getDrugNameHtml(_subItem, this.props.codeList);
                    let rowNo = subItemList.length > 1 ? `(${i + 1})` : '';
                    let msgTmp = moeUtilities.getUnavailableMsg(_subItem);
                    drugsText += `${rowNo}${title}${msgTmp}<br><br>`;
                }
            }
            _drugItem.moeMedProfiles = moeUtilities.getAvailableList(_drugItem);
        } else {
            let disableSubItem = !moeUtilities.isAvailable(_drugItem);
            if (disableSubItem) {
                let title = moeUtilities.getDrugNameHtml(_drugItem, this.props.codeList);
                let msgTmp = moeUtilities.getUnavailableMsg(_drugItem);
                drugsText += `${title}${msgTmp}`;
                _drugItem = null;
            }
        }
        if (drugsText) {
            this.props.openCommonMessage({
                msgCode: MOE_MSG_CODE.MOE_ADD_SET_TO_ORDER_FAILED,
                params: [
                    {
                        name: 'DRUGS',
                        value: drugsText
                    }
                ],
                btnActions: {
                    btn1Click: () => {
                        if (_drugItem || _drugItem && _drugItem.length > 0) addDrug(_drugItem, isDrugSet, tabName);
                    }
                }
            });
            return true;
        }
        return false;
    }
    //add by demi on 20191023
    handleAddDrugToPriscription = (drugItem, isDrugSet, tabName) => {
        const addDrug = (_drugItem, _isDrugSet, _tabName) => {
            try {
                let newData;
                const { orderData } = this.props;
                let setting = moeUtilities.getMoeSetting();
                const remarkText = (drugDto, _orderData) => {
                    if (setting.isCreate)
                        return null;
                    else if (setting.isBackdate) {
                        if (_orderData && _orderData.moeOrder)
                            return _orderData.moeOrder.remarkText;
                    }
                    else
                        return drugDto.remarkText;
                };
                const startFromDate = (drugDto, name) => {
                    if (name === 'MOEHISTORY') {
                        if (setting.isBackdate) {
                            return newData.txtStartFrom ? moment(this.props.backDate, Enum.DATE_FORMAT_EYMD_VALUE).valueOf() : null;
                        } else {
                            return newData.txtStartFrom ? moment(new Date(), Enum.DATE_FORMAT_EYMD_VALUE).valueOf() : null;
                        }
                    }
                    return newData.txtStartFrom;
                };
                if (_isDrugSet) {
                    newData = _.cloneDeep(_drugItem.moeMedProfiles);
                    let freeTextData = newData.filter(item => item.freeText === 'F');

                    //If all the data is free text, the API is not invoked
                    if (freeTextData && freeTextData.length === newData.length)
                        return false;

                    newData = newData.filter(item => item.freeText !== 'F');

                    //should not carry remark
                    newData = newData.filter(item => {
                        item.remarkText = remarkText(item, orderData);
                        item.txtStartFrom = startFromDate(item, _tabName);
                        return item;
                    });
                    // if (tabName === 'drugHistory') {
                    //     newData = newData.filter(item => {
                    //         item.remarkText = remarkText(item, orderData);
                    //         return item;
                    //     });
                    // }
                    // if (tabName === 'myFav') {
                    //     newData = newData.filter(item => {
                    //         item.remarkText = remarkText(item, orderData);
                    //         return item;
                    //     });
                    // }

                    if (freeTextData && freeTextData.length > 0) {
                        this.props.updateHistoryField({
                            freeTextData: freeTextData,
                            open: true,
                            newData: newData
                        });
                        return false;
                    }
                } else {
                    newData = _.cloneDeep(_drugItem);
                    //drug history should not carry remark
                    newData.remarkText = remarkText(newData, orderData);
                    newData.txtStartFrom = startFromDate(newData, _tabName);
                }
                let newItems = prescriptionUtilities.getNewOrderDrugListOrObject(newData, this.props.drugList);
                if (!_isDrugSet)
                    newItems = [newItems];
                // this.handleCheckAllergen(_.cloneDeep(newItems), this, false);
                //this.minQuantityCheckAll(newItems);
                this.setState({
                    addDrugRoute: ADD_DRUG_ROUTE.TAB
                }, () => {
                    this.handleCheckAllergen(_.cloneDeep(newItems), this, false);
                });
            } catch (error) {
                console.log(error);
                this.props.openErrorMessage('Error', null, 'Service error.');
            }
        };
        if (this.existUnavailable(drugItem, isDrugSet, tabName, addDrug)) return;
        addDrug(drugItem, isDrugSet, tabName);
    }
    //add by demi on 20191023 end

    getIsReprint = (orderData) => {
        let isReprint = false;
        if (orderData && orderData.moeOrder && orderData.moeOrder.printType === 'R') {
            isReprint = true;
        }
        return isReprint;
    }

    //context menu for edit remark start
    handleEditRemark = () => {
        let { contextMenuSelectedItem } = this.state;
        this.handRemark(contextMenuSelectedItem, 'drugEditRemark');
    }
    handleEditRemarkOk = (value) => {
        let { contextMenuSelectedItem } = this.state;
        this.handRemarkOk(contextMenuSelectedItem, value);
    }
    //context menu for edit remark end

    handRemark = (drugData, remarkDialogMode) => {
        let data = {};
        if (Array.isArray(drugData)) data = drugData[0];
        else data = drugData;
        // let vtm = (drugData.vtm && drugData.vtm !== '' ? ' (' + drugData.vtm + ')' : '');
        // let strength = drugData.freeText === 'F' ? drugData.txtStrength && drugData.txtStrength : drugData.isShowAdvanced && drugData.ddlPrep && prescriptionUtilities.getPrepSelectValue(drugData.ddlPrepCodeList, drugData.ddlPrep);
        // let form = drugData.txtForm ? ' ' + drugData.txtForm : null;
        let drugTitle = prescriptionUtilities.getDrugPartTitle(data);// drugData.drugName + vtm + (strength ? ' ' + strength : '') + form;
        let remarkText = data.remarkText;
        this.setState({
            showRemarkDialog: true,
            remarkDialogTitle: 'Remark for updating ' + drugTitle,
            remarkDialogMode: remarkDialogMode,
            remarkValue: remarkText,
            contextMenuSelectedItem: data
        });
    }

    handRemarkOk = (contextMenuSelectedItem, value) => {
        let arry = [];
        if (Array.isArray(contextMenuSelectedItem)) {
            contextMenuSelectedItem[0].remarkText = value;
            arry = contextMenuSelectedItem;
        }
        else {
            contextMenuSelectedItem.remarkText = value;
            arry = [contextMenuSelectedItem];
        }
        if (this.props.existDrugList) arry = arry.concat(this.props.existDrugList);
        prescriptionUtilities.sortList(arry, 'cmsItemNo');
        this.confirmDrug(arry, false);
        this.setState({
            showRemarkDialog: false,
            remarkValue: ''
        });
    }
    handleUpdateConfirmRemark = (drugData) => {
        // let { selectedPrescriptionItem } = this.props;
        this.handRemark(drugData, 'drugUpdateConfirmRemark');
    }
    handleUpdateConfirmRemarkOk = (value) => {
        let { contextMenuSelectedItem } = this.state;
        this.handRemarkOk(contextMenuSelectedItem, value);
    }

    handleRemarkDialogOk = () => {
        const { remarkDialogMode, remarkValue } = this.state;
        switch (remarkDialogMode) {
            case 'drugEditRemark':
                this.handleEditRemarkOk(remarkValue);
                break;
            case 'drugUpdateConfirmRemark':
                this.handleUpdateConfirmRemarkOk(remarkValue);
                break;

            default: break;
        }
    }

    //multiple remark dialog start
    //remark dialog
    handleMultipleRemark = (drugData) => {
        this.setState({
            showMultipleRemarkDialog: true,
            multipleRemarkData: drugData
        });
    }
    handMultipleRemarkOk = (remarkValue, data) => {
        this.confirmDrug(data, false, null, () => {
            this.setState({
                showMultipleRemarkDialog: false,
                multipleRemarkData: null
            });
        });

    }
    //multiple remark dialog end

    //MDS Enquiry
    openMDSEnqPanel = () => {
        this.setState({
            showMDSEnq: true
        });
    }

    hideMDSEnqPanel = () => {
        this.setState({
            showMDSEnq: false
        });
    }

    showCache = (_orderData) => {
        let getOrderParams = {};
        getOrderParams.ordNo = _orderData.ordNo;
        getOrderParams.caseNo = _orderData.moeCaseNo;
        getOrderParams.hospcode = _orderData.hospcode;
        getOrderParams.patientKey = _orderData.moePatientKey;
        this.props.getOrderDrugList(getOrderParams);
    }

    onIncompleteCheckingRef = (ref) => {
        this.inCompleteCheckingRef = ref;
    }
    editDrugDetailforTabs = (drug, checkingType) => {
        this.props.updateField({
            showDetail: true,
            selectedPrescriptionItem: drug,
            saveMessageList: [],
            isSaveSuccess: false
        });
        this.setState({
            errorMessageList: [],
            selectDrugIndex: 0,
            checkingType: checkingType
        });
    }
    confirmDrugForTabs = (drug, isProceed) => {
        let saveData;
        let data;
        let newMinData;
        let isvalid = true;

        let updateState = {
            errorMessageList: [],
            selectDrugIndex: null
        };

        const { checkingType } = this.state;
        if (checkingType === CHECKING_TYPE.MIN_DOSAGE) {
            newMinData = _.cloneDeep(this.state.minQuantityData);
            saveData = _.cloneDeep(newMinData.saveData);
            data = _.cloneDeep(newMinData.minQuantityData);
            //Check again start
            const minQuantityDataItem = moeUtilities.getMinQuantityCheckItem(drug);
            if (minQuantityDataItem && minQuantityDataItem.rowNums && minQuantityDataItem.rowNums.length > 0) {
                isvalid = false;
                if (data) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].drug.orgItemNo === drug.orgItemNo) {
                            newMinData.minQuantityData[i] = _.cloneDeep(minQuantityDataItem);
                            break;
                        }
                    }
                }
            }
            //Check again end
            updateState.minQuantityData = newMinData;
        }
        if (checkingType === CHECKING_TYPE.MANDATORY_FIELD) {
            newMinData = _.cloneDeep(this.state.mandatoryFieldsData);
            saveData = _.cloneDeep(newMinData.saveData);
            data = _.cloneDeep(newMinData.mandatoryFieldsData);
            //Check again start
            if (!isProceed) {
                const mandatoryFieldsItem = moeUtilities.getMandaFieldsItem(drug);
                if (mandatoryFieldsItem.fieldsList.length > 0) {
                    isvalid = false;
                    if (data) {
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].drug.orgItemNo === drug.orgItemNo) {
                                newMinData.mandatoryFieldsData[i] = _.cloneDeep(mandatoryFieldsItem);
                                break;
                            }
                        }
                    }
                }
                //Check again end
                updateState.mandatoryFieldsData = newMinData;
            }
        }
        if (saveData) {
            for (let i = 0; i < saveData.length; i++) {
                if (saveData[i].orgItemNo === drug.orgItemNo) {
                    newMinData.saveData[i] = _.cloneDeep(drug);
                    break;
                }
            }
        }

        let updateData = {};
        updateData.showDetail = false;
        this.props.updateField(updateData);
        this.setState(updateState, () => {
            if (isvalid)
                this.inCompleteCheckingRef.onProceed(newMinData);
        });
    }
    cancelDrugForTabs = (drug) => {
        if (this.state.addDrugRoute === ADD_DRUG_ROUTE.TAB) {
            const { checkingType } = this.state;
            if (checkingType === CHECKING_TYPE.MIN_DOSAGE) {
                let newAddedDrugList = _.cloneDeep(this.state.minQuantityData);
                newAddedDrugList = this.cancleInCompletePanel(drug, newAddedDrugList, 'minQuantityData');
                this.setState({
                    minQuantityData: newAddedDrugList
                },
                    this.inCompleteCheckingRef.onProceed(newAddedDrugList)
                );
            }
            if (checkingType === CHECKING_TYPE.MANDATORY_FIELD) {
                let newAddedDrugList = _.cloneDeep(this.state.mandatoryFieldsData);
                newAddedDrugList = this.cancleInCompletePanel(drug, newAddedDrugList, 'mandatoryFieldsData');
                // if (!newAddedDrugList || !newAddedDrugList.mandatoryFieldsData || newAddedDrugList.mandatoryFieldsData.length === 0) {
                this.setState({
                    mandatoryFieldsData: newAddedDrugList
                },
                    this.inCompleteCheckingRef.onProceed(newAddedDrugList)
                );
                // }
            }
        }
    }

    mandatoryFieldsChecking = (drugDatas) => {
        let mandatoryFieldsList = [];
        for (let row = 0; row < drugDatas.length; row++) {
            let data = drugDatas[row];
            let mandatoryFieldsItem = moeUtilities.getMandaFieldsItem(data);

            if (mandatoryFieldsItem.fieldsList.length > 0) mandatoryFieldsList.push(mandatoryFieldsItem);
        }

        let mandatoryFieldsData = {
            mandatoryFieldsData: mandatoryFieldsList,
            saveData: drugDatas,
            onProceed: (saveDatas) => {
                // const saveData = this.state.mandatoryFieldsData.saveData;
                this.setState({
                    openMandatoryDialog: false,
                    mandatoryFieldsData: null
                }, () => {
                    if (saveDatas && saveDatas.length > 0) {
                        const validData = saveDatas.filter(item => item.itemStatus !== MOE_DRUG_STATUS.DELETE);
                        if (validData && validData.length > 0) {
                            this._saveDrug(validData);
                        }
                    }
                });
            },
            onEditing: () => {
                this.setState({
                    openMandatoryDialog: false,
                    mandatoryFieldsData: null
                },
                    this.closeDuplicateDialog(100)
                );
            }
        };

        if (mandatoryFieldsList.length > 0) {
            this.setState({
                openMandatoryDialog: true,
                mandatoryFieldsData: mandatoryFieldsData
            });
        } else {
            this._saveDrug(drugDatas);
        }
    }

    cancleInCompletePanel = (drug, list, dataName) => {
        // const fieldsDataIndex = list[dataName].findIndex(item => item.drug && item.drug.orgItemNo === drug.orgItemNo);
        // const saveDataIndex = list.saveData.findIndex(item => item.orgItemNo === drug.orgItemNo);
        // if (fieldsDataIndex > -1) {
        //     list[dataName].splice(fieldsDataIndex, 1);
        // }
        // if (saveDataIndex > -1) {
        //     list.saveData.splice(saveDataIndex, 1);
        // }
        if (!list) return [];
        const newData = list[dataName] && list[dataName].filter(item => {
            if (item.drug && item.drug.orgItemNo === drug.orgItemNo) {
                item.status = MOE_DRUG_STATUS.DELETE;
            }
            return item;
        });
        const newSave = list.saveData && list.saveData.filter(item => {
            if (item.orgItemNo === drug.orgItemNo) {
                item.itemStatus = MOE_DRUG_STATUS.DELETE;
            }
            return item;
        });
        list[dataName] = newData || [];
        list.saveData = newSave || [];
        return list;
    }

    render() {
        const { classes } = this.props;
        let isReprint = this.getIsReprint(this.props.orderData);
        let lastUpdDate = null;
        let lastUpdBy = null;
        let cacheDate = null;
        let cacheBy = null;
        if (this.props.orderData) {
            if (this.props.orderData.moeOrder && this.props.orderData.moeOrder.lastUpdDate) {
                // if (this.props.orderData.moeOrder.lastUpdDate) lastUpdDate = moment(this.props.orderData.moeOrder.lastUpdDate).format('DD-MMM-YYYY HH:mm');
                if (this.props.orderData.moeOrder.lastUpdDate) lastUpdDate = moment(this.props.orderData.moeOrder.lastUpdDate).format(Enum.DATE_FORMAT_24_HOUR);
                if (this.props.orderData.moeOrder.lastUpdBy) lastUpdBy = this.props.orderData.moeOrder.lastUpdBy;
            }
            if (this.props.orderData.cacheBy) cacheBy = this.props.orderData.cacheBy;
            // if (this.props.orderData.cacheDtm) cacheDate = moment(this.props.orderData.cacheDtm).format('DD-MMM-YYYY HH:mm');
            if (this.props.orderData.cacheDtm) cacheDate = moment(this.props.orderData.cacheDtm).format(Enum.DATE_FORMAT_24_HOUR);
        }
        let setting = moeUtilities.getMoeSetting();

        let gridHeight = window.screen.availHeight - this.props.heightAdjust;
        if (gridHeight < 200) gridHeight = 200;
        return (
            <Typography component={'div'} style={{ marginTop: 0, padding: 0, height: this.state.outmostHeight + 'px' }} dptid={'outmost_moeouter_container'} >
                <Grid container direction={'row'} >
                    <Grid container ref={this.PrescriptionRef}>
                        <Grid style={{ width: 'calc(100% - 202px)' }}>
                            {this.props.codeList.system_setting &&
                                <AllergyInfo
                                    id={'prescriptionAllergyInfo'}
                                    showButton={this.props.showAllergyButton}
                                    isEnableSaam={this.isEnableSaam()}
                                />
                            }
                        </Grid>
                        <Grid style={{ ...localClass.buttonPosition }}>
                            <Grid container alignItems={'center'} style={{ padding: '0 4px' }}>
                                <CIMSButton id={'prescriptionMDSEnqCIMSButton'} onClick={this.openMDSEnqPanel}>MDS Enquiry</CIMSButton>
                                <EmailIcon fontSize={'large'} style={{ margin: '8px' }} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container direction={'row'} style={{ flexWrap: 'nowrap' }} dptid={'outmost_moeinner_container'}>
                        <Grid
                            style={{
                                width: this.state.openDrawer ? '40%' : 'auto',
                                transition: 'min-width 0.5s',
                                minWidth: this.state.openDrawer ? '550px' : '35px',
                                height: this.state.outmostInnerrHeight
                            }}
                        >
                            <SlideLayer
                                id={'prescriptionSlideLayer'}
                                slideLayerClasses={classes}
                                open={this.state.openDrawer}
                                toggleDrawer={this.toggleDrawer}
                                patient={this.props.patient}
                                confirmDrug={this.confirmDrug}
                                gridHeight={gridHeight + (setting.isEnquiry ? 0 : 85)}
                                // handleAddMyFavDrugToPriscription={this.handleAddMyFavDrugToPriscription}
                                handleMyFavRemarkOk={this.handleMyFavRemarkOk}
                                showMyFavRemarkDialog={this.state.showMyFavRemarkDialog}
                                myFavRemarkData={this.state.myFavRemarkData}
                                handleMyFavRemarkCancel={this.state.handleMyFavRemarkCancel}
                                handleCheckAllergen={this.handleCheckAllergen}
                                handleAddDrugToPriscription={this.handleAddDrugToPriscription}
                                outmostHeight={this.state.outmostHeight}
                            />
                        </Grid>
                        <Grid container style={{ padding: '10px 0 0 10px', height: this.state.outmostHeight + 'px' }}>
                            <Grid item container alignItems={'center'} style={setting.isEnquiry ? { display: 'none' } : null}>
                                <Grid style={{ width: '120px' }} > Drug Name/Set:</Grid>
                                <Grid style={{ paddingLeft: 10, width: 'calc(100% - 250px)' }}>
                                    <MoeSearch
                                        id={'prescriptionMoeSearch'}
                                        limitValue={4}
                                        inputMaxLength={256}
                                        displayField={this.state.searchParentField}
                                        subItem
                                        childArrayField={'children'}//Support only one
                                        childDisplayField={this.state.searchChildField}
                                        inputPlaceHolder={''}
                                        onChange={this.searchDrug}
                                        dataList={this.props.searchData}
                                        onSelectItem={this.getDrug}
                                        collapseClick={this.searchItemCollapse}
                                        separator={' — '}
                                        freeText={'(Free Text)'}
                                        hideCloseButton
                                    />
                                </Grid>
                                <Grid style={{ width: '120px' }}>
                                    <RadioGroup
                                        name={'dosageType'}
                                        id={'prescriptionDosageTypeRadioGroup'}
                                        // className={classes.group}
                                        value={this.state.dosageType ? this.state.dosageType : this.getDosageType(this.props.patient)}
                                        onChange={this.handleChange}
                                    >
                                        <FormControlLabel
                                            id={'prescriptionAdultLabelFormControlLabel'}
                                            value={'A'}
                                            control={<Radio
                                                id={'prescriptionAdultRadio'}
                                                color={'primary'}
                                                classes={{
                                                    root: classes.radioBtn,
                                                    checked: classes.radioBtnChecked
                                                }}
                                                     />}
                                            className={classes.radioLabel}
                                            style={{ margin: 0 }}
                                            label={'Adult'}
                                        />
                                        <FormControlLabel
                                            id={'prescriptionPaediatricLabelFormControlLabel'}
                                            value={'P'}
                                            control={<Radio
                                                id={'prescriptionPaediatricRadio'}
                                                color={'primary'}
                                                classes={{
                                                    root: classes.radioBtn,
                                                    checked: classes.radioBtnChecked
                                                }}
                                                     />}
                                            className={classes.radioLabel}
                                            label={'Paediatric'}
                                        />
                                    </RadioGroup>
                                </Grid>
                            </Grid>
                            <Grid item container>
                                <Grid item container direction={'row'}>
                                    <Grid item container justify={'flex-start'} xs={8}>
                                        <Grid item container justify={'flex-start'} alignItems={'center'}>
                                            <Typography component={'p'} variant={'h6'}>Prescription</Typography>
                                            {this.props.orderData && this.props.orderData.isCache === 'Y' &&
                                                <Typography component={'p'} variant={'h6'} style={{ color: 'red' }}>*
                                                    <span style={{ paddingLeft: 30 }}>(Cache By:{cacheBy},  Cache Date:{cacheDate})</span></Typography>
                                            }
                                            {setting.isLock ? <CIMSButton id={'prescriptionUnlockCIMSButton'} onClick={() => { this.showCache(this.props.orderData); }}>Show cache</CIMSButton> : null}
                                        </Grid>
                                    </Grid>
                                    {this.props.orderData && this.props.orderData.moeOrder && this.props.orderData.moeOrder.ordNo !== 0
                                        && <Grid id={'prescriptionRefNoGrid'} item container justify={'flex-end'} xs={4}>
                                            <Grid container justify={'flex-end'} style={{ color: '#0579c8', paddingRight: '8px' }}>
                                                <Grid className={classes.orderDateFont}>Order Date: </Grid>
                                                {/* <Grid className={classes.orderDateValue}>{moment(this.props.orderData.moeOrder.ordDate).format('DD-MMM-YYYY')}</Grid> */}
                                                <Grid className={classes.orderDateValue}>{moment(this.props.orderData.moeOrder.ordDate).format(Enum.DATE_FORMAT_EDMY_VALUE)}</Grid>
                                            </Grid>
                                            <Grid container justify={'flex-end'} style={{ paddingRight: '8px' }}>
                                                <Grid className={classes.orderDateFont}>Ref: </Grid>
                                                <Grid className={classes.orderDateValue}>{this.props.orderData.moeOrder.refNo}</Grid>
                                            </Grid>
                                            {/* <Typography>Order Date:{moment(this.props.orderData.moeOrder.ordDate).format('DD-MMM-YYYY')}</Typography>
                                            <Typography>Ref: {this.props.orderData.moeOrder.refNo}</Typography> */}
                                        </Grid>}
                                </Grid>
                                <Grid component={'div'}
                                    dptid={'outmost_moe_detail_container'}
                                    className={`${'nephele_content_body'} ${classes.minHeightContainer}`}
                                    style={{ padding: 0, width: '100%', height: `calc(${gridHeight}px)`, paddingBottom: 20, border: '3px dotted #fff' }}
                                    id={'prescriptionDrugListGrid'}
                                    // onDragEnter={this.handleDragEnter}
                                    onDragOver={setting.isEnquiry ? null : this.handleDragOver}
                                    onDragLeave={setting.isEnquiry ? null : this.handleDragLeave}
                                    onDrop={setting.isEnquiry ? null : this.handleDrop}
                                    onContextMenu={(e) => this.props.drugList && this.props.drugList.length > 0 && !setting.isEnquiry ? this.handleContextMenu(e, -1, null) : null}
                                >
                                    {this.props.drugList && this.props.drugList.map((item, index) => {
                                        if (item.convertData && item.convertData.itemStatus === MOE_DRUG_STATUS.NORMAL || item.apiData && item.apiData.itemStatus === MOE_DRUG_STATUS.NORMAL) {
                                            return <MoePrescriptionPanel
                                                isCims={this.props.isCims}
                                                patient={this.props.patient}
                                                drug={item}
                                                key={index}
                                                index={index}
                                                showDetail={false}
                                                onClick={setting.isEnquiry ? null : () => this.prescriptionPanelClick(item, index)}
                                                codeList={this.props.codeList}
                                                confirmDrug={this.confirmDrug}
                                                handleContextMenu={this.handleContextMenu}
                                                showDeleteReamrk={this.showDeleteReamrk}
                                                handleUpdateConfirmRemark={this.handleUpdateConfirmRemark}
                                                setting={setting}
                                                openEditHLAB1502Dialog={this.openEditHLAB1502Dialog}
                                                ordDate={this.props.orderData.moeOrder.ordDate || this.props.backDate || cacheDate || moment().valueOf()}
                                                   />;
                                        }
                                    }
                                    )
                                    }
                                    {/* <Typography
                                        component={'div'}
                                        style={{ minHeight: '50px', padding: 0 }}
                                        onContextMenu={(e) => this.props.drugList && this.props.drugList.length > 0 ? this.handleContextMenu(e, -1, null) : null}
                                        id={'prescriptionDrugListBlankDiv'}
                                    /> */}
                                </Grid>

                            </Grid>
                            <div style={{ width: '100%', overflowY: 'hidden' }}>
                                <Grid container direction={'row'}>
                                    <Grid item xs={4} container alignItems={'center'} id={'prescriptionTotalNumGrid'}>
                                        <div style={{ width: '100%', whiteSpace: 'nowrap' }}>Total Number:{this.props.drugList ? this.props.drugList.filter(item => item.convertData &&
                                            item.convertData.itemStatus === MOE_DRUG_STATUS.NORMAL || item.apiData && item.apiData.itemStatus === MOE_DRUG_STATUS.NORMAL).length : 0}</div>
                                        {lastUpdDate ? <div style={{ width: '100%', whiteSpace: 'nowrap' }}>Last update at:{lastUpdDate}</div> : null}
                                        {lastUpdBy ? <div style={{ width: '100%', whiteSpace: 'nowrap' }}>Last update by:{lastUpdBy}</div> : null}</Grid>
                                    <Grid item xs={8} container justify={'flex-end'} style={setting.isEnquiry ? { display: 'none' } : null}>
                                        <CIMSButton id={'prescriptionSaveCIMSButton'} style={{ display: this.props.orderData.isCache === 'Y' ? '' : 'none' }} onClick={this.saveClick} >{'Save'}</CIMSButton>
                                        <CIMSButton id={'prescriptionSaveAndPrintCIMSButton'} style={{ display: this.props.orderData.isCache === 'Y' ? '' : 'none' }} onClick={this.saveAndPrintClick} >{'Save & Print'}</CIMSButton>
                                        <CIMSButton id={'prescriptionCancelOrderCIMSButton'} style={{ display: this.props.orderData.isCache === 'Y' ? '' : 'none' }} onClick={this.cancelOrderClick} >{'Cancel'}</CIMSButton>
                                        <CIMSButton id={'prescriptionPrintCIMSButton'} onClick={this.previewClick} style={{ display: this.props.orderData.isCache !== 'Y' && this.props.drugList && this.props.drugList.length > 0 ? '' : 'none' }}>{isReprint ? 'Re-Print' : 'Print'}</CIMSButton>
                                        <CIMSButton id={'prescriptionDeleteOrderCIMSButton'}
                                            // onClick={() => { this.setState({ showDeleteOrderDialog: true }); }}
                                            onClick={this.deleteOrder}
                                            style={{ display: this.props.orderData && this.props.orderData.moeOrder && this.props.orderData.moeOrder.ordNo > 0 ? '' : 'none' }}
                                        >{'Delete Order'}</CIMSButton>
                                        {/* <CIMSButton id={'prescriptionCloseCIMSButton'}>Close</CIMSButton> */}
                                    </Grid>
                                </Grid>
                            </div>


                        </Grid>
                    </Grid>
                </Grid>
                <CIMSDialog
                    open={this.props.showDetail}
                    fullWidth
                    classes={{
                        paper: classes.fullWidth
                    }}
                    formControlStyle={{
                        paddingTop: 0
                    }}
                    id={'prescriptionDetailCIMSDialog'}
                >
                    <MoePrescriptionPanel
                        isCims={this.props.isCims}
                        patient={this.props.patient}
                        index={this.state.selectDrugIndex ? this.state.selectDrugIndex - 1 : 0}
                        drug={this.props.selectedPrescriptionItem}
                        showDetail
                        // onClick={() => this.prescriptionPanelClick(item, index)}
                        cancelClick={this.closePrescriptionPanel}
                        confirmDrug={this.confirmDrug}
                        codeList={this.props.codeList}
                        // deleteDrug={this.props.deleteDrug}
                        validatorListener={this.panelValidatorListener}
                        errorMessageList={this.state.errorMessageList}
                        updateState={this.updateState}
                        getSpecialIntervalText={this.props.getSpecialIntervalText}
                        //orderRemark={this.props.orderData && this.props.orderData.moeOrder && this.props.orderData.moeOrder.remarkText}
                        handleUpdateConfirmRemark={this.handleUpdateConfirmRemark}
                        setting={setting}
                        ordDate={(this.props.orderData && this.props.orderData.moeOrder && this.props.orderData.moeOrder.ordDate) || this.props.backDate || cacheDate || moment().valueOf()}
                        isFromTabs={this.state.addDrugRoute === ADD_DRUG_ROUTE.TAB}
                        tabsCallback={this.confirmDrugForTabs}
                    />
                </CIMSDialog>
                <CIMSDialog
                    open={this.state.showMDSEnq}
                    fullWidth
                    classes={{
                        paper: classes.fullWidth
                    }}
                    formControlStyle={{
                        paddingTop: 0
                    }}
                    id={'prescription_MDSEnqCIMSDialog'}
                >
                    <MdsEnqPanel
                        id={'prescription_MDSEnqPanel'}
                        hideMDSEnqPanel={this.hideMDSEnqPanel}
                    />
                </CIMSDialog>
                {/* <CIMSAlertDialog
                    id="deleteOrderDialog"
                    open={this.state.showDeleteOrderDialog}
                    // onClickOK={() => { this.setState({ showDeleteOrderReamrkDialog: true, showDeleteOrderDialog: false }); }}
                    showDeleteReamrk
                    onClickOK={this.showDeleteReamrk}
                    onClickCancel={() => { this.setState({ showDeleteOrderDialog: false }); }}
                    dialogTitle={'Question'}
                    dialogContentText={
                        <Typography component={'div'} variant={'subtitle2'} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'pre-wrap' }}>
                            <img src={questionIcon} alt="" />    Confirm delete this order?
                        </Typography>}
                    okButtonName={'Yes'}
                    cancelButtonName={'No'}
                    btnCancel
                /> */}
                {this.state.showDeleteOrderReamrkDialog &&
                    <RemarkDialog
                        id={'deleteOrderRemarkDialog'}
                        dialogTitle="Remark for deleting order"
                        open={this.state.showDeleteOrderReamrkDialog}
                        cancelClick={() => { this.setState({ showDeleteOrderReamrkDialog: false, remarkValue: '' }); this.props.closeCommonCircular(); }}
                        okClick={this.handleDeleteOrder}
                        remarkValue={this.state.remarkValue}
                        handleUpdateRemark={this.updateState}
                        multiple={this.state.remarkMutiple}
                        multipleData={this.state.remarkMutipleData}
                    />}
                {this.state.remarkDialogTitle &&
                    <RemarkDialog
                        id={'prescriptionRemarkDialog'}
                        dialogTitle={this.state.remarkDialogTitle}
                        open={this.state.showRemarkDialog}
                        //open={false}
                        cancelClick={() => { this.setState({ showRemarkDialog: false, remarkValue: '' }); this.props.closeCommonCircular(); }}
                        okClick={this.handleRemarkDialogOk}
                        remarkValue={this.state.remarkValue}
                        handleUpdateRemark={this.updateState}
                    />}
                <DuplicateDrugDialog
                    id={'prescriptionDuplicateDrugDialog'}
                    open={this.props.openDuplicateDialog}
                    duplicateList={this.props.duplicateDrugList}
                    selectedDeletedList={this.props.selectedDeletedList}
                    closeDuplicateDialog={this.closeDuplicateDialog}
                    confirmDeleteDuplicateDrug={this.confirmDeleteDuplicateDrug}
                    handleChangeCb={this.handleChangeDeletedCb}
                />
                {/* HLA-B*1502 checking */}
                {this.state.openHLAB1502Dialog &&
                    <Hlab1502Dialog
                        id={'prescription'}
                        open={this.state.openHLAB1502Dialog}
                        beCheckedItem={this.state.beCheckedItem}
                        cancelHLAB1502Dialog={this.cancelHLAB1502Dialog}
                        okHLAB1502Dialog={this.okHLAB1502Dialog}
                        isPositive={this.state.isPositive}
                        drugIndex={this.state.drugIndex}
                        savedReasonDesc={this.state.savedReasonDesc}
                        isEdit={this.state.isEditHLAB}
                    />
                }

                {this.state.showDeleteNegativeRemark &&
                    <DeleteHLABNegative
                        id={'prescription'}
                        open={this.state.showDeleteNegativeRemark}
                        okDeleteHLABRemark={this.okDeleteHLABRemark}
                        cancelDeleteHLABRemark={this.cancelDeleteHLABRemark}
                    />
                }

                <PdfPreviewDialog
                    open
                    id={'prescriptionPdfPreviewDialog'}
                    previewShow={this.state.previewShow}
                    previewData={this.props.previewData}
                    closePreviewDialog={this.closePreviewDialog}
                    //print={this.props.print}
                    print={this.print}
                    refreshPrintFlag={this.refreshPrintFlag}
                />
                {this.props.showDugSetDialog &&
                    <MyFavouriteDrugSetDialog
                        id={'prescriptionMyFavouriteDrugSetDialog'}
                        openMyFavouriteDrugSetDialog={this.openMyFavouriteDrugSetDialog}
                        contextMenuSelectedItem={this.state.contextMenuSelectedItem}
                        drugList={this.props.drugList}
                        patient={this.props.patient}
                    />}
                {/* context menu start */}
                <Paper
                    id={'prescriptionContextMenuPaper'}
                    style={{
                        outline: 'none',
                        position: 'fixed',
                        display: this.state.anchorEl ? 'block' : 'none',
                        backgroundColor: '#fff',
                        padding: 0,
                        margin: 0
                    }}
                >
                    <MenuList
                        style={{ padding: 0 }}
                        id={'prescriptionContextmenuMenuList'}
                    >
                        <MenuItem
                            id={'prescriptionAddToMyFavouriteMenuItem'}
                            style={{
                                display: this.state.contextMenuSelectedItem && this.state.contextMenuSelectedItem.freeText !== 'F'
                                    && this.state.anchorElIndex && this.state.anchorElIndex > 0 ? 'block' : 'none'
                            }}
                            onClick={this.addToMyFavourite}
                            className={classes.contextMenuItem}
                        >
                            Add to My Favourite
                        </MenuItem>
                        <MenuItem
                            id={'prescriptionAddToMyFavouriteDrugSetMenuItem'}
                            className={classes.contextMenuItem}
                            style={{
                                display: !this.state.contextMenuSelectedItem ||
                                    (this.state.contextMenuSelectedItem && this.state.contextMenuSelectedItem.freeText) !== 'F' ? 'block' : 'none'
                            }}
                            onClick={() => this.openMyFavouriteDrugSetDialog(true)}
                        >Add to My Favourite DrugSet</MenuItem>
                        <MenuItem
                            id={'prescriptionEditDurationMenuItem'}
                            className={classes.contextMenuItem}
                            // style={{ display: prescriptionUtilities.showEditAllDurationMenu(this.state.contextMenuSelectedItem) ? 'block' : 'none' }}
                            onClick={() => { this.setState({ openDurationDialog: true }); }}

                        >Edit Duration for All Medications</MenuItem>
                        <MenuItem
                            id={'prescriptionEditRemarkMenuItem'}
                            className={classes.contextMenuItem}
                            onClick={this.handleEditRemark}
                            style={{ display: (setting.isEdit || setting.isBackdate) && this.state.anchorElIndex && this.state.anchorElIndex > 0 ? 'block' : 'none' }}
                        >Edit Remark</MenuItem>
                    </MenuList>
                </Paper>
                {/* context menu end */}

                {this.state.openDurationDialog &&
                    <DurationDialog
                        open={this.state.openDurationDialog}
                        drug={this.state.contextMenuSelectedItem}
                        closeDurationDialog={() => { this.setState({ openDurationDialog: false }); }}
                        // minQuantityCheckAll={this.minQuantityCheckAll}
                        maxDurationChecking={this.maxDurationChecking}
                        id={'prescriptionDurationDialog'}
                    />}
                {this.state.showMultipleRemarkDialog &&
                    <MultipleRemarkDialog
                        id={'prescriptionMultipleRemarkDialog'}
                        open={this.state.showMultipleRemarkDialog}
                        cancelClick={() => {
                            this.props.closeCommonCircular();
                            this.setState({ showMultipleRemarkDialog: false, multipleRemarkData: null });
                            this.props.updateField({
                                isSaveSuccess: false,
                                saveMessageList: []
                            });
                        }}
                        okClick={this.handMultipleRemarkOk}
                        data={this.state.multipleRemarkData}
                    />
                }
                <AllergyDialog
                    id="AllergyDialog"
                    open={this.state.showAllergyDialog}
                    newDrugList={this.state.newAddedDrugList}
                    allergyDrugList={this.props.allergyChecking}
                    closeAllergyRemark={this.handleNotPrescribeDAC}
                    handleOKAllergyRemark={this.handleOKAllergyRemark}
                    drugIndex={this.state.drugIndex}
                />
                {this.state.showMaxDurationDialog &&
                    <MaxDurationDialog
                        id="maxDurationDialog"
                        open={this.state.showMaxDurationDialog}
                        data={this.state.maxDurationData || {}}
                        isFromTabs={this.state.addDrugRoute === ADD_DRUG_ROUTE.TAB}
                    />
                }
                {this.state.showMinQuantityDialog &&
                    <MinQuantityDialog
                        id="minQuantityDialog"
                        open={this.state.showMinQuantityDialog}
                        data={this.state.minQuantityData || {}}
                        isFromTabs={this.state.addDrugRoute === ADD_DRUG_ROUTE.TAB}
                        tabsCallback={this.editDrugDetailforTabs}
                        onRef={this.onIncompleteCheckingRef}
                    />
                }
                {this.state.openMandatoryDialog &&
                    <MandatoryFieldsDialog
                        id="mandatoryFieldsDialog"
                        open={this.state.openMandatoryDialog}
                        data={this.state.mandatoryFieldsData || {}}
                        isFromTabs={this.state.addDrugRoute === ADD_DRUG_ROUTE.TAB}
                        tabsCallback={this.editDrugDetailforTabs}
                        onRef={this.onIncompleteCheckingRef}
                    />}
            </Typography >
        );
    }
}
const mapStateToProps = (state) => {
    let orderData = {};
    if (state.moe.orderData)
        orderData = state.moe.orderData;
    return {
        existDrugList: state.moe.existDrugList,
        searchData: state.moe.searchData,
        drugList: state.moe.drugList,
        orderData: orderData,
        selectedPrescriptionItem: state.moe.selectedPrescriptionItem,
        showDetail: state.moe.showDetail,
        backDate: state.moe.backDate,
        duplicateDrugList: state.moe.duplicateDrugList,
        openDuplicateDialog: state.moe.openDuplicateDialog,
        selectedDeletedList: state.moe.selectedDeletedList,
        previewData: state.moePrint.previewData,
        patientAllergyList: state.moe.patientAllergyList,
        patientAlertList: state.moe.patientAlertList,
        //my favourite
        showDugSetDialog: state.moeMyFavourite.showDugSetDialog,
        myFavouriteListFromBackend: state.moeMyFavourite.myFavouriteListFromBackend,
        maxDosage: state.moe.maxDosage,
        allergyChecking: state.moe.allergyChecking,
        loginInfo: state.moe.loginInfo,
        disDuplicateDrugList: state.moe.disDuplicateDrugList,
        //HLAB1502
        hlab1502VtmList: state.moe.hlab1502VtmList,
        patientAllergyConnectedFlag: state.moe.patientAllergyConnectedFlag
    };
};
const mapDispatchToProps = {
    searchDrug,
    searchItemCollapse,
    // getDrug,
    getCodeList,
    // deleteDrug,
    resetDrugList,
    updateField,
    saveDrug,
    cancelOrder,
    deleteOrder,
    confirmDuplicateDrug,
    getOrderDrugList,
    getPdf,
    print,
    addToMyFavourite,
    myFavouriteUpdateField,
    getSpecialIntervalText,
    openCommonCircular,
    closeCommonCircular,
    updateDrugHistoryField,
    convertDrug,
    getTotalDangerDrug,
    updateMyFavSearchInputVal,
    getAllergyChecking,
    //HLA-B 1502
    getHlab1502VTM,
    updateHistoryField,
    saveHlab1502Negative,
    deleteHlabNegative,
    openErrorMessage,
    openCommonMessage
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MoePresciption));
