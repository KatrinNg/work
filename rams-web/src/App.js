import useInitialize from 'hooks/useInitialize';
import MainRouter from './MainRouter';

function App() {
    const isInit = useInitialize();
    //const test = '';
    if (!isInit) {
        return <div>loading</div>;
    }

    return <MainRouter />;
    // return <LoginPage />;
}

export default App;
