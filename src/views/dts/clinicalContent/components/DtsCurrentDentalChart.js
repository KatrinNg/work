import React from 'react';
import {  makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Checkbox , Button, Box, CardMedia, FormControl, FormControlLabel, FormGroup } from '@material-ui/core';
import {IconButton} from '@material-ui/core';
import PrintIcon from '@material-ui/icons/Print';



const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  root: {
    // backgroundColor: theme.palette.background.paper,
    //width: 720,
    width: '100%',
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
  list_icon: {
    minWidth: 40
  },
  list_text: {
    maxWidth: 260,
    fontSize: '0.875rem'
  },
  nested: {
    paddingLeft: theme.spacing(4)
  },
  heading: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeightRegular
  }
}));

const useChartStyles = makeStyles(theme => ({
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
  }
}));

export default function CurrentDentalChart() {
  const classes = useStyles();
  const chartClasses = useChartStyles();

  return (
    <div>
    <Box >
      <div style={{ width: '100%' }}>
        <Box display="flex" p={1} >
          <Box width="100%"  m={1}>
            <FormGroup row>
              <FormControlLabel
                  control={<Checkbox
                      name="checkedPermanent"
                      color="primary"
                           />}
                  label="Permanent"
              />
              <FormControlLabel
                  control={
                  <Checkbox
                      name="checkedPrimary"
                      color="primary"
                  />
                }
                  label="Primary"
              />
            </FormGroup>
          </Box>
          <Box flexShrink={0}>
            <IconButton aria-label="all" edge="start">
                <PrintIcon />
            </IconButton>
          </Box>
        </Box>
      </div>
    </Box>

    <Box>
      <Box p={1} >
      {/* <CardMedia class={chartClasses.chart} style={{backgroundPosition: 'left top'}}  image="/images/DentalChart.png"/> */}
      {/*[{utils.getCurrentDate()}]*/}
      </Box>
    </Box>

      <div style={{ width: '100%' }}>
        <Box display="flex" p={1} >
          <Box pt={2} m={0} width="100%" style={{verticalAlign: 'middle'}}>
            <Typography variant="body2"><b>Remark:</b> Upper Partial Denture</Typography>
          </Box>
        </Box>
      </div>
    </div>
  );
}
