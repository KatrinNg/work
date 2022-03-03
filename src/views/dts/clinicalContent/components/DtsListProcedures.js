import React , { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles,withStyles } from '@material-ui/core/styles';
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


const styles = {

  tableCell:{
          //borderStyle: 'none',
          //borderBottom: '1px solid rgba(224, 224, 224, 1)',
          padding:'0px 8px',
          maxWidth:'200px'

      },
  qualifierCell:{
      'overflow': 'hidden',
      'text-overflow': 'ellipsis',
      'display': '-webkit-box',
      '-webkit-line-clamp': 3,
      '-webkit-box-orient': 'vertical',
      'white-space': 'initial',
      'border-left': 'none',
      'border-top': 'none',
      'margin-bottom': '-1px',
      'padding': '12px 10px 1px 10px',
      'height' : 40,
      'margin-top' : '10px'
      //padding: '1px 20px 1px 10px'
  },
  tableRow:{
    'height' : 40
  },
  customToolTip: {
      maxWidth: 200,
      fontSize: 15
    }




};

const procedureColumnsHeader = [
  // { id: "discipline", label: "Discip.", minWidth: 20 },
  { id: 'procedureDesc',
    label: 'Procedure',
    minWidth: 50
  },
  {
    id: 'qualifierDesc',
    label: 'Qualifier',
    minWidth: 60,
    align: 'left'
  }

];

class DtsListProcedures extends React.Component {
  constructor (props) {
    super(props);

    this.state = {


    };
  }

  getProceduresQualifiersItem(idx, procedureList, procedureQualifierList, classes){
        return (
            <TableRow key={idx} className={classes.tableRow}>

                <Tooltip classes={{ tooltip: classes.customToolTip }} title={procedureList.procedureText} placement="bottom-start">
                  <TableCell align="left">
                          {procedureList.procedureText}
                  </TableCell>
                </Tooltip>
                <Tooltip classes={{ tooltip: classes.customToolTip }} title={this.getGroupedQualifer(procedureList, procedureQualifierList)} placement="bottom-end">
                  <TableCell className={classes.qualifierCell} align="left">
                      {this.getGroupedQualifer(procedureList, procedureQualifierList)}
                  </TableCell>
                </Tooltip>
                <TableCell align="left" style={{display: 'none'}}>

                  </TableCell>
           </TableRow>
        );
    }


  getGroupedQualifer = (procedureList, item) => {

    let qualifiers = '';



    for(let i = 0; i < item.length; i++){
      qualifiers +=  item[i].valDesc + '; ';
    }

    console.log('procedureList.remarks: ' + procedureList.remarks);

      if(procedureList.remarks){
      qualifiers += procedureList.remarks;
    }

     qualifiers = qualifiers.trim();

    if(qualifiers.endsWith(';')){

      qualifiers = qualifiers.slice(0, -1) + '';

    }
    return qualifiers;

  }

    render () {

        const { classes, readOnly, proceduresQualifiersList,...rest } = this.props;//NOSONAR

        return (
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                        {procedureColumnsHeader.map(column => (
                            <TableCell
                                key={column.id}
                                align={column.align}
                                style={{ minWidth: column.minWidth, 'white-space': 'nowrap', padding: '0px 5px 0px 5px'}}
                            >
                            {column.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                  {
                    proceduresQualifiersList.map(
                      (row, idx) => {return this.getProceduresQualifiersItem(idx, row, row.codQlfValDtoList, classes);}
                    )
                  }
              </TableBody>
                </Table>
        );
    }
}

const mapStateToProps = (state) => {
    // console.log(state.dtsAppointmentAttendance.patientKey);

    return {

    };
};

const mapDispatchToProps = {

};

export default connect(mapStateToProps)(withStyles(styles)(DtsListProcedures));