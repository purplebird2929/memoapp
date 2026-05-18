// メモを保存する配列
let memos = [];

// ページ読み込み時にローカルストレージからメモを読み込む
document.addEventListener('DOMContentLoaded', () => {
    loadMemosFromStorage();
    renderMemos();
    
    // イベントリスナーの設定
    document.getElementById('addMemoBtn').addEventListener('click', addMemo);
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Enterキーでメモを追加（タイトル入力時）
    document.getElementById('memoTitle').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('memoContent').focus();
        }
    });
    
    // Ctrl+Enterでメモを追加（内容入力時）
    document.getElementById('memoContent').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            addMemo();
        }
    });
});

// ローカルストレージからメモを読み込む
function loadMemosFromStorage() {
    const storedMemos = localStorage.getItem('memos');
    if (storedMemos) {
        memos = JSON.parse(storedMemos);
    }
}

// ローカルストレージにメモを保存する
function saveMemosToStorage() {
    localStorage.setItem('memos', JSON.stringify(memos));
}

// メモを追加する
function addMemo() {
    const titleInput = document.getElementById('memoTitle');
    const contentInput = document.getElementById('memoContent');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title && !content) {
        alert('タイトルまたは内容を入力してください。');
        return;
    }
    
    const memo = {
        id: Date.now(),
        title: title || '無題のメモ',
        content: content,
        date: new Date().toLocaleString('ja-JP')
    };
    
    memos.unshift(memo);
    saveMemosToStorage();
    renderMemos();
    
    // 入力フィールドをクリア
    titleInput.value = '';
    contentInput.value = '';
    titleInput.focus();
}

// メモを削除する
function deleteMemo(id) {
    if (confirm('このメモを削除してもよろしいですか？')) {
        memos = memos.filter(memo => memo.id !== id);
        saveMemosToStorage();
        renderMemos();
    }
}

// メモを編集する
function editMemo(id) {
    const memo = memos.find(m => m.id === id);
    if (!memo) return;
    
    const newTitle = prompt('タイトルを編集:', memo.title);
    if (newTitle === null) return; // キャンセルされた場合
    
    const newContent = prompt('内容を編集:', memo.content);
    if (newContent === null) return; // キャンセルされた場合
    
    memo.title = newTitle.trim() || '無題のメモ';
    memo.content = newContent.trim();
    memo.date = new Date().toLocaleString('ja-JP') + ' (編集済み)';
    
    saveMemosToStorage();
    renderMemos();
}

// メモを検索する
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredMemos = memos.filter(memo => 
        memo.title.toLowerCase().includes(searchTerm) ||
        memo.content.toLowerCase().includes(searchTerm)
    );
    renderMemos(filteredMemos);
}

// メモを画面に表示する
function renderMemos(memosToRender = memos) {
    const memoList = document.getElementById('memoList');
    
    if (memosToRender.length === 0) {
        memoList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">
                    ${memos.length === 0 ? 'メモがありません。<br>新しいメモを追加してください。' : '検索結果が見つかりませんでした。'}
                </div>
            </div>
        `;
        return;
    }
    
    memoList.innerHTML = memosToRender.map(memo => `
        <div class="memo-item">
            <div class="memo-header">
                <div class="memo-title">${escapeHtml(memo.title)}</div>
                <div class="memo-date">${memo.date}</div>
            </div>
            <div class="memo-content">${escapeHtml(memo.content)}</div>
            <div class="memo-actions">
                <button class="btn-edit" onclick="editMemo(${memo.id})">✏️ 編集</button>
                <button class="btn-delete" onclick="deleteMemo(${memo.id})">🗑️ 削除</button>
            </div>
        </div>
    `).join('');
}

// HTMLエスケープ関数（XSS対策）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Made with Bob
