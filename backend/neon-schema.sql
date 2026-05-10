--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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
-- Name: activity_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_log (
    log_id bigint NOT NULL,
    actor_id bigint,
    actor_role_key character varying(50) NOT NULL,
    context_organization_id bigint,
    target_type character varying(40) NOT NULL,
    target_id bigint,
    action character varying(60) NOT NULL,
    action_category character varying(30) NOT NULL,
    action_subtype character varying(60),
    description text,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    is_successful boolean DEFAULT true NOT NULL,
    status character varying(20) DEFAULT 'success'::character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT activity_log_status_check CHECK (((status)::text = ANY (ARRAY[('success'::character varying)::text, ('failed'::character varying)::text, ('denied'::character varying)::text])))
);


--
-- Name: activity_log_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_log_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_log_log_id_seq OWNED BY public.activity_log.log_id;


--
-- Name: ai_providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_providers (
    provider_id integer NOT NULL,
    provider_key character varying(30) NOT NULL,
    display_name character varying(50) NOT NULL,
    api_key text DEFAULT ''::text NOT NULL,
    model character varying(100) DEFAULT ''::character varying NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    status character varying(20) DEFAULT 'inactive'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_providers_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text, ('error'::character varying)::text])))
);


--
-- Name: ai_providers_provider_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ai_providers_provider_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ai_providers_provider_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ai_providers_provider_id_seq OWNED BY public.ai_providers.provider_id;


--
-- Name: assistant_broadcasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assistant_broadcasts (
    broadcast_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    message text NOT NULL,
    is_active boolean DEFAULT true,
    priority character varying(20) DEFAULT 'normal'::character varying,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: assistant_broadcasts_broadcast_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assistant_broadcasts_broadcast_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assistant_broadcasts_broadcast_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assistant_broadcasts_broadcast_id_seq OWNED BY public.assistant_broadcasts.broadcast_id;


--
-- Name: assistant_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assistant_conversations (
    conversation_id bigint NOT NULL,
    user_id bigint NOT NULL,
    org_id bigint,
    title character varying(200) DEFAULT 'New Conversation'::character varying NOT NULL,
    messages jsonb DEFAULT '[]'::jsonb NOT NULL,
    message_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: assistant_conversations_conversation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assistant_conversations_conversation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assistant_conversations_conversation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assistant_conversations_conversation_id_seq OWNED BY public.assistant_conversations.conversation_id;


--
-- Name: assistant_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assistant_feedback (
    feedback_id bigint NOT NULL,
    user_id bigint NOT NULL,
    message_text text DEFAULT ''::text NOT NULL,
    response_text text DEFAULT ''::text NOT NULL,
    rating character varying(10) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assistant_feedback_rating_check CHECK (((rating)::text = ANY (ARRAY[('up'::character varying)::text, ('down'::character varying)::text])))
);


--
-- Name: assistant_feedback_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assistant_feedback_feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assistant_feedback_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assistant_feedback_feedback_id_seq OWNED BY public.assistant_feedback.feedback_id;


--
-- Name: assistant_knowledge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assistant_knowledge (
    knowledge_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    category character varying(100) DEFAULT 'general'::character varying,
    is_active boolean DEFAULT true,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: assistant_knowledge_knowledge_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assistant_knowledge_knowledge_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assistant_knowledge_knowledge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assistant_knowledge_knowledge_id_seq OWNED BY public.assistant_knowledge.knowledge_id;


--
-- Name: assistant_rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assistant_rate_limits (
    rate_id bigint NOT NULL,
    user_id bigint NOT NULL,
    organization_id bigint,
    window_start timestamp with time zone DEFAULT now() NOT NULL,
    request_count integer DEFAULT 1
);


--
-- Name: assistant_rate_limits_rate_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assistant_rate_limits_rate_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assistant_rate_limits_rate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assistant_rate_limits_rate_id_seq OWNED BY public.assistant_rate_limits.rate_id;


--
-- Name: assistant_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assistant_usage (
    usage_id bigint NOT NULL,
    user_id bigint NOT NULL,
    org_id bigint,
    question_count integer DEFAULT 0 NOT NULL,
    avg_response_ms integer DEFAULT 0 NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: assistant_usage_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assistant_usage_usage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assistant_usage_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assistant_usage_usage_id_seq OWNED BY public.assistant_usage.usage_id;


--
-- Name: billing_address_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_address_audit (
    billing_address_audit_id bigint NOT NULL,
    billing_address_id bigint,
    organization_id bigint NOT NULL,
    actor_user_id bigint,
    action character varying(20) NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT billing_address_audit_action_check CHECK (((action)::text = ANY (ARRAY[('create'::character varying)::text, ('update'::character varying)::text])))
);


--
-- Name: billing_address_audit_billing_address_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.billing_address_audit_billing_address_audit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: billing_address_audit_billing_address_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.billing_address_audit_billing_address_audit_id_seq OWNED BY public.billing_address_audit.billing_address_audit_id;


--
-- Name: billing_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_addresses (
    billing_address_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    full_name character varying(120) NOT NULL,
    company_name character varying(160),
    email character varying(255) NOT NULL,
    mobile character varying(30),
    address_line1 character varying(255) NOT NULL,
    address_line2 character varying(255),
    city character varying(100) NOT NULL,
    state character varying(120),
    postal_code character varying(30),
    country character varying(100) NOT NULL,
    country_id bigint,
    state_id bigint,
    is_default boolean DEFAULT true NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT billing_addresses_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: billing_addresses_billing_address_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.billing_addresses_billing_address_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: billing_addresses_billing_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.billing_addresses_billing_address_id_seq OWNED BY public.billing_addresses.billing_address_id;


--
-- Name: billing_checkout_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_checkout_sessions (
    checkout_id bigint NOT NULL,
    session_id character varying(191) NOT NULL,
    gateway character varying(30) NOT NULL,
    organization_id bigint NOT NULL,
    actor_user_id bigint,
    amount numeric(12,2),
    currency_code character varying(3),
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    failure_reason jsonb,
    confirmed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT billing_checkout_sessions_gateway_check CHECK (((gateway)::text = ANY (ARRAY[('stripe'::character varying)::text, ('paypal'::character varying)::text]))),
    CONSTRAINT billing_checkout_sessions_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('confirmed'::character varying)::text, ('failed'::character varying)::text, ('canceled'::character varying)::text])))
);


--
-- Name: billing_checkout_sessions_checkout_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.billing_checkout_sessions_checkout_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: billing_checkout_sessions_checkout_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.billing_checkout_sessions_checkout_id_seq OWNED BY public.billing_checkout_sessions.checkout_id;


--
-- Name: contact_us_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_us_requests (
    contact_request_id bigint NOT NULL,
    name character varying(120) NOT NULL,
    country_code character varying(10) DEFAULT '+91'::character varying NOT NULL,
    mobile_number character varying(30) NOT NULL,
    email_address character varying(255) NOT NULL,
    company_name character varying(150) NOT NULL,
    total_users integer NOT NULL,
    requirement_details text,
    status character varying(20) DEFAULT 'new'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contact_us_requests_status_check CHECK (((status)::text = ANY (ARRAY[('new'::character varying)::text, ('reviewed'::character varying)::text, ('closed'::character varying)::text]))),
    CONSTRAINT contact_us_requests_total_users_check CHECK ((total_users > 0))
);


--
-- Name: contact_us_requests_contact_request_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_us_requests_contact_request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contact_us_requests_contact_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_us_requests_contact_request_id_seq OWNED BY public.contact_us_requests.contact_request_id;


--
-- Name: countries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.countries (
    country_id bigint NOT NULL,
    iso_code character varying(3) NOT NULL,
    name character varying(120) NOT NULL,
    phonecode character varying(20),
    currency_code character varying(10),
    currency_name character varying(80),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT countries_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: countries_country_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.countries_country_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: countries_country_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.countries_country_id_seq OWNED BY public.countries.country_id;


--
-- Name: country_currency_priority; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.country_currency_priority (
    country_currency_priority_id bigint NOT NULL,
    country_iso_code character(2) NOT NULL,
    currency_code character(3) NOT NULL,
    rank_order smallint NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT country_currency_priority_rank_order_check CHECK ((rank_order > 0)),
    CONSTRAINT country_currency_priority_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: country_currency_priority_country_currency_priority_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.country_currency_priority_country_currency_priority_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: country_currency_priority_country_currency_priority_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.country_currency_priority_country_currency_priority_id_seq OWNED BY public.country_currency_priority.country_currency_priority_id;


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    coupon_id bigint NOT NULL,
    coupon_code character varying(40) NOT NULL,
    coupon_name character varying(120),
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(12,2) NOT NULL,
    max_discount_amount numeric(12,2),
    min_order_amount numeric(12,2),
    max_uses integer,
    used_count integer DEFAULT 0 NOT NULL,
    valid_from timestamp with time zone,
    valid_to timestamp with time zone,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT coupons_discount_type_check CHECK (((discount_type)::text = ANY (ARRAY[('percent'::character varying)::text, ('fixed'::character varying)::text]))),
    CONSTRAINT coupons_discount_value_check CHECK ((discount_value > (0)::numeric)),
    CONSTRAINT coupons_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text]))),
    CONSTRAINT coupons_used_count_check CHECK ((used_count >= 0))
);


--
-- Name: coupons_coupon_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coupons_coupon_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coupons_coupon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coupons_coupon_id_seq OWNED BY public.coupons.coupon_id;


