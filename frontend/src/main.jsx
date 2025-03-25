import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import GlobalContext from './context/GlobalContext.jsx'
import { BrowserRouter as Router } from 'react-router-dom'


createRoot(document.getElementById('root')).render(

    <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,

    }}>
        <GlobalContext>

            <App />
        </GlobalContext>
    </Router>



)
