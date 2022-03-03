import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import _ from 'lodash';
import { updateState, resetAll, putDefaultRoom, getDefaultRoomList, deleteDefaultRoom } from '../../../../store/actions/dts/patient/DtsDefaultRoomAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import { Grid } from '@material-ui/core';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import OutlinedRadioValidator from '../../../../components/FormValidator/OutlinedRadioValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import { RADIO_OPTION_YESNO_ONLY } from '../../../../constants/dts/patient/DtsDefaultRoomConstant';
import CommonMessage from '../../../../constants/commonMessage';

const styles = theme => ({
    createForm: {
        width: 700,
        height: 430,
        paddingTop: 10,
        overflow: 'hidden'
    },
    tipRoot: {
        color: theme.palette.primary.main,
        margin: 10
    },
    radioGroup: {
        height: 'auto',
        paddingTop: 8,
        paddingBottom: 4
    },
    grid: {
        paddingTop: 6,
        paddingBottom: 6
    }
});

class DefaultRoomDialog extends Component {
    handleClose = () => {
        this.props.updateState({ dialogOpen: false, dialogName: '' });
    };

    filteredLocationList = (sspecId, rooms, clinicList) => {
        const serviceCd = this.props.serviceCd;

        if (!sspecId) return [];
        return rooms
            .filter(room => {
                const clinic = clinicList.find(clinic => clinic.svcCd === serviceCd && clinic.siteId === room.siteId);
                return room.sspecId === sspecId && room.isPhys === 1 && room.status === 'A' && room.rmType === 'D' && clinic.status === 'A' && clinic.siteType === 'C';
            })
            .sort((roomA, roomB) => {
                const clinicA = clinicList.find(clinic => clinic.svcCd === serviceCd && clinic.siteId === roomA.siteId);
                const clinicB = clinicList.find(clinic => clinic.svcCd === serviceCd && clinic.siteId === roomB.siteId);
                return clinicA.siteName + roomA.rmCd > clinicB.siteName + roomB.rmCd ? 1 : -1;
            })
            .map(room => {
                const clinic = clinicList.find(clinic => clinic.svcCd === serviceCd && clinic.siteId === room.siteId);
                return {
                    value: room.rmId,
                    label: room.rmCd + ', ' + clinic.siteName + ' (' + clinic.siteCd + ')'
                };
            });
    };

    handleChange = (name, value, label) => {
        let dialogInfo = _.cloneDeep(this.props.dialogInfo);
        const rooms = this.props.rooms;
        const clinicList = this.props.clinicList;
        const specialties = this.props.specialties;
        const dialogStatus = _.toUpper(this.props.action);
        if (name === 'specialtyId') {
            const locationList = this.filteredLocationList(value, rooms || [], clinicList || []);
            if (locationList && locationList.length > 0) {
                dialogInfo['roomId'] = locationList[0].value;
                this.props.updateState({ dialogInfo: dialogInfo });
            } else {
                dialogInfo['roomId'] = '';
                this.props.updateState({ dialogInfo: dialogInfo });
            }

            const selectedSpecialtyCode = specialties.find(specialty => specialty.sspecId === value);
            if (dialogStatus === 'CREATE') {
                dialogInfo['isDischarged'] = 0;
                if (selectedSpecialtyCode && selectedSpecialtyCode.sspecCd === 'GD') {
                    dialogInfo['isReferralDisabled'] = false;
                } else {
                    dialogInfo['isReferral'] = 1;
                    dialogInfo['isReferralDisabled'] = true;
                }
            } else {
                if (selectedSpecialtyCode && selectedSpecialtyCode.sspecCd === 'GD') {
                    if (dialogInfo['isReferral'] === 0) {
                        dialogInfo['isDischarged'] = 0;
                        dialogInfo['isDischargedDisabled'] = true;
                    }
                } else {
                    dialogInfo['isReferral'] = 1;
                    dialogInfo['isReferralDisabled'] = true;
                    dialogInfo['isDischargedDisabled'] = false;
                }
            }
        } else if (name === 'isReferral') {
            if (dialogStatus === 'UPDATE') {
                if (value === 0) {
                    // must be GD case
                    dialogInfo['isDischarged'] = 0;
                    dialogInfo['isDischargedDisabled'] = true;
                } else {
                    dialogInfo['isDischargedDisabled'] = false;
                }
            }
        }
        dialogInfo[name] = value;
        this.props.updateState({ dialogInfo: dialogInfo });
    };

    handleSubmit = () => {
        this.refs.form.submit();
    };

    validateDuplidatedDefaultRoom = dialogInfo => {
        const defaultRoomList = this.props.defaultRoomList;
        return defaultRoomList.find(
            defaultRoom =>
                defaultRoom.specialtyId === dialogInfo.specialtyId &&
                defaultRoom.isReferral === dialogInfo.isReferral &&
                defaultRoom.isDischarged === dialogInfo.isDischarged &&
                dialogInfo.isDischarged === 0 &&
                dialogInfo.defaultRoomId != defaultRoom.defaultRoomId &&
                defaultRoom.status === 'C'
        );
    };

