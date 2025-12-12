
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera as CameraIcon, Info, Activity, Percent, Sparkles, AlertCircle, Download, MoveHorizontal, PlayCircle } from 'lucide-react';
import { generateIdealFace, analyzeAndPrescribe } from './services/geminiService';
import { AnalysisResult, AppState, GenerationMode } from './types';
import CameraCapture from './components/CameraCapture';
import ComparisonSlider from './components/ComparisonSlider';
import ScanningOverlay from './components/ScanningOverlay';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [mode, setMode] = useState<GenerationMode>('golden_ratio');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'slider' | 'morph'>('slider');
  
  // Loading steps
  const [loadingStep, setLoadingStep] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setOriginalImage(base64);
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (base64: string) => {
    setOriginalImage(base64);
    setShowCamera(false);
    processImage(base64);
  };

  const processImage = async (base64: string) => {
    setAppState('analyzing');
    setErrorMsg(null);
    try {
      setLoadingStep('Mapping facial topography...');
      // Artificial delay for UX perception of complexity
      await new Promise(r => setTimeout(r, 1500));

      setLoadingStep(mode === 'golden_ratio' ? 'Computing Phi projections...' : 'Calculating bilateral variances...');
      const idealFace = await generateIdealFace(base64, mode);
      setGeneratedImage(idealFace);

      setLoadingStep('Synthesizing corrective protocol...');
      const result = await analyzeAndPrescribe(base64, idealFace, mode);
      setAnalysis(result);
      
      setAppState('results');
    } catch (err: any) {
      console.error(err);
      setAppState('error');
      setErrorMsg(err.message || "Something went wrong during analysis. Please try a different photo.");
    }
  };

  const resetApp = () => {
    setAppState('upload');
    setOriginalImage(null);
    setGeneratedImage(null);
    setAnalysis(null);
    setErrorMsg(null);
    setViewMode('slider');
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `aura-${mode}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-800 selection:bg-rose-200">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-rose-500 p-1.5 rounded-lg text-white">
            <Sparkles size={18} />
          </div>
          <h1 className="text-xl font-medium tracking-tight text-stone-900">Aura Symmetry</h1>
        </div>
        {appState === 'results' && (
          <button 
            onClick={resetApp}
            className="text-sm font-medium text-stone-500 hover:text-stone-800 transition"
          >
            New Scan
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-6xl mx-auto">
        
        {appState === 'upload' && (
          <div className="w-full max-w-xl animate-fade-in">
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-stone-100 text-center">
              <h2 className="text-4xl font-light mb-4 text-stone-900 tracking-tight">Reveal Your Balance</h2>
              <p className="text-stone-500 mb-8 leading-relaxed text-lg">
                Advanced AI analysis of your facial geometry against the Golden Ratio or Bilateral Symmetry.
              </p>

              <div className="mb-10 bg-stone-100 p-1.5 rounded-2xl flex relative">
                <button
                  onClick={() => setMode('golden_ratio')}
                  className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all z-10 ${
                    mode === 'golden_ratio' 
                    ? 'bg-white text-stone-900 shadow-md ring-1 ring-black/5' 
                    : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  Golden Ratio
                </button>
                <button
                  onClick={() => setMode('symmetry')}
                  className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all z-10 ${
                    mode === 'symmetry' 
                    ? 'bg-white text-stone-900 shadow-md ring-1 ring-black/5' 
                    : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  Pure Symmetry
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setShowCamera(true)}
                  className="group relative overflow-hidden flex items-center justify-center gap-3 bg-stone-900 text-white py-5 px-6 rounded-2xl hover:bg-stone-800 transition-all shadow-lg hover:shadow-2xl hover:translate-y-[-2px] active:translate-y-[0px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-800 to-stone-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CameraIcon className="group-hover:rotate-12 transition-transform relative z-10" />
                  <span className="font-semibold text-lg relative z-10">Scan Face</span>
                </button>

                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                  />
                  <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-dashed border-stone-200 text-stone-600 py-5 px-6 rounded-2xl group-hover:border-stone-400 group-hover:text-stone-900 transition-all">
                    <Upload size={20} />
                    <span className="font-medium">Upload from Gallery</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {appState === 'analyzing' && originalImage && (
          <div className="flex flex-col items-center justify-center text-center animate-pulse">
            <ScanningOverlay imageSrc={originalImage} />
            <h3 className="text-2xl font-light text-stone-800 mt-8 mb-2">Analyzing Geometry</h3>
            <p className="text-rose-500 font-mono text-sm uppercase tracking-widest">{loadingStep}</p>
          </div>
        )}

        {appState === 'error' && (
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-red-100">
             <div className="flex flex-col items-center text-center mb-6">
               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                 <AlertCircle size={32} />
               </div>
               <h3 className="font-bold text-xl text-stone-900">Analysis Interrupted</h3>
               <p className="text-stone-600 mt-2">{errorMsg}</p>
             </div>
             <button onClick={resetApp} className="w-full py-4 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition">
               Try Again
             </button>
          </div>
        )}

        {appState === 'results' && analysis && originalImage && generatedImage && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-fade-in-up">
            
            {/* Left Column: Visuals */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col items-center relative overflow-hidden">
                <div className="w-full flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    {mode === 'golden_ratio' ? 'Golden Ratio Projection' : 'Symmetry Alignment'}
                  </h3>
                  
                  {/* View Mode Toggle */}
                  <div className="flex bg-stone-100 rounded-lg p-1">
                     <button 
                        onClick={() => setViewMode('slider')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'slider' ? 'bg-white shadow text-stone-900' : 'text-stone-400'}`}
                        title="Slider View"
                     >
                       <MoveHorizontal size={16} />
                     </button>
                     <button 
                        onClick={() => setViewMode('morph')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'morph' ? 'bg-white shadow text-stone-900' : 'text-stone-400'}`}
                        title="Morph View"
                     >
                       <PlayCircle size={16} />
                     </button>
                  </div>
                </div>

                {viewMode === 'slider' ? (
                  <ComparisonSlider 
                    beforeImage={originalImage} 
                    afterImage={generatedImage} 
                    afterLabel={mode === 'golden_ratio' ? 'Golden Ratio' : 'Symmetrical'}
                  />
                ) : (
                  <div className="relative w-full max-w-md aspect-[3/4] rounded-xl overflow-hidden shadow-inner bg-stone-100">
                    <img src={originalImage} className="absolute inset-0 w-full h-full object-cover" alt="Original" />
                    <img 
                      src={generatedImage} 
                      className="absolute inset-0 w-full h-full object-cover animate-[pulseOpacity_3s_ease-in-out_infinite]" 
                      alt="Generated" 
                      style={{ opacity: 0.5 }}
                    />
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                        Morphing View
                      </span>
                    </div>
                    <style>{`
                      @keyframes pulseOpacity {
                        0% { opacity: 0; }
                        50% { opacity: 1; }
                        100% { opacity: 0; }
                      }
                    `}</style>
                  </div>
                )}
                
                <div className="w-full flex justify-center mt-6">
                  <button 
                    onClick={downloadImage}
                    className="flex items-center gap-2 text-sm font-medium bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-full transition shadow-lg hover:shadow-xl"
                  >
                    <Download size={16} />
                    Save Projection
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center justify-center text-center">
                  <div className="text-stone-400 mb-2"><Activity size={24} /></div>
                  <div className="text-4xl font-light text-stone-900 mb-1">
                    {analysis.symmetryScore}
                  </div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Current Balance</span>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center justify-center text-center">
                   <div className="text-rose-400 mb-2"><Percent size={24} /></div>
                  <div className="text-4xl font-light text-stone-900 mb-1">
                    {analysis.achievabilityScore}%
                  </div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Achievable</span>
                </div>
              </div>
            </div>

            {/* Right Column: Analysis & Plan */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
                <h3 className="text-2xl font-serif text-stone-900 mb-4">Structural Analysis</h3>
                <p className="text-stone-600 leading-relaxed text-base mb-6">
                  {analysis.analysisSummary}
                </p>
                <div className="bg-stone-50 rounded-2xl p-6">
                  <h4 className="text-xs font-bold text-stone-400 uppercase mb-4 tracking-wider">Key Divergences</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.keyDifferences.map((diff, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-stone-700 bg-white p-3 rounded-lg border border-stone-100">
                        <span className="text-rose-400 mt-0.5">•</span>
                        {diff}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-medium text-stone-900">Recommended Protocol</h3>
                  <span className="text-xs font-bold bg-rose-100 text-rose-700 px-3 py-1 rounded-full uppercase tracking-wider">
                    Daily Routine
                  </span>
                </div>
                
                <div className="space-y-4">
                  {analysis.exercises.map((ex, idx) => (
                    <div key={idx} className="group bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:border-rose-200 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg text-stone-900 group-hover:text-rose-500 transition-colors">{ex.name}</h4>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          ex.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                          ex.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {ex.difficulty}
                        </span>
                      </div>
                      <p className="text-stone-600 mb-4 leading-relaxed">{ex.instructions}</p>
                      <div className="flex items-center gap-6 text-sm text-stone-400 font-medium">
                        <span className="flex items-center gap-2">
                          <Activity size={14} className="text-rose-400" /> {ex.targetArea}
                        </span>
                        <span className="flex items-center gap-2">
                          <Info size={14} /> {ex.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}
    </div>
  );
};

export default App;
