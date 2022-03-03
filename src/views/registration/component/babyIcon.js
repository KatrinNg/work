import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { ChildFriendly } from '@material-ui/icons';

class BabyIcon extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {
            classes,
            id,
            disabled,
            onClick,
            showBabyInfoIcon
        } = this.props;
        return (
            <Grid item container className={classes.babyInfoGrid}>
                <IconButton
                    id={id}
                    className={classes.babyInfoBtn}
                    disabled={disabled}
                    disableRipple
                    style={{ visibility: showBabyInfoIcon ? 'visible' : 'hidden' }}
                    onClick={onClick}
                >
                    <ChildFriendly fontSize="large" color="primary" className={classes.babyInfoIcon} />
                </IconButton>
            </Grid>
        );
    }
}
const styles = theme => ({
    babyInfoGrid: {
        position: 'absolute',
        width: 'fit-content',
        height: 'fit-content'
    },
    babyInfoBtn: {
        border: '1px solid #0579c8',
        borderRadius: 6,
        padding: 2,
        marginLeft: -50
    },
    babyInfoIcon: {
        width: '2rem',
        height: '2rem'
    }
});
const mapState = state => ({});
const mapDispatch = {};
export default connect(mapState, mapDispatch)(withStyles(styles)(BabyIcon));