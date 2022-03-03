import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import _ from 'lodash';
import memoize from 'memoize-one';
import moment from 'moment';
import { withStyles } from '@material-ui/core';
import { Grid, Stepper, Step, StepButton } from '@material-ui/core';
import { updateState, getEnctList, createRoom, updateRoom, resetAll } from '../../../../../store/actions/administration/roomManagement/roomManagementActions';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import General from './general';
import EnctAssignment from './enctAssignment';
import CIMSButtonGroup from '../../../../../components/Buttons/CIMSButtonGroup';
import { PAGE_STATUS } from '../../../../../enums/administration/roomManagement/roomManagementEnum';
import Enum from '../../../../../enums/enum';
import { CommonUtil } from '../../../../../utilities';
import AccessRightEnum from '../../../../../enums/accessRightEnum';
import { updateCurTab } from '../../../../../store/actions/mainFrame/mainFrameAction';
import { auditAction } from '../../../../../store/actions/als/logAction';
import AlsDesc from '../../../../../constants/ALS/alsDesc';
import { isClinicalAdminSetting } from '../../../../../utilities/userUtilities';

const styles = (theme) => ({
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
    assigmentRoot: {
        width: '100%'
    },
    hidden: {
        display: 'none'
    }
});
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
    return _list;
});

class RoomDetails extends React.Component {
    componentDidMount() {
        this.props.getEnctList();
        this.initDoClose();
    }

    componentDidUpdate(nextP) {
        if (nextP.roomGeneralData.changingInfo.siteId !== this.props.roomGeneralData.changingInfo.siteId) {
            this.props.getEnctList();
        }
    }

    componentWillUnmount() {
        this.props.updateCurTab(AccessRightEnum.roomManagemnet, null);
    }

    handleStep = (step) => {
        const { activeStep, pageStatus } = this.props;
        if (pageStatus === PAGE_STATUS.ADDING) {
            switch (activeStep) {
                case 0: {
                    this.roomGeneralRef.isFormValid(false).then(result => {
                        if (result) {
                            this.props.updateState({ activeStep: step });
                        } else {
                            this.roomGeneralRef.focusFail();
                        }
                    });
                    break;
                }
                case 1: {
                    this.enctAssignmentRef.isFormValid(false).then(result => {
                        if (result) {
                            this.props.updateState({ activeStep: step });
                        } else {
                            this.enctAssignmentRef.focusFail();
                        }
                    });
                    break;
                }
            }
        } else {
            this.props.updateState({ activeStep: step });
        }
    }

    handleCancel = () => {
        this.props.auditAction(AlsDesc.CANCEL, null, null, false, 'cmn');
        this.props.resetAll();
    }

    checkIsDirty = () => {
        const { pageStatus, isGeneralUser } = this.props;
        return isGeneralUser ? false : pageStatus === PAGE_STATUS.ADDING || pageStatus === PAGE_STATUS.EDITING;
    }

    initDoClose = () => {
        let doClose = CommonUtil.getDoCloseFunc_2(AccessRightEnum.roomManagemnet, this.checkIsDirty, this.handleSave);
        this.props.updateCurTab(AccessRightEnum.roomManagemnet, doClose);
    }


    handleSave = (closeTab) => {
        const generalValid = this.roomGeneralRef.isFormValid(false);
        const roomValid = this.enctAssignmentRef.isFormValid(false);

        let isValid = true;
        generalValid.then(result => {
            if (!result) {
                isValid = false;
                this.sortByprops.updateState({ activeStep: 0 });
                this.roomGeneralRef.current.focusFail();
            }
        }).then(() => {
            roomValid.then(result => {
                if (!result) {
                    isValid = false;
                    this.props.updateState({ activeStep: 1 });
                    this.enctAssignmentRef.current.focusFail();
                }
            });
        }).then(() => {
            if (isValid) {
                this.props.updateState({ doCloseCallbackFunc: closeTab || null });
                this.submit();
            }
        });
    }

    submit = () => {
        const { pageStatus, roomGeneralData, assignedList } = this.props;
        const changingInfo = _.cloneDeep(roomGeneralData.changingInfo);
        let params = {
            ...changingInfo,
            efftDate:moment(changingInfo.efftDate).isValid()?moment(changingInfo.efftDate).format(Enum.DATE_FORMAT_EYMD_VALUE):null,
            expyDate:changingInfo.expyDate?moment(changingInfo.expyDate).format(Enum.DATE_FORMAT_EYMD_VALUE):null
        };
        if (assignedList) {
            params.encntrTypeList = assignedList;
        }
        if (pageStatus === PAGE_STATUS.ADDING) {
            this.props.auditAction('Create New Room');
            this.props.createRoom(params);
        } else {
            this.props.auditAction('Save Room Update');
            this.props.updateRoom(params);
        }
    }


    render() {
        const { classes, activeStep, steps, isClinicalAdmin, clinicList, svcCd, clinic, isGeneralUser } = this.props;
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
                                    onClick={() => this.handleStep(index)}
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
                        className={clsx({ [classes.hidden]: activeStep !== 0 })}
                        ref={ref => this.roomGeneralRef = ref}
                        focusFail
                    >
                        <General
                            id={'roomManagement_general'}
                            isClinicalAdmin={isClinicalAdminSetting()}
                            clinicList={getAvailClinicList(clinicList, svcCd, isClinicalAdminSetting(), clinic)}
                        />
                    </ValidatorForm>
                    <ValidatorForm
                        className={clsx(classes.assigmentRoot, { [classes.hidden]: activeStep !== 1 })}
                        ref={ref => this.enctAssignmentRef = ref}
                        focusFail
                    >
                        <EnctAssignment
                            id={'roomManagement_encounter_assignment'}
                        // availList={getAvailEnctList(availList,roomGeneralData.siteId,pageStatus)}
                        />
                    </ValidatorForm>
                </Grid>
                <Grid container item>
                    <CIMSButtonGroup
                        buttonConfig={
                            [
                                {
                                    id: 'roomManagement_save_button',
                                    name: 'Save',
                                    onClick: () => {
                                        this.props.auditAction(AlsDesc.SAVE, null, null, false, 'cmn');
                                        this.handleSave();
                                    },
                                    disabled: isGeneralUser
                                },
                                {
                                    id: 'roomManagement_cancel_button',
                                    name: 'Cancel',
                                    onClick: this.handleCancel
                                }
                            ]
                        }
                    />
                </Grid>
            </Grid>
        );
    }
}

const mapState = (state) => {
    return {
        steps: state.roomManagement.steps,
        activeStep: state.roomManagement.activeStep,
        roomGeneralData: state.roomManagement.roomGeneralData,
        availList: state.roomManagement.availList,
        assignedList: state.roomManagement.assignedList,
        pageStatus: state.roomManagement.pageStatus,
        isSystemAdmin: state.login.isSystemAdmin,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin: state.login.isClinicalAdmin,
        clinicList: state.common.clinicList,
        svcCd: state.login.service.svcCd,
        clinic: state.login.clinic
    };
};

const dispatch = {
    updateState,
    getEnctList,
    createRoom,
    updateRoom,
    resetAll,
    updateCurTab,
    auditAction
};

export default connect(mapState, dispatch)(withStyles(styles)(RoomDetails));