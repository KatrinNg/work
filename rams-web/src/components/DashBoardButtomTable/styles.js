import {
    makeStyles
} from "@material-ui/styles"

export default makeStyles(theme => ({
    leftTable: {
        width: 'calc(100% - 26px)',
        display: 'flex',
        height: 80,
        marginTop: '10px'
        
    },
    tableColumn: {
        width: '10%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontSize: 22,
        '& span': {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50%',
            border: 'solid 1px #979797',
            '&:first-child': {
                fontSize: 14,
                backgroundColor: '#ffed44',
                fontWeight: 600,
                textAlign: 'center'
            }
        }
    },
}))
