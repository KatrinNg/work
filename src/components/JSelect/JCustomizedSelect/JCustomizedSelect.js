import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import memoize from 'memoize-one';
import Select from 'react-select';
import { emphasize, makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
// import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
// import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
// import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import MenuList from '@material-ui/core/MenuList';
// import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';
import { getState } from '../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const useStyles = makeStyles(theme => ({
    input: {
        display: 'flex',
        padding: '0 0 0 8px',
        height: 'auto',
        fontSize: font.fontSize
        // backgroundColor: '#ffffff',
        // borderRadius: 4
    },
    multiBaseInput: {
        height: 'auto',
        minHeight: 26
    },
    valueContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
        overflow: 'hidden',
        color:'black'
    },
    chip: {
        margin: theme.spacing(0.5, 0.25),
        height: 'auto'
    },
    chipLabel: {
        fontSize: 'unset'
    },
    chipDeleteIcon: {
        fontSize: 'unset'
    },
    chipFocused: {
        backgroundColor: emphasize(
            theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
            0.08
        )
    },
    noOptionsMessage: {
        padding: theme.spacing(1, 2)
    },
    singleValue: {
        paddingLeft: 8,
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        // fontStyle: 'Arial',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 'calc(100% - 14px)'
    },
    placeholder: {
        // position: 'absolute',
        // top: 2,
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        // fontStyle: 'Arial',
        paddingLeft: 8,
        color: color.cimsPlaceholderColor
    },
    menuItem: {
        paddingTop: 10,
        paddingBottom: 10,
        //whiteSpace: 'normal',
        whiteSpace: 'nowrap',
        height: 'auto',
        lineHeight: 1,
        minHeight: 'unset',
        fontWeight: 400,
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        color: color.cimsTextColor
    },
    paper: {
        // position: 'absolute',
        // zIndex: 2,
        // marginTop: 0,
        // left: 0,
        // right: 0,
        backgroundColor: color.cimsBackgroundColor
        // background: '#fff'
        //fontSize: props.isSmallSize ? '10pt' : '',
        //width: menuWidth
    },
    smallSize: {
        fontSize: '10pt'
    },
    menuItemSelected: {
        fontWeight: 500
    },
    disabled: {
        color: color.cimsTextColor,
        backgroundColor: color.cimsDisableColor
    }
}));


