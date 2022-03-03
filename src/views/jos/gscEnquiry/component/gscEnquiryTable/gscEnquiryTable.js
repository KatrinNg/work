import React, { Component } from 'react';
import { withStyles, Tooltip, Checkbox } from '@material-ui/core';
import { styles } from './gscEnquiryTableStyle';
import icon_report from '../../../../../images/gscEnquiry/enquire_invest_report.png';
import icon_doc from '../../../../../images/gscEnquiry/icon_doc.jpg';
import TableSelect from '../SelectBox/TableSelect';
import CheckBoxResult from '../CheckBox/CheckBox';
import Enum from '../../../../../../src/enums/enum';
import moment from 'moment';
import _ from 'lodash';
import SelectBox from '../SelectBox/SelectBox';
import CIMSDataGrid from '../../../../../components/Grid/CIMSDataGrid';
import { toNumber} from 'lodash';
// import CIMSDataGrid from '@components/Grid/CIMSDataGrid';
class GscEnquiryTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chtScreeningValue: 'Nil',
            gspdScreeningValue: 'Nil',
            chtReviewVal: 'Nil',
            gspdReviewVal: 'Nil',
            selectedRowId: null,
            selectedRowDoc: null,
            dropListName: {
                'G6PD': [
                    { title: 'Deficient', value: 'A' },
                    { title: 'Deficient/Borderline', value: 'AB' },
                    { title: 'Borderline', value: 'B' },
                    { title: 'Not Deficient', value: 'N' }
                ],
                'CHT': [
                    { title: 'Screened Positive', value: 'A' },
                    { title: 'Screened Negative', value: 'N' }
                ],
                'CHT/G6PD': [
                    { title: 'Screened Positive/Deficient', value: 'A' },
                    { title: 'Screened Positive/Deficient/Borderline', value: 'AB' },
                    { title: 'Borderline', value: 'B' },
                    { title: 'Screened Negative/Not Deficient', value: 'N' }
                ]
            }
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.selectedRowId != this.state.selectedRowId) {
            this.setState({ selectedRowId: nextProps.selectedRowId });
        }
    }

    handleRowClick = (rowId, rowDoc) => {
        let { setSelectedRowId } = this.props;
        this.setState({ selectedRowId: rowId, selectedRowDoc: rowDoc });
        setSelectedRowId && setSelectedRowId(rowId);
    };

    handleReportAndClinicalDocClick = (type, items) => {
        const { handleReportAndClinicalDocClick } = this.props;
        handleReportAndClinicalDocClick && handleReportAndClinicalDocClick(type,items);
    }

    onCheckBoxAllClick = (event) => {
        let { valMap, updateState, insertGscEnquiryLog } = this.props;
        let flag = event.target.checked;
        let enquiryMap = valMap;
        if (enquiryMap.size > 0) {
            for (let valObj of enquiryMap.values()) {
                valObj.failCntct = flag;
                valObj.operationType = 'U';
            }
            updateState && updateState({ valMap,  isEdit: true, contactCheckedFlag: flag });
        }
        let name = `Action: Click 'Checked' in ${flag ? 'All selected' : 'Not All Selected'}`;
        insertGscEnquiryLog && insertGscEnquiryLog(name, '');
    }

    chtOnChange = (type, event) => {
        let { valMap, updateState, insertGscEnquiryLog } = this.props;
        let enquiryMap = valMap;
        if (enquiryMap.size > 0) {
            for (let valObj of enquiryMap.values()) {
                if (type == 'chtRslt' && valObj.chtScrnRsltInput) {
                    valObj.chtRsltDrowdown = event;
                    valObj.operationType = 'U';
                } else if (type == 'chkChtRslt' && valObj.chkChtRsltEditable) {
                    valObj.chkChtRslt = event;
                    valObj.operationType = 'U';
                }
            }
            updateState && updateState({ valMap, isEdit: true });
        }
        let name = `Action: ${type} Select favourite category: ${event} in drop-down list`;
        insertGscEnquiryLog && insertGscEnquiryLog(name, '');
    }

    gpdOnChange = (type, event) => {
        let { valMap, updateState, insertGscEnquiryLog } = this.props;
        let enquiryMap = valMap;
        if (enquiryMap.size > 0) {
            for (let valObj of enquiryMap.values()) {
                if (type == 'g6pdRslt' && valObj.g6pdScrnRsltInput) {
                    valObj.g6pdRsltDrowdown = event;
                    valObj.operationType = 'U';
                } else if (type == 'chkG6pdRslt' && valObj.chkG6pdRsltEditable) {
                    valObj.chkG6pdRslt = event;
                    valObj.operationType = 'U';
                }
            }
            updateState && updateState({ valMap, isEdit: true });
        }
        let name = `Action: ${type} Select favourite category: ${event} in drop-down list`;
        insertGscEnquiryLog && insertGscEnquiryLog(name, '');
    }

    getEnquiryTableData = () => {
        let { tableList, valMap, tabCHTDrop, tabG6PDDrop, updateState, dropList, insertGscEnquiryLog } = this.props;
        let { selectedRowId, selectedRowDoc, dropListName } = this.state;

        return tableList.map((item, index) => {
            let commonProps = {
                valMap,
                updateState,
                itemId: `${item.diagnosis}_${item.clcCgsNeonatalScrnId}`,
                insertGscEnquiryLog
            };
            let resultDropList = dropListName[item.diagnosis] || [];
            let screeningVal = item.diagnosis === 'G6PD' ? item.g6pdSts : item.chtSts;
            return {
                ...item,
                dataKey: index,
                docStsLabel: dropList.docStatusDrop?.find(doc => doc.value === item.docSts)?.title || '',
                resultDropList,
                tempObj: resultDropList.find((elements, i) => { return item.rslt === elements.value; }),
                currentRowFlag: selectedRowId === item.clcCgsNeonatalScrnId && item.diagnosis === selectedRowDoc ? true : false,
                failCntctProps: {
                    val: item.failCntct,
                    attrName: 'failCntct',
                    ...commonProps
                },
                chtRsltProps: {
                    maxWidth: 150,
                    minWidth: 149,
                    val: item.chtRsltDrowdown,
                    attrName: 'chtRsltDrowdown',
                    options: tabCHTDrop,
                    ...commonProps
                },
                g6pdRsltProps: {
                    maxWidth: 110,
                    minWidth: 109,
                    val: item.g6pdRsltDrowdown,
                    attrName: 'g6pdRsltDrowdown',
                    options: tabG6PDDrop,
                    ...commonProps
                },
                chkChtRsltProps: {
                    maxWidth: 150,
                    minWidth: 149,
                    val: item.chkChtRslt,
                    attrName: 'chkChtRslt',
                    options: tabCHTDrop,
                    ...commonProps
                },
                chkG6pdRsltProps: {
                    maxWidth: 110,
                    minWidth: 109,
                    val: item.chkG6pdRslt,
                    attrName: 'chkG6pdRslt',
                    options: tabG6PDDrop,
                    ...commonProps
                },
                screeningVal,
                screeningLabel: dropList.screeningDrop?.find(obj => obj.value === screeningVal)?.title || '',
                chkChtRsltLabel: item.chkChtRslt && tabCHTDrop?.find(obj => obj.value === item.chkChtRslt)?.title || '',
                chkG6pdRsltLabel: item.chkG6pdRslt && tabG6PDDrop?.find(obj => obj.value === item.chkG6pdRslt)?.title || ''
            };
        });
    }

    freshData = () => {
        this.gridApi.refreshCells({ force: true });
    }

    render() {
        const { classes, tabCHTDrop, tabG6PDDrop } = this.props;
        const { gspdReviewVal, chtScreeningValue, gspdScreeningValue, chtReviewVal } = this.state;
        let enquiryTableData = this.getEnquiryTableData();
        return (
            <CIMSDataGrid
                ref={this.tableRef}
                gridTheme="ag-theme-balham"
                divStyle={{
                    width: '100%',
                    display: 'block'
                }}
                suppressGoToRow
                suppressDisplayTotal
                gridOptions={{
                    enableBrowserTooltips: true,
                    frameworkComponents: {
                        contactHeader: () => {
                           return (
                               <div style={{
                                    wordWrap: 'break-word',
                                    whiteSpace: 'normal'
                               }}
                               >
                                   Unsuccessful Contact
                                   <Checkbox
                                    //    checked={contactCheckedFlag}
                                       color="primary"
                                       onChange={this.onCheckBoxAllClick}
                                       style={{ padding: '0 4px' }}
                                       id={'checkbox_all'}
                                   />
                               </div>
                           );
                        },
                        chtReviewHeader: () => {
                            return (<div>
                                <div>CHT Review</div>
                                <SelectBox
                                    id="gpdSelect"
                                    width={154}
                                    height={30}
                                    options={tabCHTDrop}
                                    value={chtReviewVal}
                                    onChange={(e) => this.chtOnChange('chkChtRslt', e)}
                                />
                            </div>);
                        },
                        g6pdReviewHeader: () => {
                            return (<div>
                                <div>G6PD Review</div>
                                <SelectBox
                                    id="gpdSelectReview"
                                    width={130}
                                    height={30}
                                    options={tabG6PDDrop}
                                    value={gspdReviewVal}
                                    onChange={(e) => this.gpdOnChange('chkG6pdRslt', e)}
                                />
                            </div>);
                        },
                        g6pdScreeningHeader: () => {
                            return (<div>
                                <div>G6PD Screening</div>
                                <SelectBox
                                    id="gpdSelect"
                                    width={130}
                                    height={30}
                                    options={tabG6PDDrop}
                                    value={gspdScreeningValue}
                                    onChange={(e) => this.gpdOnChange('g6pdRslt', e)}
                                />
                            </div>);
                        },
                        chtScreeningHeader: () => {
                            return (<div>
                                <div>CHT Screening</div>
                                <SelectBox
                                    id="chtScreening"
                                    width={154}
                                    height={30}
                                    options={tabCHTDrop}
                                    value={chtScreeningValue}
                                    onChange={(e) => this.chtOnChange('chtRslt', e)}
                                />
                            </div>);
                        },
                        reportCellRenderer: ({ data }) => {
                            return (data.ioeReportId > 0 ?
                                <div style={{ textAlign: 'center', paddingTop: 8,  cursor: 'pointer' }}>
                                    <img src={icon_report} alt="" style={{ width: 26, height: 26 }}
                                        onClick={() => { this.handleReportAndClinicalDocClick('report', data); }}
                                    />
                                </div>
                                : null);
                        },
                        clinicDrRenderer: ({ data }) => {
                            return (
                                data.clcNeonatalDocId > 0 ?
                                <div style={{ textAlign: 'center', paddingTop: 8, cursor: 'pointer' }}>
                                    <img src={icon_doc} alt="" style={{ width: 26, height: 26 }}
                                        onClick={() => { this.handleReportAndClinicalDocClick('clinicalDoc', data); }}
                                    />
                                </div>
                                : ''
                            );
                        },
                        contactRenderer: ({ data }) => {
                            return <CheckBoxResult {...data.failCntctProps}/>;
                        },
                        g6pdScreeningRenderer: ({ data }) => {
                            return data.g6pdScrnRsltInput ? <TableSelect {...data.g6pdRsltProps} /> : '';
                        },
                        chtScreeningRenderer: ({ data }) => {
                            return data.chtScrnRsltInput ? <TableSelect {...data.chtRsltProps} /> : '';
                        },
                        chtReviewRenderer: ({ data }) => {
                            return (
                                data.chkChtRsltEditable ? <TableSelect {...data.chkChtRsltProps} /> : data.chkChtRsltLabel
                            );
                        },
                        g6pdReviewRenderer: ({ data }) => {
                            return (
                                data.chkG6pdRsltEditable ? <TableSelect {...data.chkG6pdRsltProps} /> : data.chkG6pdRsltLabel
                            );
                        }
                    },
                    columnDefs: [
                        {
                            headerName: 'Amended',
                            field: 'isAmended',
                            filter: false,
                            minWidth: 105,
                            maxWidth: 105,
                            valueGetter: ({data}) => data.isAmended ? 'Y' : '',
                            tooltipValueGetter: ({data}) => data.isAmended ? 'Y' : ''
                        },
                        {
                            headerName: 'Report Record Date',
                            field: 'rptRcvDatetime',
                            filter: false,
                            minWidth: 141,
                            maxWidth: 141,
                            comparator: (a, b) => {
                                a = a ? moment(a, Enum.DATE_FORMAT_EDMY_VALUE).valueOf() : '';
                                b = b ? moment(b, Enum.DATE_FORMAT_EDMY_VALUE).valueOf() : '';
                                return a - b;
                            },
                            tooltipValueGetter: ({ data }) => data.rptRcvDatetime ? moment(data.rptRcvDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE) : '',
                            valueGetter: ({ data }) => data.rptRcvDatetime ? moment(data.rptRcvDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''
                        },
                        {
                            headerName: 'Report',
                            field: 'ioeReportId',
                            filter: false,
                            minWidth: 78,
                            maxWidth: 78,
                            sortable: false,
                            tooltipValueGetter: (params) => params.value,
                            cellRenderer: 'reportCellRenderer'
                        },
                        {
                            headerName: 'Ref No.',
                            field: 'refNum',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            minWidth: 102,
                            maxWidth: 102
                        },
                        {
                            headerName: 'Baby Name',
                            field: 'babyName',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            minWidth: 189,
                            maxWidth: 189
                        },
                        {
                            headerName: 'Sex',
                            field: 'babySex',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            minWidth: 89,
                            maxWidth: 89
                        },
                        {
                            headerName: 'Baby DOB',
                            field: 'babyDob',
                            filter: false,
                            comparator: (a, b) => {
                                a = a ? moment(a, Enum.DATE_FORMAT_EDMY_VALUE).valueOf() : '';
                                b = b ? moment(b, Enum.DATE_FORMAT_EDMY_VALUE).valueOf() : '';
                                return a - b;
                            },
                            tooltipValueGetter: ({ data }) => data.babyDob ? moment(data.babyDob).format(Enum.DATE_FORMAT_EDMY_VALUE) : '',
                            minWidth: 125,
                            maxWidth: 125,
                            valueGetter: ({ data }) => data.babyDob ? moment(data.babyDob).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''
                        },
                        {
                            headerName: 'Lab No.',
                            field: 'labNum',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            minWidth: 119,
                            maxWidth: 119
                        },
                        {
                            headerName: 'Clinical Doc.',
                            field: 'clcNeonatalDocId',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            comparator: (a, b) => !!a - !!b,
                            minWidth: 97,
                            maxWidth: 97,
                            cellRenderer: 'clinicDrRenderer'
                        },
                        {
                            headerName: 'Place of Birth',
                            field: 'birthplaceCod',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            minWidth: 154,
                            maxWidth: 154
                        },
                        {
                            headerName: 'Screening',
                            field: 'screeningLabel',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            minWidth: 118,
                            maxWidth: 118
                        },
                        {
                            headerName: 'Dx',
                            field: 'diagnosis',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            minWidth: 104,
                            maxWidth: 104
                        },
                        {
                            headerName: 'Result',
                            field: 'tempObj',
                            filter: false,
                            tooltipValueGetter: ({ data }) => data.tempObj ? data.tempObj?.title : data?.rslt,
                            minWidth: 149,
                            maxWidth: 149,
                            valueGetter: ({ data }) => data.tempObj ? data.tempObj?.title : data?.rslt
                        },
                        {
                            headerName: 'Date Collected',
                            field: 'dateCollected',
                            filter: false,
                            tooltipValueGetter: ({ data }) => data.dateCollected ? moment(data.dateCollected).format(Enum.DATE_FORMAT_EDMY_VALUE) : '',
                            minWidth: 129,
                            maxWidth: 129,
                            comparator: (a, b) => {
                                a = a ? moment(a, Enum.DATE_FORMAT_EDMY_VALUE).valueOf() : '';
                                b = b ? moment(b, Enum.DATE_FORMAT_EDMY_VALUE).valueOf() : '';
                                return a - b;
                            },
                            valueGetter: ({ data }) => data.dateCollected ? moment(data.dateCollected).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''
                        },
                        {
                            headerName: 'Doc. Status',
                            field: 'docStsLabel',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            minWidth: 164,
                            maxWidth: 164
                        },
                        {
                            headerName: 'Unsuccessful Contact',
                            field: '',
                            filter: false,
                            sortable: false,
                            minWidth: 130,
                            maxWidth: 130,
                            cellRenderer: 'contactRenderer',
                            headerComponent: 'contactHeader'
                        },
                        {
                            headerName: 'PMI',
                            field: 'displayPatientKey',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            minWidth: 126,
                            maxWidth: 126
                        },
                        {
                            headerName: 'CHT Screening',
                            field: '',
                            filter: false,
                            minWidth: 177,
                            maxWidth: 177,
                            sortable: false,
                            headerComponent: 'chtScreeningHeader',
                            cellRenderer: 'chtScreeningRenderer'
                        },
                        {
                            headerName: 'G6PD Screening',
                            field: '',
                            filter: false,
                            minWidth: 155,
                            maxWidth: 155,
                            sortable: false,
                            headerComponent: 'g6pdScreeningHeader',
                            cellRenderer: 'g6pdScreeningRenderer'
                        },
                        {
                            headerName: 'CHT TSH (mlU/L) (Normal: <=14.29)',
                            field: 'tshTestRslt',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            minWidth: 181,
                            maxWidth: 181,
                            comparator: (a, b) => toNumber(a) - toNumber(b)
                        },
                        {
                            headerName: 'CHT FT4 (pmol/L) (Normal: 10.25-16.32)',
                            field: 'ft4TestRslt',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            minWidth: 181,
                            maxWidth: 181,
                            comparator: (a, b) => toNumber(a) - toNumber(b)
                        },
                        {
                            headerName: 'CHT T3',
                            field: 't3TestRslt',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            minWidth: 109,
                            maxWidth: 109,
                            comparator: (a, b) => toNumber(a) - toNumber(b)
                        },
                        {
                            headerName: 'G6PD (U/g Hb)',
                            field: 'g6pdTestRslt',
                            filter: false,
                            tooltipValueGetter: (params) => params.value,
                            minWidth: 108,
                            maxWidth: 108,
                            comparator: (a, b) => toNumber(a) - toNumber(b)
                        },
                        {
                            headerName: 'CHT Review',
                            field: '',
                            filter: false,
                            minWidth: 177,
                            maxWidth: 177,
                            sortable: false,
                            cellRenderer: 'chtReviewRenderer',
                            headerComponent: 'chtReviewHeader'
                        },
                        {
                            headerName: 'G6PD Review',
                            field: '',
                            filter: false,
                            minWidth: 155,
                            maxWidth: 155,
                            sortable: false,
                            cellRenderer: 'g6pdReviewRenderer',
                            headerComponent: 'g6pdReviewHeader'
                        }
                    ],
                    rowData: enquiryTableData || [],
                    overlayNoRowsTemplate: '<span style="padding-top: 52px">There is no data.</span>',
                    getRowNodeId: item => item.dataKey + '',
                    onRowDoubleClicked: () => {},
                    onRowClicked: ({ data }) => {
                        this.handleRowClick(data.clcCgsNeonatalScrnId, data.diagnosis);
                    },
                    headerHeight: 52,
                    rowHeight: 52,
                    suppressCellSelection: true,
                    onGridReady: (params) => {
                        this.gridApi = params.api;
                    },
                    postSort: rowNodes => {
                        let rowNode = rowNodes[0];
                        if (rowNode) {
                            setTimeout((rowNode) => {
                                rowNode.gridApi.refreshCells();
                            }, 100, rowNode);
                        }
                    }
                }}
            ></CIMSDataGrid>
        );
    }
}

export default withStyles(styles)(GscEnquiryTable);
