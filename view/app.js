const {app,BrowserWindow} = require('electron');
const path = require('path');
const fs = require('fs');
const ipcMain = require('electron').ipcMain

const defaultDir = "C:\\";

function createWindow(){
    //Create the browser window
   let mainWindow = new BrowserWindow({
        width: 1200,
        height: 700,
        title: 'Add Shopping List Item',
        frame:true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    console.log(`CWD: ${__dirname}`);

    //and load the index.html file using absolute file path of the app
    mainWindow.loadFile(getFile('/main.html'));

}

app.whenReady().then(createWindow);

app.on('window-all-closed',function(){
    if(process.platform != 'darwin') app.quit()
})

app.on('activate', function(){
    if(BrowserWindow.getAllWindows().length === 0) createWindow()
})

//get files using absolute file path
function getFile(filePath){
    return path.join(__dirname,filePath);
}

ipcMain.on('async-message',(event,args) =>{
    console.log(args)
    event.reply('async-reply','pong')
})

ipcMain.on('read-folder',(event,args)=>{
    console.log(`args: ${args}`)
    const currentDir = args? args:defaultDir;
    const foldersInDir = fs.readdirSync(currentDir)

    let folders = [];
    let files = [];

    for(const ele of foldersInDir){
        try{
            fs.readdirSync(path.join(currentDir,ele))
            folders.push(ele)
        }catch(error){
            if(error.code === 'ENOTDIR'){
                files.push(ele)
            }
        }
    }
    
    event.reply('folder-details', JSON.stringify({
        'folders':folders,
        'files': files
    }))
    
})