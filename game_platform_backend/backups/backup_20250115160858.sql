--
-- PostgreSQL database dump
--

-- Dumped from database version 15.10 (Debian 15.10-1.pgdg120+1)
-- Dumped by pg_dump version 15.10 (Debian 15.10-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: PrizeDistribution; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PrizeDistribution" AS ENUM (
    'PREDEFINED',
    'RANDOM',
    'BOTH'
);


ALTER TYPE public."PrizeDistribution" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN',
    'STAFF'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: BingoCard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BingoCard" (
    id integer NOT NULL,
    numbers text NOT NULL
);


ALTER TABLE public."BingoCard" OWNER TO postgres;

--
-- Name: BingoCard_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."BingoCard_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."BingoCard_id_seq" OWNER TO postgres;

--
-- Name: BingoCard_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."BingoCard_id_seq" OWNED BY public."BingoCard".id;


--
-- Name: BingoGame; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BingoGame" (
    id integer NOT NULL,
    "stakeId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    active boolean DEFAULT false NOT NULL,
    "countdownStart" timestamp(3) without time zone,
    "countdownEnd" timestamp(3) without time zone,
    "possibleWin" numeric(65,30) DEFAULT 0 NOT NULL,
    "assignedCardIds" integer[],
    "hasEnded" boolean DEFAULT false NOT NULL,
    "drawnNumbers" integer[] DEFAULT ARRAY[]::integer[],
    "declaredWinners" integer[] DEFAULT ARRAY[]::integer[]
);


ALTER TABLE public."BingoGame" OWNER TO postgres;

--
-- Name: BingoGame_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."BingoGame_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."BingoGame_id_seq" OWNER TO postgres;

--
-- Name: BingoGame_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."BingoGame_id_seq" OWNED BY public."BingoGame".id;


--
-- Name: BonusPeriod; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BonusPeriod" (
    id integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dateTimeInAMH" text NOT NULL,
    "predefinedWinners" integer,
    "prizeDistribution" public."PrizeDistribution" DEFAULT 'PREDEFINED'::public."PrizeDistribution" NOT NULL
);


ALTER TABLE public."BonusPeriod" OWNER TO postgres;

--
-- Name: BonusPeriod_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."BonusPeriod_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."BonusPeriod_id_seq" OWNER TO postgres;

--
-- Name: BonusPeriod_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."BonusPeriod_id_seq" OWNED BY public."BonusPeriod".id;


--
-- Name: BonusPoint; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BonusPoint" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "bonusPeriodId" integer NOT NULL,
    points integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BonusPoint" OWNER TO postgres;

--
-- Name: BonusPoint_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."BonusPoint_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."BonusPoint_id_seq" OWNER TO postgres;

--
-- Name: BonusPoint_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."BonusPoint_id_seq" OWNED BY public."BonusPoint".id;


--
-- Name: Game; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Game" (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    picture text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."Game" OWNER TO postgres;

--
-- Name: Game_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Game_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Game_id_seq" OWNER TO postgres;

--
-- Name: Game_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Game_id_seq" OWNED BY public."Game".id;


--
-- Name: Prize; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Prize" (
    id integer NOT NULL,
    "bonusPeriodId" integer NOT NULL,
    rank integer NOT NULL,
    amount numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Prize" OWNER TO postgres;

--
-- Name: Prize_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Prize_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Prize_id_seq" OWNER TO postgres;

--
-- Name: Prize_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Prize_id_seq" OWNED BY public."Prize".id;


--
-- Name: ReferredUser; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReferredUser" (
    id integer NOT NULL,
    "referrerId" integer NOT NULL,
    "referredUsername" text NOT NULL,
    "referredPhone" text NOT NULL,
    "registrationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ReferredUser" OWNER TO postgres;

--
-- Name: ReferredUser_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ReferredUser_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ReferredUser_id_seq" OWNER TO postgres;

--
-- Name: ReferredUser_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReferredUser_id_seq" OWNED BY public."ReferredUser".id;


--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RefreshToken" (
    id integer NOT NULL,
    token text NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RefreshToken" OWNER TO postgres;

--
-- Name: RefreshToken_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."RefreshToken_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."RefreshToken_id_seq" OWNER TO postgres;

--
-- Name: RefreshToken_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."RefreshToken_id_seq" OWNED BY public."RefreshToken".id;


--
-- Name: Stake; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Stake" (
    id integer NOT NULL,
    amount numeric(65,30) NOT NULL
);


ALTER TABLE public."Stake" OWNER TO postgres;

--
-- Name: Stake_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Stake_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Stake_id_seq" OWNER TO postgres;

--
-- Name: Stake_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Stake_id_seq" OWNED BY public."Stake".id;


--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transaction" (
    id integer NOT NULL,
    event text NOT NULL,
    first_name text,
    last_name text,
    email text,
    username text NOT NULL,
    mobile text NOT NULL,
    currency text NOT NULL,
    amount numeric(65,30) NOT NULL,
    charge numeric(65,30) NOT NULL,
    status text NOT NULL,
    failure_reason text,
    mode text NOT NULL,
    reference text NOT NULL,
    created_at timestamp(3) without time zone NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    type text NOT NULL,
    tx_ref text NOT NULL,
    payment_method text NOT NULL,
    customization jsonb NOT NULL,
    meta jsonb NOT NULL,
    "userWalletUpdated" boolean DEFAULT false NOT NULL,
    "userId" integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO postgres;

--
-- Name: Transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Transaction_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Transaction_id_seq" OWNER TO postgres;

--
-- Name: Transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Transaction_id_seq" OWNED BY public."Transaction".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    "phoneNumber" text,
    username text,
    password text NOT NULL,
    wallet numeric(65,30) DEFAULT 10.00 NOT NULL,
    "referredBy" text,
    "referredCount" integer DEFAULT 0 NOT NULL,
    "referralBonus" numeric(65,30) DEFAULT 0.00 NOT NULL,
    "registrationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "referralCode" text NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    otp integer DEFAULT 1234 NOT NULL,
    email text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserBingoCard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserBingoCard" (
    "userId" integer NOT NULL,
    "gameId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "cardId" integer NOT NULL,
    "markedNumbers" text NOT NULL,
    "autoPlay" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."UserBingoCard" OWNER TO postgres;

--
-- Name: UserStatistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserStatistics" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "gamesPlayed" integer DEFAULT 0 NOT NULL,
    "gamesWon" integer DEFAULT 0 NOT NULL,
    "gamesLost" integer DEFAULT 0 NOT NULL,
    "amountWon" double precision DEFAULT 0 NOT NULL,
    "dailyStats" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "weeklyStats" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "monthlyStats" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "yearlyStats" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserStatistics" OWNER TO postgres;

--
-- Name: UserStatistics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UserStatistics_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserStatistics_id_seq" OWNER TO postgres;

--
-- Name: UserStatistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UserStatistics_id_seq" OWNED BY public."UserStatistics".id;


--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: Winner; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Winner" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "bonusPeriodId" integer NOT NULL,
    "amountWon" numeric(65,30) DEFAULT 0 NOT NULL,
    rank integer NOT NULL,
    "prizeGiven" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "prizeGivenDate" timestamp(3) without time zone
);


ALTER TABLE public."Winner" OWNER TO postgres;

--
-- Name: Winner_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Winner_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Winner_id_seq" OWNER TO postgres;

--
-- Name: Winner_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Winner_id_seq" OWNED BY public."Winner".id;


--
-- Name: _GameStakes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_GameStakes" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_GameStakes" OWNER TO postgres;

--
-- Name: _UserGamesLost; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_UserGamesLost" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_UserGamesLost" OWNER TO postgres;

--
-- Name: _UserGamesPlayed; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_UserGamesPlayed" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_UserGamesPlayed" OWNER TO postgres;

--
-- Name: _UserGamesWon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_UserGamesWon" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_UserGamesWon" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: BingoCard id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BingoCard" ALTER COLUMN id SET DEFAULT nextval('public."BingoCard_id_seq"'::regclass);


--
-- Name: BingoGame id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BingoGame" ALTER COLUMN id SET DEFAULT nextval('public."BingoGame_id_seq"'::regclass);


--
-- Name: BonusPeriod id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BonusPeriod" ALTER COLUMN id SET DEFAULT nextval('public."BonusPeriod_id_seq"'::regclass);


--
-- Name: BonusPoint id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BonusPoint" ALTER COLUMN id SET DEFAULT nextval('public."BonusPoint_id_seq"'::regclass);


--
-- Name: Game id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Game" ALTER COLUMN id SET DEFAULT nextval('public."Game_id_seq"'::regclass);


--
-- Name: Prize id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prize" ALTER COLUMN id SET DEFAULT nextval('public."Prize_id_seq"'::regclass);


--
-- Name: ReferredUser id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReferredUser" ALTER COLUMN id SET DEFAULT nextval('public."ReferredUser_id_seq"'::regclass);


--
-- Name: RefreshToken id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken" ALTER COLUMN id SET DEFAULT nextval('public."RefreshToken_id_seq"'::regclass);


--
-- Name: Stake id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Stake" ALTER COLUMN id SET DEFAULT nextval('public."Stake_id_seq"'::regclass);


--
-- Name: Transaction id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction" ALTER COLUMN id SET DEFAULT nextval('public."Transaction_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: UserStatistics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserStatistics" ALTER COLUMN id SET DEFAULT nextval('public."UserStatistics_id_seq"'::regclass);


--
-- Name: Winner id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Winner" ALTER COLUMN id SET DEFAULT nextval('public."Winner_id_seq"'::regclass);


