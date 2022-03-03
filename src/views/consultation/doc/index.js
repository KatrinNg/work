import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Checkbox, Grid, IconButton, FormControlLabel} from '@material-ui/core';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import { Assignment, CheckBox, CheckBoxOutlineBlank, Search } from '@material-ui/icons';
import CIMSSelect from '../../../components/Select/CIMSSelect';
import CIMSTextField from '../../../components/TextField/CIMSTextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import CIMSCheckBox from '../../../components/CheckBox/CIMSCheckBox';
import moment from 'moment';
import {
    updateState,
    // triggerGetAllDocType,
    triggerGetAllDocList,
    triggerGetSingleInOutDoc,
    triggerGetSingleInOutDocHistory
} from '../../../store/actions/consultation/doc/docAction';
import {
    closeCommonCircular,
    openCommonCircular
} from '../../../store/actions/common/commonAction';
import CIMSCompatViewerDialog from '../../../components/Dialog/CIMSCompatViewerDialog';
import AccessRightEnum from '../../../enums/accessRightEnum';
import _ from 'lodash';
import { onlyServerSharingDoc } from '../../../utilities/commonUtilities';

const styles = () => ({
    section: {
        margin: '8px 32px',
        borderRadius: '4px',
        boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)'
    },
    filterAndSearch: {
        padding: '1rem'
    },
    pastVersionAndRefresh: {
        paddingTop: '1rem'
    },
    btn: {
        padding: '0 1rem',
        margin: '0 1rem 0 0'
    },
    formControlLabelRoot: {
        marginLeft: 11,
        marginBottom: 0
    },
    formControlLabelLabel: {
        fontWeight: 'bold'
    }
});

class Doc extends Component {
    constructor(props) {
        super(props);
        this.state = {
            _id: 'consultationDoc',
            filterOptions: {
                group: [
                    /*                    {
                                            label: 'ALL',
                                            value: 'A'
                                        }*/
                ],
                docTypeId: [
                    /*                    {
                                            label: 'ALL',
                                            value: 'A'
                                        }*/
                ],
                docSts: [
                    /*                    {
                                            label: 'ALL',
                                            value: 'A'
                                        }*/
                    /*                    {
                                            label: 'Normal',
                                            value: 'N'
                                        },
                                        {
                                            label: 'Cancelled',
                                            value: 'C'
                                        },
                                        {
                                            label: 'Pending for Review',
                                            value: 'P'
                                        },
                                        {
                                            label: 'Rejected',
                                            value: 'R'
                                        }*/
                ],
                svcCd: [
                    /*                    {
                                            label: 'ALL',
                                            value: 'A'
                                        }*/
                ],
                siteId: [
                    /*                    {
                                            label: 'ALL',
                                            value: 'A'
                                        }*/
                ]
            },
            filterValue: {
                group: 'A',
                docTypeId: 'A',
                docSts: 'A',
                svcCd: 'A',
                siteId: 'A',
                showCancelledDoc: false
            },
            originalFilterValue: {
                group: 'A',
                docTypeId: 'A',
                docSts: 'A',
                svcCd: 'A',
                siteId: 'A',
                showCancelledDoc: false
            },
            documentId: '',
            docIdForSearch: '',
            selectedData: null,
            previewInfo: {
                fileExtension: '',
                isPdf: false
            },
            isPastVersionDialogOpen: false,
            isPreviewDialogOpen: false
        };
    }

    componentDidMount() {
/*        const {
            triggerGetAllDocType
        } = this.props;*/

        // triggerGetAllDocType(this.initOptionsListAndDocList());

        this.initOptionsListAndDocList();
    }

    shouldComponentUpdate(nextProps, nextState) {
        const {
            subTabsActiveKey,
            triggerGetAllDocList
        } = this.props;

        if (subTabsActiveKey !== nextProps.subTabsActiveKey && nextProps.subTabsActiveKey === AccessRightEnum.doc) {
            triggerGetAllDocList();

            return false;
        }

        return true;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        /*        if (this.props.inOutDocTypeList !== prevProps.inOutDocTypeList) {
                    this.initOptionsList();
                }*/
    }

