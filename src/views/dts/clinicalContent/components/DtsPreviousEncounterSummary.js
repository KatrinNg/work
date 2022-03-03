import React from 'react';
import { fade,makeStyles, Theme, createStyles, useTheme, createMuiTheme  } from '@material-ui/core/styles';
import clsx from 'clsx';
import {Card ,CardHeader ,CardContent, CardActions, CardMedia, Link } from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';
import { green, grey } from '@material-ui/core/colors';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import InfoIcon from '@material-ui/icons/Info';

import InputBase from '@material-ui/core/InputBase';

import Tooltip from '@material-ui/core/Tooltip';
import {Box, Paper} from '@material-ui/core/';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import {List, ListItem, ListItemText, ListItemIcon, ListItemAvatar} from '@material-ui/core';

import SaveIcon from '@material-ui/icons/Save';
import SearchIcon from '@material-ui/icons/Search';
import Divider from '@material-ui/core/Divider';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import AssignmentIcon from '@material-ui/icons/Assignment';
import Grid from '@material-ui/core/Grid';

import {FormControl, TextField, Select, InputLabel} from '@material-ui/core';
//import {Button, Switch, FormControlLabel, FormGroup, TextareaAutosize } from '@material-ui/core';
import {Button, Switch, FormControlLabel, FormGroup } from '@material-ui/core';
import {Table, TableBody, TableCell,TableHead, TableRow} from '@material-ui/core';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {Dialog,DialogActions,DialogContent,DialogTitle} from '@material-ui/core';
import * as utils from '../util/utils';
import DtsEditor from './clinicalNoteComp/DtsEditor';
import DtsExistingProblemTreatment from './DtsExistingProblemTreatment';
import * as config from './config';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';

const drawerWidth = 240;


const useStyles = makeStyles(theme => ({
  root: {
    width: '100vh',
    height: '100vh'
  },
  overrideReadOnlyColor:{
    color:'black'
 },
  encounterContent: {
    maxHeight: 'calc(100vh - 325px)',
    overflow: 'auto'
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0

  },
  drawerPaper: {
    width: drawerWidth,
    overflow: 'auto',
    height: '100%',
    // backgroundColor: '#ffffff',
    // backgroundColor: grey[600],
    // color: theme.color.light,
    // color: theme.palette.secondary.light ,
    opacity: 0.9
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start'
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 100
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(2),
      width: 'auto'
    }
  },
  searchIcon: {
    width: theme.spacing(1),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRoot: {
    color: 'inherit'
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 6),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 95
    }
  },

  chart: {
    // backgroundColor: theme.palette.background.paper,
    width: 609,
    height: 328,
    margin: 'auto',
    display: 'block'
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%'
  },
  avatar: {
    backgroundColor: green[500]
  },

  card: {
   backgroundColor: grey[200]
   // backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='170px' width='170px'><text transform='translate(20, 100) rotate(-45)' fill='rgb(230, 230, 230)' font-size='35'>Pervious</text></svg>")`,
 },

 cardHeader: {
  // backgroundColor: grey[200],
},

  table: {
    backgroundColor: 'inherit'
  }
}));

const cNoteTextHTML = ' <br />'
+ 'C/O: Mild sensitivity at upper anterior teeth, started 6 months ago,'
+ 'to cold stimulus but not to hot stimulus, not during brushing and not during chewing <br />'
+ 'E/O & soft tissues: L TMJ mild clicking with no symptom, ulcer at lower lip <br />'
+ 'I/O: 21MD, 25MO, 27D (deep) caries, 11M initial lesion, 21 and 22 NCCL, 38PE <br />'
+ 'Dx: DS UL1 and UL2 possibly due to mild NCCL, advised sensitive toothpaste and F varnish, patient accepted <br />'
+ 'Tx: OHI (floss demo and practice), scaling, referred to PWH OMS for SX 38, prescription, 25MO composite (occlusion checked and polished),'
+ ' applied F varnish <br />'
+ ' TCA: 21MD and 27DO F';


