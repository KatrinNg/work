import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import cover_eHR from '../../images/eHR/cover_ehe.gif';
import CIMSDialog from '../Dialog/CIMSDialog';
import CIMSeHRApprovalDialog from './CIMSeHRApprovalDialog';
import CIMSeHRInforTable from './CIMSeHRInforTable';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CIMSButton from '../Buttons/CIMSButton';
import { connect } from 'react-redux';
import { closeEHRIdentityDialog, eHRresetAll, updatePatient, updateEHRPatientStatus, keepEHRState } from '../../store/actions/EHR/eHRAction';
import * as EHRUtilities from '../../utilities/eHRUtilities';
import FormControl from '@material-ui/core/FormControl';
import accessRightEnum from '../../enums/accessRightEnum';
import { styles } from '../../views/eHR/eHRStyles';
import { withStyles } from '@material-ui/core';
import { checkAccessRight } from '../../store/actions/registration/registrationAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import { openCommonCircular, closeCommonCircular } from '../../store/actions/common/commonAction';
import Enum from '../../enums/enum';
import * as CommonUtilities from '../../utilities/commonUtilities';
import { checkAccessRightByStaffId } from '../../store/actions/registration/registrationAction';

class CIMSeHRDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginName: '',
            staffId: '',
            password: ''
        };
    }

    componentDidMount() {
        this.props.openCommonCircular();
        if (this.props.isOpenEHRIdentityDialog && this.props.isMatch === '4') {
            let where = {
                serviceCd: null,
                clinicCd: null
            };
            let eHREhrisConfig = CommonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.EHR_EHRIS_URL, this.props.clinicConfig, where);
            let eHREhrisUrl = '';
            if (eHREhrisConfig && eHREhrisConfig.configValue) {
                eHREhrisUrl = eHREhrisConfig.configValue;
            }
            this.props.getEHRIdentity(this.props.eHRInputParams, eHREhrisUrl);
        }
        this.props.closeCommonCircular();
    }

    isCurrentUserHaveAccess = (rightCd) => {
        const { accessRights } = this.props;
        if (rightCd === accessRightEnum.changePatientMajorKey) {
          return true;
        }
        return accessRights && accessRights.findIndex(item => item.name === rightCd) > -1;
    }

    handleUpdateEHRData = (existingInfo, newInfo, loginName, pcName, ipAddr, siteCd) => {
        let data = EHRUtilities.getUpdateEHRData(existingInfo, newInfo,
            this.props.serviceCd, this.state.loginName, this.state.password, siteCd, loginName);
        // Check the AccessRight
        // let callParams = {
        //     clinicCd: this.props.siteCd,
        //     loginName: this.props.loginName,
        //     password: this.state.password,
        //     serviceCd: this.props.serviceCd,
        //     siteId: this.props.siteId
        // };

        this.props.checkAccessRightByStaffId(this.state.staffId, accessRightEnum.changePatientMajorKey, (isHaveRight) => {
            if (isHaveRight === 'Y') {
                this.props.updatePatient(data, loginName, pcName, ipAddr);
            } else {
                this.props.openCommonMessage({ msgCode: '110144' });
            }
          });

        // this.props.checkAccessRight(callParams, accessRightEnum.changePatientMajorKey, (isHaveRight) => {
        //     // Check the Approval in db AccessRight
        //     if (isHaveRight === 'Y') {
        //         this.props.updatePatient(data, loginName, pcName, ipAddr);
        //     } else {
        //         this.props.openCommonMessage({ msgCode: '110144' });
        //     }
        // });

        // this.props.updatePatient(data, EHRUtilities.getUpdateEHRData(newInfo, this.props.serviceCd), loginName, pcName, ipAddr);
    }

    handleNotUpdatEHRDate = (patientEhr) => {
        const params = {
            actionType: 'UPDATE',
            ehrNo: patientEhr.ehrNo,
            isMatch: '3',
            patientKey: patientEhr.patientKey
          };
        // Check the AccessRight
        let callParams = {
            clinicCd: this.props.siteCd,
            loginName: this.state.loginName,
            password: this.state.password,
            serviceCd: this.props.serviceCd,
            siteId: this.props.siteId
        };
        this.props.checkAccessRight(callParams, accessRightEnum.changePatientMajorKey, (isHaveRight) => {
            // Check the Approval in db AccessRight
            if (isHaveRight === 'Y') {
                this.props.updateEHRPatientStatus(params);
                this.props.closeEHRIdentityDialog();
            } else {
                this.props.openCommonMessage({ msgCode: '110144' });
            }
        });
    }

    handleEHRresetAllClick = () => {
        if (this.props.isOpenEHRIdentityDialog) {
            this.props.eHRresetAll();
        }
        this.props.keepEHRState();
    }

    render() {
        const { classes, isOpenEHRIdentityDialog, existingInformation, participantList, loginName, pcName, ipAddr, siteCd } = this.props;
        let ischangePatientMajorKeyRight = EHRUtilities.isUserHaveAccess(this.props.accessRights, accessRightEnum.changePatientMajorKey);
        return (
            participantList && participantList[0] ?
            <CIMSDialog
                classes={{
                    paper: classes.paper
                }}
                id={'CIMSDialogEHRIdentity'}
                dialogTitle={'Patient Core Field(s) Information Has Been Changed in eHRSS'}
                open={isOpenEHRIdentityDialog}
            >
            <FormControl>
            <DialogContent>
                <CIMSeHRInforTable
                    existingInfo={existingInformation}
                    newInfo={participantList[0]}
                />
                <CIMSeHRApprovalDialog
                    isUserHaveAccess={false}
                    onChange={(value, name) => this.setState({ [name]: value })}
                    approverName={this.state.staffId}
                    // Ref :. This check the User Right
                    ischangePatientMajorKeyRight={'ture'}
                />
            </DialogContent>
            </FormControl>
            <DialogActions style={{ justifyContent: 'center', padding: 0 }}>
                <CIMSButton onClick={() => {this.handleUpdateEHRData(existingInformation, participantList[0], loginName, pcName, ipAddr, siteCd);}}>
                    {'Yes, please update the CIMS core field(now)'}
                </CIMSButton>
                <CIMSButton onClick={() => {this.handleNotUpdatEHRDate(existingInformation.patientEhr);}}>
                    {'No, the CIMS core field(s) were just verified correct.'}
                </CIMSButton>
                <CIMSButton onClick={this.handleEHRresetAllClick}>
                    Remind me later
                </CIMSButton>
                </DialogActions>
            </CIMSDialog>
            :
            <></>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        serviceCd: state.login.service.serviceCd,
        participantList: state.ehr.participantList,
        loginName: state.login.loginInfo.loginName,
        pcName: state.login.loginForm.ipInfo.pcName,
        ipAddr: state.login.loginForm.ipInfo.ipAddr,
        accessRights: state.login.accessRights,
        siteCd: state.login.clinic.siteCd,
        siteId: state.login.clinic.siteId,
        clinicConfig: state.common.clinicConfig,
        isMatch: state.patient && state.patient.patientInfo && state.patient.patientInfo.patientEhr
                && state.patient.patientInfo.patientEhr.isMatch ? state.patient.patientInfo.patientEhr.isMatch : ''
    };
};

const mapDispatchToProps = {
    closeEHRIdentityDialog,
    eHRresetAll,
    updateEHRPatientStatus,
    openCommonMessage,
    updatePatient,
    keepEHRState,
    openCommonCircular,
    closeCommonCircular,
    checkAccessRight,
    checkAccessRightByStaffId
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CIMSeHRDialog)));