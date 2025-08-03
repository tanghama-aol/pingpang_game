#!/bin/bash

# 乒乓球游戏构建脚本
# 用于混淆和压缩JS文件

echo "开始构建乒乓球游戏..."

# 检查是否存在node_modules目录，如果不存在则安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装构建依赖..."
    npm init -y > /dev/null 2>&1
    npm install terser --save-dev > /dev/null 2>&1
fi

# 创建构建输出目录
mkdir -p dist

# 复制HTML文件到dist目录
echo "复制HTML文件..."
cp index.html dist/

# 复制sound目录到dist目录
echo "复制音频文件..."
cp -r sound dist/

# 使用terser压缩和混淆JavaScript文件
echo "压缩和混淆JavaScript文件..."
if command -v npx &> /dev/null; then
    npx terser game.js \
        --compress drop_console=true,drop_debugger=true,pure_funcs=["console.log","console.warn","console.error"] \
        --mangle \
        --output dist/game.js
else
    # 如果没有npx，使用简单的手动压缩方法
    echo "使用简单压缩方法..."
    # 移除注释和多余空格
    sed 's|//.*||g' game.js | \
    sed 's|/\*.*\*/||g' | \
    tr -d '\n' | \
    sed 's/  */ /g' > dist/game.js
fi

# 更新HTML文件中的JS引用（如果需要的话）
echo "更新HTML文件引用..."
# HTML文件已经引用game.js，无需修改

# 显示文件大小对比
echo ""
echo "构建完成！文件大小对比："
echo "原始文件:"
ls -lh game.js | awk '{print "  game.js: " $5}'
echo "压缩后:"
ls -lh dist/game.js | awk '{print "  dist/game.js: " $5}'

echo ""
echo "构建文件位于 dist/ 目录中"
echo "可以直接在浏览器中打开 dist/index.html 运行游戏"