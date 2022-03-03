import React from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import { Autorenew } from '@material-ui/icons';
import CIMSDataGrid from '../../components/Grid/CIMSDataGrid';
import DatePicker from '../../components/FormValidator/DateFieldValidator';
import Button from '../../components/Buttons/CIMSButton';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';
import moment from 'moment';
import Enum from '../../enums/enum';
import * as AppointmentUtil from '../../utilities/appointmentUtilities';

const styles = (theme) => ({
    expansionPanelRoot: {
        marginTop: 0,
        marginBottom: 10
    },
    expansionPanelSummaryRoot: {
        backgroundColor: theme.palette.primaryColor,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingLeft: 10
    },
    expansionPanelSummaryIcon: {
        padding: '6px 12px',
        color: '#ffffff',
        marginRight: -19
    },
    expansionPanelSummaryLabel: {
        fontWeight: 'bold',
        color: '#ffffff'
    },
    expansionPanelDetails: {
        backgroundColor: theme.palette.white
    },
    detailContainer: {
        padding: theme.spacing(1)
    },
    button: {
        margin: 0
    }
});

class RoomUtilization extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            slotDate: moment(),
            isShowAvailable: false,
            expanded: false
        };
        this.isFistTimeOpen = true;
    }

    componentDidMount() {
        let slotDate = this.state.slotDate;
        if (this.props.slotDate) {
            slotDate = moment(this.props.slotDate);
            this.setState({ slotDate });
        }

        let where = { serviceCd: this.props.serviceCd, siteId: this.props.siteId };
        let configValue = AppointmentUtil.getQuotaDisplaySiteParams(where);
        if (configValue === 'Booked') {
            this.setState({ isShowAvailable: false });
        } else if (configValue === 'Available') {
            this.setState({ isShowAvailable: true });
        }
    }

    getSlotDate() {
        const { slotDate } = this.state;
        return slotDate && moment(slotDate).isValid() ? moment(slotDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : null;
    }

    getExpandedStatus() {
        return this.state.expanded;
    }

    onDateChange = (e) => {
        this.setState({ slotDate: e });
    }

    onDateAccept = (e) => {
        if (e && moment(e).isValid()) {
            this.props.getRoomUtilization(moment(e).format(Enum.DATE_FORMAT_EYMD_VALUE));
        }
    }

    onClickDate = () => {
        this.setState({ slotDate: moment() });
        this.props.getRoomUtilization(moment().format(Enum.DATE_FORMAT_EYMD_VALUE));
    }

    onChange = (e, expanded) => {
        if (expanded && this.isFistTimeOpen) {
            this.props.getRoomUtilization(moment(this.state.slotDate).format(Enum.DATE_FORMAT_EYMD_VALUE));
            this.isFistTimeOpen = false;
        }
        this.setState({ expanded });
    }

    onDateKeyDown = (e) => {
        if(e && e.keyCode === 13) {
            this.refreshData();
        }
    }

    onClickRefresh = () => {
        this.refreshData();
    }

    refreshData = () => {
        let { slotDate } = this.state;
        if (slotDate && moment(slotDate).isValid()) {
            this.props.getRoomUtilization(moment(slotDate).format(Enum.DATE_FORMAT_EYMD_VALUE));
        }
    }

    render() {
        const {
            classes,
            id,
            rowData,
            defaultExpanded,
            disabled
        } = this.props;

        const {
            slotDate,
            isShowAvailable,
            expanded
        } = this.state;

        let column = AppointmentUtil.processRoomUtilizationColumn(rowData, isShowAvailable);

        let agGridHeight = rowData ? rowData.length * 35 + 52 : 35;

        return (
            <Grid container>
                <ExpansionPanel
                    innerRef={r => this.expansionPanel = r}
                    square
                    className={classes.expansionPanelRoot}
                    defaultExpanded={defaultExpanded}
                    expanded={expanded}
                    onChange={this.onChange}
                >
                    <ExpansionPanelSummary
                        id={`${id}_summary`}
                        classes={{
                            root: classes.expansionPanelSummaryRoot,
                            expandIcon: classes.expansionPanelSummaryIcon
                        }}
                        expandIcon={<ExpandMore id={`${id}_expandIcon`} />}
                    >
                        <label className={classes.expansionPanelSummaryLabel}>{`Room Utilisation (Quota Display: ${!isShowAvailable ? 'Booked Quota' : 'Available Quota'}/Total Quota)`}</label>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails
                        className={classes.expansionPanelDetails}
                    >
                        <Grid container className={classes.detailContainer} spacing={1}>
                            <Grid item container spacing={1} alignItems="center" style={{ paddingBottom: 20 }}>
                                <Grid item>
                                    <DatePicker
                                        id={`${id}_datePicker`}
                                        value={slotDate}
                                        onChange={this.onDateChange}
                                        onAccept={this.onDateAccept}
                                        onBlur={this.onDateAccept}
                                        onKeyDown={this.onDateKeyDown}
                                        label={<>Date<RequiredIcon /></>}
                                        isRequired
                                        absoluteMessage
                                        disabled={disabled}
                                    />
                                </Grid>
                                <Grid item>
                                    <Button
                                        id={`${id}_todayBtn`}
                                        className={classes.button}
                                        onClick={this.onClickDate}
                                        disabled={disabled}
                                    >Today</Button>
                                </Grid>
                                <Grid item>
                                    <IconButton
                                        color={'primary'}
                                        onClick={this.onClickRefresh}
                                        disabled={disabled}
                                    >
                                        <Autorenew />
                                    </IconButton>
                                </Grid>
                            </Grid>
                            <Grid item container>
                                <CIMSDataGrid
                                    disableAutoSize
                                    gridTheme="ag-theme-balham"
                                    divStyle={{
                                        minWidth: 120,
                                        height: agGridHeight,
                                        display: 'block',
                                        paddingBottom: 8
                                    }}
                                    gridOptions={{
                                        rowHeight: 35,
                                        columnDefs: column,
                                        rowData: rowData,
                                        rowSelection: 'single',
                                        onGridReady: (params) => {
                                            this.gridApi = params.api;
                                            this.gridColumnApi = params.columnApi;
                                        },
                                        getRowNodeId: item => item.sessId.toString(),
                                        suppressRowClickSelection: false
                                    }}
                                    suppressGoToRow
                                    suppressDisplayTotal
                                />
                            </Grid>
                        </Grid>
                    </ExpansionPanelDetails>

                </ExpansionPanel>
            </Grid>
        );
    }
}

const mapState = state => ({
    serviceCd: state.login.service.svcCd,
    siteId: state.login.clinic.clinicCd
});

export default connect(mapState)(withStyles(styles)(RoomUtilization));