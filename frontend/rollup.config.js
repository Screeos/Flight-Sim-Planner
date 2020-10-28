import html from '@rollup/plugin-html';
import typescript from 'rollup-plugin-typescript';

export default {
    input: 'src/main.ts',
    output: {
	   dir: 'dist',
	   format: 'umd'
    },
    plugins: [
	   html(),
	   typescript(),
    ],
};
