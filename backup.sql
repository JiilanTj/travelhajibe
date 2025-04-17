--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Ubuntu 14.17-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.17 (Ubuntu 14.17-0ubuntu0.22.04.1)

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: enum_AgentDocuments_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_AgentDocuments_status" AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public."enum_AgentDocuments_status" OWNER TO postgres;

--
-- Name: enum_AgentDocuments_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_AgentDocuments_type" AS ENUM (
    'KTP',
    'NPWP',
    'SIUP',
    'TDP',
    'OTHER'
);


ALTER TYPE public."enum_AgentDocuments_type" OWNER TO postgres;

--
-- Name: enum_AgentPayouts_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_AgentPayouts_status" AS ENUM (
    'PENDING',
    'PROCESSED',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."enum_AgentPayouts_status" OWNER TO postgres;

--
-- Name: enum_ChatRooms_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_ChatRooms_type" AS ENUM (
    'PRIVATE',
    'BROADCAST'
);


ALTER TYPE public."enum_ChatRooms_type" OWNER TO postgres;

--
-- Name: enum_CommissionPayments_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_CommissionPayments_status" AS ENUM (
    'PENDING',
    'PROCESS',
    'DONE',
    'REJECTED'
);


ALTER TYPE public."enum_CommissionPayments_status" OWNER TO postgres;

--
-- Name: enum_Commissions_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Commissions_status" AS ENUM (
    'PENDING',
    'APPROVED',
    'PAID',
    'REJECTED'
);


ALTER TYPE public."enum_Commissions_status" OWNER TO postgres;

--
-- Name: enum_Documents_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Documents_status" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."enum_Documents_status" OWNER TO postgres;

--
-- Name: enum_Documents_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Documents_type" AS ENUM (
    'KTP',
    'PASSPORT',
    'KK',
    'FOTO',
    'VAKSIN',
    'BUKU_NIKAH',
    'IJAZAH'
);


ALTER TYPE public."enum_Documents_type" OWNER TO postgres;

--
-- Name: enum_Messages_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Messages_type" AS ENUM (
    'TEXT',
    'IMAGE',
    'FILE',
    'BROADCAST'
);


ALTER TYPE public."enum_Messages_type" OWNER TO postgres;

--
-- Name: enum_Packages_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Packages_type" AS ENUM (
    'HAJI',
    'UMROH'
);


ALTER TYPE public."enum_Packages_type" OWNER TO postgres;

--
-- Name: enum_Payments_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Payments_status" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'CANCELLED',
    'EXPIRED',
    'VERIFYING'
);


ALTER TYPE public."enum_Payments_status" OWNER TO postgres;

--
-- Name: enum_Payments_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Payments_type" AS ENUM (
    'DP',
    'INSTALLMENT',
    'FULL_PAYMENT'
);


ALTER TYPE public."enum_Payments_type" OWNER TO postgres;

--
-- Name: enum_Registrations_mahramStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Registrations_mahramStatus" AS ENUM (
    'SUAMI',
    'AYAH',
    'KAKAK',
    'ADIK',
    'ANAK'
);


ALTER TYPE public."enum_Registrations_mahramStatus" OWNER TO postgres;

--
-- Name: enum_Registrations_roomType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Registrations_roomType" AS ENUM (
    'SINGLE',
    'DOUBLE',
    'TRIPLE',
    'QUAD',
    'TENT_A',
    'TENT_B',
    'DORMITORY'
);


ALTER TYPE public."enum_Registrations_roomType" OWNER TO postgres;

--
-- Name: enum_Registrations_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Registrations_status" AS ENUM (
    'DRAFT',
    'WAITING_PAYMENT',
    'DOCUMENT_REVIEW',
    'DOCUMENT_REJECTED',
    'APPROVED',
    'CANCELLED',
    'COMPLETED'
);


ALTER TYPE public."enum_Registrations_status" OWNER TO postgres;

--
-- Name: enum_Users_bloodType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Users_bloodType" AS ENUM (
    'A',
    'B',
    'AB',
    'O'
);


ALTER TYPE public."enum_Users_bloodType" OWNER TO postgres;

--
-- Name: enum_Users_gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Users_gender" AS ENUM (
    'MALE',
    'FEMALE'
);


ALTER TYPE public."enum_Users_gender" OWNER TO postgres;

--
-- Name: enum_Users_maritalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Users_maritalStatus" AS ENUM (
    'SINGLE',
    'MARRIED',
    'DIVORCED',
    'WIDOWED'
);


ALTER TYPE public."enum_Users_maritalStatus" OWNER TO postgres;

