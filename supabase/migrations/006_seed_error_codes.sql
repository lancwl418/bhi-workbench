-- Seed error codes from BHI Air Conditioner Service Manual (BHI_troubleshoot.pdf)

INSERT INTO wb_error_codes (code, name, description, possible_causes, solution, severity) VALUES

-- E series
('E0', 'IDU & ODU Communication Failure', 'Indoor and outdoor unit communication failure.', 'IDU/ODU wiring connection incorrect or damaged. Communication wiring in poor condition. Main power supply issue.', '1. Check IDU wiring connection, re-connect if needed.
2. Check communication wiring condition, replace/re-connect.
3. Check ODU wiring connection.
4. Check voltage from IDU terminal L,N (should be 220V).
5. Check ODU PCB LED5 status (ON/Flash).
6. If still failing: replace IDU PCB first, then ODU PCB.', 'critical'),

('E1', 'IDU Room Temperature Sensor Failure', 'IDU Room Temperature sensor failure (IDU RT failure).', 'Sensor not well connected to PCB. Sensor resistance open or short circuit.', '1. Check sensor connection to PCB, re-connect if needed.
2. Use multi-meter to check sensor for open/short circuit.
3. If sensor is faulty, replace the sensor.
4. If problem persists, replace IDU PCB.', 'warning'),

('E2', 'IDU Coil Temperature Sensor Failure', 'IDU Coil temperature sensor failure (IDU IPT failure).', 'Sensor not well connected to PCB. Sensor resistance open or short circuit.', '1. Check sensor connection to PCB, re-connect if needed.
2. Use multi-meter to check sensor for open/short circuit.
3. If sensor is faulty, replace the sensor.
4. If problem persists, replace IDU PCB.', 'warning'),

('E3', 'ODU Coil Temperature Sensor Failure', 'ODU Coil temperature sensor failure (OPT).', 'Sensor not well connected to ODU PCB. Sensor resistance open or short circuit.', '1. Check sensor connection to ODU PCB, re-connect if needed.
2. Use multi-meter to check sensor resistance for open/short circuit.
3. If sensor is faulty, replace sensor.
4. If problem persists, replace ODU PCB.', 'warning'),

('E4', 'AC Cooling System Abnormal', 'AC Cooling system abnormal — gas not enough.', 'Gas leakage. 2-way or 3-way valve blocked. Sensor short/open. Low refrigerant pressure.', '1. Check AC pressure (cooling: 0.8-1.3Mpa, heating: 2.0-3.6Mpa).
2. If pressure correct: check sensor for short/open circuit, replace sensor or main PCB.
3. If pressure low: check valves are open, add gas.
4. If E4 persists after gas charge: system may be blocked, maintain the system.', 'critical'),

('E5', 'IDU/ODU Mismatched Failure', 'IDU/ODU mismatched failure (specially performance test on the production line).', NULL, NULL, 'info'),

('E6', 'IDU Ventilation Failure', 'IDU PG Fan motor / DC fan motor works abnormal (IDU failure). PG and DC fan motor only.', 'Fan blade physically blocked. Fan motor not connected to PCB. Fan motor winding open/short circuit.', '1. Turn fan blades by hand while power-off — check they run smoothly.
2. If blocked: adjust motor and blade assembly.
3. Check fan motor connection to PCB, re-connect if needed.
4. Use multi-meter to check resistance of fan motor winding for open/short circuit.
5. If faulty: replace fan motor.
6. If problem persists, replace IDU PCB.', 'warning'),

('E7', 'ODU Ambient Temperature Sensor Failure', 'ODU Ambient Temperature sensor failure.', 'Sensor not well connected to ODU PCB. Sensor resistance open or short circuit.', '1. Check sensor connection to ODU PCB, re-connect.
2. Multi-meter check sensor resistance.
3. Replace sensor if faulty.
4. If problem persists, replace ODU PCB.', 'warning'),

('E8', 'ODU Discharge Temperature Sensor Failure', 'ODU Discharge Temperature sensor failure.', 'Sensor not well connected to ODU PCB. Sensor resistance open or short circuit.', '1. Check sensor connection to ODU PCB, re-connect.
2. Multi-meter check sensor resistance.
3. Replace sensor if faulty.
4. If problem persists, replace ODU PCB.', 'warning'),

('E9', 'IPM / Compressor Driving Control Abnormal', 'ODU IPM / Compressor drive fault. If unit stops 6 times for IPM protection (P0) continuously, it will display E9 and cannot be recovered except by pressing ON/OFF.', 'Preceded by F9/FA errors (replace ODU PCB). Preceded by F5/F6/F7 errors. Preceded by P0/P2 errors. Compressor failure.', '1. Re-power unit, run for 30 min, check failure code display.
2. If F9 or FA displayed first → replace ODU PCB.
3. If F5, F6, or F7 displayed first → follow F5/F6/F7 solution.
4. If P0 or P2 displayed first → follow P0/P2 solution.
5. If none of above, normal protection or replace compressor.', 'critical'),

('EA', 'ODU Current Test Circuit Failure', 'ODU Current Test circuit failure.', 'ODU PCB broken.', 'Replace ODU PCB.', 'critical'),

('Eb', 'Communication Abnormal (Main PCB & Display Board)', 'The Communication abnormal of Main PCB and Display board (IDU failure).', 'Display board or main PCB connection issue.', 'Check display board and main PCB connections. Replace if needed.', 'warning'),

('EE', 'ODU EEPROM Failure', 'ODU EEPROM failure.', 'ODU PCB broken.', '1. Check if ODU PCB is broken.
2. Try to re-power the AC unit.
3. If persists, replace ODU PCB.', 'warning'),

('EF', 'ODU DC Fan Motor Failure', 'ODU DC fan motor failure.', 'Fan blade physically blocked. Fan motor not connected to PCB. Fan motor defective.', '1. Check fan blade by hand — can it rotate freely? If not, re-install DC motor.
2. Check fan motor connection to PCB, re-connect if needed.
3. For built-in control (5pins): check Vm=310V, Vcc=15V.
4. For external control (3pins): test voltage btw U/V/W, normally DC 20-200V.
5. If voltage abnormal: replace ODU PCB.
6. Check fan motor operation. If defective: replace fan motor.
7. If still not working: replace ODU PCB.', 'warning'),

('EU', 'ODU Voltage Test Circuit Abnormal', 'ODU Voltage test sensor failure. When tested voltage effective value less than 50V for 3s continuously, unit will display EU.', 'Power supply voltage abnormal. ODU PCB failure.', '1. Test voltage between ODU terminal L/N — should be more than 50V.
2. If voltage low: check while voltage becomes normal, unit should recover.
3. If voltage is normal but EU persists: replace ODU PCB.', 'critical'),

-- P series (Protection)
('P0', 'IPM Module Protection', 'IPM module protection. When overheat or overcurrent for IPM, AC unit will display P0.', 'ODU fan motor not working or too slow. AC pressure abnormal. Condenser/evaporator dirty. Capillary blocked. Compressor failure.', '1. Restart unit — if works normal, done.
2. Check wiring connection U/V/W, re-connect if needed.
3. Check if ODU fan motor works or is too slow → replace ODU fan motor.
4. Check AC pressure (cooling: 0.8-1.3Mpa, heating: 2.0-3.6Mpa).
5. Check if condenser/evaporator is dirty → clean.
6. Check if capillary is blocked → replace capillary.
7. Check compressor voltage btw U/V/W (normally DC 20-200V).
8. If voltage abnormal: replace ODU PCB.
9. If all above fails: replace compressor.', 'critical'),

('P1', 'Over/Under Voltage Protection', 'Over / under voltage protection. Triggers when power supply V>AC260V or V<AC150V. Unit recovers when V>AC155V. Also checks DC busbar voltage (triggers when V>DC420V or V<DC150V).', 'Power supply voltage out of range (should be AC145-260V). DC busbar voltage out of range (should be DC150-420V). ODU PCB failure.', '1. Check power supply voltage between L&N — should be AC145-260V.
2. If out of range: wait until AC voltage recovers.
3. Check DC busbar voltage — should be DC150-420V.
4. If out of range: wait until busbar voltage recovers.
5. If voltages are normal but P1 persists: replace ODU PCB.', 'critical'),

('P2', 'Over Current Protection', 'Over current protection. When AC unit running current exceeds Imax, it will stop. Note: Imax varies by AC model.', 'ODU fan motor not working. IDU filter or ODU condenser dirty. ODU PCB failure.', '1. Check if ODU fan motor works — if not, replace fan motor.
2. Check if IDU filter or ODU condenser is too dirty → clean.
3. Re-start the unit.
4. If P2 persists: replace ODU PCB.', 'critical'),

('P4', 'ODU Discharge Pipe Over Temperature Protection', 'ODU Discharge temperature overheating protection.', 'ODU temperature too high (>60°C is normal protection). ODU location/ventilation poor. Condenser dirty or filter blocked. Fan motor running slowly or stopped. Capillary blocked. Gas pressure abnormal.', '1. If ODU temp >60°C: this is normal protection, wait to cool down.
2. Check ODU location — ensure enough space for ventilation.
3. Check if condenser is dirty or filter blocked → clean.
4. Check IDU/ODU fan motor — if slow/stopped, check fan blade, replace fan motor or PCB.
5. Check if capillary is blocked → replace capillary.
6. Check gas pressure (cooling: 0.8-1.3Mpa, heating: 2.0-3.6Mpa) → charge gas.
7. If all above fails: replace ODU.', 'warning'),

('P5', 'Sub-cooling Protection (Cooling/Dry Mode)', 'Sub-cooling protection on Cooling mode. On Cooling/Dry mode, when IDU evaporator coil temperature IPT<1°C continuously for 3 min after compressor start up for 6 min, CPU will switch off outdoor unit. Note: cooling mode under low environment temperature easily triggers P5.', 'IDU filter dirty. IDU air inlet blocked. Fan blade cannot rotate freely. Fan motor too slow or stopped. IPT sensor abnormal. IDU PCB failure.', '1. Switch on unit after minutes — if P5 disappears, it was normal protection.
2. Check if IDU filter is dirty → clean filter.
3. Check if IDU air inlet is blocked → clean.
4. Check if fan blade can rotate freely → check and repair.
5. Check if fan motor works too slow or stopped → check for defect, replace motor.
6. Check if sensor IPT is abnormal → replace sensor.
7. If all above fails: replace IDU PCB.', 'warning'),

('P6', 'Overheating Protection (Cooling Mode)', 'Overheating protection on Cooling mode.', NULL, 'Please check the troubleshooting flowchart for detail.', 'warning'),

('P7', 'Overheating Protection (Heating Mode)', 'Overheating protection on Heating mode.', NULL, 'Please check the troubleshooting flowchart for detail.', 'warning'),

('P8', 'Outdoor Over/Under Temperature Protection', 'Outdoor Over temperature/Under temperature protection.', NULL, 'Please check the troubleshooting flowchart for detail.', 'warning'),

('P9', 'Compressor Driving Protection (Load Abnormal)', 'Compressor driving protection — load abnormal.', NULL, 'Please check the troubleshooting flowchart for detail.', 'warning'),

('PA', 'Communication Failure for TOP Flow Unit / Preset Mode Conflict', 'Communication failure for TOP flow unit / Preset mode conflict (IDU failure).', NULL, 'Please check the troubleshooting flowchart for detail.', 'warning'),

-- F series
('F0', 'Infrared Customer Feeling Test Sensor Failure', 'Infrared Customer feeling test sensor failure (IDU failure).', 'IDU sensor issue.', 'Query by pressing remote controller: press ECO button 8 times with 8 seconds, buzzer beeps 2 times.', 'info'),

('F1', 'Electric Power Test Module Failure', 'Electric Power test module failure (IDU failure).', 'IDU module issue.', 'Query by pressing remote controller.', 'info'),

('F2', 'Discharge Temperature Sensor Failure Protection', 'Discharge temperature sensor failure PROTECTION.', NULL, 'Please check the troubleshooting flowchart for detail.', 'warning'),

('F3', 'ODU Coil Temperature Failure Protection', 'ODU coil temperature failure PROTECTION.', NULL, 'Please check the troubleshooting flowchart for detail.', 'warning'),

('F4', 'Cooling System Gas Flow Abnormal Protection', 'Cooling system gas flow abnormal PROTECTION.', NULL, 'Please check the troubleshooting flowchart for detail.', 'warning'),

('F5', 'PFC Protection', 'PFC PROTECTION.', NULL, 'Please check the troubleshooting flowchart for detail.', 'critical'),

('F6', 'Compressor Lack of Phase / Anti-phase Protection', 'The Compressor lack of phase / Anti-phase PROTECTION.', NULL, 'Please check the troubleshooting flowchart for detail.', 'critical'),

('F7', 'IPM Module Temperature Protection', 'IPM Module temperature PROTECTION.', NULL, 'Please check the troubleshooting flowchart for detail.', 'critical'),

('F8', '4-Way Valve Reversing Abnormal', '4-Way Value reversing abnormal.', NULL, 'Please check the troubleshooting flowchart for detail.', 'warning'),

('F9', 'IPM Module Temperature Test Circuit Failure', 'The module temperature test circuit failure.', 'ODU PCB failure.', 'Replace the ODU PCB.', 'warning'),

('FA', 'Compressor Phase-Current Test Circuit Failure', 'The compressor Phase-current test circuit failure.', 'ODU PCB failure.', 'Replace the ODU PCB.', 'warning'),

('Fb', 'Limiting/Reducing Frequency for Over Load Protection', 'Limiting/Reducing frequency for Over load protection on Cooling/Heating mode.', NULL, 'Query by pressing remote controller: press ECO button 8 times with 8 seconds.', 'info'),

('FC', 'High Power Consumption Protection', 'Limiting/Reducing frequency for High power consumption protection.', NULL, 'Query by pressing remote controller.', 'info'),

('FE', 'Module Current Protection', 'Limiting/Reducing frequency for Module current protection (phase current of compressor).', NULL, 'Query by pressing remote controller.', 'info'),

('FF', 'Module Temperature Protection (Frequency)', 'Limiting/Reducing frequency for Module temperature protection.', NULL, 'Query by pressing remote controller.', 'info'),

('FH', 'Compressor Driving Protection (Frequency)', 'Limiting/Reducing frequency for Compressor driving protection.', NULL, 'Query by pressing remote controller.', 'info'),

('FP', 'Anti-condensation Protection (Frequency)', 'Limiting/Reducing frequency for anti-condensation protection.', NULL, 'Query by pressing remote controller.', 'info'),

('FU', 'Anti-frost Protection (Frequency)', 'Limiting/Reducing frequency for anti-frost protection.', NULL, 'Query by pressing remote controller.', 'info'),

('Fj', 'Discharge Over Temperature Protection (Frequency)', 'Limiting/Reducing frequency for Discharge over temperature protection.', NULL, 'Query by pressing remote controller.', 'info'),

('Fn', 'ODU AC Current Protection (Frequency)', 'Limiting/Reducing frequency for ODU AC Current protection.', NULL, 'Query by pressing remote controller.', 'info'),

('Fy', 'Gas Leakage Protection', 'Gas leakage protection.', NULL, 'Please check the troubleshooting flowchart for detail.', 'critical'),

-- b series (optional sensors)
('bf', 'TVOC Sensor Failure', 'TVOC sensor failure (IDU failure, optional).', 'IDU TVOC sensor issue.', 'Query by pressing remote controller.', 'info'),

('bc', 'PM2.5 Sensor Failure', 'PM2.5 sensor failure (IDU failure, optional).', 'IDU PM2.5 sensor issue.', 'Query by pressing remote controller.', 'info'),

('bj', 'Humidity Sensor Failure', 'Humidity sensor failure (IDU failure).', 'IDU humidity sensor issue.', 'Query by pressing remote controller.', 'info');

-- ─── Associate error codes with applicable products ───
-- Rule: all products whose model_number does NOT contain 'ASW' or 'BHI-CH'
-- (currently this covers all 16 Mini Split AC products)

INSERT INTO wb_error_code_products (error_code_id, product_id)
SELECT ec.id, p.id
FROM wb_error_codes ec
CROSS JOIN products p
WHERE p.model_number NOT LIKE '%ASW%'
  AND p.model_number NOT LIKE '%BHI-CH%'
  AND p.category IN ('Mini Split Systems')
ON CONFLICT (error_code_id, product_id) DO NOTHING;
