import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import {
    withStyles,
    Card,
    CardContent,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Grid,
    Tooltip,
    MuiThemeProvider
} from '@material-ui/core';
import { styles } from './MARMStyle';
import {
    Menu,
    ChevronLeft,
    RemoveRedEye,
    Info,
    Today,
    DeviceHub,
    Assessment,
    ReportProblem,
    Alarm,
    AirlineSeatLegroomExtra
} from '@material-ui/icons';
import Eyes from './modules/Eyes/Eyes';
import Feet from './modules/Feet/Feet';
import MeasurementAndLabTest from './modules/measurementAndLabTest/measurementAndLabTest';
import OtherComplications from './modules/otherComplications/otherComplications';
import BackgroundInformation from './modules/BackgroundInformation/backgroundInformation';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import RiskProfile from './modules/RiskProfile/RiskProfile';
import CarePlan from './modules/CarePlan/CarePlan';
import DietAssessment from './modules/dietAssessment/dietAssessment';
import { saveDraftBackgroundInfo } from '../../../store/actions/MRAM/backgroundInformation/backgroundInformationAction';
import {
    getMramFieldValueList,
    initMramFieldValueList,
    saveMramFieldValueList,
    previewReportPatient,
    previewReportDoctor,
    checkDuplicatedMramRecordOnSameDay,
    checkMramRecordCreatedWithin6Months,
    checkMramRecordExisted
} from '../../../store/actions/MRAM/mramAction';
import _, { cloneDeep, isEqual, isNull, debounce } from 'lodash';
import MRAMHistoryDialog from './mramHistory/MRAMHistoryDialog';
import MRAMPrintDialog from './mramPrint/MRAMPrintDialog';
import {
    openCommonCircularDialog,
    closeCommonCircularDialog,
    josPrint
} from '../../../store/actions/common/commonAction';
import { mramAssessmentStatus } from '../../../constants/MRAM/mramConstant';
import {
    MRAM_OTHERCOMPLICATIONS_PREFIX,
    MRAM_OTHERCOMPLICATIONS_ID
} from '../../../constants/MRAM/otherComplications/otherComplicationsConstant';
import {
    MRAM_RISKPROFILE_RSPF_PREFIX,
    MRAM_RISKPROFILE_RSPF_EXAMINATION_ID
} from '../../../constants/MRAM/riskProfile/riskProfileConstants';
import { derivePara } from '../../../constants/MRAM/riskProfile/derivePara';
import moment from 'moment';
import { openCommonMessage, closeCommonMessage } from '../../../store/actions/message/messageAction';
import { MRAM_HISTORY_CODE } from '../../../constants/message/MRAMCode/mramHistoryCode';
import { MRAM_CODE } from '../../../constants/message/MRAMCode/mramCode';
import { deleteHistoryService } from '../../../store/actions/MRAM/mramHistory/mramHistoryAction';
import PreviewPdfDialog from './components/PrintDialog/PreviewPdfDialog';
import {
    MRAM_EYES_PREFIX,
    MRAM_EYES_ID,
    DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY,
    MRAM_EYES_OTHER_INFORMATION_ID,
    MRAM_EYES_OTHER_INFORMATION_PREFIX
} from '../../../constants/MRAM/eyes/eyesConstant';
import {
    MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX,
    MRAM_FEET_FOOT_PATHOLOGY_PREFIX,
    MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX,
    MRAM_FEET_NEUROLOGY_EXAMINATION_ID,
    MRAM_FEET_FOOT_PATHOLOGY_ID,
    MRAM_FEET_VASCULAR_ASSESSMENT_ID,
    DL_MONOFILAMENT_TEST,
    DL_ACHILLES_REFLEXES
} from '../../../constants/MRAM/feet/feetConstant';
import {
    MRAM_BACKGROUNDINFOMATION_DM_PREFIX,
    MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX,
    MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX,
    MRAM_BACKGROUNDINFOMATION_DM_ID,
    MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID,
    MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID,
    SMOKING
} from '../../../constants/MRAM/backgroundInformation/backgroundInformationConstant';
import {
    MRAM_LABTEST_ID,
    MRAM_LABTEST_PREFIX,
    MRAM_MEASUREMENTS_PREFIX,
    MRAM_MEASUREMENTS_ID
} from '../../../constants/MRAM/measurementAndLabTest/measurementAndLabTestConstant';
import { deleteSubTabs,updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../../enums/accessRightEnum';
import * as generalUtil from './utils/generalUtil';
import DatePicker from './components/DateTextField/DatePicker';
import Enum from '../../../enums/enum';
import { MAX_DATE, MIN_DATE } from '../../../constants/common/commonConstants';
import Container from 'components/JContainer';
import * as commonUtils from '../../../utilities/josCommonUtilties';
import * as commonUtilities from '../../../utilities/commonUtilities';
import {COMMON_CODE} from 'constants/message/common/commonCode';
import theme from '../../../components/JContainer/theme';
import EventEmitter from '../../../utilities/josCommonUtilties';
import {requestHistoryService} from '../../../store/actions/MRAM/mramHistory/mramHistoryAction';
import * as commonConstants from '../../../constants/common/commonConstants';
import doCloseFuncSrc from '../../../constants/doCloseFuncSrc';

class MRAM extends Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
        this.contentWrapper = React.createRef();
        this.timeWrapper = React.createRef();
        this.mramHistoryRef = React.createRef();
        this.state = {
            contentWrapperHight: 0,
            contentHeight: 700,
            moduleNameList: [
                'Background Information/ Tx',
                'Measurement/Lab Test',
                'Eyes',
                'Feet',
                'Other Complication(s)',
                'Diet Assessment',
                'Risk Profile',
                'Care Plan'
            ],
            open: true,
            recordType: '',
            selectedModule: 'Background Information/ Tx', //default,
            // saveChecke: false,
            saveCarePlanChekck: false,
            feetFieldValMap: new Map(),
            eyesFieldValMap: new Map(),
            measurementAndLabTestFieldValMap: new Map(),
            otherComplicationsFieldValMap: new Map(),
            backgroundInformationFieldValMap: new Map(),
            dietAssessmentFieldValMap: new Map(),
            riskProfileFieldValMap: new Map(),
            carePlanFieldValMap: new Map(),
            openHistory: true,
            openPrint: false,
            view: false,
            originDateTime: null, // Metabolic Risk Assessment Date
            dateTime: new Date(),
            dateTimeFlag: false,
            selectRow: null,
            deleteList: [],
            deleteId: '',
            previewShow: false,
            updateRisk: false,
            editFlag: false,
            previewData: 'test',
            patientPanelInfo: {},
            refreshFlag: true,
            previewTitle: '',
            dervieType: null,
            recordMramAssessmentStatus: mramAssessmentStatus.inProgress, //default:1
            isNewFlag: false,
            recordList: [],
            displayAlbuminuriaDL: false
        };
    }

    componentWillMount() {
        this.resetHeight();
        window.addEventListener('resize', this.resetHeight);
    }

    componentDidMount() {
        this.props.ensureDidMount();
        this.props.initMramFieldValueList({});
        let { encounterData, patientPanelInfo } = this.props;
        this.props.updateCurTab(accessRightEnum.mramAssessmentInput, this.doClose);
        this.insertMramLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} MRAM`, '/mram/loadMramData');
        this.setState({
            selectedEncounterVal: encounterData.encounterId,
            selectedPatientKey: encounterData.patientKey,
            recordType: 'ALL',
            selectedGenderCd: patientPanelInfo.genderCd,
            patientPanelInfo: patientPanelInfo
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        let {
            refreshFlag,
            eyesFieldValMap,
            feetFieldValMap,
            measurementAndLabTestFieldValMap,
            backgroundInformationFieldValMap,
            dietAssessmentFieldValMap,
            riskProfileFieldValMap,
            otherComplicationsFieldValMap,
            carePlanFieldValMap
        } = this.state;
        if (refreshFlag) {
            if (!isEqual(eyesFieldValMap, nextProps.eyesFieldValMap)) {
                this.setState({ eyesFieldValMap: cloneDeep(nextProps.eyesFieldValMap) });
            }

            if (!isEqual(feetFieldValMap, nextProps.feetFieldValMap)) {
                this.setState({ feetFieldValMap: cloneDeep(nextProps.feetFieldValMap) });
            }

            if (!isEqual(otherComplicationsFieldValMap, nextProps.otherComplicationsFieldValMap)) {
                this.setState({
                    otherComplicationsFieldValMap: cloneDeep(nextProps.otherComplicationsFieldValMap)
                });
            }

            if (!isEqual(backgroundInformationFieldValMap, nextProps.backgroundInformationFieldValMap)) {
                this.setState({
                    backgroundInformationFieldValMap: cloneDeep(nextProps.backgroundInformationFieldValMap)
                });
            }

            if (!isEqual(dietAssessmentFieldValMap, nextProps.dietAssessmentFieldValMap)) {
                this.setState({
                    dietAssessmentFieldValMap: cloneDeep(nextProps.dietAssessmentFieldValMap)
                });
            }

            if (!isEqual(riskProfileFieldValMap, nextProps.riskProfileFieldValMap)) {
                let tempValMap = cloneDeep(nextProps.riskProfileFieldValMap);
                this.setState({
                    riskProfileFieldValMap: tempValMap
                });
            }

            if (!isEqual(carePlanFieldValMap, nextProps.carePlanFieldValMap)) {
                this.setState({
                    carePlanFieldValMap: cloneDeep(nextProps.carePlanFieldValMap)
                });
            }

            if (!isEqual(measurementAndLabTestFieldValMap, nextProps.measurementAndLabTestFieldValMap)) {
                this.setState({
                    measurementAndLabTestFieldValMap: cloneDeep(nextProps.measurementAndLabTestFieldValMap)
                }, () => {
                    this.handlederiveAlbumin(this.state.selectedGenderCd);
                });
            } else {
                this.handlederiveAlbumin(this.state.selectedGenderCd, nextProps.measurementAndLabTestFieldValMap, nextProps.riskProfileFieldValMap);
            }
            this.setState({ refreshFlag: false });
        }
    }

    componentDidUpdate() {
        this.resetHeight();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resetHeight);
    }

    resetHeight = debounce(() => {
        if (this.container.current && this.contentWrapper.current && this.contentWrapper.current.clientHeight && this.timeWrapper.current) {
            let height1 = this.container.current.clientHeight - 64 - 74;
            let height = height1 - this.timeWrapper.current.clientHeight;
            if (this.state.contentHeight !== height) {
                this.setState({
                    contentHeight: height
                });
            }
            if (this.state.contentWrapperHight !== height1) {
                this.setState({
                    contentWrapperHight: height1
                });
            }
        }
    }, 750);

    handleInitMeasurementAlbuminuria = (riskProfileFieldValMap) => {
        let tempVal = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.ALBUMINURIA}`).value;
        EventEmitter.emit('mram_measurement_lab_test_albuminuria_reload', {
            displayAlbuminuriaDL: true,
            albuminuriaVal: tempVal
        });
    }

    doClose = (callback, doCloseParams) => {
        let editFlag = this.state.editFlag;
        switch (doCloseParams.src) {
            case doCloseFuncSrc.CLOSE_BY_LOGOUT:
            case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
                if (editFlag) {
                    this.props.openCommonMessage({
                        msgCode: COMMON_CODE.SAVE_WARING,
                        btn1AutoClose: false,
                        params: [{ name: 'title', value: 'MRAM' }],
                        btnActions: {
                            btn1Click: () => {
                                this.handleCancleSave(callback, true);
                                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'MRAM');
                                this.insertMramLog(name, '/mram/saveAll');
                            }, btn2Click: () => {
                                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'MRAM');
                                this.insertMramLog(name, '');
                                callback(true);
                            }, btn3Click: () => {
                                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'MRAM');
                                this.insertMramLog(name, '');
                            }
                        }
                    });
                } else {
                    this.insertMramLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close MRAM`, '');
                    callback(true);
                }
                break;
            case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
                editFlag ? this.handleCancleSave(callback, true) : callback(true);
                break;
        }
    }

    updateState = obj => {
        this.setState({
            refreshFlag: false,
            editFlag: true,
            ...obj
        });
        this.handleRiskProfileValueChange();
    };

    updateStateWithoutRiskProfile = obj => {
        this.setState({
            updateRisk: !this.state.updateRisk,
            refreshFlag: false,
            editFlag: true,
            ...obj
        });
    };

    updateStateInDialog = obj => {
        this.setState({
            ...obj
        });
    };

    handleRiskProfileValueChange = () => {
        let { patientPanelInfo } = this.props;
        let {
            eyesFieldValMap,
            feetFieldValMap,
            measurementAndLabTestFieldValMap,
            backgroundInformationFieldValMap,
            otherComplicationsFieldValMap,
            riskProfileFieldValMap,
            selectedGenderCd,
            dervieType
        } = this.state;
        // Coronary Heart Disease ok
        if (otherComplicationsFieldValMap.has(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.CORONARY_HEART_DISEASE}`) &&
            otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.CORONARY_HEART_DISEASE}`).value.trim() != ''
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CORONARY_HEART_DISEASE}`);
            fieldValObj.value = otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.CORONARY_HEART_DISEASE}`).value;
            generalUtil.handleOperationType(fieldValObj);
        } else {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CORONARY_HEART_DISEASE}`);
            fieldValObj.value = derivePara.NOT_KNOWN;
            generalUtil.handleOperationType(fieldValObj);
        }

        // Stroke ok
        if (otherComplicationsFieldValMap.has(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE}`) &&
            otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE}`).value.trim() != ''
        ) {
            let fieldValStrokeObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.STROKE}`);
            fieldValStrokeObj.value = otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE}`).value;
            generalUtil.handleOperationType(fieldValStrokeObj);
        } else {
            let fieldValStrokeObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.STROKE}`);
            fieldValStrokeObj.value = derivePara.NOT_KNOWN;
            generalUtil.handleOperationType(fieldValStrokeObj);
        }

        // Peripheral Arterial Disease
        let inputRevascularizationR = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_REVASCULARIZATION}`)
            ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_REVASCULARIZATION}`).value : '';

        let inputRevascularizationL = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_REVASCULARIZATION}`)
            ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_REVASCULARIZATION}`).value : '';

        let inputAbiR = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_ABI}`)
            ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_ABI}`).value : '';

        let inputAbiL = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_ABI}`)
            ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_ABI}`).value : '';

        // let inputDorsalisDedisR = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_DORSALIS_PEDIS_FOOT_PULSE}`)
        //     ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_DORSALIS_PEDIS_FOOT_PULSE}`).value : '';

        // let inputDorsalisDedisL = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_DORSALIS_PEDIS_FOOT_PULSE}`)
        //     ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_DORSALIS_PEDIS_FOOT_PULSE}`).value : '';

        // let inputPosteriorTibiaR = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_POSTERIOR_TIBIA_FOOT_PULSE}`)
        //     ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_POSTERIOR_TIBIA_FOOT_PULSE}`).value : '';

        // let inputPosteriorTibiaL = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_POSTERIOR_TIBIA_FOOT_PULSE}`)
        //     ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_POSTERIOR_TIBIA_FOOT_PULSE}`).value : '';

        let inputAbnormalFootR = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_ABNORMAL_FOOT_PULSE}`)
            ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_ABNORMAL_FOOT_PULSE}`).value : '';

        let inputAbnormalFootL = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_ABNORMAL_FOOT_PULSE}`)
            ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_ABNORMAL_FOOT_PULSE}`).value : '';

        let inputClaudicationR = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_CALUDICATION}`)
            ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_CALUDICATION}`).value : '';

        let inputClaudicationL = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_CALUDICATION}`)
            ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_CALUDICATION}`).value : '';

        let inputRestPainR = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_REST_PAIN}`)
            ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.RIGHT_FOOT_REST_PAIN}`).value : '';

        let inputRestPainL = feetFieldValMap.has(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_REST_PAIN}`)
            ? feetFieldValMap.get(`${MRAM_FEET_VASCULAR_ASSESSMENT_PREFIX}_${MRAM_FEET_VASCULAR_ASSESSMENT_ID.LEFT_FOOT_REST_PAIN}`).value : '';

        let macrovascularPeripheralArterialDisease = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.MACROVASCULAR_PERIPHERAL_ARTERIAL_DISEASE}`);

        let footRiskPeripheralArterialDisease = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.FOOT_RISK_SUMMARY_PERIPHERAL_ARTERIAL_DISEASE}`);

        if (isEqual(derivePara.YES, inputRevascularizationR) || isEqual(derivePara.YES, inputRevascularizationL)
            || (this.blankValidation(inputAbiR) && inputAbiR * 1 <= derivePara.PAD_ABI_VAL)
            || (this.blankValidation(inputAbiL) && inputAbiL * 1 <= derivePara.PAD_ABI_VAL)
            // || isEqual(derivePara.YES, inputDorsalisDedisR) || isEqual(derivePara.YES, inputDorsalisDedisL)
            // || isEqual(derivePara.YES, inputPosteriorTibiaR) || isEqual(derivePara.YES, inputPosteriorTibiaL)
            || isEqual(derivePara.YES, inputAbnormalFootR) || isEqual(derivePara.YES, inputAbnormalFootL)
        ) {
            macrovascularPeripheralArterialDisease.value = derivePara.YES;
            footRiskPeripheralArterialDisease.value = derivePara.YES;
            generalUtil.handleOperationType(footRiskPeripheralArterialDisease);
            generalUtil.handleOperationType(macrovascularPeripheralArterialDisease);
        } else if (
            isEqual(derivePara.NO, inputRevascularizationR) && isEqual(derivePara.NO, inputRevascularizationL)
            && ((
                this.blankValidation(inputAbiR) && inputAbiR * 1 > derivePara.PAD_ABI_VAL
                && this.blankValidation(inputAbiL) && inputAbiL * 1 > derivePara.PAD_ABI_VAL
            ) || (
                    // isEqual(derivePara.NO, inputDorsalisDedisR) && isEqual(derivePara.NO, inputDorsalisDedisL) &&
                    // isEqual(derivePara.NO, inputPosteriorTibiaR) && isEqual(derivePara.NO, inputPosteriorTibiaL) &&
                    isEqual(derivePara.NO, inputAbnormalFootR) && isEqual(derivePara.NO, inputAbnormalFootL)
                )) &&
            !isEqual(derivePara.YES, inputClaudicationR) && !isEqual(derivePara.YES, inputClaudicationL) &&
            !isEqual(derivePara.YES, inputRestPainR) && !isEqual(derivePara.YES, inputRestPainL)
        ) {
            macrovascularPeripheralArterialDisease.value = derivePara.NO;
            footRiskPeripheralArterialDisease.value = derivePara.NO;
            generalUtil.handleOperationType(footRiskPeripheralArterialDisease);
            generalUtil.handleOperationType(macrovascularPeripheralArterialDisease);
        } else if (
            !isEqual(derivePara.YES, inputRevascularizationR) && !isEqual(derivePara.YES, inputRevascularizationL) &&
            (this.blankValidation(inputAbiR) && inputAbiR * 1 > derivePara.PAD_ABI_VAL || (inputAbiR === null || inputAbiR === '')) &&
            (this.blankValidation(inputAbiL) && inputAbiL * 1 > derivePara.PAD_ABI_VAL || (inputAbiL === null || inputAbiL === '')) &&
            // !isEqual(derivePara.YES, inputDorsalisDedisR) && !isEqual(derivePara.YES, inputDorsalisDedisL) &&
            // !isEqual(derivePara.YES, inputPosteriorTibiaR) && !isEqual(derivePara.YES, inputPosteriorTibiaL) &&
            !isEqual(derivePara.YES, inputAbnormalFootR) && !isEqual(derivePara.YES, inputAbnormalFootL) &&
            (isEqual(derivePara.YES, inputClaudicationR) || isEqual(derivePara.YES, inputClaudicationL) ||
            isEqual(derivePara.YES, inputRestPainR) || isEqual(derivePara.YES, inputRestPainL))
        ) {
            macrovascularPeripheralArterialDisease.value = derivePara.PAD_SUSPECTED;
            footRiskPeripheralArterialDisease.value = derivePara.PAD_SUSPECTED;
            generalUtil.handleOperationType(footRiskPeripheralArterialDisease);
            generalUtil.handleOperationType(macrovascularPeripheralArterialDisease);
        }
        else {
            macrovascularPeripheralArterialDisease.value = derivePara.NOT_KNOWN;
            footRiskPeripheralArterialDisease.value = derivePara.NOT_KNOWN;
            generalUtil.handleOperationType(footRiskPeripheralArterialDisease);
            generalUtil.handleOperationType(macrovascularPeripheralArterialDisease);
        }

        // Hypertensive Retinopathy  ok  deriveHtRetino
        let htDiabRetinoR = eyesFieldValMap.has(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY}`)
            ? eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY}`).value : '';

        let htDiabRetinoL = eyesFieldValMap.has(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY}`)
            ? eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY}`).value : '';
        if (
            htDiabRetinoR === DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY[2].value ||
            htDiabRetinoR === DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY[3].value ||
            htDiabRetinoR === DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY[4].value ||
            htDiabRetinoL === DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY[2].value ||
            htDiabRetinoL === DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY[3].value ||
            htDiabRetinoL === DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY[4].value
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HYPERTENSENSIVE_RETINOPATHY}`);
            fieldValObj.value = derivePara.YES;
            generalUtil.handleOperationType(fieldValObj);
        } else if (
            htDiabRetinoR === DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY[1].value &&
            htDiabRetinoL === DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY[1].value
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HYPERTENSENSIVE_RETINOPATHY}`);
            fieldValObj.value = derivePara.NO;
            generalUtil.handleOperationType(fieldValObj);
        } else {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HYPERTENSENSIVE_RETINOPATHY}`);
            fieldValObj.value = derivePara.NOT_KNOWN;
            generalUtil.handleOperationType(fieldValObj);
        }

        // Diabetic Retinopathy OK
        let retinalSummary = eyesFieldValMap.has(`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.DIABETIC_RETINOPATHY_SUMMARY}`)
            ? eyesFieldValMap.get(`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.DIABETIC_RETINOPATHY_SUMMARY}`).value : derivePara.NOT_KNOWN;
        if (retinalSummary.trim() !== '') {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DIABETIC_RETINOPATHY}`);
            fieldValObj.value = retinalSummary;
            generalUtil.handleOperationType(fieldValObj);
        } else {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DIABETIC_RETINOPATHY}`);
            fieldValObj.value = derivePara.NOT_KNOWN;
            generalUtil.handleOperationType(fieldValObj);
        }

        //Chronic Kidney Disease OK new ok
        let inputEgfr = measurementAndLabTestFieldValMap.has(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.ESTIMATED_GFR}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.ESTIMATED_GFR}`).value : derivePara.NOT_KNOWN;
        if (inputEgfr.trim() != '' && inputEgfr != null) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CHRONIC_KIDNEY_DISEASE}`);
            if (inputEgfr * 1 >= derivePara.CKD_G1_LVAL) {
                fieldValObj.value = derivePara.CKD_G1;
            } else if (
                inputEgfr * 1 >= derivePara.CKD_G2_LVAL &&
                inputEgfr * 1 < derivePara.CKD_G1_LVAL
            ) {
                fieldValObj.value = derivePara.CKD_G2;
            } else if (
                inputEgfr * 1 >= derivePara.CKD_G3a_LVAL &&
                inputEgfr * 1 < derivePara.CKD_G2_LVAL
            ) {
                fieldValObj.value = derivePara.CKD_G3a;
            } else if (
                inputEgfr * 1 >= derivePara.CKD_G3b_LVAL &&
                inputEgfr * 1 < derivePara.CKD_G3a_LVAL
            ) {
                fieldValObj.value = derivePara.CKD_G3b;
            } else if (
                inputEgfr * 1 >= derivePara.CKD_G4_LVAL &&
                inputEgfr * 1 < derivePara.CKD_G3b_LVAL
            ) {
                fieldValObj.value = derivePara.CKD_G4;
            } else if (inputEgfr * 1 < derivePara.CKD_G4_LVAL) {
                fieldValObj.value = derivePara.CKD_G5;
            } else {
                fieldValObj.value = derivePara.NOT_KNOWN;
            }
            generalUtil.handleOperationType(fieldValObj);
        } else {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CHRONIC_KIDNEY_DISEASE}`);
            fieldValObj.value = derivePara.NOT_KNOWN;
            generalUtil.handleOperationType(fieldValObj);
        }

        // Foot Pathology ok
        let inputDeformityR = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_DEFORMITY}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_DEFORMITY}`).value : '';

        let inputDeformityL = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_DEFORMITY}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_DEFORMITY}`).value : '';

        let inputCallosityR = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_DRY_SKINCALLUS}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_DRY_SKINCALLUS}`).value : '';

        let inputCallosityL = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_DRY_SKINCALLUS}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_DRY_SKINCALLUS}`).value : '';

        let inputSkinInfectionR = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_INFECTION}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_INFECTION}`).value : '';

        let inputSkinInfectionL = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_INFECTION}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_INFECTION}`).value : '';

        let inputFissureR = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_FISSURE}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_FISSURE}`).value : '';

        let inputFissureL = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_FISSURE}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_FISSURE}`).value : '';

        let inputIschaemicR = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_ISCHAEMIC_CHANGE}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_ISCHAEMIC_CHANGE}`).value : '';

        let inputIschaemicL = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_ISCHAEMIC_CHANGE}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_ISCHAEMIC_CHANGE}`).value : '';

        let inputNailPathologyR = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_NAIL_PATHOLOGY}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_NAIL_PATHOLOGY}`).value : '';

        let inputNailPathologyL = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_NAIL_PATHOLOGY}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_NAIL_PATHOLOGY}`).value : '';

        if (
            isEqual(derivePara.YES, inputDeformityR) ||
            isEqual(derivePara.YES, inputDeformityL) ||
            isEqual(derivePara.YES, inputCallosityR) ||
            isEqual(derivePara.YES, inputCallosityL) ||
            isEqual(derivePara.YES, inputSkinInfectionR) ||
            isEqual(derivePara.YES, inputSkinInfectionL) ||
            isEqual(derivePara.YES, inputFissureR) ||
            isEqual(derivePara.YES, inputFissureL) ||
            isEqual(derivePara.YES, inputIschaemicR) ||
            isEqual(derivePara.YES, inputIschaemicL) ||
            isEqual(derivePara.YES, inputNailPathologyR) ||
            isEqual(derivePara.YES, inputNailPathologyL)
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.FOOT_PATHOLOGY}`);
            fieldValObj.value = derivePara.YES;
            generalUtil.handleOperationType(fieldValObj);
        } else if (
            isEqual(derivePara.NO, inputDeformityR) &&
            isEqual(derivePara.NO, inputDeformityL) &&
            isEqual(derivePara.NO, inputCallosityR) &&
            isEqual(derivePara.NO, inputCallosityL) &&
            isEqual(derivePara.NO, inputSkinInfectionR) &&
            isEqual(derivePara.NO, inputSkinInfectionL) &&
            isEqual(derivePara.NO, inputFissureR) &&
            isEqual(derivePara.NO, inputFissureL) &&
            isEqual(derivePara.NO, inputIschaemicR) &&
            isEqual(derivePara.NO, inputIschaemicL) &&
            isEqual(derivePara.NO, inputNailPathologyR) &&
            isEqual(derivePara.NO, inputNailPathologyL)
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.FOOT_PATHOLOGY}`);
            fieldValObj.value = derivePara.NO;
            generalUtil.handleOperationType(fieldValObj);
        } else {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.FOOT_PATHOLOGY}`);
            fieldValObj.value = derivePara.NOT_KNOWN;
            generalUtil.handleOperationType(fieldValObj);
        }

        //Loops ok
        let inputMonofilamentTestR = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_MONOFILAMENT_TEST}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_MONOFILAMENT_TEST}`).value : '';

        let inputMonofilamentTestL = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_MONOFILAMENT_TEST}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_MONOFILAMENT_TEST}`).value : '';

        let inputAchillesReflexesR = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ACHILLES_REFLEXES}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ACHILLES_REFLEXES}`).value : '';

        let inputAchillesReflexesL = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ACHILLES_REFLEXES}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ACHILLES_REFLEXES}`).value : '';

        let inputPinprickR = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ABNORMAL_PINPRICK_SENSATION}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ABNORMAL_PINPRICK_SENSATION}`).value : '';

        let inputPinprickL = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ABNORMAL_PINPRICK_SENSATION}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ABNORMAL_PINPRICK_SENSATION}`).value : '';

        let inputAbnTemperatureR = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ABNORMAL_TEMPERATURE_SENSATION}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_ABNORMAL_TEMPERATURE_SENSATION}`).value : '';

        let inputAbnTemperatureL = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ABNORMAL_TEMPERATURE_SENSATION}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_ABNORMAL_TEMPERATURE_SENSATION}`).value : '';

        let resultRightNoCnt = 0;
        let resultLeftNoCnt = 0;
        let abVibSensL = this.deriveAbVibSenL(patientPanelInfo.age);
        let abVibSensR = this.deriveAbVibSenR(patientPanelInfo.age);
        let riskLopsFieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.LOPS}`);
        riskLopsFieldValObj.value = derivePara.NOT_KNOWN;
        if (isEqual(DL_MONOFILAMENT_TEST[1].value, inputMonofilamentTestR)) {
            resultRightNoCnt++;
        }
        if (isEqual(derivePara.NO, abVibSensR)) {
            resultRightNoCnt++;
        }
        if (
            isEqual(DL_ACHILLES_REFLEXES[1].value, inputAchillesReflexesR) ||
            isEqual(DL_ACHILLES_REFLEXES[2].value, inputAchillesReflexesR)
        ) {
            resultRightNoCnt++;
        }
        if (isEqual(derivePara.NO, inputPinprickR)) {
            resultRightNoCnt++;
        }
        if (isEqual(derivePara.NO, inputAbnTemperatureR)) {
            resultRightNoCnt++;
        }
        if (isEqual(DL_MONOFILAMENT_TEST[1].value, inputMonofilamentTestL)) {
            resultLeftNoCnt++;
        }
        if (isEqual(derivePara.NO, abVibSensL)) {
            resultLeftNoCnt++;
        }
        if (
            isEqual(DL_ACHILLES_REFLEXES[1].value, inputAchillesReflexesL) ||
            isEqual(DL_ACHILLES_REFLEXES[2].value, inputAchillesReflexesL)
        ) {
            resultLeftNoCnt++;
        }
        if (isEqual(derivePara.NO, inputPinprickL)) {
            resultLeftNoCnt++;
        }
        if (isEqual(derivePara.NO, inputAbnTemperatureL)) {
            resultLeftNoCnt++;
        }
        if (
            isEqual(DL_MONOFILAMENT_TEST[2].value, inputMonofilamentTestR) ||
            isEqual(DL_MONOFILAMENT_TEST[2].value, inputMonofilamentTestL) ||
            isEqual(derivePara.YES, abVibSensR) ||
            isEqual(derivePara.YES, abVibSensL) ||
            isEqual(DL_ACHILLES_REFLEXES[3].value, inputAchillesReflexesR) ||
            isEqual(DL_ACHILLES_REFLEXES[3].value, inputAchillesReflexesL) ||
            isEqual(derivePara.YES, inputPinprickR) ||
            isEqual(derivePara.YES, inputPinprickL) ||
            isEqual(derivePara.YES, inputAbnTemperatureR) ||
            isEqual(derivePara.YES, inputAbnTemperatureL)
        ) {
            riskLopsFieldValObj.value = derivePara.YES;
        } else if (resultRightNoCnt >= 2 && resultLeftNoCnt >= 2) {
            riskLopsFieldValObj.value = derivePara.NO;
        }
        generalUtil.handleOperationType(riskLopsFieldValObj);

        // History of Ulcer / Amputation ok
        let inputHistUlcerR = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_HX_OF_ULCER}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_HX_OF_ULCER}`).value : derivePara.NOT_KNOWN;

        let inputHistUlcerL = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_HX_OF_ULCER}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_HX_OF_ULCER}`).value : derivePara.NOT_KNOWN;

        let inputUlcerR = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_ACTIVE_ULCER}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.RIGHT_FOOT_ACTIVE_ULCER}`).value : derivePara.NOT_KNOWN;

        let inputUlcerL = feetFieldValMap.has(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_ACTIVE_ULCER}`)
            ? feetFieldValMap.get(`${MRAM_FEET_FOOT_PATHOLOGY_PREFIX}_${MRAM_FEET_FOOT_PATHOLOGY_ID.LEFT_FOOT_ACTIVE_ULCER}`).value : derivePara.NOT_KNOWN;

        let historyOfUlcerRiskFiled = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HISTORY_OF_ULCER}`);

        if (
            isEqual(derivePara.YES, inputHistUlcerR) ||
            isEqual(derivePara.YES, inputHistUlcerL) ||
            isEqual(derivePara.YES, inputUlcerR) ||
            isEqual(derivePara.YES, inputUlcerL)
        ) {
            historyOfUlcerRiskFiled.value = derivePara.YES;
            generalUtil.handleOperationType(historyOfUlcerRiskFiled);
        } else if (
            isEqual(derivePara.NO, inputHistUlcerR) &&
            isEqual(derivePara.NO, inputHistUlcerL) &&
            isEqual(derivePara.NO, inputUlcerR) &&
            isEqual(derivePara.NO, inputUlcerL)
        ) {
            historyOfUlcerRiskFiled.value = derivePara.NO;
            generalUtil.handleOperationType(historyOfUlcerRiskFiled);
        } else {
            historyOfUlcerRiskFiled.value = derivePara.NOT_KNOWN;
            generalUtil.handleOperationType(historyOfUlcerRiskFiled);
        }

        //Smoking ok
        let inputSmoking = backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING}`)
            ? backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING}`).value : derivePara.NOT_KNOWN;

        if (isEqual(SMOKING[2].value, inputSmoking)) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.SMOKING}`);
            fieldValObj.value = derivePara.YES;
            generalUtil.handleOperationType(fieldValObj);
        } else if (
            isEqual(SMOKING[1].value, inputSmoking) ||
            isEqual(SMOKING[3].value, inputSmoking)
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.SMOKING}`);
            fieldValObj.value = derivePara.NO;
            generalUtil.handleOperationType(fieldValObj);
        } else {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.SMOKING}`);
            fieldValObj.value = derivePara.NOT_KNOWN;
            generalUtil.handleOperationType(fieldValObj);
        }

        // Diabetes Mellitus ok
        let inputAntiDiabetic = backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_DIABETIC_DRUG}`)
            ? backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_DIABETIC_DRUG}`).value : derivePara.NOT_KNOWN;

        let inputInsulin = backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.INSULIN_TREATMENT}`)
            ? backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.INSULIN_TREATMENT}`).value : derivePara.NOT_KNOWN;

        let inputDmType = backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.TYPE_OF_DM}`)
            ? backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.TYPE_OF_DM}`).value : null;

        let inputFastingGlucose = measurementAndLabTestFieldValMap.has(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.FASTING_GLUCOSE}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.FASTING_GLUCOSE}`).value : '';

        let riskDiabetesMellitusFieldVal = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DIABETES_MELLITUS}`);
        riskDiabetesMellitusFieldVal.value = derivePara.NOT_KNOWN;
        if (
            isEqual(derivePara.YES, inputAntiDiabetic) ||
            isEqual(derivePara.YES, inputInsulin) ||
            (!isNull(inputDmType) && inputDmType.trim() !== '') ||
            (inputFastingGlucose != null && inputFastingGlucose >= derivePara.DM_FG_H_VAL)
        ) {
            riskDiabetesMellitusFieldVal.value = derivePara.YES;
        } else if (
            isEqual(derivePara.NO, inputAntiDiabetic) &&
            isEqual(derivePara.NO, inputInsulin) &&
            (isNull(inputDmType) || inputDmType.trim() === '') &&
            inputFastingGlucose != null && inputFastingGlucose.trim() != '' &&
            inputFastingGlucose * 1 < derivePara.DM_FG_NOR_VAL &&
            inputFastingGlucose >= 0
        ) {
            riskDiabetesMellitusFieldVal.value = derivePara.NO;
        }
        generalUtil.handleOperationType(riskDiabetesMellitusFieldVal);

        //Hypertension
        let riskHypertensionField = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HYPERTENSION}`);
        riskHypertensionField.value = derivePara.NOT_KNOWN;
        let inputAntiHyperten = backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_HYPERTENSIVE_DRUG}`)
            ? backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_HYPERTENSIVE_DRUG}`).value : derivePara.NOT_KNOWN;
        let displaySystolicBP = null;
        let displayDiastolicBP = null;

        let inputSBpR = measurementAndLabTestFieldValMap.has(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_SYSTOLIC_BP}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_SYSTOLIC_BP}`).value : '';

        let inputDBpR = measurementAndLabTestFieldValMap.has(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_DIASTOLIC_BP}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.RIGHT_SITTING_DIASTOLIC_BP}`).value : '';

        let inputSBpL = measurementAndLabTestFieldValMap.has(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_SYSTOLIC_BP}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_SYSTOLIC_BP}`).value : '';

        let inputDBpL = measurementAndLabTestFieldValMap.has(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_DIASTOLIC_BP}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.LEFT_SITTING_DIASTOLIC_BP}`).value : '';

        let dmResult = riskDiabetesMellitusFieldVal.value;
        if (this.blankValidation(inputSBpR) && this.blankValidation(inputDBpR)) {
            displaySystolicBP = inputSBpR;
            displayDiastolicBP = inputDBpR;
        }
        if (this.blankValidation(inputSBpL) && this.blankValidation(inputDBpL)) {
            if (
                displaySystolicBP == null ||
                displayDiastolicBP == null ||
                inputSBpL * 1 > displaySystolicBP * 1
            ) {
                displaySystolicBP = inputSBpL;
                displayDiastolicBP = inputDBpL;
            } else if (
                inputSBpL * 1 === displaySystolicBP * 1 &&
                inputDBpL * 1 > displayDiastolicBP * 1
            ) {
                displayDiastolicBP = inputDBpL;
            }
        }
        if (
            isEqual(derivePara.YES, inputAntiHyperten) ||
            (isEqual(derivePara.YES, dmResult) &&
                displaySystolicBP != null &&
                displaySystolicBP * 1 >= derivePara.HT_SYSTOLIC_DM_VAL) ||
            (displaySystolicBP != null &&
                displaySystolicBP * 1 >= derivePara.HT_SYSTOLIC_VAL) ||
            (isEqual(derivePara.YES, dmResult) &&
                displayDiastolicBP != null &&
                displayDiastolicBP * 1 >= derivePara.HT_DIASTOLIC_DM_VAL) ||
            (displayDiastolicBP != null &&
                displayDiastolicBP * 1 >= derivePara.HT_DIASTOLIC_VAL)
        ) {
            riskHypertensionField.value = derivePara.YES;
        } else if (
            isEqual(derivePara.NO, inputAntiHyperten) &&
            ((isEqual(derivePara.NO, dmResult) &&
                displaySystolicBP != null &&
                displaySystolicBP * 1 < derivePara.HT_SYSTOLIC_VAL) ||
                (displaySystolicBP != null &&
                    displaySystolicBP * 1 < derivePara.HT_SYSTOLIC_DM_VAL)) &&
            ((isEqual(derivePara.NO, dmResult) &&
                displayDiastolicBP != null &&
                displayDiastolicBP * 1 < derivePara.HT_DIASTOLIC_VAL) ||
                (displayDiastolicBP != null &&
                    displayDiastolicBP * 1 < derivePara.HT_DIASTOLIC_DM_VAL))
        ) {
            riskHypertensionField.value = derivePara.NO;
        }
        generalUtil.handleOperationType(riskHypertensionField);

        // Obesity by MBI(Asian) ok
        let inputBmi = measurementAndLabTestFieldValMap.has(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.BMI}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.BMI}`).value : null;
        if (
            inputBmi.trim() !== '' && inputBmi != null &&
            inputBmi * 1 >= derivePara.OBS_SEV_VAL * 1
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.OBESITY_BY_MBI}`);
            fieldValObj.value = derivePara.SEV_OBESITY;
            generalUtil.handleOperationType(fieldValObj);
        } else if (
            inputBmi.trim() !== '' && inputBmi != null &&
            inputBmi * 1 >= derivePara.OBS_MOD_VAL * 1
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.OBESITY_BY_MBI}`);
            fieldValObj.value = derivePara.MOD_OBESITY;
            generalUtil.handleOperationType(fieldValObj);
        } else if (
            inputBmi.trim() !== '' &&  inputBmi != null &&
            inputBmi * 1 >= derivePara.OBS_OVERW_VAL * 1
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.OBESITY_BY_MBI}`);
            fieldValObj.value = derivePara.OVERWEIGHT;
            generalUtil.handleOperationType(fieldValObj);
        } else if (
            inputBmi.trim() !== '' && inputBmi != null &&
            inputBmi * 1 >= derivePara.OBS_NOR_VAL * 1
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.OBESITY_BY_MBI}`);
            fieldValObj.value = derivePara.NO;
            generalUtil.handleOperationType(fieldValObj);
        } else if (
            inputBmi.trim() !== '' && inputBmi != null &&
            inputBmi * 1 < derivePara.OBS_NOR_VAL * 1
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.OBESITY_BY_MBI}`);
            fieldValObj.value = derivePara.UNDERWEIGHT;
            generalUtil.handleOperationType(fieldValObj);
        } else {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.OBESITY_BY_MBI}`);
            fieldValObj.value = derivePara.NOT_KNOWN;
            generalUtil.handleOperationType(fieldValObj);
        }

        // Central Obesity(Asian) ok
        let inputWaist = measurementAndLabTestFieldValMap.has(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.WAIST}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_MEASUREMENTS_PREFIX}_${MRAM_MEASUREMENTS_ID.WAIST}`).value : '';

        if ((isEqual(derivePara.FEMALE, selectedGenderCd) &&
            inputWaist.trim() != '' && inputWaist != null &&
            inputWaist * 1 >= 80) || inputWaist * 1 >= 90
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CENTRAL_OBESITY}`);
            fieldValObj.value = derivePara.YES;
            generalUtil.handleOperationType(fieldValObj);
        } else if (
            inputWaist.trim() != '' && inputWaist != null &&
            ((isEqual(derivePara.MALE, selectedGenderCd) &&
                inputWaist * 1 >= 0 && inputWaist * 1 < 90) ||
                (inputWaist * 1 >= 0 && inputWaist * 1 < 80))
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CENTRAL_OBESITY}`);
            fieldValObj.value = derivePara.NO;
            generalUtil.handleOperationType(fieldValObj);
        } else {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CENTRAL_OBESITY}`);
            fieldValObj.value = derivePara.NOT_KNOWN;
            generalUtil.handleOperationType(fieldValObj);
        }

        // Dyslipidaemia
        let inputAntiLipid = backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPID_LOWERING_DRUG}`)
            ? backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPID_LOWERING_DRUG}`).value : derivePara.NOT_KNOWN;

        let inputLdlc = measurementAndLabTestFieldValMap.has(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.LDL_C}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.LDL_C}`).value : '';

        let inputTg = measurementAndLabTestFieldValMap.has(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.TRIGLYCERIDES}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.TRIGLYCERIDES}`).value : '';

        let inputHdlc = measurementAndLabTestFieldValMap.has(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.HDL_C}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.HDL_C}`).value : '';

        if (
            isEqual(derivePara.YES, inputAntiLipid) ||
            (inputLdlc.trim() != '' && inputLdlc != null &&
                inputLdlc >= derivePara.DYS_LDLC_VAL) ||
            (inputTg.trim() != '' && inputTg != null &&
                inputTg >= derivePara.DYS_TG_VAL) ||
            (isEqual(derivePara.FEMALE, selectedGenderCd) &&
                inputHdlc.trim() != '' && inputHdlc != null &&
                inputHdlc < derivePara.DYS_HDLC_F_VAL && inputHdlc >= 0) ||
            (inputHdlc != null && inputHdlc.trim() != '' &&
                inputHdlc < derivePara.DYS_HDLC_M_VAL && inputHdlc >= 0)
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DYSLIPIDAEMIA}`);
            fieldValObj.value = derivePara.YES;
            generalUtil.handleOperationType(fieldValObj);
        } else if (
            isEqual(derivePara.NO, inputAntiLipid) &&
            inputLdlc != null && inputLdlc.trim() != '' &&
            inputLdlc < derivePara.DYS_LDLC_VAL &&
            inputLdlc >= 0 && inputTg.trim() != '' &&
            inputTg != null && inputTg < derivePara.DYS_TG_VAL &&
            inputTg >= 0 &&
            ((isEqual(derivePara.MALE, selectedGenderCd) &&
                inputHdlc.trim() != '' && inputHdlc != null &&
                inputHdlc >= derivePara.DYS_HDLC_M_VAL) ||
                (inputHdlc != null && inputHdlc.trim() != '' &&
                    inputHdlc >= derivePara.DYS_HDLC_F_VAL))
        ) {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DYSLIPIDAEMIA}`);
            fieldValObj.value = derivePara.NO;
            generalUtil.handleOperationType(fieldValObj);
        } else {
            let fieldValObj = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DYSLIPIDAEMIA}`);
            fieldValObj.value = derivePara.NOT_KNOWN;
            generalUtil.handleOperationType(fieldValObj);
        }

        //Albuminuria
        let riskAlbuminField = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.ALBUMINURIA}`);

        let footRiskCategoryField = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.MODIFIED_FOOT_RISK_CATEGORY}`);

        let albuminuria = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.ALBUMINURIA}`);
        if (0 === dervieType || 3 === dervieType) {
            riskAlbuminField.value = this.handlederiveAlbumin(selectedGenderCd);
            //Modified Foot Risk Category (ADA)
            footRiskCategoryField.value = this.handleFootRisk(riskLopsFieldValObj.value, historyOfUlcerRiskFiled.value, macrovascularPeripheralArterialDisease.value);
            generalUtil.handleOperationType(footRiskCategoryField);
        } else if (4 === dervieType) {
            riskAlbuminField.value = this.handlederiveAlbumin(selectedGenderCd);
        } else {
            riskAlbuminField.value = albuminuria.value;
            let tempVal = riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.ALBUMINURIA}`).value;
            EventEmitter.emit('mram_measurement_lab_test_albuminuria_reload', {
                displayAlbuminuriaDL: true,
                albuminuriaVal: tempVal
            });
        }
        generalUtil.handleOperationType(riskAlbuminField);
        this.setState({
            updateRisk: !this.state.updateRisk,
            riskProfileFieldValMap: riskProfileFieldValMap
        });
    };

    deriveAbVibSenR = age => {
        let { feetFieldValMap } = this.state;
        let result = derivePara.NOT_KNOWN;
        let inputHzTuningForkR = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_128HZ_TUNING_FORK}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_128HZ_TUNING_FORK}`).value : '';

        let inputTuningForkR = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_GRADUATED_TUNING_FORK}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_GRADUATED_TUNING_FORK}`).value : '';

        let inputVptR = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_VPT}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.RIGHT_FOOT_VPT}`).value : '';

        if (
            isEqual(derivePara.HZ_TUN_DIMINISH, inputHzTuningForkR) ||
            isEqual(derivePara.HZ_TUN_ABSENT, inputHzTuningForkR) ||
            (this.blankValidation(age) && age * 1 < derivePara.GRAD_TUN_AGE_D &&
                this.blankValidation(inputTuningForkR) &&
                inputTuningForkR * 1 <= derivePara.GRAD_TUN_H_VAL) ||
            (this.blankValidation(inputTuningForkR) &&
                inputTuningForkR * 1 <= derivePara.GRAD_TUN_L_VAL) ||
            (this.blankValidation(inputVptR) &&
                inputVptR * 1 > derivePara.GRAD_VPT_VAL)
        ) {
            result = derivePara.YES;
        } else if (
            isEqual(derivePara.HZ_TUN_NORMAL, inputHzTuningForkR) ||
            (this.blankValidation(age) &&
                age * 1 >= derivePara.GRAD_TUN_AGE_D &&
                this.blankValidation(inputTuningForkR) &&
                inputTuningForkR * 1 > derivePara.GRAD_TUN_L_VAL) ||
            (this.blankValidation(inputTuningForkR) &&
                inputTuningForkR * 1 > derivePara.GRAD_TUN_H_VAL) ||
            (this.blankValidation(inputVptR) &&
                inputVptR * 1 <= derivePara.GRAD_VPT_VAL)
        ) {
            result = derivePara.NO;
        }
        return result;
    };

    deriveAbVibSenL = age => {
        let { feetFieldValMap } = this.state;
        let result = derivePara.NOT_KNOWN;
        let inputHzTuningForkL = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_128HZ_TUNING_FORK}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_128HZ_TUNING_FORK}`).value : '';

        let inputTuningForkL = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_GRADUATED_TUNING_FORK}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_GRADUATED_TUNING_FORK}`).value : '';

        let inputVptL = feetFieldValMap.has(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_VPT}`)
            ? feetFieldValMap.get(`${MRAM_FEET_NEUROLOGY_EXAMINATION_PREFIX}_${MRAM_FEET_NEUROLOGY_EXAMINATION_ID.LEFT_FOOT_VPT}`).value : '';

        if (
            isEqual(derivePara.HZ_TUN_DIMINISH, inputHzTuningForkL) ||
            isEqual(derivePara.HZ_TUN_ABSENT, inputHzTuningForkL) ||
            (this.blankValidation(age) &&
                age * 1 < derivePara.GRAD_TUN_AGE_D &&
                this.blankValidation(inputTuningForkL) &&
                inputTuningForkL * 1 <= derivePara.GRAD_TUN_H_VAL) ||
            (this.blankValidation(inputTuningForkL) &&
                inputTuningForkL * 1 <= derivePara.GRAD_TUN_L_VAL) ||
            (this.blankValidation(inputVptL) &&
                inputVptL * 1 > derivePara.GRAD_VPT_VAL)
        ) {
            result = derivePara.YES;
        } else if (
            isEqual(derivePara.HZ_TUN_NORMAL, inputHzTuningForkL) ||
            (this.blankValidation(age) &&
                age * 1 >= derivePara.GRAD_TUN_AGE_D &&
                this.blankValidation(inputTuningForkL) &&
                inputTuningForkL * 1 > derivePara.GRAD_TUN_L_VAL) ||
            (this.blankValidation(inputTuningForkL) &&
                inputTuningForkL * 1 > derivePara.GRAD_TUN_H_VAL) ||
            (this.blankValidation(inputVptL) &&
                inputVptL * 1 <= derivePara.GRAD_VPT_VAL)
        ) {
            result = derivePara.NO;
        }
        return result;
    };

    handlederiveAlbumin = (sex,extraValMap=new Map(),extraRiskValMap=new Map()) => {
        let measurementAndLabTestFieldValMap = extraValMap.size>0? extraValMap:this.state.measurementAndLabTestFieldValMap;
        let riskAlbuminField =  derivePara.NOT_KNOWN;

        let inputProteinuria = measurementAndLabTestFieldValMap.has(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.PROTEINURIA}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.PROTEINURIA}`).value : '';

        let inputUrineAlb = measurementAndLabTestFieldValMap.has(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.URINE_ALB_AND_CR_RATIO}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.URINE_ALB_AND_CR_RATIO}`).value : '';

        let inputAlbumin = measurementAndLabTestFieldValMap.has(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.ALBUMIN_EXRETION_RATE}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.ALBUMIN_EXRETION_RATE}`).value : '';

        let inputUrineAlbCon = measurementAndLabTestFieldValMap.has(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.URINE_ALB_CONCENTRATION}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.URINE_ALB_CONCENTRATION}`).value : '';

        let inputUrineCrRatio = measurementAndLabTestFieldValMap.has(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.URINE_PROTEIN_ANd_CR_RATIO}`)
            ? measurementAndLabTestFieldValMap.get(`${MRAM_LABTEST_PREFIX}_${MRAM_LABTEST_ID.URINE_PROTEIN_ANd_CR_RATIO}`).value : '';

        if ((this.blankValidation(inputProteinuria) && inputProteinuria * 1 > derivePara.ALBUM_A3_PROT_VAL)
            || (this.blankValidation(inputUrineCrRatio) && inputUrineCrRatio * 1 >= derivePara.ALBUM_A3_UPCR_VAL)
            || (this.blankValidation(inputUrineAlb) && inputUrineAlb * 1 > derivePara.ALBUM_A3_UACR_VAL)
            || (this.blankValidation(inputAlbumin) && inputAlbumin * 1 > derivePara.ALBUM_A3_AER_VAL)
            || (this.blankValidation(inputUrineAlbCon) && inputUrineAlbCon * 1 > derivePara.ALBUM_A3_UALCON_VAL)) {
            riskAlbuminField = derivePara.MACRO_PROT_A3;
        } else if ((this.blankValidation(inputProteinuria) && inputProteinuria === -1)
            || (this.blankValidation(inputUrineAlb) && inputUrineAlb === -1)
            || (this.blankValidation(inputAlbumin) && inputAlbumin * 1 === -1)
            || (this.blankValidation(inputUrineAlbCon) && inputUrineAlbCon * 1 === -1)) {
            riskAlbuminField = derivePara.NOT_KNOWN;
        } else if (
            ((isEqual('M', sex) && this.blankValidation(inputUrineAlb)
                && inputUrineAlb * 1 > derivePara.ALBUM_A2_UACR_M_VAL
                && inputUrineAlb * 1 <= derivePara.ALBUM_A3_UACR_VAL)
                || (this.blankValidation(inputUrineAlb)
                    && inputUrineAlb * 1 > derivePara.ALBUM_A2_UACR_F_VAL
                    && inputUrineAlb * 1 <= derivePara.ALBUM_A3_UACR_VAL))
            || (this.blankValidation(inputAlbumin) && inputAlbumin * 1 >= derivePara.ALBUM_A2_AER_VAL
                && inputAlbumin * 1 <= derivePara.ALBUM_A3_AER_VAL)
            || (this.blankValidation(inputUrineAlbCon) && inputUrineAlbCon * 1 >= derivePara.ALBUM_A2_UALCON_VAL
                && inputUrineAlbCon * 1 <= derivePara.ALBUM_A3_UALCON_VAL)) {
            riskAlbuminField = derivePara.MICRO_ALBUM_A2;
        } else if ((this.blankValidation(inputProteinuria) && inputProteinuria * 1 <= derivePara.ALBUM_A3_PROT_VAL)
            || (this.blankValidation(inputUrineCrRatio) && inputUrineCrRatio * 1 < derivePara.ALBUM_A3_PROT_VAL)
            || ((this.blankValidation(inputUrineAlb) && inputUrineAlb * 1 <= derivePara.ALBUM_A2_UACR_M_VAL)
                || (isEqual('F', sex) && this.blankValidation(inputUrineAlb) && inputUrineAlb * 1 <= derivePara.ALBUM_A2_UACR_F_VAL))
            || (this.blankValidation(inputAlbumin) && inputAlbumin * 1 < derivePara.ALBUM_A2_AER_VAL)
            || (this.blankValidation(inputUrineAlbCon) && inputUrineAlbCon * 1 < derivePara.ALBUM_A2_UALCON_VAL)) {
            riskAlbuminField = derivePara.ALBUM_NORMAL_A1;
        }

        if (riskAlbuminField === derivePara.NOT_KNOWN && extraRiskValMap.size > 0) {
            this.handleInitMeasurementAlbuminuria(extraRiskValMap);
        } else {
            EventEmitter.emit('mram_measurement_lab_test_albuminuria_reload', {
                displayAlbuminuriaDL: riskAlbuminField === derivePara.NOT_KNOWN,
                albuminuriaVal: riskAlbuminField
            });
        }
        return riskAlbuminField;
    };

    handleFootRisk = (lops, histUlcer, pad) => {
        let result = derivePara.NOT_KNOWN;
        if (isEqual(derivePara.YES, histUlcer)) {
            result = derivePara.FOOT_RISK_3;
        } else if (isEqual(derivePara.YES, pad)) {
            result = derivePara.FOOT_RISK_2;
        } else if (isEqual(derivePara.YES, lops)) {
            result = derivePara.FOOT_RISK_1;
        } else if (isEqual(derivePara.NO, histUlcer) && isEqual(derivePara.NO, pad)
            && isEqual(derivePara.NO, lops)) {
            result = derivePara.FOOT_RISK_0;
        }
        return result;
    }

    blankValidation = value => {
        return !((value.trim() == '') || (value == null));
        // if ((value.trim() == '') || (value == null)) {
        //     return false;
        // } else {
        //     return true;
        // }
    };

    handleDrawerClick = name => {
        // let {dervieType}=this.state;
        if ('Risk Profile' === name) {
            this.setState({
                selectedModule: name,
                dervieType: 3
            });
        } else {
            // if('Measurement/Lab Test'===name && dervieType===null){
            //     EventEmitter.emit('mram_measurement_lab_test_albuminuria_reload',{
            //         displayAlbuminuriaDL: true
            //     });
            // }
            this.setState({
                selectedModule: name
            });
        }
    };

    handleDrawerOpen = () => {
        this.resetHeight();
        this.setState({ open: true });
    };

    handleDrawerClose = () => {
        this.resetHeight();
        this.setState({ open: false });
    };

    hasIsError = fieldValObjList => {
        let flag = false, targetId = null;
        for (let i = 0; i < fieldValObjList.length; i++) {
            let fieldValObj = fieldValObjList[i];
            let { moduleName, valMap } = fieldValObj;
            let errorFlag = false;
            for (let [id, tempValObj] of valMap) {
                if (
                    tempValObj.isError ||
                    (tempValObj.isAbnormal && tempValObj.codeMramId !== _.toNumber(MRAM_MEASUREMENTS_ID.WAIST))
                ) {
                    targetId = id;
                    errorFlag = true;
                    break;
                }
            }
            if (errorFlag) {
                flag = errorFlag;
                this.handleDrawerClick(moduleName);
                _.delay(() => {
                    document.getElementById(targetId).scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
                break;
            }
        }
        return { flag, targetId };
    };

    handleSaveAll = mode => {
        const {
            eyesFieldValMap,
            feetFieldValMap,
            dietAssessmentFieldValMap,
            riskProfileFieldValMap,
            backgroundInformationFieldValMap,
            measurementAndLabTestFieldValMap,
            otherComplicationsFieldValMap,
            carePlanFieldValMap
        } = this.state;
        let filedMapList = [
            { moduleName: 'Background Information/ Tx', valMap: backgroundInformationFieldValMap },
            { moduleName: 'Measurement/Lab Test', valMap: measurementAndLabTestFieldValMap },
            { moduleName: 'Eyes', valMap: eyesFieldValMap },
            { moduleName: 'Feet', valMap: feetFieldValMap },
            { moduleName: 'Other Complication(s)', valMap: otherComplicationsFieldValMap },
            { moduleName: 'Diet Assessment', valMap: dietAssessmentFieldValMap },
            { moduleName: 'Risk Profile', valMap: riskProfileFieldValMap },
            { moduleName: 'Care Plan', valMap: carePlanFieldValMap }
        ];
        this.props.openCommonCircularDialog();
        let { flag, targetId } = this.hasIsError(filedMapList);
        if (flag || this.state.dateTimeFlag) {
            this.setState({ refreshFlag: false });
            this.props.closeCommonCircularDialog();
            let payload = {
                msgCode: MRAM_CODE.IS_ILLEGAL_DATA,
                btn1AutoClose: false,
                btnActions: {
                    btn1Click: () => {
                        this.props.closeCommonMessage();
                        if (flag) {
                            _.delay(() => {
                                document.getElementById(targetId).focus();
                            }, 500);
                        }
                    }
                }
            };
            this.props.openCommonMessage(payload);
            return false;
        } else {
            if (this.state.dateTime === '') {
                this.props.closeCommonCircularDialog();
                this.props.openCommonMessage({ msgCode: MRAM_CODE.EMPTY_ASSESSMENT_DATE });
                return false;
            } else {
                this.setState({ refreshFlag: false });
            }
        }
        if (this.props.mramOriginObj !== null) {
            this.props.saveMramFieldValueList({
                params: {
                    mramId: this.state.selectRow,
                    patientKey: this.state.selectedPatientKey,
                    mramAssessmentStatus:
                        mode === '1'
                            ? mramAssessmentStatus.inProgress
                            : mramAssessmentStatus.signedOff,
                    mramSignedoffDtm: mode === '1' ? null : new Date(),
                    mramAssessmentDtm:
                        this.state.dateTime === '' ? new Date() : this.state.dateTime,
                    serviceCd: this.props.mramOriginObj.serviceCd,
                    clinicCd: this.props.mramOriginObj.clinicCd,
                    createdBy: this.props.mramOriginObj.createdBy,
                    createdDtm: this.props.mramOriginObj.createdDtm,
                    updatedBy: this.props.mramOriginObj.updatedBy,
                    updatedDtm: this.props.mramOriginObj.updatedDtm,
                    bkgdInfoDto: this.mapToJson(backgroundInformationFieldValMap),
                    measurementDto: this.mapToJson(measurementAndLabTestFieldValMap),
                    eyesAssessmentDto: this.mapToJson(eyesFieldValMap),
                    feetAssessmentDto: this.mapToJson(feetFieldValMap),
                    otherComplicationsDto: this.mapToJson(otherComplicationsFieldValMap),
                    dietAssessmentDto: this.mapToJson(dietAssessmentFieldValMap),
                    riskProfileDto: this.mapToJson(riskProfileFieldValMap),
                    carePlanDto: this.mapToJson(carePlanFieldValMap),
                    version: this.props.mramOriginObj.version,
                    mramSignedoffBy: JSON.parse(sessionStorage.getItem('loginInfo')).loginName || null
                },
                callback: data => {
                    let payload = {
                        msgCode: data.msgCode
                    };
                    // let mramId = data.data.mramId;
                    if (data.respCode === 0) {
                        payload.showSnackbar = true;
                        if (data.data.mramId !== null) {
                            this.refreshPageData(data.data.mramId);
                        }
                        this.props.openCommonMessage(payload);
                    } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                        this.props.closeCommonCircularDialog();
                        let payload = {
                            msgCode: data.msgCode,
                            btnActions:
                            {
                                btn1Click: () => {
                                    this.refreshPageData(this.state.selectRow);
                                },
                                btn2Click: () => {
                                    this.props.closeCommonCircularDialog();
                                }
                            }
                        };
                        this.props.openCommonMessage(payload);
                    } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE) {
                        this.props.closeCommonCircularDialog();
                        let payload = {
                            msgCode: data.msgCode,
                            btnActions:
                            {
                                btn1Click: () => {
                                    this.reloadDeleteHistory();
                                }
                            }
                        };
                        this.props.openCommonMessage(payload);
                    }
                    this.setState({ editFlag: false });
                }
            });
        } else {
            let { loginInfo } = this.props;
            let defaultServiceCd = loginInfo.service.code;
            let defaultClinicCd = loginInfo.clinic.code;
            this.props.saveMramFieldValueList({
                params: {
                    mramId: this.state.selectRow,
                    patientKey: this.state.selectedPatientKey,
                    mramAssessmentStatus:
                        mode === '1'
                            ? mramAssessmentStatus.inProgress
                            : mramAssessmentStatus.signedOff,
                    mramSignedoffDtm: mode === '1' ? null : new Date(),
                    mramAssessmentDtm: this.state.dateTime,
                    serviceCd: defaultServiceCd,
                    clinicCd: defaultClinicCd,
                    createdBy: null,
                    createdDtm: null,
                    updatedBy: null,
                    updatedDtm: null,
                    bkgdInfoDto: this.mapToJson(backgroundInformationFieldValMap),
                    measurementDto: this.mapToJson(measurementAndLabTestFieldValMap),
                    eyesAssessmentDto: this.mapToJson(eyesFieldValMap),
                    feetAssessmentDto: this.mapToJson(feetFieldValMap),
                    otherComplicationsDto: this.mapToJson(otherComplicationsFieldValMap),
                    dietAssessmentDto: this.mapToJson(dietAssessmentFieldValMap),
                    riskProfileDto: this.mapToJson(riskProfileFieldValMap),
                    carePlanDto: this.mapToJson(carePlanFieldValMap),
                    version: null,
                    mramSignedoffBy: JSON.parse(sessionStorage.getItem('loginInfo')).loginName || null
                },
                callback: data => {
                    let payload = {
                        msgCode: data.msgCode
                    };
                    // let mramId = data.data.mramId;
                    if (data.respCode === 0) {
                        payload.showSnackbar = true;
                        if (data.data.mramId !== null) {
                            this.refreshPageData(data.data.mramId);
                        }
                        this.props.openCommonMessage(payload);
                    } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                        this.props.closeCommonCircularDialog();
                        let payload = {
                            msgCode: data.msgCode,
                            btnActions:
                            {
                                btn1Click: () => {
                                    this.refreshPageData(this.state.selectRow);
                                },
                                btn2Click: () => {
                                    this.props.closeCommonCircularDialog();
                                }
                            }
                        };
                        this.props.openCommonMessage(payload);
                    } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE) {
                        this.props.closeCommonCircularDialog();
                        let payload = {
                            msgCode: data.msgCode,
                            btnActions:
                            {
                                btn1Click: () => {
                                    this.reloadDeleteHistory();
                                }
                            }
                        };
                        this.props.openCommonMessage(payload);
                    }
                    this.setState({ editFlag: false });
                }
            });
        }
        let typeName = mode === '1' ? 'Save Draft' : 'Save & Sign Off';
        this.insertMramLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} '${typeName}' button`, '');
    };

    handleCancleSave = (saveCallback, callbackError = false) => {
        const {
            eyesFieldValMap,
            feetFieldValMap,
            dietAssessmentFieldValMap,
            riskProfileFieldValMap,
            backgroundInformationFieldValMap,
            measurementAndLabTestFieldValMap,
            otherComplicationsFieldValMap,
            carePlanFieldValMap
        } = this.state;
        let filedMapList = [
            { moduleName: 'Background Information/ Tx', valMap: backgroundInformationFieldValMap },
            { moduleName: 'Measurement/Lab Test', valMap: measurementAndLabTestFieldValMap },
            { moduleName: 'Eyes', valMap: eyesFieldValMap },
            { moduleName: 'Feet', valMap: feetFieldValMap },
            { moduleName: 'Other Complication(s)', valMap: otherComplicationsFieldValMap },
            { moduleName: 'Diet Assessment', valMap: dietAssessmentFieldValMap },
            { moduleName: 'Risk Profile', valMap: riskProfileFieldValMap },
            { moduleName: 'Care Plan', valMap: carePlanFieldValMap }
        ];
        let { flag, targetId } = this.hasIsError(filedMapList);
        if (flag || this.state.dateTimeFlag) {
            this.setState({ refreshFlag: false });
            this.props.closeCommonCircularDialog();
            let payload = {
                msgCode: MRAM_CODE.IS_ILLEGAL_DATA,
                btn1AutoClose: false,
                btnActions: {
                    btn1Click: () => {
                        this.props.closeCommonMessage();
                        _.delay(() => {
                            document.getElementById(targetId).focus();
                        }, 500);
                    }
                }
            };
            this.props.openCommonMessage(payload);
            return false;
        } else {
            if (this.state.dateTime === '') {
                this.props.closeCommonCircularDialog();
                this.props.openCommonMessage({ msgCode: MRAM_CODE.EMPTY_ASSESSMENT_DATE });
                //防止关闭deleteTab
                if (callbackError) { saveCallback(false); }
                return false;
            } else {
                this.setState({ refreshFlag: false });
            }
        }
        this.props.openCommonCircularDialog();
        if (this.props.mramOriginObj !== null) {
            this.props.saveMramFieldValueList({
                params: {
                    mramId: this.state.selectRow,
                    patientKey: this.state.selectedPatientKey,
                    mramAssessmentStatus: this.props.mramOriginObj.mramAssessmentStatus,
                    mramSignedoffDtm: null,
                    mramAssessmentDtm: this.state.dateTime === '' ? new Date() : this.state.dateTime,
                    serviceCd: this.props.mramOriginObj.serviceCd,
                    clinicCd: this.props.mramOriginObj.clinicCd,
                    createdBy: this.props.mramOriginObj.createdBy,
                    createdDtm: this.props.mramOriginObj.createdDtm,
                    updatedBy: this.props.mramOriginObj.updatedBy,
                    updatedDtm: this.props.mramOriginObj.updatedDtm,
                    bkgdInfoDto: this.mapToJson(backgroundInformationFieldValMap),
                    measurementDto: this.mapToJson(measurementAndLabTestFieldValMap),
                    eyesAssessmentDto: this.mapToJson(eyesFieldValMap),
                    feetAssessmentDto: this.mapToJson(feetFieldValMap),
                    otherComplicationsDto: this.mapToJson(otherComplicationsFieldValMap),
                    dietAssessmentDto: this.mapToJson(dietAssessmentFieldValMap),
                    riskProfileDto: this.mapToJson(riskProfileFieldValMap),
                    carePlanDto: this.mapToJson(carePlanFieldValMap),
                    version: this.props.mramOriginObj.version,
                    mramSignedoffBy: JSON.parse(sessionStorage.getItem('loginInfo')).loginName || null
                },
                callback: data => {
                    let payload = {
                        msgCode: data.msgCode
                    };
                    if (data.respCode === 0) {
                        payload.showSnackbar = true;
                        if (data.data.mramId !== null) {
                            let mramId = data.data.mramId;
                            this.props.getMramFieldValueList({
                                params: {
                                    mramId: mramId
                                },
                                callback: () => {
                                    this.setState({ refreshFlag: true });
                                    this.props.closeCommonCircularDialog();
                                }
                            });
                            this.setState({ selectRow: mramId });
                        }
                        this.props.openCommonMessage(payload);
                        if (typeof saveCallback != 'function' || saveCallback === undefined) {
                            return false;
                        } else {
                            saveCallback(true);
                        }
                    } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                        this.props.closeCommonCircularDialog();
                        let payload = {
                            msgCode: data.msgCode,
                            btnActions:
                            {
                                btn1Click: () => {
                                    let mramId = data.data.mramId;
                                    this.props.getMramFieldValueList({
                                        params: {
                                            mramId: mramId
                                        },
                                        callback: () => {
                                            this.setState({ refreshFlag: true });
                                            this.props.closeCommonCircularDialog();
                                        }
                                    });
                                    this.setState({ selectRow: mramId });
                                },
                                btn2Click: () => {
                                    if (typeof saveCallback != 'function' || saveCallback === undefined) {
                                        return false;
                                    } else {
                                        saveCallback(true);
                                    }
                                    this.props.closeCommonCircularDialog();
                                }
                            }
                        };
                        this.props.openCommonMessage(payload);
                    } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE) {
                        this.props.closeCommonCircularDialog();
                        let payload = {
                            msgCode: data.msgCode,
                            btnActions:
                            {
                                btn1Click: () => {
                                    this.reloadDeleteHistory();
                                }
                            }
                        };
                        this.props.openCommonMessage(payload);
                    }
                    this.setState({ editFlag: false });
                    if (typeof saveCallback != 'function' || saveCallback === undefined) {
                        this.insertMramLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`, '/mram/saveAll');
                        return false;
                    } else {
                        saveCallback(true);
                    }
                }
            });
        } else {
            let { loginInfo } = this.props;
            let defaultServiceCd = loginInfo.service.code;
            let defaultClinicCd = loginInfo.clinic.code;
            this.props.saveMramFieldValueList({
                params: {
                    mramId: this.state.selectRow,
                    patientKey: this.state.selectedPatientKey,
                    mramAssessmentStatus: mramAssessmentStatus.inProgress,
                    mramSignedoffDtm: null,
                    mramAssessmentDtm: this.state.dateTime,
                    serviceCd: defaultServiceCd,
                    clinicCd: defaultClinicCd,
                    createdBy: null,
                    createdDtm: null,
                    updatedBy: null,
                    updatedDtm: null,
                    bkgdInfoDto: this.mapToJson(backgroundInformationFieldValMap),
                    measurementDto: this.mapToJson(measurementAndLabTestFieldValMap),
                    eyesAssessmentDto: this.mapToJson(eyesFieldValMap),
                    feetAssessmentDto: this.mapToJson(feetFieldValMap),
                    otherComplicationsDto: this.mapToJson(otherComplicationsFieldValMap),
                    dietAssessmentDto: this.mapToJson(dietAssessmentFieldValMap),
                    riskProfileDto: this.mapToJson(riskProfileFieldValMap),
                    carePlanDto: this.mapToJson(carePlanFieldValMap),
                    version: null,
                    mramSignedoffBy: JSON.parse(sessionStorage.getItem('loginInfo')).loginName || null
                },
                callback: data => {
                    let payload = {
                        msgCode: data.msgCode
                    };
                    if (data.respCode === 0) {
                        payload.showSnackbar = true;
                        if (data.data.mramId !== null) {
                            let mramId = data.data.mramId;
                            this.props.getMramFieldValueList({
                                params: {
                                    mramId: mramId
                                },
                                callback: () => {
                                    this.setState({ refreshFlag: true });
                                    this.props.closeCommonCircularDialog();
                                }
                            });
                            this.setState({
                                selectRow: mramId
                            });
                        }
                        this.props.openCommonMessage(payload);
                        if (typeof saveCallback != 'function' || saveCallback === undefined) {
                            return false;
                        } else {
                            saveCallback(true);
                        }
                    } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                        this.props.closeCommonCircularDialog();
                        let payload = {
                            msgCode: data.msgCode,
                            btnActions:
                            {
                                btn1Click: () => {
                                    let mramId = data.data.mramId;
                                    this.props.getMramFieldValueList({
                                        params: {
                                            mramId: mramId
                                        },
                                        callback: () => {
                                            this.setState({ refreshFlag: true });
                                            this.props.closeCommonCircularDialog();
                                        }
                                    });
                                    this.setState({ selectRow: mramId });
                                },
                                btn2Click: () => {
                                    this.props.closeCommonCircularDialog();
                                    if (typeof saveCallback != 'function' || saveCallback === undefined) {
                                        return false;
                                    } else {
                                        saveCallback(true);
                                    }
                                }
                            }
                        };
                        this.props.openCommonMessage(payload);
                    } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE) {
                        this.props.closeCommonCircularDialog();
                        let payload = {
                            msgCode: data.msgCode,
                            btnActions:
                            {
                                btn1Click: () => {
                                    this.reloadDeleteHistory();
                                }
                            }
                        };
                        this.props.openCommonMessage(payload);
                    }
                    this.setState({ editFlag: false });
                    if (typeof saveCallback != 'function' || saveCallback === undefined) {
                        this.insertMramLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`, '/mram/saveAll');
                        return false;
                    } else {
                        saveCallback(true);
                    }
                }
            });
        }
    };

    handlePromptSave = (mode = 'new', editMramId = null) => {
        const {
            eyesFieldValMap,
            feetFieldValMap,
            dietAssessmentFieldValMap,
            riskProfileFieldValMap,
            backgroundInformationFieldValMap,
            measurementAndLabTestFieldValMap,
            otherComplicationsFieldValMap,
            carePlanFieldValMap
        } = this.state;
        let filedMapList = [
            { moduleName: 'Background Information/ Tx', valMap: backgroundInformationFieldValMap },
            { moduleName: 'Measurement/Lab Test', valMap: measurementAndLabTestFieldValMap },
            { moduleName: 'Eyes', valMap: eyesFieldValMap },
            { moduleName: 'Feet', valMap: feetFieldValMap },
            { moduleName: 'Other Complication(s)', valMap: otherComplicationsFieldValMap },
            { moduleName: 'Diet Assessment', valMap: dietAssessmentFieldValMap },
            { moduleName: 'Risk Profile', valMap: riskProfileFieldValMap },
            { moduleName: 'Care Plan', valMap: carePlanFieldValMap }
        ];
        this.props.openCommonCircularDialog();
        let { flag, targetId } = this.hasIsError(filedMapList);
        if (flag || this.state.dateTimeFlag) {
            this.setState({ refreshFlag: false });
            this.props.closeCommonCircularDialog();
            this.handleClose();
            let payload = {
                msgCode: MRAM_CODE.IS_ILLEGAL_DATA,
                btn1AutoClose: false,
                btnActions: {
                    btn1Click: () => {
                        this.props.closeCommonMessage();
                        _.delay(() => {
                            document.getElementById(targetId).focus();
                        }, 500);
                    }
                }
            };
            this.props.openCommonMessage(payload);
            return false;
        } else {
            if (this.state.dateTime === '') {
                this.props.closeCommonCircularDialog();
                this.handleClose();
                this.props.openCommonMessage({ msgCode: MRAM_CODE.EMPTY_ASSESSMENT_DATE });
                return false;
            } else {
                this.setState({ refreshFlag: false });
            }
        }
        let { mramOriginObj, loginInfo } = this.props;
        let defaultServiceCd = loginInfo.service.code;
        let defaultClinicCd = loginInfo.clinic.code;
        let saveParams = {
            mramId: this.state.selectRow,
            patientKey: this.state.selectedPatientKey,
            mramAssessmentStatus: mramOriginObj !== null ? mramOriginObj.mramAssessmentStatus : mramAssessmentStatus.inProgress,
            mramSignedoffDtm: null,
            mramAssessmentDtm: this.state.dateTime === '' ? new Date() : this.state.dateTime,
            serviceCd: mramOriginObj !== null ? mramOriginObj.serviceCd : defaultServiceCd,
            clinicCd: mramOriginObj !== null ? mramOriginObj.clinicCd : defaultClinicCd,
            createdBy: mramOriginObj !== null ? mramOriginObj.createdBy : null,
            createdDtm: mramOriginObj !== null ? mramOriginObj.createdDtm : null,
            updatedBy: mramOriginObj !== null ? mramOriginObj.updatedBy : null,
            updatedDtm: mramOriginObj !== null ? mramOriginObj.updatedDtm : null,
            bkgdInfoDto: this.mapToJson(backgroundInformationFieldValMap),
            measurementDto: this.mapToJson(measurementAndLabTestFieldValMap),
            eyesAssessmentDto: this.mapToJson(eyesFieldValMap),
            feetAssessmentDto: this.mapToJson(feetFieldValMap),
            otherComplicationsDto: this.mapToJson(otherComplicationsFieldValMap),
            dietAssessmentDto: this.mapToJson(dietAssessmentFieldValMap),
            riskProfileDto: this.mapToJson(riskProfileFieldValMap),
            carePlanDto: this.mapToJson(carePlanFieldValMap),
            version: mramOriginObj !== null ? mramOriginObj.version : null,
            mramSignedoffBy: JSON.parse(sessionStorage.getItem('loginInfo')).loginName || null
        };
        this.props.saveMramFieldValueList({
            params: saveParams,
            callback: data => {
                if (data.respCode === 0) {
                    this.promptSaveRefreshPage(data, mode, editMramId);
                } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                    this.props.closeCommonCircularDialog();
                    let payload = {
                        msgCode: data.msgCode,
                        btnActions:
                        {
                            btn1Click: () => {
                                this.promptSaveRefreshPage(data, mode, editMramId);
                            },
                            btn2Click: () => {
                                this.props.closeCommonCircularDialog();
                            }
                        }
                    };
                    this.props.openCommonMessage(payload);
                } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE) {
                    this.props.closeCommonCircularDialog();
                    let payload = {
                        msgCode: data.msgCode,
                        btnActions:
                        {
                            btn1Click: () => {
                                this.reloadDeleteHistory();
                            }
                        }
                    };
                    this.props.openCommonMessage(payload);
                }
            }
        });
    };

    promptSaveRefreshPage = (data, mode, editMramId) => {
        this.props.openCommonMessage({
            msgCode: data.msgCode,
            showSnackbar: true
        });

        if (mode === 'new') {
            this.props.initMramFieldValueList({
                param: {},
                callback: () => {
                    this.setState({
                        view: false,
                        isNewFlag: true,
                        selectRow: null,
                        dervieType: 0,
                        dateTime: new Date(),
                        originDateTime: null,
                        recordMramAssessmentStatus: mramAssessmentStatus.inProgress,
                        editFlag: false,
                        refreshFlag: true,
                        openHistory: false
                    });
                    this.props.closeCommonCircularDialog();
                }
            });
        } else if (mode === 'edit') {
            if (editMramId !== null) {
                this.props.getMramFieldValueList({
                    params: { mramId: editMramId },
                    callback: mramData => {
                        this.setState({
                            view: false,
                            isNewFlag: false,
                            selectRow: mramData.mramId,
                            dateTime: mramData.mramAssessmentDtm,
                            originDateTime: mramData.mramAssessmentDtm,
                            recordMramAssessmentStatus: mramData.mramAssessmentStatus,
                            editFlag: false,
                            refreshFlag: true,
                            openHistory: false
                        });
                        this.props.closeCommonCircularDialog();
                        // check not sign off & assessment date > 6 month
                        if (mramData.mramAssessmentStatus === mramAssessmentStatus.inProgress && moment(mramData.mramAssessmentDtm).add(6, 'months').isSameOrBefore(moment())) {
                            this.props.openCommonMessage({ msgCode: MRAM_CODE.OVER_6_MONTH_WITHOUT_SIGN_OFF });
                        }
                    }
                });
            }
        }
    }

    strMapToObj = strMap => {
        let obj = Object.create(null);
        obj['mramId'] = this.state.selectRow;
        for (let [k, v] of strMap) {
            obj[k] = v;
        }
        return obj;
    };

    mapToJson = map => {
        return JSON.parse(JSON.stringify(this.strMapToObj(map)));
    };

    handleClickPrint = () => {
        const {
            eyesFieldValMap,
            feetFieldValMap,
            dietAssessmentFieldValMap,
            riskProfileFieldValMap,
            backgroundInformationFieldValMap,
            measurementAndLabTestFieldValMap,
            otherComplicationsFieldValMap,
            carePlanFieldValMap
        } = this.state;
        let filedMapList = [
            eyesFieldValMap,
            feetFieldValMap,
            dietAssessmentFieldValMap,
            riskProfileFieldValMap,
            backgroundInformationFieldValMap,
            measurementAndLabTestFieldValMap,
            otherComplicationsFieldValMap,
            carePlanFieldValMap
        ];
        let operationTypeFlag = false;
        filedMapList.forEach(fileldMap => {
            fileldMap.forEach(valObj => {
                if (valObj.operationType) {
                    operationTypeFlag = true;
                }
            });
        });
        if (operationTypeFlag) {
            let payload = {
                msgCode: MRAM_HISTORY_CODE.IS_MRAM_PRINT
            };
            this.props.openCommonMessage(payload);
        } else {
            this.setState({ openPrint: true });
        }
        this.insertMramLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Print' button`, '');
    };

    handleClickDelete = () => {
        const {
            eyesFieldValMap,
            feetFieldValMap,
            dietAssessmentFieldValMap,
            riskProfileFieldValMap,
            backgroundInformationFieldValMap,
            measurementAndLabTestFieldValMap,
            otherComplicationsFieldValMap,
            carePlanFieldValMap
        } = this.state;
        let params = {
            mramId: this.state.selectRow,
            patientKey: this.state.selectedPatientKey,
            mramAssessmentStatus: this.props.mramOriginObj.mramAssessmentStatus,
            mramAssessmentDtm: this.props.mramOriginObj.mramAssessmentDtm,
            serviceCd: this.props.mramOriginObj.serviceCd,
            createdBy: this.props.mramOriginObj.createdBy,
            createdDtm: this.props.mramOriginObj.createdDtm,
            updatedBy: this.props.mramOriginObj.updatedBy,
            updatedDtm: this.props.mramOriginObj.updatedDtm,
            bkgdInfoDto: this.mapToJson(backgroundInformationFieldValMap),
            measurementDto: this.mapToJson(measurementAndLabTestFieldValMap),
            eyesAssessmentDto: this.mapToJson(eyesFieldValMap),
            feetAssessmentDto: this.mapToJson(feetFieldValMap),
            otherComplicationsDto: this.mapToJson(otherComplicationsFieldValMap),
            dietAssessmentDto: this.mapToJson(dietAssessmentFieldValMap),
            riskProfileDto: this.mapToJson(riskProfileFieldValMap),
            carePlanDto: this.mapToJson(carePlanFieldValMap),
            version: this.props.mramOriginObj.version
        };
        if (params != null) {
            let payload = {
                msgCode: MRAM_HISTORY_CODE.IS_HISTORY_DELETE,
                btnActions: {
                    // derivePara.YES
                    btn1Click: () => {
                        this.deleteSelectedHistoryGroup(); //已有选中行，进入删除方法，进行后台数据交互
                    }
                }
            };
            this.props.openCommonMessage(payload);
        }
        this.insertMramLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Delete' button`, '/mram/deleteMram');
    };

    deleteSelectedHistoryGroup = () => {
        const {
            eyesFieldValMap,
            feetFieldValMap,
            dietAssessmentFieldValMap,
            riskProfileFieldValMap,
            backgroundInformationFieldValMap,
            measurementAndLabTestFieldValMap,
            otherComplicationsFieldValMap,
            carePlanFieldValMap
        } = this.state;
        let params = {
            mramId: this.state.selectRow,
            patientKey: this.state.selectedPatientKey,
            mramAssessmentStatus: this.props.mramOriginObj.mramAssessmentStatus,
            mramAssessmentDtm: this.props.mramOriginObj.mramAssessmentDtm,
            serviceCd: this.props.mramOriginObj.serviceCd,
            createdBy: this.props.mramOriginObj.createdBy,
            createdDtm: this.props.mramOriginObj.createdDtm,
            updatedBy: this.props.mramOriginObj.updatedBy,
            updatedDtm: this.props.mramOriginObj.updatedDtm,
            bkgdInfoDto: this.mapToJson(backgroundInformationFieldValMap),
            measurementDto: this.mapToJson(measurementAndLabTestFieldValMap),
            eyesAssessmentDto: this.mapToJson(eyesFieldValMap),
            feetAssessmentDto: this.mapToJson(feetFieldValMap),
            otherComplicationsDto: this.mapToJson(otherComplicationsFieldValMap),
            dietAssessmentDto: this.mapToJson(dietAssessmentFieldValMap),
            riskProfileDto: this.mapToJson(riskProfileFieldValMap),
            carePlanDto: this.mapToJson(carePlanFieldValMap),
            version: this.props.mramOriginObj.version
        };

        this.props.openCommonCircularDialog();
        this.props.deleteHistoryService({
            params,
            callback: data => {
                if (data.respCode === 0) {
                    this.props.checkMramRecordExisted({
                        params: {
                            patientKey: this.state.selectedPatientKey
                        },
                        callback: existFlag => {
                            this.props.initMramFieldValueList({
                                params: {},
                                callback: () => {
                                    this.props.closeCommonMessage();
                                    this.setState({
                                        selectRow: null,
                                        isNewFlag: true,
                                        dateTime: new Date(),
                                        recordMramAssessmentStatus: mramAssessmentStatus.inProgress,
                                        editFlag: false,
                                        refreshFlag: true,
                                        originDateTime: null
                                    }, () => {
                                        if (existFlag) {
                                            // exist other record
                                            this.handleClickHistory();
                                        } else {
                                            this.props.closeCommonCircularDialog();
                                        }
                                    });
                                }
                            });
                            this.props.openCommonMessage({ msgCode: data.msgCode, showSnackbar: true });
                        }
                    });
                } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                    this.props.closeCommonCircularDialog();
                    let payload = {
                        msgCode: data.msgCode,
                        btnActions:
                        {
                            btn1Click: () => {
                                let mramId = this.state.selectRow;
                                this.props.getMramFieldValueList({
                                    params: {
                                        mramId: mramId
                                    },
                                    callback: () => {
                                        this.setState({ refreshFlag: true });
                                        this.props.closeCommonCircularDialog();
                                    }
                                });
                                this.setState({ selectRow: mramId });
                            },
                            btn2Click: () => {
                                this.props.closeCommonCircularDialog();
                            }
                        }
                    };
                    this.props.openCommonMessage(payload);
                } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE) {
                    this.props.closeCommonCircularDialog();
                    let payload = {
                        msgCode: data.msgCode,
                        btnActions:
                        {
                            btn1Click: () => {
                                this.reloadDeleteHistory();
                            }
                        }
                    };
                    this.props.openCommonMessage(payload);
                }
            }
        });
    };

    handleClickHistory = () => {
        let { selectedPatientKey } = this.state;
        this.props.openCommonCircularDialog();
        this.props.requestHistoryService({
            params: { patientKey: selectedPatientKey },
            callback: (recordList) => {
                this.props.closeCommonCircularDialog();
                this.setState({
                    recordList: recordList.data,
                    openHistory: true
                });
            }
        });
        this.insertMramLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'History' button`, '/mram/loadMramData');
    };

    resetMramData = () => {
        this.props.openCommonCircularDialog();
        this.props.initMramFieldValueList({
            params: {},
            callback: () => {
                let currentDate = new Date();
                this.props.checkDuplicatedMramRecordOnSameDay({
                    params: {
                        currentDate: moment(currentDate).format('YYYY-MM-DD'),
                        currentMramId: -1, // new:-1
                        patientKey: this.state.selectedPatientKey
                    },
                    callback: recordIds => {
                        if (recordIds.length > 0) {
                            this.props.closeCommonCircularDialog();
                            this.props.openCommonMessage({
                                msgCode: MRAM_CODE.DUPLICATED_ASSESSMENT_DATE_RECORD_BY_NEW,
                                params: [{ name: 'assessmentDate', value: moment(currentDate).format('DD-MMM-YYYY') }],
                                btnActions: {
                                    btn1Click: () => {
                                        this.setState({
                                            selectRow: null,
                                            isNewFlag: true,
                                            dateTime: '',
                                            recordMramAssessmentStatus: mramAssessmentStatus.inProgress,
                                            editFlag: false,
                                            refreshFlag: true,
                                            originDateTime: null
                                        });
                                    }
                                }
                            });
                        } else {
                            this.setState({
                                selectRow: null,
                                isNewFlag: true,
                                dateTime: new Date(),
                                recordMramAssessmentStatus: mramAssessmentStatus.inProgress,
                                editFlag: false,
                                refreshFlag: true,
                                originDateTime: null
                            }, () => {
                                this.props.closeCommonCircularDialog();
                            });
                        }
                    }
                });
            }
        });
    }

    handleClickNew = () => {
        let { editFlag, selectedPatientKey } = this.state;
        this.props.openCommonCircularDialog();
        this.props.checkMramRecordCreatedWithin6Months({
            params: { patientKey: selectedPatientKey },
            callback: recordIds => {
                this.props.closeCommonCircularDialog();
                if (editFlag) {
                    this.props.openCommonMessage({
                        msgCode: MRAM_CODE.DISCARD_CHANGE_COMFIRM,
                        btn1AutoClose: false,
                        btn2AutoClose: false,
                        btnActions: {
                            btn1Click: () => {
                                this.props.closeCommonMessage();
                                if (recordIds.length > 0) {
                                    this.props.openCommonMessage({
                                        msgCode: MRAM_CODE.ANOTHER_RECORD_WITHIN_6_MONTHS_FOUND,
                                        btn1AutoClose: false,
                                        btnActions: {
                                            btn1Click: () => {
                                                this.props.closeCommonMessage();
                                                this.handlePromptSave('new');
                                            }
                                        }
                                    });
                                } else {
                                    this.handlePromptSave('new');
                                }
                            },
                            btn2Click: () => {
                                this.props.closeCommonMessage();
                                if (recordIds.length > 0) {
                                    this.props.openCommonMessage({
                                        msgCode: MRAM_CODE.ANOTHER_RECORD_WITHIN_6_MONTHS_FOUND,
                                        btn1AutoClose: false,
                                        btnActions: {
                                            btn1Click: () => {
                                                this.props.closeCommonMessage();
                                                this.resetMramData();
                                            }
                                        }
                                    });
                                } else {
                                    this.resetMramData();
                                }
                            }
                        }
                    });
                } else {
                    if (recordIds.length > 0) {
                        this.props.openCommonMessage({
                            msgCode: MRAM_CODE.ANOTHER_RECORD_WITHIN_6_MONTHS_FOUND,
                            btn1AutoClose: false,
                            btnActions: {
                                btn1Click: () => {
                                    this.props.closeCommonMessage();
                                    this.resetMramData();
                                }
                            }
                        });
                    } else {
                        this.resetMramData();
                    }
                }
            }
        });
        this.insertMramLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'New' button`, '');
    };

    handleClose = () => {
        this.setState({
            openHistory: false,
            openPrint: false
        });
    };

    // getBackgroundInfoObj =(paramsObj) =>{
    //   this.setState({
    //     saveChecke: false
    //   });
    //   let params = { params: paramsObj };
    //   this.props.saveDraftBackgroundInfo(params);
    // }

    getCarePlanObj = paramsObj => {
        this.setState({
            saveCarePlanChekck: false
        });
        const params = { params: paramsObj };
        this.props.saveDraftCarePlanInfo(params);
    };

    generateIcon = name => {
        let itemIcon = null;
        switch (name) {
            case 'Background Information/ Tx':
                itemIcon = <Info />;
                break;
            case 'Measurement/Lab Test':
                itemIcon = <Today />;
                break;
            case 'Eyes':
                itemIcon = <RemoveRedEye />;
                break;
            case 'Feet':
                itemIcon = <AirlineSeatLegroomExtra />;
                break;
            case 'Other Complication(s)':
                itemIcon = <DeviceHub />;
                break;
            case 'Diet Assessment':
                itemIcon = <Assessment />;
                break;
            case 'Risk Profile':
                itemIcon = <ReportProblem />;
                break;
            case 'Care Plan':
                itemIcon = <Alarm />;
                break;
            default:
                break;
        }
        return itemIcon;
    };

    changeDateTime = e => {
        let { patientPanelInfo } = this.props;
        if (moment(e).format('DD-MMM-YYYY') === 'Invalid date') {
            if (e !== null) {
                this.setState({ dateTimeFlag: true });
            } else {
                this.setState({ dateTimeFlag: false });
            }
        } else {
            this.setState({ dateTimeFlag: false });
        }
        let flag = commonUtilities.isToDateBefore(patientPanelInfo.dob, moment(e).format('YYYY-MM-DD'));
        if (flag) {
            this.props.openCommonMessage({
                msgCode: MRAM_CODE.METABOLIC_RISK_ASSESSMENT_DATE_ILLEGAL,
                btnActions: {
                    btn1Click: () => {
                        this.setState({ dateTime: new Date() });
                    }
                }
            });
        } else {
            this.setState({ dateTime: e !== null ? e : '' });
        }
    };

    handleDateBlur = e => {
        let momentObj = moment(e.target.value, 'DD-MM-YYYY');
        let timestamp = momentObj.valueOf();
        if (!_.isNaN(timestamp) && timestamp > 0) {
            this.handleAssessmentDateAccepet(momentObj);
        }
    }

    handleAssessmentDateAccepet = d => {
        if (!moment(d).isSameOrBefore(moment(), 'day')) {
            this.props.openCommonMessage({
                msgCode: MRAM_CODE.ASSESSMENT_DATE_NOT_ALLOW_FUTURE_DATE,
                btnActions:{
                    btn1Click: () => {
                        let { selectRow } = this.state;
                        if (selectRow) {
                            this.setState({ dateTime: this.state.originDateTime });
                        } else {
                            this.setState({ dateTime: new Date() });
                        }
                    }
                }
            });
        } else {
            this.props.openCommonCircularDialog();
            this.props.checkDuplicatedMramRecordOnSameDay({
                params:{
                    currentDate: moment(d).format('YYYY-MM-DD'),
                    patientKey: this.state.selectedPatientKey,
                    currentMramId: this.state.selectRow?this.state.selectRow:-1 // new:-1
                },
                callback:redordIds=>{
                    this.props.closeCommonCircularDialog();
                    if (redordIds.length>0) {
                        this.props.openCommonMessage({
                            msgCode: MRAM_CODE.DUPLICATED_ASSESSMENT_DATE_RECORD_BY_CHANGE,
                            params: [ { name: 'assessmentDate', value: moment(d).format('DD-MMM-YYYY') } ],
                            btn2AutoClose:false,
                            btnActions:{
                                btn1Click:()=>{
                                    // YES
                                    this.props.openCommonCircularDialog();
                                    let mramId = _.head(redordIds);
                                    this.props.getMramFieldValueList({
                                        params: { mramId },
                                        callback: mramData => {
                                            this.setState({
                                                view:false,
                                                isNewFlag:false,
                                                selectRow:mramData.mramId,
                                                dateTime:mramData.mramAssessmentDtm,
                                                originDateTime: mramData.mramAssessmentDtm,
                                                recordMramAssessmentStatus:mramData.mramAssessmentStatus,
                                                editFlag: false,
                                                refreshFlag: true,
                                                openHistory: false
                                            });
                                            this.props.closeCommonCircularDialog();
                                            // check not sign off & assessment date > 6 month
                                            if (mramData.mramAssessmentStatus === mramAssessmentStatus.inProgress && moment(mramData.mramAssessmentDtm).add(6, 'months').isSameOrBefore(moment())) {
                                                this.props.openCommonMessage({ msgCode: MRAM_CODE.OVER_6_MONTH_WITHOUT_SIGN_OFF });
                                            }
                                        }
                                    });
                                },
                                btn2Click:()=>{
                                    // NO
                                    this.props.closeCommonMessage();
                                    this.setState({ dateTime: '' }, () => {
                                        _.delay(()=>{
                                            document.getElementById('mram_risk_assessment_date').parentNode.click();
                                        },300);
                                    });
                                }
                              }
                        });
                    }
                }
            });
        }
    }

    closePreviewDialog = () => {
        this.insertMramLog(`[${this.state.previewTitle} Preview Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Close' button`, '');
        this.setState({ previewShow: false });
    };

    getPreviewReportData = (type, mramId, refreshMramHistoryData) => {
        this.props.openCommonCircularDialog();
        if (type === 'Metabolic Risk Assessment Patient Summary') {
            let params = {
                mramId: this.state.selectRow,
                patientDto: commonUtils.generatePatientDto()
            };
            this.props.previewReportPatient({
                params,
                callback: previewData => {
                    this.setState({
                        previewData: previewData,
                        previewShow: true,
                        previewTitle: type
                    });
                }
            });
        } else if (type === 'Metabolic Risk Assessment Report') {
            let params = {
                mramId: mramId === '' ? this.state.selectRow : mramId,
                patientDto: commonUtils.generatePatientDto()
            };
            this.props.previewReportDoctor({
                params,
                callback: previewData => {
                    if (previewData.msgCode) {
                        let payload = {
                            msgCode: previewData.msgCode,
                            btnActions:
                            {
                                btn1Click: () => {
                                    refreshMramHistoryData && refreshMramHistoryData();
                                }
                            }
                        };
                        this.props.openCommonMessage(payload);
                    } else {
                        this.setState({
                            previewData: previewData,
                            previewShow: true,
                            previewTitle: type
                        });
                    }
                }
            });
        } else {
            this.props.closeCommonCircularDialog();
        }
    };

    print = () => {
        this.props.openCommonCircularDialog();
        this.insertMramLog(`[${this.state.previewTitle} Preview Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Print' button`, '');
        this.props.josPrint({
            base64: this.state.previewData,
            callback: result => {
                if (result) {
                    let payload = {
                        msgCode: '101317',
                        showSnackbar: true,
                        params: [
                            { name: 'reportType', value: 'report' }
                        ]
                    };
                    this.props.openCommonMessage(payload);
                }
                else {
                    let payload = {
                        msgCode: '101318',
                        params: [
                            { name: 'reportTypeTitle', value: 'Report' },
                            { name: 'reportType', value: 'report' }
                        ]
                    };
                    this.props.openCommonMessage(payload);
                }
                this.props.closeCommonCircularDialog();
            }
        });
    };

    handleRender = () => {
        const { classes, patientPanelInfo } = this.props;
        let {
            selectedModule,
            eyesFieldValMap,
            feetFieldValMap,
            measurementAndLabTestFieldValMap,
            otherComplicationsFieldValMap,
            backgroundInformationFieldValMap,
            dietAssessmentFieldValMap,
            riskProfileFieldValMap,
            carePlanFieldValMap,
            selectedGenderCd,
            displayAlbuminuriaDL,
            dervieType
        } = this.state;
        let commonProps = {
            updateState: this.updateState,
            view: this.state.view,
            height:this.state.contentHeight
        };
        let eyesProp = {
            eyesFieldValMap,
            ...commonProps
        };
        let feetProp = {
            feetFieldValMap,
            patientInfo:patientPanelInfo,
            ...commonProps
        };
        let measurementAndLabTestProp = {
            riskProfileFieldValMap,
            measurementAndLabTestFieldValMap,
            selectedGenderCd,
            displayAlbuminuriaDL,
            dervieType,
            updateStateWithoutRiskProfile:this.updateStateWithoutRiskProfile,
            ...commonProps
        };
        let otherComplicationsProp = {
            otherComplicationsFieldValMap,
            selectedGenderCd,
            ...commonProps
        };

        let backgroundInformationProp = {
            backgroundInformationFieldValMap,
            id: 'backgroundImformation',
            patientInfo:patientPanelInfo,
            ...commonProps
        };

        let dietAssessmentProp = {
            dietAssessmentFieldValMap,
            ...commonProps
        };

        let riskProfileProp = {
            riskProfileFieldValMap: riskProfileFieldValMap,
            updateRisk: this.state.updateRisk,
            ...commonProps
        };

        let carePlanProp = {
            carePlanFieldValMap,
            ...commonProps
        };
        return (
            <div className={classes.moduleWrapper}>
                <div style={{display:selectedModule === 'Background Information/ Tx' ? 'block' : 'none'}}>
                    <BackgroundInformation {...backgroundInformationProp} />
                </div>
                <div
                    style={{
                        display:
                            selectedModule === 'Measurement/Lab Test' ? 'block' : 'none'
                    }}
                >
                    <MeasurementAndLabTest {...measurementAndLabTestProp} />
                </div>
                <div style={{ display: selectedModule === 'Eyes' ? 'block' : 'none' }}>
                    <Eyes {...eyesProp} />
                </div>
                <div style={{ display: selectedModule === 'Feet' ? 'block' : 'none' }}>
                    <Feet {...feetProp} />
                </div>
                <div
                    style={{
                        display:
                            selectedModule === 'Other Complication(s)' ? 'block' : 'none'
                    }}
                >
                    <OtherComplications {...otherComplicationsProp} />
                </div>
                <div
                    style={{
                        display: selectedModule === 'Diet Assessment' ? 'block' : 'none'
                    }}
                >
                    <DietAssessment {...dietAssessmentProp} />
                </div>
                <div
                    style={{
                        display: selectedModule === 'Risk Profile' ? 'block' : 'none'
                    }}
                >
                    <RiskProfile {...riskProfileProp} />
                </div>
                <div
                    style={{ display: selectedModule === 'Care Plan' ? 'block' : 'none' }}
                >
                    <CarePlan {...carePlanProp} />
                </div>
            </div>
        );
    };

    handleFunctionClose = (modeFlag = false) => {
        let { editFlag } = this.state;
        if (editFlag) {
            let payload = {
                msgCode: MRAM_CODE.CLOSE_COMFIRM,
                btnActions: {
                    btn1Click: () => {
                        this.props.deleteSubTabs(accessRightEnum.mramAssessmentInput);
                    }
                }
            };
            if (modeFlag) {
                payload.btnActions.btn2Click = () => {
                    this.setState({
                        openHistory: false
                    });
                };
            }
            this.props.openCommonMessage(payload);
        } else {
            this.props.deleteSubTabs(accessRightEnum.mramAssessmentInput);
        }
    };

    insertMramLog = (desc, apiName = '', content = '') => {
        commonUtils.commonInsertLog(apiName, 'F114', 'MRAM', desc, 'mram', content);
    };
    handleCancelLog = (name, apiName = '') => {
        this.insertMramLog(name, apiName);
    }

    refreshPageData = (mramId) => {
        this.props.getMramFieldValueList({
            params: {
                mramId: mramId
            },
            callback: recordData => {
                this.setState({
                    selectRow: mramId,
                    refreshFlag: true,
                    recordMramAssessmentStatus: recordData.mramAssessmentStatus
                }, () => {
                    this.props.closeCommonCircularDialog();
                });
            }
        });
    }

    reloadDeleteHistory = () => {
        this.props.checkMramRecordExisted({
            params: {
                patientKey: this.state.selectedPatientKey
            },
            callback: existFlag => {
                this.props.initMramFieldValueList({
                    params: {},
                    callback: () => {
                        this.props.closeCommonMessage();
                        this.setState({
                            selectRow: null,
                            isNewFlag: true,
                            dateTime: new Date(),
                            recordMramAssessmentStatus: mramAssessmentStatus.inProgress,
                            editFlag: false,
                            refreshFlag: true,
                            originDateTime: null
                        }, () => {
                            if (existFlag) {
                                // exist other record
                                this.handleClickHistory();
                            } else {
                                this.props.closeCommonCircularDialog();
                            }
                        });
                    }
                });
            }
        });
    }

    render() {
        const { classes,patientPanelInfo} = this.props;
        let { dateTime } = this.state;
        let {
            open,
            openHistory,
            moduleNameList,
            selectedModule,
            selectedPatientKey,
            deleteId,
            openPrint,
            editFlag,
            selectRow,
            isNewFlag,
            recordList
        } = this.state;
        let MRAMHistoryDialogParams = {
            isNewFlag,
            selectRow,
            editFlag,
            openHistory,
            recordList,
            handleClose: this.handleClose,
            updateState: this.updateStateInDialog,
            deleteID: deleteId,
            patientKey: selectedPatientKey,
            handleFunctionClose: this.handleFunctionClose,
            getPreviewReportData: this.getPreviewReportData,
            handlePromptSave: this.handlePromptSave,
            insertMramLog:this.insertMramLog
        };
        let MRAMPrintDialogParams = {
            openPrint: openPrint,
            handleClose: this.handleClose,
            updateState: this.updateStateInDialog,
            getPreviewReportData: this.getPreviewReportData,
            insertMramLog:this.insertMramLog
        };
        const buttonBar = {
            isEdit: this.state.editFlag,
            title:'MRAM',
            logSaveApi:'/mram/saveAll',
            saveFuntion:this.handleCancleSave,
            handleCancelLog:this.handleCancelLog,
            autoCloseBtn1:false,
            // height:'64px',
            // position:'fixed',
            buttons: [
                {
                    title: 'Delete',
                    onClick: this.handleClickDelete,
                    id:'delete_button',
                    disabled:this.state.selectRow !== null ? false : true
                },
                {
                    title: 'Print',
                    onClick: this.handleClickPrint,
                    id:'print_button',
                    disabled:this.state.selectRow !== null ? false : true
                },
                {
                    title: 'Save Draft',
                    onClick: () => this.handleSaveAll('1'),
                    id:'saveDraft_button',
                    disabled: this.state.recordMramAssessmentStatus === mramAssessmentStatus.signedOff ? true : false
                },
                {
                    title: 'Save & Sign Off',
                    onClick: () => this.handleSaveAll('2'),
                    id:'save&SignOff_button'
                }
            ]
        };
        return (
            <MuiThemeProvider theme={theme}>
                <div ref={this.container} style={{height:'100%'}}>
                    <Card>
                        <CardContent
                            className={classes.cardContent}
                        >
                            <div style={{ position: 'relative', clear: 'both' }}>
                                <AppBar
                                    className={classNames(classes.appBar, {
                                        [classes.appBarShift]: open
                                    })}
                                    position="relative"
                                >
                                    <Toolbar disableGutters={!open}>
                                        <IconButton
                                            aria-label="Open drawer"
                                            className={classNames(classes.menuButton, {
                                                [classes.hide]: open
                                            })}
                                            color="inherit"
                                            onClick={this.handleDrawerOpen}
                                        >
                                            <Menu />
                                        </IconButton>
                                        <Typography variant="h6" color="inherit" noWrap className={classes.title}>
                                            Metabolic Risk Assessment Module
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                                <Drawer
                                    id="divDrawer"
                                    classes={{
                                        root: classes.drawerRoot,
                                        paper: classNames(classes.drawerPaperRoot, {
                                            [classes.drawerOpen]: open,
                                            [classes.drawerClose]: !open
                                        })
                                    }}
                                    className={classNames(classes.drawer, {
                                        [classes.drawerOpen]: open,
                                        [classes.drawerClose]: !open
                                    })}
                                    open={open}
                                    variant="permanent"
                                >
                                    <div className={classes.toolbar}>
                                        <IconButton onClick={this.handleDrawerClose}>
                                            <ChevronLeft />
                                        </IconButton>
                                    </div>
                                    <Divider />
                                    <List className={classes.listRoot}>
                                        {moduleNameList.map(name => {
                                            let itemIcon = this.generateIcon(name);
                                            return (
                                                <Tooltip
                                                    key={name}
                                                    title={name}
                                                    classes={{
                                                        tooltip: classes.tooltip
                                                    }}
                                                >
                                                    <ListItem
                                                        button
                                                        onClick={() => {
                                                            this.handleDrawerClick(name);
                                                        }}
                                                        className={classNames({
                                                            [classes.selectedItem]: name === selectedModule
                                                        })}
                                                    >
                                                        <ListItemIcon
                                                            className={classNames({
                                                                [classes.marginRightNone]: open
                                                            })}
                                                        >
                                                            {itemIcon}
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={<Typography noWrap>{name}</Typography>}
                                                        />
                                                    </ListItem>
                                                </Tooltip>
                                            );
                                        })}
                                    </List>
                                </Drawer>
                                <div
                                    style={{height:this.state.contentWrapperHight,boxSizing:'border-box'}}
                                    ref={this.contentWrapper}
                                    className={classNames(classes.content, {
                                        [classes.contentOpen]: open
                                    })}
                                >
                                    <div id="timeWrapper" ref={this.timeWrapper} className={classes.timeWrapper}>
                                        <ValidatorForm onSubmit={() => { }}>
                                            <Grid
                                                alignItems="center"
                                                container
                                                direction="row"
                                                justify="space-between"
                                            >
                                                <div className={classes.timeGroupDiv}>
                                                    <label className={classes.timeTitle}>
                                                        {'Metabolic Risk Assessment Date '}
                                                        <span className={classes.timeSpan}>*</span>
                                                    </label>
                                                    <div style={{ float: 'left' }}>
                                                        <DatePicker
                                                            inputVariant="outlined"
                                                            InputProps={{
                                                                classes: { input: classes.input },
                                                                id: 'mram_risk_assessment_date'
                                                            }}
                                                            value={
                                                                dateTime !== '' && dateTime !== null
                                                                    ? moment(dateTime).format('DD-MMM-YYYY')
                                                                    : null
                                                            }
                                                            onAccept={this.handleAssessmentDateAccepet}
                                                            onChange={this.changeDateTime}
                                                            handleBlur={this.handleDateBlur}
                                                            format={Enum.DATE_FORMAT_EDMY_VALUE}
                                                            placeholder={moment(new Date()).format('DD-MM-YYYY')}
                                                            minDate={new Date(MIN_DATE)}
                                                            maxDate={new Date(MAX_DATE)}
                                                        />
                                                    </div>
                                                    <label className={classes.timeRemark}>
                                                        <span className={classes.timeRemarkSpan}>R: </span>
                                                        Data for risk profile calculation
                                                    </label>
                                                </div>
                                                <div>
                                                    <CIMSButton
                                                        classes={{root: classes.btnRoot}}
                                                        onClick={this.handleClickHistory}
                                                        id="btn_mram_history"
                                                    >
                                                        History
                                                    </CIMSButton>
                                                    <CIMSButton
                                                        classes={{root: classes.btnRoot}}
                                                        disabled={this.state.selectRow !== null ? false : true}
                                                        onClick={this.handleClickNew}
                                                        id="btn_mram_new"
                                                    >
                                                        New
                                                    </CIMSButton>
                                                    <PreviewPdfDialog
                                                        open
                                                        id={'previewPdfDialog'}
                                                        previewTitle={this.state.previewTitle}
                                                        previewShow={this.state.previewShow}
                                                        previewData={this.state.previewData}
                                                        closePreviewDialog={this.closePreviewDialog}
                                                        //print={this.props.print}
                                                        print={this.print}
                                                    />
                                                    <MRAMHistoryDialog {...MRAMHistoryDialogParams} />
                                                </div>
                                            </Grid>
                                        </ValidatorForm>
                                    </div>
                                    <div style={{height:this.state.contentHeight}} className={classes.contentWrapper}>
                                        {this.handleRender()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* button group */}
                    <Typography
                        className={classes.bottomGroup}
                        component="div"
                        variant="body2"
                    >
                        <Grid
                            alignItems="center"
                            classes={{
                                container: classes.bottomGropContainer
                            }}
                            container
                            direction="row"
                            justify="space-between"
                            spacing={2}
                        >
                            <MRAMPrintDialog {...MRAMPrintDialogParams} />
                            <Container
                                buttonBar={buttonBar}
                                alignItems="center"
                                container
                                direction="row"
                                item
                                justify="flex-end"
                                xs={11}
                            />
                        </Grid>
                    </Typography>
                </div>
            </MuiThemeProvider>
        );
    }
}

