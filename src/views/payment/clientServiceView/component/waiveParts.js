import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Grid, Typography, Link } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import CIMSSelect from '../../../../components/Select/CIMSSelect';
import ClientServiceViewEnum from '../../../../enums/payment/clientServiceView/clientServiceViewEnum';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import Enum from '../../../../enums/enum';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import { updateField } from '../../../../store/actions/payment/clientServiceView/clientServiceViewAction';
import {
    openCommonMessage
} from '../../../../store/actions/message/messageAction';
import * as ClientServiceViewUtil from '../../../../utilities/clientServiceViewUtilities';
import { hasSpecificRole } from '../../../../utilities/userUtilities';

const styles = () => ({
    itemPadding: {
        padding: 8
        // alignItems: 'center'
    },
    amount: {
        padding: 8,
        marginTop: 10,
        // alignItems: 'center',
        justifyContent: 'center'
    },
    waivePartsLbl: {
        justifyContent: 'center',
        padding: 8
    },
    waiveFieldWidth: {
        width: '6.5vw'
    }
});

const commonOpts = [
    { value: 1, label: 'Y' }
];

class WaiverParts extends React.Component {
    componentWillUpdate(nextP) {
        if (nextP.note.isPaid !== this.props.note.isPaid) {
            this.props.updateField({ isPaidAll: ClientServiceViewUtil.checkPaidAll(nextP.noteData) });
        }
    }

    componentDidUpdate(prevP) {
        let prevNotes = _.cloneDeep(prevP.note);
        let notes = _.cloneDeep(this.props.note);
        delete prevNotes.version;
        delete prevNotes.updateDtm;
        delete notes.version;
        delete notes.updateDtm;
        const noteIsDirty = ClientServiceViewUtil.checkItemIsDirty(prevNotes, notes);
        if (noteIsDirty) {
            const { noteData, notesBk } = this.props;
            let totalAmount = ClientServiceViewUtil.countTotalAmount(noteData, notesBk);
            this.props.updateField({ totalAmount });
        }
    }

