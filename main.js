const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const globby = require('globby');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1200, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  
  let menuTemplate = [
    {
      label: 'Application',
      accelerator: 'Alt+A',
      submenu: [
        {
          label: 'API key',
          accelerator: 'CmdOrCtrl+K',
          click: function(item, focusedWindow) {
            focusedWindow.send('changeAPIKey');
          }
        },
        {
          role: 'close'
        }
      ]
    },
    {
      label: 'Templates',
      accelerator: 'Alt+T',
      submenu: []
    }
  ];

  globby(['./templates/*/template.ejs']).then(function(paths) {
    for (let key in paths) {
      let theme = paths[key].replace(/^\.\/templates\/(.+)\/template\.ejs$/, "$1").trim();
      menuTemplate[1].submenu.push({
          label: theme,
          checked: false,
          type: 'checkbox',
          click: function(item, focusedWindow) {
            focusedWindow.send('changeTemplate', item.label);
          }
      });
    }

    mainWindow.setMenu(electron.Menu.buildFromTemplate(menuTemplate));
  });

  electron.ipcMain.on('updateMenu', function(e, template) {
    for (let loopItem in menuTemplate[1].submenu) {
      menuTemplate[1].submenu[loopItem].checked = (menuTemplate[1].submenu[loopItem].label === template);
      mainWindow.setMenu(electron.Menu.buildFromTemplate(menuTemplate));
    }
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
