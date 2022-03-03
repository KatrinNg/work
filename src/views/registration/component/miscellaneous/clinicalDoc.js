import React, { Component } from 'react';
import { connect } from 'react-redux';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import Button from '@material-ui/core/Button';
import { DialogActions, DialogContent, Grid } from '@material-ui/core';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSSelect from '../../../../components/Select/CIMSSelect';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import {
    uploadDocument,
    getDocumentList,
    getEncntrDocumentList,
    getSingleDocument,
    deleteSingleDocument
} from '../../../../store/actions/clinicalDoc/clinicalDocAction';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import {
    print,
    openErrorMessage,
    openCommonCircular,
    closeCommonCircular
} from '../../../../store/actions/common/commonAction';
import CIMSCompatViewerDialog from '../../../../components/Dialog/CIMSCompatViewerDialog';
import { auditAction } from '../../../../store/actions/als/logAction';
import DWT from '../../../scanner/DynamsoftSDK';
import CloseIcon from '@material-ui/icons/Close';
import * as siteParamsUtilities from '../../../../utilities/siteParamsUtilities';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import Typography from '@material-ui/core/Typography';
import Enum from '../../../../enums/enum';
import moment from 'moment';

const ClinicalDocDialog = (props) => {
    const {
        isClinicalDocDialogOpen,
        isUploadFormDialogOpen,
        isPDFViewerDialogOpen,
        isScannerDialogOpen,
        handleLevelOneStateChange,
        getSingleDocument,
        clinicalDocList,
        clinicalEncntrDocList,
        inDocumentTypeList,
        inDocumentDto,
        deleteSingleDocument,
        clinicConfig,
        isEncounter,
        serviceCd,
        siteId,
        encounterInfo,
        displayName,
        auditAction
    } = props;

    const ViewPdfBtn = (props) => {
        const {
            data
        } = props;

        return (
            <CIMSButton
                id="ViewPdfBtn"
                onClick={(e) => {
                    auditAction('Click View in Clinical document dialog');

                    getSingleDocument(data.inDocId, () => {
                        let fileExtension = data.fileType;

                        const allowedFileExtension = ['pdf', 'jpeg', 'jpg', 'png', 'gif'];

                        allowedFileExtension.find((item) => {
                            if (item === ((/[.]/.exec(data.docName)) ? /[^.]+$/.exec(data.docName)[0].toLowerCase() : undefined)) {
                                return fileExtension = item;
                            }

                            return fileExtension;
                        });

                        if (fileExtension) {
                            handleLevelOneStateChange('inDocId', data.inDocId);
                            handleLevelOneStateChange('isPdf', fileExtension === 'pdf');
                            handleLevelOneStateChange('fileExtension', fileExtension);
                            handleLevelOneStateChange('isPDFViewerDialogOpen', !isPDFViewerDialogOpen);
                        }
                    });
                }}
                style={{height: '35px'}}
            >
                View
            </CIMSButton>
        );
    };

    const column = [
            {
                headerName: 'Upload Date Time',
                field: 'createDtm'
            },
            {
                headerName: 'Created By',
                field: 'createBy'
            },
            {
                headerName: 'Document Type',
                field: 'inDocTypeId',
                valueGetter: (params) => {
                    const findValue = inDocumentTypeList.fullList.find(x => x.inDocTypeId === params.data.inDocTypeId);

                    return findValue ? findValue.inDocTypeDesc : '';
                }
            },
            {
                headerName: 'Service',
                field: 'svcCd',
                maxWidth: 130
            },
            {
                headerName: 'Remark',
                field: 'docRemark'
            },
            {
                headerName: 'View',
                colId: 'action',
                minWidth: 130,
                maxWidth: 130,
                cellRenderer: 'viewPDFBtn',
                // cellRendererParams: callbacks,
                cellStyle: params => {
                    let cellStyle = {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    };
                    return cellStyle;
                },
                filter: false,
                pinned: 'right'
            }
        ],
        // Only Show selected encounter Id doc
        rowData = isEncounter ? clinicalEncntrDocList.filter(x => x.encntrId === encounterInfo.encounterId && x.sbmtOcsnIndt === 'E') || []
                : clinicalDocList.filter(x => x.sbmtOcsnIndt === 'P') || [];

    return (
        <CIMSPromptDialog
            open={isClinicalDocDialogOpen}
            id="ClinicalDocDialog"
            dialogTitle={displayName ?? 'Clinical Document'}
            dialogContentText={
                <div>
                    <CIMSButton
                        id={'clinicalDoc_upload_button'}
                        onClick={() => {
                            props.auditAction('Click Upload in Clinical document dialog', null, null, false, 'clinical-doc');
                            handleLevelOneStateChange('isUploadFormDialogOpen', !isUploadFormDialogOpen);
                        }}
                        // style={{margin: '-3px 0px 0px', padding: '4px 20px', left: '15px'}}
                    >
                        Upload
                    </CIMSButton>
                    {
                        siteParamsUtilities.getIsEnableScanner(clinicConfig, serviceCd, siteId) ?
                        <CIMSButton
                            id={'clinicalDoc_scanner_button'}
                            onClick={() => {
                                props.auditAction('Click Scanner in Clinical document dialog', null, null, false, 'clinical-doc');
                                handleLevelOneStateChange('isScannerDialogOpen', !isScannerDialogOpen);
                            }}
                            // style={{margin: '-3px 0px 0px', padding: '4px 20px', left: '15px'}}
                        >
                            Scan and Upload
                        </CIMSButton>
                        : <></>
                    }
                    {
                        isEncounter && encounterInfo && encounterInfo.sdt ?
                        <Typography
                            component={'div'}
                            style={{
                                display: 'inline-block',
                                color: '#E57736',
                                fontWeight: 'bold',
                                fontSize: '1.5rem'

                            }}
                        >
                            Encounter Date:&nbsp; {encounterInfo && encounterInfo.sdt && moment(encounterInfo.sdt).format(Enum.DATE_FORMAT_EDMY_VALUE)}
                        </Typography>
                        :
                        <></>
                    }
                    <CIMSButton
                        id={'clinicalDoc_delete_button'}
                        onClick={() => {
                            props.auditAction('Click Delete in Clinical document dialog', null, null, false, 'clinical-doc');
                            deleteSingleDocument();
                        }}
                        style={{float: 'right'}}
                        disabled={inDocumentDto ? false : true}
                    >
                        Delete
                    </CIMSButton>
                    <CIMSDataGrid
                        disableAutoSize
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            minWidth: '1020px',
                            width: '100%',
                            height: '64vh',
                            display: 'block'
                        }}
                        gridOptions={{
                            columnDefs: column,
                            rowData: rowData,
                            rowSelection: 'single',
                            // onGridReady: onGridReady,
                            getRowHeight: () => 50,
                            getRowNodeId: item => item.inDocId,
                            suppressRowClickSelection: false,
                            /*                                onRowClicked: params => {
                                                                console.log('kl_', params.data);
                                                            },*/
                            /*                                onCellFocused: e => {
                                                                console.log('kl_', e);
                                                            },*/
                            onRowDoubleClicked: params => {
                                getSingleDocument(params.data.inDocId, () => {
                                    props.auditAction('Double clicked row in Clinical document dialog');

                                    let fileExtension = params.data.fileType;

                                    const allowedFileExtension = ['pdf', 'jpeg', 'jpg', 'png', 'gif'];

                                    allowedFileExtension.find((item) => {
                                        if (item === ((/[.]/.exec(params.data.docName)) ? /[^.]+$/.exec(params.data.docName)[0].toLowerCase() : undefined)) {
                                            return fileExtension = item;
                                        }

                                        return fileExtension;
                                    });

                                    if (fileExtension) {
                                        handleLevelOneStateChange('inDocId', params.data.inDocId);
                                        handleLevelOneStateChange('isPdf', fileExtension === 'pdf');
                                        handleLevelOneStateChange('fileExtension', fileExtension);
                                        handleLevelOneStateChange('isPDFViewerDialogOpen', !isPDFViewerDialogOpen);
                                    }
                                });
                            },
                            onSelectionChanged: params => {
                                handleLevelOneStateChange('inDocumentDto', params.api.getSelectedRows()[0]);
                            },
                            frameworkComponents: {
                                viewPDFBtn: ViewPdfBtn
                            }
                        }}
                    />
                </div>
            }
            dialogActions={
                <CIMSButton
                    id="ClinicalDocDialog_cancelBtn"
                    onClick={() => {
                        props.auditAction('Click Close in Clinical document dialog', null, null, false, 'clinical-doc');
                        handleLevelOneStateChange('isClinicalDocDialogOpen', !isClinicalDocDialogOpen);
                    }}
                >Close</CIMSButton>
            }
        />
    );
};

