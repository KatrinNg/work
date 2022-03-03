import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import _ from 'lodash';
import moment from 'moment';
import Enum from '../../../../enums/enum';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import SvgIcon from '@material-ui/core/SvgIcon';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import DtsMenuButton from '../../components/DtsMenuButton';
import {
    Menu as MenuIcon,
    Print as PrintIcon,
    Phone as PhoneIcon,
    Edit as EditIcon,
    AccessTime as TimeIcon,
    Delete as DeleteIcon,
    MoreVert as SubMenuIcon,
//    PhoneEnabled as PhoneEnabledIcon,
    Phone as PhoneEnabledIcon,
    Notifications as NotificationsIcon,
//    PhoneDisabled as PhoneDisabledIcon
    Phone as PhoneDisabledIcon
} from '@material-ui/icons';
import DtsTimeslotsDurationIcon from './DtsTimeslotsDurationIcon';
import DtsButton from '../../components/DtsButton';
import {
    insertContactHistories,
    setSelectedRoomList
} from '../../../../store/actions/dts/appointment/remindAppointmentAction';
import { contactHistoryType } from '../../../../enums/dts/appointment/contactHistoryTypeEnum';
import DtsPatientLink from './DtsPatientLink';
import { DTS_DATE_WEEKDAY_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';
import OverflowTypography from '../../components/OverflowTypography';

const styles = () => ({
    root: {
        width: '100%'
    },
    mainButton: {
        width: '100%'
    },
    container: {
        padding: '10px 0px'
    },
    basicHeader: {
        fontFamily: 'Microsoft JhengHei, Calibri!important',
        padding:'0px 8px!important'
    },
    basicCell: {
        fontFamily: 'Microsoft JhengHei, Calibri!important',
        borderStyle: 'none!important',
        borderBottom: '1px solid rgba(224, 224, 224, 1)!important',
        padding:'0px 8px!important'
        // '&:last-child': {
        //     //padding: '8px',
        //     paddingRight: '8px'
        // }
    },
    right: {
        textAlign: 'right'
    },
    iconButton: {
        cursor: 'pointer'
    },
    remindBtn:{
        // width:'40%',
        marginTop: '-48px',
        border:'none !Important',
        float:'right'
    }
});

class DtsRemindAppointmentList extends Component {
    constructor(props) {
        super(props);
        const { classes, onClickEditContactHistory} = props;
        let remindIconCallback = {
            onClickEditContactHistory: onClickEditContactHistory,
            classes: classes
        };
        let exactActionCallback = {
            onClickEditContactHistory: onClickEditContactHistory
        };
        let columnDefs = [
            {
                headerName: '',
                field: '',
                minWidth: 40,
                maxWidth: 40,
                headerCheckboxSelection: true,
                checkboxSelection: true,
                cellClass: classes.basicCell,
                filter:false,
                headerClass: classes.basicHeader
            },
            {
                headerName: 'Surgery',
                field: 'roomCode',
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 100

            },
            {
                headerName: 'Appointment Date',
                valueGetter: (params) => (moment(params.data.appointmentDateTime).format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT)),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 200
            },
            {
                headerName: 'Time',
                valueGetter: (params) => (moment(dtsUtilities.getAppointmentStartTime(params.data)).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 100
            },
            {
                headerName: 'Patient Info',
                cellRenderer: 'patientNameRenderer',
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 290
            },
            {
                headerName: '',
                cellRenderer: 'notificationRenderer',
                cellClass: classes.basicCell,
                filter:false,
                sortable:false,
                headerClass: classes.basicHeader,
                width: 40
            },
            {
                headerName: 'Enc. Type',
                cellRenderer: 'overflowTypographyRenderer',
                valueGetter: (params) => (params.data.encounterTypeDescription),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 350
            },
            {
                headerName: '',
                cellRenderer: 'durationRenderer',
                cellClass: [classes.basicCell, classes.right],
                filter:false,
                sortable:false,
                headerClass: classes.basicHeader,
                width: 100
            },
            {
                headerName: 'Spec. Req.',
                valueGetter: (params) => (params.data.appointmentSpecialRequestVo ? params.data.appointmentSpecialRequestVo.remark : ''),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 200

            },
            {
                headerName: 'Justification',
                valueGetter: (params) => (params.data.appointmentJustificationVo ? params.data.appointmentJustificationVo.exemptReason : ''),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 200
            },
            {
                headerName: 'To Remind List',
                valueGetter: (params) => (params.data.specialReminderList),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                //width: 160
                width: 200
            },
            {
                colId: 'remindButton',
                headerName: '',
                cellRenderer: 'reminderIconRenderer',
                cellRendererParams: remindIconCallback,
                cellClass: classes.basicCell,
                filter:false,
                sortable:false,
                headerClass: classes.basicHeader,
                width: 40
            }/*,
            {
                headerName: '',
                cellRenderer: 'exactActionRenderer',
                cellRendererParams: exactActionCallback,
                cellClass: classes.basicCell,
                filter:false,
                sortable:false,
                headerClass: classes.basicHeader,
                width: 40
            }*/
        ];

        this.state = {
            columnDefs: columnDefs,
            rowData: [],
            selectedRowCount: 0
        };

        this.refGrid = React.createRef();
    }

    componentDidMount(){
        this.setState({ rowData: this.props.remindAppointmentList.list ? this.props.remindAppointmentList.list : [] });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.remindAppointmentList !== this.props.remindAppointmentList) {
            if (this.refGrid.current) {
                this.setState({ rowData: this.props.remindAppointmentList.list ? this.props.remindAppointmentList.list : [] });
                this.gridApi.redrawRows();
                this.gridApi.paginationGoToPage(0);
            }
        }
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };

    clickContactIcon(){

    }

    remindCompletedByPhone = () => {
        const params = this.gridApi.getSelectedRows().map(appointment => this.quickContactHistory(appointment, contactHistoryType.TEL.code, 'S'));
        this.props.insertContactHistories(params.filter(Boolean));
    }

    remindFailedByPhone = () => {
        const params = this.gridApi.getSelectedRows().map(appointment => this.quickContactHistory(appointment, contactHistoryType.TEL.code, 'F'));
        this.props.insertContactHistories(params.filter(Boolean));
    }

    quickContactHistory = (appointment, contactType, statusCd) => {
        const now = moment().format('YYYY-MMM-DD HH:mm');
        const contactDesc = appointment.patientDto.phoneList.find(p => p.phoneTypeCode =='M')?.phoneNumber;
        if (contactDesc) {
            return {
                appointmentId: appointment.appointmentId,
                contactType,
                contactDesc,
                notificationDtm: now,
                notes: null,
                statusCd
            };
        }
    }

    render() {
        const { classes } = this.props;
        const { columnDefs } = this.state;

        return (
            <Grid className={classes.root}>
                <Grid item xs={6} className={classes.remindBtn}>
                    <DtsButton disabled={!this.state.selectedRowCount} onClick={this.remindCompletedByPhone}>Remind Completed (by Phone)</DtsButton>
                    <DtsButton disabled={!this.state.selectedRowCount} onClick={this.remindFailedByPhone}>Remind Failed (by Phone)</DtsButton>
                </Grid>
                <Grid item container xs={12}>
                    <CIMSDataGrid
                        ref={this.refGrid}
                        disableAutoSize
                        suppressGoToRow
                        suppressDisplayTotal
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '87vh',
                            display: 'block'
                        }}
                        gridOptions={{
                            columnDefs: columnDefs,
                            rowData: this.state.rowData, //remindAppointmentList.list ? remindAppointmentList.list : [],
                            suppressRowClickSelection: true,
                            rowSelection: 'multiple',
                            //rowSelection: 'single',
                            onGridReady: this.onGridReady,
                            getRowHeight: () => 32,
                            getRowNodeId: item => item.appointmentId,
                            frameworkComponents: {
                                notificationRenderer: NotificationRenderer,
                                durationRenderer: DurationRenderer,
                                reminderIconRenderer: ReminderIconRenderer,
                                exactActionRenderer: ExactActionRenderer,
                                overflowTypographyRenderer: OverflowTypographyRenderer,
                                patientNameRenderer: props => <DtsPatientLink patient={props.data.patientDto}/>
                            },
                            onCellClicked: (event) => {
                                if (event.column.colId !== 'remindButton') {
                                    event.node.setSelected(!event.node.isSelected());
                                }
                            },
                            postSort: rowNodes => {
                                let rowNode = rowNodes[0];
                                if (rowNode) {
                                    setTimeout(
                                        rowNode => {
                                            rowNode.gridApi.refreshCells();
                                        },
                                        100,
                                        rowNode
                                    );
                                }
                            },
                            pagination: true,
                            paginationPageSize: 28,
                            onSelectionChanged: event => {
                                this.setState({ selectedRowCount: event.api.getSelectedNodes().length });
                                console.log(this.gridApi.getSelectedRows());
                                this.props.setSelectedRoomList(this.gridApi.getSelectedRows());
                            }
                        }}
                    />
                </Grid>
                {/* <Grid item container>
                    <CIMSButton disabled={!this.state.selectedRowCount} onClick={this.remindCompletedByPhone}>Remind Completed (by Phone)</CIMSButton>
                    <CIMSButton disabled={!this.state.selectedRowCount} onClick={this.remindFailedByPhone}>Remind Failed (by Phone)</CIMSButton>
                </Grid> */}
            </Grid>
        );
    }
}


