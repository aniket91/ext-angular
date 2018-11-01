//**********
export function _constructor(options) {
  var thisVars = {}
  var thisOptions = {}
  var plugin = {}

  if (options.framework == undefined) {
    thisVars.pluginErrors = []
    thisVars.pluginErrors.push('webpack config: framework parameter on ext-webpack-plugin is not defined - values: react, angular, extjs')
    plugin.vars = thisVars
    return plugin
  }

  const validateOptions = require('schema-utils')
  validateOptions(require(`./${options.framework}Util`).getValidateOptions(), options, '')

  thisVars = require(`./${options.framework}Util`).getDefaultVars()
  thisVars.framework = options.framework
  switch(thisVars.framework) {
    case 'extjs':
      thisVars.pluginName = 'ext-webpack-plugin'
      break;
    case 'react':
      thisVars.pluginName = 'ext-react-webpack-plugin'
      break;
    case 'angular':
      thisVars.pluginName = 'ext-angular-webpack-plugin'
      break;
    default:
      thisVars.pluginName = 'ext-webpack-plugin'
  }
  thisVars.app = require('./pluginUtil')._getApp()
  logv(options, `pluginName - ${thisVars.pluginName}`)
  logv(options, `thisVars.app - ${thisVars.app}`)
  const fs = require('fs')
  const rc = (fs.existsSync(`.ext-${thisVars.framework}rc`) && JSON.parse(fs.readFileSync(`.ext-${thisVars.framework}rc`, 'utf-8')) || {})
  thisOptions = { ...require(`./${thisVars.framework}Util`).getDefaultOptions(), ...options, ...rc }
  logv(options, `thisOptions - ${JSON.stringify(thisOptions)}`)
  if (thisOptions.environment == 'production') 
    {thisVars.production = true}
  else 
    {thisVars.production = false}
  log(require('./pluginUtil')._getVersions(thisVars.app, thisVars.pluginName, thisVars.framework))
  log(thisVars.app + 'Building for ' + thisOptions.environment)

  plugin.vars = thisVars
  plugin.options = thisOptions
  return plugin
}

//**********
export function _compilation(compiler, compilation, vars, options) {
  try {
    require('./pluginUtil').logv(options,'FUNCTION _compilation')
    if (vars.production) {
      logv(options,`ext-compilation: production is ` +  vars.production)
      compilation.hooks.succeedModule.tap(`ext-succeed-module`, (module) => {
        if (module.resource && module.resource.match(/\.(j|t)sx?$/) && !module.resource.match(/node_modules/) && !module.resource.match(`/ext-{$options.framework}/dist/`) && !module.resource.match(`/ext-${options.framework}-${options.toolkit}/`)) {
          vars.deps = [ 
            ...(vars.deps || []), 
            ...require(`./${vars.framework}Util`).extractFromSource(module, options, compilation) 
          ]
        }
      })
    }
    else {
      logv(options,`ext-compilation: production is ` +  vars.production)
    }
    if (options.framework != 'angular') {
      compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tap(`ext-html-generation`,(data) => {
        logv(options,'HOOK ext-html-generation')
        const path = require('path')
        var outputPath = ''
        if (compiler.options.devServer) {
          if (compiler.outputPath === '/') {
            outputPath = path.join(compiler.options.devServer.contentBase, outputPath)
          }
          else {
            if (compiler.options.devServer.contentBase == undefined) {
              outputPath = 'build'
            }
            else {
              outputPath = ''
            }
          }
        }
        else {
          outputPath = 'build'
        }
        outputPath = outputPath.replace(process.cwd(), '').trim()
        var jsPath = path.join(outputPath, vars.extPath, 'ext.js')
        var cssPath = path.join(outputPath, vars.extPath, 'ext.css')
        data.assets.js.unshift(jsPath)
        data.assets.css.unshift(cssPath)
        log(vars.app + `Adding ${jsPath} and ${cssPath} to index.html`)
      })
    }
    else {
      logv(options,'skipped HOOK ext-html-generation')
    }
  }
  catch(e) {
    require('./pluginUtil').logv(options,e)
    compilation.errors.push('_compilation: ' + e)
  }
}