--
-- Name: currencies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.currencies (
    currency_code character(3) NOT NULL,
    currency_name character varying(120) NOT NULL,
    currency_symbol character varying(10),
    decimal_places smallint DEFAULT 2 NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT currencies_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    department_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT departments_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_department_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: designations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.designations (
    designation_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    department_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT designations_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: designations_designation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.designations_designation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: designations_designation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.designations_designation_id_seq OWNED BY public.designations.designation_id;


--
-- Name: disappearing_threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disappearing_threads (
    id bigint NOT NULL,
    thread_id character varying(50) NOT NULL,
    organization_id bigint NOT NULL,
    set_by bigint NOT NULL,
    duration_seconds bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: disappearing_threads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.disappearing_threads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: disappearing_threads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.disappearing_threads_id_seq OWNED BY public.disappearing_threads.id;


--
-- Name: feature_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feature_categories (
    feature_category_id bigint NOT NULL,
    category_key character varying(60) NOT NULL,
    category_label character varying(100) NOT NULL,
    display_order smallint DEFAULT 10 NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT feature_categories_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: feature_categories_feature_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.feature_categories_feature_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: feature_categories_feature_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.feature_categories_feature_category_id_seq OWNED BY public.feature_categories.feature_category_id;


--
-- Name: feature_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feature_items (
    feature_item_id bigint NOT NULL,
    feature_category_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    icon_url text,
    display_order smallint DEFAULT 10 NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT feature_items_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: feature_items_feature_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.feature_items_feature_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: feature_items_feature_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.feature_items_feature_item_id_seq OWNED BY public.feature_items.feature_item_id;


--
-- Name: global_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_access (
    global_access_id bigint NOT NULL,
    org_id bigint NOT NULL,
    user_id bigint NOT NULL,
    allow_user_id bigint NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_global_access_not_self CHECK ((user_id <> allow_user_id)),
    CONSTRAINT global_access_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: global_access_global_access_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.global_access_global_access_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: global_access_global_access_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.global_access_global_access_id_seq OWNED BY public.global_access.global_access_id;


--
-- Name: group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_members (
    group_member_id bigint NOT NULL,
    group_id bigint NOT NULL,
    user_id bigint NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    organization_id bigint NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT group_members_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('left'::character varying)::text, ('kicked'::character varying)::text, ('banned'::character varying)::text])))
);


--
-- Name: group_members_group_member_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_members_group_member_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_members_group_member_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_members_group_member_id_seq OWNED BY public.group_members.group_member_id;


--
-- Name: group_message_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_message_actions (
    action_id bigint NOT NULL,
    group_message_id bigint NOT NULL,
    user_id bigint NOT NULL,
    action_type character varying(30) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: group_message_actions_action_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_message_actions_action_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_message_actions_action_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_message_actions_action_id_seq OWNED BY public.group_message_actions.action_id;


--
-- Name: group_message_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_message_files (
    file_id bigint NOT NULL,
    group_message_id bigint NOT NULL,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_type character varying(255) NOT NULL,
    file_size bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: group_message_files_file_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_message_files_file_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_message_files_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_message_files_file_id_seq OWNED BY public.group_message_files.file_id;


--
-- Name: group_message_reads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_message_reads (
    read_id bigint NOT NULL,
    group_message_id bigint NOT NULL,
    user_id bigint NOT NULL,
    read_at timestamp with time zone DEFAULT now()
);


--
-- Name: group_message_reads_read_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_message_reads_read_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_message_reads_read_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_message_reads_read_id_seq OWNED BY public.group_message_reads.read_id;


--
-- Name: group_message_recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_message_recipients (
    recipient_id bigint NOT NULL,
    group_message_id bigint NOT NULL,
    group_id bigint NOT NULL,
    user_id bigint NOT NULL,
    delivery_status character varying(20) DEFAULT 'sent'::character varying NOT NULL,
    delivered_at timestamp with time zone,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT group_message_recipients_delivery_status_check CHECK (((delivery_status)::text = ANY (ARRAY[('sent'::character varying)::text, ('delivered'::character varying)::text, ('read'::character varying)::text])))
);


--
-- Name: group_message_recipients_recipient_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_message_recipients_recipient_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_message_recipients_recipient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_message_recipients_recipient_id_seq OWNED BY public.group_message_recipients.recipient_id;


--
-- Name: group_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_messages (
    group_message_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    group_id bigint NOT NULL,
    sender_id bigint NOT NULL,
    message_type character varying(20) DEFAULT 'text'::character varying NOT NULL,
    message text,
    message_metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    CONSTRAINT group_messages_message_type_check CHECK (((message_type)::text = ANY ((ARRAY['text'::character varying, 'file'::character varying, 'link'::character varying, 'code'::character varying, 'system'::character varying, 'emoji'::character varying, 'image'::character varying, 'video'::character varying, 'audio'::character varying, 'poll'::character varying])::text[])))
);


--
-- Name: group_messages_group_message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_messages_group_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_messages_group_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_messages_group_message_id_seq OWNED BY public.group_messages.group_message_id;


--
-- Name: group_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_permissions (
    permission_id bigint NOT NULL,
    group_id bigint NOT NULL,
    feature_key character varying(50) NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    allowed_roles jsonb,
    time_limit_minutes integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: group_permissions_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_permissions_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_permissions_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_permissions_permission_id_seq OWNED BY public.group_permissions.permission_id;


--
-- Name: group_poll_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_poll_options (
    option_id bigint NOT NULL,
    poll_id bigint NOT NULL,
    option_text text NOT NULL,
    vote_count integer DEFAULT 0 NOT NULL,
    order_no smallint DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: group_poll_options_option_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_poll_options_option_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_poll_options_option_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_poll_options_option_id_seq OWNED BY public.group_poll_options.option_id;


--
-- Name: group_poll_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_poll_votes (
    vote_id bigint NOT NULL,
    poll_id bigint NOT NULL,
    option_id bigint NOT NULL,
    user_id bigint NOT NULL,
    voted_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    CONSTRAINT group_poll_votes_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'removed'::character varying])::text[])))
);


--
-- Name: group_poll_votes_vote_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_poll_votes_vote_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_poll_votes_vote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_poll_votes_vote_id_seq OWNED BY public.group_poll_votes.vote_id;


--
-- Name: group_polls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_polls (
    poll_id bigint NOT NULL,
    group_message_id bigint NOT NULL,
    group_id bigint NOT NULL,
    question text NOT NULL,
    poll_type character varying(20) DEFAULT 'single'::character varying NOT NULL,
    show_results_before_vote boolean DEFAULT false NOT NULL,
    ends_at timestamp with time zone,
    end_permission character varying(30) DEFAULT 'creator_admin'::character varying NOT NULL,
    created_by bigint NOT NULL,
    ended_by bigint,
    ended_at timestamp with time zone,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT group_polls_end_permission_check CHECK (((end_permission)::text = ANY (ARRAY[('creator_only'::character varying)::text, ('creator_admin'::character varying)::text, ('admin'::character varying)::text]))),
    CONSTRAINT group_polls_poll_type_check CHECK (((poll_type)::text = ANY (ARRAY[('single'::character varying)::text, ('multiple'::character varying)::text]))),
    CONSTRAINT group_polls_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('ended'::character varying)::text, ('deleted'::character varying)::text])))
);


--
-- Name: group_polls_poll_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_polls_poll_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_polls_poll_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_polls_poll_id_seq OWNED BY public.group_polls.poll_id;


--
-- Name: group_timeline; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_timeline (
    timeline_id bigint NOT NULL,
    group_id bigint NOT NULL,
    actor_user_id bigint NOT NULL,
    target_user_id bigint,
    event_type character varying(50) NOT NULL,
    event_description text NOT NULL,
    organization_id bigint NOT NULL,
    event_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(20) DEFAULT 'visible'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT group_timeline_status_check CHECK (((status)::text = ANY (ARRAY[('visible'::character varying)::text, ('hidden'::character varying)::text, ('deleted'::character varying)::text])))
);


--
-- Name: group_timeline_timeline_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_timeline_timeline_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_timeline_timeline_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_timeline_timeline_id_seq OWNED BY public.group_timeline.timeline_id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    group_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    group_name character varying(100) NOT NULL,
    group_description text,
    group_image text,
    created_by bigint NOT NULL,
    is_airtime boolean DEFAULT false NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT groups_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text, ('archived'::character varying)::text, ('deleted'::character varying)::text])))
);


--
-- Name: groups_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.groups_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: groups_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.groups_group_id_seq OWNED BY public.groups.group_id;


--
-- Name: languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.languages (
    language_id bigint NOT NULL,
    language_code character varying(10) NOT NULL,
    full_name character varying(100) NOT NULL,
    native_name character varying(100) NOT NULL,
    direction character varying(3) DEFAULT 'ltr'::character varying NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT languages_direction_check CHECK (((direction)::text = ANY (ARRAY[('ltr'::character varying)::text, ('rtl'::character varying)::text]))),
    CONSTRAINT languages_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: languages_language_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.languages_language_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: languages_language_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.languages_language_id_seq OWNED BY public.languages.language_id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    location_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    label character varying(100) NOT NULL,
    country character varying(100) DEFAULT 'India'::character varying NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT locations_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: locations_location_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.locations_location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: locations_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.locations_location_id_seq OWNED BY public.locations.location_id;


--
-- Name: meeting_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_messages (
    id bigint NOT NULL,
    meeting_id bigint NOT NULL,
    user_id bigint NOT NULL,
    message text NOT NULL,
    message_type character varying(20) DEFAULT 'text'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: meeting_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meeting_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meeting_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meeting_messages_id_seq OWNED BY public.meeting_messages.id;


--
-- Name: meeting_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_participants (
    id bigint NOT NULL,
    meeting_id bigint NOT NULL,
    user_id bigint,
    email character varying(255),
    display_name character varying(100),
    role character varying(20) DEFAULT 'participant'::character varying NOT NULL,
    rsvp character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    joined_at timestamp with time zone,
    left_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: meeting_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meeting_participants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meeting_participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meeting_participants_id_seq OWNED BY public.meeting_participants.id;


--
-- Name: meetings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meetings (
    id bigint NOT NULL,
    meeting_id character varying(20) NOT NULL,
    organization_id bigint NOT NULL,
    host_id bigint NOT NULL,
    title character varying(200) DEFAULT 'Untitled Meeting'::character varying NOT NULL,
    description text,
    meeting_type character varying(20) DEFAULT 'instant'::character varying NOT NULL,
    status character varying(20) DEFAULT 'waiting'::character varying NOT NULL,
    scheduled_at timestamp with time zone,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    duration_minutes integer,
    settings jsonb DEFAULT '{"chat": true, "audio": true, "video": true, "recording": false, "whiteboard": true, "screenShare": true, "waitingRoom": false, "maxParticipants": 50}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: meetings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meetings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meetings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meetings_id_seq OWNED BY public.meetings.id;


--
-- Name: message_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_actions (
    action_id bigint NOT NULL,
    message_id bigint NOT NULL,
    user_id bigint NOT NULL,
    action_type character varying(30) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: message_actions_action_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_actions_action_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_actions_action_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_actions_action_id_seq OWNED BY public.message_actions.action_id;


--
-- Name: message_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_files (
    file_id bigint NOT NULL,
    message_id bigint NOT NULL,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_type character varying(255) NOT NULL,
    file_size bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: message_files_file_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_files_file_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_files_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_files_file_id_seq OWNED BY public.message_files.file_id;


--
-- Name: message_menu_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_menu_items (
    menu_item_id bigint NOT NULL,
    menu_key character varying(50) NOT NULL,
    label character varying(100) NOT NULL,
    default_status character varying(20) DEFAULT 'show'::character varying NOT NULL,
    scope character varying(20) DEFAULT 'any'::character varying NOT NULL,
    tone character varying(20) DEFAULT 'normal'::character varying,
    icon_class character varying(100),
    display_order smallint DEFAULT 10 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT message_menu_items_default_status_check CHECK (((default_status)::text = ANY (ARRAY[('show'::character varying)::text, ('hide'::character varying)::text, ('disable'::character varying)::text]))),
    CONSTRAINT message_menu_items_scope_check CHECK (((scope)::text = ANY (ARRAY[('any'::character varying)::text, ('self'::character varying)::text, ('admin'::character varying)::text]))),
    CONSTRAINT message_menu_items_tone_check CHECK (((tone)::text = ANY (ARRAY[('normal'::character varying)::text, ('danger'::character varying)::text, ('warning'::character varying)::text, ('info'::character varying)::text])))
);


--
-- Name: message_menu_items_menu_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_menu_items_menu_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_menu_items_menu_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_menu_items_menu_item_id_seq OWNED BY public.message_menu_items.menu_item_id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    message_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    sender_id bigint NOT NULL,
    receiver_id bigint NOT NULL,
    message text,
    message_type character varying(20) DEFAULT 'text'::character varying NOT NULL,
    message_metadata jsonb,
    send_time timestamp with time zone DEFAULT now() NOT NULL,
    read_time timestamp with time zone,
    edit_time timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    delivered_at timestamp with time zone,
    expires_at timestamp with time zone,
    CONSTRAINT messages_message_type_check CHECK (((message_type)::text = ANY (ARRAY[('text'::character varying)::text, ('file'::character varying)::text, ('image'::character varying)::text, ('video'::character varying)::text, ('audio'::character varying)::text, ('link'::character varying)::text, ('code'::character varying)::text, ('system'::character varying)::text, ('emoji'::character varying)::text, ('poll'::character varying)::text])))
);


--
-- Name: messages_message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_message_id_seq OWNED BY public.messages.message_id;


--
-- Name: organization_controls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_controls (
    control_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    feature_key character varying(50) NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    time_limit_minutes integer,
    allowed_roles jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: organization_controls_control_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organization_controls_control_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organization_controls_control_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organization_controls_control_id_seq OWNED BY public.organization_controls.control_id;


--
-- Name: organization_ip_restrictions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_ip_restrictions (
    restriction_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    ip_address character varying(45) NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    CONSTRAINT chk_organization_ip_restrictions_status CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: organization_ip_restrictions_restriction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organization_ip_restrictions_restriction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organization_ip_restrictions_restriction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organization_ip_restrictions_restriction_id_seq OWNED BY public.organization_ip_restrictions.restriction_id;


--
-- Name: organization_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_members (
    membership_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    user_id bigint NOT NULL,
    role_id bigint NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    department_id bigint,
    designation_id bigint,
    location_id bigint,
    CONSTRAINT organization_members_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('invited'::character varying)::text, ('suspended'::character varying)::text, ('left'::character varying)::text])))
);


--
-- Name: organization_members_membership_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organization_members_membership_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organization_members_membership_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organization_members_membership_id_seq OWNED BY public.organization_members.membership_id;


--
-- Name: organization_message_menu_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_message_menu_permissions (
    permission_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    menu_item_id bigint NOT NULL,
    permission_type character varying(20) DEFAULT 'show'::character varying NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    CONSTRAINT chk_organization_message_menu_permissions_status CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text]))),
    CONSTRAINT organization_message_menu_permissions_permission_type_check CHECK (((permission_type)::text = ANY (ARRAY[('show'::character varying)::text, ('hide'::character varying)::text, ('disable'::character varying)::text])))
);