    handleOnChange = (value, key1, key2 = null, callback = null) => {
        // console.log('@_@:', value, key1, key2);
        this.setState(prevState => ({
            ...this.state,
            [key1]: key2 ? {
                ...prevState[key1],
                [key2]: value
            } : value
        }), () => {
            callback && callback();
        });
    }

    /*    initOptionsList = (componentDidMount = false) => {
            let newFilterOptions = this.state.filterOptions;

            const {
                inOutDocTypeList,
                serviceList
            } = this.props;

            inOutDocTypeList.map(item => {
                if (item.listType === 'GROUP_LIST') {
                    newFilterOptions.group.push({
                        label: item.docTypeDesc,
                        value: item.docTypeId === 0 ? 'I' : item.docTypeId
                    });
                } else if (item.listType === 'DOC_TYPE_LIST') {
                    newFilterOptions.docTypeId.push({
                        label: item.docTypeDesc,
                        value: item.docTypeId,
                        item: item
                    });
                }
            });

            componentDidMount && serviceList.map(item => {
                newFilterOptions.svcCd.push({
                    label: item.svcName,
                    value: item.svcCd
                });
            });

            this.handleOnChange(newFilterOptions, 'filterOptions');
        }*/

    initOptionsListAndDocList = () => {
        const {
            login,
            clinicList,
            serviceList,
            triggerGetAllDocList
        } = this.props;

        const getDistinct = (array, keyName) => {
            let output = [];

            array.forEach(item => {
                if (!output.find(value => value === item[keyName])) {
                    if(onlyServerSharingDoc(item)){
                        output.push(item[keyName]);
                    }
                }
            });

            return output;
        };

        const initOptionsList = (docList) => {
            if (docList) {
                const docTypeId = [{
                        label: 'ALL',
                        value: 'A'
                    }],
                    docSts = [{
                        label: 'ALL',
                        value: 'A'
                    }],
                    svcCd = [{
                        label: 'ALL',
                        value: 'A'
                    }],
                    siteId = [{
                        label: 'ALL',
                        value: 'A'
                    }];

                getDistinct(docList, 'docTypeDesc').forEach(value => {
                    docTypeId.push({
                        label: value,
                        value: value
                    });
                });

                getDistinct(docList, 'docSts').forEach(value => {
                    const item = {
                        label: '',
                        value: value
                    };

                    switch (value) {
                        case 'N':
                            item.label = 'Completed';
                            break;
                        case 'I':
                            item.label = 'Incompleted';
                            break;
                        case 'C':
                            item.label = 'Cancelled';
                            break;
                        case 'P':
                            item.label = 'Pending for Review';
                            break;
                        case 'R':
                            item.label = 'Rejected';
                            break;
                        default:
                            break;
                    }

                    docSts.push(item);
                });

                getDistinct(docList, 'svcCd').forEach(value => {
                    svcCd.push({
                        label: serviceList.find(item => item.svcCd === value).svcName,
                        value: value
                    });

                    const ownClinics = clinicList.filter(item => item.svcCd === value);

                    ownClinics.forEach(ownClinic => {
                        siteId.push({
                            label: ownClinic ? `${ownClinic.clinicCd ? ownClinic.clinicCd : ''} - ${ownClinic.siteDesc ? ownClinic.siteDesc : ''}` : '',
                            value: ownClinic.siteId
                        });
                    });
                });

                const filterOptions = {
                    docTypeId: docTypeId,
                    docSts: docSts,
                    svcCd: svcCd,
                    siteId: _.orderBy(siteId, ['label', 'desc'])
                };

                this.handleOnChange(filterOptions, 'filterOptions');
            }
        };

        const setOwnServiceClinic = (docList) => {
            if (!_.isEmpty(docList) && docList.find(item => item.siteId === login.clinic.siteId)) {
                this.handleOnChange({
                    ...this.state.filterValue,
                    svcCd: login.clinic.svcCd,
                    siteId: login.clinic.siteId
                }, 'filterValue', null, () => this.handleOnChange({
                    ...this.state.originalFilterValue,
                    svcCd: login.clinic.svcCd,
                    siteId: login.clinic.siteId
                }, 'originalFilterValue'));
            }
        };

        triggerGetAllDocList((docList) => {
            initOptionsList(docList);

            setOwnServiceClinic(docList);
        });
    }