--
-- Data for Name: BingoCard; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BingoCard" (id, numbers) FROM stdin;
1	15,3,2,4,9,23,24,27,29,20,33,36,100,41,35,54,55,50,58,46,70,67,68,61,73
2	10,1,14,3,12,26,16,18,27,21,41,45,100,42,38,59,51,60,57,47,73,66,70,68,61
3	13,8,12,10,5,19,16,21,22,27,38,35,100,40,45,46,57,59,54,58,72,65,67,66,73
4	5,1,3,7,14,25,26,16,20,30,43,44,100,42,40,60,54,56,48,58,70,65,64,67,63
5	6,12,1,4,2,25,17,24,16,26,45,36,100,41,32,49,47,57,59,48,65,72,75,69,71
6	9,7,3,11,15,19,17,22,27,16,33,42,100,43,41,60,59,51,52,48,72,70,73,68,63
7	9,1,4,10,3,23,28,29,19,30,37,33,100,38,44,53,59,51,52,46,75,66,73,74,72
8	5,1,6,10,2,22,25,28,26,21,41,44,100,33,37,49,59,54,46,53,75,66,64,69,72
9	3,15,12,11,4,22,26,24,16,18,41,40,100,44,37,59,54,49,47,53,63,64,67,75,70
10	1,15,8,13,6,21,29,18,20,23,38,43,100,44,33,59,48,46,51,60,68,65,61,69,71
11	13,14,9,7,8,16,24,29,28,21,31,43,100,44,38,50,51,46,57,49,75,74,70,66,65
12	4,14,9,2,1,27,17,24,18,21,33,36,100,32,45,47,59,53,51,48,67,65,66,74,63
13	11,7,3,13,6,17,24,25,23,19,33,41,100,38,43,48,47,54,59,56,74,62,68,75,61
14	3,6,2,7,14,20,28,16,30,21,39,35,100,38,33,49,53,60,54,46,65,63,71,69,72
15	1,15,14,12,3,16,21,27,17,23,33,38,100,42,43,46,48,56,49,47,71,66,72,61,68
16	15,10,1,8,2,19,16,23,24,22,43,44,100,39,31,48,57,50,54,56,74,64,65,62,68
17	10,5,3,6,1,28,16,24,26,21,44,43,100,40,34,51,57,49,54,60,71,63,61,74,68
18	12,5,3,4,10,23,26,19,18,28,44,43,100,32,42,54,58,57,47,50,62,70,72,68,65
19	9,12,11,13,14,25,18,23,26,19,43,35,100,44,39,58,60,49,57,56,70,64,63,73,68
20	10,5,4,15,8,24,30,25,26,23,34,43,100,45,44,48,46,57,47,50,71,62,72,73,64
21	14,7,8,2,12,20,23,27,26,19,31,37,100,32,42,46,52,57,48,47,65,61,64,67,70
22	15,4,7,1,13,29,21,28,23,18,40,42,100,36,34,60,48,56,53,49,61,67,71,64,68
23	9,8,15,12,11,16,27,29,30,18,36,40,100,44,45,46,60,57,54,47,71,68,61,72,74
24	11,1,15,13,2,22,30,21,16,19,42,41,100,44,31,53,52,54,58,47,65,61,71,68,63
26	6,14,3,10,4,26,25,28,18,16,40,33,100,38,31,60,59,56,49,53,67,63,72,75,64
25	2,5,4,1,11,26,30,17,18,20,39,32,100,31,34,47,57,53,54,59,63,68,70,66,61
27	15,7,5,3,8,16,25,19,29,18,34,32,100,45,38,46,52,58,53,54,75,74,69,64,63
28	5,6,7,3,1,16,22,20,30,25,43,35,100,36,33,46,52,55,57,56,69,72,61,71,66
29	1,9,11,8,3,24,22,18,17,20,43,38,100,31,34,54,46,48,49,53,67,71,61,69,74
30	9,2,3,5,6,29,24,28,20,22,32,43,100,33,44,49,56,47,57,50,68,63,71,75,69
31	4,2,9,12,3,28,25,17,22,26,36,45,100,44,42,51,60,56,55,50,65,66,64,72,70
32	11,8,15,6,3,18,27,29,22,23,44,34,100,32,37,57,58,51,46,48,72,70,74,69,63
33	4,9,11,10,8,19,30,26,24,18,40,42,100,31,33,48,47,51,55,59,70,64,66,75,74
34	11,13,1,10,5,26,27,28,29,21,33,36,100,40,42,51,53,60,46,52,69,73,61,72,70
35	1,8,7,13,10,25,19,20,26,21,33,34,100,45,35,57,55,56,51,54,61,70,73,65,75
36	14,15,1,13,2,17,18,23,21,25,36,43,100,44,39,51,56,57,49,47,70,65,73,63,68
37	3,9,5,4,1,21,26,28,29,17,33,43,100,45,35,60,53,49,57,48,67,71,66,73,68
38	15,12,1,9,2,27,16,20,21,18,32,39,100,43,40,49,57,53,51,56,62,69,64,61,73
39	1,3,12,5,14,23,26,30,29,24,45,32,100,35,37,51,60,57,49,55,70,75,71,68,62
40	4,1,14,11,7,17,28,21,24,22,33,31,100,35,41,58,51,56,52,60,66,72,68,74,63
41	1,7,5,13,14,29,28,25,19,18,37,38,100,42,35,60,46,47,53,58,68,75,62,64,72
42	11,2,10,5,7,28,16,17,30,20,41,33,100,35,36,49,52,54,60,58,66,64,75,63,62
43	1,11,6,12,2,29,18,19,30,16,37,45,100,36,38,48,53,46,55,50,65,69,67,75,61
44	8,1,6,15,10,21,19,29,26,28,33,41,100,31,43,53,52,59,50,60,75,68,62,61,71
45	9,1,14,5,11,20,24,30,23,19,39,42,100,32,40,54,50,55,46,49,64,73,68,67,74
46	10,4,5,14,12,17,20,28,18,25,42,37,100,35,34,52,50,57,59,60,65,62,61,69,68
47	2,3,9,8,12,28,24,30,26,18,32,44,100,35,40,46,51,54,58,49,72,75,66,61,64
48	7,5,10,15,4,29,28,27,24,20,37,39,100,40,44,47,46,51,60,53,74,61,65,62,73
49	4,14,12,3,7,18,16,25,22,29,32,34,100,33,35,57,60,48,51,52,67,64,63,61,73
50	3,10,9,11,13,22,30,19,16,26,44,45,100,31,41,49,51,60,50,52,62,74,73,63,66
51	4,9,1,11,13,22,19,26,16,23,32,35,100,42,44,57,55,49,58,50,71,73,64,72,70
52	6,2,1,5,3,23,19,22,17,25,36,31,100,34,44,57,56,50,52,48,66,62,64,75,61
53	3,10,4,6,2,17,30,23,25,27,36,32,100,39,45,49,48,55,57,52,63,66,64,62,75
54	14,13,1,6,15,27,29,16,19,30,44,43,100,31,35,59,46,47,51,48,68,73,71,69,63
55	1,7,5,2,11,23,21,17,22,16,43,38,100,39,40,46,50,59,60,51,75,66,61,64,68
56	7,8,4,6,11,22,17,26,21,18,37,35,100,38,43,58,60,50,51,52,75,65,68,70,71
57	4,14,3,9,11,16,20,19,21,22,38,33,100,35,43,60,58,53,57,51,66,61,72,69,71
58	14,8,11,5,6,29,30,26,27,24,32,41,100,43,40,46,48,56,52,50,68,75,70,61,67
59	9,3,15,12,14,21,19,29,20,27,32,33,100,34,42,47,57,55,50,58,71,61,68,63,66
60	5,11,1,9,4,26,30,20,29,23,38,45,100,36,44,57,48,49,54,52,65,75,67,70,69
61	11,13,10,2,1,19,20,22,18,16,34,45,100,44,43,51,53,59,60,50,67,68,72,65,63
62	4,8,11,12,9,28,27,18,23,30,40,34,100,31,32,50,51,58,46,53,75,71,72,64,67
63	13,3,8,5,4,20,24,16,23,18,44,36,100,40,33,56,54,58,46,49,73,62,74,72,75
64	13,9,4,6,2,30,29,24,23,19,44,38,100,42,39,59,49,56,52,51,68,67,70,72,75
65	12,3,6,2,7,17,26,18,30,21,42,41,100,32,44,52,51,49,47,58,75,67,68,63,74
66	8,5,4,3,9,18,22,27,16,28,31,33,100,39,36,59,50,55,51,60,72,63,75,64,74
67	11,1,3,9,12,24,17,20,29,30,44,40,100,38,36,46,58,60,56,57,68,69,67,71,70
68	4,9,14,15,10,16,23,22,25,26,38,32,100,33,39,53,50,58,52,55,70,68,74,73,71
69	13,8,6,1,2,25,16,30,17,22,34,45,100,35,36,52,51,59,54,58,71,68,65,62,73
70	12,8,10,3,2,23,17,26,24,29,41,39,100,43,36,51,50,46,55,58,75,66,62,73,65
71	13,7,6,5,15,20,17,22,19,18,39,40,100,36,37,48,53,55,60,54,61,71,72,75,67
72	6,3,12,14,8,19,20,24,28,16,42,31,100,35,40,56,48,55,51,50,72,67,65,64,68
73	12,6,9,7,13,19,22,28,18,29,42,32,100,43,35,52,57,55,49,47,68,69,75,63,66
74	13,10,4,15,3,18,24,28,27,21,34,33,100,31,43,49,54,55,58,46,75,66,74,65,68
75	2,13,5,3,7,22,20,24,23,28,45,42,100,37,39,48,55,46,51,59,72,73,64,71,62
76	14,9,6,5,4,30,22,28,26,16,33,32,100,31,39,55,56,57,51,46,63,72,62,67,66
85	11,3,1,8,7,23,27,19,30,18,32,41,100,39,40,58,60,48,54,52,65,67,68,71,75
94	13,14,9,7,6,18,30,29,25,26,39,42,100,45,31,46,55,60,54,48,69,74,71,75,65
101	6,10,13,5,3,30,19,27,25,18,35,36,100,38,33,57,56,46,48,52,75,68,70,62,66
106	8,6,14,11,7,29,19,20,17,23,40,35,100,33,44,60,47,59,48,56,70,66,75,61,64
119	1,10,5,11,15,27,22,24,21,26,39,44,100,41,45,52,48,54,47,57,71,74,62,69,73
126	9,10,1,14,12,22,18,19,27,21,36,38,100,33,44,49,53,47,58,59,74,66,72,61,70
131	1,6,4,10,2,16,20,25,24,27,31,38,100,35,33,52,51,56,58,57,66,62,70,65,71
148	8,3,5,1,12,25,18,20,27,16,36,33,100,45,43,58,55,57,59,49,72,66,61,67,73
151	12,5,4,2,15,23,28,18,21,24,38,33,100,35,36,51,48,57,58,60,62,75,61,74,69
162	15,11,7,2,12,18,22,21,27,30,42,37,100,33,35,50,46,49,48,55,71,63,69,74,68
172	13,14,12,8,3,21,24,25,20,30,32,45,100,42,36,46,51,57,56,48,74,73,66,68,71
181	15,3,5,11,6,28,29,19,16,21,38,40,100,43,45,58,55,50,56,52,67,71,65,64,62
193	9,10,14,13,5,20,21,22,25,17,33,34,100,41,39,58,59,60,51,49,73,74,67,70,61
199	15,13,4,8,6,16,24,23,21,29,32,37,100,31,38,47,55,58,52,60,61,72,64,75,71
77	5,15,9,12,7,21,16,26,23,24,35,44,100,43,45,48,50,58,56,60,63,70,61,73,74
88	9,8,1,13,10,22,25,21,24,29,44,41,100,32,45,60,58,57,59,50,72,70,75,61,67
102	11,15,8,7,4,29,18,19,27,16,33,44,100,43,41,58,56,54,47,57,66,62,71,61,63
105	3,14,1,5,9,26,29,17,19,22,44,36,100,42,37,48,55,46,51,60,61,67,73,69,71
116	3,15,11,7,9,25,20,19,22,17,39,37,100,45,34,59,46,48,47,54,75,68,66,72,67
122	9,3,13,7,1,30,18,23,20,28,45,42,100,32,37,51,52,48,57,54,68,75,64,72,70
139	5,2,7,4,10,25,29,23,17,18,36,32,100,38,35,50,55,56,60,51,74,66,63,61,71
145	8,10,11,7,3,19,18,16,23,27,37,35,100,32,41,55,48,56,49,46,64,70,67,65,72
154	14,4,5,15,10,21,29,23,18,24,41,31,100,33,36,55,51,50,54,52,72,73,61,65,66
158	10,12,8,14,3,27,20,29,19,23,39,34,100,38,35,46,56,59,48,52,62,68,63,74,69
171	9,4,14,5,3,27,21,17,22,28,37,36,100,33,40,56,47,54,53,46,65,69,66,71,62
182	11,14,6,1,12,20,29,22,28,27,39,43,100,36,38,56,49,59,47,51,73,62,65,67,63
191	12,4,2,14,13,18,19,21,16,20,37,41,100,35,36,57,48,58,52,53,67,71,73,62,75
197	5,15,13,9,3,22,21,27,24,20,32,42,100,31,36,52,47,49,57,60,62,67,68,75,74
78	6,2,3,9,5,28,29,19,30,17,43,35,100,33,44,49,48,57,58,60,69,63,73,67,62
87	11,3,1,14,2,28,18,30,20,16,40,35,100,38,32,59,52,53,54,46,72,73,65,64,66
100	10,7,14,3,9,29,16,30,19,23,35,44,100,32,33,55,48,49,58,50,61,69,74,72,67
107	10,12,15,13,4,28,19,18,30,27,34,31,100,44,40,55,47,49,52,57,68,65,61,71,69
120	6,5,10,14,12,17,30,25,16,21,38,34,100,45,44,48,60,51,56,59,73,71,72,62,75
123	1,4,13,2,5,23,22,24,28,21,35,42,100,37,32,54,60,53,48,55,75,65,64,62,73
136	13,7,4,8,12,24,30,21,19,16,35,43,100,41,33,55,54,60,56,47,75,73,69,64,61
140	9,6,12,8,10,25,29,28,26,20,35,45,100,36,38,58,57,55,49,51,74,71,62,65,61
164	10,13,4,3,15,28,22,30,16,20,33,39,100,42,32,59,55,50,57,54,63,67,61,74,68
176	12,10,7,14,6,25,29,23,22,24,40,32,100,41,43,56,48,51,52,60,74,75,62,70,68
187	1,13,7,8,12,30,29,28,21,16,45,42,100,32,37,52,59,56,51,53,73,69,64,68,71
196	14,8,9,12,1,17,22,30,26,18,37,35,100,36,34,53,57,59,58,47,69,62,61,72,67
79	7,13,5,11,1,25,27,24,19,20,45,41,100,34,33,55,51,49,60,50,69,74,61,65,66
93	9,7,4,11,5,26,29,30,28,24,38,37,100,33,44,60,58,52,55,57,71,63,62,73,67
96	13,15,1,9,14,28,29,22,27,18,35,36,100,37,43,53,47,58,57,56,74,68,71,61,63
112	13,14,6,5,3,16,19,17,30,22,44,42,100,37,39,54,58,56,53,55,69,66,72,61,70
127	7,14,6,15,8,18,25,26,27,30,34,32,100,35,36,47,57,58,53,48,69,66,61,64,74
133	2,12,8,15,7,22,16,25,26,30,31,32,100,37,40,46,57,48,51,53,67,62,68,71,74
143	3,9,12,2,13,23,29,27,30,18,35,44,100,45,40,53,52,49,50,60,75,68,70,66,71
157	13,1,5,14,12,21,18,24,20,26,44,37,100,31,33,52,58,54,48,51,62,61,75,72,66
168	5,15,10,2,13,17,25,30,20,18,41,39,100,40,36,46,50,59,51,58,61,66,63,67,64
177	9,7,1,15,13,16,20,17,19,29,39,37,100,32,33,53,51,49,57,50,67,70,75,72,65
185	6,11,10,5,15,27,22,17,26,21,34,41,100,39,31,58,51,56,54,46,62,67,70,74,69
192	7,1,6,14,9,27,24,30,28,29,45,36,100,43,32,53,58,50,48,46,67,68,73,61,69
200	15,2,8,3,11,20,29,16,19,25,40,36,100,31,39,60,58,54,48,55,71,69,74,62,68
80	14,13,4,15,9,30,23,18,29,28,44,45,100,32,34,49,57,54,50,47,69,70,64,74,68
90	7,13,5,10,8,30,29,21,17,22,40,37,100,42,36,55,60,46,47,50,72,73,61,68,65
97	9,10,14,12,15,22,24,30,16,20,35,45,100,32,44,58,47,54,55,48,64,62,68,69,63
108	1,10,15,5,7,21,19,18,26,28,37,42,100,40,39,50,53,49,47,54,70,67,72,68,62
115	3,2,7,10,5,19,23,26,25,24,43,33,100,45,32,48,53,58,49,50,67,70,68,72,75
124	15,14,4,10,9,24,23,26,29,19,41,43,100,36,31,51,50,52,54,46,67,62,65,75,66
138	15,8,10,6,2,26,20,23,30,19,35,43,100,31,37,51,56,59,53,48,66,71,75,61,68
146	6,4,15,12,8,29,27,21,24,26,31,37,100,41,42,57,48,56,47,60,68,70,71,69,65
153	5,7,13,2,6,22,27,18,19,25,44,32,100,35,37,57,53,52,50,59,63,73,64,65,62
160	9,4,10,13,2,19,18,20,22,30,38,42,100,37,40,60,53,58,52,59,70,68,67,75,72
166	11,2,15,6,10,21,18,29,23,20,43,39,100,44,35,58,51,55,57,50,70,69,61,65,71
173	7,8,11,6,9,22,20,24,28,25,34,31,100,41,32,57,58,48,60,56,66,74,71,75,65
179	4,2,5,8,13,26,19,21,20,27,38,44,100,39,36,49,55,48,58,56,69,62,72,74,75
189	9,3,13,1,2,16,19,17,22,27,31,45,100,41,38,55,51,60,47,52,61,72,68,65,75
81	7,1,10,5,2,27,18,20,19,28,35,33,100,39,45,50,47,53,55,52,63,66,75,67,74
89	14,9,1,15,7,16,28,29,18,24,40,35,100,43,39,51,55,57,59,49,66,64,71,73,63
98	6,14,11,7,4,20,28,16,22,19,33,32,100,44,35,57,49,54,59,46,72,69,71,64,63
111	1,6,8,10,2,23,25,19,27,18,36,44,100,37,42,56,55,57,59,48,74,69,64,61,72
113	15,12,5,6,2,29,27,23,28,16,39,35,100,41,44,58,57,53,56,50,66,71,62,63,68
129	12,2,9,1,7,16,29,30,28,22,32,43,100,38,40,58,48,55,54,53,64,74,68,72,65
137	7,10,9,5,4,22,30,27,18,25,36,44,100,42,39,56,58,57,50,60,63,67,64,66,74
141	13,10,3,1,14,19,25,21,22,27,37,40,100,38,44,46,48,54,47,58,72,63,75,64,73
150	10,6,12,15,5,28,16,22,30,17,43,45,100,38,44,53,51,48,46,49,74,71,69,72,67
161	7,8,5,13,12,19,27,16,18,25,34,39,100,42,38,54,50,55,51,56,66,72,63,74,69
169	4,6,9,2,5,25,21,29,19,20,32,44,100,42,40,59,53,52,58,56,61,71,74,62,68
184	11,7,6,10,5,22,18,28,25,27,36,31,100,45,44,52,48,49,46,54,72,73,63,65,74
194	2,4,6,3,13,30,19,22,18,21,39,34,100,41,31,55,49,56,48,60,75,71,61,73,68
198	1,9,5,8,3,27,22,19,21,24,45,40,100,39,35,59,48,57,50,54,68,70,72,62,63
83	11,13,4,5,6,21,30,17,19,29,34,37,100,31,39,51,48,47,56,53,75,66,62,63,64
86	8,1,7,14,13,21,29,24,27,30,37,39,100,32,36,46,53,49,60,54,68,67,66,72,75
99	11,5,6,8,7,25,27,24,21,18,44,35,100,36,31,59,58,52,48,49,65,70,73,69,75
110	6,5,7,4,3,16,20,28,18,27,35,40,100,37,36,46,57,55,52,56,69,61,71,72,66
118	1,12,14,13,5,24,25,19,29,26,42,37,100,44,39,54,47,50,59,60,67,70,66,73,65
121	10,2,1,13,8,27,16,17,25,22,33,39,100,37,31,56,54,59,48,52,67,62,65,72,61
130	4,2,14,13,9,26,23,22,20,19,33,32,100,42,45,50,60,54,55,52,73,61,62,68,69
135	15,5,14,3,10,22,24,18,16,21,40,44,100,31,37,52,55,50,49,58,72,75,71,74,62
142	9,10,8,4,7,27,23,29,28,20,38,42,100,40,35,53,56,46,57,48,72,70,65,62,64
149	13,7,2,9,10,29,16,20,30,18,42,45,100,43,33,55,47,56,48,59,71,65,68,62,73
156	4,1,3,10,7,28,19,22,23,16,40,32,100,44,31,46,58,59,48,53,65,70,73,67,62
165	4,9,6,5,3,26,23,20,27,21,36,34,100,40,43,54,51,50,60,49,62,75,69,73,72
175	4,1,9,10,8,22,16,25,29,18,33,42,100,39,32,53,57,47,59,50,71,64,65,66,61
183	4,2,1,10,7,28,18,26,23,19,42,37,100,35,33,56,58,51,52,55,70,75,61,63,71
195	11,12,9,5,1,22,25,24,19,29,35,33,100,34,42,59,54,46,50,58,62,71,74,66,75
84	2,6,9,12,4,16,25,22,23,28,42,38,100,44,39,58,57,55,50,54,63,73,61,64,70
92	14,1,15,4,3,21,25,27,29,20,35,33,100,37,42,50,47,51,60,52,67,65,66,71,62
95	7,5,3,2,13,18,29,20,28,17,45,41,100,34,44,51,50,46,57,55,71,62,69,72,63
104	9,4,11,2,14,23,24,28,22,17,39,37,100,38,34,54,48,50,46,58,63,68,67,66,69
117	14,6,2,1,13,24,25,18,16,30,33,43,100,39,41,47,48,50,52,60,67,66,75,63,61
125	8,5,10,12,1,19,24,27,20,23,40,33,100,42,35,59,54,49,56,50,69,62,63,75,74
132	5,6,4,8,7,21,22,26,25,28,32,45,100,34,36,57,46,54,59,56,71,62,66,75,70
147	10,11,15,3,1,19,27,20,28,26,39,35,100,36,37,58,48,57,53,50,61,71,69,68,72
155	12,2,6,13,7,18,16,17,30,23,43,34,100,45,31,58,57,54,59,46,61,72,70,75,62
159	5,2,14,11,15,30,18,27,16,24,38,36,100,40,43,46,57,56,54,47,72,75,67,64,65
167	12,1,3,7,10,17,22,20,21,24,41,40,100,33,32,59,56,53,46,55,63,68,75,71,70
174	6,13,14,2,11,24,28,26,29,16,37,44,100,41,45,47,52,60,54,53,63,68,70,62,64
180	7,4,12,10,2,17,25,18,29,20,43,36,100,34,31,50,54,52,56,55,71,64,61,70,72
188	14,3,12,13,4,30,24,23,28,18,32,31,100,36,39,54,59,55,46,57,73,61,74,63,67
82	14,12,5,1,4,24,16,19,27,20,35,40,100,44,36,51,56,60,54,47,62,70,67,73,66
91	3,10,13,4,15,30,21,27,26,25,45,39,100,35,33,50,58,46,56,52,69,70,71,74,65
103	10,1,9,5,3,22,21,23,28,16,42,35,100,39,38,51,48,56,50,49,62,68,63,75,67
109	10,2,13,7,1,23,30,24,29,19,37,40,100,45,44,58,54,55,47,51,64,75,61,63,68
114	9,4,8,11,14,16,23,17,24,25,45,42,100,37,44,47,50,59,57,60,73,62,67,75,71
128	2,9,13,1,11,16,30,27,24,28,38,36,100,32,34,58,47,54,50,55,66,74,65,62,75
134	15,9,5,1,13,17,30,22,23,28,39,38,100,40,35,52,51,56,49,55,63,74,75,65,73
144	12,14,9,10,4,20,21,29,27,19,41,31,100,44,42,50,48,47,55,54,64,72,75,65,70
152	12,5,1,3,2,27,25,19,29,16,40,35,100,45,31,58,55,53,47,48,73,65,75,68,62
163	4,2,3,1,9,19,17,16,30,24,38,34,100,45,31,51,49,50,57,58,70,73,61,66,65
170	6,12,11,10,15,18,30,25,17,22,32,43,100,35,40,52,58,53,54,50,68,71,70,73,66
178	14,15,10,1,5,18,22,16,30,19,43,35,100,32,42,50,52,47,51,57,68,72,61,64,65
186	5,13,14,12,2,25,27,21,23,17,40,41,100,33,38,51,48,60,53,54,64,62,71,70,72
190	1,14,7,12,15,28,25,17,23,21,43,38,100,37,34,60,57,50,59,46,66,75,70,69,71
\.


