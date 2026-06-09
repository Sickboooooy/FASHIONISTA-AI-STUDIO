import React, { useState, useRef } from 'react';
import { AppState, AnalysisResult, OutfitSuggestion } from '../types';
import { analyzeGarmentAndStyle, fileToBase64, generateOutfitVisualization, generateCreativeDesign, editImageWithGemini } from '../services/geminiService';
import { Sparkles, Upload, Loader2, Info, X, PenTool, Shirt, Image as ImageIcon, Download, Wand2 } from 'lucide-react';

type TabMode = 'consultant' | 'designer' | 'editor';

export const Stylist: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabMode>('consultant');
  
  // Consultant Mode State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Designer Mode State
  const [designPrompt, setDesignPrompt] = useState('');
  const [designGarment, setDesignGarment] = useState('');
  const [designStyle, setDesignStyle] = useState('');
  const [designOccasion, setDesignOccasion] = useState('');
  const [designRefImage, setDesignRefImage] = useState<{base64: string, mime: string, url: string} | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);
  const [designResult, setDesignResult] = useState<string | null>(null);
  const [designError, setDesignError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'3:4' | '1:1' | '16:9'>('3:4');
  const designInputRef = useRef<HTMLInputElement>(null);

  // Editor Mode State
  const [editFile, setEditFile] = useState<{base64: string, mime: string, url: string} | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editResult, setEditResult] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Consultant Handlers
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setAppState(AppState.ANALYZING);

    try {
      const base64 = await fileToBase64(file);
      const result = await analyzeGarmentAndStyle(base64, file.type);
      setAnalysis(result);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Designer Handlers
  const handleDesignRefChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const objectUrl = URL.createObjectURL(file);
      setDesignRefImage({
        base64,
        mime: file.type,
        url: objectUrl
      });
    } catch (error) {
      console.error("Error reading reference image", error);
    }
  };

  const triggerDesignUpload = () => {
    designInputRef.current?.click();
  };

  const handleCreateDesign = async () => {
    if ((!designPrompt && !designGarment)) return;

    // Construct the combined prompt
    let fullPrompt = '';
    if (designGarment) fullPrompt += `Featured Garment: ${designGarment}. `;
    if (designPrompt) fullPrompt += `${designPrompt}. `;
    if (designStyle) fullPrompt += ` Aesthetic Style: ${designStyle}.`;
    if (designOccasion) fullPrompt += ` Occasion/Event: ${designOccasion}.`;

    // Check for API key presence for paid models
    const aistudio = (window as any).aistudio;
    const ensureKey = async () => {
      if (aistudio && aistudio.hasSelectedApiKey && aistudio.openSelectKey) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await aistudio.openSelectKey();
        }
      }
    };

    await ensureKey();

    setIsDesigning(true);
    setDesignResult(null);
    setDesignError(null);

    try {
      const result = await generateCreativeDesign(
        fullPrompt,
        designRefImage?.base64,
        designRefImage?.mime,
        aspectRatio
      );
      setDesignResult(result);
    } catch (error: any) {
      console.error("Design failed", error);

      const errorStr = error.toString().toLowerCase();
      if (errorStr.includes("permission") || errorStr.includes("403") || errorStr.includes("not found")) {
        if (aistudio && aistudio.openSelectKey) {
          try {
            await aistudio.openSelectKey();
            const result = await generateCreativeDesign(
              fullPrompt,
              designRefImage?.base64,
              designRefImage?.mime,
              aspectRatio
            );
            setDesignResult(result);
            return;
          } catch (retryError) {
            console.error("Retry failed", retryError);
            setDesignError("Access denied. Please select a valid paid project API key.");
          }
        }
      } else {
        setDesignError("Design generation failed. Please try again.");
      }
    } finally {
      setIsDesigning(false);
    }
  };

  // Editor Handlers
  const handleEditFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      const objectUrl = URL.createObjectURL(file);
      setEditFile({ base64, mime: file.type, url: objectUrl });
      setEditResult(null);
    } catch (error) {
      console.error("Error reading edit image", error);
    }
  };

  const triggerEditUpload = () => {
    editInputRef.current?.click();
  };

  const handleEditImage = async () => {
    if (!editFile || !editPrompt) return;

    setIsEditing(true);
    setEditResult(null);
    setEditError(null);

    try {
      const result = await editImageWithGemini(editFile.base64, editPrompt, editFile.mime);
      setEditResult(result);
    } catch (error) {
      console.error("Edit failed", error);
      setEditError("Image editing failed. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl md:text-6xl text-amber-500 mb-4">The Atelier</h1>
          <p className="text-stone-400 text-lg uppercase tracking-widest mb-10">
            AI-Powered Personal Styling
          </p>

          {/* Mode Switcher */}
          <div className="inline-flex bg-stone-900 p-1 rounded-lg border border-stone-800 flex-wrap justify-center">
             <button 
               onClick={() => setActiveTab('consultant')}
               className={`px-6 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2
                 ${activeTab === 'consultant' ? 'bg-amber-600 text-stone-950' : 'text-stone-500 hover:text-stone-300'}`}
             >
               <Shirt size={16} />
               The Consultant
             </button>
             <button 
               onClick={() => setActiveTab('designer')}
               className={`px-6 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2
                 ${activeTab === 'designer' ? 'bg-amber-600 text-stone-950' : 'text-stone-500 hover:text-stone-300'}`}
             >
               <PenTool size={16} />
               The Designer
             </button>
             <button 
               onClick={() => setActiveTab('editor')}
               className={`px-6 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2
                 ${activeTab === 'editor' ? 'bg-amber-600 text-stone-950' : 'text-stone-500 hover:text-stone-300'}`}
             >
               <Wand2 size={16} />
               The Editor
             </button>
          </div>
        </div>

        {activeTab === 'consultant' && (
          /* ================= CONSULTANT MODE ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in">
            {/* Left Column: Upload & Preview */}
            <div className="lg:col-span-4 space-y-8">
              <div className={`
                relative border-2 border-dashed transition-all duration-300 rounded-lg overflow-hidden
                ${previewUrl ? 'border-amber-500/50 bg-stone-900' : 'border-stone-700 hover:border-amber-500/50 hover:bg-stone-900'}
                min-h-[400px] flex flex-col items-center justify-center
              `}>
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Garment" className="w-full h-full object-cover absolute inset-0 opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-0 right-0 text-center z-10">
                      <button 
                        onClick={triggerUpload}
                        className="bg-black/60 backdrop-blur-md text-amber-500 px-6 py-2 rounded-full text-xs uppercase tracking-widest hover:bg-black/80 transition"
                      >
                        Change Garment
                      </button>
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={triggerUpload}
                    className="cursor-pointer text-center p-8 w-full h-full flex flex-col items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mb-4 text-amber-500 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <h3 className="font-serif text-2xl mb-2 text-stone-200">Upload Item</h3>
                    <p className="text-stone-500 text-sm max-w-xs mx-auto">
                      Select a photo of a clothing item you want to style.
                    </p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Analysis Box */}
              {appState === AppState.ANALYZING && (
                <div className="bg-stone-900/50 border border-amber-900/30 p-6 rounded-lg animate-pulse text-center">
                  <Loader2 className="w-8 h-8 text-amber-500 mx-auto animate-spin mb-4" />
                  <p className="font-serif text-xl text-stone-300">Analyzing Texture & Cut...</p>
                  <p className="text-xs text-stone-500 uppercase tracking-widest mt-2">Consulting with Anna AI</p>
                </div>
              )}

              {appState === AppState.SUCCESS && analysis && (
                <div className="bg-stone-900/50 border border-stone-800 p-6 rounded-lg">
                  <h3 className="font-serif text-xl text-amber-500 mb-4">Garment Analysis</h3>
                  <p className="text-stone-300 text-sm italic mb-4">"{analysis.garmentDescription}"</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analysis.colorPalette.map((color, idx) => (
                      <span key={idx} className="bg-stone-800 px-3 py-1 rounded-full text-xs text-stone-400 border border-stone-700">
                        {color}
                      </span>
                    ))}
                    <span className="bg-stone-800 px-3 py-1 rounded-full text-xs text-stone-400 border border-stone-700">
                      {analysis.category}
                    </span>
                  </div>
                </div>
              )}

              {appState === AppState.ERROR && (
                 <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-lg text-center">
                   <p className="text-red-400 font-serif">Styling Consultation Failed</p>
                   <p className="text-stone-500 text-xs mt-2">Please try uploading a clearer image.</p>
                 </div>
              )}
            </div>

            {/* Right Column: Recommendations */}
            <div className="lg:col-span-8">
               {appState === AppState.SUCCESS && analysis ? (
                 <div className="space-y-8 animate-fade-in">
                   <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                     <h2 className="font-serif text-3xl text-stone-100">Curated Looks</h2>
                     <Sparkles className="text-amber-500 w-6 h-6" />
                   </div>

                   <div className="grid grid-cols-1 gap-8">
                     {analysis.suggestions.map((suggestion, index) => (
                       <OutfitCard key={index} suggestion={suggestion} index={index} />
                     ))}
                   </div>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-stone-600 border border-dashed border-stone-800 rounded-lg p-12 bg-stone-900/20">
                   <Info className="w-12 h-12 mb-4 opacity-50" />
                   <p className="font-serif text-2xl opacity-50">Waiting for inspiration...</p>
                   <p className="text-sm mt-2 max-w-md text-center opacity-50">
                     Upload a garment on the left to unlock Anna's personalized styling advice.
                   </p>
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'designer' && (
          /* ================= DESIGNER MODE ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in">
            {/* Left Column: Creative Controls */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-stone-900 border border-stone-800 p-8 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <PenTool className="w-32 h-32 text-amber-500" />
                </div>
                
                <h2 className="font-serif text-3xl text-stone-100 mb-6 relative z-10">Creative Vision</h2>
                
                {/* Featured Garment Input (NEW) */}
                <div className="mb-6 relative z-10">
                   <label className="block text-amber-500 text-xs uppercase tracking-widest mb-2 font-bold">Featured Garment</label>
                   <input 
                      type="text"
                      value={designGarment}
                      onChange={(e) => setDesignGarment(e.target.value)}
                      placeholder="e.g., Beige Velour Wide-Leg Pants"
                      className="w-full bg-stone-950 border border-stone-700 rounded-sm p-4 text-stone-300 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                   />
                </div>

                {/* Prompt Input */}
                <div className="mb-6 relative z-10">
                  <label className="block text-amber-500 text-xs uppercase tracking-widest mb-2 font-bold">Concept Description</label>
                  <textarea
                    value={designPrompt}
                    onChange={(e) => setDesignPrompt(e.target.value)}
                    placeholder="Describe your high-fashion vision (e.g., A structured avant-garde gown made of liquid gold silk...)"
                    className="w-full bg-stone-950 border border-stone-700 rounded-sm p-4 text-stone-300 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors h-24 resize-none"
                  />
                </div>

                {/* Style Direction Input */}
                <div className="mb-6 relative z-10">
                   <label className="block text-amber-500 text-xs uppercase tracking-widest mb-2 font-bold">Style Direction</label>
                   <input 
                      type="text"
                      value={designStyle}
                      onChange={(e) => setDesignStyle(e.target.value)}
                      placeholder="e.g., Cyberpunk, Art Deco, Minimalist, Victorian..."
                      className="w-full bg-stone-950 border border-stone-700 rounded-sm p-4 text-stone-300 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                   />
                </div>

                {/* Occasion Input */}
                <div className="mb-6 relative z-10">
                   <label className="block text-amber-500 text-xs uppercase tracking-widest mb-2 font-bold">Occasion</label>
                   <input 
                      type="text"
                      value={designOccasion}
                      onChange={(e) => setDesignOccasion(e.target.value)}
                      placeholder="e.g., Red Carpet, Office Party, Casual Brunch..."
                      className="w-full bg-stone-950 border border-stone-700 rounded-sm p-4 text-stone-300 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                   />
                </div>

                {/* Reference Image Input */}
                <div className="mb-6 relative z-10">
                   <div className="flex justify-between items-center mb-2">
                     <label className="text-amber-500 text-xs uppercase tracking-widest font-bold">Inspiration Source (Optional)</label>
                     {designRefImage && (
                       <button onClick={() => setDesignRefImage(null)} className="text-stone-500 hover:text-red-400 text-xs uppercase">Remove</button>
                     )}
                   </div>
                   
                   <div 
                     onClick={triggerDesignUpload}
                     className={`
                       border border-dashed rounded-sm p-4 cursor-pointer transition-colors flex items-center gap-4
                       ${designRefImage ? 'border-amber-500/50 bg-stone-950' : 'border-stone-700 bg-stone-950 hover:border-amber-500/50'}
                     `}
                   >
                     {designRefImage ? (
                       <>
                         <img src={designRefImage.url} className="w-12 h-12 object-cover rounded-sm border border-stone-600" alt="ref" />
                         <div className="flex-grow overflow-hidden">
                           <p className="text-stone-300 text-sm truncate">Image Loaded</p>
                           <p className="text-stone-600 text-xs">Used for texture & form</p>
                         </div>
                       </>
                     ) : (
                       <>
                         <div className="w-12 h-12 bg-stone-900 flex items-center justify-center rounded-sm">
                           <ImageIcon className="text-stone-500 w-6 h-6" />
                         </div>
                         <div>
                           <p className="text-stone-400 text-sm">Upload Reference Image</p>
                           <p className="text-stone-600 text-xs">Guide the AI with a visual</p>
                         </div>
                       </>
                     )}
                     <input type="file" ref={designInputRef} onChange={handleDesignRefChange} className="hidden" accept="image/*" />
                   </div>
                </div>

                {/* Aspect Ratio */}
                <div className="mb-8 relative z-10">
                   <label className="block text-amber-500 text-xs uppercase tracking-widest mb-2 font-bold">Canvas Ratio</label>
                   <div className="grid grid-cols-3 gap-3">
                     {[
                       { label: 'Portrait', value: '3:4' },
                       { label: 'Square', value: '1:1' },
                       { label: 'Landscape', value: '16:9' }
                     ].map((opt) => (
                       <button
                         key={opt.value}
                         onClick={() => setAspectRatio(opt.value as any)}
                         className={`py-2 text-xs uppercase tracking-widest border transition-all
                           ${aspectRatio === opt.value 
                             ? 'bg-amber-600 border-amber-600 text-stone-950 font-bold' 
                             : 'bg-transparent border-stone-700 text-stone-500 hover:border-amber-500/50'
                           }`}
                       >
                         {opt.label}
                       </button>
                     ))}
                   </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleCreateDesign}
                  disabled={(!designPrompt && !designGarment) || isDesigning}
                  className={`
                    w-full py-4 text-sm font-bold uppercase tracking-[0.2em] transition-all relative z-10
                    ${(!designPrompt && !designGarment) || isDesigning 
                      ? 'bg-stone-800 text-stone-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 hover:from-amber-500 hover:to-amber-400 shadow-lg shadow-amber-900/20'}
                  `}
                >
                  {isDesigning ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={16} /> Designing...
                    </span>
                  ) : (
                    "Create Masterpiece"
                  )}
                </button>

              </div>
            </div>

            {/* Right Column: Canvas Output */}
            <div className="lg:col-span-7">
               <div className="h-full min-h-[600px] bg-stone-900 border border-stone-800 p-2 md:p-8 flex items-center justify-center relative rounded-lg">
                 {/* Decorative background elements */}
                 <div className="absolute inset-0 border-2 border-stone-800 m-2 pointer-events-none opacity-50"></div>
                 
                 {designResult ? (
                   <div className="relative w-full h-full flex items-center justify-center animate-fade-in group overflow-hidden shadow-2xl shadow-black">
                     {/* MAGAZINE COVER COMPONENT */}
                     <div className="relative w-full max-w-[500px] aspect-[3/4] bg-stone-900 text-white overflow-hidden">
                        {/* 1. Base Image */}
                        <img 
                          src={designResult} 
                          alt="Cover" 
                          className="w-full h-full object-cover opacity-95 transition-transform duration-1000 group-hover:scale-105"
                        />
                        
                        {/* 2. Gradient Overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-transparent to-stone-950/60 pointer-events-none"></div>

                        {/* 3. Magazine Elements Overlay */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                            {/* Header */}
                            <div className="text-center">
                              <h1 className="font-serif text-5xl md:text-7xl font-bold text-amber-300 drop-shadow-lg tracking-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                                FASHIONISTA
                              </h1>
                              <div className="w-full h-px bg-amber-500/50 my-2"></div>
                              <div className="flex justify-between items-center text-xs uppercase tracking-[0.3em] font-bold text-stone-100 drop-shadow-md">
                                <span>Issue 27</span>
                                <span>Autumn Vibes Collection</span>
                                <span>$14.99</span>
                              </div>
                            </div>

                            {/* Center/Side Headlines (Dynamic) */}
                            <div className="absolute top-1/3 left-6 right-6 bottom-1/4">
                              {/* Left side text */}
                              <div className="absolute left-0 top-10 flex flex-col gap-8">
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-8 h-px bg-amber-500"></div>
                                      <span className="text-[10px] uppercase tracking-widest text-amber-400">Trend Report</span>
                                    </div>
                                    <h2 className="font-serif text-2xl text-white leading-none drop-shadow-lg">
                                      {designStyle ? designStyle.toUpperCase() : "BOLD SILHOUETTES"}
                                    </h2>
                                 </div>
                                 
                                 <div>
                                   <span className="text-[10px] uppercase tracking-widest text-stone-300 block mb-1">
                                      {designOccasion ? designOccasion.toUpperCase() : "ELEGANCE"}
                                   </span>
                                   <h3 className="font-serif text-xl text-amber-200 leading-none drop-shadow-lg">
                                     STATEMENT COLORS
                                   </h3>
                                 </div>
                              </div>

                              {/* Right side text */}
                              <div className="absolute right-0 top-20 flex flex-col gap-12 text-right">
                                 <div>
                                    <h3 className="font-serif text-xl text-white leading-none drop-shadow-lg mb-1">
                                      {designGarment ? "FEATURED PIECE" : "SELENE STYLE"}
                                    </h3>
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="text-[10px] uppercase tracking-widest text-amber-400">
                                        {designGarment ? "Exclusive" : "Tu Estilo"}
                                      </span>
                                      <div className="w-8 h-px bg-amber-500"></div>
                                    </div>
                                 </div>
                                 
                                 <div className="relative">
                                    {/* Decorative circle */}
                                    <div className="absolute -right-2 -top-4 w-6 h-6 rounded-full border border-amber-500/50"></div>
                                    <h3 className="font-serif text-3xl text-amber-100 italic drop-shadow-lg pr-4">
                                      Attitude
                                    </h3>
                                 </div>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-end">
                               <div className="text-left">
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-stone-300">
                                    Elegancia Personalizada
                                  </p>
                                  <p className="font-serif text-2xl text-white drop-shadow-lg">
                                    YOUR STYLE
                                  </p>
                               </div>
                               {/* Fake Barcode/Issue */}
                               <div className="text-right">
                                  <StarShape className="text-stone-300 w-8 h-8 ml-auto mb-1 opacity-80" />
                                  <span className="text-[10px] text-stone-400">ISSUE 27</span>
                               </div>
                            </div>
                        </div>

                        {/* Tech/Analysis Overlay (Lines and Dots) */}
                        <div className="absolute inset-0 pointer-events-none opacity-40">
                           <div className="absolute top-[25%] left-[10%] w-[1px] h-[100px] bg-amber-500/50"></div>
                           <div className="absolute top-[25%] left-[10%] w-2 h-2 -ml-[3px] rounded-full bg-amber-500"></div>
                           
                           <div className="absolute bottom-[30%] right-[10%] w-[1px] h-[80px] bg-amber-500/50"></div>
                           <div className="absolute bottom-[30%] right-[10%] w-2 h-2 -ml-[3px] rounded-full bg-amber-500"></div>

                           <div className="absolute top-[15%] right-[20%] w-[50px] h-[1px] bg-amber-500/50"></div>
                           <div className="absolute top-[15%] right-[20%] w-2 h-2 -mt-[3px] rounded-full bg-amber-500"></div>
                        </div>
                     </div>

                     {/* Actions */}
                     <button 
                       onClick={() => setDesignResult(null)}
                       className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-900"
                     >
                       <X size={20} />
                     </button>
                     
                     <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                        <span className="bg-black/60 text-stone-200 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">
                          Generated by Anna Style AI
                        </span>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center max-w-md px-4 opacity-40">
                     {isDesigning ? (
                       <div className="flex flex-col items-center">
                         <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-6" />
                         <h3 className="font-serif text-2xl text-stone-300 mb-2">Designing Cover Shot</h3>
                         <p className="text-sm text-stone-500 uppercase tracking-widest animate-pulse">
                           Applying editorial layout & typography...
                         </p>
                       </div>
                     ) : designError ? (
                       <div className="opacity-100 bg-red-950/30 border border-red-800/50 rounded-lg px-6 py-5 text-center">
                         <p className="text-red-400 font-serif text-lg mb-1">Generation Failed</p>
                         <p className="text-stone-500 text-sm">{designError}</p>
                         <button onClick={() => setDesignError(null)} className="mt-3 text-xs text-stone-600 hover:text-stone-400 uppercase tracking-widest transition-colors">Dismiss</button>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center">
                         <div className="w-20 h-20 border border-dashed border-stone-600 rounded-full flex items-center justify-center mb-6">
                           <Sparkles className="w-8 h-8 text-stone-600" />
                         </div>
                         <h3 className="font-serif text-3xl text-stone-300 mb-2">The Canvas is Empty</h3>
                         <p className="text-stone-500 leading-relaxed">
                           "Fashion is the armor to survive the reality of everyday life." <br/>
                           Use the creative controls to bring your vision to life.
                         </p>
                       </div>
                     )}
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'editor' && (
           /* ================= EDITOR MODE ================= */
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in">
             {/* Left Column: Edit Controls */}
             <div className="lg:col-span-5 space-y-8">
               <div className="bg-stone-900 border border-stone-800 p-8 rounded-lg relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Wand2 className="w-32 h-32 text-amber-500" />
                 </div>
                 
                 <h2 className="font-serif text-3xl text-stone-100 mb-6 relative z-10">Digital Darkroom</h2>
                 
                 {/* Image Upload */}
                 <div className="mb-6 relative z-10">
                    <label className="block text-amber-500 text-xs uppercase tracking-widest mb-2 font-bold">Source Image</label>
                    <div 
                      onClick={triggerEditUpload}
                      className={`
                        border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all flex flex-col items-center justify-center gap-4 min-h-[200px]
                        ${editFile ? 'border-amber-500/50 bg-stone-950' : 'border-stone-700 bg-stone-950 hover:border-amber-500/50'}
                      `}
                    >
                      {editFile ? (
                        <>
                          <img src={editFile.url} className="w-full max-h-[200px] object-contain rounded-sm" alt="Source" />
                          <p className="text-amber-500 text-xs uppercase tracking-widest mt-2">Click to Replace</p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-stone-900 flex items-center justify-center rounded-full">
                            <Upload className="text-stone-500 w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-stone-300 text-sm">Upload Image to Edit</p>
                            <p className="text-stone-600 text-xs mt-1">Supports JPG, PNG</p>
                          </div>
                        </>
                      )}
                      <input type="file" ref={editInputRef} onChange={handleEditFileChange} className="hidden" accept="image/*" />
                    </div>
                 </div>
 
                 {/* Prompt Input */}
                 <div className="mb-8 relative z-10">
                   <label className="block text-amber-500 text-xs uppercase tracking-widest mb-2 font-bold">Edit Instruction</label>
                   <textarea
                     value={editPrompt}
                     onChange={(e) => setEditPrompt(e.target.value)}
                     placeholder="Tell Anna how to edit this image (e.g., 'Add a retro filter', 'Remove the background', 'Make it look like a sketch')..."
                     className="w-full bg-stone-950 border border-stone-700 rounded-sm p-4 text-stone-300 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors h-24 resize-none"
                   />
                 </div>
 
                 {/* Action Button */}
                 <button
                   onClick={handleEditImage}
                   disabled={(!editPrompt || !editFile) || isEditing}
                   className={`
                     w-full py-4 text-sm font-bold uppercase tracking-[0.2em] transition-all relative z-10
                     ${(!editPrompt || !editFile) || isEditing 
                       ? 'bg-stone-800 text-stone-500 cursor-not-allowed' 
                       : 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 hover:from-amber-500 hover:to-amber-400 shadow-lg shadow-amber-900/20'}
                   `}
                 >
                   {isEditing ? (
                     <span className="flex items-center justify-center gap-2">
                       <Loader2 className="animate-spin" size={16} /> Processing Edit...
                     </span>
                   ) : (
                     "Execute Edit"
                   )}
                 </button>
               </div>
             </div>
 
             {/* Right Column: Edit Result */}
             <div className="lg:col-span-7">
                <div className="h-full min-h-[600px] bg-stone-900 border border-stone-800 p-2 md:p-8 flex items-center justify-center relative rounded-lg">
                  {/* Decorative lines */}
                  <div className="absolute inset-0 border-2 border-stone-800 m-2 pointer-events-none opacity-50"></div>
                  
                  {editResult ? (
                    <div className="relative w-full h-full flex items-center justify-center animate-fade-in">
                       <img 
                         src={editResult} 
                         alt="Edited Result" 
                         className="max-w-full max-h-[600px] object-contain shadow-2xl shadow-black rounded-sm border border-stone-700"
                       />
                       
                       <div className="absolute top-4 right-4 flex gap-2">
                         <a 
                           href={editResult} 
                           download="fashionista-edit.png"
                           className="bg-black/60 text-white p-2 rounded-full backdrop-blur-md hover:bg-amber-600 transition-colors"
                         >
                           <Download size={20} />
                         </a>
                         <button 
                           onClick={() => setEditResult(null)}
                           className="bg-black/60 text-white p-2 rounded-full backdrop-blur-md hover:bg-red-900 transition-colors"
                         >
                           <X size={20} />
                         </button>
                       </div>
                       
                       <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                          <span className="bg-black/60 text-amber-500 text-[10px] uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-md border border-amber-900/50">
                            Edited with Gemini 2.5 Flash
                          </span>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center max-w-md px-4 opacity-40">
                      {isEditing ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-6" />
                          <h3 className="font-serif text-2xl text-stone-300 mb-2">Applying Edits</h3>
                          <p className="text-sm text-stone-500 uppercase tracking-widest animate-pulse">
                            Processing pixels...
                          </p>
                        </div>
                      ) : editError ? (
                        <div className="opacity-100 bg-red-950/30 border border-red-800/50 rounded-lg px-6 py-5 text-center">
                          <p className="text-red-400 font-serif text-lg mb-1">Edit Failed</p>
                          <p className="text-stone-500 text-sm">{editError}</p>
                          <button onClick={() => setEditError(null)} className="mt-3 text-xs text-stone-600 hover:text-stone-400 uppercase tracking-widest transition-colors">Dismiss</button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 border border-dashed border-stone-600 rounded-full flex items-center justify-center mb-6">
                            <Wand2 className="w-8 h-8 text-stone-600" />
                          </div>
                          <h3 className="font-serif text-3xl text-stone-300 mb-2">Darkroom Empty</h3>
                          <p className="text-stone-500 leading-relaxed">
                            Upload an image and provide instructions to transform it.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
             </div>
           </div>
        )}

      </div>
    </div>
  );
};

// Decorative Star Shape for the Magazine Cover
const StarShape = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
  </svg>
);

// Sub-component for displaying an outfit suggestion
const OutfitCard: React.FC<{ suggestion: OutfitSuggestion; index: number }> = ({ suggestion, index }) => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');

  const handleGenerate = async () => {
    // Check for API key presence for paid models
    const aistudio = (window as any).aistudio;
    const ensureKey = async () => {
      if (aistudio && aistudio.hasSelectedApiKey && aistudio.openSelectKey) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await aistudio.openSelectKey();
        }
      }
    };
    
    await ensureKey();

    setIsGenerating(true);
    setGenerateError(null);
    try {
      const itemsDesc = suggestion.items.map(i => `${i.color} ${i.name} (${i.type})`).join(', ');
      const prompt = `Professional high-fashion photography of a model wearing ${itemsDesc}.
      Style: ${suggestion.style}. Occasion: ${suggestion.occasion}.
      Description: ${suggestion.description}.
      Cinematic lighting, vogue magazine style, detailed textures, photorealistic, 8k resolution.`;

      const img = await generateOutfitVisualization(prompt, size);
      setGeneratedImage(img);
    } catch (e: any) {
      console.error(e);
      const errorStr = e.toString().toLowerCase();
      if (errorStr.includes("permission") || errorStr.includes("403")) {
        const aistudio = (window as any).aistudio;
        if (aistudio && aistudio.openSelectKey) {
          try {
            await aistudio.openSelectKey();
            setGenerateError("Permission updated. Click 'Generate Visual' again.");
            return;
          } catch {
            // ignore
          }
        }
      }
      setGenerateError("Failed to generate visualization. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 p-8 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-9xl text-stone-700 font-bold select-none pointer-events-none">
        0{index + 1}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500 border border-amber-900/50 px-2 py-1 rounded">
            {suggestion.occasion}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
            {suggestion.style}
          </span>
        </div>

        <h3 className="font-serif text-3xl md:text-4xl text-stone-100 mb-4 group-hover:text-amber-400 transition-colors">
          {suggestion.title}
        </h3>
        
        <p className="text-stone-400 italic mb-8 border-l-2 border-amber-600/50 pl-4">
          {suggestion.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <h4 className="text-stone-300 font-bold uppercase text-xs tracking-widest border-b border-stone-800 pb-2">
               The Ensemble
             </h4>
             <ul className="space-y-4">
               {suggestion.items.map((item, idx) => (
                 <li key={idx} className="flex items-start gap-3">
                   <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                   <div>
                     <p className="text-stone-200 font-serif text-lg leading-none mb-1">{item.name}</p>
                     <p className="text-xs text-stone-500 uppercase tracking-wider">
                       {item.color} • {item.type}
                     </p>
                   </div>
                 </li>
               ))}
             </ul>
          </div>
          
          <div className="bg-stone-950 p-1 flex flex-col items-center justify-center border border-stone-800 min-h-[350px]">
             {generatedImage ? (
               <div className="relative w-full h-full animate-fade-in group/image">
                 <img src={generatedImage} alt="Generated Outfit" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setGeneratedImage(null)} 
                      className="absolute top-2 right-2 bg-stone-900/80 text-stone-400 hover:text-white p-2 rounded-full transition-colors"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-4 left-4 text-xs text-stone-200">
                      Generated with Gemini Pro
                    </div>
                 </div>
               </div>
             ) : (
               <div className="text-center w-full p-6 flex flex-col items-center justify-center h-full">
                  {isGenerating ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin text-amber-500 w-10 h-10 mb-4" />
                      <span className="text-stone-500 text-xs uppercase tracking-widest animate-pulse">Designing Visuals...</span>
                    </div>
                  ) : generateError ? (
                    <div className="bg-red-950/30 border border-red-800/50 rounded-lg px-4 py-4 text-center w-full max-w-[220px]">
                      <p className="text-red-400 text-sm mb-2">{generateError}</p>
                      <button onClick={() => setGenerateError(null)} className="text-xs text-stone-600 hover:text-stone-400 uppercase tracking-widest transition-colors">Dismiss</button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 text-stone-700">
                         <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                         <span className="block font-serif text-2xl mb-1">Visual Concept</span>
                         <p className="text-xs uppercase tracking-widest opacity-70">See this look</p>
                      </div>
                      
                      <div className="flex flex-col gap-3 w-full max-w-[200px]">
                        <select 
                          value={size} 
                          onChange={(e) => setSize(e.target.value as any)}
                          className="bg-stone-900 border border-stone-700 text-stone-400 text-xs uppercase tracking-widest py-2 px-3 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="1K">Quality: 1K</option>
                          <option value="2K">Quality: 2K</option>
                          <option value="4K">Quality: 4K</option>
                        </select>
                        
                        <button 
                          onClick={handleGenerate}
                          className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-100 border border-amber-500/50 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-amber-900/20"
                        >
                          Generate Visual
                        </button>
                      </div>
                    </>
                  )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};