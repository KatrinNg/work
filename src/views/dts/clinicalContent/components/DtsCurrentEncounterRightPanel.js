import Box from '@material-ui/core/Box';
import { withStyles } from '@material-ui/core';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import CIMSMultiTab from '../../../../components/Tabs/CIMSMultiTab';
import CIMSMultiTabs from '../../../../components/Tabs/CIMSMultiTabs';
// import DtsPerioCharts from './DtsPerioCharts';
import PerioChartViewList from '../PerioChartViewList';
import DtsClinicalNotesSearch from './DtsClinicalNotesSearch';
import DtsCurrentDentalChart from './DtsCurrentDentalChart';
import DtsEformControl from './DtsEformControl';
import DtsHistory from './DtsHistory';
import DtsPreviousEncounterSummary from './DtsPreviousEncounterSummary';

// import DtsDentalChart2 from './DtsDentalChart2';

const styles = (theme) => ({
  contents: {
    boxShadow: 'none',
    border: 0,
    maxHeight: '100%',
    overflow: 'hidden'
  },
  tabs: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  tabSpan: {
    fontSize: '1rem',
    textTransform: 'none'
  }
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
        // <Typography
        //     component="span"
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
    >
      {value === index && (<Box p={0}>{children}</Box>)}
      {/* </Typography> */}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  };
}

class DtsCurrentEncounterRightPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      open: false
    };
  }

  handleChange = (event, newValue) => {
    //setValue(newValue);
    this.setState({ value: newValue });
    // console.log('handleChange ==> newValue: ' + newValue);
    if (newValue > 0) {
      //setOpen(false);
      this.setState({ open: false });
    }
  };

  generateTabMenu = () => {
    const { classes } = this.props;
    const { value } = this.state;
    let tabsMenu = [
      { tabName: 'Chart', tabComp: <DtsCurrentDentalChart /> },
      { tabName: 'Previous', tabComp: <DtsPreviousEncounterSummary /> },
      { tabName: 'Perio', tabComp: <PerioChartViewList /> },
      { tabName: 'Document', tabComp: <DtsEformControl /> },
      { tabName: 'History', tabComp: <DtsHistory /> },
      { tabName: 'Note & Procedures', tabComp: <DtsClinicalNotesSearch /> }
    ];

    return (
      <div className={classes.contents}>
        <CIMSMultiTabs
            value={value}
            onChange={this.handleChange}
            m={0} p={0}
        >
          {tabsMenu.map((tab, index) => (
            <CIMSMultiTab disableClose label={<span className={classes.tabSpan}>{tab.tabName}</span>} {...a11yProps('`index`')} key={index} />
          ))}
        </CIMSMultiTabs>
        <main
            className={clsx(classes.content, {
            [classes.contentShift]: open
          })}
        >
          {tabsMenu.map((tab, index) => (
            <TabPanel value={value} index={index} key={index}>
              {tab.tabComp}
            </TabPanel>
          ))}

        </main>
      </div>
    );
  }


  render() {
    const { classes } = this.props;
    return (
      <div>
        {this.generateTabMenu()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  // console.log(state.dtsAppointmentAttendance.patientKey);

  return {
    latestEncounter: state.clinicalContentEncounter.latestEncounter,
    proceduresQualifiers: state.clinicalContentEncounter.proceduresQualifiersList,
    patientInfo: state.patient.patientInfo,
    notesAndProceduresList: state.clinicalContentEncounter.notesAndProceduresList
  };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsCurrentEncounterRightPanel));



