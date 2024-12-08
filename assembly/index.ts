export function getHardwareInfo(): usize {
  const cpuCores: u32 = 8;
  const memory: u32 = 16;
  const storage: u32 = 512;

  const buffer = __alloc(12);
  store<u32>(buffer, cpuCores, 0);
  store<u32>(buffer + 4, memory, 0);
  store<u32>(buffer + 8, storage, 0);

  return buffer;
}

export function free(ptr: usize): void {
  __free(ptr);
}
