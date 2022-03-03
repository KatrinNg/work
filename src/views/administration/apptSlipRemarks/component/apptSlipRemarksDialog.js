import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { Dialog_Mode } from '../../../../enums/administration/apptSlipRemarks';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import { getEncounterTypeListBySite } from '../../../../store/actions/administration/apptSlipRemarks/apptSlipRemarksAction';
import PreviewDialog from './previewDialog';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';
import AddRemoveButtons from '../../../../components/Buttons/AddRemoveButtons';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import { remarkBasic } from '../../../../constants/administration/apptSlipRemarks/remarkBasic';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { isClinicalAdminSetting } from '../../../../utilities/userUtilities';
import CommonRegex from '../../../../constants/commonRegex';

const styles = (theme) => ({
    formLblRoot: {
        padding: 16,
        marginTop: 16
    },
    fromLblCustom: {
        color: theme.palette.black,
        transform: 'translate(20px, -9px) scale(1.0)',
        fontWeight: 'bold'
    },
    dialogPaper: {
        width: '80%'
    }
});
class ApptSlipRemarksDialog extends React.Component {

    handleSubmitApptSlipRemarksForm = () => {
        const { curSelApptSlipRemarks } = this.props;
        let params = _.cloneDeep(curSelApptSlipRemarks);
        this.props.auditAction('Save ApptSlipRemarks');
        this.props.handleSubmitApptSlipRemarksForm(params);
    }

    handleChange = (value, name) => {
        const { curSelApptSlipRemarks, serviceCd } = this.props;
        let _apptSlipRemarks = _.cloneDeep(curSelApptSlipRemarks);
        if (name === 'siteId') {
            let params = {
                svcCd: serviceCd,
                siteId: value
            };
            this.props.getEncounterTypeListBySite(params, (encounterTypeList) => {
                _apptSlipRemarks['encounterTypeList'] = encounterTypeList;
                _apptSlipRemarks[name] = value;
                this.props.setCurSelApptSlipRemarks(_apptSlipRemarks);
            });
        } else {
            _apptSlipRemarks[name] = value;
            this.props.setCurSelApptSlipRemarks(_apptSlipRemarks);
        }
    }

    handleRemarksOnChange = (value, name, index) => {
        const { curSelApptSlipRemarks } = this.props;
        let _anaApptSlipRemarkList = _.cloneDeep(curSelApptSlipRemarks.anaApptSlipRemarkList);
        _anaApptSlipRemarkList[index][name] = value;
        this.props.setCurSelApptSlipRemarks({ ...curSelApptSlipRemarks, anaApptSlipRemarkList: _anaApptSlipRemarkList });
    }

    handleAdd = () => {
        const { curSelApptSlipRemarks } = this.props;
        let _anaApptSlipRemarkList = _.cloneDeep(curSelApptSlipRemarks.anaApptSlipRemarkList);
        let remark = _.cloneDeep(remarkBasic);
        _anaApptSlipRemarkList.push(remark);
        _anaApptSlipRemarkList.forEach((item, index) => {
            item.orderId = index;
        });
        this.props.setCurSelApptSlipRemarks({ ...curSelApptSlipRemarks, anaApptSlipRemarkList: _anaApptSlipRemarkList });
    }

    handleDelete = (idx) => {
        const { curSelApptSlipRemarks } = this.props;
        let _anaApptSlipRemarkList = _.cloneDeep(curSelApptSlipRemarks.anaApptSlipRemarkList);
        this.props.openCommonMessage({
            msgCode: '115801',
            btnActions: {
                btn1Click: () => {
                    if (_anaApptSlipRemarkList.length === 1) {
                        let newList = [];
                        newList.push(_.cloneDeep(remarkBasic));
                        this.props.setCurSelApptSlipRemarks({ ...curSelApptSlipRemarks, anaApptSlipRemarkList: newList });
                    } else {
                        _anaApptSlipRemarkList.splice(idx, 1);
                        this.props.setCurSelApptSlipRemarks({ ...curSelApptSlipRemarks, anaApptSlipRemarkList: _anaApptSlipRemarkList });
                    }
                }
            }
        });
    }

