import * as React from 'react';
import clsx from 'clsx';
import { deepmerge } from '@material-ui/utils';
import withStyles from '@material-ui/styles/withStyles';
import Grow from '@material-ui/core/Grow';
import Popper from '@material-ui/core/Popper';
import useTheme from '@material-ui/styles/useTheme';
import Paper from '@material-ui/core/Paper';

function arrowGenerator() {
    return {
        '&[x-placement*="bottom"] $arrow': {
            flip: false,
            top: 0,
            left: 0,
            marginTop: '-0.95em',
            marginLeft: 4,
            marginRight: 4,
            width: '2em',
            height: '1em',
            '&::before': {
                flip: false,
                borderWidth: '0 1em 1em 1em',
                borderColor: 'transparent transparent currentcolor transparent'
            }
        },
        '&[x-placement*="top"] $arrow': {
            flip: false,
            bottom: 0,
            left: 0,
            marginBottom: '-0.95em',
            marginLeft: 4,
            marginRight: 4,
            width: '2em',
            height: '1em',
            '&::before': {
                flip: false,
                borderWidth: '1em 1em 0 1em',
                borderColor: 'currentcolor transparent transparent transparent'
            }
        },
        '&[x-placement*="right"] $arrow': {
            flip: false,
            left: 0,
            marginLeft: '-0.95em',
            marginTop: 4,
            marginBottom: 4,
            height: '2em',
            width: '1em',
            '&::before': {
                flip: false,
                borderWidth: '1em 1em 1em 0',
                borderColor: 'transparent currentcolor transparent transparent'
            }
        },
        '&[x-placement*="left"] $arrow': {
            flip: false,
            right: 0,
            marginRight: '-0.95em',
            marginTop: 4,
            marginBottom: 4,
            height: '2em',
            width: '1em',
            '&::before': {
                flip: false,
                borderWidth: '1em 0 1em 1em',
                borderColor: 'transparent transparent transparent currentcolor'
            }
        }
    };
}

export const styles = (theme) => ({
    popper: {
        zIndex: theme.zIndex.errorMsg,
        pointerEvents: 'none',
        flip: false // disable jss-rtl plugin
    },
    popperArrow: arrowGenerator(),
    paper: {
        padding: theme.spacing(1) / 2,
        color: theme.palette.errorColor,
        width: 135
    },
    paperArrow: {
        position: 'relative',
        margin: '0'
    },
    arrow: {
        position: 'absolute',
        fontSize: 6,
        '&::before': {
            content: '""',
            margin: 'auto',
            display: 'block',
            width: 0,
            height: 0,
            borderStyle: 'solid'
        }
    }
});

const ArrowPopper = React.forwardRef((props, ref) => {
    const {
        arrow = true, //NOSONAR
        children, //NOSONAR
        classes, //NOSONAR
        placement = 'bottom', //NOSONAR
        TransitionComponent = Grow, //NOSONAR
        TransitionProps, //NOSONAR
        ...other
    } = props;
    const theme = useTheme();
    const [arrowRef, setArrowRef] = React.useState(null);
    const mergedPopperProps = React.useMemo(() => {
        return deepmerge(
            {
                popperOptions: {
                    modifiers: {
                        arrow: {
                            enabled: Boolean(arrowRef),
                            element: arrowRef
                        },
                        flip: {
                            enabled: true
                        },
                        preventOverflow: {
                            enabled: true,
                            boundariesElement: 'scrollParent'
                        }
                    }
                }
            },
            other
        );
    }, [arrowRef, other]);
    return (
        <Popper
            className={clsx(classes.popper, {
                [classes.popperArrow]: arrow
            })}
            placement={placement}
            transition
            {...mergedPopperProps}
        >
            {({ TransitionProps: TransitionPropsInner }) => (
                <TransitionComponent
                    timeout={theme.transitions.duration.shorter}
                    {...TransitionPropsInner}
                    {...TransitionProps}
                >
                    <Paper
                        className={clsx(
                            classes.paper,
                            {
                                [classes.paperArrow]: arrow
                            }
                        )}
                    >
                        {children}
                        {arrow ? <span className={classes.arrow} ref={setArrowRef} /> : null}
                    </Paper>
                </TransitionComponent>
            )}
        </Popper>
    );
});

export default withStyles(styles)(ArrowPopper);