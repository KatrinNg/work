import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    DialogContent,
    DialogActions,
    Typography,
    ListItem,
    ListItemIcon,
    ListItemText,
    List
} from '@material-ui/core';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import warningIcon from '../../../../images/moe/icon-warning.gif';
import * as moeUtilities from '../../../../utilities/moe/moeUtilities';
import CIMSCheckbox from '../../../../components/CheckBox/CIMSCheckBox';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import ValidatorEnum from '../../../../enums/validatorEnum';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import { ALLERGY_CERTAINTY } from '../../../../enums/moe/moeEnums';

const styles = {
    checkboxBtn: {
        height: 26,
        paddingTop: 0,
        paddingBottom: 0,
        '&$checkboxBtnChecked': {
            height: 26,
            paddingTop: 0,
            paddingBottom: 0
        }
    },
    checkboxBtnChecked: {},
    fullWidth: {
        maxWidth: '100%',
        overflowY: 'unset',
        width: '80%'
    },
    multipleInputRoot: {
        height: 'calc(24*3px)',
        lineHeight: 'inherit'
    }
};


class AllergyDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: 0,
            hasManifestations: true,
            reasonCollect: [0, 0, 0, 0, 0, 0],
            DACRemark: '',
            selectedPrescribe: false,
            disableEnterRemark: true
        };
    }

    handleOnClickCancel = (currentDrug) => {
        this.setState({
            activeStep: 0,
            hasManifestations: true,
            reasonCollect: [0, 0, 0, 0, 0, 0],
            DACRemark: '',
            selectedPrescribe: false,
            disableEnterRemark: true
        });
        this.props.closeAllergyRemark(currentDrug);
    }

    handleSelectPrescribe = (e) => {
        this.setState({
            selectedPrescribe: e.target.value
        });
    }

    handleOnClickOK = () => {
        this.refs.form.submit();
    }

    handleOKAllergyRemark = (drug, reasonCollect, DACRemark) => {
        this.setState({
            activeStep: 0,
            hasManifestations: true,
            reasonCollect: [0, 0, 0, 0, 0, 0],
            DACRemark: '',
            selectedPrescribe: false,
            disableEnterRemark: true
        });
        this.props.handleOKAllergyRemark(drug, reasonCollect, DACRemark);
    }

    remarkOnChange = (e) => {
        let disabled = true;
        if (e.target.value && e.target.value.trim().length > 0) {
            disabled = false;
        }
        this.setState({ disabledOk: disabled });
        this.props.handleUpdateRemark('remarkValue', e.target.value);
    }

    spliteManifestations = (allergyReactions) => {
        if (allergyReactions && allergyReactions.length > 0) {
            let strAllergyReactions = '';
            for (let i = 0; i < allergyReactions.length; i++) {
                strAllergyReactions += allergyReactions[i].displayName ? allergyReactions[i].displayName + ', ' : '';
            }
            return strAllergyReactions.substr(0, strAllergyReactions.length - 2);
        } else {
            this.setState({
                hasManifestations: false
            });
            return '';
        }
    }

    handleChecked = (value) => {
        let reasonCollect = this.state.reasonCollect;
        let { disableEnterRemark, DACRemark } = this.state;
        if (reasonCollect[value - 1] === value)
            reasonCollect[value - 1] = 0;
        else
            reasonCollect[value - 1] = value;
        if (reasonCollect[value - 1] === 0 && value === 6) {
            disableEnterRemark = true;
            DACRemark = '';
        } else if (reasonCollect[value - 1] !== 0 && value === 6) {
            disableEnterRemark = false;
        }
        this.setState({
            isAbleClickOk: this.setAbleClickOk(!disableEnterRemark, DACRemark, reasonCollect),
            reasonCollect,
            disableEnterRemark,
            DACRemark
        });
    }

    handleDACRamrk = (e) => {
        let isAbleClickOk = this.setAbleClickOk(!this.state.disableEnterRemark, e.target.value);
        this.setState({
            isAbleClickOk: isAbleClickOk,
            DACRemark: e.target.value
        });
    }

    handleNext = () => {
        this.setState({
            activeStep: this.state.activeStep + 1
        });
    }

    handleBack = () => {
        this.setState({
            activeStep: this.state.activeStep - 1
        });
    }

    setAbleClickOk = (isAbleEnterRemark, hLABRemarkVal, ckbList) => {
        let isAbleClickOk = true;
        if (isAbleEnterRemark && hLABRemarkVal.length === 0) {
            isAbleClickOk = false;
        }
        if (ckbList) {
            let existCheck = ckbList.find((value) => {
                if (value) return true;
            }) ? true : false;
            if (!existCheck) isAbleClickOk = false;
        }
        return isAbleClickOk;
    }

    render() {
        const { id, classes, open, allergyDrugList, drugIndex } = this.props;
        let currentDrug = null;
        if (allergyDrugList && allergyDrugList.length > 0) {
            currentDrug = allergyDrugList[drugIndex];
        }
        //const isAllergy = currentDrug && currentDrug.vtm && currentDrug.freeText !== 'F';
        const DACReason = moeUtilities.getDACReasonCodelist();
        const dialogTitle = 'Drug Allergy Checking';

        return (
            <Typography component="div">
                < CIMSDialog
                    id={id}
                    open={open}
                    //open={open && currentDrug}
                    dialogTitle={dialogTitle}
                    classes={{
                        paper: classes.fullWidth
                    }}
                >
                    <DialogContent>
                        <ValidatorForm ref={'form'} onSubmit={() => this.handleOKAllergyRemark(currentDrug, this.state.reasonCollect, this.state.DACRemark)}>
                            <Typography component="div">
                                {/* <Typography
                                        variant="subtitle2"
                                        className={classes.dialogSubTitle}
                                    >Drug Allergy Checking</Typography> */}
                                <Grid container>
                                    <Grid item>
                                        <img src={warningIcon} alt={''} />
                                    </Grid>
                                    {currentDrug ?
                                        <Grid item style={{ paddingLeft: '10px' }}>
                                            {currentDrug.patientAllergies.map((item, i) => {
                                                return (
                                                    <Typography component="div" key={i}>
                                                        <Typography>
                                                            {currentDrug.patientAllergies.length > 1 ? i + 1 + '. ' : ''}This patient has <label style={{ fontWeight: 'bolder' }} >{ALLERGY_CERTAINTY[item.certainty]}</label> drug allergy to <label style={{ color: 'red' }} >{item.allergen}</label>.
                                                                {item.allergyReactions && item.allergyReactions.length > 0 ?
                                                                <label> The clinical manifestation was <label style={{ fontWeight: 'bolder' }} >{this.spliteManifestations(item.allergyReactions)}</label>.</label>
                                                                : ''}
                                                        </Typography>
                                                        <Typography>
                                                            <label style={{ color: 'red' }} >{currentDrug.patientMedication.screenDisplay}</label> may result in <label style={{ fontWeight: 'bolder' }} >{item.reactionLevel}</label>.
                                                            </Typography>
                                                    </Typography>
                                                );
                                            })
                                            }
                                        </Grid>
                                        :
                                        null
                                    }
                                </Grid>
                                <Typography>
                                    If you wish to prescribe anyway, you must provide the reason(s) for overriding this alert:
                                    </Typography>
                                <List>
                                    {DACReason.map((item, i) => {
                                        return (
                                            <ListItem button key={i} style={{ height: '30px' }} onClick={() => this.handleChecked(item.id)}>
                                                <ListItemIcon>
                                                    <CIMSCheckbox
                                                        id={id + '_CheckBox_' + i}
                                                        checked={this.state.reasonCollect[i] === item.id}
                                                        tabIndex={-1}
                                                        disableRipple
                                                    />
                                                </ListItemIcon>
                                                <ListItemText primary={item.value} />
                                            </ListItem>
                                        );
                                    })}
                                </List >
                                Remark
                                <TextFieldValidator
                                    id={id + '_DACRemarkInputBase'}
                                    fullWidth
                                    autoComplete={'off'}
                                    value={this.state.DACRemark || ''}
                                    onChange={(e) => this.handleDACRamrk(e)}
                                    multiline
                                    rows={'3'}
                                    trim={'all'}
                                    inputProps={{
                                        maxLength: 255
                                    }}
                                    disabled={this.state.disableEnterRemark}
                                    InputProps={{
                                        classes: { root: classes.multipleInputRoot }
                                    }}
                                    notShowMsg
                                    validators={!this.state.disableEnterRemark ? [ValidatorEnum.required] : []}
                                />
                            </Typography>
                        </ValidatorForm>
                    </DialogContent>
                    <DialogActions>
                        <CIMSButton
                            onClick={() => this.handleOnClickOK()}
                            id={id + '_ConfirmCIMSButton'}
                            disabled={this.state.isAbleClickOk ? false : true}
                        >Prescribe with reason</CIMSButton>
                        <CIMSButton onClick={() => this.handleOnClickCancel(currentDrug)} id={id + '_BackCIMSButton'}>Do not Prescribe</CIMSButton>
                    </DialogActions>
                </CIMSDialog >
            </Typography>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        codeList: state.moe.codeList,
        selectedDeletedList: state.moe.selectedDeletedList
    };
};
const mapDispatchToProps = {
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AllergyDialog));