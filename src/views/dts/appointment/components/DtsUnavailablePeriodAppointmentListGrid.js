import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import _ from 'lodash';
import moment from 'moment';
import Enum from '../../../../enums/enum';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import SvgIcon from '@material-ui/core/SvgIcon';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
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
    Phone as PhoneDisabledIcon,
    AddCircle as AddCircleIcon,
    Reply as ReplyIcon
} from '@material-ui/icons';
import DtsTimeslotsDurationIcon from './DtsTimeslotsDurationIcon';

import {
    setEmptyTimeslotDateList,
    resetAll
} from '../../../../store/actions/dts/appointment/bookingAction';
import { DTS_DATE_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';
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
    }
});

class DtsUnavailablePeriodAppointmentListGrid extends Component {
    constructor(props) {
        super(props);
        const { classes,onClickNavigateAppointment} = props;
        let makeAppointmenetIconCallback = {
            insertAppointmentOnClick: this.insertAppointmentOnClick,
            classes:classes
        };
        let navigateAppointmensetIconCallback = {
            onClickNavigateAppointment: onClickNavigateAppointment,
            classes:classes
        };

        let columnDefs = [
            {
                headerName: 'Name',
                valueGetter: (params) => (dtsUtilities.getPatientName(params.data.patientDto)),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 180,
                pinned: 'left'
            },
            {
                headerName: 'Gender',
                valueGetter: (params) => params.data.patientDto.genderCd,
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 90
            },
            {
                headerName: 'Appointment Date',
                valueGetter: (params) => moment(params.data.appointmentDateTime).format(DTS_DATE_DISPLAY_FORMAT),
                //valueGetter: (params) => params.data.appointmentDateTime,
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 180
            },
            {
                headerName: 'Time',
                // valueGetter: (params) => (moment(params.data.appointmentDateTime).format(Enum.DATE_FORMAT_DMY) + '(' + moment(params.data.appointmentDateTime).format('ddd') + ')'),
                valueGetter: (params) => moment(params.data.appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList.sort((item1,item2) => moment(item1.startDtm).diff(moment(item2.startDtm)))[0].startDtm).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),//tbu: sort earlier?
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 70
            },
            {
                headerName: 'Duration',
                // cellRenderer: 'durationRenderer',
                valueGetter: (params) => this.getDuration(params.data.appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList) + ' min',
                cellClass: [classes.basicCell],
                filter:false,
                headerClass: classes.basicHeader,
                width: 90
            },
            {
                headerName: 'Enc. Type',
                cellRenderer: 'overflowTypographyRenderer',
                valueGetter: (params) => params.data.encounterTypeDescription,
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 400
            }
        ];

        this.state = {
            columnDefs: columnDefs,
            rowData: []
        };

        this.refGrid = React.createRef();
    }

    componentDidMount(){
        this.setState({ rowData: this.props.unavailablePeriodAppointmentList});
    }

    componentDidUpdate(prevProps) {
        if (prevProps.unavailablePeriodAppointmentList !== this.props.unavailablePeriodAppointmentList) {
            if (this.refGrid.current) {
                this.setState({ rowData: this.props.unavailablePeriodAppointmentList});
            }
        }
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };

    getDuration = (mapAppointmentTimeSlotVosList) =>{
        // console.log('getDur:'+JSON.stringify(mapAppointmentTimeSlotVosList));
        return mapAppointmentTimeSlotVosList.map((item) => moment(item.endDtm).diff(moment(item.startDtm), 'minutes')).reduce((a, b) => a + b);
    }

    render() {
        const { classes } = this.props;
        const { columnDefs } = this.state;

        return (
            <Grid className={classes.root}>
                <Grid item container>
                    <CIMSDataGrid
                        ref={this.refGrid}
                        disableAutoSize
                        suppressGoToRow
                        suppressDisplayTotal
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '30vh',
                            display: 'block'
                        }}
                        gridOptions={{
                            columnDefs: columnDefs,
                            rowData: this.state.rowData,
                            suppressRowClickSelection: false,
                            //rowSelection: 'multiple',
                            rowSelection: 'single',
                            onGridReady: this.onGridReady,
                            getRowHeight: () => 32,
                            getRowNodeId: item => item.appointmentId,
                            frameworkComponents: {
                                overflowTypographyRenderer: OverflowTypographyRenderer
                            },
                            onRowClicked: params => {
                                this.props.setAppointment(params.data);
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
                            },
                            pagination: true,
                            paginationPageSize: 5
                        }}
                    />
                </Grid>
            </Grid>
        );
    }
}


function mapStateToProps(state) {
    return {
        remindAppointmentList: state.dtsRemindAppointment.remindAppointmentList,
        unavailablePeriodAppointmentList:state.dtsEmptyTimeslot.unavailablePeriodAppointmentList
    };
}

const mapDispatchToProps = {
    setEmptyTimeslotDateList
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsUnavailablePeriodAppointmentListGrid));

class OverflowTypographyRenderer extends Component {
    render() {
        return <OverflowTypography noWrap>{this.props.value}</OverflowTypography>;
    }
}