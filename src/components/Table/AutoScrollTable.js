import React, {Component} from 'react';
import {
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Box
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

const useStyles = (theme) => ({
    root: {
        width: '100%'
    },
    container: {
        height: 300,
        overflowY: 'auto',
        border: `1px solid ${theme.palette.grey.A100}`
    },
    table: {
        tableLayout: 'fixed'
    },
    tableHead: {},
    tableBody: {
        overflowY: 'auto'
    },
    tableRowHead: {
        height: 35
    },
    tableRowRoot: {
        height: 35,
        '&$tableRowSelected': {},
        '&$tableRowHover:hover': {}
    },
    tableRowSelected: {},
    tableRowHover: {},
    tableCellRoot: {
        wordBreak: 'break-word'
    },
    tableCellHead: {
        position: 'sticky',
        top: -1,
        left: 0,
        zIndex: 2
    }
});

class AutoScrollTable extends Component {

    state = {
        clickCount: 0
    }

    handleClick = (e, row, index) => {
        const {handleRowClick, handleRowDbClick} = this.props;
        const tbr = document.getElementById(this.getId() + '_bodyRow_' + index);
        if (tbr) {
            tbr.style.boxShadow = '0 0 5px #4e4e4e inset';
        }
        setTimeout(() => {
            if (tbr) {
                tbr.style.boxShadow = '';
            }
        }, 200);
        this.setState({clickCount: this.state.clickCount + 1}, () => {
            setTimeout(() => {
                const {clickCount} = this.state;
                if (clickCount !== 0) {
                    this.setState({clickCount: 0}, () => {
                        if (clickCount === 1) {
                            handleRowClick && handleRowClick(e, row, index);
                        } else if (clickCount === 2) {
                            handleRowDbClick && handleRowDbClick(e, row, index);
                        }
                    });
                }
            }, 200);
        });
    }

    getId = () => {
        return this.props.id || 'autoScrollTable';
    }

    render() {
        const {classes, columns, store, selectIndex, handleRowClick, handleRowDbClick, hasCustomKey, customKeyName} = this.props;

        const id = this.getId();
        const useCutomKey = hasCustomKey && customKeyName !== undefined;
        return (
            <Box className={classes.root}>
                <Grid className={classes.container}>
                    <Table
                        id={id + '_tableOfBody'}
                        className={classes.table}
                    >
                        <TableHead
                            id={id + '_head'}
                            className={classes.tableHead}
                        >
                            <TableRow
                                id={id + '_headRow'}
                                classes={{
                                    head: classes.tableRowHead
                                }}
                            >
                                {columns && columns.map((column, index) => {
                                    // eslint-disable-next-line
                                    const { name, label, customBodyRender, style, ...rest } = column;//NOSONAR
                                    return (
                                        <TableCell
                                            id={id + '_headCell_' + index}
                                            key={name}
                                            variant="head"
                                            align="left"
                                            padding="default"
                                            classes={{
                                                head: classes.tableCellHead,
                                                root: classes.tableCellRoot
                                            }}
                                            title={typeof label === 'string' ? label : ''}
                                            style={style && style.head}
                                            {...rest}
                                        >
                                            {label}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody id={id + '_body'} className={classes.tableBody}>
                            {
                                store && store.map((row, index) => {
                                    return (
                                        <TableRow
                                            // id={id + '_bodyRow_' + index}
                                            id={`${id}_bodyRow_${useCutomKey ? row[customKeyName] : index}`}
                                            // key={index}
                                            key={useCutomKey ? row[customKeyName] : index}
                                            classes={{
                                                root: classes.tableRowRoot,
                                                selected: classes.tableRowSelected,
                                                hover: classes.tableRowHover
                                            }}
                                            selected={selectIndex && selectIndex.indexOf(index) > -1}
                                            onClick={(...args) => this.handleClick(...args, row, index)}
                                            hover={handleRowClick || handleRowDbClick ? true : false}
                                            style={{cursor: handleRowClick || handleRowDbClick ? 'pointer' : 'default'}}
                                        >
                                            {columns.map((column, i) => {
                                                const {name, customBodyRender, style, ...rest} = column;
                                                const cellContent = customBodyRender ? customBodyRender(row[name], row) : row[name];
                                                return (
                                                    <TableCell
                                                        id={id + '_bodyRow_' + index + '_bodyCell_' + i}
                                                        key={name}
                                                        classes={{
                                                            root: classes.tableCellRoot
                                                        }}
                                                        {...rest}
                                                        style={{
                                                            ...style,
                                                            whiteSpace: selectIndex && selectIndex.indexOf(index) > -1 ? 'pre-line' : 'nowrap'
                                                        }}
                                                        title={typeof cellContent === 'string' ? cellContent : ''}
                                                    >
                                                        {cellContent}
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
            </Box>
        );
    }
}

export default withStyles(useStyles)(AutoScrollTable);