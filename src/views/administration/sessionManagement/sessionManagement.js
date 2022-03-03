import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { colors } from '@material-ui/core';
import {
    Box,
    Button,
    Checkbox,
    Container,
    Grid,
    Paper
} from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import moment from 'moment';
import {
    updateState,
    deleteSession,
    listSessionOfService,
    listSessionOfSite,
    listSingleSessionById
} from '../../../store/actions/administration/sessionManagement/sessionManagementAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import SessionManagementDialog from './sessionManagementDialog';
import * as DateUtilities from '../../../utilities/dateUtilities';
import Enum from '../../../enums/enum';
import 'ag-grid-community/dist/styles/ag-grid.css';
import '../../../styles/ag-theme-balham/sass/ag-theme-balham.scss';
import {
    CheckBox,
    CheckBoxOutlineBlank
} from '@material-ui/icons';
import { auditAction } from '../../../store/actions/als/logAction';
import AlsDesc from '../../../constants/ALS/alsDesc';

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
    root: {
        width: '100%'
    },
    subTitle: {
        paddingLeft: '10px',
        wordBreak: 'break-all'
    },
    tablebutton: {
        width: '150px',
        margin: '0px',
        marginBottom: '5px'
    },
    mainButton: {
        width: '100%'
    },
    tableHeadRow: {
        height: '38px'
    },
    container: {
        padding: '10px 0px'
    },
    actionButtonRoot: {
        color: '#0579c8',
        border: 'solid 1px #0579C8',
        boxShadow: '2px 2px 2px #6e6e6e',
        backgroundColor: '#ffffff',
        minWidth: '90px',
        '&:disabled': {
            border: 'solid 1px #aaaaaa',
            boxShadow: '1px 1px 1px #6e6e6e'
        },
        '&:hover': {
            color: '#ffffff',
            backgroundColor: '#0579c8'
        }
    }
});

