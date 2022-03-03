import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { styles } from './JOSListStyle';
import { withStyles } from '@material-ui/core/styles';
import { Typography, ListItem, List, Grid } from '@material-ui/core';
import ListItemText from '@material-ui/core/ListItemText';

class JOSList extends Component {
  constructor(props) {
    super(props);
    let { loginServiceCd } = props;
    this.state = {
      details: {
        urgent: '',
        diagnosis: '',
        clinicCd: '',
        clinicName: '',
        reportTo: '',
        clinicalNumber: '',
        specimen: '',
        remark: '',
        instruction: '',
        encounterId: '',
        ioeRequestNumber: '',
        requestUser: '',
        // requestUserName: '',
        requestLoginName:'',
        requestDatetime: '',
        question: '',
        test: '',
        requestByName: '',
        serviceCd: loginServiceCd
      }
    };
  }

  render() {
    let { detailsState } = this.state;
    const { classes, details = detailsState } = this.props;
    let specimen = details.specimen === null ? [] : details.specimen.replace(/-\|-/g,',');
    let test = details.test === null ? [] : details.test.replace(/-\|-/g,',');
    let question = details.question === null ? [] : details.question.replace(/-\|-/g,',');
    return (
      <List className={classes.root}>
        <ListItem
            alignItems="flex-end"
            className={details.urgent > 0 ? null : classes.display}
            classes={{ root: classes.itemRoot }}
        >
          <ListItemText
              primary={
              <Grid container>
                <Typography
                    component="div"
                    variant="body3"
                    className={classes.redFont}
                    color="textPrimary"
                >
                  Urgent
                </Typography>
                <Typography component="div" variant="body3"></Typography>
              </Grid>
            }
          />
        </ListItem>
        <ListItem alignItems="flex-start" classes={{ root: classes.itemRoot }}>
          <Typography
              component="div"
              className={classes.inline}
              color="textPrimary"
          >
            Ix Request No. (IRN):
          </Typography>
          <Typography component="div" className={classes.context}>
            {details.ioeRequestNumber}
          </Typography>
        </ListItem>
        {/* <Divider variant="inset" component="li" className={classes.margin}/> */}
        <ListItem alignItems="flex-start" classes={{ root: classes.itemRoot }}>
          <Typography
              component="div"
              className={classes.inline}
              color="textPrimary"
          >
            Clinical Summary & Diagnosis:
          </Typography>
          <Typography component="div" className={classes.context}>
            {details.diagnosis}
          </Typography>
        </ListItem>
        {/* <Divider variant="inset" component="li" className={classes.margin}/> */}
        <ListItem alignItems="flex-start" classes={{ root: classes.itemRoot }}>
          <Typography
              component="div"
              className={classes.inline}
              color="textPrimary"
          >
            Requesting Unit:
          </Typography>
          <Typography component="div" className={classes.context}>
            {details.clinicName !== null
              ? details.clinicName
              : details.clinicCd}
          </Typography>
        </ListItem>
        {/* <Divider variant="inset" component="li" className={classes.margin}/> */}
        <ListItem alignItems="flex-start" classes={{ root: classes.itemRoot }}>
          <Typography
              component="div"
              className={classes.inline}
              color="textPrimary"
          >
            Report To:
          </Typography>
          <Typography component="div" className={classes.context}>
            {details.reportTo !== null ? details.reportTo : ''}
          </Typography>
        </ListItem>
        {/* <Divider variant="inset" component="li" className={classes.margin}/> */}
        <ListItem alignItems="flex-start" classes={{ root: classes.itemRoot }}>
          <Typography
              component="div"
              className={classes.inline}
              color="textPrimary"
          >
            Requested By:
          </Typography>
          <Typography component="div" className={classes.context}>
            {details.requestUser}
          </Typography>
        </ListItem>
        {/* <Divider variant="inset" component="li" className={classes.margin}/> */}
        <ListItem alignItems="flex-start" classes={{ root: classes.itemRoot }}>
          <Typography
              component="div"
              className={classes.inline}
              color="textPrimary"
          >
            Request Date:
          </Typography>
          <Typography component="div" className={classes.context}>
            {moment(details.requestDatetime).format('DD-MMM-YYYY')}
          </Typography>
        </ListItem>
        {/* <Divider variant="inset" component="li" className={classes.margin}/> */}
        <ListItem alignItems="flex-start" classes={{ root: classes.itemRoot }}>
          <Typography
              component="div"
              className={classes.inline}
              color="textPrimary"
          >
            Clinic Ref. No.:
          </Typography>
          <Typography component="div" className={classes.context}>
            {details.clinicalNumber}
          </Typography>
        </ListItem>
        {/* <Divider variant="inset" component="li" className={classes.margin}/> */}
        <ListItem alignItems="flex-start" classes={{ root: classes.itemRoot }}>
          <Typography
              component="div"
              className={classes.inline}
              color="textPrimary"
          >
            Test:
          </Typography>
          <Typography component="div" className={classes.context}>
            <Typography component="span" variant="body3">{test}</Typography>
          </Typography>
        </ListItem>
        {/* <Divider variant="inset" component="li" className={classes.margin}/> */}
        <ListItem alignItems="flex-start" classes={{ root: classes.itemRoot }}>
          <Typography
              component="div"
              className={classes.inline}
              color="textPrimary"
          >
            Specimen:
          </Typography>
          <Typography component="div" className={classes.context}>
            <Typography component="span" variant="body3">{specimen}</Typography>
          </Typography>
        </ListItem>
        {/* <Divider variant="inset" component="li" className={classes.margin}/> */}
        <ListItem alignItems="flex-start" classes={{ root: classes.itemRoot }}>
          <Typography
              component="div"
              className={classes.inline}
              color="textPrimary"
          >
            Question:
          </Typography>
          <Typography component="div" className={classes.context}>
            {question}
          </Typography>
        </ListItem>
        {/* <Divider variant="inset" component="li" className={classes.margin}/> */}
        <ListItem alignItems="flex-start" classes={{ root: classes.itemRoot }}>
          <Typography
              component="div"
              className={classes.inline}
              color="textPrimary"
          >
            Remark:
          </Typography>
          <Typography component="div" className={classes.context}>
            {details.remark}
          </Typography>
        </ListItem>
        {/* <Divider variant="inset" component="li" className={classes.margin}/> */}
        <ListItem alignItems="flex-start" classes={{ root: classes.itemRoot }}>
          <Typography
              component="div"
              className={classes.inline}
              color="textPrimary"
          >
            Instruction:
          </Typography>
          <Typography component="div" className={classes.context}>
            {details.instruction}
          </Typography>
        </ListItem>
        {/* <Divider variant="inset" component="li" className={classes.margin}/> */}
      </List>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    serviceListData: state.clinicalNote.serviceListData,
    service: state.clinicalNote.service,
    loginInfo: state.login.loginInfo,
    loginServiceCd: state.login.service.serviceCd
    // clinicList: state.ixRequest.clinicList
  };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(JOSList));
