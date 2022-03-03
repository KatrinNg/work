import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import memoize from 'memoize-one';
import _ from 'lodash';
import moment from 'moment';
import withStyles from '@material-ui/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import CIMSButtonGroup from '../../../../components/Buttons/CIMSButtonGroup';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import EnctGeneral from './enctGeneral';
import EnctRoom from './enctRoom';
import { updateState, insertEnct, updateEnct, resetAll } from '../../../../store/actions/administration/enctManagement';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import { PAGE_STATUS } from '../../../../enums/administration/enctManagement';
import Enum from '../../../../enums/enum';
import AccessRightEnum from '../../../../enums/accessRightEnum';
import * as CommonUtil from '../../../../utilities/commonUtilities';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import { isClinicalAdminSetting } from '../../../../utilities/userUtilities';

const getAvailClinicList = memoize((list, serviceCd, isClinicalAdmin, clinic) => {
    let _list = [];
    if (isClinicalAdminSetting()) {
        let curClinic = list.find(item => item.siteId === clinic.siteId);
        _list.push(curClinic);
    } else {
        _list = list.filter(item => item.status === Enum.COMMON_STATUS_ACTIVE && item.svcCd === serviceCd);
    }
    _list = _list.map(item => ({
        value: item.siteId,
        label: `${item.siteCd} - ${item.siteEngName}`
    }));
    _list = _.sortBy(_list, 'label');
    _list.unshift({ value: -1, label: '<For All Clinic>' });
    return _list;
});

