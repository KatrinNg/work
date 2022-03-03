import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
    makeStyles,
    Grid
} from '@material-ui/core';
import _ from 'lodash';
import Enum from '../../../../enums/enum';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import AddRemoveButtons from '../../../../components/Buttons/AddRemoveButtons';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import { hlthEduRcmdBasic } from '../../../../constants/consultation/careAndTreatmentPlan/ctpConstants';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import * as CTPUtil from '../../../../utilities/ctpUtilities';

const styles = makeStyles((theme) => ({
    dialogPaper: {
        width: '75%'
    },
    formLblRoot: {
        padding: 16,
        marginTop: 16
    },
    fromLblCustom: {
        color: theme.palette.black,
        transform: 'translate(20px, -9px) scale(1.0)',
        fontWeight: 'bold'
    }
}));

const HlthEduRcmd = (props) => {
    const { tdHlthEduRcmdList, id, eduCatgrtyList, hlthEduTypeList } = props;

    const handleDetailsOnChange = (value, name, idx) => {
        let list = _.cloneDeep(tdHlthEduRcmdList);
        list[idx][name] = value;
        props.handleHlthEduRcmdOnchange(list);
    };

    const disabledRemoveBtn = CTPUtil.disableRemoveCTPBtn(tdHlthEduRcmdList);
    return (
        <Grid container>
            <Grid item container xs={12}>
                {tdHlthEduRcmdList.map((item, index) => (
                    <Grid container key={index} style={{ marginTop: 8 }} spacing={2}>
                        <Grid item xs={3}>
                            <SelectFieldValidator
                                id={`${id}_category_${index + 1}`}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Category{(item.eduCatgryCd || item.eduRcmdDesc || item.hlthEduTypeCd) ? <RequiredIcon /> : null}</>
                                }}
                                fullWidth
                                addNullOption
                                options={eduCatgrtyList.map(item => ({ value: item.code, label: item.engDesc }))}
                                value={item.eduCatgryCd}
                                onChange={e => handleDetailsOnChange(e.value, 'eduCatgryCd', index)}
                                validators={(item.eduCatgryCd || item.eduRcmdDesc || item.hlthEduTypeCd) ? [ValidatorEnum.required] : []}
                                errorMessages={(item.eduCatgryCd || item.eduRcmdDesc || item.hlthEduTypeCd) ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <SelectFieldValidator
                                id={`${id}_type_${index + 1}`}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Type</>
                                }}
                                fullWidth
                                options={hlthEduTypeList.map(item => ({ value: item.code, label: item.engDesc }))}
                                value={item.hlthEduTypeCd}
                                onChange={e => handleDetailsOnChange(e.value, 'hlthEduTypeCd', index)}

                            />
                        </Grid>
                        <Grid item xs={5}>
                            <FastTextFieldValidator
                                id={`${id}_details_${index + 1}`}
                                multiline
                                rows={4}
                                calActualLength
                                inputProps={{ maxLength: 1000 }}
                                variant={'outlined'}
                                label={'Details'}
                                value={item.eduRcmdDesc}
                                onBlur={e => handleDetailsOnChange(e.target.value, 'eduRcmdDesc', index)}
                            // disabled={isSelected}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            <AddRemoveButtons
                                id={`${id}_add_remove_btn_${index + 1}`}
                                AddButtonProps={{
                                    onClick: props.handleAdd
                                    // disabled: context.isNonEdit
                                }}
                                RemoveButtonProps={{
                                    onClick: () => props.handleDelete(index),
                                    disabled: disabledRemoveBtn
                                }}
                            />
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        </Grid>
    );
};

