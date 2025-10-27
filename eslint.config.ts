import ts from '@stzhu/eslint-config/ts';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(globalIgnores(['dist']), ts.configs.recommended);
