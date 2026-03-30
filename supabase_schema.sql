-- SMAZÁNÍ STARÝCH TABULEK (pokud existují)
drop table if exists guests cascade;
drop table if exists reservations cascade;
drop table if exists properties cascade;

-- VYTVOŘENÍ NOVÝCH TABULEK
create table properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_at timestamp with time zone default now()
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  guest_name text,
  checkin_date date,
  checkout_date date,
  source text, -- booking, airbnb, manual, ...
  status text default 'pending', -- pending, checkedin, checkedout, cancelled
  special_requests text,
  created_at timestamp with time zone default now()
);

create table guests (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references reservations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  nationality text not null,
  document_type text not null,
  document_number text not null,
  address_street text not null,
  address_city text not null,
  address_zip text not null,
  address_country text not null,
  stay_purpose text not null,
  phone text,
  email text,
  consent boolean not null,
  document_photo_url text,
  created_at timestamp with time zone default now()
);