//**********
export async function emit(compiler, compilation, vars, options, callback) {
  try {
    const log = require('./pluginUtil').log
    const logv = require('./pluginUtil').logv
    logv(options,'FUNCTION emit')
    var app = vars.app
    var framework = vars.framework
    const path = require('path')
    const _buildExtBundle = require('./pluginUtil')._buildExtBundle
    let outputPath = path.join(compiler.outputPath,vars.extPath)
    if (compiler.outputPath === '/' && compiler.options.devServer) {
      outputPath = path.join(compiler.options.devServer.contentBase, outputPath)
    }
    logv(options,'outputPath: ' + outputPath)
    logv(options,'framework: ' + framework)
    if (options.emit == true) {
      if (framework != 'extjs') {
        _prepareForBuild(app, vars, options, outputPath, compilation)
      }
      else {
        require(`./${framework}Util`)._prepareForBuild(app, vars, options, outputPath, compilation)
      }

      var command = ''
      if (options.watch == 'yes') {
        command = 'watch'
      }
      else {
        command = 'build'
      }

      if (vars.rebuild == true) {
        var parms = []
        if (options.profile == undefined || options.profile == '' || options.profile == null) {
          parms = ['app', command, options.environment]
        }
        else {
          parms = ['app', command, options.profile, options.environment]
        }
        await _buildExtBundle(app, compilation, outputPath, parms, options)

        //const jsChunk = compilation.addChunk(`ext-angular-js`)
        //jsChunk.hasRuntime = jsChunk.isInitial = () => true;
        //jsChunk.files.push(path.join('build', 'ext-angular', 'ext.js'));
        //jsChunk.files.push(path.join('build', 'ext-angular',  'ext.css'));
        //jsChunk.id = -2; // this forces html-webpack-plugin to include ext.js first

        if(options.browser == true && options.watch == 'yes') {
          if (vars.browserCount == 0 && compilation.errors.length == 0) {
            var url = 'http://localhost:' + options.port
            log(app + `Opening browser at ${url}`)
            vars.browserCount++
            const opn = require('opn')
            opn(url)
          }
        }
        else {
          logv(options,'browser NOT opened')
        }
        callback()
      }
      else {
        callback()
      }
    }
    else {
      log(`${vars.app}FUNCTION emit not run`)
      if(options.browser == true) {
        if (vars.browserCount == 0 && options.watch == 'yes') {
          var url = 'http://localhost:' + options.port
          log(app + `Opening browser at ${url}`)
          vars.browserCount++
          const opn = require('opn')
          opn(url)
        }
      }
      else {
        logv(options,'browser NOT opened')
      }
      callback()
    }
  }
  catch(e) {
    require('./pluginUtil').logv(options,e)
    compilation.errors.push('emit: ' + e)
    callback()
  }
}

//**********
export function _prepareForBuild(app, vars, options, output, compilation) {
  try {
    logv(options,'FUNCTION _prepareForBuild')
    const rimraf = require('rimraf')
    const mkdirp = require('mkdirp')
    const fsx = require('fs-extra')
    const fs = require('fs')
    const path = require('path')

    var packages = options.packages
    var toolkit = options.toolkit
    var theme = options.theme

    theme = theme || (toolkit === 'classic' ? 'theme-triton' : 'theme-material')
    logv(options,'firstTime: ' + vars.firstTime)
    if (vars.firstTime) {
      rimraf.sync(output)
      mkdirp.sync(output)
      const buildXML = require('./artifacts').buildXML
      const createAppJson = require('./artifacts').createAppJson
      const createWorkspaceJson = require('./artifacts').createWorkspaceJson
      const createJSDOMEnvironment = require('./artifacts').createJSDOMEnvironment

      fs.writeFileSync(path.join(output, 'build.xml'), buildXML(vars.production, options), 'utf8')
      fs.writeFileSync(path.join(output, 'app.json'), createAppJson(theme, packages, toolkit, options), 'utf8')
      fs.writeFileSync(path.join(output, 'jsdom-environment.js'), createJSDOMEnvironment(options), 'utf8')
      fs.writeFileSync(path.join(output, 'workspace.json'), createWorkspaceJson(options), 'utf8')

      if (fs.existsSync(path.join(process.cwd(),'resources/'))) {
        var fromResources = path.join(process.cwd(), 'resources/')
        var toResources = path.join(output, '../resources')
        fsx.copySync(fromResources, toResources)
        log(app + 'Copying ' + fromResources.replace(process.cwd(), '') + ' to: ' + toResources.replace(process.cwd(), ''))
      }

      if (fs.existsSync(path.join(process.cwd(),'resources/'))) {
        var fromResources = path.join(process.cwd(), 'resources/')
        var toResources = path.join(output, 'resources')
        fsx.copySync(fromResources, toResources)
        log(app + 'Copying ' + fromResources.replace(process.cwd(), '') + ' to: ' + toResources.replace(process.cwd(), ''))
      }
    }
    vars.firstTime = false
    var js = ''
    if (vars.production) {
      vars.deps.push('Ext.require("Ext.layout.*");\n')
      js = vars.deps.join(';\n');
    }
    else {
      js = 'Ext.require("Ext.*")'
    }
    if (vars.manifest === null || js !== vars.manifest) {
      vars.manifest = js
      const manifest = path.join(output, 'manifest.js')
      fs.writeFileSync(manifest, js, 'utf8')
      vars.rebuild = true
      log(app + 'Building Ext bundle at: ' + output.replace(process.cwd(), ''))
    }
    else {
      vars.rebuild = false
      log(app + 'Ext rebuild NOT needed')
    }
  }
  catch(e) {
    require('./pluginUtil').logv(options,e)
    compilation.errors.push('_prepareForBuild: ' + e)
  }
}

