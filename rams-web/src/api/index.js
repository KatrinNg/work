import axios from 'axios';
import { getItem, KEYS, setItem } from 'storage';
import { getStore } from 'redux/store';
import { setGlobal, setErrorText } from 'redux/global/reducer';
// import { LOGOUT_USER } from 'redux/actionTypes';
// import * as ActionTypes from 'redux/actionTypes';
import { systemMessage } from 'constants/MessageList';

const errorEndpointWhitelist = ['/user/account-activation', '/file/upload-document', '/auth/refresh'];

class BaseAPI {
    constructor() {
        this.refreshingToken = null;
        this.defaultRequestConfig = {
            baseURL: process.env.REACT_APP_API_DOMAIN,
            timeout: 50000,
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }

    handleResponse = (data) => {
        const store = getStore();
        const errorMsg = data?.data?.statusCode == 400 ? data?.data?.message : '';
        store.dispatch(
            setErrorText({
                errorText: errorMsg,
            }),
        );
        return data
    }

    handleTokenRefresh = () => {
        const refreshToken = getItem(KEYS.REFRESH_TOKEN, 'refresh token is not exist in frontend');

        return axios.create(this.defaultRequestConfig)({
            method: 'POST',
            url: '/auth/refresh',
            data: {
                refreshToken,
            },
        });
    };

    handleAPIError = async (error) => {
        const { response, isAxiosError } = error;
        const store = getStore();

        if (isAxiosError) {
            store.dispatch(
                setErrorText({
                    errorText: 'Internal Server Error'
                }),
            );
        }



        if (response?.status === 400) {
            const message = response?.data?.message;

            const isWhiteListEndpoint = errorEndpointWhitelist.includes(response.config.url);

            if (isWhiteListEndpoint) {
                throw error;
            }

            store.dispatch(
                setErrorText({
                    errorText: 'Error from server'
                }),
            );
        }

        throw error;
    };

    handleTokenExpired = async (error) => {
        const { response } = error;

        if (response?.status === 401) {
            try {
                this.refreshingToken = this.refreshingToken || this.handleTokenRefresh();
                let refreshTokenResult;

                try {
                    refreshTokenResult = await this.refreshingToken;
                } catch (refreshTokenError) {
                    if (refreshTokenError?.response?.status === 400) {
                        const store = getStore();

                        
                        let errorMessage = refreshTokenError?.response?.data?.errorMessage?.startsWith('JWT expired')
                            ? systemMessage.LOGIN_SESSION_EXPIRED
                            : systemMessage.REFRESH_TOKEN_ERROR;

                        store.dispatch(
                            setErrorText({
                                errorText: 'Session expired'
                            }),
                        );
                    }
                    throw refreshTokenError;
                }

                this.refreshingToken = null; //makes refreshAccessToken can run again
                const { token: newAccessToken, refreshToken: newRefreshToken } = refreshTokenResult.data.result;
                setItem(KEYS.ACCESS_TOKEN, newAccessToken);
                setItem(KEYS.REFRESH_TOKEN, newRefreshToken);
                const result = await this.authAPI(error.config, newAccessToken);
                return result;
            } catch (outerError) {
                console.log('105448 index.js error', outerError);
                this.refreshingToken = null; //makes refreshAccessToken can run again
                throw outerError;
            }
        }

        throw error;
    };

    basicAPI = (requestConfig) => {
        return axios.create(this.defaultRequestConfig)(requestConfig).catch(this.handleAPIError);
    };

    // default getting access token from store
    authAPI = (requestConfig, accessToken = getItem(KEYS.ACCESS_TOKEN)) => {
        if (!requestConfig.headers) {
            requestConfig.headers = { Authorization: `Bearer ${accessToken}` };
        } else {
            requestConfig.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        return axios
            .create({ ...this.defaultRequestConfig })(requestConfig)
            .then(this.handleResponse)
            .catch(this.handleTokenExpired)
            .catch(this.handleAPIError);
    };
}

export default new BaseAPI();