--
-- Name: organization_message_menu_permissions_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organization_message_menu_permissions_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organization_message_menu_permissions_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organization_message_menu_permissions_permission_id_seq OWNED BY public.organization_message_menu_permissions.permission_id;


--
-- Name: organization_platform_restrictions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_platform_restrictions (
    restriction_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    platform_id bigint NOT NULL,
    restriction_type character varying(10) NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    CONSTRAINT chk_organization_platform_restrictions_status CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text]))),
    CONSTRAINT organization_platform_restrictions_restriction_type_check CHECK (((restriction_type)::text = ANY (ARRAY[('allow'::character varying)::text, ('block'::character varying)::text])))
);


--
-- Name: organization_platform_restrictions_restriction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organization_platform_restrictions_restriction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organization_platform_restrictions_restriction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organization_platform_restrictions_restriction_id_seq OWNED BY public.organization_platform_restrictions.restriction_id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    organization_id bigint NOT NULL,
    org_key character varying(80) NOT NULL,
    name character varying(150) NOT NULL,
    subdomain character varying(100) NOT NULL,
    custom_domain character varying(255),
    owner_id bigint NOT NULL,
    language_id bigint DEFAULT 1 NOT NULL,
    timezone_id bigint DEFAULT 1 NOT NULL,
    logo_url text,
    storage_used_mb bigint DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT organizations_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('suspended'::character varying)::text, ('archived'::character varying)::text])))
);


--
-- Name: organizations_organization_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organizations_organization_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organizations_organization_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organizations_organization_id_seq OWNED BY public.organizations.organization_id;


--
-- Name: otp_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp_verifications (
    otp_id bigint NOT NULL,
    user_id bigint,
    organization_id bigint,
    identifier character varying(255) NOT NULL,
    type character varying(10) NOT NULL,
    otp_code character varying(6) NOT NULL,
    purpose character varying(50) DEFAULT 'verification'::character varying NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    attempt_count smallint DEFAULT 0 NOT NULL,
    max_attempts smallint DEFAULT 5 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address character varying(45),
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT otp_verifications_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('verified'::character varying)::text, ('expired'::character varying)::text, ('failed'::character varying)::text]))),
    CONSTRAINT otp_verifications_type_check CHECK (((type)::text = ANY (ARRAY[('email'::character varying)::text, ('phone'::character varying)::text])))
);


--
-- Name: otp_verifications_otp_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.otp_verifications_otp_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: otp_verifications_otp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.otp_verifications_otp_id_seq OWNED BY public.otp_verifications.otp_id;


--
-- Name: payment_gateways; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_gateways (
    payment_gateway_id bigint NOT NULL,
    gateway_key character varying(50) NOT NULL,
    gateway_name character varying(100) NOT NULL,
    provider character varying(100),
    is_enabled boolean DEFAULT false NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    config_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_gateways_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: payment_gateways_payment_gateway_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_gateways_payment_gateway_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_gateways_payment_gateway_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_gateways_payment_gateway_id_seq OWNED BY public.payment_gateways.payment_gateway_id;


--
-- Name: payment_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_history (
    payment_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    subscription_id bigint,
    plan_id bigint,
    amount numeric(12,2) NOT NULL,
    payment_date timestamp with time zone DEFAULT now() NOT NULL,
    payment_status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    invoice_number character varying(50) NOT NULL,
    transaction_id character varying(100),
    payment_method character varying(50),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    currency_code character varying(10),
    user_count integer,
    billing_type character varying(20),
    coupon_code character varying(40),
    discount_amount numeric(12,2),
    country character varying(80),
    state character varying(120),
    city character varying(120),
    postal_code character varying(40),
    billing_name character varying(120),
    billing_email character varying(255),
    company_name character varying(160),
    address_line1 text,
    period_months integer DEFAULT 1 NOT NULL,
    failure_reason jsonb,
    retried_by_payment_id integer,
    CONSTRAINT chk_payment_history_payment_status CHECK (((payment_status)::text = ANY (ARRAY[('pending'::character varying)::text, ('success'::character varying)::text, ('failed'::character varying)::text, ('refunded'::character varying)::text])))
);


--
-- Name: payment_history_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_history_payment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_history_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_history_payment_id_seq OWNED BY public.payment_history.payment_id;


--
-- Name: plan_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_features (
    plan_feature_id bigint NOT NULL,
    plan_id bigint NOT NULL,
    feature_name character varying(255) NOT NULL,
    feature_description text,
    feature_icon character varying(100),
    section_label character varying(100) DEFAULT 'Plan Features'::character varying NOT NULL,
    display_order smallint DEFAULT 10 NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT plan_features_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: plan_features_plan_feature_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plan_features_plan_feature_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plan_features_plan_feature_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plan_features_plan_feature_id_seq OWNED BY public.plan_features.plan_feature_id;


--
-- Name: plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plans (
    plan_id bigint NOT NULL,
    plan_key character varying(50) NOT NULL,
    plan_name character varying(100) NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    interval_days integer NOT NULL,
    max_users integer DEFAULT 10 NOT NULL,
    max_storage_mb bigint DEFAULT 500 NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    default_currency character varying(3) DEFAULT 'INR'::character varying NOT NULL,
    CONSTRAINT chk_plans_default_currency CHECK (((default_currency)::text ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT plans_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: plans_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plans_plan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plans_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plans_plan_id_seq OWNED BY public.plans.plan_id;


--
-- Name: platforms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platforms (
    platform_id bigint NOT NULL,
    platform_key character varying(80) NOT NULL,
    platform_name character varying(100) NOT NULL,
    category character varying(20) DEFAULT 'other'::character varying NOT NULL,
    icon_class character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT platforms_category_check CHECK (((category)::text = ANY (ARRAY[('browser'::character varying)::text, ('os'::character varying)::text, ('device'::character varying)::text, ('other'::character varying)::text])))
);


--
-- Name: platforms_platform_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platforms_platform_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platforms_platform_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platforms_platform_id_seq OWNED BY public.platforms.platform_id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    role_id bigint NOT NULL,
    role_key character varying(50) NOT NULL,
    role_name character varying(100) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT roles_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- Name: scheduled_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scheduled_messages (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    thread_id character varying(50) NOT NULL,
    message text NOT NULL,
    message_type character varying(20) DEFAULT 'text'::character varying NOT NULL,
    metadata jsonb,
    send_at timestamp with time zone NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: scheduled_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.scheduled_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scheduled_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.scheduled_messages_id_seq OWNED BY public.scheduled_messages.id;


--
-- Name: site_detail_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_detail_addresses (
    site_detail_address_id bigint NOT NULL,
    site_detail_id bigint NOT NULL,
    label character varying(50),
    address_line_1 character varying(255) NOT NULL,
    address_line_2 character varying(255),
    city character varying(100),
    state character varying(100),
    country character varying(100),
    postal_code character varying(20),
    is_primary boolean DEFAULT false NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT site_detail_addresses_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: site_detail_addresses_site_detail_address_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_detail_addresses_site_detail_address_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_detail_addresses_site_detail_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_detail_addresses_site_detail_address_id_seq OWNED BY public.site_detail_addresses.site_detail_address_id;


--
-- Name: site_detail_emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_detail_emails (
    site_detail_email_id bigint NOT NULL,
    site_detail_id bigint NOT NULL,
    email_address character varying(255) NOT NULL,
    label character varying(50),
    is_primary boolean DEFAULT false NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT site_detail_emails_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: site_detail_emails_site_detail_email_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_detail_emails_site_detail_email_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_detail_emails_site_detail_email_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_detail_emails_site_detail_email_id_seq OWNED BY public.site_detail_emails.site_detail_email_id;


--
-- Name: site_detail_phones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_detail_phones (
    site_detail_phone_id bigint NOT NULL,
    site_detail_id bigint NOT NULL,
    phone_number character varying(30) NOT NULL,
    label character varying(50),
    is_primary boolean DEFAULT false NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT site_detail_phones_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: site_detail_phones_site_detail_phone_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_detail_phones_site_detail_phone_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_detail_phones_site_detail_phone_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_detail_phones_site_detail_phone_id_seq OWNED BY public.site_detail_phones.site_detail_phone_id;


--
-- Name: site_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_details (
    site_detail_id bigint NOT NULL,
    brand_name character varying(150) NOT NULL,
    logo_url text,
    mascot_url text,
    google_plus_url text,
    linkedin_url text,
    twitter_url text,
    youtube_url text,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT site_details_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: site_details_site_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_details_site_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_details_site_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_details_site_detail_id_seq OWNED BY public.site_details.site_detail_id;


--
-- Name: smtp_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.smtp_settings (
    smtp_settings_id integer NOT NULL,
    host character varying(255) DEFAULT ''::character varying NOT NULL,
    port integer DEFAULT 587 NOT NULL,
    secure boolean DEFAULT false NOT NULL,
    smtp_user character varying(255) DEFAULT ''::character varying NOT NULL,
    smtp_pass character varying(255) DEFAULT ''::character varying NOT NULL,
    from_address character varying(255) DEFAULT ''::character varying,
    contact_notify_to text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    label character varying(255) DEFAULT 'Default'::character varying NOT NULL,
    status character varying(20) DEFAULT 'inactive'::character varying NOT NULL
);


--
-- Name: smtp_settings_smtp_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.smtp_settings_smtp_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: smtp_settings_smtp_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.smtp_settings_smtp_settings_id_seq OWNED BY public.smtp_settings.smtp_settings_id;


--
-- Name: states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.states (
    state_id bigint NOT NULL,
    country_id bigint NOT NULL,
    iso_code character varying(20),
    name character varying(120) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT states_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: states_state_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.states_state_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: states_state_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.states_state_id_seq OWNED BY public.states.state_id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    subscription_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    plan_id bigint NOT NULL,
    status character varying(30) DEFAULT 'active'::character varying NOT NULL,
    start_date date NOT NULL,
    end_date date,
    max_users integer NOT NULL,
    max_storage_mb bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT subscriptions_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('trial'::character varying)::text, ('expired'::character varying)::text, ('cancelled'::character varying)::text, ('grace'::character varying)::text])))
);


--
-- Name: subscriptions_subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subscriptions_subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscriptions_subscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subscriptions_subscription_id_seq OWNED BY public.subscriptions.subscription_id;


--
-- Name: summary_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.summary_cache (
    cache_id bigint NOT NULL,
    cache_key character varying(64) NOT NULL,
    summary text NOT NULL,
    provider character varying(20) DEFAULT 'gemini'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: summary_cache_cache_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.summary_cache_cache_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: summary_cache_cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.summary_cache_cache_id_seq OWNED BY public.summary_cache.cache_id;


--
-- Name: timezones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timezones (
    timezone_id bigint NOT NULL,
    timezone_code character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    utc_offset character varying(10) NOT NULL,
    country_code character(2),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT timezones_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: timezones_timezone_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.timezones_timezone_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: timezones_timezone_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.timezones_timezone_id_seq OWNED BY public.timezones.timezone_id;


--
-- Name: user_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_devices (
    device_id bigint NOT NULL,
    user_id bigint NOT NULL,
    device_name character varying(120),
    device_type character varying(20) DEFAULT 'other'::character varying NOT NULL,
    ip_address character varying(45) NOT NULL,
    user_agent text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    accuracy_radius integer,
    country character varying(100),
    city character varying(100),
    last_active_at timestamp with time zone DEFAULT now() NOT NULL,
    is_trusted boolean DEFAULT false NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    hostname character varying(255),
    os_name character varying(120),
    CONSTRAINT user_devices_device_type_check CHECK (((device_type)::text = ANY (ARRAY[('mobile'::character varying)::text, ('desktop'::character varying)::text, ('tablet'::character varying)::text, ('other'::character varying)::text]))),
    CONSTRAINT user_devices_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('logged_out'::character varying)::text, ('suspicious'::character varying)::text, ('blocked'::character varying)::text])))
);


--
-- Name: user_devices_device_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_devices_device_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_devices_device_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_devices_device_id_seq OWNED BY public.user_devices.device_id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    session_id bigint NOT NULL,
    user_id bigint NOT NULL,
    organization_id bigint,
    refresh_token_hash character varying(255) NOT NULL,
    user_agent text,
    ip_address inet,
    device_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_sessions_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('revoked'::character varying)::text, ('expired'::character varying)::text])))
);


