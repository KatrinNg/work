import React, { Component, useState } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { connect } from 'react-redux';
import Paper from '@material-ui/core/Paper';

import TextFieldValidator from '../../../../../components/FormValidator/TextFieldValidator';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';

import CIMSPromptDialog from '../../../../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../../components/CIMSPdfViewer';
import { print } from '../../../../../utilities/printUtilities';
import {
    setRedirect,
    dtsSearchPatient,
    dtsUpdateState,
    dtsOpenPreviewWindow,
    dtsSetAddressLabel,
    dtsSetAddressLabelList
} from '../../../../../store/actions/dts/patient/DtsPatientSummaryAction'; //DH Anthony

import * as commonUtilities from '../../../../../utilities/commonUtilities';
import { CLINIC_CONFIGNAME, REDIRECT_ACTION_TYPE } from '../../../../../enums/dts/patient/DtsPatientSummaryEnum';
import DtsPrintAddressLabelDialog from '../DtsPrintAddressLabelDialog';

const initialAddress = {
    name: "None",
    address: null
};

const styles = ({
    root: {
        boxShadow:'none !important',
        '& .MuiInputBase-input':{
            fontSize:'14px',
            height:'30px'
        },
        '& .MuiInputLabel-outlined':{
            fontSize: '14px',
            transform: 'translate(10px, 8px) scale(1)'
        },
        '& .MuiInputLabel-outlined.MuiInputLabel-shrink':{
            fontSize: '12px',
            color:'#585858',
            transform: 'translate(5px, -5px) scale(1)',
            backgroundColor: '#ffffff30'
        },
        '& .MuiFormLabel-root.Mui-disabled':{
            color:'rgb(165 165 165)'
        }
    },
    input:{
        fontSize:'14px',
        height:'30px'
    },
    row: {
        width: 480
    },
    dialogPaper: {
        width: '1200px'
    },
    eachPatientInfo: {
        // border: '1px solid #cccccc30',
        boxShadow:'0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)',
        borderRadius: '10px',
        padding: '5px',
        margin: '1px 17px 30px 5px',
        maxWidth: '48%'
    },
    menuItemSelect: {
        height: '25px !important',
        minHeight: '25px'
    },
    addressSelect: {
        width: 500,
        minHeight: 10,
        margin: '10px 0px 0px 5px',
        '& .MuiInput-formControl':{
            'marginTop':'0px'
        },
        '& .MuiInputBase-input': {
            paddingTop: '10px',
            marginBottom: '-8px'
        },
        '& .MuiInputLabel-outlined':{
            color:'rgb(216 216 216)'
        }
    },
    engSurname: {
        width: 140,
        margin: '10px 10px 10px 10px'
    },
    engGivename: {
        width: 140,
        margin: '10px 10px 10px 5px'
    },
    fullEngName: {
        width: 343,
        margin: '10px 0px 0px 5px',
        backgroundColor:'rgb(239 239 239)'
    },
    engNameOrder: {
        width: 242,
        fontSize: '12px',
        margin: '8px 0px 0px 5px',
        '& .MuiFormControlLabel-label.Mui-disabled':{
            color: 'rgb(216 216 216)'
        }
    },
    nameChiField: {
        width: 160,
        margin: '10px 0px 0px 5px',
        backgroundColor:'rgb(239 239 239)'
    },
    patientKeyInput: {
        width: 260,
        margin: '5px 0px 0px 5px'
    },
    showAddressField: {
        width: 510,
        margin: '10px 0px 10px 5px',
        backgroundColor:'rgb(239 239 239)',
        '& .MuiInputBase-input':{
            fontSize:'14px',
            height:'48px !important'
        }
    },
    hrBar: {
        border: '1px solid #ccc',
        marginBottom: '35px'
    },
    patientKeyLabel: {
        display: '-webkit-inline-box',
        margin: '0px',
        paddingTop: '10px'
    },
    radioLabel: {
        fontSize: '12px'
    }
});