export default function DtsPreviousEncounterSummary() {
  const classes = useStyles();
  const theme = useTheme();
  const [ isPastEncounter,setIsPastEncounter ] = React.useState(true);
  const [expanded, setExpanded] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [copySuccess, setCopySuccess] = React.useState('');

const cNoteRef = <DtsEditor
    initText={cNoteTextHTML}
    readOnly
    size="20"
                 />;

  const [history, showHistory] = React.useState(true);
  const [problems, showProblems] = React.useState(true);
  const [medications, showMedications] = React.useState(true);
  const [assessment, showAssessment] = React.useState(true);
  const [documents, showDocuments] = React.useState(true);
  const [cNoteAbbreviation, showCNoteAbbreviation] = React.useState(false);
  // initial Collapse
  const [dentalChart, showDentalChart] = React.useState(false);
  const [additionalNote, setAdditionalNote] = React.useState(null);


  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleDrawer= () => {
    console.log({open}.open);
    setOpen(!{open}.open);
  };

   const onNoteChange = (event, value) =>{
    setAdditionalNote(value);
    console.log('setAdditionalNote: ' + value);
  };

  const copyToClipboard = event => {
    console.log('cNoteRef: '+ {cNoteRef});
    console.log('cNoteRef.getText(): '+ {cNoteRef}.getText());

    //{cNoteRef}.getSelection();

    document.execCommand('copy');
    // This is just personal preference.
    // I prefer to not show the the whole text area selected.
    event.target.focus();
    setCopySuccess('Copied!');
  };

  const sectionTitle = (title, additionText) => {
    return (
      <Box pt={2} m={0} width="100%" style={{verticalAlign: 'middle'}}>
        <Typography variant="h6"><u>{title}:</u>{additionText}</Typography>
      </Box>
    );
  };

  const historyComp = (
    <section id="medHistoryRef" >
        <Box  p={0} >
        <Typography
            paragraph
            variant="body2"
            component="p"
            p={1}
        >
        <Link
            component="button"
            variant="body2"
        ><b>Allergy</b>
        </Link>: Amoxicillin (as sodium)<br />
        <Link
            component="button"
            variant="body2"
        ><b>Medical History</b>
        </Link>: Hypertension, Pregnancy, Diabetes Mellitus<br />
        <Link
            component="button"
            variant="body2"
        ><b>Smoking</b>
        </Link>: Current smoker (5 per day)<br />
        </Typography>
        </Box>
        {/*}<Box>
        <div style={{ width: '100%' }}>
        <Box display="flex" p={0} m={0}>
        {sectionTitle('Medical (4), Smoking (1) and Family (0) History','(Last Updated on 10/01/2020)') }
        <Box p={0} m={0} flexShrink={0}>
        <IconButton aria-label="hide"  edge="start" onClick={() => showHistory((prev) => !prev)}>
        {history ? (<VisibilityOffIcon />) : ( <VisibilityIcon />) }
        </IconButton>
        </Box>
        </Box>
        </div>

        <Typography
        paragraph
        variant="body2"
        color="textSecondary"
        component="p"
        >
        <b>Medical History:</b> <br />
        &nbsp;&nbsp;Hypertension, Pregnancy, Diabetes Mellitus<br />
        <b>Allergy, Adverse Reaction & Alert:</b><br />
        &nbsp;&nbsp;Amoxicillin (as sodium)<br />
        <b>Smoking:</b><br />
        &nbsp;&nbsp;Current smoker (5 per day)<br />
        <b>Family History:</b><br />
        &nbsp;&nbsp;-<br />
        </Typography>
        </Box>*/}
      </section>
  );
  function createData(discipline, planDate, problem,qualifier, plan, status) {
    return { discipline, planDate, problem,qualifier, plan, status };
  }

  const problemsComp = (
    <Box>
    <div style={{ width: '100%' }}>
      <Box display="flex" p={0} m={0}>
        {sectionTitle('Existing and Resolved Problems and Treatment Plan','')}
        <Box p={0} m={0} flexShrink={0}>
          <IconButton aria-label="hide"  edge="start" onClick={() => showProblems((prev) => !prev)}>
            {problems ? (<VisibilityOffIcon />) : ( <VisibilityIcon />)}
          </IconButton>
        </Box>
      </Box>
    </div>
    {/* <DtsExistingProblemTreatment readOnly /> */}

    </Box>
  );


  const plaqueText = (
    <div style={{ width: '100%' }}>
      <Box display="flex">
        <Box component="div" display="inline" m={0.5}><TextField id="Plaque01" variant="outlined" size="small" defaultValue="B" disabled  inputProps={{className: classes.overrideReadOnlyColor, maxLength: 5, tabIndex: '1', readOnly: true}} /></Box>
        <Box component="div" display="inline" m={0.5}><TextField id="Plaque02" variant="outlined" size="small" defaultValue="B" disabled  inputProps={{className: classes.overrideReadOnlyColor, maxLength: 5, tabIndex: '2', readOnly: true}} /></Box>
        <Box component="div" display="inline" m={0.5}><TextField id="Plaque03" variant="outlined" size="small" defaultValue="B" disabled  inputProps={{className: classes.overrideReadOnlyColor, maxLength: 5, tabIndex: '3', readOnly: true}} /></Box>
        <Box component="div" display="inline" m={0} width={'100%'}>
            <FormControl variant="outlined" margin="dense" className={classes.formControl} size="small" disabled>
                  <InputLabel htmlFor="OH">OH</InputLabel>
                  <Select
                      native
                      label="OH"
                      inputProps={{
                      className: classes.overrideReadOnlyColor,
                      name: 'OH',
                      id: 'OH',
                      tabIndex: '7',
                      readOnly: true
                    }}
                  >
                    <option aria-label="None" value="" />
                    <option value={10} selected>Fair</option>
                    <option value={20}>Good</option>
                    <option value={30}>Poor</option>
                  </Select>
            </FormControl>
        </Box>
      </Box>
      <Box display="flex">
        <Box component="div" display="inline" m={0.5}><TextField id="Plaque04" variant="outlined" size="small" defaultValue="L" disabled  inputProps={{className: classes.overrideReadOnlyColor, maxLength: 5, tabIndex: '6', readOnly: true}} /></Box>
        <Box component="div" display="inline" m={0.5}><TextField id="Plaque05" variant="outlined" size="small" defaultValue="L" disabled  inputProps={{className: classes.overrideReadOnlyColor,maxLength: 5, tabIndex: '5', readOnly: true}} /></Box>
        <Box component="div" display="inline" m={0.5}><TextField id="Plaque06" variant="outlined" size="small" defaultValue="L" disabled  inputProps={{className: classes.overrideReadOnlyColor,maxLength: 5, tabIndex: '4', readOnly: true}} /></Box>
        <Box component="div" display="inline" m={0}  width={'100%'}>
            <FormControl variant="outlined" margin="dense" className={classes.formControl} size="small" disabled>
            <InputLabel htmlFor="ID">ID</InputLabel>
              <Select
                  native
                  label="ID"
                  inputProps={{
                  className: classes.overrideReadOnlyColor,
                  name: 'ID',
                  id: 'ID',
                  tabIndex: '8',
                  readOnly: true
                }}
              >
                <option aria-label="None" value="" />
                <option value={10} selected>Fair</option>
                <option value={20}>Good</option>
                <option value={30}>Poor</option>
              </Select>
            </FormControl>
        </Box>
      </Box>
      </div>
  );

  const bpeText = (
    <div style={{ width: '100%' }}>
      <Box display="flex">
        <Box component="div" display="inline" m={0.5}><TextField id="BPE01" variant="outlined" size="small" defaultValue="1" disabled  inputProps={{className: classes.overrideReadOnlyColor,maxLength: 2, tabIndex: '9', readOnly : true }} /></Box>
        <Box component="div" display="inline" m={0.5}><TextField id="BPE02" variant="outlined" size="small" defaultValue="2" disabled  inputProps={{className: classes.overrideReadOnlyColor,maxLength: 2, tabIndex: '10', readOnly : true}} /></Box>
        <Box component="div" display="inline" m={0.5}><TextField id="BPE03" variant="outlined" size="small" defaultValue="1" disabled  inputProps={{className: classes.overrideReadOnlyColor,maxLength: 2, tabIndex: '11', readOnly : true}} /></Box>
        <Box component="div" display="inline" m={0} width={'100%'}>
            <FormControl variant="outlined" margin="none" className={classes.formControl} size="small"  disabled>
                <InputLabel htmlFor="Caries" mx={0}>Caries</InputLabel>
                  <Select
                      native
                      label="Caries"
                      inputProps={{
                      className: classes.overrideReadOnlyColor,
                      name: 'Caries',
                      id: 'Caries',
                      tabIndex: '15',
                      readOnly: true
                    }}
                      mx={0}
                  >
                    <option aria-label="None" value="" />
                    <option value={10} selected>Low</option>
                    <option value={20}>Moderate</option>
                    <option value={30}>High</option>
                    <option value={40}>Extreme</option>
                  </Select>
              </FormControl>

        </Box>
      </Box>
      <Box display="flex">
        <Box component="div" display="inline" m={0.5}><TextField id="BPE04" variant="outlined" size="small" defaultValue="2" disabled  inputProps={{className: classes.overrideReadOnlyColor,maxLength: 2, tabIndex: '14', readOnly : true}} /></Box>
        <Box component="div" display="inline" m={0.5}><TextField id="BPE05" variant="outlined" size="small" defaultValue="2" disabled  inputProps={{className: classes.overrideReadOnlyColor,maxLength: 2, tabIndex: '13', readOnly : true}} /></Box>
        <Box component="div" display="inline" m={0.5}><TextField id="BPE06" variant="outlined" size="small" defaultValue="2" disabled  inputProps={{className: classes.overrideReadOnlyColor,maxLength: 2, tabIndex: '12', readOnly : true}} /></Box>
        <Box component="div" display="inline" m={0}  width={'100%'}>
        <FormControl variant="outlined" margin="none" className={classes.formControl} size="small" disabled>
          <InputLabel htmlFor="Perio">Perio</InputLabel>
            <Select
                native
                label="Perio"
                inputProps={{
                className: classes.overrideReadOnlyColor,
                name: 'Perio',
                id: 'Perio',
                tabIndex: '16',
                readOnly: true
              }}
            >
              <option aria-label="None" value="" />
              <option value={10}>Low</option>
              <option value={20}>Moderate</option>
              <option value={30}>High</option>
              <option value={40} selected>Extreme</option>
            </Select>
        </FormControl>
        </Box>
      </Box>
    </div>
  );


  const dentalChartComp = (
    <div style={{ width: '100%' }}>
      <Box display="flex" p={0} m={0}>
      {sectionTitle('Dental Chart','')}
        <Box p={0} m={0} flexShrink={0}>
          <IconButton aria-label="hide"  edge="start" onClick={() => showDentalChart((prev) => !prev)}>
            {dentalChart ? (<VisibilityOffIcon />) : ( <VisibilityIcon />)}
          </IconButton>
        </Box>
      </Box>

      <Box p={1} >

      <Typography>
        Date: 10-01-2019
      </Typography>
      {/* <CardMedia class={classes.chart} style={{backgroundPosition: 'left top'}}  image="/images/DentalChart.png"/> */}
      </Box>
    </div>

  );

  const medicationComp = (

      <Box>
      {sectionTitle('Medication','')}

      <Paper>
          <Table className={classes.table} size="small">
            <TableBody>
              {['Bonjela (cetalkonium chloride 0.01% + choline salicylate 8.714%) oral gel - twice daily - as required - oromucosal - 1 tube' ,
               '[Panadol] Endopain II (paracetamol) tablet - 500 mg - four times daily - as required - oral - for 2 days - 8 tablet (Dispense in clinic)'
              ].map((text, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {text}
                  </TableCell>
                </TableRow>
              ))}

            </TableBody>
          </Table>
        </Paper>

      </Box>
  );

  const documentComp = (
  <Box>
  <div style={{ width: '100%' }}>
    <Box display="flex" p={0} m={0}>
      {sectionTitle('One-Off, Cross Encounter and Referral eForm','')}
      <Box p={0} m={0} flexShrink={0}>
        <IconButton aria-label="hide"  edge="start" onClick={() => showDocuments((prev) => !prev)}>
          {documents ? (<VisibilityOffIcon />) : ( <VisibilityIcon />)}
        </IconButton>
      </Box>
    </Box>
  </div>
  <Paper>
    <Table className={classes.table} size="small">
      <TableHead>
        <TableRow>
          <TableCell align="left">Document Name</TableCell>
          <TableCell align="left">Remarks</TableCell>
          <TableCell align="left">Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[
          {docName:'Certificate of Attendance', remarks:'E-Form (Certificate of Attendance)',status:'Cancelled'},
          {docName:'OMS Referral Form', remarks:'',status:'Completed'}
        ].map((row,index) => (
          <TableRow key={index}>
            <TableCell component="th" scope="row">
              {row.docName}
            </TableCell>
            <TableCell align="left">{row.remarks}</TableCell>
            <TableCell align="left">{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
  </Box>
);
  return (
    <Card component="div" display="inline" classes={{ root: classes.card }} >
      <CardHeader
          classes={{ root: classes.cardHeader }}
          avatar={
          <Avatar aria-label="recipe" className={classes.avatar}>
            GD
          </Avatar>
        }
          action={
          <Box variant="dense">
            <Tooltip title="latest">
              <IconButton aria-label="latest">
                <BookmarkIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="recent">
              <IconButton aria-label="recent">
                <NavigateBeforeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="eariler">
              <IconButton aria-label="eariler">
                <NavigateNextIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="list all">
              <IconButton
                  aria-label="all"
                  onClick={handleDrawer}
                  edge="start"
              >
                <CollectionsBookmarkIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
          title="Recall / CWDC(S04) / Dr. Michael Mak"
          subheader="10/01/2020"
      />
      <CardContent
      // style={{ height: 745, overflow: "auto" }}
          className={classes.encounterContent}
      // style={{ overflow: "auto" }}

      >

      <Collapse in={history} collapsedHeight={50}>
        {historyComp}
      </Collapse>
      <Typography variant="h6">
        <u>Clinical Note:</u>
          {/*<IconButton aria-label="Show Abbreviation" onClick={() => showCNoteAbbreviation((prev) => !prev)} edge="start">
            <InfoIcon />
          </IconButton>*/}
      </Typography>

        {cNoteRef}

        <Collapse in={assessment} collapsedHeight={50}>


          <div style={{ width: '100%' }}>
            <Box display="flex" p={0} m={0}>
              {sectionTitle('Assessment','(Last updated on: 10/01/2020)')}
              <Box p={0} m={0} flexShrink={0}>
                <IconButton aria-label="hide"  edge="start" onClick={() => showAssessment((prev) => !prev)}>
                  {assessment ? (<VisibilityOffIcon />) : ( <VisibilityIcon />)}
                </IconButton>
              </Box>
            </Box>
          </div>
            <Grid container spacing={0}  variant="dense" className={classes.paper}>
              <Grid item xs={6} variant="dense" className={classes.paper}>
              <Typography paragraph variant="body2" color="textSecondary" component="p">
                <Box display="flex">
                    <Box component="div" display="inline" m={0} width="100%">Plaque Control Area</Box>
                </Box>
                {plaqueText}
              </Typography>

              </Grid>
              {/*<Grid item xs={2} variant="dense" className={classes.paper}>
                {ohText}

              </Grid> */}
              <Grid item xs={6} variant="dense" className={classes.paper}>
                <Typography paragraph variant="body2" color="textSecondary" component="p">
                  <Box display="flex">
                      <Box component="div" display="inline" m={0} width="70%">BPE</Box>
                      <Box component="div" display="inline" m={0}>Risk</Box>
                  </Box>
                  {bpeText}
                </Typography>
              </Grid>

            </Grid>

        </Collapse>

        <Collapse in={problems} collapsedHeight={50}>
          {problemsComp}

        </Collapse>
        <br />

        {sectionTitle('New Procedure','')}
        <Paper>
            <Table  classes={{ root: classes.table }} size="small">
              <TableBody>
              {[
      		    {procName: 'Recall done (patient reviewed)', qualifier : '' },
      			{procName: 'Dental floss interdental (ID) cleaning education with intra-oral supervised practice (OHI)', qualifier : '' },
      			{procName: 'Scaling', qualifier : '' },
      			{procName: 'Upper dental arch, Lower dental arch', qualifier : '' },
      			{procName: 'Dental Filling (Restoration of tooth/teeth by filling) ', qualifier : '25MO; Crown surface; Composite; Caries' },
      			{procName: 'Application of dental fluoride varnish (by tooth) for caries control', qualifier : '11' },
      			{procName: 'Dental application of desensitizing medicament', qualifier : '21, 22; Dental fluoride varnish' },
      			{procName: 'Prescription', qualifier : '' },
      			{procName: 'Referral to OMS service', qualifier : '' }
      		  ].map((proc, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      <b>{proc.procName}</b>
      				<br/> {proc.qualifier}
                    </TableCell>
                  </TableRow>
                ))}

              </TableBody>
            </Table>
          </Paper>


        <Collapse in={dentalChart} collapsedHeight={50}>
          {dentalChartComp}
        </Collapse>

        {medicationComp}

        <Collapse in={documents} collapsedHeight={50}>
          {documentComp}
        </Collapse>




    <Box display="flex" p={0} m={0}>
      {sectionTitle('Additional Note','')}
      <Box p={0} m={0} flexShrink={0}>
      <Tooltip title="Save Additional Note">
      <IconButton aria-label="all" edge="start">
        <SaveIcon />
      </IconButton>
      </Tooltip>
      </Box>
    </Box>
  <FormGroup row style={{ width: '100%' }}>
        <FormControl className={classes.formControl}>
        {/* <TextareaAutosize
            rowsMin={4}
            style={{ width: '740px' }}
            aria-label="empty textarea" placeholder="Addition Note"
        /> */}
        <CIMSMultiTextField
            style={{ width: '740px' }}
            id={'additionalNoteTextField'}
            label={'Notes'}
            rows={4}
            value={additionalNote}
            placeholder="Addition Note"
                //onChange={e => this.onNoteChange(e)}
                //onBlur={e => this.onNoteBlur(e)}
            onChange={e => onNoteChange(e, e.target.value)}
        />
       </FormControl>
  </FormGroup>

      </CardContent>

      <div>
        <Dialog
            open={cNoteAbbreviation}
            onClose={()=>showCNoteAbbreviation(false)}
            aria-labelledby="draggable-dialog-title"
            PaperComponent={utils.PaperComponent}
            maxWidth={1300}
        >
          <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
            Abbreviation
          </DialogTitle>
          <DialogContent>
      <Typography className={classes.title} color="textSecondary" gutterBottom>
        {/* {config.abbreviations.map((row, index) => (
        <Box key>
          <b>{row.abb} </b> {row.desc}
        </Box>
        ))} */}
      </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>showCNoteAbbreviation(false)} color="primary">
              Close
            </Button>

          </DialogActions>
        </Dialog>
      </div>

      <Drawer
          className={classes.drawer}
          variant="persistent"
        // anchor="left"
          anchor="right"
          open={open}
          classes={{
          paper: classes.drawerPaper
        }}
        // style = {{
        //   backgroundColor: '#ffffff', opacity: 0.9
        // }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawer}>
            {theme.direction === 'rtl' ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>

        </div>
        <div className={classes.search}>
          <FormControlLabel
              value="end"
              control={<Switch color="primary" size="small" />}
              label="Own speciality"
              labelPlacement="end"
          />
        </div>
        <div className={classes.search}>
          <FormControlLabel
              value="end"
              control={<Switch color="primary" size="small" />}
              label="Own clinic"
              labelPlacement="end"
          />
        </div>
        <Divider />
        <List dense  style={{ width: {drawerWidth} }}>
          {[
            {color: 'green' ,text :'10/01/2020 Recall'},
            {color: 'green' ,text :'02/01/2020 Recall'},
            {color: 'blue' ,text :'30/12/2019 Urgent Consultation'},
            {color: 'orange' ,text :'30/11/2019 Root Canal Treatment'},
            {color: 'orange' ,text :'01/11/2019 Root Canal Treatment'}
          ].map((enounter, index) => (
            <ListItem button classes={{ root: classes.list_item }}  key={enounter.text} dense>
              <ListItemIcon style={{ minWidth: 26 }}>
                <AssignmentIcon style={{ color: enounter.color }} />
              </ListItemIcon>
              <Tooltip title={enounter.text} >
              <ListItemText dense classes={{ primary: classes.list_text }}
                  primary={<Typography noWrap >{enounter.text}</Typography>} disableTypography
              />
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Card>
  );
}