--
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'SUPERADMIN',
    'ADMIN',
    'AGEN',
    'MARKETING',
    'JAMAAH'
);


ALTER TYPE public."enum_Users_role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AgentTiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AgentTiers" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    "baseCommissionRate" numeric(4,2) NOT NULL,
    "minimumJamaah" integer NOT NULL,
    "bonusRate" numeric(4,2),
    benefits json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."AgentTiers" OWNER TO postgres;

--
-- Name: ChatMembers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatMembers" (
    id uuid NOT NULL,
    "roomId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "lastReadAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ChatMembers" OWNER TO postgres;

--
-- Name: ChatRooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatRooms" (
    id uuid NOT NULL,
    type public."enum_ChatRooms_type" NOT NULL,
    "lastMessageAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ChatRooms" OWNER TO postgres;

--
-- Name: CommissionPayments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CommissionPayments" (
    id uuid NOT NULL,
    "agentId" uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public."enum_CommissionPayments_status" DEFAULT 'PENDING'::public."enum_CommissionPayments_status",
    "paymentMethod" character varying(255),
    "bankName" character varying(255),
    "accountNumber" character varying(255),
    "accountName" character varying(255),
    "processedBy" uuid,
    "processedAt" timestamp with time zone,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CommissionPayments" OWNER TO postgres;

--
-- Name: Commissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Commissions" (
    id uuid NOT NULL,
    "agentId" uuid NOT NULL,
    "registrationId" uuid NOT NULL,
    "packagePrice" numeric(10,2) NOT NULL,
    "commissionRate" numeric(4,2) NOT NULL,
    "commissionAmount" numeric(10,2) NOT NULL,
    status public."enum_Commissions_status" DEFAULT 'PENDING'::public."enum_Commissions_status",
    "paidAt" timestamp with time zone,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "jamaahId" uuid,
    "packageId" uuid,
    "paymentRequestId" uuid
);


ALTER TABLE public."Commissions" OWNER TO postgres;

--
-- Name: Documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Documents" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    type public."enum_Documents_type" NOT NULL,
    number character varying(255),
    "expiryDate" timestamp with time zone,
    file character varying(255) NOT NULL,
    status public."enum_Documents_status" DEFAULT 'PENDING'::public."enum_Documents_status",
    "rejectionReason" text,
    "verifiedBy" uuid,
    "verifiedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "registrationId" uuid
);


ALTER TABLE public."Documents" OWNER TO postgres;

--
-- Name: Messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Messages" (
    id uuid NOT NULL,
    "roomId" uuid NOT NULL,
    "senderId" uuid NOT NULL,
    type public."enum_Messages_type" DEFAULT 'TEXT'::public."enum_Messages_type",
    content text NOT NULL,
    "attachmentUrl" character varying(255),
    "readAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Messages" OWNER TO postgres;

--
-- Name: Packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Packages" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    type public."enum_Packages_type" NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL,
    duration integer NOT NULL,
    "departureDate" timestamp with time zone NOT NULL,
    quota integer NOT NULL,
    "remainingQuota" integer NOT NULL,
    facilities json NOT NULL,
    image character varying(255),
    "additionalImages" json DEFAULT '[]'::json,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    dp integer DEFAULT 20 NOT NULL
);


ALTER TABLE public."Packages" OWNER TO postgres;

--
-- Name: COLUMN "Packages".dp; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Packages".dp IS 'Down Payment percentage required for registration';


--
-- Name: Payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payments" (
    id uuid NOT NULL,
    "registrationId" uuid NOT NULL,
    type public."enum_Payments_type" NOT NULL,
    amount numeric(10,2) NOT NULL,
    "dueAmount" numeric(10,2) NOT NULL,
    "dueDate" timestamp with time zone,
    status public."enum_Payments_status" DEFAULT 'PENDING'::public."enum_Payments_status" NOT NULL,
    "midtransTransactionId" character varying(255),
    "midtransRedirectUrl" character varying(255),
    "paymentDate" timestamp with time zone,
    "verifiedBy" uuid,
    "verifiedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "midtransOrderId" character varying(255),
    "midtransTransactionStatus" character varying(255),
    "midtransPaymentType" character varying(255),
    "midtransPaymentCode" character varying(255),
    "bankName" character varying(255),
    "accountNumber" character varying(255),
    "accountName" character varying(255),
    "transferDate" timestamp with time zone,
    "transferProof" character varying(255),
    "paymentMethod" character varying(255),
    "verificationNotes" text,
    notes text
);


ALTER TABLE public."Payments" OWNER TO postgres;

