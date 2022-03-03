import { makeStyles } from '@material-ui/styles';

export default makeStyles({
    '@global': {
        '.nephele_content_body': {
            flexBasis: '100%'
        },
        '.lengthwaysFont': {
            'writing-mode': 'tb-rl',
            '-webkit-writing-mode': 'vertical-rl',
            '-ms-writing-mode': 'vertical-rl',
            transform: 'rotate(180deg)',
            '-ms-transform': 'rotate(180deg)',
            '-moz-transform': 'rotate(180deg)',
            '-webkit-transform': 'rotate(180deg)',
            '-o-transform': 'rotate(180deg)'
        },
        '.listItem': {
            display: 'block'
        },
        '.listItem:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)'
        },
        '.listItem:active': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }
    }
});