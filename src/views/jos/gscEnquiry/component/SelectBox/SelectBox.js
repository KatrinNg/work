import React, { Component } from 'react';
import { Select, MenuItem, withStyles } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { getState } from '../../../../../store/util';
import _ from 'lodash';
const { color, font } = getState(state => state.cimsStyle) || {};

const customTheme = (theme) => {
    return createMuiTheme({
        ...theme,
        overrides: {
            MuiMenu: {
                paper: {
                    backgroundColor: color.cimsBackgroundColor
                }
            },
            MuiInputBase: {
                input: {
                    '&.Mui-disabled': {
                        color: color.cimsTextColor,
                        backgroundColor: color.cimsDisableColor
                    }
                }
            }
        }
    });
};

const styles = () => ({
    selectMenu: {
        paddingRight: 0,
        fontWeight: 'normal',
        color: color.cimsTextColor,
        fontSize: font.fontSize,
        fontFamily: font.fontFamily
    },
    menuItem: {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        backgroundColor: color.cimsBackgroundColor,
        color: color.cimsTextColor
    }
});

class SelectBox extends Component {
    constructor(props) {
        super(props);
        const { value, options = [], children = [], name } = props;
        if (name == 'diagnosis') {
            this.state = {
                value: value || (options.length ? options[1].value : (children.length ? children[1].props.value : '')),
                options: this.props.options
            };
        }else if (name == 'result') {
            this.state = {
                value: value || (options.length ? options[1].value : (children.length ? children[1].props.value : '')),
                options: this.props.options
            };
        }else if (name == 'screening') {
            this.state = {
                value: value || (options.length ? options[2].value : (children.length ? children[2].props.value : '')),
                options: this.props.options
            };
        }else this.state = {
            value: value || (options.length ? options[0].value : (children.length ? children[0].props.value : '')),
            options: this.props.options
        };
    }
    // Test demo
    // componentDidMount() {
    //     const { onChange, value, onChangeFlag } = this.props;
    //     !onChangeFlag && onChange && value && onChange(value);
    // }

    UNSAFE_componentWillReceiveProps(nextProp) {
        if (
            _.differenceBy(nextProp.options, this.state.options, 'title').length > 0 ||
            _.differenceBy(this.state.options, nextProp.options, 'title').length > 0
        ) {
            const { value, options = [], children = [] } = nextProp;
            if (value !== undefined && value !== '') {
                this.setState({ value });
            }
            else if (options.length || children.length) {
                this.setState({ value: options.length ? options[0].value : children[0].value });
            }

            this.setState({ options: options });
        }
    }
    handleChange = (e) => {
        const { onChange, oldData } = this.props;
        this.setState({ value: e.target.value });
        oldData ? onChange && onChange(e.target.value, oldData) : onChange && onChange(e.target.value, e);
    }
    render() {
        const { children, classes, height, width, ...rest } = this.props;
        const { options = [], value } = this.state;
        return (
            <MuiThemeProvider theme={customTheme}>
                <Select {...rest}
                    style={{ height: height ? height : 'unset', width: width ? width : 'unset' }}
                    classes={{ selectMenu: classes.selectMenu }}
                    onChange={this.handleChange}
                    value={value}
                >
                    {options.length ? options.map(item => {
                        return (<MenuItem className={classes.menuItem} key={item.value} value={item.value}>{item.title}</MenuItem>);
                    }) : children}
                </Select>
            </MuiThemeProvider>
        );
    }
}

export default withStyles(styles)(SelectBox);

