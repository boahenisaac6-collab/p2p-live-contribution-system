-- Peer-to-Peer Tuition Contribution Management System
-- Paste this entire script into Supabase SQL Editor and run it once.

create extension if not exists pgcrypto;

create table if not exists public.contributors (
  id text primary key default gen_random_uuid()::text,
  serial_number integer not null unique,
  name text not null,
  amount numeric(12,2) not null default 0,
  reason text default '',
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text default ''
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists contributors_set_updated_at on public.contributors;
create trigger contributors_set_updated_at
before update on public.contributors
for each row execute function public.set_updated_at();

alter table public.contributors enable row level security;

drop policy if exists "Public can read contribution records" on public.contributors;
create policy "Public can read contribution records"
on public.contributors
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated facilitators can insert records" on public.contributors;
create policy "Authenticated facilitators can insert records"
on public.contributors
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated facilitators can update records" on public.contributors;
create policy "Authenticated facilitators can update records"
on public.contributors
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated facilitators can delete records" on public.contributors;
create policy "Authenticated facilitators can delete records"
on public.contributors
for delete
to authenticated
using (true);

-- Enable live updates for the table.
do $$
begin
  begin
    alter publication supabase_realtime add table public.contributors;
  exception when duplicate_object then
    null;
  end;
end $$;

-- Seed the current contribution records. Running this again will not duplicate them.
insert into public.contributors (id, serial_number, name, amount, reason, paid_at) values
('1', 1, 'JOSHUA LAMPTEY', 100.00, '', now() - interval '118 minutes'),
('2', 2, 'EMMANUEL BOADI', 100.00, '', now() - interval '117 minutes'),
('3', 3, 'ELIZABETH AMISSAH OPPONG', 100.00, '', now() - interval '116 minutes'),
('4', 4, 'COURAGE AGBEVANOO', 100.00, '', now() - interval '115 minutes'),
('5', 5, 'GIFTY YEBOAH OBENG', 100.00, '', now() - interval '114 minutes'),
('6', 6, 'FRIMPONG DANIEL OSEI', 100.00, '', now() - interval '113 minutes'),
('7', 7, 'CHARLES APEANING', 100.00, '', now() - interval '112 minutes'),
('8', 8, 'FOSTER LAAR', 100.00, '', now() - interval '111 minutes'),
('9', 9, 'SANDRA AFIA DANSOWAA', 100.00, '', now() - interval '110 minutes'),
('10', 10, 'ROSEMARY QUANSAH', 100.00, '', now() - interval '109 minutes'),
('11', 11, 'KARIM ISSAH ALFRED', 100.00, '', now() - interval '108 minutes'),
('12', 12, 'JOSUA COFFIE', 100.00, '', now() - interval '107 minutes'),
('13', 13, 'EMMANUEL DWAMENA', 100.00, '', now() - interval '106 minutes'),
('14', 14, 'KWAKU WISDOM BAME', 100.00, '', now() - interval '105 minutes'),
('15', 15, 'GLORY OLADIPUPO', 100.00, '', now() - interval '104 minutes'),
('16', 16, 'CATHERINE DOUGHAN', 100.00, '', now() - interval '103 minutes'),
('17', 17, 'ABIGAIL TSOTSOO OSEKRE', 100.00, '', now() - interval '102 minutes'),
('18', 18, 'KAMILU SULEMANA', 100.00, '', now() - interval '101 minutes'),
('19', 19, 'ENOCH OTOO', 100.00, '', now() - interval '100 minutes'),
('20', 20, 'KWAKU BOAMAH', 100.00, '', now() - interval '99 minutes'),
('21', 21, 'YUSSIF YAKUBU ASAMARI', 100.00, '', now() - interval '98 minutes'),
('22', 22, 'AUGUSTUS ETRUE SAM', 100.00, '', now() - interval '97 minutes'),
('23', 23, 'EMELIA BENIM', 100.00, '', now() - interval '96 minutes'),
('24', 24, 'EMMANUEL DANSO', 100.00, '', now() - interval '95 minutes'),
('25', 25, 'DORIS BOAKYE', 100.00, '', now() - interval '94 minutes'),
('26', 26, 'GRACE GYEMABA', 100.00, '', now() - interval '93 minutes'),
('27', 27, 'SPENCE ADDAE ASAMOAH', 100.00, '', now() - interval '92 minutes'),
('28', 28, 'ERIC ENNINFUL', 100.00, '', now() - interval '91 minutes'),
('29', 29, 'AMAAWIAK EDWINA', 100.00, '', now() - interval '90 minutes'),
('30', 30, 'LYDIA COBBINAH', 100.00, '', now() - interval '89 minutes'),
('31', 31, 'DAISY OBENG BOAKYE', 100.00, '', now() - interval '88 minutes'),
('32', 32, 'BERNARD BANNOR', 100.00, '', now() - interval '87 minutes'),
('33', 33, 'EVA KYEREWAAH FIRANG', 100.00, '', now() - interval '86 minutes'),
('34', 34, 'VICTORIA DZIWORNU', 100.00, '', now() - interval '85 minutes'),
('35', 35, 'CHARLES SARPONG', 100.00, '', now() - interval '84 minutes'),
('36', 36, 'BEATRICE OBENG', 100.00, '', now() - interval '83 minutes'),
('37', 37, 'DESMOND AYAMDOO AZAARE', 100.00, '', now() - interval '82 minutes'),
('38', 38, 'ISAAC ESSIEN', 100.00, '', now() - interval '81 minutes'),
('39', 39, 'STEPHEN OTOO', 100.00, '', now() - interval '80 minutes'),
('40', 40, 'MUBARIK MUNIRU', 100.00, '', now() - interval '79 minutes'),
('41', 41, 'EBENEZER OBENG', 100.00, '', now() - interval '78 minutes'),
('42', 42, 'MERCY ATTAKORAH-AMANIAMPONG', 100.00, '', now() - interval '77 minutes'),
('43', 43, 'LILY ANABA ANABIA', 100.00, '', now() - interval '76 minutes'),
('44', 44, 'MALIK AZUMAH HAMIDU', 100.00, '', now() - interval '75 minutes'),
('45', 45, 'ERIC ARHIN', 100.00, '', now() - interval '74 minutes'),
('46', 46, 'JOCHEBED ASUBONTENG', 100.00, '', now() - interval '73 minutes'),
('47', 47, 'MERCY KPATSA', 100.00, '', now() - interval '72 minutes'),
('48', 48, 'JACOB ASSAH', 100.00, '', now() - interval '71 minutes'),
('49', 49, 'CHRISTIAN BOTSYOE KULOR', 100.00, '', now() - interval '70 minutes'),
('50', 50, 'PHYLLIS AFI-AIDOO', 100.00, '', now() - interval '69 minutes'),
('51', 51, 'WILLIAM OSEI AFREH', 100.00, '', now() - interval '68 minutes'),
('52', 52, 'MAXWELL ASRIFI FRIMPONG', 50.00, 'Partial payment', now() - interval '67 minutes'),
('53', 53, 'SAMUEL AMOAH BOAKYE', 100.00, '', now() - interval '66 minutes'),
('54', 54, 'APRAKU JOSEPH', 100.00, '', now() - interval '65 minutes'),
('55', 55, 'REDEEMER ARYITEY', 100.00, '', now() - interval '64 minutes'),
('56', 56, 'EMMANUEL MENSAH AMO', 100.00, '', now() - interval '63 minutes'),
('57', 57, 'ISAAC TWENEBOAH KODUA', 100.00, '', now() - interval '62 minutes'),
('58', 58, 'EMMANUEL OSEI TUTU', 100.00, '', now() - interval '61 minutes'),
('59', 59, 'CASSANDRA AGYAKOWAA TWUMASI', 100.00, '', now() - interval '60 minutes'),
('60', 60, 'FELICITY AMPONSAH', 100.00, '', now() - interval '59 minutes'),
('61', 61, 'WILLIAMS ENCHILL', 100.00, '', now() - interval '58 minutes'),
('62', 62, 'EUNICE VENUNYE DZIWORNU', 70.00, 'Partial payment', now() - interval '57 minutes'),
('63', 63, 'CECILIA AKAAH-ENNIN', 100.00, '', now() - interval '56 minutes'),
('64', 64, 'PRINCE OTENG ADU-TWUM', 100.00, '', now() - interval '55 minutes'),
('65', 65, 'EUNICE AMOAH', 100.00, '', now() - interval '54 minutes'),
('66', 66, 'MARY ELLETEY', 100.00, '', now() - interval '53 minutes'),
('67', 67, 'GAMEL DANSO SACKEY', 100.00, '', now() - interval '52 minutes'),
('68', 68, 'VICTORIA AFUA WOTOBRE', 100.00, '', now() - interval '51 minutes'),
('69', 69, 'ISHAQUE KWEKU NYAME', 100.00, '', now() - interval '50 minutes'),
('70', 70, 'PRISCILLA OWUSU', 100.00, '', now() - interval '49 minutes'),
('71', 71, 'SMART UP...', 100.00, '', now() - interval '48 minutes'),
('1777586879178', 72, 'THEOPHILUS QUARSHIE GH100', 100.00, '', now() - interval '47 minutes'),
('1777588260712', 73, 'CHRISTIAN AGORSAH', 100.00, '', now() - interval '46 minutes'),
('1777622578270', 74, 'MERCIA AMIAH', 100.00, '', now() - interval '45 minutes'),
('1777622600507', 75, 'ENOCH TETTEH', 100.00, '', now() - interval '44 minutes'),
('1777622628591', 76, 'THOMAS AVUWORDA', 100.00, '', now() - interval '43 minutes'),
('1777622656179', 77, 'EUNICE GORDON', 100.00, '', now() - interval '42 minutes'),
('1777622682816', 78, 'PAULINA FREMPOMAA', 100.00, '', now() - interval '41 minutes'),
('1777623814869', 79, 'SANDRA TIWAA ANIN', 100.00, '', now() - interval '40 minutes'),
('1777624338954', 80, 'MICHEAL ENNIN', 100.00, '', now() - interval '39 minutes'),
('1777624406163', 81, 'SAMUEL BOATENG', 100.00, '', now() - interval '38 minutes'),
('1777629077441', 82, 'DOMINIC ENTSIE', 100.00, '', now() - interval '37 minutes'),
('1777629113309', 83, 'JULIUS OPPONG', 100.00, '', now() - interval '36 minutes'),
('1777629138338', 84, 'OLIVER BAFFOUR APPAU', 100.00, '', now() - interval '35 minutes'),
('1777632409786', 85, 'EDWARD DANQUAH', 100.00, '', now() - interval '34 minutes'),
('1777632428836', 86, 'PATRICK APPIAH', 100.00, '', now() - interval '33 minutes'),
('1777634187001', 87, 'FRANCIS GYIMAH', 100.00, '', now() - interval '32 minutes'),
('1777634257908', 88, 'ANABIA MICHAEL ADONGO', 100.00, '', now() - interval '31 minutes'),
('1777650049824', 89, 'STEPHANY ATAA', 100.00, '', now() - interval '30 minutes'),
('1777650072937', 90, 'ISAAC ANIM', 100.00, '', now() - interval '29 minutes'),
('1777650093353', 91, 'OPOKU AGYEI', 100.00, '', now() - interval '28 minutes'),
('1777650117283', 92, 'OHELIA FOSUA DUODU', 100.00, '', now() - interval '27 minutes'),
('1777650149290', 93, 'ANDREW LANKWEI LAMPTEY', 100.00, '', now() - interval '26 minutes'),
('1777650187210', 94, 'JOYCE ARHINFUL', 100.00, '', now() - interval '25 minutes'),
('1777650229607', 95, 'BERNICE PADIKIE ATTAMAH', 100.00, '', now() - interval '24 minutes'),
('1777650606214', 96, 'ANTHONY OTSIWAH', 100.00, '', now() - interval '23 minutes'),
('1777651525106', 97, 'AUGUSTUS ETRUE SAM', 100.00, '', now() - interval '22 minutes'),
('1777651597876', 98, 'ESTHER OWUSUAA ANTWI', 100.00, '', now() - interval '21 minutes'),
('1777651634095', 99, 'FOSTER AGYEDOWAH', 100.00, '', now() - interval '20 minutes'),
('1777654199479', 100, 'KINGSLEY OFOSU', 100.00, '', now() - interval '19 minutes'),
('1777656510453', 101, 'AHIABLE BRIGHT', 100.00, '', now() - interval '18 minutes'),
('1777656540030', 102, 'JOYCE LARTEY', 100.00, '', now() - interval '17 minutes'),
('1777665671406', 103, 'FESTUS ADOBOAH', 100.00, '', now() - interval '16 minutes'),
('1777665693305', 104, 'ISAAC ASARE', 100.00, '', now() - interval '15 minutes'),
('1777665713041', 105, 'ISAAC LANYO', 100.00, '', now() - interval '14 minutes'),
('1777665737823', 106, 'ALBERT TAKYI DARTEY', 100.00, '', now() - interval '13 minutes'),
('1777665781868', 107, 'JOHANNA-RUTH PAINTSIL', 100.00, '', now() - interval '12 minutes'),
('1777665803337', 108, 'PATRICK OSEI', 100.00, '', now() - interval '11 minutes'),
('1777665825132', 109, 'SADIA ABUBAKAR', 100.00, '', now() - interval '10 minutes'),
('1777665855290', 110, 'DANIEL ATTRAMS LARTEY', 100.00, '', now() - interval '9 minutes'),
('1777670332373', 111, 'AUGUSTINA AFRIYIE', 100.00, '', now() - interval '8 minutes'),
('1777670386559', 112, 'MERCY AYIPWA ABANWORA', 100.00, '', now() - interval '7 minutes'),
('1777706955942', 113, 'DORCAS BOATENG', 100.00, '', now() - interval '6 minutes'),
('1777706976908', 114, 'FLORENCE KONADU ANTWI', 100.00, '', now() - interval '5 minutes'),
('1777707028797', 115, 'ERICA AMPOFO', 100.00, '', now() - interval '4 minutes'),
('1777716563434', 116, 'AMETEFE WISDOM', 100.00, '', now() - interval '3 minutes'),
('1777716720255', 117, 'JOSEPH LAWEH LOGMANOR', 100.00, '', now() - interval '2 minutes'),
('1777722158113', 118, 'EBENEZER NARTEY', 100.00, '', now() - interval '1 minutes'),
('1777722191901', 119, 'KWAME ABDULAI', 100.00, '', now() - interval '0 minutes')
on conflict (id) do update set
  serial_number = excluded.serial_number,
  name = excluded.name,
  amount = excluded.amount,
  reason = excluded.reason;
