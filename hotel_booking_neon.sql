--
-- PostgreSQL database dump
--

\restrict OV9FaVWZAlAGifp9Tom6iGRILELz7J8lSsAJ3zFSnO63WIhYiq37sNAkAc1DvEi

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: hotels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotels (
    id integer NOT NULL,
    image text NOT NULL,
    title character varying(150) NOT NULL,
    description text NOT NULL,
    latitude numeric(10,7) NOT NULL,
    longitude numeric(10,7) NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    location text DEFAULT ''::text,
    highlights jsonb DEFAULT '[]'::jsonb,
    facilities jsonb DEFAULT '[]'::jsonb,
    gallery jsonb DEFAULT '[]'::jsonb,
    total_rooms integer DEFAULT 1,
    room_type character varying(100) DEFAULT 'Standard Room'::character varying,
    guests_per_room integer DEFAULT 2,
    room_types jsonb DEFAULT '[]'::jsonb,
    reception_number character varying(20),
    breakfast_included boolean DEFAULT false,
    free_cancellation boolean DEFAULT false,
    pay_at_hotel boolean DEFAULT false,
    room_view character varying(50),
    house_rules jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.hotels OWNER TO neondb_owner;

--
-- Name: hotels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotels_id_seq OWNER TO neondb_owner;

--
-- Name: hotels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotels_id_seq OWNED BY public.hotels.id;


--
-- Name: hotels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotels ALTER COLUMN id SET DEFAULT nextval('public.hotels_id_seq'::regclass);


--
-- Data for Name: hotels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hotels (id, image, title, description, latitude, longitude, price, created_at, location, highlights, facilities, gallery, total_rooms, room_type, guests_per_room, room_types, reception_number, breakfast_included, free_cancellation, pay_at_hotel, room_view, house_rules) FROM stdin;
43	/uploads/1791354589936.jpg	anbuu	akadfhvnoaeijjndojdfjfaefljnlsdsidfjf	13.0800915	80.2807978	965900.00	2026-10-07 11:59:50.05212	Chennai, Chennai District, Tamil Nadu, India	["kjdhfhiuahsvksjsdboasdhf"]	["as.md  jahfoasdfalajsddfnf"]	["/uploads/1791354589953.jpg", "/uploads/1791354589963.jpg", "/uploads/1791354589979.jpg", "/uploads/1791354589983.jpg"]	1	Standard Room	2	[]	\N	f	f	f	\N	[]
37	/uploads/1791264533659.jpg	,cnvvuisdn	loashdfjfflnvnijfu njdfjf 8eeurknhsddjoaaidfn f	10.6588234	77.0087300	90347.00	2026-10-06 10:58:53.743937		[]	[]	[]	1	Standard Room	2	[]	\N	f	f	f	\N	[]
41	/uploads/1791439156177.avif	Marina Bay Grand Hotel	A premium city hotel with elegant rooms, modern amenities, delicious dining options, and easy access to Chennai Marina Beach.	30.9293211	75.5004841	2874.00	2026-10-07 11:00:33.466161	Punjab, India	["Near Marina Beach", "Sea View Rooms", "Free WiFi", "Rooftop Restaurant", "24/7 Reception"]	["Free WiFi", "Restaurant", "Parking", "Swimming Pool", "Room Service", "Air Conditioning", "Gym", "Laundry"]	[{"type": "Amenities", "image": "/uploads/1791439156206.webp"}, {"type": "Room", "image": "/uploads/1791439156209.jpg"}, {"type": "Swimming Pool", "image": "/uploads/1791439156214.jpg"}, {"type": "Reception", "image": "/uploads/1791439156215.avif"}]	1	Standard Room	2	[{"type": "Standard Room", "rooms": 30, "guestsPerRoom": 2}, {"type": "Deluxe Room", "rooms": 32, "guestsPerRoom": 5}]	+919088388635	f	f	f	\N	[]
35	/uploads/1791263866849.jpg	zosueh	s.kdlmfjoiuapfpvdsllkhousfh	10.0869959	77.0600915	8742983.00	2026-10-06 10:47:47.070546	N.S.N College, Karur, Tamil Nadu	["Comfortable rooms", "City center", "Free Wi-Fi"]	["Free Wi-Fi", "Parking", "Restaurant", "Air Conditioning"]	["/uploads/goaimage.jpg", "/uploads/tamilimage.jpg"]	1	Standard Room	2	[]	\N	f	f	f	\N	[]
38	/uploads/1791349591264.jpg	xdcfvgbhnj	rsxdtfghj	10.8217671	78.3828654	345678.00	2026-10-07 10:36:31.472953	Karur, Tamil Nadu, India	["zsxrdcfvgbhinjomk"]	["zsxdtcfvygbhnjokm"]	["/uploads/1791349591286.jpg"]	1	Standard Room	2	[]	\N	f	f	f	\N	[]
39	/uploads/1791349800558.jpg	Taj Coromandel	Taj Coromandel is a luxury five-star hotel in Nungambakkam, Chennai, offering elegant rooms, fine dining, a landscaped outdoor pool, fitness facilities and spa services.	10.8920541	78.0272930	3888.00	2026-10-07 10:40:00.635423	Manalmedu, Pallampatti, Karur, Tamil Nadu, India	["Luxury Rooms", "City View", "Fine Dining", "Outdoor Pool", "Spa & Wellness"]	["Free Wi-Fi", "Swimming Pool", "Free Parking", "Fitness Centre", "Restaurant", "Spa", "Room Service"]	["/uploads/1791349800573.jpg", "/uploads/1791349800575.jpg", "/uploads/1791349800577.jpg", "/uploads/1791349800579.jpg"]	1	Standard Room	2	[]	\N	f	f	f	\N	[]
40	/uploads/1791350532260.jpg	venu hotelsws4edrfvgtbhunji	sedrtfvoimk	10.8217671	78.3828654	34567.00	2026-10-07 10:52:12.366754	Karur, Tamil Nadu, India	["es5drftgyhuijo"]	["s4drf6tg7yh8uji"]	["/uploads/1791350532283.jpg", "/uploads/1791350532290.jpg", "/uploads/1791350532294.jpg", "/uploads/1791350532299.jpg"]	1	Standard Room	2	[]	\N	f	f	f	\N	[]
44	/uploads/1791355577318.jpg	Grand Palace Residency	Grand Palace Residency is a comfortable and modern hotel located in the heart of Karur. The hotel offers clean rooms, modern amenities, friendly service, a restaurant, and convenient access to major places in the city. It is suitable for families, business travellers, and tourists.	11.3306483	77.7276519	4000.00	2026-10-07 12:16:17.401663	Erode, Tamil Nadu, 638001, India	["Free Wi-Fi", "Family Friendly", "24/7 Front Desk", "Free Parking", "City Center"]	["Free Wi-Fi", "Air Conditioning", "Restaurant", "Parking", "Room Service", "Swimming Pool", "24/7 Reception"]	["/uploads/1791355577329.jpg", "/uploads/1791355577332.jpg", "/uploads/1791355577344.jpg", "/uploads/1791355577345.jpg"]	1	Standard Room	2	[]	\N	f	f	f	\N	[]
46	/uploads/1791421121923.jpg	sakthiiiiiiiiiiiiiiiiiiiiiiiiiiii	srd ghujiokkmnuybtfrdewecrvtbynumi	10.4511094	77.5154495	30000.00	2026-10-08 06:28:42.053504	Palani, Dindigul, Tamil Nadu, 624600, India	["z3xcvbgynhjimko", "l"]	["sdrtfgyhujik"]	[{"type": "Room", "image": "/uploads/1791421121970.jpg"}]	1	Standard Room	2	[{"type": "Standard Room", "rooms": 18, "guestsPerRoom": 7}, {"type": "Deluxe Room", "rooms": 10, "guestsPerRoom": 1}]	\N	f	f	f	\N	[]
48	/uploads/1791435059379.jpg	ITC Grand Chola	ITC Grand Chola is a luxury hotel in Chennai known for its grand architecture, elegant rooms, fine dining restaurants, and premium hospitality. It offers a comfortable stay for business and leisure travellers.	13.0087095	80.2203646	4000.00	2026-10-08 10:20:59.725706	Guindy, Zone 13 Adyar, Chennai, Chennai District, Tamil Nadu, 600032, India	["Luxury Rooms", "Fine Dining", "Grand Architecture", "Swimming Pool", "Spa", "Business Facilities"]	["Free Wi-Fi", "Parking", "Restaurant", "Swimming Pool", "Fitness Centre", "Spa", "24-Hour Reception", "Room Service"]	[{"type": "Room", "image": "/uploads/1791435059388.jpg"}, {"type": "Room", "image": "/uploads/1791435059393.jpg"}, {"type": "Room", "image": "/uploads/1791435059419.jpg"}, {"type": "Room", "image": "/uploads/1791435059497.avif"}]	1	Standard Room	2	[{"type": "Standard Room", "rooms": 11, "guestsPerRoom": 2}, {"type": "Deluxe Room", "rooms": 7, "guestsPerRoom": 5}, {"type": "Suite", "rooms": 7, "guestsPerRoom": 6}, {"type": "Family Room", "rooms": 8, "guestsPerRoom": 8}]	+918098375972	f	f	f	\N	[]
49	/uploads/1791438363642.png	Grand Goa Residency	A comfortable modern hotel offering spacious rooms, excellent service, and convenient access to major attractions and business areas.	15.3004543	74.0855134	4000.00	2026-10-08 11:16:03.893399	Goa, India	["Prime location", "Free WiFi", "Breakfast", "24/7 Reception", "City View"]	["Free WiFi", "Swimming Pool", "Restaurant", "Parking", "Room Service", "Air Conditioning", "Laundry"]	[{"type": "Amenities", "image": "/uploads/1791438363652.jpg"}, {"type": "Room", "image": "/uploads/1791438363657.jpg"}, {"type": "Swimming Pool", "image": "/uploads/1791438363724.jpg"}, {"type": "Exterior", "image": "/uploads/1791438363760.avif"}]	1	Standard Room	2	[{"type": "Standard Room", "rooms": 16, "guestsPerRoom": 4}, {"type": "Deluxe Room", "rooms": 28, "guestsPerRoom": 2}, {"type": "Suite", "rooms": 19, "guestsPerRoom": 5}, {"type": "Family Room", "rooms": 15, "guestsPerRoom": 10}]	+918957268305	f	f	f	\N	[]
51	/uploads/1791440882544.jpg	Cochin Harbor View	A modern city hotel in Kochi offering comfortable rooms, traditional Kerala cuisine, excellent hospitality, and convenient access to major attractions.	10.3528744	76.5120396	5000.00	2026-10-08 11:58:02.625851	Kerala, India	["Near Fort Kochi", "Kerala Cuisine", "Free WiFi", "City View", "24/7 Reception"]	["Free WiFi", "Restaurant", "Parking", "Room Service", "Air Conditioning", "Swimming Pool", "Gym", "Laundry"]	[{"type": "Room", "image": "/uploads/1791440882546.jpg"}, {"type": "Room", "image": "/uploads/1791440882548.jpg"}, {"type": "Room", "image": "/uploads/1791440882555.jpg"}, {"type": "Room", "image": "/uploads/1791440882560.jpg"}]	1	Standard Room	2	[{"type": "Standard Room", "rooms": 12, "guestsPerRoom": 1}, {"type": "Deluxe Room", "rooms": 11, "guestsPerRoom": 4}, {"type": "Suite", "rooms": 19, "guestsPerRoom": 5}, {"type": "Family Room", "rooms": 17, "guestsPerRoom": 7}]	+919986750055	f	f	f	\N	[]
50	/uploads/1791439318253.webp	Malabar Coast Residency	A comfortable hotel in Kannur offering modern rooms, delicious Malabar cuisine, friendly service, and easy access to Kannur city and nearby beaches.	11.8763836	75.3737973	4000.00	2026-10-08 11:31:58.331674	Kannur, Kerala, 670004, India	["Near Kannur Beach", "Malabar Cuisine", "Free WiFi", "Family Friendly", "24/7 Reception"]	["Free WiFi", "Restaurant", "Parking", "Room Service", "Air Conditioning", "Laundry", "CCTV Security"]	[{"type": "Room", "image": "/uploads/1791439318256.jpg"}, {"type": "Room", "image": "/uploads/1791439318258.png"}, {"type": "Room", "image": "/uploads/1791439318269.webp"}, {"type": "Room", "image": "/uploads/1791439318271.avif"}]	1	Standard Room	2	[{"type": "Standard Room", "rooms": 28, "guestsPerRoom": 2}, {"type": "Deluxe Room", "rooms": 26, "guestsPerRoom": 3}, {"type": "Suite", "rooms": 25, "guestsPerRoom": 5}, {"type": "Family Room", "rooms": 30, "guestsPerRoom": 8}]	+918973564926	t	t	t	Garden View	["Couple Friendly", "Pet Friendly"]
\.


--
-- Name: hotels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotels_id_seq', 51, true);


--
-- Name: hotels hotels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotels
    ADD CONSTRAINT hotels_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict OV9FaVWZAlAGifp9Tom6iGRILELz7J8lSsAJ3zFSnO63WIhYiq37sNAkAc1DvEi

