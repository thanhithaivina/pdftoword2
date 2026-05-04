import { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import { translations, Lang } from './translations';
import { convertPdfToDocx } from './converter';
import { FileUp, FileText, Download, Loader2, AlertCircle, CheckCircle2, Languages, Palette } from 'lucide-react';
import { motion } from 'motion/react';

type ThemeKey = 'summer-breeze' | 'student-memories' | 'summer-night' | 'dreamy';

const themeData: Record<ThemeKey, any> = {
  'summer-breeze': { 
    id: 'summer-breeze',
    name: 'Gió Mùa Hè',
    bg: 'bg-slate-50',
    header: 'bg-white/70 backdrop-blur-md border-b border-rose-100',
    card: 'bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-rose-100/50',
    textMain: 'text-slate-800',
    textMuted: 'text-slate-500',
    primaryBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200',
    secondaryBtn: 'bg-white border-2 border-rose-200 hover:border-rose-300 text-rose-700',
    headingGradient: 'from-rose-600 to-red-600',
    iconBg: 'bg-rose-100 text-rose-600',
    iconHoverBg: 'group-hover:bg-rose-200',
    dropzoneBorder: 'border-rose-200 hover:border-rose-400 hover:bg-white',
    petalColor: 'from-red-400 to-rose-500',
    footerBg: 'bg-white/50 backdrop-blur-sm border-t border-rose-100',
    successBg: 'bg-white/80 border border-rose-200 shadow-lg shadow-rose-100'
  },
  'student-memories': { 
    id: 'student-memories',
    name: 'Ký Ức',
    bg: 'bg-[#fcf9f2]',
    header: 'bg-[#fffdf8] border-b border-amber-200/60',
    card: 'bg-white border border-amber-100 shadow-lg shadow-amber-900/5',
    textMain: 'text-stone-800',
    textMuted: 'text-stone-500',
    primaryBtn: 'bg-[#d93838] hover:bg-[#c22f2f] text-white shadow-md shadow-amber-900/10',
    secondaryBtn: 'bg-white border-2 border-[#d93838]/20 hover:border-[#d93838]/40 text-[#d93838]',
    headingGradient: 'from-[#d93838] to-[#991b1b]',
    iconBg: 'bg-amber-100/50 text-[#d93838]',
    iconHoverBg: 'group-hover:bg-amber-100',
    dropzoneBorder: 'border-amber-200 hover:border-[#d93838]/40 hover:bg-[#fffcf5]',
    petalColor: 'from-[#d93838] to-[#b91c1c]',
    footerBg: 'bg-[#fffdf8] border-t border-amber-200/60',
    successBg: 'bg-white border border-amber-200 shadow-lg shadow-amber-100'
  },
  'summer-night': { 
    id: 'summer-night',
    name: 'Đêm Hạ',
    bg: 'bg-slate-900',
    header: 'bg-slate-900/80 backdrop-blur-md border-b border-slate-800',
    card: 'bg-slate-800/80 backdrop-blur-xl border border-slate-700 shadow-2xl shadow-black/60',
    textMain: 'text-slate-100',
    textMuted: 'text-slate-400',
    primaryBtn: 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/20',
    secondaryBtn: 'bg-slate-800 border-2 border-red-900/50 hover:border-red-700 text-red-400',
    headingGradient: 'from-red-400 to-rose-500',
    iconBg: 'bg-red-900/30 text-red-400',
    iconHoverBg: 'group-hover:bg-red-900/50',
    dropzoneBorder: 'border-slate-700 hover:border-red-500/50 hover:bg-slate-800',
    petalColor: 'from-red-500 to-rose-400',
    footerBg: 'bg-slate-900/50 border-t border-slate-800',
    successBg: 'bg-slate-800/80 border border-slate-700 shadow-xl shadow-black'
  },
  'dreamy': { 
    id: 'dreamy',
    name: 'Mơ Màng',
    bg: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50',
    header: 'bg-white/40 backdrop-blur-md border-b border-white/50',
    card: 'bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl shadow-rose-200/40',
    textMain: 'text-pink-950',
    textMuted: 'text-pink-700/80',
    primaryBtn: 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white shadow-lg shadow-rose-300/50',
    secondaryBtn: 'bg-white/60 border-2 border-rose-200 hover:border-rose-400 text-rose-700',
    headingGradient: 'from-rose-600 to-pink-500',
    iconBg: 'bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600',
    iconHoverBg: 'group-hover:from-rose-200 group-hover:to-pink-200',
    dropzoneBorder: 'border-rose-300/50 hover:border-rose-400 hover:bg-white/40',
    petalColor: 'from-pink-400 to-red-400',
    footerBg: 'bg-white/30 backdrop-blur-md border-t border-white/40',
    successBg: 'bg-white/60 border border-white/80 shadow-lg shadow-rose-200/50'
  }
};

const PetalsEffect = ({ colorClass }: { colorClass: string }) => {
  const [petals, setPetals] = useState<any[]>([]);
  useEffect(() => {
     setPetals([]);
     // brief timeout to reset animation when theme changes
     const t = setTimeout(() => {
       const newPetals = Array.from({ length: 15 }).map((_, i) => ({
         id: i + colorClass,
         left: Math.random() * 100,
         delay: Math.random() * 10,
         duration: 8 + Math.random() * 12,
         size: 15 + Math.random() * 20,
         rotation: Math.random() * 360,
         directionX: (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 15)
       }));
       setPetals(newPetals);
     }, 50);
     return () => clearTimeout(t);
  }, [colorClass]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {petals.map((p) => (
         <motion.div
            key={p.id}
            initial={{ y: '-10vh', x: `${p.left}vw`, rotate: p.rotation, opacity: 0 }}
            animate={{
              y: '110vh',
              x: `${p.left + p.directionX}vw`,
              rotate: p.rotation + 360,
              opacity: [0, 0.8, 0.8, 0]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
            style={{ 
              width: p.size, 
              height: p.size * 0.7, 
              borderRadius: '2px 20px 2px 20px',
              filter: 'blur(1.5px)'
            }}
            className={`absolute bg-gradient-to-br ${colorClass} shadow-sm opacity-80`}
          />
      ))}
    </div>
  );
};


export default function App() {
  const [lang, setLang] = useState<Lang>('vi');
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('summer-breeze');
  const t = translations[lang];
  const th = themeData[currentTheme];

  const [files, setFiles] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertedFiles, setConvertedFiles] = useState<{name: string, url: string}[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLangChange = (l: Lang) => {
    setLang(l);
    setErrorMsg('');
  };

  const processFiles = (selectedFiles: File[]) => {
    setErrorMsg('');
    setConvertedFiles([]);

    const validFiles = selectedFiles.filter(f => f.type === 'application/pdf');

    if (validFiles.length === 0) {
      setErrorMsg(t.uploadRejection);
      setFiles([]);
      return;
    }

    if (validFiles.length > 10) {
      // @ts-ignore - using the updated object keys from translation 
      // but it might not be typed yet in index.d.ts if not compiled but it's any here
      setErrorMsg((t as any).fileLimit || "Chỉ hỗ trợ tối đa 10 file cùng lúc.");
      setFiles(validFiles.slice(0, 10));
    } else {
      setFiles(validFiles);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setErrorMsg('');
    const results: {name: string, url: string}[] = [];

    try {
      for (const f of files) {
        const blob = await convertPdfToDocx(f);
        const url = URL.createObjectURL(blob);
        results.push({ name: f.name.replace('.pdf', '.docx'), url });
      }
      setConvertedFiles(results);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error occurred during conversion. Please try different PDFs.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className={`min-h-screen ${th.bg} transition-colors duration-500 ${th.textMain} font-sans flex flex-col justify-between relative`}>
      <PetalsEffect colorClass={th.petalColor} />
      
      {/* Header */}
      <header className={`sticky top-0 z-20 ${th.header} transition-colors duration-500`}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className={`flex items-center gap-2 bg-gradient-to-br ${th.headingGradient} bg-clip-text text-transparent`}>
            <FileText className="w-7 h-7 text-rose-500" />
            <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm z-10">
            {/* Theme Selector */}
            <div className={`flex items-center p-1 rounded-lg border ${th.dropzoneBorder} bg-white/20 backdrop-blur-sm gap-1`}>
              <Palette className={`w-4 h-4 ml-2 ${th.textMuted}`} />
              {(Object.keys(themeData) as ThemeKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setCurrentTheme(key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    currentTheme === key ? th.primaryBtn : `hover:bg-white/40 ${th.textMuted}`
                  }`}
                >
                  {themeData[key].name}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Languages className={`w-4 h-4 ${th.textMuted}`} />
              <select 
                value={lang} 
                onChange={(e) => handleLangChange(e.target.value as Lang)}
                className={`bg-transparent outline-none cursor-pointer font-medium ${th.textMain}`}
              >
                <option value="vi" className="text-black">Tiếng Việt</option>
                <option value="en" className="text-black">English</option>
                <option value="zh" className="text-black">中文 (Chinese)</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-16 flex flex-col items-center relative z-10">
        <div className="text-center mb-10">
          <h2 className={`text-3xl md:text-5xl font-extrabold bg-gradient-to-br ${th.headingGradient} bg-clip-text text-transparent mb-4 leading-tight`}>
            {t.title}
          </h2>
          <p className={`${th.textMuted} text-lg md:text-xl font-medium tracking-wide`}>{t.subtitle}</p>
        </div>

        {/* Upload Zone */}
        {convertedFiles.length === 0 && (
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-xl mx-auto ${th.card} rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed ${th.dropzoneBorder} transition-all duration-300 group`}
          >
            <input 
              type="file" 
              accept=".pdf,application/pdf"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
            />
            
            <div className={`w-20 h-20 mb-6 rounded-2xl ${th.iconBg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 ${th.iconHoverBg} transition-all duration-300 shadow-inner`}>
              <FileUp className="w-10 h-10" />
            </div>
            
            <p className={`text-xl font-semibold mb-2 text-center`}>
              {files.length > 0 ? `${files.length} file được chọn` : t.uploadPrompt}
            </p>
            
            {files.length === 0 && (
              <p className={th.textMuted}>PDF (.pdf)</p>
            )}

            {files.length > 0 && (
              <div className={`mt-5 px-5 py-2.5 rounded-2xl flex flex-col items-center gap-2 text-sm font-semibold ${th.iconBg}`}>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> {t.selectedFile}</div>
                <div className="flex flex-col items-center max-h-32 overflow-y-auto">
                  {files.map((f, i) => (
                    <span key={i} className="text-xs truncate max-w-[250px]">{f.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mt-6 flex items-center gap-3 text-red-600 bg-red-50/90 backdrop-blur-sm px-5 py-4 rounded-xl border border-red-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* Actions */}
        {files.length > 0 && convertedFiles.length === 0 && !errorMsg && (
          <div className="mt-10 flex flex-col items-center w-full max-w-md animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className={`w-full ${th.primaryBtn} disabled:opacity-70 font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg group`}
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {t.converting}
                </>
              ) : (
                <>
                  <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  {t.convertBtn}
                </>
              )}
            </button>
            <p className={`text-sm ${th.textMuted} mt-5 text-center font-medium`}>
              Đảm bảo toàn vẹn nội dung.<br/>
              Có thể mất vài giây tuỳ vào dung lượng file.
            </p>
          </div>
        )}

        {/* Success / Download Zone */}
        {convertedFiles.length > 0 && (
          <div className={`w-full max-w-xl mx-auto rounded-3xl p-10 flex flex-col items-center justify-center mt-4 transition-all animate-in fade-in zoom-in-95 ${th.successBg}`}>
            <div className={`w-20 h-20 mb-6 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shadow-inner`}>
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h3 className="text-2xl font-bold text-green-700 mb-3">{t.success}</h3>
            <p className={`text-lg ${th.textMuted} mb-8 text-center px-4 font-medium`}>
              <span className={`font-bold ${th.textMain}`}>{convertedFiles.length}</span> file đã được chuyển đổi. Bạn có thể tải về bên dưới.
            </p>

            <div className="flex flex-col gap-3 w-full mb-8">
              {convertedFiles.map((cf, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${th.dropzoneBorder} bg-white/50 backdrop-blur-sm`}>
                  <span className={`font-semibold truncate max-w-[200px] sm:max-w-[300px] ${th.textMain}`}>{cf.name}</span>
                  <a 
                    href={cf.url} 
                    download={cf.name}
                    className={`flex items-center gap-2 ${th.primaryBtn} px-4 py-2 rounded-lg text-sm font-semibold transition-all`}
                  >
                    <Download className="w-4 h-4" />
                    {t.download}
                  </a>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={() => {
                  setFiles([]);
                  setConvertedFiles([]);
                }}
                className={`flex-1 ${th.secondaryBtn} py-4 px-6 rounded-2xl transition-all font-bold text-lg cursor-pointer`}
              >
                Chuyển đổi file khác
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`relative z-10 py-6 mt-12 transition-colors duration-500 ${th.footerBg}`}>
        <div className={`max-w-5xl mx-auto px-4 text-center text-sm ${th.textMuted}`}>
          <p className="font-semibold tracking-wide">{t.developerRef}</p>
          <p className="mt-2 text-xs opacity-70">Dự án Chuyển đổi PDF sang Word</p>
        </div>
      </footer>
    </div>
  );
}