function NoOptionsMessage(props) {
    return (
        <Typography
            color="textSecondary"
            className={
                classNames({
                    [props.selectProps.classes.noOptionsMessage]: true,
                    [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
                })
            }
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

// NoOptionsMessage.propTypes = {
//     children: PropTypes.node,
//     innerProps: PropTypes.object.isRequired,
//     selectProps: PropTypes.object.isRequired
// };

function inputComponent({ inputRef, ...props }) {
    return <div ref={inputRef} {...props} />;
}

inputComponent.propTypes = {
    inputRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({
            current: PropTypes.any.isRequired
        })
    ])
};

function Control(props) {
    const {
        children,
        innerProps,
        innerRef,
        selectProps: { classes, TextFieldProps }
    } = props;

    let txtVal = '';
    if (props.isMulti && props.selectProps.value) {
        const valArr = props.selectProps.value.map(item => item.value);
        txtVal = valArr.join(';');
    } else if (!props.isMulti && props.selectProps.value) {
        txtVal = props.selectProps.value.value;
    }
    return (
        <TextField
            id={props.selectProps.id + '_control'}
            error={!props.selectProps.isValid}
            value={txtVal}
            fullWidth
            disabled
            variant="outlined"

            InputProps={{
                inputComponent,
                inputProps: {
                    className: classes.input,
                    ref: innerRef,
                    children,
                    style: props.selectProps.inputStyle,
                    ...innerProps
                },
                classes: {
                    root: classNames({
                        [props.selectProps.classes.multiBaseInput]: props.selectProps.isMulti,
                        [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
                    }),
                    disabled: props.selectProps.isDisabled? props.selectProps.classes.disabled: null
                }
            }}
            {...TextFieldProps}
        />
    );
}

Control.propTypes = {
    children: PropTypes.node,
    innerProps: PropTypes.shape({
        onMouseDown: PropTypes.func.isRequired
    }).isRequired,
    innerRef: PropTypes.oneOfType([
        PropTypes.oneOf([null]),
        PropTypes.func,
        PropTypes.shape({
            current: PropTypes.any.isRequired
        })
    ]).isRequired,
    selectProps: PropTypes.object.isRequired
};

function Option(props) {
    return (
        <MenuItem
            ref={props.innerRef}
            selected={props.isFocused}
            component="div"
            className={
                classNames({
                    [props.selectProps.classes.menuItem]: true,
                    [props.selectProps.classes.menuItemSelected]: props.isSelected,
                    [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
                })
            }
            {...props.innerProps}
        >
            {props.children}
        </MenuItem>
    );
}

Option.propTypes = {
    children: PropTypes.node,
    // innerProps: PropTypes.shape({
    //     id: PropTypes.string.isRequired,
    //     key: PropTypes.string.isRequired,
    //     onClick: PropTypes.func.isRequired,
    //     onMouseMove: PropTypes.func.isRequired,
    //     onMouseOver: PropTypes.func.isRequired,
    //     tabIndex: PropTypes.number.isRequired
    // }).isRequired,
    /**
     * Inner ref to DOM Node
     */
    // innerRef: PropTypes.oneOfType([
    //     PropTypes.oneOf([null]),
    //     PropTypes.func,
    //     PropTypes.shape({
    //         current: PropTypes.any.isRequired
    //     })
    // ]).isRequired,
    /**
     * Whether the option is focused.
     */
    isFocused: PropTypes.bool.isRequired,
    /**
     * Whether the option is selected.
     */
    isSelected: PropTypes.bool.isRequired
};

function Placeholder(props) {
    const { selectProps, innerProps = {}, children } = props;
    return (
        <Typography
            color="textSecondary"
            className={
                classNames({
                    [selectProps.classes.placeholder]: true,
                    [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
                })
            }
            {...innerProps}
        >
            {children}
        </Typography>
    );
}

Placeholder.propTypes = {
    children: PropTypes.node,
    // innerProps: PropTypes.object,
    selectProps: PropTypes.object.isRequired
};

function SingleValue(props) {
    return (
        <Typography
            className={
                classNames({
                    [props.selectProps.classes.singleValue]: true,
                    [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
                })
            }
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

SingleValue.propTypes = {
    children: PropTypes.node,
    // innerProps: PropTypes.any.isRequired,
    selectProps: PropTypes.object.isRequired
};

function ValueContainer(props) {
    return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

ValueContainer.propTypes = {
    children: PropTypes.node,
    selectProps: PropTypes.object.isRequired
};

function MultiValue(props) {
    return (
        <Chip
            tabIndex={-1}
            label={props.children}
            className={clsx(props.selectProps.classes.chip, {
                [props.selectProps.classes.chipFocused]: props.isFocused
            })}
            classes={{
                label: props.selectProps.classes.chipLabel,
                deleteIcon: props.selectProps.classes.chipDeleteIcon
            }}
            onDelete={props.removeProps.onClick}
            deleteIcon={<CancelIcon {...props.removeProps} />}
        />
    );
}

MultiValue.propTypes = {
    children: PropTypes.node,
    isFocused: PropTypes.bool.isRequired,
    removeProps: PropTypes.shape({
        onClick: PropTypes.func.isRequired,
        onMouseDown: PropTypes.func.isRequired,
        onTouchEnd: PropTypes.func.isRequired
    }).isRequired,
    selectProps: PropTypes.object.isRequired
};

// function Menu(props) {
//     return (
//         <components.Menu
//             menuPlacement={'auto'}
//             {...props}
//         >
//             <Grid id={props.selectProps.id + '_menu_container'}>
//                 {props.children}
//             </Grid>

//         </components.Menu>
//     );
// }

// function Menu(props) {
//     return (
//         <Paper
//             square
//             id={props.selectProps.id + '_menu_container'}
//             className={
//                 classNames({
//                     [props.selectProps.classes.paper]: true,
//                     [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
//                 })
//             }
//             {...props.innerProps}
//         >
//             {props.children}
//         </ Paper>
//     );
// }

function Menu(props) {
    const textFieldControl = props.selectProps.wrapper&&props.selectProps.wrapper.current;
    const minWidth = textFieldControl&&textFieldControl.getBoundingClientRect?textFieldControl.getBoundingClientRect().width:0;
    return (
        <Popper
            id={props.selectProps.id + '_menu_container'}
            open
            anchorEl={textFieldControl}
            placement="bottom"
            modifiers={{
                flip: {
                    enabled: true
                }
            }}
            style={{ minWidth: minWidth, zIndex: 1301 }}
            {...props.innerProps}
        >
            <Paper classes={{'root': props.selectProps.classes.paper}}>
                <MenuList>
                    {props.children}
                </MenuList>
            </Paper>
        </Popper>
    );
}

// Menu.propTypes = {
//     children: PropTypes.element.isRequired,
//     innerProps: PropTypes.object.isRequired,
//     selectProps: PropTypes.object.isRequired
// };

const myComponents = {
    Control,
    Menu,
    MultiValue,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer
};

const JCustomizedSelect = React.forwardRef((props, ref) => {
    const selectWrapper = React.useRef(null);
    const classes = useStyles();
    const theme = useTheme();

    const { options, defaultValue, value, styles, isSearchable, ...rest } = props;
    //const menuWidth = this.calcMenuWidth(opt, skipCalcMenuWidth !== undefined ? skipCalcMenuWidth : true);
    const selectStyles = {
        // menu: base => ({
        //     ...base,
        //     position: 'absolute',
        //     zIndex: 2,
        //     marginTop: 0,
        //     left: 0,
        //     right: 0,
        //     background: '#fff',
        //     fontSize: props.isSmallSize ? '10pt' : '',
        //     //width: menuWidth,
        //     minWidth: '100%',
        //     display: 'inline-table'
        // }),
        input: base => ({
            ...base,
            color: theme.palette.text.primary,
            '& input': {
                font: 'inherit'
            }
        }),
        ...styles
    };

    const multiValFilter = memoize((options, value) => {
        let filterList = [];
        for (let i = 0; i < value.length; i++) {
            filterList.push(options.find(item => item.value === value[i]));
        }
        return filterList;
    });

    // const calcMenuWidth = (options, skipCalc) => {
    //     let menuWidth = null;
    //     let maxlength = 0;
    //     if (skipCalc) {
    //         menuWidth = '100%';
    //     }
    //     else {
    //         options.forEach(opt => {
    //             let tempLength = opt.label.length;
    //             if (tempLength > maxlength) {
    //                 maxlength = tempLength;
    //             }
    //         });
    //         if (maxlength >= 20 && maxlength < 25) {
    //             menuWidth = maxlength * 9;
    //         }
    //         else if (maxlength >= 25 && maxlength < 40) {
    //             menuWidth = maxlength * 10;
    //         }
    //         else if (maxlength >= 40) {
    //             menuWidth = maxlength * 8;
    //         }
    //         else {
    //             menuWidth = '100%';
    //         }
    //     }
    //     return menuWidth;
    // }

    let opt = options || [];
    let defaultVal = null, val = null;
    if (props.isMulti) {
        defaultVal = defaultValue ? multiValFilter(opt, defaultValue) : null;
        val = value ? multiValFilter(opt, value) : defaultVal;
    } else {
        defaultVal = defaultValue ? opt.find(item => item.value === defaultValue) : null;
        val = value ? opt.find(item => item.value === value) : defaultVal;
    }

    return (
        <div ref={selectWrapper}>
        <Select
            options={opt}
            value={val}
            defaultValue={defaultVal}
            classes={classes}
            components={myComponents}
            placeholder=""
            // menuShouldScrollIntoView
            // menuPlacement={'auto'}
            ref={ref}
            wrapper={selectWrapper}
            isValid
            {...rest}
            styles={selectStyles}
            isSearchable={isSearchable?false:true}
        />
        </div>
    );
});

export default JCustomizedSelect;