--
-- Name: COLUMN "Payments"."dueAmount"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Payments"."dueAmount" IS 'Total amount that should be paid for this payment';


--
-- Name: COLUMN "Payments"."midtransTransactionId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Payments"."midtransTransactionId" IS 'ID from payment gateway';


--
-- Name: COLUMN "Payments"."midtransRedirectUrl"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Payments"."midtransRedirectUrl" IS 'URL to receipt/proof of payment';


--
-- Name: COLUMN "Payments"."paymentDate"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Payments"."paymentDate" IS 'When the payment was made';


--
-- Name: COLUMN "Payments"."midtransOrderId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Payments"."midtransOrderId" IS 'Order ID from Midtrans';


--
-- Name: COLUMN "Payments"."midtransTransactionStatus"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Payments"."midtransTransactionStatus" IS 'Transaction status from Midtrans';


--
-- Name: COLUMN "Payments"."midtransPaymentType"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Payments"."midtransPaymentType" IS 'Payment type from Midtrans';


--
-- Name: COLUMN "Payments"."midtransPaymentCode"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Payments"."midtransPaymentCode" IS 'Payment code or virtual account number';


--
-- Name: Registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Registrations" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "packageId" uuid NOT NULL,
    "referralCode" character varying(255),
    status public."enum_Registrations_status" DEFAULT 'DRAFT'::public."enum_Registrations_status",
    "mahramId" uuid,
    "mahramStatus" public."enum_Registrations_mahramStatus",
    "roomType" public."enum_Registrations_roomType" DEFAULT 'DOUBLE'::public."enum_Registrations_roomType" NOT NULL,
    "roomPreferences" json,
    "roomMate" json,
    "specialRequests" text,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Registrations" OWNER TO postgres;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    fullname character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    address text,
    role public."enum_Users_role" DEFAULT 'JAMAAH'::public."enum_Users_role",
    "isActive" boolean DEFAULT true,
    nik character varying(16),
    "birthPlace" character varying(255),
    "birthDate" timestamp with time zone,
    gender public."enum_Users_gender",
    "maritalStatus" public."enum_Users_maritalStatus",
    occupation character varying(255),
    education character varying(255),
    "bloodType" public."enum_Users_bloodType",
    "emergencyContact" json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "agentTierId" uuid,
    "referralCode" character varying(255),
    "totalJamaah" integer DEFAULT 0,
    "totalCommission" numeric(10,2) DEFAULT 0,
    "bankInfo" json,
    "referredBy" uuid
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- Data for Name: AgentTiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AgentTiers" (id, name, "baseCommissionRate", "minimumJamaah", "bonusRate", benefits, "createdAt", "updatedAt") FROM stdin;
b21db379-93c9-4181-b2fc-0e72319b7609	BRONZE	3.00	0	0.00	{"description":"Tier Pemula","features":["Akses Dashboard Dasar","Sistem Referral"]}	2025-04-13 07:41:54.589+07	2025-04-13 07:41:54.589+07
0e975fd5-48a5-47cb-9ea2-ab52c98ce25b	SILVER	5.00	5	0.50	{"description":"Tier Menengah","features":["Semua fitur Bronze","Priority Support","Training Basic"]}	2025-04-13 07:41:54.589+07	2025-04-13 07:41:54.589+07
a46ed094-6fab-4c25-bcf9-bfdaf0271239	GOLD	7.00	10	1.00	{"description":"Tier Professional","features":["Semua fitur Silver","Training Advanced","Marketing Kit"]}	2025-04-13 07:41:54.589+07	2025-04-13 07:41:54.589+07
33a23697-7104-497b-b50f-5cf661edba6e	DIAMOND	10.00	20	3.00	{"description":"Tier Atas","features":["Semua fitur Gold","Priority Support","Training Basic"]}	2025-04-15 02:57:36.571+07	2025-04-15 02:57:36.571+07
\.


--
-- Data for Name: ChatMembers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatMembers" (id, "roomId", "userId", "lastReadAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatRooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatRooms" (id, type, "lastMessageAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CommissionPayments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CommissionPayments" (id, "agentId", amount, status, "paymentMethod", "bankName", "accountNumber", "accountName", "processedBy", "processedAt", notes, "createdAt", "updatedAt") FROM stdin;
c0db241f-7f5f-4cfe-a68a-41270c5bd508	b9d5ea73-9c6c-46b7-ab12-1571a2a177ef	1050000.00	DONE	\N	BBCA	23812312	Siapa Saja	53ccb20c-aa38-4818-94b1-71bad7433693	2025-04-15 16:49:41.001+07	Transfer sudah selesai	2025-04-15 16:44:26.454+07	2025-04-15 16:49:41.001+07
c84b91f1-18bd-4dec-be95-30b74a57b2da	b9d5ea73-9c6c-46b7-ab12-1571a2a177ef	1050000.00	DONE	\N	BCA	1234567890	Agent 47 Kachow	53ccb20c-aa38-4818-94b1-71bad7433693	2025-04-15 18:52:07.982+07	Done ya	2025-04-15 14:23:06.431+07	2025-04-15 18:52:07.983+07
\.


