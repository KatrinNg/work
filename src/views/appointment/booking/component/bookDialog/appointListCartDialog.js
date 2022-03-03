import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import memoize from 'memoize-one';
import moment from 'moment';
import _ from 'lodash';
import { Grid, Typography, IconButton,Tooltip } from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import CIMSSelect from '../../../../../components/Select/CIMSSelect';
import CIMSPromptDialog from '../../../../../components/Dialog/CIMSPromptDialog';
import CIMSDataGrid from '../../../../../components/Grid/CIMSDataGrid';
import Enum from '../../../../../enums/enum';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import { auditAction } from '../../../../../store/actions/als/logAction';
import DatePicker from '../../../../../components/FormValidator/DateValidator';
import CommonMessage from '../../../../../constants/commonMessage';
import {
    updateAppointmentListCart
} from '../../../../../store/actions/appointment/booking/bookingAction';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';

const styles = theme => ({
    boldFont: {
        fontWeight: 'bold'
    },
    dialogPaper: {
        width: '75%'
    },
    dateStyle: {
        width: '150px'
    }
});

class DateRender extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value ? moment(this.props.value).format(Enum.DATE_FORMAT_EYMD_VALUE) : null
        };
    }

    componentDidMount() {
        this.dateRef.validateCurrent(() => {
            this.dateRef && this.dateRef.showMessage();
        });
    }

    onChange = (e) => {
        this.setState({ value: e });
    }

    onBlur = () => {
        const { data } = this.props;
        const { value } = this.state;
        if (this.dateRef.isValidCurr()) {
            if (this.isValueChanged(value, this.props.value) && (!value || moment(value).isValid())) {
                this.props.onChange(value && moment(value).format(Enum.DATE_FORMAT_EYMD_VALUE), data.rowId);
            }
        } else {
            this.dateRef.showMessage();
            setTimeout(() => {
                this.dateRef && this.dateRef.hideMessage();
            }, 3000);
        }
    }

    isValueChanged = (state_value, props_value) => {
        if (props_value && state_value) {
            return !moment(state_value).isSame(moment(props_value), 'day');
        } else {
            return !props_value && !state_value ? false : true;
        }
    }

    onAccept = (e) => {
        const { data } = this.props;
        if (this.isValueChanged(e, this.props.value)) {
            this.props.onChange(moment(e).format(Enum.DATE_FORMAT_EYMD_VALUE), data.rowId);
        }
    }


    render() {
        const { data} = this.props;
        const now = moment().locale('zh-cn').format(Enum.DATE_FORMAT_EYMD_VALUE);
        const validators = [
            ValidatorEnum.isRightMoment,
            ValidatorEnum.minDate(moment(now).format(Enum.DATE_FORMAT_EYMD_VALUE))
        ];
        const errorMessages = [
            CommonMessage.VALIDATION_NOTE_INVALID_MOMENT(),
            CommonMessage.VALIDATION_NOTE_MIN_DATE(now)
        ];
        return (
            <Grid container>
                <DatePicker
                    ref={ref => this.dateRef = ref}
                    id={`${this.props.id}_${data.rowId}_apptStartDate`}
                    hideMessage
                    inputVariant="outlined"
                    value={this.state.value}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    onAccept={this.onAccept}
                    isRequired
                    disablePast
                    ignorePresetValidators
                    validators={validators}
                    errorMessages={errorMessages}
                />
            </Grid>
        );
    }
}

