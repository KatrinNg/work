/* eslint-disable no-use-before-define */
import {
  Button,
  FormControl,
  FormGroup,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow
} from '@material-ui/core';
//import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
//import CIMSAutoComplete from '../../../components/AutoComplete/CIMSAutoComplete';
import CIMSSelect from '../../../../components/Select/CIMSSelect';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 250
  },
  formButton: {
    margin: theme.spacing(1),
    minWidth: 50
  },
  container: {
    margin: theme.spacing(1),
    maxWidth: 944
  }
}));

const selectStyles = {
  multiValue: (styles, { data }) => {
    return {
      ...styles,
      borderRadius: 10,
      display: 'flex'
    };
  }
};

export default function DtsHistory() {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [problem, setProblem] = React.useState([]);
  const [procedure, setProcedure] = React.useState([]);
  const [tooth, setTooth] = React.useState([]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

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
      label: 'Tooth Numnber',
      minWidth: 100,
      align: 'left'
    }
  ];

  function createData(discipline, planDate, problem, qualifier, plan, status) {
    return { discipline, planDate, problem, qualifier, plan, status };
  }

  const rows = [
    createData(
      'FD',
      '10-09-2019',
      'Dental Caries',
      '18MO',
      'Extraction',
      'Completed'
    ),
    createData('GD', '10-09-2019', 'Dental Caries', '12M', 'KIV', 'Completed'),
    createData(
      'GD',
      '10-09-2019',
      'Dental Caries',
      '24D',
      'Amalgam Filling',
      'Completed'
    ),
    createData(
      'GD',
      '08-09-2019',
      'Dental Caries',
      '11M',
      'Composite filling',
      'Planned'
    ),
    createData('GD', '08-09-2019', 'Dental Caries', '25M', 'RCT', 'Planned')
  ];
  const handleProblem = (options) => {
    console.log('handleProblem ==> options=>', options);
    console.log('handleProblem ==> options.length=>', options.length);
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      value.push(options[i].value);
    }
    console.log('value ==>', value);
    console.log('state.problem ==>', problem);
    setProblem(value);
  };

  const handleProcedure = (options) => {
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      value.push(options[i].value);
    }
    setProcedure(value);
  };

  const handleTooth = (options) => {
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      value.push(options[i].value);
    }
    setTooth(value);
  };

  return (
    <div style={{ height: 820 }} p={2}>
      <div>
        <Typography paragraph component="p" className={classes.formControl}>
          <b>Search Filters:</b>
        </Typography>

        <FormGroup row>
          <FormControl variant="outlined" className={classes.formControl}>
            <CIMSSelect
                isMulti
                id={'problemFilter'}
                TextFieldProps={{ variant: 'outlined', label: 'problem' }}
                options={problemsOption}
                value={problem}
                styles={selectStyles}
                onChange={handleProblem}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <CIMSSelect
                isMulti
                id={'procedureFilter'}
                TextFieldProps={{ variant: 'outlined', label: 'procedure' }}
                options={proceduresOption}
                value={procedure}
                styles={selectStyles}
                onChange={handleProcedure}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <CIMSSelect
                isMulti
                id={'toothFilter'}
                TextFieldProps={{ variant: 'outlined', label: 'tooth' }}
                options={teethOption}
                value={tooth}
                styles={selectStyles}
                onChange={handleTooth}
            />
          </FormControl>
          <FormControl className={classes.formButton}>
            <Button variant="contained" size="small">
              Search
            </Button>
          </FormControl>
        </FormGroup>
      </div>

      <Paper className={classes.container}>
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
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
              .map((row) => {
                return (
                  <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.code}
                      size="small"
                  >
                    {columns.map((column) => {
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
          rowsPerPageOptions={[10, 20, 30]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  );
}

const teethOption = [
  { value: '11', label: '11' },
  { value: '12', label: '12' },
  { value: '13', label: '13' },
  { value: '14', label: '14' },
  { value: '15', label: '15' },
  { value: '16', label: '16' },
  { value: '17', label: '17' },
  { value: '18', label: '18' },
  { value: '21', label: '21' },
  { value: '22', label: '22' },
  { value: '23', label: '23' },
  { value: '24', label: '24' },
  { value: '25', label: '25' },
  { value: '26', label: '26' },
  { value: '27', label: '27' },
  { value: '28', label: '28' },
  { value: '31', label: '31' },
  { value: '32', label: '32' },
  { value: '33', label: '33' },
  { value: '34', label: '34' },
  { value: '35', label: '35' },
  { value: '36', label: '36' },
  { value: '37', label: '37' },
  { value: '38', label: '38' },
  { value: '41', label: '41' },
  { value: '42', label: '42' },
  { value: '43', label: '43' },
  { value: '44', label: '44' },
  { value: '45', label: '45' },
  { value: '46', label: '46' },
  { value: '47', label: '47' },
  { value: '48', label: '48' },
  { value: '51', label: '51' },
  { value: '52', label: '52' },
  { value: '53', label: '53' },
  { value: '54', label: '54' },
  { value: '55', label: '55' },
  { value: '61', label: '61' },
  { value: '62', label: '62' },
  { value: '63', label: '63' },
  { value: '64', label: '64' },
  { value: '65', label: '65' },
  { value: '71', label: '71' },
  { value: '72', label: '72' },
  { value: '73', label: '73' },
  { value: '74', label: '74' },
  { value: '75', label: '75' },
  { value: '81', label: '81' },
  { value: '82', label: '82' },
  { value: '83', label: '83' },
  { value: '84', label: '84' },
  { value: '85', label: '85' }
];

const problemsOption = [
  { value: '1', label: 'Dental Caries' },
  { value: '2', label: 'Dental Caries1' }
];

const proceduresOption = [
  { value: '1', label: 'Recall' },
  { value: '2', label: 'Dental Filling' },
  { value: '3', label: 'Scaling' }
];
