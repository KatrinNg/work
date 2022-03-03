import React from 'react';
import { connect } from 'react-redux';
import {
    Grid,
    withStyles,
    FormControlLabel,
    Typography
} from '@material-ui/core';
import moment from 'moment';
import CIMSDataGrid from '../../components/Grid/CIMSDataGrid';
import CIMSPromptDialog from '../../components/Dialog/CIMSPromptDialog';
import CIMSButton from '../../components/Buttons/CIMSButton';
import { auditAction } from '../../store/actions/als/logAction';
import {
    closeClinicalDocImportDialog,
    importCIMS1ClinicalDoc
} from '../../store/actions/certificate/certificateEform';
import {
    triggerGetAllDocList
} from '../../store/actions/consultation/doc/docAction';
import { getIsEnableEformAccessControl } from 'utilities/siteParamsUtilities';

const styles = (theme) => ({
    paper: {
        minWidth: 300,
        maxWidth: '100%',
        borderRadius: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.08)'
    }
});

class ClinicalDocImportDialog extends React.Component {

    constructor(props) {
        super();
        this.state = {
            columnDefs: [],
            rowData: []
        };
    }

    componentDidMount() {
        this.defineColumns();
        this.filterData();
    }

    defineColumns = () => {
        let columnDefs = [
            {
                headerName: 'Create Date Time',
                field: 'createDtm'
            },
            {
                headerName: 'Updated By',
                field: 'updateBy'
            },
            {
                headerName: 'Document Type',
                field: 'docTypeDesc',
                minWidth: 340
            },
            {
                headerName: 'Service',
                field: 'svcCd',
                maxWidth: 130
            },
            {
                headerName: '',
                colId: 'action',
                minWidth: 130,
                maxWidth: 130,
                cellRenderer: 'importRenderer',
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
        ];
        this.setState({ columnDefs });
    }

    filterData = () => {
        this.props.triggerGetAllDocList(docList => {
            const { accessRights, siteParams, loginSvcCd, loginSiteId } = this.props;
            const isEnableEformAccessControl = getIsEnableEformAccessControl(siteParams, loginSvcCd, loginSiteId);
            const eformRights = accessRights.filter(x => x.type === 'eform' && x.path);

            let rowData = docList
            .map(x => {
                x.outDocType = this.props.outDocumentTypes.find(y => y.outDocTypeId === x.docTypeId);
                return x;
            })
            .filter(
                x =>
                x.svcCd === loginSvcCd && x.siteId === loginSiteId &&
                x.isMigration === 1 && x.src === 'O' && x.docSts ==='I' && x.outDocType?.frmIndt === 'C' &&
                (!isEnableEformAccessControl || eformRights.find(x => x.path === String(x.docTypeId)))
            )
            .sort((a, b) => moment(b.createDtm) - moment(a.createDtm));
            // console.log('[IMP] import list', rowData);
            this.setState({ rowData });
        });
    }

    importRenderer = (props) => {
        let { data } = props;

        return (
            <CIMSButton
                id="certificate_eform_cims1_importDialog_importButton"
                children="Import"
                onClick={e => {
                    this.importClinicalDoc(data);
                }}
            />
        );
    }

    importClinicalDoc = (data) => {
        // console.log('importClinicalDoc', data);
        this.props.auditAction('Click Import in Clinical Doc Import dialog, docId: ' + data.docId, null, null, false, 'clinical-doc');
        this.props.importCIMS1ClinicalDoc(data.docId, data.outDocType?.outDocTypeId);
    }

    render() {
        const { classes } = this.props;
        const id = 'cims1ClinicalDocImportDialog';
        const title = 'CIMS1 Incomplete Cross-Encounter Documents';
        return (
            <CIMSPromptDialog
                id={id}
                dialogTitle={title}
                paperStyl={classes.paper}
                open
                dialogContentText={
                    <>
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
                                columnDefs: this.state.columnDefs,
                                rowData: this.state.rowData,
                                rowSelection: 'single',
                                getRowHeight: () => 50,
                                getRowNodeId: item => item.docId,
                                suppressRowClickSelection: true,
                                onRowClicked: params => {
                                    // console.log('onRowClicked');
                                },
                                onCellFocused: e => {
                                    // console.log('onCellFocused');
                                },
                                onRowDoubleClicked: params => {
                                    this.importClinicalDoc(params.data);
                                },
                                onSelectionChanged: params => {
                                    // console.log('onSelectionChanged', params.api.getSelectedRows()[0]);
                                },
                                frameworkComponents: {
                                    importRenderer: this.importRenderer
                                }
                            }}
                        />
                    </>
                }
                dialogActions={
                    <CIMSButton
                        id={id + '_close'}
                        onClick={() => {
                            this.props.auditAction('Click Close in Clinical Doc Import dialog', null, null, false, 'clinical-doc');
                            this.props.closeClinicalDocImportDialog();
                        }}
                    >Close</CIMSButton>
                }
            />
        );
    }
}

const mapState = (state) => {
    return {
        loginSvcCd: state.login.service.svcCd,
        loginSiteId: state.login.clinic.siteId,
        outDocumentTypes: state.common.outDocumentTypes.fullList,
        accessRights: state.login.accessRights,
        siteParams: state.common.siteParams
    };
};

const dispatch = {
    auditAction,
    closeClinicalDocImportDialog,
    importCIMS1ClinicalDoc,
    triggerGetAllDocList
};

export default connect(mapState, dispatch)(withStyles(styles)(ClinicalDocImportDialog));