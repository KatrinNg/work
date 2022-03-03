import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import CardMedia from '@material-ui/core/CardMedia';
import { Card } from '@material-ui/core';
import clsx from 'clsx';
import List from '@material-ui/core/List';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DtsEditQualifierFields from './DtsEditQualifierFields';

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
    minHeight: 56,
    '&$expanded': {
      minHeight: 56
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
    padding: theme.spacing(0),
    width: '100%'
  }
}))(MuiExpansionPanelDetails);

const useStyles = makeStyles(theme => ({
  root: {
    // backgroundColor: theme.palette.background.paper,
    // width: 720,
    height: '100%'
  },
  tabs: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },

  hide: {
    display: 'none'
  },

  heading: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeightRegular
  }
  ,
  tabLabel: {
    fontSize: 12,
    minWidth: 72
  }
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
        component="div"
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
    >
      {value === index && <Box p={0} >{children}</Box>}
    </Typography>
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

export default function DentalChartMenu(props) {
  const classes = useStyles();

  const [value, setValue] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  // if(props !== null && props.pname) {

  // }

  const handleChange = (event, newValue) => {
    console.log('handleChange ==> ' + event);
    console.log('handleChange ==> ' + event.value);
    setValue(newValue);
  };
  const handlePanelChange = panel => (event, isExpanded) => {
    console.log('handlePanelChange ==> ' +panel);
    setExpanded(isExpanded ? panel : false);
  };

  const problemsMap = [
    {
      pname: 'Endo',
      pdetail: [
        'Irreversible pulpitis',
        'Necrotic pulp',
        'Previous RCT',
        'Previous pulp therapy',
        'A. apical periodontitis',
        'C. apical periodontitis',
        'A. apical abscess',
        'C. apical abscess',
        'Radicular cysts',
        'Blocked canals',
        'Root perforation',
        'Ext. root resorption',
        'Open apex',
        'Cracked tooth',
        'Crown #',
        'Crown-root #',
        'Root#'
      ]
    },
    { pname: 'FD', pdetail: [] },
    { pname: 'GD', pdetail: [
      'Missing tooth',
      'Impacted tooth',
      'Unerupted tooth',
      'Retained root',
      'Existing filling',
      'Existing fissure sealant',
      'Existing crown',
      'Existing bridge',
      'Existing implant',
      'Previous RCT',
      'Caries',
      'Defective filling',
      'Abrasion (by tooth)',
      'Erosion (by tooth)',
      'Attrition (by tooth)',
      'Crown fracture',
      'Crown-root fracture',
      'Root fracture'
    ] },
    { pname: 'GP', pdetail: [
      'Missing tooth',
      'Impacted tooth',
      'Unerupted tooth',
      'Retained root',
      'Existing filling',
      'Existing fissure sealant',
      'Existing crown',
      'Existing bridge',
      'Existing implant',
      'Previous RCT',
      'Caries',
      'Defective filling',
      'Abrasion (by tooth)',
      'Erosion (by tooth)',
      'Attrition (by tooth)',
      'Crown fracture',
      'Crown-root fracture',
      'Root fracture'
    ] },
    { pname: 'OMS', pdetail: [
      'Teeth impaction',
      'Supernumerary tooth',
      'Facial cellulitis',
      'Dental abscess',
      'Periodontal abscess',
      'Orofacial abscess',
      'Radicular cyst',
      'Dentigerous cyst',
      '# zygomatic complex',
      '# mandible angle',
      '# mandible condyle',
      'Dental luxation',
      'Dental avulsion',
      'Radiation caries',
      'TMJ dislocation',
      'TMJ int. derangement',
      'Trigeminal neuralgia'

    ] },
    { pname: 'Ortho', pdetail: [
      'Class I malocclusion',
      'Class II / 1 malocclusion',
      'Class II / 2 malocclusion',
      'Class III malocclusion',
      'Skeletal I relationship',
      'Skeletal II relationship',
      'Skeletal III relationship',
      'Increased overjet',
      'Reverse overjet',
      'Increased overbite',
      'Anterior open bite (AOB)',
      'Dental midline shifted',
      'Anterior crossbite',
      'Posterior crossbite',
      'Proclined incisor',
      'Retroclined incisor',
      'Crowding of dental arch',
      'Spacing of dental arch'
    ] },
    { pname: 'Perio', pdetail: [
      'Peri-implantitis',
      'OH good',
      'OH fair',
      'OH poor',
      'Plaque induced ging dis',
      'Drug inflen ging enlarg',
      'Trauma ging lesion',
      'Local mod C.periodontitis',
      'Local sev C.periodontitis',
      'Gen mod C.periodontitis',
      'Gen sev C.periodontitis',
      'Local aggre periodontitis',
      'Gen aggre periodontitis',
      'NUG',
      'Den resto ging dis perio',
      'Rt # ging dis perio',
      'Ging recession',
      'Peri-implant mucositis'
    ] },
    { pname: 'Pros', pdetail: [
      'Complete edentulism',
      'Missing tooth',
      'Existing Crown',
      'Existing Bridge Pontic',
      'Resin-bonded Retainer',
      'Bridge extension (red line)',
      'Existing implant',
      'Horiz Ridge Resorption',
      'Vert Ridge Resorption',
      'Denture retention inadequate',
      'Denture fracture',
      'Fix Pros - Loss of Retention',
      'Fix Pros - Deficient margin'
    ] },
    { pname: 'RD', pdetail: [

      'Bridge extension (red line)',
      'Crown/Onlay',
      'Bridge retainer',
      'Bridge pontic',
      'Loss of retention (Fixed)',
      'Porcelain # (Fixed)',
      'Framework # (Fixed)',
      'Crown # (tooth)',
      'Root # (tooth)',
      'Crown-root # (tooth)',
      'Defective restoration',
      'Discoloured margin',
      'Discoloured restoration',
      'Overhang margin'
    ] }
  ];

  const procMap = [
    {
      pname: 'Endo',
      pdetail: [
        'Endo cons',
        'Endo review',
        'Endo case discharge',
        'EPT',
        'Pulpo 1st visit (Perm)',
        'RCT 1st visit',
        'RCT subseq visit',
        'RCT obturation',
        'RC Retx 1st visit',
        'RC Retx subseq visit',
        'RC Retx obturation',
        'Single visit RCT',
        'Apicoectomy-Retrograde F',
        'Temp Restoration (TD)',
        'Prefab SS post',
        'Prefab Non-metal post',
        'Non-vital bleaching'

      ]
    },
    { pname: 'FD', pdetail: [
      'FD Cons (Endo)',
      'FD Cons (Pros) ',
      'FD Cons (Implant)',
      'Discharge from FD'

    ] },
    {
      pname: 'GD',
      pdetail: [
        'New Cons',
        'Recall',
        'Old Cons',
        'Urgent',
        'BW',
        'PA',
        'Scaling',
        'Fit',
        'Filling (Amalgam)',
        'Filling (GIC Light Cure)',
        'Filling (Composite)',
        'Pulpectomy',
        'Caries Prevention Advice',
        'Tooth Wear Management',
        'TB practice',
        'IDB practice',
        'Floss practice',
        'OHI (advice only)'

      ]
    },
    { pname: 'GP', pdetail: [
      'Urgent',
      'PA',
      'TTP',
      'LA(infiltration)',
      'LA(ID block)',
      'LA(intraligamental)',
      'Extraction of tooth',
      'Extraction of root',
      'Surgical extraction of root',
      'Control of bleeding',
      'Suturing of wound',
      'Removal of suture',
      'Manage post-op complication',
      'Informed consent',
      'Referral to OMS'

    ] },
    { pname: 'OMS', pdetail: [
      'New OMS consultation',
      'Review / Follow-up',
      'Ext of tooth',
      'Surg ext. (impaction)',
      'Oral suturing',
      'Oral sutures removal',
      'Oral biopsy',
      'Orofacial abscess I & D',
      'Control of bleeding',
      'Dental trauma - Splinting',
      'Enucleation of jaw cyst',
      'Odont. Tumour excision',
      'Implant fixture placement',
      'Heal. Abutment placement',
      'Orthognathic work-up',
      'TMD conservative Tx',
      'OMS applicance delivery'

    ] },

    { pname: 'Ortho', pdetail: [
      'Ortho referral consult',
      'Ortho pretreat consult',
      'Ortho record taking',
      'OPG',
      'Lat Ceph',
      'Treatment planning',
      'Fit separator',
      'Banding',
      'Bonding',
      'Fit multiband app',
      'Adjust multiband app',
      'Remove multiband app',
      'Working impression- Ortho',
      'Fit removable retainer',
      'Adjust removable retainer',
      'Fit removable FN app',
      'Adjust removable FN app',
      'Fit palatal arch'

    ] },
    { pname: 'Perio', pdetail: [
      'Review',
      'Perio cons',
      'Perio case discharge',
      'OHI',
      'Scaling',
      'Root debride FM',
      'Root debride Q',
      'Root debride (tooth)',
      'Implant debride',
      'Adjunct nonsurg tx-sys',
      'Adjunct nonsurg tx-local',
      'Support perio therapy',
      'Open flap X osteop',
      'Open flap w osteop',
      'Open flap deb implant',
      'Tooth root resect',
      'Tooth hemisect'

    ] },
    { pname: 'Pros', pdetail: [
      'Comp Dent - 1st Imp',
      'Comp Dent - Wking Imp',
      'Comp Dent - Bite',
      'Comp Dent - Tryin',
      'Comp Dent - Iss (acrylic)',
      'Comp Dent - Adjust',
      'Parital Dent - 1st Imp',
      'Partial Dent - Tooth prep',
      'Partial Dent - Wking Imp',
      'Partial Dent - MF',
      'Partial Dent - Bite',
      'Partial Dent - Tryin',
      'Partial Dent - Iss (acrylic)',
      'Partial Dent - Adjust',
      'Crown/Onlay Tooth Prep',
      'Issue Crown/Onlay'

    ] },
    { pname: 'RD', pdetail: [
      'Crown/ Onlay Prep.',
      'Crown/ Onlay Issue',
      'Crown/ Onlay (Temp C.)',
      'Crown/ Onlay (Temp Lab)',
      'Crown/ Onlay Re-cement',
      'Bridge Prep.',
      'Bridge Issue',
      'Bridge (Temp C.)',
      'RBB Prep.',
      'RBB Try-in',
      'RBB Issue',
      'RBB Recementation',
      'Cast Post & Core Prep.',
      'Cast Post & Core Issue',
      'Removal of Crown/ Onlay',
      'Removal of Bridge',
      'Removal of Bridge (Part.)',
      'Removal of RBB'

    ] }
  ];

  const createMenu = (menuName,menuPrefix, menuDataMap) =>{
    return (<CardMedia >
      {/*<CardMedia title={menuName}>*/}
      <List dense>
        {/* {menuDataMap.map(menuData => (
          <ExpansionPanel
              key
              expanded={expanded === `panel${menuPrefix}${menuData.pname}`}
              onChange={handlePanelChange(`panel${menuPrefix}${menuData.pname}`)}
              dense
          >
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={'panel'+menuPrefix+menuData.pname+'bh-content'}
                id={'panel'+menuPrefix+menuData.pname+'bh-header'}
            >
              <Typography className={classes.heading}>
                {menuData.pname}
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <List disablePadding dense style={{ width: '100%' }}>
                {menuData.pdetail.map((ntext, nindex) => (
                  <ListItem
                      key
                      button
                      className={classes.nested}
                      dense

                  >
                    <ListItemText
                        classes={{ primary: classes.list_text }}
                        primary={ntext}
                    />
                  </ListItem>
                ))}
              </List>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        ))} */}
      </List>
    </CardMedia>);

  };

  return (
    <Box className={classes.root} >
      <Tabs
          orientation="vertical"
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
        //textColor="primary"
        // variant="fullWidth"
          dense
      >
        <Tab label="Problem" {...a11yProps(0)} className={classes.tabLabel} dense />
        <Tab label="Procedure" {...a11yProps(1)} className={classes.tabLabel} dense/>
        <Tab label="Reset" {...a11yProps(2)} className={classes.tabLabel} dense/>
        <Tab label="Qualifier" {...a11yProps(3)} className={classes.tabLabel} dense/>
      </Tabs>
      <main
          className={clsx(classes.content, {
          [classes.contentShift]: open
        })}
      >
        <TabPanel value={value} index={0} dir="left">
          {createMenu('Problem','prob',problemsMap)}
          <CardMedia title="Problem" />
        </TabPanel>
        <TabPanel value={value} index={1} dir="left">
          {createMenu('Procedure','proc',procMap)}
        </TabPanel>
        <TabPanel value={value} index={3} dir="left">
          <CardMedia title="Reset" />
        </TabPanel>
        <TabPanel value={value} index={3} dir="left">
          <CardMedia title="Qualifier" >
          </CardMedia>
          <DtsEditQualifierFields />
        </TabPanel>
      </main>
    </Box>
  );
}
