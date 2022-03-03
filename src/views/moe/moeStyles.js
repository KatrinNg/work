const styles = theme => ({
    radioLabel: {
        margin: 0
    },
    radioBtn: {
        height: 18,
        paddingTop: 0,
        paddingBottom: 5,
        '&$radioBtnChecked': {
            height: 18,
            paddingTop: 0,
            paddingBottom: 5
        }
    },
    radioBtnChecked: {},
    fullWidth: {
        maxWidth: '100%',
        overflowY: 'unset',
        width: '100%'
    },
    rightBtn: {
        position: 'absolute',
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItem: 'center'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16
    },
    //context menu
    contextMenuItem: {
        padding: '5px 5px 5px 10px',
        minHeight: 20
    },
    //order date style
    orderDateFont: {
        width: 102,
        textAlign: 'right'
    },
    orderDateValue: {
        width: 102,
        textAlign: 'right'
    },
    tooltipPlacementBottom: {
        transformOrigin: 'center top',
        margin: '12px 0',
        [theme.breakpoints.up('sm')]: {
            margin: '2px 0'
        }
    }
    // textFieldStyle: {
    //     root: {
    //         '&$textFieldFocused': {
    //             borderColor: '#0579c8',
    //             borderWdth: '2px'
    //         }
    //     }
    // },
    // textFieldFocused:{}
});

export const specialStyles = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        width: '800px',
        height: '297px'
    },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column'
    },
    onSelect: {
        borderRight: '1px solid #0579c8',
        borderRadius: 0,
        backgroundColor: '#b8bcb9',
        textTransform: 'capitalize',
        height: `calc(${297 / 4}px)`
    },
    tabBtn: {
        textTransform: 'capitalize',
        height: `calc(${297 / 4}px)`
    },
    radioBtn: {
        height: 26,
        paddingTop: 0,
        paddingBottom: 0,
        width: '100%',
        marginBottom: '8px',
        '&$radioBtnChecked': {
            height: 26,
            paddingTop: 0,
            paddingBottom: 0
        }
    },
    radioBtnChecked: {},
    inputArea: {
        height: '100%',
        padding: '20px',
        paddingBottom: '10px'
    },
    errorFont: {
        color: 'red'
    },
    correctFont: {
        color: '#404040'
    }
});

export const prescriptionPanelStyles = theme => ({
    maleRoot: {
        backgroundColor: '#d1eefc',
        color: theme.palette.text.primary
    },
    femaleRoot: {
        backgroundColor: '#fedeed',
        color: theme.palette.text.primary
    },
    unknownSexRoot: {
        backgroundColor: '#f8d186',
        color: theme.palette.text.primary
    },
    deadRoot: {
        backgroundColor: '#404040',
        color: '#fff'
    },
    maleFormRoot: {
        width: '100%',
        backgroundColor: '#eff6f9'
    },
    femaleFormRoot: {
        width: '100%',
        backgroundColor: '#f9f3f6'
    },
    unknownSexFormRoot: {
        width: '100%',
        backgroundColor: '#fff4de'
    },
    deadFormRoot: {
        width: '100%',
        backgroundColor: '#FFFFFF'
    },
    radioBtn: {
        height: 26,
        paddingTop: 0,
        paddingBottom: 0,
        '&$radioBtnChecked': {
            height: 26,
            paddingTop: 0,
            paddingBottom: 0
        }
    },
    radioBtnChecked: {},
    titleContainer: {
        width: '90px',
        paddingTop: '4px',
        paddingBottom: '4px',
        paddingRight: '4px',
        paddingLeft: '8px'
    },
    inGridTitleLabel: {
        fontWeight: 'bold',
        lineHeight: '24px'
    },
    titleLabel: {
        fontWeight: 'bold',
        lineHeight: '30px'
    },
    colorClasses: {
        backgroundColor: '#b8bcb9'
    },
    btn: {
        height: '26px',
        fontSize: '12px'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        width: '100%'
    },
    prescriptionTitle: {
        fontWeight: '400',
        fontSize: 16,
        width: '100%'
    },
    highlightBtn: {
        backgroundColor: '#0579c8',
        border: '1px solid #ffffff',
        color: '#ffffff',
        cursor: 'not-allowed',
        pointerEvents: 'none'
    },
    withAnIcon: {
        width: '97%',
        height: '100%',
        display: 'inline-block'
    },
    withIcons: {
        width: '94%',
        height: '100%',
        display: 'inline-block'
    },
    withoutIcons: {
        width: '100%',
        height: '100%',
        display: 'inline-block'
    },
    toolTip: {
        maxWidth: '450px'
    }
});

export const drugDetailStyles = theme => ({
    fullWidth: {
        maxWidth: '100%',
        overflowY: 'unset',
        width: '100%'
    },
    ...prescriptionPanelStyles(theme)
});

const moeStyles = styles;
export default moeStyles;