import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
//import classNames from 'classnames';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
//import { DialogContent, DialogActions, InputAdornment, Grid, IconButton } from '@material-ui/core';
//import { AccountBox, Lock, Visibility, VisibilityOff } from '@material-ui/icons';

import {
    addTabs,
    refreshSubTabs,
    cleanSubTabs,
    changeTabsActive,
    deleteSubTabs,
    deleteTabs,
    cleanTabParams,
	resetAll
} from '../../store/actions/mainFrame/mainFrameAction';
import { getEHRIdentity, eHRIdentityOpenDialog } from '../../store/actions/EHR/eHRAction';
import CIMSeHRDialog from '../../components/EHR/CIMSeHRDialog';
import CIMSeHRIdentityButton from '../../components/EHR/CIMSeHRIdentityButton';
import CIMSeHRIdentityLink from '../../components/EHR/CIMSeHRIdentityLink';
import CIMSeHRLink from '../../components/EHR/CIMSeHRLink';
import * as EHRUtilities from '../../utilities/eHRUtilities';
import * as CommonUtilities from '../../utilities/commonUtilities';
import accessRightEnum from '../../enums/accessRightEnum';
import Enum from '../../enums/enum';

class CIMSeHRExternalButton extends Component {
    constructor(props){
        super(props);
        this.eHRButtonInfo = {
            label: 'eHRSS Registered',
            name: accessRightEnum.eHRRegistered,
            path: '/eHR/eHRRegistration',
            isPatRequired: 'Y'
        };
    }

    render() {
        const {
            serviceCd, patientInfo, subTabs, getEHRIdentity, keepEHRState, //NOSONAR
            eHRId, loginName, pcName, ipAddr, correlationId, eHRIdentityOpenDialog, isMatch, openEHRIdentityDialog //NOSONAR
        } = this.props;

        let isEHRSSRegistered = EHRUtilities.isEHRSSRegistered(patientInfo);

        // eHR Patient isMatch == '3'
        let isIdentityPatientInCIMS = EHRUtilities.isIdentityPatientInCIMS(patientInfo);

		 // TODO : Add the ehruId check in accessRights
        let isEHRAccessRight = EHRUtilities.isEHRAccessRight(eHRId);

        let isIdentityPatient = EHRUtilities.isIdentityPatient(patientInfo);

        let hkid = EHRUtilities.getPatientHkidPair(patientInfo);

        let documentPair = EHRUtilities.getPatientNonHkicPair(patientInfo);

        let eHRInputParams = {
            als: {
                clientIp: ipAddr,
                correlationId: correlationId,
                userId: loginName,
                workstationId: pcName
            },
            identityList: [
                {
                    ehrNo: patientInfo && patientInfo.patientEhr ? patientInfo.patientEhr.ehrNo : '',
                    hkId: hkid ? hkid : '',
                    identityDocumentNo: documentPair.docNo,
                    typeOfIdentityDocument: documentPair.docTypeCd
                }
            ],
            serviceId: serviceCd
        };

        let where = {
            serviceCd: null,
            clinicCd: null
        };

        let eHREhrisConfig = CommonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.EHR_EHRIS_URL, this.props.clinicConfig, where);
        let eHREhrisUrl = '';
        if (eHREhrisConfig && eHREhrisConfig.configValue) {
            eHREhrisUrl = eHREhrisConfig.configValue;
        }

