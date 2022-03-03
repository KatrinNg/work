import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Button, Grid } from '@material-ui/core';
import { Formik, Form, Field, FastField, withFormik } from 'formik';
import * as yup from 'yup';
import { connect } from 'react-redux';

import moment from 'moment';

import * as DateUtilities from '../../../../utilities/dateUtilities';

import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import GridTextFieldRenderer from '../../../../components/Grid/GridTextFieldRenderer';
import GridCellRenderer from '../../../../components/Grid/GridCellRenderer';
import * as reportConstant from '../../../../constants/report/reportConstant';

import 'ag-grid-community/dist/styles/ag-grid.css';
import '../../../../styles/ag-theme-balham/sass/ag-theme-balham.scss';

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
    },
    hideTable :{
        display: 'none'
    },
    showTable:{
        width:'100%'
    }
});

class DynamicForm extends Component {
    constructor(props) {
        super(props);

        this.cellRendererParams = {
            classes: this.props.classes,
            getField: this.getField,
            serviceCd: this.props.serviceCd,
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
                    || originalRow.etime !== etime,
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
        const { classes, values } = this.props;
        const idConstant = '_weekday_grid';
        const hideTable = !(values && values.rowData && values.rowData.length > 0);
        return (
            <div className={hideTable ? classes.hideTable :classes.showTable}>
            <Form style={{width: '100%' }}>
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
                                //{headerName: '', suppressMovable: true, valueGetter: (params) => '', filter: false, headerCheckboxSelection: true, checkboxSelection: true, minWidth: 40, maxWidth: 40},
                                //{
                                    //headerName: 'Report template param val id',
                                    //field: 'rptConfigParamValId',
                                    //suppressMovable: true,
                                    //minWidth: 150,
                                    //maxWidth: 150
                                //},
                                //{
                                    //headerName: 'Report template param id',
                                    //field: 'rptTmplParamId',
                                    //suppressMovable: true,
                                    //minWidth: 150,
                                    //maxWidth: 150
                                //},
                                //{
                                    //headerName: 'Report config Id',
                                    //field: 'reportConfigId',
                                    //suppressMovable: true,
                                    //minWidth: 150,
                                    //maxWidth: 150
                                //},
                                {
                                    headerName: 'Parameter Name',
                                    field: 'paramName',
                                    suppressMovable: true,
                                    minWidth: 150,
                                    maxWidth: 450
                                },
                                {
                                    headerName: 'Description',
                                    field: 'paramDesc',
                                    suppressMovable: true,
                                    minWidth: 150,
                                    maxWidth: 450
                                },
                                {
                                    headerName: 'Type',
                                    field: 'paramType',
                                    suppressMovable: true,
                                    minWidth: 150,
                                    maxWidth: 450
                                },
                                //{
                                    //headerName: 'Seq',
                                    //field: 'seq',
                                    //hide: true,
                                    //suppressMovable: true,
                                    //sort: 'asc',
                                    //minWidth: 150,
                                    //maxWidth: 150
                                //},
                                {
                                    headerName: 'Value',
                                    field: 'paramVal',
                                    suppressMovable: true,
                                    minWidth: 400,
                                    maxWidth: 600,
                                    cellRendererSelector: (params) => {
                                        let textField = {
                                            component: 'gridTextFieldRenderer',
                                            params: {
                                                ...this.cellRendererParams,
                                                inputComponent: 'html',
                                                inputType: 'text'
                                            }
                                        };

                                        let numberField = {
                                            component: 'gridTextFieldRenderer',
                                            params: {
                                                ...this.cellRendererParams,
                                                inputComponent: 'html',
                                                inputType: 'number'
                                            }
                                        };

                                        let dateField = {
                                            component: 'gridCellRenderer',
                                            params: {
                                                ...this.cellRendererParams,
                                                inputComponent: 'html',
                                                inputType: 'date'
                                            }
                                        };

                                        let selectField = {
                                            component: 'gridCellRenderer',
                                            params: {
                                                ...this.cellRendererParams,
                                                inputComponent: 'html',
                                                selcte: 'html',
                                                // selectOption: selectOption,
                                                inputType: 'select'
                                            }
                                        };

                                        if (params.data.provided === 'Y'){
                                            return null;
                                        } else {
                                            if (params.data.paramType === 'string') {
                                                return textField;
                                            } else if (params.data.paramType === 'number') {
                                                return numberField;
                                            } else if (params.data.paramType === 'date') {
                                                return dateField;
                                            } else if (params.data.paramType === 'select') {
                                                return selectField;
                                            }
                                        }
                                    }
                                }
                            ],
                            onCellFocused: e => {
                                if (e.column && this.disableClickSelectionRenderers.includes(e.column.colDef.cellRenderer)) {
                                    e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
                                }
                            },
                            frameworkComponents: {
                                gridTextFieldRenderer: GridTextFieldRenderer,
                                gridCellRenderer: GridCellRenderer
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
                            //getRowNodeId: data => data.rptTmplParamId,
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
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        serviceCd: state.login.service.serviceCd
    };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(withFormik({
    displayName: 'FormikForm',
    mapPropsToValues: props => ({
        originalRowData: props.originalRowData,
        rowData: props.rowData,
        rowId: props.rowId
    }),
    validationSchema: (props) => {
        return yup.object({
            rowData: yup
                .array()
                .of(
                    yup.object().shape({
                        paramVal: yup
                            .string()
                            .nullable()
                            .required('Required')
                            .test('isValidMonth', props.serviceCd === 'ANT' ? reportConstant.VALIDATION_MSG.isValidMonthByANT
                                    : reportConstant.VALIDATION_MSG.isValidMonth, function(value) {
                                const otherFieldValue = this.parent && this.parent.paramName;
                                if (otherFieldValue === reportConstant.RPT_TMPL_PARAM_NAME_CODE.monthNo) {
                                    if (props.serviceCd === 'ANT') {
                                        return value > 0 && value < 13 && value.length === 2;
                                    } else {
                                        return value > 0 && value < 13;
                                    }
                                }
                                return 1;
                            })
                            .test('isYearBetween1900and2200', reportConstant.VALIDATION_MSG.isYearBetween1900and2200, function(value) {
                                const otherFieldValue = this.parent && this.parent.paramName;
                                if (otherFieldValue === reportConstant.RPT_TMPL_PARAM_NAME_CODE.yearNo ) {
                                    return value >= 1900 && value <= 2200;
                                }
                                return 1;
                            })
                    })
                )
        });
    },
    validateOnBlur: true,
    validateOnChange: false,
    validateOnMount: false,
    handleSubmit: (values, { setSubmitting }) => {

    }
})(withStyles(styles)(DynamicForm)));
