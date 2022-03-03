import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import SvgIcon from '@material-ui/core/SvgIcon';
import DoubleArrowRight from '../../images/double_arrow_right.svg';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

const styles = theme => ({
    root: {
        width: 'min-content',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    button: {
        margin: theme.spacing(2),
        textTransform: 'none'
    }
});

class MoveSideButtons extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            id,
            classes,
            allRightBtnProps,
            singleRightBtnProps,
            singleLeftBtnProps,
            allLeftBtnProps
        } = this.props;
        return (
            <Grid item className={classes.root}>
                <IconButton
                    id={`${id}_moveAllRight`}
                    color="primary"
                    className={classes.button}
                    {...allRightBtnProps}
                >
                    <SvgIcon component={DoubleArrowRight} children={<div></div>} />
                </IconButton>
                <IconButton
                    id={`${id}_moveSingleRight`}
                    color="primary"
                    className={classes.button}
                    {...singleRightBtnProps}
                >
                    <KeyboardArrowRight />
                </IconButton>
                <IconButton
                    id={`${id}_moveSingleLeft`}
                    color="primary"
                    className={classes.button}
                    {...singleLeftBtnProps}
                >
                    <KeyboardArrowLeft />
                </IconButton>
                <IconButton
                    id={`${id}_moveAllLeft`}
                    color="primary"
                    className={classes.button}
                    {...allLeftBtnProps}
                >
                    <SvgIcon component={DoubleArrowRight} style={{ transform: 'rotate(180deg)' }} children={<div></div>} />
                </IconButton>
            </Grid>
        );
    }
}

export default withStyles(styles)(MoveSideButtons);