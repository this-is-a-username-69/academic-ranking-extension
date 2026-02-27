import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { runMigrations } from './database/migrate'
import { seedSuperAdmin } from './database/seed'
import { registerAuthIpc } from './ipc/auth.ipc'
import { registerScoresIpc } from './ipc/scores.ipc'
import { registerRankingIpc } from './ipc/ranking.ipc'
import { registerStudentsIpc } from './ipc/students.ipc'
import { registerUsersIpc } from './ipc/users.ipc'
import { registerAcademicCriteriaIpc } from './ipc/academic-criteria.ipc'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Chạy migration khi app khởi động
  runMigrations()
  seedSuperAdmin()
  registerAuthIpc()
  registerScoresIpc()
  registerRankingIpc()
  registerStudentsIpc()
  registerUsersIpc()
  registerAcademicCriteriaIpc()
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
