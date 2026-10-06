"""红财万富网站一键启动脚本。

双击本文件即可启动 MySQL 和 Nuxt 全栈开发服务，并自动打开前台和管理后台。
Nuxt 同时提供页面和 server/api 后端接口，因此不需要再启动第二个 Node 服务。
也可以在终端中运行：
    python 启动项目.py --no-browser
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
import webbrowser


PROJECT_DIR = Path(__file__).resolve().parent
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8126
ADMIN_PATH = "/admin/login"
BACKEND_HEALTH_PATH = "/api/admin/auth/status"
MYSQL_HOST = "127.0.0.1"
MYSQL_PORT = 3306
MYSQL_DIR = Path("E:/software/MySQL")


def port_is_open(host: str, port: int) -> bool:
    """判断端口是否已有网站服务在监听。"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.25)
        return sock.connect_ex((host, port)) == 0


def ensure_mysql_running() -> None:
    """确保本地 MySQL 已启动，避免管理台登录时报 Server Error。"""
    if port_is_open(MYSQL_HOST, MYSQL_PORT):
        print("MySQL 已经在运行：127.0.0.1:3306")
        return

    mysql_exe = MYSQL_DIR / "bin" / "mysqld.exe"
    mysql_config = MYSQL_DIR / "my.ini"
    if not mysql_exe.is_file() or not mysql_config.is_file():
        raise RuntimeError(f"找不到 MySQL，请确认安装目录：{MYSQL_DIR}")

    creation_flags = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
    subprocess.Popen(
        [str(mysql_exe), f"--defaults-file={mysql_config}"],
        cwd=MYSQL_DIR,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=creation_flags,
    )
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        if port_is_open(MYSQL_HOST, MYSQL_PORT):
            print("MySQL 启动成功：127.0.0.1:3306")
            return
        time.sleep(0.25)
    raise RuntimeError("MySQL 启动超时，请检查 E:/software/MySQL/data 下的错误日志。")


def site_is_ready(url: str) -> bool:
    """确认服务已经能够返回页面，而不是只确认端口被占用。"""
    try:
        with urllib.request.urlopen(url, timeout=1.2) as response:
            return 200 <= response.status < 500
    except (urllib.error.URLError, TimeoutError, OSError):
        return False


def backend_is_ready(url: str) -> bool:
    """确认 Nuxt 的后端 API 已经可用，而不只是页面端口已占用。"""
    try:
        with urllib.request.urlopen(url, timeout=1.2) as response:
            return response.status == 200
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError):
        return False


def find_tool(name: str) -> str | None:
    """查找命令；兼容从 IDE/虚拟环境双击启动时不完整的 PATH。"""
    found = shutil.which(name) or shutil.which(f"{name}.cmd")
    if found:
        return found

    home = Path.home()
    local_app_data = Path(os.environ.get("LOCALAPPDATA", ""))
    app_data = Path(os.environ.get("APPDATA", ""))
    candidates = [
        Path(os.environ.get("ProgramFiles", "C:\\Program Files")) / "nodejs" / f"{name}.cmd",
        local_app_data / "Programs" / "nodejs" / f"{name}.cmd",
        local_app_data / "pnpm" / f"{name}.exe",
        app_data / "npm" / f"{name}.cmd",
    ]

    # Codex/便携式 Node 运行时通常不写入系统 PATH，pnpm.cmd 自带相对路径
    # 启动 Node，因此找到它即可直接运行项目。
    if name == "pnpm":
        candidates.extend(
            home.glob(".cache/codex-runtimes/*/dependencies/bin/fallback/pnpm.cmd")
        )

    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)
    return None


def find_node() -> str | None:
    """查找 node.exe，用于补齐 IDE 启动时缺失的 PATH。"""
    found = shutil.which("node") or shutil.which("node.exe")
    if found:
        return found

    home = Path.home()
    local_app_data = Path(os.environ.get("LOCALAPPDATA", ""))
    candidates = [
        Path(os.environ.get("ProgramFiles", "C:\\Program Files")) / "nodejs" / "node.exe",
        local_app_data / "Programs" / "nodejs" / "node.exe",
    ]
    candidates.extend(
        home.glob(".cache/codex-runtimes/*/dependencies/node/bin/node.exe")
    )
    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)
    return None


