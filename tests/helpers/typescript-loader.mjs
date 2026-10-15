import { registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

// Run server service tests without a Next server, retaining the project's alias.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') return { url: 'data:text/javascript,export {};', shortCircuit: true };
    if (specifier.startsWith('@/') || (specifier.startsWith('.') && context.parentURL?.startsWith('file:'))) {
      const url = specifier.startsWith('@/') ? new URL(`../../src/${specifier.slice(2)}`, import.meta.url) : new URL(specifier, context.parentURL);
      const base = fileURLToPath(url);
      for (const path of [base, `${base}.ts`, `${base}/index.ts`]) {
        if (path.endsWith('.ts') && existsSync(path)) return { url: pathToFileURL(path).href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith('file:') && url.endsWith('.ts')) return {
      format: 'module', shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      }).outputText,
    };
    return nextLoad(url, context);
  },
});