--
-- Data for Name: Commissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Commissions" (id, "agentId", "registrationId", "packagePrice", "commissionRate", "commissionAmount", status, "paidAt", notes, "createdAt", "updatedAt", "jamaahId", "packageId", "paymentRequestId") FROM stdin;
cf9680af-a1b8-4e30-a51a-28c2309adab3	b9d5ea73-9c6c-46b7-ab12-1571a2a177ef	830ca7b3-8b6c-4364-ab4c-74360f8bebf3	35000000.00	3.00	1050000.00	PAID	2025-04-15 16:49:41.004+07	Automatically approved after full payment	2025-04-15 12:20:31.273+07	2025-04-15 16:49:41.004+07	368aa77e-3d06-4fde-b5c4-dd139eb0f658	\N	c0db241f-7f5f-4cfe-a68a-41270c5bd508
e7d77f0b-bf09-4d88-b6bc-be63e5465aa4	b9d5ea73-9c6c-46b7-ab12-1571a2a177ef	36d94a64-1214-44bc-b8e7-db8b77560b40	35000000.00	3.00	1050000.00	PAID	2025-04-15 18:52:07.986+07	Automatically approved after full payment	2025-04-15 12:51:59.305+07	2025-04-15 18:52:07.987+07	368aa77e-3d06-4fde-b5c4-dd139eb0f658	\N	c84b91f1-18bd-4dec-be95-30b74a57b2da
\.


--
-- Data for Name: Documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Documents" (id, "userId", type, number, "expiryDate", file, status, "rejectionReason", "verifiedBy", "verifiedAt", "createdAt", "updatedAt", "registrationId") FROM stdin;
3c122bc0-04f7-41ed-8083-2f37d7e54778	c97b4ac4-696b-43ca-939a-65a9d9557087	KTP	12345678901234567	2025-12-12 07:00:00+07	/uploads/documents/c97b4ac4-696b-43ca-939a-65a9d9557087-document-1744508227722-451307750.jpeg	PENDING	\N	\N	\N	2025-04-13 08:37:07.731+07	2025-04-13 08:37:07.731+07	\N
802b8dce-14de-4900-9890-cdb6f9c150d3	c97b4ac4-696b-43ca-939a-65a9d9557087	PASSPORT	1213123123123	2025-04-30 07:00:00+07	/uploads/documents/c97b4ac4-696b-43ca-939a-65a9d9557087-document-1744508244707-467603843.jpg	APPROVED	\N	53ccb20c-aa38-4818-94b1-71bad7433693	2025-04-14 16:25:56.656+07	2025-04-13 08:37:24.714+07	2025-04-14 16:25:56.661+07	\N
7682bae2-a66c-4f2d-9127-d876b2ee2e9d	368aa77e-3d06-4fde-b5c4-dd139eb0f658	KTP	11111111111111111	\N	/uploads/documents/368aa77e-3d06-4fde-b5c4-dd139eb0f658-document-1744694984676-18765277.jpg	APPROVED	\N	53ccb20c-aa38-4818-94b1-71bad7433693	2025-04-15 12:29:56.4+07	2025-04-15 12:29:44.686+07	2025-04-15 12:29:56.4+07	\N
\.