    disabledRemarkRemoveBtn = () => {
        const { curSelApptSlipRemarks } = this.props;
        let _anaApptSlipRemarkList = _.cloneDeep(curSelApptSlipRemarks.anaApptSlipRemarkList);
        if (_anaApptSlipRemarkList && _anaApptSlipRemarkList.length === 1) {
            let remark = _anaApptSlipRemarkList[0];
            if (!remark.dspOrder && !remark.content) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    getAvailableClinicList = (clinicList) => {
        const { siteId, serviceCd } = this.props;
        let _clinicList = clinicList && clinicList.filter(x => x.serviceCd === serviceCd);
        if (isClinicalAdminSetting()) {
            return _clinicList.filter(item => item.siteId === siteId);
        } else {
            return _clinicList;
        }
    }

    isShowAddBtn = (index) => {
        const { curSelApptSlipRemarks } = this.props;
        return (curSelApptSlipRemarks.anaApptSlipRemarkList && index === curSelApptSlipRemarks.anaApptSlipRemarkList.length - 1);
    }

    render() {
        const { dialogMode, curSelApptSlipRemarks, clinicList, openDialog, classes, encounterTypes, apptSlipReportData, isReadOnly } = this.props;
        let dialogTitle = '';
        switch (dialogMode) {
            case Dialog_Mode.CREATE:
                dialogTitle = 'Create Record';
                break;
            case Dialog_Mode.UPDATE:
                dialogTitle = 'Update Record';
                break;
            case Dialog_Mode.DELETE:
                dialogTitle = 'Confirm Delete';
                break;
            case Dialog_Mode.PREVIEW:
                dialogTitle = 'Preview';
                break;
            default:
                break;
        }

        const disabledRemoveBtn = this.disabledRemarkRemoveBtn();
        const availableClinicList = this.getAvailableClinicList(clinicList);
        return (
            < CIMSPromptDialog
                open={openDialog}
                dialogTitle={dialogTitle}
                classes={
                    dialogMode == Dialog_Mode.PREVIEW ? {
                        paper: classes.dialogPaper
                    } : null
                }
                dialogContentText={
                    <Grid>
                        {
                            dialogMode == Dialog_Mode.CREATE || dialogMode == Dialog_Mode.UPDATE ?
                                <ValidatorForm
                                    ref="apptSlipRemarksForm"
                                    style={{ width: '920px', maxHeight: '785px', paddingTop: '10px', paddingBottom: '10px' }}
                                    onSubmit={this.handleSubmitApptSlipRemarksForm}
                                >
                                    <Grid container spacing={4}>
                                        <Grid item xs={12}>
                                            <SelectFieldValidator
                                                options={availableClinicList.map((item) => ({ value: item.siteId, label: item.clinicName }))}
                                                id={'apptSlipRemark_clinic'}
                                                TextFieldProps={{
                                                    variant: 'outlined',
                                                    label: <>Clinic<RequiredIcon /></>
                                                }}
                                                value={curSelApptSlipRemarks.siteId}
                                                onChange={e => this.handleChange(e.value, 'siteId')}
                                                validators={[ValidatorEnum.required]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                absoluteMessage
                                                isDisabled={isReadOnly || dialogMode == Dialog_Mode.UPDATE}
                                                sortBy="label"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <SelectFieldValidator
                                                id={'apptSlipRemark_encounter_typ'}
                                                placeholder=""
                                                options={curSelApptSlipRemarks.encounterTypeList && curSelApptSlipRemarks.encounterTypeList.map(item => (
                                                    { value: item.encntrTypeId, label: item.encntrTypeDesc, encounterTypeCd: item.encntrTypeCd }
                                                ))}
                                                TextFieldProps={{
                                                    variant: 'outlined',
                                                    label: <>Encounter Type</>
                                                }}
                                                isDisabled={isReadOnly}
                                                value={curSelApptSlipRemarks.encntrTypeId}
                                                onChange={e => this.handleChange(e.value, 'encntrTypeId')}
                                                absoluteMessage
                                                sortBy="label"
                                            />
                                        </Grid>
                                        <Grid item container style={{ maxHeight: 545 }}>
                                            <CIMSFormLabel
                                                fullWidth
                                                className={classes.formLblRoot}
                                                FormLabelProps={{ className: classes.fromLblCustom }}
                                            >
                                                {
                                                    curSelApptSlipRemarks.anaApptSlipRemarkList && curSelApptSlipRemarks.anaApptSlipRemarkList.map((item, index) => (
                                                        <Grid container key={index} style={{ marginTop: 8 }} spacing={2}>
                                                            <Grid item xs={3}>
                                                                <FastTextFieldValidator
                                                                    id={`dspOrder_${index + 1}`}
                                                                    // calActualLength
                                                                    inputProps={{ maxLength: 2 }}
                                                                    variant={'outlined'}
                                                                    label={'Numbering'}
                                                                    value={item.dspOrder}
                                                                    disabled={isReadOnly}
                                                                    onBlur={e => this.handleRemarksOnChange(e.target.value, 'dspOrder', index)}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={8}>
                                                                <FastTextFieldValidator
                                                                    id={`content_${index + 1}`}
                                                                    multiline
                                                                    rows={2}
                                                                    calActualLength
                                                                    inputProps={{ maxLength: 300 }}
                                                                    variant={'outlined'}
                                                                    label={'Content'}
                                                                    value={item.content}
                                                                    disabled={isReadOnly}
                                                                    onBlur={e => this.handleRemarksOnChange(e.target.value, 'content', index)}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={1}>
                                                                <AddRemoveButtons
                                                                    id={`add_remove_btn_${index + 1}`}
                                                                    hideAdd={!this.isShowAddBtn(index)}
                                                                    AddButtonProps={{
                                                                        onClick: () => this.handleAdd(),
                                                                        disabled: isReadOnly
                                                                    }}
                                                                    RemoveButtonProps={{
                                                                        onClick: () => this.handleDelete(index),
                                                                        disabled: disabledRemoveBtn || isReadOnly
                                                                    }}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    ))
                                                }
                                            </CIMSFormLabel>
                                        </Grid>
                                    </Grid>

                                </ValidatorForm>
                                :
                                null
                        }
                        {
                            dialogMode == Dialog_Mode.PREVIEW ?
                                <PreviewDialog previewData={apptSlipReportData} />
                                :
                                null
                        }
                    </Grid>
                }
                buttonConfig={
                    dialogMode == Dialog_Mode.CREATE || dialogMode == Dialog_Mode.UPDATE ?
                        [
                            {
                                id: 'apptSlipRemarks_save',
                                name: 'OK',
                                disabled: isReadOnly,
                                onClick: () => {
                                    this.refs.apptSlipRemarksForm.submit();
                                }
                            },
                            {
                                id: 'apptSlipRemarks_close',
                                name: 'Cancel',
                                onClick: () => {
                                    this.props.auditAction(AlsDesc.CANCEL, null, null, false, 'ana');
                                    this.props.handleCloseApptSlipRemarks();
                                }
                            }
                        ]
                        :
                        [
                            {
                                id: 'apptSlipRemarks_print',
                                name: 'Print',
                                disabled: isReadOnly,
                                onClick: () => {
                                    this.props.auditAction(AlsDesc.CLOSE, null, null, false, 'ana');
                                    this.props.handlePrintApptSlipRemarks();
                                }
                            },
                            {
                                id: 'apptSlipRemarks_close',
                                name: 'Close',
                                onClick: () => {
                                    this.props.auditAction(AlsDesc.CLOSE, null, null, false, 'ana');
                                    this.props.handleCloseApptSlipRemarks();
                                }
                            }
                        ]
                }
            />
        );
    }
}

const mapState = (state) => {
    return {
        clinicList: state.common.clinicList,
        encounterTypes: state.common.encounterTypes,
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId
    };
};

const dispatch = {
    getEncounterTypeListBySite,
    auditAction,
    openCommonMessage
};

export default connect(mapState, dispatch)(withStyles(styles)(ApptSlipRemarksDialog));