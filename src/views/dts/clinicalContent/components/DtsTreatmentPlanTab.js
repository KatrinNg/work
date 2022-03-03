import React from 'react';
import {Table, TableBody, TableCell,TableHead, TableRow} from '@material-ui/core';
import { makeStyles, Theme, createStyles, ThemeProvider, createMuiTheme, withStyles  } from '@material-ui/core/styles';
//import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

const useStyles = theme => ({
  root: {
    display: 'flex',
    boxShadow: 'none',
    border : 0
  },
  details: {
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    flex: '1 0 auto'
  },
  plan: {
    width: 1595,
    height: 719
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

class TreatmentPlan extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
      // console.log('ExistingProblemTreatment.render.readOnly ==> ' + this.props.readOnly)
      // eslint-disable-next-line
      const { readOnly, classes, ...rest } = this.props;//NOSONAR

        return (
          <Card className={classes.root}>
          <CardMedia className={classes.plan}
          // image="/images/treatment_plan.png"
          // image="/images/treatment_plan_v2.png"
          // image="/images/treatment_plan_v3.png"
              image="/images/treatment_plan_v4.png"
          />
          <div className={classes.content}></div>
          {/*}<TableContainer component={Paper}>
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
                              {column.format && typeof value === "number"
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
          </TableContainer>*/}
          </Card>
        );
    }
}


export default withStyles(useStyles)(TreatmentPlan);