class AppointListCartDialog extends React.Component {
    constructor(props) {
        super(props);
        this.cartValidatorRef = null;
        this.dateRef = null;
        this.state = {
            columns: [
                {
                    headerName: 'Encounter Type',
                    field: 'encounterTypeId',
                    width: 200,
                    rowDrag: true,
                    sortable: false,
                    valueGetter: params => {
                        const {bookingData} = params.context;
                        const encounter = bookingData.encounterTypeList.find(x => x.encntrTypeId === params.data.encounterTypeId);
                        return encounter ? encounter.description : '';
                    }
                },
                {
                    headerName: 'Date',
                    field: 'apptStartDate',
                    minWidth: 180,
                    maxWidth:180,
                    sortable: false,
                    cellRenderer: 'dateRender',
                    cellRendererParams: {
                        onChange: (e, rowId) => {
                            this.changeCartListData('apptStartDate',moment(e).format(Enum.DATE_FORMAT_EYMD_VALUE),rowId);
                            this.refreshDateRow(rowId);
                        }
                    }
                },
                {
                    headerName: 'No. of Appointment',
                    field: 'numOfBooking',
                    minWidth: 200,
                    maxWidth: 200,
                    cellRenderer: 'noOfAppointmentRender'
                },
                {
                    headerName: 'Interval',
                    field: 'intervalVal',
                    minWidth: 300,
                    maxWidth:300,
                    sortable: false,
                    cellRenderer: 'intervalRender'
                },
                {
                    headerName: 'Session',
                    field: 'sessId',
                    minWidth: 180,
                    maxWidth: 180,
                    cellRenderer: 'sessionRender',
                    sortable: false
                },
                {
                    headerName: 'Room',
                    field: 'rmId',
                    minWidth: 250,
                    maxWidth:250,
                    cellRenderer: 'roomRender',
                    sortable: false
                },
                {
                    headerName: '',
                    field: 'action',
                    colId: 'action',
                    sortable: false,
                    minWidth: 50,
                    maxWidth: 50,
                    cellRenderer: 'actionRender'
                }
            ],
            appointmentListCartData: this.setRowId(_.clone(props.appointmentListCart)),
            arrayOfNumber: ['1', '2', '3', '4', '5', '6', '7', '8', '9']
        };
    }

    refreshDateRow = (rowIndex) => {
        const rowNode = this.gridApi.getRowNode(rowIndex);
        this.gridApi.refreshCells({ rowNodes: [rowNode], force: true });
    }

    deleteAppointListCart = (data)=>{
        let newAppointmentListCart = _.clone(this.state.appointmentListCartData);
        let rowIndex = this.getIndexForRowId(newAppointmentListCart,data);
        newAppointmentListCart.splice(rowIndex,1);
        this.setState({
            appointmentListCartData:newAppointmentListCart
        });
    }

    changeCartListData = (field,value,rowId) => {
        let newAppointmentListCart = _.clone(this.state.appointmentListCartData);
        for(let item of newAppointmentListCart){
            if(item.rowId === rowId){
                item[field] = value;
            }
        }
        this.setState({
            appointmentListCartData:newAppointmentListCart
        },()=>{
            this.gridApi.refreshCells({ columns: [field], force: true });
            if(field === 'intervalType'){
                this.gridApi.refreshCells({ columns: ['intervalVal'], force: true });
            }
        });
    }


    actionRender = (params) => {
        return (
            <Grid container justify="center">
                <IconButton
                    id={`${this.props.id}_${params.data.rowId}_remove`}
                    onClick={e => this.deleteAppointListCart(params.data)}
                    title="Remove"
                    color="secondary"
                >
                    <DeleteIcon/>
                </IconButton>
            </Grid>
        );
    }

    noOfAppointmentRender = (params) => {
        return (
            <Grid container>
                <CIMSSelect
                    TextFieldProps={{
                        variant: 'outlined'
                    }}
                    id={`${this.props.id}_${params.data.rowId}_numOfBooking`}
                    options={this.state.arrayOfNumber.map(item => (
                        { value: item, label: item }
                    ))}
                    addNullOption={false}
                    value={params.data.numOfBooking}
                    onChange={e => {
                        this.changeCartListData('numOfBooking',e.value,params.data.rowId);
                    }}
                />
            </Grid>
        );
    }

    intervalRender = (params) => {
        return (
            <Grid container spacing={1}>
                <Grid item xs={5}>
                    <CIMSSelect
                        TextFieldProps={{
                            variant: 'outlined'
                        }}
                        addNullOption={false}
                        id={`${this.props.id}_${params.data.rowId}_intervalVal`}
                        options={this.state.arrayOfNumber.map(item => (
                            { value: item, label: item }
                        ))}
                        value={params.data.intervalVal}
                        onChange={e => {
                            this.changeCartListData('intervalVal',e.value,params.data.rowId);
                        }}
                    />
                </Grid>
                <Grid item xs={7}>
                    <CIMSSelect
                        TextFieldProps={{
                            variant: 'outlined'
                        }}
                        addNullOption={false}
                        id={`${this.props.id}_${params.data.rowId}_intervalType`}
                        options={Enum.INTERVAL_TYPE.map(item => (
                            { value: item.code, label: item.engDesc }
                        ))}
                        value={params.data.intervalType}
                        onChange={e => {
                            this.changeCartListData('intervalType',e.value,params.data.rowId);
                        }}
                    />
                </Grid>
            </Grid>
        );
    }

