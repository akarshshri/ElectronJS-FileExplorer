//Initializing MaterialCSS
M.AutoInit();

const ipcRenderer = require('electron').ipcRenderer
const path = require('path')
const fs = require ('fs')

//DOM Elements
//id selection
const folderSection = document.getElementById('folder-section');
const backBtn = document.getElementById('back-btn');
const upBtn = document.getElementById('up-btn');
const loadingIcon = document.getElementById('loading-icon');
const empltyFolderIcon = document.getElementById('empty-folder-icon');
//class selection
const folderItem = document.getElementsByClassName('folder-item');
const menubarBtn = document.getElementsByClassName('menubar-btn');

//Data
var currentDir = 'C:\\'
var previousDir = []

ipcRenderer.on('async-reply',(event,reply) =>{
    console.log(reply)
})

ipcRenderer.send('async-message','ping')

const readFolderBtn = document.getElementById('read-folder-btn')
const folderPathTxt = document.getElementById('folder-location-txt')

readFolderBtn.addEventListener('click',()=>{
    //add reload animation
    //add validator for same current and previous folder
    //If the same don't overwrite PreviousDir with CurrentDir
    if(folderPathTxt.value === currentDir) return;
    console.log(folderPathTxt.value)
    clearFoldersSection();
    ipcRenderer.send('read-folder', folderPathTxt.value)
    startLoadingAnimation()
})

ipcRenderer.on('folder-details',(event,reply)=>{
    
    let res = JSON.parse(reply)
    console.log(res)
    clearFoldersSection(res);
    stopLoadingAnimation();
    empltyFolderIcon.hidden = true;

    if(res.folders.length == 0 && res.files.length ==0){
        folderSection.hidden = true;
        empltyFolderIcon.hidden = false;
    }

    console.log('List Folders')
    for(const folder of res.folders){
        const element = document.createElement('a')
        const icon = document.createElement('span')
        const dirName = document.createElement('span')
        dirName.innerText = '' + folder
        icon.innerText = '📁 '
        element.appendChild(icon)
        element.appendChild(dirName)
        element.setAttribute('href','#')
        element.setAttribute('class','collection-item folder-item')
        folderSection.appendChild(element)
        //Adding Event for directory click
        element.addEventListener('click',(e)=>{
/* 
            save
            update
            remove
            list
             */
            previousDir.push(currentDir);
            currentDir = path.join(currentDir,dirName.innerText)
            e.preventDefault()
            ipcRenderer.send('read-folder',currentDir)
            folderPathTxt.value = currentDir
            startLoadingAnimation()
            console.log(`changind dir: ${currentDir}`)
        })
    }
    console.log('List Files')
    for(const file of res.files){
        const element = document.createElement('a')
        const icon = document.createElement('span')
        const fileName = document.createElement('span')
        fileName.innerText = ' ' + file
        icon.innerText = '📃 ;'
        element.appendChild(icon)
        element.appendChild(fileName)
        element.setAttribute('href','#')
        element.setAttribute('class','collection-item folder-item fa')
        folderSection.appendChild(element)
        element.addEventListener('click',(e)=>{
            e.preventDefault()
            console.log(`opening file: ${fileName.innerText}`)
        })
    }
})

var clearFoldersSection = () => {
    for(let i=0;i<folderSection.children.length;){
        folderSection.removeChild(folderSection.children[i])
    }
}

const addEventToItems = ()=>{
    for(const item of folderItem){
        item.addEventListener('click',(e)=>{
            e.preventDefault()
            console.log(`Clicked: ${item.innerText}`)
        })
    }
}

backBtn.addEventListener('click',(e)=>{
    if(previousDir.length == 0) return;

    //heading back to previous directory
    currentDir = previousDir.pop()
    ipcRenderer.send('read-folder',currentDir)
    folderPathTxt.value = currentDir
})

upBtn.addEventListener('click',(e)=>{
    if(currentDir.toLocaleLowerCase() === 'c:\\') return;

    //heading back to previous directory
    previousDir.push(currentDir)
    currentDir = path.dirname(currentDir)
    ipcRenderer.send('read-folder', currentDir)
    folderPathTxt.value = currentDir
    console.log(`heading to: ${currentDir}`)
})

const readFolder = (folderPath) =>{
    ipcRenderer.send(`read-folder`,folderPath)
}

const startLoadingAnimation = ()=>{
    folderSection.hidden = true
    loadingIcon.hidden = false
}

const stopLoadingAnimation = ()=>{
    folderSection.hidden = false
    loadingIcon.hidden = true
}

//Loading base folder contents
ipcRenderer.send('read-folder',currentDir)

document.addEventListener('DOMContentLoaded',function(){
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init( elems,{
        hoverEnabled:false
    });
});

const mkdir = ()=>{
    var currentdate  = new Date();
    currentdate  = currentdate.getDate()
     + (currentdate.getMonth()+1)
     + currentdate.getFullYear()  
     + currentdate.getHours() 
     + currentdate.getMinutes() 
     + currentdate.getSeconds();
    let text = currentdate.toString();
    text = text.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, '');
    //console.log(currentdate)

    fs.mkdir(path.join(folderPathTxt.value, text), (err) => {
        if (err) {
            return console.error(err);
        }
        console.log('Directory created successfully! Folder Name: '+ text + ' at '+ folderPathTxt.value);
    });

};

const mkfile = ()=>{

      var currentdate  = new Date();
    currentdate  = currentdate.getDate()
     + (currentdate.getMonth()+1)
     + currentdate.getFullYear()  
     + currentdate.getHours() 
     + currentdate.getMinutes() 
     + currentdate.getSeconds();
    let text = currentdate.toString();
    text = text.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, '');
    
    fs.open(folderPathTxt.value, 'w', function (err, file) {
        if (err) throw err;
        console.log('New file Created!');
    });

}