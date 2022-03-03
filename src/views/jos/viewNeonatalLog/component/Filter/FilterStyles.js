import { getState } from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};
export const styles = () => ({
    center: {
        display: 'flex',
        marginLeft: 25,
        alignItems: 'center'
    },
    selectMenu: {
        paddingLeft: 10
    },
    helperTextError: {
        marginTop: 0,
        fontSize: '14px !important',
        fontFamily: font.fontFamily,
        padding: '0 !important'
    },
    background: {
        backgroundColor: 'cornflowerblue'
    }
});