import React, { Component } from 'react';
import {Grid,Table,TableRow,Typography,TableCell,TableHead,TableBody} from '@material-ui/core';
import {styles} from '../../LaboratoryReportDialogStyle';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import Enum from '../../../../../../../../enums/enum';

// const legends={
//     '0':{codeName:'Fin',describe:'Final Report'},
//     '1':{codeName:'N',describe:'Report Not Yet Received'},
//     '2':{codeName:'IN',describe:'Interim Report'},
//     '3':{codeName:'Pre',describe:'Preliminary Report'},
//     '4':{codeName:'P',describe:'Provisional'},
//     '5':{codeName:'PS',describe:'Provisional Supplementary'},
//     '6':{codeName:'FS',describe:'Final Supplementary'},
//     '7':{codeName:'A',describe:'Amend Report'},
//     '8':{codeName:'AS',describe:'Amend Supplementary'},
//     '9':{codeName:'X',describe:'Report Wipeout'}
//   };

// const Tip=withStyles(theme => ({
//     tooltip: {
//       backgroundColor: '#f5f5f9',
//       color: 'rgba(0, 0, 0, 0.87)',
//       fontSize: theme.typography.pxToRem(12),
//       border: '1px solid #dadde9'
//     }
//   }))((props)=>{
//     return (
//       <Tooltip {...props} title={
//         <React.Fragment>
//           <List>
//           {
//             Object.keys(legends).map(key=>{
//               const item=legends[key];
//               return (
//                 <ListItem key={key}>
//                   <ListItemIcon>{item.codeName}</ListItemIcon>
//                   <ListItemText>{item.describe}</ListItemText>
//                 </ListItem>
//               );
//             })
//           }
//           </List>
//         </React.Fragment>}
//       >
//         <lable>Rep Status</lable>
//       </Tooltip>
//     );
//   });
class LabTable extends Component{
    constructor(props) {
        super(props);
        this.state = {
            medicalListData:[],
            pageNumber: 1,
            previewData:'',
            textareaVal:'',
            reportVersionId:'',
            laboratoryReportList:[],
            laboratoryReportVersionList:[],
            laboratoryReportCommentList:[],
            requestDetail:null,
            explainChecked:false,
            reviewChecked:false,
            screenedChecked:false,
            checkBoxListFlag:false
        };
    }
    checkFollowUpStatus =(value)=>{
        let temObj= Enum.ACTION_STATUS.find((statuObj) => {
            return statuObj.value === value;
          });
        if(temObj!=null&&temObj!=undefined){
            return temObj.label;
        }
        return '';
    }
    render() {
        const { classes, laboratoryReportList = [], laboratoryReportVersionList = [], reportDetailReportId = '', reportVersionId = '', changeReportVersion, changeReportDetail } = this.props;
        return (
             <Grid container>
                <Grid item xs={3} style={{ maxWidth: '31.33%', flexBasis: '31.33%' }}>
                    <Typography className={classes.title} component="div">Report Details</Typography>
                    <Typography className={classes.table} component="div" style={{ height: 328, marginLeft: 5 }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#7BC1D9' }} className={classes.table_head}  >
                                    <TableCell
                                        className={classes.table_header}
                                        padding={'none'}
                                        style={{ width: '14%' }}
                                    >
                                        Report Received Date
                                    </TableCell>
                                    <TableCell className={classes.table_header}
                                        padding={'none'}
                                        style={{ width: '8%' }}
                                    >
                                        Lab No.
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {laboratoryReportList.length > 0 ? laboratoryReportList.map((item, index) => (
                                    <TableRow
                                        className={item.ioeReportId === reportDetailReportId ? classes.table_row_selected : classes.table_row}
                                        key={index}
                                        onClick={() => changeReportDetail(item, index)}
                                    >
                                        <TableCell padding={'none'}
                                            className={item.ioeReportId === reportDetailReportId ? classes.table_cellIoe : classes.table_cell}
                                        >
                                            {moment(item.rptRcvDatetime).format(Enum.DATE_FORMAT_24_HOUR)}
                                        </TableCell>
                                        <TableCell
                                            className={item.ioeReportId === reportDetailReportId ? classes.table_cellIoe : classes.table_cell}
                                        >
                                            {item.labNum}
                                        </TableCell>
                                    </TableRow>
                                )) :
                                    <TableRow >
                                        <TableCell className={classes.tableNoDataLabel} colSpan={2} align="center">
                                            There is no data.
                                        </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                    </Typography>
                </Grid>
                <Grid item style={{ maxWidth: '2%', flexBasis: '2%' }}>
                    <Typography className={classes.title} component="div" style={{ marginBottom: 24 }}></Typography>
                    <Typography component="div" style={{ height: 328, backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.5)' }}></Typography>
                </Grid>
                <Grid item xs={8}>
                    <Typography className={classes.title} component="div" style={{ marginBottom: 24 }}></Typography>
                    <Typography className={classes.table} component="div" style={{ height: 328, marginRight: 5 }}>
                        <Table classes={{root:classes.table_width}}>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#7BC1D9' }} className={classes.table_head}  >
                                    <TableCell
                                        className={classes.table_header}
                                        padding={'none'}
                                    >
                                        Report Version
                                    </TableCell>
                                    <TableCell
                                        className={classes.table_header}
                                        padding={'none'}
                                        style={{ width: '8%' }}
                                    >
                                        Report Status
                                    </TableCell>
                                    <TableCell
                                        className={classes.table_header}
                                        padding={'none'}
                                        style={{ width: '8%' }}
                                    >
                                        Follow-up Status
                                    </TableCell>
                                    <TableCell
                                        className={classes.table_header}
                                        padding={'none'}
                                    >
                                        Screened Date
                                    </TableCell>
                                    <TableCell
                                        className={classes.table_header}
                                        padding={'none'}
                                    >
                                        Screened By
                                    </TableCell>
                                    <TableCell
                                        className={classes.table_header}
                                        padding={'none'}
                                    >
                                        Reviewed Date
                                    </TableCell>
                                    <TableCell
                                        className={classes.table_header}
                                        padding={'none'}
                                    >
                                        Reviewed By
                                    </TableCell>
                                    <TableCell
                                        className={classes.table_header}
                                        padding={'none'}
                                    >
                                        Explained Date
                                    </TableCell>
                                    <TableCell
                                        className={classes.table_header}
                                        padding={'none'}
                                    >
                                        Explained By
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                laboratoryReportVersionList.length > 0 ? laboratoryReportVersionList.map((item, index) => {
                                    if(item.deleteLine){
                                        return(
                                            <TableRow
                                                className={item.ioeReportId === reportVersionId ? classes.table_row_selected : classes.table_row}
                                                key={index}
                                                onClick={() => changeReportVersion(item)}
                                            >
                                            <TableCell style={{textDecoration:'line-through'}} padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {moment(item.rptRcvDatetime).format(Enum.DATE_FORMAT_24_HOUR)}
                                            </TableCell>
                                            <TableCell  style={{textDecoration:'line-through'}} padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.rptStsValue}
                                            </TableCell>
                                            <TableCell style={{textDecoration:'line-through'}} padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {this.checkFollowUpStatus(item.rptFlwSts)}
                                            </TableCell>
                                            <TableCell  style={{textDecoration:'line-through'}} padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.scrnDatetime === null ? '' : moment(item.scrnDatetime).format(Enum.DATE_FORMAT_24_HOUR)}
                                            </TableCell>
                                            <TableCell style={{textDecoration:'line-through'}} padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.scrnBy}
                                            </TableCell>
                                            <TableCell style={{textDecoration:'line-through'}} padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.reviewDatetime === null ? '' : moment(item.reviewDatetime).format(Enum.DATE_FORMAT_24_HOUR)}
                                            </TableCell>
                                            <TableCell style={{textDecoration:'line-through'}} padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.reviewBy}
                                            </TableCell>
                                            <TableCell style={{textDecoration:'line-through'}} padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.explainDatetime === null ? '' : moment(item.explainDatetime).format(Enum.DATE_FORMAT_24_HOUR)}
                                            </TableCell>
                                            <TableCell style={{textDecoration:'line-through'}} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.explainBy}
                                            </TableCell>
                                        </TableRow>
                                        );
                                    }else{
                                        return(
                                            <TableRow
                                                className={item.ioeReportId === reportVersionId ? classes.table_row_selected : classes.table_row}
                                                key={index}
                                                onClick={() => changeReportVersion(item)}
                                            >
                                            <TableCell  padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {moment(item.rptRcvDatetime).format(Enum.DATE_FORMAT_24_HOUR)}
                                            </TableCell>
                                            <TableCell   padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.rptStsValue}
                                            </TableCell>
                                            <TableCell  padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {this.checkFollowUpStatus(item.rptFlwSts)}
                                            </TableCell>
                                            <TableCell   padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.scrnDatetime === null ? '' : moment(item.scrnDatetime).format(Enum.DATE_FORMAT_24_HOUR)}
                                            </TableCell>
                                            <TableCell  padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.scrnBy}
                                            </TableCell>
                                            <TableCell  padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.reviewDatetime === null ? '' : moment(item.reviewDatetime).format(Enum.DATE_FORMAT_24_HOUR)}
                                            </TableCell>
                                            <TableCell  padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.reviewBy}
                                            </TableCell>
                                            <TableCell  padding={'none'} className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.explainDatetime === null ? '' : moment(item.explainDatetime).format(Enum.DATE_FORMAT_24_HOUR)}
                                            </TableCell>
                                            <TableCell  className={item.ioeReportId === reportVersionId ? classes.table_cellIoe : classes.table_cell} >
                                                {item.explainBy}
                                            </TableCell>
                                        </TableRow>
                                        );
                                    }
                                })
                                   :
                                    <TableRow >
                                        <TableCell className={classes.tableNoDataLabel} colSpan={9} align="center">
                                            There is no data.
                                        </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                    </Typography>
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(LabTable);