--
-- Data for Name: BingoGame; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BingoGame" (id, "stakeId", "createdAt", active, "countdownStart", "countdownEnd", "possibleWin", "assignedCardIds", "hasEnded", "drawnNumbers", "declaredWinners") FROM stdin;
1	1	2025-01-08 14:59:27.251	f	2025-01-08 15:00:16.504	2025-01-08 15:01:01.504	16.000000000000000000000000000000	{6}	t	{46,61,8,55,2,40,23,30,75,16,10,12,18,60,44,9,13,35,1,17,45,41,7,34,22,67,73,38,25,14,49,54,65,57,43,50,62,24}	{6}
2	1	2025-01-08 15:06:40.554	f	2025-01-08 15:06:50.047	2025-01-08 15:07:35.047	16.000000000000000000000000000000	{12}	t	{30,75,56,36,51,62,67,18,65,5,33,11,10,6,37,50,7,47,24,4,58,19,60,66,55,2,45,35,44,68,25,17,38,26,31,3,16,9,40,63}	{1}
\.


--
-- Data for Name: BonusPeriod; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BonusPeriod" (id, "startDate", "endDate", type, status, "createdAt", "dateTimeInAMH", "predefinedWinners", "prizeDistribution") FROM stdin;
\.


--
-- Data for Name: BonusPoint; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BonusPoint" (id, "userId", "bonusPeriodId", points, "createdAt") FROM stdin;
\.