--
-- Data for Name: Messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Messages" (id, "roomId", "senderId", type, content, "attachmentUrl", "readAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Packages" (id, name, type, description, price, duration, "departureDate", quota, "remainingQuota", facilities, image, "additionalImages", "isActive", "createdAt", "updatedAt", dp) FROM stdin;
c56ad423-b6bf-46e5-8da2-dafd5451951a	Paket Umroh VIP	UMROH	Paket Umroh 9 Hari	35000000.00	9	2024-05-15 07:00:00+07	40	40	["Hotel Bintang 5","Pesawat Direct Flight"]	\N	[]	f	2025-04-13 08:15:13.693+07	2025-04-13 08:17:04.305+07	35
461479b8-fdfa-45a2-a9aa-125751c3892c	Paket Umroh VIP	UMROH	Paket Umroh 9 Hari	35000000.00	9	2024-05-15 07:00:00+07	40	40	["Hotel Bintang 5","Pesawat Direct Flight"]	/uploads/packages/package-1744507003969-945320442.jpg	[]	f	2025-04-13 08:16:44.117+07	2025-04-13 08:18:35.857+07	35
2c298bf4-79fb-4fd7-a576-884e4994183e	Paket Umroh VIP	UMROH	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer urna urna, varius quis lacinia ac, eleifend in dolor. Nam et odio sit amet turpis varius condimentum. Suspendisse potenti. Curabitur et lacus vel risus vestibulum aliquet. Donec tempor ante neque, vitae rutrum dui consectetur nec. Nullam elit magna, ornare lobortis est eget, ornare sodales ante. Donec consequat scelerisque pellentesque. Etiam leo elit, consectetur et tempor condimentum, auctor quis enim. Morbi nec neque rutrum augue rutrum rhoncus. Nunc vulputate pellentesque est a accumsan. Cras a gravida odio, pretium volutpat ligula. Donec lacinia faucibus dui, quis venenatis risus commodo nec. 	35000000.00	9	2025-04-30 07:00:00+07	45	42	["Hotel B5"]	/uploads/packages/package-1744507097114-638917739.webp	[]	t	2025-04-13 08:18:17.121+07	2025-04-15 12:51:59.298+07	20
\.


--
-- Data for Name: Payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payments" (id, "registrationId", type, amount, "dueAmount", "dueDate", status, "midtransTransactionId", "midtransRedirectUrl", "paymentDate", "verifiedBy", "verifiedAt", "createdAt", "updatedAt", "midtransOrderId", "midtransTransactionStatus", "midtransPaymentType", "midtransPaymentCode", "bankName", "accountNumber", "accountName", "transferDate", "transferProof", "paymentMethod", "verificationNotes", notes) FROM stdin;
81368e1c-b490-4c17-868e-6162872d6da5	ff1f05e5-3089-4ec8-805c-a4cb72a0ab5a	DP	7000000.00	7000000.00	2025-04-14 15:05:34.206+07	PAID	\N	\N	2025-04-14 15:08:36.813+07	53ccb20c-aa38-4818-94b1-71bad7433693	2025-04-14 15:08:36.812+07	2025-04-14 15:05:34.209+07	2025-04-14 15:08:36.814+07	\N	\N	\N	\N	Bank Central Asia	271212131312	John Doe	2025-04-14 07:00:00+07	/uploads/payments/payment-1744617934193-695054133.jpeg	bank_transfer	Done bang	\N
5c8b6e40-3c31-4558-b8cb-29a6601d7bae	830ca7b3-8b6c-4364-ab4c-74360f8bebf3	DP	7000000.00	7000000.00	2025-04-15 12:22:43.224+07	PAID	\N	\N	2025-04-15 12:23:45.608+07	53ccb20c-aa38-4818-94b1-71bad7433693	2025-04-15 12:23:45.608+07	2025-04-15 12:22:43.225+07	2025-04-15 12:23:45.609+07	\N	\N	\N	\N	Bank Mandiri	217213213123	our user	2025-04-15 07:00:00+07	/uploads/payments/payment-1744694563212-146779224.png	bank_transfer	Oke done DP	Inilah catatan
926b55b9-ab47-4b0e-9c9d-1fe0455b194d	830ca7b3-8b6c-4364-ab4c-74360f8bebf3	INSTALLMENT	28000000.00	28000000.00	2025-04-15 12:25:34.717+07	PAID	\N	\N	2025-04-15 12:29:15.774+07	53ccb20c-aa38-4818-94b1-71bad7433693	2025-04-15 12:29:15.774+07	2025-04-15 12:25:34.718+07	2025-04-15 12:29:15.778+07	\N	\N	\N	\N	Mandiri	ASas	asa	2025-04-15 07:00:00+07	/uploads/payments/payment-1744694734701-972257278.jpg	bank_transfer		asas
4f3fbb81-b236-4ca8-b445-9356e1393fd9	36d94a64-1214-44bc-b8e7-db8b77560b40	DP	7000000.00	7000000.00	2025-04-15 12:53:00.926+07	PAID	\N	\N	2025-04-15 12:54:12.68+07	53ccb20c-aa38-4818-94b1-71bad7433693	2025-04-15 12:54:12.68+07	2025-04-15 12:53:00.926+07	2025-04-15 12:54:12.681+07	\N	\N	\N	\N	Mandiri	315341234124124124	Our Useres	2025-04-15 07:00:00+07	/uploads/payments/payment-1744696380852-761584050.png	bank_transfer		ahahahahaa
a8dcafa0-2abb-43ae-9a4c-18357cf7fe75	36d94a64-1214-44bc-b8e7-db8b77560b40	INSTALLMENT	28000000.00	28000000.00	2025-04-15 12:54:38.687+07	PAID	\N	\N	2025-04-15 12:54:49.028+07	53ccb20c-aa38-4818-94b1-71bad7433693	2025-04-15 12:54:49.028+07	2025-04-15 12:54:38.687+07	2025-04-15 12:54:49.028+07	\N	\N	\N	\N	Mandiri	4525235423523	JJJ	2025-04-15 07:00:00+07	/uploads/payments/payment-1744696478670-85566597.jpg	bank_transfer		a
\.


