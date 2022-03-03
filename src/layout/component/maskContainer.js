import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import timg from '../../images/timg.gif';

const styles = theme => ({
    container: {
        width: '100%',
        height: '100%',
        position: 'relative'
    },
    padding: {
        padding: theme.spacing(1),
        height: `calc(100% - ${theme.spacing(1) * 2}px)`,
        //height:0,
        width: `calc(100% - ${theme.spacing(1) * 2}px)`
    },
    backdrop: {
        position: 'absolute',
        zIndex: theme.zIndex.drawer,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        left: 0,
        top: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
});

const MaskContainer = React.forwardRef(function MaskContainer(props, ref) {
    const { classes, loading, functionCd, activeFuncCd, children, padding, ...rest } = props;

    return (
        <div
            className={clsx(classes.container, { [classes.padding]: padding })}
            {...rest}
            style={{ display: functionCd === activeFuncCd ? '' : 'none'}}
        >
            {children}
            <div
                className={classes.backdrop}
                style={{ display: loading ? 'flex' : 'none' }}
            >
                <img src={timg} alt={''} />
            </div>
        </div>
    );
});

MaskContainer.defaultProps = {
    padding: true
};

MaskContainer.propTypes = {
    /**
     * If `true`, the backdrop is open
     */
    loading: PropTypes.bool,
    /**
     * The container must have a functionCd(accessRightCd)
     */
    functionCd: PropTypes.string.isRequired,
    /**
     * Current active functionCd
     */
    activeFuncCd: PropTypes.string.isRequired
};

export default withStyles(styles)(MaskContainer);