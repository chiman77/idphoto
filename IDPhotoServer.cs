using System;
using System.IO;
using System.Net;
using System.Diagnostics;
using System.Text;
using System.Runtime.InteropServices;

namespace IDPhotoServer
{
    class Program
    {
        [DllImport("kernel32.dll")]
        static extern IntPtr GetConsoleWindow();

        [DllImport("user32.dll")]
        static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        const int SW_HIDE = 0;
        static string _rootDir;
        static HttpListener _listener;

        static void Main(string[] args)
        {
            // Hide console window on Windows
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                var handle = GetConsoleWindow();
                if (handle != IntPtr.Zero)
                    ShowWindow(handle, SW_HIDE);
            }

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            _rootDir = Path.Combine(baseDir, "frontend", "dist");
            int port = 3000;

            // Check if the directory exists, try alternative paths
            if (!Directory.Exists(_rootDir))
            {
                Console.Error.WriteLine("Frontend directory not found: " + _rootDir);
                Environment.Exit(1);
            }

            try
            {
                _listener = new HttpListener();
                _listener.Prefixes.Add("http://localhost:" + port + "/");
                _listener.Start();

                // Auto-open browser
                var psi = new ProcessStartInfo();
                psi.FileName = "http://localhost:" + port;
                psi.UseShellExecute = true;
                try { Process.Start(psi); } catch { }

                Console.CancelKeyPress += (s, e) => { e.Cancel = true; _listener.Stop(); };

                while (_listener.IsListening)
                {
                    var context = _listener.GetContext();
                    ServeFile(context);
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("Error: " + ex.Message);
                Environment.Exit(1);
            }
        }

        static void ServeFile(HttpListenerContext context)
        {
            var request = context.Request;
            var response = context.Response;

            try
            {
                string path = request.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(path))
                    path = "index.html";

                // Basic security: prevent path traversal
                path = path.Replace('/', Path.DirectorySeparatorChar);
                string fullPath = Path.GetFullPath(Path.Combine(_rootDir, path));

                if (!fullPath.StartsWith(Path.GetFullPath(_rootDir)))
                {
                    response.StatusCode = 403;
                    response.Close();
                    return;
                }

                if (!File.Exists(fullPath))
                {
                    // SPA fallback: serve index.html for non-file routes
                    fullPath = Path.Combine(_rootDir, "index.html");
                }

                byte[] buffer = File.ReadAllBytes(fullPath);

                // Set content type
                string ext = Path.GetExtension(fullPath).ToLower();
                switch (ext)
                {
                    case ".html": response.ContentType = "text/html; charset=utf-8"; break;
                    case ".css": response.ContentType = "text/css"; break;
                    case ".js": response.ContentType = "application/javascript"; break;
                    case ".json": response.ContentType = "application/json"; break;
                    case ".png": response.ContentType = "image/png"; break;
                    case ".jpg":
                    case ".jpeg": response.ContentType = "image/jpeg"; break;
                    case ".svg": response.ContentType = "image/svg+xml"; break;
                    case ".ico": response.ContentType = "image/x-icon"; break;
                    case ".wasm": response.ContentType = "application/wasm"; break;
                    case ".mjs": response.ContentType = "application/javascript"; break;
                    case ".webmanifest": response.ContentType = "application/manifest+json"; break;
                    default: response.ContentType = "application/octet-stream"; break;
                }

                response.ContentLength64 = buffer.Length;
                response.OutputStream.Write(buffer, 0, buffer.Length);
                response.Close();
            }
            catch
            {
                try { response.StatusCode = 500; response.Close(); } catch { }
            }
        }
    }
}