const CreateAndUpdateCTPDialog = (props) => {
    const {
        tdHlthEduRcmdList, id, open,
        ctrlCreateAndUpdateDialog, eduCatgrtyList, hlthEduTypeList,
        flwUp, hasTdCTP, encounterDateStr
    } = props;

    const classes = styles();

    const [flwUpBK, setFlwUpBK] = useState(() => {
        return '';
    });
    const [ctpBK, setCTPBK] = useState(() => {
        return null;
    });


    useEffect(() => {
        setFlwUpBK(flwUp);
        setCTPBK(tdHlthEduRcmdList);
    }, [open]);

    const handleDialogClose = () => {
        if (CTPUtil.checkCTPDataIsDirty(flwUp, flwUpBK, tdHlthEduRcmdList, ctpBK)) {
            props.openCommonMessage({
                msgCode: '110054',
                btnActions: {
                    btn1Click: () => {
                        ctrlCreateAndUpdateDialog(false);
                    }
                }
            });
        } else {
            ctrlCreateAndUpdateDialog(false);
        }
    };

    const updateTdCTPData = (updateData) => {
        props.updateField(updateData);
    };

    const handleFlwUpChange = (value) => {
        updateTdCTPData({ flwUp: value });
    };

    const handleHlthEduRcmdOnchange = (list) => {
        updateTdCTPData({ tdHlthEduRcmdList: list });
    };

    const handleSubmit = () => {
        let submitList = [];
        tdHlthEduRcmdList.forEach(el => {
            if (el.eduCatgryCd || el.eduRcmdDesc || el.hlthEduTypeCd) {
                submitList.push(el);
            }
        });
        let params = {
            flowUpDesc: flwUp,
            ctpEduRcmdList: _.cloneDeep(submitList)
        };
        props.handleSubmitTdCtp(params);
    };

    const flag = CTPUtil.checkCtpDataIsBlank(flwUp, tdHlthEduRcmdList, hasTdCTP);

    const handleAdd = () => {
        let newHlthEduRcmd = _.cloneDeep(hlthEduRcmdBasic);
        let list = _.cloneDeep(tdHlthEduRcmdList);
        list.push(newHlthEduRcmd);
        updateTdCTPData({ tdHlthEduRcmdList: list });
    };

    const handleDelete = (idx) => {
        let list = _.cloneDeep(tdHlthEduRcmdList);
        props.openCommonMessage({
            msgCode: '110502',
            btnActions: {
                btn1Click: () => {
                    if (list.length === 1) {
                        let newList = [];
                        newList.push(_.cloneDeep(hlthEduRcmdBasic));
                        updateTdCTPData({ tdHlthEduRcmdList: newList });
                    } else {
                        list.splice(idx, 1);
                        updateTdCTPData({ tdHlthEduRcmdList: list });
                    }
                }
            }
        });

    };

    const ctpFromRef = React.createRef();
    return (
        <CIMSPromptDialog
            open={open}
            id={id}
            dialogTitle={'Create & Update CTP'}
            classes={{ paper: classes.dialogPaper }}
            dialogContentText={
                < Grid container>
                    <Grid item container style={{ fontSize: 20 }}>
                        <b>Date: {encounterDateStr}</b>
                    </Grid>
                    <Grid item container>
                        <ValidatorForm
                            style={{ width: '100%' }}
                            id={`${id}_form`}
                            ref={ctpFromRef}
                            onSubmit={handleSubmit}
                        >
                            <Grid item container>
                                <CIMSFormLabel
                                    fullWidth
                                    labelText={'Follow Up'}
                                    className={classes.formLblRoot}
                                    FormLabelProps={{ className: classes.fromLblCustom }}
                                >
                                    <Grid container>
                                        <FastTextFieldValidator
                                            id={'followUp_details_textField'}
                                            multiline
                                            rows={4}
                                            calActualLength
                                            inputProps={{ maxLength: 1000 }}
                                            variant={'outlined'}
                                            label={'Details'}
                                            value={flwUp}
                                            onBlur={e => handleFlwUpChange(e.target.value)}
                                        // disabled={isSelected}
                                        />
                                    </Grid>
                                </CIMSFormLabel>
                            </Grid>
                            <Grid item container style={{ maxHeight: 545 }}>
                                <CIMSFormLabel
                                    fullWidth
                                    labelText={'Health Education / Recommendation'}
                                    className={classes.formLblRoot}
                                    FormLabelProps={{ className: classes.fromLblCustom }}
                                >
                                    <HlthEduRcmd
                                        id={'hlth_edu_recommendation_summary'}
                                        tdHlthEduRcmdList={tdHlthEduRcmdList}
                                        eduCatgrtyList={eduCatgrtyList}
                                        hlthEduTypeList={hlthEduTypeList}
                                        handleHlthEduRcmdOnchange={handleHlthEduRcmdOnchange}
                                        handleAdd={handleAdd}
                                        handleDelete={handleDelete}
                                    />
                                </CIMSFormLabel>
                            </Grid>
                        </ValidatorForm>
                    </Grid>
                </Grid>
            }
            dialogActions={
                <Grid container wrap="nowrap" justify="flex-end">
                    <CIMSButton
                        id={`${id}_saveBtn`}
                        onClick={() => { ctpFromRef.current.submit(); }}
                        disabled={flag}
                    >Save</CIMSButton>
                    <CIMSButton
                        id={`${id}_cancelBtn`}
                        onClick={handleDialogClose}
                    >Cancel</CIMSButton>
                </Grid>
            }
        />
    );

};

export default CreateAndUpdateCTPDialog;