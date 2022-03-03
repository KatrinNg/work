import React from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';

const styles = theme => ({
    root: {
        display: 'flex',
        backgroundColor: theme.palette.dialogBackground,
        padding: theme.spacing(1),
        borderRadius: theme.spacing(1) / 2
    },
    hide: {
        display: 'none'
    },
    drawer: {
        flexShrink: 0,
        whiteSpace: 'nowrap'
    },
    drawerPaper: {
        zIndex: 1,
        position: 'relative',
        border: 'unset',
        overflow: 'hidden'
    },
    drawerClose: {
        overflowX: 'hidden'
    },
    toolbar: {
        padding: theme.spacing(0, 1)
    },
    title: {
        color: 'white'
    },
    verticalTitle: {
        transition: theme.transitions.create(['transform'], {
            delay: theme.transitions.duration.leavingScreen
        }),
        '-webkit-writing-mode': 'vertical-rl',
        transform: 'rotate(180deg)'
    },
    iconButton: {
        padding: 6
    }
});

const CIMSDrawer = React.forwardRef((props, ref) => {
    const {
        classes,
        id,
        open,
        children,
        onClick,
        title,
        DrawerProps,
        drawerWidth = 480,
        closeIcon,
        openIcon
    } = props;

    const handleOnClick = (e) => {
        onClick && onClick(e, open);
    };

    return (
        <Grid container className={classes.root}>
            <Grid
                item
                container
                className={classes.toolbar}
                direction={open ? 'row' : 'column-reverse'}
                justify={open ? 'space-between' : 'flex-end'}
            >
                <Typography
                    variant="h6"
                    className={clsx(classes.title, {
                        [classes.verticalTitle]: !open
                    })}
                >{title}</Typography>
                <IconButton
                    id={`${id}_openBtn`}
                    className={classes.iconButton}
                    onClick={handleOnClick}
                >
                    {open ? (openIcon ?? <ChevronLeftIcon htmlColor="white" />) : (closeIcon ?? <MenuIcon htmlColor="white" />)}
                </IconButton>
            </Grid>
            <Drawer
                id={`${id}_drawer`}
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerClose]: !open
                })}
                classes={{
                    paper: clsx(classes.drawerPaper)
                }}
                style={{
                    width: open ? drawerWidth : 0
                }}
                {...DrawerProps}
            >
                {children}
            </Drawer>
        </Grid>
    );
});

export default withStyles(styles)(CIMSDrawer);