    sessionRender = (params) => {
        const { sessionList } = this.props;
        return (
            <Grid container>
                <CIMSSelect
                    TextFieldProps={{
                        variant: 'outlined'
                    }}
                    addNullOption={false}
                    addAllOption
                    id={`${this.props.id}_${params.data.rowId}_sessId`}
                    options={sessionList && sessionList.map(item => (
                        { value: item.sessId, label: `${item.sessDesc}` }
                    ))}
                    defaultValue="*All"
                    value={params.data.sessId}
                    onChange={e => {
                        this.changeCartListData('sessId',e.value,params.data.rowId);
                    }}
                />
            </Grid>
        );
    }

    roomRender= (params) => {
        const { bookingData } = this.props;
        const subEncounterTypes = this.getSubEncounterTypeList(bookingData.encounterTypeList, params.data.encounterTypeId);
        return (
            <Grid container>
                <CIMSSelect
                    TextFieldProps={{
                        variant: 'outlined'
                    }}
                    addNullOption={false}
                    id={`${this.props.id}_${params.data.rowId}_rmId`}
                    options={subEncounterTypes && subEncounterTypes.map(item => (
                        { value: item.rmId, label: item.description }
                    ))}
                    value={params.data.rmId}
                    onChange={e => {
                        this.changeCartListData('rmId',e.value,params.data.rowId);
                    }}
                />
            </Grid>
        );
    }

    setRowId = (data) => {
        return data?.map((item, index) => ({
            ...item,
            rowId: index
        }));
    };

    getSubEncounterTypeList = memoize((encList, encntrTypeId) => {
        let list = [];
        if (encList && encntrTypeId) {
            const encDto = encList.find(item => item.encntrTypeId === encntrTypeId);
            list = encDto && encDto.subEncounterTypeList;
        }
        return list;
    });

    onRowDragMove = (event) => {
        let movingNode = event.node;
        let overNode = event.overNode;
        let rowNeedsToMove = movingNode !== overNode;
        if (rowNeedsToMove && overNode) {
            const newAppointmentListCart = _.clone(this.state.appointmentListCartData);
            let movingData = movingNode.data;
            let overData = overNode.data;
            let fromIndex = this.getIndexForRowId(newAppointmentListCart,movingData);
            let toIndex = this.getIndexForRowId(newAppointmentListCart,overData);
            let newStore = newAppointmentListCart.slice();
            let newArray = this.moveInArray(newStore, fromIndex, toIndex);
            this.setState({
                appointmentListCartData:newArray
            },()=>{
                this.gridApi.setRowData(newArray);
                this.gridApi.clearFocusedCell();
            });
        }
    };

    getIndexForRowId = (arr,nodeData)=>{
        for(let i=0;i<arr.length;i++){
            if(arr[i]['rowId'] === nodeData.rowId){
                return i;
            }
        }
    }

    moveInArray(arr, fromIndex, toIndex) {
        let element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
        return arr;
    }

    getRowNodeId(data){
        return data?.rowId+'';
    }

    getSiteCd = memoize((list, siteId) => {
        const site = list && list.find(item => item.siteId === siteId);
        return site && site.siteName;
    });

