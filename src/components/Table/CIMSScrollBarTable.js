import React, { Component } from 'react';
import {
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from '@material-ui/core';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
// import CIMSTable from '../../../../components/Table/CIMSTable';
const customTheme = (theme) => createMuiTheme({
    ...theme,
    overrides: {
        ...theme.overrides,
        MuiTableRow: {
            root: {
                '&$selected': {
                    backgroundColor: '#abc8e2'
                }
            }
        }
    }
});

const useStyles2 = () => ({
    root: {
        width: '100%'
    },
    tableRole: {
        border: '1px solid #0579c8'
        // height:200
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        height: 200,
        overflowY: 'hidden'
    },
    tableHead: {
        background: '#ccc'
    },
    tableBody: {
        overflowY: 'auto'
    },
    tableRow: {
        display: 'flex',
        borderBottom: '1px solid #0579c8',
        height: 35
    },
    tableCell: {
        padding: '4px 20px 4px 20px',
        borderBottom: 'none',
        alignSelf: 'center'
    },
    progressBarRoot: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgb(78, 78, 78, 0.3)',
        top: 0,
        left: 0
    },
    progressBar: {
        top: '50%',
        position: 'relative',
        left: '50%',
        marginTop: '-20px',
        marginLeft: '-20px'
    }
});

class CIMSScrollBarTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { classes, columns, store, selectIndex, disabled, id } = this.props;
        return (
            <MuiThemeProvider theme={customTheme}>
                <Grid className={classes.tableRole}>
                    <Table id={id} className={classes.table}>
                        <TableHead id={id + 'TableHead'} className={classes.tableHead} >
                            <TableRow id={id + 'TableHeadTableRow'} className={classes.tableRow} >
                                {columns.map((column, index) => {
                                    const { style, name, label, ...rest } = column;
                                    const columnStyle = { fontSize: '1rem', fontWeight: 'bold', ...style };
                                    return (
                                        <TableCell
                                            id={id + 'TableHeadTableRowTableCell' + index}
                                            key={name}
                                            className={classes.tableCell}
                                            style={columnStyle}
                                            {...rest}
                                        >
                                            {label}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody id={id + 'TableBody'} className={classes.tableBody}>
                            {
                                store.map((row, index) => {
                                    return (
                                        <TableRow
                                            id={id + 'TableBodyTableRow' + index}
                                            key={index}
                                            className={classes.tableRow}
                                            selected={!isNaN(selectIndex) && selectIndex === index}
                                            onClick={() => { if (!disabled) this.props.selectOnChange && this.props.selectOnChange(row, index); }}
                                        >
                                            {columns.map((column, i) => {
                                                const { style, name, ...rest } = column;
                                                const columnStyle = { ...style };
                                                return (
                                                    <TableCell
                                                        id={id + 'TableBodyTableRow' + index + 'TableCell' + i}
                                                        key={name}
                                                        className={classes.tableCell}
                                                        style={columnStyle}
                                                        {...rest}
                                                    >
                                                        {row[name]}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })
                            }

                        </TableBody>
                    </Table>
                </Grid>
            </MuiThemeProvider>
        );
    }
}

export default withStyles(useStyles2)(CIMSScrollBarTable);