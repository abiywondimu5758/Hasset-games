
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './components/Settings';
import UserList from './components/Users/UserList';
import BingoGamesList from './components/Bingo/BingoGamesList'
import UserBingoCardList from './components/UserBingoCards/UserBingoCardsList';
import ReferralList from './components/Ref/RefList';
import StakeList from './components/Stakes/StakeList';
import BingoCardList from './components/BingoCard/BingoCardList';
import BonusPeriodList from './components/Bonus/BonusPeriodList';
import WinnersList from './components/Jackpot/WinnersList';
import TransactionList from './components/Transactions/TransactionList';
import WithdrawalRequestList from './components/Withdrawal/WithdrawalRequestList';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<TransactionList />} />
          <Route path="users" element={<UserList />} />
          <Route path="bingo-games" element={<BingoGamesList />} />
          <Route path='stakes'element={<StakeList/>}/>
          <Route path="user-bingo-cards" element={<UserBingoCardList />} />
          <Route path="bingo-cards" element={<BingoCardList />} />
          <Route path="referrals" element={<ReferralList/>} />
          <Route path="settings" element={<Settings />} />
          <Route path="bonus" element={<BonusPeriodList/>} />
          <Route path="jackpot" element={<WinnersList/>} />
          <Route path="withdrawals" element={<WithdrawalRequestList/>} />
          </Route >
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
