import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import _ from 'lodash';
import moment from 'moment';
import Enum from '../../../../enums/enum';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import {
    Edit as EditIcon,
    Menu as MenuIcon
} from '@material-ui/icons';
import DtsTimeslotsDurationIcon from './DtsTimeslotsDurationIcon';
import './DtsDurationIconAgCell.css';
import DtsPatientLink from './DtsPatientLink';
import {
    resetAll
} from '../../../../store/actions/dts/appointment/searchAppointmentAction';
import {
    setSelectedRescheduleAppointment,
    restSelectedRescheduleAppointment
} from '../../../../store/actions/dts/appointment/bookingAction';

import accessRightEnum from '../../../../enums/accessRightEnum';
import { skipTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import { DTS_DATE_WEEKDAY_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';
import DtsMenuButton from '../../components/DtsMenuButton';
import * as dtsBookingConstant from '../../../../constants/dts/appointment/DtsBookingConstant';
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
    isWithinClosePeriod:{
        backgroundColor: '#FD9941'
    }
});

class DtsAppointmentList extends Component {
    constructor(props) {
        super(props);
        const { classes } = props;
        console.log(props);
        let rescheduleIconCallback = {
            rescheduleIconOnClick: this.rescheduleAppointmentOnClick,
            classes:classes
        };
        let closePeriodClass = this.withinClosePeriodClass(this.props.withinClosePeriod, classes);
        let columnDefs = [
            {
                headerName: 'Appointment Date',
                //valueGetter: (params) => (moment(params.data.appointmentDateTime).format(Enum.DATE_FORMAT_DMY) + '(' + moment(params.data.appointmentDateTime).format('ddd') + ')'),
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
                headerName: 'Surgery',
                valueGetter: (params) => (params.data.roomCode),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 120

            },
            {
                headerName: 'PatientInfo',
                valueGetter: (params) => (dtsUtilities.getPatientName(params.data.patientDto)),
                cellRenderer: 'patientNameRenderer',
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 240

            },
            {
                headerName: 'Client Type',
                valueGetter: (params) => (params.data.patientDto && params.data.patientDto.patientStatus),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 140
            },
            {
                headerName: 'Duration',
                valueGetter: params => dtsUtilities.getAllAppointmentTimeslot(params.data).map((item) => moment(item.endTime, 'HH:mm').diff(moment(item.startTime, 'HH:mm'), 'minutes')).reduce((a, b) => a + b),
                cellClass: [classes.basicCell],
                headerClass: classes.basicHeader,
                width: 100
            },
            {
                headerName: 'Enc. Type',
                cellRenderer: 'overflowTypographyRenderer',
                valueGetter: (params) => (params.data.encounterTypeDescription),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 340
            },
            {
                headerName: 'Appt. Type',
                //valueGetter: (params) => (params.data.appointmentTypeCode),
                //valueGetter: (params) => (params.data.isUrgentSqueeze && params.data.isUrgentSqueeze == 1 ? 'Urgent Squeeze-In': params.data.isUrgent && params.data.isUrgent == 1 ? 'Urgent' : params.data.isSqueeze && params.data.isSqueeze == 1 ? 'Squeeze-In' : 'Normal'),
                valueGetter: (params) => (dtsUtilities.getAppointmentTypeDescription(params.data)),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 140
            },
            {
                headerName: 'Spec. Req.',
                valueGetter: (params) => (params.data.appointmentSpecialRequestVo && params.data.appointmentSpecialRequestVo.remark),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 220
            },
            {
                headerName: 'Justification',
                valueGetter: (params) => (params.data.appointmentJustificationVo && params.data.appointmentJustificationVo.exemptReason),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 220
            },
            {
                headerName: '',
                cellRenderer: 'RescheduleIconRenderer',
                cellRendererParams: rescheduleIconCallback,
                cellClass: classes.basicCell,
                filter:false,
                sortable:false,
                headerClass: classes.basicHeader,
                width: 50
            }
        ];

        this.state = {
            columnDefs: columnDefs,
            rowData: []
        };

        this.refGrid = React.createRef();
    }

    componentDidMount(){
        this.setState({ rowData: this.props.appointmentList.list ? this.props.appointmentList.list : []});
    }


    componentDidUpdate(prevProps) {
        if (this.props.appointmentList && !_.isEqual(prevProps.appointmentList.list, this.props.appointmentList.list)) {
            if (this.refGrid.current) {
                //console.log('componentDidUpdate-apptList:'+JSON.stringify(this.props.appointmentList.list));
                // this.setState({ withinClosePeriod: this.props.withinClosePeriod});
                this.setState({ rowData: this.props.appointmentList.list ? this.props.appointmentList.list : []});
                this.gridApi.redrawRows();
                //this.gridApi.refreshCells();
                //this.gridApi.paginationGoToPage(0);
            }
        }
    }

