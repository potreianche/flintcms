const sass = require('node-sass');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const chokidar = require('chokidar');
const scaffold = require('./scaffold');
const { promisify } = require('util');
const log = require('debug')('flint:scss');
const mongoose = require('mongoose');

const writeFileAsync = promisify(fs.writeFile);

function sassAsync(opt) {
  return new Promise((resolve, reject) => {
    sass.render(opt, (err, res) => {
      /* istanbul ignore if */
      if (err) reject(err);
      resolve(res);
    });
  });
}

function generateHash(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let retVal = '';

  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

async function handleCacheBusting() {
  const filename = global.FLINT.scssEntryPoint.replace('.scss', '.css');
  if (!global.FLINT.enableCacheBusting) return filename;

  const Site = mongoose.model('Site');

  const cssHash = generateHash();
  global.FLINT.cssHash = cssHash;
  const site = await Site.findOne().exec();
  const updatedSite = await Site.findByIdAndUpdate(site._id, { cssHash }, { new: true }).exec();

  /* istanbul ignore if */
  if (!updatedSite) throw new Error('Could not save the site config to the database.');

  return filename.replace('.css', `-${cssHash}.css`);
}

/**
 * Actually compiles the SCSS
 * @param {object} opts - Compile options
 */
async function compile() {
  /* istanbul ignore next */
  const outputStyle = process.env.NODE_ENV === 'production' ? 'compressed' : 'nested';

  const opts = {
    file: path.join(global.FLINT.scssPath, global.FLINT.scssEntryPoint),
    includePaths: global.FLINT.scssIncludePaths,
    outputStyle,
  };

  try {
    const scss = await sassAsync(opts);
    const filename = await handleCacheBusting();
    const pathToFile = path.join(await scaffold(global.FLINT.publicPath), filename);

    await writeFileAsync(pathToFile, scss.css);
    return `${chalk.grey('[SCSS]')} Your SCSS has been compiled to ${pathToFile}`;
  } catch (e) /* istanbul ignore next */ {
    log(`  ${chalk.grey('Message:')} ${chalk.red(e.message)}`);
    log(`  ${chalk.grey('Line:')} ${chalk.red(e.line)}`);
    log(`  ${chalk.grey('File:')} ${chalk.red(e.file)}`);

    return `${chalk.red('[SCSS]')} There was an error compiling your SCSS.`;
  }
}

/* istanbul ignore next */
function recompile() {
  // eslint-disable-next-line no-console
  log(chalk.cyan('Recompiling SASS...'));
  return compile();
}

/* istanbul ignore next */
function watch(watcher) {
  watcher.on('add', async () => {
    const compiled = await recompile();
    log(compiled); // eslint-disable-line no-console
  });
  watcher.on('change', async () => {
    const compiled = await recompile();
    log(compiled); // eslint-disable-line no-console
  });
}

/**
 * Compiles SASS using the scssEntryPoint config
 */
async function compileSass() {
  if (global.FLINT.scssEntryPoint) {
    /* istanbul ignore if */
    if (global.FLINT.debugMode) {
      const watcher = chokidar.watch(global.FLINT.scssPath, {
        persistent: true,
        ignoreInitial: true,
      });

      watch(watcher);
    }

    return compile();
  }

  return chalk.grey('SCSS compiling has been disabled in the site configuration.');
}

module.exports = compileSass;
