CREATE TABLE IF NOT EXISTS welfare_schemes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    max_income_ceiling INT NOT NULL,
    target_occupation VARCHAR(100) NOT NULL,
    target_location VARCHAR(100) NOT NULL,
    financial_grant VARCHAR(100) NOT NULL,
    subsidy_rate VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    document_checklist TEXT[] NOT NULL,
    application_guide TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS civic_complaints (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    urgency VARCHAR(50) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    upvotes INT DEFAULT 1,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolution_note TEXT NULL
);

CREATE TABLE IF NOT EXISTS scheme_applications (
    id SERIAL PRIMARY KEY,
    scheme_id INT REFERENCES welfare_schemes(id),
    citizen_name VARCHAR(255) NOT NULL,
    income INT NOT NULL,
    occupation VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Under Review',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_signals (
    id VARCHAR(50) PRIMARY KEY,
    user_session VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    accuracy NUMERIC(8, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    complaint_id VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    action_by VARCHAR(100) NOT NULL,
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO welfare_schemes (title, category, max_income_ceiling, target_occupation, target_location, financial_grant, subsidy_rate, description, document_checklist, application_guide)
VALUES 
('Pradhan Mantri Artisan Skill & Tool Assistance', 'Skill Development', 350000, 'Artisan', 'Urban', 'INR 50,000 Stipend', '80 Percent Subsidy', 'Direct financial grant and advanced toolkits for urban craftspeople, handloom weavers, and informal creators.', ARRAY['Aadhaar Card', 'Income Certificate from Tehsildar', 'Artisan Guild Registry Card'], ARRAY['Complete online registration on portal', 'Submit craft sample or skill certificate', 'Attend verification interview at district office']),
('National Smallholder Farmer Irrigation & Tech Scheme', 'Agriculture', 450000, 'Farmer', 'Rural', 'INR 1,20,000 Infrastructure', '90 Percent Subsidy', 'Subsidized drip irrigation systems and solar water pump installations for rural agricultural landholders.', ARRAY['Land Revenue Records (Khatian/Patta)', 'Bank Passbook Copy', 'Soil Testing Report'], ARRAY['Upload land ownership documents', 'Select certified micro-irrigation vendor', 'Await physical field inspection verification']),
('Clean Energy Electric Vehicle Mobility Grant', 'Environmental', 600000, 'Transportation Worker', 'Urban', 'INR 75,000 Voucher', '50 Percent Subsidy', 'Electric vehicle conversion incentives and zero-emission commercial transport permit fee waivers.', ARRAY['Commercial Driver License', 'Vehicle Registration Certificate (RC)', 'Proof of Residency'], ARRAY['Register vehicle VIN on central transport portal', 'Submit emission test clearance certificate', 'Claim voucher at authorized EV station']),
('Mahila Udyami Micro-Enterprise Incubator Fund', 'Economic Empowerment', 500000, 'Entrepreneur', 'Semi-Urban', 'INR 2,00,000 Capital', '75 Percent Subsidy', 'Seed funding, equipment support, and digital financial literacy mentoring for women-led micro-enterprises.', ARRAY['Business Incorporation Draft', 'Applicant Aadhaar Card', 'Project Proposal Summary'], ARRAY['Submit micro-enterprise project proposal draft', 'Complete 3-day digital orientation module', 'Receive direct bank transfer of capital grant']),
('Senior Citizen Comprehensive Health & Mobility Pass', 'Healthcare', 250000, 'Retired', 'All Regions', 'INR 1,00,000 Annual Coverage', '100 Percent Subsidy', 'Full financial coverage for mobility devices, essential chronic care medications, and home health services.', ARRAY['Age Proof (Voter ID / Aadhaar)', 'Medical Diagnostic Summary', 'Income Certificate'], ARRAY['Enroll via regional health welfare portal', 'Select primary municipal care center', 'Receive digital health benefit passcard']);

INSERT INTO civic_complaints (id, title, category, description, urgency, latitude, longitude, location_name, status, upvotes, reported_at)
VALUES 
('CMP-8941', 'Damaged Main Drainage Pipe Overflowing', 'Sanitation & Sewage', 'Raw sewage overflow creating biohazard on 5th Avenue intersection.', 'High', 22.57260000, 88.36390000, 'Kolkata Central District', 'Escalated', 42, NOW() - INTERVAL '52 hours'),
('CMP-7820', 'Streetlight Blackout in High-Pedestrian Zone', 'Public Safety', 'Multiple streetlights non-operational along 12th St causing safety risks.', 'Critical', 19.07600000, 72.87770000, 'Mumbai West Corridor', 'Pending', 19, NOW() - INTERVAL '30 hours'),
('CMP-6512', 'Pothole Hazard Near School Zone Entrance', 'Infrastructure', 'Deep road crater causing vehicle damage and safety risks for school buses.', 'Medium', 28.61390000, 77.20900000, 'New Delhi North Metro', 'Resolved', 58, NOW() - INTERVAL '72 hours'),
('CMP-5201', 'Contaminated Public Water Dispenser Line', 'Water Supply', 'Turbid water running from public drinking station near central park.', 'High', 13.08270000, 80.27070000, 'Chennai East Ward', 'Under Investigation', 31, NOW() - INTERVAL '18 hours');
