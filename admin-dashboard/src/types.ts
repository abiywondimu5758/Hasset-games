import { QueryObserverResult } from "@tanstack/react-query";

// Auth-related types
export interface RegisterData {
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
  role: "ADMIN" | "STAFF";
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Zustand Auth State types
export interface AuthState {
  isAuthenticated: boolean;
  user: null | { username: string; role: string };
  loginUser: (username: string, password: string) => Promise<void>;
  registerUser: (data: RegisterData) => Promise<void>;
  logoutUser: () => void;
}

export interface User {
  id: number;
  username: string;
  phoneNumber: string;
  wallet: string;
  referralCode: string;
  referralBonus: string;
  referredBy: string | null;
  referredCount: number;
  registrationDate: string;
  verified: boolean;
  role: string;
  otp: number;
  _count: {
    referredUsers: number;
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    userBingoCards: number;
    statistics: number;
  };
}

//   USER DETAILS
interface BingoCardUser {
  userId: number;
  gameId: number;
  cardId: number;
  createdAt: string;
  markedNumbers: string;
  autoPlay: boolean;
}

interface Stats {
  gamesWon: number;
  amountWon: number;
  gamesLost: number;
  gamesPlayed: number;
}

interface Statistics {
  id: number;
  userId: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  amountWon: number;
  dailyStats: Stats;
  weeklyStats: Stats;
  monthlyStats: Stats;
  yearlyStats: Stats;
  updatedAt: string;
}

export interface UserDetailsProps {
  userId: number;
  userDetails: {
    [x: string]: any;
    id: number;
    username: string;
    phoneNumber: string;
    wallet: number;
    referralCode: string;
    referralBonus: string;
    referredCount: number;
    registrationDate: string;
    verified: boolean;
    totaldeposit:string;
    statistics: Statistics;
    role: string;
    otp: number;
    // Expect userBingoCards as an array now:
    userBingoCards: BingoCardUser[];
    // And pageInfo is provided separately:
    pageInfo: PageInfo;
    _count: {
      referredUsers: number;
      gamesPlayed: number;
      gamesWon: number;
      gamesLost: number;
      userBingoCards: number;
      statistics: number;
    };
  } | null;
  isLoading: boolean;
  onClose: () => void; // Callback to close the details view
  refetch: () => Promise<
    QueryObserverResult<
      {
        users: User;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pageInfo: any;
      },
      Error
    >
  >;
  // New props for pagination of userBingoCards
  cardPage: number;
  setCardPage: (page: number) => void;
  cardLimit: number;
}

export interface UserUpdate {
  username: string;
  phoneNumber: string;
  wallet: number | null;
  role: string;
  referralBonus: number;
}

export interface BingoGame {
  id: number;
  createdAt: string; // ISO date string
  stake: Stake; // Updated to include stake ID
  active: boolean;
  countdownStart: string; // ISO date string
  countdownEnd: string; // ISO date string
  possibleWin: string;
  hasEnded: boolean;
  players: Player[];
  declaredWinners: number[]; // ID of the winning player
  assignedCardIds: number[]; // Array of assigned card IDs
  drawnNumbers: number[]; // Array of drawn numbers
}

interface Player {
  userId: number; // Added user ID
  gameId: number; // Added game ID
  cardId: number; // Added card ID
  createdAt: string; // ISO date string
  markedNumbers: string; // Comma-separated marked numbers
  autoPlay: boolean; // Indicates if autoplay is enabled
}

export interface BingoGameDetailsProps {
  gameId: number; //
  bingoGameDetails: {
    id: number;
    stakeId: number; // Added stakeId
    stake: Stake;
    createdAt: string; // ISO date string
    active: boolean;
    hasEnded: boolean;
    countdownStart: string; // ISO date string
    countdownEnd: string; // ISO date string
    possibleWin: string;
    declaredWinners: number[]; // ID of the winning player
    drawnNumbers: number[];
    players: Player[];
    _count: {
      players: number; // Total number of players
    };
  } | null; // Updated to not be nullable
  isLoading: boolean;
  onClose: () => void; // Callback to close the details view
  refetch: () => Promise<
    QueryObserverResult<
      {
        bingoGames: BingoGame;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pageInfo: any;
      },
      Error
    >
  >;
}

export interface Stake {
  id: number;
  amount: string;
}

interface Player {
  userId: number; // User ID instead of bingoGameUser
  cardId: number; // Card ID for the player
  createdAt: string; // ISO date string for player creation time
  markedNumbers: string; // Comma-separated string of marked numbers
  autoPlay: boolean; // Indicates if autoplay is enabled
}

export interface BingoGameUpdate {
  active: boolean;
  hasEnded: boolean;
}

// BINGO CARD INTERFACE
interface BingoCardUser {
  id: number;
  username: string;
  phoneNumber: string;
}

interface BingoCardGame {
  id: number;
  stakeId: number;
  active: boolean;
  hasEnded: boolean;
  createdAt: string; // Consider using Date type if you handle dates in your application
  possibleWin: string; // You might want to define this as a number if it's a numeric value
  declaredWinners: number[];
  drawnNumbers: number[]; // Assuming drawnNumbers is an array of numbers
}

export interface UserBingoCard {
  userId: number;
  gameId: number;
  user: BingoCardUser; // Player's user information
  game: BingoCardGame; // Game information related to the player
  cardId: number; // Card ID associated with the player
  createdAt: string; // Consider using Date type if you handle dates in your application
  markedNumbers: string; // Could also be an array of numbers if you prefer
  autoPlay: boolean; // Indicates if the player has autoplay enabled
}

export interface UserBingoCardDetailsProps {
  userId: number;
  gameId: number;
  userBingoCardDetails: UserBingoCard;
  isLoading: boolean;
  onClose: () => void;
}

// REFERENCES
interface Referrer {
  username: string;
  phoneNumber: string;
}

export interface ReferredUser {
  id: number;
  referredUsername: string;
  referredPhone: string;
  registrationDate: string; // Consider using Date if you're handling date objects in your app
  referrer: Referrer;
  bonusAwarded: boolean;

}

export interface ReferredUserDetailProps {
  userId: number;
  refDetail: ReferredUser;
  onClose: () => void;
  isLoading: boolean;
}

// BINGO CARD
export interface BingoCard {
  id: number;
  numbers: string;
}

export interface BingoCardDetailProps {
  cardId: number;
  bingoCardDetails: BingoCard;
  onClose: () => void;
  isLoading: boolean;
  refetch: () => Promise<
    QueryObserverResult<
      {
        bingoCards: BingoCard;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pageInfo: any;
      },
      Error
    >
  >;
}

export interface BingoCardUpdate {
  numbers: string;
}

// BONUS PERIOD
export interface BonusPeriod {
  id: number;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  createdAt: string;
  points: Point[];
  dateTimeInAMH: string;
  prizeDistribution: string;
  predefinedWinners?: number;

