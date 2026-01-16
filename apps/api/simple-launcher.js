import { spawn  } from "child_process";


console.log("🚀 Starting Simple Launcher...");

async function run(cmd, args) {
    console.log(`> Executing: ${cmd} ${args.join(' ')}`);
    return new Promise((resolve, reject) => {
        const proc = spawn(cmd, args, { stdio: 'inherit', shell: true });
        proc.on('close', code => {
            if (code === 0) resolve();
            else reject(new Error(`Command ${cmd} failed with code ${code}`));
        });
        proc.on('error', reject);
    });
}

async function start() {
    try {
        // Explicitly install dependencies to ensure 'debug' and others are present
        console.log("📦 Installing dependencies (Production)...");
        await run('npm', ['install', '--omit=dev', '--no-audit']);

        console.log("✅ Install complete. Checking for debug module...");
        try {
            require.resolve('debug');
            console.log("✅ 'debug' module found!");
        } catch {
            console.error("❌ 'debug' module NOT found even after install!");
        }

        console.log("🚀 Starting Server...");
        await run('node', ['dist/server.js']);
    } catch (err) {
        console.error("❌ Launcher Fatal Error:", err);
        process.exit(1);
    }
}

start();
