import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import SupervisorsApprovalDialog from '../../../../compontent/supervisorsApprovalDialog';
import FastTextField from '../../../../../components/TextField/FastTextField';
import SelectFieldValidator from '../../../../../components/FormValidator/SelectFieldValidator';
import RequiredIcon from '../../../../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import CommonMessage from '../../../../../constants/commonMessage';
import accessRightEnum from '../../../../../enums/accessRightEnum';
import { checkAccessRightByStaffId } from '../../../../../store/actions/registration/registrationAction';
import { openCommonMessage } from '../../../../../store/actions/message/messageAction';
import { listEncntrCaseRsn } from '../../../../../store/actions/appointment/booking/bookingAction';


const UnexpectedEnctrApprlDialog = (props) => {
    const {
        appointment,
        approvalDialogParams,
        //encntrCaseRsnList,
        confirmCallback,
        handleUpdateApprovalDialogParams,
        encounterTypes,
        listEncntrCaseRsn,
        serviceCd
    } = props;
    const [encntrCaseRsnList, setEncntrCaseRsnList] = React.useState([]);

    React.useEffect(() => {
        listEncntrCaseRsn({ svcCd: serviceCd }, (data) => {
            setEncntrCaseRsnList(data);
        });
    }, []);

    const selectRef = React.useRef();


    const encounter = encounterTypes.find(x => x.encntrTypeId === appointment.encounterTypeId);

    const genApprovalDialogComponent = () => {
        const id = 'unexpected_booking_encounter_type_approver_dialog';
        return (
            <Grid container spacing={2} style={{ marginBottom: 24 }}>
                <Grid item xs={12}>
                    <SelectFieldValidator
                        id={`${id}_rsn_select`}
                        value={approvalDialogParams.rsnCd || ''}
                        options={encntrCaseRsnList && encntrCaseRsnList.map(item => ({ value: item.encntrCaseRsnCd, label: item.encntrCaseRsnDesc }))}
                        onChange={(e) => handleUpdateApprovalDialogParams('rsnCd', e.value)}
                        TextFieldProps={{
                            variant: 'outlined',
                            label: <>Reason{approvalDialogParams.rsnTxt ? null : <RequiredIcon />}</>
                        }}
                        validators={approvalDialogParams.rsnTxt ? [] : [ValidatorEnum.required]}
                        errorMessages={approvalDialogParams.rsnTxt ? [] : [CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        ref={ref => selectRef.current = ref}
                        validByBlur
                    />
                </Grid>
                <Grid item xs={12}>
                    <FastTextField
                        id={`${id}_rsn_txt`}
                        value={approvalDialogParams.rsnTxt}
                        inputProps={{ maxLength: 1000 }}
                        calActualLength
                        multiline
                        rows={'3'}
                        label={'Other Reason'}
                        onBlur={
                            (e) => {
                                handleUpdateApprovalDialogParams('rsnTxt', e.target.value);
                                selectRef.current.makeValid();
                            }
                        }
                    />
                </Grid>
            </Grid>
        );
    };

    const handConfirmApproval = () => {
        props.checkAccessRightByStaffId(
            approvalDialogParams.staffId,
            accessRightEnum.invalidBookingEncounterTypeApprover,
            (isHaveRight) => {
                if (isHaveRight === 'Y') {
                    handleUpdateApprovalDialogParams('isOpen', false);
                    confirmCallback && confirmCallback();
                } else {
                    props.openCommonMessage({ msgCode: '110202' });
                }
            }
        );
    };
    return (
        <SupervisorsApprovalDialog
            title={
                <Grid container>
                    <Grid item xs={12}>{'Invalid encounter type according to case status.'}</Grid>
                    <Grid item xs={12}>{`Selected Encounter: ${encounter ? encounter.encntrTypeDesc : ''}`}</Grid>
                </Grid>
            }
            confirm={handConfirmApproval}
            component={genApprovalDialogComponent}
            handleCancel={() => handleUpdateApprovalDialogParams('isOpen', false)}
            handleChange={(value) => handleUpdateApprovalDialogParams('staffId', value)}
            supervisorsApprovalDialogInfo={approvalDialogParams}
        />
    );
};

const mapState = (state) => {
    return {
        encounterTypes: state.common.encounterTypes,
        serviceCd: state.login.service.serviceCd
    };
};

const dispatch = {
    checkAccessRightByStaffId, openCommonMessage, listEncntrCaseRsn
};

export default connect(mapState, dispatch)(UnexpectedEnctrApprlDialog);