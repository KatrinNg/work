import React from 'react';
import { connect } from 'react-redux';
import {
    Typography
} from '@material-ui/core';
import {
    doLogin,
    searchDrug,
    searchItemCollapse
} from '../../store/actions/moe/moeAction';
import MoePatientPanel from '../moe/compontent/moePatientPanel';
import MoePresciption from './compontent/moePrescription';
import moment from 'moment';
import { codeList } from '../../constants/codeList';
import * as moeUtilities from '../../utilities/moe/moeUtilities';
import * as commonUtilities from '../../utilities/commonUtilities';
import RemarkDialog from './compontent/editRemark/remarkDialog';
import {
    saveDrug,
    resetDrugList,
    cancelOrder,
    updateField
} from '../../store/actions/moe/moeAction';
import { updateCurTab } from '../../store/actions/mainFrame/mainFrameAction';
// import CommonCircular from '../compontent/commonProgress/commonCircular';
// import CIMSAlertDialog from '../../components/Dialog/CIMSAlertDialog';
// import questionIcon from '../../images/moe/icon-question.gif';
// import CIMSMessageDialog from '../../components/Dialog/CIMSMessageDialog';
import Enum from '../../enums/enum';
import { MOE_MSG_CODE } from '../../constants/message/moe/commonRespMsgCodeMapping';
import {
    openCommonMessage
} from '../../store/actions/message/messageAction';
import {
    closeCleanMask
} from '../../store/actions/common/commonAction';

function getMoePatientInfo(loginInfo, patientPanelInfo) {
    let info = null;
    console.log('davidtest loginInfo', loginInfo);
    if (loginInfo != null && patientPanelInfo != null) {
        info =
        {
            'appName': 'CIMS',
            // 'apptDate': moment(patientPanelInfo.encounterDateTime, 'DD-MMM-YYYY').format('YYYY-MM-DD'),
            'apptDate': moment(patientPanelInfo.encounterDateTime, Enum.DATE_FORMAT_EDMY_VALUE).format(Enum.DATE_FORMAT_EYMD_VALUE),
            'apptHospitalCd': patientPanelInfo.clinic,
            'apptSpec': patientPanelInfo.spec,
            'user': {
                'actionCd': '',
                'admDtm': '',
                'age': `${patientPanelInfo.age} ${patientPanelInfo.ageUnit}`,
                'attDrName': '',
                'bedNum': '',
                'chiName': patientPanelInfo.nameChi,
                'classNum': '',
                'conDrName': '',
                'detailsCd': '',
                'disDtm': '',
                'dob': patientPanelInfo.dob,
                'docNum': '',
                'docTypeCd': patientPanelInfo.docTypeCd,
                'dod': patientPanelInfo.deadInd,
                'ehrNum': '',
                'enableHtmlPrinting': '',
                'engGivenName': patientPanelInfo.engGivename,
                'engSurName': patientPanelInfo.engSurname,
                'genderCd': patientPanelInfo.genderCd,
                'hkid': patientPanelInfo.hkid,
                'homePhone': '',
                'hospitalCd': patientPanelInfo ? patientPanelInfo.clinic : null,
                'hospitalName': '',
                'loginId': loginInfo.loginName,
                'loginName': loginInfo.loginName,
                'maritalCd': '',
                'mobilePhone': '',
                'mrnDisplayLabelE': '',
                'mrnDisplayLabelP': '',
                'mrnDisplayTypeCd': '',
                'mrnPatientEncounterNum': patientPanelInfo.encounterId,
                'mrnPatientIdentity': patientPanelInfo.patientKey,
                'nationCd': '',
                'officePhone': '',
                'orderNum': 0,
                'otherName': '',
                'otherPhone': '',
                'patientStatus': '',
                'patientStatusLabel': '',
                'patientTypeCd': patientPanelInfo.patientTypeCd,
                'photoContent': '',
                'photoContentType': '',
                'prescTypeCd': patientPanelInfo.prescTypeCd,
                'religionCd': '',
                'residentialAddress': '',
                'sourceSystem': '',
                'spec': patientPanelInfo ? patientPanelInfo.spec : null,
                'systemLogin': 'MOE',
                'userRankCd': '',
                'userRankDesc': '',
                'ward': ''
            },
            'version': '1.0.1'
        };
    }

    return info;
}

