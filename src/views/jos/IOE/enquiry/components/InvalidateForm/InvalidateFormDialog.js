import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead
} from '@material-ui/core';
import CIMSButton from '../../../../../../components/Buttons/CIMSButton';
import EditTemplateDialog from '../../../../../administration/editTemplate/components/EditTemplateDialog';
import { openCommonMessage } from '../../../../../../store/actions/message/messageAction';
import { openCommonCircularDialog,closeCommonCircularDialog } from '../../../../../../store/actions/common/commonAction';
import { isNull } from 'lodash';
import * as actionTypes from '../../../../../../store/actions/IOE/enquiry/enquiryActionType';
import * as commonConstants from '../../../../../../constants/common/commonConstants';
import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const useStyles = () => ({
  fontLabel: {
    fontSize: font.fontSize,
    fontWeight: 400,
    fontFamily: font.fontFamily
  },
  paper: {
    borderRadius: 5,
    minWidth: '65%',
    maxWidth: '100%',
    overflowY: 'unset'
  },
  textareaStyle: {
    color: color.cimsTextColor,
    margin: 10,
    width: 'calc(100% - 210px)',
    minHeight: 100,
    resize: 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    fontFamily: font.fontFamily,
    fontSize: font.fontSize,
    borderRadius: 5,
    border: '2px solid #404040',
    backgroundColor:color.cimsBackgroundColor,
    '&:focus': {
      outline: 'none',
      border: '2px solid #0579C8',
      borderRadius: 5
    }
  },
  specimenStatus: {
    color: 'red',
    border: 'none',
    fontSize: font.fontSize,
    fontWeight: 400,
    fontFamily: font.fontFamily
  },
  reportStatus: {
    color: color.cimsPlaceholderColor,
    fontSize: font.fontSize,
    fontWeight: 400,
    fontFamily: font.fontFamily
  },
  lastTableCell: {
    paddingRight: 10
  },
  tabCell: {
    border: 'none',
    fontSize: font.fontSize,
    fontWeight: 400,
    fontFamily: font.fontFamily
  },
  divIncludeTable: {
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: 450,
    width: '100%',
    marginBottom: 10
  },
  tabHead:{
    color: '#404040',
    borderStyle:'none',
    backgroundColor:color.cimsBackgroundColor,
    borderBottom: '2px solid #B8BCB9'
  },
  cardContent: {
    '&:last-child':{
      backgroundColor:color.cimsBackgroundColor
    }
  }
});

class InvalidateFormDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noteContent: ' '
    };
  }

  handleCloseDialog = () => {
    const { handleClose,insertIxEnquiryLog,enquiryList } = this.props;
    this.setState({
      noteContent: ' '
    });
    let divOpen;
    for (let index = 0; index < enquiryList.length; index++) {
      if (this.valueValidation(enquiryList[index].ioeReportId) || enquiryList[index].isInvld === 1) {
        divOpen = false;
      } else { divOpen = true; break; }
    }
    insertIxEnquiryLog&&insertIxEnquiryLog(`[Delete Request Order Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} '${divOpen ? 'Cancel' : 'OK'}' button`,'');
    handleClose && handleClose();
  };

  //验证值不为空和Null
  valueValidation = (value) => {
    let validationCheck = true;
    if (isNull(value) || (value + '').trim() === '') {
      validationCheck = false;
    }
    return validationCheck;
  };

  handleEscKeyDown = () => {
    this.handleCloseDialog();
  };

  changeReason = (e) => {
    this.setState({
      noteContent: e.target.value
    });
  };

  handleClickConfirm = () => {
    const { enquiryList, dispatch, handleInvalidateFormCallback, initialParm,insertIxEnquiryLog,handleClose } = this.props;
    let { noteContent } = this.state;
    let array=[];
    insertIxEnquiryLog&&insertIxEnquiryLog(`[Delete Request Order Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Confirm' button`, '/ioe/listLaboratoryRequest');
    for (let index = 0; index < enquiryList.length; index++) {
      const element = enquiryList[index];
      if (element.isInvld === 1 || this.valueValidation(element.ioeReportId)) {
        continue;
      } else {
        element.invldReason = noteContent;
        array.push(element);
      }
    }
    dispatch(openCommonCircularDialog());
    dispatch({
      type: actionTypes.saveEnquiryInvalidateReason,
      params: array,
      callback: (data) => {
        if(data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          let payload = {
            msgCode: data.msgCode,
            btnActions:
            {
              btn1Click: () => {
                handleInvalidateFormCallback && handleInvalidateFormCallback(initialParm);
                this.setState({  noteContent: ' ' });
                handleClose && handleClose();
              },
              btn2Click: () => {
                dispatch(closeCommonCircularDialog());
              }
            }
          };
          dispatch(openCommonMessage(payload));
        }else{
          const payload = {
            msgCode: data.msgCode,
            showSnackbar: true
          };
          dispatch(openCommonMessage(payload));
          handleInvalidateFormCallback && handleInvalidateFormCallback(initialParm);
          this.setState({  noteContent: ' ' });
          handleClose&&handleClose();
        }
      }
    });
  };

  generateRows = () => {
    const { classes, enquiryList } = this.props;
    let rows = [];
    enquiryList.map((row, index) => {
      if (this.valueValidation(row.ioeReportId)) {
        rows.push(
          <TableRow key={index}>
            <TableCell
                style={{ border: 'none' }}
                align="left"
                className={classes.reportStatus}
            >
              {row.ioeRequestNumber}
            </TableCell>
            <TableCell
                style={{ border: 'none' }}
                align="left"
                className={classes.reportStatus}
            >
              {row.formName}
            </TableCell>
            <TableCell
                style={{ border: 'none', maxWidth: 300 }}
                align="left"
                className={classes.reportStatus}
            >
              {row.test}
            </TableCell>
            <TableCell
                style={{ border: 'none', maxWidth: 200 }}
                align="left"
                className={classes.reportStatus}
            >
              {row.specimen}
            </TableCell>
            <TableCell
                style={{ border: 'none', paddingRight: 10 }}
                align="left"
                className={classes.reportStatus}
            >
              Report Received
            </TableCell>
          </TableRow>
        );
      } else if (row.isInvld === 1) {
        rows.push(
          <TableRow key={index}>
            <TableCell
                style={{ border: 'none' }}
                align="left"
                className={classes.reportStatus}
            >
              {row.ioeRequestNumber}
            </TableCell>
            <TableCell
                style={{ border: 'none' }}
                align="left"
                className={classes.reportStatus}
            >
              {row.formName}
            </TableCell>
            <TableCell
                style={{ border: 'none', maxWidth: 300 }}
                align="left"
                className={classes.reportStatus}
            >
              {row.test}
            </TableCell>
            <TableCell
                style={{ border: 'none', maxWidth: 200 }}
                align="left"
                className={classes.reportStatus}
            >
              {row.specimen}
            </TableCell>
            <TableCell
                style={{ border: 'none', paddingRight: 10 }}
                align="left"
                className={classes.reportStatus}
            >
             Order Deleted
            </TableCell>
          </TableRow>
        );
      } else if (row.specimenCollected === 1) {
        rows.push(
          <TableRow key={index}>
            <TableCell
                align="left"
                style={{ border: 'none' }}
                className={classes.specimenStatus}
            >
              {row.ioeRequestNumber}
            </TableCell>
            <TableCell
                align="left"
                style={{ border: 'none' }}
                className={classes.specimenStatus}
            >
              {row.formName}
            </TableCell>
            <TableCell
                align="left"
                style={{ border: 'none', maxWidth: 300 }}
                className={classes.specimenStatus}
            >
              {row.test}
            </TableCell>
            <TableCell
                align="left"
                style={{ border: 'none', maxWidth: 200 }}
                className={classes.specimenStatus}
            >
              {row.specimen}
            </TableCell>
            <TableCell
                align="left"
                style={{ border: 'none', paddingRight: 10,fontWeight: 'bold' }}
                className={classes.specimenStatus}
            >
              Specimen Taken
            </TableCell>
          </TableRow>
        );
      } else {
        rows.push(
          <TableRow key={index}>
            <TableCell align="left"  className={classes.tabCell}>
              {row.ioeRequestNumber}
            </TableCell>
            <TableCell align="left" className={classes.tabCell}>
              {row.formName}
            </TableCell>
            <TableCell align="left" className={classes.tabCell} style={{ maxWidth: 300 }}>
              {row.test}
            </TableCell>
            <TableCell align="left" className={classes.tabCell} style={{ maxWidth: 200 }}>
              {row.specimen}
            </TableCell>
            <TableCell
                align="left"
                className={classes.tabCell}
                style={{ paddingRight: 10 }}
            ></TableCell>
          </TableRow>
        );
      }
    });
    return rows;
  };


  render() {
    const { classes, invalidateFormDialogOpen,enquiryList } = this.props;
    let divOpen;
    for (let index = 0; index < enquiryList.length; index++) {
      //简答粗暴
      // if (this.valueValidation(enquiryList[index].ioeReportId)) {
      //   divOpen = false;
      // } else if (enquiryList[index].isInvld === 1) {
      //   divOpen = false;
      // } else if (enquiryList[index].specimenCollected === 1) {
      //   divOpen = true; break;
      // } else { divOpen = true; break; }
      if (this.valueValidation(enquiryList[index].ioeReportId) || enquiryList[index].isInvld === 1) {
        divOpen = false;
      }
      else { divOpen = true; break; }
    }
    return (
      <EditTemplateDialog
          dialogTitle={'Delete Request Order'}
          open={invalidateFormDialogOpen}
          handleEscKeyDown={this.handleEscKeyDown}
          classes={classes}
      >
        <Card id={'deleteRequestOrderDialog'} component="div" style={{ margin: '15px 15px 8px 15px' }}>
          <CardContent classes={{root:classes.cardContent}}>
            <div className={classes.divIncludeTable}>
              <Table>
                <TableHead>
                  <TableCell className={classes.tabHead}>Request No.</TableCell>
                  <TableCell className={classes.tabHead}>Form Name</TableCell>
                  <TableCell className={classes.tabHead}>Test Profile</TableCell>
                  <TableCell className={classes.tabHead}>Specimen</TableCell>
                  <TableCell className={classes.tabHead}>Ix Request Status</TableCell>
                </TableHead>
                <TableBody>{this.generateRows()}</TableBody>
              </Table>
            </div>
            <div style={{ display: divOpen ? 'flex' : 'none' }}>
              <span style={{ marginTop: 48, width: 210 }}>
                Please specify the reason :
              </span>
              <textarea
                  id="invalidateRequestOrderReasonTextarea"
                  component="textarea"
                  onChange={this.changeReason}
                  className={classes.textareaStyle}
                  value={this.state.noteContent}
              />
            </div>
          </CardContent>
        </Card>
        <Typography component="div">
          <Grid alignItems="center" container justify="flex-end">
            <Typography component="div" style={{ display: divOpen ? 'block' : 'none' }}>
              <CIMSButton
                  classes={{ label: classes.fontLabel}}
                  color="primary"
                  id="invalidateRequestOrderBtnConfirm"
                  onClick={() => this.handleClickConfirm()}
                  size="small"
              >
                Confirm
              </CIMSButton>
            </Typography>
            <CIMSButton
                classes={{
                label: classes.fontLabel
              }}
                color="primary"
                id="invalidateRequestOrderBtnConcel"
                onClick={() => this.handleCloseDialog()}
                size="small"
            >
              {divOpen ? 'Cancel' : 'OK'}
            </CIMSButton>
          </Grid>
        </Typography>
      </EditTemplateDialog>
    );
  }
}

function mapStateToProps(state) {
  return {
    tokenTemplateList: state.tokenTemplateManagement.tokenTemplateList
  };
}

const mapDispatchToProps = (dispatch) => {
  return { dispatch };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(useStyles)(InvalidateFormDialog));
