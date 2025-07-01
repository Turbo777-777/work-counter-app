const { ipcRenderer } = require('electron');

let categories = [];
let todayCounts = {};

// アプリ起動時の初期化
document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    await loadTodayCounts();
    renderCategories();
    renderTodayHistory();
});

// カテゴリ読み込み
async function loadCategories() {
    categories = await ipcRenderer.invoke('get-categories');
    
    // デフォルトカテゴリがない場合は作成
    if (categories.length === 0) {
        const defaultCategories = [
            { id: 'programming', name: 'プログラミング', color: '#4CAF50' },
            { id: 'meeting', name: '会議', color: '#2196F3' },
            { id: 'task', name: 'タスク完了', color: '#FF9800' }
        ];
        
        for (const category of defaultCategories) {
            await ipcRenderer.invoke('save-category', category);
        }
        
        categories = await ipcRenderer.invoke('get-categories');
    }
}

// 今日のカウント読み込み
async function loadTodayCounts() {
    todayCounts = await ipcRenderer.invoke('get-today-counts');
}

// カテゴリ表示
function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = '';
    
    categories.forEach(category => {
        const count = todayCounts[category.id] || 0;
        
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item';
        categoryElement.style.borderLeft = `4px solid ${category.color}`;
        
        categoryElement.innerHTML = `
            <div class="category-name">${category.name}</div>
            <div class="count-controls">
                <button class="count-btn decrement" onclick="decrementCount('${category.id}')">-</button>
                <div class="count-display" id="count-${category.id}">${count}</div>
                <button class="count-btn increment" onclick="incrementCount('${category.id}')">+</button>
            </div>
        `;
        
        container.appendChild(categoryElement);
    });
}

// 今日の履歴表示
function renderTodayHistory() {
    const historyContainer = document.getElementById('todayHistory');
    const today = new Date().toLocaleDateString('ja-JP');
    
    let historyHTML = `<p><strong>${today}</strong></p>`;
    
    if (Object.keys(todayCounts).length === 0) {
        historyHTML += '<p>まだ記録がありません</p>';
    } else {
        categories.forEach(category => {
            const count = todayCounts[category.id] || 0;
            if (count > 0) {
                historyHTML += `<p>${category.name}: ${count}回</p>`;
            }
        });
    }
    
    historyContainer.innerHTML = historyHTML;
}

// カテゴリ追加
async function addCategory() {
    const input = document.getElementById('categoryInput');
    const name = input.value.trim();
    
    if (!name) {
        alert('カテゴリ名を入力してください');
        return;
    }
    
    const newCategory = {
        id: Date.now().toString(),
        name: name,
        color: getRandomColor()
    };
    
    await ipcRenderer.invoke('save-category', newCategory);
    await loadCategories();
    renderCategories();
    
    input.value = '';
}

// カウント増加
async function incrementCount(categoryId) {
    const newCount = await ipcRenderer.invoke('increment-count', categoryId);
    todayCounts[categoryId] = newCount;
    
    // UI更新
    const countElement = document.getElementById(`count-${categoryId}`);
    if (countElement) {
        countElement.textContent = newCount;
        
        // アニメーション効果
        countElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            countElement.style.transform = 'scale(1)';
        }, 200);
    }
    
    renderTodayHistory();
}

// カウント減少
async function decrementCount(categoryId) {
    const newCount = await ipcRenderer.invoke('decrement-count', categoryId);
    todayCounts[categoryId] = newCount;
    
    // UI更新
    const countElement = document.getElementById(`count-${categoryId}`);
    if (countElement) {
        countElement.textContent = newCount;
        
        // アニメーション効果
        countElement.style.transform = 'scale(0.8)';
        setTimeout(() => {
            countElement.style.transform = 'scale(1)';
        }, 200);
    }
    
    renderTodayHistory();
}

// クイックカウント（フローティングボタン）
function toggleQuickCount() {
    if (categories.length === 0) {
        alert('まずカテゴリを追加してください');
        return;
    }
    
    // 最初のカテゴリをクイックカウント対象とする
    incrementCount(categories[0].id);
}

// ランダムカラー生成
function getRandomColor() {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#009688', '#795548'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// エンターキーでカテゴリ追加
document.getElementById('categoryInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addCategory();
    }
});

// ショートカットキー
document.addEventListener('keydown', (event) => {
    // Ctrl+数字でカテゴリのクイックカウント
    if (event.ctrlKey && event.key >= '1' && event.key <= '9') {
        const index = parseInt(event.key) - 1;
        if (categories[index]) {
            incrementCount(categories[index].id);
        }
    }
});
