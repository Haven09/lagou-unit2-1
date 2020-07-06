#!/usr/bin/env node
//hz-cli入口文件

const inquirer = require('inquirer')
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
const { log } = require('console')

const cwd = process.cwd()

inquirer.prompt([
  {
    type: 'input',
    name: 'projectName',
    message: 'input your projectName',
    default: path.win32.basename(cwd)
  },
  {
    type: 'input',
    name: 'user',
    message: 'input your name',
    default: 'user'
  }
]).then((answer => {
  const tpl = path.join(__dirname, '..', 'temp')

  function getDirFiles(dir) {
    let arr = []
    const files = fs.readdirSync(dir, { withFileTypes: true })
    files.forEach(file => {
      if (file.isFile()) {
        arr.push(path.join(dir, file.name))
      } else {
        arr = arr.concat([], getDirFiles(path.join(dir, file.name)))
      }
    });
    return arr
  }

  getDirFiles(tpl).map(file => {
    const filePath = path.join(cwd, file.replace(tpl, ''), '..')

    ejs.renderFile(file, answer, (err, str) => {
      if (err) throw err

      fs.stat(filePath, (err, stats) => {
        if (!stats) {
          //mkdir在node v10之后支持recursive属性，此处有待优化兼容性
          fs.mkdirSync(filePath, { recursive: true })
        }
        fs.writeFileSync(path.join(cwd, file.replace(tpl, '')), str)
      })
    })
  })

}))

