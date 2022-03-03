import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { colors } from '@material-ui/core';
import _ from 'lodash';
import {
    Box,
    Checkbox,
    Container,
    Grid,
    Paper
} from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CIMSCommonButton from '../../../../../components/Buttons/CIMSCommonButton';
import CIMSDataGrid from '../../../../../components/Grid/CIMSDataGrid';
import moment from 'moment';

import {
    updateField,
    requestData,
    deleteData,
    openPreviewWindow
} from '../../../../../store/actions/report/reportTemplateAction';

import { openCommonMessage } from '../../../../../store/actions/message/messageAction';
import ReportConfigDialog from './reportConfigDialog';
import * as CommonUtil from '../../../../../utilities/commonUtilities';
import * as DateUtilities from '../../../../../utilities/dateUtilities';
import Enum from '../../../../../enums/enum';
import * as reportConstant from '../../../../../constants/report/reportConstant';
import * as listUtilities from '../../../../../utilities/listUtilities';


import 'ag-grid-community/dist/styles/ag-grid.css';
import '../../../../../styles/ag-theme-balham/sass/ag-theme-balham.scss';

import {
    Check,
    CheckBox,
    CheckBoxOutlineBlank,
    Clear
} from '@material-ui/icons';

const theme = createMuiTheme({
    palette: {
        white: colors.common.white,
        black: colors.common.black,
        genderMaleColor: {
            color: 'rgba(209, 238, 252, 1)',
            transparent: 'rgba(209, 238, 252, 0.1)'
        },
        genderFeMaleColor: {
            color: 'rgba(254, 222, 237, 1)',
            transparent: 'rgba(254, 222, 237, 0.1)'
        },
        genderUnknownColor: {
            color: 'rgba(248, 209, 134, 1)',
            transparent: 'rgba(248, 209, 134, 0.1)'
        },
        deadPersonColor: {
            color: 'rgba(64, 64, 64, 1)',
            transparent: 'rgba(64, 64, 64, 1)',
            fontColor: () => this.white
        }
    }
});

const styles = () => ({

});

class ReportConfig extends Component {
    constructor(props) {
        super(props);

        const where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
        const defaultQuotaDesc = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.QUOTA_TYPE_DESC, this.props.clinicConfig, where);
        const quotaArr = defaultQuotaDesc.configValue ? defaultQuotaDesc.configValue.split('|') : null;
        let newQuotaArr = CommonUtil.transformToMap(quotaArr);
        let quotaChild = [];
        newQuotaArr.forEach((item) => {
            let newParams = { name: `new${item.engDesc}`, label: `New${item.engDesc}` };
            let oldParams = { name: `old${item.engDesc}`, label: `Old${item.engDesc}` };
            quotaChild.push(newParams);
            quotaChild.push(oldParams);
        });
        let bookingChild = [];
        newQuotaArr.forEach((item) => {
            let newParams = { name: `new${item.engDesc}Book`, label: `New${item.engDesc}` };
            let oldParams = { name: `old${item.engDesc}Book`, label: `Old${item.engDesc}` };
            bookingChild.push(newParams);
            bookingChild.push(oldParams);
        });

