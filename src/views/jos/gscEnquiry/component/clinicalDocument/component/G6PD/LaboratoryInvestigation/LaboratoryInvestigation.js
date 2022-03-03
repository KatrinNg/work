import React, { Component } from 'react';
import { withStyles, Table, TableHead, TableBody, TableCell, Typography, TableRow, Tooltip } from '@material-ui/core';
import Enum from '../../../../../../../../../src/enums/enum';
import { styles } from './LaboratoryInvestigationStyle';
import clsx from 'clsx';
import moment from 'moment';

class LaboratoryInvestigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowId: null
    };
  }

  handleRowClick = (rowId) => {
    this.setState({ selectedRowId: rowId });
  };

  generateTableContent = () => {
    let { classes, investigationResult } = this.props;
    const { selectedRowId } = this.state;
    let elementContainer = investigationResult.map(item => {
      let currentRowFlag = selectedRowId === item.reportId ? true : false;
      return (
        <TableRow
            key={`${item.reportId}`}
            className={clsx(classes.tableContentRow, {
            [classes.tableContentRowSelected]: currentRowFlag
          })}
            onClick={() => { this.handleRowClick(item.reportId); }}
        >
          <TableCell padding="none" className={classes.tableContentCell}>
            <Tooltip title={item.isAmended ? item.isAmended : ''} classes={{ tooltip: classes.tooltip }}>
              <label className={classes.displayLabel}>{item.isAmended ? item.isAmended : ''}</label>
            </Tooltip>
          </TableCell>
          <TableCell padding="none" className={classes.tableContentCell}>
            <Tooltip title={item.reportType ? item.reportType : ''} classes={{ tooltip: classes.tooltip }}>
              <label className={classes.displayLabel}>{item.reportType ? item.reportType : ''}</label>
            </Tooltip>
          </TableCell>
          <TableCell padding="none" className={classes.tableContentCell}>
            <Tooltip title={item.clctDate ? moment(item.clctDate).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''} classes={{ tooltip: classes.tooltip }}>
              <label className={classes.displayLabel}>{item.clctDate ? moment(item.clctDate).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''}</label>
            </Tooltip>
          </TableCell>
          <TableCell padding="none" className={classes.tableContentCell}>
            <Tooltip title={item.labNo ? item.labNo : ''} classes={{ tooltip: classes.tooltip }}>
              <label className={classes.displayLabel}>{item.labNo ? item.labNo : ''}</label>
            </Tooltip>
          </TableCell>
          <TableCell padding="none" className={classes.tableContentCell}>
            <Tooltip title={item.g6pd ? item.g6pd : ''} classes={{ tooltip: classes.tooltip }}>
              <label className={classes.displayLabel}>{item.g6pd ? item.g6pd : ''}</label>
            </Tooltip>
          </TableCell>
          <TableCell padding="none" className={classes.tableContentCell}>
            <Tooltip title={item.reportDate ? moment(item.reportDate).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''} classes={{ tooltip: classes.tooltip }}>
              <label className={classes.displayLabel}>{item.reportDate ? moment(item.reportDate).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''}</label>
            </Tooltip>
          </TableCell>
        </TableRow>
      );
    });
    return elementContainer;
  }

  render() {
    const { classes, investigationResult } = this.props;
    let contentElements = this.generateTableContent();
    return (
      <div className={classes.box}>
        <Typography component="div" className={classes.tableStyle}>
          <Table id="LaboratoryInvestigationTable">
            <TableHead>
              <TableRow className={classes.tableHeadRow}>
                <TableCell padding="none" className={classes.tableHeadCell}>lsamende</TableCell>
                <TableCell padding="none" className={classes.tableHeadCell}>Report Type</TableCell>
                <TableCell padding="none" className={classes.tableHeadCell}>Collect Date</TableCell>
                <TableCell padding="none" className={classes.tableHeadCell}>Lab. No.</TableCell>
                <TableCell padding="none" className={classes.tableHeadCell}>G6PD</TableCell>
                <TableCell padding="none" className={classes.tableHeadCell}>Report Rec'd Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {investigationResult.length > 0 ? (contentElements) : (
                <TableRow style={{ height: 'auto' }}>
                  <TableCell colSpan={6} className={classes.tableCellRow}>
                    <Typography style={{ padding: 10 }}>There is no data.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Typography>
      </div>
    );
  }
}

export default withStyles(styles)(LaboratoryInvestigation);