  prizes?: Prize[]
  minGames: number;
  minDeposit: number;
  allowedStakes: number[];
}

export interface Prize{
 
  rank: number;
  amount: string;

}

export interface Point {
  createdAt: string; // ISO 8601 format
  userId: number;
  points: number;
  user: BonusUser;
}


interface BonusUser {
  username: string;
}

export interface BonusPeriodDetailsProps {
  bonusId: number;

  bonusPeriodDetails: BonusPeriod;
  pageInfo:PageInfo;
  onClose: () => void;
  isLoading: boolean;
  refetch: () => Promise<
    QueryObserverResult<
      {
        bonusPeriods: BonusPeriod;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pageInfo: any;
      },
      Error
    >
  >;
}

export interface BonusPeriodUpdate {
  status: string;
}




export interface AddBonusPeriod {
  startDate: string;  
  endDate: string;    
  type: string;       
  dateTimeInAMH: string;  
  prizeDistribution: string;  
  predefinedWinners: number | null;  
  prizes: Prize[];  
  minGames: number;
  minDeposit: number;
  allowedStakes: number[];
}

export interface PageInfo {
  totalPoints: number;   // Total number of points
  totalPages: number;    // Total number of pages
  currentPage: number;   // Current page number
  limit: number;         // Limit of items per page
}



export interface JackpotPeriod{
  id:number;
  type: string;
  prizeDistribution?: string;
  predefinedWinners?: number;
}

interface WinnerUser {
  id: number;
  username: string;
  phoneNumber: string;
}

export interface Winner {
  id: number;
  userId: number;
  bonusPeriodId: number;
  amountWon: string; // Adjust type if you plan to use a number directly
  createdAt: string; // Date as a string, consider using Date type if parsing
  prizeGiven: boolean;
  prizeGivenDate: string; // Same here, could be Date type
  rank: number;
  user: WinnerUser; // Nested User object
}

export interface UpdatePrize{
  userId: number;
  amount: number;
  phoneNumber: string;
  bonusPeriodId:number;
}

export interface Transaction {
  id: number;
  event: string;
  username: string;
  mobile: string;
  currency: string;
  amount: string;
  status: string;
  reference: string;
  tx_ref: string;
  userWalletUpdated: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionDetailsProps{
  txRef:string;
  transactionDetails: TransactionDetail;
  isLoading: boolean;
  onClose: () => void;
}

interface TransactionDetail {
  id: number;
  event: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  username: string;
  mobile: string;
  currency: string;  
  amount: string;
  charge: string;
  status: string;
  failure_reason: string | null;
  mode: string;
  reference: string;
  created_at: string;
  updated_at: string;
  type: string;
  tx_ref: string;
  payment_method: string;
  customization: {
    logo: string | null;
    title: string;
    description: string;
  };
  meta: string | null;
  userWalletUpdated: boolean;
}


export interface WithdrawUser {
  id: number;
  username: string;
  phoneNumber: string;
  wallet: string;
}

export interface PendingWithdrawal {
  id: number;
  userId: number;
  user: WithdrawUser;
  amount: number;
  accountNumber: string;
  bankCode: string;
  status: "PENDING" | "APPROVED" | "REJECTED"; // Enum values
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface AxiosError extends Error {
  response?: {
    data: {
      message: string;
    };
  };
}