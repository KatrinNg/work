import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import '../../../styles/common/customHeaderStyle.scss';
import Typography from '@material-ui/core/Typography';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import { APPT_TYPE_CODE } from '../../../enums/enum';
import Enum from '../../../enums/enum';
import {getQuotaTypeDescByQuotaType} from '../../../utilities/commonUtilities';
import { getAppointmentSearchCriteria } from '../../../utilities/appointmentUtilities';

const FullWidthSpan = withStyles({ root: { width: '100%' } })(Typography);

class CustomTooltip extends React.Component {
    getReactContainerClasses() {
        return ['custom-tooltip'];
    }

    render() {
        return (
            <Grid id="patientSummary_viewLogTooltip" className="custom-tooltip">
                <FullWidthSpan style={{ fontWeight: 'bold', marginBottom: 8 }}>Appt. Type:</FullWidthSpan>
                <FullWidthSpan>Normal</FullWidthSpan>
                <FullWidthSpan>Re-scheduled</FullWidthSpan>
                <FullWidthSpan>Replaced</FullWidthSpan>
                <FullWidthSpan>Squeeze-In</FullWidthSpan>
                <FullWidthSpan>Urgent Squeeze</FullWidthSpan>
                <FullWidthSpan>Deleted</FullWidthSpan>
            </Grid>
        );
    }
}

const ApptAssociationConfirmDialog = (props) => {
    const idPrefix = 'patientSummary_viewLogDialog';
    const { open, rowData, deleteReasonsList, quotaConfig, svcCd } = props;

    React.useEffect(() => {
        if (open) {
            props.getViewLogList();
        }
    }, [open]);

    let column = [
        {
            field: 'apptDtm',
            headerName: 'Appt. Date',
            width: 150,
            valueFormatter: params => moment(params.value).isValid() ? moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''
        },
        {
            field: 'stime',
            headerName: 'Time',
            width: 150,
            valueFormatter: (params) => {
                let startTime = params.data.stime || '';
                let endTime = params.data.etime || '';
                if (endTime) {
                    return `${startTime} - ${endTime}`;
                } else {
                    return startTime;
                }

            }
        },
        { field: 'siteDesc', headerName: 'Site', width: 200 },
        { field: 'encntrTypeDesc', headerName: 'Enc. Type', width: 150 },
        { field: 'rmDesc', headerName: 'Room', width: 150 },
        {
            field: 'qtType',
            headerName: 'Quota Type',
            width: 130,
            valueFormatter: params => getQuotaTypeDescByQuotaType(quotaConfig, params.value)
        },
        {
            field: 'apptType',
            headerName: 'Appt. Type',
            width: 150,
            headerTooltip: 'Appt. Type',
            tooltipComponent: 'customTooltip'
            // valueFormatter: (params) => {
            //     let appType = '';
            //     if (params.data.apptTypeCd === APPT_TYPE_CODE.RE_SCHEDULED.code) {
            //         appType = APPT_TYPE_CODE.RE_SCHEDULED.engDesc;
            //     } else if (params.data.apptTypeCd === APPT_TYPE_CODE.NORMAL.code) {
            //         appType = APPT_TYPE_CODE.NORMAL.engDesc;
            //     } else if (params.data.apptTypeCd === APPT_TYPE_CODE.REPLACED.code) {
            //         appType = APPT_TYPE_CODE.REPLACED.engDesc;
            //     } else if (params.data.apptTypeCd === APPT_TYPE_CODE.DELETED.code) {
            //         appType = APPT_TYPE_CODE.DELETED.engDesc;
            //     }

            //     if (params.data.apptTypeCd !== APPT_TYPE_CODE.DELETED.code) {
            //         if (params.data.isSqueeze === 1) {
            //             appType = 'Squeeze-In';
            //         }
            //         if (params.data.isSqueeze === 1 && params.data.isUrgSqueeze === 1) {
            //             appType = 'Urgent Squeeze';
            //         }
            //     }
            //     return appType;
            // }
        },
        {
            field: 'deleteReason',
            headerName: 'Delete Reason',
            width: 160,
            valueFormatter: (params) => {
                const deleteReason = deleteReasonsList && deleteReasonsList.find(x => params.value && x.rsnTypeId === parseInt(params.value));
                return deleteReason && deleteReason.rsnDesc;
            }
        },
        { field: 'deleteRemark', headerName: 'Delete Remark', width: 175, maxWidth: 400 },
        {
            field: 'preApptDtm', headerName: 'Previous Appt. Date', width: 215, maxWidth: 400,
            valueFormatter: (params) => {
                return params.value && moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE) || '';
            }
        },
        { field: 'preEncntrTypeDesc', headerName: 'Previous Enc. Type', width: 215, maxWidth: 400 },
        {
            field: 'updateOn',
            headerName: 'Updated On',
            width: 170,
            valueFormatter: params => moment(params.value).format(Enum.DATE_FORMAT_24_HOUR)
        },
        { field: 'updateBy', headerName: 'Updated By', width: 160 }
    ];
    if (svcCd === 'SHS') {
        column.splice(9, 0, ...[
            {
                field: '', headerName: 'Search Criteria', minWidth: 245,
                valueGetter: (params) => {
                    return getAppointmentSearchCriteria(params.data.searchCriteria);
                },
                tooltipValueGetter: (params) => params.value,
                cellRenderer: 'searchCriteriaRenderer'
            }
        ]);
    }


    const searchCriteriaRenderer = (params) => {
        const searchCriteria = getAppointmentSearchCriteria(params.data.searchCriteria);
        let splitArr = searchCriteria.split('; ');
        return (
            <Grid container>
                {splitArr.map((data, idx) => {
                    return (
                        <Grid container key={idx}>
                            {`${data.trim()}${idx !== splitArr.length - 1 ? ';' : ''}`}
                        </Grid>
                    );
                })}
            </Grid>
        );
    };

    return (
        <Grid>
            <CIMSPromptDialog
                open={open}
                id={idPrefix}
                dialogTitle={'View Log'}
                dialogContentText={
                    <Grid>
                        <CIMSDataGrid
                            disableAutoSize
                            gridTheme="ag-theme-balham"
                            divStyle={{
                                width: '87vw',
                                height: '55vh',
                                display: 'block',
                                paddingBottom: 8
                            }}
                            gridOptions={{
                                columnDefs: column,
                                rowData: rowData,
                                rowSelection: 'single',
                                getRowHeight: () => 50,
                                getRowNodeId: item => item.rowId.toString(),
                                suppressRowClickSelection: true,
                                frameworkComponents: { customTooltip: CustomTooltip,searchCriteriaRenderer:searchCriteriaRenderer },
                                tooltipShowDelay: 0,
                                enableBrowserTooltips: true
                            }}
                            suppressGoToRow
                            suppressDisplayTotal
                        />
                    </Grid>
                }
                buttonConfig={[
                    {
                        id: `${idPrefix}_closeBtn`,
                        name: 'Close',
                        onClick: () => { props.onClose(); }
                    }
                ]}
            />
        </Grid>
    );
};

export default ApptAssociationConfirmDialog;