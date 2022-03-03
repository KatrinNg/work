export const styles = () => ({
    success: {
        backgroundColor: '#43a047'
    },
    error: {
        backgroundColor: '#d32f2f'
    },
    info: {
        backgroundColor: '#1976d2'
    },
    warning: {
        backgroundColor: '#ffa000'
    },
    content: {
        minWidth: 50,
        color: '#000000',
        '& .message_icon':{
            verticalAlign: 'middle',
            marginRight: 5
        }
    },
    icon: {
        verticalAlign: 'middle',
        marginRight: 5
    },
    actionClose: {
        color: 'gray'
    },
    snackbarBackground: {
        backgroundColor: '#ffff99'
    },
    surgeryContent: {
        fontWeight: 'bold',
        color: '#000000',
        backgroundColor: '#e6e6e6',
        borderRadius: '20px',
        margin: '5px',
        padding: '5px 15px 5px 15px'
        //filter: 'drop-shadow(1px 2px 2px gray)'
    },
    urgentCountContent: {
        color: '#ff0000',
        fontWeight: 'bolder',
        paddingLeft: '5px',
        paddingRight: '10px'
    },
    normalCountContent: {
        color: '#000000',
        fontWeight: 'bolder',
        paddingRight: '10px'
    },
    snackBar: {
        maxWidth: '500px'
    },
    attendanceAlertSettingsContent: {
        width: '258px'
    },
    attendanceAlertSettingsFrame: {
        position: 'absolute',
        top: '100px',
        right: '0'
    }
});
