import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import HKIDInput from '../../../compontent/hkidInput';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import RegChCodeField from '../regChCodeField';
import RegDateBirthField from '../regDateBirthField';
import OutlinedRadioValidator from '../../../../components/FormValidator/OutlinedRadioValidator';
import { RegistrationUtil, PatientUtil, DateUtil } from '../../../../utilities';
import { getExistClinicalData, updateState } from '../../../../store/actions/registration/registrationAction';
import BabyIcon from '../babyIcon';
import _ from 'lodash';

const PatientInfoDialog = React.forwardRef((props, ref) => {
    const {
        classes,
        patientBaseInfo,
        allowSingleNameInput,
        getCoreFieldProps,
        ccCodeChiChar,
        patientById
    } = props;

    const [coreInfo, setCoreInfo] = React.useState({
        ...patientBaseInfo,
        primaryDocTypeCd: patientBaseInfo.primaryDocTypeCd,
        primaryDocNo: patientBaseInfo.primaryDocNo,
        idSts: patientBaseInfo.idSts,
        engSurname: patientBaseInfo.engSurname,
        engGivename: patientBaseInfo.engGivename,
        otherName: patientBaseInfo.otherName,
        allowSingleNameInput: allowSingleNameInput,
        ccCode1: patientBaseInfo.ccCode1,
        ccCode2: patientBaseInfo.ccCode2,
        ccCode3: patientBaseInfo.ccCode3,
        ccCode4: patientBaseInfo.ccCode4,
        ccCode5: patientBaseInfo.ccCode5,
        ccCode6: patientBaseInfo.ccCode6,
        ccCodeChiChar: ccCodeChiChar,
        nameChi: patientBaseInfo.nameChi,
        dob: patientBaseInfo.dob,
        exactDobCd: patientBaseInfo.exactDobCd,
        genderCd: patientBaseInfo.genderCd
    });

    React.useImperativeHandle(ref, () => ({
        saveBabyInfo: (babyInfo, ccCodeChiChar) => {
            let _coreInfo = { ...coreInfo };
            _coreInfo.engSurname = babyInfo.engSurname;
            _coreInfo.engGivename = babyInfo.engGivename;
            _coreInfo.primaryDocNo = babyInfo.docNo;
            _coreInfo.nameChi = babyInfo.nameChi;
            _coreInfo.dob = babyInfo.dob;
            _coreInfo.genderCd = babyInfo.genderCd;
            _coreInfo.exactDobCd = babyInfo.exactDobCd;
            _coreInfo.ccCodeChiChar = ccCodeChiChar;
            _coreInfo.ccCode1 = '';
            _coreInfo.ccCode2 = '';
            _coreInfo.ccCode3 = '';
            _coreInfo.ccCode4 = '';
            _coreInfo.ccCode5 = '';
            _coreInfo.ccCode6 = '';
            setCoreInfo(_coreInfo);
        }
    }));

    const [rowData, setRowData] = React.useState(null);
    React.useEffect(() => {
        props.getExistClinicalData(patientById.patientKey, (data) => {
            const _data = data && data.map((x, i) => ({
                ...x,
                rowId: i
            }));
            setRowData(_data);
        });
    }, []);

    const formRef = React.useRef(null);

    const updateFunc = ({ patientInfo, ...other }) => setCoreInfo({ ...coreInfo, ...patientInfo, ...other });
    const documentTypeProps = getCoreFieldProps && getCoreFieldProps('primaryDocTypeCd', coreInfo, updateFunc);
    const documentNoProps = getCoreFieldProps && getCoreFieldProps('primaryDocNo', coreInfo, updateFunc);
    const priIssueCountryProps = getCoreFieldProps && getCoreFieldProps('priIssueCountryCd', coreInfo, updateFunc);
    const withProvenProps = getCoreFieldProps && getCoreFieldProps('idSts', coreInfo, updateFunc);
    const surNameProps = getCoreFieldProps && getCoreFieldProps('engSurname', coreInfo, updateFunc);
    const giveNameProps = getCoreFieldProps && getCoreFieldProps('engGivename', coreInfo, updateFunc);
    const singleNameIndProps = getCoreFieldProps && getCoreFieldProps('singleNameInd', coreInfo, updateFunc);
    const otherNameProps = getCoreFieldProps && getCoreFieldProps('otherName', coreInfo, updateFunc);
    const chineseNameProps = getCoreFieldProps && getCoreFieldProps('nameChi', coreInfo, updateFunc);
    const chinaCodeProps = getCoreFieldProps && getCoreFieldProps('chinaCode', coreInfo, updateFunc);
    const regDateBirthProps = getCoreFieldProps && getCoreFieldProps('regDateBirth', coreInfo, updateFunc);
    const genderProps = getCoreFieldProps && getCoreFieldProps('genderCd', coreInfo, updateFunc);
    const babyIconProps = getCoreFieldProps && getCoreFieldProps('babyIcon', coreInfo, updateFunc);

    const updateDtmGetter = (params) => {
        return DateUtil.getFormatDate(params.data && params.data.updateDtm);
    };

    const recordTypeGetter = (params) => {
        return `${params.data.recordType} ${params.data.createDtm ? `(${DateUtil.getFormatDate(params.data.createDtm)})` : ''}`.trimEnd();
    };

    let column = [
        { field: 'updateDtm', headerName: 'Updated Date', width: 160, valueGetter: updateDtmGetter },
        { field: 'clinic', headerName: 'Clinic/Service', width: 250 },
        { field: 'recordType', headerName: 'Type of Clinical Records', width: 200, valueGetter: recordTypeGetter }
    ];

    const updateChiChar = React.useCallback((charIndex, char, ccCodeList) => {
        let { patientInfo, ccCodeChiChar } = RegistrationUtil.setChCode(ccCodeList, coreInfo, coreInfo.ccCodeChiChar);
        let updateData = RegistrationUtil.setChChineseName(patientInfo, ccCodeChiChar, charIndex, char);
        setCoreInfo({
            ...updateData.patientInfo,
            ccCodeChiChar: updateData.ccCodeChiChar
        });
    }, [coreInfo]);

    const mergeCoreInfo = React.useCallback(() => {
        const valid = formRef && formRef.current && formRef.current.isFormValid(false);
        valid.then(result => {
            if (result) {
                const _coreInfo = _.cloneDeep(coreInfo);
                const updateData = {
                    hasIdentify: false,
                    ccCodeChiChar: _coreInfo.ccCodeChiChar,
                    allowSingleNameInput: _coreInfo.allowSingleNameInput
                };
                delete _coreInfo.ccCodeChiChar;
                delete _coreInfo.allowSingleNameInput;
                updateData.patientBaseInfo = {
                    ..._coreInfo
                };
                props.updateState(updateData);
            }
        });
    }, [coreInfo]);

    const isOverSeasDocType = React.useMemo(() => PatientUtil.isOverseasDocType(coreInfo.primaryDocTypeCd), [coreInfo.primaryDocTypeCd]);

    return (
        <CIMSPromptDialog
            open
            id="registration_patient_info_dialog"
            dialogTitle="Patient Information"
            dialogContentText={
                <ValidatorForm ref={formRef} focusFail>
                    <Grid container>
                        <Typography component="div">
                            This PMI contains some patient clinical data, as listed in the table below.<br />
                            Mismatching of patient data may be resulted if you change the PMI identifiers to that of another patient.<br />
                            Please ensure:<br />
                            (1) The data changes you are going to make on this PMI also belongs to the same patient; AND<br />
                            (2) You have meanwhile duly arranged corresponding amendment of all paper clinical records as far as practicable.<br />
                        </Typography>
                        <Typography component="div" variant="h6" style={{ fontWeight: 'bold' }} className={classes.title}>Existing clinical data found under this PMI:</Typography>
                        <CIMSDataGrid
                            gridTheme="ag-theme-balham"
                            divStyle={{
                                width: '100%',
                                height: '25vh',
                                display: 'block'
                            }}
                            gridOptions={{
                                columnDefs: column,
                                rowData: rowData,
                                rowSelection: 'single',
                                getRowHeight: () => 50,
                                getRowNodeId: item => item.rowId.toString(),
                                suppressRowClickSelection: true
                            }}
                        />
                        <Grid item container className={classes.coreInfoTitle}>
                            <Typography variant="h6" style={{ fontWeight: 'bold' }}>Core Information</Typography>
                        </Grid>
                        <Grid item container className={classes.coreInfoContainer}>
                            <Grid item container spacing={3}>
                                <BabyIcon
                                    {...babyIconProps}
                                    id="registration_patient_info_babyIcon"
                                />
                                <Grid item container xs={10} spacing={3}>
                                    <Grid item xs={4}>
                                        <SelectFieldValidator
                                            {...documentTypeProps}
                                            id={'registration_patient_info_documentType'}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <HKIDInput
                                            {...documentNoProps}
                                            id="registration_patient_info_documentNo"
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <SelectFieldValidator
                                            {...priIssueCountryProps}
                                            id={'registration_patient_info_priUssueContry'}
                                            isDisabled={!isOverSeasDocType}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid item xs={2}>
                                    <OutlinedRadioValidator
                                        {...withProvenProps}
                                        id="registration_patient_info_withProvenDocument"
                                        disabled={patientById.idSts === 'N'}
                                    />
                                </Grid>
                                <Grid item container xs={10} spacing={3}>
                                    <Grid item xs={4}>
                                        <FastTextFieldValidator
                                            {...surNameProps}
                                            id="registration_patient_info_surName"
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <FastTextFieldValidator
                                            {...giveNameProps}
                                            id="registration_patient_info_giveName"
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <FastTextFieldValidator
                                            {...otherNameProps}
                                            id="registration_patient_info_otherName"
                                        />
                                    </Grid>
                                </Grid>
                                <Grid item xs={2}>
                                    <FormControlLabel
                                        {...singleNameIndProps}
                                        id="registration_patient_info_singleNameInd"
                                        onChange={e => setCoreInfo({ ...coreInfo, allowSingleNameInput: e.target.checked })}
                                    />
                                </Grid>
                                <Grid item xs={7}>
                                    <RegChCodeField
                                        {...chinaCodeProps}
                                        id="registration_patient_info_chinaCode"
                                        updateChiChar={updateChiChar}
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <FastTextFieldValidator
                                        {...chineseNameProps}
                                        id="registration_patient_info_chineseName"
                                    />
                                </Grid>
                                <Grid item xs={7}>
                                    <RegDateBirthField
                                        {...regDateBirthProps}
                                        id="registration_patient_info_birthField"
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <OutlinedRadioValidator
                                        {...genderProps}
                                        id="registration_patient_info_genderCd"
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </ValidatorForm>
            }
            buttonConfig={[
                {
                    id: 'registration_patient_info_updateBtn',
                    name: 'Update',
                    onClick: mergeCoreInfo
                },
                {
                    id: 'registration_patient_info_closeBtn',
                    name: 'Close',
                    onClick: () => {
                        props.updateState({ hasIdentify: false });
                    }
                }
            ]}
        />
    );
});

const styles = theme => ({
    coreInfoTitle: {
        padding: `${theme.spacing(1)}px ${theme.spacing(1) / 2}px`,
        background: theme.palette.grey[500],
        marginTop: theme.spacing(1)
    },
    coreInfoContainer: {
        border: `1px solid ${theme.palette.grey[500]}`,
        borderBottomLeftRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
        padding: `${theme.spacing(2)}px 60px`
    },
    title: {
        width: '100%'
    }
});
const mapState = state => ({
    patientById: state.registration.patientById,
    patientBaseInfo: state.registration.patientBaseInfo,
    allowSingleNameInput: state.registration.allowSingleNameInput,
    ccCodeChiChar: state.registration.ccCodeChiChar
});
const mapDispatch = {
    getExistClinicalData,
    updateState
};

export default connect(mapState, mapDispatch)(withStyles(styles)(PatientInfoDialog));