    componentWillUnmount(){
        this.props.restSelectedRescheduleAppointment();
        this.props.resetAll();
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };

    rescheduleAppointmentOnClick =(appointment) => {
        // this.props.setSelectedRescheduleAppointment({fromAppointment:appointment});
        // const callback = ()=>{
        //     this.props.skipTab(accessRightEnum.DtsBooking,
        //         {
        //             paramFrom: 'DtsAppointmentList',
        //             bookingMode: dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT
        //         }
        //     );
        // };
        // dtsUtilities.getPatientInfo({ patientKey: appointment.patientKey, callback });

        this.props.setSelectedRescheduleAppointment({ fromAppointment: appointment });
        const callback = () => {
            this.props.skipTab(accessRightEnum.DtsBooking,
                {
                    paramFrom: 'DtsAppointmentList',
                    bookingMode: dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT
                }
            );
        };
        dtsUtilities.getPatientInfo({ patientKey: appointment.patientKey, callback });

    }

    withinClosePeriodClass = (withinClosePeriod, classes) => {
        if (withinClosePeriod != false) {
            return classes.isWithinClosePeriod;
        }
        return '';
    }

    render() {
        const { classes } = this.props;
        const { columnDefs } = this.state;

        return (
            <Grid className={classes.root}>
                <Grid item container id={'DtsDurationIconAgCell'}>
                    <CIMSDataGrid
                        ref={this.refGrid}
                        disableAutoSize
                        suppressGoToRow
                        //suppressDisplayTotal
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '79vh',
                            display: 'block'

                        }}
                        gridOptions={{
                            defaultColDef:{
                                filter: true,
                                lockVisible: true,
                                sortable: true,
                                resizable: true
                            },
                            columnDefs: columnDefs,
                            rowData: this.state.rowData,
                            suppressRowClickSelection: true,
                            rowSelection: 'single',
                            onGridReady: this.onGridReady,
                            getColumnHeight: () => 42,
                            getRowHeight: () => 32,
                            getRowNodeId: item => item.appointmentId,
                            frameworkComponents: {
                                durationRenderer: DurationRenderer,
                                RescheduleIconRenderer: RescheduleIconRenderer,
                                overflowTypographyRenderer: OverflowTypographyRenderer,
                                patientNameRenderer: props => <DtsPatientLink patient={props.data.patientDto}/>
                            },
                            onRowClicked: params => {
                                //this.handleRowChecked(params.data.sequence);
                            },
                            onRowDoubleClicked: params => {
                                //this.handleRowClick(params, true);
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
                            }
                            //pagination: true
                        }}
                    />
                </Grid>
                {/* <Grid item>
                    <CIMSButton onClick={e => this.multiMakeAppointmentOnClick(e)} color="primary" id={'makeAppointmentButton'}>Make appointment</CIMSButton>
                </Grid> */}
            </Grid>
        );
    }
}


function mapStateToProps(state) {
    // console.log('withinClosePeriod = '+state.dtsSearchAppointment.withinClosePeriod);
    return {
        appointmentList:state.dtsSearchAppointment.appointmentList,
        accessRights: state.login.accessRights,
        withinClosePeriod: state.dtsSearchAppointment.withinClosePeriod
    };
}

const mapDispatchToProps = {
    setSelectedRescheduleAppointment,
    restSelectedRescheduleAppointment,
    skipTab,
    resetAll
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAppointmentList));
class DurationRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let rowData = this.props.data;
        // return (<DtsTimeslotsDurationIcon iconType={'isNormal'} duration={rowData.duration}/>);
        return (<DtsTimeslotsDurationIcon iconType={rowData.isUrgentSqueeze && rowData.isUrgentSqueeze == 1 ? 'isUrgentSqueeze': rowData.isUrgent && rowData.isUrgent == 1 ? 'isUrgent' : rowData.isSqueeze && rowData.isSqueeze == 1 ? 'isSqueeze' : 'isNormal'} timeslots={dtsUtilities.getAllAppointmentTimeslot(rowData)}/>);
    }
}

class RescheduleIconRenderer extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        let rowData = this.props.data;
        let classes = this.props.classes;
        let iconAction = () => {
            this.props.rescheduleIconOnClick(rowData);
        };

        return (
            <DtsMenuButton
                direct={'horizontal'}
                menuButtonSize={'small'}
                buttonEl={<MenuIcon></MenuIcon>}
                itemListEl={
                    [
                        {
                            item:
                            <DtsMenuButton
                                buttonEl={<EditIcon></EditIcon>}
                                itemListEl={
                                    [
                                        { item: 'Reschedule appointment', action: () => iconAction() }
                                    ]}
                            />
                        }
                    ]
                }
            />
        );
    }
}

class OverflowTypographyRenderer extends Component {
    render() {
        return <OverflowTypography noWrap>{this.props.value}</OverflowTypography>;
    }
}