class Moe extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchParentField: [
                { name: 'name', style: { fontWeight: 'bold' } },
                { name: 'dosage' },
                { name: 'PRNRoute' },
                { name: 'for' },
                { name: 'qty' },
                { name: 'children' }],
            showRemarkDialog: true,
            remarkValue: ''
        };
        this.moeLogin();
    }

    componentDidMount(){
        this.props.updateCurTab('F200', this.doClose);
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.isCims && nextProps.patient.patientKey !== this.props.patient.patientKey) {
            let moePatient = getMoePatientInfo(this.props.cimsLoginInfo, nextProps.patient);
            const moeCodeList = { 'codeType': [codeList.freq_code, codeList.route, codeList.duration_unit, codeList.base_unit, codeList.action_status, codeList.site, codeList.regimen_type] };
            const moeHospSetting = { 'hospcode': moePatient.user.hospitalCd, 'userSpecialty': moePatient.user.spec };
            const params = { moePatient: moePatient, moeCodeList: moeCodeList, moeHospSetting: moeHospSetting };
            this.props.doLogin(params);
        }
        return true;
    }

    componentWillUnmount() {
        if (this.props.openIndexMoe) {
            return;
        }
        this.moeLogout();
    }

    moePresciptionOnRef = (ref) => {
        this.moePresciption = ref;
    }

    doClose = (callback) => {
        let isDirty = () => {
            const {moeOriginData, orderData} = this.props;
            const latestOrderJson = orderData;
            const origalOrderJson = moeOriginData;
            return (origalOrderJson !== null || latestOrderJson !== null) && commonUtilities.isDirty(origalOrderJson, latestOrderJson);
        };

        if (isDirty()) {
            let spaCallback = (isClose) => {
                this.props.closeCleanMask();
                callback(isClose);
            };
            this.props.openCommonMessage({
                msgCode: '110033',
                btnActions: {
                    btn1Click: () => {
                        this.moePresciption.saveClick(spaCallback);
                    },
                    btn2Click: () => {
                        callback(true);
                    }

                }
            });
        }
        else {
            callback(true);
        }
    }

    moeLogin = () => {
        if (!this.props.isCims) {
            // let moePatient = this.getQueryVariables();
            // if (moePatient.dob !== null && moePatient.dob !== '') moePatient.dob = moment(moePatient.dob).format('YYYY-MM-DD');
            // if (moePatient.dod !== null && moePatient.dod !== '') moePatient.dod = moment(moePatient.dod).format('YYYY-MM-DD');
            // //01-Jan-2012+09:30:00
            // if (moePatient.admDtm !== null && moePatient.admDtm !== '') {
            //     let dayTime = moePatient.admDtm.split('+');
            //     moePatient.admDtm = moment(dayTime[0]).format('YYYY-MM-DD') + ' ' + dayTime[1];
            // }
            // moePatient = {
            //     'appName': 'string',
            //     'user': moePatient,
            //     'version': 'string'
            // }
            let moePatient = this.props.moePatient;
            const moeCodeList = { 'codeType': [codeList.freq_code, codeList.route, codeList.duration_unit, codeList.base_unit, codeList.action_status, codeList.site, codeList.regimen_type, codeList.duration_unit_map, codeList.system_setting, codeList.form_route_map] };
            const moeHospSetting = { 'hospcode': moePatient.user.hospitalCd, 'userSpecialty': moePatient.user.spec };
            const params = { moePatient: moePatient, moeCodeList: moeCodeList, moeHospSetting: moeHospSetting };
            this.props.doLogin(params);
        }
        else {
            let moePatient = getMoePatientInfo(this.props.cimsLoginInfo, this.props.patient);
            const moeCodeList = { 'codeType': [codeList.freq_code, codeList.route, codeList.duration_unit, codeList.base_unit, codeList.action_status, codeList.site, codeList.regimen_type, codeList.duration_unit_map, codeList.system_setting, codeList.form_route_map] };
            const moeHospSetting = { 'hospcode': moePatient.user.hospitalCd, 'userSpecialty': moePatient.user.spec };
            const params = { moePatient: moePatient, moeCodeList: moeCodeList, moeHospSetting: moeHospSetting };
            this.props.doLogin(params);
        }
    }

    moeLogout = () => {
        let callback = () => {
            window.sessionStorage.removeItem('moeIfLogin');
            window.sessionStorage.removeItem('moeLoginName');
            window.sessionStorage.removeItem('moeLoginTime');
            window.sessionStorage.removeItem('moeLoginInfo');
            window.sessionStorage.removeItem('moeToken');
            window.sessionStorage.removeItem('reloginParams');
            window.sessionStorage.removeItem('moeActionCd');
            window.sessionStorage.removeItem('moeHospSetting');
            this.props.resetDrugList();
        };
        this.props.logout(callback);
    }

    // getQueryVariables = () => {
    //     let result = {};
    //     let querys1 = window.location.href.split('?');
    //     let query1 = querys1.length > 1 ? querys1[1] : querys1[0];
    //     let querys2 = query1.split('#');
    //     let query2 = querys2[0];
    //     let vars = query2.split('&');
    //     for (let i = 0; i < vars.length; i++) {
    //         let pair = vars[i].split('=');
    //         result[pair[0]] = decodeURIComponent(pair[1]);
    //     }
    //     return result;
    // }

    searchDrug = value => {
        const params = { searchString: value };
        this.props.searchDrug(params);
    }
    searchItemCollapse = (item) => {
        this.props.searchItemCollapse(item);
    }
    handleSaveOrderRemark = () => {
        this.props.saveDrug(this.props.codeList, [], this.props.loginInfo && this.props.loginInfo.user, this.props.loginInfo && this.props.loginInfo.user, false, false, false, this.state.remarkValue);
        this.setState({ showRemarkDialog: false });
    }
    handleSetRemarkValue = (name, value) => {
        this.setState({ [name]: value });
    }
    cancelClick = () => {
        this.setState({ showRemarkDialog: false });
        this.moeLogout();
    }
    // handleRecoverDialog = (isRecover) => {
    //     if (isRecover) {
    //         let updateData = {
    //             isExistCache: false
    //         };
    //         this.props.updateField(updateData);
    //     } else {
    //         const { loginInfo, orderData } = this.props;
    //         let dataParams = {
    //             'caseNo': loginInfo && loginInfo.user && loginInfo.user.moeCaseNo,
    //             'hospcode': loginInfo && loginInfo.user && loginInfo.user.hospitalCd,
    //             'ordNo': orderData && orderData.ordNo,
    //             'patientKey': loginInfo && loginInfo.user && loginInfo.user.moePatientKey
    //         };
    //         this.props.cancelOrder(dataParams);
    //         let updateData = {
    //             isExistCache: false
    //         };
    //         this.props.updateField(updateData);
    //     }
    // }
    handleRecoverDialog = () => {
        this.props.openCommonMessage({
            msgCode: MOE_MSG_CODE.MOE_UNSAVED_RECORD,
            btnActions: {
                btn1Click: () => {
                    let updateData = {
                        isExistCache: false
                    };
                    this.props.updateField(updateData);
                },
                btn2Click: () => {
                    const { loginInfo, orderData } = this.props;
                    let dataParams = {
                        'caseNo': loginInfo && loginInfo.user && loginInfo.user.moeCaseNo,
                        'hospcode': loginInfo && loginInfo.user && loginInfo.user.hospitalCd,
                        'ordNo': orderData && orderData.ordNo,
                        'patientKey': loginInfo && loginInfo.user && loginInfo.user.moePatientKey
                    };
                    this.props.cancelOrder(dataParams);
                    let updateData = {
                        isExistCache: false
                    };
                    this.props.updateField(updateData);
                }
            }
        });
    }
    render() {
        let actionType = moeUtilities.getMoeSetting();
        return (
            <Typography component={'div'}>
                <MoePatientPanel hidden={this.props.isCims} id={this.props.id + '_moePatientPanel'} patient={this.props.loginInfo} />
                <MoePresciption
                    onRef={this.moePresciptionOnRef}
                    showAllergyButton presciptionClasses={this.props.presciptionClasses}
                    patient={this.props.loginInfo && this.props.loginInfo.user}
                    isCims={this.props.isCims}
                    codeList={this.props.codeList}
                    heightAdjust={this.props.heightAdjust ? this.props.heightAdjust : 670}
                    logout={this.moeLogout}
                // handleRecoverDialog={this.handleRecoverDialog}
                />
                <RemarkDialog
                    id="backdate_RemarkDialog"
                    dialogTitle={'Reason for back-dated prescription'}
                    open={actionType.isBackdate && this.props.isSelectedPrescription && this.state.showRemarkDialog || false}
                    //open={this.props.isSelectedPrescription && this.state.showRemarkDialog}
                    cancelClick={this.cancelClick}
                    okClick={this.handleSaveOrderRemark}
                    remarkValue={this.state.remarkValue}
                    handleUpdateRemark={this.handleSetRemarkValue}
                />
                {/* <CommonCircular />
                <CIMSMessageDialog /> */}
                {this.props.isExistCache && !actionType.isLock &&
                    this.handleRecoverDialog()
                    // <CIMSAlertDialog
                    //     id="recover_dialog"
                    //     open={this.props.isExistCache}
                    //     onClickOK={() => { this.handleRecoverDialog(true); }}
                    //     onClickCancel={() => { this.handleRecoverDialog(false); }}
                    //     dialogTitle="Unsaved Record Found"
                    //     dialogContentText={
                    //         <Typography component={'div'} variant={'subtitle2'} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'pre-wrap' }}>
                    //             <img src={questionIcon} alt="Question" />
                    //             {'    An unsaved record has been found. Would you like to recover or discard it?'}
                    //         </Typography>
                    //     }
                    //     okButtonName={'Recover'}
                    //     cancelButtonName={'Discard'}
                    //     btnCancel
                    // />
                }
            </Typography >
        );
    }
}
const mapStateToProps = (state) => {
    return {
        searchData: state.prescription.searchData,
        loginInfo: state.moe.loginInfo,
        codeList: state.moe.codeList,
        isExistCache: state.moe.isExistCache,
        orderData: state.moe.orderData,
        moeOriginData: state.moe.moeOriginData
    };
};
const mapDispatchToProps = {
    searchDrug,
    searchItemCollapse,
    doLogin,
    saveDrug,
    resetDrugList,
    cancelOrder,
    updateField,
    updateCurTab,
    openCommonMessage,
    closeCleanMask
};
export default connect(mapStateToProps, mapDispatchToProps)(Moe);