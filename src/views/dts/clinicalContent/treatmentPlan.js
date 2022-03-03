import React, { Component, useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import {Table, TableBody, TableCell,TableHead, TableRow} from '@material-ui/core';
import { makeStyles, Theme, createStyles, ThemeProvider, createMuiTheme, withStyles  } from '@material-ui/core/styles';
//import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import accessRightEnum from '../../../enums/accessRightEnum';
import { addTabs, deleteTabs, deleteSubTabs, changeTabsActive, cleanTabParams, skipTab, updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';

const styles = (theme) => ({
  root: {
    display: 'flex'
  },
  details: {
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    flex: '1 0 auto'
  },
  plan: {
    width: 1518,
    height: 725
  }

});



const prbTxColumns = [
  { id: 'order', label: '', minWidth: 10 },
  // { id: "planDate", label: "Last updated", minWidth: 120 },
  {
      id: 'plan',
      label: 'Treatment Plan',
      minWidth: 200,
      align: 'left'
  },
  {
    id: 'problem',
    label: 'Problem',
    minWidth: 100,
    align: 'left'
  },
  {
    id: 'toothNo',
    label: 'Tooth No.',
    minWidth: 60,
    align: 'left'
  },

  {
    id: 'status',
    label: 'Status',
    minWidth: 10,
    align: 'center'
  }
];

function createData(order, planDate, problem,toothNo, plan, status) {
  return { order, planDate, problem,toothNo, plan, status };
}

const rows = [
  createData('1','08-09-2019', 'Crown fracture of tooth','27', 'Extraction 27', 'C'),
  createData('2', '10-09-2019', '','', 'OHI, Scaling', ''),
  createData('3', '08-09-2019', 'Dental Caries','15DO;25DO', 'Filling 15DO & 25DO', ''),
  createData('4', '08-09-2019', 'Necrotic pulp','46', 'RCT 46', ''),
  createData('5', '08-09-2019', 'Dental Caries','46 DO', 'Radicular Amal 46MOD', ''),
  createData('6', '08-09-2019', '','', 'Crown 46', ''),
  createData('7', '08-09-2019', 'Abrasion of tooth (toothwear)','13B', 'KIV', '')
];

const treatmentPlanFunctionCd = accessRightEnum.TreatmentPlan;

class TreatmentPlan extends Component {
  constructor (props) {
        super(props);
        this.treatmentTab = props.accessRights.find((item) => item.name === treatmentPlanFunctionCd);
        this.state = {

        };
    }

    openTreatmentTab = () => {
        if (!this.props.tabs.find(item => item.name === this.patientTab.name)){
            this.props.addTabs(this.treatmentTab);
            //this.props.deleteTabs(nonPatientTab.name);
        }
    };


  render () {
      // console.log('ExistingProblemTreatment.render.readOnly ==> ' + this.props.readOnly)
      // eslint-disable-next-line
      const { readOnly, classes, ...rest } = this.props;//NOSONAR

        return (
          // <TableContainer component={Paper}>
            <Table stickyHeader aria-label="sticky table" size="small">
              <TableHead>
                <TableRow>
                  {prbTxColumns.map(column => (
                    <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows
                  .map(row => {
                    return (
                      <TableRow
                          hover={!this.props.readOnly}
                          role="checkbox"
                          tabIndex={-1}
                          key={row.code}
                          size="small"
                      >
                        {prbTxColumns.map(column => {
                          const value = row[column.id];
                          return (
                            <TableCell key={column.id} align={column.align}>
                              {column.format && typeof value === 'number'
                                ? column.format(value)
                                : value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          // </TableContainer>
        );
    }
}

const mapStateToProps = (state) => {
    // console.log('pageStatus 1: ' + JSON.stringify(state.dtsAppointmentBooking.pageStatus));
    return {
      accessRights: state.login.accessRights
    };
};

const mapDispatchToProps = {

};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TreatmentPlan));