--
-- Data for Name: Game; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Game" (id, title, description, picture) FROM stdin;
1	Bingo	This is a bingo game	./bingo.jpg
\.


--
-- Data for Name: Prize; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Prize" (id, "bonusPeriodId", rank, amount, "createdAt") FROM stdin;
\.


--
-- Data for Name: ReferredUser; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReferredUser" (id, "referrerId", "referredUsername", "referredPhone", "registrationDate") FROM stdin;
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RefreshToken" (id, token, "userId", "createdAt", "expiresAt") FROM stdin;
2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhYml5IiwiaWF0IjoxNzM2Mjg2NzQyLCJleHAiOjE3MzY1NDU5NDJ9.G5c1CT07t-rilo_Irjb8SHfpInqlu_WV2x4Yel0sJsM	2	2025-01-07 21:52:22.336	2025-01-14 21:52:22.335
3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhYml5IiwiaWF0IjoxNzM2Mjg2NzQ2LCJleHAiOjE3MzY1NDU5NDZ9.S6IHcISkQzLCK7-43NnjFY8nMuaV86BGZPLICiiXynA	2	2025-01-07 21:52:26.024	2025-01-14 21:52:26.006
4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhYml5IiwiaWF0IjoxNzM2Mjg2NzY3LCJleHAiOjE3MzY1NDU5Njd9.RcDYa8fqaBuABqv_YNGsEKf21zX6oGx857uuWQzDKAs	2	2025-01-07 21:52:47.542	2025-01-14 21:52:47.54
5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhYml5IiwiaWF0IjoxNzM2Mjg2NzY5LCJleHAiOjE3MzY1NDU5Njl9.OC1Xqb2O9H8mbktMhtgobeJ0ItIyNxOmRHOsyj35wwE	2	2025-01-07 21:52:49.75	2025-01-14 21:52:49.749
6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhYml5IiwiaWF0IjoxNzM2Mjg2NzcxLCJleHAiOjE3MzY1NDU5NzF9.uOFcioOG3OndzHsz9Pnep15_zoP0Un5nRdexg32q-Mc	2	2025-01-07 21:52:51.41	2025-01-14 21:52:51.408
7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhYml5IiwiaWF0IjoxNzM2Mjg2Nzg4LCJleHAiOjE3MzY1NDU5ODh9.P6r3GJjSsgm9a1ltHGfeafRwM-A_S9uNFGAQb4NoHJY	2	2025-01-07 21:53:08.499	2025-01-14 21:53:08.498
8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhYml5IiwiaWF0IjoxNzM2Mjg3MDE1LCJleHAiOjE3MzY1NDYyMTV9.Dn43lOQID_cz1HnS5OhdriYdO4FkYX7tuR_JXKudQNw	2	2025-01-07 21:56:55.879	2025-01-14 21:56:55.877
9	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjI4NzA5MSwiZXhwIjoxNzM2NTQ2MjkxfQ.2t2aPKrz4zoIZw0a2QlPlZvPFCrmJHJjHMNjGaiTs_8	1	2025-01-07 21:58:11.535	2025-01-14 21:58:11.532
10	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjI4NzE2MywiZXhwIjoxNzM2NTQ2MzYzfQ.qFcssANDQllMOFPgw4F7sVE8FypTigAGwcNPDTnAkFY	1	2025-01-07 21:59:23.287	2025-01-14 21:59:23.285
11	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhYml5IiwiaWF0IjoxNzM2Mjg3MjA5LCJleHAiOjE3MzY1NDY0MDl9.3efcaoDNKZjezoifUI1NOuauXVP7Krln89p4KPxJv1w	2	2025-01-07 22:00:09.19	2025-01-14 22:00:09.188
12	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjI4NzI1MywiZXhwIjoxNzM2NTQ2NDUzfQ.wrEcIVglow0U4R9q6D7CKpSW0yHXRtU6RDqQBwKeMHw	1	2025-01-07 22:00:53.347	2025-01-14 22:00:53.345
15	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjMyMDc3NCwiZXhwIjoxNzM2NTc5OTc0fQ.ZlAkwO9O4_GBgjhrz3V5WjSzzs1eYmxroCdEfDkdV24	1	2025-01-08 07:19:34.272	2025-01-15 07:19:34.271
16	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjMyMzk5NiwiZXhwIjoxNzM2NTgzMTk2fQ.wXsrfhcqcahxYq0DfwWi2ZWdH_XW4mNmaqEVAxDNAb8	1	2025-01-08 08:13:16.872	2025-01-15 08:13:16.867
17	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjMzMjYyMiwiZXhwIjoxNzM2NTkxODIyfQ.74tnpXssWFJIsAXPyWDGAE092nSPP3JN90Bi6-6b4XE	1	2025-01-08 10:37:02.409	2025-01-15 10:37:02.408
19	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjM0MzI0NiwiZXhwIjoxNzM2NjAyNDQ2fQ.gFG1Vys9ceGwvKeyHGNc0YXGgjq5gaoDbxVtndQogVI	1	2025-01-08 13:34:06.556	2025-01-15 13:34:06.554
20	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjM0MzM5OCwiZXhwIjoxNzM2NjAyNTk4fQ.0xK-1Lu3iDnAYpKF3aJKwi0bjYCc0iqYnDUzQz4hsIE	1	2025-01-08 13:36:38.335	2025-01-15 13:36:38.334
21	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjM0Njg3MiwiZXhwIjoxNzM2NjA2MDcyfQ.PxOKLJubUhnfI8b88bR4Mv1UMAYAVxUF_54zbkBOvgg	1	2025-01-08 14:34:32.251	2025-01-15 14:34:32.25
22	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJuaW5qYSIsImlhdCI6MTczNjM0Nzk3OCwiZXhwIjoxNzM2NjA3MTc4fQ.y1vwVXTHX3hzpMrEn41kdFVaLOtomQaERZKdcqDgvCQ	6	2025-01-08 14:52:58.301	2025-01-15 14:52:58.293
23	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjM0ODI0NSwiZXhwIjoxNzM2NjA3NDQ1fQ.ZeF-CmFhxIS8bc4SBaBY1JjJ1cEaDRS8TCQXnwE99No	3	2025-01-08 14:57:25.528	2025-01-15 14:57:25.527
24	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjM0ODI1NiwiZXhwIjoxNzM2NjA3NDU2fQ.jzKzYs6u6SHlZluq-rca46dG2hAyNCmyxjp6l0Oa01o	3	2025-01-08 14:57:36.065	2025-01-15 14:57:36.064
25	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjM0ODI3MSwiZXhwIjoxNzM2NjA3NDcxfQ.QpRao7IViYbdlB3hXVVdIzgF_wbQxC_92w4RIwSZ5qk	3	2025-01-08 14:57:51.941	2025-01-15 14:57:51.938
26	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJuaW5qYSIsImlhdCI6MTczNjM0ODM5NSwiZXhwIjoxNzM2NjA3NTk1fQ.iw9Z5adgqrefQuLyGTXLpr1YWpmlTJSUwYSTj5jRGQE	6	2025-01-08 14:59:55.214	2025-01-15 14:59:55.21
27	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjM1MTI4MiwiZXhwIjoxNzM2NjEwNDgyfQ.SS_zuBURqCbw5AgI7LxCagLMffCM69EAVhFqioEoCak	1	2025-01-08 15:48:02.889	2025-01-15 15:48:02.887
28	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjM2Mjk2MSwiZXhwIjoxNzM2NjIyMTYxfQ.y1fGQCILxbT8wgp5vvBrCudG2wFKMmE2UkVjwlsLqOQ	1	2025-01-08 19:02:41.891	2025-01-15 19:02:41.89
29	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjM2Mjk3OSwiZXhwIjoxNzM2NjIyMTc5fQ.aL316bQvbayscKTZ-E51g--J0Di4TZCtBY5Jotl5Cak	1	2025-01-08 19:02:59.188	2025-01-15 19:02:59.187
30	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjM2MzAxNSwiZXhwIjoxNzM2NjIyMjE1fQ.JGHqtSLdlolzuW4mm5osxt4CaaFYurZ2XbasRXu7sk8	1	2025-01-08 19:03:35.972	2025-01-15 19:03:35.968
32	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjM2MzY1MiwiZXhwIjoxNzM2NjIyODUyfQ.qQlqZKK9uKTCkUdJRyw_UNF_QGBrbEr_IXXeuMXoy9s	1	2025-01-08 19:14:12.023	2025-01-15 19:14:12.022
33	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjM2MzgxNywiZXhwIjoxNzM2NjIzMDE3fQ.T8two3ZYe99uMW0W9sog4jkAekCkKsGpV1bjPkYSURs	1	2025-01-08 19:16:57.134	2025-01-15 19:16:57.133
34	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjM2Mzk0MCwiZXhwIjoxNzM2NjIzMTQwfQ.oabPwxOjdQ8g0dmXtGRxG1iYoEOAAmoz62b5OdOpdEg	1	2025-01-08 19:19:00.534	2025-01-15 19:19:00.533
35	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjM5ODEzNywiZXhwIjoxNzM2NjU3MzM3fQ.8bhza25MqlAUDDsRXRANM4qRyGDob0Q8IYNEtFRd5to	1	2025-01-09 04:48:57.521	2025-01-16 04:48:57.52
36	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjQxNzY2OSwiZXhwIjoxNzM2Njc2ODY5fQ.nykm0fDPKezkLOhINYomFnAMU4Ok2iaUIdM2of9dn7Y	1	2025-01-09 10:14:29.95	2025-01-16 10:14:29.948
69	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjQxNzc4MCwiZXhwIjoxNzM2Njc2OTgwfQ.pujcJMywdmY6V9AddieVKOAAVY2BXEHkWzKfy3xJgNo	1	2025-01-09 10:16:20.809	2025-01-16 10:16:20.808
70	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjgzNzkzOSwiZXhwIjoxNzM3MDk3MTM5fQ.TL2T1UYo9q62oXg8tMz-fKhP-pLsX9louVx7soj5jFY	1	2025-01-14 06:58:59.51	2025-01-21 06:58:59.509
71	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJuaW5qYSIsImlhdCI6MTczNjgzODAwMiwiZXhwIjoxNzM3MDk3MjAyfQ.X-27zdLcTluceQseotQ-cx52oeknrDWSv3P_eK3cltU	6	2025-01-14 07:00:02.866	2025-01-21 07:00:02.865
72	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJuaW5qYSIsImlhdCI6MTczNjgzODY5MiwiZXhwIjoxNzM3MDk3ODkyfQ.V4lRFonZ6Ik1onNMGnLP8t_BwB2wXCeOD-fjXoKJGnA	6	2025-01-14 07:11:32.816	2025-01-21 07:11:32.815
73	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJuaW5qYSIsImlhdCI6MTczNjgzODc1MSwiZXhwIjoxNzM3MDk3OTUxfQ.FjpdUVWPMCigH6RBHt1aw_pfQ6FIRrPxpf7yGMmDDyU	6	2025-01-14 07:12:31.228	2025-01-21 07:12:31.222
74	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJuaW5qYSIsImlhdCI6MTczNjgzODg3MiwiZXhwIjoxNzM3MDk4MDcyfQ.2ZGkNdMmzWry4ewFWrtl3E-3qP1sk223z4p2RuPSK8k	6	2025-01-14 07:14:32.873	2025-01-21 07:14:32.872
75	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJuaW5qYSIsImlhdCI6MTczNjgzODkyMywiZXhwIjoxNzM3MDk4MTIzfQ.BTf7uVr5SSt_kQEwmSndyT85JH6DxoYBgHIUauSQTkQ	6	2025-01-14 07:15:23.754	2025-01-21 07:15:23.752
76	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJuaW5qYSIsImlhdCI6MTczNjgzOTA0NSwiZXhwIjoxNzM3MDk4MjQ1fQ.UQHiKdZYrOa9gcHo1azg6Ci2KcGND8rz3mlOAqlQ22c	6	2025-01-14 07:17:25.28	2025-01-21 07:17:25.279
77	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJuaW5qYSIsImlhdCI6MTczNjgzOTA3OCwiZXhwIjoxNzM3MDk4Mjc4fQ.FbdaQykOq3Eo8dh6QiOQZWwJF_7HclWM8wtAiIAnvJk	6	2025-01-14 07:17:58.13	2025-01-21 07:17:58.129
78	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjgzOTc3MiwiZXhwIjoxNzM3MDk4OTcyfQ.V0nvdAtdwFB6Y8rPzzcd1CqWk1liQujv1gr8FzxtDOI	1	2025-01-14 07:29:32.063	2025-01-21 07:29:32.062
79	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjgzOTgxNywiZXhwIjoxNzM3MDk5MDE3fQ.TOLxjOECkIcZWnMvK5fcASvVqz9BEWXtcuO2R48sCS4	1	2025-01-14 07:30:17.48	2025-01-21 07:30:17.476
80	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjgzOTg1OSwiZXhwIjoxNzM3MDk5MDU5fQ.AYQ15RMuUxzriWydXtYPZhkiWUyRhS9YaePkXlz-pFE	1	2025-01-14 07:30:59.105	2025-01-21 07:30:59.104
81	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjgzOTk5NywiZXhwIjoxNzM3MDk5MTk3fQ.505H-T043EeBdS0d-07ZVutHn4SHeyw_eJQHvo5kll8	1	2025-01-14 07:33:17.503	2025-01-21 07:33:17.479
82	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjkzNTQ1NywiZXhwIjoxNzM3MTk0NjU3fQ.eNCbIeEzZ7uswdWI2TK31StWNRfhWf1AEyqWtg-gSNA	3	2025-01-15 10:04:17.835	2025-01-22 10:04:17.834
83	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhYml5IiwiaWF0IjoxNzM2OTM1NTA2LCJleHAiOjE3MzcxOTQ3MDZ9.hQ7tqkFkaDwwMLUE-73NmFs0Iyk-7_8bxZMj9pL4hU0	2	2025-01-15 10:05:06.752	2025-01-22 10:05:06.751
84	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjkzNTUyOSwiZXhwIjoxNzM3MTk0NzI5fQ.6CIAiIRsrRVeua_T36wKfLUaRO0vMKhhzD_mQE6Op5M	3	2025-01-15 10:05:29.771	2025-01-22 10:05:29.77
85	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjkzNTU0NSwiZXhwIjoxNzM3MTk0NzQ1fQ.9ZrAr0LPdnmzkRKafJm4r4sutiTxX1g3TwVIkzY7L3M	3	2025-01-15 10:05:45.745	2025-01-22 10:05:45.744
86	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjkzNTU2MiwiZXhwIjoxNzM3MTk0NzYyfQ.3Pive2hul9rpxFNI9yG_9Qy2w4AQjorHSy04fy6RIGU	3	2025-01-15 10:06:02.284	2025-01-22 10:06:02.278
87	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjkzNTU3NywiZXhwIjoxNzM3MTk0Nzc3fQ.aB4k-67bGr88diaNjnEHHM6QzTQUe2wDOqcsux1uhFA	3	2025-01-15 10:06:17.363	2025-01-22 10:06:17.362
88	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjkzNTg5OCwiZXhwIjoxNzM3MTk1MDk4fQ.fiTZ7YkGrM7VFiw4ZtwTJNb-ezPFBFpjtiEPV0KMHpg	3	2025-01-15 10:11:38.176	2025-01-22 10:11:38.175
89	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjkzNTkyMCwiZXhwIjoxNzM3MTk1MTIwfQ.r4DzaRhSOIYNV7A08yTc4Ye3Mzuq0p7KQQxDdUlQYpw	3	2025-01-15 10:12:00.797	2025-01-22 10:12:00.796
90	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjkzNTkzMiwiZXhwIjoxNzM3MTk1MTMyfQ.fvKmKz01hShG9Tp_YblfLgbcy6stZdyT6V1YVYcAyoY	3	2025-01-15 10:12:12.573	2025-01-22 10:12:12.572
91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjkzNTk1NywiZXhwIjoxNzM3MTk1MTU3fQ.0u3nnvZoJfbzaVjkPuenjBmjcPI7pGuhEpGwV6oh9NA	3	2025-01-15 10:12:37.311	2025-01-22 10:12:37.31
92	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjkzNjE4NiwiZXhwIjoxNzM3MTk1Mzg2fQ.02NzUcCrDh4zWtbSrhKxFX1sHqv_RHEA9j86bisGeUU	3	2025-01-15 10:16:26.614	2025-01-22 10:16:26.613
93	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjkzNjQyNCwiZXhwIjoxNzM3MTk1NjI0fQ.lSvaSRGM-Gosbb9WCGR0aMCpIcgc3O9MCAqZuNngytE	3	2025-01-15 10:20:24.583	2025-01-22 10:20:24.582
94	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJuaW5qYSIsImlhdCI6MTczNjkzNjQ0NywiZXhwIjoxNzM3MTk1NjQ3fQ.7psfy_1FNKYWwrGHU3RiWTcsGWOJD5yG-kqb-KL6lG8	6	2025-01-15 10:20:47.933	2025-01-22 10:20:47.932
95	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJuaW5qYSIsImlhdCI6MTczNjkzNjY3NywiZXhwIjoxNzM3MTk1ODc3fQ.WDek3ID6G6BbKdFEOdMT-9lQ46qpIQMVs7Vwu77PwtU	6	2025-01-15 10:24:37.494	2025-01-22 10:24:37.493
96	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbjEyMyIsImlhdCI6MTczNjkzNjgzMCwiZXhwIjoxNzM3MTk2MDMwfQ.fZNw0w2Tk518RW1VG2b_V2DPZThB7MrgNybANxQwPkE	3	2025-01-15 10:27:10.889	2025-01-22 10:27:10.888
97	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjk0Njc1MywiZXhwIjoxNzM3MjA1OTUzfQ.WTJxm66xhjUdRSK5OmOIeWk7LiUTjPAmJjYDeZiwz6Q	1	2025-01-15 13:12:33.189	2025-01-22 13:12:33.188
98	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjk0Nzk2NywiZXhwIjoxNzM3MjA3MTY3fQ.oMRgdEJJ0c6a1lWYGTglPotxTHLBXfQd8Fgmnajx9XU	1	2025-01-15 13:32:47.391	2025-01-22 13:32:47.39
99	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjk0ODAzNiwiZXhwIjoxNzM3MjA3MjM2fQ.KMUVLplcg7Gb0rUhJCx6SSEh43bMzX6Oy5t3rLQCr3c	1	2025-01-15 13:33:56.054	2025-01-22 13:33:56.052
100	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjk0OTA5OCwiZXhwIjoxNzM3MjA4Mjk4fQ.v20pRMYG7PbPE97B8dtCm9cUuDuihrpMlsSxJygBRF8	1	2025-01-15 13:51:38.188	2025-01-22 13:51:38.186
101	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjk0OTYyNCwiZXhwIjoxNzM3MjA4ODI0fQ.5N-mlAE2DumgN-uQCuN-MXU4F_I4O925f6wSThBdcSI	8	2025-01-15 14:00:24.928	2025-01-22 14:00:24.926
102	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJibGFuayIsImlhdCI6MTczNjk0OTk0MSwiZXhwIjoxNzM3MjA5MTQxfQ.5S2zEV6YMW9l2BjGjv7ntUyfsKS777QeK1s6IDgIsU4	8	2025-01-15 14:05:41.048	2025-01-22 14:05:41.046
104	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJibGFuazEiLCJpYXQiOjE3MzY5NTExNTMsImV4cCI6MTczNzIxMDM1M30.hhQ_Gi3LIaj6q9xCwWHF1WyMgfimWY8Z_-IrjGWIpG0	8	2025-01-15 14:25:53.805	2025-01-22 14:25:53.803
\.


