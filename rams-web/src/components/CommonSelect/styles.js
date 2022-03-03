import { makeStyles } from '@material-ui/styles';
import { relativeTimeRounding } from 'moment';

export default makeStyles((theme) => ({
    selectContent: (props) => ({
        position: 'relative',
        display: 'flex',
        width: `${props.width}`,
        
    }),
    selectInput: (props) => ({
        border: `solid 1px ${props.errSelect?'#bbb':'red'}`,
        borderRadius: 8,
        height:'38px',
        lineHeight: '38px',
        padding: '0px 16px !important',
        backgroundColor: '#fff',
        '&:focus':{
            borderRadius: 8,
            backgroundColor: '#fff'
        },
        '&:hover':{
            border: 'solid 1px #bbb',
            backgroundColor: '#fff'
        }
    }),
    errorMessage: {
        marginTop: -2,
        paddingLeft: '5px',
        color: 'red !important'
    },
    hidden: {
        display: 'none'
    }
}));
