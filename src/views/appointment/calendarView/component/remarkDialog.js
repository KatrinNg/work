import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { Link, Typography } from '@material-ui/core';
import AutoScrollTable from '../../../../components/Table/AutoScrollTable';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import moment from 'moment';
import Enum from '../../../../enums/enum';
import * as CommonUtilities from '../../../../utilities/commonUtilities';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import * as patientUtilities from '../../../../utilities/patientUtilities';

const styles = () => ({
    root: {
        minHeight: 300,
        maxHeight: 400,
        overflowY: 'auto',
        overflowX: 'hidden'
    },
    slotRemarks: {
        flex: 1,
        width: '100%',
        marginBottom: 6,
        '& .remark': {
            background: 'rgb(208, 240, 251)',
            borderLeft: '6px solid #a6d1f5',
            marginBottom: 4,
            paddingLeft: 6,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            padding: 5
        },
        '& .remark:last-child': {
            marginBottom: 0
        }
    },
    paper: {
        minWidth: 300,
        maxWidth: '100%',
        borderRadius: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.08)'
    },
    maleRoot: {
        backgroundColor: '#d1eefc'
    },
    femaleRoot: {
        backgroundColor: '#fedeed'
    },
    unknownSexRoot: {
        backgroundColor: '#f8d186'
    },
    deadRoot: {
        backgroundColor: '#404040',
        color: '#fff'
    },
    anonymousRoot: {
        backgroundColor: '#fff'
    }
});

class CellRenderer extends Component {
    constructor(props) {
        super(props);
        props.eParentOfValue.style.width = '100%';
    }
    handleOpenPatientSummary = (e, data) => {
        e.preventDefault();
        this.props.openPatientSummary(data);
        this.props.onClose();
    }

    render() {

        const { data, onClose, openPatientSummary } = this.props;
        // let name = data.engGivenName + data.engSurname;
        let name = CommonUtilities.getFullName(data.engSurname, data.engGivenName);
        let viewOnly = this.props.viewOnly();
        return viewOnly ? <Typography>{name}</Typography> : (<Link href="#" onClick={(e) => { this.handleOpenPatientSummary(e, data); }} >{name}</Link>);
    }
}

class RemarkDialog extends Component {
    constructor(props) {
        super(props);
        let columnDefs = [];
        let colDefs = [
            {
                headerName: 'Appt. Date/Time', field: 'stime', width: 179,
                valueFormatter: this.apptDateTimeGetter,
                tooltipValueGetter: this.apptDateTimeGetter
            },
            {
                headerName: 'Doc. No.', colId: 'docNo', width: 200,
                valueGetter: this.docNoGetter,
                tooltipValueGetter: this.docNoGetter
            },
            {
                headerName: 'Name', colId: 'Name', width: 250, cellRenderer: 'cellRenderer',
                cellClass: (params) => {
                    const data = params.data;
                    let genderClass = this.props.classes.anonymousRoot;
                    if (data.dod && data.dod !== null) {
                        genderClass = this.props.classes.deadRoot;
                    } else if (data.genderCd) {
                        switch (data.genderCd) {
                            case Enum.GENDER_MALE_VALUE:
                                genderClass = this.props.classes.maleRoot;
                                break;
                            case Enum.GENDER_FEMALE_VALUE:
                                genderClass = this.props.classes.femaleRoot;
                                break;
                            case Enum.GENDER_UNKNOWN_VALUE:
                                genderClass = this.props.classes.unknownSexRoot;
                                break;
                            default:
                                genderClass = this.props.classes.anonymousRoot;
                                break;
                        }
                    }
                    return genderClass;
                },
                valueGetter: this.nameGetter,
                tooltipValueGetter: this.nameGetter,
                cellRendererParams: {
                    openPatientSummary: props.openPatientSummary,
                    onClose: props.onClose,
                    viewOnly: this.isViewOnly
                }
            },
            {
                headerName: 'Phone', field: 'phoneNo', width: 200,
                valueGetter: this.phoneGetter,
                tooltipValueGetter: this.phoneGetter
            },
            {
                headerName: 'By User', field: 'userEngGivenName', width: 250,
                valueGetter: this.byUserGetter,
                tooltipValueGetter: this.byUserGetter
            },
            { headerName: 'Remark/Memo', field: 'appointmentMemo', width: 350 }
        ];
        for (let i = 0; i < colDefs.length; i++) {
            // colDefs[i].maxWidth = colDefs[i].width;
            // colDefs[i].minWidth = colDefs[i].width;
            colDefs[i].cellStyle = { whiteSpace: 'pre-line' };
        }
        columnDefs = columnDefs.concat(colDefs);
        this.state = {
            serviceCd: '',
            columnDefs: columnDefs
        };
        this.refGrid = React.createRef();
    }