--
-- Data for Name: Stake; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Stake" (id, amount) FROM stdin;
1	10.000000000000000000000000000000
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transaction" (id, event, first_name, last_name, email, username, mobile, currency, amount, charge, status, failure_reason, mode, reference, created_at, updated_at, type, tx_ref, payment_method, customization, meta, "userWalletUpdated", "userId") FROM stdin;
1	charge.success	\N	\N	\N	blank	0944317241	ETB	1203.000000000000000000000000000000	42.110000000000000000000000000000	success	\N	test	APEb2wjVZCm8O	2025-01-15 14:16:03	2025-01-15 14:16:03	Deposit	ref-1736950552054	test	{"logo": null, "title": "AEAB Deposit", "description": "User deposit transaction"}	null	t	8
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "phoneNumber", username, password, wallet, "referredBy", "referredCount", "referralBonus", "registrationDate", "referralCode", verified, otp, email, role) FROM stdin;
2	0901020304	abiy	$2a$10$Ur8hd/KnvLir.14IW8HYJeoat23L68P2rMEF33OkwckEyfUepke4K	10.000000000000000000000000000000	\N	0	0.000000000000000000000000000000	2025-01-07 21:51:43.398	iCvF	t	1234000	admin@gmail.com	ADMIN
3	0902050606	admin123	$2a$10$Sf4HbH6rkrKM4Ex42WR/V.I5nnQ3BdUFqdg7gUlJnbzKZ.zePAADy	10.000000000000000000000000000000	\N	0	0.000000000000000000000000000000	2025-01-07 21:53:28.797	98HZ	t	1234000	abiy@gmail.com	ADMIN
4	0900000203	test	$2a$10$kG80sYbGtKE73VGigIt3ZuNLcEmGt2hsKI5hPOzQF/fpwg7XYdooy	10.000000000000000000000000000000	\N	0	0.000000000000000000000000000000	2025-01-08 07:45:55.821	765949	f	691322	\N	USER
6	0907372164	ninja	$2a$10$baoF4Mmj.SVbeTSKPU0gsuiQMSicAn8PJiZvJa7XWZBNbID1HZtaC	1000.000000000000000000000000000000	\N	0	0.000000000000000000000000000000	2025-01-08 14:52:22.983	134276	t	633773	\N	USER
7	0936694957	slave	$2a$10$Gll9IhUmRUvVzvQNv3jDNuqTOpCdsxOTLTlHKzJItXPdMR/rrdi6a	10.000000000000000000000000000000	\N	0	0.000000000000000000000000000000	2025-01-14 06:35:54.709	879934	f	731787	\N	USER
8	0944317241	blank	$2a$10$DH370fgoxkusbxxx0hVGGuc442R0daCmHJMA5eJ7yKEm10ewMR0SK	1213.000000000000000000000000000000	\N	0	0.000000000000000000000000000000	2025-01-15 13:59:50.115	205415	t	635196	\N	USER
\.


