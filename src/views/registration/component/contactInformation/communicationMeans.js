import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import moment from 'moment';
import {
    Grid,
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Radio,
    RadioGroup
} from '@material-ui/core';
import {dispatch} from '../../../../store/util';
import classNames from 'classnames';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';
import CIMSTextField from '../../../../components/TextField/CIMSTextField';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import { commMeanBasic } from '../../../../constants/registration/registrationConstants';
import Enum from '../../../../enums/enum';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { pmiSMSCheckingLog } from '../../../../store/actions/registration/registrationAction';
import {auditAction} from '../../../../store/actions/als/logAction';
import * as CommonUtil from '../../../../utilities/commonUtilities';
import ButtonStatusEnum from '../../../../enums/registration/buttonStatusEnum';


const sysRatio = CommonUtil.getSystemRatio();
const unit = CommonUtil.getResizeUnit(sysRatio);

const styles = makeStyles((theme) => ({
    formGroup: {
        height: 39 * unit - 2,
        display: 'flex',
        paddingLeft: '9px',
        justifyContent: 'space-around',
        backgroundColor:theme.palette.cimsBackgroundColor,
        '&$disabled': {
            color: theme.palette.cimsPlaceholderColor,
            borderColor: theme.palette.action.disabled,
            backgroundColor:theme.palette.cimsDisableColor
        },
        '&$errorColor': {
            borderColor: theme.palette.error.main
        }
    },
    radioFormControlLabel: {
        marginLeft: -11,
        marginRight: 70
    },
    checkbox: {
        padding: theme.spacing(1) / 2
    },
    formGroupDisable:{
        backgroundColor:theme.palette.cimsDisableColor
    }
}));

