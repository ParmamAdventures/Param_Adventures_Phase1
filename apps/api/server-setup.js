const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log("🚀 Starting Server Setup...");

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
        // 1. Rebuild Sharp (Fix Windows -> Linux binary mismatch)
        console.log("🔧 Rebuilding native modules (sharp)...");
        try {
            await run('npm', ['rebuild', 'sharp']);
        } catch (e) {
            console.warn("⚠️ Failed to rebuild sharp, continuing anyway:", e.message);
        }

        // 2. Locate Prisma CLI
        console.log("🔍 Checking for local Prisma CLI...");
        const paths = [
            path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js'),
            path.join(__dirname, 'node_modules', '.bin', 'prisma'),
            path.join(__dirname, 'node_modules', '.bin', 'prisma.cmd'), // Windows local check
            path.join(__dirname, 'node_modules', '.bin', 'prisma.ps1')  // Powershell local check
        ];

        let prismaCliPath = null;
        for (const p of paths) {
            if (fs.existsSync(p)) {
                prismaCliPath = p;
                break;
            }
        }
        
        // 3. Generate Client
        if (prismaCliPath) {
             console.log(`✅ Found local Prisma CLI at: ${prismaCliPath}`);
             console.log("🗄️ Generating Prisma Client (fixing binary)...");
             
             if (prismaCliPath.endsWith('.js')) {
                await run('node', [prismaCliPath, 'generate']);
             } else {
                // For binary wrapper, just run it
                await run(prismaCliPath, ['generate']);
             }
        } else {
            console.error(`❌ Local Prisma CLI not found in known paths.`);
            console.log("⚠️ Fallback: Trying global npx (might fail)...");
            await run('npx', ['prisma', 'generate']);
        }

        console.log("🚀 Starting Server...");
        await run('node', ['dist/server.js']);
    } catch (err) {
        console.error("❌ Setup Fatal Error:", err);
        process.exit(1);
    }
}

start();
