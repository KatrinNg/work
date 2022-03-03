import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
//import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faUserMd, faClinicMedical, faTeeth, faTooth, faPills, faFileMedical, faMehBlank } from '@fortawesome/free-solid-svg-icons';

function createData(key,problem, qualifier, date) {
  return {key, problem, qualifier,date};
}

const rows = [
  createData(1,'Dental Caries', '15MO;deep caries, warned risk of irreversible pulpitis','08-09-2019'),
  createData(2,'Local moderate periodontitis', '34','08-09-2019'),
  //createData(3,'Chronic apical periodontitis (Apical granuloma)', '25','08-09-2019'),
  //createData(4,'Defective filling / intracoronal restoration', '25B','08-09-2019'),
  createData(5,'Attrition of tooth (toothwear)','16O','08-09-2019'),
  //createData(6,'Attrition of tooth (toothwear)','13I','08-09-2019'),
  //createData(7,'Attrition of tooth (toothwear)','12I','08-09-2019'),
  //createData(8,'Attrition of tooth (toothwear)','11I','08-09-2019'),
  //createData(9,'Attrition of tooth (toothwear)','21I','08-09-2019'),
  //createData(10,'Attrition of tooth (toothwear)','22I','08-09-2019'),
  //createData(11,'Attrition of tooth (toothwear)','23I','08-09-2019'),
  //createData(12,'Attrition of tooth (toothwear)','41I','08-09-2019'),
  //createData(13,'Attrition of tooth (toothwear)','42I','08-09-2019'),
  //createData(14,'Attrition of tooth (toothwear)','43I','08-09-2019','08-09-2019'),
  //createData(15,'Attrition of tooth (toothwear)','46O','08-09-2019'),
  createData(16,'Local moderate periodontitis', '35','08-09-2019'),
  //createData(17,'Local moderate periodontitis', '36','08-09-2019'),
 // createData(18,'Local moderate periodontitis', '37','08-09-2019'),
  createData(19,'Dental Caries', '21D; Coronal, Active; Recurrent (Secondary) cavitated','10-09-2019')
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'date', numeric: false, disablePadding: false, label: 'Last update' , minWidth : 120 },
  { id: 'problem', numeric: false, disablePadding: false, label: 'Problem' , minWidth : 350},
  { id: 'qualifier', numeric: false, disablePadding: false, label: 'Qualifier' , minWidth : 80 }
  // { id: 'fat', numeric: false, disablePadding: false, label: 'Fat (g)' },
  // { id: 'carbs', numeric: false, disablePadding: false, label: 'Carbs (g)' },
  // { id: 'protein', numeric: false, disablePadding: false, label: 'Protein (g)' },
];

function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {/*<TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>*/}
        {headCells.map((headCell) => (
          <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === headCell.id ? order : false}
              style={{ minWidth: headCell.minWidth }}
          >
            <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85)
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark
        },
  title: {
    flex: '1 1 100%'
  }
}));


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%'
  },
  container: {
    maxHeight: 372,
    minHeight: 372
  },
  paper: {
    width: '100%'
    // marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 480
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1
  }
}));

export default function EnhancedTable() {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('key');
  const [selected, setSelected] = React.useState([]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        {/* <TableContainer className={classes.container}> */}
          <Table
              className={classes.table}
              size={'small'}
              stickyHeader
          >
            <EnhancedTableHead
                classes={classes}
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
            />
            <TableBody>
               {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
                  const isItemSelected = isSelected(row.problem);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                        hover
                      // onClick={(event) => handleClick(event, row.name)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.key}
                        selected={isItemSelected}
                    >
                      {/*<TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell> */}
                      <TableCell component="th">{row.date}</TableCell>
                      <TableCell component="th"  >
                        {row.problem}
                      </TableCell>
                      <TableCell >{row.qualifier}</TableCell>
                      {/*<TableCell align="right">{row.fat}</TableCell>
                      <TableCell align="right">{row.carbs}</TableCell>
                      <TableCell align="right">{row.protein}</TableCell>*/}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        {/* </TableContainer> */}
      </Paper>
    </div>
  );
}
