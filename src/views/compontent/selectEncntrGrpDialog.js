import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import CIMSPromptDialog from '../../components/Dialog/CIMSPromptDialog';
import CIMSDataGrid from '../../components/Grid/CIMSDataGrid';
import Enum from '../../enums/enum';
import { auditAction } from '../../store/actions/als/logAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import { forceRefreshCells } from '../../utilities/commonUtilities';
import { updateState } from '../../store/actions/caseNo/caseNoAction';
import { caseSts } from '../../enums/anSvcID/anSvcIDEnum';
import { getAliasRule } from '../../utilities/anSvcIdUtilities';
import { genPMICaseNoAction } from '../../utilities/caseNoUtilities';


const styles = theme => ({
    paper: {
        width: '55%'
        //height: 640
    },
    itemPadding: {
        padding: '12px 8px'
    },
    sectionTitle: {
        padding: '0px 8px',
        color: theme.palette.primaryColor
    },
    titleTxt: {
        fontWeight: 'bold'
    }
});



class SelectEncntrGrpDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //encntrGrpList: [],
            curSelectEncntrGrp: null
        };
    }
    componentDidMount() {
    }


    genDialogContent = (id) => {
        const { encntrGrpList } = this.props;
        return (
            <Grid container id={id}>
                <CIMSDataGrid
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '100%',
                        height: '450px',
                        display: 'block'
                    }}
                    gridOptions={{
                        rowHeight: 50,
                        columnDefs: [
                            {
                                headerName: '',
                                colId: 'index',
                                valueGetter: params => params.node.rowIndex + 1,
                                minWidth: 60,
                                maxWidth: 60,
                                pinned: 'left',
                                filter: false
                            },
                            {
                                headerName: 'Encounter Group',
                                field: 'encntrGrpCd',
                                minWidth: 210,
                                //maxWidth: 200,
                                width: 210,
                                tooltipValueGetter: (params) => params.value
                                //valueGetter: params => params.data.apptDatetime && moment(params.data.apptDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE)
                            },
                            {
                                headerName: 'Encounter Group Description',
                                field: 'encntrGrpDesc',
                                minWidth: 698,
                                //maxWidth: 310,
                                width: 698,
                                tooltipValueGetter: (params) => params.value
                                //valueGetter: params => params.data.apptDatetime && moment(params.data.apptDatetime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)
                            }
                        ],
                        rowData: encntrGrpList,
                        getRowNodeId: data => data.encntrGrpCd,
                        suppressRowClickSelection: false,
                        enableBrowserTooltips: true,
                        rowSelection: 'single',
                        onRowClicked: () => { },
                        onSelectionChanged: params => {
                            if (params) {
                                const selectedRows = params.api.getSelectedRows();
                                this.setState({
                                    curSelectEncntrGrp: selectedRows.length > 0 ? selectedRows[0] : null
                                });
                            }
                        },
                        onRowDoubleClicked: params => {
                            if (params) {
                                this.confirmSelectEnctGrp(params.data);
                            }
                        },
                        postSort: rowNodes => forceRefreshCells(rowNodes, ['index'])
                    }}
                    suppressGoToRow
                    suppressDisplayTotal
                />
            </Grid>

        );
    };

    confirmSelectEnctGrp = (encntrGrp) => {
        const { antSvcInfo, aliasRule, patientInfo } = this.props;
        const { encntrGrpCd } = encntrGrp;
        const genCaseNoAction = genPMICaseNoAction(patientInfo);
        let hasSameGrpInfo = false;
        if (genCaseNoAction === Enum.CASE_NO_GEN_ACTION.FHS_GEN_CASE) {
            hasSameGrpInfo = antSvcInfo && antSvcInfo.clcAntFullList && antSvcInfo.clcAntFullList.some(x => x.sts === caseSts.ACTIVE && x.encntrGrp === encntrGrpCd);
        }
        let rule = getAliasRule(aliasRule, encntrGrp);

        if (hasSameGrpInfo) {
            this.props.openCommonMessage({
                msgCode: '110157'
            });
        } else if (!rule) {
            this.props.openCommonMessage({
                msgCode: '110166'
            });
        } else {
            new Promise((resolve) => {
                this.props.updateState({ encntrGrp: encntrGrp });
                resolve();
            }).then(() => {
                this.props.confirmCallback();
            });
        }
    }

    render() {
        const { classes, open } = this.props;
        const { curSelectEncntrGrp } = this.state;
        const id = 'select_encounter_group_dialog';
        return (
            <Grid container>
                <CIMSPromptDialog
                    id={id}
                    open={open}
                    dialogTitle={'Select Encounter Group'}
                    classes={{
                        paper: classes.paper
                    }}
                    dialogContentText={this.genDialogContent()}
                    buttonConfig={
                        [
                            {
                                id: id + '_okBtn',
                                name: 'OK',
                                onClick: () => {
                                    this.props.auditAction('Click Select Encounter Group Dialog Ok Button', null, null, false, 'patient');
                                    this.confirmSelectEnctGrp(this.state.curSelectEncntrGrp);
                                },
                                disabled: curSelectEncntrGrp === null
                            },
                            {
                                id: id + '_backBtn',
                                name: 'Cancel',
                                onClick: () => {
                                    this.props.auditAction('Close Select Encounter Group Dialog', null, null, false, 'patient');
                                    this.setState({ curSelectEncntrGrp: null });
                                    this.props.closeDialog();
                                }
                            }
                        ]
                    }
                />
            </Grid>
        );
    }

}

const mapState = (state) => {
    return ({
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        antSvcInfo: state.patient.patientInfo.antSvcInfo,
        encntrGrpList: state.caseNo.encntrGrpList,
        aliasRule: state.caseNo.aliasRule,
        patientInfo: state.patient.patientInfo,
        caseNoInfo: state.patient.caseNoInfo
    });
};

const dispatch = {
    auditAction,
    openCommonMessage,
    updateState
};


export default connect(mapState, dispatch)(withStyles(styles)(SelectEncntrGrpDialog));