--
-- Name: user_sessions_session_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_sessions_session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_sessions_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_sessions_session_id_seq OWNED BY public.user_sessions.session_id;


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_settings (
    setting_id bigint NOT NULL,
    user_id bigint NOT NULL,
    setting_key character varying(80) NOT NULL,
    setting_value jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_settings_setting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_settings_setting_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_settings_setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_settings_setting_id_seq OWNED BY public.user_settings.setting_id;


--
-- Name: user_thread_mutes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_thread_mutes (
    mute_id bigint NOT NULL,
    user_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    thread_id character varying(50) NOT NULL,
    mute_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_thread_mutes_mute_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_thread_mutes_mute_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_thread_mutes_mute_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_thread_mutes_mute_id_seq OWNED BY public.user_thread_mutes.mute_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id bigint NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(120) NOT NULL,
    password_hash character varying(255) NOT NULL,
    profile_url text,
    mobile character varying(20),
    is_platform_admin boolean DEFAULT false NOT NULL,
    is_global_member boolean DEFAULT false NOT NULL,
    email_verified_at timestamp with time zone,
    mobile_verified_at timestamp with time zone,
    last_login_at timestamp with time zone,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    timezone character varying(50) DEFAULT 'UTC'::character varying NOT NULL,
    CONSTRAINT users_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('suspended'::character varying)::text, ('invited'::character varying)::text, ('archived'::character varying)::text])))
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: activity_log log_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log ALTER COLUMN log_id SET DEFAULT nextval('public.activity_log_log_id_seq'::regclass);


--
-- Name: ai_providers provider_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_providers ALTER COLUMN provider_id SET DEFAULT nextval('public.ai_providers_provider_id_seq'::regclass);


--
-- Name: assistant_broadcasts broadcast_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_broadcasts ALTER COLUMN broadcast_id SET DEFAULT nextval('public.assistant_broadcasts_broadcast_id_seq'::regclass);


--
-- Name: assistant_conversations conversation_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_conversations ALTER COLUMN conversation_id SET DEFAULT nextval('public.assistant_conversations_conversation_id_seq'::regclass);


--
-- Name: assistant_feedback feedback_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_feedback ALTER COLUMN feedback_id SET DEFAULT nextval('public.assistant_feedback_feedback_id_seq'::regclass);


--
-- Name: assistant_knowledge knowledge_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_knowledge ALTER COLUMN knowledge_id SET DEFAULT nextval('public.assistant_knowledge_knowledge_id_seq'::regclass);


--
-- Name: assistant_rate_limits rate_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_rate_limits ALTER COLUMN rate_id SET DEFAULT nextval('public.assistant_rate_limits_rate_id_seq'::regclass);


--
-- Name: assistant_usage usage_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_usage ALTER COLUMN usage_id SET DEFAULT nextval('public.assistant_usage_usage_id_seq'::regclass);


--
-- Name: billing_address_audit billing_address_audit_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_address_audit ALTER COLUMN billing_address_audit_id SET DEFAULT nextval('public.billing_address_audit_billing_address_audit_id_seq'::regclass);


--
-- Name: billing_addresses billing_address_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_addresses ALTER COLUMN billing_address_id SET DEFAULT nextval('public.billing_addresses_billing_address_id_seq'::regclass);


--
-- Name: billing_checkout_sessions checkout_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_checkout_sessions ALTER COLUMN checkout_id SET DEFAULT nextval('public.billing_checkout_sessions_checkout_id_seq'::regclass);


--
-- Name: contact_us_requests contact_request_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_us_requests ALTER COLUMN contact_request_id SET DEFAULT nextval('public.contact_us_requests_contact_request_id_seq'::regclass);


--
-- Name: countries country_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries ALTER COLUMN country_id SET DEFAULT nextval('public.countries_country_id_seq'::regclass);


--
-- Name: country_currency_priority country_currency_priority_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country_currency_priority ALTER COLUMN country_currency_priority_id SET DEFAULT nextval('public.country_currency_priority_country_currency_priority_id_seq'::regclass);


--
-- Name: coupons coupon_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons ALTER COLUMN coupon_id SET DEFAULT nextval('public.coupons_coupon_id_seq'::regclass);


--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: designations designation_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations ALTER COLUMN designation_id SET DEFAULT nextval('public.designations_designation_id_seq'::regclass);


--
-- Name: disappearing_threads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disappearing_threads ALTER COLUMN id SET DEFAULT nextval('public.disappearing_threads_id_seq'::regclass);


--
-- Name: feature_categories feature_category_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_categories ALTER COLUMN feature_category_id SET DEFAULT nextval('public.feature_categories_feature_category_id_seq'::regclass);


--
-- Name: feature_items feature_item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_items ALTER COLUMN feature_item_id SET DEFAULT nextval('public.feature_items_feature_item_id_seq'::regclass);


--
-- Name: global_access global_access_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_access ALTER COLUMN global_access_id SET DEFAULT nextval('public.global_access_global_access_id_seq'::regclass);


--
-- Name: group_members group_member_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members ALTER COLUMN group_member_id SET DEFAULT nextval('public.group_members_group_member_id_seq'::regclass);


--
-- Name: group_message_actions action_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_actions ALTER COLUMN action_id SET DEFAULT nextval('public.group_message_actions_action_id_seq'::regclass);


--
-- Name: group_message_files file_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_files ALTER COLUMN file_id SET DEFAULT nextval('public.group_message_files_file_id_seq'::regclass);


--
-- Name: group_message_reads read_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_reads ALTER COLUMN read_id SET DEFAULT nextval('public.group_message_reads_read_id_seq'::regclass);


--
-- Name: group_message_recipients recipient_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_recipients ALTER COLUMN recipient_id SET DEFAULT nextval('public.group_message_recipients_recipient_id_seq'::regclass);


--
-- Name: group_messages group_message_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages ALTER COLUMN group_message_id SET DEFAULT nextval('public.group_messages_group_message_id_seq'::regclass);


--
-- Name: group_permissions permission_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_permissions ALTER COLUMN permission_id SET DEFAULT nextval('public.group_permissions_permission_id_seq'::regclass);


--
-- Name: group_poll_options option_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_poll_options ALTER COLUMN option_id SET DEFAULT nextval('public.group_poll_options_option_id_seq'::regclass);


--
-- Name: group_poll_votes vote_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_poll_votes ALTER COLUMN vote_id SET DEFAULT nextval('public.group_poll_votes_vote_id_seq'::regclass);


--
-- Name: group_polls poll_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_polls ALTER COLUMN poll_id SET DEFAULT nextval('public.group_polls_poll_id_seq'::regclass);


--
-- Name: group_timeline timeline_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_timeline ALTER COLUMN timeline_id SET DEFAULT nextval('public.group_timeline_timeline_id_seq'::regclass);


--
-- Name: groups group_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups ALTER COLUMN group_id SET DEFAULT nextval('public.groups_group_id_seq'::regclass);


--
-- Name: languages language_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages ALTER COLUMN language_id SET DEFAULT nextval('public.languages_language_id_seq'::regclass);


--
-- Name: locations location_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations ALTER COLUMN location_id SET DEFAULT nextval('public.locations_location_id_seq'::regclass);


--
-- Name: meeting_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_messages ALTER COLUMN id SET DEFAULT nextval('public.meeting_messages_id_seq'::regclass);


--
-- Name: meeting_participants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_participants ALTER COLUMN id SET DEFAULT nextval('public.meeting_participants_id_seq'::regclass);


--
-- Name: meetings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings ALTER COLUMN id SET DEFAULT nextval('public.meetings_id_seq'::regclass);


--
-- Name: message_actions action_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_actions ALTER COLUMN action_id SET DEFAULT nextval('public.message_actions_action_id_seq'::regclass);


--
-- Name: message_files file_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_files ALTER COLUMN file_id SET DEFAULT nextval('public.message_files_file_id_seq'::regclass);


--
-- Name: message_menu_items menu_item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_menu_items ALTER COLUMN menu_item_id SET DEFAULT nextval('public.message_menu_items_menu_item_id_seq'::regclass);


--
-- Name: messages message_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN message_id SET DEFAULT nextval('public.messages_message_id_seq'::regclass);


--
-- Name: organization_controls control_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_controls ALTER COLUMN control_id SET DEFAULT nextval('public.organization_controls_control_id_seq'::regclass);


--
-- Name: organization_ip_restrictions restriction_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_ip_restrictions ALTER COLUMN restriction_id SET DEFAULT nextval('public.organization_ip_restrictions_restriction_id_seq'::regclass);


--
-- Name: organization_members membership_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members ALTER COLUMN membership_id SET DEFAULT nextval('public.organization_members_membership_id_seq'::regclass);


--
-- Name: organization_message_menu_permissions permission_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_message_menu_permissions ALTER COLUMN permission_id SET DEFAULT nextval('public.organization_message_menu_permissions_permission_id_seq'::regclass);


--
-- Name: organization_platform_restrictions restriction_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_platform_restrictions ALTER COLUMN restriction_id SET DEFAULT nextval('public.organization_platform_restrictions_restriction_id_seq'::regclass);


--
-- Name: organizations organization_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations ALTER COLUMN organization_id SET DEFAULT nextval('public.organizations_organization_id_seq'::regclass);


--
-- Name: otp_verifications otp_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_verifications ALTER COLUMN otp_id SET DEFAULT nextval('public.otp_verifications_otp_id_seq'::regclass);


--
-- Name: payment_gateways payment_gateway_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_gateways ALTER COLUMN payment_gateway_id SET DEFAULT nextval('public.payment_gateways_payment_gateway_id_seq'::regclass);


--
-- Name: payment_history payment_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history ALTER COLUMN payment_id SET DEFAULT nextval('public.payment_history_payment_id_seq'::regclass);


--
-- Name: plan_features plan_feature_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_features ALTER COLUMN plan_feature_id SET DEFAULT nextval('public.plan_features_plan_feature_id_seq'::regclass);


--
-- Name: plans plan_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans ALTER COLUMN plan_id SET DEFAULT nextval('public.plans_plan_id_seq'::regclass);


--
-- Name: platforms platform_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platforms ALTER COLUMN platform_id SET DEFAULT nextval('public.platforms_platform_id_seq'::regclass);


