import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
    root: {
        textTransform: 'none',
        boxShadow: '2px 2px 2px #6e6e6e',
        '-moz-box-shadow': '2px 2px 2px #6e6e6e',
        '-webkit-box-shadow': '2px 2px 2px #6e6e6e',
        '&:hover': {
            backgroundColor: 'rgb(0, 152, 255)'
        }
    },
    sizeSmall: {
        margin: theme.spacing(1),
        padding: '4px 12px'
    },
    sizeLarge: {
        margin: theme.spacing(1),
        padding: '8px 24px',
        fontSize: '0.6rem'
    },
    disabled: {
        borderColor: theme.palette.action.disabledBackground
    },
    buttonProgress: {
        position: 'absolute',
        top: 'cal(50%-24)',
        left: 'cal(50%-24)'
    }
});

class CIMSLoadingButton extends Component {

    state = {
        loading: false
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleClick = (e) => {
        this.setState({ loading: true });
        setTimeout(() => {
            if (this._isMounted) {
                this.setState({ loading: false });
            }
        }, this.props.loadSecond || 1000);
        if (this.props.onClick) {
            this.props.onClick(e);
        }
    }

    render() {
        // eslint-disable-next-line
        const { classes, onClick, loadSecond, disabled, ...rest } = this.props;// NOSONAR
        if (this.props.display === false) {
            return null;
        }
        return (
            <>
                <Button
                    classes={{
                        root: classes.root,
                        disabled: classes.disabled,
                        sizeSmall: classes.sizeSmall,
                        sizeLarge: classes.sizeLarge
                    }}
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={this.handleClick}
                    disabled={disabled || this.state.loading}
                    {...rest}
                >
                    {this.props.children}
                    {this.state.loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
            </>
        );
    }
}

export default withStyles(styles)(CIMSLoadingButton);