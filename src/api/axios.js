import axios from 'axios'

// Both APIs go through Next.js rewrites → no hardcoded ports needed on client
export const saasApi = axios.create({
  baseURL: '/',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// IoT service — /api/device/* → rewritten to http://localhost:3001/api/device/*
export const iotApi = axios.create({
  baseURL: '/',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})
