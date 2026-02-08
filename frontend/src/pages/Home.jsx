
import useIsMobile from '../hooks/useIsMobile';
import DesktopHome from './DesktopHome';
import MobileHome from './MobileHome';

const Home = () => {


    const isMobile = useIsMobile();

    return (
       isMobile ? <MobileHome/> : <DesktopHome/>
    )
}

export default Home;