const UploadFormDialog = (props) => {
    const {
        isUploadFormDialogOpen,
        handleLevelOneStateChange,
        inDocumentTypeList,
        inDocTypeId,
        remarks,
        fileForUpload,
        onFileChangeHandler
    } = props;

    return (
        <CIMSPromptDialog
            open={isUploadFormDialogOpen}
            id="UploadFormDialog"
            dialogTitle="Upload Form"
            dialogContentText={
                <Grid container style={{padding: '1.5rem', width: '600px'}}>
                    <Grid item xs={12} style={{paddingBottom: '1rem'}}>
                        <CIMSSelect
                            id="inDocTypeId"
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Document Type<RequiredIcon/></>
                            }}
                            addNullOption={false}
                            options={inDocumentTypeList && inDocumentTypeList.mySvcList.map(item => (
                                {value: item.inDocTypeId, label: item.inDocTypeDesc}
                            ))}
                            value={inDocTypeId ? inDocTypeId : null}
                            onChange={(e) => handleLevelOneStateChange('inDocTypeId', e.value)}
                        />
                    </Grid>
                    <Grid item xs={12} style={{paddingBottom: '1rem'}}>
                        <CIMSMultiTextField
                            id="remarks"
                            label="Remarks"
                            TextFieldProps={{
                                variant: 'outlined',
                                label: 'Remarks'
                            }}
                            type="text"
                            rows="4"
                            value={remarks ? remarks : null}
                            onChange={(e) => handleLevelOneStateChange('remarks', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} style={{paddingBottom: '1rem'}}>
                        <Button color="primary">
                            <input type="file" className="form-control" name="file" onChange={(e) => handleLevelOneStateChange('fileForUpload', e.target.files[0])}/>
                        </Button>
                    </Grid>

                    <Grid container item xs={12} wrap="nowrap" justify="flex-end">
                        <CIMSButton
                            onClick={() => {
                                props.auditAction('Click upload in Clinical dialog\'s upload form');
                                onFileChangeHandler(fileForUpload);
                            }}
                            color="primary"
                        >
                            Upload
                        </CIMSButton>
                        <CIMSButton
                            onClick={() => {
                                handleLevelOneStateChange('isUploadFormDialogOpen', !isUploadFormDialogOpen);
                            }}
                            color="primary"
                        >
                            Close
                        </CIMSButton>
                    </Grid>
                </Grid>
            }
        />
    );
};

