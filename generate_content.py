import json, pathlib
P=pathlib.Path(__file__).parent
content={
 'settings':[
 ['key','value','editor_note'],
 ['site_title','SPL9 | Virtual Practice Shift','Displayed across the website'],
 ['activity_title','Virtual Patient: Pain Assessment','Opening-page title'],
 ['intro_heading','Your final virtual shift challenge','Introduction heading'],
 ['intro_body','You are the nurse caring for a patient on a mental health inpatient ward. Gather a focused pain history, make safe clinical decisions, hand over your concerns using SBAR, and reflect on your practice. You will not receive the full clinical picture unless you ask appropriate questions.','Introductory brief; editable'],
 ['intro_tasks','Review the patient profile|Choose a structured pain assessment|Talk with the patient and take notes|Record your PQRST findings|Plan and justify your clinical decisions|Submit an SBAR handover|Complete a Gibbs reflection to receive your Blackboard code','Separate tasks with |'],
 ['patient_name','Alex Morgan','Fictional patient name'],
 ['patient_age','46','Age in years'],
 ['patient_pronouns','they/them','Pronouns used by patient'],
 ['patient_location','Mental health inpatient ward','Ward type'],
 ['patient_context','Alex has been an inpatient for six days. During the afternoon they have withdrawn from group activities, declined their meal and asked to remain in their room. A colleague tells you Alex mentioned abdominal discomfort.','Background shown before meeting'],
 ['patient_history','History: recurrent depression and anxiety. Constipation previously reported during admission. No recorded abdominal surgery. No known drug allergies. Medication chart available for review; do not assume medicines are appropriate without checking.','Editable history shown before meeting'],
 ['patient_opening','My stomach really hurts. I don’t want to make a fuss.','Initial patient statement'],
 ['patient_portrait_url','','Use a publicly accessible direct image URL or upload patient.jpg into docs'],
 ['chat_help','Ask one focused question at a time. The patient will reveal only information you actively enquire about. You may request a set of observations from the ward team.','Instructions over patient chat'],
 ['chat_min_turns','5','Minimum patient questions before progressing; set to 0 to disable'],
 ['code','8553','Client-side completion code: visible in source; NOT tamper-proof'],
 ['reflection_min_chars','45','Minimum number of characters in each Gibbs response'],
 ['clinical_min_chars','90','Minimum clinical action response length'],
 ['sbar_min_chars','40','Minimum characters per SBAR section'],
 ['footer_note','Educational simulation only. Fictional patient. Follow local policy, escalation procedures and prescribing guidance in actual clinical practice.','Footer wording']
 ],
 'tools':[
 ['id','name','description','prompts'],
 ['pqrst','PQRST','Provocation / Palliation, Quality, Region / Radiation, Severity, Timing','What makes it better or worse?|What does it feel like?|Where is it, and does it move?|How severe is it on a 0–10 scale?|When did it start and how has it changed?'],
 ['socrates','SOCRATES','Site, Onset, Character, Radiation, Associations, Time course, Exacerbating / relieving factors, Severity','Where is the pain?|When did it begin?|What does it feel like?|Does it spread?|Any other symptoms?|How has it changed?|What affects it?|Rate it 0–10'],
 ['opqrst','OPQRST','Onset, Provocation / Palliation, Quality, Region / Radiation, Severity, Time','When did this begin?|What changes the pain?|Describe the pain|Where is it and does it radiate?|Rate it 0–10|Is it constant or intermittent?']
 ],
 'dialogue':[
 ['id','intent','keywords','answer','category','tip'],
 ['site','Where is the pain?','where pain|where hurt|where is it|which part|location|site of pain|area hurt','It is mostly here, low down on the right side of my tummy.','region','Ask whether pain moves anywhere else'],
 ['onset','When did it begin?','when start|when begin|how long|first notice|onset|started|began|sudden','It started about five hours ago. It came on quite suddenly.','timing','Establish whether the pain has changed'],
 ['quality','What does it feel like?','what feel like|describe pain|kind of pain|sharp|dull|stabbing|burning|cramping|character|quality','It is sharp and quite constant. Sometimes it feels like a really bad stabbing pain.','quality','Explore severity and duration'],
 ['severity','How bad is the pain?','out of 10|pain score|scale of|how severe|how bad|rate the pain|severity|0 to 10|0-10','About eight out of ten, and it is getting difficult to ignore.','severity','Check how it affects the patient'],
 ['radiation','Does it spread?','spread|radiate|radiation|move anywhere|other places','It stays mostly on the lower right, although my whole tummy feels uncomfortable.','region','Include region and radiation in your notes'],
 ['provocation','What makes it worse?','worse|aggravate|trigger|provok|movement|move around|cough','Moving and walking make it much worse. I have tried curling up.','provocation','Ask about relieving factors'],
 ['relief','What makes it better?','better|reliev|ease|help the pain|anything help|painkiller|relief','Nothing has really helped. I have not been offered any pain relief yet.','provocation','Explore what care has been provided'],
 ['course','Is the pain constant?','constant|come and go|intermittent|time course|getting worse|changed|progress|throughout day','It has been there most of the time and has become much worse over the last two hours.','timing','Worsening pain may change urgency'],
 ['nausea','Any nausea or vomiting?','nausea|vomit|sick|being sick|thrown up','I feel very sick. I have not actually vomited.','associated','Ask about eating, drinking and bowel function'],
 ['fever','Any fever or chills?','temperature|fever|hot and cold|shiver|chills|sweat|sweaty','I feel hot and shivery, but I do not know my temperature.','associated','Consider requesting observations'],
 ['bowel','When did you open your bowels?','bowel|poo|stool|constipat|last motion|toilet|pass wind|faeces','I have not opened my bowels for two days. That sometimes happens, but this pain feels very different.','associated','Do not assume the cause of acute pain is constipation'],
 ['urine','Any urinary symptoms?','urine|urinat|wee|pee|passing water|waterwork|bladder','I have not noticed burning when I go to the toilet.','associated','Other assessment may be needed'],
 ['food','Have you eaten or drunk?','food|eat|appetite|lunch|meal|drink|fluid intake','I could not face lunch, and I have only had a few sips of water.','associated','Consider hydration and ongoing observations'],
 ['impact','How is this affecting you?','affect|impact|sleep|walking|function|activities|manage|do anything','I cannot get comfortable, and it hurts too much to join in activities.','impact','Consider comfort and reassurance'],
 ['history','Have you experienced this before?','before|previous|history of pain|happened|similar pain|past pain','Not like this. I have had constipation, but never a sharp pain this bad.','associated','Avoid diagnostic overshadowing'],
 ['meds','Have you had pain relief or medicines?','medicin|medication|tablet|drug|analgesi|pain relief|paracetamol|ibuprofen|prescrib|treatment','I take my usual mental health medicines. I have not had anything for this pain yet. Please check my medication chart.','other','Review chart before any proposed medicine'],
 ['allergy','Do you have allergies?','allerg|reaction to medicine|sensitive to medicine','I have no known drug allergies, as far as I know.','other','Check the documented allergy status'],
 ['observations','Can I have their observations?','observations|vital signs|obs|blood pressure|pulse|heart rate|respiratory|oxygen saturations|spo2|temperature reading|news2|news score','The ward team records: respiratory rate 24/min, SpO₂ 97% on air, pulse 118/min, blood pressure 94/60 mmHg, temperature 38.6°C, alert. NEWS2 totals 7.','critical','This is urgent: appropriate escalation and reassessment are important'],
 ['consent','Is it okay if I ask some questions?','consent|okay if|may i ask|can i ask|permission|introduce','Yes, please. I am glad somebody is listening.','rapport','Use calm patient-centred communication'],
 ['worry','Are you worried or frightened?','worried|anxious|afraid|scared|feeling mentally|mental state|distress','I am scared something is wrong. I was worried people would say it is just my anxiety.','rapport','Acknowledge concerns; do not dismiss physical symptoms'],
 ['help','What would help right now?','need from me|how can i help|what would help|comfort|reassure|support you','I want someone to take this seriously and help with the pain.','rapport','Explain how you will seek help'],
 ['other','Do you have other symptoms?','other symptom|anything else|any more symptom|associated symptom','I feel feverish and sick, and I am struggling to get comfortable.','associated','Follow up each important symptom'],
 ['pregnancy','Is pregnancy relevant?','pregnan|period|menstrual|gynaecolog','I would rather discuss private details confidentially with the clinician doing the examination.','other','Do not assume pregnancy risk or irrelevant histories'],
 ],
 'actions':[
 ['id','criterion','accepted_phrases','feedback_if_present','feedback_if_missing','required'],
 ['urgency','Recognise abnormal observations and urgency','news2 7|news of 7|news score 7|high news|urgent deterioration|acutely unwell|seriously unwell|sepsis risk|possible sepsis|shock risk|hypotens|tachycard|urgent medical review','You recognised that the presentation requires urgent action.','Identify why the vital signs and clinical presentation suggest urgent deterioration.','YES'],
 ['escalation','Escalate promptly','escalat|contact senior|inform nurse in charge|call nurse in charge|urgent medical review|call doctor|call medical team|request medical review|emergency response|rapid response','You included an appropriate escalation route.','Say who you would contact immediately and why.','YES'],
 ['assessment','Undertake ABCDE and repeat observations','abcde|a-e assessment|repeat observations|repeat obs|recheck vital|monitor observations|continuous monitoring','You included further assessment or monitoring.','Consider structured reassessment such as ABCDE and repeated vital signs.','YES'],
 ['pain','Address pain and comfort safely','pain relief|analgesi|comfort|reposition|check prescription|prescribed pain|offer support|pain management','You considered symptom relief and comfort.','Explain how you would support pain management within your professional role and prescribing arrangements.','YES'],
 ['communication','Reassure and keep patient informed','reassur|explain|stay with|inform patient|support patient|listen to patient|communicat|validate','You included patient-centred communication.','Consider how to explain actions and reassure the patient.','NO'],
 ['documentation','Document and hand over','document|record|handover|sbar|write notes|clinical notes','You planned to record or communicate findings.','Remember to document the assessment and communicate key findings.','NO']
 ],
 'sbar':[
 ['section','title','key_concepts','minimum_hits','feedback_if_missing'],
 ['S','Situation','alex|patient|abdominal|tummy|pain|8/10|8 out of 10|acute|severe', '2','Identify the patient, immediate pain concern and severity.'],
 ['B','Background','mental health|inpatient|admission|depression|anxiety|constipat|five hours|5 hours|sudden|no known allergies', '2','Include relevant history and the onset of symptoms.'],
 ['A','Assessment','right lower|lower right|sharp|nausea|shiver|fever|38.6|118|94/60|24|news2|news 7|deteriorat|hypotens', '3','Include important PQRST findings and abnormal observations.'],
 ['R','Recommendation','urgent|immediate|as soon|escalat|medical review|doctor|senior|nurse in charge|repeat obs|abcde|monitor|pain relief|review now', '2','State your escalation request and what should happen next.']
 ],
 'reflection':[
 ['stage','question','tip'],
 ['Description','Briefly describe what happened during your assessment and handover.','Focus on what you did, not imagined details.'],
 ['Feelings','How did you feel, or what did you notice about your confidence when asking questions?','It is acceptable to be uncertain.'],
 ['Evaluation','What went well, and what was difficult?','Identify a concrete strength and an area for improvement.'],
 ['Analysis','Why did you choose that pain assessment framework? How did it help or limit your clinical reasoning?','Explicitly name your chosen tool and discuss its usefulness.'],
 ['Conclusion','What would you do differently if you repeated this assessment?','Identify a specific lesson learnt.'],
 ['Action Plan','What specific action will you take to improve your next pain assessment?','Make the future action achievable and observable.']
 ]
}
(P/'public'/'content.json').write_text(json.dumps(content,ensure_ascii=False,indent=2),encoding='utf-8')
print({k:len(v)-1 for k,v in content.items()})
