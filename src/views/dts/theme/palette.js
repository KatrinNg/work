import { colors } from '@material-ui/core';
import * as CommonUtil from '../../../utilities/commonUtilities';

const customColor = {
    white: '#ffffff',
    black: '#000000',
    backgroundColor:'#f9f9f9',
    primaryColor: '#0579c8',
    secondaryColor: '#e0417e',
    errorColor: '#fd0000',
    dialogBackground: '#5b9bd5',
    tableSelectedBackground: '#ffccaa',
    genderMaleColor: {
        color: 'rgba(209, 238, 252, 1)',
        transparent: 'rgba(209, 238, 252, 0.1)'
    },
    genderFeMaleColor: {
        color: 'rgba(254, 222, 237, 1)',
        transparent: 'rgba(254, 222, 237, 0.1)'
    },
    genderUnknownColor: {
        color: 'rgba(248, 209, 134, 1)',
        transparent: 'rgba(248, 209, 134, 0.1)'
    },
    deadPersonColor: {
        color: 'rgba(64, 64, 64, 1)',
        transparent: 'rgba(64, 64, 64, 1)',
        fontColor: 'white'
    }
};

const customStyles = {
    defaultTableHeader: {
        backgroundColor: 'rgb(123, 193, 217)',
        fontSize: '1rem',
        color: 'white',
        fontWeight: 600,
        padding: 8
    },
    customTableHeader: {
        fontSize: '1rem',
        padding: 8,
        color: '#404040',
        backgroundColor: '#b8bcb9',
        fontWeight: 600
    },
    customTableHeaderCell: {
        height: 35
    },
    customTableRow: {
        height: 65
    }
};

const sysRatio = CommonUtil.getSystemRatio();
const unit = CommonUtil.getResizeUnit(sysRatio) || 1;

export default {
    tonalOffset: 0,
    type: 'light',
    primary: {
        contrastText: customColor.white,
        dark: colors.indigo[900],
        main: customColor.primaryColor,
        light: colors.indigo[100]
    },
    secondary: {
        contrastText: customColor.white,
        dark: colors.blue[900],
        // main: colors.red[900],
        // main:'#f50057', material ui use this color as secondary main
        main: customColor.secondaryColor,
        light: colors.blue['A400']
    },
    success: {
        contrastText: customColor.white,
        dark: colors.green[900],
        main: colors.green[600],
        light: colors.green[400]
    },
    info: {
        contrastText: customColor.white,
        dark: colors.blue[900],
        main: colors.blue[600],
        light: colors.blue[400]
    },
    warning: {
        contrastText: customColor.white,
        dark: colors.orange[900],
        main: colors.orange[600],
        light: colors.orange[400]
    },
    error: {
        contrastText: customColor.white,
        dark: colors.red[900],
        main: customColor.errorColor,
        light: colors.red[400]
    },
    grey: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
        A100: '#d5d5d5',
        A200: '#aaaaaa',
        A400: '#303030',
        A700: '#616161',
        default: '#B8BCB9'
    },
    background: {
        default: '#f9f9f9',
        paper: '#ffffff'
    },
    action: {
        active: 'rgba(0,0,0,0.54)',
        hover: 'rgba(0, 0, 0, 0.08)',
        hoverOpacity: 0.08,
        selected: 'rgba(0, 0, 0, 0.14)',
        disabled: 'rgba(0, 0, 0, 0.26)',
        disabledBackground: '#e0e0e0'
    },
    text: {
        primary: '#404040',
        secondary: '#6e6e6e',
        // disabled: 'rgba(0, 0, 0, 0.38)',
        disabled: 'rgba(132, 132, 132)',
        hint: 'rgba(0, 0, 0, 0.38)'
    },
    textSize: '14px',
    shape: {
        borderRadius: 4
    },
    ...customColor,
    ...customStyles,
    unit
};
