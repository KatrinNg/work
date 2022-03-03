import React from 'react';
import { makeStyles , withStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const ExpansionPanel = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0
    },
    '&:before': {
      display: 'none'
    },
    '&$expanded': {
      margin: 'auto'
    }
  },
  expanded: {}
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 30,
    '&$expanded': {
      minHeight: 30
    }
  },
  content: {
    '&$expanded': {
      margin: '12px 0'
    }
  },
  expanded: {}
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
  root: {
    padding: theme.spacing(1)
  }
}))(MuiExpansionPanelDetails);

const useStyles = makeStyles(theme => ({

  root: {
    flexFlow: 'column'
  },
  container: {
    maxHeight: '100%',
    width: '100%'
  },
  heading: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeightRegular
  }
}));
const columns = [
  { id: 'discipline', label: 'Discip.', minWidth: 20 },
  { id: 'planDate', label: 'Last updated', minWidth: 20 },
  {
    id: 'problem',
    label: 'Problem',
    minWidth: 100,
    align: 'left'
  },
  {
    id: 'qualifier',
    label: 'Qualifier',
    minWidth: 100,
    align: 'left'
  },
  {
    id: 'plan',
    label: 'Tx Plan',
    minWidth: 100,
    align: 'left'
  },

  {
    id: 'status',
    label: 'Status',
    minWidth: 20,
    align: 'left'
  }
];

function createData(discipline, planDate, problem,qualifier, plan, status) {
  return { discipline, planDate, problem,qualifier, plan, status };
}

const rows = [
  createData('GD', '08-09-2019', 'Dental Caries','11M,22M', 'Composite filling', 'Planned'),
  createData('FD', '10-09-2019', 'Dental Caries','18MO', 'Extraction', 'Completed'),
  createData('GD', '08-09-2019', 'Dental Caries','12M', 'KIV', 'Planned'),
  createData('GD', '08-09-2019', 'Dental Caries','25M', 'RCT', 'Planned'),
  createData('GD', '08-09-2019', 'Dental Caries','24D', 'Amalgam Filling', 'Planned')

];

export default function DtsProblemTreatmentTable() {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <ExpansionPanel className={classes.root}>
      <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
      >
        <Typography className={classes.heading}>
          Problem list & Treatment Plan
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.root} >
        <Paper className={classes.container} style={{height: 270}}>
          <Table stickyHeader aria-label="sticky table" size="small">
            <TableHead>
              <TableRow>
                {columns.map(column => (
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
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(row => {
                  return (
                    <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={row.code}
                        size="small  "
                    >
                      {columns.map(column => {
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
        </Paper>
        <TablePagination
            rowsPerPageOptions={[3, 5, 10]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}
