import { saasApi } from './axios'

/**
 * Fetch all active products for a machine.
 * @param {string} machine_id — deviceVID from IoT wake-up
 */
export const getCatalog = async (machine_id) => {
  const res = await saasApi.get(`/api/public/catalog/${machine_id}`)
  return res.data // { success, machine_id, catalog[] }
}
