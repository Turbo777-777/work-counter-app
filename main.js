const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');

// データストレージ初期化
const store = new Store();

let mainWindow;
let tray;

// NotionAPI設定（実際のトークンは後で設定）
const NOTION_TOKEN = process.env.NOTION_TOKEN || '';
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || '';

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
    skipTaskbar: true
  });

  mainWindow.loadFile('src/index.html');
  
  // ウィンドウを閉じても完全終了しない
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  // シンプルなアイコンを作成
  const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'カウンター表示',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: '終了',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('作業カウンター');
  tray.setContextMenu(contextMenu);
  
  // トレイアイコンクリックでウィンドウ表示
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.whenReady().then(() => {
  createMainWindow();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC通信ハンドラー
ipcMain.handle('get-categories', () => {
  return store.get('categories', []);
});

ipcMain.handle('save-category', (event, category) => {
  const categories = store.get('categories', []);
  categories.push(category);
  store.set('categories', categories);
  return categories;
});

ipcMain.handle('increment-count', async (event, categoryId) => {
  const today = new Date().toISOString().split('T')[0];
  const countKey = `counts.${today}.${categoryId}`;
  const currentCount = store.get(countKey, 0);
  const newCount = currentCount + 1;
  
  store.set(countKey, newCount);
  
  // Notionにも保存（オプション）
  if (NOTION_TOKEN && NOTION_DATABASE_ID) {
    await saveToNotion(categoryId, today, newCount);
  }
  
  return newCount;
});

ipcMain.handle('decrement-count', async (event, categoryId) => {
  const today = new Date().toISOString().split('T')[0];
  const countKey = `counts.${today}.${categoryId}`;
  const currentCount = store.get(countKey, 0);
  const newCount = Math.max(0, currentCount - 1);
  
  store.set(countKey, newCount);
  
  // Notionにも保存（オプション）
  if (NOTION_TOKEN && NOTION_DATABASE_ID) {
    await saveToNotion(categoryId, today, newCount);
  }
  
  return newCount;
});

ipcMain.handle('get-today-counts', () => {
  const today = new Date().toISOString().split('T')[0];
  const allCounts = store.get('counts', {});
  return allCounts[today] || {};
});

ipcMain.handle('get-history', () => {
  return store.get('counts', {});
});

// Notion API連携関数
async function saveToNotion(categoryId, date, count) {
  try {
    const axios = require('axios');
    
    const response = await axios.post(`https://api.notion.com/v1/pages`, {
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        'Category': {
          title: [
            {
              text: {
                content: categoryId
              }
            }
          ]
        },
        'Date': {
          date: {
            start: date
          }
        },
        'Count': {
          number: count
        }
      }
    }, {
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      }
    });
    
    console.log('Notion sync successful:', response.data);
  } catch (error) {
    console.error('Notion sync failed:', error.message);
  }
}
