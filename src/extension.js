const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT_PATH = vscode.workspace.rootPath;
const IGNORE_EXT = new Array('bmp', 'jpg', 'jpeg', 'png', 'gif', 'mp3', 'mp4', 'zip', 'rar');

function formatCurrentFile() {
  return new Promise((resolve, reject) => {
    vscode.commands.executeCommand('editor.action.formatDocument').then(() => {
      vscode.commands.executeCommand('workbench.action.nextEditor').then(() => {
        resolve();
      });
    }, () => {
      vscode.commands.executeCommand('workbench.action.nextEditor').then(() => {
        resolve();
      });
    });
  });
}

function getIgnoreFile(ignoreFile) {
  let ignoreFileArr = ['node_modules', 'vendor'];
  if (fs.existsSync(ignoreFile)) {
    let fileData = fs.readFileSync(ignoreFile, 'utf-8');
    ignoreFileArr = fileData.split('\n');
  }
  return ignoreFileArr;
}

function getFiles(rootPath, callback) {
  // 根据 .gitignore 读取忽略文件
  const ignoreFileArr = getIgnoreFile(path.join(rootPath, '.gitignore'));
  let ignoreFileStr = ignoreFileArr.join('');
  try {
    fs.readdirSync(rootPath).forEach(fileName => {
      if (ignoreFileStr.includes(fileName)) return;
      let filedir = path.join(rootPath, fileName);
      let fileStat = fs.statSync(filedir);
      if (fileStat.isFile()) {
        let ext = fileName.split('.').pop();
        if (!IMG_EXT_ARR.includes(ext)) {
          callback(filedir);
        }
      } else if (fileStat.isDirectory()) {
        getFiles(filedir, callback);
      }
    });
  } catch (error) {
    vscode.window.showInformationMessage(error);
  }

}

function activate(context) {
  let disposable = vscode.commands.registerCommand('extension.batchFormatFiles', function () {
    let counter = 0;
    getFiles(ROOT_PATH, url => {
      counter++;
      vscode.commands.executeCommand('vscode.open', vscode.Uri.file(url));
      vscode.commands.executeCommand('workbench.action.keepEditor');
    });
    let formatFunArr = [];
    for (let i = 0; i <= counter; i++) {
      formatFunArr.push(formatCurrentFile);
    }
    formatFunArr.reduce((prev, cur) => prev.then(() => cur()), Promise.resolve());
  });
  context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;