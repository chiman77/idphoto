# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller build script for ID Photo Generator
Usage: pyinstaller build_package.spec
"""
import os
import sys
from pathlib import Path

block_cipher = None

# Project root
root = os.path.dirname(os.path.abspath(__file__))

a = Analysis(
    ['start_server.py'],
    pathex=[root, os.path.join(root, 'backend')],
    binaries=[],
    datas=[
        # Frontend dist (built static files)
        (os.path.join(root, 'frontend', 'dist', 'index.html'), 'frontend/dist'),
        (os.path.join(root, 'frontend', 'dist', 'assets'), 'frontend/dist/assets'),
        (os.path.join(root, 'frontend', 'dist', 'models'), 'frontend/dist/models'),
        (os.path.join(root, 'frontend', 'dist', 'ort'), 'frontend/dist/ort'),
        (os.path.join(root, 'frontend', 'dist', 'vite.svg'), 'frontend/dist'),
        # Backend
        (os.path.join(root, 'backend', 'routers'), 'backend/routers'),
        (os.path.join(root, 'backend', 'services'), 'backend/services'),
        (os.path.join(root, 'backend', 'models'), 'backend/models'),
        (os.path.join(root, 'backend', 'models', 'weights', 'hivision_modnet.onnx'), 'backend/models/weights'),
    ],
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http.auto',
        'uvicorn.middleware',
        'uvicorn.middleware.asgi2',
        'uvicorn.middleware.wsgi',
        'PIL',
        'PIL._tkinter_finder',
        'rembg',
        'onnxruntime',
        'skimage',
        'pydantic',
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=['tkinter', 'matplotlib', 'scipy', 'notebook', 'ipython'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='IDPhotoGenerator',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Show console window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=os.path.join(root, 'frontend', 'public', 'vite.svg') if os.path.exists(os.path.join(root, 'frontend', 'public', 'vite.svg')) else None,
)
