import { getState } from '../../../../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        alignItems: 'center'
    },
    label: {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        color: color.cimsTextColor,
        padding: '0 8px'
    },
    helperTextError: {
        fontSize: '12px !important',
        fontFamily: font.fontFamily,
        padding: '0 !important',
        margin: 0
    }
});