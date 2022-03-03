import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import {
    Grid
} from '@material-ui/core';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import HKIDInput from '../../../compontent/hkidInput';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import * as PatientUtil from '../../../../utilities/patientUtilities';

class SearchDialog extends Component {

    // shouldComponentUpdate(nextProps) {
    //     return nextProps.docTypeList !== this.props.docTypeList ||
    //         nextProps.docType !== this.props.docType ||
    //         nextProps.HKID !== this.props.HKID ||
    //         nextProps.engSurname !== this.props.engSurname ||
    //         nextProps.engGivenname !== this.props.engGivenname ||
    //         nextProps.phone !== this.props.phone ||
    //         nextProps.open !== this.props.open ||
    //         nextProps.btnSearch !== this.props.btnSearch ||
    //         nextProps.btnCancel !== this.props.btnCancel ||
    //         nextProps.updateField !== this.props.updateField;
    // }

    handleDocTypeChange = (e) => {
        if (e.value === '*ALL') {
            this.refs.form.resetValidations();
        }
        this.props.updateField(e, 'docType', 'SelectField');
    }

    render() {
        const {
            id,
            classes,
            docTypeList,
            docType,
            HKID,
            engSurname,
            engGivenname,
            phone,
            openSearchDialog,
            btnSearch,
            btnCancel,
            updateField,
            patSearchTypeList
        } = this.props;

        const isHKIDFormat = PatientUtil.isHKIDFormat(docType);
        let hkidValidator = [];
        let hkidErrorMessages = [];
        if (docType !== '*ALL') {
            hkidValidator.push(ValidatorEnum.required);
            hkidErrorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
        }
        // else if(docType==='*ALL'){
        //     this.refs.form.resetValidations();
        // }
        if (isHKIDFormat) {
            hkidValidator.push(ValidatorEnum.isHkid);
            let hkidFomratDocTypeList = patSearchTypeList.filter(item => item.searchTypeCd === docType);
            let replaceMsg = CommonMessage.VALIDATION_NOTE_HKIC_FORMAT_ERROR((hkidFomratDocTypeList[0] && hkidFomratDocTypeList[0].dspTitle) || 'HKID Card');
            hkidErrorMessages.push(replaceMsg);
        }
        return (
            <CIMSPromptDialog
                dialogTitle={''}
                dialogContentText={
                    <ValidatorForm
                        id={id + 'Form'}
                        ref={'form'}
                        onSubmit={btnSearch}
                        className={classes.from}
                    >
                        <Grid>
                            Please input the information to search the client
                        </Grid>
                        <Grid>
                            <Grid className={classes.formRow}>
                                <Grid className={classes.field}>
                                    <SelectFieldValidator
                                        id={id + 'DocTypeSelectField'}
                                        labelText="Doc Type"
                                        fullWidth
                                        options={docTypeList.map(item => ({ value: item.code, label: item.engDesc }))}
                                        value={docType}
                                        //onChange={(e) => updateField(e, 'docType', 'SelectField')}
                                        onChange={this.handleDocTypeChange}
                                        addNullOption={false}
                                    />
                                </Grid>
                                <Grid className={classes.field}>
                                    <HKIDInput
                                        isHKID={isHKIDFormat}
                                        isRequired={docType !== '*ALL'}
                                        disabled={docType === '*ALL'}
                                        id={id + 'HKIDTextField'}
                                        labelText="DocNumber/HKID"
                                        value={HKID}
                                        validators={hkidValidator}
                                        errorMessages={hkidErrorMessages}
                                        onBlur={(e) => updateField(e, 'HKID', 'TextField')}
                                    />
                                </Grid>
                            </Grid>
                            <Grid className={classes.formRow}>
                                <Grid className={classes.field}>
                                    <TextFieldValidator
                                        id={id + 'EngSurnameTextField'}
                                        labelText="English Surname"
                                        fullWidth
                                        onlyOneSpace
                                        value={engSurname}
                                        validByBlur
                                        validators={[ValidatorEnum.isSpecialEnglish]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()]}
                                        warning={[ValidatorEnum.isEnglishWarningChar]}
                                        warningMessages={[CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()]}
                                        msgPosition="bottom"
                                        onChange={(e) => updateField(e, 'engSurname', 'TextField')}
                                        inputProps={{ maxLength: 40 }}
                                    />
                                </Grid>
                                <Grid className={classes.field}>
                                    <TextFieldValidator
                                        id={id + 'EngGivennameTextField'}
                                        labelText="English Givenname"
                                        fullWidth
                                        onlyOneSpace
                                        value={engGivenname}
                                        validByBlur
                                        validators={[ValidatorEnum.isSpecialEnglish]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()]}
                                        warning={[ValidatorEnum.isEnglishWarningChar]}
                                        warningMessages={[CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()]}
                                        msgPosition="bottom"
                                        onChange={(e) => updateField(e, 'engGivenname', 'TextField')}
                                        inputProps={{ maxLength: 40 }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid className={classes.formRow}>
                                <Grid className={classes.field}>
                                    <TextFieldValidator
                                        id={id + 'PhoneTextField'}
                                        labelText="Phone Number"
                                        msgPosition="bottom"
                                        fullWidth
                                        value={phone}
                                        validators={[ValidatorEnum.phoneNo]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_PHONE_NO()]}
                                        onChange={(e) => updateField(e, 'phone', 'TextField')}
                                    />
                                </Grid>
                                <Grid className={classes.field}>

                                </Grid>
                            </Grid>
                        </Grid>
                    </ValidatorForm>
                }
                open={openSearchDialog}
                buttonConfig={
                    [
                        {
                            id: id + 'SearchButton',
                            name: 'Search',
                            //style: { justifyContent: 'right' },
                            onClick: () => { this.refs.form.submit(); }
                        },

                        {
                            id: id + 'CancelButton',
                            name: 'Cancel',
                            //style: { justifyContent: 'right' },
                            onClick: btnCancel
                        }
                    ]
                }
            />
        );
    }
}

const style = () => ({
    from: {
        minWidth: 600,
        minHeight: 200
    },
    formRow: {
        display: 'flex'
        // alignItems: 'flex-end'
    },
    field: {
        flex: 1,
        margin: '0 4px'
    }
});

const mapStateToProps = (state) => {
    return {
        docTypeList: state.waitingList.docTypeList,
        openSearchDialog: state.waitingList.openSearchDialog,
        docType: state.waitingList.docType,
        HKID: state.waitingList.HKID,
        engSurname: state.waitingList.engSurname,
        engGivenname: state.waitingList.engGivenname,
        phone: state.waitingList.phone,
        patSearchTypeList: state.common.patSearchTypeList
    };
};

const mapDispatchToProps = {
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(SearchDialog));