--
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- Name: scheduled_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_messages ALTER COLUMN id SET DEFAULT nextval('public.scheduled_messages_id_seq'::regclass);


--
-- Name: site_detail_addresses site_detail_address_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_detail_addresses ALTER COLUMN site_detail_address_id SET DEFAULT nextval('public.site_detail_addresses_site_detail_address_id_seq'::regclass);


--
-- Name: site_detail_emails site_detail_email_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_detail_emails ALTER COLUMN site_detail_email_id SET DEFAULT nextval('public.site_detail_emails_site_detail_email_id_seq'::regclass);


--
-- Name: site_detail_phones site_detail_phone_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_detail_phones ALTER COLUMN site_detail_phone_id SET DEFAULT nextval('public.site_detail_phones_site_detail_phone_id_seq'::regclass);


--
-- Name: site_details site_detail_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_details ALTER COLUMN site_detail_id SET DEFAULT nextval('public.site_details_site_detail_id_seq'::regclass);


--
-- Name: smtp_settings smtp_settings_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smtp_settings ALTER COLUMN smtp_settings_id SET DEFAULT nextval('public.smtp_settings_smtp_settings_id_seq'::regclass);


--
-- Name: states state_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.states ALTER COLUMN state_id SET DEFAULT nextval('public.states_state_id_seq'::regclass);


--
-- Name: subscriptions subscription_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN subscription_id SET DEFAULT nextval('public.subscriptions_subscription_id_seq'::regclass);


--
-- Name: summary_cache cache_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summary_cache ALTER COLUMN cache_id SET DEFAULT nextval('public.summary_cache_cache_id_seq'::regclass);


--
-- Name: timezones timezone_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timezones ALTER COLUMN timezone_id SET DEFAULT nextval('public.timezones_timezone_id_seq'::regclass);


--
-- Name: user_devices device_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices ALTER COLUMN device_id SET DEFAULT nextval('public.user_devices_device_id_seq'::regclass);


--
-- Name: user_sessions session_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN session_id SET DEFAULT nextval('public.user_sessions_session_id_seq'::regclass);


--
-- Name: user_settings setting_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings ALTER COLUMN setting_id SET DEFAULT nextval('public.user_settings_setting_id_seq'::regclass);