--
-- Data for Name: UserBingoCard; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserBingoCard" ("userId", "gameId", "createdAt", "cardId", "markedNumbers", "autoPlay") FROM stdin;
6	2	2025-01-08 15:06:49.978	12	100,36,51,67,18,65,33,47,24,4,66,2,45,17,9,63	t
6	1	2025-01-08 15:00:16.445	5	100,2,75,16,12,1,17,45,41,25,49,65,57,24	t
\.


--
-- Data for Name: UserStatistics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserStatistics" (id, "userId", "gamesPlayed", "gamesWon", "gamesLost", "amountWon", "dailyStats", "weeklyStats", "monthlyStats", "yearlyStats", "updatedAt") FROM stdin;
2	4	0	0	0	0	{}	{}	{}	{}	2025-01-08 07:45:55.821
4	6	2	1	1	16	{"gamesWon": 1, "amountWon": 16, "gamesLost": 1, "gamesPlayed": 2}	{"gamesWon": 1, "amountWon": 16, "gamesLost": 1, "gamesPlayed": 2}	{"gamesWon": 1, "amountWon": 16, "gamesLost": 1, "gamesPlayed": 2}	{"gamesWon": 1, "amountWon": 16, "gamesLost": 1, "gamesPlayed": 2}	2025-01-08 15:10:15.801
9	7	0	0	0	0	{}	{}	{}	{}	2025-01-14 06:35:54.709
10	8	0	0	0	0	{}	{}	{}	{}	2025-01-15 13:59:50.115
\.


--
-- Data for Name: Winner; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Winner" (id, "userId", "bonusPeriodId", "amountWon", rank, "prizeGiven", "createdAt", "prizeGivenDate") FROM stdin;
\.