--
-- Data for Name: Registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Registrations" (id, "userId", "packageId", "referralCode", status, "mahramId", "mahramStatus", "roomType", "roomPreferences", "roomMate", "specialRequests", notes, "createdAt", "updatedAt") FROM stdin;
ff1f05e5-3089-4ec8-805c-a4cb72a0ab5a	c97b4ac4-696b-43ca-939a-65a9d9557087	2c298bf4-79fb-4fd7-a576-884e4994183e	\N	DRAFT	\N	\N	SINGLE	{"preferredLocation":"standard","specialNeeds":"Tidak ada","tentSection":null,"dormitorySection":null}	\N	Tidak ada	\N	2025-04-13 08:41:27.119+07	2025-04-13 08:41:27.119+07
830ca7b3-8b6c-4364-ab4c-74360f8bebf3	368aa77e-3d06-4fde-b5c4-dd139eb0f658	2c298bf4-79fb-4fd7-a576-884e4994183e	AGENT-E90B4F36	DOCUMENT_REVIEW	\N	\N	SINGLE	{"preferredLocation":"standard","specialNeeds":"elderly friendly","tentSection":null,"dormitorySection":null}	\N	\N	\N	2025-04-15 12:20:31.246+07	2025-04-15 12:29:15.795+07
36d94a64-1214-44bc-b8e7-db8b77560b40	368aa77e-3d06-4fde-b5c4-dd139eb0f658	2c298bf4-79fb-4fd7-a576-884e4994183e	AGENT-E90B4F36	DOCUMENT_REVIEW	\N	\N	SINGLE	{"preferredLocation":"standard","specialNeeds":"elderly friendly","tentSection":null,"dormitorySection":null}	\N	\N	\N	2025-04-15 12:51:59.279+07	2025-04-15 12:54:49.039+07
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name) FROM stdin;
20250328192630-enable-uuid.js
20250328192634-create-users.js
20250328192639-create-packages.js
20250328192643-create-agent-tiers.js
20250328192648-update-users-for-agent.js
20250328192653-create-registrations.js
20250328192659-create-commissions.js
20250328192700-standardize-camelcase.js
20250330000355-add-dp-to-package.js
20250330002033-create-documents.js
20250330002034-add-registration-id-to-documents.js
20250330005808-create-payment.js
20250330010548-update-payment-model-for-midtrans.js
20250413013921-add-payment-columns.js
20250414104259-create-agent-tables.js
20250415071050-create-commission-payments.js
20250415205757-create-chat-tables.js
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" (id, email, password, fullname, phone, address, role, "isActive", nik, "birthPlace", "birthDate", gender, "maritalStatus", occupation, education, "bloodType", "emergencyContact", "createdAt", "updatedAt", "agentTierId", "referralCode", "totalJamaah", "totalCommission", "bankInfo", "referredBy") FROM stdin;
53ccb20c-aa38-4818-94b1-71bad7433693	superadmin@hajiumroh.com	$2b$10$qXid1CfB/4rGLLT58ko.VOZqlHplN4rIiltj8ycq02iQZaE//078K	Super Admin	081234567890	Jakarta, Indonesia	SUPERADMIN	t	3171234567890001	Jakarta	1990-01-01 07:00:00+07	MALE	MARRIED	System Administrator	S1	O	{"name":"Admin Emergency","relation":"Family","phone":"081234567891","address":"Jl. Emergency No. 1, Jakarta Pusat"}	2025-04-13 07:43:00.335+07	2025-04-13 07:43:00.335+07	\N	\N	0	0.00	{"bankName":"Bank Mandiri","accountNumber":"1234567890","accountHolder":"Super Administrator"}	\N
c97b4ac4-696b-43ca-939a-65a9d9557087	palviablacksec@gmail.com	$2b$10$Tqe0AG0DXEdSMEEr4boKwOHGrExvvVEoY/s1sBD/EqiSZqU9Uut1W	Jiilan	081213142314	KOmpl	JAMAAH	t	123456890123456	Bandung	1994-03-03 07:00:00+07	MALE	SINGLE	Wirausahawan	SMA	A	{"name":"Ibu","relation":"Ibu Kandung","phone":"0829121212","address":"wefwfwef"}	2025-04-13 07:44:56.317+07	2025-04-13 07:45:56.606+07	\N	\N	0	0.00	{"bankName":null,"accountNumber":null,"accountHolder":null}	\N
aaac7b6f-87bd-4a35-8e88-35736dcad9f4	test@example.com	$2b$10$XRkc8ArGM8jti7wFlSSe9uLzi7i4xL5KUqy8J..S.L.lscNjAKddu	Test User	081234567890	Jakarta	JAMAAH	t	\N	\N	\N	\N	\N	\N	\N	\N	{"name":null,"relation":null,"phone":null,"address":null}	2025-04-15 10:52:25.181+07	2025-04-15 10:52:25.181+07	\N	\N	0	0.00	{"bankName":null,"accountNumber":null,"accountHolder":null}	ca61844c-1b5c-46fb-821b-b04d517635fc
368aa77e-3d06-4fde-b5c4-dd139eb0f658	ouruser@gmail.com	$2b$10$maRkr7gLjlHYk7wOfCOvQ.w4yAbhoPSNKR5OamSTaHYXFTEefD3pa	Our User	0895384290617	Palvsec Alamat	JAMAAH	t	\N	\N	\N	\N	\N	\N	\N	\N	{"name":null,"relation":null,"phone":null,"address":null}	2025-04-15 11:21:53.365+07	2025-04-15 11:21:53.365+07	\N	\N	0	0.00	{"bankName":null,"accountNumber":null,"accountHolder":null}	b9d5ea73-9c6c-46b7-ab12-1571a2a177ef
a5b7fb73-1bd5-4e19-9b6a-1b3de4e10639	newnew@gmail.com	$2b$10$UW1S0TD/jmYMQmNIyfl/Nu9zcBpUK4BXU6kpLUmvGd8dc7t0B4Q72	User super new new new	08291391312	Komplek Permata	JAMAAH	t	\N	\N	\N	\N	\N	\N	\N	\N	{"name":null,"relation":null,"phone":null,"address":null}	2025-04-15 10:53:54.824+07	2025-04-15 10:53:54.824+07	\N	\N	0	0.00	{"bankName":null,"accountNumber":null,"accountHolder":null}	ca61844c-1b5c-46fb-821b-b04d517635fc
ca61844c-1b5c-46fb-821b-b04d517635fc	agent@example.com	$2b$10$whYpq5/Ib8QdAntzBwsg1eNQQ/aBMAJrXSt/ltyKm6f8TBZWVSzF.	John Doe	081234567890	\N	AGEN	t	\N	\N	\N	\N	\N	\N	\N	\N	{"name":null,"relation":null,"phone":null,"address":null}	2025-04-15 05:14:20.013+07	2025-04-15 10:53:54.954+07	33a23697-7104-497b-b50f-5cf661edba6e	AGENT-36DCBA0B	4	0.00	{"bankName":"BCA","accountNumber":"1234567890","accountHolder":"John Doe"}	\N
b9d5ea73-9c6c-46b7-ab12-1571a2a177ef	agent47@gmail.com	$2b$10$0QjIhIb2Eo0UD19guMA1wu6ubnfqNFCUmM6XjMR4nY9QT7vpvaJSe	Agen 47	089512121212	\N	AGEN	t	\N	\N	\N	\N	\N	\N	\N	\N	{"name":null,"relation":null,"phone":null,"address":null}	2025-04-15 11:04:41.583+07	2025-04-15 12:54:49.05+07	b21db379-93c9-4181-b2fc-0e72319b7609	AGENT-E90B4F36	3	0.00	{"bankName":"BCA","accountNumber":"17212131","accountHolder":"Agen 47"}	\N
\.


