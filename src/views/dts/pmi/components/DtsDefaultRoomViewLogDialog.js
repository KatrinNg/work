import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import { updateState } from '../../../../store/actions/dts/patient/DtsDefaultRoomAction';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import moment from 'moment';
import Enum from '../../../../enums/enum';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';

const styles = theme => ({
    dialogPaper: {
        width: '1655px',
        overflow: 'hidden'
    },
    tipRoot: {
        color: theme.palette.primary.main,
        margin: 10
    },
    grid: {
        paddingTop: 10,
        paddingBottom: 10
    }
});

class DtsDefaultRoomViewLogDialog extends Component {
    handleClose = () => {
        this.props.updateState({ dialogViewLogOpen: false, dialogViewLogName: '' });
    };

    render() {
        const { classes, open, specialties, rooms, clinicList, defaultRoomLogList } = this.props;
        const idConstant = this.props.id + '_viewLogDefaultRoom';

        let columnDefs = [
            {
                headerName: 'Discipline',
                field: 'specialtyId',
                colId: 'specialtyId',
                width: 220,
                valueGetter: params => {
                    let specialtyObj = this.props.specialties.find(item => item.sspecId === params.data.specialtyId);
                    return specialtyObj && specialtyObj.sspecName;
                }
            },
            {
                headerName: 'Location',
                field: 'roomId',
                colId: 'roomId',
                width: 600,
                valueGetter: params => {
                    let roomObj = this.props.rooms.find(item => item.rmId === params.data.roomId);
                    let clinicObj = this.props.clinicList.find(item => item.siteId === roomObj.siteId);
                    return roomObj && clinicObj && roomObj.rmCd + ', ' + clinicObj.siteName;
                }
            },
            {
                headerName: 'Referral',
                field: 'isReferral',
                colId: 'isReferral',
                width: 100,
                valueGetter: params => {
                    return params.data.isReferral === 1 ? 'Yes' : 'No';
                }
            },
            {
                headerName: 'Discharged',
                field: 'isDischarged',
                colId: 'isDischarged',
                width: 130,
                valueGetter: params => {
                    return params.data.isDischarged === 1 ? 'Yes' : 'No';
                }
            },
            {
                headerName: 'Update On',
                field: 'updateDtm',
                colId: 'updateDtm',
                width: 130,
                valueGetter: params => {
                    return moment(params.data.updateDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
                }
            },
            {
                headerName: 'Update By',
                field: 'updateBy',
                colId: 'updateBy',
                width: 250
            },
            {
                headerName: 'Record Status',
                field: 'status',
                colId: 'status',
                width: 150,
                valueFormatter: params => {
                    switch (params.data.status) {
                        case 'C':
                            return 'Current';
                        case 'R':
                            return 'Updated';
                        case 'A':
                            return 'Abondant';
                        case 'D':
                            return 'Deleted';
                    }
                }
            }
        ];

        return (
            <CIMSPromptDialog
                id={idConstant}
                dialogTitle="View Log"
                open={open}
                classes={{
                    paper: classes.dialogPaper
                }}
                dialogContentText={
                    <Grid container spacing={2} className={classes.grid}>
                        <CIMSDataGrid
                            disableAutoSize
                            gridTheme="ag-theme-balham"
                            divStyle={{
                                width: '100%',
                                height: '30vh',
                                display: 'block'
                            }}
                            gridOptions={{
                                defaultColDef: {
                                    filter: false,
                                    lockVisible: true,
                                    sortable: false,
                                    resizable: true
                                    //tooltipValueGetter: params => params.value
                                },
                                columnDefs: columnDefs,
                                rowData: defaultRoomLogList,
                                rowSelection: 'single',
                                getRowHeight: () => 50,
                                getRowNodeId: item => item.defaultRoomId,
                                suppressRowClickSelection: true //,
                                // tooltipShowDelay: 0
                            }}
                            suppressGoToRow
                            suppressDisplayTotal
                        />
                    </Grid>
                }
                buttonConfig={[
                    {
                        id: `${idConstant}_closeBtn`,
                        name: 'Close',
                        onClick: () => {
                            this.handleClose();
                        }
                    }
                ]}
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        currentSelectedId: state.dtsDefaultRoom.currentSelectedId,
        specialties: state.dtsPreloadData.allSpecialties,
        defaultRoomLogList: state.dtsDefaultRoom.defaultRoomLogList,
        rooms: state.common.rooms,
        clinicList: state.common.clinicList,
        serviceCd: state.login.service.serviceCd
    };
}

const mapDispatchToProps = {
    updateState
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsDefaultRoomViewLogDialog));
