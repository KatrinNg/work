import React,{ forwardRef, useRef } from 'react';
import clsx from 'clsx';
import { makeStyles, Theme, createStyles  } from '@material-ui/core/styles';

import {InputAdornment, InputLabel, OutlinedInput, Select , FormGroup, FormControlLabel, FormControl } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Box from '@material-ui/core/Box';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Document, Page } from 'react-pdf';

import MaterialTable from 'material-table';

import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

// const tableIcons = {
//   Add: forwardRef((props, ref:useRef<SVGSVGElement>) => <AddBox {...props} ref={ref} />),
//   Check: forwardRef((props, ref:useRef<SVGSVGElement>) => <Check {...props} ref={ref} />),
//   Clear: forwardRef((props, ref:useRef<SVGSVGElement>) => <Clear {...props} ref={ref} />),
//   Delete: forwardRef((props, ref:useRef<SVGSVGElement>) => <DeleteOutline {...props} ref={ref} />),
//   DetailPanel: forwardRef((props, ref:useRef<SVGSVGElement>) => <ChevronRight {...props} ref={ref} />),
//   Edit: forwardRef((props, ref:useRef<SVGSVGElement>) => <Edit {...props} ref={ref} />),
//   Export: forwardRef((props, ref:useRef<SVGSVGElement>) => <SaveAlt {...props} ref={ref} />),
//   Filter: forwardRef((props, ref:useRef<SVGSVGElement>) => <FilterList {...props} ref={ref} />),
//   FirstPage: forwardRef((props, ref:useRef<SVGSVGElement>) => <FirstPage {...props} ref={ref} />),
//   LastPage: forwardRef((props, ref:useRef<SVGSVGElement>) => <LastPage {...props} ref={ref} />),
//   NextPage: forwardRef((props, ref:RuseRef<SVGSVGElement>) => <ChevronRight {...props} ref={ref} />),
//   PreviousPage: forwardRef((props, ref:useRef<SVGSVGElement>) => <ChevronLeft {...props} ref={ref} />),
//   ResetSearch: forwardRef((props, ref:useRef<SVGSVGElement>) => <Clear {...props} ref={ref} />),
//   Search: forwardRef((props, ref:useRef<SVGSVGElement>) => <Search {...props} ref={ref} />),
//   SortArrow: forwardRef((props, ref:useRef<SVGSVGElement>) => <ArrowUpward {...props} ref={ref} />),
//   ThirdStateCheck: forwardRef((props, ref:useRef<SVGSVGElement>) => <Remove {...props} ref={ref} />),
//   ViewColumn: forwardRef((props, ref:useRef<SVGSVGElement>) => <ViewColumn {...props} ref={ref} />)
// };


const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  },
  margin: {
    margin: theme.spacing(1)
  },
withoutLabel: {
  marginTop: theme.spacing(3)
},
textField: {
  width: 200
}

}));

class EndoTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { width: 10, title: 'Tooth', field: 'tooth', editable: 'always' },
        // { width: 10, title: 'Tooth', field: 'tooth', editable: 'always',  render: rowData => <div style={{width: 10}}>{rowData.tooth}</div> },
        { width: 5,title: 'Rd (Clamp no)', field: 'rd', editable: 'always' },
        { width: 5,title: 'Canal', field: 'canal', editable: 'always' },
        // { width: 5,title: 'DF', field: 'df', type: 'numeric', editable: 'always' },
		{width: 10, title: 'AL (mm)', field: 'al', type: 'numeric', editable: 'always' },
		{ width: 10,title: 'DL/IL (mm)', field: 'dl', type: 'numeric', editable: 'always' },
		{ width: 10,title: 'WL/IL (mm)', field: 'wl', type: 'numeric', editable: 'always' },
		// { width: 10,title: 'Ref.point', field: 'refPoint', editable: 'always' },
		{ width: 10,title: 'MAF#', field: 'maf', type: 'numeric', editable: 'always' },
		{ width: 10,title: 'Patency', field: 'patency', type: 'boolean', editable: 'always' }
      ],
      data: [
        { tooth: '36', rd: 'W7', canal: 'D', dl: '20',rePoint : '36L', maf: 30, patency: 'true' },
		{ tooth: '', rd: '', canal: 'MB', dl: '18',rePoint : '36M', maf: 30, patency: 'true' },
		{ tooth: '', rd: '', canal: 'ML', dl: '18',rePoint : '36M', maf: 30, patency: 'true' }
      ]
    };
  }

  render() {
    return (
      <Box style={{ maxWidth: '100%' }} p={1} m={1}>
      <MaterialTable
          title="Endo Progress Table"
          columns={this.state.columns}
          data={this.state.data}
          //icons={tableIcons}
          editable={{
          onRowAdd: newData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                {
                  const data = this.state.data;
                  data.push(newData);
                  this.setState({ data }, () => resolve());
                }
                resolve();
              }, 1000);
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                {
                  const data = this.state.data;
                  const index = data.indexOf(oldData);
                  data[index] = newData;
                  this.setState({ data }, () => resolve());
                }
                resolve();
              }, 1000);
            }),
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                {
                  let data = this.state.data;
                  const index = data.indexOf(oldData);
                  data.splice(index, 1);
                  this.setState({ data }, () => resolve());
                }
                resolve();
              }, 1000);
            })
        }}
          options={{
          paging: false,
          search : false,
          headerStyle: {
            // fontSize: 12,
            width: 20,
            padding: 'dense'
          },
          rowStyle: {
            // fontSize: 12,
            padding: 'dense'
          },
          cellStyle: {
            // fontSize: 12,
            padding: '10px'
          }
        }}
      />
      </Box>
    );
  }
}

export default function DtsEformControl() {
  const classes = useStyles();
  const [state, setState] = React.useState({
    age: '',
    name: 'hai',
    numPages: null,
    pageNumber: 1,
    docName : ''
  });

  const inputLabel = React.useRef(null);
  const [labelWidth, setLabelWidth] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const [attendEform, showAttendEform] = React.useState(false);
  const [endoEform, showEndoEnform] = React.useState(false);

  const onDocumentLoadSuccess = numPages => {
    console.log('onDocumentLoadSuccess ==> numPages: ' + numPages);
    console.log('onDocumentLoadSuccess ==> numPages: ' + numPages.numPages);
    // this.setState({ numPages });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = docName => event => {
    setState({
      ...state,
      [docName]: event.target.value
    });
  };

  const showDoc = (
    <Dialog
        maxWidth="XL"
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{'Preview Pdf'}</DialogTitle>
      <DialogContent>
      <div id="ResumeContainer">
         <div style={{ width: 600 }}>
        <Document file={{ url: state.docName }} onLoadSuccess={onDocumentLoadSuccess} >
          <Page pageNumber={state.pageNumber} />
        </Document>
        </div>
      </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" autoFocus>
          close
        </Button>
      </DialogActions>
    </Dialog>
  );


  return (
    <div style={{ width: '100%' }}>
    <form className={classes.root} noValidate autoComplete="off">


      <FormGroup row style={{ width: '100%' }}>
      <Box display="flex">
        <Box component="div" display="inline" m={1} width={'100%'}>
        <FormControl  margin="none" variant="outlined" size="small">
          <InputLabel htmlFor="fdiToothNo"  >Select a Form</InputLabel>
          <Select
              native
              value={state.docName}
              onChange={handleChange('docName')}
              inputProps={{
               name: 'docName',
               id: 'fdiToothNo'
             }}
              label={'Select a Form'}
          >
             <option value="" />
             <option value={'/attend.pdf'}>Certificate of Attendance</option>
             <option value={'/endo2.pdf'}>Endo Progress Table</option>
           </Select>
        </FormControl>
        </Box>
        <Box component="div" display="inline" m={1} width={'100%'}>
          <Button size="small"  variant="contained" onClick={handleClickOpen}>Preview Form</Button>
        </Box>
      </Box>
      </FormGroup>
    </form>
    {state.docName === '/attend.pdf' &&
      <Box m={1} p={1}>
        <FormGroup row style={{ width: '100%' }} >
        <FormControl variant="outlined" size="small">
        <InputLabel htmlFor="outlined-adornment-amount">Start Hour</InputLabel>
        <OutlinedInput
            id="outlined-adornment-amount"
            labelWidth={80}
            type="time"
            defaultValue="21:30"
        />
        </FormControl>

        </FormGroup>
      </Box>
    }
    {state.docName === '/endo2.pdf' &&
        <EndoTable style={{padding: 0, fontSize: '0.7rem'}}/>
    }
      {showDoc}
    </div>
  );
}