const ScannerDialog = (props) => {
    const {
        isScannerDialogOpen,
        handleLevelOneStateChange,
        isEncounter
    } = props;

    return (
        <CIMSPromptDialog
            open={isScannerDialogOpen}
            id="UploadScannerDialog"
            dialogTitle={'Scan and Upload'}
            dialogCloseIcon={<CloseIcon onClick={() => {handleLevelOneStateChange('isScannerDialogOpen', !isScannerDialogOpen);}}/>}
            dialogContentText={
                <Grid container style={{padding: '1.5rem', width: '1500px'}}>
                    <Grid item xs={12} style={{paddingBottom: '1rem'}}>
                        <DWT
                            features={[
                            'scan',
                            'camera',
                            'load',
                            'save',
                            'upload',
                            'barcode',
                            'ocr',
                            'uploader'
                            ]}
                            isEncounter={isEncounter}
                        />
                    </Grid>
                </Grid>
            }
            dialogActions={
                <CIMSButton
                    id="ClinicalDocDialog_cancelBtn"
                    onClick={() => {
                        props.auditAction('Click Close in Scanner dialog', null, null, false, 'clinical-doc');
                        handleLevelOneStateChange('isScannerDialogOpen', !isScannerDialogOpen);
                    }}
                >Close</CIMSButton>
            }
        />
    );
};