class SessionManagement extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isServiceAdmin: false,
            rowSelected: []
        };

        this.refGrid = React.createRef();
    }

    componentDidMount() {
        this.getSessionByAdminRole();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.sessionManagement.dialogAction != '' && prevProps.sessionManagement.dialogAction != this.props.sessionManagement.dialogAction) {
            this.getSessionByAdminRole();
        }
    }

    componentWillUnmount() {
        if (this.refGrid.current) {
            this.refGrid.current.grid.api.destroy();
        }
    }

    getSessionByAdminRole = () => {
        const {
            login,
            isSystemAdmin,
            isServiceAdmin,
            isClinicalAdmin
        } = this.props;
        if (login) {
            if (isSystemAdmin || isServiceAdmin) {
                this.props.listSessionOfService(login.service.svcCd);
                this.setState({
                    ...this.state,
                    isServiceAdmin: true
                });
            } else {
                this.props.listSessionOfSite(login.clinic.siteId);
                this.setState({
                    ...this.state,
                    isServiceAdmin: false
                });
            }
        }
    }

    handleDelete = () => {
        if (this.state.rowSelected.length > 0) {
            this.props.auditAction(AlsDesc.DELETE,null,null,false,'cmn');
            this.props.openCommonMessage({
                msgCode: '130601',
                params: [
                    {name: 'HEADER', value: 'Confirm Delete'},
                    {name: 'MESSAGE', value: 'Do you confirm the delete action?'}
                ],
                btnActions: {
                    btn1Click: () => {
                        this.props.auditAction('Confirm Delete');
                        // for (let i = 0; i < this.state.rowSelected.length; i++) {
                        let rowData = this.state.rowSelected[0];
                        this.props.deleteSession(rowData,()=>{
                            this.getSessionByAdminRole();
                        });
                        // }
                    },
                    btn2Click: () => {
                        this.props.auditAction('Cancel Delete',null,null,false,'cmn');
                        this.clearTableSelected();
                    }
                }
            });
        }
    }

    handleCreate = () => {
        this.props.auditAction(AlsDesc.CREATE,null,null,false,'cmn');
        this.props.updateState({dialogOpen: true, dialogAction: 'create'});
    }

    handleUpdate = () => {
        if (this.state.rowSelected.length === 1) {
            this.props.auditAction('Update Session',null,null,false,'cmn');
            this.props.updateState({dialogOpen: true, dialogAction: 'update'});
            this.clearTableSelected();
            this.props.listSingleSessionById(this.state.rowSelected[0].sessId);
        }
    }

    handlePrint = () => {
    }

    listTimeSlotListByClearSelected = (params, reset = false) => {

    }

    getSearchParams = () => {
        return {
            encounterTypeCd: this.props.encounterTypeCd,
            subEncounterTypeCd: this.props.subEncounterTypeCd,
            dateFrom: this.props.dateFrom ? moment(this.props.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE) : moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
            dateTo: this.props.dateTo ? moment(this.props.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE) : moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
            page: this.props.page,
            pageSize: this.props.pageSize
        };
    }

    clearTableSelected = () => {
        //this.tableRef.clearSelected();
        this.refGrid.current.grid.api.deselectAll();
        this.setState({
            ...this.state,
            rowSelected: []
        });
    }

    render() {
        const {
            classes,
            sessionManagement,
            clinicList,
            isSystemAdmin,
            isServiceAdmin,
            isClinicalAdmin
        } = this.props;

        const id = this.props.id || 'sessionManagement';

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
                        <Paper elevation={5}
                            style={{width: '100%', height: '100%', marginTop: '10px', marginBottom: '10px'}}
                        >
                            <Box display="flex" flexDirection="column" justifyContent="flex-start">
                                <Box display="flex" p={1}>
                                    <Grid container spacing={1}>
                                        <Grid item md={2} lg={1}>
                                            <Button
                                                id="sessionManagement_createBtn"
                                                className={classes.actionButtonRoot}
                                                variant="contained"
                                                color="primary"
                                                onClick={this.handleCreate}
                                                disabled={!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin}
                                            >
                                                Create
                                            </Button>
                                        </Grid>
                                        <Grid item md={2} lg={1}>
                                            <Button
                                                id="sessionManagement_updateBtn"
                                                ref={ref => this.refUpdate = ref}
                                                className={classes.actionButtonRoot}
                                                variant="contained"
                                                color="primary"
                                                disabled={(!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin) || this.state.rowSelected.length != 1}
                                                onClick={this.handleUpdate}
                                            >
                                                Update
                                            </Button>
                                        </Grid>
                                        <Grid item md={2} lg={1}>
                                            <Button
                                                id="sessionManagement_deleteBtn"
                                                className={classes.actionButtonRoot}
                                                variant="contained"
                                                color="primary"
                                                // disabled={this.state.rowSelected.length < 1}
                                                disabled={(!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin) || this.state.rowSelected.length != 1}
                                                onClick={this.handleDelete}
                                            >
                                                Delete
                                            </Button>
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
                                                    headerName: '',
                                                    valueGetter: (params) => '',
                                                    filter: false,
                                                    headerCheckboxSelection: true,
                                                    checkboxSelection: true,
                                                    minWidth: 40,
                                                    maxWidth: 40
                                                },
                                                // {headerName: 'GID', field: 'groupId'},
                                                {
                                                    headerName: 'Site English Name',
                                                    // minWidth: 115,
                                                    valueGetter: (params) => {
                                                        let siteEnglishName = clinicList.find(x => x.siteId === params.data.siteId);
                                                        if (siteEnglishName)
                                                            return siteEnglishName.siteEngName;
                                                        return '';
                                                    },
                                                    tooltipValueGetter: (params) => params.value
                                                },
                                                {
                                                    headerName: 'Session',
                                                    valueGetter: (params) => {
                                                        return params.data.sessDesc;
                                                    },
                                                    tooltipValueGetter: (params) => params.value
                                                },
                                                {
                                                    headerName: 'Session Start Time',
                                                    valueGetter: (params) => {
                                                        return params.data.stime;
                                                    },
                                                    tooltipValueGetter: (params) => params.value
                                                },
                                                {
                                                    headerName: 'Session End Time',
                                                    valueGetter: (params) => {
                                                        return params.data.etime;
                                                    },
                                                    tooltipValueGetter: (params) => params.value
                                                },
                                                {
                                                    headerName: 'Effective Date',
                                                    valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_FOCUS_DMY_VALUE),
                                                    valueGetter: (params) => {
                                                        return params.data.efftDate;
                                                    },
                                                    tooltipValueGetter: (params) => params.value
                                                },
                                                {
                                                    headerName: 'Expiry Date',
                                                    // valueFormatter: params => params.value !== null && moment(params.value).format('DD-MM-YYYY'),
                                                    valueGetter: (params) => {
                                                        return params.data.expyDate ? moment(params.data.expyDate).format(Enum.DATE_FORMAT_FOCUS_DMY_VALUE) : 'N/A';
                                                    },
                                                    tooltipValueGetter: (params) => params.value
                                                },
                                                {
                                                    headerName: 'Is Active',
                                                    valueGetter: (params) => {
                                                        return params.data.status == 'A' ? 'Yes' : 'No';
                                                    },
                                                    tooltipValueGetter: (params) => params.value
                                                },
                                                {
                                                    headerName: 'Updated On',
                                                    // minWidth: 180,
                                                    // maxWidth: 180,
                                                    field: 'updateDtm',
                                                    valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_FOCUS_DMY_VALUE),
                                                    tooltipValueGetter: (params) => params.valueFormatted,
                                                    comparator: DateUtilities.dateComparator,
                                                    filter: 'agDateColumnFilter',
                                                    filterParams: {
                                                        comparator: DateUtilities.dateFilter,
                                                        browserDatePicker: true
                                                    }
                                                }
                                            ],
                                            onCellFocused: e => {
                                                // if (e.column && this.disableClickSelectionRenderers.includes(e.column.colDef.cellRenderer)) {
                                                //     e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
                                                // }
                                                // else {
                                                //     e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = false;
                                                // }
                                            },
                                            rowSelection: 'multiple',
                                            rowMultiSelectWithClick: true,
                                            //suppressRowClickSelection: true,
                                            headerHeight: 48,
                                            enableBrowserTooltips: true,
                                            rowData: this.props.sessionManagement.records.filter(x => x.status != 'D'),
                                            onRowSelected: event => {
                                                if ((isSystemAdmin || isServiceAdmin || isClinicalAdmin) && this.props.sessionManagement.dialogAction === '') {
                                                    this.setState({
                                                        ...this.state,
                                                        rowSelected: this.refGrid.current ? this.refGrid.current.grid.api.getSelectedRows() : []
                                                    });
                                                }
                                            },
                                            onRowClicked: e => {
                                                if ((isSystemAdmin || isServiceAdmin || isClinicalAdmin)) {
                                                    if (e.column && this.disableClickSelectionRenderers.includes(e.column.colDef.cellRenderer)) {
                                                        e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
                                                    } else {
                                                        e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = false;
                                                    }
                                                }
                                            },
                                            onRowDoubleClicked: event => {
                                                if ((isSystemAdmin || isServiceAdmin || isClinicalAdmin) && this.props.sessionManagement.dialogAction === '') {
                                                    this.setState({
                                                        ...this.state,
                                                        rowSelected: [event.data]
                                                    }, () => {
                                                        this.handleUpdate();
                                                    });
                                                }
                                            },
                                            getRowHeight: (params) => 40,
                                            getRowNodeId: data => data.sessId,
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
                                </Box>
                            </Box>
                            {
                                this.props.dialogOpen && this.props.dialogAction ?
                                    <SessionManagementDialog
                                        id={id + '_timeslotPlanDialog'}
                                        open={this.props.dialogOpen}
                                        isServiceAdmin={this.state.isServiceAdmin}
                                        rowSelected={this.state.rowSelected}
                                        clearRowSelected={this.clearTableSelected}
                                    /> : null
                            }
                        </Paper>
                    </Grid>
                </Container>
            </MuiThemeProvider>
        )
            ;
    }
}

function mapStateToProps(state) {
    return {
        dialogOpen: state.sessionManagement.dialogOpen,
        dialogAction: state.sessionManagement.dialogAction,
        login: state.login,
        sessionManagement: state.sessionManagement,
        clinicList: state.common.clinicList,
        isSystemAdmin: state.login.isSystemAdmin,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin: state.login.isClinicalAdmin
    };
}

const mapDispatchToProps = {
    updateState,
    deleteSession,
    listSessionOfService,
    listSessionOfSite,
    listSingleSessionById,
    openCommonMessage,
    auditAction
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SessionManagement));