--
-- Name: AgentTiers AgentTiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AgentTiers"
    ADD CONSTRAINT "AgentTiers_pkey" PRIMARY KEY (id);


--
-- Name: ChatMembers ChatMembers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMembers"
    ADD CONSTRAINT "ChatMembers_pkey" PRIMARY KEY (id);


--
-- Name: ChatRooms ChatRooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatRooms"
    ADD CONSTRAINT "ChatRooms_pkey" PRIMARY KEY (id);


--
-- Name: CommissionPayments CommissionPayments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommissionPayments"
    ADD CONSTRAINT "CommissionPayments_pkey" PRIMARY KEY (id);


--
-- Name: Commissions Commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Commissions"
    ADD CONSTRAINT "Commissions_pkey" PRIMARY KEY (id);


--
-- Name: Documents Documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Documents"
    ADD CONSTRAINT "Documents_pkey" PRIMARY KEY (id);


--
-- Name: Messages Messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_pkey" PRIMARY KEY (id);


--
-- Name: Packages Packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Packages"
    ADD CONSTRAINT "Packages_pkey" PRIMARY KEY (id);


--
-- Name: Payments Payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_pkey" PRIMARY KEY (id);


--
-- Name: Registrations Registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Registrations"
    ADD CONSTRAINT "Registrations_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_nik_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_nik_key" UNIQUE (nik);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_referralCode_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_referralCode_key" UNIQUE ("referralCode");


