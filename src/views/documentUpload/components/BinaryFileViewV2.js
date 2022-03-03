// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the view UI for uploading files to mongoDB as a single file or GridFS
//


import React from 'react';
import Constant from '../../../constants/documentUpload/Constant';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import clsx from 'clsx';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';


import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

export default function ({ props }) {
  console.log(props);

  const useStyles = makeStyles(theme => ({
    root: {
      maxWidth: 200
    },
    media: {
      height: 0,
      paddingTop: '56.25%' // 16:9
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
    avatar: {
      backgroundColor: red[500]
    }
  }));

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography paragraph>
          {'Created@: ' + props.createdDatetime} <br/>
          {'Service:  ' + ''} <br/>
          {'Created By:  ' + props.createdBy} <br/>
          {'PMI:  ' + props.pmi} <br/>
          {'EncounteredID:  ' + props.encounteredID}
        </Typography>
      </CardContent>
      <CardMedia
          className={classes.media}
          image={Constant.targetDownloadServiceURL + 'downloadBinaryThumbnail/' + props.fileID}
      />
      <CardActions>
        <Link
            component="button"
            variant="body1"
        >
          <a href={Constant.targetDownloadServiceURL + 'downloadBinary/' + props.fileID}>Download here</a>
        </Link>
      </CardActions>
    </Card>
  );
}
