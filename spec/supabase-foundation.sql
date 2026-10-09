create table public.story_checks (
 id uuid primary key, created_at timestamptz not null default now(),
 outcome text not null check(outcome in ('clear','clarify','unsupported','uncertain')),
 provider text not null, rules_version text not null, model text not null,
 reasons jsonb not null default '[]', checks jsonb not null default '{}'
);
create table public.story_approvals (
 token uuid primary key, fingerprint text not null, input jsonb not null,
 provider text not null, rules_version text not null, model text not null,
 expires_at timestamptz not null
);
create index story_approvals_expiry on public.story_approvals(expires_at);
create table public.story_orders (
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
 status text not null check(status in ('awaiting_payment','payment_failed','queued','generating','ready','needs_action','refund_pending','refunded','expired')),
 approval_token uuid not null unique references public.story_approvals(token),
 amount integer not null check(amount>=0), currency text not null default 'czk',
 access_hash text not null, payment_id text unique,
 cost_czk numeric not null default 0 check(cost_czk>=0),
 budget_czk numeric not null check(budget_czk>0),
 expires_at timestamptz not null, pdf_key text, reason text
);
create index story_orders_status_created on public.story_orders(status,created_at);
create table public.story_attempts (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.story_orders(id),
 stage text not null check(stage in ('story','image:1','image:2','image:3','image:4','image:5','image:6','pdf')),
 status text not null check(status in ('pending','complete','failed','uncertain','refused')),
 started_at timestamptz not null default now(), completed_at timestamptz,
 provider text not null, model text not null, request_id text, output_key text,
 cost_czk numeric check(cost_czk>=0), receipt jsonb,
 unique(order_id,stage)
);
alter table public.story_checks enable row level security;
alter table public.story_approvals enable row level security;
alter table public.story_orders enable row level security;
alter table public.story_attempts enable row level security;
revoke all on public.story_checks,public.story_approvals,public.story_orders,public.story_attempts from anon,authenticated;
grant select,insert,update,delete on public.story_checks,public.story_approvals,public.story_orders,public.story_attempts to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('child-photos','child-photos',false,10485760,array['image/jpeg','image/png']),
 ('story-images','story-images',false,10485760,array['image/png','image/jpeg','image/webp']),
 ('story-pdfs','story-pdfs',false,52428800,array['application/pdf']);
