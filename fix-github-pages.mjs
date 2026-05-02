import fs from 'fs';
import path from 'path';

const indexPath = path.resolve('dist/public/index.html');
let content = fs.readFileSync(indexPath, 'utf-8');

// Reemplazar rutas absolutas con rutas relativas para GitHub Pages
content = content.replace(/src="\/assets\//g, 'src="/mongodb_crud_demo/assets/');
content = content.replace(/href="\/assets\//g, 'href="/mongodb_crud_demo/assets/');
content = content.replace(/src="\/__manus__\//g, 'src="/mongodb_crud_demo/__manus__/');

fs.writeFileSync(indexPath, content, 'utf-8');
console.log('✓ Fixed GitHub Pages routes in index.html');
