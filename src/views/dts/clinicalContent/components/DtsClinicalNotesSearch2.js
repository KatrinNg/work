/* eslint-disable no-use-before-define */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Button, Switch} from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import {FormControlLabel} from '@material-ui/core';

import {List, ListItem, ListItemText, ListItemIcon, ListItemAvatar} from '@material-ui/core';

import {Grid , Box, Paper } from '@material-ui/core';

import ReactQuill from 'react-quill'; // ES6

const useStyles = makeStyles(theme => ({
  root: {
    width: 300,
    '& > * + *': {
      marginTop: theme.spacing(3)
    }
  },
  content: {
    height: 'calc(100vh - 305px)',
    overflow: 'auto'
  }
}));

export default function DtsClinicalNotesSearch() {
  const classes = useStyles();
  const [showProcedure, setShowProcedure] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
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

  function createData(discipline, planDate, problem,qualifier, plan, status) {
    return { discipline, planDate, problem,qualifier, plan, status };
  }

  const rows = [
    createData('GD', '08-09-2019', 'Dental Caries','11', 'Plan1', 'Planned'),
    createData('FD', '10-09-2019', 'Dental Caries','18', 'Plan2', 'Completed'),
    createData('GP', '10-09-2019', 'Dental Caries','17', 'Plan3', 'Completed'),
    createData('GD', '08-09-2019', 'Dental Caries','11', 'Plan1', 'Planned'),
    createData('GP', '10-09-2019', 'Dental Caries','17', 'Plan3', 'Completed'),
    createData('GD', '08-09-2019', 'Dental Caries','11', 'Plan1', 'Planned'),
    createData('GP', '10-09-2019', 'Dental Caries','17', 'Plan3', 'Completed'),
    createData('GD', '08-09-2019', 'Dental Caries','11', 'Plan1', 'Planned'),
    createData('GP', '10-09-2019', 'Dental Caries','17', 'Plan3', 'Completed')
  ];

  const clinicalNotes = [
    {
      clinicalNote : 'Issue of 15  crown/ bridge <br />'
+ 'C/O: nil <br />'
+ 'Tx: 15  VMK crown cemented with RIVA (resin reinforced glass ionomer luting cement)<br />'
+ 'Occlusion checked/adjusted (  )<br />'
+ 'Advised to avoid hard/ sticky food<br />'
+ 'TCA: Review<br />',
    title : 'Recall',
    date : '10/01/2020',
    procedures : ['Recall done (patient reviewed)','Dental floss interdental (ID) cleaning education with intra-oral supervised practice (OHI)']
    },
    {
      clinicalNote :
      'CROWN PREPARATION & WORKING IMPRESSION<br />'
      +'C/O: nil<br />'
      +'Tx: Upper & lower primary alginate impression <br />'
      +'LA( 1 cartridges Lignocaine hydrochloride 2% + adrenaline) infiltration/ ID Block<br />'
      +'<br />'
      +'Removal of crown, bridge(conventional, hybrid, resin-bonded)<br />'
      +'15 tooth preparation for crown, bridge(conventional, hybrid, resin-bonded)<br />'
      +'Vita Shade A3<br />'
      +'Monophase working impression taken on special tray/ triple tray with #1 gingival retraction cord/ brown plastic post<br />'
      +'Temporary crown( ) cemented with IRM<br />'
      +'Occlusion checked / adjusted',
      title : 'Recall',
      date : '02/01/2020',
      procedures : ['Scaling','Upper dental arch, Lower dental arch']
    },
    {
      clinicalNote :
      'Discussion with patient about the importance of prosthetic replacement in terms of aesthetics, restoring maximum mastiscatory function, maintaining the alignment of surrounding teeth, and preserving facial contours.<br />'
      +'The Pros & Cons of different prosthetic replacement options explained. (Removable dentures, tooth supported fixed bridges or dental implant.)<br />'
      +'Patient chose /hesitant on/ declined prosthetic replacement for missing teeth. <br />'
      +'<br />'
      +'<br />'
      +'<br />'
      +'For successful implantation, there must be a sufficient amount of healthy jawbone to anchor the implant and the adjacent gums and teeth must be healthy. Certain systemic health conditions may preclude implantation as well.<br />',
      title : 'Urgent Consultation',
      date : '30/12/2019',
      procedures : []
    },
    {
      clinicalNote :
      'C/O: nil<br />'
      +'TX: P/Pcc issued <br />'
      +'Occlusion checked adjusted(  )<br />'
      +'Adjustment of complete/ partial dentures<br />'
      +'Instruction on use and care of dentures given.<br />'
      +'Denture care pamphlet issued.<br />'
      +'Denture care education(including denture hygiene) <br />'
      +'Advised to use both old/ new dentures alternatively<br />',
      title : 'Root Canal Treatment',
      date : '30/11/2019',
      procedures : []
    },
    {
      clinicalNote :
      'TCA: DO Recall + DH scaling<br />'
      +'1. Verbal consent was obtained from patient.<br />'
      +'2. DH will perform scaling & OHI.<br />'
      +'3. DO will come to check fit and arrange next appointment for the patient.<br />'
      +'4. Send patient to take BW\'s after scaling, DO will review X-ray in DO surgery ( when applicable)<br />',
      title : 'Root Canal Treatment',
      date : '01/11/2019',
      procedures : []
    },
    {
      clinicalNote :
      '(Emergency response level for Novel Coronavirs Infection)<br />'
      +'EXTRACTION<br />'
      +'C/O: very loose 15<br />'
      +'Tx: LA ( 1 cartridges Lignocaine hydrochloride 2% + adrenaline) infiltration/ ID Block<br />'
      +'Extraction 15   with patient\'s verbal consent<br />'
      +'Interseptal bone trimmed/ Fractured buccal plate removed<br />'
      +'Haemostasis achieved <br />'
      +'Post-operative instruction for dental extraction given<br />'
      +'Panadol 500mg one tab QID PRN X 2days<br />'
      +'Dental procedures completed and fit for Recall appointment<br />'
      +'<br />'
      +'TCA: RECALL<br />',
      title : 'Extraction',
      date : '30/10/2019',
      procedures : []
    },
    {
      clinicalNote :
      'FILLING<br />'
      +'C/O: nil<br />'
      +'Tx: LA ( 1 cartridges Lignocaine hydrochloride 2% + adrenaline) infiltration/ ID Block<br />'
      +'15MO Amalgam lined with Dycal/ Bonded amalgam<br />'
      +'11M Composite resin (A3) lined with Dycal<br />'
      +'<br />'
      +'Occlusion checked/ adjusted<br />'
      +'(Advised to avoid chewing hard food)<br />'
      +'(Advised gentle brushing force with soft bristle toothbrush)<br />'
      +'(Patient warned of post-operation sensitivity/ pain due to deep cavity)<br />'
      +'Panadol 500mg 1tab QID PRN X 2days<br />'
      +'Dental procedures completed and fit for Recall appointment<br />'
      +'<br />'
      +'TCA: RECALL<br />',
      title : 'Filling',
      date : '15/10/2019',
      procedures : []

    },
    {
      clinicalNote :
      'Denture cleaning (per denture)<br />'
      +'Denture care education(including denture hygiene)<br />'
      +'Advised to use both old/ new dentures alternatively<br />'
      +'Dental procedures completed and fit for Recall appointment<br />'
      +'Referral to dental hygienist',
      title : 'Issuing of Denture',
      date : '01/10/2019',
      procedures : []
    },
    {
      clinicalNote :
      'O/E: Stable & reproducible ICP<br />'
      +'Adequate/ Inadequate Gape opening<br />'
      +'Implant site: Mesio-distal space=  mm<br />'
      +'Bucco-lingual width=   mm (thin)<br />'
      +'Interocclusal space: adequate/ inadequate (  mm)<br />'
      +'Alveolar bone height( X-Ray) ~  mm<br />'
      +'<br />'
      +'Informed patient implant is not recommended due to inadequate alveolar bone width & height.<br />'
      +'Informed not 100% success.<br />'
      +'Risk of ID nerve trauma and possible numbness of lip & chin, risk of sinusitis & OAC informed.Patient understood osteotome for XX may be needed.<br />'
      +'All other Prosthetic replacement options informed.',
      title : 'Implant',
      date : '30/09/2019',
      procedures : []
    },
    {
      clinicalNote :
      'Patient was informed of the most common complication of Bisphosphonate therapy is osteonecrosis of jaw (ONJ)<br />'
      +'which may occur after any surgical dental procedures.<br />'
      +'Patient was therefore educated about the importance of good oral hygiene, <br />'
      +'proper diet habits & regular dental check-ups in order to prevent tooth loss.<br />',
      title : 'Extraction',
      date : '15/09/2019',
      procedures : []
    }
  ];

  return (
    <Grid container >
      <Grid item xs={12}  >
        <Box component="div" p={0} m={2}>
      <FormControlLabel
          value="end"
          control={<Switch color="primary" size="small" />}
          label="Own speciality"
          labelPlacement="end"
      />
        <FormControlLabel
            value="end"
            control={<Switch color="primary" size="small" />}
            label="Own clinic"
            labelPlacement="end"
        />
        <FormControlLabel
            value="end"
            control={<Switch color="primary" size="small" />}
            label="Show Procedures"
            labelPlacement="end"
            onChange={(e,value)=>setShowProcedure(value)}
        />
        </Box>
      </Grid>
      <Grid item xs={12}>
    <Paper className={classes.content}
    // style={{height: 760, overflow: "auto"}}
        p={0} m={0}
    >
        {clinicalNotes.map((row,index) => (
        //<Box key component="div" p={1} m={1}>
        //  {row.title} {row.date}
        //  <ReactQuill
        //      theme="snow"
        //      value={row.clinicalNote}
        //      readOnly
        //      size="20"
        //  />
//
        //  {/*showProcedure &&*/}
        //    <Collapse in={showProcedure}>
        //      <div>
        //      Procedures:
        //      <List disablePadding dense>
        //      {row.procedures.map((proc,index) => (
        //          <ListItem
        //              key
        //              button
        //              className={classes.nested}
        //              dense
        //          >
        //      <ListItemIcon style={{ minWidth: 28 }}>
        //      </ListItemIcon>
        //            <ListItemText
        //                classes={{ primary: classes.list_text }}
        //                primary={proc}
        //      // secondary={proc.qualifier}
        //            />
        //          </ListItem>
//
//
        //      ))}
        //      </List>
        //      </div>
//
        //    </Collapse>
        //  {}
//
        //</Box>
<></>
      ))}




    </Paper>

    </Grid>
  </Grid>
  );
}

// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
const tooths = [
  { tooth : '11'},
  { tooth : '12'},
  { tooth : '13'},
  { tooth : '14'},
  { tooth : '15'},
  { tooth : '16'},
  { tooth : '17'},
  { tooth : '18'},
  { tooth : '21'},
  { tooth : '22'},
  { tooth : '23'},
  { tooth : '24'},
  { tooth : '25'},
  { tooth : '26'},
  { tooth : '27'},
  { tooth : '28'},
  { tooth : '31'},
  { tooth : '32'},
  { tooth : '33'},
  { tooth : '34'},
  { tooth : '35'},
  { tooth : '36'},
  { tooth : '37'},
  { tooth : '38'},
  { tooth : '41'},
  { tooth : '42'},
  { tooth : '43'},
  { tooth : '44'},
  { tooth : '45'},
  { tooth : '46'},
  { tooth : '47'},
  { tooth : '48'},
  { tooth : '51'},
  { tooth : '52'},
  { tooth : '53'},
  { tooth : '54'},
  { tooth : '55'},
  { tooth : '61'},
  { tooth : '62'},
  { tooth : '63'},
  { tooth : '64'},
  { tooth : '65'},
  { tooth : '71'},
  { tooth : '72'},
  { tooth : '73'},
  { tooth : '74'},
  { tooth : '75'},
  { tooth : '81'},
  { tooth : '82'},
  { tooth : '83'},
  { tooth : '84'},
  { tooth : '85'}

];


const problems = [

  { problem : 'Implant'},
  { problem : 'Extraction '},
  { problem : 'Issuing of Denture'},
  { problem : 'Recall'},
  { problem : 'Root Canal Treatment'},
  { problem : 'Urgent Consultation'}
];

const procedures = [
  { procedure : 'Recall'},
  { procedure : 'Dental Filling'},
  { procedure : 'Scaling'}
];
