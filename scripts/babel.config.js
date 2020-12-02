module.exports = function getBabelConfig(api) {
    if (process.env.NODE_ENV !== 'production') return {};

    const presets = [
        [
            '@babel/preset-env',
            {
                bugfixes: true,
                browserslistEnv: process.env.BABEL_ENV || process.env.NODE_ENV,
                debug: process.env.MUI_BUILD_VERBOSE === 'true',
                modules: false,
                shippedProposals: true,
            },
        ],
        '@babel/preset-react',
        '@babel/preset-typescript',
    ];

    const plugins = [
        ['babel-plugin-macros'],
        'babel-plugin-optimize-clsx',
        // Need the following 3 proposals for all targets in .browserslistrc.
        // With our usage the transpiled loose mode is equivalent to spec mode.
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        ['@babel/plugin-proposal-private-methods', { loose: true }],
        ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
        // [
        //     '@babel/plugin-transform-runtime',
        //     {
        //         useESModules: true,
        //         // any package needs to declare 7.12.1 as a runtime dependency. default is ^7.12.1
        //         version: '^7.12.1',
        //     },
        // ],
        '@babel/plugin-transform-react-constant-elements',
        ['babel-plugin-react-remove-properties', { properties: ['data-mui-test'] }],
        [
            'babel-plugin-transform-react-remove-prop-types',
            { mode: 'unsafe-wrap' },
        ],
    ];

    api.cache(true);

    return {
        presets,
        plugins,
        ignore: [/@babel[\\|/]runtime/], // Fix a Windows issue.
    };
};
