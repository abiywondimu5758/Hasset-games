import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RegisterForm from "./components/Register";
import LoginForm from "./components/Login";
import ForgotPassword from "./components/ForgotPassword.jsx";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import BingoLobby from "./components/BingoLobby";
import WaitingRoom from "./components/WaitingRoom";
import Game from "./components/game.jsx";
import Leaderboard from "./components/Leaderboard";
import { observer } from "mobx-react-lite";
import ProtectedRoute from "./components/ProtectedRoute.jsx"; 
import { History } from "./components/History.jsx";
import Refferals  from "./components/Referral.jsx"
import './index.css';
import { ConfigProvider } from "antd";
import HowToPlay from "./components/HowToPlay.jsx";
import Wallet from "./components/Wallet.jsx";
import ChangeForgotPassword from "./components/ChangeForgotPassword.jsx";
// import LandingPage from "./components/LandingPage.jsx";

const App = observer(() => (
  <ConfigProvider
  theme={{
    token: {
      colorPrimary: "#00b96b",
      borderRadius: 10,
    },
  }}
>
  <Router>
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/changeforgotpassword" element={<ChangeForgotPassword />} />
      
      

      {/* All other routes are protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bingo"
        element={
          <ProtectedRoute>
            <BingoLobby />
          </ProtectedRoute>
        }
      />
      <Route
        path="/waitingroom"
        element={
          <ProtectedRoute>
            <WaitingRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <Game />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />

<Route
        path="/how-to-play"
        element={
          <ProtectedRoute>
            <HowToPlay />
          </ProtectedRoute>
        }
      />

            <Route
        path="/referrals"
        element={
          <ProtectedRoute>
            <Refferals />
          </ProtectedRoute>
        }
      />
                  <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        }
      />
      
      
      <Route path="/how-to-play" element={<ProtectedRoute><howtoplay/></ProtectedRoute>}/>
    </Routes>
  </Router>
  </ConfigProvider>
));

export default App;
