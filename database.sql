--
-- PostgreSQL database dump
--

\restrict oCuOoQZblJ6kotOeYmPp55fBV2HShTPlbvPrnPSPCsdmN0cM9HWvf1GLoydFZx7

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-17 16:22:08

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
-- TOC entry 222 (class 1259 OID 16406)
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer,
    receiver_id integer,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_edited boolean DEFAULT false
);


--
-- TOC entry 221 (class 1259 OID 16405)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 221
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 224 (class 1259 OID 16433)
-- Name: user_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_contacts (
    id integer NOT NULL,
    user_id integer,
    contact_id integer
);


--
-- TOC entry 223 (class 1259 OID 16432)
-- Name: user_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 223
-- Name: user_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_contacts_id_seq OWNED BY public.user_contacts.id;


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100),
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    real_name character varying(100),
    phone character varying(20),
    status character varying(20) DEFAULT 'offline'::character varying,
    role character varying(20) DEFAULT 'user'::character varying
);


--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4870 (class 2604 OID 16409)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 4873 (class 2604 OID 16436)
-- Name: user_contacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_contacts ALTER COLUMN id SET DEFAULT nextval('public.user_contacts_id_seq'::regclass);


--
-- TOC entry 4866 (class 2604 OID 16393)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4883 (class 2606 OID 16416)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4885 (class 2606 OID 16439)
-- Name: user_contacts user_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_contacts
    ADD CONSTRAINT user_contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 4887 (class 2606 OID 16441)
-- Name: user_contacts user_contacts_user_id_contact_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_contacts
    ADD CONSTRAINT user_contacts_user_id_contact_id_key UNIQUE (user_id, contact_id);


--
-- TOC entry 4875 (class 2606 OID 16404)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4877 (class 2606 OID 16430)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 4879 (class 2606 OID 16400)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4881 (class 2606 OID 16402)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4888 (class 2606 OID 16422)
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id);


--
-- TOC entry 4889 (class 2606 OID 16417)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- TOC entry 4890 (class 2606 OID 16447)
-- Name: user_contacts user_contacts_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_contacts
    ADD CONSTRAINT user_contacts_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.users(id);


--
-- TOC entry 4891 (class 2606 OID 16442)
-- Name: user_contacts user_contacts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_contacts
    ADD CONSTRAINT user_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2026-05-17 16:22:10

--
-- PostgreSQL database dump complete
--

\unrestrict oCuOoQZblJ6kotOeYmPp55fBV2HShTPlbvPrnPSPCsdmN0cM9HWvf1GLoydFZx7