    apptDateTimeGetter = (params) => {
        let time = params.value.format(Enum.DATE_FORMAT_24_HOUR);
        return time;
    }

    docNoGetter = (params) => {
        const data = params.data;
        if (data.docNo && data.docTypeCd) {
            let documentPair = null;
            documentPair = {
                docTypeCd: data.docTypeCd,
                docNo: data.docNo
            };
            return patientUtilities.getFormatDocNoByDocumentPair(documentPair);
        } else {
            return null;
        }
    }

    nameGetter = (params) => {
        const data = params.data;
        return CommonUtilities.getFullName(data.engSurname, data.engGivenName);
    }

    phoneGetter = (params) => {
        return CommonUtilities.getFormatPhone(this.props.countryList, params.data);
    }

    byUserGetter = (params) => {
        const data = params.data;
        return CommonUtilities.getFullName(data.userEngSurname, data.userEngGivenName);
    }

    changeToDialingCd = (countryCd) => {
        const country = this.props.countryList.find(item => item.countryCd === countryCd);
        return (country && country.dialingCd) || '';
    }

    onHover = (e, action, remark) => {
        if (typeof this.props.remarkHover === 'function') {
            this.props.remarkHover(e, this.props.rowData, action, remark);
        }
    };

    isViewOnly = () => {
        return this.props.viewOnly;
    }

    render() {
        const { id, open, remarkStore, onClose, openPatientSummary } = this.props; //let remarkStore1 = [
        return (
            <CIMSPromptDialog
                paperStyl={this.props.classes.paper}
                id={id}
                open={open}
                dialogTitle="Calendar View Detail"
                onClose={(e) => { onClose(e); }}
                dialogContentText={
                    <CIMSDataGrid
                        ref={this.refGrid}
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '75vw',
                            height: '60vh',
                            display: 'block'
                        }}
                        gridOptions={{
                            columnDefs: this.state.columnDefs,
                            rowData: remarkStore,
                            frameworkComponents: {
                                cellRenderer: CellRenderer
                            },
                            getRowNodeId: function (data) {
                                return data.apptId;
                            },
                            // defaultColDef: { autoHeight: true }
                            getRowHeight: (params) => {
                                let tempDom = document.createElement('span');
                                tempDom.style.cssText = 'visibility:hidden;white-space:pre-line;text-overflow:ellipsis;line-height:26px;font-weight:400;font-size:1rem;padding-bottom:8px;padding-top:8px';
                                tempDom.innerHTML = params.data.appointmentMemo || '';
                                document.body.appendChild(tempDom);
                                let height = tempDom.offsetHeight > 50 ? tempDom.offsetHeight : 50;
                                tempDom.remove();
                                return height;
                            }
                        }}
                        suppressGoToRow
                        suppressDisplayTotal
                    />
                }
                buttonConfig={
                    [
                        {
                            id: id + 'CloseButton',
                            name: 'Close',
                            onClick: onClose
                        }
                    ]
                }
            />
        );
    }
}

export default (withStyles(styles)(RemarkDialog));
