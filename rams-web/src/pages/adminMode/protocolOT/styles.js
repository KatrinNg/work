import { makeStyles } from '@material-ui/styles';

export default makeStyles((theme) => ({
    containerDiv: {
        background: '#e0e6f1',
        minHeight: '100%',
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
    },
    headerDiv: {
        background: '#ecf0f7',
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
    },
    title: {
        background: '#d1f2ea',
        margin: '10px 9px 11px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        border: 'solid 1px #39ad90',
        backgroundColor: '#d1f2ea',
    },
    addBtn: {
        width: '91px',
        height: '31px',
        borderRadius: '5px',
        border: 'solid 1px #00b08f',
        padding: '6px 25px 7px 25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        width: '100%',
        padding: '9px 25px 32px',
    },
    contentTitle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    listDiv: {
        marginTop: '8px',
    },
    listItem: {
        width: '100%',
        height: '40px',
        background: '#ffffff',
        borderRadius: '6px',
        marginBottom: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '17px',
        paddingRight: '9px',
        cursor: 'pointer',
    },
    listItemInactive: {
        background: '#d8d8d8',
        cursor: 'pointer',
    },
    detailContent: {
        paddingTop: '16px',
        paddingRight: '31px',
        paddingLeft: '30px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100vh - 90px)',
    },
    font: {
        color: '#7b0400',
        fontSize: '14px',
        fontWeight: 600,
    },
    input: {
        '& .MuiFormControl-root': {
            height: '100%',
        },
        '& .MuiInputBase-root': {
            height: '100%',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#bbbbbb',
            height: '40px',
            borderRadius: '5px',
        },
        '& .MuiOutlinedInput-inputMarginDense': {
            paddingBottom: '15px',
        },
        marginTop: '5px',
    },
    switch: {
        '& .MuiSwitch-track': {
            height: '130%',
            background: '#bdbdbd',
            borderRadius: '10px',
            width: '40px',
        },
        '& .MuiSwitch-thumb': {
            marginTop: '2px',
        },
        '& .MuiSwitch-colorSecondary.Mui-checked': {
            color: '#ffffff',
        },
        '& .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track ': {
            background: '#39b194',
        },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            opacity: 1,
        },
    },
    detailListItem: {
        width: '100%',
        background: '#ffffff',
        height: '40px',
        borderRadius: '6px',
        marginBottom: '5px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        cursor: 'pointer',
    },
    treatmentContent: {
        paddingLeft: '32px',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '20px',
        flexDirection: 'column',
        paddingRight: '30px',
    },
    treatmentSelectContainer: {
        '& .MuiInputBase-root': {
            background: '#f5f5f5',
            borderRadius: '8px',
        },
        '& .MuiOutlinedInput-adornedEnd': {
            paddingRight: '2px',
        },
        '& .MuiSvgIcon-root': {
            transform: 'scale(1.2,2)',
            marginRight: '5px',
        },
        marginRight: '20px',
        marginTop: '6px',
    },
    protocolSelectContainer: {
        '& .MuiSelect-select.MuiSelect-select ': {
            background: '#f5f5f5',
            borderRadius: '4px',
            borderColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            height: '30px',
            fontSize: '14px',
        },
        '& .MuiSvgIcon-root': {
            transform: 'scale(1.2,2)',
        },
        marginLeft: '8px',
        marginRight: '25px',
    },
    treatmentDetailTextfield: {
        '& .MuiInputBase-input.Mui-disabled': {
            background: '#d4d4d4',
            borderColor: 'transparent',
            borderRadius: '8px',
        },
        marginTop: '6px',
        background: '#f5f5f5',
        borderRadius: '8px',
    },
    treatmentDetailInputNum: {
        width: '151px',
        background: '#f5f5f5',
        borderRadius: '8px',
        height: '40px',
        marginTop: '6px',
    },
    secTitle: {
        fontFamily: 'PingFangTC',
        fontSize: '18px',
        fontWeight: 600,
        fontStretch: 'normal',
        fontStyle: 'normal',
        lineHeight: 'normal',
        marginTop: 25,
    },
    switchesBox: {
        margin: '10px 0',
        '& .MuiGrid-item': {
            borderRadius: '10px',
        },
    },
    switchesItemsBox: {
        minWidth: 690,
        marginRight: 16,
        backgroundColor: '#f2f2f2',
    },
    switchesBackground: {
        backgroundColor: '#f2f2f2',
        // padding: '0 0 0 20px',
        height: 80,
        padding: '9px 0 10px 30px',
        '& .MuiGrid-item': {
            borderRadius: '0',
        },
    },
    yellowBorderColor: {
        borderRight: '2px solid #f6dac5',
    },
    labelName: {
        fontFamily: 'PingFangTC',
        fontSize: 16,
        fontWeight: 'normal',
        fontStretch: 'normal',
        fontStyle: 'normal',
        color: '#1b1b1b',
    },
    checkboxLabel: {
        fontSize: 18,
        fontWeight: 600,
        fontFamily: 'PingFangTC',
        fontStretch: 'normal',
        fontStyle: 'normal',
        color: '#000',
        marginBottom: '-5px',
    },
    buttonDiv: {
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
        paddingBottom: '20px',
        marginTop: '20px',
        marginBottom: '30px',
    },
    buttonDisabled: {
        '&.Mui-disabled': {
            color: '#fff',
            borderRadius: '10px',
            backgroundColor: '#999',
        },
    },
}));
