import React, { Component } from 'react';
import {Table,TableRow,TableCell,TableHead,TableBody} from '@material-ui/core';
import {styles} from '../../LaboratoryReportDialogStyle';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';

class CommentTable extends Component{
    constructor(props) {
        super(props);
      }
      render(){
        const { classes,laboratoryReportCommentList=[]} = this.props;
        return (
            <Table>
            <TableHead>
                <TableRow className={classes.table_head}>
                    <TableCell
                        className={classes.table_header}
                        padding={'none'}
                        style={{ paddingLeft: '2px', fontStyle: 'normal', fontSize: '1rem', fontWeight: 'bold', width: '20%' }}
                    >
                    Date
                    </TableCell>
                    <TableCell className={classes.table_header}
                        padding={'none'}
                        style={{ paddingLeft: '2px', fontStyle: 'normal', fontSize: '1rem', fontWeight: 'bold', width: '15%' }}
                    >
                    User
                    </TableCell>
                    <TableCell
                        className={classes.table_header}
                        padding={'none'}
                        style={{ paddingLeft: '2px', fontStyle: 'normal', fontSize: '1rem', fontWeight: 'bold' }}
                    >
                    Comment
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
            {laboratoryReportCommentList.length>0?laboratoryReportCommentList.map((item, index) => (
                <TableRow
                    key={index}
                    // onClick={() => this.changeMedicalRecord(item)}
                >
                    <TableCell padding={'none'}  className={classes.table_cell}>
                        {moment(item.updatedDtm).format('DD-MMM-YYYY HH:mm')}
                    </TableCell>
                    <TableCell padding={'none'} style={{whiteSpace:'break-spaces'}} className={classes.table_cell}>
                        {item.updatedBy}
                    </TableCell>
                    <TableCell style={{whiteSpace:'break-spaces'}} className={classes.table_cell}>
                        {item.cmnt}
                    </TableCell>
                </TableRow>
            )):
            <TableRow >
                <TableCell className={classes.fontLabel} colSpan={3} align="center">
                    There is no data.
                </TableCell>
            </TableRow>
            }
            </TableBody>
        </Table>

        );
      }
}

export default withStyles(styles)(CommentTable);

