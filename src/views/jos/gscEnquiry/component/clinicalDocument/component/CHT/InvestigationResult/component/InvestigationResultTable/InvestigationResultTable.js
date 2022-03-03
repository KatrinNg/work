import React,{ Component } from 'react';
import { withStyles, Grid,TextField,Table, TableHead, TableBody, TableRow, TableCell, Typography, Tooltip} from '@material-ui/core';
import moment from 'moment';
import { styles } from './InvestigationResultTableStyle';

function GenerateTableContent (props) {
    let { classes, investigationResult } = props;
    console.log('investigationResult',investigationResult);
    let elements = investigationResult.map((item, index) => {
        return (<TableRow className={classes.tableRow} key={`ViewNeonatalLogTable_${index}`} >
            <TableCell className={classes.tableCall}>
                <Tooltip title={item ? item.isAmended : ''} classes={{ tooltip: classes.tooltip }}>
                    <label className={classes.displayLabel}>{item.isAmended!=null ? item.isAmended : ''}</label>
                </Tooltip>
            </TableCell>
            <TableCell className={classes.tableCall}>
                <Tooltip title={item ? item.rptType : ''} classes={{ tooltip: classes.tooltip }}>
                    <label className={classes.displayLabel}>{item.rptType!=null ? item.rptType : ''}</label>
                </Tooltip>
            </TableCell>
            <TableCell className={classes.tableCall}>
                <Tooltip title={item ?moment(item.clctDate ).format('DD-MMM-YYYY'): ''} classes={{ tooltip: classes.tooltip }}>
                    <label className={classes.displayLabel}>{item.clctDate!=null ? moment(item.clctDate ).format('DD-MMM-YYYY'): ''}</label>
                </Tooltip>
            </TableCell>
            <TableCell className={classes.tableCall}>
                <Tooltip title={item ? item.labNum : ''} classes={{ tooltip: classes.tooltip }} >
                    <label className={classes.displayLabel}>{item.labNum!=null ? item.labNum : ''}</label>
                </Tooltip>
            </TableCell>
            <TableCell className={classes.tableCall}>
                <Tooltip title={item ? item.tsh : ''} classes={{ tooltip: classes.tooltip }}>
                    <label className={classes.displayLabel}>{item.tsh!=null ? item.tsh : ''}</label>
                </Tooltip>
            </TableCell>
            <TableCell className={classes.tableCall}>
                <Tooltip title={item ? item.ft4 : ''} classes={{ tooltip: classes.tooltip }}>
                    <label className={classes.displayLabel}>{item.ft4!=null ? item.ft4 : ''}</label>
                </Tooltip>
            </TableCell>
            <TableCell className={classes.tableCall}>
                <Tooltip title={item ? item.t3 : ''} classes={{ tooltip: classes.tooltip }}>
                    <label className={classes.displayLabel}>{item.t3!=null ? item.t3 : ''}</label>
                </Tooltip>
            </TableCell>
            <TableCell className={classes.tableCall}>
                <Tooltip title={item ? moment(item.rcvDate).format('DD-MMM-YYYY') : ''} classes={{ tooltip: classes.tooltip }}>
                    <label className={classes.displayLabel}>{item.rcvDate!=null ? moment(item.rcvDate).format('DD-MMM-YYYY') : ''}</label>
                </Tooltip>
            </TableCell>
        </TableRow>);
    });
    return elements;
}
function InvestigationResultTable (props){
        let { classes, investigationResult }=props;
        let generateTableContentProps = { classes, investigationResult};
        return (
            <div className={classes.rootTable}>
                <Grid style={{ maxHeight: 600 }}>
                        <Table stickyHeader >
                            <TableHead>
                                <TableRow className={classes.tableHeadRow}>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '7%' }}>Amended </TableCell>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '5%' }}>Report type</TableCell>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '15%' }}>Collect Date</TableCell>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '10%' }}>Lab. No.</TableCell>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '15%' }}>TSH</TableCell>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '16%' }}>Free T4</TableCell>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '16%' }}>T3</TableCell>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '18%' }}>Report Rec'd Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {investigationResult.length > 0 ? <GenerateTableContent {...generateTableContentProps}/> : (
                                    <TableRow style={{ height: 'auto' }}>
                                        <TableCell colSpan={24} className={classes.tableCellRow}>
                                            <Typography style={{ padding: 10 }}>There is no data.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Grid>
            </div>
        );
}

export default withStyles(styles)(InvestigationResultTable);