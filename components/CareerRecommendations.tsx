
import React from 'react';
import { Target, CheckCircle2, ChevronRight, BookOpen, ExternalLink } from 'lucide-react';
import { AnalysisResult } from '../types';

interface CareerRecommendationsProps {
  data: AnalysisResult;
}

const CareerRecommendations: React.FC<CareerRecommendationsProps> = ({ data }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Your Top Career Matches</h2>
        <p className="text-slate-500">Based on your deep learning patterns and demonstrated skill growth.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {data.recommendations.map((career, index) => (
          <div key={index} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all border-l-4 border-l-emerald-500">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Rank #{index + 1}</div>
                    <span className="text-slate-400 text-sm font-medium">Potential match</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{career.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Match Score</p>
                    <p className="text-3xl font-black text-emerald-600">{career.matchScore}%</p>
                  </div>
                  <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                    View Roadmap <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" /> Why this match?
                </span>
                {career.reason}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Top Skills Identified
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {career.skillsNeeded.map((skill, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" /> Learning Path
                  </h4>
                  <ul className="space-y-3">
                    {career.roadmapSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 group">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border border-blue-100">
                          {idx + 1}
                        </div>
                        <p className="text-slate-600 text-sm group-hover:text-slate-900 transition-colors">{step}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
              <span className="text-xs font-medium opacity-70">Suggested Next Action: Build a portfolio project using LLMs</span>
              <button className="text-xs flex items-center gap-1 hover:text-emerald-400 transition-colors font-bold uppercase tracking-widest">
                Search Courses <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerRecommendations;