    handleSave = () => {
        const dialogStatus = _.toUpper(this.props.action);
        const { dialogInfo } = this.props;
        if (this.validateDuplidatedDefaultRoom(dialogInfo)) {
            this.props.openCommonMessage({
                msgCode: '140000',
                showSnackbar: true
            });
        } else {
            if (dialogStatus === 'CREATE') {
                const params = {
                    defaultRoomId: 0,
                    patientKey: this.props.patientInfo.patientKey,
                    specialtyId: dialogInfo.specialtyId,
                    roomId: dialogInfo.roomId,
                    isReferral: dialogInfo.isReferral,
                    isDischarged: dialogInfo.isDischarged
                };
                this.props.putDefaultRoom(params, () => {
                    this.handleClose();
                    // console.info('############################################## deselectAllFnc: ' + this.props.activeOnly);
                    this.props.getDefaultRoomList(this.props.patientInfo.patientKey, this.props.activeOnly);
                    // console.info('############################################## handleClose: ' + this.props.activeOnly);
                    this.props.deselectAllFnc();
                });
            } else {
                const params = {
                    defaultRoomId: this.props.currentSelectedId,
                    patientKey: this.props.patientInfo.patientKey,
                    specialtyId: dialogInfo.specialtyId,
                    roomId: dialogInfo.roomId,
                    isReferral: dialogInfo.isReferral,
                    isDischarged: dialogInfo.isDischarged,
                    version: dialogInfo.version,
                    originalRecordId: dialogInfo.originalRecordId
                };
                this.props.putDefaultRoom(params, () => {
                    this.handleClose();
                    // console.info('############################################## deselectAllFnc: ' + this.props.activeOnly);
                    this.props.getDefaultRoomList(this.props.patientInfo.patientKey, this.props.activeOnly);
                    // console.info('############################################## deselectAllFnc: ' + this.props.activeOnly);
                    this.props.deselectAllFnc();
                });
            }
        }
    };

    render() {
        const { action, classes, open, specialties, dialogInfo, rooms, clinicList } = this.props;
        const idConstant = this.props.id + '_createDefaultRoom';
        const locationList = this.filteredLocationList(dialogInfo.specialtyId, rooms || [], clinicList || []);

        return (
            <CIMSPromptDialog
                id={idConstant}
                dialogTitle={_.toUpper(action) === 'CREATE' ? 'Create Default Room' : 'Update Default Room'}
                open={open}
                dialogContentText={
                    <ValidatorForm ref="form" onSubmit={this.handleSave} className={classes.createForm}>
                        <Grid container spacing={2} className={classes.grid}>
                            <Grid item xs={6} className={classes.grid}>
                                <DtsSelectFieldValidator
                                    options={
                                        specialties &&
                                        specialties.map(item => ({
                                            value: item.sspecId,
                                            label: item.sspecName
                                        }))
                                    }
                                    id={idConstant + _.toUpper(action) + 'specialtyId'}
                                    ref={ref => (this.specialtyRef = ref)}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: (
                                            <>
                                                Discipline
                                                <RequiredIcon />
                                            </>
                                        )
                                    }}
                                    value={dialogInfo.specialtyId}
                                    isDisabled={false}
                                    onChange={e => this.handleChange('specialtyId', e.value, e.label)}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    absoluteMessage
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} className={classes.grid}>
                            <Grid item xs={12} className={classes.grid}>
                                <DtsSelectFieldValidator
                                    options={
                                        locationList &&
                                        locationList.map(item => ({
                                            value: item.value,
                                            label: item.label
                                        }))
                                    }
                                    id={idConstant + _.toUpper(action) + 'roomId'}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: (
                                            <>
                                                Location
                                                <RequiredIcon />
                                            </>
                                        )
                                    }}
                                    value={dialogInfo.roomId}
                                    isDisabled={false}
                                    onChange={e => this.handleChange('roomId', e.value, e.label)}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    absoluteMessage
                                    // sortByLabel
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} className={classes.grid}>
                            <Grid item xs={3} className={classes.grid}>
                                <OutlinedRadioValidator
                                    id={idConstant + _.toUpper(action) + '_isReferral'}
                                    labelText="Referral"
                                    isRequired
                                    absoluteMessage
                                    value={`${dialogInfo.isReferral}`}
                                    onChange={e => this.handleChange('isReferral', parseInt(e.target.value), e.label)}
                                    list={RADIO_OPTION_YESNO_ONLY}
                                    disabled={dialogInfo.isReferralDisabled}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    RadioGroupProps={{
                                        className: classes.radioGroup
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} className={classes.grid}>
                            <Grid item xs={3} className={classes.grid}>
                                <OutlinedRadioValidator
                                    id={idConstant + _.toUpper(action) + '_isDischarged'}
                                    labelText="Discharged"
                                    isRequired
                                    absoluteMessage
                                    value={`${dialogInfo.isDischarged}`}
                                    onChange={e => this.handleChange('isDischarged', parseInt(e.target.value), e.label)}
                                    list={RADIO_OPTION_YESNO_ONLY}
                                    disabled={dialogInfo.isDischargedDisabled}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    RadioGroupProps={{
                                        className: classes.radioGroup
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </ValidatorForm>
                }
                buttonConfig={[
                    {
                        id: idConstant + _.toUpper(action) + '_save',
                        name: 'Save',
                        onClick: this.handleSubmit
                    },
                    {
                        id: idConstant + _.toUpper(action) + '_cancel',
                        name: 'Cancel',
                        onClick: this.handleClose
                    }
                ]}
                legendText={<div style={{ width: '100%' }}></div>}
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        currentSelectedId: state.dtsDefaultRoom.currentSelectedId,
        dialogInfo: state.dtsDefaultRoom.dialogInfo,
        specialties: state.dtsPreloadData.allSpecialties,
        autoFocus: state.dtsDefaultRoom.autoFocus,
        defaultRoomList: state.dtsDefaultRoom.defaultRoomList,
        patientInfo: state.patient.patientInfo,
        rooms: state.common.rooms,
        clinicList: state.common.clinicList,
        serviceCd: state.login.service.serviceCd,
        activeOnly: state.dtsDefaultRoom.activeOnly
    };
}

const mapDispatchToProps = {
    updateState,
    putDefaultRoom,
    deleteDefaultRoom,
    resetAll,
    getDefaultRoomList,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DefaultRoomDialog));
