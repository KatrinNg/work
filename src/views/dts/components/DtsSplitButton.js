import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import SearchIcon from '@material-ui/icons/Search';
import ReceiptIcon from '@material-ui/icons/Receipt';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import RefreshIcon from '@material-ui/icons/Refresh';
import TodayIcon from '@material-ui/icons/Today';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import * as DtsBookingConstant from '../../../constants/dts/appointment/DtsBookingConstant';

import {
    History as HistoryIcon,
    NewReleases as NewReleasesIcon,
    People as PeopleIcon
} from '@material-ui/icons';

import { makeStyles } from '@material-ui/core/styles';

import clsx from 'clsx';
import _ from 'lodash';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex'
    },
    mainButton:{
        minWidth: '100px',
        borderTopRightRadius: '0px',
        borderBottomRightRadius: '0px',
        borderTopLeftRadius: '25px',
        borderBottomLeftRadius: '25px'
    },
    dropDownButton:{
        borderTopRightRadius: '25px',
        borderBottomRightRadius: '25px',
        borderTopLeftRadius: '0px',
        borderBottomLeftRadius: '0px'
    },
    blueButton:{
        backgroundColor: '#0579C8',
        color:'white',
        boxShadow: 'none',
        border: 'solid 1px #0579C8',
        '&:hover': {
            backgroundColor: '#0579C8',
            color:'white'
        }
    },
    redButton:{
        backgroundColor: '#df4333',
        color:'#ffffff',
        boxShadow: 'none',
        border: 'solid 1px #df4333',
        '&:hover': {
            backgroundColor: '#df4333',
            color:'#ffffff'
        }
    },
    greenButton:{
        backgroundColor: '#7fc355',
        color:'white',
        boxShadow: 'none',
        border: 'solid 1px #7fc355',
        '&:hover': {
            backgroundColor: '#7fc355',
            color:'white'
        }
    },
    yellowButton:{
        backgroundColor: '#f8ff61',
        color: 'black',
        boxShadow: 'none',
        border: 'solid 1px #f8ff61',
        '&:hover': {
            backgroundColor: '#f8ff61',
            color:'black'
        }
    },
    blueDdb:{
        color:'#0579C8',
        boxShadow: 'none',
        border: 'solid 1px #0579C8',
        '&:hover': {
            backgroundColor: '#0579C8',
            color:'white'
        }
    },
    redDdb:{
        color:'#df4333',
        boxShadow: 'none',
        border: 'solid 1px #df4333',
        '&:hover': {
            backgroundColor: '#df4333',
            color:'#ffffff'
        }
    },
    greenDdb:{
        color:'#7fc355',
        boxShadow: 'none',
        border: 'solid 1px #7fc355',
        '&:hover': {
            backgroundColor: '#7fc355',
            color:'white'
        }
    },
    yellowDdb:{
        color:'#f8ff61',
        boxShadow: 'none',
        border: 'solid 1px #f8ff61',
        '&:hover': {
            backgroundColor: '#f8ff61',
            color:'black'
        }
    },
    buttonGroup:{
        borderRadius: '25px'
    }
    })
);