    filterDocTypeList = () => {
        const {
            docTypeId
        } = this.state.filterOptions;

        const {
            group
        } = this.state.filterValue;

        if (group === 'I') {
            return docTypeId.filter(item => item.value === 'A' || (item.item && item.item.docCat === group));
        } else if (group !== 'A') {
            return docTypeId.filter(item => item.value === 'A' || (item.item && item.item.grp === group));
        }

        return docTypeId;
    }

    filterClinicList = () => {
        const {
            clinicList
        } = this.props;
        const siteIdOption = this.state.filterOptions.siteId;
        const svcCd = this.state.filterValue.svcCd;

        if (svcCd !== 'A') {
            return _.filter(siteIdOption, (row) => {
                return row.value === 'A' || (clinicList.find(item => item.siteId === row.value).svcCd === svcCd);
            });
        }

        return siteIdOption;
    }

    filterDocList = () => {
        const {
            filterValue,
            docIdForSearch
        } = this.state;

        const {
            docList
        } = this.props;

        let filteredList = docList;

        if (docIdForSearch) {
            filteredList = filteredList.filter(item =>
                item.docId.indexOf(docIdForSearch) >= 0 &&
                onlyServerSharingDoc(item)
            );
            // filteredList = filteredList.find(item => item.docId === docIdForSearch);
        } else {
            for (const key in filterValue) {
                const value = filterValue[key];

                if (key !== 'group' && value !== 'A') {
                    if (key !== 'showCancelledDoc') {
                        filteredList = filteredList.filter(item =>
                            (key === 'docTypeId' ? item['docTypeDesc'] : item[key]) === value);
                    } else {
                        if (!value) filteredList = filteredList.filter(item => item['docSts'] !== 'C');
                    }
                }
            }
        }

        filteredList = filteredList.filter(item =>
            onlyServerSharingDoc(item)
        );

        return filteredList && filteredList.sort((a, b) => moment(b.createDtm) - moment(a.createDtm));
    }