--
-- Name: user_thread_mutes mute_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_thread_mutes ALTER COLUMN mute_id SET DEFAULT nextval('public.user_thread_mutes_mute_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: activity_log activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_pkey PRIMARY KEY (log_id);


--
-- Name: ai_providers ai_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_providers
    ADD CONSTRAINT ai_providers_pkey PRIMARY KEY (provider_id);


--
-- Name: ai_providers ai_providers_provider_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_providers
    ADD CONSTRAINT ai_providers_provider_key_key UNIQUE (provider_key);


--
-- Name: assistant_broadcasts assistant_broadcasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_broadcasts
    ADD CONSTRAINT assistant_broadcasts_pkey PRIMARY KEY (broadcast_id);


--
-- Name: assistant_conversations assistant_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_conversations
    ADD CONSTRAINT assistant_conversations_pkey PRIMARY KEY (conversation_id);


--
-- Name: assistant_feedback assistant_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_feedback
    ADD CONSTRAINT assistant_feedback_pkey PRIMARY KEY (feedback_id);


--
-- Name: assistant_knowledge assistant_knowledge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_knowledge
    ADD CONSTRAINT assistant_knowledge_pkey PRIMARY KEY (knowledge_id);


--
-- Name: assistant_rate_limits assistant_rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_rate_limits
    ADD CONSTRAINT assistant_rate_limits_pkey PRIMARY KEY (rate_id);


--
-- Name: assistant_rate_limits assistant_rate_limits_user_id_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_rate_limits
    ADD CONSTRAINT assistant_rate_limits_user_id_organization_id_key UNIQUE (user_id, organization_id);


--
-- Name: assistant_usage assistant_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_usage
    ADD CONSTRAINT assistant_usage_pkey PRIMARY KEY (usage_id);


--
-- Name: assistant_usage assistant_usage_user_id_org_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_usage
    ADD CONSTRAINT assistant_usage_user_id_org_id_date_key UNIQUE (user_id, org_id, date);


--
-- Name: billing_address_audit billing_address_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_address_audit
    ADD CONSTRAINT billing_address_audit_pkey PRIMARY KEY (billing_address_audit_id);


--
-- Name: billing_addresses billing_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_addresses
    ADD CONSTRAINT billing_addresses_pkey PRIMARY KEY (billing_address_id);


--
-- Name: billing_checkout_sessions billing_checkout_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_checkout_sessions
    ADD CONSTRAINT billing_checkout_sessions_pkey PRIMARY KEY (checkout_id);


--
-- Name: billing_checkout_sessions billing_checkout_sessions_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_checkout_sessions
    ADD CONSTRAINT billing_checkout_sessions_session_id_key UNIQUE (session_id);


--
-- Name: contact_us_requests contact_us_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_us_requests
    ADD CONSTRAINT contact_us_requests_pkey PRIMARY KEY (contact_request_id);


--
-- Name: countries countries_iso_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_iso_code_key UNIQUE (iso_code);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (country_id);


--
-- Name: country_currency_priority country_currency_priority_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country_currency_priority
    ADD CONSTRAINT country_currency_priority_pkey PRIMARY KEY (country_currency_priority_id);


--
-- Name: country_currency_priority country_currency_priority_rank_order_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country_currency_priority
    ADD CONSTRAINT country_currency_priority_rank_order_key UNIQUE (rank_order);


--
-- Name: coupons coupons_coupon_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_coupon_code_key UNIQUE (coupon_code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (coupon_id);


--
-- Name: currencies currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.currencies
    ADD CONSTRAINT currencies_pkey PRIMARY KEY (currency_code);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- Name: designations designations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (designation_id);


--
-- Name: disappearing_threads disappearing_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disappearing_threads
    ADD CONSTRAINT disappearing_threads_pkey PRIMARY KEY (id);


--
-- Name: feature_categories feature_categories_category_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_categories
    ADD CONSTRAINT feature_categories_category_key_key UNIQUE (category_key);


--
-- Name: feature_categories feature_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_categories
    ADD CONSTRAINT feature_categories_pkey PRIMARY KEY (feature_category_id);


--
-- Name: feature_items feature_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_items
    ADD CONSTRAINT feature_items_pkey PRIMARY KEY (feature_item_id);


--
-- Name: global_access global_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_access
    ADD CONSTRAINT global_access_pkey PRIMARY KEY (global_access_id);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (group_member_id);


--
-- Name: group_message_actions group_message_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_actions
    ADD CONSTRAINT group_message_actions_pkey PRIMARY KEY (action_id);


--
-- Name: group_message_files group_message_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_files
    ADD CONSTRAINT group_message_files_pkey PRIMARY KEY (file_id);


--
-- Name: group_message_reads group_message_reads_group_message_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_reads
    ADD CONSTRAINT group_message_reads_group_message_id_user_id_key UNIQUE (group_message_id, user_id);


--
-- Name: group_message_reads group_message_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_reads
    ADD CONSTRAINT group_message_reads_pkey PRIMARY KEY (read_id);


--
-- Name: group_message_recipients group_message_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_recipients
    ADD CONSTRAINT group_message_recipients_pkey PRIMARY KEY (recipient_id);


--
-- Name: group_messages group_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT group_messages_pkey PRIMARY KEY (group_message_id);


--
-- Name: group_permissions group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_permissions
    ADD CONSTRAINT group_permissions_pkey PRIMARY KEY (permission_id);


--
-- Name: group_poll_options group_poll_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_poll_options
    ADD CONSTRAINT group_poll_options_pkey PRIMARY KEY (option_id);


--
-- Name: group_poll_votes group_poll_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_poll_votes
    ADD CONSTRAINT group_poll_votes_pkey PRIMARY KEY (vote_id);


--
-- Name: group_polls group_polls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_polls
    ADD CONSTRAINT group_polls_pkey PRIMARY KEY (poll_id);


--
-- Name: group_timeline group_timeline_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_timeline
    ADD CONSTRAINT group_timeline_pkey PRIMARY KEY (timeline_id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (group_id);


--
-- Name: languages languages_language_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_language_code_key UNIQUE (language_code);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (language_id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (location_id);


--
-- Name: meeting_messages meeting_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_messages
    ADD CONSTRAINT meeting_messages_pkey PRIMARY KEY (id);


--
-- Name: meeting_participants meeting_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_participants
    ADD CONSTRAINT meeting_participants_pkey PRIMARY KEY (id);


--
-- Name: meetings meetings_meeting_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_meeting_id_key UNIQUE (meeting_id);


--
-- Name: meetings meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_pkey PRIMARY KEY (id);


--
-- Name: message_actions message_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_actions
    ADD CONSTRAINT message_actions_pkey PRIMARY KEY (action_id);


--
-- Name: message_files message_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_files
    ADD CONSTRAINT message_files_pkey PRIMARY KEY (file_id);


--
-- Name: message_menu_items message_menu_items_menu_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_menu_items
    ADD CONSTRAINT message_menu_items_menu_key_key UNIQUE (menu_key);


--
-- Name: message_menu_items message_menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_menu_items
    ADD CONSTRAINT message_menu_items_pkey PRIMARY KEY (menu_item_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);


--
-- Name: organization_controls organization_controls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_controls
    ADD CONSTRAINT organization_controls_pkey PRIMARY KEY (control_id);


--
-- Name: organization_ip_restrictions organization_ip_restrictions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_ip_restrictions
    ADD CONSTRAINT organization_ip_restrictions_pkey PRIMARY KEY (restriction_id);


--
-- Name: organization_members organization_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_pkey PRIMARY KEY (membership_id);


--
-- Name: organization_message_menu_permissions organization_message_menu_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_message_menu_permissions
    ADD CONSTRAINT organization_message_menu_permissions_pkey PRIMARY KEY (permission_id);


--
-- Name: organization_platform_restrictions organization_platform_restrictions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_platform_restrictions
    ADD CONSTRAINT organization_platform_restrictions_pkey PRIMARY KEY (restriction_id);


--
-- Name: organizations organizations_custom_domain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_custom_domain_key UNIQUE (custom_domain);


--
-- Name: organizations organizations_org_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_org_key_key UNIQUE (org_key);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (organization_id);


--
-- Name: organizations organizations_subdomain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_subdomain_key UNIQUE (subdomain);


--
-- Name: otp_verifications otp_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_verifications
    ADD CONSTRAINT otp_verifications_pkey PRIMARY KEY (otp_id);


--
-- Name: payment_gateways payment_gateways_gateway_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_gateways
    ADD CONSTRAINT payment_gateways_gateway_key_key UNIQUE (gateway_key);


--
-- Name: payment_gateways payment_gateways_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_gateways
    ADD CONSTRAINT payment_gateways_pkey PRIMARY KEY (payment_gateway_id);


--
-- Name: payment_history payment_history_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_invoice_number_key UNIQUE (invoice_number);


--
-- Name: payment_history payment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_pkey PRIMARY KEY (payment_id);


--
-- Name: plan_features plan_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_features
    ADD CONSTRAINT plan_features_pkey PRIMARY KEY (plan_feature_id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (plan_id);


--
-- Name: plans plans_plan_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_plan_key_key UNIQUE (plan_key);


--
-- Name: platforms platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_pkey PRIMARY KEY (platform_id);


--
-- Name: platforms platforms_platform_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_platform_key_key UNIQUE (platform_key);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: roles roles_role_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_key_key UNIQUE (role_key);


--
-- Name: scheduled_messages scheduled_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_messages
    ADD CONSTRAINT scheduled_messages_pkey PRIMARY KEY (id);


--
-- Name: site_detail_addresses site_detail_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_detail_addresses
    ADD CONSTRAINT site_detail_addresses_pkey PRIMARY KEY (site_detail_address_id);


--
-- Name: site_detail_emails site_detail_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_detail_emails
    ADD CONSTRAINT site_detail_emails_pkey PRIMARY KEY (site_detail_email_id);


--
-- Name: site_detail_phones site_detail_phones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_detail_phones
    ADD CONSTRAINT site_detail_phones_pkey PRIMARY KEY (site_detail_phone_id);


--
-- Name: site_details site_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_details
    ADD CONSTRAINT site_details_pkey PRIMARY KEY (site_detail_id);


--
-- Name: smtp_settings smtp_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smtp_settings
    ADD CONSTRAINT smtp_settings_pkey PRIMARY KEY (smtp_settings_id);


--
-- Name: states states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT states_pkey PRIMARY KEY (state_id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (subscription_id);


--
-- Name: summary_cache summary_cache_cache_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summary_cache
    ADD CONSTRAINT summary_cache_cache_key_key UNIQUE (cache_key);


--
-- Name: summary_cache summary_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summary_cache
    ADD CONSTRAINT summary_cache_pkey PRIMARY KEY (cache_id);


--
-- Name: timezones timezones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timezones
    ADD CONSTRAINT timezones_pkey PRIMARY KEY (timezone_id);


--
-- Name: timezones timezones_timezone_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timezones
    ADD CONSTRAINT timezones_timezone_code_key UNIQUE (timezone_code);


--
-- Name: organization_controls uk_control_feature; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_controls
    ADD CONSTRAINT uk_control_feature UNIQUE (organization_id, feature_key);


--
-- Name: departments uk_dept_org_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT uk_dept_org_name UNIQUE (organization_id, name);


--
-- Name: designations uk_desig_org_dept_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT uk_desig_org_dept_name UNIQUE (organization_id, department_id, name);


--
-- Name: feature_items uk_feature_item_title_per_category; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_items
    ADD CONSTRAINT uk_feature_item_title_per_category UNIQUE (feature_category_id, title);


--
-- Name: global_access uk_global_access; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_access
    ADD CONSTRAINT uk_global_access UNIQUE (org_id, user_id, allow_user_id);


--
-- Name: group_permissions uk_gperm_feature; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_permissions
    ADD CONSTRAINT uk_gperm_feature UNIQUE (group_id, feature_key);


--
-- Name: group_members uk_group_user; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT uk_group_user UNIQUE (group_id, user_id);


--
-- Name: organization_members uk_org_user; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT uk_org_user UNIQUE (organization_id, user_id);


--
-- Name: plan_features uk_plan_feature_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_features
    ADD CONSTRAINT uk_plan_feature_name UNIQUE (plan_id, feature_name);


--
-- Name: group_message_recipients uk_recipient; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_recipients
    ADD CONSTRAINT uk_recipient UNIQUE (group_message_id, user_id);


--
-- Name: site_detail_emails uk_site_detail_emails_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_detail_emails
    ADD CONSTRAINT uk_site_detail_emails_unique UNIQUE (site_detail_id, email_address);


--
-- Name: site_detail_phones uk_site_detail_phones_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_detail_phones
    ADD CONSTRAINT uk_site_detail_phones_unique UNIQUE (site_detail_id, phone_number);


--
-- Name: states uk_states_country_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT uk_states_country_name UNIQUE (country_id, name);


--
-- Name: country_currency_priority uq_country_currency_priority; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country_currency_priority
    ADD CONSTRAINT uq_country_currency_priority UNIQUE (country_iso_code);


--
-- Name: user_devices user_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_pkey PRIMARY KEY (device_id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (session_id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (setting_id);


--
-- Name: user_thread_mutes user_thread_mutes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_thread_mutes
    ADD CONSTRAINT user_thread_mutes_pkey PRIMARY KEY (mute_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_act_msg_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_act_msg_id ON public.message_actions USING btree (message_id);


--
-- Name: idx_act_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_act_user_id ON public.message_actions USING btree (user_id);


--
-- Name: idx_activity_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_action ON public.activity_log USING btree (action);


--
-- Name: idx_activity_actor_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_actor_time ON public.activity_log USING btree (actor_id, occurred_at DESC);


--
-- Name: idx_activity_log_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_log_action ON public.activity_log USING btree (action);


--
-- Name: idx_activity_log_actor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_log_actor_id ON public.activity_log USING btree (actor_id);


--
-- Name: idx_activity_log_context_org; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_log_context_org ON public.activity_log USING btree (context_organization_id);


--
-- Name: idx_activity_log_occurred_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_log_occurred_at ON public.activity_log USING btree (occurred_at DESC);


--
-- Name: idx_activity_log_org_action_time_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_log_org_action_time_desc ON public.activity_log USING btree (context_organization_id, action, occurred_at DESC);


--
-- Name: idx_activity_log_org_status_time_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_log_org_status_time_desc ON public.activity_log USING btree (context_organization_id, status, occurred_at DESC);


--
-- Name: idx_activity_log_target_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_log_target_user ON public.activity_log USING btree (target_type, target_id);


--
-- Name: idx_activity_occurred; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_occurred ON public.activity_log USING btree (occurred_at DESC);


--
-- Name: idx_activity_org_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_org_time ON public.activity_log USING btree (context_organization_id, occurred_at DESC);


--
-- Name: idx_activity_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_target ON public.activity_log USING btree (target_type, target_id);


--
-- Name: idx_assistant_conv_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assistant_conv_user ON public.assistant_conversations USING btree (user_id, updated_at DESC);


--
-- Name: idx_assistant_feedback_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assistant_feedback_user ON public.assistant_feedback USING btree (user_id, created_at DESC);


--
-- Name: idx_assistant_usage_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assistant_usage_date ON public.assistant_usage USING btree (date DESC);


--
-- Name: idx_bcs_gateway_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bcs_gateway_status ON public.billing_checkout_sessions USING btree (gateway, status, created_at DESC);


--
-- Name: idx_bcs_org_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bcs_org_status ON public.billing_checkout_sessions USING btree (organization_id, status, created_at DESC);


--
-- Name: idx_billing_address_audit_org_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_address_audit_org_time ON public.billing_address_audit USING btree (organization_id, created_at DESC);


--
-- Name: idx_billing_addresses_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_addresses_email ON public.billing_addresses USING btree (lower((email)::text));


--
-- Name: idx_billing_addresses_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_addresses_org_id ON public.billing_addresses USING btree (organization_id);


--
-- Name: idx_broadcasts_org_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_broadcasts_org_active ON public.assistant_broadcasts USING btree (organization_id) WHERE (is_active = true);


--
-- Name: idx_ccp_currency_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ccp_currency_code ON public.country_currency_priority USING btree (currency_code);


--
-- Name: idx_ccp_status_rank; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ccp_status_rank ON public.country_currency_priority USING btree (status, rank_order);


--
-- Name: idx_contact_us_requests_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_us_requests_created_at ON public.contact_us_requests USING btree (created_at DESC);


--
-- Name: idx_contact_us_requests_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_us_requests_email ON public.contact_us_requests USING btree (lower((email_address)::text));


--
-- Name: idx_contact_us_requests_mobile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_us_requests_mobile ON public.contact_us_requests USING btree (mobile_number);


--
-- Name: idx_contact_us_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_us_requests_status ON public.contact_us_requests USING btree (status);


--
-- Name: idx_coupons_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupons_status ON public.coupons USING btree (status);


--
-- Name: idx_coupons_upper_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupons_upper_code ON public.coupons USING btree (upper((coupon_code)::text));


--
-- Name: idx_coupons_valid_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupons_valid_to ON public.coupons USING btree (valid_to);


--
-- Name: idx_ctrl_org_feature; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ctrl_org_feature ON public.organization_controls USING btree (organization_id, feature_key);


--
-- Name: idx_ctrl_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ctrl_org_id ON public.organization_controls USING btree (organization_id);


--
-- Name: idx_departments_org_id_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_departments_org_id_desc ON public.departments USING btree (organization_id, department_id DESC);


--
-- Name: idx_dept_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dept_org_id ON public.departments USING btree (organization_id);


--
-- Name: idx_desig_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_desig_org_id ON public.designations USING btree (organization_id);


--
-- Name: idx_designations_org_id_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_designations_org_id_desc ON public.designations USING btree (organization_id, designation_id DESC);


--
-- Name: idx_device_last_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_last_active ON public.user_devices USING btree (last_active_at);


--
-- Name: idx_device_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_status ON public.user_devices USING btree (status);


--
-- Name: idx_device_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_user_id ON public.user_devices USING btree (user_id);


--
-- Name: idx_device_user_last_active_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_user_last_active_desc ON public.user_devices USING btree (user_id, last_active_at DESC);


--
-- Name: idx_device_user_status_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_user_status_active ON public.user_devices USING btree (user_id, status, last_active_at DESC) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_disappearing_threads_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_disappearing_threads_unique ON public.disappearing_threads USING btree (thread_id, organization_id);


--
-- Name: idx_feature_categories_status_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feature_categories_status_order ON public.feature_categories USING btree (status, display_order, feature_category_id);


--
-- Name: idx_feature_items_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feature_items_category_id ON public.feature_items USING btree (feature_category_id);


--
-- Name: idx_feature_items_status_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feature_items_status_order ON public.feature_items USING btree (status, display_order, feature_item_id);


--
-- Name: idx_file_msg_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_file_msg_id ON public.message_files USING btree (message_id);


--
-- Name: idx_gact_msg_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gact_msg_id ON public.group_message_actions USING btree (group_message_id);


--
-- Name: idx_gact_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gact_user_id ON public.group_message_actions USING btree (user_id);


--
-- Name: idx_gfile_msg_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gfile_msg_id ON public.group_message_files USING btree (group_message_id);


--
-- Name: idx_global_access_allow_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_global_access_allow_user_id ON public.global_access USING btree (allow_user_id);


--
-- Name: idx_global_access_org_allow_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_global_access_org_allow_user_status ON public.global_access USING btree (org_id, allow_user_id, status);


--
-- Name: idx_global_access_org_created_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_global_access_org_created_desc ON public.global_access USING btree (org_id, created_at DESC);


--
-- Name: idx_global_access_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_global_access_org_id ON public.global_access USING btree (org_id);


--
-- Name: idx_global_access_org_user_status_created_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_global_access_org_user_status_created_desc ON public.global_access USING btree (org_id, user_id, status, created_at DESC);


--
-- Name: idx_global_access_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_global_access_user_id ON public.global_access USING btree (user_id);


--
-- Name: idx_gmem_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gmem_group_id ON public.group_members USING btree (group_id);


--
-- Name: idx_gmem_group_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gmem_group_status ON public.group_members USING btree (group_id, status);


--
-- Name: idx_gmem_org_status_group_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gmem_org_status_group_desc ON public.group_members USING btree (organization_id, status, group_member_id DESC);


--
-- Name: idx_gmem_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gmem_user_id ON public.group_members USING btree (user_id);


--
-- Name: idx_gmr_message_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gmr_message_user ON public.group_message_reads USING btree (group_message_id, user_id);


--
-- Name: idx_gmsg_group_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gmsg_group_time ON public.group_messages USING btree (group_id, created_at DESC);


--
-- Name: idx_gmsg_org_group_sender_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gmsg_org_group_sender_time ON public.group_messages USING btree (organization_id, group_id, sender_id, created_at DESC);


--
-- Name: idx_gmsg_org_group_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gmsg_org_group_time ON public.group_messages USING btree (organization_id, group_id, created_at DESC);


--
-- Name: idx_gperm_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gperm_group_id ON public.group_permissions USING btree (group_id);


--
-- Name: idx_group_messages_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_group_messages_expires ON public.group_messages USING btree (expires_at) WHERE (expires_at IS NOT NULL);


--
-- Name: idx_group_messages_fts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_group_messages_fts ON public.group_messages USING gin (to_tsvector('english'::regconfig, message));


--
-- Name: idx_group_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_group_org_id ON public.groups USING btree (organization_id);


--
-- Name: idx_group_org_status_created_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_group_org_status_created_desc ON public.groups USING btree (organization_id, status, created_at DESC);


--
-- Name: idx_group_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_group_status ON public.groups USING btree (status);


--
-- Name: idx_groups_lower_name_org; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_groups_lower_name_org ON public.groups USING btree (lower((group_name)::text), organization_id);


--
-- Name: idx_ip_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ip_org_id ON public.organization_ip_restrictions USING btree (organization_id);


--
-- Name: idx_knowledge_org_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_knowledge_org_active ON public.assistant_knowledge USING btree (organization_id) WHERE (is_active = true);


--
-- Name: idx_loc_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loc_org_id ON public.locations USING btree (organization_id);


--
-- Name: idx_locations_org_id_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_locations_org_id_desc ON public.locations USING btree (organization_id, location_id DESC);


--
-- Name: idx_meetings_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meetings_code ON public.meetings USING btree (meeting_id);


--
-- Name: idx_meetings_host; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meetings_host ON public.meetings USING btree (host_id);


--
-- Name: idx_meetings_org; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meetings_org ON public.meetings USING btree (organization_id, status);


--
-- Name: idx_meetings_sched; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meetings_sched ON public.meetings USING btree (scheduled_at) WHERE ((status)::text = 'waiting'::text);


--
-- Name: idx_mem_department_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mem_department_id ON public.organization_members USING btree (department_id);


--
-- Name: idx_mem_designation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mem_designation_id ON public.organization_members USING btree (designation_id);


--
-- Name: idx_mem_org_status_joined_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mem_org_status_joined_desc ON public.organization_members USING btree (organization_id, status, joined_at DESC);


--
-- Name: idx_mem_org_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mem_org_user_status ON public.organization_members USING btree (organization_id, user_id, status);


--
-- Name: idx_mem_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mem_organization_id ON public.organization_members USING btree (organization_id);


--
-- Name: idx_mem_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mem_status ON public.organization_members USING btree (status);


--
-- Name: idx_mem_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mem_user_id ON public.organization_members USING btree (user_id);


--
-- Name: idx_menuperm_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menuperm_org_id ON public.organization_message_menu_permissions USING btree (organization_id);


--
-- Name: idx_messages_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_expires ON public.messages USING btree (expires_at) WHERE (expires_at IS NOT NULL);


--
-- Name: idx_mm_meeting; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mm_meeting ON public.meeting_messages USING btree (meeting_id, created_at);


--
-- Name: idx_mp_meeting; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mp_meeting ON public.meeting_participants USING btree (meeting_id);


--
-- Name: idx_mp_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_mp_unique ON public.meeting_participants USING btree (meeting_id, user_id) WHERE (user_id IS NOT NULL);


--
-- Name: idx_mp_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mp_user ON public.meeting_participants USING btree (user_id);


--
-- Name: idx_msg_org_sender_receiver_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_msg_org_sender_receiver_time ON public.messages USING btree (organization_id, sender_id, receiver_id, send_time DESC);


--
-- Name: idx_msg_undelivered; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_msg_undelivered ON public.messages USING btree (receiver_id, organization_id) WHERE ((delivered_at IS NULL) AND (read_time IS NULL));


--
-- Name: idx_msg_unread_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_msg_unread_lookup ON public.messages USING btree (organization_id, receiver_id, sender_id) WHERE (read_time IS NULL);


--
-- Name: idx_opt_poll_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_opt_poll_id ON public.group_poll_options USING btree (poll_id);


--
-- Name: idx_org_members_org_joined_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_org_members_org_joined_desc ON public.organization_members USING btree (organization_id, joined_at DESC);


--
-- Name: idx_org_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_org_owner_id ON public.organizations USING btree (owner_id);


--
-- Name: idx_org_subdomain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_org_subdomain ON public.organizations USING btree (subdomain);


--
-- Name: idx_otp_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otp_expires_at ON public.otp_verifications USING btree (expires_at);


--
-- Name: idx_otp_identifier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otp_identifier ON public.otp_verifications USING btree (identifier);


--
-- Name: idx_otp_identifier_type_purpose_created_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otp_identifier_type_purpose_created_desc ON public.otp_verifications USING btree (lower((identifier)::text), type, purpose, created_at DESC);


--
-- Name: idx_otp_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otp_status ON public.otp_verifications USING btree (status);


--
-- Name: idx_pay_billing_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pay_billing_email ON public.payment_history USING btree (lower((billing_email)::text));


--
-- Name: idx_pay_currency; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pay_currency ON public.payment_history USING btree (currency_code);


--
-- Name: idx_pay_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pay_org_id ON public.payment_history USING btree (organization_id);


--
-- Name: idx_pay_payment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pay_payment_date ON public.payment_history USING btree (payment_date);


--
-- Name: idx_payment_gateways_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_gateways_enabled ON public.payment_gateways USING btree (is_enabled, status, display_order);


--
-- Name: idx_payment_history_retried_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_history_retried_by ON public.payment_history USING btree (retried_by_payment_id) WHERE (retried_by_payment_id IS NOT NULL);


--
-- Name: idx_plan_features_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plan_features_plan_id ON public.plan_features USING btree (plan_id);


--
-- Name: idx_plan_features_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plan_features_status ON public.plan_features USING btree (status);


--
-- Name: idx_plat_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plat_org_id ON public.organization_platform_restrictions USING btree (organization_id);


--
-- Name: idx_poll_group_msg; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_poll_group_msg ON public.group_polls USING btree (group_message_id);


--
-- Name: idx_poll_votes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_poll_votes_status ON public.group_poll_votes USING btree (poll_id, status);


--
-- Name: idx_rate_limits_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_limits_user ON public.assistant_rate_limits USING btree (user_id, organization_id);


--
-- Name: idx_recip_msg_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recip_msg_id ON public.group_message_recipients USING btree (group_message_id);


--
-- Name: idx_recip_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recip_user_id ON public.group_message_recipients USING btree (user_id);


--
-- Name: idx_scheduled_messages_due; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_messages_due ON public.scheduled_messages USING btree (status, send_at) WHERE ((status)::text = 'pending'::text);


--
-- Name: idx_scheduled_messages_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_messages_user ON public.scheduled_messages USING btree (user_id, organization_id, status);


--
-- Name: idx_sess_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sess_expires_at ON public.user_sessions USING btree (expires_at);


--
-- Name: idx_sess_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sess_org_id ON public.user_sessions USING btree (organization_id);


--
-- Name: idx_sess_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sess_status ON public.user_sessions USING btree (status);


--
-- Name: idx_sess_token_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sess_token_hash ON public.user_sessions USING btree (refresh_token_hash);


--
-- Name: idx_sess_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sess_user_id ON public.user_sessions USING btree (user_id);


--
-- Name: idx_sess_user_org_created_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sess_user_org_created_desc ON public.user_sessions USING btree (user_id, organization_id, created_at DESC);


--
-- Name: idx_site_detail_addresses_site_detail_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_site_detail_addresses_site_detail_id ON public.site_detail_addresses USING btree (site_detail_id);


--
-- Name: idx_site_detail_emails_site_detail_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_site_detail_emails_site_detail_id ON public.site_detail_emails USING btree (site_detail_id);


--
-- Name: idx_site_detail_phones_site_detail_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_site_detail_phones_site_detail_id ON public.site_detail_phones USING btree (site_detail_id);


--
-- Name: idx_states_country_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_states_country_id ON public.states USING btree (country_id);


--
-- Name: idx_states_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_states_name ON public.states USING btree (name);


--
-- Name: idx_sub_org_created_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sub_org_created_desc ON public.subscriptions USING btree (organization_id, created_at DESC);


--
-- Name: idx_sub_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sub_org_id ON public.subscriptions USING btree (organization_id);


--
-- Name: idx_sub_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sub_status ON public.subscriptions USING btree (status);


--
-- Name: idx_summary_cache_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_summary_cache_key ON public.summary_cache USING btree (cache_key);


--
-- Name: idx_tline_event_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tline_event_at ON public.group_timeline USING btree (event_at);


--
-- Name: idx_tline_group_event_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tline_group_event_desc ON public.group_timeline USING btree (group_id, event_at DESC);


--
-- Name: idx_tline_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tline_group_id ON public.group_timeline USING btree (group_id);


--
-- Name: idx_tline_group_type_event_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tline_group_type_event_desc ON public.group_timeline USING btree (group_id, event_type, event_at DESC);


--
-- Name: idx_tline_org_status_event_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tline_org_status_event_desc ON public.group_timeline USING btree (organization_id, status, event_at DESC);


--
-- Name: idx_user_settings_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_user_settings_unique ON public.user_settings USING btree (user_id, setting_key);


--
-- Name: idx_user_thread_mutes_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_thread_mutes_lookup ON public.user_thread_mutes USING btree (user_id, organization_id);


--
-- Name: idx_user_thread_mutes_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_user_thread_mutes_unique ON public.user_thread_mutes USING btree (user_id, organization_id, thread_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_last_login; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_last_login ON public.users USING btree (last_login_at);


--
-- Name: idx_users_lower_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_lower_email ON public.users USING btree (lower((email)::text));


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: idx_vote_poll_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vote_poll_id ON public.group_poll_votes USING btree (poll_id);


--
-- Name: idx_vote_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vote_user_id ON public.group_poll_votes USING btree (user_id);


--
-- Name: uk_org_ip_restriction; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uk_org_ip_restriction ON public.organization_ip_restrictions USING btree (organization_id, ip_address);


--
-- Name: uk_poll_user_option_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uk_poll_user_option_active ON public.group_poll_votes USING btree (poll_id, user_id, option_id) WHERE ((status)::text = 'active'::text);


--
-- Name: uq_billing_addresses_org_default; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_billing_addresses_org_default ON public.billing_addresses USING btree (organization_id) WHERE (is_default = true);


--
-- Name: activity_log activity_log_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: activity_log activity_log_context_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_context_organization_id_fkey FOREIGN KEY (context_organization_id) REFERENCES public.organizations(organization_id) ON DELETE SET NULL;


--
-- Name: assistant_conversations assistant_conversations_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_conversations
    ADD CONSTRAINT assistant_conversations_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(organization_id);


--
-- Name: assistant_conversations assistant_conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_conversations
    ADD CONSTRAINT assistant_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: assistant_feedback assistant_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_feedback
    ADD CONSTRAINT assistant_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: assistant_usage assistant_usage_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_usage
    ADD CONSTRAINT assistant_usage_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(organization_id);


--
-- Name: assistant_usage assistant_usage_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assistant_usage
    ADD CONSTRAINT assistant_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: disappearing_threads disappearing_threads_set_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disappearing_threads
    ADD CONSTRAINT disappearing_threads_set_by_fkey FOREIGN KEY (set_by) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: message_actions fk_act_msg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_actions
    ADD CONSTRAINT fk_act_msg FOREIGN KEY (message_id) REFERENCES public.messages(message_id) ON DELETE CASCADE;


--
-- Name: message_actions fk_act_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_actions
    ADD CONSTRAINT fk_act_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: billing_checkout_sessions fk_bcs_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_checkout_sessions
    ADD CONSTRAINT fk_bcs_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id);


--
-- Name: billing_checkout_sessions fk_bcs_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_checkout_sessions
    ADD CONSTRAINT fk_bcs_user FOREIGN KEY (actor_user_id) REFERENCES public.users(user_id);


--
-- Name: billing_address_audit fk_billing_address_audit_actor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_address_audit
    ADD CONSTRAINT fk_billing_address_audit_actor FOREIGN KEY (actor_user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: billing_address_audit fk_billing_address_audit_address; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_address_audit
    ADD CONSTRAINT fk_billing_address_audit_address FOREIGN KEY (billing_address_id) REFERENCES public.billing_addresses(billing_address_id) ON DELETE SET NULL;


--
-- Name: billing_address_audit fk_billing_address_audit_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_address_audit
    ADD CONSTRAINT fk_billing_address_audit_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id) ON DELETE CASCADE;


--
-- Name: billing_addresses fk_billing_address_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_addresses
    ADD CONSTRAINT fk_billing_address_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id) ON DELETE CASCADE;


--
-- Name: country_currency_priority fk_ccp_country; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country_currency_priority
    ADD CONSTRAINT fk_ccp_country FOREIGN KEY (country_iso_code) REFERENCES public.countries(iso_code) ON DELETE CASCADE;


--
-- Name: country_currency_priority fk_ccp_currency; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country_currency_priority
    ADD CONSTRAINT fk_ccp_currency FOREIGN KEY (currency_code) REFERENCES public.currencies(currency_code);


--
-- Name: organization_controls fk_ctrl_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_controls
    ADD CONSTRAINT fk_ctrl_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id) ON DELETE CASCADE;


--
-- Name: departments fk_dept_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT fk_dept_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id) ON DELETE CASCADE;


--
-- Name: designations fk_desig_dept; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT fk_desig_dept FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE CASCADE;


--
-- Name: designations fk_desig_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT fk_desig_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id) ON DELETE CASCADE;


--
-- Name: user_devices fk_device_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT fk_device_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: feature_items fk_feature_items_category; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_items
    ADD CONSTRAINT fk_feature_items_category FOREIGN KEY (feature_category_id) REFERENCES public.feature_categories(feature_category_id) ON DELETE CASCADE;


--
-- Name: message_files fk_file_msg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_files
    ADD CONSTRAINT fk_file_msg FOREIGN KEY (message_id) REFERENCES public.messages(message_id) ON DELETE CASCADE;


--
-- Name: group_message_actions fk_gact_msg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_actions
    ADD CONSTRAINT fk_gact_msg FOREIGN KEY (group_message_id) REFERENCES public.group_messages(group_message_id) ON DELETE CASCADE;


--
-- Name: group_message_actions fk_gact_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_actions
    ADD CONSTRAINT fk_gact_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: group_message_files fk_gfile_msg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_files
    ADD CONSTRAINT fk_gfile_msg FOREIGN KEY (group_message_id) REFERENCES public.group_messages(group_message_id) ON DELETE CASCADE;


--
-- Name: global_access fk_global_access_allow_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_access
    ADD CONSTRAINT fk_global_access_allow_user FOREIGN KEY (allow_user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: global_access fk_global_access_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_access
    ADD CONSTRAINT fk_global_access_org FOREIGN KEY (org_id) REFERENCES public.organizations(organization_id) ON DELETE CASCADE;


--
-- Name: global_access fk_global_access_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_access
    ADD CONSTRAINT fk_global_access_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: group_members fk_gmem_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT fk_gmem_group FOREIGN KEY (group_id) REFERENCES public.groups(group_id) ON DELETE CASCADE;


--
-- Name: group_members fk_gmem_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT fk_gmem_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id);


--
-- Name: group_members fk_gmem_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT fk_gmem_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: group_messages fk_gmsg_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT fk_gmsg_group FOREIGN KEY (group_id) REFERENCES public.groups(group_id) ON DELETE CASCADE;


--
-- Name: group_messages fk_gmsg_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT fk_gmsg_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id);


--
-- Name: group_messages fk_gmsg_sender; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT fk_gmsg_sender FOREIGN KEY (sender_id) REFERENCES public.users(user_id);


--
-- Name: group_permissions fk_gperm_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_permissions
    ADD CONSTRAINT fk_gperm_group FOREIGN KEY (group_id) REFERENCES public.groups(group_id) ON DELETE CASCADE;


--
-- Name: groups fk_group_creator; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT fk_group_creator FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- Name: groups fk_group_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT fk_group_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id) ON DELETE CASCADE;


--
-- Name: organization_ip_restrictions fk_ip_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_ip_restrictions
    ADD CONSTRAINT fk_ip_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id) ON DELETE CASCADE;


--
-- Name: locations fk_loc_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT fk_loc_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id) ON DELETE CASCADE;


--
-- Name: organization_members fk_mem_department; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT fk_mem_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE SET NULL;


--
-- Name: organization_members fk_mem_designation; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT fk_mem_designation FOREIGN KEY (designation_id) REFERENCES public.designations(designation_id) ON DELETE SET NULL;


--
-- Name: organization_members fk_mem_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT fk_mem_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id) ON DELETE CASCADE;


