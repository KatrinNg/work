import React from 'react';
import PropTypes from 'prop-types';
import ValidatorComponent from './ValidatorComponent';
import {
    Grid,
    InputBase,
    IconButton,
    CircularProgress,
    Paper
} from '@material-ui/core';
import { Search, Clear } from '@material-ui/icons';
import FormHelperText from '@material-ui/core/FormHelperText';
import Typography from '@material-ui/core/Typography';
import RequiredIcon from '../InputLabel/RequiredIcon';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const styles = () => ({
    root: {
        // padding: '2px 4px',
        // display: 'flex',
        // alignItems: 'center',
        // borderRadius: '15px',
        // border: '1px solid rgba(0,0,0,0.42)',
        // height: 25,
        // width: 500
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '4px',
        border: '1px solid rgba(0,0,0,0.23)',
        height: 33
        // width: 'inherit'
    },
    rootFocus: {
        border: '1px solid #0579c8'
    },
    input: {
        marginLeft: 8,
        flex: 1,
        fontSize: '12pt'
    },
    iconButton: {
        padding: 10
    },
    rootError: {
        border: '1px solid #fd0000'
    }
});

class SearchInputValidator extends ValidatorComponent {

    onChange = (e) => {
        this.props.onChange && this.props.onChange(e);
    }
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
    keyDown = (e) => {
        if (e.keyCode === 13) {
            // this.search();
            this.props.keyDown && this.props.keyDown(e);
        }
    }


    errorMessage() {
        const { isValid, isWarn } = this.state;
        const { absoluteMessage } = this.props;
        const id = this.props.id ? this.props.id + '_helperText' : null;
        if (!isValid) {
            return (
                <FormHelperText
                    error
                    style={{
                        marginTop: 0,
                        position: absoluteMessage ? 'absolute' : 'relative'
                    }}
                    id={id}
                >
                    {this.getErrorMessage && this.getErrorMessage()}
                </FormHelperText>
            );
        }
        if (isWarn) {
            return (
                <FormHelperText style={{ marginTop: 0, position: absoluteMessage ? 'absolute' : 'relative', color: '#6E6E6E', padding: '5px 14px' }} id={id}>
                    {this.getWarningMessage && this.getWarningMessage()}
                </FormHelperText>
            );
        }
        return null;
    }

    inputLabel(labelText, isRequired, isSmallSize) {
        return (
            isSmallSize ?
                <Typography style={{ fontWeight: 'bold' }}>
                    {labelText}
                    {isRequired ? <RequiredIcon /> : null}
                </Typography>
                :
                <label style={{ fontWeight: 'bold' }}>
                    {labelText}
                    {isRequired ? <RequiredIcon /> : null}
                </label>
        );
    }

    // fireInputBaseBlur(e) {

    //     // this.inputBaseRef.blur();
    //     // this.setState({ isFocus: false });
    //     this.onBlur(e);
    // }

    searchInput() {
        const { classes, value, disabled } = this.props;//NOSONAR
        return (
            <Paper
                className={clsx(classes.root, { [classes.rootFocus]: this.state.isFocus, [classes.rootError]: !this.state.isValid })}
                elevation={0}
            // onMouseOver={this.handleMenuMouseOver}
            // onMouseLeave={this.handleMenuMouseLeave}
            // className={classes.root}
            >
                <Grid
                    autoComplete={'off'}//Cancel AutoFill in Google Browser
                    container
                    justify={'space-between'}
                    alignItems={'center'}

                >
                    <Grid container item>
                        <InputBase
                            id={this.props.id + '_inputBase'}
                            className={classes.input}
                            ref={ref => this.inputBaseRef = ref}
                            inputRef={node => {
                                this.anchorel = node;
                            }}
                            autoComplete="off"
                            onChange={this.onChange}
                            onBlur={this.onBlur}
                            onFocus={this.onFocus}
                            placeholder={this.props.inputPlaceHolder || ''}
                            value={value}
                            onKeyDown={this.keyDown}
                            disabled={disabled}
                        // error
                        // readOnly={this.state.keepDataSelected}
                        // {...rest}
                        />
                        <input type="text" style={{ display: 'none' }} />{/* Stop form auto submit */}
                        <IconButton
                            id={this.props.id + '_BUTTON'}
                            onClick={this.state.keepDataSelected ? this.closeSearchData : this.search}
                            className={classes.iconButton}
                            aria-label="Search"
                            color={'primary'}
                        >
                            {this.state.openSearchProgress ? (
                                <CircularProgress size={20} />
                            ) : (
                                    this.state.keepDataSelected ? <Clear /> : <Search />
                                )}
                        </IconButton>
                    </Grid>

                </Grid>
            </Paper>
        );

    }

    render() {
        /* eslint-disable */
        const { errorMessages, validators, withRequiredValidator, validatorListener, validByBlur,//NOSONAR
            onFocus, onBlur, warning, warningMessages, isRequired, labelText, labelProps,//NOSONAR
            labelPosition, msgPosition, notShowMsg, error, isSmallSize, absoluteMessage } = this.props;//NOSONAR
        /* eslint-enable */
        return (
            <Grid container direction="column" alignItems="flex-start">
                {
                    (labelText && labelPosition === 'top') || (msgPosition === 'top' && !notShowMsg) ?
                        <Grid container item alignItems="baseline" spacing={labelPosition === 'top' ? 1 : 0} style={{ paddingBottom: 1 }}>
                            {
                                labelPosition === 'top' ?
                                    <Grid item {...labelProps}>
                                        {this.inputLabel(labelText, isRequired, isSmallSize)}
                                    </Grid>
                                    : null
                            }
                            {
                                msgPosition === 'top' && !notShowMsg ?
                                    <Grid item>
                                        {this.errorMessage()}
                                    </Grid>
                                    : null
                            }
                        </Grid> : null
                }
                <Grid container item direction="row" alignItems="center" spacing={labelPosition === 'left' ? 1 : 0} wrap="nowrap">
                    {
                        labelPosition === 'left' ?
                            <Grid item {...labelProps}>
                                {this.inputLabel(labelText, isRequired, isSmallSize)}
                            </Grid> : null
                    }
                    <Grid item style={{ width: '100%' }} id={'div_' + this.props.id}>
                        {/* <CIMSTextField
                            error={!this.state.isValid || error}
                            ref={r => { this.input = r; }}
                            onFocus={this.onFocus}
                            onBlur={this.onBlur}
                            {...rest}
                        /> */}
                        {this.searchInput()}
                    </Grid>
                    {
                        msgPosition === 'right' && !notShowMsg ?
                            <Grid container item wrap="nowrap" xs={4} style={{ marginLeft: 10 }}>
                                {this.errorMessage()}
                            </Grid>
                            : null
                    }
                </Grid>
                {
                    msgPosition === 'bottom' && !notShowMsg ?
                        <Grid item>
                            {this.errorMessage()}
                        </Grid>
                        : null
                }
            </Grid>
        );
    }
}
SearchInputValidator.propTypes = {
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

SearchInputValidator.defaultProps = {
    withRequiredValidator: false,
    errorMessages: [],
    validators: [],
    validatorListener: () => { },
    isRequired: false,
    labelText: '',
    notShowMsg: false,
    msgPosition: 'bottom',
    labelPosition: 'top',
    validByBlur: true,
    warning: [],
    warningMessages: '',
    labelProps: {},
    absoluteMessage: true
};

export default withStyles(styles)(SearchInputValidator);