function mapStateToProps(state) {
    return {
        remindAppointmentList: state.dtsRemindAppointment.remindAppointmentList
    };
}

const mapDispatchToProps = {
    insertContactHistories,
    setSelectedRoomList
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsRemindAppointmentList));


class NotificationRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let rowData = this.props.data;

        return (rowData.patientDto.patientReminders && rowData.patientDto.patientReminders.length > 0 ? <NotificationsIcon>
                direct={'horizontal'}
                menuButtonSize={'small'}
                color={'blue'}
            </NotificationsIcon> : null);
    }
}

class DurationRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let rowData = this.props.data;

        return (<DtsTimeslotsDurationIcon iconType={rowData.isUrgentSqueeze && rowData.isUrgentSqueeze == 1 ? 'isUrgentSqueeze': rowData.isUrgent && rowData.isUrgent == 1 ? 'isUrgent' : rowData.isSqueeze && rowData.isSqueeze == 1 ? 'isSqueeze' : 'isNormal'} timeslots={dtsUtilities.getAllAppointmentTimeslot(rowData)}/>);
    }
}

class ReminderIconRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let rowData = this.props.data;
        let classes = this.props.classes;
        let telIcon = rowData.remindStatus;
        let telObj;
        let iconAction = () => {
            this.props.onClickEditContactHistory(rowData);
        };
        if(telIcon == 'R3'){
            telObj = (
                <PhoneEnabledIcon onClick={iconAction} className={classes.iconButton}>
                     direct={'horizontal'}
                    menuButtonSize={'small'}
                    color={'blue'}
                </PhoneEnabledIcon>
            );
        }else if (telIcon == 'R2'){
            telObj = (
                <PhoneDisabledIcon onClick={iconAction} className={classes.iconButton}>
                     direct={'horizontal'}
                    menuButtonSize={'small'}
                    color={'blue'}
                </PhoneDisabledIcon>
            );
        }else if (telIcon == 'R1'){
            telObj = (
                <SvgIcon onClick={iconAction} className={classes.iconButton}>
                    <text x={0} y={20} fill="#404040" fontSize="1.5rem" fontWeight="bold">?</text>
                </SvgIcon>
            );
        }
        else {
            telObj = '';
        }

        return telObj;
    }
}

class ExactActionRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {data, onClickEditContactHistory} = this.props;

        return (
            <DtsMenuButton
                //direct={'horizontal'}
                menuButtonSize={'small'}
                buttonEl={<MenuIcon></MenuIcon>}

                itemListEl={[
                    {item:'Contact History', action:(event)=>{event.stopPropagation();onClickEditContactHistory(data);}}

                    // {
                    //     item:
                    //         <DtsMenuButton
                    //             buttonEl={<PrintIcon></PrintIcon>}
                    //             itemListEl={
                    //                 [
                    //                     {item:'Print Appointment List', action:(event)=>{event.stopPropagation(); console.log('Print appt click 1');}},
                    //                     {item:'Print Appointment label', action:(event)=>{event.stopPropagation(); console.log('Print appt click 2');}},
                    //                     {item:'Contact History', action:(event)=>{event.stopPropagation(); console.log('Print appt click 3');}}
                    //                 ]}
                    //         />
                    // },
                    // {
                    //     item: <DtsMenuButton
                    //         buttonEl={<PhoneIcon></PhoneIcon>}
                    //         itemListEl={
                    //         [
                    //             {item:'Print Appointment List', action:(event)=>{event.stopPropagation(); console.log('Print appt click 1');}},
                    //             {item:'Print Appointment label', action:(event)=>{event.stopPropagation(); console.log('Print appt click 2');}},
                    //             {item:'Contact History', action:(event)=>{event.stopPropagation(); console.log('Print appt click 3');}}
                    //         ]}
                    //           />
                    // },
                    // {
                    //     item: <DtsMenuButton
                    //         buttonEl={<TimeIcon></TimeIcon>}
                    //         itemListEl={
                    //         [
                    //             {item:'Print Appointment List', action:(event)=>{event.stopPropagation(); console.log('Print appt click 1');}},
                    //             {item:'Print Appointment label', action:(event)=>{event.stopPropagation(); console.log('Print appt click 2');}},
                    //             {item:'Contact History', action:(event)=>{event.stopPropagation(); console.log('Print appt click 3');}}
                    //         ]}
                    //           />
                    // },
                    // {
                    //     item: <DtsMenuButton
                    //         buttonEl={<DeleteIcon></DeleteIcon>}
                    //         itemListEl={
                    //         [
                    //             {item:'Print Appointment List', action:(event)=>{event.stopPropagation(); console.log('Print appt click 1');}},
                    //             {item:'Print Appointment label', action:(event)=>{event.stopPropagation(); console.log('Print appt click 2');}},
                    //             {item:'Contact History', action:(event)=>{event.stopPropagation(); console.log('Print appt click 3');}}
                    //         ]}
                    //           />
                    // },
                    // {
                    //     item: <DtsMenuButton
                    //         buttonEl={<SubMenuIcon></SubMenuIcon>}
                    //         itemListEl={
                    //         [
                    //             {item:'Print Appointment List', action:(event)=>{event.stopPropagation(); console.log('Print appt click 1');}},
                    //             {item:'Print Appointment label', action:(event)=>{event.stopPropagation(); console.log('Print appt click 2');}},
                    //             {item:'Contact History', action:(event)=>{event.stopPropagation(); console.log('Print appt click 3');}}
                    //         ]}
                    //           />
                    // }
                ]}
            />
        );
    }
}

class OverflowTypographyRenderer extends Component {
    render() {
        return <OverflowTypography noWrap>{this.props.value}</OverflowTypography>;
    }
}