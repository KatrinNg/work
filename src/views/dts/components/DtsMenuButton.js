import React, { useImperativeHandle } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import withStyles from '@material-ui/core/styles/withStyles';

//const useStyles = makeStyles(theme => ({
const styles = {
    root: {
        display: 'flex'
    },
    menuItemHorizontal:{
        display: 'inline-flex',
        padding: '4px'
    },
    popper: {
        zIndex: 2
    }
//    }));
};



const DtsMenuButton = React.forwardRef((props, ref) => {
//export default function DtsMenuButton(props, ref) {
    //const {className, ...others} = props;
    const {classes, ...others} = props;
    //const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const handleMenuToggle = (event) => {
        event.stopPropagation();
        let willOpen = null;
        setOpen((prevOpen) => {
            willOpen = !prevOpen;
            return !prevOpen;
        });
        // console.log(JSON.stringify(open));
        // console.log(anchorRef.current);
        if (typeof props.onMenuToggle === 'function'){
            props.onMenuToggle(event);
        }
        if (willOpen && typeof props.onMenuOpen === 'function'){
            props.onMenuOpen(event, setOpen);
        }
        if (!willOpen && typeof props.onMenuOpen === 'function'){
            props.onMenuClose(event);
        }
    };

    const handleMenuClose = event => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
        if (typeof props.onMenuClose === 'function'){
            props.onMenuClose(event);
        }
    };

    // return focus to the button when we transitioned from !open -> open
    const prevOpen = React.useRef(open);

    React.useEffect(() => {
        if (prevOpen.current === true && open === false && anchorRef) {
            anchorRef.current.focus();
        }

        prevOpen.current = open;

    }, [open]);

    useImperativeHandle(ref, () => ({
        close: () => {
            setOpen(false);
        }
    }));

    const getMenuButton = (item, buttonSize) => {
        return (
            <IconButton
                size={buttonSize}
                ref={anchorRef}
                aria-controls={open ? 'menu-list' : undefined}
                aria-haspopup="true"
                onClick={e => handleMenuToggle(e)}
            >
                {item}
            </IconButton>
        );
    };

    const handleAction = (e, action) => {
        e.stopPropagation();
        if (typeof action === 'function'){
            setTimeout(() => { // New thread to run the (await) action block in order NOT to disrupt the onClickAway listener.
                action(e);
            }, 0);
            setOpen(false);
        }
    };

    const getMenu = (classes, items, close) => {
        if(close && open){
            handleMenuClose();
        }
        return (
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                className={classes.popper}
            >
            {({ TransitionProps, placement }) => (
                <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                >
                    <Paper>
                    <ClickAwayListener onClickAway={handleMenuClose}>
                        <MenuList id="menu-list">
                            {items.map(function(value, idx){
                                return <MenuItem
                                    key={idx}
                                    className={(props.direct === 'horizontal') ? classes.menuItemHorizontal : ''}
                                    //onClick={value.action}
                                    onClick={(e) => {handleAction(e, value.action);}}
                                       >
                                        {value.item}
                                    </MenuItem>;
                            })}
                        </MenuList>
                    </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
            </Popper>
        );
    };

    return (
        //<div className={clsx(classes.root, className)}>
        <div className={classes.root}>
            <div>
                {getMenuButton(props.buttonEl, props.menuButtonSize)}
                {getMenu(classes, props.itemListEl, props.close)}
            </div>
        </div>
    );
});

export default withStyles(styles)(DtsMenuButton);