-- Seed top 20 LPAs by population for initial data coverage
-- Portal types: idox (most common), northgate, custom

INSERT INTO lpas (code, name, region, portal_url, portal_type) VALUES
  ('E09000033', 'Westminster City Council', 'London', 'https://idoxpa.westminster.gov.uk/online-applications/', 'idox'),
  ('E09000012', 'London Borough of Hackney', 'London', 'https://publicaccess.hackney.gov.uk/online-applications/', 'idox'),
  ('E09000022', 'London Borough of Lewisham', 'London', 'https://planning.lewisham.gov.uk/online-applications/', 'idox'),
  ('E09000006', 'London Borough of Bromley', 'London', 'https://searchapplications.bromley.gov.uk/online-applications/', 'idox'),
  ('E09000001', 'City of London', 'London', 'https://www.planning2.cityoflondon.gov.uk/online-applications/', 'idox'),
  ('E09000011', 'London Borough of Greenwich', 'London', 'https://planning.royalgreenwich.gov.uk/online-applications/', 'idox'),
  ('E08000003', 'Manchester City Council', 'North West', 'https://pa.manchester.gov.uk/online-applications/', 'idox'),
  ('E08000007', 'Salford City Council', 'North West', 'https://publicaccess.salford.gov.uk/online-applications/', 'idox'),
  ('E08000025', 'Birmingham City Council', 'West Midlands', 'https://eplanning.birmingham.gov.uk/Northgate/PlanningExplorer/', 'northgate'),
  ('E08000035', 'Leeds City Council', 'Yorkshire', 'https://publicaccess.leeds.gov.uk/online-applications/', 'idox'),
  ('E08000019', 'Sheffield City Council', 'Yorkshire', 'https://planningonline.sheffield.gov.uk/online-applications/', 'idox'),
  ('E08000012', 'Liverpool City Council', 'North West', 'https://planning.liverpool.gov.uk/online-applications/', 'idox'),
  ('E06000010', 'Kingston upon Hull', 'Yorkshire', 'https://www.hullcc.gov.uk/planning/', 'idox'),
  ('E07000178', 'Oxford City Council', 'South East', 'https://public.oxford.gov.uk/online-applications/', 'idox'),
  ('E07000008', 'Cambridge City Council', 'East', 'https://applications.greatercambridgeplanning.org/online-applications/', 'idox'),
  ('E06000023', 'Bristol City Council', 'South West', 'https://planningonline.bristol.gov.uk/online-applications/', 'idox'),
  ('E06000037', 'Nottingham City Council', 'East Midlands', 'https://publicaccess.nottinghamcity.gov.uk/online-applications/', 'idox'),
  ('E07000086', 'Exeter City Council', 'South West', 'https://planning.exeter.gov.uk/online-applications/', 'idox'),
  ('W06000015', 'Cardiff Council', 'Wales', 'https://planningonline.cardiff.gov.uk/online-applications/', 'idox'),
  ('S12000036', 'Edinburgh City Council', 'Scotland', 'https://citydev-portal.edinburgh.gov.uk/idoxpa-web/', 'idox');