class DtsPatientInformationFrom extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: '',
            address: '',
            regexp: /^[0-9\b]+$/,
            dtsPreviewAddressLabelDialogOpen: false,
            inputPatientKeyList: [
                '', '', '', '', '', '', '', '',
                '', '', '', '', '', '', '', ''
            ],
            oldInputPatientKeyList: [
                '', '', '', '', '', '', '', '',
                '', '', '', '', '', '', '', ''
            ]
        };
    }
    handleAddressChange = (e, idx) => {
        let addressIndex = 0;
        for (let i = 0; i < this.props.addressLabelList[idx].result.length; i++) {
            if (this.props.addressLabelList[idx].result[i].fullAddress === e.target.value) {
                this.setState({ address: this.props.addressLabelList[idx].result[i].fullAddress });
                addressIndex = i;
                break;
            }
        }
        let tempAddress = this.props.addressLabelList[idx];
        tempAddress.patientKey = this.state.inputPatientKeyList[idx];
        tempAddress.address = e.target.value;
        tempAddress.selectedAddressIndex = addressIndex;

        if (tempAddress.engNameOrder == '' || tempAddress.engNameOrder == undefined)
            tempAddress.engNameOrder = 'SURN';

        console.log(addressIndex);
        this.props.dtsSetAddressLabel(tempAddress, idx);
    }
    handleEnglishNameOrderChange = (e, idx) => {
        let tempAddress = this.props.addressLabelList[idx];
        tempAddress.engNameOrder = e.target.value;
        tempAddress.patientKey = this.state.inputPatientKeyList[idx];
        console.log(e.target.value);
        console.log(this.state);
        this.props.dtsSetAddressLabel(tempAddress, idx);
    }
    // onChangeEnglishName = (idx) => {
    //     (this.props.addressLabelList[idx]) ? (
    //         (this.props.addressLabelList[idx].engNameOrder == "GIVEN" ?
    //             (
    //                 ((this.props.addressLabelList[idx].engGivename) ? this.props.addressLabelList[idx].engGivename : '')
    //                 +
    //                 ((this.props.addressLabelList[idx].engGivename && this.props.addressLabelList[idx].engSurname) ? ', ' : '')
    //                 +
    //                 ((this.props.addressLabelList[idx].engSurname) ? this.props.addressLabelList[idx].engSurname : '')
    //             )
    //             :
    //             (
    //                 ((this.props.addressLabelList[idx].engSurname) ? this.props.addressLabelList[idx].engSurname : '')
    //                 +
    //                 ((this.props.addressLabelList[idx].engGivename && this.props.addressLabelList[idx].engSurname) ? ', ' : '')
    //                 +
    //                 ((this.props.addressLabelList[idx].engGivename) ? this.props.addressLabelList[idx].engGivename : '')
    //             )
    //         )
    //     ) : '';
    // };
    handleClose = () => {
        let tempPatientKeyList = [
            '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', ''
        ];
        this.setState({ inputPatientKeyList: tempPatientKeyList });
        this.props.dtsSetAddressLabelList(
            [{}, {}, {}, {}, {}, {}, {}, {},
            {}, {}, {}, {}, {}, {}, {}, {}]);
        this.props.closeConfirmDialog();
    };
    updatePatientKey = (event, idx) => {
        let tempPatientKeyList = [...this.state.inputPatientKeyList];
        if (event.target.value === "" || this.state.regexp.test(event.target.value)) {
            tempPatientKeyList[idx] = event.target.value;
            this.setState({ inputPatientKeyList: tempPatientKeyList });
        }
    }

    searchPatient = (event, idx) => {
        let tempNewPatientKeyList = [...this.state.inputPatientKeyList];
        let tempOldPatientKeyList = [...this.state.oldInputPatientKeyList];
        if ((event.keyCode == 13)  && (tempOldPatientKeyList[idx] != tempNewPatientKeyList[idx])) {
            tempOldPatientKeyList[idx] = event.target.value;
            console.log(tempNewPatientKeyList);
            console.log(tempOldPatientKeyList);
            this.props.dtsSearchPatient({ patientInfo: event.target.value }, idx);
            this.setState({ oldInputPatientKeyList: tempOldPatientKeyList });
        }
    }
    searchPatientWhenLoseFocus = (event, idx) => {
        let tempNewPatientKeyList = [...this.state.inputPatientKeyList];
        let tempOldPatientKeyList = [...this.state.oldInputPatientKeyList];
        if ((event.target.value != "") && (tempOldPatientKeyList[idx] != tempNewPatientKeyList[idx])) {
            tempOldPatientKeyList[idx] = event.target.value;
            console.log(tempNewPatientKeyList);
            console.log(tempOldPatientKeyList);
            this.props.dtsSearchPatient({ patientInfo: event.target.value }, idx);
            this.setState({ oldInputPatientKeyList: tempOldPatientKeyList });
        }
    }
    handlePreivewDtsAddressLabelClick = () => {
        this.props.dtsOpenPreviewWindow({ action: REDIRECT_ACTION_TYPE.PRINT_ADDRESS_LABEL, addressInfo: this.props.addressLabelList });
    }
    handleCloseDtsPreviewAddressLabelDialog = () => {
        this.props.dtsUpdateState({ dtsPreviewAddressLabelDialogOpen: false, pmiAddressData: null });
        this.handleClose();
    }
    checkAddress = (eachAddressLabel) => {
        return (eachAddressLabel.address != "" && eachAddressLabel.address != undefined);
    }
    generatePatientAddress = (idx, classes) => {
        return (
            <>
                <Grid item container xs={12} sm={6} className={classes.eachPatientInfo}>
                    <Grid item className={classes.patientKeyInput}>
                        <p className={classes.patientKeyLabel}>{idx + 1}. </p>
                        <TextField
                            id={'patientKeyInput'}
                            variant="outlined"
                            label={'Patient Key'}
                            onKeyDown={e => this.searchPatient(e, idx)}
                            onBlur={e => this.searchPatientWhenLoseFocus(e, idx)}
                            onChange={e => this.updatePatientKey(e, idx)}
                            // value={(this.props.addressLabelList[idx]) ? this.props.addressLabelList[idx].patientKey : ''}
                            value={this.state.inputPatientKeyList[idx]}
                            trim={'all'}
                        />
                    </Grid>
                    <Grid item className={classes.engNameOrder}>
                        <RadioGroup
                            row aria-label="position"
                            name="engNameOrder"
                            onChange={e => this.handleEnglishNameOrderChange(e, idx)}
                            defaultValue="SURN"
                            value={this.props.addressLabelList[idx].engNameOrder}
                        >
                            <FormControlLabel value="SURN"
                                control={
                                    <Radio
                                        disabled={(this.props.addressLabelList[idx].address != "" && this.props.addressLabelList[idx].address) ? false : true}
                                        color="primary"
                                        style={{ padding: '2px' }}
                                    />
                                }
                                label="Surname First"
                                classes={{ label: classes.radioLabel }}
                            />
                            <FormControlLabel value="GIVEN"
                                control={
                                    <Radio
                                        disabled={(this.props.addressLabelList[idx].address != "" && this.props.addressLabelList[idx].address) ? false : true}
                                        color="primary"
                                        style={{ padding: '2px' }}
                                    />
                                }
                                label="Given Name First"
                                classes={{ label: classes.radioLabel }}
                            />
                        </RadioGroup>
                    </Grid>
                    <FormControl variant="outlined" className={classes.addressSelect}>
                        <InputLabel htmlFor="outlined-age-native-simple">Address</InputLabel>
                        <Select
                            id="AddressList"
                            variant="outlined"
                            value={this.props.addressLabelList[idx].address}
                            onChange={e => this.handleAddressChange(e, idx)}
                            disabled={this.props.addressLabelList[idx].result ? false: true}
                        >

                            {this.props.addressLabelList[idx].result != undefined ? this.props.addressLabelList[idx].result.map(address => (
                                <MenuItem value={address.fullAddress} key={address.addressId}>
                                    {address.fullAddress}
                                </MenuItem>)
                            ) : null}
                        </Select>
                    </FormControl>
                    <Grid item className={classes.fullEngName}>
                        <TextFieldValidator
                            id={'fullEngName'}
                            variant="outlined"
                            label="English Name"
                            disabled
                            value={
                                (this.props.addressLabelList[idx] && this.props.addressLabelList[idx].address != "") ? (
                                    (this.props.addressLabelList[idx].engNameOrder == "GIVEN" ?
                                        (
                                            ((this.props.addressLabelList[idx].engGivename) ? this.props.addressLabelList[idx].engGivename : '')
                                            +
                                            ((this.props.addressLabelList[idx].engGivename && this.props.addressLabelList[idx].engSurname) ? ', ' : '')
                                            +
                                            ((this.props.addressLabelList[idx].engSurname) ? this.props.addressLabelList[idx].engSurname : '')
                                        )
                                        :
                                        (
                                            ((this.props.addressLabelList[idx].engSurname) ? this.props.addressLabelList[idx].engSurname : '')
                                            +
                                            ((this.props.addressLabelList[idx].engGivename && this.props.addressLabelList[idx].engSurname) ? ', ' : '')
                                            +
                                            ((this.props.addressLabelList[idx].engGivename) ? this.props.addressLabelList[idx].engGivename : '')
                                        )
                                    )
                                ) : 
                                (
                                    ((this.props.addressLabelList[idx].engSurname) ? this.props.addressLabelList[idx].engSurname : '')
                                    +
                                    ((this.props.addressLabelList[idx].engGivename && this.props.addressLabelList[idx].engSurname) ? ', ' : '')
                                    +
                                    ((this.props.addressLabelList[idx].engGivename) ? this.props.addressLabelList[idx].engGivename : '')
                                )
                            }
                            validByBlur
                            msgPosition="bottom"
                            trim={'all'}
                        />
                    </Grid>

                    <Grid item className={classes.nameChiField}>
                        <TextFieldValidator
                            id={'nameChi'}
                            variant="outlined"
                            label="Chinese Name"
                            disabled
                            value={(this.props.addressLabelList[idx] && this.props.addressLabelList[idx].address != "") ? this.props.addressLabelList[idx].chiName : ''}
                            validByBlur
                            msgPosition="bottom"
                            trim={'all'}
                        />
                    </Grid>

                    <Grid item className={classes.showAddressField}>
                        <TextFieldValidator
                            id={'showAddressField'}
                            variant="outlined"
                            label="Address"
                            disabled
                            multiline
                            rows={4}
                            value={this.props.addressLabelList[idx].address != '' ? this.props.addressLabelList[idx].address : null}
                            validByBlur
                            msgPosition="bottom"
                            trim={'all'}
                        />
                    </Grid>
                </Grid>
            </>
        );
    }

    render() {
        const { classes, className, openConfirmDialog, addressLabel, pmiAddressData, dtsPreviewAddressLabelDialogOpen } = this.props;
        console.log("Renderrrrrrrrrr");
        console.log(this.props);
        console.log(this.props.addressLabelList.some(this.checkAddress));
        const id = 'PmiPatientAddress';
        // let isEmptyAddress = (eachAddressLabel) => (eachAddressLabel.address == "" || eachAddressLabel.address == undefined);
        return (
            <>
                <CIMSPromptDialog
                    open={openConfirmDialog}
                    dialogTitle={'Print Patient Address Mailing Label ( Model: APLI 2418 / Unistat U4267 / AVERY L7162 )'}
                    classes={{
                        paper: classes.dialogPaper
                    }}
                    dialogContentText={
                        <div style={{ maxHeight: '800px' }}>
                            <Paper className={classes.root + ' ' + className}>
                                <ValidatorForm ref="PmiAddressForm" style={{ display: 'inline' }}>
                                    <Grid container>
                                        {
                                            this.props.addressLabelList &&
                                            this.props.addressLabelList.map((addressLabel, idx) => {
                                                return (this.generatePatientAddress(idx, classes));
                                            })

                                        }
                                    </Grid>
                                </ValidatorForm>
                            </Paper>
                        </div>

                    }
                    buttonConfig={[
                        {
                            id: `${id}_previewButton`,
                            name: 'Preview',
                            disabled: !this.props.addressLabelList.some(this.checkAddress),
                            onClick: () => {
                                this.handlePreivewDtsAddressLabelClick();
                            }
                        },
                        {
                            id: `${id}_closeButton`,
                            name: 'Cancel',
                            onClick: () => {
                                this.handleClose();
                            }
                        }
                    ]}
                />
                <DtsPrintAddressLabelDialog
                    openConfirmDialog={dtsPreviewAddressLabelDialogOpen}
                    closeConfirmDialog={this.handleCloseDtsPreviewAddressLabelDialog}
                    closeParentDialog={this.handleClose}
                    pmiAddressData={pmiAddressData}
                />
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patientInfo: state.patient.patientInfo,
        addressLabelList: state.dtsPatientSummary.addressLabelList,
        pmiAddressData: state.dtsPatientSummary.pmiAddressData,
        dtsPreviewAddressLabelDialogOpen: state.dtsPatientSummary.dtsPreviewAddressLabelDialogOpen
    };
};

const mapDispatchToProps = {
    dtsSearchPatient,
    dtsOpenPreviewWindow,
    dtsUpdateState,
    dtsSetAddressLabel,
    dtsSetAddressLabelList
};

DtsPatientInformationFrom.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsPatientInformationFrom));