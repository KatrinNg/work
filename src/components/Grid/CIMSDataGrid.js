import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography
} from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import {
    SubdirectoryArrowLeft as SubdirectoryArrowLeftIcon
} from '@material-ui/icons';
import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/dist/styles/ag-grid.css';

const styles = () => ({
    root: {
        flexGrow: 1,
        height: '100%'
    },
    goToRow: {
        width: '200px',
        margin: '10px'
    },
    totalRecords: {
        minWidth: '120px',
        margin: '20px'
    }
});

class CIMSDataGrid extends Component {
    constructor(props) {
        super(props);

        this.state = {
            goto: '',
            totalRecords: 0
        };

        this.refGrid = React.createRef();
    }

    componentDidMount() {
        const grid = this.refGrid.current;
        this.grid = grid;

        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
        this.setState = () => false;
    }

    gotoRow = () => {
        let goto = parseInt(this.state.goto);
        if (!isNaN(goto)) {
            this.refGrid.current.api.ensureIndexVisible(goto - 1, 'top');
        }
        this.setState({goto: ''});
    }

    updateDimensions = () => {
        this.resetGridWidth(this.refGrid.current);
    }

    resetGrid = () => {
        if (this.refGrid.current) {
            const grid = this.refGrid.current;
            grid.api.setFilterModel(null);
            grid.api.setSortModel(null);
            grid.columnApi.resetColumnState();
            this.resetGridWidth(grid);
        }
    }

    resetGridWidth = (grid) => {
        const { disableAutoSize } = this.props;
        if (grid && !disableAutoSize) {
            const colIds = grid.columnApi.getAllDisplayedColumns().map(col => col.getColId());
            grid.columnApi.autoSizeColumns(colIds);
            grid.api.sizeColumnsToFit();
        }
    }

    render() {
        const props = this.props;

        let divStyle = {
            width: '100%',
            height: '100%'
        };

        let gridOptions = {
            defaultColDef: {
                filter: true,
                sortable: true,
                resizable: true,
                cellStyle: params => {
                    let cellStyle = {
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center'
                    };
                    return cellStyle;
                }
            },
            multiSortKey: 'ctrl',
            rowSelection: 'multiple',
            rowMultiSelectWithClick: true,
            suppressRowClickSelection: true,
            suppressCellSelection: true,
            rowModelType: 'clientSide',
            deltaRowDataMode: true,
            alwaysShowVerticalScroll: true,
            pagination: false,
            paginationPageSize: 100,
            animateRows: true,
            domLayout: 'normal',
            enableCellTextSelection: true
        };

        divStyle = {...divStyle, ...props.divStyle};
        gridOptions = {
            ...gridOptions,
            ...props.gridOptions,
            onGridReady: params => {
                props.gridOptions.onGridReady && props.gridOptions.onGridReady(params);
                this.resetGridWidth(params);
            },
            onModelUpdated: params => {
                props.gridOptions.onModelUpdated && props.gridOptions.onModelUpdated(params);
                this.resetGridWidth(params);
                this.setState({ totalRecords: params.api.getDisplayedRowCount() });
            },
            onFirstDataRendered: params => {
                props.gridOptions.onFirstDataRendered && props.gridOptions.onFirstDataRendered(params);
                this.resetGridWidth(params);
            },
            onRowDataUpdated: params => {
                props.gridOptions.onRowDataUpdated && props.gridOptions.onRowDataUpdated(params);
                this.setState({ totalRecords: params.api.getDisplayedRowCount() });
            }
        };

        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <Paper style={{ height: '100%' }}>
                    <Grid container direction="column" justify="space-around" style={{ height: '100%'}}>
                        <div
                            className={props.gridTheme}
                            style={divStyle}
                        >
                            <AgGridReact
                                ref={this.refGrid}
                                {...gridOptions}
                            />
                        </div>
                        <Grid container item direction="row" justify="flex-end" alignItems="center">
                            {this.props.suppressGoToRow ? null :
                                <CIMSDataGridTextField
                                    id="cims_data_grid_goto_row"
                                    className={classes.goToRow}
                                    autoComplete="off"
                                    placeholder="Row No."
                                    margin="dense"
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><span style={{whiteSpace: 'pre'}}>Go To:</span></InputAdornment>,
                                        endAdornment:
                                        <InputAdornment position="end">
                                            <IconButton aria-label="Click Go To Row" onClick={this.gotoRow}>
                                                <SubdirectoryArrowLeftIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    }}
                                    value={this.state.goto}
                                    onChange={event => this.setState({goto: event.target.value})}
                                    onKeyPress={event => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            this.gotoRow();
                                        }
                                    }}
                                />
                            }
                            {this.props.suppressDisplayTotal ? null :
                                <Typography className={classes.totalRecords}>
                                    Total Record(s): {this.state.totalRecords}
                                </Typography>
                            }
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        );
    }
}

class CIMSDataGridTextField extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <MuiThemeProvider theme={createMuiTheme()}>
                <TextField {...this.props} />
            </MuiThemeProvider>
        );
    }
}

export default (withStyles(styles)(CIMSDataGrid));