const communciationMeans = (props) => {
    const {
        id,
        meansList,
        cnsntList,
        disabled,
        loginSvc,
        patientContactInfo,
        viewPatDetails,
        patientById,
        siteId,
        loginForm,
        patientOperationStatus
    } = props;
    const classes = styles();
    const { pmiPatientCommMeanList, commLangCd, dtsElctrncCommCnsntSts, dtsElctrncCommCnsntUpdDtm } = patientContactInfo;
    // const cnsntUpdDtm = dtsElctrncCommCnsntUpdDtm ? moment(dtsElctrncCommCnsntUpdDtm).format(Enum.DATE_FORMAT_EDMY_VALUE) : '';

    const handleMeansChange = (checked, item) => {

        let newMeansList = _.cloneDeep(pmiPatientCommMeanList);
        if (!checked) {
            let opMeanIdx = newMeansList.findIndex(mean => mean.commMeanCd === item.value);
            if (item.label === 'SMS') {
                if (patientOperationStatus === ButtonStatusEnum.EDIT) {
                    dispatch(openCommonMessage({
                        msgCode: '110179',
                        btnActions: {
                            btn1Click: () => {
                                dispatch(auditAction('Confirm unsubscribe SMS notifications'));
                                dispatch(pmiSMSCheckingLog({
                                    ipAddr: loginForm.ipInfo.ipAddr,
                                    svcCd: loginSvc,
                                    siteId: siteId,
                                    commMeanCd: Enum.CONTACT_MEAN_SMS,                     //commMeancd should be item.value
                                    actionType: Enum.COMM_MEAN_ACTION,
                                    patientKey: patientById.patientKey
                                }));
                                if (opMeanIdx > -1) {
                                    newMeansList.splice(opMeanIdx, 1);
                                }
                            }
                        }
                    }
                    ));
                } else {
                    if (opMeanIdx > -1) {
                        newMeansList.splice(opMeanIdx, 1);
                    }
                }
            } else {
                if (opMeanIdx > -1) {
                    // newMeansList[opMeanIdx].status = 'D';
                    // newMeansList[opMeanIdx].svcCd=loginSvc;
                    // newMeansList[opMeanIdx].commLangCd = commLangCd;
                    newMeansList.splice(opMeanIdx, 1);
                }
            }
        } else {
            //handle checked new.
            // let opMeanIdx = newMeansList.findIndex(mean => mean.commMeanCd === item.value && mean.status === 'I');
            let newMean = _.cloneDeep(commMeanBasic);
            newMean.svcCd = loginSvc;
            newMean.commMeanCd = item.value;
            // if (opMeanIdx > -1) {
            //     newMeansList[opMeanIdx].status = 'A';
            //     // newMeansList[opMeanIdx].commLangCd = commLangCd;
            // } else {
            newMeansList.push(newMean);
            // }
        }
        props.handleMeansOnChange(newMeansList);
    };

    return (
        <Grid container>
            <FormControl fullWidth>
                <CIMSFormLabel
                    labelText={'Preferred Notification Means'}
                    disabled={disabled}
                >
                    <FormGroup
                        id={`${id}_formGroup`}
                        className={classNames({
                            [classes.formGroupDisable]:disabled,
                            [classes.formGroup]:true
                        })}
                        // disabled={disabled}
                    >
                        {
                            meansList && meansList.map((item, index) =>
                                <FormControlLabel
                                    id={`${id}_${item.value}_checkboxLabel`}
                                    key={index}
                                    name={item.value}
                                    // className={classes.formControlLabel}
                                    value={item.value}
                                    // disabled={disabled||item.spec==='disable'}
                                    disabled={disabled}
                                    label={item.label}
                                    labelPlacement={'end'}
                                    control={
                                        <Checkbox
                                            id={`${id}_${item.value}_checkbox`}
                                            color={'primary'}
                                            className={classes.checkbox}
                                            checked={(pmiPatientCommMeanList && pmiPatientCommMeanList.findIndex(commMean => commMean.commMeanCd === item.value && commMean.status === 'A')) > -1}
                                            onChange={(e) => { handleMeansChange(e.target.checked, item); }}
                                        />}
                                />
                            )
                        }
                    </FormGroup>
                    {
                        loginSvc === 'DTS' && false ?
                            <Grid container>
                                <Grid item container>
                                    <RadioGroup
                                        id={`${id}_cnsnt_radio_group`}
                                        // className={classes.formGroup}
                                        className={classNames({
                                            [classes.formGroupDisable]:disabled,
                                            [classes.formGroup]:true
                                        })}
                                        onChange={(e) => { props.handleConsetChange(e); }}
                                        value={dtsElctrncCommCnsntSts}
                                    >{
                                            cnsntList && cnsntList.map((item, index) =>
                                                <FormControlLabel
                                                    id={`${id}_${item.label}_radio_label`}
                                                    key={index}
                                                    value={item.value}
                                                    disabled={disabled}
                                                    label={item.label}
                                                    labelPlacement={'end'}
                                                    className={classes.radioFormControlLabel}
                                                    control={
                                                        <Radio
                                                            od={`${id}_${item.label}_radio`}
                                                            color={'primary'}
                                                            className={classes.checkbox}
                                                        />}
                                                />
                                            )
                                        }

                                        {/* <FormControlLabel
                                            // id={id + '_' + item.value + '_checkboxLabel'}
                                            // key={index}
                                            // name={item.value}
                                            // className={classes.formControlLabel}
                                            // value={item.value}
                                            // disabled={disabled||item.spec==='disable'}
                                            disabled={disabled}
                                            label={'Without Consent'}
                                            labelPlacement={'end'}
                                            style={{ marginLeft: 35 }}
                                            // checked={value.indexOf(item.value) > -1}
                                            // onChange={e => {
                                            //     const groupDom = document.getElementById(this.props.id + '_formGroup');
                                            //     const cbList = groupDom && groupDom.getElementsByTagName('input');
                                            //     onChange(e, cbList);
                                            // }}
                                            control={
                                                <Radio
                                                    // id={id + '_' + item.value + '_checkbox'}
                                                    color={'primary'}
                                                    // {...CheckBoxProps}
                                                    // className={classNames(classes.checkbox, CheckBoxProps && CheckBoxProps.className)}
                                                    className={classes.checkbox}
                                                />}
                                        // {...FormControlLabelProps}
                                        /> */}
                                    </RadioGroup>
                                </Grid>
                                <Grid item container alignItems={'center'}>
                                    <Grid item container xs={7}>
                                        <CIMSTextField
                                            id={`${id}_dts_elctrnc_comm_cnsnt_upd_dtm_textField`}
                                            label={'Consent Date for e-Communication'}
                                            disabled
                                            variant={'outlined'}
                                            value={dtsElctrncCommCnsntUpdDtm}
                                        />
                                    </Grid>
                                    <Grid item container xs={4}>
                                        <CIMSButton
                                            id={`${id}_clear_consent_sts_btn`}
                                            children={'Clear Consent Status'}
                                            onClick={props.clearConsent}
                                            style={{ display: viewPatDetails ? 'none' : '' }}
                                            disabled={disabled}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            : null
                    }
                </CIMSFormLabel>
            </FormControl>
        </Grid>
    );
};

export default communciationMeans;
