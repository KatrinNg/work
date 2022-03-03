import { Button, Checkbox, Grid, TextField, Tooltip, withStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import CIMSPromptDialog from '../../../../../components/Dialog/CIMSPromptDialog';
import DeleteIcon from '@material-ui/icons/Delete';
import { connect } from 'react-redux';
import { updateState, updatePatientEhsDto } from '../../../../../store/actions/registration/registrationAction';
import AlsDesc from '../../../../../constants/ALS/alsDesc';
import { openCommonMessage } from '../../../../../store/actions/message/messageAction';
import { auditAction } from '../../../../../store/actions/als/logAction';
import { patientPhonesBasic } from '../../../../../constants/registration/registrationConstants';
import * as _ from 'lodash';
import Alert from '@material-ui/lab/Alert';
import { hasEhsPhn } from '../../../../../utilities/patientUtilities';

const ContactTelDialog = (props) => {
    const id = 'EHS_CONTACT_TEL_DIALOG';

    const {
        open,
        classes,
        handleOnClose,
        activeStep,
        steps,
        updateState,
        updatePatientEhsDto,
        patientBaseInfo,
        openCommonMessage,
        auditAction,
        phoneList,
        contactPersonIndex,
        contactPersonList,
        regCodeList
    } = props;

    const { patientEhsDto } = patientBaseInfo;

    const [selectedPhn, setSeletedPhn] = useState({
        phn1: false,
        phn2: false,
        phn3: false,
        phn4: false
    });

    const [maxAppendableNo, setmaxAppendableNo] = useState(0);

    useEffect(() => {
        if (activeStep === 1) {
            setmaxAppendableNo(5 - phoneList?.filter((x) => x.phoneNo !== '')?.length || 0);
        } else if (activeStep === 2) {
            // setmaxAppendableNo(5 - phoneList?.filter((x) => x.phoneNo !== '')?.length || 0);
            setmaxAppendableNo(4 - contactPersonList[contactPersonIndex]?.contactPhoneList?.filter((x) => x.phoneNo !== '')?.length || 0);
        }
    }, [activeStep]);

    const getNoOfPhoneTobeAppended = () => {
        return Object.values(selectedPhn)?.filter((x) => x === true)?.length || 0;
    };

    const handleSelectedPhnOnchange = (e) => {
        setSeletedPhn({
            ...selectedPhn,
            [e.target.name]: e.target.checked
        });
    };

    const handleDelete = (index) => {
        // auditAction(AlsDesc.DELETE, null, null, false, 'patient');
        openCommonMessage({
            msgCode: '130302',
            params: [
                { name: 'HEADER', value: 'Confirm Delete' },
                { name: 'MESSAGE', value: `Do you confirm the delete this tel: ${patientEhsDto[`phn${index}`]}?` }
            ],
            btnActions: {
                btn1Click: () => {
                    auditAction('Confirm Delete');
                    updatePatientEhsDto({ [`phn${index}IsDeleted`]: 1 });
                    if (selectedPhn[`phn${index}`]) {
                        setSeletedPhn({ ...selectedPhn, [`phn${index}`]: false });
                    }
                },
                btn2Click: () => {
                    auditAction('Cancel Delete');
                }
            }
        });
    };

    const handleAppend = (isDelete) => {
        // step: 1 - Contact Information
        // step: 2 - Contact Person
        if (maxAppendableNo >= getNoOfPhoneTobeAppended()) {
            if (activeStep === 1) {
                let _phoneList = _.cloneDeep(phoneList);
                Object.keys(selectedPhn)
                    .filter((x) => selectedPhn[x] === true)
                    .map((x) => {
                        const phoneNo = patientEhsDto[x];
                        let newPhone = _.cloneDeep(patientPhonesBasic);
                        newPhone.phoneNo = phoneNo;

                        const emptyIndex = _phoneList.findIndex((phone) => phone.phoneNo === '');

                        if (emptyIndex >= 0) {
                            _phoneList[emptyIndex] = newPhone;
                        } else if (_phoneList?.length < 5) {
                            _phoneList.push(newPhone);
                        }
                        if (isDelete) {
                            updatePatientEhsDto({ [`phn${x[x.length - 1]}IsDeleted`]: 1 });
                        }
                    });
                updateState({ phoneList: _phoneList });
            } else if (activeStep === 2) {
                let _contactPersonList = _.cloneDeep(contactPersonList);
                if (_contactPersonList[contactPersonIndex]) {
                    let _contactPerson = _.cloneDeep(_contactPersonList[contactPersonIndex]);
                    let _contactPhoneList = _.cloneDeep(_contactPerson?.contactPhoneList);
                    if (_contactPerson?.engSurname?.length > 0 || _contactPerson?.engGivename?.length > 0) {
                        // have name
                        // skip name and relationship
                    } else {
                        // no name
                        // append name and relationship
                        _contactPerson.engSurname = patientEhsDto?.contactName;
                        if (patientEhsDto?.contactRelationship && regCodeList?.relationship) {
                            const relationship = regCodeList.relationship?.find((r) => r.engDesc?.toUpperCase() === patientEhsDto.contactRelationship?.toUpperCase());
                            if (relationship) {
                                _contactPerson.relationshipCd = relationship.code;
                            } else {
                                _contactPerson.relationshipCd = 'OT';
                            }
                        }
                    }

                    Object.keys(selectedPhn)
                        .filter((x) => selectedPhn[x] === true)
                        .map((x) => {
                            const phoneNo = patientEhsDto[x];
                            let newPhone = _.cloneDeep(patientPhonesBasic);
                            newPhone.phoneNo = phoneNo;

                            const emptyIndex = _contactPhoneList.findIndex((phone) => phone.phoneNo === '');

                            if (emptyIndex >= 0) {
                                _contactPhoneList[emptyIndex] = newPhone;
                            } else if (_contactPhoneList?.length < 4) {
                                _contactPhoneList.push(newPhone);
                            }
                            if (isDelete) {
                                updatePatientEhsDto({ [`phn${x[x.length - 1]}IsDeleted`]: 1 });
                            }
                        });
                    _contactPerson.contactPhoneList = _contactPhoneList;
                    _contactPersonList[contactPersonIndex] = _contactPerson;
                    updateState({ contactPersonList: _contactPersonList });
                }
            }
            handleOnClose();
        }
    };

    return (
        <CIMSPromptDialog
            disableEnforceFocus
            open={open}
            id={id}
            classes={{
                paper: classes.dialogPaper
            }}
            draggable
            dialogTitle={'EHS Contact Tel.'}
            dialogContentText={
                <Grid container spacing={2} style={{ width: '100%', margin: 0, alignItems: 'center' }}>
                    {getNoOfPhoneTobeAppended() > maxAppendableNo && (
                        <Grid item xs={12}>
                            <Alert severity="error" style={{ margin: '5px 0px' }}>
                                Max. appendable no. exist! Please adjust your selection!
                            </Alert>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <span style={{ fontWeight: 'bold' }}>Append CIMS 1.5 Phone to {steps[activeStep]}</span>
                        <br />
                        <br />
                        <span>
                            No. of phone can be appended:{' '}
                            <span style={{ color: getNoOfPhoneTobeAppended() > maxAppendableNo ? 'red' : 'black' }}>
                                {getNoOfPhoneTobeAppended()}/{maxAppendableNo}
                            </span>
                        </span>
                    </Grid>
                    {[...Array(4)].map((_, i) => {
                        const index = i + 1;
                        return (
                            <Grid item key={`phn${index}`} xs={12} container spacing={1} style={{ alignItems: 'center' }}>
                                <Grid item xs="auto">
                                    <Checkbox
                                        color="primary"
                                        name={`phn${index}`}
                                        checked={selectedPhn[`phn${index}`]}
                                        onChange={(e) => handleSelectedPhnOnchange(e)}
                                        disabled={!hasEhsPhn(index)}
                                    />
                                </Grid>
                                <Grid item xs="auto">
                                    <TextField
                                        variant="outlined"
                                        label={`Tel${index}${patientEhsDto?.phnDflt === index ? '(Preferred)' : ''}`}
                                        disabled
                                        value={
                                            patientEhsDto && patientEhsDto[`phn${index}IsDeleted`] === 0 ? patientEhsDto && patientEhsDto[`phn${index}`] : ''
                                        }
                                    />
                                </Grid>
                                {hasEhsPhn(index) && (
                                    <Grid item xs="auto">
                                        <Tooltip title="Delete" placement="right">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                style={{ borderRadius: '50%', height: '35px', width: '35px', minWidth: 'unset' }}
                                                onClick={() => handleDelete(index)}
                                            >
                                                <DeleteIcon />
                                            </Button>
                                        </Tooltip>
                                    </Grid>
                                )}
                            </Grid>
                        );
                    })}
                    <Grid item xs={12} container spacing={1}>
                        <Grid item xs={6}>
                            <TextField variant="outlined" label="Name" disabled fullWidth value={patientEhsDto?.contactName} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField variant="outlined" label="Relationship" disabled fullWidth value={patientEhsDto?.contactRelationship} />
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        *Note: Delete Action will only be done after saving successfully
                    </Grid>
                </Grid>
            }
            buttonConfig={[
                // {
                //     id: `${id}_append_btn`,
                //     name: 'Append',
                //     onClick: () => {
                //         handleAppend(false);
                //     }
                // },
                {
                    id: `${id}_append_and_delete_btn`,
                    name: 'Append & Delete',
                    onClick: () => {
                        handleAppend(true);
                    }
                },
                {
                    id: `${id}_cancel_btn`,
                    name: 'Cancel',
                    onClick: () => {
                        handleOnClose();
                    }
                }
            ]}
        />
    );
};

const styles = (theme) => ({
    dialogPaper: {
        width: '30%',
        position: 'absolute',
        bottom: 0
    },
    deleteButton: {
        borderColor: 'red',
        background: 'red',
        color: 'white',
        '&:hover': {
            background: '#d80000'
        }
    }
});

const mapStateToProps = (state) => {
    return {
        patientBaseInfo: state.registration.patientBaseInfo,
        phoneList: state.registration.phoneList,
        contactPersonList: state.registration.contactPersonList,
        regCodeList: state.registration.codeList
    };
};

const mapDispatchToProps = { updatePatientEhsDto, updateState, openCommonMessage, auditAction };

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ContactTelDialog));
