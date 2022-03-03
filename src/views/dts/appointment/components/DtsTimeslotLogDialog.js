import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Divider, Link, List, ListItem, ListItemText } from '@material-ui/core';
import '../../../../styles/common/customHeaderStyle.scss';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import { getAppointmentLog, getTimeslotLog, setTimeslotLog } from '../../../../store/actions/dts/appointment/bookingAction';
import OverflowTypography from '../../components/OverflowTypography';
import { formatPatientKey, getPatientName } from '../../../../utilities/dtsUtilities';

const styles = (theme) => ({
    table: {
        borderSpacing: '0px'
    },
    td: {
        verticalAlign: 'top'
    },
    list: {
        width: '120px',
        padding: '0px',
        maxHeight: '80vh',
        overflow: 'auto'
    },
    listItem: {
        textAlign: 'center'
    },
    link: {
        justifyContent: 'flex-start'
    },
    content: {
        padding: '0px',
        overflow: 'visible'
    },
    'UrgentSqueeze': { backgroundColor: 'Magenta' },
    'Re-scheduled': { backgroundColor: 'Cyan' },
    'Deleted': { backgroundColor: 'Gainsboro' }
});

const useStyles = makeStyles(styles);

export default props => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { open, close, timeslots } = props;
    const timeslotLog = useSelector(state => state.dtsAppointmentBooking.timeslotLog);
    const [selectedIndex, setSelectedIndex] = useState(0);
    useEffect(() => {
        timeslots?.length && dispatch(getTimeslotLog(timeslots[selectedIndex].id));
    }, [timeslots, selectedIndex]);

    const onSelect = index => setSelectedIndex(index);
    const onClose = () => {
        dispatch(setTimeslotLog(null));
        close();
    };

    const columnDefs = useMemo(() => [
        { field: 'Appt. Date', headerName: 'Appt. Date', width: 120, pinned: 'left' },
        { field: 'Time', width: 121, pinned: 'left' },
        { headerName: 'Patient Info', width: 200, valueGetter: params => (formatPatientKey(params.data) + ' - ' + getPatientName(params.data)), pinned: 'left' },
        { field: 'Enc. type', headerName: 'Enc. type', width: 200, pinned: 'left' },
        { headerName: 'View Appt Log', field: 'appointmentId', width: 120, cellRenderer: 'viewAppointmentLogCellRenderer', pinned: 'left' },
        { field: 'Appt. type', headerName: 'Appt. type', width: 150, cellClass: params => classes[params.value.replace(/ /g, '')], pinned: 'left'},
        { field: 'Justification', width: 200 },
        { field: 'Delete Reason', width: 200 },
        { field: 'Other Delete Reason', width: 200 },
        { field: 'Reschedule Reason', width: 200 },
        { field: 'Other Reschedule Reason', width: 200 },
        { field: 'Delete Remark', width: 150 },
        { field: 'Created On', width: 160 },
        { field: 'Created By', width: 150  }
    ], [classes]);

    return (
        <CIMSPromptDialog
            open={open}
            onClose={onClose}
            dialogTitle={'Timeslot Log'}
            contentRoot={classes.content}
            dialogContentText={
                <table className={classes.table}>
                    <tbody>
                        <tr>
                            <td className={classes.td}>
                                <List className={classes.list}>
                                    {timeslots.map((timeslot, index) => (<>
                                        <ListItem className={classes.listItem} button key={timeslot.startTime} selected={selectedIndex === index} onClick={() => onSelect(index)}>
                                            <ListItemText primary={timeslot.startTime} />
                                        </ListItem>
                                        <Divider />
                                    </>))}
                                </List>
                            </td>
                            <td className={classes.td}>
                                <CIMSDataGrid
                                    disableAutoSize
                                    gridTheme="ag-theme-balham"
                                    divStyle={{
                                        width: '85vw',
                                        height: '80vh'
                                    }}
                                    gridOptions={{
                                        defaultColDef: {
                                            filter: true,
                                            sortable: true,
                                            resizable: true,
                                            cellStyle: {
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'center'
                                            },
                                            cellRenderer: 'overflowTypographyCellRenderer'
                                        },
                                        columnDefs,
                                        rowData: timeslotLog,
                                        headerHeight: 50,
                                        rowHeight: 50,
                                        getRowNodeId: item => item.appointmentLogId,
                                        suppressRowClickSelection: true,
                                        suppressFieldDotNotation: true,
                                        frameworkComponents: {
                                            overflowTypographyCellRenderer: props => <OverflowTypography noWrap>{props.value}</OverflowTypography>,
                                            viewAppointmentLogCellRenderer: props => (
                                                <Link component="button" variant="body1" className={classes.link} onClick={() => dispatch(getAppointmentLog(props.value))}>View</Link>
                                            )
                                        }
                                    }}
                                    suppressGoToRow
                                    suppressDisplayTotal
                                />
                            </td>
                        </tr>
                    </tbody>
			    </table>
            }
            buttonConfig={[
                {
                    name: 'Close',
                    onClick: onClose
                }
            ]}
        />
    );
};