import * as commonUtilities from '../../../utilities/commonUtilities';
import palette from '../../palette';

const sysRatio = commonUtilities.getSystemRatio();
const unit = commonUtilities.getResizeUnit(sysRatio);

export default {
    containedPrimary: {
        color: palette.primary.main,
        backgroundColor: palette.white,
        border: 'solid 1px #0579C8',
        boxShadow: '2px 2px 2px #6e6e6e',
        '&:hover': {
            color: palette.white,
            backgroundColor: palette.primary.main
        },
        '&$focusVisible': {
            color: palette.white,
            backgroundColor: palette.primary.main
        }
    },
    containedSecondary: {
        color: palette.white,
        backgroundColor: palette.secondary.main,
        // border: 'solid 1px #0579C8',
        boxShadow: '2px 2px 2px #6e6e6e',
        '&:hover': {
            color: palette.white,
            backgroundColor: '#c51162'
        },
        '&$focusVisible': {
            color: palette.white,
            backgroundColor: '#c51162'
        }
    },
    focusVisible: {},
    root: {
        borderRadius: 6 * unit,
        // fontSize: '1rem',
        height: 43.5 * unit,
        lineHeight: unit,
        minWidth: 96 * unit
    },
    sizeSmall: {
        fontSize: '1rem'
    }
};