class ClinicalDoc extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isUploadWarningOpen: false,
            isClinicalDocDialogOpen: false,
            isUploadFormDialogOpen: false,
            isPDFViewerDialogOpen: false,
            fileForUpload: null,
            pdfPreviewData: null,
            remarks: null,
            inDocTypeId: null,
            inDocumentDto: null,
            isPdf: true,
            fileExtension: null
        };
    }

    componentDidMount() {
        const {
            patientInfo,
            encounterInfo,
            isEncounter,
            getEncntrDocumentList,
            getDocumentList
        } = this.props;

        getDocumentList(patientInfo.patientKey);

        if (this.isEncounterBase()) {
            getEncntrDocumentList(patientInfo.patientKey, encounterInfo.encounterId);
        }

    }

    isEncounterBase = () => {
        const {
            encounterInfo,
            isEncounter
        } = this.props;

        if (isEncounter && encounterInfo && encounterInfo.encounterId) {
            return true;
        }
        return false;
    }

    handleLevelOneStateChange = (key, value) => {
        // console.log('kl_handleLevelOneStateChange', key + ': ' + JSON.stringify(value));

        this.setState({
            ...this.state,
            [key]: value
        });
    }

    onFileChangeHandler = (file) => {
        if (!this.state.inDocTypeId) {
            const payload = {
                msgCode: '110031',
                params: [
                    {name: 'MESSAGE', value: 'Please select Document Type.'}
                ],
                showSnackbar: true
            };
            this.props.openCommonMessage(payload);
        } else if (!file) {
            const payload = {
                msgCode: '110031',
                params: [
                    {name: 'MESSAGE', value: 'Please choose file.'}
                ],
                showSnackbar: true
            };
            this.props.openCommonMessage(payload);
        } else if (file && file.size > 1024 * 1000 * 10) {
            const payload = {
                msgCode: '110031',
                params: [
                    {name: 'MESSAGE', value: 'File size limited to 10MB.'}
                ],
                showSnackbar: true
            };
            this.props.openCommonMessage(payload);
        } else if (file) {
            let fileExtension = null;

            const allowedFileExtension = ['pdf', 'jpeg', 'jpg', 'png', 'gif'];

            allowedFileExtension.find((item) => {
                let fileName = file.name;
                if (item === ((/[.]/.exec(fileName)) ? /[^.]+$/.exec(fileName)[0].toLowerCase() : undefined)) {
                    return fileExtension = item;
                }

                return fileExtension;
            });

            if (fileExtension) {
                const {
                    isEncounter,
                    patientInfo,
                    encounterInfo,
                    clinic,
                    uploadDocument
                } = this.props;

                const callback = () => {
                    this.handleLevelOneStateChange('isUploadFormDialogOpen', !this.state.isUploadFormDialogOpen);
                    this.handleLevelOneStateChange('remarks', null);
                    this.handleLevelOneStateChange('inDocTypeId', null);
                    this.handleLevelOneStateChange('fileForUpload', null);
                };

                const params = {
                    patientKey: patientInfo.patientKey,
                    siteId: clinic.siteId,
                    svcCd: clinic.svcCd,
                    sbmtOcsnIndt: isEncounter ? 'E' : 'P',
                    sbmtOcsnId: isEncounter ? encounterInfo.encounterId : patientInfo.patientKey,
                    encntrId: isEncounter ? encounterInfo.encounterId : '',
                    inDocTypeId: this.state.inDocTypeId,
                    docRemark: this.state.remarks ? this.state.remarks : '',
                    file: file
                };

                if ((isEncounter && encounterInfo.encounterId) || (!isEncounter && patientInfo.patientKey)) {
                    uploadDocument(
                        params,
                        callback
                    );
                } else {
                    this.handleLevelOneStateChange('isUploadWarningOpen', true);
                }
            } else {
                const payload = {
                    msgCode: '110031',
                    params: [
                        {name: 'MESSAGE', value: 'File type not valid.'}
                    ],
                    showSnackbar: true
                };
                this.props.openCommonMessage(payload);
            }
        }
    };

    printPDF = (previewData, callback) => {
        const {
            openCommonCircular,
            closeCommonCircular,
            print
        } = this.props;

        if (previewData) {
            openCommonCircular();

            let paras = {
                base64: previewData,
                isCenter: true
            };

            const printCallback = () => {
                closeCommonCircular();

                if (typeof callback === 'function') {
                    callback();
                }
            };

            paras.callback = printCallback;

            print(paras);
        }
    }

    deleteSingleDocument = () => {
        const {
            inDocumentDto
        } = this.state;

        const {
            deleteSingleDocument,
            openCommonMessage
        } = this.props;

        if (inDocumentDto) {
            openCommonMessage({
                msgCode: '130302',
                params: [
                    {name: 'HEADER', value: 'Confirm Delete'},
                    {name: 'MESSAGE', value: 'Do you confirm the delete action?'}
                ],
                btnActions: {
                    btn1Click: () => {
                        deleteSingleDocument(inDocumentDto);
                    }
                }
            });
        }
    }

    render() {
        const {
            isUploadWarningOpen,
            isClinicalDocDialogOpen,
            isUploadFormDialogOpen,
            isPDFViewerDialogOpen,
            isScannerDialogOpen,
            inDocumentDto,
            inDocTypeId,
            remarks,
            isPdf,
            fileExtension,
            fileForUpload
        } = this.state;

        const {
            getDocumentList,
            getSingleDocument,
            clinicalDocList,
            clinicalEncntrDocList,
            inDocumentTypeList,
            currentPDFViewerDoc,
            patientInfo,
            clinicConfig,
            isEncounter,
            encounterInfo,
            clinic,
            displayName,
            auditAction
        } = this.props;

        return (
            <section id="clinicalDocSection" style={{position: 'relative', float: 'right'}}>
                <CIMSButton
                    id={'patientSummary_clinical_doc_button'}
                    onClick={() => {
                        auditAction('Click Clinical document button', null, null, false, 'clinical-doc');

                        this.handleLevelOneStateChange('isClinicalDocDialogOpen', !isClinicalDocDialogOpen);

                        getDocumentList(patientInfo.patientKey);
                        if (this.isEncounterBase()) {
                            getEncntrDocumentList(patientInfo.patientKey, encounterInfo.encounterId);
                        }

                    }}
                    style={{margin: '-3px 0px 0px', padding: '4px 20px', left: '15px'}}
                >
                    {displayName ?? 'Clinical Document'}
                </CIMSButton>

                <ClinicalDocDialog
                    isClinicalDocDialogOpen={isClinicalDocDialogOpen}
                    isUploadFormDialogOpen={isUploadFormDialogOpen}
                    isPDFViewerDialogOpen={isPDFViewerDialogOpen}
                    handleLevelOneStateChange={this.handleLevelOneStateChange}
                    getSingleDocument={getSingleDocument}
                    clinicalDocList={clinicalDocList}
                    clinicalEncntrDocList={clinicalEncntrDocList}
                    inDocumentTypeList={inDocumentTypeList}
                    inDocumentDto={inDocumentDto}
                    deleteSingleDocument={this.deleteSingleDocument}
                    auditAction={auditAction}
                    clinicConfig={clinicConfig}
                    isEncounter={isEncounter}
                    serviceCd={this.props.serviceCd}
                    siteId={this.props.clinic.siteId}
                    encounterInfo={this.props.encounterInfo}
                    displayName={displayName}
                />

                <UploadFormDialog
                    isUploadFormDialogOpen={isUploadFormDialogOpen}
                    handleLevelOneStateChange={this.handleLevelOneStateChange}
                    inDocumentTypeList={inDocumentTypeList}
                    inDocTypeId={inDocTypeId}
                    remarks={remarks}
                    fileForUpload={fileForUpload}
                    onFileChangeHandler={this.onFileChangeHandler}
                    auditAction={auditAction}
                />

                <ScannerDialog
                    isScannerDialogOpen={isScannerDialogOpen}
                    handleLevelOneStateChange={this.handleLevelOneStateChange}
                    auditAction={auditAction}
                    isEncounter={this.props.isEncounter}
                />

                {currentPDFViewerDoc &&
                <CIMSCompatViewerDialog
                    isDialogOpen={isPDFViewerDialogOpen}
                    base64={currentPDFViewerDoc}
                    fileType={fileExtension}
                    closeDialog={() => {
                        this.handleLevelOneStateChange('isPDFViewerDialogOpen', false);
                    }}
                    print={this.printPDF}
                    isPdf={isPdf}
                    fileExtension={fileExtension}
                    auditAction={auditAction}

                />
                }

                <CIMSDialog open={isUploadWarningOpen} dialogTitle={'Warning'}>
                    <DialogContent>
                        {'Please select encounter before upload.'}
                    </DialogContent>
                    <DialogActions>
                        <CIMSButton onClick={() => {this.handleLevelOneStateChange('isUploadWarningOpen', false);}}>OK</CIMSButton>
                    </DialogActions>
                </CIMSDialog>
            </section>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        clinic: state.login.clinic,
        serviceCd: state.login.service.serviceCd,
        patientInfo: state.patient.patientInfo,
        encounterInfo: state.patient.encounterInfo,
        clinicalDocList: state.clinicalDoc.clinicalDocList,
        clinicalEncntrDocList: state.clinicalDoc.clinicalEncntrDocList,
        inDocumentTypeList: state.common.inDocumentTypes,
        clinicConfig: state.common.clinicConfig,
        currentPDFViewerDoc: state.clinicalDoc.currentPDFViewerDoc
    };
};

const mapDispatchToProps = {
    print,
    openErrorMessage,
    openCommonMessage,
    openCommonCircular,
    closeCommonCircular,
    uploadDocument,
    getDocumentList,
    getEncntrDocumentList,
    getSingleDocument,
    deleteSingleDocument,
    auditAction
};

export default connect(mapStateToProps, mapDispatchToProps)(ClinicalDoc);
