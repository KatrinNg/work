import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Button, Grid } from '@material-ui/core';
import { Formik, Form, Field, FastField, withFormik } from 'formik';
import * as yup from 'yup';

import moment from 'moment';

import * as DateUtilities from '../../../utilities/dateUtilities';

import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import GridTextFieldRenderer from '../../../components/Grid/GridTextFieldRenderer';

import 'ag-grid-community/dist/styles/ag-grid.css';
import '../../../styles/ag-theme-balham/sass/ag-theme-balham.scss';

const styles = theme => ({
    actionButtonRoot: {
        color: '#0579c8',
        border: 'solid 1px #0579C8',
        boxShadow: '2px 2px 2px #6e6e6e',
        backgroundColor: '#ffffff',
        minWidth: '90px',
        marginTop: '10px',
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

class TimeslotPlanWeekdayGrid extends Component {
    constructor(props) {
        super(props);

        this.cellRendererParams = {
            classes: this.props.classes,
            getField: this.getField,
            changeField: this.changeField,
            blurField: this.blurField
        };
    }

    componentDidMount() {
        // console.log(this.props);
    }

    componentDidUpdate(prevProps) {
        if (this.props.values !== prevProps.values)
            this.props.onValuesChanged(this.props);
        if (this.props.errors !== prevProps.errors)
            this.props.onErrorsChanged(this.props);
    }

    componentWillUnmount() {}

    compareRow = (row) => {
        const { values } = this.props;
        let originalRow = values.originalRowData.find(x => x.tmsltPlanId === row.tmsltPlanId);
        if (originalRow) {
            let stime = row.stime;
            let etime = row.etime;
            return {
                changed: originalRow.stime !== stime
                    || originalRow.etime !== etime
                    || originalRow.qt1 !== row.qt1
                    || originalRow.qt2 !== row.qt2
                    || originalRow.qt3 !== row.qt3
                    || originalRow.qt4 !== row.qt4
                    || originalRow.qt5 !== row.qt5
                    || originalRow.qt6 !== row.qt6
                    || originalRow.qt7 !== row.qt7
                    || originalRow.qt8 !== row.qt8,
                timeChanged: originalRow.stime !== row.stime
                    || originalRow.etime !== etime
            };
        }
        return {new: true};
    }

    changeField = ({ rowId, colId, rowNode, form, field, value }) => {
        // console.log('changeField', value);
        if (field.name.indexOf('qt') != -1) {
            if (value == null || value == undefined || value === '')
                value = undefined;
            else
                value = parseInt(value);
        }
        if (field.name.indexOf('time') != -1) {
            if (value == null || value == undefined || value === '')
                value = null;
        }

        const { rowData } = form.values;
        const row = {...rowData[rowId]};
        const oldValue = row[colId];

        // console.log('row:', row);
        // console.log('oldValue:', oldValue);
        // console.log('newValue:', value);

        if (oldValue !== value) {
            row[colId] = value;
            let result = this.compareRow(row);
            // console.log('result:', result);
            if (result.changed != undefined)
                row.action = result.changed ? 'update' : null;
            if (result.timeChanged != undefined)
                row.timeChanged = result.timeChanged;

            form.setFieldValue(`rowData[${rowId}].${colId}`, value);
            form.setFieldValue(`rowData[${rowId}].action`, row.action);
            form.setFieldValue(`rowData[${rowId}].timeChanged`, row.timeChanged);
        }
    }

    blurField = ({ form, field }) => {
        form.setFieldTouched(field.name, true);
    }

    isExternalFilterPresent = () => {
        return true;
    };

    doesExternalFilterPass = node => {
        return node.data.action !== 'delete';
    };

    disableClickSelectionRenderers = ['gridTextFieldRenderer'];

    render() {
        const { classes, validQtHeaders, values, readOnly } = this.props;
        const idConstant = "_weekday_grid";
        return (
            <Form style={{ width: '100%' }}>
                <Grid item container xs={12}>
                    <CIMSDataGrid
                        ref={this.props.forwardedRef}
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '351px',
                            display:'block'
                        }}
                        gridOptions={{
                            columnDefs: [
                                {headerName: '', suppressMovable: true, valueGetter: (params) => params.node.rowIndex + 1, minWidth: 50, maxWidth: 50},
                                {headerName: '', suppressMovable: true, valueGetter: (params) => '', filter: false, headerCheckboxSelection: readOnly ? false : true, checkboxSelection: readOnly ? false : true, minWidth: 40, maxWidth: 40},
                                {
                                    headerName: 'Start Time',
                                    field: 'stime',
                                    suppressMovable: true,
                                    minWidth: 150,
                                    maxWidth: 150,
                                    // sort: 'asc',
                                    cellRenderer: 'gridTextFieldRenderer',
                                    cellRendererParams: {
                                        ...this.cellRendererParams,
                                        inputComponent: 'html',
                                        inputType: "time",
                                        inputFormat: "HH:mm",
                                        readOnly: readOnly ? "readonly" : ""
                                    }
                                },
                                {
                                    headerName: 'End Time',
                                    field: 'etime',
                                    suppressMovable: true,
                                    minWidth: 150,
                                    maxWidth: 150,
                                    cellRenderer: 'gridTextFieldRenderer',
                                    cellRendererParams: {
                                        ...this.cellRendererParams,
                                        inputComponent: 'html',
                                        inputType: "time",
                                        inputFormat: "HH:mm",
                                        readOnly: readOnly ? "readonly" : ""
                                    }
                                },
                                ...validQtHeaders.map((header, i) => {
                                    ++i;
                                    if (header != null) {
                                        return {
                                            headerName: header,
                                            field: `qt${i}`,
                                            suppressMovable: true,
                                            minWidth: 100,
                                            maxWidth: 200,
                                            cellRenderer: 'gridTextFieldRenderer',
                                            cellRendererParams: {
                                                ...this.cellRendererParams,
                                                inputComponent: 'html',
                                                inputType: "number",
                                                readOnly: readOnly ? "readonly" : ""
                                            }
                                        };
                                    }
                                    else
                                        return null;
                                }).filter(x => x !== null),
                                {
                                    headerName: 'Last Appointment Booking On',
                                    suppressMovable: true,
                                    minWidth: 180,
                                    maxWidth: 180,
                                    field: 'lastApptDate',
                                    valueFormatter: params => params.value && moment(params.value).format('DD-MM-YYYY'),
                                    comparator: DateUtilities.dateComparator,
                                    filter: 'agDateColumnFilter',
                                    filterParams: {
                                        comparator: DateUtilities.dateFilter,
                                        browserDatePicker: true
                                    }
                                },
                                {
                                    headerName: 'Updated On',
                                    suppressMovable: true,
                                    minWidth: 180,
                                    maxWidth: 180,
                                    field: 'updateDtm',
                                    valueFormatter: params => params.value && moment(params.value).format('DD-MM-YYYY'),
                                    comparator: DateUtilities.dateComparator,
                                    filter: 'agDateColumnFilter',
                                    filterParams: {
                                        comparator: DateUtilities.dateFilter,
                                        browserDatePicker: true
                                    }
                                }
                            ],
                            onCellFocused: e => {
                                if (e.column && this.disableClickSelectionRenderers.includes(e.column.colDef.cellRenderer)) {
                                    e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
                                }
                            },
                            frameworkComponents: {
                                gridTextFieldRenderer: GridTextFieldRenderer
                            },
                            isExternalFilterPresent: this.isExternalFilterPresent,
                            doesExternalFilterPass: this.doesExternalFilterPass,
                            getRowHeight: (params) => {
                                // return 60;
                                return 36;
                            },
                            rowBuffer: 30,
                            rowSelection: 'multiple',
                            rowMultiSelectWithClick: true,
                            // suppressRowClickSelection: true,
                            // singleClickEdit: true,
                            // suppressClickEdit: true,
                            // editType: 'fullRow',
                            // stopEditingWhenGridLosesFocus: true,
                            headerHeight: 48,
                            ensureDomOrder: true,
                            rowData: values.rowData,
                            immutableData: true,
                            getRowNodeId: data => data.rowId,
                            postSort: rowNodes => {
                                let rowNode = rowNodes[0];
                                if (rowNode) {
                                    setTimeout((rowNode) => {
                                        rowNode.gridApi.refreshCells();
                                    }, 100, rowNode);
                                }
                            }
                        }}
                        disableAutoSize
                    />
                </Grid>
            </Form>
        );
    }
}

export default withFormik({
    displayName: 'FormikForm',
    mapPropsToValues: props => ({ originalRowData: props.originalRowData, rowData: props.rowData, rowId: props.rowId }),
    validationSchema: (props) => {
        const session = props.session;
        const yupQt = yup
                        .number()
                        .nullable()
                        .required('Required')
                        .min(0, 'Must be >= 0')
                        .max(9999, 'Must be <= 9999');
        return yup.object({
            rowData: yup
                .array()
                .of(
                    yup.object().shape({
                        stime: yup
                            .string()
                            .nullable()
                            .required('Required')
                            .test('isTime', 'Invalid Time Format', function(value) {
                                const time = value != null ? moment(value, 'HH:mm') : null;
                                return time && time.isValid();
                            })
                            .test('isStartTimeWithinSession', 'Out Of Session Range', function(value) {
                                const time = value != null ? moment(value, 'HH:mm') : null;
                                if (time && time.isValid() && session) {
                                    let sessionStime = moment(session.stime, 'HH:mm');
                                    let sessionEtime = moment(session.etime, 'HH:mm');
                                    return time.isSameOrAfter(sessionStime, 'minute') && time.isSameOrBefore(sessionEtime, 'minute');
                                }
                                return true;
                            })
                            ,
                        etime: yup
                            .string()
                            .nullable()
                            .required('Required')
                            .test('isTime', 'Invalid Time Format', function(value) {
                                const time = value != null ? moment(value, 'HH:mm') : null;
                                return time && time.isValid();
                            })
                            .test('isEndTimeWithinSession', 'Out Of Session Range', function(value) {
                                const time = value != null ? moment(value, 'HH:mm') : null;
                                if (time && time.isValid() && session) {
                                    let sessionStime = moment(session.stime, 'HH:mm');
                                    let sessionEtime = moment(session.etime, 'HH:mm');
                                    return time.isSameOrAfter(sessionStime, 'minute') && time.isSameOrBefore(sessionEtime, 'minute');
                                }
                                return true;
                            })
                            .test('isEndTimeAfterStartTime', 'Cannot earlier than Start Time', function(etime) {
                                const { stime } = this.parent;
                                const _stime = moment(stime, 'HH:mm');
                                const _etime = moment(etime, 'HH:mm');
                                if (_stime.isValid() && _etime.isValid())
                                    return _etime.isSameOrAfter(_stime, 'minute');
                                return true;
                            })
                            ,
                        qt1: yupQt,
                        qt2: yupQt,
                        qt3: yupQt,
                        qt4: yupQt,
                        qt5: yupQt,
                        qt6: yupQt,
                        qt7: yupQt,
                        qt8: yupQt
                    })
                )
        });
    },
    validateOnBlur: true,
    validateOnChange: false,
    validateOnMount: false,
    handleSubmit: (values, { setSubmitting }) => {

    }
})(withStyles(styles)(TimeslotPlanWeekdayGrid));
