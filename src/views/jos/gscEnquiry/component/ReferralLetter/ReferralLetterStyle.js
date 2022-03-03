
const styles = () => ({
    paper: {
        borderRadius: 10,
        maxWidth: '100%',
        minWidth: '45%',
        overflow: 'auto',
        maxHeight: 'calc(100vh - 80px)'
    },
    listWrap: {
      border: '1px solid #333'
    },
    listRow: {
        borderBottom: '1px solid #333',
        textAlign: 'center',
        '&:last-child':{
            borderBottom: 'none'
        }
    },
    listHead: {
        fontWeight: 600
    },
    rightBorder: {
        borderRight: '1px solid #333'
    },
    fontBold: {
        fontWeight: 'bold'
    },
    labelRightPad:{
        paddingRight: 10
    }
});

export default styles;