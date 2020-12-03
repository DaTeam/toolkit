const childProcess = require('child_process');
const path = require('path');
const { promisify } = require('util');
const yargs = require('yargs');

const exec = promisify(childProcess.exec);

async function run(argv) {
    const { outDir, verbose } = argv;

    const env = {
        NODE_ENV: 'production',
        BABEL_ENV: 'modern',
        MUI_BUILD_VERBOSE: verbose,
    };
    const babelConfigPath = path.resolve(__dirname, './babel.config.js');
    const srcDir = path.resolve('./src');
    const extensions = ['.js', '.ts', '.tsx'];
    const ignore = [
        '**/*.test.js',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/*.d.ts',
        "**/*.stories.*",
    ];

    const command = [
        'yarn babel',
        '--config-file',
        babelConfigPath,
        '--extensions',
        `"${extensions.join(',')}"`,
        srcDir,
        '--out-dir',
        outDir,
        '--ignore',
        // Need to put these patterns in quotes otherwise they might be evaluated by the used terminal.
        `"${ignore.join('","')}"`,
    ].join(' ');

    if (verbose) {
        // eslint-disable-next-line no-console
        console.log(`running '${command}' with ${JSON.stringify(env)}`);
    }

    const { stderr, stdout } = await exec(command, { env: { ...process.env, ...env } });
    if (stderr) {
        throw new Error(`'${command}' failed with \n${stderr}`);
    }

    if (verbose) {
        // eslint-disable-next-line no-console
        console.log(stdout);
    }
}

yargs
    .command({
        command: '$0',
        description: 'build package',
        builder: (command) => {
            return command
                // .positional('bundle', {
                //     description: `Valid bundles: "${validBundles.join('" | "')}"`,
                //     type: 'string',
                // })
                .option('out-dir', { default: './dist', type: 'string' })
                .option('verbose', { type: 'boolean' });
        },
        handler: run,
    })
    // .help()
    .strict(true)
    .version(false)
    .parse();
