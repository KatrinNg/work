import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Zoom from '@material-ui/core/Zoom';
import CIMSTextField from '../TextField/CIMSTextField';
import ArrowPopper from '../Popper/ArrowPopper';
import ValidatorComponent from './ValidatorComponent';

class TextComponent extends ValidatorComponent {
    onFocus = (e) => {
        this.setState({ isFocus: true });
        this.props.onFocus && this.props.onFocus(e);
    }

    onBlur = (e) => {
        this.setState({ isFocus: false });
        this.props.onBlur && this.props.onBlur(e);
        setTimeout(() => {
            //when form is validating, cancel validate
            if (!this.context.form.getValidating()) {
                if (this.props.validByBlur) {
                    this.validateCurrent();
                }
                if (this.props.warning) {
                    this.checkWarning();
                }
            }
        }, 100);
    }

    getErrOrWarnMsg() {
        const { classes } = this.props;
        const { isValid, isWarn } = this.state;
        if (!isValid) {
            return <Typography className={classes.errorMessage}>{this.getErrorMessage()}</Typography>;
        }
        if (isWarn) {
            return <Typography className={classes.warnMessage}>{this.getWarningMessage()}</Typography>;
        }
        return null;
    }

    focus() {
        this.inputRef && this.inputRef.focus();
    }

    render() {
        /* eslint-disable */
        const {
            classes, //NOSONAR
            errorMessages, //NOSONAR
            validators, //NOSONAR
            withRequiredValidator, //NOSONAR
            validatorListener, //NOSONAR
            validByBlur, //NOSONAR
            onFocus, //NOSONAR
            onBlur, //NOSONAR
            warning, //NOSONAR
            warningMessages, //NOSONAR
            notShowMsg, //NOSONAR
            error, //NOSONAR
            PopperProps, //NOSONAR
            portalContainer = this.gridRef, //NOSONAR
            ...rest //NOSONAR
        } = this.props;
        /* eslint-enable */

        const { isValid, isWarn } = this.state;
        return (
            <Grid container ref={ref => this.gridRef = ref}>
                <CIMSTextField
                    error={!isValid || error}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    inputRef={r => this.inputRef = r}
                    {...rest}
                />
                {
                    !notShowMsg && portalContainer ?
                        <ArrowPopper
                            {...PopperProps}
                            id={this.props.id + '_arrowPopper'}
                            open={(!isValid || isWarn) && this.gridRef ? true : false}
                            anchorEl={this.gridRef}
                            container={portalContainer}
                            TransitionComponent={Zoom}
                        >
                            {this.getErrOrWarnMsg()}
                        </ArrowPopper> : null
                }
            </Grid>
        );
    }
}

const styles = theme => ({
    errorMessage: {
        color: theme.palette.errorColor,
        fontSize: '0.75rem'
    },
    warnMessage: {
        color: theme.palette.grey[700],
        fontSize: '0.75rem'
    }
});

const TextComponentRender = withStyles(styles)(TextComponent);

const TextValidator = React.forwardRef((props, ref) => {
    const { validators, errorMessages, ...rest } = props;
    const { disabled } = props;
    return (
        <TextComponentRender
            validators={disabled ? [] : validators}
            errorMessages={disabled ? [] : errorMessages}
            innerRef={ref}
            {...rest}
        />
    );
});

TextValidator.propTypes = {
    errorMessages: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.string
    ]),
    validators: PropTypes.array,
    value: PropTypes.any,
    validatorListener: PropTypes.func,
    withRequiredValidator: PropTypes.bool,
    validByBlur: PropTypes.bool
};

TextValidator.defaultProps = {
    withRequiredValidator: false,
    errorMessages: [],
    validators: [],
    validatorListener: () => { },
    notShowMsg: false,
    validByBlur: true,
    warning: [],
    warningMessages: ''
};

export default TextValidator;