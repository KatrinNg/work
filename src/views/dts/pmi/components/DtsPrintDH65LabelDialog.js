import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../components/CIMSPdfViewer';
import { print } from '../../../../utilities/printUtilities';
import { dtsUpdateState, dtsGetDH65Label } from '../../../../store/actions/dts/patient/DtsPatientSummaryAction';
import { getDefaultRoomList } from '../../../../store/actions/dts/patient/DtsDefaultRoomAction';
import * as commonUtilities from '../../../../utilities/commonUtilities';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { CLINIC_CONFIGNAME } from '../../../../enums/dts/patient/DtsPatientSummaryEnum';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import { Grid } from '@material-ui/core';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import OutlinedRadioValidator from '../../../../components/FormValidator/OutlinedRadioValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import { RADIO_OPTION_YESNO_ONLY } from '../../../../constants/dts/patient/DtsDefaultRoomConstant';
import CommonMessage from '../../../../constants/commonMessage';
import Enum from '../../../../enums/enum';
import memoize from 'memoize-one';
import * as PatientUtil from '../../../../utilities/patientUtilities';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import ContactInformationEnum from '../../../../enums/registration/contactInformationEnum';

const styles = () => ({
    dialogPaper: {
        width: '1100px'
    }
});

class DtsPrintDH65LabelDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomIndex: 0
        };
    }

    componentDidMount = () => {
        this.props.getDefaultRoomList(this.props.patientInfo.patientKey, true);
    };
    handleClose = () => {
        this.props.closeConfirmDialog();
    };

    getPatientAddress = () => {
        const { dh65LabelData, patientInfo, defaultRoomId, rooms, commonCodeList } = this.props;
        memoize(type => {
            const _addressList = patientInfo.addressList || [];
            const _address = _addressList.find(item => item.addressTypeCd === type);
            if (_address) {
                const region = ContactInformationEnum.REGION.find(item => item.code === _address.region);
                const district = commonCodeList.district && commonCodeList.district.find(item => item.code === _address.districtCd);
                const subDistrict = commonCodeList.sub_district && commonCodeList.sub_district.find(item => item.code === _address.subDistrictCd);
                const addrType = _address.addressLanguageCd;
                let value;
                let addressArr = [];
                switch (_address.addressFormat) {
                    case ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS: {
                        addressArr = PatientUtil.loadPatientAddress(_address, region, district, subDistrict, _address.addressFormat, addrType);
                        if (_address.addressLanguageCd === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE) {
                            if (addressArr.length > 0) {
                                value = addressArr.join(', ');
                                value = value.toUpperCase();
                            }
                        } else {
                            if (addressArr.length > 0) {
                                addressArr = addressArr.reverse();
                                value = addressArr.join('');
                            }
                        }
                        break;
                    }
                    case ContactInformationEnum.ADDRESS_FORMAT.FREE_TEXT_ADDRESS: {
                        value = _address.addrTxt || '';
                        break;
                    }
                    case ContactInformationEnum.ADDRESS_FORMAT.POSTAL_BOX_ADDRESS: {
                        addressArr = PatientUtil.loadPatientAddress(_address, region, district, subDistrict, _address.addressFormat, addrType);
                        if (addressArr.length > 0) {
                            if (addrType === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE) {
                                value = `Postal Box ${addressArr.join(', ')}`;
                            } else {
                                value = `${ContactInformationEnum.FIELD_CHI_LABEL.CONTACT_POSTOFFICE_BOXNO} ${addressArr.join(', ')}`;
                            }
                            // value = addressArr.join(', ');
                        }
                        break;
                    }
                    default: {
                        value = '';
                        break;
                    }
                }
                return value;
            }
            return '';
        });
    };
    printDH65 = () => {
        const { dh65LabelData } = this.props;
        const { svcCd, siteId } = this.props.clinic;
        const callback = printSuccess => {
            if (printSuccess) {
                this.closePreviewDialog();
            } else {
                this.props.openCommonMessage({ msgCode: '110041' });
            }
        };
        let params = { base64: dh65LabelData, callback: callback };
        let tempParam = dtsUtilities.getPrintParam(
            params,
            CLINIC_CONFIGNAME.DH65_LABEL_PRINT_QUEUE,
            CLINIC_CONFIGNAME.DH65_LABEL_PRINT_ORIENTATION,
            CLINIC_CONFIGNAME.DH65_LABEL_PRINT_TRAY,
            CLINIC_CONFIGNAME.DH65_LABEL_PRINT_PAPER_SIZE,
            this.props.clinicConfig,
            { siteId, serviceCd: svcCd }
        );
        print(tempParam);
    };

    closePreviewDialog = () => {
        this.props.dtsUpdateState({ openDtsPrintDH65LabelDialog: false, dh65LabelData: null });
    };

    getRoomList = () => {
        let tempPatientRoomList = this.props.defaultRoomList;
        let fullRoomList = this.props.rooms;
        let resultRoomList = [{ roomId: '', rmDesc: '', defaultRoomCd: '' }];
        console.log(tempPatientRoomList);
        console.log(fullRoomList);
        tempPatientRoomList.forEach(room => {
            console.log(room);
            if (this.props.siteId == 121 && room.specialtyId == 10001) {
                let defaultRoom = fullRoomList && fullRoomList.find(item => item.rmId === room.roomId);
                console.log(defaultRoom);
                resultRoomList.push({
                    roomId: defaultRoom != undefined ? room.roomId : '',
                    rmDesc: defaultRoom != undefined && defaultRoom.rmDesc != undefined ? defaultRoom.rmDesc : 'Surgery Room: No record in DB',
                    defaultRoomCd: defaultRoom != undefined && defaultRoom.rmCd != undefined ? defaultRoom.rmCd : ''
                });
            }
        });
        return resultRoomList;
    };

    handleChange = e => {
        const { patientInfo, defaultRoomId, rooms, commonCodeList, dtsGetDH65Label, address } = this.props;
        dtsGetDH65Label({ patientInfo: patientInfo, defaultRoomId: defaultRoomId, selectedRoom: e.value, commonCodeList: commonCodeList, address: address });
    };

    render() {
        const { openConfirmDialog, classes, dh65LabelData, dh65LabelDataChange } = this.props;
        const id = 'printDH65';
        const roomList = this.getRoomList();
        return (
            <CIMSPromptDialog
                open={openConfirmDialog}
                dialogTitle={'Preview >> DH65 Label'}
                classes={{
                    paper: classes.dialogPaper
                }}
                // dialogContentProps={{ style: { width: 400 } }}
                dialogContentText={
                    <>
                        <ValidatorForm onSubmit={() => {}} autoCapitalize="off">
                            <Grid container className={classes.grid} style={{ paddingBottom: '2px' }}>
                                <Grid item xs={3} className={classes.grid}>
                                    <DtsSelectFieldValidator
                                        options={
                                            roomList &&
                                            roomList.map(item => ({
                                                value: item.defaultRoomCd,
                                                label: item.rmDesc
                                            }))
                                        }
                                        id={id}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: (
                                                <>
                                                    Patient Default Room
                                                    <RequiredIcon />
                                                </>
                                            )
                                        }}
                                        value={roomList}
                                        isDisabled={false}
                                        onChange={e => this.handleChange(e)}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        absoluteMessage
                                    />
                                </Grid>
                            </Grid>
                        </ValidatorForm>
                        <CIMSPdfViewer id={`${id}_pdfViewer`} previewData={dh65LabelDataChange} isShowControlBar={false} defaultScale={1.7} />
                    </>
                }
                buttonConfig={[
                    {
                        id: `${id}_printButton`,
                        name: 'Print',
                        disabled: !dh65LabelData,
                        onClick: () => {
                            this.printDH65();
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
        );
    }
}

function mapStateToProps(state) {
    return {
        action: state.dtsPatientSummary.redirect.action,
        patientInfo: state.patient.patientInfo,
        clinicConfig: state.common.clinicConfig,
        specialties: state.dtsDefaultRoom.specialties,
        dialogInfo: state.dtsDefaultRoom.dialogInfo,
        clinic: state.login.clinic,
        siteId: state.login.loginForm.siteId,
        defaultRoomId: state.patient.defaultRoomId,
        rooms: state.common.rooms,
        commonCodeList: state.common.commonCodeList,
        defaultRoomList: state.dtsDefaultRoom.defaultRoomList,
        dh65LabelDataChange: state.dtsPatientSummary.dh65LabelData
    };
}

const mapDispatchToProps = {
    dtsUpdateState,
    getDefaultRoomList,
    dtsGetDH65Label,
    openCommonMessage
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsPrintDH65LabelDialog));
