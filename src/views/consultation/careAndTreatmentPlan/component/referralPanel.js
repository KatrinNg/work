import React from 'react';
import moment from 'moment';
import { Grid, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
// import memoize from 'memoize-one';
import IconButton from '@material-ui/core/IconButton';
import { ExpandMore, Assignment } from '@material-ui/icons';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import Enum from '../../../../enums/enum';



const RfrLetterPreview = (props) => {
    const { rowIndex, data } = props;
    return (
        <Grid container>
            <IconButton
                id={`rfrLetter_assignment_${rowIndex}`}
                color={'primary'}
                title={'Assignment'}
                onClick={() => props.onClick(data)}
            >
                <Assignment />
            </IconButton>
        </Grid>
    );
};

const gethosptialClinicName = (rfrHcinstId, hospitalList) => {
    // let rfrHcinstId=params.data.rfrHcinstId;
    const curHospital = hospitalList && hospitalList.find(item => item.hcinstId === rfrHcinstId);
    if (curHospital) {
        return curHospital.name;
    } else {
        return '';
    }
};

const genColumn = (props) => {
    let col = [
        {
            headerName: '',
            minWidth: 80,
            maxWidth: 80,
            lockPinned: true,
            sortable: false,
            filter: false,
            // cellStyle: { color: 'red' },
            valueFormatter: params => params.data.rowId + 1
        },
        {
            headerName: 'Referral Doc.',
            colId: 'referralDoc',
            // field: 'createDtm',
            // width: 140,
            maxWidth: 140,
            minWidth: 140,
            sortable: false,
            cellRenderer: 'rfrLetterAssignment',
            cellRendererParams: {
                onClick: (data) => {
                    // this.updateClinicList({ isAdmin: value }, rowIndex);
                    props.previewRfrLetter(data);
                }
            }
            // valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_MMMM_24_HOUR)
        },
        {
            headerName: 'Date',
            colId: 'date',
            field: 'createDtm',
            // width: 125,
            maxWidth: 125,
            minWidth: 125,
            sortable: false,
            valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE)
        },
        {
            headerName: 'Group',
            colId: 'group',
            field: 'group',
            width: 205,
            minWidth: 205,
            sortable: false
            // valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_MMMM_24_HOUR)
        },
        {
            headerName: 'Service',
            colId: 'service',
            field: 'service',
            width: 235,
            minWidth: 235,
            sortable: false,
            cellStyle: {}
            // valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_MMMM_24_HOUR)
        },
        {
            headerName: 'Hosptial / Clinic',
            colId: 'hosptialClinic',
            field: '',
            width: 315,
            minWidth: 315,
            sortable: false,
            valueFormatter: params => {
                return params.data.hcinstName || '';
            },
            tooltipField: undefined,
            tooltip: params => params.valueFormatted
        },
        {
            headerName: 'Specialty',
            colId: 'specialty',
            field: '',
            width: 285,
            minWidth: 285,
            sortable: false,
            valueFormatter: params => {
                let { groupCd, rfrHcinstId } = params.data;
                let hosptialClinicName = gethosptialClinicName(rfrHcinstId, props.hospital);
                if (groupCd === 'Others' && hosptialClinicName === 'Others') {
                    return params.data.others;
                } else {
                    return params.data.specialtyName || '';
                }
            },
            tooltipField: undefined,
            tooltip: params => params.valueFormatted
        },
        {
            headerName: 'Details',
            colId: 'details',
            field: 'details',
            width: 230,
            minWidth: 230,
            sortable: false,
            tooltipField: 'details'
        },
        {
            headerName: 'Update By',
            colId: 'updateBy',
            field: 'createBy',
            width: 205,
            minWidth: 205,
            sortable: false
        }
    ];
    return col;
};

const setRowId = (data) => {
    let rfrData = Array.isArray(data) ? data : [];
    return rfrData.map((item, index) => ({
        ...item,
        rowId: index
    }));
};



const ReferralPanel = React.forwardRef((props, ref) => {
    const { classes, rfrDetails, id
        // serviceList, clinicConfig, loginSvcCd
    } = props;
    const column = genColumn(props);
    const rowData = setRowId(rfrDetails || []);

    return (
        <Grid container style={{ paddingBottom: 16 }}>
            <ExpansionPanel
                square
                defaultExpanded
                className={classes.expansionPanelRoot}
            >
                <ExpansionPanelSummary
                    id={`${id}_summary`}
                    classes={{
                        root: classes.expansionPanelSummaryRoot,
                        expandIcon: classes.expansionPanelSummaryIcon
                    }}
                    expandIcon={<ExpandMore id={`${id}_expandIcon`} />}
                >
                    <label className={classes.expansionPanelSummaryLabel}>Referral</label>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails
                    className={classes.expansionPanelDetails}
                >
                    {rowData.length > 0 ?
                        <Grid container className={classes.detailContainer}>
                            <CIMSDataGrid
                                ref={ref}
                                gridTheme="ag-theme-balham"
                                divStyle={{
                                    width: '100%',
                                    height: rowData.length > 10 ? 535 : `${50 * rowData.length + 35}px`,
                                    display: 'block'
                                    // minWidth: 1840
                                }}
                                gridOptions={{
                                    columnDefs: column,
                                    rowData: rowData,
                                    rowSelection: 'single',
                                    // onGridReady: (params) => {
                                    //     this.gridApi = params.api;
                                    //     this.gridColumnApi = params.columnApi;
                                    // },
                                    getRowHeight: () => 50,
                                    getRowNodeId: item => item.rowId.toString(),
                                    suppressRowClickSelection: false,
                                    enableBrowserTooltips: true,
                                    frameworkComponents: {
                                        rfrLetterAssignment: RfrLetterPreview
                                    }
                                }}
                                suppressGoToRow
                                suppressDisplayTotal
                            />
                        </Grid>
                        :
                        <div style={{ padding: '5px 10px', color: '#a7a7a7', display: 'block' }}>
                            <label>No Record</label>
                        </div>
                    }

                </ExpansionPanelDetails>

            </ExpansionPanel>
        </Grid>
    );
});

export default ReferralPanel;