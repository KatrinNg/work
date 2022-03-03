import { CircularProgress, IconButton, Table, TableBody, TableCell, TableHead, TableRow, withStyles } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import React, { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import CustomTableRow from '../../../compontent/CustomTableRow';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import GridTextFieldRenderer from '../../../../components/Grid/GridTextFieldRenderer';
import { FastField } from 'formik';
import * as moment from 'moment';
import Enum from '../../../../enums/enum';
import { DISPLAY_TYPE_PLAN, DISPLAY_TYPE_TIMESLOT } from '..';
import * as DateUtilities from '../../../../utilities/dateUtilities';
import { AppointmentUtil } from '../../../../utilities';

const QuotaRenderer = memo((props) => {
    const { editQuota, value, setQuota, rowIndex, data } = props;

    const inputRef = useRef(null);

    const [_value, _setValue] = useState(value);

    useEffect(() => {
        if (value !== _value) {
            _setValue(value);
        }
    }, [value]);

    const handleOnBlur = () => {
        setQuota(_value, rowIndex);
    };

    return editQuota ? (
        <div>
            <IconButton
                style={{ padding: 4 }}
                onClick={() => {
                    setQuota(Number(value) - 1, rowIndex);
                }}
            >
                <RemoveIcon />
            </IconButton>
            <input
                type="text"
                ref={inputRef}
                value={_value}
                onChange={(e) => _setValue(e.target.value)}
                onBlur={() => handleOnBlur()}
                style={{ padding: '0px 4px', width: 60, fontSize: 16 }}
                maxLength={3}
            />
            <IconButton style={{ padding: 4 }} onClick={() => setQuota(Number(value) + 1, rowIndex)}>
                <AddIcon />
            </IconButton>
        </div>
    ) : (
        <span>{value || 0}</span>
    );
});

const LoadingOverlay = (props) => {
    return <CircularProgress style={{ width: '80px', height: '80px' }} />;
};

const TimeslotPlanTable = (props) => {
    const { id, classes, room, timeslotPlans, loadingTimeslotPlans, loadingTimeslotPlanHdrs, editQuota, maxHeight, qtTypes, displayType, isShowAvailable = false } = props;

    const [editableTimeslotPlans, setEditableTimeslotPlans] = useState([...timeslotPlans]);

    const [columnDefs, setColumnDefs] = useState([]);

    const gridRef = useRef();

    useEffect(() => {
        // console.log('[timeslotPlanTable] -> timeslotPlans: ', timeslotPlans);

        if (editQuota) {
            setEditableTimeslotPlans([...timeslotPlans]);
        }

        // console.log('@@@@', gridRef?.current?.grid?.columnApi);

        // if (displayType === DISPLAY_TYPE_PLAN) {
        //     gridRef?.current?.grid?.gridOptions?.columnApi?.setColumnsVisible(['tmsltDate', 'weekday'], false);
        //     gridRef?.current?.grid?.gridOptions?.columnApi?.setColumnsVisible(['lastApptDate'], true);
        //     gridRef?.current?.grid?.gridOptions?.columnApi?.moveColumn(
        //         'lastApptDate',
        //         gridRef?.current?.grid?.gridOptions?.columnApi?.getAllDisplayedColumns().length + 1
        //     );
        // } else {
        //     gridRef?.current?.grid?.gridOptions?.columnApi?.setColumnsVisible(['tmsltDate', 'weekday'], true);
        //     gridRef?.current?.grid?.gridOptions?.columnApi?.setColumnsVisible(['lastApptDate'], false);
        // }
    }, [timeslotPlans, editQuota]);

    useEffect(() => {
        console.log(editableTimeslotPlans);
    }, [editableTimeslotPlans]);

    const setQuota = (value, i) => {
        const newEditableTimeslotPlans = [...editableTimeslotPlans];
        let timeslotPlan = { ...newEditableTimeslotPlans[i] };
        timeslotPlan.qt1 = value;
        newEditableTimeslotPlans[i] = timeslotPlan;
        setEditableTimeslotPlans(newEditableTimeslotPlans);
    };

    const getEncounterTypeDesc = (encounterTypeId) => {
        return room?.encntrTypeList?.find((encounterType) => encounterType.encntrTypeId === encounterTypeId)?.encntrTypeDesc;
    };

    const disableClickSelectionRenderers = ['qutoaRenderer'];

    // useEffect(() => {
    //     console.log(gridRef?.current);
    // }, [gridRef]);

    useEffect(() => {
        return () => {
            gridRef?.current?.grid?.api?.destroy();
        };
    }, []);

    useEffect(() => {
        let columnDefs = [
            {
                headerName: 'Encounter Type',
                // minWidth: 500,
                field: 'encntrTypeIdDefault',
                // colId: 'encntrTypeIdDefault',
                cellRendererParams: {
                    room: room
                },
                valueGetter: ({ data }) => getEncounterTypeDesc(data.encntrTypeIdDefault)
                // valueFormatter: (params) => {
                //     return params.value ? getEncounterTypeDesc(params.value) : '';
                // }
            },
            {
                headerName: 'Start Time',
                field: 'stime',
                // colId: 'stime',
                width: 140
            },
            {
                headerName: 'End Time',
                field: 'etime',
                // colId: 'etime',
                width: 140
            }
        ];
        if (displayType === DISPLAY_TYPE_PLAN) {
            columnDefs = [
                ...columnDefs,
                ...qtTypes?.map((qt) => ({
                    headerName: qt.engDesc,
                    field: qt.code,
                    // colId: qt.code,
                    // editable: editQuota,
                    cellRenderer: 'qutoaRenderer',
                    width: 160,
                    cellRendererParams: {
                        editQuota: editQuota,
                        setQuota: (value, i) => setQuota(value, i),
                        editableTimeslotPlans
                    },
                    suppressKeyboardEvent: editQuota
                })),
                {
                    headerName: 'Last Appointment Booking On',
                    field: 'lastApptDate',
                    width: 180,
                    valueFormatter: (params) => params.value && moment(params.value).format('DD-MM-YYYY'),
                    tooltipValueGetter: (params) => params.valueFormatted,
                    comparator: DateUtilities.dateComparator,
                    filter: 'agDateColumnFilter',
                    filterParams: {
                        comparator: DateUtilities.dateFilter,
                        browserDatePicker: true
                    }
                },
                {
                    headerName: 'Updated On',
                    width: 150,
                    field: 'updateDtm',
                    // sort: 'desc',
                    valueFormatter: (params) => params.value && moment(params.value).format('DD-MM-YYYY'),
                    tooltipValueGetter: (params) => params.valueFormatted,
                    comparator: DateUtilities.dateComparator,
                    filter: 'agDateColumnFilter',
                    filterParams: {
                        comparator: DateUtilities.dateFilter,
                        browserDatePicker: true
                    }
                }
            ];
        } else if (displayType === DISPLAY_TYPE_TIMESLOT) {
            columnDefs = [
                {
                    headerName: 'Date',
                    field: 'tmsltDate',
                    // colId: 'tmsltDate',
                    width: 140,
                    // cellRenderer: 'dateRender',
                    // cellRendererParams: {
                    //     classes: this.props.classes
                    // },
                    // hide: timeslotPlans?.every((x) => x.tmsltDate === null),
                    valueGetter: (params) => {
                        return moment(params.data.tmsltDate).format(Enum.DATE_FORMAT_DMY);
                    }
                },
                {
                    headerName: 'Weekday',
                    field: 'weekday',
                    // colId: 'weekday',
                    width: 140,
                    // cellRenderer: 'dateRender',
                    // cellRendererParams: {
                    //     classes: this.props.classes
                    // },
                    // hide: timeslotPlans?.every((x) => x.tmsltDate === null),
                    valueGetter: (params) => {
                        return moment(params.data.tmsltDate).format('ddd');
                    }
                },
                ...columnDefs,
                {
                    headerName: 'Session',
                    field: 'sessDesc',
                    // colId: 'sessDesc',
                    width: 155
                },
                ...qtTypes?.map((qt) => ({
                    headerName: qt.engDesc,
                    field: qt.code,
                    // colId: qt.code,
                    width: 160,
                    valueGetter: (params) => {
                        return AppointmentUtil.getQuotaDisplayContent(
                            params.data[params.colDef.field + 'Booked'] || 0,
                            params.data[params.colDef.field] || 0,
                            isShowAvailable
                        );
                    }
                }))
            ];
        } else {
            columnDefs = [];
        }
        setColumnDefs(columnDefs);
    }, [displayType, qtTypes, room]);

    useEffect(() => {
        if (gridRef) {
            if (loadingTimeslotPlans) {
                gridRef.current?.grid?.api?.showLoadingOverlay();
            } else if (!loadingTimeslotPlans && !timeslotPlans.length > 0) {
                gridRef.current?.grid?.api?.showNoRowsOverlay();
            } else {
                gridRef.current?.grid?.api?.hideOverlay();
            }
        }
    }, [loadingTimeslotPlans]);

    return (
        <CIMSDataGrid
            id={id}
            ref={gridRef}
            suppressDisplayTotal
            suppressGoToRow
            disableAutoSize
            gridTheme="ag-theme-balham"
            divStyle={{
                width: '100%',
                height: maxHeight,
                display: 'block'
            }}
            gridOptions={{
                columnDefs: columnDefs,
                suppressDragLeaveHidesColumns: true,
                loadingOverlayComponent: 'loadingOverlay',
                rowData: editQuota ? editableTimeslotPlans : timeslotPlans,
                rowSelection: 'single',
                headerHeight: 48,
                getRowHeight: () => 40,
                getRowNodeId: (item) =>
                    // displayType === DISPLAY_TYPE_PLAN ? item.tmsltPlanId?.toString() : displayType === DISPLAY_TYPE_TIMESLOT ? item.tmsltId?.toString() : null,
                    item.refId?.toString() || null,
                suppressRowClickSelection: false,
                frameworkComponents: {
                    qutoaRenderer: QuotaRenderer,
                    loadingOverlay: LoadingOverlay
                },
                onCellFocused: (e) => {
                    if (e.column && disableClickSelectionRenderers.includes(e.column.colDef.cellRenderer)) {
                        e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
                    }
                }
                // ,
                // onRowClicked: (params) => {
                //     let { selectPatient } = this.state;
                //     if (!selectPatient || (params.data.patientKey && selectPatient.patientKey !== params.data.patientKey)) {
                //         this.setState({ selectPatient: params.data });
                //     } else {
                //         this.setState({ selectPatient: null });
                //     }
                // },
                // onRowDoubleClicked: (params) => {
                //     this.props.handleSelectPatient(params.data);
                // }
            }}
        />
    );

    // return loadingTimeslotPlanHdrs || loadingTimeslotPlans ? (
    //     <Table size="small" style={{ borderCollapse: 'separate' }}>
    //         <TableHead>
    //             <TableRow>
    //                 <TableCell className={classes.tableHeaderCell}>
    //                     <div>Encounter Type</div>
    //                     {/* {editQuota && (
    //                     <div>
    //                         <input />
    //                     </div>
    //                 )} */}
    //                 </TableCell>
    //                 <TableCell className={classes.tableHeaderCell}>Time</TableCell>
    //                 <TableCell className={classes.tableHeaderCell}>Qutoa</TableCell>
    //             </TableRow>
    //         </TableHead>

    //         <TableBody>
    //             {[...Array(2)].map((_, i) => (
    //                 <TableRow key={`loading-${i}`}>
    //                     {[...Array(3)].map((__, j) => (
    //                         <TableCell key={`loading-${i}-${j}`}>
    //                             <Skeleton animation="wave" height={30} />
    //                         </TableCell>
    //                     ))}
    //                 </TableRow>
    //             ))}
    //         </TableBody>
    //     </Table>
    // ) : (
    //     <CIMSDataGrid
    //         ref={gridRef}
    //         suppressDisplayTotal
    //         suppressGoToRow
    //         // disableAutoSize
    //         gridTheme="ag-theme-balham"
    //         divStyle={{
    //             width: '100%',
    //             height: maxHeight,
    //             display: 'block'
    //         }}
    //         gridOptions={{
    //             columnDefs: [
    //                 {
    //                     headerName: 'Encounter Type',
    //                     minWidth: 500,
    //                     field: 'encntrTypeIdDefault',
    //                     cellRendererParams: {
    //                         room: room
    //                     },
    //                     valueFormatter: (params) => {
    //                         return params.value ? getEncounterTypeDesc(params.value) : '';
    //                     }
    //                 },
    //                 {
    //                     headerName: 'Time',
    //                     field: 'stime',
    //                     minWidth: 100
    //                 },
    //                 {
    //                     headerName: 'Quota',
    //                     field: 'qt1',
    //                     // editable: editQuota,
    //                     cellRenderer: 'qutoaRenderer',
    //                     minWidth: 150,
    //                     cellRendererParams: {
    //                         editQuota: editQuota,
    //                         setQuota: (value, i) => setQuota(value, i)
    //                     }
    //                 }
    //             ],
    //             rowData: editQuota ? editableTimeslotPlans : timeslotPlans,
    //             rowSelection: 'single',
    //             getRowHeight: () => 40,
    //             getRowNodeId: (item) => item.tmsltPlanId?.toString(),
    //             suppressRowClickSelection: false,
    //             frameworkComponents: {
    //                 qutoaRenderer: QuotaRenderer
    //             },
    //             onCellFocused: (e) => {
    //                 if (e.column && disableClickSelectionRenderers.includes(e.column.colDef.cellRenderer)) {
    //                     e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
    //                 }
    //             }
    //             // ,
    //             // onRowClicked: (params) => {
    //             //     let { selectPatient } = this.state;
    //             //     if (!selectPatient || (params.data.patientKey && selectPatient.patientKey !== params.data.patientKey)) {
    //             //         this.setState({ selectPatient: params.data });
    //             //     } else {
    //             //         this.setState({ selectPatient: null });
    //             //     }
    //             // },
    //             // onRowDoubleClicked: (params) => {
    //             //     this.props.handleSelectPatient(params.data);
    //             // }
    //         }}
    //     />
    // );
};

const styles = (theme) => ({
    tableHeaderCell: {
        // textAlign: 'center',
        fontWeight: 'bold',
        // background: 'white',
        // color: 'black',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        background: '#7bc1d9',
        color: 'white',
        fontSize: '16px',
        padding: '10px'
    }
});

export default withStyles(styles)(TimeslotPlanTable);