    printPDF = (previewData, callback) => {
        const {
            openCommonCircular,
            closeCommonCircular,
            print
        } = this.props;

        if (previewData) {
            openCommonCircular();

            let paras = {
                base64: previewData
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

    triggerOpenPreviewDialog = (data) => {
        const {
            isPreviewDialogOpen
        } = this.state;

        const {
            openCommonCircular,
            closeCommonCircular,
            triggerGetSingleInOutDoc
        } = this.props;

        openCommonCircular();

        const docId = data.docId || data.outDocId;

        let fileExtension = data.fileType;

        const allowedFileExtension = ['pdf', 'jpeg', 'jpg', 'png', 'gif'];

        allowedFileExtension.find((item) => {
            if (item === ((/[.]/.exec(data.docName)) ? /[^.]+$/.exec(data.docName)[0].toLowerCase() : undefined)) {
                fileExtension = item;
            }

            return fileExtension;
        });

        if (fileExtension) {
            if (data.isMigration === 1 && data.src === 'O') {
                triggerGetSingleInOutDoc(docId, data.src === 'I' ? true : false, (res) => {
                    this.downLoadFileFromBlob(this.b64toBlob(res.data, `${fileExtension === 'pdf' ? 'application' : 'image'}/${fileExtension}`), data.docName);

                    // closeCommonCircular();
                });
            } else {
                this.handleOnChange({
                    fileExtension: fileExtension,
                    isPdf: fileExtension === 'pdf'
                }, 'previewInfo', null, () => {
                    const callback = () => {
                        this.handleOnChange(!isPreviewDialogOpen, 'isPreviewDialogOpen', null, () => closeCommonCircular());
                    };

                    triggerGetSingleInOutDoc(docId, data.src === 'I' ? true : false, callback);
                });
            }
        } else {
            triggerGetSingleInOutDoc(docId, data.src === 'I' ? true : false, (res) => {
                this.downLoadFileFromBlob(this.b64toBlob(res.data, `${fileExtension === 'pdf' ? 'application' : 'image'}/${fileExtension}`), data.docName);

                // closeCommonCircular();
            });
        }
    }

    b64toBlob = (b64Data, contentType, sliceSize) => {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        let byteCharacters = atob(b64Data);
        let byteArrays = [];

        for (let offSet = 0; offSet < byteCharacters.length; offSet += sliceSize) {
            let slice = byteCharacters.slice(offSet, offSet + sliceSize);

            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            let byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, {type: contentType});
    };

    downLoadFileFromBlob = (blob, docName) => {
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = docName;
        a.click();
    };

    handleSearchDocIdEmpty = (value) => {
        !value && this.handleOnChange('', 'docIdForSearch');
    }

    render() {
        const {
            _id,
            filterOptions,
            filterValue,
            documentId,
            selectedData,
            previewInfo,
            isPastVersionDialogOpen,
            isPreviewDialogOpen
        } = this.state;

        const {
            classes,
            inOutDocTypeList,
            previewData,
            clinicList,
            serviceList,
            // docList,
            docHistoryList,
            // triggerGetAllDocList2,
            triggerGetSingleInOutDocHistory
        } = this.props;

        // console.log('kl_', filterValue);

        return (
            <section
                className={classes.section}
            >
                <Grid className={classes.filterAndSearch}>
                    <Grid container spacing={1}>
                        {/*                        <Grid item xs={2} spacing={1}>
                            <CIMSSelect
                                id={`${_id}filterGroup`}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Group</>
                                }}
                                value={filterValue.group}
                                options={filterOptions.group}
                                onChange={(e) => this.handleOnChange(e.value, 'filterValue', 'group', () => this.handleOnChange('A', 'filterValue', 'docTypeId'))}
                            />
                        </Grid>*/}

                        <Grid item xs={2} spacing={1}>
                            <CIMSSelect
                                id={`${_id}filterDocType`}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Doc Type</>
                                }}
                                value={filterValue.docTypeId}
                                addNullOption={false}
                                options={this.filterDocTypeList()}
                                onChange={(e) => this.handleOnChange(e.label === 'ALL' ? 'A' : e.label, 'filterValue', 'docTypeId')}
                            />
                        </Grid>

{/*                        <Grid item xs={2} spacing={1}>
                            <CIMSSelect
                                id={`${_id}filterStatus`}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Status</>
                                }}
                                value={filterValue.docSts}
                                addNullOption={false}
                                options={filterOptions.docSts}
                                onChange={(e) => this.handleOnChange(e.value, 'filterValue', 'docSts')}
                            />
                        </Grid>*/}

                        <Grid item xs={2} spacing={1}>
                            <CIMSSelect
                                id={`${_id}filterService`}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Service</>
                                }}
                                value={filterValue.svcCd}
                                addNullOption={false}
                                options={filterOptions.svcCd}
                                onChange={(e) => this.handleOnChange(e.value, 'filterValue', 'svcCd',
                                    () => this.handleOnChange('A', 'filterValue', 'siteId'))}
                            />
                        </Grid>

                        <Grid item xs={2} spacing={1}>
                            <CIMSSelect
                                id={`${_id}filterClinic`}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Clinic</>
                                }}
                                value={filterValue.siteId}
                                addNullOption={false}
                                options={this.filterClinicList()}
                                onChange={(e) => this.handleOnChange(e.value, 'filterValue', 'siteId')}
                            />
                        </Grid>

                        <Grid item xs={4} spacing={1}/>

                        <Grid item xs={2} spacing={1}>
                            <CIMSTextField
                                variant={'outlined'}
                                label={<>Document ID</>}
                                type={'number'}
                                value={documentId}
                                onChange={(e) => this.handleOnChange(e.target.value, 'documentId')}
                                onBlur={(e) => {
                                    this.handleSearchDocIdEmpty(e.target.value);
                                }}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position={'end'}>
                                            <IconButton
                                                onClick={e => this.handleOnChange(documentId, 'docIdForSearch')}
                                            >
                                                <Search
                                                    color={'primary'}
                                                />
                                            </IconButton>
                                        </InputAdornment>
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Grid className={classes.pastVersionAndRefresh}>
                        <CIMSButton
                            className={classes.btn}
                            onClick={() => this.handleOnChange(!isPastVersionDialogOpen, 'isPastVersionDialogOpen')}
                            disabled={docHistoryList.length <= 0}
                        >Past Version</CIMSButton>

                        <CIMSButton
                            className={classes.btn}
                            onClick={() => {
                                this.handleOnChange(this.state.originalFilterValue, 'filterValue', null, () => {
                                    this.handleOnChange('', 'documentId', null, () => {
                                        this.handleOnChange('', 'docIdForSearch', null, () => {
                                            this.initOptionsListAndDocList();
                                        });
                                    });
                                });
                            }}
                        >Refresh</CIMSButton>

                        <FormControlLabel
                            id={`${_id}filterCancelled`}
                            value={filterValue.showCancelledDoc}
                            label="Show Deleted Documents"
                            classes={{
                                root: classes.formControlLabelRoot,
                                label: classes.formControlLabelLabel
                            }}
                            onChange={(e) => this.handleOnChange(e.target.checked, 'filterValue', 'showCancelledDoc')}
                            control={<CIMSCheckBox color="primary" id={`${_id}_showCancelled`} classes={{ root: classes.checkBox }} />}
                        />
                    </Grid>
                </Grid>

                {inOutDocTypeList.length > 0 &&
                <CIMSDataGrid
                    // ref={r => this.refGrid = r}
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '100%',
                        height: '570px',
                        display: 'block'
                    }}
                    gridOptions={{
                        columnDefs: [
                            {
                                headerName: '',
                                valueGetter: (params) => params.node.rowIndex + 1,
                                minWidth: 60,
                                maxWidth: 60
                            },
                            /*                            {
                                                            headerName: '',
                                                            valueGetter: (params) => '',
                                                            filter: false,
                                                            headerCheckboxSelection: true,
                                                            checkboxSelection: true,
                                                            minWidth: 40,
                                                            maxWidth: 40
                                                        },*/
                            {
                                headerName: 'View Doc.',
                                maxWidth: 120,
                                minWidth: 120,
                                sortable: false,
                                cellRenderer: 'inOutDocPreviewRenderer',
                                cellRendererParams: {
                                    onClick: (data) => {
                                        this.triggerOpenPreviewDialog(data);
                                    }
                                }
                            },
                            {
                                headerName: 'Update Date',
                                valueGetter: (params) => {
                                    return moment(params.data.createDtm).format('DD-MM-YYYY');
                                },
                                tooltipValueGetter: (params) => params.value
                            },
                            {
                                headerName: 'Updated By',
                                valueGetter: (params) => {
                                    return params.data.updateBy;
                                },
                                tooltipValueGetter: (params) => params.value
                            },
                            {
                                headerName: 'Doc Type',
                                valueGetter: (params) => {
                                    return params.data.docTypeDesc;
                                    // return inOutDocTypeList.find(item => item.docTypeId === params.data.docTypeId).docTypeDesc;
                                },
                                tooltipValueGetter: (params) => params.value
                            },
                            {
                                headerName: 'Status',
                                minWidth: 120,
                                valueGetter: (params) => {
                                    switch (params.data.docSts) {
                                        case 'N':
                                            return 'Completed';
                                        case 'I':
                                            return 'Incompleted';
                                        case 'C':
                                            return 'Deleted';
                                        case 'P':
                                            return 'Pending for Review';
                                        case 'R':
                                            return 'Rejected';
                                        default:
                                            return '';
                                    }
                                },
                                tooltipValueGetter: (params) => params.value
                            },
                            {
                                headerName: 'Service',
                                valueGetter: (params) => {
                                    return serviceList.find(item => item.svcCd === params.data.svcCd).svcName;
                                },
                                tooltipValueGetter: (params) => params.value
                            },
                            {
                                headerName: 'Clinic',
                                valueGetter: (params) => {
                                    const clinic = clinicList.find(item => item.siteId === params.data.siteId);

                                    return clinic ? `${clinic.clinicCd ? clinic.clinicCd : ''} - ${clinic.siteDesc ? clinic.siteDesc : ''}` : '';
                                },
                                tooltipValueGetter: (params) => params.value
                            },
                            {
                                headerName: 'Remarks',
                                valueGetter: (params) => {
                                    return params.data.docRemark;
                                },
                                tooltipValueGetter: (params) => params.value
                            }
                        ],
                        onCellFocused: e => {
                        },
                        frameworkComponents: {
                            selectCheckboxRenderer: SelectCheckboxRenderer,
                            inOutDocPreviewRenderer: inOutDocPreview
                        },
                        rowSelection: 'single',
                        rowMultiSelectWithClick: false,
                        //suppressRowClickSelection: true,
                        headerHeight: 48,
                        enableBrowserTooltips: true,
                        rowData: this.filterDocList(),
                        /*                        onRowSelected: event => {
                                                    if (event.node.selected) {
                                                        this.handleOnChange(event.data, 'selectedData', null, () => {
                                                            triggerGetSingleInOutDocHistory(event.data.docId);
                                                        });
                                                    } else {
                                                        this.props.updateState({docHistoryList: []});
                                                    }
                                                },*/
                        onRowClicked: event => {
                            if (event.node.selected) {
                                this.handleOnChange(event.data, 'selectedData', null, () => {
                                    triggerGetSingleInOutDocHistory(event.data.docId);
                                });
                            } else {
                                this.props.updateState({docHistoryList: []});
                            }

                            event.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = (event.column && this.disableClickSelectionRenderers.includes(event.column.colDef.cellRenderer)) ? true : false;
                        },
                        onRowDoubleClicked: event => {
                            if (event.node.selected) {
                                this.handleOnChange(event.data, 'selectedData', null, () => {
                                    triggerGetSingleInOutDocHistory(event.data.docId);
                                });
                            } else {
                                this.props.updateState({docHistoryList: []});
                            }

                            this.triggerOpenPreviewDialog(event.data);
                        },
                        getRowHeight: (params) => 40,
                        getRowNodeId: data => data.docId,
                        postSort: rowNodes => {
                            let rowNode = rowNodes[0];
                            if (rowNode) {
                                setTimeout((rowNode) => {
                                    rowNode.gridApi.refreshCells();
                                }, 100, rowNode);
                            }
                        }
                    }}
                />
                }

                {selectedData &&
                <CIMSPromptDialog
                    open={isPastVersionDialogOpen}
                    id={`${_id}pastVersionDialog`}
                    dialogTitle="Past Clinical Document"
                    dialogContentText={
                        <Grid>
                            <Grid container spacing={1} style={{padding: '1rem'}}>
                                <Grid item xs={2} style={{textAlign: 'right'}}>Service:</Grid>
                                <Grid item xs={10}> {serviceList.find(item => item.svcCd === selectedData.svcCd).svcName}</Grid>
                                <Grid item xs={2} style={{textAlign: 'right'}}>Document Type:</Grid>
                                <Grid item xs={10}> {selectedData.docTypeDesc}</Grid>
                            </Grid>

                            <CIMSDataGrid
                                // ref={r => this.refGrid = r}
                                gridTheme="ag-theme-balham"
                                divStyle={{
                                    width: '800px',
                                    height: '651px',
                                    display: 'block'
                                }}
                                gridOptions={{
                                    columnDefs: [
                                        {
                                            headerName: '',
                                            valueGetter: (params) => params.node.rowIndex + 1,
                                            minWidth: 50,
                                            maxWidth: 50
                                        },
                                        {
                                            headerName: 'View Doc.',
                                            maxWidth: 160,
                                            minWidth: 160,
                                            sortable: false,
                                            cellRenderer: 'inOutDocPreviewRenderer',
                                            cellRendererParams: {
                                                onClick: (data) => {
                                                    this.triggerOpenPreviewDialog(data);
                                                }
                                            }
                                        },
                                        {
                                            headerName: 'Updated By',
                                            // maxWidth: 160,
                                            minWidth: 160,
                                            valueGetter: (params) => {
                                                return params.data.createBy;
                                            },
                                            tooltipValueGetter: (params) => params.value
                                        },
                                        {
                                            headerName: 'Updated On',
                                            // maxWidth: 160,
                                            minWidth: 160,
                                            valueGetter: (params) => {
                                                return moment(params.data.createDtm).format('DD-MM-YYYY');
                                            },
                                            tooltipValueGetter: (params) => params.value
                                        }
                                    ],
                                    onCellFocused: e => {
                                    },
                                    frameworkComponents: {
                                        selectCheckboxRenderer: SelectCheckboxRenderer,
                                        inOutDocPreviewRenderer: inOutDocPreview
                                    },
                                    rowSelection: 'single',
                                    rowMultiSelectWithClick: false,
                                    //suppressRowClickSelection: true,
                                    headerHeight: 48,
                                    enableBrowserTooltips: true,
                                    rowData: docHistoryList,
                                    onRowSelected: event => {
                                    },
                                    onRowClicked: e => {
                                        /*                                        if (e.column && this.disableClickSelectionRenderers.includes(e.column.colDef.cellRenderer)) {
                                                                                    e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
                                                                                } else {
                                                                                    e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = false;
                                                                                }*/
                                    },
                                    onRowDoubleClicked: event => {

                                    },
                                    getRowHeight: (params) => 40,
                                    getRowNodeId: data => data.docId,
                                    postSort: rowNodes => {
                                        let rowNode = rowNodes[0];
                                        if (rowNode) {
                                            setTimeout((rowNode) => {
                                                rowNode.gridApi.refreshCells();
                                            }, 100, rowNode);
                                        }
                                    }
                                }}
                            />

                            <Grid style={{margin: '1rem auto', float: 'right'}}>
                                <CIMSButton
                                    style={{margin: '0', padding: '0'}}
                                    onClick={() => this.handleOnChange(!isPastVersionDialogOpen, 'isPastVersionDialogOpen')}
                                >
                                    Close
                                </CIMSButton>
                            </Grid>

                        </Grid>
                    }
                />
                }

                {previewData &&
                <CIMSCompatViewerDialog
                    isDialogOpen={isPreviewDialogOpen}
                    base64={previewData}
                    fileType={previewInfo.fileExtension}
                    closeDialog={() => {
                        this.handleOnChange(!isPreviewDialogOpen, 'isPreviewDialogOpen');
                    }}
                />
                }
            </section>
        );
    }
}