        let columnDefs = [];
        let colDefs= [
            {headerName: 'No.', colId: 'no', valueGetter: (params) => params.node.rowIndex + 1, minWidth: 70},
            {headerName: '', colId: 'checkBox', valueGetter: (params) => '', filter: false, headerCheckboxSelection: true, checkboxSelection: true, minWidth: 50},
            //{headerName:"Report Config id",field:"reportConfigId", width:300 },
            {headerName:'Report Template Name',field:'reportName', minWidth:225, cellRendererParams: {inputType:'select'}},
            {headerName:'Description',field:'reportDesc', minWidth:555, cellRendererParams: {inputType:'select'}},
            {headerName:'Sites',field:'siteIds', minWidth:460 ,
                valueFormatter: param => listUtilities.getFieldFromObjArray(this.props.clinicList.filter(x => param.value.includes(x.siteId)), 'siteCd').join(', ')
            },
            {headerName:'Job Start Date',field:'jobStartDtm', minWidth:160, _type:'Date' },
            //{headerName:"Job Start Time",field:"jobStartDtm", width:160, _type:"Time" },
            {headerName:'Job Period Type',field:'jobPeriodType', minWidth:170 ,
                valueFormatter: (param) => {
                    let r = reportConstant.JOB_PERIOD_TYPE_CODE.find(x => x.code ===  param.value);
                    return r ? r.engDesc : '';
                }
            },
            {headerName:'Active',field:'isDisable', minWidth:105,
                valueFormatter: (param) => {
                    return param.value === 'N'? 'YES' : 'NO';
                }
            }
            //{headerName:"Max Retry",field:"maxRetryCount", width:150 }
            //{headerName:"Parameter String",field:"paramString", width:220 }

        ];
        for (let i = 0; i < colDefs.length; i++){
            let {colId, field, width, cellRendererParams, _type } = colDefs[i];
            let col = {
                ...colDefs[i],
                cellStyle: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                },
                resizable: true,
                //maxWidth:width,
                //minWidth:width,
                sortable: true,
                cellRenderer: 'gridCellRenderer',
                cellRendererParams: {
                    classes: this.props.classes,
                    getField: this.getField,
                    changeField: this.changeField,
                    blurField: this.blurField,
                    inputComponent: 'html',
                    inputType: 'text',
                    //inputFormat: "HH:mm",
                    ...cellRendererParams
                }
            };
            switch (field){
                default:
                    switch(colId) {
                        case 'no':
                        case 'checkBox':
                            col = {
                                ...col,
                                cellRenderer:undefined,
                                cellRendererParams:undefined
                            };
                            break;
                    }
                    break;
            }
            switch (_type){
                case 'Datetime':
                    col = {
                        ...col,
                        valueFormatter: (param) => param.value ? moment(param.value).format( Enum.NO_ZERO_DATE_FORMAT_24 ) : null,
                        comparator: DateUtilities.formatDateComparator(),
                        filterParams: {
                            comparator: DateUtilities.dateFilter,
                            browserDatePicker: true
                        }
                    };
                    break;
                case 'Date':
                    col = {
                        ...col,
                        valueFormatter: (param) => param.value? moment(param.value).format( Enum.NO_ZERO_DATE_FORMAT_EDMY_VALUE) : null,
                        comparator: DateUtilities.formatDateComparator(),
                        filterParams: {
                            comparator: DateUtilities.dateFilter,
                            browserDatePicker: true
                        }
                    };
                    break;
                case 'Time':
                    col = {
                        ...col,
                        valueFormatter: (param) => moment(param.value).format( Enum.TIME_FORMAT_12_HOUR_CLOCK),
                        comparator: DateUtilities.formatDateComparator(),
                        filterParams: {
                            comparator: DateUtilities.dateFilter,
                            browserDatePicker: true
                        }
                    };
                    break;
                default:
                    break;
            }
            colDefs[i] = col;
        }
        columnDefs = columnDefs.concat(colDefs);
        //this.state = {
            //columnDefs: columnDefs
        //};
        this.state = {
            columnDefs: columnDefs,
            rowData: [],
            rowSelected: []
        };


        this.refGrid = React.createRef();
    }

    componentDidMount() {
        this.getReportConfigList();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.reportConfigList !== this.props.reportConfigList ) {
            let reportConfigList = this.props.reportConfigList;
            this.setState({ rowData: reportConfigList});
        }

        if (prevProps.dialogConfigOpen !== this.props.dialogConfigOpen && this.props.dialogConfigOpen === false){
            this.clearTableSelected();
        }
    }

    componentWillUnmount() {
        //this.props.resetAll();
        if (this.refGrid.current) {
            this.refGrid.current.grid.api.destroy();
        }
    }

    getReportConfigList = () => {
        //this.props.requestData("reportTemplates", params);
        console.log('getting report configs.. ');
        this.props.requestData('reportConfigList', {svcCd: this.props.serviceCd});
    }

    handleDelete = () => {
        if (this.state.rowSelected.length > 0) {
            this.props.openCommonMessage({
                msgCode: '130302',
                params: [
                    { name: 'HEADER', value: 'Confirm Delete' },
                    { name: 'MESSAGE', value: 'Do you confirm the delete action?' }
                ],
                btnActions: {
                    btn1Click: () => {
                        let rptConfigIds = listUtilities.getFieldFromObjArray(this.state.rowSelected, 'reportConfigId');
                        console.log('---------------------------------------------------');
                        console.log(rptConfigIds);
                        console.log('---------------------------------------------------');
                        this.props.deleteData('reportConfigs', { rptConfigList: rptConfigIds }, this.getReportConfigList );
                    },
                    btn2Click: () => {
                        this.clearTableSelected();
                    }
                }
            });
        }
    }

    handleCreate = () => {
        this.props.updateField({ dialogConfigOpen: true, dialogConfigAction: 'create', selectedReportConfigId: 0 });
    }

    handleUpdate = () => {
        if (this.state.rowSelected.length === 1) {
            const selected = this.state.rowSelected[0];
            if (moment(selected.edate).diff(moment(), 'days') < 0) {
                this.props.openCommonMessage({
                    msgCode: '110922'
                });
                this.clearTableSelected();
                return;
            }
            this.props.updateField({ dialogConfigOpen: true, dialogConfigAction: 'update', selectedReportConfigId: selected.reportConfigId, selectedReportConfig: selected});
        } else {
            this.props.openCommonMessage({
                msgCode: '110911'
            });
            this.clearTableSelected();
        }
    }

    clearTableSelected = () => {
        this.refGrid.current.grid.api.deselectAll();
        this.props.updateField({ selectedItems: [] });
    }

    disableClickSelectionRenderers = [''];

    render() {
        const { clinicList } = this.props;
        const id = this.props.id || 'reportConfig';

        return (
            <MuiThemeProvider theme={theme}>
                <Container maxWidth="xl">
                    <Grid
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justify="center"
                    >
                        <Paper elevation={5} style={{ width: '100%', height: '100%', marginTop: '10px', marginBottom: '10px' }}>
                            <Box display="flex" flexDirection="column" justifyContent="flex-start">
                                <Box display="flex" p={1}>
                                    <Grid container spacing={1}>
                                        <Grid item md={2} lg={1}>
                                            <CIMSCommonButton
                                                onClick={this.handleCreate}
                                            >
                                                Create
                                            </CIMSCommonButton>
                                        </Grid>
                                        <Grid item md={2} lg={1}>
                                            <CIMSCommonButton
                                                ref={ref => this.refUpdate = ref}
                                                disabled={this.state.rowSelected.length != 1}
                                                onClick={this.handleUpdate}
                                            >
                                                Update
                                            </CIMSCommonButton>
                                        </Grid>
                                        <Grid item md={2} lg={1}>
                                            <CIMSCommonButton
                                                disabled={this.state.rowSelected.length < 1}
                                                onClick={this.handleDelete}
                                            >
                                                Delete
                                            </CIMSCommonButton>
                                        </Grid>
                                    </Grid>
                                </Box>
                                <Box display="flex">
                                    <CIMSDataGrid
                                        ref={this.refGrid}
                                        gridTheme="ag-theme-balham"
                                        divStyle={{
                                            width: '100%',
                                            height: '651px',
                                            display:'block'
                                        }}
                                        gridOptions={{
                                            columnDefs : this.state.columnDefs,
                                            onCellFocused: e => {
                                                if (e.column && this.disableClickSelectionRenderers.includes(e.column.colDef.cellRenderer)) {
                                                    e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
                                                }
                                                else {
                                                    e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = false;
                                                }
                                            },
                                            frameworkComponents: {
                                            },
                                            rowBuffer: 30,
                                            rowSelection: 'multiple',
                                            rowMultiSelectWithClick: true,
                                            //suppressRowClickSelection: true,
                                            headerHeight: 48,
                                            enableBrowserTooltips: true,
                                            rowData: this.state.rowData,
                                            onRowSelected: event => {
                                                this.setState({
                                                    rowSelected: this.refGrid.current ? this.refGrid.current.grid.api.getSelectedRows() : []
                                                });
                                            },
                                            onRowDoubleClicked: params => {
                                                let selectedRow = params.data;
                                                let node = params.node;
                                                node.setSelected(true);
                                                this.setState({
                                                    rowSelected: [selectedRow]
                                                }, () => {
                                                    this.handleUpdate();
                                                });
                                            },
                                            getRowHeight: (params) => 40,
                                            getRowNodeId: data => data.reportConfigId,
                                            postSort: rowNodes => {
                                                let rowNode = rowNodes[0];
                                                if (rowNode) {
                                                    setTimeout((rowNode) => {
                                                        rowNode.gridApi.refreshCells();
                                                    }, 100, rowNode);
                                                }
                                            }
                                        }}
                                        //disableAutoSize
                                    />
                                </Box>
                            </Box>
                            {
                                this.props.dialogConfigOpen && this.props.dialogConfigAction ?
                                    <ReportConfigDialog
                                        id={id + '_reportConfigDialog'}
                                        open={this.props.dialogConfigOpen}
                                        isStatReportSvcUsersRight={this.props.isStatReportSvcUsersRight}
                                        isStatReportSiteUsersRight={this.props.isStatReportSiteUsersRight}
                                    /> : null
                            }
                        </Paper>
                    </Grid>
                </Container>
            </MuiThemeProvider>
        );
    }
}

function mapStateToProps(state) {
    return {
        dialogConfigOpen: state.reportTemplate.dialogConfigOpen,
        dialogConfigAction: state.reportTemplate.dialogConfigAction,
        reportConfigList: state.reportTemplate.reportConfigList,
        clinicList: state.common.clinicList,
        clinicConfig: state.common.clinicConfig,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        siteId: state.login.clinic.siteId
    };
}

const mapDispatchToProps = {
    //resetAll,
    updateField,
    requestData,
    deleteData,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ReportConfig));