//**********
export function _buildExtBundle(app, compilation, outputPath, parms, options) {
  try {
    const fs = require('fs')
    const logv = require('./pluginUtil').logv
    logv(options,'FUNCTION _buildExtBundle')

    let sencha; try { sencha = require('@sencha/cmd') } catch (e) { sencha = 'sencha' }
    if (fs.existsSync(sencha)) {
      logv(options,'sencha folder exists')
    }
    else {
      logv(options,'sencha folder DOES NOT exist')
    }

    return new Promise((resolve, reject) => {
      const onBuildDone = () => {
        logv(options,'onBuildDone')
        resolve()
      }

      var opts = { cwd: outputPath, silent: true, stdio: 'pipe', encoding: 'utf-8'}
      executeAsync(app, sencha, parms, opts, compilation, options).then (
        function() { onBuildDone() }, 
        function(reason) { reject(reason) }
      )
    })
  }
  catch(e) {
    require('./pluginUtil').logv(options,e)
    compilation.errors.push('_buildExtBundle: ' + e)
    callback()
  }
}

//**********
export async function executeAsync (app, command, parms, opts, compilation, options) {
  try {
    //const DEFAULT_SUBSTRS = ['[INF] Loading', '[INF] Processing', '[LOG] Fashion build complete', '[ERR]', '[WRN]', "[INF] Server", "[INF] Writing", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];
    const DEFAULT_SUBSTRS = ['[INF] Loading', '[INF] Append', '[INF] Processing', '[INF] Processing Build', '[LOG] Fashion build complete', '[ERR]', '[WRN]', "[INF] Server", "[INF] Writing", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];
    var substrings = DEFAULT_SUBSTRS 
    var chalk = require('chalk')
    const crossSpawn = require('cross-spawn')
    const log = require('./pluginUtil').log
    logv(options, 'FUNCTION executeAsync')
    await new Promise((resolve, reject) => {
      logv(options,`command - ${command}`)
      logv(options, `parms - ${parms}`)
      logv(options, `opts - ${JSON.stringify(opts)}`)
      let child = crossSpawn(command, parms, opts)
      child.on('close', (code, signal) => {
        logv(options, `on close: ` + code) 
        if(code === 0) { resolve(0) }
        else { compilation.errors.push( new Error(code) ); resolve(0) }
      })
      child.on('error', (error) => { 
        logv(options, `on error`) 
        compilation.errors.push(error)
        resolve(0)
      })
      child.stdout.on('data', (data) => {
        var str = data.toString().replace(/\r?\n|\r/g, " ").trim()
        logv(options, `${str}`)
        if (data && data.toString().match(/waiting for changes\.\.\./)) {
          resolve(0)
        }
        else {
          if (substrings.some(function(v) { return data.indexOf(v) >= 0; })) { 
            str = str.replace("[INF]", "")
            str = str.replace("[LOG]", "")
            str = str.replace(process.cwd(), '').trim()
            if (str.includes("[ERR]")) {
              compilation.errors.push(app + str.replace(/^\[ERR\] /gi, ''));
              str = str.replace("[ERR]", `${chalk.red("[ERR]")}`)
            }
            log(`${app}${str}`) 
          }
        }
      })
      child.stderr.on('data', (data) => {
        logv(options, `error on close: ` + data) 
        var str = data.toString().replace(/\r?\n|\r/g, " ").trim()
        var strJavaOpts = "Picked up _JAVA_OPTIONS";
        var includes = str.includes(strJavaOpts)
        if (!includes) {
          console.log(`${app} ${chalk.red("[ERR]")} ${str}`)
        }
      })
    })
  }
  catch(e) {
    require('./pluginUtil').logv(options,e)
    compilation.errors.push('executeAsync: ' + e)
    callback()
  } 
}


