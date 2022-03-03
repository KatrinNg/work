import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';
import withStyles from '@material-ui/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import CIMSButtonGroup from '../../../../components/Buttons/CIMSButtonGroup';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import UAGeneralInfo from './uaGeneralInfo';
import UAUserRole from './uaUserRole';
import UAClinics from './uaClinics';
import { updateUAInfo, updateState, insertUser, updateUser, resetAll } from '../../../../store/actions/administration/userAccount/userAccountAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { PAGE_STATUS } from '../../../../enums/administration/userAccount';
// import * as AdminUtil from '../../../../utilities/administrationUtilities';
import * as CommonUtil from '../../../../utilities/commonUtilities';
import Enum from '../../../../enums/enum';
import AccessRightEnum from '../../../../enums/accessRightEnum';
import { updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import { isSelectedConflictShroffRole } from '../utils';

const UAINFO = React.forwardRef((props, ref) => {
    const {
        classes, activeStep, steps, updateUAInfo, pageStatus, //NOSONAR
        updateState, openCommonMessage, insertUser, updateUser, //NOSONAR
        sourceUser, userInfo, uaServiceList, selectedUserRoleList, //NOSONAR
        uaClinicList, loginSvc, clinicList, otherSvcSelectedUserRoleList, //NOSONAR
        otherSvcUaAvailableSvcList, otherSvcUaAvailableSiteList, //NOSONAR
        accessRights //NOSONAR
    } = props;

    let uaGeneralInfoRef = React.useRef(null);
    let uaUserRoleRef = React.useRef(null);
    let uaClinicsRef = React.useRef(null);

    const comDisabled = (pageStatus !== PAGE_STATUS.ADDING) && (pageStatus !== PAGE_STATUS.EDITING);

    const isPending = userInfo.status === Enum.COMMON_STATUS_PENDING;

    const handleStep = (step) => {
        if (!comDisabled) {
            switch (activeStep) {
                case 0: {
                    uaGeneralInfoRef.current.isFormValid(false).then(result => {
                        if (result) {
                            updateUAInfo({ activeStep: step });
                        } else {
                            uaGeneralInfoRef.current.focusFail();
                        }
                    });
                    break;
                }
                case 1: {
                    uaUserRoleRef.current.isFormValid(false).then(result => {
                        if (result) {
                            updateUAInfo({ activeStep: step });
                        } else {
                            uaUserRoleRef.current.focusFail();
                        }
                    });
                    break;
                }
                case 2: {
                    uaClinicsRef.current.isFormValid(false).then(result => {
                        if (result) {
                            updateUAInfo({ activeStep: step });
                        } else {
                            uaClinicsRef.current.focusFail();
                        }
                    });
                    break;
                }
            }
        } else {
            updateUAInfo({ activeStep: step });
        }
    };

    const integrateUserData = () => {
        let integrateUser = _.cloneDeep(sourceUser || {});
        integrateUser.chiFullName = userInfo.chiFullName;
        integrateUser.cntctPhn = userInfo.contactPhone;
        integrateUser.email = userInfo.email;
        integrateUser.engGivName = userInfo.engGivenName;
        integrateUser.engSurname = userInfo.engSurname;
        integrateUser.genderCd = userInfo.genderCd;
        integrateUser.loginName = userInfo.loginName;
        integrateUser.position = userInfo.position;
        integrateUser.salutation = userInfo.salutation;
        integrateUser.status = userInfo.status;
        integrateUser.supervisor = userInfo.supervisor;
        integrateUser.acctExpyDate = userInfo.userExpiryDate ? moment(userInfo.userExpiryDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : null;
        integrateUser.acctEfftDate = userInfo.efftDate ? moment(userInfo.efftDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : null;
        integrateUser.ehrId = userInfo.ehruId;
        integrateUser.ecsUserId = userInfo.ecsUserId;
        integrateUser.hclDrCode = userInfo.doctorCd;
        integrateUser.isAdmin = userInfo.isAdmin;
        integrateUser.passcode = userInfo.passCode;
        if (pageStatus === PAGE_STATUS.EDITING) {
            integrateUser.userId = userInfo.userId;
            integrateUser.version = userInfo.version;
            if(userInfo.sha256Passcode){
                delete integrateUser.passcode;
            }
        }


        let uamMapUserSvcDtos = [...uaServiceList, ...otherSvcUaAvailableSvcList] || [];
        let uamMapUserSiteDtos = [...uaClinicList, ...otherSvcUaAvailableSiteList] || [];
        let uamMapUserRoleDtos = [...selectedUserRoleList, ...otherSvcSelectedUserRoleList] || [];

        // if (pageStatus === PAGE_STATUS.EDITING) {
        //     uamMapUserSvcDtos = uamMapUserSvcDtos.concat(AdminUtil.getUserUnAttainSvcList(sourceUser, loginSvc.serviceCd));
        //     uamMapUserSiteDtos = uamMapUserSiteDtos.concat(AdminUtil.getUserUnAttainSiteList(sourceUser, loginSvc.serviceCd, clinicList));
        //     uamMapUserRoleDtos = uamMapUserRoleDtos.concat(AdminUtil.getUserUnAttainUserRoleList(sourceUser, loginSvc.serviceCd));
        // }
        let _uamMapUserSvcDtos = _.cloneDeep(uamMapUserSvcDtos);
        _uamMapUserSvcDtos = _uamMapUserSvcDtos.filter(item => item.svcCd).map(item => {
            delete item.createDtm;
            delete item.updateDtm;
            return { ...item };
        });

        let _uamMapUserSiteDtos = _.cloneDeep(uamMapUserSiteDtos);
        _uamMapUserSiteDtos = _uamMapUserSiteDtos.filter(item => item.siteId).map(item => {
            delete item.createDtm;
            delete item.updateDtm;
            return {
                ...item,
                efftDate: item.efftDate ? moment(item.efftDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : null,
                expyDate: item.expyDate ? moment(item.expyDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : null
            };
        });

        let _uamMapUserRoleDtos = _.cloneDeep(uamMapUserRoleDtos);
        _uamMapUserRoleDtos = _uamMapUserRoleDtos.map(item => {
            delete item.seq;
            return { ...item };
        });

        integrateUser.uamMapUserSvcDtos = _uamMapUserSvcDtos;
        integrateUser.uamMapUserSiteDtos = _uamMapUserSiteDtos;
        integrateUser.uamMapUserRoleDtos = _uamMapUserRoleDtos;

        return integrateUser;
    };

    const doSave = () => {
        const user = integrateUserData();
        if (pageStatus === PAGE_STATUS.ADDING) {
            props.auditAction('Create New User');
            insertUser(user);
        } else if (pageStatus === PAGE_STATUS.EDITING || pageStatus === PAGE_STATUS.NONEDITABLE) {
            if (isPending) {
                user.status = Enum.COMMON_STATUS_ACTIVE;
            }
            props.auditAction('Save User Update');
            updateUser(user);
        }
    };

    const handleSave = (closeTab) => {
        const generalValid = uaGeneralInfoRef.current.isFormValid(false);
        const userRoleValid = uaUserRoleRef.current.isFormValid(false);
        const clinicsValid = uaClinicsRef.current.isFormValid(false);

        if (isSelectedConflictShroffRole(selectedUserRoleList)) {
            props.openCommonMessage({ msgCode: '110383' });
            return;
        }
        let isValid = true;
        generalValid.then(result => {
            if (!result) {
                isValid = false;
                updateUAInfo({ activeStep: 0 });
                uaGeneralInfoRef.current.focusFail();
            }
        }).then(() => {
            userRoleValid.then(result => {
                if (!result) {
                    isValid = false;
                    updateUAInfo({ activeStep: 1 });
                    uaUserRoleRef.current.focusFail();
                }
            });
        }).then(() => {
            clinicsValid.then(result => {
                if (!result) {
                    isValid = false;
                    updateUAInfo({ activeStep: 2 });
                    uaClinicsRef.current.focusFail();
                }
            });
        }).then(() => {
            if (isValid) {
                updateState({ doCloseCallbackFunc: closeTab || null });
                doSave();
            }
        });
    };

    const handleCancel = () => {
        props.auditAction(AlsDesc.CANCEL, null, null, false, 'user');
        openCommonMessage({
            msgCode: '110339',
            btnActions: {
                btn1Click: () => {
                    // updateState({ pageStatus: PAGE_STATUS.VIEWING });
                    props.resetAll();
                }
            }
        });
    };

    const checkIsDirty = React.useCallback(() => {
        return pageStatus === PAGE_STATUS.ADDING || pageStatus === PAGE_STATUS.EDITING || pageStatus === PAGE_STATUS.NONEDITABLE;
    }, [pageStatus]);

    const doClose = React.useCallback(CommonUtil.getDoCloseFunc_2(AccessRightEnum.userProfile, checkIsDirty, handleSave), [checkIsDirty, accessRights, userInfo]);

    React.useEffect(() => {
        return () => {
            props.updateCurTab(AccessRightEnum.userProfile, null);
        };
    }, []);

    React.useEffect(() => {
        props.updateCurTab(AccessRightEnum.userProfile, doClose);
    }, [doClose]);

    return (
        <Grid container className={classes.root}>
            <Grid item container justify="center">
                <Stepper
                    className={classes.stepper}
                    nonLinear
                    activeStep={activeStep}
                >
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepButton
                                id={`uaInfo_stepBtn_${index}`}
                                className={classes.stepperButton}
                                onClick={() => handleStep(index)}
                                completed={index < activeStep}
                                tabIndex={-1}
                            >
                                {label}
                            </StepButton>
                        </Step>
                    ))}
                </Stepper>
            </Grid>
            <Grid item container className={classes.content}>
                <ValidatorForm
                    className={clsx(classes.form, {
                        [classes.hidden]: activeStep !== 0
                    })}
                    ref={uaGeneralInfoRef}
                    focusFail
                >
                    <UAGeneralInfo />
                </ValidatorForm>
                <ValidatorForm
                    className={clsx(classes.form, {
                        [classes.hidden]: activeStep !== 1
                    })}
                    ref={uaUserRoleRef}
                    focusFail
                >
                    <UAUserRole />
                </ValidatorForm>
                <ValidatorForm
                    className={clsx(classes.form, {
                        [classes.hidden]: activeStep !== 2
                    })}
                    ref={uaClinicsRef}
                    focusFail
                >
                    <UAClinics />
                </ValidatorForm>
            </Grid>
            <Grid item container>
                <CIMSButtonGroup
                    buttonConfig={
                        [
                            {
                                id: 'uaInfo_saveBtn',
                                // name: 'Save',
                                name: isPending ? 'Save and Activate' : 'Save',
                                onClick: handleSave
                            },
                            {
                                id: 'uaInfo_cancelBtn',
                                name: 'Cancel',
                                onClick: handleCancel
                            }
                        ]
                    }
                />
            </Grid>
        </Grid>
    );
});

const styles = theme => ({
    root: {
        flexFlow: 'column',
        height: 'calc(100vh - 106px)'
    },
    form: {
        width: '100%'
    },
    stepper: {
        width: '60%',
        padding: 10
    },
    stepperButton: {
        margin: -5,
        padding: 5,
        borderRadius: theme.spacing(1) / 2
    },
    content: {
        height: '88%',
        overflowY: 'auto'
    },
    hidden: {
        display: 'none'
    }
});

const mapState = (state) => {
    return {
        activeStep: state.userAccount.uaInfo.activeStep,
        steps: state.userAccount.uaInfo.steps,
        pageStatus: state.userAccount.pageStatus,
        sourceUser: state.userAccount.uaGeneral.sourceUser,
        userInfo: state.userAccount.uaGeneral.userInfo,
        uaServiceList: state.userAccount.uaGeneral.uaServiceList,
        selectedUserRoleList: state.userAccount.uaUserRole.selectedUserRoleList,
        uaClinicList: state.userAccount.uaClinics.uaClinicList,
        loginSvc: state.login.service,
        clinicList: state.common.clinicList,
        otherSvcSelectedUserRoleList: state.userAccount.uaUserRole.otherSvcSelectedUserRoleList,
        otherSvcUaAvailableSvcList: state.userAccount.uaGeneral.otherSvcUaAvailableSvcList,
        otherSvcUaAvailableSiteList: state.userAccount.uaClinics.otherSvcUaAvailableSiteList,
        accessRights: state.login.accessRights
    };
};

const mapDispatch = {
    updateUAInfo,
    updateState,
    openCommonMessage,
    insertUser,
    updateUser,
    resetAll,
    updateCurTab,
    auditAction
};

export default connect(mapState, mapDispatch)(withStyles(styles)(UAINFO));
