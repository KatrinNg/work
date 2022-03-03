import { ClickAwayListener, Fade, MenuItem, MenuList, Paper, Popper, Typography, withStyles } from '@material-ui/core';
import React, { useState } from 'react';

import CIMSButton from './CIMSButton';

const MenuButton = (props) => {
    const { classes, label, menuItems } = props;

    const [anchorEl, setAnchorE1] = useState(null);
    const [subAnchorEl, setSubAnchorEl] = useState({});

    const handleClose = () => {
        setAnchorE1(null);
        setSubAnchorEl({});
    };

    const getMenuList = (data, parent) => {
        const { classes, name, loginInfo } = props;
        // const id = 'menuBarButton' + name + 'MenuPopper';

        return data.map((menu) => {
            if (!menu.visible) {
                return null;
            }
            const childs = menu.child ? menu.child.length : 0;
            if (childs === 0) {
                return (
                    <MenuItem
                        // id={id + 'MenuItem' + menu.name}
                        key={menu.name}
                        className={classes.menuItemRoot}
                        disableGutters
                        onClick={(e) => {
                            // this.handleOnClick(menu);
                            menu.onClick && menu.onClick();
                            handleClose();
                            e && e.stopPropagation ? e.stopPropagation() : (window.event.cancelBubble = true);
                        }}
                    >
                        <Typography className={[classes.menuItemFont, classes.menuItemNormalFont]}>{menu.label}</Typography>
                    </MenuItem>
                );
            } else {
                // return (
                //     <MenuItem
                //         // id={`${id}MenuItem${menu.name}`}
                //         key={menu.name}
                //         className={classes.menuItemRoot}
                //         disableGutters
                //         onMouseEnter={(e) => {
                //             this.handleOpenChild(e, menu.name);
                //         }}
                //         onMouseLeave={(e) => {
                //             this.handleCloseChild(e, menu.name);
                //         }}
                //     >
                //         {menu.icon ? <Avatar src={`data:image/gif;base64,${menu.icon}`} className={classes.menuAvatarRoot} /> : null}
                //         <Typography className={[classes.menuItemFont, this.props.width == 'xl' ? classes.menuItemNormalFont : classes.menuItemSmallFont]}>
                //             {menu.label}
                //         </Typography>
                //         <IconButton justify={'flex-end'} color="primary" className={classes.iconRoot}>
                //             <NavigateNext />
                //         </IconButton>
                //         <Popper
                //             open={this.state.subAnchor[menu.name] !== undefined}
                //             anchorEl={this.state.subAnchor[menu.name]}
                //             placement="right-start"
                //             transition
                //             className={classes.popperRoot}
                //             modifiers={{
                //                 offset: {
                //                     offset: '-1px'
                //                 }
                //             }}
                //         >
                //             {({ TransitionProps }) => (
                //                 <Fade {...TransitionProps} timeout={{ enter: 350, exit: 0 }}>
                //                     <Paper className={classes.paperRoot}>
                //                         <MenuList className={classes.menuListRoot}>{this.getMenuList(menu.child, menu)}</MenuList>
                //                     </Paper>
                //                 </Fade>
                //             )}
                //         </Popper>
                //     </MenuItem>
                // );
            }
        });
    };

    return (
        <>
            {menuItems?.some((menu) => menu.visible) ? (
                <>
                    <CIMSButton
                        onClick={(e) => {
                            setAnchorE1(e.currentTarget);
                        }}
                        {...props}
                    >
                        {label}
                    </CIMSButton>
                    <ClickAwayListener onClickAway={handleClose}>
                        <Popper className={classes.popperRoot} open={anchorEl !== null} anchorEl={anchorEl} placement="bottom-start" transition>
                            {({ TransitionProps }) => (
                                <Fade {...TransitionProps} timeout={{ enter: 350, exit: 0 }}>
                                    <Paper className={classes.paperRoot}>
                                        <MenuList className={classes.menuListRoot}>{getMenuList(menuItems)}</MenuList>
                                    </Paper>
                                </Fade>
                            )}
                        </Popper>
                    </ClickAwayListener>
                </>
            ) : null}
        </>
    );
};

const styles = (theme) => ({
    gridRoot: {
        marginTop: 8,
        width: 'auto',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap'
    },
    gridRootPadding: {
        paddingRight: 10
    },
    gridRootNoPadding: {
        paddingRight: 0
    },
    avatarRoot: {
        display: 'flex',
        width: 20,
        height: 20,
        borderRadius: '5%'
    },
    menuAvatarRoot: {
        width: 15,
        height: 15,
        borderRadius: '5%',
        paddingRight: 5
    },
    paperRoot: {
        border: '1px solid #CCC',
        boxShadow: '4px 3px 5px -1px rgba(0,0,0,0.2), 5px 6px 8px 0px rgba(0,0,0,0.14), 4px 2px 14px 0px rgba(0,0,0,0.12)'
    },
    btnRoot: {
        color: theme.palette.primary.main,
        verticalAlign: 'middle',
        textTransform: 'none',
        padding: '2px 3px',
        minWidth: 0,
        borderRadius: '5px',
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.background.default
        }
    },
    btnSelectedRoot: {
        verticalAlign: 'middle',
        textTransform: 'none',
        padding: '2px 3px',
        minWidth: 0,
        borderRadius: '5px',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.background.default,
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.background.default
        }
    },
    titleRoot: {
        fontWeight: 600,
        color: 'inherit'
    },
    titleRootNormalFont: {
        fontSize: '16px'
    },
    titleRootSmallFont: {
        fontSize: '12px'
    },
    menuListRoot: {
        padding: 0
    },
    menuItemRoot: {
        minHeight: '25px',
        padding: '8px 10px',
        paddingRight: 40,
        // backgroundColor: theme.palette.background.default,
        backgroundColor: theme.palette.cimsBackgroundColor,
        color: theme.palette.primary.main,
        '&:hover': {
            padding: '8px 10px',
            paddingRight: 40,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.background.default
        },
        '&.Mui-disabled': {
            color: theme.palette.grey[400]
        }
    },
    menuItemFont: {
        color: 'inherit'
    },
    menuItemNormalFont: {
        fontSize: '16px'
    },
    menuItemSmallFont: {
        fontSize: '12px'
    },
    popperRoot: {
        zIndex: 1200
    },
    iconRoot: {
        color: '#B8BCB9',
        padding: 0,
        paddingRight: 5,
        right: 0,
        position: 'absolute'
    }
});

export default withStyles(styles)(MenuButton);
