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
import OverflowTypography from '../../components/OverflowTypography';
import {
    AddCircle as AddCircleIcon,
    Reply as ReplyIcon
} from '@material-ui/icons';
import DtsTimeslotsDurationIcon from './DtsTimeslotsDurationIcon';
import './DtsDurationIconAgCell.css';

import {
    setEmptyTimeslotDateList,
    resetAll as bookingResetAll
} from '../../../../store/actions/dts/appointment/bookingAction';

import { resetAll as emptyTimeslotResetAll } from '../../../../store/actions/dts/appointment/emptyTimeslotAction';

import { addTabs } from '../../../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../../../enums/accessRightEnum';
import DtsButton from '../../components/DtsButton';
import { DTS_DATE_WEEKDAY_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';

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
        padding: '0px 8px!important',
        textAlign: 'center'
    },
    basicCell: {
        fontFamily: 'Microsoft JhengHei, Calibri!important',
        borderStyle: 'none!important',
        borderBottom: '1px solid rgba(224, 224, 224, 1)!important',
        padding: '0px 8px!important'
        // '&:last-child': {
        //     //padding: '8px',
        //     paddingRight: '8px'
        // }
    },
    center: {
        textAlign: 'center'
    },
    makeApptBtn: {
        width:'40%',
        marginTop: '-40px',
        border:'none !Important',
        float:'right'
    },
    iconButton: {
        cursor: 'pointer'
    }
});

class DtsEmptyTimeslotList extends Component {
    constructor(props) {
        super(props);
        const { classes } = props;
        let makeAppointmenetIconCallback = {
            makeAppointmentIconOnClick: this.singleMakeAppointmentOnClick,
            classes: classes
        };

        let columnDefs = [
            {
                headerName: '',
                field: '',
                minWidth: 40,
                maxWidth: 40,
                headerCheckboxSelection: true,
                checkboxSelection: true,
                // checkboxSelection: params => (this.handleRowChecked(params.data.sequence)),
                // onSelectionChanged: params=> (this.handleRowChecked(params)),
                cellClass: classes.basicCell,
                filter: false,
                headerClass: classes.basicHeader
            },
            {
                headerName: 'Duration',
                cellRenderer: 'durationRenderer',
                cellClass: [classes.basicCell, classes.center],
                filter: false,
                sortable: false,
                headerClass: classes.basicHeader,
                width: 120
            },
            {
                headerName: 'Appointment Date',
                //valueGetter: (params) => (moment(params.data.date).format(Enum.DATE_FORMAT_DMY) + '(' + moment(params.data.date).format('ddd') + ')'),
                valueGetter: (params) => (moment(params.data.apptDate).format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT)),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 210
            },
            {
                headerName: 'Time',
                valueGetter: (params) => (params.data.startTime),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 100
            },
            {
                headerName: 'Surgery',
                //valueGetter: (params) => (params.data.timeslots[0].roomId),
                valueGetter: (params) => (params.data.room && params.data.room.roomCode),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 100

            },
            {
                headerName: 'Enc. Type',
                cellRenderer: 'overflowTypographyRenderer',
                valueGetter: (params) => (params.data.encntrTypeGrpDesc),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 1000
            },
            {
                headerName: '',
                cellRenderer: 'makeAppointmentIconRenderer',
                cellRendererParams: makeAppointmenetIconCallback,
                cellClass: classes.basicCell,
                filter: false,
                sortable: false,
                headerClass: classes.basicHeader,
                width: 300
            }
        ];

        this.state = {
            columnDefs: columnDefs,
            rowData: []
        };

