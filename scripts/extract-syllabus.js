
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let pdf = require('pdf-parse');

// debug
console.log('Type of pdf import:', typeof pdf);
console.log('Keys:', Object.keys(pdf));
if (typeof pdf !== 'function') {
    if (pdf.default) pdf = pdf.default;
    // Maybe it's not default export but require('pdf-parse') returns nothing?
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust paths relative to project root (assuming script is in /scripts)
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PDF_PATH = path.resolve(PROJECT_ROOT, '.workspace/syllabus-data-pdf/IP/syllabus_ip_ver6_5-ITパスポート試験シラバス（情報処理技術者試験における知識・技能の細目）.pdf');
const MASTER_SYLLABUS_PATH = path.resolve(PROJECT_ROOT, 'src/data/master/syllabus.json');
const TARGET_IP_JSON_PATH = path.resolve(PROJECT_ROOT, 'src/data/master/syllabus-ip.json');

async function extract() {
    console.log(`Reading PDF from: ${PDF_PATH}`);
    
    if (!fs.existsSync(PDF_PATH)) {
        console.error('PDF file not found!');
        console.error('Expected path:', PDF_PATH);
        process.exit(1);
    }

    const dataBuffer = fs.readFileSync(PDF_PATH);
    const data = await pdf(dataBuffer);
    const text = data.text;

    console.log(`Extracted ${text.length} characters.`);
    
    // Save raw text for debugging
    const rawTextPath = path.resolve(PROJECT_ROOT, '.workspace/syllabus-raw-text.txt');
    fs.writeFileSync(rawTextPath, text);
    console.log(`Saved raw text to ${rawTextPath}`);

    // Load definitions
    const masterSyllabus = JSON.parse(fs.readFileSync(MASTER_SYLLABUS_PATH, 'utf8'));
    // We want to UPDATE existing IP syllabus if possible, or create valid structure based on master
    // For now, let's load the template we created
    let ipSyllabus;
    try {
        ipSyllabus = JSON.parse(fs.readFileSync(TARGET_IP_JSON_PATH, 'utf8'));
    } catch (e) {
        console.log("Target JSON not found or invalid, initializing from master...");
        ipSyllabus = { examId: 'ip', version: '6.0', categories: JSON.parse(JSON.stringify(masterSyllabus)) };
    }

    // Extraction Strategy
    // 1. Identify "Middle Category" headers in text
    // 2. Extract following text block
    // 3. Extract keywords
    
    const extractionResults = {};

    masterSyllabus.forEach(field => {
        field.large_categories.forEach(lc => {
            lc.middle_categories.forEach(mc => {
                // Regex to find "中分類 <id> <name>"
                // Example: "中分類 1 企業活動"
                // allow some flexibility
                const regex = new RegExp(`中分類\\s*${mc.id}\\s*[:：]?\\s*${mc.name}`, 'g');
                
                let match;
                while ((match = regex.exec(text)) !== null) {
                    if (!extractionResults[mc.id]) {
                        extractionResults[mc.id] = [];
                    }
                    extractionResults[mc.id].push(match.index);
                }
            });
        });
    });

    // Sort all found positions
    const sortedPositions = [];
    Object.keys(extractionResults).forEach(id => {
        extractionResults[id].forEach(pos => {
            sortedPositions.push({ id, pos });
        });
    });
    sortedPositions.sort((a, b) => a.pos - b.pos);

    // Extract blocks
    for (let i = 0; i < sortedPositions.length; i++) {
        const current = sortedPositions[i];
        const next = sortedPositions[i+1];
        const endPos = next ? next.pos : text.length; // or text.length
        
        // Limit block size to avoid reading too much garbage if detection fails
        const blockLength = Math.min(endPos - current.pos, 5000); 
        const blockText = text.substring(current.pos, current.pos + blockLength);

        // Extract keywords from block
        const keywords = extractKeywordsFromBlock(blockText);
        
        // Update IP Syllabus
        updateSyllabus(ipSyllabus, current.id, keywords);
    }
    
    fs.writeFileSync(TARGET_IP_JSON_PATH, JSON.stringify(ipSyllabus, null, 2));
    console.log(`Updated ${TARGET_IP_JSON_PATH} with extracted keywords.`);
}

function extractKeywordsFromBlock(text) {
    const keywords = new Set();
    const lines = text.split('\n');
    
    // Heuristic:
    // Look for lines that contain "・" or "，" (comma) or "、"
    // AND usually follow "用語例" or "技術要素"
    // IPA syllabus usually puts keywords in a list or paragraph starting with "用語例"
    
    let isInKeywordSection = false;
    
    lines.forEach(line => {
        let cleanLine = line.trim();
        
        // Skip noise lines
        if (cleanLine.startsWith('✓') || cleanLine.startsWith('➢') || cleanLine.match(/^[0-9]+\./)) {
            return;
        }
        // Skip page number references (e.g. "..... 15")
        if (cleanLine.match(/\.{3,}\s*\d+$/)) {
            return;
        }

        if (cleanLine.includes('用語例') || cleanLine.includes('技術要素')) {
            isInKeywordSection = true;
        }
        
        if (cleanLine.includes('・') || cleanLine.includes('，') || cleanLine.includes('、')) {
             const parts = cleanLine.split(/[・，、,]/);
             parts.forEach(p => {
                 p = p.trim();
                 p = p.replace(/（[^）]*）/g, '').replace(/\([^\)]*\)/g, '');
                 
                 // Filter short/garbage and sentences
                 if (p.length > 1 && 
                     p.length < 30 && // Skip long sentences
                     !p.match(/^[0-9.]+$/) && 
                     !p.includes('分類') && 
                     !p.includes('用語例') &&
                     !p.includes('を理解') && // common in syllabus sentences
                     !p.includes('知る') &&
                     !p.includes('利用する')
                    ) {
                     keywords.add(p);
                 }
             });
        }
    });
    
    return Array.from(keywords);
}

function updateSyllabus(syllabus, midCatId, newKeywords) {
    if (!newKeywords || newKeywords.length === 0) return;

    // Traverse and find
    // Note: syllabus structure might vary (if it's the template I made vs master structure)
    // Structure: categories -> large_categories -> middle_categories
    
    if (syllabus.categories) {
        syllabus.categories.forEach(cat => {
            if (cat.large_categories) {
                cat.large_categories.forEach(lc => {
                    if (lc.middle_categories) {
                        lc.middle_categories.forEach(mc => {
                            if (mc.id === midCatId) {
                                const existing = new Set(mc.keywords || []);
                                newKeywords.forEach(k => existing.add(k));
                                mc.keywords = Array.from(existing);
                            }
                        });
                    }
                });
            }
        });
    }
}

extract();