def process_environment() -> dict[str, str]:
    """把 Node 所在目录加入子进程 PATH，兼容便携式运行时。"""
    environment = os.environ.copy()
    node = find_node()
    if node:
        node_dir = str(Path(node).parent)
        current_path = environment.get("PATH", "")
        if node_dir.lower() not in current_path.lower().split(os.pathsep):
            environment["PATH"] = node_dir + os.pathsep + current_path
    return environment


def choose_command() -> list[str]:
    """优先使用项目锁定的 pnpm，没有 pnpm 时再退回 npm。"""
    pnpm = find_tool("pnpm")
    if pnpm:
        # pnpm 会把脚本参数直接转交给 Nuxt；这里不要额外加入 "--"，
        # 否则 Nuxt 会把它当成普通参数，导致监听地址和端口被忽略。
        return [pnpm, "dev"]

    npm = find_tool("npm")
    if npm:
        return [npm, "run", "dev", "--"]

    raise RuntimeError("没有找到 pnpm 或 npm，请先安装 Node.js 和 pnpm。")


def start_project(host: str, port: int, open_browser: bool) -> int:
    if not (PROJECT_DIR / "package.json").is_file():
        raise RuntimeError(f"找不到项目文件：{PROJECT_DIR / 'package.json'}")

    ensure_mysql_running()
    url = f"http://{host}:{port}/"
    admin_url = f"{url.rstrip('/')}{ADMIN_PATH}"
    backend_url = f"{url.rstrip('/')}{BACKEND_HEALTH_PATH}"

    # 已经有完整服务时直接复用，避免重复启动 Nuxt 并导致端口递增。
    if port_is_open(host, port) and site_is_ready(url) and backend_is_ready(backend_url):
        print(f"前台和后端已经在运行：{url}")
        if open_browser:
            webbrowser.open(url)
            webbrowser.open(admin_url)
        return 0

    command = choose_command() + ["--host", host, "--port", str(port)]
    print(f"项目目录：{PROJECT_DIR}")
    print("启动命令：" + " ".join(command))
    print(f"正在启动前台和后端，请稍候：{url}\n")

    process = subprocess.Popen(command, cwd=PROJECT_DIR, env=process_environment())
    try:
        deadline = time.monotonic() + 45
        while time.monotonic() < deadline:
            if process.poll() is not None:
                raise RuntimeError(f"开发服务器启动失败，退出码：{process.returncode}")
            if site_is_ready(url) and backend_is_ready(backend_url):
                print(f"前台启动成功：{url}")
                print(f"后端 API 已就绪：{backend_url}")
                if open_browser:
                    webbrowser.open(url)
                    webbrowser.open(admin_url)
                    print(f"管理后台：{admin_url}")
                print("按 Ctrl+C 可停止服务器。")
                return process.wait()
            time.sleep(0.5)
        raise RuntimeError("等待开发服务器超时，请检查上方终端输出。")
    except KeyboardInterrupt:
        print("\n正在停止开发服务器...")
        return 130
    finally:
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()


def main() -> int:
    parser = argparse.ArgumentParser(description="一键启动红财万富网站")
    parser.add_argument("--host", default=DEFAULT_HOST, help="监听地址，默认 127.0.0.1")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="监听端口，默认 8126")
    parser.add_argument("--no-browser", action="store_true", help="启动后不自动打开浏览器")
    args = parser.parse_args()

    try:
        return start_project(args.host, args.port, not args.no_browser)
    except RuntimeError as error:
        print(f"\n启动失败：{error}")
        return 1


if __name__ == "__main__":
    exit_code = main()
    if exit_code and os.name == "nt":
        input("按回车键关闭窗口...")
    raise SystemExit(exit_code)
