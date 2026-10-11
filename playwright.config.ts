import {defineConfig} from '@playwright/test';
import {existsSync} from 'node:fs';
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH || [
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(path => existsSync(path));
export default defineConfig({testDir:'tests/e2e',timeout:30000,workers:1,webServer:{command:'npm run dev',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI},use:{baseURL:'http://127.0.0.1:5173',headless:true,launchOptions:{executablePath}},reporter:'list'});
