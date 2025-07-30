@echo off
echo 启动微信风格聊天应用...
echo.

echo 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo 检查MongoDB连接...
echo 请确保MongoDB服务已启动

echo.
echo 启动服务端...
cd server
start "服务端" cmd /k "npm start"

echo 等待服务端启动...
timeout /t 3 /nobreak >nul

echo.
echo 启动客户端...
cd ../client
start "客户端" cmd /k "npm run dev"

echo.
echo 应用启动完成！
echo 服务端: http://localhost:3000
echo 客户端: http://localhost:5173
echo.
echo 按任意键退出...
pause >nul 