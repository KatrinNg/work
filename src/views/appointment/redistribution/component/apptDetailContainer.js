import React from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import CIMSDrawer from '../../../../components/Drawer/CIMSDrawer';
import Form from '../../../../components/FormValidator/ValidatorForm';
import Select from '../../../../components/FormValidator/SelectFieldValidator';
import DatePicker from '../../../../components/FormValidator/DateFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import ApptCellRender from './apptCellRender';
import { EnctrAndRmUtil } from '../../../../utilities';

const styles = theme => ({
    drawerRoot: {
        height: '94%'
    },
    form: {
        width: '100%',
        height: '100%'
    },
    formContainer: {
        padding: theme.spacing(1),
        height: '100%',
        flexDirection: 'column',
        flexWrap: 'nowrap'
    },
    iconButton: {
        display: 'none'
    },
    listContainer: {
        height: '100%'
    }
});

class ApptDetailContainer extends React.Component {

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.selectedData) !== JSON.stringify(this.props.selectedData) || prevProps.rows !== this.props.rows) {
            this.refreshColumn();
            this.gridApi && this.gridApi.resetRowHeights();
        }
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    refreshColumn = () => {
        this.gridApi && this.gridApi.refreshCells({ columns: ['appts'], suppressFlash: false, force: true });
    }

    resetForm = () => {
        this.apptDetailsFormRef && this.apptDetailsFormRef.resetValidations();
    }

    render() {
        const {
            id,
            classes,
            rows,
            role,
            criteria,
            rooms,
            siteId,
            svcCd,
            sessionsConfig,
            disableCriteria,
            selectedData
        } = this.props;

        let columnDefs = [
            {
                headerName: 'Time',
                field: 'stime',
                minWidth: 80,
                maxWidth: 80
            },
            {
                headerName: 'Patient Info.',
                field: 'appts',
                width: 781,
                suppressCellFlash: true,
                cellRenderer: 'ApptCellRender',
                cellRendererParams: {
                    selectedData,
                    onClick: (data) => {
                        this.props.onClickAppt(data, role);
                    }
                }
            }
        ];

        let filterRooms = EnctrAndRmUtil.getActiveRooms(rooms, siteId);
        let filterSessions = EnctrAndRmUtil.getActiveSessions(sessionsConfig, svcCd, siteId);

        return (
            <Grid item container>
                <CIMSDrawer
                    id={`${id}_drawer`}
                    open
                    title="Appointment Details"
                    drawerWidth={'100%'}
                    classes={{
                        drawer: classes.drawerRoot,
                        iconButton: classes.iconButton
                    }}
                >
                    <Form className={classes.form} ref={r => this.apptDetailsFormRef = r}>
                        <Grid container className={classes.formContainer}>
                            <Grid item container justify="flex-end" spacing={1} style={{ marginBottom: 12 }}>
                                <Grid item xs={4}>
                                    <DatePicker
                                        id={`${id}_date`}
                                        value={criteria && criteria.date}
                                        onChange={e => this.props.onChange({ date: e }, role)}
                                        label={<>{`${role} Date`}<RequiredIcon /></>}
                                        inputVariant="outlined"
                                        isRequired
                                        absoluteMessage
                                        // disablePast
                                        // disablePastMessage={CommonMessage.SELECTED_DATE_BEFORE_TODAY()}
                                        disabled={disableCriteria}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <Select
                                        id={`${id}_room`}
                                        value={criteria && criteria.room}
                                        onChange={e => this.props.onChange({ room: e.value }, role)}
                                        options={filterRooms && filterRooms.map(x => ({ value: x.rmId, label: x.rmDesc }))}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        TextFieldProps={{
                                            label: <>Room<RequiredIcon /></>,
                                            variant: 'outlined'
                                        }}
                                        absoluteMessage
                                        sortBy="label"
                                        isDisabled={disableCriteria}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <Select
                                        id={`${id}_sessions`}
                                        value={criteria && criteria.session}
                                        onChange={e => this.props.onChange({ session: e.value }, role)}
                                        options={filterSessions && filterSessions.map(x => ({ value: x.sessId, label: x.sessDesc }))}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        TextFieldProps={{
                                            label: <>Sessions<RequiredIcon /></>,
                                            variant: 'outlined'
                                        }}
                                        absoluteMessage
                                        sortBy="label"
                                        isDisabled={disableCriteria}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item container className={classes.listContainer}>
                                <CIMSDataGrid
                                    disableAutoSize
                                    gridTheme="ag-theme-balham"
                                    divStyle={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'block'
                                    }}
                                    gridOptions={{
                                        columnDefs: columnDefs,
                                        rowData: rows || [],
                                        getRowNodeId: data => data.tmsltId,
                                        rowBuffer: 500,
                                        getRowHeight: function (params) {
                                            let appts = params.data.appts;
                                            return appts && appts.length > 0 ? appts.length * 35 : 35;
                                        },
                                        onGridReady: this.onGridReady,
                                        defaultColDef: {
                                            autoHeight: true,
                                            suppressMenu: true,
                                            suppressMovable: true,
                                            suppressSorting: true
                                        },
                                        frameworkComponents: {
                                            ApptCellRender: ApptCellRender
                                        },
                                        suppressRowHoverHighlight: true
                                    }}
                                    suppressGoToRow
                                    suppressDisplayTotal
                                    suppressRowTransform
                                    suppressColumnVirtualisation
                                />
                            </Grid>
                        </Grid>
                    </Form>
                </CIMSDrawer>
            </Grid>
        );
    }
}

const mapState = state => ({
    svcCd: state.login.service.svcCd,
    siteId: state.login.clinic.siteId,
    rooms: state.common.rooms,
    sessionsConfig: state.common.sessionsConfig
});

const mapDispatch = {
};

export default connect(mapState, mapDispatch)(withStyles(styles)(ApptDetailContainer));