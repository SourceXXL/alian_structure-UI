#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('Running TypeScript typecheck (tsc --noEmit)...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('Typecheck passed with 0 errors.');
} catch (error) {
  console.error('Typecheck failed.');
  process.exit(1);
}