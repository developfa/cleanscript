// DOM Elements
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const convertBtn = document.getElementById('convertBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const inputCount = document.getElementById('inputCount');
const outputCount = document.getElementById('outputCount');
const copyNotification = document.getElementById('copyNotification');

// Clean Script Function
function cleanScript(text) {
    if (!text.trim()) {
        return '';
    }
    
    let cleaned = text;
    
    // 1. Remove metadata section (between first --- and second ---)
    cleaned = cleaned.replace(/^---[\s\S]*?---\s*/m, '');
    
    // 2. Remove [imageN: ...] lines (handles both single and multi-line)
    cleaned = cleaned.replace(/\[image\d+:.*?\]/g, '');
    
    // 3. Remove all markdown headers (##, ###, etc.)
    cleaned = cleaned.replace(/^#{1,6}\s+.*$/gm, '');
    
    // 4. Remove lines that start with ** (section headers)
    cleaned = cleaned.replace(/^\*\*[A-Z\s&-]+\*\*$/gm, '');
    
    // 5. Remove || subtitle separators at start of lines
    cleaned = cleaned.replace(/^\|\|\s*/gm, '');
    
    // 6. Remove remaining **bold** markers but keep the text
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
    
    // 7. Remove lines with only --- or ===
    cleaned = cleaned.replace(/^[-=]+$/gm, '');
    
    // 8. Remove extra blank lines (3+ newlines become 2)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // 9. Trim leading and trailing whitespace
    cleaned = cleaned.trim();
    
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
    const input = inputText.value;
    const cleaned = cleanScript(input);
    outputText.value = cleaned;
    updateWordCount(outputCount, cleaned);
    
    // Add animation
    outputText.style.animation = 'none';
    setTimeout(() => {
        outputText.style.animation = 'fadeIn 0.5s';
    }, 10);
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
    
    // Create filename from first line or use default
    const firstLine = text.split('\n')[0].slice(0, 50);
    const filename = firstLine 
        ? `${firstLine.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
        : 'clean_script.txt';
    
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
    
    // Ctrl/Cmd + C when output is focused
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === outputText) {
        copyBtn.click();
    }
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize
updateWordCount(inputCount, inputText.value);
updateWordCount(outputCount, outputText.value);

console.log('✅ Script Cleaner initialized!');
console.log('💡 Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to convert quickly!');