--
-- Data for Name: _GameStakes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_GameStakes" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _UserGamesLost; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_UserGamesLost" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _UserGamesPlayed; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_UserGamesPlayed" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _UserGamesWon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_UserGamesWon" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e4454926-e2e5-456f-a6a8-a1f94c1962da	5f396cbbc2b0feb29d0d3601fe9db43ac77e20024aa8f2ad776a61792c7c6fda	2025-01-07 21:39:45.656463+00	20241018145233_multiple_winners	\N	\N	2025-01-07 21:39:45.641804+00	1
5ad702da-87f6-42d9-8f6d-0fc3909934f5	1d21abd907a79fd5a9fc533fce69627284438a56c8972acd952dda7abe6d2821	2025-01-07 21:39:44.671612+00	20240918150235_init	\N	\N	2025-01-07 21:39:44.445727+00	1
66a713cc-52fa-4efb-a448-e36f2d674d8a	5726b8c11c9cfe1a2010f4cb4418292acfee422b9385eb44c27d2f3989339910	2025-01-07 21:39:45.204664+00	20240930145837_update_user_bingo_card	\N	\N	2025-01-07 21:39:45.190164+00	1
2dac8de9-5f54-4229-a079-3eaa911d7963	af1618d0b6dac94f2122f76b4e8f36c49d338d41d7c9f402316b619b057fcbf1	2025-01-07 21:39:44.69275+00	20240919070408_wallet_field_added_to_user	\N	\N	2025-01-07 21:39:44.680796+00	1
552660a7-daae-4a5c-b05e-2d6e14b8da73	abdbe69c9f9764f439ec885e354efb392bb4b0475ae79c2932a499b836e8bd2b	2025-01-07 21:39:44.72857+00	20240919102212_game_model_created	\N	\N	2025-01-07 21:39:44.696844+00	1
4cc70498-7f3d-49da-bb75-b6ef94f26feb	f4743db8690f63a5a62dc525ee317ff86ac50e721fb8eeb4daf49bbda8094d27	2025-01-07 21:39:45.425392+00	20241004112136_user_statistics_naming	\N	\N	2025-01-07 21:39:45.398234+00	1
6418ab9d-4f55-4623-9f74-8b638783408f	0dadd6e7cf2e2de0969ba2114b6f67ddbf5434e6f75a56e4b661784b0e0b247b	2025-01-07 21:39:44.765061+00	20240919104331_game_model_update	\N	\N	2025-01-07 21:39:44.742052+00	1
ae31ad36-68d7-4928-aea5-182eac25037f	ad57b820dc3b865b97fa8da2715177eb117653e7b6c86786226ed3c69f37cd53	2025-01-07 21:39:45.223893+00	20240930153411_update	\N	\N	2025-01-07 21:39:45.208999+00	1
b32b4d3d-5299-426f-87f4-9842b297a588	a5167cae51e727260297f3c85a9dd27a9c86c99e55f763e9d52080e546a383e8	2025-01-07 21:39:44.88617+00	20240919141850_bingo_game_models_done	\N	\N	2025-01-07 21:39:44.771658+00	1
cdfaa8dc-c68f-4502-b61c-53890dacd4cb	26b516e98cb0781b22d90f5ce703ca24f41e6339efd13c341567dc4039cc7079	2025-01-07 21:39:44.915561+00	20240924095915_user_update	\N	\N	2025-01-07 21:39:44.891578+00	1
8b61960c-e899-4953-85d7-71adfb263ebc	b12df387b23403a62dbb467e115cee323f6b96b194565f8d83f939528459592c	2025-01-07 21:39:44.957972+00	20240924142613_update	\N	\N	2025-01-07 21:39:44.919775+00	1
c67cb776-6c1e-4060-9ff6-e86d28f3be38	142706d689285355db318afbc098812f1419fedc124b9bd4ea5a76b67a30deee	2025-01-07 21:39:45.244213+00	20240930160412_y	\N	\N	2025-01-07 21:39:45.227083+00	1
8a1060a4-97d6-437a-823a-382031803325	e21b0503679d913bf3a5524f971f314107363aeb02e7f2a7db9de18a68215701	2025-01-07 21:39:44.990563+00	20240924162738_bingo_card_relationship_with_user_bingo_card	\N	\N	2025-01-07 21:39:44.963731+00	1
1e088145-758e-46a2-b1e1-fe37e6085e88	00ef33d55038ca8d6abc4d365a49386109083be4faac77e432063c88b35c940a	2025-01-07 21:39:45.064634+00	20240924164543_update	\N	\N	2025-01-07 21:39:44.994473+00	1
185cca87-f30b-4107-9400-1f7d68fd5451	f5491cb36973eb753e11d245c46763493e22432c6170b39e8dc0494aef78e178	2025-01-07 21:39:45.539848+00	20241011084824_referral	\N	\N	2025-01-07 21:39:45.529631+00	1
c00bf5a5-f687-4ba2-9319-66f81584fabb	e21b0503679d913bf3a5524f971f314107363aeb02e7f2a7db9de18a68215701	2025-01-07 21:39:45.107434+00	20240924165447_update	\N	\N	2025-01-07 21:39:45.078509+00	1
d4905cb5-34ec-4cd4-8a64-7e6d9e711666	abbb1c39c9e7550baee5885bcc7f452bd67879131f6bba2f78e30e25a523413b	2025-01-07 21:39:45.266772+00	20241002111422_bingo_game_update	\N	\N	2025-01-07 21:39:45.251374+00	1
4832086b-4444-4aaf-bdf6-7f29c990837b	f6e9f5311dd7847dceb4cb03da51cf815aeb6749a408a981d551e541ad38e313	2025-01-07 21:39:45.140243+00	20240926174410_bingo_card_assigned_card_ids	\N	\N	2025-01-07 21:39:45.112212+00	1
245db587-2842-4a44-a8ff-a774d2e61364	9c72fbd94f1b9e3ab8208a558737b6b774e0d80fed3f71e20e0b94d10882531d	2025-01-07 21:39:45.156603+00	20240926181138_nn	\N	\N	2025-01-07 21:39:45.142669+00	1
03846c38-c63e-4df2-91d4-1e6e105a27e8	18efaddf37982c4e0877d738c04d5b77b62a2349cd4b0b58e9c69bd32c8c8832	2025-01-07 21:39:45.456967+00	20241004115550_	\N	\N	2025-01-07 21:39:45.430039+00	1
8485e182-7208-4955-a55e-bada038ca7ef	3928d8c1c4ebb39e56c97854be64f485d193e1bcc24a52548f6e695d2d8f6b47	2025-01-07 21:39:45.185803+00	20240926181238_bingo_card	\N	\N	2025-01-07 21:39:45.159314+00	1
cd33e07e-90bf-44cc-b37f-1cb32de47544	21a532cd3eb53a6fcac56b504f791b683e1344f224b54e693e9e465d50a6b07f	2025-01-07 21:39:45.28314+00	20241002112325_bingo_update	\N	\N	2025-01-07 21:39:45.270397+00	1
fe043e49-eab9-4b4b-b8a1-1e7c4e914c18	f4bf39201b1cbfb9bb002a3f51927ca5e28f2e8d8736a8f1142f03e77c825a79	2025-01-07 21:39:45.296532+00	20241002121149_bingo_update	\N	\N	2025-01-07 21:39:45.286227+00	1
40489c73-6f00-4749-96e8-c13f2f9b4037	03ed90379d40d3f0a6db3b8fc60964535be229b91cb9425e0aab4abf3911569c	2025-01-07 21:39:45.315904+00	20241004090650_q	\N	\N	2025-01-07 21:39:45.299905+00	1
dadd2c19-7f5a-4e81-88c8-86a367aa3400	7fd5fbbae9538ffb214aa15c73bd4828e787db119945d521fd5a04d6514513f7	2025-01-07 21:39:45.4796+00	20241004124239_	\N	\N	2025-01-07 21:39:45.460862+00	1
3a5dba74-89ab-4640-83e8-36dfea06c8a6	2414fae2a395d6038a33546b65f6d5a5058db24ccd2c83a8797197ff1be0018b	2025-01-07 21:39:45.370821+00	20241004101432_	\N	\N	2025-01-07 21:39:45.318144+00	1
bc99f5a8-82db-4531-983e-1389c9a1310d	0377e5356ffd75b49fdafb1dcecfc267fad632f85087097976de0aab2fd37797	2025-01-07 21:39:45.395507+00	20241004110454_	\N	\N	2025-01-07 21:39:45.37406+00	1
f4314220-a49d-4f1b-9363-485da0e52b62	9793ec845c2ba64683987ab82f223c58c3ca68ad2237f567a44ab0718e823c3d	2025-01-07 21:39:45.603263+00	20241014073033_roles	\N	\N	2025-01-07 21:39:45.586233+00	1
392b1abe-d86b-4327-8e83-14c8c0b47cf5	5657a1eb6a71a9530df7285f84e04971b44234d8e6acce1a3f779544d6c7b1e8	2025-01-07 21:39:45.491866+00	20241010174002_drawn_numbers	\N	\N	2025-01-07 21:39:45.482069+00	1
b9723982-d472-45ee-aba2-85661dd91e48	9d868f391750c8064360eb567379c80e3b5acef5a6fbd000165198395cb8ef63	2025-01-07 21:39:45.556502+00	20241011085715_referral_code	\N	\N	2025-01-07 21:39:45.542762+00	1
80958407-4af6-40d9-a1b4-ad9ba5201d5b	529d816a715a9798d51d4afaea01d7ce708e5f27d8b37c755413b61c6928886d	2025-01-07 21:39:45.512545+00	20241011084124_referral	\N	\N	2025-01-07 21:39:45.494546+00	1
bc4ccd28-e310-43b3-a54c-1f1c9224c26f	7dd2b329ab52b2b7bbb174bacec62dfafbba07efc9f533997bfebe439d06dbc4	2025-01-07 21:39:45.527581+00	20241011084223_referral	\N	\N	2025-01-07 21:39:45.514776+00	1
6fa87b09-6875-47e3-baa0-ac225d55271d	fac25dcc296dace2dde023f15ba651b6fb6a01e99962f9ca346cb10eace023b4	2025-01-07 21:39:45.566692+00	20241011135123_verified	\N	\N	2025-01-07 21:39:45.559262+00	1
1423b1f0-586c-4007-8d06-472645845df1	b7e301c02a7527e9ab8a8fc49b8a7d8f3545a3152a6bf4c8ae6a1c357da949c5	2025-01-07 21:39:45.581401+00	20241011135553_otp	\N	\N	2025-01-07 21:39:45.569709+00	1
29d8a997-cf96-46e7-9386-47380df1469a	3a728e5f81f50100bff6c9538911055e459115675a30106a1cde415c3b3aa89a	2025-01-07 21:39:45.638131+00	20241018122033_refresh_token	\N	\N	2025-01-07 21:39:45.605711+00	1
caabe120-d87c-4eb5-8cf9-6c8551ac04eb	0d2f135782d8484014443a36e15a13abba1c9bd8c4781f0319d6f79dc260b282	2025-01-07 21:39:45.719076+00	20241019150536_	\N	\N	2025-01-07 21:39:45.695673+00	1
3faa163f-6034-4905-8a4c-d005092593d3	124e92507f119db908f5c5e26f777d712210288b58a4d2bc5e124212ee262c99	2025-01-07 21:39:45.692818+00	20241019084052_bps	\N	\N	2025-01-07 21:39:45.660075+00	1
d4f02c9d-ea87-4c75-a83e-d1ce89310db3	a049bc25022b2bd65028c43b2c4dda7eda4cdb89f7a7a409464c55e8c640d15b	2025-01-07 21:39:45.744496+00	20241021112406_date_in_amh_field_bonus_period	\N	\N	2025-01-07 21:39:45.723292+00	1
8f90d08b-a4e4-41e7-926d-e987ca59ac48	512d9782bb48aff9b9fc4c9689fcfd9b6ef144feee7dcb67d479425eff83c9b8	2025-01-07 21:39:45.783038+00	20241021151631_jackpot	\N	\N	2025-01-07 21:39:45.75002+00	1
6754457a-4149-41c2-88f1-882ea1144837	1109a9f578b93e13ba0557532e7722f3090cdc6f44d43a5654d0163727ea6ec1	2025-01-07 21:39:45.80864+00	20241021151928_jackpot	\N	\N	2025-01-07 21:39:45.789492+00	1
b922e70e-ceba-47bf-afc4-78309f4bf0c2	4097cd4248ebcb64e4713594c138e37333995142f562ecb8afc132701633fcff	2025-01-07 21:39:45.843177+00	20250103081026_transaction	\N	\N	2025-01-07 21:39:45.811922+00	1
248d4a01-8000-4983-8699-3a5883f00ff6	2ec61b4a30f4dca8ec29418abf1454fd4a8e9d8ba7469f3241417678c64a7789	2025-01-07 21:39:45.863799+00	20250104172101_bps_update	\N	\N	2025-01-07 21:39:45.846665+00	1
fb64dc28-9c88-4987-8a5e-d025e2d08a02	f990dd78ea0b9e848f0a8b6154c4b27f83488b35ed62447d366214484e645fe8	2025-01-07 21:39:45.888122+00	20250105064142_	\N	\N	2025-01-07 21:39:45.867596+00	1
b701db66-fd81-4f3f-a980-d7b8791cda35	3ccfcc210284ce3ab70d4dcabd546d3ba9e8d1e4d74baed428cf4f4a798aee96	2025-01-15 13:30:58.37045+00	20250108172839_transaction_update	\N	\N	2025-01-15 13:30:58.318218+00	1
\.