--
-- Name: organization_members fk_mem_role; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT fk_mem_role FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- Name: organization_members fk_mem_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT fk_mem_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: organization_message_menu_permissions fk_menuperm_item; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_message_menu_permissions
    ADD CONSTRAINT fk_menuperm_item FOREIGN KEY (menu_item_id) REFERENCES public.message_menu_items(menu_item_id);


--
-- Name: organization_message_menu_permissions fk_menuperm_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_message_menu_permissions
    ADD CONSTRAINT fk_menuperm_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id) ON DELETE CASCADE;


--
-- Name: messages fk_msg_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_msg_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id);


--
-- Name: messages fk_msg_receiver; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_id) REFERENCES public.users(user_id);


--
-- Name: messages fk_msg_sender; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES public.users(user_id);


--
-- Name: group_poll_options fk_opt_poll; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_poll_options
    ADD CONSTRAINT fk_opt_poll FOREIGN KEY (poll_id) REFERENCES public.group_polls(poll_id) ON DELETE CASCADE;


--
-- Name: organizations fk_org_owner; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT fk_org_owner FOREIGN KEY (owner_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- Name: otp_verifications fk_otp_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_verifications
    ADD CONSTRAINT fk_otp_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id);


--
-- Name: otp_verifications fk_otp_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_verifications
    ADD CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: payment_history fk_pay_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT fk_pay_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id);


