import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import defaultConfig from './data/default.json';
import dotenv from 'dotenv';

const fixtureDir = path.resolve(__dirname, 'data');
const files = fs.readdirSync(fixtureDir).filter(f => f.endsWith('.json') && f !== 'default.json');

const commonUse = {
  baseURL: defaultConfig.baseUrl,
  headless: false,
  channel: 'chrome',
  launchOptions: {
    args: [
      '--start-maximized',
      '--incognito',
    ],
  },
  viewport: null,
  extraHTTPHeaders: {
    'User-Agent': '',
  },
};

dotenv.config();

const projects = files.map(file => {
  const config = require(`./data/${file}`);
  const siteCode      = config.siteCode || file.replace('.json', '').toUpperCase();
  const siteCodeLower = siteCode.toLowerCase();

  // Load TradeIn data (uppercase key)
  const tradeInJson    = require('./data/tradeIn/tradeIn.json');
  const tradeInDevices = tradeInJson.tradeInData[siteCode.toUpperCase()] || [];

  // Load checkout data (lowercase key to match Checkout.json)
  const checkoutJson        = require('./data/Checkout/Checkout.json');
  const checkoutLocatorJson = require('./data/Checkout/CheckoutLocator.json');
  const checkoutData        = checkoutJson[siteCodeLower];
  const checkoutLocators    = checkoutLocatorJson[siteCodeLower];

  // Load MyAccount data (lowercase key)
  const myAccountJson        = require('./data/MyAccount/MyAccount.json');
  const myAccountLocatorJson = require('./data/MyAccount/MyAccountLocator.json');
  const myAccountData        = myAccountJson[siteCodeLower];
  const myAccountLocators    = myAccountLocatorJson;

  // Load NA (Not Applicable) config
  const naConfigJson = require('./data/naConfig.json');
  const naTests      = naConfigJson[siteCode.toUpperCase()] || [];

  return {
    name: config.name || config.siteCode || file.replace('.json', ''),
    use: {
      ...commonUse,
      actionTimeout: 60000,
      navigationTimeout: 60000,
    },
    metadata: {
      ...defaultConfig,
      ...config,
      // Load SSO credentials from env variables per project
      LOGIN_ID:        process.env[`${siteCode}_LOGIN_ID`],
      LOGIN_PW:        process.env[`${siteCode}_LOGIN_PW`],
      REWARD_LOGIN_ID: process.env[`${siteCode}_REWARD_LOGIN_ID`],
      REWARD_LOGIN_PW: process.env[`${siteCode}_REWARD_LOGIN_PW`],
      tradeInDevices,
      checkoutData,
      checkoutLocators,
      myAccountData,
      myAccountLocators,
      naTests,
    },
  };
});

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  workers: 8,
  timeout: 900000, // 15 min total test timeout
  projects,
  reporter: [
    ['list'],
    ['html', { open: 'on-failure' }],
    ['./database/reporter.ts'],
  ],
  use: {
    screenshot: {
      mode: 'only-on-failure',
      fullPage: false,
    },
    trace: 'retain-on-failure',
  },
});
