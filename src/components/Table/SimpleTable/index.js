import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const styles = () => ({
    table: {
        minWidth: 650
    },
    head: {},
    headRow: {},
    headRowCell: {},
    body: {},
    bodyRow: {},
    bodyRowCell: {}
});

export default withStyles(styles)(React.forwardRef(function SimpleTable(props, ref) {
    const { rows, columns, hiddenHead, classes, id } = props;
    return (
        <Table className={classes.table} aria-label="simple table">
            {
                !hiddenHead ?
                    <TableHead className={classes.head}>
                        <TableRow className={classes.headRow}>
                            {
                                columns && columns.map((head) => (
                                    <TableCell id={`${id}_header_${head.name}`} key={head.name} className={classes.headRowCell}>{head.title}</TableCell>
                                ))
                            }
                        </TableRow>
                    </TableHead>
                    : null
            }
            <TableBody className={classes.body}>
                {
                    rows && rows.map((row, index) => (
                        <TableRow id={`${id}_row_${index}`} key={index} className={classes.bodyRow}>
                            {
                                columns && columns.map((col) => {
                                    const { customBodyRender, ...rest } = col;
                                    const cellContent = customBodyRender ? customBodyRender(row[col.name], row) : row[col.name];
                                    return (
                                        <TableCell id={`${id}_row_${index}_${col.name}`} key={col.name} className={classes.bodyRowCell} {...rest}>
                                            {cellContent}
                                        </TableCell>
                                    );
                                })
                            }
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    );
}));