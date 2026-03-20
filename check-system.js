#!/usr/bin/env node

import http from 'http';

console.log('==================================');
console.log('🚀 服装管理后台系统检查');
console.log('==================================\n');

// 检查服务器状态
console.log('1. 检查服务器状态...');

const checkServer = new Promise((resolve, reject) => {
  const options = {
    hostname: 'localhost',
    port: 5174,
    path: '/',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    console.log(`✅ 服务器正常运行 (${res.statusCode})`);
    resolve();
  });

  req.on('error', (err) => {
    console.log('⚠️  服务器未在端口 5174 运行，尝试端口 5173...');

    const options2 = {
      hostname: 'localhost',
      port: 5173,
      path: '/',
      method: 'GET',
    };

    const req2 = http.request(options2, (res2) => {
      console.log(`✅ 服务器正常运行 (${res2.statusCode})`);
      resolve();
    });

    req2.on('error', (err2) => {
      console.log('❌ 服务器未运行');
      reject(err2);
    });

    req2.end();
  });

  req.end();
});

// 检查依赖
console.log('\n2. 检查依赖安装...');
const fs = await import('fs');
const path = await import('path');

const packagePath = path.resolve(process.cwd(), 'package.json');
const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');

try {
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const dependencies = Object.keys(packageData.dependencies || {});

  if (dependencies.length > 0) {
    console.log(`✅ 项目依赖已配置 (${dependencies.length} 个)`);
  }

  if (fs.existsSync(nodeModulesPath)) {
    const moduleCount = fs.readdirSync(nodeModulesPath).length;
    console.log(`✅ 依赖已安装 (${moduleCount} 个模块)`);
  } else {
    console.log('❌ node_modules 目录不存在');
  }
} catch (err) {
  console.log('❌ 检查依赖失败:', err.message);
}

// 检查 MSW 文件
console.log('\n3. 检查 Mock Service Worker...');
const publicPath = path.resolve(process.cwd(), 'public');
const workerPath = path.resolve(publicPath, 'mockServiceWorker.js');

if (fs.existsSync(workerPath)) {
  console.log('✅ mockServiceWorker.js 已准备好');
} else {
  console.log('❌ mockServiceWorker.js 不存在');
}

// 检查核心文件
console.log('\n4. 检查项目结构...');
const srcPath = path.resolve(process.cwd(), 'src');
const filesToCheck = [
  'main.tsx',
  'App.tsx',
  'routes.tsx',
  'store/index.ts',
  'components/Layout/index.tsx',
  'pages/Login.tsx',
  'pages/Dashboard.tsx',
  'pages/Products/List.tsx',
  'pages/Orders/List.tsx',
  'pages/Statistics/index.tsx',
];

let allFilesExist = true;

filesToCheck.forEach((file) => {
  const fullPath = path.resolve(srcPath, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file}`);
    allFilesExist = false;
  }
});

// 检查完成
console.log('\n==================================');
console.log('🏁 系统检查完成');
console.log('==================================\n');

if (allFilesExist) {
  console.log('✅ 项目结构完整，核心文件已准备好');
  console.log('\n📝 下一步操作：');
  console.log('1. 打开浏览器访问 http://localhost:5174');
  console.log('2. 使用测试账号登录：');
  console.log('   用户名：admin');
  console.log('   密码：password');
  console.log('3. 开始使用服装管理后台系统');
} else {
  console.log('⚠️  项目结构不完整，某些核心文件缺失');
  console.log('📝 建议重新创建项目或检查文件完整性');
}

console.log('\n🎯 更多信息：');
console.log('   - 查看项目说明：README.md');
console.log('   - 查看实现计划：IMPLEMENTATION_PLAN.md');
console.log('   - 检查所有任务：git status');