        this.refGrid = React.createRef();
    }

    componentDidMount() {
        this.setState({ rowData: this.props.emptyTimeslotList ? this.props.emptyTimeslotList : [] });
    }


    componentDidUpdate(prevProps) {
        if (prevProps.emptyTimeslotList !== this.props.emptyTimeslotList) {
            if (this.refGrid.current) {
                this.setState({ rowData: this.props.emptyTimeslotList ? this.props.emptyTimeslotList : [] });
                this.gridApi.redrawRows();
                this.gridApi.paginationGoToPage(0);
            }
        }
    }

    componentWillUnmount() {
        this.props.emptyTimeslotResetAll();
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };

    singleMakeAppointmentOnClick = (appointmentList) => {
        //console.log('singleMakeAppointmentOnClick:'+JSON.stringify(appointmentList));
        this.props.bookingResetAll();
        let processedlist = appointmentList.map(item => ({ 'sequence': item.sequence, 'date': item.apptDate, 'surgery': dtsUtilities.formatDtsRoomListToSurgery(item.room) }));
        this.props.setEmptyTimeslotDateList({ emptyTimeslotDateList: processedlist });
        this.openEmptyTimeslotMakeAppointmentTab();
    }

    multiMakeAppointmentOnClick = () => {
        if (this.gridApi.getSelectedRows().length > 0) {
            this.props.bookingResetAll();
            let processedlist = this.gridApi.getSelectedRows().map(item => ({ 'sequence': item.sequence, 'date': item.apptDate, 'surgery': dtsUtilities.formatDtsRoomListToSurgery(item.room) }));
            processedlist = _.uniqBy(processedlist, item => [moment(item.date).format(Enum.DATE_FORMAT_DMY), item.surgery.rmId].join());
            processedlist = _.orderBy(processedlist, ['date', 'surgery.rmCd']);
            //console.log('multiMakeAppointmentOnClick:'+JSON.stringify(processedlist));
            this.props.setEmptyTimeslotDateList({ emptyTimeslotDateList: processedlist });
            this.openEmptyTimeslotMakeAppointmentTab();
        }

    }

    openEmptyTimeslotMakeAppointmentTab = () => {
        this.nonPatientTab = this.props.accessRights.find((item) => item.name === accessRightEnum.DtsBookingNonPatient);
        this.props.addTabs(this.nonPatientTab);
    }

    render() {
        const { classes } = this.props;
        const { columnDefs } = this.state;

        return (
            <Grid className={classes.root}>
                <Grid item xs={4}>
                    <DtsButton className={classes.makeApptBtn} iconType={'RECEIPT'} onClick={e => this.multiMakeAppointmentOnClick(e)} color="primary" id={'makeAppointmentButton'}>Make appointment</DtsButton>
                </Grid>
                <Grid item container xs={12} id={'DtsDurationIconAgCell'}>
                    <CIMSDataGrid
                        ref={this.refGrid}
                        disableAutoSize
                        suppressGoToRow
                        suppressDisplayTotal
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '86vh',
                            display: 'block'
                        }}
                        gridOptions={{
                            columnDefs: columnDefs,
                            rowData: this.state.rowData,
                            suppressRowClickSelection: true,
                            rowSelection: 'multiple',
                            //rowSelection: 'single',
                            onGridReady: this.onGridReady,
                            getRowHeight: () => 32,
                            getRowNodeId: item => item.room.roomId + item.apptDate + item.startTime,
                            frameworkComponents: {
                                durationRenderer: DurationRenderer,
                                makeAppointmentIconRenderer: MakeAppointmentIconRenderer,
                                overflowTypographyRenderer: OverflowTypographyRenderer
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
                            },
                            pagination: true,
                            paginationPageSize: 28
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
    return {
        remindAppointmentList: state.dtsRemindAppointment.remindAppointmentList,
        emptyTimeslotList: state.dtsEmptyTimeslot.emptyTimeslotList,
        accessRights: state.login.accessRights
    };
}

const mapDispatchToProps = {
    addTabs,
    setEmptyTimeslotDateList,
    bookingResetAll,
    emptyTimeslotResetAll
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsEmptyTimeslotList));
class DurationRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let rowData = this.props.data;
        return (<DtsTimeslotsDurationIcon iconType={'isNormal'} duration={rowData.duration} />);
    }
}

class MakeAppointmentIconRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let rowData = this.props.data;
        let classes = this.props.classes;
        let iconAction = () => {
            this.props.makeAppointmentIconOnClick([rowData]);
        };

        return (
            <ReplyIcon onClick={iconAction} className={classes.iconButton}
                direct={'horizontal'}
                menuButtonSize={'small'}
                color={'blue'}
            >
            </ReplyIcon>
        );
    }
}

class OverflowTypographyRenderer extends Component {
    render() {
        return <OverflowTypography noWrap>{this.props.value}</OverflowTypography>;
    }
}
