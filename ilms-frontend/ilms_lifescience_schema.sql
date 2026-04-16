/* 
  Life Science Schema
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Base table(s)
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  type text,
  category text,
  parent_id uuid,
  address_line1 text,
  city text,
  state text,
  country text,
  zip_code text,
  latitude double precision,
  longitude double precision,
  capacity_volume double precision,
  capacity_weight double precision,
  current_utilization double precision,
  gln text,
  rfid_reader_id text,
  is_quarantine boolean DEFAULT false,
  status text DEFAULT 'ACTIVE'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT locations_pkey PRIMARY KEY (id),
  CONSTRAINT locations_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.locations(id)
);

-- 2) Packaging / labeling
CREATE TABLE IF NOT EXISTS public.label_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  content text,
  created_at timestamp with time zone DEFAULT now(),
  canvas_design jsonb,
  width double precision DEFAULT 100,
  height double precision DEFAULT 150,
  unit text DEFAULT 'mm'::text,
  type text,
  status text DEFAULT 'DRAFT'::text,
  version text DEFAULT '1.0'::text,
  label_width_mm double precision,
  label_height_mm double precision,
  barcode_symbology text DEFAULT 'QR'::text CHECK (barcode_symbology = ANY (ARRAY['QR'::text, 'CODE128'::text, 'EAN13'::text, 'DATAMATRIX'::text, 'GS1_128'::text])),
  CONSTRAINT label_templates_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.packaging_hierarchy (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT packaging_hierarchy_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.packaging_level (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  hierarchy_id uuid,
  level_name text NOT NULL,
  level_order integer NOT NULL,
  label_template_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  contained_quantity double precision DEFAULT 1,
  id_tech text DEFAULT 'BARCODE'::text,
  barcode_type text,
  rfid_tag_type text,
  epc_format text,
  gtin_format text,
  serial_format text,
  label_width_mm double precision,
  label_height_mm double precision,
  is_fragile boolean DEFAULT false,
  is_hazardous boolean DEFAULT false,
  capacity integer DEFAULT 10,
  CONSTRAINT packaging_level_pkey PRIMARY KEY (id),
  CONSTRAINT packaging_level_hierarchy_id_fkey FOREIGN KEY (hierarchy_id) REFERENCES public.packaging_hierarchy(id),
  CONSTRAINT packaging_level_label_template_id_fkey FOREIGN KEY (label_template_id) REFERENCES public.label_templates(id)
);

-- 3) Other lookup / definitions
CREATE TABLE IF NOT EXISTS public.handling_parameter (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  env_parameters character varying,
  epc_format character varying,
  hazardous_class character varying,
  humidity_max double precision,
  humidity_min double precision,
  material_code character varying UNIQUE,
  precautions character varying,
  temperature_max double precision,
  temperature_min double precision,
  CONSTRAINT handling_parameter_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.master_definitions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  def_type text NOT NULL,
  def_value text NOT NULL,
  description text,
  CONSTRAINT master_definitions_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.material_master (
  material_code character varying NOT NULL,
  baseuom character varying,
  country_of_origin character varying,
  description character varying,
  dimensionsmm character varying,
  ean_gtin character varying,
  externalerpcode character varying,
  gs1_category_code character varying,
  is_batch_managed boolean,
  is_env_sensitive boolean,
  is_fragile boolean,
  is_hazardous boolean,
  is_high_value boolean,
  is_military_grade boolean,
  is_packaged boolean,
  is_rfid_capable boolean,
  is_serialized boolean,
  item_dimension character varying,
  item_weight character varying,
  material_class character varying,
  material_eanupc character varying,
  material_group character varying,
  material_name character varying,
  max_storage_period character varying,
  net_weight_kg double precision,
  packaging_material_code character varying,
  procurement_type character varying,
  shelf_life_days integer,
  shelf_life_uom character varying,
  sku character varying,
  storage_type character varying,
  trade_dimensionsmm character varying,
  tradeuom character varying,
  trade_weight_kg double precision,
  type character varying,
  upc character varying,
  CONSTRAINT material_master_pkey PRIMARY KEY (material_code)
);

CREATE TABLE IF NOT EXISTS public.materials (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  type text,
  category text,
  base_uom text,
  is_batch_managed boolean DEFAULT false,
  is_serial_managed boolean DEFAULT false,
  shelf_life_days integer,
  min_stock double precision,
  max_stock double precision,
  gross_weight double precision,
  net_weight double precision,
  weight_uom text,
  length double precision,
  width double precision,
  height double precision,
  dimension_uom text,
  volume double precision,
  volume_uom text,
  is_hazmat boolean DEFAULT false,
  hazmat_class text,
  un_number text,
  status text DEFAULT 'ACTIVE'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ean text,
  upc text,
  country_of_origin text,
  state text,
  class text,
  material_group text,
  storage_type text,
  trade_uom text,
  trade_weight double precision,
  trade_length double precision,
  trade_width double precision,
  trade_height double precision,
  is_packaged boolean DEFAULT false,
  is_fragile boolean DEFAULT false,
  is_military boolean DEFAULT false,
  is_high_value boolean DEFAULT false,
  is_env_sensitive boolean DEFAULT false,
  packaging_hierarchy_id bigint,
  serial_format text DEFAULT 'SN-{DDMMYYYY}-{XXXXX}'::text,
  CONSTRAINT materials_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.material_document (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  doc_type character varying,
  filename character varying,
  material_code character varying,
  url character varying,
  CONSTRAINT material_document_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.material_image (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  filename character varying,
  material_code character varying,
  type character varying,
  url character varying,
  CONSTRAINT material_image_pkey PRIMARY KEY (id)
);

-- 4) Inventory / Containers / Serial pool (FKs require earlier tables)
CREATE TABLE IF NOT EXISTS public.inventory (
  id bigint NOT NULL,
  batch_number character varying,
  created_at timestamp without time zone,
  location_id bigint,
  material_code character varying,
  serial_number character varying,
  status character varying CHECK (status::text = ANY (ARRAY['PRE_INVENTORY'::character varying, 'REGISTERED'::character varying, 'ACTIVE'::character varying, 'PACKED'::character varying, 'SHIPPED'::character varying, 'DELIVERED'::character varying, 'CONSUMED'::character varying, 'RETURNED'::character varying, 'SCRAPPED'::character varying]::text[])),
  warehouse_code character varying,
  quality_status text DEFAULT 'PENDING'::text CHECK (quality_status = ANY (ARRAY['PENDING'::text, 'PASS'::text, 'FAIL'::text, 'HOLD'::text])),
  manufactured_at timestamp with time zone,
  expires_at timestamp with time zone,
  current_owner text,
  parent_container_type text,
  parent_container_id bigint,
  confirmed_at timestamp with time zone,
  confirmed_by text,
  scan_location_id uuid,
  CONSTRAINT inventory_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_scan_location_id_fkey FOREIGN KEY (scan_location_id) REFERENCES public.locations(id)
);

CREATE TABLE IF NOT EXISTS public.container_unit (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  serial_number text NOT NULL UNIQUE,
  container_type text NOT NULL CHECK (container_type = ANY (ARRAY['BOX'::text, 'PALLET'::text, 'SHIPPING_CONTAINER'::text])),
  status text DEFAULT 'EMPTY'::text CHECK (status = ANY (ARRAY['EMPTY'::text, 'PARTIAL'::text, 'FULL'::text, 'SEALED'::text, 'SHIPPED'::text, 'DELIVERED'::text])),
  location_id uuid,
  parent_container_id bigint,
  packaging_level_id uuid,
  capacity integer,
  current_count integer DEFAULT 0,
  batch_number text,
  created_at timestamp with time zone DEFAULT now(),
  sealed_at timestamp with time zone,
  created_by text,
  CONSTRAINT container_unit_pkey PRIMARY KEY (id),
  CONSTRAINT container_unit_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT container_unit_parent_container_id_fkey FOREIGN KEY (parent_container_id) REFERENCES public.container_unit(id),
  CONSTRAINT container_unit_packaging_level_id_fkey FOREIGN KEY (packaging_level_id) REFERENCES public.packaging_level(id)
);

CREATE TABLE IF NOT EXISTS public.serial_number_pool (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  material_id uuid NOT NULL,
  batch_number text,
  serial_number text NOT NULL UNIQUE,
  status text DEFAULT 'RESERVED'::text CHECK (status = ANY (ARRAY['RESERVED'::text, 'ASSIGNED'::text, 'CONSUMED'::text, 'VOIDED'::text])),
  inventory_id bigint,
  reserved_at timestamp with time zone DEFAULT now(),
  assigned_at timestamp with time zone,
  created_by text,
  CONSTRAINT serial_number_pool_pkey PRIMARY KEY (id),
  CONSTRAINT serial_number_pool_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id)
);

-- 5) Shipment / Shipment items
CREATE TABLE IF NOT EXISTS public.shipment (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  shipment_number text NOT NULL UNIQUE,
  origin_location_id uuid,
  destination_location_id uuid,
  status text DEFAULT 'CREATED'::text CHECK (status = ANY (ARRAY['CREATED'::text, 'LOADING'::text, 'DISPATCHED'::text, 'IN_TRANSIT'::text, 'DELIVERED'::text, 'CANCELLED'::text])),
  carrier text,
  tracking_number text,
  vehicle_number text,
  driver_name text,
  driver_contact text,
  expected_delivery_date timestamp with time zone,
  dispatched_at timestamp with time zone,
  delivered_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  created_by text,
  CONSTRAINT shipment_pkey PRIMARY KEY (id),
  CONSTRAINT shipment_origin_location_id_fkey FOREIGN KEY (origin_location_id) REFERENCES public.locations(id),
  CONSTRAINT shipment_destination_location_id_fkey FOREIGN KEY (destination_location_id) REFERENCES public.locations(id)
);

CREATE TABLE IF NOT EXISTS public.shipment_item (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  shipment_id bigint NOT NULL,
  item_type text NOT NULL CHECK (item_type = ANY (ARRAY['INVENTORY'::text, 'BOX'::text, 'PALLET'::text, 'SHIPPING_CONTAINER'::text])),
  item_id bigint NOT NULL,
  quantity integer DEFAULT 1,
  added_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shipment_item_pkey PRIMARY KEY (id),
  CONSTRAINT shipment_item_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipment(id)
);

-- 6) Trace event + ownership transfer
CREATE TABLE IF NOT EXISTS public.trace_event (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  event_type text NOT NULL,
  event_category text CHECK (event_category = ANY (ARRAY['OBJECT'::text, 'AGGREGATION'::text, 'DISAGGREGATION'::text, 'TRANSFER'::text, 'SHIPMENT'::text, 'EXCEPTION'::text])),
  event_time timestamp with time zone DEFAULT now(),
  location text,
  app_user text,
  notes text,
  status text,
  inventory_id bigint,
  container_id bigint,
  batch_number text,
  order_reference text,
  owner text,
  shipment_id bigint,
  parent_container_id bigint,
  child_ids jsonb,
  location_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trace_event_pkey PRIMARY KEY (id),
  CONSTRAINT trace_event_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id)
);

CREATE TABLE IF NOT EXISTS public.ownership_transfer (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  entity_type text NOT NULL CHECK (entity_type = ANY (ARRAY['INVENTORY'::text, 'BOX'::text, 'PALLET'::text, 'SHIPMENT'::text])),
  entity_id bigint NOT NULL,
  from_owner text,
  to_owner text NOT NULL,
  from_location_id uuid,
  to_location_id uuid,
  transfer_type text DEFAULT 'HANDOVER'::text CHECK (transfer_type = ANY (ARRAY['HANDOVER'::text, 'SHIPMENT'::text, 'RETURN'::text, 'INTERNAL'::text])),
  transferred_at timestamp with time zone DEFAULT now(),
  transfer_event_id bigint,
  notes text,
  CONSTRAINT ownership_transfer_pkey PRIMARY KEY (id),
  CONSTRAINT ownership_transfer_from_location_id_fkey FOREIGN KEY (from_location_id) REFERENCES public.locations(id),
  CONSTRAINT ownership_transfer_to_location_id_fkey FOREIGN KEY (to_location_id) REFERENCES public.locations(id),
  CONSTRAINT ownership_transfer_transfer_event_id_fkey FOREIGN KEY (transfer_event_id) REFERENCES public.trace_event(id)
);

-- 7) Aggregation
CREATE TABLE IF NOT EXISTS public.aggregation (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  parent_type text NOT NULL CHECK (parent_type = ANY (ARRAY['BOX'::text, 'PALLET'::text, 'SHIPPING_CONTAINER'::text])),
  parent_id bigint NOT NULL,
  child_type text NOT NULL CHECK (child_type = ANY (ARRAY['INVENTORY'::text, 'BOX'::text, 'PALLET'::text])),
  child_id bigint NOT NULL,
  aggregated_at timestamp with time zone DEFAULT now(),
  disaggregated_at timestamp with time zone,
  status text DEFAULT 'ACTIVE'::text CHECK (status = ANY (ARRAY['ACTIVE'::text, 'DISAGGREGATED'::text])),
  aggregation_event_id bigint,
  disaggregation_event_id bigint,
  created_by text,
  CONSTRAINT aggregation_pkey PRIMARY KEY (id)
);