class SelectCheckboxRenderer
    extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Checkbox
                color="default"
                checkedIcon={<CheckBox/>}
                icon={<CheckBoxOutlineBlank/>}
            />
        );
    }
}

const inOutDocPreview = (props) => {
    const {rowIndex, data} = props;
    return (
        <Grid container>
            <IconButton
                id={`rfrLetter_assignment_${rowIndex}`}
                color={'primary'}
                title={'Assignment'}
                onClick={() => props.onClick(data)}
            >
                <Assignment/>
            </IconButton>
        </Grid>
    );
};

const mapStateToProps = (state) => {
    return {
        login: state.login,
        subTabsActiveKey: state.mainFrame.subTabsActiveKey,
        inOutDocTypeList: _.concat(state.common.inDocumentTypes.fullList, state.common.outDocumentTypes.fullList),
        docList: state.doc.docList,
        docHistoryList: state.doc.docHistoryList,
        previewData: state.doc.previewData,
        clinicList: state.common.clinicList,
        serviceList: state.common.serviceList
    };
};

const mapDispatchToProps = {
    openCommonCircular,
    closeCommonCircular,
    updateState,
    // triggerGetAllDocType,
    triggerGetAllDocList,
    triggerGetSingleInOutDoc,
    triggerGetSingleInOutDocHistory
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Doc));
