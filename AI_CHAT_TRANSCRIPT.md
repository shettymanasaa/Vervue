Sooo I'm participating in this hackathon(ABtalks vicodathan),im solo participant.the problem statements are not at released.as i already bulit civic using chatgpt and features from cloud then vs code i wanna follow same procedure but ensure about cloud .sooo meanwhile lets bulid atmosphere and tell me all neccessary things to set up 

vs code is installed,and yeahh im going to use react and vite onlyyy.alsooo once the statements are released i will paste it here to discuss

https://www.youtube.com/live/Tl7kFB_DXYc?si=nV6Icgcst48IljiA
This is the youtube link
Can you go through it ??

i have attached the problem statemnts.personnally i feel like 2nd one is good .coz from my previous vibe coded project it feels similar.as many choose 1st i dont wanna be that + im not that good ui desinger.anddd 3rd one is too diff for me soo 2nd approch is better!!! give me suggestions and your thoughts on difficulty based on my skills 

i have created the git repo and not added anything in the readme ,named the project (ai-interviwe agent)temporary,lets start with the actuall folder structure i have to create so that i can easilly get code from you and add then into respective ones 

lets move forward. now i want clearly say the flow i wanted.home to candidate section to interview section then the end point feedback session

yeahb i think keeping all candidate card is pretty good we will add it .coming to theme i want both dark and light time to work.about color pallete suggest me some good themes and mainly dont give me basic combinations like purple and white or black thts too basic so our theme shloud be calm and simple to USERS and generate the sample images of theme suggestions(all in single photo)

let us first bulid the backend needed then the fronted also ig there is no need of actual database .we can keep it as future scoop if needed,and yeah the midnight blue theme is good we will continue with the same one .

we mainly needed to checklist the min req they mentioned in the above ss.and also i have attached you the files they have provided us with information needed

okayyy folder structure is done. now lets start with the backend first as i said. i dont want unnecessary files or complicated since im solo and we have less time. tell me exactly which file we should create first and then give me the code for that only. i'll add it and tell you once its working then we'll move next.

waittt before coding anything explain me the backend flow once in simple terms 😭 like when candidate selects a profile what exactly happens till the question comes on frontend and then after they answer how it goes back to backend and generates next question.
okayyy folder structure is done. now lets start with the backend first as i said. i dont want unnecessary files or complicated architecture since im solo and we have limited time. tell me exactly which file we should create first and then give me the code for that only. i'll add it and tell you once its working then we'll move next.

waittt before coding anything explain me the backend flow once in simple terms  like when candidate selects a profile what exactly happens till the question comes on frontend and then after they answer how it goes back to backend and generates next question.

okayyy now comes the main parttt. we need the actual interview agent. i want it to understand the selected candidate before asking questions, and then after every answer it should decide what to ask next.

alsooooo make sure it doesn't keep asking the same type of question again and again. it should cover different areas from the candidate's curriculum and then use their answer for follow up.

wait i feel like the prompt is becoming too big 😭 can you simplify it without losing the important instructions? because i want the model to actually follow it consistently.

okay now give me the complete prompt we should use in the service and explain each important part after the cod

backend part is working nowww. let's move to frontend. remember our flow is home → candidates → interview → transcript → feedback. don't change this flow.

lets first build the home page only. i want it to look like an actual product, not a basic student project keep the midnight blue theme we decided and make light mode from the same design system.

bro this looks too basic 😭 i told you i dont want that generic AI dashboard look. keep it calm but make it feel premium and clean. don't suddenly throw purple gradients everywhere.

okay home is looking better. now candidate section. i think cards are still better than dropdown because the user can see who they are selecting. make the cards clean and show only useful candidate information.

also when i click a candidate it should clearly show that it is selected before i continue. don't make me guess whether the click worked 

okay candidate page done. now connect it with backend. when i select candidate and click continue it should create/start that candidate's interview session and then take me to interview page.

brooo don't change backend logic unnecessarily. just connect what we already have with the frontend.

okay API is connected but now tell me what exactly i should check in browser to confirm it's actually getting the selected candidate and not some default one.

should we show the candidate name somewhere on interview page? i think a small indication would make it feel more personalized.

okayyyy first real test. i'm going to select candidate 1 and send you the questions one by one. tell me whether they're actually related to the candidate and whether the difficulty progression makes sense.

now i'll test another candidate. if both candidates get almost the exact same questions then something is wrong with our context/prompt, so check that carefully.

brooo this question is combining like 4 things 😭 this is exactly what i didn't want. fix the prompt so one question has one clear purpose and follow ups

nowww i want the transcript. after the interview ends, candidate should first see every question and their answer. only after that they can view feedback.

don't put transcript inside feedback. transcript should be its own page because candidate might want to review what they actually answered before seeing the evaluation.

also make sure we're actually storing every submitted question + answer. otherwise we'll reach the end and have nothing to show 

form the you gave vervue iss greatttt,let me change and tell you

okay now local app is working. before deployment let's check the production setup properly because last time with CivicEye deployment caused problems 😭.

compare whether we should deploy frontend and backend together or separately. i'm already familiar with Vercel but tell me honestly which is less risky for this project.

okay let's deploy backend first. once it's live give me exactly what i need to change in frontend and how to test it before pushing.

backend is deployed at https://vervue-api.vercel.app/. so now what exactly should i change from localhost?

wdym by test locally 😭 if backend is deployed but frontend is local, what exactly am i testing?

u mean i should run the frontend locally and check whether it can actually call the deployed backend before pushing?

okay local frontend is connecting to deployed backend. now should i run npm run build before pushing or is that unnecessary?

build is workingggg. now let's push and let Vercel deploy. after deployment what should i check first?

live site is working 😭 now don't make any more unnecessary changes. let's freeze the core functionality and only fix actual issues.

hey are asking for AI usage log and want to verify that the project was truly vibe coded. i don't want to make fake polished prompts that i never actually wrote !!!! what is the most best way to document our actual development conversation?

yeah done yahhh!!! our app is readyy and all i have to do is submit linls to themmm and lets wait for reslutsssss nowww