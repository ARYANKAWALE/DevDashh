import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import Dashboard from './Components/Menu/Dashboard.jsx'
import Terminal from './Components/Menu/Terminal.jsx'
import Challenges from './Components/Menu/Challenges.jsx'
import Analytics from './Components/Menu/Analytics.jsx'
import NotFound from './NotFound.jsx'

const router = createBrowserRouter([
  {
    path:'/',
    element:<Layout/>,
    children:[
      {
        path:'',
        element:<Dashboard/>
      },
      {
        path:'terminal',
        element:<Terminal/>
      },
      {
        path:'challenges',
        element:<Challenges/>
      },
      {
        path:'analytics',
        element:<Analytics/>
      },
      {
        path:'*',
        element:<NotFound/>
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