--
-- Name: BingoCard_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."BingoCard_id_seq"', 200, true);


--
-- Name: BingoGame_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."BingoGame_id_seq"', 12, true);


--
-- Name: BonusPeriod_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."BonusPeriod_id_seq"', 1, false);


--
-- Name: BonusPoint_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."BonusPoint_id_seq"', 1, false);


--
-- Name: Game_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Game_id_seq"', 1, true);


--
-- Name: Prize_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Prize_id_seq"', 1, false);


--
-- Name: ReferredUser_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReferredUser_id_seq"', 1, false);


--
-- Name: RefreshToken_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."RefreshToken_id_seq"', 104, true);


--
-- Name: Stake_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Stake_id_seq"', 1, true);


--
-- Name: Transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Transaction_id_seq"', 1, true);


--
-- Name: UserStatistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserStatistics_id_seq"', 10, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 8, true);


--
-- Name: Winner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Winner_id_seq"', 1, false);


--
-- Name: BingoCard BingoCard_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BingoCard"
    ADD CONSTRAINT "BingoCard_pkey" PRIMARY KEY (id);


--
-- Name: BingoGame BingoGame_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BingoGame"
    ADD CONSTRAINT "BingoGame_pkey" PRIMARY KEY (id);


--
-- Name: BonusPeriod BonusPeriod_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BonusPeriod"
    ADD CONSTRAINT "BonusPeriod_pkey" PRIMARY KEY (id);


--
-- Name: BonusPoint BonusPoint_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BonusPoint"
    ADD CONSTRAINT "BonusPoint_pkey" PRIMARY KEY (id);


--
-- Name: Game Game_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_pkey" PRIMARY KEY (id);


--
-- Name: Prize Prize_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prize"
    ADD CONSTRAINT "Prize_pkey" PRIMARY KEY (id);


--
-- Name: ReferredUser ReferredUser_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReferredUser"
    ADD CONSTRAINT "ReferredUser_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: Stake Stake_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Stake"
    ADD CONSTRAINT "Stake_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: UserBingoCard UserBingoCard_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserBingoCard"
    ADD CONSTRAINT "UserBingoCard_pkey" PRIMARY KEY ("userId", "gameId", "cardId");


--
-- Name: UserStatistics UserStatistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserStatistics"
    ADD CONSTRAINT "UserStatistics_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Winner Winner_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Winner"
    ADD CONSTRAINT "Winner_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: BonusPeriod_startDate_endDate_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "BonusPeriod_startDate_endDate_type_key" ON public."BonusPeriod" USING btree ("startDate", "endDate", type);


--
-- Name: BonusPoint_userId_bonusPeriodId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "BonusPoint_userId_bonusPeriodId_key" ON public."BonusPoint" USING btree ("userId", "bonusPeriodId");


--
-- Name: Game_title_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Game_title_key" ON public."Game" USING btree (title);


--
-- Name: Prize_bonusPeriodId_rank_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Prize_bonusPeriodId_rank_key" ON public."Prize" USING btree ("bonusPeriodId", rank);


--
-- Name: RefreshToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RefreshToken_token_key" ON public."RefreshToken" USING btree (token);


--
-- Name: RefreshToken_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshToken_userId_idx" ON public."RefreshToken" USING btree ("userId");


--
-- Name: Transaction_reference_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Transaction_reference_key" ON public."Transaction" USING btree (reference);


--
-- Name: Transaction_tx_ref_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Transaction_tx_ref_key" ON public."Transaction" USING btree (tx_ref);


--
-- Name: UserBingoCard_userId_gameId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserBingoCard_userId_gameId_key" ON public."UserBingoCard" USING btree ("userId", "gameId");


--
-- Name: UserStatistics_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserStatistics_userId_key" ON public."UserStatistics" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_phoneNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_phoneNumber_key" ON public."User" USING btree ("phoneNumber");


--
-- Name: User_referralCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_referralCode_key" ON public."User" USING btree ("referralCode");


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Winner_userId_bonusPeriodId_rank_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Winner_userId_bonusPeriodId_rank_key" ON public."Winner" USING btree ("userId", "bonusPeriodId", rank);


--
-- Name: _GameStakes_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_GameStakes_AB_unique" ON public."_GameStakes" USING btree ("A", "B");


--
-- Name: _GameStakes_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_GameStakes_B_index" ON public."_GameStakes" USING btree ("B");


--
-- Name: _UserGamesLost_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_UserGamesLost_AB_unique" ON public."_UserGamesLost" USING btree ("A", "B");


--
-- Name: _UserGamesLost_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_UserGamesLost_B_index" ON public."_UserGamesLost" USING btree ("B");


--
-- Name: _UserGamesPlayed_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_UserGamesPlayed_AB_unique" ON public."_UserGamesPlayed" USING btree ("A", "B");


--
-- Name: _UserGamesPlayed_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_UserGamesPlayed_B_index" ON public."_UserGamesPlayed" USING btree ("B");


--
-- Name: _UserGamesWon_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_UserGamesWon_AB_unique" ON public."_UserGamesWon" USING btree ("A", "B");


--
-- Name: _UserGamesWon_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_UserGamesWon_B_index" ON public."_UserGamesWon" USING btree ("B");


--
-- Name: BingoGame BingoGame_stakeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BingoGame"
    ADD CONSTRAINT "BingoGame_stakeId_fkey" FOREIGN KEY ("stakeId") REFERENCES public."Stake"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BonusPoint BonusPoint_bonusPeriodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BonusPoint"
    ADD CONSTRAINT "BonusPoint_bonusPeriodId_fkey" FOREIGN KEY ("bonusPeriodId") REFERENCES public."BonusPeriod"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BonusPoint BonusPoint_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BonusPoint"
    ADD CONSTRAINT "BonusPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Prize Prize_bonusPeriodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prize"
    ADD CONSTRAINT "Prize_bonusPeriodId_fkey" FOREIGN KEY ("bonusPeriodId") REFERENCES public."BonusPeriod"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReferredUser ReferredUser_referrerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReferredUser"
    ADD CONSTRAINT "ReferredUser_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserBingoCard UserBingoCard_cardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserBingoCard"
    ADD CONSTRAINT "UserBingoCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES public."BingoCard"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserBingoCard UserBingoCard_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserBingoCard"
    ADD CONSTRAINT "UserBingoCard_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."BingoGame"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserBingoCard UserBingoCard_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserBingoCard"
    ADD CONSTRAINT "UserBingoCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserStatistics UserStatistics_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserStatistics"
    ADD CONSTRAINT "UserStatistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Winner Winner_bonusPeriodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Winner"
    ADD CONSTRAINT "Winner_bonusPeriodId_fkey" FOREIGN KEY ("bonusPeriodId") REFERENCES public."BonusPeriod"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Winner Winner_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Winner"
    ADD CONSTRAINT "Winner_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _GameStakes _GameStakes_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_GameStakes"
    ADD CONSTRAINT "_GameStakes_A_fkey" FOREIGN KEY ("A") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _GameStakes _GameStakes_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_GameStakes"
    ADD CONSTRAINT "_GameStakes_B_fkey" FOREIGN KEY ("B") REFERENCES public."Stake"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserGamesLost _UserGamesLost_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserGamesLost"
    ADD CONSTRAINT "_UserGamesLost_A_fkey" FOREIGN KEY ("A") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserGamesLost _UserGamesLost_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserGamesLost"
    ADD CONSTRAINT "_UserGamesLost_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserGamesPlayed _UserGamesPlayed_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserGamesPlayed"
    ADD CONSTRAINT "_UserGamesPlayed_A_fkey" FOREIGN KEY ("A") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserGamesPlayed _UserGamesPlayed_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserGamesPlayed"
    ADD CONSTRAINT "_UserGamesPlayed_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserGamesWon _UserGamesWon_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserGamesWon"
    ADD CONSTRAINT "_UserGamesWon_A_fkey" FOREIGN KEY ("A") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserGamesWon _UserGamesWon_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserGamesWon"
    ADD CONSTRAINT "_UserGamesWon_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

