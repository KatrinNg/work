import { getState } from '../store/util';
const font = getState(state => state.cimsStyle.font) || {};

export default {
    htmlFontSize: 16,
    fontSize: font.fontSize || 14,
    fontWeightLight: font.fontWeightLight || 300,
    fontWeightRegular: font.fontWeightRegular || 400,
    fontWeightMedium: font.fontWeightMedium || 500,
    fontWeightBold: font.fontWeightBold || 700,
    fontFamily: font.fontFamily,
    useNextVariants: true,
    h1: {
        ...font.h1
    },
    h2: {
        ...font.h2
    },
    h3: {
        ...font.h3
    },
    h4: {
        ...font.h4
    },
    h5: {
        ...font.h5
    },
    h6: {
        ...font.h6
    },
    subtitle1: {
        ...font.subtitle1
    },
    subtitle2: {
        ...font.subtitle2
    },
    body1: {
        ...font.body1
    },
    body2: {
        ...font.body2
    },
    button: {
        ...font.button
    },
    caption: {
        ...font.caption
    },
    overline: {
        ...font.overline
    }
};