--
-- Name: payment_history fk_pay_plan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT fk_pay_plan FOREIGN KEY (plan_id) REFERENCES public.plans(plan_id);


--
-- Name: payment_history fk_pay_sub; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT fk_pay_sub FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(subscription_id);


--
-- Name: plan_features fk_plan_features_plan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_features
    ADD CONSTRAINT fk_plan_features_plan FOREIGN KEY (plan_id) REFERENCES public.plans(plan_id) ON DELETE CASCADE;


--
-- Name: organization_platform_restrictions fk_plat_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_platform_restrictions
    ADD CONSTRAINT fk_plat_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id) ON DELETE CASCADE;


--
-- Name: organization_platform_restrictions fk_plat_platform; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_platform_restrictions
    ADD CONSTRAINT fk_plat_platform FOREIGN KEY (platform_id) REFERENCES public.platforms(platform_id);


--
-- Name: group_polls fk_poll_creator; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_polls
    ADD CONSTRAINT fk_poll_creator FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- Name: group_polls fk_poll_ender; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_polls
    ADD CONSTRAINT fk_poll_ender FOREIGN KEY (ended_by) REFERENCES public.users(user_id);


--
-- Name: group_polls fk_poll_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_polls
    ADD CONSTRAINT fk_poll_group FOREIGN KEY (group_id) REFERENCES public.groups(group_id);


--
-- Name: group_polls fk_poll_msg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_polls
    ADD CONSTRAINT fk_poll_msg FOREIGN KEY (group_message_id) REFERENCES public.group_messages(group_message_id) ON DELETE CASCADE;


--
-- Name: group_message_recipients fk_recip_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_recipients
    ADD CONSTRAINT fk_recip_group FOREIGN KEY (group_id) REFERENCES public.groups(group_id);


--
-- Name: group_message_recipients fk_recip_msg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_recipients
    ADD CONSTRAINT fk_recip_msg FOREIGN KEY (group_message_id) REFERENCES public.group_messages(group_message_id) ON DELETE CASCADE;


--
-- Name: group_message_recipients fk_recip_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_message_recipients
    ADD CONSTRAINT fk_recip_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: user_sessions fk_sess_device; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT fk_sess_device FOREIGN KEY (device_id) REFERENCES public.user_devices(device_id) ON DELETE SET NULL;


--
-- Name: user_sessions fk_sess_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT fk_sess_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id) ON DELETE SET NULL;


--
-- Name: user_sessions fk_sess_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT fk_sess_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: site_detail_addresses fk_site_detail_addresses_site_detail; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_detail_addresses
    ADD CONSTRAINT fk_site_detail_addresses_site_detail FOREIGN KEY (site_detail_id) REFERENCES public.site_details(site_detail_id) ON DELETE CASCADE;


--
-- Name: site_detail_emails fk_site_detail_emails_site_detail; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_detail_emails
    ADD CONSTRAINT fk_site_detail_emails_site_detail FOREIGN KEY (site_detail_id) REFERENCES public.site_details(site_detail_id) ON DELETE CASCADE;


--
-- Name: site_detail_phones fk_site_detail_phones_site_detail; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_detail_phones
    ADD CONSTRAINT fk_site_detail_phones_site_detail FOREIGN KEY (site_detail_id) REFERENCES public.site_details(site_detail_id) ON DELETE CASCADE;


--
-- Name: subscriptions fk_sub_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT fk_sub_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id) ON DELETE CASCADE;


--
-- Name: subscriptions fk_sub_plan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT fk_sub_plan FOREIGN KEY (plan_id) REFERENCES public.plans(plan_id);


--
-- Name: group_timeline fk_tline_actor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_timeline
    ADD CONSTRAINT fk_tline_actor FOREIGN KEY (actor_user_id) REFERENCES public.users(user_id);


--
-- Name: group_timeline fk_tline_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_timeline
    ADD CONSTRAINT fk_tline_group FOREIGN KEY (group_id) REFERENCES public.groups(group_id) ON DELETE CASCADE;


--
-- Name: group_timeline fk_tline_org; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_timeline
    ADD CONSTRAINT fk_tline_org FOREIGN KEY (organization_id) REFERENCES public.organizations(organization_id);


--
-- Name: group_timeline fk_tline_target; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_timeline
    ADD CONSTRAINT fk_tline_target FOREIGN KEY (target_user_id) REFERENCES public.users(user_id);


--
-- Name: group_poll_votes fk_vote_option; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_poll_votes
    ADD CONSTRAINT fk_vote_option FOREIGN KEY (option_id) REFERENCES public.group_poll_options(option_id) ON DELETE CASCADE;


--
-- Name: group_poll_votes fk_vote_poll; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_poll_votes
    ADD CONSTRAINT fk_vote_poll FOREIGN KEY (poll_id) REFERENCES public.group_polls(poll_id) ON DELETE CASCADE;


--
-- Name: group_poll_votes fk_vote_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_poll_votes
    ADD CONSTRAINT fk_vote_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: meeting_messages meeting_messages_meeting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_messages
    ADD CONSTRAINT meeting_messages_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;


--
-- Name: meeting_messages meeting_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_messages
    ADD CONSTRAINT meeting_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: meeting_participants meeting_participants_meeting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_participants
    ADD CONSTRAINT meeting_participants_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;


--
-- Name: meeting_participants meeting_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_participants
    ADD CONSTRAINT meeting_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: meetings meetings_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: payment_history payment_history_retried_by_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_retried_by_payment_id_fkey FOREIGN KEY (retried_by_payment_id) REFERENCES public.payment_history(payment_id) ON DELETE SET NULL;


--
-- Name: scheduled_messages scheduled_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_messages
    ADD CONSTRAINT scheduled_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: states states_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT states_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(country_id) ON DELETE CASCADE;


--
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_thread_mutes user_thread_mutes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_thread_mutes
    ADD CONSTRAINT user_thread_mutes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


