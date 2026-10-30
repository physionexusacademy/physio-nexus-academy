"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowRight, Baby, Calculator, CheckCircle2, Info, Ruler, Scale, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import "./bmi.css";

type Unit = "metric" | "imperial";
type Sex = "female" | "male";

const adultBands = [
  { label: "Underweight", range: "< 18.5", min: 0, max: 18.5, tone: "blue" },
  { label: "Healthy range", range: "18.5–24.9", min: 18.5, max: 25, tone: "green" },
  { label: "Overweight", range: "25.0–29.9", min: 25, max: 30, tone: "amber" },
  { label: "Obesity class 1", range: "30.0–34.9", min: 30, max: 35, tone: "red" },
  { label: "Obesity class 2", range: "35.0–39.9", min: 35, max: 40, tone: "red" },
  { label: "Obesity class 3", range: "≥ 40.0", min: 40, max: 100, tone: "red" },
];

export default function BmiCalculatorPage() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [age, setAge] = useState("25");
  const [sex, setSex] = useState<Sex>("female");
  const [height, setHeight] = useState("170");
  const [heightFeet, setHeightFeet] = useState("5");
  const [heightInches, setHeightInches] = useState("6");
  const [weight, setWeight] = useState("70");
  const [waist, setWaist] = useState("");
  const [result, setResult] = useState(false);

  const values = useMemo(() => {
    const h = Number(height);
    const feet = Number(heightFeet);
    const inches = Number(heightInches);
    const w = Number(weight);
    const totalInches = feet * 12 + inches;
    const metres = unit === "metric" ? h / 100 : totalInches * 0.0254;
    const kg = unit === "metric" ? w : w * 0.45359237;
    const waistValue = Number(waist);
    const waistMetres = unit === "metric" ? waistValue / 100 : waistValue * 0.0254;
    const years = Number(age);
    const bmi = kg / (metres * metres);
    const waistToHeight = waistValue > 0 ? waistMetres / metres : null;
    return { metres, kg, years, bmi, waistToHeight };
  }, [age, height, heightFeet, heightInches, unit, waist, weight]);

  const imperialHeightValid = Number(heightFeet) >= 1 && Number(heightFeet) <= 8 && Number(heightInches) >= 0 && Number(heightInches) < 12;
  const valid = Number.isFinite(values.bmi) && values.metres >= 0.5 && values.metres <= 2.7 && (unit === "metric" || imperialHeightValid) && values.kg >= 2 && values.kg <= 500 && values.years >= 5 && values.years <= 120;
  const adult = values.years >= 20;
  const band = adult ? adultBands.find((item) => values.bmi >= item.min && values.bmi < item.max) ?? adultBands[3] : null;

  function calculate() { if (valid) setResult(true); }

  return (
    <main className="bmi-page">
      <section className="bmi-hero">
        <div className="bmi-shell bmi-hero-grid">
          <div className="bmi-hero-copy">
            <span className="bmi-eyebrow"><Activity size={14}/> PNA HEALTH TOOLS</span>
            <h1>Understand your <span>BMI.</span></h1>
            <p>Calculate Body Mass Index with clear, age-aware guidance. A simple screening measure, explained responsibly.</p>
            <div className="bmi-benefits">
              <span><ShieldCheck/> Evidence-informed</span>
              <span><UserRound/> Age-aware guidance</span>
              <span><Sparkles/> Free to use</span>
            </div>
          </div>
          <div className="bmi-hero-art" aria-hidden="true">
            <div className="bmi-art-orbit orbit-one"/><div className="bmi-art-orbit orbit-two"/>
            <div className="bmi-art-card"><Ruler/><strong>Measure.</strong><span>Understand.</span><em>Move better.</em></div>
            <div className="bmi-art-dot dot-one"/><div className="bmi-art-dot dot-two"/>
          </div>
        </div>
      </section>

      <section className="bmi-shell bmi-workspace" aria-label="BMI calculator">
        <div className="bmi-form-card">
          <div className="bmi-card-heading"><span className="bmi-icon-tile"><Calculator/></span><div><h2>Calculate your BMI</h2><p>Enter your measurements below</p></div></div>
          <div className="bmi-unit-switch" role="group" aria-label="Measurement units">
            <button type="button" className={unit === "metric" ? "active" : ""} onClick={() => {setUnit("metric");setHeight("170");setWeight("70");setResult(false);}}>Metric · cm / kg</button>
            <button type="button" className={unit === "imperial" ? "active" : ""} onClick={() => {setUnit("imperial");setHeightFeet("5");setHeightInches("6");setWeight("154");setResult(false);}}>Imperial · ft / in / lb</button>
          </div>
          <div className="bmi-fields">
            <label className="bmi-field"><span>Age <small>(years)</small></span><div className="bmi-input-wrap"><UserRound/><input type="number" min="5" max="120" step="1" value={age} onChange={(e)=>{setAge(e.target.value);setResult(false);}} placeholder="Enter age" inputMode="numeric"/></div></label>
            <fieldset className="bmi-field bmi-sex-field"><legend>Sex <small>(needed for child growth references)</small></legend><div className="bmi-sex-options"><button type="button" className={sex==="female"?"selected":""} onClick={()=>{setSex("female");setResult(false);}}>♀ Female</button><button type="button" className={sex==="male"?"selected":""} onClick={()=>{setSex("male");setResult(false);}}>♂ Male</button></div></fieldset>
            {unit === "metric" ? <label className="bmi-field"><span>Height <small>(cm)</small></span><div className="bmi-input-wrap"><Ruler/><input type="number" min="1" step="0.1" value={height} onChange={(e)=>{setHeight(e.target.value);setResult(false);}} placeholder="e.g. 170" inputMode="decimal"/></div></label> : <div className="bmi-field"><span>Height <small>(feet & inches)</small></span><div className="bmi-height-pair"><label className="bmi-input-wrap"><Ruler/><input aria-label="Height in feet" type="number" min="1" max="8" step="1" value={heightFeet} onChange={(e)=>{setHeightFeet(e.target.value);setResult(false);}} placeholder="5" inputMode="numeric"/><small>ft</small></label><label className="bmi-input-wrap"><input aria-label="Additional height in inches" type="number" min="0" max="11" step="1" value={heightInches} onChange={(e)=>{setHeightInches(e.target.value);setResult(false);}} placeholder="6" inputMode="numeric"/><small>in</small></label></div></div>}
            <label className="bmi-field"><span>Weight <small>({unit === "metric" ? "kg" : "lb"})</small></span><div className="bmi-input-wrap"><Scale/><input type="number" min="1" step="0.1" value={weight} onChange={(e)=>{setWeight(e.target.value);setResult(false);}} placeholder={unit==="metric"?"e.g. 70":"e.g. 154"} inputMode="decimal"/></div></label>
          </div>
          <button type="button" className="bmi-calculate" onClick={calculate} disabled={!valid}><Calculator/> Calculate BMI <ArrowRight/></button>
          {!valid && <p className="bmi-validation" role="status">Please enter a valid age (5–120), height and weight.</p>}
          <p className="bmi-privacy"><ShieldCheck/> Your measurements are calculated in this browser and are not submitted to PNA.</p>
        </div>

        <div className="bmi-result-card" aria-live="polite">
          <div className="bmi-result-top"><span className="bmi-result-kicker">YOUR RESULT</span><span className="bmi-result-chip"><Activity/> BMI screening</span></div>
          {result ? <>
            <div className="bmi-score-row"><div className="bmi-score-ring"><span>BMI</span><strong>{values.bmi.toFixed(1)}</strong><small>kg/m²</small></div><div className="bmi-result-message"><CheckCircle2/><strong>{adult ? band?.label : "Calculation complete"}</strong><p>{adult ? "Your result is shown against standard adult BMI categories." : "Your BMI number is calculated. Age-specific interpretation is needed."}</p></div></div>
            {adult ? <><div className="bmi-category-title">Adult BMI category</div><div className="bmi-band-list">{adultBands.map((item)=><div key={item.label} className={`bmi-band ${item.tone} ${band?.label===item.label?"current":""}`}><span/><div><strong>{item.label}</strong><small>{item.range}</small></div>{band?.label===item.label&&<CheckCircle2/>}</div>)}</div><p className="bmi-result-note">WHO adult classification for adults aged 20 years and over. BMI is a screening measure, not a diagnosis.</p></> : <div className="bmi-age-notice"><Info/><div><strong>Adult categories do not apply at this age.</strong><p>For ages 5–19, BMI must be interpreted using WHO BMI-for-age references that account for exact age and sex. For children under 5, WHO weight-for-height/length assessment is generally used. This calculator does not estimate child percentiles or z-scores.</p></div></div>}
          </> : <div className="bmi-empty-result"><div className="bmi-empty-icon"><Activity/></div><h3>Your result will appear here</h3><p>Enter your age, height and weight, then calculate to see your BMI and the appropriate interpretation guidance.</p><div className="bmi-empty-steps"><span><i>1</i> Add measurements</span><span><i>2</i> Calculate</span><span><i>3</i> Read guidance</span></div></div>}
          <div className="bmi-result-foot"><Info/><span>BMI does not directly measure body fat or distinguish fat mass from muscle mass.</span></div>
        </div>
      </section>

      <section className="bmi-shell bmi-learning">
        <div className="bmi-learning-intro"><span className="bmi-eyebrow">KNOW WHAT THE NUMBER MEANS</span><h2>BMI is a starting point, <span>not the whole picture.</span></h2><p>Use BMI as one screening measure alongside health history, waist measurement, physical activity and an appropriate clinical assessment.</p></div>
        <div className="bmi-info-grid">
          <article className="bmi-info-card"><span className="bmi-info-icon"><Calculator/></span><h3>The BMI formula</h3><div className="bmi-formula">Weight (kg) <b>÷</b> Height (m)²</div><p>The same calculation gives a BMI number at any age; the way that number is interpreted depends on age.</p></article>
          <article className="bmi-info-card"><span className="bmi-info-icon"><UserRound/></span><h3>Age matters</h3><p>For adults aged 20+, adult BMI categories are used. For ages 5–19, WHO BMI-for-age charts require exact age and sex; this tool does not yet calculate child z-scores or percentiles.</p></article>
          <article className="bmi-info-card"><span className="bmi-info-icon"><ShieldCheck/></span><h3>Important limitations</h3><p>BMI is not a direct measure of body fat. Muscular individuals, athletes, older adults and people with certain conditions may need a broader assessment.</p></article>
        </div>
        <div className="bmi-adult-table"><div><h3>Adult BMI categories</h3><p>For adults aged 20 years and over</p></div><div className="bmi-table-rows">{adultBands.map((item)=><div key={item.label}><span className={`bmi-table-dot ${item.tone}`}/><strong>{item.label}</strong><span>{item.range}</span></div>)}</div><small>Classification shown for general adult screening; individual clinical interpretation may vary.</small></div>
        <div className="bmi-disclaimer"><Info/><p><strong>Health note:</strong> This tool is for educational screening only. It does not diagnose a condition or replace personalised advice from a qualified healthcare professional. If you are concerned about your weight or growth, speak with an appropriate healthcare professional.</p></div>
      </section>
      <section className="bmi-bottom-cta"><div className="bmi-shell"><div><span>PHYSIO NEXUS ACADEMY</span><h2>Better knowledge. Better care.</h2><p>Explore practical, evidence-informed physiotherapy learning and health tools.</p></div><a href="/knowledge-hub">Explore Knowledge Hub <ArrowRight/></a></div></section>
    </main>
  );
}
