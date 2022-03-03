import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useUserInfo } from './UserInfoContext'

export default function useAuth() {
    let history = useHistory();
    const { setUser, setIsTimeout } = useUserInfo();

}