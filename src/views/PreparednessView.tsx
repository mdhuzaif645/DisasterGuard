/**
 * DisasterGuard Preparedness & Safety Education Center
 * Section 12: 9 Disaster Guides, Interactive 72-Hour Supply Kit, and Safety Quiz.
 */

import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  Wind,
  Shield,
  Sun,
  AlertTriangle,
  Waves,
  Mountain,
  Zap,
  CheckSquare,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface Guide {
  id: string;
  title: string;
  category: string;
  icon: any;
  before: string[];
  during: string[];
  after: string[];
  dos: string[];
  donts: string[];
}

export const PreparednessView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guides' | 'kit' | 'quiz'>('guides');
  const [selectedGuideId, setSelectedGuideId] = useState<string>('flood');

  // Supply kit persistent state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    water: true,
    food: true,
    flashlight: true,
    batteryBank: true,
    whistle: true,
    firstAid: true,
  });

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const guides: Guide[] = [
    {
      id: 'flood',
      title: 'Floods & Urban Inundation',
      category: 'Water Hazard',
      icon: Droplets,
      before: [
        'Identify high ground and the nearest community evacuation relief center.',
        'Install check valves in plumbing to prevent floodwater backflow into drains.',
        'Keep emergency survival kit, prescription medicines, and valuable documents in a waterproof seal bag.',
      ],
      during: [
        'Turn off main electrical breaker and LPG cylinders before floodwaters enter rooms.',
        'Never walk, swim, or drive through moving water—6 inches can knock you down, 2 feet sweeps a car away.',
        'Climb to top floors or terrace if trapped; signal with a flashlight or bright cloth.',
      ],
      after: [
        'Boil all municipal or borehole drinking water vigorously for at least 10 minutes.',
        'Do not touch damp electrical appliances until certified dry and safe by an electrician.',
        'Be alert for snakes, rodents, and other displaced animals seeking dry shelter indoors.',
      ],
      dos: ['Boil drinking water', 'Monitor official warnings on battery radio', 'Help children and seniors'],
      donts: ['Do not drive through flooded causeways', 'Do not touch fallen wires', 'Do not consume flood-soaked raw food'],
    },
    {
      id: 'cyclone',
      title: 'Cyclones & Coastal Gale Storms',
      category: 'Atmospheric Hazard',
      icon: Wind,
      before: [
        'Inspect and trim hanging tree branches near roofs, power cables, and balconies.',
        'Board up or secure glass window shutters; store loose outdoor furniture indoors.',
        'Fully charge mobile devices, emergency power banks, and battery-powered radios.',
      ],
      during: [
        'Stay indoors in the central-most reinforced room with minimal windows.',
        'Do not be misled by the calm "eye" of the cyclone; violent reverse winds follow immediately.',
        'Disconnect heavy appliances to prevent surge damage from lightning strikes.',
      ],
      after: [
        'Do not venture outside until authorities declare the official "all clear".',
        'Beware of loose corrugated tin sheets, broken poles, and live fallen wires.',
        'Drive only if essential, keeping clear of damaged trees and waterlogged roads.',
      ],
      dos: ['Keep a 3-day supply of canned food', 'Anchor loose rooftop tanks', 'Follow official IMD advisories'],
      donts: ['Do not go to the beach to watch waves', 'Do not spread rumors on social media', 'Do not ignore evacuation orders'],
    },
    {
      id: 'earthquake',
      title: 'Earthquakes & Structural Aftershocks',
      category: 'Geological Hazard',
      icon: Shield,
      before: [
        'Secure heavy bookshelves, water heaters, and mirrors firmly to wall studs.',
        'Locate safe indoor spots (under sturdy dining tables, against interior walls).',
        'Practice Drop, Cover, and Hold On with household members twice a year.',
      ],
      during: [
        'DROP to your hands and knees.',
        'COVER your head and neck under a sturdy table or desk.',
        'HOLD ON until shaking stops. If no shelter, cover face and head in an interior corner.',
      ],
      after: [
        'Expect secondary aftershocks. Check yourself and others for injuries.',
        'Smell for gas leaks. If gas is suspected, shut off the cylinder and open windows.',
        'Do not light candles, matches, or switches until gas safety is confirmed.',
      ],
      dos: ['Drop, cover, and hold on', 'Use stairs, never elevators', 'Extinguish small fires immediately'],
      donts: ['Do not run outside during shaking', 'Do not stand near exterior glass', 'Do not re-enter visibly cracked buildings'],
    },
    {
      id: 'landslide',
      title: 'Landslides & Hill Slope Debris',
      category: 'Geological Hazard',
      icon: Mountain,
      before: [
        'Watch for hillside soil cracks, tilting utility poles, or muddy water spring seeps.',
        'Identify safe upslope evacuation zones away from valley drainage corridors.',
      ],
      during: [
        'If caught in a debris path, evacuate perpendicular to the flow to higher ground.',
        'Curl into a tight ball and protect your head if escape is impossible.',
      ],
      after: [
        'Stay away from the slide area; secondary collapses are frequent after heavy rainfall.',
        'Report broken power and gas utilities to emergency responders immediately.',
      ],
      dos: ['Evacuate slope areas early', 'Listen for rumbling ground noises', 'Stay alert during continuous heavy rain'],
      donts: ['Do not cross landslide debris on foot', 'Do not sleep on ground floor rooms facing steep slopes'],
    },
    {
      id: 'extreme_heat',
      title: 'Extreme Heatwave & Hyperthermia',
      category: 'Climatic Hazard',
      icon: Sun,
      before: [
        'Stock oral rehydration solution (ORS), electrolytes, and clean drinking water.',
        'Insulate top-floor roofs and cover sun-facing windows with dark curtains or bamboo blinds.',
      ],
      during: [
        'Avoid strenuous outdoor work between 12:00 PM and 4:00 PM.',
        'Drink water at frequent intervals, even when not feeling thirsty.',
        'Wear loose, lightweight, light-colored cotton clothing and wide-brim hats.',
      ],
      after: [
        'Watch for heatstroke symptoms: dizziness, confusion, high body temp, lack of sweat.',
        'Move heat-exhausted persons to shade, apply cool wet towels, and seek medical help.',
      ],
      dos: ['Drink buttermilk, lemon water, and ORS', 'Provide shaded water bowls for animals'],
      donts: ['Do not leave infants or pets in parked vehicles', 'Do not consume high-alcohol or sugary drinks in extreme heat'],
    },
    {
      id: 'tsunami',
      title: 'Tsunamis & Ocean Surges',
      category: 'Oceanic Hazard',
      icon: Waves,
      before: [
        'Know coastal evacuation routes and distance to terrain at least 30 meters above sea level.',
      ],
      during: [
        'If an earthquake strikes coastal areas or the ocean suddenly recedes, RUN inland immediately.',
        'Never go to the shoreline to view an exposed seafloor or approaching wave.',
      ],
      after: [
        'Wait for the official cancellation warning; tsunami waves arrive in a series hours apart.',
      ],
      dos: ['Head inland and uphill immediately', 'Abandon heavy belongings during evacuation'],
      donts: ['Do not wait for sirens if sea noticeably recedes', 'Do not return to low shoreline until cleared'],
    },
  ];

  const supplyKitItems = [
    { id: 'water', label: 'Drinking Water (Minimum 3 liters per person per day for 3 days)', essential: true },
    { id: 'food', label: 'Non-perishable, ready-to-eat meals, protein bars, dry fruits', essential: true },
    { id: 'firstAid', label: 'First Aid Kit (Bandages, antiseptic, burn cream, pain relievers)', essential: true },
    { id: 'flashlight', label: 'High-intensity LED Torch with extra batteries or dynamo crank', essential: true },
    { id: 'batteryBank', label: 'Fully charged 20,000mAh Power Bank & phone cables', essential: true },
    { id: 'whistle', label: 'Rescue Emergency Whistle (to signal search and rescue teams)', essential: true },
    { id: 'documents', label: 'Important IDs, deeds, prescriptions in a waterproof pouch', essential: true },
    { id: 'cash', label: 'Emergency physical currency (ATMs and card machines fail in outages)', essential: true },
    { id: 'masks', label: 'N95 / surgical dust masks against smoke, debris, or flood mud', essential: false },
    { id: 'multiTool', label: 'Multi-tool knife, duct tape, and heavy-duty work gloves', essential: false },
  ];

  const quizQuestions = [
    {
      question: 'During an earthquake, what is the safest immediate action if you are indoors?',
      options: [
        'Run outside toward the nearest street',
        'Drop, Cover, and Hold On under a sturdy table or desk',
        'Dash for the building elevator',
        'Stand in the middle of a large room',
      ],
      correct: 1,
      explanation: 'Dropping under a sturdy table protects from falling debris, ceiling tiles, and broken glass.',
    },
    {
      question: 'How much moving floodwater is typically needed to sweep away an automobile?',
      options: ['6 inches (15 cm)', '12 inches (30 cm)', '24 inches (60 cm)', '48 inches (120 cm)'],
      correct: 2,
      explanation: 'Just 2 feet (24 inches) of moving water can float and carry away most passenger cars and SUVs.',
    },
    {
      question: 'During a tropical cyclone landfall, what should you do when winds suddenly stop?',
      options: [
        'Assume the storm has ended and go inspect outside damage',
        'Remain sheltered indoors; the violent opposite eye-wall is about to strike',
        'Drive your vehicle to a higher location',
        'Turn on all electrical appliances immediately',
      ],
      correct: 1,
      explanation: 'The eye of the cyclone is a deceptive calm. Destructive hurricane-force winds will return in the opposite direction.',
    },
  ];

  const activeGuide = guides.find((g) => g.id === selectedGuideId) || guides[0];

  const toggleSupplyItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPct = Math.round((completedCount / supplyKitItems.length) * 100);

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score++;
    });
    return score;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-amber-400" />
            Disaster Preparedness & Education Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative survival protocols, interactive supply kit readiness, and safety quizzes based on NDMA/IMD guidelines.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab('guides')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'guides' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Disaster Protocols
          </button>
          <button
            onClick={() => setActiveTab('kit')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'kit' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            72h Survival Kit ({progressPct}%)
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'quiz' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Safety Quiz
          </button>
        </div>
      </div>

      {/* Tab 1: Disaster Guides */}
      {activeTab === 'guides' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Guide Selector List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Select Disaster Hazard:
            </h3>
            <div className="space-y-1.5">
              {guides.map((g) => {
                const Icon = g.icon;
                const isSelected = selectedGuideId === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGuideId(g.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left border transition ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white font-bold shadow'
                        : 'bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span className="text-xs">{g.title}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Guide Content */}
          <div className="lg:col-span-3 space-y-5">
            <div className="p-6 bg-slate-850 border border-slate-800 rounded-2xl space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                  {activeGuide.category}
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{activeGuide.title}</h2>
              </div>

              {/* Three Timeline Phases: Before, During, After */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Before */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    1. Before Disaster
                  </h3>
                  <ul className="space-y-2 text-slate-300 pl-1 list-disc list-inside leading-relaxed">
                    {activeGuide.before.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>

                {/* During */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    2. During Disaster
                  </h3>
                  <ul className="space-y-2 text-slate-300 pl-1 list-disc list-inside leading-relaxed">
                    {activeGuide.during.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>

                {/* After */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    3. Aftermath & Recovery
                  </h3>
                  <ul className="space-y-2 text-slate-300 pl-1 list-disc list-inside leading-relaxed">
                    {activeGuide.after.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Dos and Don'ts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-wider">Recommended Do's:</h4>
                  <ul className="space-y-1.5 text-emerald-200 list-disc list-inside">
                    {activeGuide.dos.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2">
                  <h4 className="font-bold text-rose-400 uppercase tracking-wider">Critical Don'ts:</h4>
                  <ul className="space-y-1.5 text-rose-200 list-disc list-inside">
                    {activeGuide.donts.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 72-Hour Supply Kit Checklist */}
      {activeTab === 'kit' && (
        <div className="p-6 bg-slate-850 border border-slate-800 rounded-2xl space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Household 72-Hour Survival Go-Bag</h2>
              <p className="text-xs text-slate-400">
                Essential supplies required to keep a household self-sufficient for 3 days post-disaster.
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-amber-400">{progressPct}% Prepared</span>
              <span className="text-xs text-slate-400 block">{completedCount} of {supplyKitItems.length} items packed</span>
            </div>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="space-y-2.5">
            {supplyKitItems.map((item) => {
              const isChecked = !!checkedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSupplyItem(item.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-600 bg-slate-800'
                      }`}
                    >
                      {isChecked && <CheckSquare className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs ${isChecked ? 'text-white font-semibold' : ''}`}>
                      {item.label}
                    </span>
                  </div>

                  {item.essential && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
                      Essential
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Disaster Safety Knowledge Quiz */}
      {activeTab === 'quiz' && (
        <div className="p-6 bg-slate-850 border border-slate-800 rounded-2xl space-y-6 max-w-3xl mx-auto">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Community Disaster Safety Assessment
            </h2>
            <p className="text-xs text-slate-400">
              Test your knowledge on life-saving protocols during floods, earthquakes, and cyclones.
            </p>
          </div>

          <div className="space-y-6">
            {quizQuestions.map((q, qIdx) => {
              const selectedOpt = quizAnswers[qIdx];
              return (
                <div key={qIdx} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-white">
                    {qIdx + 1}. {q.question}
                  </h4>
                  <div className="space-y-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      const isCorrect = q.correct === optIdx;
                      let btnStyle = 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750';

                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-300';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-amber-500/20 border-amber-500 text-white font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
                          className={`w-full text-left p-3 rounded-lg border transition ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-2.5 bg-slate-950 rounded-lg text-xs text-slate-300 border border-slate-800">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            {quizSubmitted ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">
                  Your Score: <strong className="text-emerald-400">{calculateScore()} / {quizQuestions.length}</strong>
                </span>
                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Retake Quiz
                </button>
              </div>
            ) : (
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider shadow"
              >
                Submit Answers & Review
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
