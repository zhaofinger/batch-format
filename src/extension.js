const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const ROOT_PATH = vscode.workspace.rootPath;

function formatCurrentFile() {
  return new Promise((resolve, reject) => {
    vscode.commands.executeCommand('editor.action.formatDocument').then(() => {
      vscode.commands.executeCommand('workbench.action.nextEditor').then(() => {
        resolve();
      });
    });
  });
}

function getFiles(rootPath, callback) {
  fs.readdirSync(rootPath).forEach(fileName => {
    let filedir = path.join(rootPath, fileName);
    let fileStat = fs.statSync(filedir);
    if (fileStat.isFile()) {
      callback(filedir);
    } else if (fileStat.isDirectory()) {
      getFiles(filedir, callback);
    }
  });
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
    vscode.window.showInformationMessage(formatFunArr.length + '');
  });
  context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;