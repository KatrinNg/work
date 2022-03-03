import React from 'react';
const UserInfoContext = React.createContext(null);

function UserInfoProvider({children}) {
    const [user, setUser] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isTimeout, setIsTimeout] = React.useState(false);
    const value = { user, setUser, isLoading, setIsLoading, isTimeout, setIsTimeout }

    return <UserInfoContext.Provider value={value}>{children}</UserInfoContext.Provider>
}

function useUserInfo() {
    const context = React.useContext(UserInfoContext);

    if (context === undefined) {
        throw new Error('useUserInfo must be used within a UserInfoProvider');
    }

    return context;
}

export { UserInfoProvider, useUserInfo }