import argvFetcher from '@lib/argvFetcher';
import fs from 'fs';
import path from 'path';

interface File {
  name: string;
  children?: File[];
}

const argvs = process.argv;

let route = argvFetcher(argvs, ['--route', '-R'], process.cwd());
let ignore = argvFetcher(argvs, ['--ignore', '-I']);
let out = argvFetcher(argvs, ['--out', '-O']);

if (!out) {
  console.error(
    'No output file provided. Please provide an output file with --out or -O flag.'
  );
  process.exit(1);
}

if (!route) {
  console.error(
    'No route provided. Please provide a route with --route or -R flag.'
  );
  process.exit(1);
}

route = path.resolve(route);
out = path.resolve(out);
if (ignore) ignore = path.resolve(ignore);

const files: File = {
  name: route,
  children: [],
};

const readDir = (dir: string, parent: File) => {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);

    if (ignore && filePath.includes(ignore)) {
      return;
    }

    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      const newParent = {
        name: file,
        children: [],
      };

      parent.children?.push(newParent);
      readDir(filePath, newParent);
    } else {
      parent.children?.push({ name: file });
    }
  });
};

readDir(route, files);

const routeName = route.split('/').pop();

if (!routeName) {
  console.error('Invalid route provided.');
  process.exit(1);
}

let mindMap = `mindmap\n  root((${routeName}))`;

const generateMindMap = (file: File, depth = 1) => {
  if (file.children) {
    file.children.forEach(child => {
      mindMap += `\n  ${new Array(depth).fill('  ').join('')}${child.name}`;
      generateMindMap(child, depth + 1);
    });
  }
};

generateMindMap(files);

fs.writeFileSync(out, mindMap);

console.log(
  `Mermaid mind map generated at ${out}\nView and edit at https://mermaid.live/edit`
);