    waivePartsOnChange = (name, value) => {
        const { note, noteData, waiveAllType } = this.props;
        let waiveAll = _.clone(waiveAllType);
        const noteIdx = this.props.noteIdx || 0;
        let _note = _.cloneDeep(note);
        let _noteData = _.cloneDeep(noteData);

        if (name === 'waiveType') {
            if (waiveAll !== '') {
                if (value !== waiveAll) {
                    waiveAll = '';
                }
            }
        }
        if (name === 'isPaid') {
            if (value === 1) {
                _note.paidDtm = moment().format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK);
                if (_note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.Consultation) {
                    _note.isComplete = 1;
                    _note.completeDtm = moment().format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK);
                }
            } else {
                _note.paidDtm = '';
                if (_note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.Consultation) {
                    _note.isComplete = '';
                    _note.completeDtm = '';
                }
            }
            if (_note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.Consultation) {
                if (value === 1) {
                    _note.isComplete = 1;
                    _note.completeDtm = moment().format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK);
                } else {
                    _note.isComplete = null;
                    _note.completeDtm = '';
                }
            }
        }
        if (name === 'isComplete') {
            if (value === 1) {
                _note.completeDtm = moment().format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK);
            } else {
                _note.completeDtm = '';
            }
        }
        if (name === 'unitCharge') {
            if (value.indexOf('0') === 0 && value !== '0') {
                value = value.substring(1);
            }
        }

        if (name === 'totalCharge') {
            if (value.length > 1) {
                if (value.indexOf('0') === 0 && value !== '0') {
                    value = value.substring(1);
                }
            }
        }
        _note[name] = value;
        if (name !== 'totalCharge') {
            if (name === 'waiveType' && value !== '') {
                _note.totalCharge = '0';
            } else {
                _note.totalCharge = ClientServiceViewUtil.countItemAmount(_note);
            }
        }

        _noteData[noteIdx] = _note;
        this.props.updateField({ noteData: _noteData, waiveAllType: waiveAll });
    };

    refundNote = () => {
        const { note, noteData } = this.props;
        const noteIdx = this.props.noteIdx || 0;
        let _note = _.cloneDeep(note);
        let _noteData = _.cloneDeep(noteData);
        _note.waiveType = '';
        _note.isPaid = '';
        _note.paidDtm = '';
        if (_note.chargeCd.indexOf('OTHER') > -1) {
            _note.unitCharge = '0';
        }
        _noteData[noteIdx] = _note;
        _note.totalCharge = ClientServiceViewUtil.countItemAmount(_note);
        this.props.updateField({ noteData: _noteData });
        this.props.updateField({ isPaidAll: false });
    };

    handleRefundLinkClick = () => {
        this.props.openCommonMessage({
            msgCode: '111401',
            btnActions: {
                btn1Click: this.refundNote
            }
        });
    };

    render() {
        const { id, note, isClinicalUser, isCurrentCaseNo, classes, notesBk, loginInfo } = this.props;
        const noteIdx = this.props.noteIdx || 0;
        const bk = notesBk ? notesBk[noteIdx] : null;
        let isDirty = false;
        const isReissueNote = note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.ReissueCertificate;
        if (notesBk) {
            isDirty = ClientServiceViewUtil.checkItemIsDirty(note, bk);
        }
        const noteStatus = ClientServiceViewUtil.getNoteStatus(note, isDirty, bk);
        // const disabledItemPrice = (isClinicalUser === 'Y' ? true : noteStatus === ClientServiceViewEnum.NOTE_STATUS.REFUND) || !isCurrentCaseNo;
        const disabledItemPrice = noteStatus === ClientServiceViewEnum.NOTE_STATUS.REFUND || !isCurrentCaseNo;
        const dispalyCompLbl = (noteStatus === ClientServiceViewEnum.NOTE_STATUS.COMPLETED
            && moment(note.completeDtm).format(Enum.DATE_FORMAT_EYMD_VALUE) !== moment().format(Enum.DATE_FORMAT_EYMD_VALUE))
            || (note.isPaid !== 1 && !isReissueNote);
        const hasDoctorBaseRole = hasSpecificRole(loginInfo.userDto, 'CIMS-DOCTOR');
        const hasNurseBaseRole = hasSpecificRole(loginInfo.userDto, 'CIMS-NURSE');

        return (
            <Grid item container style={{ width: '47vw' }}>
                <Grid item container className={classes.itemPadding} justify={'center'} style={{ width: '6vw' }}>
                    {note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.Medication ?
                        <Grid item container className={classes.waivePartsLbl}>
                            <Typography>
                                {note.course}
                            </Typography>
                        </Grid>
                        : null
                    }

                </Grid>
                <Grid item container className={classes.itemPadding} justify={'center'} style={{ width: '6vw' }}>
                    <Grid item container style={{ width: '7vw' }}>
                        {
                            noteStatus === '' ?
                                note.chargeCd.indexOf('OTHER') > -1 && isCurrentCaseNo ?
                                    <FastTextFieldValidator
                                        id={`${id}_item_price_text_field`}
                                        value={note.unitCharge}
                                        onBlur={(e) => { this.waivePartsOnChange('unitCharge', e.target.value); }}
                                        // disabled={!isCurrentCaseNo}
                                        disabled={disabledItemPrice}
                                        inputProps={{ maxLength: 5 }}
                                        variant={'outlined'}
                                        type={'number'}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    />
                                    :
                                    <Grid item container className={classes.waivePartsLbl}>
                                        <Typography>
                                            {note.unitCharge}
                                        </Typography>
                                    </Grid>
                                :
                                <Grid item container className={classes.waivePartsLbl}>
                                    <Typography>
                                        {note.unitCharge}
                                    </Typography>
                                </Grid>
                        }
                    </Grid>
                </Grid>
                <Grid item container className={classes.itemPadding} justify={'center'} style={{ width: '9vw' }}>
                    {
                        note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.Consultation ||
                            note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.ReissueCertificate ?
                            null
                            :
                            <Grid item container>
                                <DateFieldValidator
                                    id={`${id}_item_treatment_dtm_field`}
                                    variant={'outlined'}
                                    placeholder={''}
                                    value={note.treatmentDtm}
                                    onChange={(e) => { this.waivePartsOnChange('treatmentDtm', e); }}
                                    disabled={(hasDoctorBaseRole || hasNurseBaseRole) ? !isCurrentCaseNo || bk.isComplete===1 : true}
                                // absoluteMessage
                                />
                            </Grid>
                    }
                </Grid>
                <Grid item container className={classes.itemPadding} justify={'center'} style={{ width: '7vw' }}>
                    <Grid item container>
                        {
                            isCurrentCaseNo ?
                                noteStatus !== '' ?
                                    <Grid item container className={classes.waivePartsLbl}>
                                        <Typography>
                                            {note.waiveType}
                                        </Typography>
                                    </Grid>
                                    :
                                    <CIMSSelect
                                        id={`${id}_waive_type_select_field`}
                                        options={ClientServiceViewEnum.WAIVE_TYPE.map(item => (
                                            { value: item.value, label: item.label }
                                        ))}
                                        addNullOption
                                        TextFieldProps={{
                                            variant: 'outlined'
                                        }}
                                        value={note.waiveType}
                                        onChange={(e) => { this.waivePartsOnChange('waiveType', e.value); }}
                                        isDisabled={!isCurrentCaseNo}
                                    />
                                :
                                <Grid item container className={classes.waivePartsLbl}>
                                    <Typography>
                                        {note.waiveType}
                                    </Typography>
                                </Grid>
                        }
                    </Grid>

                </Grid>
                <Grid item container className={classes.itemPadding} justify={'center'} style={{ width: '6.5vw' }}>
                    <Grid item container>
                        {
                            isCurrentCaseNo && (isClinicalUser !== 'Y' || isReissueNote) ?
                                noteStatus !== '' ?
                                    noteStatus === ClientServiceViewEnum.NOTE_STATUS.REFUND ?
                                        <Grid item container className={classes.waivePartsLbl}>
                                            {isClinicalUser === 'Y' && !isReissueNote || !isCurrentCaseNo ?
                                                <Typography>
                                                    {note.isPaid === 1 ? 'Y' : ''}
                                                </Typography>
                                                :
                                                <Link
                                                    id={`${id}_paid_refund_link`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={this.handleRefundLinkClick}
                                                >
                                                    <Typography>
                                                        {note.isPaid === 1 ? 'Y' : ''}
                                                    </Typography>
                                                </Link>
                                            }
                                        </Grid>
                                        :
                                        <Grid item container className={classes.waivePartsLbl}>
                                            <Typography>
                                                {note.isPaid === 1 ? 'Y' : ''}
                                            </Typography>
                                        </Grid>
                                    :
                                    <CIMSSelect
                                        id={`${id}_paid_select_field`}
                                        options={commonOpts.map(item => ({
                                            value: item.value, label: item.label
                                        }))}
                                        TextFieldProps={{
                                            variant: 'outlined'
                                        }}
                                        addNullOption
                                        value={note.isPaid}
                                        onChange={(e) => { this.waivePartsOnChange('isPaid', e.value); }}
                                        isDisabled={(isClinicalUser === 'Y' && !isReissueNote) || !isCurrentCaseNo}
                                    />
                                :
                                <Grid item container className={classes.waivePartsLbl}>
                                    <Typography>
                                        {note.isPaid === 1 ? 'Y' : ''}
                                    </Typography>
                                </Grid>
                        }
                    </Grid>
                </Grid>
                <Grid item container className={classes.itemPadding} justify={'center'} style={{ width: '6.5vw' }}>
                    <Grid item container>
                        {
                            isCurrentCaseNo && (isClinicalUser === 'Y' || isReissueNote) ?
                                // (noteStatus === ClientServiceViewEnum.NOTE_STATUS.COMPLETED && moment(note.completeDtm).format(Enum.DATE_FORMAT_EYMD_VALUE) !== moment().format(Enum.DATE_FORMAT_EYMD_VALUE) || isClinicalUser !== 'Y') ?
                                dispalyCompLbl ?
                                    <Grid item container className={classes.waivePartsLbl}>
                                        <Typography>
                                            {note.isComplete === 1 ? 'Y' : ''}
                                        </Typography>
                                    </Grid>
                                    :
                                    <CIMSSelect
                                        id={`${id}_completed_select_field`}
                                        options={commonOpts.map(item => ({
                                            value: item.value, label: item.label
                                        }))}
                                        TextFieldProps={{
                                            variant: 'outlined'
                                        }}
                                        addNullOption
                                        value={note.isComplete}
                                        onChange={(e) => { this.waivePartsOnChange('isComplete', e.value); }}
                                        isDisabled={((isClinicalUser !== 'Y' && !isReissueNote) ? true : note.isPaid !== 1) || !isCurrentCaseNo}
                                    />
                                :
                                <Grid item container className={classes.waivePartsLbl}>
                                    <Typography>
                                        {note.isComplete === 1 ? 'Y' : ''}
                                    </Typography>
                                </Grid>
                        }
                    </Grid>

                </Grid>
                <Grid item container className={classes.amount} justify={'center'} id={`${id}_total_charge`} style={{ width: '6vw' }}>
                    <Typography>
                        {note.totalCharge}
                    </Typography>
                </Grid>
            </Grid>
        );
    }
}


const mapState = (state) => {
    return {
        thsCharges: state.clientSvcView.thsCharges,
        noteData: state.clientSvcView.noteData,
        open: state.clientSvcView.open,
        waiveAllType: state.clientSvcView.waiveAllType,
        loginInfo: state.login.loginInfo
    };
};

const dispatch = {
    updateField,
    openCommonMessage
};

export default connect(mapState, dispatch)(withStyles(styles)(WaiverParts));