export function log(s) {
  require('readline').cursorTo(process.stdout, 0)
  try {
    process.stdout.clearLine()
  }
  catch(e) {}
  process.stdout.write(s)
  process.stdout.write('\n')
}

export function logv(options, s) {
  if (options.verbose == 'yes') {
    require('readline').cursorTo(process.stdout, 0)
    try {
      process.stdout.clearLine()
    }
    catch(e) {}
    process.stdout.write(`-verbose: ${s}`)
    process.stdout.write('\n')
  }
}

export function _getApp() {
  var chalk = require('chalk')
  var prefix = ``
  const platform = require('os').platform()
  if (platform == 'darwin') { prefix = `ℹ ｢ext｣:` }
  else { prefix = `i [ext]:` }
  return `${chalk.green(prefix)} `
}

export function _getVersions(app, pluginName, frameworkName) {
  const path = require('path')
  const fs = require('fs')

  var v = {}
  var pluginPath = path.resolve(process.cwd(),'node_modules/@sencha', pluginName)
  var pluginPkg = (fs.existsSync(pluginPath+'/package.json') && JSON.parse(fs.readFileSync(pluginPath+'/package.json', 'utf-8')) || {});
  v.pluginVersion = pluginPkg.version

  var webpackPath = path.resolve(process.cwd(),'node_modules/webpack')
  var webpackPkg = (fs.existsSync(webpackPath+'/package.json') && JSON.parse(fs.readFileSync(webpackPath+'/package.json', 'utf-8')) || {});
  v.webpackVersion = webpackPkg.version

  var extPath = path.resolve(process.cwd(),'node_modules/@sencha/ext')
  var extPkg = (fs.existsSync(extPath+'/package.json') && JSON.parse(fs.readFileSync(extPath+'/package.json', 'utf-8')) || {});
  v.extVersion = extPkg.sencha.version

  var cmdPath = path.resolve(process.cwd(),`node_modules/@sencha/cmd`)
  var cmdPkg = (fs.existsSync(cmdPath+'/package.json') && JSON.parse(fs.readFileSync(cmdPath+'/package.json', 'utf-8')) || {});
  v.cmdVersion = cmdPkg.version_full

  if (v.cmdVersion == undefined) {
    var cmdPath = path.resolve(process.cwd(),`node_modules/@sencha/${pluginName}/node_modules/@sencha/cmd`)
    var cmdPkg = (fs.existsSync(cmdPath+'/package.json') && JSON.parse(fs.readFileSync(cmdPath+'/package.json', 'utf-8')) || {});
    v.cmdVersion = cmdPkg.version_full
  }

  var frameworkInfo = ''
   if (frameworkName != undefined && frameworkName != 'extjs') {
    var frameworkPath = ''
    if (frameworkName == 'react') {
      frameworkPath = path.resolve(process.cwd(),'node_modules/react')
    }
    if (frameworkName == 'angular') {
      frameworkPath = path.resolve(process.cwd(),'node_modules/@angular/core')
    }
    var frameworkPkg = (fs.existsSync(frameworkPath+'/package.json') && JSON.parse(fs.readFileSync(frameworkPath+'/package.json', 'utf-8')) || {});
    v.frameworkVersion = frameworkPkg.version
    frameworkInfo = ', ' + frameworkName + ' v' + v.frameworkVersion
  }

  return app + 'ext-webpack-plugin v' + v.pluginVersion + ', Ext JS v' + v.extVersion + ', Sencha Cmd v' + v.cmdVersion + ', webpack v' + v.webpackVersion + frameworkInfo
}