import * as CimsStyleType from '../../actions/cimsStyle';

const initState = {
    color: {
        cimsBackgroundColor: 'rgb(250, 250, 250)',
        cimsTextColor: 'rgb(0, 0, 0)',
        cimsPlaceholderColor: 'rgb(180, 180, 180)',
        cimsLabelColor: 'rgb(132, 132, 132)',
        cimsDisableColor: '#e0e0e0',
        cimsDisableIconColor: 'rgba(0, 0, 0, 0.26)'
    },
    font: {
        fontSize: '1rem',
        fontFamily: 'Arial, MingLiU, Helvertica, Sans-serif',
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
        h1: {
            fontSize: '4rem',
            fontWeight: 300,
            lineHeight: 1.2,
            letterSpacing: '-0.00833em'
        },
        h2: {
            fontWeight: 300,
            fontSize: '3rem',
            lineHeight: 1.2,
            letterSpacing: '-0.00833em'
        },
        h3: {
            fontWeight: 400,
            fontSize: '2rem',
            lineHeight: 1.167,
            letterSpacing: '0em'
        },
        h4: {
            fontWeight: 400,
            fontSize: '1.5rem',
            lineHeight: 1.235,
            letterSpacing: '0.00735em'
        },
        h5: {
            fontWeight: 400,
            fontSize: '1.25rem',
            lineHeight: 1.334,
            letterSpacing: '0em'
        },
        h6: {
            fontWeight: 500,
            fontSize: '1.15rem',
            lineHeight: 1.6,
            letterSpacing: '0.0075em'
        },
        subtitle1: {
            fontWeight: 400,
            fontSize: '1rem',
            lineHeight: 1.75,
            letterSpacing: '0.00938em'
        },
        subtitle2: {
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.57,
            letterSpacing: '0.00714em'
        },
        body1: {
            fontWeight: 400,
            fontSize: '1rem',
            lineHeight: 1.5,
            letterSpacing: '0.00938em'
        },
        body2: {
            fontWeight: 400,
            fontSize: '0.875rem',
            lineHeight: 1.43,
            letterSpacing: '0.01071em'
        },
        button: {
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.75,
            letterSpacing: '0.02857em'
        },
        caption: {
            fontWeight: 400,
            fontSize: '0.75rem',
            lineHeight: 1.66,
            letterSpacing: '0.03333em'
        },
        overline: {
            fontWeight: 400,
            fontSize: '0.75rem',
            lineHeight: 2.66,
            letterSpacing: '0.08333em'
        }
    },
    theme: null
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case CimsStyleType.BATCH_UPDATE_STATE: {
            return {
                ...state,
                ...action.updateData
            };
        }
        default: {
            return state;
        }
    }
};