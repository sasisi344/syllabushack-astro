import { useState, useCallback, useEffect } from 'preact/hooks';
import syllabusCommon from '~/data/master/syllabus.json';
import syllabusIp from '~/data/master/syllabus-ip.json';

interface ExtractedData {
  middleCategoryId: string;
  keywords: string[];
}

export default function SyllabusParser() {
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState<ExtractedData[]>([]);
  const [selectedExam, setSelectedExam] = useState('ip');

  useEffect(() => {
    if (selectedExam === 'ip') {
      const loaded: ExtractedData[] = [];
      syllabusIp.categories.forEach((field: any) => {
        field.large_categories.forEach((lc: any) => {
          lc.middle_categories.forEach((mc: any) => {
            if (mc.keywords && mc.keywords.length > 0) {
              loaded.push({
                middleCategoryId: mc.id,
                keywords: mc.keywords
              });
            }
          });
        });
      });
      setParsedData(loaded);
    } else {
        setParsedData([]);
    }
  }, [selectedExam]);


  const [targetCategory, setTargetCategory] = useState<string>('');

  const handleExtract = useCallback(() => {
    // Split by common delimiters
    const cleanText = inputText
      .replace(/[\(（].*?[\)）]/g, '') // remove parentheses explanations
      .replace(/例：/g, '')
      .replace(/・/g, '\n');
      
    const words = cleanText
      .split(/[,、\n\r\/]/)
      .map(w => w.trim())
      .filter(w => w.length > 1 && !w.match(/^\d+$/)); // detailed filter needed
      
    const uniqueWords = Array.from(new Set(words));
    
    setParsedData(prev => [
      ...prev, 
      { middleCategoryId: targetCategory, keywords: uniqueWords }
    ]);
    setInputText('');
  }, [inputText, targetCategory]);


  const flattenCategories = () => {
    const list: { id: string; label: string; full: any }[] = [];
    syllabusCommon.forEach((field) => {
      field.large_categories.forEach((lc) => {
        lc.middle_categories.forEach((mc) => {
          list.push({
            id: mc.id,
            label: `${field.name} > ${lc.name} > ${mc.name}`,
            full: mc
          });
        });
      });
    });
    return list;
  };
  
  const categories = flattenCategories();

  const handleCopyJson = () => {
    // Generate JSON structure for the exam
    // We start with syllabus-ip.json structure and fill in keywords
    // For now simplistic output
    const output = {
        examId: selectedExam,
        version: "x.x",
        categories: syllabusCommon.map(field => ({
            ...field,
            large_categories: field.large_categories.map(lc => ({
                ...lc,
                middle_categories: lc.middle_categories.map(mc => ({
                    ...mc,
                    keywords: parsedData.find(d => d.middleCategoryId === mc.id)?.keywords || []
                }))
            }))
        }))
    };
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    alert('JSON copied to clipboard!');
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Syllabus PDF Parser (Helper)</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Target Exam</label>
        <select value={selectedExam} onChange={e => setSelectedExam(e.currentTarget.value)} className="border p-2 rounded text-black w-full">
            <option value="ip">IT Passport (IP)</option>
            <option value="sg">Security Management (SG)</option>
            <option value="fe">Fundamental Info (FE)</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Target Category (Select from Master)</label>
        <select value={targetCategory} onChange={e => setTargetCategory(e.currentTarget.value)} className="border p-2 rounded text-black w-full">
          <option value="">Select Category...</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Paste Text (Keywords section from PDF)</label>
        <textarea 
          value={inputText} 
          onInput={e => setInputText(e.currentTarget.value)} 
          className="w-full h-32 border p-2 rounded text-black font-mono text-sm"
          placeholder="Paste syllabus text here..."
        />
      </div>

      <button onClick={handleExtract} disabled={!targetCategory || !inputText} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
        Extract Keywords
      </button>

      <div className="mt-8 border-t pt-4">
        <h3 className="font-bold mb-2">Extracted Data Preview</h3>
        {parsedData.map((d, i) => (
            <div key={i} className="mb-2 text-sm border-b pb-2">
                <strong>{categories.find(c => c.id === d.middleCategoryId)?.label}:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                    {d.keywords.map(k => (
                        <span key={k} className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{k}</span>
                    ))}
                </div>
            </div>
        ))}
        
        <button onClick={handleCopyJson} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            Copy Full JSON to Clipboard
        </button>
      </div>
    </div>
  );
}
