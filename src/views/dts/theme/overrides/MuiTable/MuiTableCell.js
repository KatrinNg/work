import palette from '../../palette';

export default {
    // head: palette.customTableHeader,
    head: palette.defaultTableHeader,
    root: {
        margin: 0,
        padding: 8,
        borderWidth: 1,
        borderStyle: 'solid',
        // borderColor: palette.grey.A100,
        borderColor: palette.grey.default,
        fontSize: 14,
        color: palette.text.primary,
        lineHeight: 1,
        '&:last-child': {
            padding: '0 0 0 0px',
            paddingRight: 0
        },
        borderBottom: `1px solid ${palette.grey.default}`
    },
    body: {
        padding: 8,
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        overflow: 'hidden'
    },
    stickyHeader: {
        backgroundColor: 'rgb(123, 193, 217)'
    }
};