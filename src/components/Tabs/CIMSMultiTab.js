import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { Clear } from '@material-ui/icons';

const styles = theme => ({
    root: {
        padding: 0,
        paddingLeft: 5,
        paddingRight: 5,
        lineHeight: 1.5,
        minWidth: 'unset',
        maxWidth: 'unset',
        minHeight: 30,
        'border-top-left-radius': 5,
        'border-top-right-radius': 5,
        textTransform: 'none',
        marginRight: 4,
        '&:hover': {
            color: theme.palette.white
        }
    },
    textColorPrimary: {
        color: theme.palette.text.primary,
        backgroundColor: `${theme.palette.primary.main}42`,
        '&$selected': {
            color: theme.palette.background.paper,
            backgroundColor: theme.palette.primary.main,
            boxShadow: `1px 1px 3px ${theme.palette.primary.main}`
        }
    },
    selected: {
        color: theme.palette.background.paper,
        backgroundColor: theme.palette.primary.main,
        boxShadow: `1px 1px 3px ${theme.palette.primary.main}`
    },
    // labelContainer: {
    //     padding: 0
    // },
    labelTypographyContainer: {
        paddingLeft: 0
    },
    labelTypography: {
        color: 'inherit',
        lineHeight: 1.3,
        //fontSize: '0.675rem',
        // overflow: 'hidden',
        // 'text-overflow': 'ellipsis',
        'white-space': 'nowrap'
    },
    clearButton: {
        padding: 2
    },
    tooltip: {
        maxWidth: 'none'
    }
});

class CIMSMultiTab extends React.Component {

    shouldComponentUpdate(nextProps) {
        return nextProps.selected !== this.props.selected || nextProps.label !== this.props.label;
    }

    handleOnClear = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.props.onClear(e);
    }

    handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if(e.button === 1){
            const { disableClose } = this.props;
            if (!disableClose){
                this.props.onClear(e);
            }
        } else {
            this.props.onMouseDown && this.props.onMouseDown(e);
        }
    }

    render() {
        // eslint-disable-next-line
        const { classes, label, onClear, disableClose, disabled, onMouseDown, ...rest } = this.props;//NOSONAR
        return (
            <Tab
                disableFocusRipple
                disabled={disabled}
                component="div"
                classes={{
                    root: classes.root,
                    // labelContainer: classes.labelContainer,
                    textColorPrimary: classes.textColorPrimary,
                    selected: classes.selected
                }}
                onMouseDown={this.handleMouseDown}
                onClick={this.handleOnClick}
                label={
                    <Grid container alignItems="center" wrap="nowrap" justify="space-between">
                        <Grid item xs={disableClose || disabled ? 12 : 'auto'} className={classes.labelTypographyContainer}>
                            <Tooltip title={label} classes={{ tooltip: classes.tooltip }}>
                                <Typography className={classes.labelTypography}>{label}</Typography>
                            </Tooltip>
                        </Grid>
                        <Grid item style={{ display: disableClose || disabled ? 'none' : 'block' }}>
                            <IconButton
                                id={'cims-multitab-btndelete-' + this.props.value}
                                size="small"
                                className={classes.clearButton}
                                onClick={this.handleOnClear}
                                tabIndex={-1}
                            >
                                <Clear fontSize="inherit" />
                            </IconButton>
                        </Grid>
                    </Grid>
                }
                {...rest}
            />
        );
    }
}

CIMSMultiTab.propTypes = {
    onClear: PropTypes.func,
    disableClose: PropTypes.bool
};

CIMSMultiTab.defaultProps = {
    onClear: () => { },
    disableClose: false
};

export default withStyles(styles)(CIMSMultiTab);