const mapStateToProps = state => {
    return {
        encounterData: state.patient.encounterInfo,
        patientPanelInfo: state.patient.patientInfo,
        saveDraftBackgroundInfo: state.backgroundInformation.data,
        eyesFieldValMap: state.eyes.eyesFieldValMap,
        feetFieldValMap: state.feet.feetFieldValMap,
        measurementAndLabTestFieldValMap:
            state.measurementAndLabTest.measurementAndLabTestFieldValMap,
        otherComplicationsFieldValMap:
            state.otherComplications.otherComplicationsFieldValMap,
        loginInfo: {
            ...state.login.loginInfo,
            service: {
                code: state.login.service.serviceCd
            },
            clinic: {
                code: state.login.clinic.clinicCd
            }
        },
        backgroundInformationFieldValMap:
            state.backgroundInformation.backgroundInformationFieldValMap,
        mramOriginObj: state.mram.mramOriginObj,
        carePlanFieldValMap: state.carePlan.carePlanFieldValMap,
        dietAssessmentFieldValMap: state.dietAssessment.dietAssessmentFieldValMap,
        riskProfileFieldValMap: state.riskProfile.riskProfileFieldValMap
    };
};

const mapDispatchToProps = {
    saveDraftBackgroundInfo,
    getMramFieldValueList,
    initMramFieldValueList,
    openCommonCircularDialog,
    closeCommonCircularDialog,
    openCommonMessage,
    closeCommonMessage,
    saveMramFieldValueList,
    deleteHistoryService,
    deleteSubTabs,
    previewReportPatient,
    josPrint,
    previewReportDoctor,
    updateCurTab,
    checkDuplicatedMramRecordOnSameDay,
    checkMramRecordCreatedWithin6Months,
    checkMramRecordExisted,
    requestHistoryService
};

export default connect( mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(MRAM));
