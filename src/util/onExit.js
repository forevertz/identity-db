const SIGNALS = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2']

module.exports = function onExit(func) {
  let exited = false
  const debouncedOnExit = (...args) => {
    if (!exited) {
      exited = true
      if (process.off) {
        SIGNALS.forEach(signal => process.off(signal, debouncedOnExit))
      }
      func(...args)
    }
  }
  SIGNALS.forEach(signal => process.once(signal, debouncedOnExit))
}

process.on('SIGINT', () => {
  setTimeout(() => process.exit(1), 1000)
})
