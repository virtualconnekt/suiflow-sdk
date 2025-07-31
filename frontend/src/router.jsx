import { createBrowserRouter } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import SuiFlowDashboard from './components/SuiFlowDashboard.jsx';
import SuiFlowCheckout from './components/SuiFlowCheckout.jsx';
import SuiFlowSuccess from './components/SuiFlowSuccess.jsx';
import SuiFlowLogin from './components/SuiFlowLogin.jsx';
import WidgetPay from './components/WidgetPay.jsx';
import FlowXDemo from './pages/FlowXDemo.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <SuiFlowLogin />,
  },
  {
    path: '/dashboard',
    element: <SuiFlowDashboard />,
  },
  {
    path: '/admin/dashboard',
    element: <SuiFlowDashboard />,
  },
  {
    path: '/checkout/:productId',
    element: <SuiFlowCheckout />,
  },
  {
    path: '/pay/:productId',
    element: <SuiFlowCheckout />,
  },
  {
    path: '/success',
    element: <SuiFlowSuccess />,
  },
  {
    path: '/legacy-checkout/:productId',
    element: <SuiFlowCheckout />,
  },
  {
    path: '/legacy-dashboard',
    element: <SuiFlowDashboard />,
  },
  {
    path: '/widget/pay',
    element: <SuiFlowCheckout />,
  },
  {
    path: '/flowx',
    element: <FlowXDemo />,
  },
]);

export default router;