    render() {
        const {
            classes,
            id,
            open,
            rooms,
            bookingData,
            updateAppointmentListCart,
            handleBookClick,
            handleCartCancel,
            clinicList
        } = this.props;

        const siteName = this.getSiteCd(clinicList, this.state.appointmentListCartData[0]?.siteId || null);

        let buttonConfig = [
            {
                id: `${id}_book_button`,
                name: 'Book',
                onClick: () => {
                    const cartValidator = this.cartValidatorRef.isFormValid(false);
                    let isValid = true;
                    cartValidator.then(result => {
                        if (!result) {
                            isValid = false;
                            this.cartValidatorRef.focusFail();
                        }
                    }).then(() => {
                        if(isValid){
                            this.props.auditAction('Book appointment cart dialog', null, null, false, 'ana');
                            updateAppointmentListCart(this.state.appointmentListCartData,'Update',(cartData)=>{
                                handleBookClick('sppDialogBook',cartData);
                            });
                            handleCartCancel();
                        }
                    });
                }
            },
            {
                id: `${id}_save_button`,
                name: 'Save',
                onClick: () => {
                    const cartValidator = this.cartValidatorRef.isFormValid(false);
                    let isValid = true;
                    cartValidator.then(result => {
                        if (!result) {
                            isValid = false;
                            this.cartValidatorRef.focusFail();
                        }
                    }).then(() => {
                        if(isValid){
                            this.props.auditAction('Save appointment cart dialog', null, null, false, 'ana');
                            updateAppointmentListCart(this.state.appointmentListCartData,'Update');
                            handleCartCancel();
                        }
                    });
                }
            },
            {
                id: `${id}_cancel_button`,
                name: 'Cancel',
                onClick: () => {
                    this.props.auditAction('Cancel appointment cart dialog', null, null, false, 'ana');
                    handleCartCancel();
                }
            }
        ];

        return (
            <ValidatorForm
                ref={ref => this.cartValidatorRef = ref}
                focusFail
            >
                <Grid>
                    <CIMSPromptDialog
                        open={open}
                        id={`${id}_booking_criteria_details`}
                        dialogTitle={'Booking Criteria Details'}
                        classes={{
                            paper: classes.dialogPaper
                        }}
                        dialogContentText={
                            <Grid container spacing={2}>
                                <Grid item container justify="space-between" id={`${id}_booking_criteria_details_site`}>
                                    <Grid item container xs={4} wrap="nowrap">
                                        <Typography className={classes.boldFont}>Site:&nbsp;&nbsp;</Typography>
                                        <Typography>{siteName}</Typography>
                                    </Grid>
                                </Grid>
                                <Grid item container>
                                    <Typography className={classes.boldFont}>Selected Appointments:</Typography>
                                </Grid>
                                <Grid item container>
                                    <CIMSDataGrid
                                        ref={ref => this.gridRef = ref}
                                        gridTheme="ag-theme-balham"
                                        divStyle={{
                                            width: '100%',
                                            height: '50vh',
                                            display: 'block'
                                        }}
                                        gridOptions={{
                                            immutableData:true,
                                            animateRows:true,
                                            headerHeight: 50,
                                            columnDefs: this.state.columns,
                                            rowData: this.state.appointmentListCartData,
                                            id: id + '_appoint_list_cart_table',
                                            rowHeight: 50,
                                            getRowNodeId: this.getRowNodeId,
                                            onGridReady: params => {
                                                this.gridApi = params.api;
                                                this.gridColumnApi = params.columnApi;
                                                const newAppointmentListCart = _.clone(this.setRowId(this.state.appointmentListCartData));
                                                newAppointmentListCart.forEach(function (data, index) {
                                                    data.id = index;
                                                });
                                                params.api.setRowData(newAppointmentListCart);
                                            },
                                            // onRowClicked: () => { },
                                            // onRowDoubleClicked: () => { },
                                            // onSelectionChanged: () => { },
                                            // suppressRowClickSelection: false,
                                            // rowSelection: 'single',
                                            frameworkComponents: {
                                                dateRender: DateRender,
                                                noOfAppointmentRender: this.noOfAppointmentRender,
                                                intervalRender: this.intervalRender,
                                                sessionRender: this.sessionRender,
                                                roomRender: this.roomRender,
                                                actionRender: this.actionRender
                                            },
                                            context:{
                                                bookingData,
                                                rooms
                                            },
                                            suppressColumnVirtualisation: true,
                                            ensureDomOrder: true,
                                            onRowDragMove: this.onRowDragMove
                                            //postSort: rowNodes => forceRefreshCells(rowNodes, ['index'])
                                        }}
                                        suppressGoToRow
                                        suppressDisplayTotal
                                    >
                                    </CIMSDataGrid>
                                </Grid>
                            </Grid>
                        }
                        buttonConfig={
                            buttonConfig
                        }
                    />
                </Grid>
            </ValidatorForm>
        );
    }
}

const mapStateToProps = (state) => {
    return ({
        clinicList: state.common.clinicList,
        siteName: state.login.clinic.siteName,
        siteId: state.login.clinic.siteId,
        rooms: state.common.rooms,
        encounterTypes: state.common.encounterTypes,
        quotaConfig: state.common.quotaConfig,
        serviceCd: state.login.service.serviceCd,
        appointmentListCart: state.bookingInformation.appointmentListCart,
        sessionList: state.bookingInformation.sessionList,
        roomsEncounterList: state.common.roomsEncounterList,
        bookingData: state.bookingInformation.bookingData
    });
};

const mapDispatchToProps = {
    auditAction,
    updateAppointmentListCart
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AppointListCartDialog));