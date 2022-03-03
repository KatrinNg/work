import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Popper, Fade, MenuList, MenuItem, Paper, ClickAwayListener } from '@material-ui/core';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import ClientServiceViewEnum from '../../../../enums/payment/clientServiceView/clientServiceViewEnum';
import { updateField } from '../../../../store/actions/payment/clientServiceView/clientServiceViewAction';
const styles = (theme) => ({
    titleRoot: {
        fontWeight: 600,
        color: 'inherit',
        fontSize: 'small'
    }, popperRoot: {
        zIndex: 1200
    },
    paperRoot: {
        border: '1px solid #CCC',
        width: '18ch'
    },
    menuListRoot: {
        padding: 0
    },
    menuItemRoot: {
        minHeight: '25px',
        padding: '8px 10px',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.primary.main,
        justifyContent: 'center',
        '&:hover': {
            padding: '8px 10px',
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.background.default,
            justifyContent: 'center'
        }
    }
});
const ReIssueItem = (props) => {
    const { id, classes, reissueList, handleClose, reItemOnClick } = props;
    return reissueList && reissueList.map(item => {
        return (
            <MenuItem
                id={id + 'MenuItem' + item.chargeCd}
                key={item.chargeCd}
                classes={{ root: classes.menuItemRoot }}
                disableGutters
                onClick={(e) => { reItemOnClick(item); handleClose(); e && e.stopPropagation ? e.stopPropagation() : window.event.cancelBubble = true; }}
            >
                <Typography className={classes.menuItemFont}>{item.chargeCd === 'RIOTHER' ? 'Others' : item.chargeDesc}</Typography>
            </MenuItem>
        );
    });
};

const reIssueCertBtn = (props) => {
    const { id, classes, thsCharges, reItemOnClick, disabled } = props;
    const [anchorEl, setAnchorEl] = React.useState(() => { return null; });
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleOpen = (e) => {
        setAnchorEl(anchorEl ? null : e.currentTarget);
    };
    const reissueList = thsCharges.filter(item => item.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.ReissueCertificate);
    return (
        <CIMSButton
            onClick={handleOpen}
            id={'menuBarButton' + name + 'button'}
            disabled={disabled}
        >
            {'Re-issue Certificate'}
            <Popper
                id={id}
                open={anchorEl !== null}
                anchorEl={anchorEl}
                placement={'top'}
                transition
                disablePortal
            >
                {
                    ({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={{ enter: 350, exit: 0 }} style={{ transformOrigin: 'center top' }} >
                            <Paper className={classes.paperRoot}>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList className={classes.menuListRoot}>
                                        <ReIssueItem
                                            id={id}
                                            classes={classes}
                                            reissueList={reissueList}
                                            reItemOnClick={reItemOnClick}
                                            handleClose={handleClose}
                                        />
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Fade>
                    )
                }
            </Popper>
        </CIMSButton>
    );
};

const mapState = (state) => {
    return {
        thsCharges: state.clientSvcView.thsCharges
    };
};

const dispatch = {
    updateField
};

export default connect(mapState, dispatch)(withStyles(styles)(reIssueCertBtn));