export default function DtsSplitButton(props, ref) {
    const {className, icon, iconType, itemListEl, itemsColorList = null, btnOnClick, specialMode, fixItems = false, disabled = false, iconOnly, ...others} = props;
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const handleClick = () => {
        btnOnClick(itemListEl[selectedIndex]);
    };

    const handleMenuItemClick = (event, index) => {
        if(fixItems)
            setSelectedIndex(0);
        else
            setSelectedIndex(index);
        btnOnClick(itemListEl[index]);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen(prevOpen => !prevOpen);
    };

    const handleClose = event => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    const getItemsColor = (classes) => {
        if(specialMode){
            if(itemsColorList && itemsColorList[selectedIndex] != null)
            {
                if(itemsColorList[selectedIndex] == 'BLUE')
                    return classes.blueButton;
                else if(itemsColorList[selectedIndex] == 'GREEN')
                    return classes.greenButton;
                else if(itemsColorList[selectedIndex] == 'RED')
                    return classes.redButton;
                else if(itemsColorList[selectedIndex] == 'YELLOW')
                    return classes.yellowButton;
                else
                    return classes.blueButton;
            }
            else
                return classes.blueButton;
        }
    };

    const getIconByIndex = () => {
        //when iconType is array
        switch (iconType[selectedIndex]) {
            case DtsBookingConstant.DTS_URGENT_APPOINTMENT:
                return <NewReleasesIcon/>;
            case DtsBookingConstant.DTS_GP_APPOINTMENT:
                return <PeopleIcon/>;
            case DtsBookingConstant.DTS_DAILY_VIEW_HISTORY:
                return <HistoryIcon/>;
            default:
                return true;
        }
    };

    const getItemsDdbColor = (classes) => {
        if(specialMode){
            if(itemsColorList && itemsColorList[selectedIndex] != null)
            {
                if(itemsColorList[selectedIndex] == 'BLUE')
                    return classes.blueDdb;
                else if(itemsColorList[selectedIndex] == 'GREEN')
                    return classes.greenDdb;
                else if(itemsColorList[selectedIndex] == 'RED')
                    return classes.redDdb;
                else if(itemsColorList[selectedIndex] == 'YELLOW')
                    return classes.yellowDdb;
                else
                    return classes.blueDdb;
            }
            else
                return classes.blueDdb;
        }
    };

    const getSplitButton = (items) => {
        return(
            <Grid>
                <ButtonGroup
                    className={classes.buttonGroup}
                    variant="contained"
                    color="primary"
                    ref={anchorRef}
                    aria-label="split button"
                >
                    <Button className={classes.mainButton + ' ' + (getItemsColor(classes))} onClick={handleClick} disabled={disabled}>
                        {
                            (_.isArray(iconType)) ? getIconByIndex() :
                            (iconType == 'SEARCH') ? <SearchIcon/> :
                            (iconType == 'TODAY') ? <TodayIcon/> :
                            (iconType == 'RECEIPT') ? <ReceiptIcon/> :
                            (iconType == 'SKIPNEXT') ? <SkipNextIcon/> :
                            (iconType == 'REFRESH') ? <RefreshIcon/> :
                            (iconType == 'BOOKMARK') ? <BookmarkIcon/> :
                            (iconType == DtsBookingConstant.DTS_DAILY_VIEW_HISTORY) ? <HistoryIcon/> :
                            icon
                        }
                        {iconOnly ? '' : (fixItems ? items[0] : items[selectedIndex])}
                    </Button>
                    <Button
                        className={classes.dropDownButton + ' ' + (getItemsDdbColor(classes))}
                        // color="primary"
                        size="small"
                        aria-controls={open ? 'split-button-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-label="select merge strategy"
                        aria-haspopup="menu"
                        onClick={handleToggle}
                        disabled={disabled}
                    >
                    <ArrowDropDownIcon />
                    </Button>
                </ButtonGroup>
                {getMenu(items)}
            </Grid>
        );
    };

    const getMenu = (items) => {
        return (
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                style={{'z-index':'999999'}}
            >
            {({ TransitionProps, placement }) => (
                <Grow
                    {...TransitionProps}
                    style={{
                        transformOrigin:
                        placement === 'bottom' ? 'center top' : 'center bottom'
                    }}
                >
                <Paper>
                    <ClickAwayListener onClickAway={handleClose}>
                    <MenuList id="split-button-menu">
                        {items.map((option, index) => (
                            (fixItems && index == 0) ?
                                (
                                    <></>
                                )
                            :
                                (
                                    <MenuItem
                                        key={index}
                                        selected={index === selectedIndex}
                                        onClick={event => handleMenuItemClick(event, index)}
                                    >
                                    {option}
                                    </MenuItem>
                                )
                        ))}
                    </MenuList>
                    </ClickAwayListener>
                </Paper>
                </Grow>
            )}
            </Popper>
        );
    };

    return (
        <div className={clsx(classes.root, className)}>
            <div>
                {getSplitButton(itemListEl)}
            </div>
        </div>
    );
}