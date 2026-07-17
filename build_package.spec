# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller build script for ID Photo Generator (BiRefNet version)
"""
import os
import sys

block_cipher = None

root = os.getcwd()

# --- Collect all frontend dist files recursively ---
frontend_dist = os.path.join(root, 'frontend', 'dist')
frontend_datas = []
if os.path.isdir(frontend_dist):
    for dirpath, dirnames, filenames in os.walk(frontend_dist):
        rel_path = os.path.relpath(dirpath, frontend_dist)
        for fn in filenames:
            src = os.path.join(dirpath, fn)
            dst = os.path.join('frontend/dist', rel_path)
            frontend_datas.append((src, dst))

a = Analysis(
    ['start_server.py'],
    pathex=[root, os.path.join(root, 'backend')],
    binaries=[],
    datas=frontend_datas + [
        # Backend Python modules
        (os.path.join(root, 'backend', 'routers'), 'backend/routers'),
        (os.path.join(root, 'backend', 'services'), 'backend/services'),
        # Backend models (python files only)
        (os.path.join(root, 'backend', 'models', '__init__.py'), 'backend/models'),
        (os.path.join(root, 'backend', 'models', 'spec.py'), 'backend/models'),
        # Matting model weights - BiRefNet portrait + MODNet fallback
        (os.path.join(root, 'backend', 'models', 'weights', 'BiRefNet-portrait-epoch_150.onnx'), 'backend/models/weights'),
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
        'uvicorn.middleware.proxy_headers',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'uvicorn.lifespan.off',
        'PIL',
        'PIL._tkinter_finder',
        'PIL.Image',
        'PIL.ImageFilter',
        'PIL.ImageEnhance',
        'rembg',
        'rembg.session_factory',
        'onnxruntime',
        'onnxruntime.capi.onnxruntime_pybind11_state',
        'skimage',
        'skimage.transform',
        'skimage.util',
        'skimage.filters',
        'pydantic',
        'pydantic.fields',
        'pydantic.generics',
        'multipart',
        'h11',
        'anyio',
        'anyio.streams',
        'anyio.streams.file',
        'sniffio',
        'websockets',
        'websockets.legacy',
        'websockets.legacy.server',
        'httptools',
        'watchfiles',
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=[
        'tkinter', 'matplotlib', 'notebook', 'ipython',
        'jupyter', 'jupyter_client', 'jupyter_core',
        'nbformat', 'nbconvert', 'qtconsole',
        'sphinx', 'sympy', 'torch', 'torchvision',
        'pandas', 'tensorflow', 'keras',
        'PyQt5', 'PyQt6', 'PySide2', 'PySide6',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='IDPhotoGenerator',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='IDPhotoGenerator',
)
