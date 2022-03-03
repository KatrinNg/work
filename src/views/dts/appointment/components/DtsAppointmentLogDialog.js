import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import '../../../../styles/common/customHeaderStyle.scss';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import { setAppointmentLog } from '../../../../store/actions/dts/appointment/bookingAction';
import OverflowTypography from '../../components/OverflowTypography';
import { formatPatientKey, getPatientName } from '../../../../utilities/dtsUtilities';

const styles = (theme) => ({
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
    const appointmentLog = useSelector(state => state.dtsAppointmentBooking.appointmentLog);
    const dispatch = useDispatch();
    const close = () => dispatch(setAppointmentLog(null));

    const columnDefs = useMemo(() => [
        { field: 'Appt. Date', headerName: 'Appt. Date', width: 120, pinned: 'left' },
        { field: 'Time', width: 121, pinned: 'left' },
        { headerName: 'Patient Info', width: 200, valueGetter: params => (formatPatientKey(params.data) + ' - ' + getPatientName(params.data)), pinned: 'left' },
        { field: 'Clinic / Unit', width: 100, pinned: 'left' },
        { field: 'Surgery', width: 100, pinned: 'left' },
        { field: 'Enc. type', headerName: 'Enc. type', width: 200, pinned: 'left' },
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
            open={appointmentLog !== null}
            onClose={close}
            dialogTitle={'Appointment Log'}
            contentRoot={classes.content}
            dialogContentText={
                <CIMSDataGrid
                    disableAutoSize
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '90vw',
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
                        rowData: appointmentLog,
                        headerHeight: 50,
                        rowHeight: 50,
                        getRowNodeId: item => item.appointmentLogId,
                        suppressRowClickSelection: true,
                        suppressFieldDotNotation: true,
                        frameworkComponents: {
                            overflowTypographyCellRenderer: props => <OverflowTypography noWrap>{props.value}</OverflowTypography>
                        }
                    }}
                    suppressGoToRow
                    suppressDisplayTotal
                />
            }
            buttonConfig={[
                {
                    name: 'Close',
                    onClick: close
                }
            ]}
        />
    );
};