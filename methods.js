const fs       = require('fs');
const path     = require('path');
const terminal = require('child_process');

function copyFileSync(source, target) {

  let targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderContentSync(source, targetFolder) {
  const files = fs.readdirSync(source);
  files.forEach(function (file) {
    const curSource = path.join(source, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, targetFolder);
    } else {
      copyFileSync(curSource, targetFolder);
    }
  });
}

function copyFolderRecursiveSync(source, target) {
  const targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder))       fs.mkdirSync(targetFolder);
  if (fs.lstatSync(source).isDirectory()) copyFolderContentSync(source, targetFolder);
}

function createDirectoryIfDoesntExists(type, base, name){
  let path = `${base}/${type}s`;
  if (!fs.existsSync(path)) fs.mkdirSync(path);
  path += "/"+name;
  if (!fs.existsSync(path)) fs.mkdirSync(path);
  return path;
}

function executeTask(command, message){
  console.log(new Date().toLocaleString(), ":", message)
  terminal.execSync(command);
  console.log(new Date().toLocaleString(), ":", message,": OK")
}

function firstUpperCase(str){
  return str.charAt(0).toUpperCase()+str.slice(1);
}

function getCurrentFolder() {
  const splitter = process.platform === "win32" ? "\\" : "/";
  return process.cwd().split(splitter).pop();
}

function getFoldersList(){
  const source = "./templates"
  const files  = fs.readdirSync(source);
  return files.filter(file=>{
    return fs.lstatSync(path.join(source, file)).isDirectory() ? file: false;
  });
}

function normalizeProjectNameForNpm(folderName){
  return folderName
    .toLowerCase()
    .replace(" ","_")
}

/**
 * [renameFiles description]
 *
 * @param   {Object}  args
 * @param   {String}  args.path
 * @param   {String}  args.typeLower
 * @param   {String}  args.typeFirstUpperCase
 * @param   {String}  args.newNameLower
 * @param   {String}  args.newNameFirstUpperCase
 *
 * @return  {Array}
 */
function renameFiles({path, typeLower, typeFirstUpperCase, newNameLower, newNameFirstUpperCase}){
  const files                          = fs.readdirSync(path);
  if    (path.slice(-1) !== "!") path += "/";
  for (const file of files){
    if (file.includes(typeLower))          fs.renameSync(path+file, path+file.replace(typeLower, newNameLower));
    if (file.includes(typeFirstUpperCase)) fs.renameSync(path+file, path+file.replace(typeFirstUpperCase, newNameFirstUpperCase));
  }
  return fs.readdirSync(path);
}

function replaceInFile(fileName, stringToReplace, replacementString) {
  const content = fs.readFileSync(fileName, 'utf8').toString();
  const result  = content.replace(new RegExp(stringToReplace, 'g'), replacementString);
  fs.writeFileSync(fileName, result, 'utf8');
}

/**
 * [renameFiles description]
 *
 * @param   {Object}  args
 * @param   {Array}   args.files
 * @param   {String}  args.newNameFirstUpperCase
 * @param   {String}  args.newNameLower
 * @param   {String}  args.path
 * @param   {String}  args.textLower
 * @param   {String}  args.textFirstUpperCase
 *
 * @return  {void}
 */
function updateContent({files, path, textLower, textFirstUpperCase, newNameLower, newNameFirstUpperCase}){
  if (path.slice(-1) !== "/") path += "/";
  for (const file of files){
    console.log(path);
    replaceInFile(path+file, textLower, newNameLower);
    replaceInFile(path+file, textFirstUpperCase, newNameFirstUpperCase);
  }
}

module.exports = {
  copyFolderContentSync,
  createDirectoryIfDoesntExists,
  executeTask,
  firstUpperCase,
  getCurrentFolder,
  getFoldersList,
  normalizeProjectNameForNpm,
  renameFiles,
  replaceInFile,
  updateContent
}