--
-- Name: commission_payments_agent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX commission_payments_agent_id ON public."CommissionPayments" USING btree ("agentId");


--
-- Name: commission_payments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX commission_payments_status ON public."CommissionPayments" USING btree (status);


--
-- Name: commissions_agent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX commissions_agent_id ON public."Commissions" USING btree ("agentId");


--
-- Name: commissions_payment_request_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX commissions_payment_request_id ON public."Commissions" USING btree ("paymentRequestId");


--
-- Name: commissions_registration_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX commissions_registration_id ON public."Commissions" USING btree ("registrationId");


--
-- Name: commissions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX commissions_status ON public."Commissions" USING btree (status);


--
-- Name: registrations_package_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registrations_package_id ON public."Registrations" USING btree ("packageId");


--
-- Name: registrations_referral_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registrations_referral_code ON public."Registrations" USING btree ("referralCode");


--
-- Name: registrations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registrations_status ON public."Registrations" USING btree (status);


--
-- Name: registrations_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registrations_user_id ON public."Registrations" USING btree ("userId");


--
-- Name: ChatMembers ChatMembers_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMembers"
    ADD CONSTRAINT "ChatMembers_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public."ChatRooms"(id);


--
-- Name: ChatMembers ChatMembers_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMembers"
    ADD CONSTRAINT "ChatMembers_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id);


--
-- Name: CommissionPayments CommissionPayments_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommissionPayments"
    ADD CONSTRAINT "CommissionPayments_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public."Users"(id);


--
-- Name: CommissionPayments CommissionPayments_processedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommissionPayments"
    ADD CONSTRAINT "CommissionPayments_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES public."Users"(id);


--
-- Name: Commissions Commissions_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Commissions"
    ADD CONSTRAINT "Commissions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public."Users"(id);


--
-- Name: Commissions Commissions_jamaahId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Commissions"
    ADD CONSTRAINT "Commissions_jamaahId_fkey" FOREIGN KEY ("jamaahId") REFERENCES public."Users"(id);


--
-- Name: Commissions Commissions_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Commissions"
    ADD CONSTRAINT "Commissions_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public."Packages"(id);


--
-- Name: Commissions Commissions_paymentRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Commissions"
    ADD CONSTRAINT "Commissions_paymentRequestId_fkey" FOREIGN KEY ("paymentRequestId") REFERENCES public."CommissionPayments"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Commissions Commissions_registrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Commissions"
    ADD CONSTRAINT "Commissions_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES public."Registrations"(id);


--
-- Name: Documents Documents_registrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Documents"
    ADD CONSTRAINT "Documents_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES public."Registrations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Documents Documents_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Documents"
    ADD CONSTRAINT "Documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id);


--
-- Name: Documents Documents_verifiedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Documents"
    ADD CONSTRAINT "Documents_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES public."Users"(id);


--
-- Name: Messages Messages_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public."ChatRooms"(id);


--
-- Name: Messages Messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."Users"(id);


--
-- Name: Payments Payments_registrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES public."Registrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payments Payments_verifiedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES public."Users"(id);


--
-- Name: Registrations Registrations_mahramId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Registrations"
    ADD CONSTRAINT "Registrations_mahramId_fkey" FOREIGN KEY ("mahramId") REFERENCES public."Users"(id);


--
-- Name: Registrations Registrations_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Registrations"
    ADD CONSTRAINT "Registrations_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public."Packages"(id);


--
-- Name: Registrations Registrations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Registrations"
    ADD CONSTRAINT "Registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id);


--
-- Name: Users Users_agentTierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_agentTierId_fkey" FOREIGN KEY ("agentTierId") REFERENCES public."AgentTiers"(id);


--
-- Name: Users Users_referredBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES public."Users"(id);


--
-- PostgreSQL database dump complete
--

