import React, { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import memoize from 'memoize-one';
import Select, { components } from 'react-select';
import { emphasize, makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
// import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
// import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
// import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import MaterialMenuList from '@material-ui/core/MenuList';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';
import _ from 'lodash';
import makeAnimated from 'react-select/animated';
import { ArrowDropDown } from '@material-ui/icons';
import { getState } from '../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const animatedComponents = makeAnimated();
const useStyles = makeStyles(theme => ({
    input: {
        display: 'flex',
        fontSize: props => props.isSmallSize ? '10pt' : font.fontSize
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
        overflow: 'hidden'
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
        fontSize: props => props.isSmallSize ? '10pt' : font.fontSize,
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
        fontSize: props => props.isSmallSize ? '10pt' : font.fontSize,
        fontFamily: font.fontFamily,
        // fontStyle: 'Arial',
        paddingLeft: 8,
        color: color.cimsPlaceholderColor
    },
    menuList: {
        maxHeight: 300,
        overflowY: 'auto',
        paddingBottom: 4,
        paddingTop: 4,
        position: 'relative',
        '-webkit-overflow-scrolling': 'touch',
        boxSizing: 'border-box'
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
        color: color.cimsTextColor
    },
    paper: {
        backgroundColor: color.cimsBackgroundColor
    },
    smallSize: {
        fontSize: '10pt'
    },
    menuItemSelected: {
        fontWeight: 500,
        backgroundColor: theme.palette.action.hover
    }
}));

let scrollOptionTop = 0;

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

function inputComponent({ inputRef, ...props }) {
    return <div style={{color:props.disabled ? 'gray' : 'black'}} ref={inputRef} {...props} />;
}

function Control(props) {
    const {
        children,
        innerProps,
        innerRef,
    selectProps: { classes, TextFieldProps }
    } = props;
    let txtVal = '';
    if (props.isMulti && props.selectProps.value) {
        const valArr = props.selectProps.value.map(item => item && item.value);
        txtVal = valArr.join(';');
    } else if (!props.isMulti && props.selectProps.value) {
        txtVal = props.selectProps.value.value;
    }

    const handleKeyDown = (e) => {
        if (props.selectProps.isClearable) {
            if (e.keyCode === 8 || e.keyCode === 46) {
                props.clearValue();
            }
        }
    };
    return (
        <TextField
            id={props.selectProps.id + '_control'}
            error={!props.selectProps.isValid}
            value={txtVal}
            fullWidth
            disabled={props.selectProps.isDisabled}
            variant={props.selectProps.isDisabled ? 'standard' : 'outlined'}
            // variant="outlined"
            InputProps={{
                inputComponent,
                inputProps: {
                    className: classes.input,
                    ref: innerRef,
                    children,
                    ...innerProps
                },
                classes: {
                    root: classNames({
                        [props.selectProps.classes.multiBaseInput]: props.selectProps.isMulti,
                        [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
                    })
                }
            }}
            onKeyDown={handleKeyDown}
            {...TextFieldProps}
        />
    );
}

function Option(props) {
    const menuItemRef = React.useRef();
    React.useEffect(() => {
        if (props.isSelected) {
            scrollOptionTop = menuItemRef.current.offsetTop;
        }
    }, []);
    //add by Demi on 20200312
    const { moeFilter, filtedList, filterVal } = props.selectProps;
    return (
        <MenuItem
            ref={menuItemRef}
            // ref={props.innerRef}
            selected={props.isSelected}
            component="div"
            className={
                classNames({
                    [props.selectProps.classes.menuItem]: true,
                    [props.selectProps.classes.menuItemSelected]: props.isFocused,
                    [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
                })
            }
            {...props.innerProps}
        >
            {/* add by Demi on 20200312 start */}
            {
                moeFilter && moeFilter.filterField
                    && (
                        (filterVal && filterVal == props.data[moeFilter.filterField])//first search
                        || (moeFilter.displayFiledName && props.data[moeFilter.displayFiledName]//Selected once and then search again
                            && (filterVal == props.data.label
                                || props.isSelected)
                        )
                        || (filtedList.indexOf(props.data[moeFilter.filterField]) > -1//After no selected, then search again
                            && filterVal == props.data.label)
                    )
                    && props.data[moeFilter.filterField] ?
                    `(${props.data[moeFilter.filterField]}) ${props.children}`
                    :
                    props.children
            }
            {/* add by Demi on 20200312 end */}
            {/* {props.children} */}
        </MenuItem>
    );
}

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

function SingleValue(props) {
    //add by Demi on 20200312
    const { moeFilter, filterVal, isSearchingVal } = props.selectProps;
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
            {/* add by Demi on 20200312 start */}
            {
                moeFilter && moeFilter.filterField
                    && props.data[moeFilter.filterField]
                    // && (filterVal || isSearchingVal)
                    && (moeFilter.displayFiledName
                        && props.data[moeFilter.displayFiledName]
                        && (props.data.label == filterVal
                            || props.data[moeFilter.filterField] == filterVal
                            || isSearchingVal)//select by search
                    )
                    ?
                    `(${props.data[moeFilter.filterField]}) ${props.children}`
                    :
                    props.children
            }
            {/* add by Demi on 20200312 end */}
            {/* {props.children} */}
        </Typography>
    );
}

function ValueContainer(props) {
    return (
        <div
            // style={{ backgroundColor: !props.isMulti && props.selectProps.value ? 'white' : '' }}
            className={props.selectProps.classes.valueContainer}
        >{props.children}</div>
    );
}

function DropdownIndicator(props) {
  return (
    <components.DropdownIndicator {...props}>
      <ArrowDropDown style={{color:'rgba(0,0,0,0.54)'}}/>
    </components.DropdownIndicator>
  );
}

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

function Menu(props) {
    const textFieldControl = document.getElementById(props.selectProps.id + '_control');
    const minWidth = textFieldControl.getBoundingClientRect().width;
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
            popperOptions={{
                positionFixed: true
            }}
            style={{ minWidth: minWidth, zIndex: 1301}}
            {...props.innerProps}
        >
            <Paper classes={{'root': props.selectProps.classes.paper}}>
                <MaterialMenuList>
                    {props.children}
                </MaterialMenuList>
            </Paper>
        </Popper>
    );
}

function MenuList(props) {

    const menuListRef = React.useRef();

    React.useEffect(() => {
        menuListRef.current.scrollTop = scrollOptionTop;
    }, []);

    return (
        <Grid className={props.selectProps.classes.menuList} ref={menuListRef}>
            {props.children}
        </Grid>
    );
}

const myComponents = {
    Control,
    Menu,
    MenuList,
    MultiValue,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer,
    DropdownIndicator,
    animatedComponents
};

const singleComponents = {
    Control,
    Menu,
    MenuList,
    MultiValue,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer,
    DropdownIndicator
};



const JSelect = React.forwardRef((props, ref) => {
    const classes = useStyles(props);//update by Demi on 20200312
    const theme = useTheme();
    const { options, defaultValue, value, onChange, addNullOption, addAllOption, ...rest } = props;

    //add by Demi on 20200312
    const [filterVal, setFilterVal] = useState();
    const [filtedList, setFiltedList] = useState([]);
    const [isSearchingVal, setIsSearchingVal] = useState(false);

    const selectStyles = {
        input: base => ({
            ...base,
            color: '#000',
            '& input': {
                font: 'inherit'
            }
        }),
        container: base => ({
            ...base,
            width: '100%'
        }),
        clearIndicator: base => ({
            ...base,
            cursor: 'pointer'
        }),
        dropdownIndicator: base => ({
            ...base,
            cursor: 'pointer',
            padding: 0
        }),
        indicatorSeparator: base => ({
            ...base,
            width: 0
        }),
        indicatorContainer: base => ({
            ...base,
            padding: 0,
            backgroundColor:'red'
        })
    };

    const multiValFilter = memoize((opts, vals) => {
        let filters = [];
        for (let i = 0; i < vals.length; i++) {
            filters.push(opts.find(item => item.value === vals[i]));
        }
        return filters;
    });

    const filterOptions = (candidate, input) => {
        if (input && candidate.label && typeof candidate.label === 'string') {
            //add by Demi on 20200312 start
            let filterCondition = candidate.label.indexOf(input) > -1;
            //search other fields
            if (props.moeFilter) {
                //mark search status
                setFilterVal(input);
                let fieldValue = _.cloneDeep(candidate.data[props.moeFilter.filterField]);
                if (fieldValue) {
                    if (typeof fieldValue !== 'string')
                        fieldValue = fieldValue.toString();
                    if (fieldValue == input && filtedList.indexOf(fieldValue) == -1)
                        filtedList.push(fieldValue);
                    filterCondition = filterCondition || fieldValue == input;
                }
            }
            return filterCondition;
            //add by Demi on 20200312 end
            // return candidate.label.indexOf(input) > -1;
        }
        //add by Demi on 20200312
        if (filterVal && props.moeFilter) {
            setFilterVal();
        }
        return true;
    };

    const handleOnChange = (e) => {
        if (!props.isMulti && !e) {
            onChange && onChange({ label: '', value: null });
        } else {
            if (props.moeFilter) {
                onChange && onChange(e, filtedList);
                // mark the value is from the search
                if (filterVal) {
                    setFilterVal(filterVal);
                    setIsSearchingVal(true);
                    return;
                }
                if (e.value != props.value) {
                    setFilterVal();
                    setFiltedList([]);
                    setIsSearchingVal(false);
                }
            } else
                onChange && onChange(e);
        }
    };

    let opt = options || [];
    let defaultVal = null, val = null;
    if (addNullOption && opt.findIndex(item => item.value === '') < 0) {
        opt.unshift({
            label: <>&nbsp;</>,
            value: ''
        });
    }
    if (addAllOption && opt.findIndex(item => item.value === '*All') < 0) {
        opt.unshift({
            label: '*All',
            value: '*All'
        });
    }
    if (props.isMulti) {
        defaultVal = defaultValue ? multiValFilter(opt, defaultValue) : null;
        val = value ? multiValFilter(opt, value) : defaultVal;
    } else {
        defaultVal = defaultValue ? opt.find(item => item.value === defaultValue) : null;
        val = value ? opt.find(item => item.value === value) : defaultVal;
    }
    return (
        <Select
            closeMenuOnSelect={props.isMulti?false:true}
            options={opt}
            value={val}
            defaultValue={defaultVal}
            classes={classes}
            components={props.isMulti?myComponents:singleComponents}
            placeholder={''}
            ref={ref}
            isValid
            onChange={handleOnChange}
            filterOption={filterOptions}
            filterVal={filterVal}//add by Demi on 20200312
            isSearchingVal={isSearchingVal}//add by Demi on 20200312
            filtedList={filtedList}//add by Demi on 20200316
            {...rest}
            styles={selectStyles}
        />
    );
});

JSelect.propTypes = {
    id: PropTypes.string.isRequired
};

export default JSelect;