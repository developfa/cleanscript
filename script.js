// DOM Elements
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const convertBtn = document.getElementById('convertBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const inputCount = document.getElementById('inputCount');
const outputCount = document.getElementById('outputCount');
const copyNotification = document.getElementById('copyNotification');

// Clean Script Function - Extract ONLY the spoken content
function cleanScript(text) {
    if (!text.trim()) {
        return '';
    }
    
    console.log('Starting cleaning process...');
    
    // Split into lines
    let lines = text.split('\n');
    let paragraphs = [];
    let currentParagraph = [];
    
    // Process line by line
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // If it's an empty line, it marks a paragraph boundary
        if (line === '') {
            if (currentParagraph.length > 0) {
                // Join current paragraph and add to results
                let paragraphText = currentParagraph.join(' ');
                // Clean up multiple spaces within paragraph
                paragraphText = paragraphText.replace(/\s+/g, ' ').trim();
                paragraphs.push(paragraphText);
                currentParagraph = [];
            }
            continue;
        }
        
        // If line starts with ||, extract the content
        if (line.startsWith('||')) {
            let content = line.substring(2).trim(); // Remove || and spaces
            
            // Remove **bold** markers (like **Tip 1:**, **HOOK**, etc.)
            content = content.replace(/\*\*(.*?)\*\*/g, '$1');
            
            if (content.length > 0) {
                currentParagraph.push(content);
            }
        }
        // Skip lines that don't start with || (image tags, headers, etc.)
    }
    
    // Add any remaining paragraph
    if (currentParagraph.length > 0) {
        let paragraphText = currentParagraph.join(' ');
        paragraphText = paragraphText.replace(/\s+/g, ' ').trim();
        paragraphs.push(paragraphText);
    }
    
    console.log('Total paragraphs:', paragraphs.length);
    
    // Join paragraphs with blank line (double newline)
    let cleaned = paragraphs.join('\n\n');
    
    console.log('Final output length:', cleaned.length);
    
    return cleaned;
}

// Count Words Function
function countWords(text) {
    if (!text.trim()) {
        return 0;
    }
    return text.trim().split(/\s+/).length;
}

// Update Word Count
function updateWordCount(element, text) {
    const count = countWords(text);
    element.textContent = `${count} word${count !== 1 ? 's' : ''}`;
}

// Convert Button Handler
convertBtn.addEventListener('click', () => {
    console.log('Convert button clicked!');
    
    const input = inputText.value;
    console.log('Input length:', input.length);
    
    if (!input.trim()) {
        alert('Please paste a script first!');
        return;
    }
    
    const cleaned = cleanScript(input);
    console.log('Cleaned length:', cleaned.length);
    
    outputText.value = cleaned;
    updateWordCount(outputCount, cleaned);
    
    if (cleaned.length === 0) {
        alert('No content found! Make sure your script has lines starting with ||');
    }
});

// Copy Button Handler
copyBtn.addEventListener('click', async () => {
    const text = outputText.value;
    
    if (!text.trim()) {
        alert('No text to copy! Please convert a script first.');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        showCopyNotification();
    } catch (err) {
        console.error('Copy failed:', err);
        // Fallback for older browsers
        outputText.select();
        document.execCommand('copy');
        showCopyNotification();
    }
});

// Show Copy Notification
function showCopyNotification() {
    copyNotification.classList.add('show');
    setTimeout(() => {
        copyNotification.classList.remove('show');
    }, 2000);
}

// Download Button Handler
downloadBtn.addEventListener('click', () => {
    const text = outputText.value;
    
    if (!text.trim()) {
        alert('No text to download! Please convert a script first.');
        return;
    }
    
    // Create filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `clean_script_${timestamp}.txt`;
    
    // Create blob and download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Input Text Change Handler - Update Word Count
inputText.addEventListener('input', () => {
    updateWordCount(inputCount, inputText.value);
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to convert
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        convertBtn.click();
    }
});

// Initialize
updateWordCount(inputCount, inputText.value);
updateWordCount(outputCount, outputText.value);

console.log('✅ Script Cleaner v5.1 initialized!');
console.log('💡 Preserves paragraph spacing between meaning blocks');
console.log('💡 Press Ctrl+Enter to convert quickly!');
