(()=>{"use strict";
const API=window.DaymarkFitness,PLAN_ID="musselman-2027-v1",START="2026-11-09",WEEKS=35;
if(!API){console.warn("Daymark Fitness must load before the training plan.");return;}
const $=q=>document.querySelector(q),escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function dateAt(week,weekday){const start=new Date(START+"T12:00:00");start.setDate(start.getDate()+week*7+weekday);return [start.getFullYear(),String(start.getMonth()+1).padStart(2,"0"),String(start.getDate()).padStart(2,"0")].join("-")}
function round5(x){return Math.max(5,Math.round(x/5)*5)}function round50(x){return Math.max(200,Math.round(x/50)*50)}
function phase(w){if(w>=33)return"Taper";if(w>=26)return"Race-specific";if(w>=16)return"Build";if(w>=8)return"Base";return"Adaptation"}
function scale(w){if(w===34)return 1;if(w===33)return .57;if(w<32&&(w+1)%4===0)return .76;return 1}
function makeWorkout(w,day,code,sport,title,duration,distance,unit,intensity,notes){
 const scaleFactor=scale(w);
 return {id:"plan-"+PLAN_ID+"-"+w+"-"+code,planId:PLAN_ID,planKey:"w"+(w+1)+"-"+code,planWeek:w+1,date:dateAt(w,day),sport,title,
 duration:round5(duration*scaleFactor),distance:distance?round50(distance*scaleFactor):"",unit:unit||"",intensity,completed:false,time:"",notes:notes+" Training week "+(w+1)+" of "+WEEKS+" · "+phase(w)+(scaleFactor<1?" · reduced-volume recovery/taper week":"")+"."};
}
function buildWeek(w){
 const sessions=[],push=(...args)=>sessions.push(makeWorkout(w,...args));
 const skillYards=round50(700+40*w);
 const enduranceYards=round50(850+45*w);
 const extraYards=round50(700+33*w);
 const easyRun=30+.55*w,longRun=45+1.5*w,weekdayBike=40+1.6*w,longBike=60+5*w;
 if(w===34){
  push(1,"swim","Swim","Easy race-week swim",20,500,"yd","Easy","Relaxed technique: short repeats with generous rest. Stay fresh, not fatigued.");
  push(2,"bike","Bike","Short race-week spin",30,"","mi","Easy","Keep effort very light; check bike readiness and equipment.");
  push(3,"run","Run","Easy shakeout run",20,"","mi","Comfortable conversational jog. Rest if fatigued.");
  push(5,"prep","Recovery","Race preparation and gear check",15,"","","Recovery","Optional light mobility and gear check. Prepare nutrition and transitions; rest as needed.");
  sessions.push({id:"plan-"+PLAN_ID+"-34-race",planId:PLAN_ID,planKey:"w35-race",planWeek:35,date:dateAt(34,6),sport:"Triathlon",title:"RACE DAY — IRONMAN 70.3 Musselman",duration:"",distance:"",unit:"",intensity:"Moderate",completed:false,time:"",notes:"1.2 mi swim, 56 mi bike, 13.1 mi run. Review official race instructions, fueling, pacing, transitions, and safety. Log your final time after finishing."});
  return sessions;
 }
 push(1,"swim-tech","Swim","Technique swim",26+.85*w,skillYards,"yd","Easy","Swim in manageable intervals. Focus on relaxed breathing, body position and efficient strokes. The yardage is the total session, not a continuous-swim requirement. Take rests as needed; seek coaching for technique.");
 push(1,"strength","Strength","General strength and mobility",w>=26?20:25,"","","Moderate","Controlled total-body movements, core stability, single-leg work and mobility. Keep effort moderate and avoid soreness before key sessions.");
 push(2,"bike-aerobic","Bike","Aerobic bike",weekdayBike,"","mi",w>=16?"Moderate":"Easy",w>=16?"Ride mostly conversational, with a few brief steady efforts only if recovered. Indoor trainer is fine.":"Keep an easy conversational effort; build comfortable time in the saddle. Indoor trainer is fine.");
 push(2,"run-easy","Run","Easy maintenance run",easyRun,"","mi","Easy","Comfortable conversational run. Your marathon experience supports run fitness, but avoid extra mileage when fatigued from learning the other disciplines.");
 push(3,"swim-steady","Swim","Steady swim endurance",31+.9*w,enduranceYards,"yd","Easy","Work through relaxed repeat sets. Gradually extend individual repeats only as technique allows. The yardage is the total workout; prioritize form over pace.");
 if(w>=8){push(4,"swim-recovery","Swim","Easy technique and form swim",24+.5*w,extraYards,"yd","Easy","Easy drills and shorter repeats; finish feeling better than when you started. Skip this session if recovery is poor.");}
 if(w>=16){push(4,"bike-easy","Bike","Short aerobic spin",25+.7*w,"","mi","Easy","Optional low-stress ride, ideally separated from the swim. Skip if tired or time is limited.");}
 push(5,"bike-long","Bike","Long endurance ride",longBike,"","mi","Easy","Predominantly easy, conversational effort. Add time gradually, practice eating and drinking on rides over an hour, and review comfort and bike fit.");
 if(w>=12){push(5,"brick","Run","Easy bike-to-run brick",10+(w-12)*.9,"","mi","Easy","Start immediately or shortly after the long ride with a relaxed short run to practice the transition. Keep it easy; shorten or skip if overly fatigued.");}
 push(6,"run-long","Run","Easy endurance run",longRun,"","mi","Easy","Maintain a steady aerobic running base, not a marathon build. Favor good recovery and injury prevention. Do not add long-run mileage unnecessarily.");
 return sessions;
}
const weeks=Array.from({length:WEEKS},(_,i)=>buildWeek(i)),all=weeks.flat();
function planWeekForToday(){
 const current=new Date(),start=new Date(START+"T12:00:00");
 const diff=Math.floor((new Date(current.getFullYear(),current.getMonth(),current.getDate(),12)-start)/86400000);
 return Math.max(0,Math.min(WEEKS-1,Math.floor(diff/7)));
}
let weekIndex=planWeekForToday();
function summaryForWeek(w){
 const current=weeks[w],minutes=current.reduce((a,s)=>a+Number(s.duration||0),0);
 const bike=current.find(s=>s.planKey.endsWith("bike-long")),run=current.find(s=>s.planKey.endsWith("run-long"));
 const swim=current.find(s=>s.planKey.endsWith("swim-steady"));
 const labels={Adaptation:"Learn the swim rhythm and get comfortable extending ride time.",Base:"Establish a consistent, repeatable aerobic routine.",Build:"Extend the long ride and learn to run easily off the bike.","Race-specific":"Practice realistic race-week fueling, transitions and sustained aerobic endurance.",Taper:"Reduce volume, keep moving lightly, and arrive rested."};
 const reduced=scale(w)<1?" Reduced-volume week for recovery.":"";
 const total=(minutes/60).toFixed(1);
 $("#planWeekHeading").textContent="Week "+(w+1)+" — "+phase(w);
 const d0=new Date(dateAt(w,0)+"T12:00:00"),d6=new Date(dateAt(w,6)+"T12:00:00");
 $("#planDateRange").textContent=d0.toLocaleDateString(undefined,{month:"short",day:"numeric"})+" – "+d6.toLocaleDateString(undefined,{month:"short",day:"numeric"});
 $("#planStats").innerHTML=[
   ["Planned volume",total+" hr"],
   ["Long ride",bike?Math.round(bike.duration)+" min":w===34?"Race week":"—"],
   ["Swim endurance",swim?swim.distance+" yd":"Easy"],
   ["Sessions",current.length]
 ].map(([label,value])=>'<div><span>'+escape(label)+'</span><strong>'+escape(value)+'</strong></div>').join("");
 $("#planMilestone").innerHTML='<strong>'+escape(labels[phase(w)])+'</strong>'+escape(reduced);
 $("#planPrev").disabled=w===0;$("#planNext").disabled=w===WEEKS-1;
}
function refreshInstall(){
 const installed=API.getData().workouts.filter(w=>w.planId===PLAN_ID);
 const count=installed.length;
 $("#planInstallStatus").textContent=count?count+" personalized training sessions are in this browser. You can edit individual workouts in the calendar or log.":"Load your plan to add dated sessions without deleting existing workouts. Data is browser-local, so load separately on each device.";
 const button=$("#installPlan");button.textContent=count?"✓ Plan added to this browser":"+ Load all 35 weeks into my calendar";button.disabled=count>0;
}
$("#planPrev").addEventListener("click",()=>{weekIndex=Math.max(0,weekIndex-1);summaryForWeek(weekIndex)});
$("#planNext").addEventListener("click",()=>{weekIndex=Math.min(WEEKS-1,weekIndex+1);summaryForWeek(weekIndex)});
$("#viewPlanWeek").addEventListener("click",()=>{API.goToWeek(dateAt(weekIndex,0));$("#schedule").scrollIntoView({behavior:"smooth"})});
$("#installPlan").addEventListener("click",()=>{
 const total=all.length;const old=API.getData().workouts.filter(w=>w.planId===PLAN_ID).length;
 if(old){refreshInstall();return}
 if(!confirm("Add "+total+" planned workouts across 35 weeks (November 9, 2026 to July 11, 2027)? Your existing workouts will be kept. This is a flexible framework, not a fixed obligation."))return;
 const added=API.addPlanSessions(all);
 refreshInstall();
 API.goToWeek(dateAt(planWeekForToday(),0));
 $("#planInstallStatus").textContent=added.added+" sessions added successfully. You can now edit dates, sessions, and durations.";
});
summaryForWeek(weekIndex);refreshInstall();
})();