		return(
				<React.Fragment>
                    {
                        <CIMSeHRDialog
                            // :. Fix the isMatch update redux.
                            isOpenEHRIdentityDialog={openEHRIdentityDialog || (!keepEHRState && (isIdentityPatient || isMatch === '4'))}
                            existingInformation={patientInfo}
                            getEHRIdentity={getEHRIdentity}
                            eHRInputParams={eHRInputParams}
                        />
                    }

                  {
                    this.eHRButtonInfo && isEHRSSRegistered && (isIdentityPatient) && (isMatch === '2')? (
                            <CIMSeHRIdentityLink
                                key={(this.eHRButtonInfo && this.eHRButtonInfo.name ? this.eHRButtonInfo.name : '')}
                                label={(this.eHRButtonInfo && this.eHRButtonInfo.label ? this.eHRButtonInfo.label : '')}
                                name={(this.eHRButtonInfo && this.eHRButtonInfo.name ? this.eHRButtonInfo.name : '')}
                                eHRTabInfo={this.eHRButtonInfo}
                                onClick={getEHRIdentity}
                                inputParams={{
                                als: {
                                    clientIp: ipAddr,
                                    correlationId: correlationId,
                                    userId: loginName,
                                    workstationId: pcName
                                },
                                identityList: [
                                    {
                                        ehrNo: patientInfo.patientEhr.ehrNo,
                                        hkId: hkid ? hkid : '',
                                        identityDocumentNo: documentPair.docNo ? documentPair.docNo : '',
                                        typeOfIdentityDocument: documentPair.docTypeCd ? documentPair.docTypeCd : ''
                                    }
                                ],
                                serviceId: serviceCd
                            }}
                                isEHRSSRegistered={isEHRSSRegistered}
                                isEHRAccessRight={isEHRAccessRight}
                                eHREhrisUrl={eHREhrisUrl}
                            />
                        ) : (
                              <CIMSeHRLink
                                  key={(this.eHRButtonInfo && this.eHRButtonInfo.name ? this.eHRButtonInfo.name : '')}
                                  label={(this.eHRButtonInfo && this.eHRButtonInfo.label ? this.eHRButtonInfo.label : '')}
                                  name={(this.eHRButtonInfo && this.eHRButtonInfo.name ? this.eHRButtonInfo.name : '')}
                                  eHRTabInfo={this.eHRButtonInfo}
                                  subTabs={subTabs}
                                  onClick={this.props.addTabs}
                                  refreshSubTabs={this.props.refreshSubTabs}
                                  cleanSubTabs={this.props.cleanSubTabs}
                                  isEHRSSRegistered={isEHRSSRegistered}
                                  isEHRAccessRight={isEHRAccessRight}
                              />
                        )
                  }
            </React.Fragment>
	);
    }
}

CIMSeHRExternalButton.propTypes = {
};

function mapStateToProps(state) {
    return {
		//duplicate name
        //patient: state.patient.patientInfo,
        patientInfo: state.patient.patientInfo,
        isMatch: state.patient && state.patient.patientInfo && state.patient.patientInfo.patientEhr
                && state.patient.patientInfo.patientEhr.isMatch ? state.patient.patientInfo.patientEhr.isMatch : '',
        caseNoInfo: state.patient.caseNoInfo,
        subTabsActiveKey: state.mainFrame.subTabsActiveKey,
        subTabs: state.mainFrame.subTabs,
        accessRights: state.login.accessRights,
        loginName: state.login.loginInfo.loginName,
        pcName: state.login.loginForm.ipInfo.pcName,
        ipAddr: state.login.loginForm.ipInfo.ipAddr,
        correlationId: state.login.loginInfo.correlationId,
        //list spa function start
        spaList: state.common.spaList,
        //list spa function end
        tabs: state.mainFrame.tabs,
        maskFunctions: state.mainFrame.maskFunctions,
        serviceCd: state.login.service.serviceCd,
        openSelectCase: state.caseNo.openSelectCase,
        userRoleType: state.login.loginInfo && state.login.loginInfo.userRoleType,
        isOpenReview: state.registration.isOpenReview,
        openEHRIdentityDialog: state.ehr.openEHRIdentityDialog,
        keepEHRState: state.ehr.keepEHRState,
        ehr: state.ehr,
        eHRId: state.login.loginInfo && state.login.loginInfo.eHRId,
        majorKeyChangeHistoryList: state.patient.majorKeyChangeHistoryList,
        clinicList: state.common.clinicList,
        codeList: state.common.commonCodeList
    };
}

const dispatchProps = {
    addTabs,
    refreshSubTabs,
    cleanSubTabs,
    changeTabsActive,
    deleteSubTabs,
    resetAll,
    deleteTabs,
    cleanTabParams,
    getEHRIdentity, eHRIdentityOpenDialog
};
export default withRouter(connect(mapStateToProps, dispatchProps)(CIMSeHRExternalButton));