const EnctDetail = React.forwardRef((props, ref) => {
    const {
        classes,
        pageStatus,
        activeStep,
        steps,
        clinicList,
        svcCd,
        originalInfo,
        changingInfo,
        selectedList,
        accessRights,
        isSystemAdmin,
        isServiceAdmin,
        isClinicalAdmin,
        clinic,
        enctDetailGeneral
    } = props;

    let uaGeneralInfoRef = React.useRef(null);
    let uaRoomRef = React.useRef(null);

    const comDisabled = (pageStatus !== PAGE_STATUS.ADDING) && (pageStatus !== PAGE_STATUS.EDITING);

    const handleStep = (step) => {
        if (!comDisabled) {
            switch (activeStep) {
                case 0: {
                    uaGeneralInfoRef.current.isFormValid(false).then(result => {
                        if (result) {
                            props.updateState({ activeStep: step });
                        } else {
                            uaGeneralInfoRef.current.focusFail();
                        }
                    });
                    break;
                }
                case 1: {
                    uaRoomRef.current.isFormValid(false).then(result => {
                        if (result) {
                            props.updateState({ activeStep: step });
                        } else {
                            uaRoomRef.current.focusFail();
                        }
                    });
                    break;
                }
            }
        } else {
            props.updateState({ activeStep: step });
        }
    };

    const integrateData = () => {
        let newData = _.cloneDeep(originalInfo || {});
        newData = {
            ...newData,
            ...changingInfo,
            siteId: changingInfo.siteId === -1 ? null : changingInfo.siteId,
            efftDate: moment(changingInfo.efftDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            expyDate: changingInfo.expyDate ? moment(changingInfo.expyDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : null
        };
        newData.roomDtoList = _.cloneDeep(selectedList || []).map(item => {
            delete item.displayStr;
            return { ...item };
        });
        return newData;
    };

    const doSave = () => {
        const data = integrateData();
        if (pageStatus === PAGE_STATUS.ADDING) {
            props.auditAction('Create Encounter', null, null, false);
            props.insertEnct(data);
        } else if (pageStatus === PAGE_STATUS.EDITING || pageStatus === PAGE_STATUS.NONEDITABLE) {
            props.auditAction('Save Encounter Update', null, null, false);
            props.updateEnct(data);
        }
    };

    const handleSave = (closeTab) => {
        const generalValid = uaGeneralInfoRef.current.isFormValid(false);
        const roomValid = uaRoomRef.current.isFormValid(false);

        let isValid = true;
        generalValid.then(result => {
            if (!result) {
                isValid = false;
                props.updateState({ activeStep: 0 });
                uaGeneralInfoRef.current.focusFail();
            }
        }).then(() => {
            roomValid.then(result => {
                if (!result) {
                    isValid = false;
                    props.updateState({ activeStep: 1 });
                    uaRoomRef.current.focusFail();
                }
            });
        }).then(() => {
            if (isValid) {
                props.updateState({ doCloseCallbackFunc: closeTab || null });
                doSave();
            }
        });
    };

    const handleCancel = () => {
        props.auditAction(AlsDesc.CANCEL, null, null, false, 'cmn');
        props.openCommonMessage({
            msgCode: '110348',
            btnActions: {
                btn1Click: () => {
                    props.resetAll();
                }
            }
        });
    };

    const viewOnly = changingInfo ? (changingInfo.siteId === -1 && isClinicalAdminSetting()) ||
        (!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin)
        : true;

    const checkIsDirty = React.useCallback(() => {
        return viewOnly ? false : pageStatus === PAGE_STATUS.ADDING || pageStatus === PAGE_STATUS.EDITING || pageStatus === PAGE_STATUS.NONEDITABLE;
    }, [pageStatus]);

    const doClose = React.useCallback(CommonUtil.getDoCloseFunc_2(AccessRightEnum.encounterTypeManagement, checkIsDirty, handleSave), [checkIsDirty, accessRights, changingInfo]);

    React.useEffect(() => {
        return () => {
            props.updateCurTab(AccessRightEnum.encounterTypeManagement, null);
        };
    }, []);

    React.useEffect(() => {
        props.updateCurTab(AccessRightEnum.encounterTypeManagement, doClose);
    }, [doClose]);

    React.useEffect(() => {
        if (isClinicalAdminSetting() && pageStatus === PAGE_STATUS.ADDING) {
            props.updateState({
                enctDetailGeneral: {
                    ...enctDetailGeneral,
                    changingInfo: {
                        ...changingInfo,
                        siteId: clinic.siteId
                    }
                }
            });
        }
    }, [pageStatus]);


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
                                id={`ectDetail_stepBtn_${index}`}
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
                    <EnctGeneral clinicList={getAvailClinicList(clinicList, svcCd, isClinicalAdminSetting(), clinic)} isClinicalAdmin={isClinicalAdminSetting()} />
                </ValidatorForm>
                <ValidatorForm
                    className={clsx(classes.form, {
                        [classes.hidden]: activeStep !== 1
                    })}
                    ref={uaRoomRef}
                    focusFail
                >
                    <EnctRoom />
                </ValidatorForm>
            </Grid>
            <Grid item container>
                <CIMSButtonGroup
                    buttonConfig={
                        [
                            {
                                id: 'ectDetail_saveBtn',
                                name: 'Save',
                                onClick: () => handleSave(),
                                disabled: viewOnly
                            },
                            {
                                id: 'ectDetail_cancelBtn',
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
        originalInfo: state.enctManagement.enctDetailGeneral.originalInfo,
        changingInfo: state.enctManagement.enctDetailGeneral.changingInfo,
        selectedList: state.enctManagement.enctDetailRoom.selectedList,
        activeStep: state.enctManagement.activeStep,
        steps: state.enctManagement.steps,
        pageStatus: state.enctManagement.pageStatus,
        clinicList: state.common.clinicList,
        svcCd: state.login.service.svcCd,
        accessRights: state.login.accessRights,
        isSystemAdmin: state.login.isSystemAdmin,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin: state.login.isClinicalAdmin,
        clinic: state.login.clinic,
        enctDetailGeneral: state.enctManagement.enctDetailGeneral
    };
};

const mapDispatch = {
    updateState,
    insertEnct,
    updateEnct,
    openCommonMessage,
    updateCurTab,
    resetAll,
    auditAction
};

export default connect(mapState, mapDispatch)(withStyles(styles)(EnctDetail));
