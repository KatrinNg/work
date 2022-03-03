import API from './index';

const api = {
    getCalendarList(data) {
//         console.log(data)
        return API.authAPI({
            url: '/getTherapeuticGroupCalendarList',
            method: 'POST',
            data,
        });
    },
    getCategoryAndNameList(data) {
        // console.log(data)
        return API.authAPI({
            url: '/getTherapeuticGroupCategoryAndGroupName',
            method: 'POST',
            data,
        });
    },
    // getNameList(data) {
    //     // console.log(data)
    //     return API.authAPI({
    //         url: '',
    //         method: 'POST',
    //         data,
    //     });
    // },
    setCalendarList(data) {
        console.log(data)
        return API.authAPI({
            url: '/saveTherapeuticGroupCalendar',
            method: 'POST',
            data,
        });
    }
};

export default api;